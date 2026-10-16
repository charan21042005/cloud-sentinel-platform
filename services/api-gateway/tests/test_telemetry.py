import pytest
import time
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from app.schemas.telemetry import SystemTelemetryResponse
from app.services.telemetry.aggregator import TelemetryAggregator
from app.services.telemetry.prometheus_client import PrometheusAsyncClient
from app.services.telemetry.simulation import TelemetrySimulator
from app.services.telemetry.transformers import TelemetryTransformer


@pytest.mark.asyncio
async def test_prometheus_returns_valid_data():
    """1. Prometheus returns valid data -> source='prometheus' is returned with exact values."""
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False

    async def mock_query(q):
        if "timestamp(" in q:
            return time.time()
        if "idle" in q:
            return 25.5  # 25.5% CPU
        elif "MemTotal" in q:
            return 64.2  # 64.2% Memory
        elif "http_requests" in q:
            return 120.0
        elif "http_request_duration" in q:
            return 15.4
        return 10.0

    async def mock_query_range(q, start, end, step):
        now = int(time.time())
        return [[now - 15, "25.0"], [now, "26.0"]]

    mock_client.query = AsyncMock(side_effect=mock_query)
    mock_client.query_with_timestamp = AsyncMock(return_value=(1.0, time.time()))
    mock_client.query_range = AsyncMock(side_effect=mock_query_range)

    aggregator = TelemetryAggregator(client=mock_client)
    res = await aggregator.get_system_telemetry()

    assert res.source == "prometheus"
    assert res.cpu_usage == 25.5
    assert res.memory_usage == 64.2
    assert res.request_rate_per_second == 120.0
    assert res.latency_ms == 15.4
    assert len(res.history.cpu) == 2
    assert res.history.cpu[0].value == 25.0
    assert res.history.cpu[1].value == 26.0
    assert res.metric_timestamps.cpu_usage is not None
    assert res.metric_timestamps.memory_usage is not None
    assert res.metric_timestamps.request_rate_per_second is not None
    assert res.metric_timestamps.latency_ms is not None
    assert res.source_reachable is True
    assert res.source_checked_at is not None
    assert res.response_started_at is not None


@pytest.mark.asyncio
async def test_metric_freshness_timestamps_are_independent():
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(
        side_effect=[10.0, 20.0, 1.0, 3.0, time.time(), None, time.time(), time.time()]
    )
    mock_client.query_with_timestamp = AsyncMock(return_value=(1.0, time.time()))
    mock_client.query_range = AsyncMock(return_value=[])

    response = await TelemetryAggregator(client=mock_client).get_system_telemetry()

    assert response.metric_timestamps.cpu_usage is not None
    assert response.metric_timestamps.memory_usage is None
    assert response.metric_timestamps.request_rate_per_second is not None
    assert response.metric_timestamps.latency_ms is not None
    assert response.source_reachable is True


@pytest.mark.asyncio
async def test_prometheus_connectivity_is_separate_from_missing_metrics():
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(return_value=None)
    mock_client.query_range = AsyncMock(return_value=None)
    mock_client.query_with_timestamp = AsyncMock(return_value=(1.0, time.time()))

    response = await TelemetryAggregator(client=mock_client).get_system_telemetry()

    assert response.source == "simulated"
    assert response.source_reachable is True
    assert response.source_checked_at is not None


@pytest.mark.asyncio
async def test_prometheus_connection_failure():
    """2. Prometheus connection failure -> simulated fallback is returned."""
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
    mock_client.query_range = AsyncMock(
        side_effect=httpx.ConnectError("Connection refused")
    )
    mock_client.query_with_timestamp = AsyncMock(
        side_effect=httpx.ConnectError("Connection refused")
    )

    simulator = TelemetrySimulator()
    aggregator = TelemetryAggregator(client=mock_client, simulator=simulator)
    res = await aggregator.get_system_telemetry()

    assert res.source == "simulated"
    assert 10.0 <= res.cpu_usage <= 90.0
    assert 30.0 <= res.memory_usage <= 90.0
    assert res.request_rate_per_second is None
    assert res.latency_ms is None
    assert res.source_reachable is False
    assert len(res.history.cpu) == 1
    assert len(res.history.memory) == 1


@pytest.mark.asyncio
async def test_prometheus_timeout():
    """3. Prometheus timeout -> simulated fallback is returned."""
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(
        side_effect=httpx.ReadTimeout("Timeout querying Prometheus")
    )
    mock_client.query_range = AsyncMock(side_effect=httpx.ReadTimeout("Timeout"))
    mock_client.query_with_timestamp = AsyncMock(
        side_effect=httpx.ReadTimeout("Timeout")
    )

    aggregator = TelemetryAggregator(client=mock_client)
    res = await aggregator.get_system_telemetry()

    assert res.source == "simulated"
    assert res.cpu_usage > 0.0
    assert res.memory_usage > 0.0
    assert res.request_rate_per_second is None
    assert res.latency_ms is None


