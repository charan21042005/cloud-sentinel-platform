import time
import math
from typing import Dict, Any, List, Optional, Tuple
import httpx
from app.core.config import settings
from app.core.logging import logger


class PrometheusAsyncClient:
    """
    Reusable asynchronous HTTP client for internal Prometheus communication.
    Abstracts connection pooling, bounded timeouts, circuit cooling, and JSON unwrapping.
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 2.0, cooldown_seconds: float = 10.0):
        self.base_url = (base_url or settings.PROMETHEUS_URL).rstrip("/")
        self.timeout = timeout
        self.cooldown_seconds = cooldown_seconds
        self._circuit_open_until: float = 0.0

    @property
    def is_cooling_down(self) -> bool:
        return time.time() < self._circuit_open_until

    def _trip_circuit(self, reason: str):
        self._circuit_open_until = time.time() + self.cooldown_seconds
        logger.warning(
            f"[Telemetry] Prometheus circuit tripped for {self.cooldown_seconds}s. Reason: {reason}"
        )

    def _reset_circuit(self):
        self._circuit_open_until = 0.0

    async def query(self, query_str: str) -> Optional[float]:
        """
        Executes a PromQL instant query.
        Returns float value if valid data exists, or None if unavailable/empty/error.
        """
        sample = await self.query_with_timestamp(query_str)
        return sample[0] if sample is not None else None

    async def query_with_timestamp(self, query_str: str) -> Optional[Tuple[float, float]]:
        """Return the finite value and Prometheus result timestamp for an instant query."""
        if self.is_cooling_down:
            return None

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.base_url}/query", params={"query": query_str}
                )
                if resp.status_code != 200:
                    self._trip_circuit(f"HTTP {resp.status_code}")
                    return None

                data = resp.json()
                if data.get("status") != "success":
                    self._trip_circuit(f"Prometheus error status: {data.get('error')}")
                    return None

                result = data.get("data", {}).get("result", [])
                if not result:
                    # Successful query but no time series matched
                    return None

                # result[0]["value"] -> [unix_timestamp, "value_str"]
                sample = result[0].get("value", [])
                if len(sample) != 2:
                    return None
                timestamp = float(sample[0])
                value_str = sample[1]
                parsed = float(value_str)
                if not math.isfinite(timestamp) or not math.isfinite(parsed):
                    return None

                self._reset_circuit()
                return parsed, timestamp
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout) as e:
            self._trip_circuit(f"Connection failure: {e.__class__.__name__}")
            return None
        except Exception as e:
            logger.warning(f"[Telemetry] Instant Query Failed [{query_str}]: {e}")
            self._trip_circuit(str(e))
            return None

    async def query_range(
        self, query_str: str, start: int, end: int, step: str = "15s"
    ) -> Optional[List[List[Any]]]:
        """
        Executes a PromQL range query.
        Returns List of [[timestamp, "value"], ...] if data exists, or None on failure/empty.
        """
        if self.is_cooling_down:
            return None

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.base_url}/query_range",
                    params={
                        "query": query_str,
                        "start": str(start),
                        "end": str(end),
                        "step": step,
                    },
                )
                if resp.status_code != 200:
                    self._trip_circuit(f"HTTP {resp.status_code}")
                    return None

                data = resp.json()
                if data.get("status") != "success":
                    self._trip_circuit(f"Prometheus error status: {data.get('error')}")
                    return None

                result = data.get("data", {}).get("result", [])
                if not result:
                    return None

                values = result[0].get("values", [])
                if not values:
                    return None

                self._reset_circuit()
                return values
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout) as e:
            self._trip_circuit(f"Connection failure: {e.__class__.__name__}")
            return None
        except Exception as e:
            logger.warning(f"[Telemetry] Range Query Failed [{query_str}]: {e}")
            self._trip_circuit(str(e))
            return None
