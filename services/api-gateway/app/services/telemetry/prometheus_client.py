import httpx
from typing import Dict, Any, List
from app.core.logging import logger
import math


class PrometheusAsyncClient:
    """
    Reusable asynchronous HTTP client for internal Prometheus communication.
    Abstracts connection pooling, timeouts, and JSON unwrapping.
    """

    def __init__(self, base_url: str = "http://prometheus:9090/api/v1"):
        self.base_url = base_url
        self.timeout = 5.0

    async def query(self, query_str: str) -> float:
        """Executes a PromQL instant query. Returns 0.0 on failure/empty."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"{self.base_url}/query", params={"query": query_str}
                )
                resp.raise_for_status()
                data = resp.json()

                result = data.get("data", {}).get("result", [])
                if not result:
                    return 0.0

                # result[0]["value"] -> [1712423.0, "12.5"]
                value_str = result[0].get("value", [0, "0"])[1]
                parsed = float(value_str)
                return 0.0 if math.isnan(parsed) else parsed
        except Exception as e:
            logger.warning(f"[Telemetry] Instant Query Failed [{query_str}]: {e}")
            return 0.0

    async def query_range(
        self, query_str: str, start: int, end: int, step: str = "15s"
    ) -> List[List[Any]]:
        """Executes a PromQL range query. Returns empty list on failure."""
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
                resp.raise_for_status()
                data = resp.json()

                result = data.get("data", {}).get("result", [])
                if not result:
                    return []

                # Returns [[timestamp, "value"], ...]
                return result[0].get("values", [])
        except Exception as e:
            logger.warning(f"[Telemetry] Range Query Failed [{query_str}]: {e}")
            return []
