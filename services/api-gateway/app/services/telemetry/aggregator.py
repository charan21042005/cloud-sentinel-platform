import time
import asyncio
from datetime import datetime, timezone
from typing import Optional
from app.schemas.telemetry import SystemTelemetryResponse, SystemMetricsHistory, MetricTimestamps
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
        response_started_at = datetime.now(timezone.utc).isoformat()
        # If client is in circuit cooldown, avoid blocking network calls and serve simulated demo
        if self.client.is_cooling_down:
            return await self.simulator.get_simulated_telemetry(
                source_reachable=False,
                response_started_at=response_started_at,
            )

        now = int(time.time())
        start = now - (5 * 60)  # 5 minutes history
        step = "15s"
        source_check_started_at = datetime.now(timezone.utc).isoformat()

        try:
            # Query Prometheus concurrently
            results = await asyncio.gather(
                self.client.query(PromQLRegistry.CPU_UTILIZATION),
                self.client.query(PromQLRegistry.MEMORY_UTILIZATION),
                self.client.query(PromQLRegistry.REQUEST_THROUGHPUT),
                self.client.query(PromQLRegistry.API_LATENCY),
                self.client.query(PromQLRegistry.CPU_SAMPLE_TIMESTAMP),
                self.client.query(PromQLRegistry.MEMORY_SAMPLE_TIMESTAMP),
                self.client.query(PromQLRegistry.REQUEST_SAMPLE_TIMESTAMP),
                self.client.query(PromQLRegistry.LATENCY_SAMPLE_TIMESTAMP),
                self.client.query_range(PromQLRegistry.CPU_HISTORY, start, now, step),
                self.client.query_range(PromQLRegistry.MEMORY_HISTORY, start, now, step),
                self.client.query_with_timestamp("vector(1)"),
                return_exceptions=True,
            )
        except Exception as e:
            logger.warning(f"[Telemetry Aggregator] Query gather error: {e}")
            return await self.simulator.get_simulated_telemetry()

        def iso_timestamp(value):
            if value is None:
                return None
            try:
                return datetime.fromtimestamp(float(value), tz=timezone.utc).isoformat()
            except (OverflowError, OSError, TypeError, ValueError):
                return None

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
        raw_cpu_timestamp = extract_result(4)
        raw_memory_timestamp = extract_result(5)
        raw_requests_timestamp = extract_result(6)
        raw_latency_timestamp = extract_result(7)
        raw_cpu_history = extract_result(8)
        raw_memory_history = extract_result(9)
        source_check = extract_result(10)
        source_reachable = source_check is not None
        source_checked_at = source_check_started_at
        if source_check is not None:
            source_checked_at = iso_timestamp(source_check[1])

        # Determine if we have usable real telemetry data.
        # If Prometheus returned no usable data across all metrics (e.g. no nodes/pods scraped yet),
        # gracefully degrade to demo simulation.
        has_real_metrics = any(
            v is not None
            for v in (raw_cpu, raw_memory, raw_requests, raw_latency)
        ) or bool(raw_cpu_history) or bool(raw_memory_history)

        if not has_real_metrics:
            logger.info("[Telemetry Aggregator] No usable Prometheus data found, falling back to simulated telemetry.")
            return await self.simulator.get_simulated_telemetry(
                source_reachable=source_reachable,
                source_checked_at=source_checked_at,
                response_started_at=response_started_at,
            )

        # Real Prometheus data is available -> normalize and return with source="prometheus"
        cpu_val = round(raw_cpu, 1) if raw_cpu is not None else None
        mem_val = round(raw_memory, 1) if raw_memory is not None else None
        req_val = round(raw_requests, 2) if raw_requests is not None else None
        lat_val = round(raw_latency, 1) if raw_latency is not None else None

        cpu_series = TelemetryTransformer.normalize_time_series(raw_cpu_history or [])
        mem_series = TelemetryTransformer.normalize_time_series(raw_memory_history or [])

        return SystemTelemetryResponse(
            source="prometheus",
            cpu_usage=cpu_val,
            memory_usage=mem_val,
            request_rate_per_second=req_val,
            latency_ms=lat_val,
            history=SystemMetricsHistory(
                cpu=cpu_series,
                memory=mem_series,
            ),
            metric_timestamps=MetricTimestamps(
                cpu_usage=iso_timestamp(raw_cpu_timestamp),
                memory_usage=iso_timestamp(raw_memory_timestamp),
                request_rate_per_second=iso_timestamp(raw_requests_timestamp),
                latency_ms=iso_timestamp(raw_latency_timestamp),
            ),
            source_reachable=source_reachable,
            source_checked_at=source_checked_at,
            response_started_at=response_started_at,
        )
