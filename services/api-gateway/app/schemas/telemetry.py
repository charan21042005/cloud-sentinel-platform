from pydantic import BaseModel, Field
from typing import List, Optional


class TimeSeriesPoint(BaseModel):
    """Normalized data point for frontend charting."""

    timestamp: str
    value: float


class SystemMetricsHistory(BaseModel):
    """Historical area chart data."""

    cpu: List[TimeSeriesPoint]
    memory: List[TimeSeriesPoint]


class MetricTimestamps(BaseModel):
    """Last source sample time for each independently reported metric."""

    cpu_usage: Optional[str] = None
    memory_usage: Optional[str] = None
    request_rate_per_second: Optional[str] = None
    latency_ms: Optional[str] = None


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
    metric_timestamps: MetricTimestamps = Field(default_factory=MetricTimestamps)
