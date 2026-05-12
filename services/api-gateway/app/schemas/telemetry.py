from pydantic import BaseModel
from typing import List

class TimeSeriesPoint(BaseModel):
    """Normalized data point for frontend charting."""
    timestamp: str
    value: float

class SystemMetricsHistory(BaseModel):
    """Historical area chart data."""
    cpu: List[TimeSeriesPoint]
    memory: List[TimeSeriesPoint]

class SystemTelemetryResponse(BaseModel):
    """
    Enterprise DTO. The single source of truth for the CSI Dashboard.
    Strictly types all observability data before it hits the network.
    """
    cpu_usage: float
    memory_usage: float
    active_requests: int
    latency_ms: float
    history: SystemMetricsHistory
