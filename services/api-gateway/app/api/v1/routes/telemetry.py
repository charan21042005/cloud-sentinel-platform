from fastapi import APIRouter, Depends
from app.schemas.telemetry import SystemTelemetryResponse
from app.services.telemetry.aggregator import TelemetryAggregator
from app.dependencies.auth import get_current_user

router = APIRouter()

# Instantiate the aggregator singleton
aggregator = TelemetryAggregator()

@router.get("/system/live", response_model=SystemTelemetryResponse)
async def get_live_telemetry():
    """
    Enterprise Telemetry Control Plane Endpoint.
    Returns sanitized, normalized, and unified DTOs directly to the frontend.
    The frontend is now completely decoupled from Prometheus.
    """
    return await aggregator.get_system_telemetry()
