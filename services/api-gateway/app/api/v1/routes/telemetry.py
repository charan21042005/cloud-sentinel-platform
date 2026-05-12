from fastapi import APIRouter, HTTPException, Query
import httpx
from app.core.logging import logger

router = APIRouter()

# The internal Docker DNS for Prometheus
PROMETHEUS_URL = "http://prometheus:9090/api/v1"

@router.get("/query")
async def prometheus_query(query: str):
    """
    Proxy an instant query to the internal Prometheus Database.
    Prevents the frontend from directly speaking to the DB and exposing credentials/topology.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PROMETHEUS_URL}/query", 
                params={"query": query},
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"[Telemetry Proxy] Instant Query Error: {e}")
        raise HTTPException(status_code=502, detail="Telemetry Database Unavailable")

@router.get("/query_range")
async def prometheus_query_range(
    query: str, 
    start: str, 
    end: str, 
    step: str
):
    """
    Proxy a time-series range query to the internal Prometheus Database.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PROMETHEUS_URL}/query_range", 
                params={
                    "query": query,
                    "start": start,
                    "end": end,
                    "step": step
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"[Telemetry Proxy] Range Query Error: {e}")
        raise HTTPException(status_code=502, detail="Telemetry Database Unavailable")
