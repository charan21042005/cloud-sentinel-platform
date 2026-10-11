import time
import asyncio
from typing import Optional
from app.schemas.telemetry import SystemTelemetryResponse, SystemMetricsHistory
from app.services.telemetry.queries import PromQLRegistry
from app.services.telemetry.prometheus_client import PrometheusAsyncClient
from app.services.telemetry.transformers import TelemetryTransformer
from app.services.telemetry.simulation import TelemetrySimulator
from app.core.logging import logger


class TelemetryAggregator:
    """
    Adaptive Hybrid Telemetry Orchestration Service.
    Primary Source: Live Prometheus TSDB metrics.
    Secondary Source: Graceful, bounded simulated demo telemetry when Prometheus is
                      unavailable, timing out, or has no usable data.
    """

    def __init__(self, client: Optional[PrometheusAsyncClient] = None, simulator: Optional[TelemetrySimulator] = None):
        self.client = client or PrometheusAsyncClient()
        self.simulator = simulator or TelemetrySimulator()

    async def get_system_telemetry(self) -> SystemTelemetryResponse:
        """
        Orchestrates telemetry retrieval.
        Attempts real Prometheus queries first. Falls back seamlessly to simulated
        telemetry with explicit source indication if Prometheus has no usable data.
        """
        # If client is in circuit cooldown, avoid blocking network calls and serve simulated demo
        if self.client.is_cooling_down:
            return await self.simulator.get_simulated_telemetry()

        now = int(time.time())
        start = now - (5 * 60)  # 5 minutes history
        step = "15s"

        try:
            # Query Prometheus concurrently
            results = await asyncio.gather(
                self.client.query(PromQLRegistry.CPU_UTILIZATION),
                self.client.query(PromQLRegistry.MEMORY_UTILIZATION),
                self.client.query(PromQLRegistry.REQUEST_THROUGHPUT),
                self.client.query(PromQLRegistry.API_LATENCY),
                self.client.query_range(PromQLRegistry.CPU_HISTORY, start, now, step),
                self.client.query_range(PromQLRegistry.MEMORY_HISTORY, start, now, step),
                return_exceptions=True,
            )
        except Exception as e:
            logger.warning(f"[Telemetry Aggregator] Query gather error: {e}")
            return await self.simulator.get_simulated_telemetry()

        def extract_result(idx):
            val = results[idx]
            if isinstance(val, Exception):
                logger.debug(f"[Telemetry Aggregator] Query {idx} error: {val}")
                return None
            return val

        raw_cpu = extract_result(0)
        raw_memory = extract_result(1)
        raw_requests = extract_result(2)
        raw_latency = extract_result(3)
        raw_cpu_history = extract_result(4)
        raw_memory_history = extract_result(5)

        # Determine if we have usable real telemetry data.
        # If Prometheus returned no usable data across all metrics (e.g. no nodes/pods scraped yet),
        # gracefully degrade to demo simulation.
        has_real_metrics = any(
            v is not None
            for v in (raw_cpu, raw_memory, raw_requests, raw_latency)
        ) or bool(raw_cpu_history) or bool(raw_memory_history)

        if not has_real_metrics:
            logger.info("[Telemetry Aggregator] No usable Prometheus data found, falling back to simulated telemetry.")
            return await self.simulator.get_simulated_telemetry()

        # Real Prometheus data is available -> normalize and return with source="prometheus"
        cpu_val = round(raw_cpu, 1) if raw_cpu is not None else 0.0
        mem_val = round(raw_memory, 1) if raw_memory is not None else 0.0
        req_val = int(raw_requests) if raw_requests is not None else 0
        lat_val = round(raw_latency, 1) if raw_latency is not None else 0.0

        cpu_series = TelemetryTransformer.normalize_time_series(raw_cpu_history or [])
        mem_series = TelemetryTransformer.normalize_time_series(raw_memory_history or [])

        return SystemTelemetryResponse(
            source="prometheus",
            cpu_usage=cpu_val,
            memory_usage=mem_val,
            active_requests=req_val,
            latency_ms=lat_val,
            history=SystemMetricsHistory(
                cpu=cpu_series,
                memory=mem_series,
            ),
        )
