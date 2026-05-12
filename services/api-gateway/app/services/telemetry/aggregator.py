import time
import asyncio
from app.schemas.telemetry import SystemTelemetryResponse, SystemMetricsHistory
from app.services.telemetry.queries import PromQLRegistry
from app.services.telemetry.prometheus_client import PrometheusAsyncClient
from app.services.telemetry.transformers import TelemetryTransformer
from app.core.logging import logger


class TelemetryAggregator:
    """
    Enterprise Telemetry Orchestration Service.
    Parallelizes TSDB queries and enforces strict Pydantic DTO hydration.
    """

    def __init__(self):
        self.client = PrometheusAsyncClient()

    async def get_system_telemetry(self) -> SystemTelemetryResponse:
        now = int(time.time())
        start = now - (5 * 60)  # 5 minutes history
        step = "15s"

        # Execute all queries concurrently to minimize API gateway response latency
        results = await asyncio.gather(
            self.client.query(PromQLRegistry.CPU_UTILIZATION),
            self.client.query(PromQLRegistry.MEMORY_UTILIZATION),
            self.client.query(PromQLRegistry.REQUEST_THROUGHPUT),
            self.client.query(PromQLRegistry.API_LATENCY),
            self.client.query_range(PromQLRegistry.CPU_HISTORY, start, now, step),
            self.client.query_range(PromQLRegistry.MEMORY_HISTORY, start, now, step),
            return_exceptions=True,
        )

        # Defensive unpacking
        def safe_get(idx, default):
            val = results[idx]
            if isinstance(val, Exception):
                logger.error(f"[Aggregator] Task {idx} failed: {val}")
                return default
            return val

        cpu = safe_get(0, 0.0)
        memory = safe_get(1, 0.0)
        requests = safe_get(2, 0.0)
        latency = safe_get(3, 0.0)
        raw_cpu_history = safe_get(4, [])
        raw_memory_history = safe_get(5, [])

        return SystemTelemetryResponse(
            cpu_usage=round(cpu, 1),
            memory_usage=round(memory, 1),
            active_requests=int(requests),
            latency_ms=round(latency, 1),
            history=SystemMetricsHistory(
                cpu=TelemetryTransformer.normalize_time_series(raw_cpu_history),
                memory=TelemetryTransformer.normalize_time_series(raw_memory_history),
            ),
        )