@pytest.mark.asyncio
async def test_prometheus_empty_series():
    """4. Prometheus responds successfully (200 OK) but returns empty series -> fallback is used."""
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    # When query returns None (empty result set in Prometheus)
    mock_client.query = AsyncMock(return_value=None)
    mock_client.query_range = AsyncMock(return_value=None)
    mock_client.query_with_timestamp = AsyncMock(return_value=None)

    aggregator = TelemetryAggregator(client=mock_client)
    res = await aggregator.get_system_telemetry()

    assert res.source == "simulated"
    assert res.cpu_usage > 0.0
    assert len(res.history.cpu) == 1


@pytest.mark.asyncio
async def test_prometheus_malformed_or_error_response():
    """5. Prometheus returns malformed or error response -> graceful fallback."""
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(side_effect=ValueError("Invalid JSON"))
    mock_client.query_range = AsyncMock(side_effect=RuntimeError("Corrupted response"))
    mock_client.query_with_timestamp = AsyncMock(side_effect=ValueError("Invalid JSON"))

    aggregator = TelemetryAggregator(client=mock_client)
    res = await aggregator.get_system_telemetry()

    assert res.source == "simulated"
    assert res.cpu_usage > 0.0


@pytest.mark.asyncio
async def test_simulated_history_structure_and_bounds():
    """Simulator history starts at collection and remains bounded."""
    simulator = TelemetrySimulator(history_points=20, step_seconds=15)
    res = await simulator.get_simulated_telemetry()

    assert res.source == "simulated"
    assert len(res.history.cpu) == 1
    assert len(res.history.memory) == 1

    for point in res.history.cpu:
        assert 0.0 <= point.value <= 100.0
        # Valid ISO timestamp parsing
        dt = datetime.fromisoformat(point.timestamp)
        assert dt is not None
        assert abs((datetime.now(dt.tzinfo) - dt).total_seconds()) < 2

    for point in res.history.memory:
        assert 0.0 <= point.value <= 100.0
        dt = datetime.fromisoformat(point.timestamp)
        assert dt is not None

    for _ in range(22):
        res = await simulator.get_simulated_telemetry()
    assert len(res.history.cpu) == 20
    assert len(res.history.memory) == 20


@pytest.mark.asyncio
async def test_prometheus_missing_metrics_are_unavailable_not_zero():
    mock_client = MagicMock(spec=PrometheusAsyncClient)
    mock_client.is_cooling_down = False
    mock_client.query = AsyncMock(
        side_effect=[18.4, None, 0.4, None, time.time(), None, time.time(), None]
    )
    mock_client.query_with_timestamp = AsyncMock(return_value=(1.0, time.time()))
    mock_client.query_range = AsyncMock(
        side_effect=[[[int(time.time()), "18.4"]], None]
    )

    result = await TelemetryAggregator(client=mock_client).get_system_telemetry()

    assert result.source == "prometheus"
    assert result.cpu_usage == 18.4
    assert result.memory_usage is None
    assert result.request_rate_per_second == 0.4
    assert result.latency_ms is None
    assert result.history.memory == []


def test_time_series_transformer_skips_invalid_and_non_finite_samples():
    samples = TelemetryTransformer.normalize_time_series(
        [
            [time.time(), "21.4"],
            [time.time(), "NaN"],
            [time.time(), "Infinity"],
            [time.time(), "not-a-number"],
            [time.time()],
        ]
    )

    assert len(samples) == 1
    assert samples[0].value == 21.4


@pytest.mark.asyncio
async def test_client_circuit_cooling_prevents_hammering():
    """7. PrometheusAsyncClient circuit cooling prevents hammering unavailable server."""
    client = PrometheusAsyncClient(
        base_url="http://invalid-host-never-resolves:9090",
        timeout=0.1,
        cooldown_seconds=5.0,
    )

    # First query fails and trips the circuit
    val1 = await client.query("up")
    assert val1 is None
    assert client.is_cooling_down is True

    # Subsequent query returns None immediately without waiting
    t0 = time.time()
    val2 = await client.query("up")
    duration = time.time() - t0
    assert val2 is None
    assert duration < 0.05  # Instant return without network attempt


@pytest.mark.asyncio
async def test_client_query_with_timestamp_returns_prometheus_sample_time():
    client = PrometheusAsyncClient(base_url="http://prometheus.invalid/api/v1")
    response = MagicMock(status_code=200)
    response.json.return_value = {
        "status": "success",
        "data": {"result": [{"value": [1700000000.0, "12.5"]}]},
    }
    http_client = MagicMock()
    http_client.get = AsyncMock(return_value=response)
    context = MagicMock()
    context.__aenter__ = AsyncMock(return_value=http_client)
    context.__aexit__ = AsyncMock(return_value=None)

    with patch(
        "app.services.telemetry.prometheus_client.httpx.AsyncClient",
        return_value=context,
    ):
        sample = await client.query_with_timestamp("up")

    assert sample == (12.5, 1700000000.0)
