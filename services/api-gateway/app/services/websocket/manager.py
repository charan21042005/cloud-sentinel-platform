import asyncio
import json
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from pydantic import ValidationError

from app.core.config import settings
from app.core.logging import logger
from app.schemas.auth import TokenPayload


class ConnectionManager:
    """
    Enterprise Real-Time Event Fabric Connection Manager.
    Manages WebSockets, JWT authentication handshakes, broadcast fanout isolation,
    and heartbeat ping/pong lifecycle management.
    """

    def __init__(self):
        # Channel-to-websockets mapping isolating domain events
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "incidents": set(),
            "telemetry": set(),
            "system-events": set(),
        }
        # Keep track of authenticated user session contexts
        self.user_connections: Dict[WebSocket, str] = {}

    async def authenticate_token(self, token: Optional[str]) -> Optional[str]:
        """Validates incoming JWT token payloads during connection handshake."""
        if not token:
            return None
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
            return token_data.sub
        except (JWTError, ValidationError, Exception) as e:
            logger.warning(f"[WebSocket Gateway] Auth validation failed: {e}")
            return None

    async def connect(
        self, websocket: WebSocket, channel: str, token: Optional[str] = None
    ) -> bool:
        """
        Accepts WebSocket requests, executes JWT session validation,
        and registers channel subscriptions.
        """
        # Ensure target channel domain exists
        if channel not in self.active_connections:
            self.active_connections[channel] = set()

        # Execute Protocol Handshake
        await websocket.accept()

        # Validate Auth Token Context
        user_id = await self.authenticate_token(token)
        if not user_id:
            logger.warning(
                f"🔒 [WebSocket Gateway] Unauthorized socket access attempt to channel '{channel}'. Closing."
            )
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized JWT Token"
            )
            return False

        self.active_connections[channel].add(websocket)
        self.user_connections[websocket] = user_id
        logger.info(
            f"🟢 [WebSocket Gateway] Client connected to channel '{channel}' (User ID: {user_id}). Total active on channel: {len(self.active_connections[channel])}"
        )

        # Send Initial Subscription Confirmation DTO
        await websocket.send_json(
            {
                "event": "connection_established",
                "channel": channel,
                "status": "authenticated",
                "message": f"Successfully subscribed to real-time '{channel}' stream fabric.",
            }
        )
        return True

    def disconnect(self, websocket: WebSocket, channel: str):
        """Gracefully removes dropped sockets from tracking sets."""
        if (
            channel in self.active_connections
            and websocket in self.active_connections[channel]
        ):
            self.active_connections[channel].remove(websocket)
        user_id = self.user_connections.pop(websocket, "Unknown")
        logger.info(
            f"🔴 [WebSocket Gateway] Client disconnected from channel '{channel}' (User ID: {user_id}). Remaining on channel: {len(self.active_connections.get(channel, []))}"
        )

    async def broadcast(self, channel: str, message: dict):
        """Fans out serializable DTO payloads to all connected topic sessions."""
        if channel not in self.active_connections:
            return

        dead_sockets = set()
        # Cleanly stringify payloads with fallback for complex datatypes like UUID/datetimes
        payload_str = json.dumps(message, default=str)

        for websocket in list(self.active_connections[channel]):
            try:
                await websocket.send_text(payload_str)
            except Exception as e:
                logger.warning(
                    f"⚠️ [WebSocket Gateway] Dead socket detected on broadcast fanout to '{channel}': {e}"
                )
                dead_sockets.add(websocket)

        # Purge dead connections from sets to prevent memory leaks
        for dead in dead_sockets:
            self.disconnect(dead, channel)


websocket_manager = ConnectionManager()
