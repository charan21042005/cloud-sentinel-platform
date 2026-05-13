import asyncio
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.services.websocket.manager import websocket_manager
from app.core.logging import logger

ws_router = APIRouter()


@ws_router.websocket("/incidents")
async def websocket_incidents(websocket: WebSocket, token: Optional[str] = Query(None)):
    """Real-time operational stream delivering incident lifecycle mutations without polling."""
    connected = await websocket_manager.connect(
        websocket, channel="incidents", token=token
    )
    if not connected:
        return

    try:
        while True:
            # Keep socket session alive, ingest client-side presence heartbeats
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, channel="incidents")
    except Exception as e:
        logger.error(f"[WebSocket Gateway] Error on incidents socket feed: {e}")
        websocket_manager.disconnect(websocket, channel="incidents")


@ws_router.websocket("/telemetry")
async def websocket_telemetry(websocket: WebSocket, token: Optional[str] = Query(None)):
    """Real-time stream delivering live CPU/RAM/Network telemetry streams."""
    connected = await websocket_manager.connect(
        websocket, channel="telemetry", token=token
    )
    if not connected:
        return

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, channel="telemetry")
    except Exception as e:
        logger.error(f"[WebSocket Gateway] Error on telemetry socket feed: {e}")
        websocket_manager.disconnect(websocket, channel="telemetry")


@ws_router.websocket("/system-events")
async def websocket_system_events(
    websocket: WebSocket, token: Optional[str] = Query(None)
):
    """Real-time stream delivering global audit activity and collaborative responder presence feeds."""
    connected = await websocket_manager.connect(
        websocket, channel="system-events", token=token
    )
    if not connected:
        return

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, channel="system-events")
    except Exception as e:
        logger.error(f"[WebSocket Gateway] Error on system-events socket feed: {e}")
        websocket_manager.disconnect(websocket, channel="system-events")
