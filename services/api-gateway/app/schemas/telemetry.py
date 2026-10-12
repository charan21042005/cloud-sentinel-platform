from pydantic import BaseModel
from typing import List, Optional


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

    source: str = "prometheus"
    cpu_usage: Optional[float]
    memory_usage: Optional[float]
    request_rate_per_second: Optional[float]
    latency_ms: Optional[float]
    history: SystemMetricsHistory
