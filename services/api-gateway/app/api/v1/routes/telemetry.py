from fastapi import APIRouter, Depends
from app.db.models.user import User
from app.schemas.telemetry import SystemTelemetryResponse
from app.services.telemetry.aggregator import TelemetryAggregator
from app.dependencies.auth import require_viewer

router = APIRouter()

# Instantiate the aggregator singleton
aggregator = TelemetryAggregator()


@router.get("/system/live", response_model=SystemTelemetryResponse)
async def get_live_telemetry(_user: User = Depends(require_viewer)):
    """
    Enterprise Telemetry Control Plane Endpoint.
    Returns sanitized, normalized, and unified DTOs directly to the frontend.
    The frontend is now completely decoupled from Prometheus.
    """
    return await aggregator.get_system_telemetry()
