import asyncio
from datetime import datetime, timezone, timedelta
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
        self.current_requests = 68
        self.current_latency = 24.2
        self.last_timestamp = datetime.now(timezone.utc)

        # Generate initial coherent historical series
        self.cpu_history: List[TimeSeriesPoint] = self._generate_initial_history(
            base=40.0, volatility=5.0
        )
        self.memory_history: List[TimeSeriesPoint] = self._generate_initial_history(
            base=58.0, volatility=2.5
        )

    def _generate_initial_history(
        self, base: float, volatility: float
    ) -> List[TimeSeriesPoint]:
        now = datetime.now(timezone.utc)
        points = []
        val = base
        for i in range(self.history_points, 0, -1):
            ts = (now - timedelta(seconds=i * self.step_seconds)).isoformat()
            val = max(10.0, min(90.0, val + random.uniform(-volatility, volatility)))
            points.append(TimeSeriesPoint(timestamp=ts, value=round(val, 1)))
        return points

    async def get_simulated_telemetry(self) -> SystemTelemetryResponse:
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
            self.current_requests = max(
                15, min(250, int(self.current_requests + random.randint(-12, 12)))
            )
            self.current_latency = max(
                8.0, min(65.0, self.current_latency + random.uniform(-2.0, 2.0))
            )

            cpu_val = round(self.current_cpu, 1)
            mem_val = round(self.current_memory, 1)

            # Append new point and maintain bounded buffer
            self.cpu_history.append(TimeSeriesPoint(timestamp=now_iso, value=cpu_val))
            if len(self.cpu_history) > self.history_points:
                self.cpu_history.pop(0)

            self.memory_history.append(TimeSeriesPoint(timestamp=now_iso, value=mem_val))
            if len(self.memory_history) > self.history_points:
                self.memory_history.pop(0)

            # Return shallow copies of history lists to prevent caller mutations
            return SystemTelemetryResponse(
                source="simulated",
                cpu_usage=cpu_val,
                memory_usage=mem_val,
                active_requests=self.current_requests,
                latency_ms=round(self.current_latency, 1),
                history=SystemMetricsHistory(
                    cpu=list(self.cpu_history),
                    memory=list(self.memory_history),
                ),
            )
