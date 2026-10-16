import asyncio
from datetime import datetime, timezone
import random
from typing import List
from app.schemas.telemetry import (
    SystemTelemetryResponse,
    SystemMetricsHistory,
    TimeSeriesPoint,
)


class TelemetrySimulator:
    """
    Adaptive Demo Telemetry Simulator.
    Provides graceful fallback when Prometheus is unavailable or has no usable data.
    Maintains bounded, realistic historical random-walk time-series and stable state.
    """

    def __init__(self, history_points: int = 20, step_seconds: int = 15):
        self.history_points = history_points
        self.step_seconds = step_seconds
        self._lock = asyncio.Lock()

        # Seed initial stable state
        self.current_cpu = 42.4
        self.current_memory = 58.7
        self.last_timestamp = datetime.now(timezone.utc)

        # History begins with the first observed simulator sample; never backfill.
        self.cpu_history: List[TimeSeriesPoint] = []
        self.memory_history: List[TimeSeriesPoint] = []

    async def get_simulated_telemetry(
        self,
        source_reachable: bool = False,
        source_checked_at: str | None = None,
        response_started_at: str | None = None,
    ) -> SystemTelemetryResponse:
        """
        Thread/asyncio safe random-walk step.
        Returns a SystemTelemetryResponse with source='simulated'.
        """
        async with self._lock:
            now = datetime.now(timezone.utc)
            now_iso = now.isoformat()

            # Bounded random walk
            self.current_cpu = max(
                12.0, min(88.0, self.current_cpu + random.uniform(-3.5, 3.5))
            )
            self.current_memory = max(
                35.0, min(82.0, self.current_memory + random.uniform(-1.5, 1.5))
            )
            cpu_val = round(self.current_cpu, 1)
            mem_val = round(self.current_memory, 1)

            # Append new point and maintain bounded buffer
            self.cpu_history.append(TimeSeriesPoint(timestamp=now_iso, value=cpu_val))
            if len(self.cpu_history) > self.history_points:
                self.cpu_history.pop(0)

            self.memory_history.append(
                TimeSeriesPoint(timestamp=now_iso, value=mem_val)
            )
            if len(self.memory_history) > self.history_points:
                self.memory_history.pop(0)

            # Return shallow copies of history lists to prevent caller mutations
            return SystemTelemetryResponse(
                source="simulated",
                cpu_usage=cpu_val,
                memory_usage=mem_val,
                request_rate_per_second=None,
                latency_ms=None,
                history=SystemMetricsHistory(
                    cpu=list(self.cpu_history),
                    memory=list(self.memory_history),
                ),
                metric_timestamps={
                    "cpu_usage": now_iso,
                    "memory_usage": now_iso,
                },
                source_reachable=source_reachable,
                source_checked_at=source_checked_at,
                response_started_at=response_started_at or now_iso,
            )
