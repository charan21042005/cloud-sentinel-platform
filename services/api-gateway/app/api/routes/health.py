from datetime import datetime, timezone
from fastapi import APIRouter
from app.services.websocket.manager import websocket_manager

router = APIRouter()


@router.get("/health", tags=["Infrastructure"])
async def health_check():
    """
    Hardened Liveness and Readiness probe endpoint for Kubernetes Ingress layers and ALB loops (Phase 10D).
    """
    capacity = {
        ch: len(sockets) for ch, sockets in websocket_manager.active_connections.items()
    }
    return {
        "status": "healthy",
        "service": "api-gateway",
        "version": "1.0.0-prod",
        "transport_capacity": capacity,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
