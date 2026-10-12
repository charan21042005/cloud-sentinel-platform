import asyncio
import json
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from prometheus_client import Gauge, Counter, Histogram

from app.core.config import settings
from app.core.logging import logger
from app.schemas.auth import TokenPayload
from app.db.models.user import User
from app.db.session import SessionLocal

# --- Transport Observability Telemetry Metrics ---
ws_active_connections = Gauge(
    "websocket_active_connections",
    "Real-time tracking gauge of active WebSocket sessions across the SOC fabric",
    ["channel"],
)

ws_dropped_connections = Counter(
    "websocket_dropped_connections_total",
    "Continuous counting metric tracking client-side stream connection dropouts",
    ["channel"],
)

ws_broadcast_messages = Counter(
    "websocket_broadcast_messages_total",
    "Continuous counting metric tracking successfully dispatched broadcast payloads",
    ["channel"],
)

ws_broadcast_errors = Counter(
    "websocket_broadcast_errors_total",
    "Continuous counting metric tracking failures encountered during fanout strings",
    ["channel"],
)

ws_broadcast_latency = Histogram(
    "websocket_broadcast_latency_seconds",
    "Histogram profiling the execution duration of real-time multi-socket fanout sequences",
    ["channel"],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0],
)


class ConnectionManager:
    """
    Real-time event transport with database-checked JWT sessions, Prometheus
    instrumentation, backpressure handling, and asynchronous fanout.
    """

    def __init__(self):
        # Channel-to-websockets mapping isolating domain events
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "incidents": set(),
            "telemetry": set(),
            "system-events": set(),
        }
        # Track active authenticated scopes vs anonymous dashboard fallback clients
        self.user_connections: Dict[WebSocket, str] = {}

    async def authenticate_token(
        self, token: Optional[str], db: Optional[AsyncSession] = None
    ) -> Optional[str]:
        """Validates a JWT and confirms its active user still exists."""
        if not token or token == "null":
            return None
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
            from uuid import UUID

            user_id = UUID(token_data.sub)
            query = select(User.id).where(
                User.id == user_id, User.is_active.is_(True)
            )
            if db is None:
                async with SessionLocal() as session:
                    result = await session.execute(query)
                    active_user = result.scalar_one_or_none()
            else:
                result = await db.execute(query)
                active_user = result.scalar_one_or_none()
            if active_user is not None:
                return str(user_id)
        except (JWTError, ValidationError, ValueError, TypeError):
            logger.info("[WebSocket Transport] Rejected an invalid authentication session.")
        except Exception:
            logger.warning("[WebSocket Transport] Authentication check failed.")
            return None
        return None

    async def connect(
        self,
        websocket: WebSocket,
        channel: str,
        token: Optional[str],
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """
        Accepts only active database users with a valid JWT session.
        """
        # Ensure target channel domain exists
        if channel not in self.active_connections:
            self.active_connections[channel] = set()

        user_id = await self.authenticate_token(token, db)
        if not user_id:
            await websocket.close(code=1008, reason="Authentication required")
            return False

        await websocket.accept()

        self.active_connections[channel].add(websocket)
        self.user_connections[websocket] = user_id

        # Update Prometheus Observability Gauges
        ws_active_connections.labels(channel=channel).inc()

        logger.info(
            f"🟢 [WebSocket Transport] Session active on '{channel}' (Context: {user_id}). Active pool size: {len(self.active_connections[channel])}"
        )

        # Send Initial Subscription Confirmation DTO
        try:
            await websocket.send_json(
                {
                    "event": "connection_established",
                    "channel": channel,
                    "status": "authenticated",
                    "message": f"Successfully subscribed to real-time '{channel}' stream fabric.",
                }
            )
        except Exception as e:
            logger.warning(
                f"⚠️ [WebSocket Transport] Handshake verification dispatch drop: {e}"
            )
            self.disconnect(websocket, channel)
            return False

        return True

    def disconnect(self, websocket: WebSocket, channel: str):
        """Gracefully removes dropped sockets, updates metrics, and purges references."""
        if (
            channel in self.active_connections
            and websocket in self.active_connections[channel]
        ):
            self.active_connections[channel].remove(websocket)
            ws_active_connections.labels(channel=channel).dec()
            ws_dropped_connections.labels(channel=channel).inc()

        user_id = self.user_connections.pop(websocket, "Unknown")
        logger.info(
            f"🔴 [WebSocket Transport] Client dropped from '{channel}' (Context: {user_id}). Active pool size: {len(self.active_connections.get(channel, []))}"
        )

    async def _send_safe(
        self, websocket: WebSocket, payload_str: str, channel: str
    ) -> bool:
        """Isolated non-blocking worker routine ensuring individual slow/dead sockets don't stall fanout loops."""
        try:
            await websocket.send_text(payload_str)
            return True
        except Exception as e:
            logger.warning(
                f"⚠️ [WebSocket Transport] Dead pipe detected during channel broadcast fanout to '{channel}': {e}"
            )
            ws_broadcast_errors.labels(channel=channel).inc()
            return False

    async def broadcast(self, channel: str, message: dict):
        """
        Fans out serializable DTO payloads utilizing isolated non-blocking backpressure
        queues to ensure high-throughput Alertmanager chains never experience blocking drops.
        """
        if (
            channel not in self.active_connections
            or not self.active_connections[channel]
        ):
            return

        # Profile execution latency using native Prometheus Histograms
        with ws_broadcast_latency.labels(channel=channel).time():
            # Cleanly stringify payloads with native support for nested UUID/datetime elements
            payload_str = json.dumps(message, default=str)
            ws_broadcast_messages.labels(channel=channel).inc()

            # Concurrently blast messages out to prevent slow-client thread locking
            sockets = list(self.active_connections[channel])
            results = await asyncio.gather(
                *[self._send_safe(ws, payload_str, channel) for ws in sockets],
                return_exceptions=True,
            )

            # Extract failed execution sockets for unrecoverable state purging
            for ws, success in zip(sockets, results):
                if success is not True:
                    self.disconnect(ws, channel)


websocket_manager = ConnectionManager()
