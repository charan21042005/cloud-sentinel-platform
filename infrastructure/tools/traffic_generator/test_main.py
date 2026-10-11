import os
import threading
import time
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, ProxyHandler

import main as generator_main
from main import (
    Config,
    ConfigurationError,
    NoRedirectHandler,
    TrafficGenerator,
    open_gateway_url,
)


class FakeResponse:
    status = 200

    def __init__(self, closed=None):
        self.closed = closed

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        if self.closed is not None:
            self.closed.set()


def config(**overrides):
    values = {
        "api_url": "http://gateway.test:8000",
        "duration_seconds": 3,
        "max_requests": 10,
        "request_timeout_seconds": 1,
        "concurrency": 2,
        "random_seed": 7,
    }
    values.update(overrides)
    return Config(**values)


class GeneratorTests(unittest.TestCase):
    def test_concurrent_workers_never_exceed_global_attempt_cap(self):
        guard = threading.Lock()
        active = 0
        max_active = 0
        calls = []

        def open_url(url, timeout):
            nonlocal active, max_active
            with guard:
                calls.append((url, timeout))
                active += 1
                max_active = max(max_active, active)
            time.sleep(0.01)
            with guard:
                active -= 1
            return FakeResponse()

        result = TrafficGenerator(
            config(max_requests=7, concurrency=4), open_url=open_url
        ).run()

        self.assertEqual(result["attempts"], 7)
        self.assertEqual(len(calls), 7)
        self.assertLessEqual(max_active, 4)
        self.assertEqual(result["stop_reason"], "request_limit")

    def test_deadline_stops_scheduling_requests(self):
        calls = []

        def open_url(url, timeout):
            calls.append(url)
            time.sleep(0.02)
            return FakeResponse()

        result = TrafficGenerator(
            config(duration_seconds=1, max_requests=100, concurrency=1),
            open_url=open_url,
        ).run()

        self.assertGreater(result["attempts"], 0)
        self.assertEqual(result["attempts"], len(calls))
        self.assertLessEqual(result["elapsed_seconds"], 1.2)
        self.assertEqual(result["stop_reason"], "duration_limit")

    def test_spike_batch_uses_the_shared_request_budget(self):
        class ImmediateWaitEvent:
            def __init__(self):
                self.stopped = False

            def wait(self, _seconds):
                return self.stopped

            def is_set(self):
                return self.stopped

            def set(self):
                self.stopped = True

        event = ImmediateWaitEvent()
        calls = []
        generator = TrafficGenerator(
            config(max_requests=4), open_url=lambda url, timeout: calls.append(url) or FakeResponse()
        )
        generator._started_at = time.monotonic()
        generator._deadline = generator._started_at + 10
        generator._stop_event = event
        generator._rng.uniform = lambda _low, _high: 0

        generator._spike_worker()

        self.assertEqual(len(calls), 4)
        self.assertEqual(generator._attempts, 4)
        self.assertEqual(generator._stop_reason, "request_limit")

    def test_api_url_is_used_and_only_root_health_is_requested(self):
        observed = []

        def open_url(url, timeout):
            observed.append((url, timeout))
            return FakeResponse()

        result = TrafficGenerator(
            config(api_url="https://api.example.test:8443", max_requests=1),
            open_url=open_url,
        ).run()

        self.assertEqual(observed[0][0], "https://api.example.test:8443/health")
        self.assertEqual(result["api_url"], "https://api.example.test:8443")

    def test_transport_disables_redirects_and_environment_proxies(self):
        with patch("main.build_opener") as build_opener:
            build_opener.return_value.open.return_value = FakeResponse()
            response = open_gateway_url("http://gateway.test/health", timeout=1)

        self.assertIsInstance(response, FakeResponse)
        handlers = build_opener.call_args.args
        proxy_handler = next(h for h in handlers if isinstance(h, ProxyHandler))
        redirect_handler = next(h for h in handlers if isinstance(h, NoRedirectHandler))
        self.assertEqual(proxy_handler.proxies, {})
        self.assertIsNone(
            redirect_handler.redirect_request(
                Request("http://gateway.test/health"),
                None,
                302,
                "Found",
                {},
                "https://external.example/redirect",
            )
        )

    def test_invalid_configuration_is_rejected(self):
        cases = [
            {"API_URL": "http://user:password@gateway.test"},
            {"API_URL": "http://gateway.test/api/v1"},
            {"MAX_DURATION_SECONDS": "0"},
            {"MAX_DURATION_SECONDS": "301"},
            {"MAX_REQUESTS": "not-a-number"},
            {"MAX_REQUESTS": "101"},
            {"REQUEST_TIMEOUT_SECONDS": "-1"},
            {"CONCURRENCY": "5"},
            {"RANDOM_SEED": "not-an-integer"},
        ]
        for values in cases:
            with self.subTest(values=values), patch.dict(os.environ, values, clear=True):
                with self.assertRaises(ConfigurationError):
                    Config.from_env()

    def test_http_errors_and_timeouts_count_attempts_without_retries(self):
        calls = []

        def open_url(_url, timeout):
            calls.append(timeout)
            if len(calls) % 2:
                raise HTTPError("http://gateway.test/health", 503, "unavailable", None, None)
            raise TimeoutError("simulated timeout")

        result = TrafficGenerator(
            config(max_requests=4, concurrency=2), open_url=open_url
        ).run()

        self.assertEqual(result["attempts"], 4)
        self.assertEqual(len(calls), 4)
        self.assertEqual(result["failures"], 4)
        self.assertEqual(result["timeouts"], 2)
        self.assertEqual(result["http_status_counts"], {"503": 2})

    def test_shutdown_closes_response_and_does_not_issue_login_requests(self):
        closed = threading.Event()
        observed = []
        generator = None

        def open_url(url, timeout):
            observed.append(url)
            generator.stop("signal")
            return FakeResponse(closed)

        generator = TrafficGenerator(config(max_requests=10), open_url=open_url)
        result = generator.run()

        self.assertTrue(closed.is_set())
        self.assertEqual(observed, ["http://gateway.test:8000/health"])
        self.assertEqual(result["stop_reason"], "signal")
        self.assertEqual(result["attempts"], 1)

    def test_every_attempt_uses_a_timeout_and_run_reports_limits(self):
        timeouts = []

        def open_url(url, timeout):
            timeouts.append(timeout)
            return FakeResponse()

        result = TrafficGenerator(
            config(max_requests=1, request_timeout_seconds=1), open_url=open_url
        ).run()

        self.assertEqual(timeouts, [1])
        self.assertEqual(result["limits"]["request_timeout_seconds"], 1)
        self.assertIn(result["stop_reason"], {"request_limit", "duration_limit"})

    def test_failed_or_interrupted_run_returns_nonzero_for_kubernetes_job(self):
        outcomes = [
            ({"failures": 1, "stop_reason": "request_limit"}, 1),
            ({"failures": 0, "stop_reason": "signal"}, 1),
            ({"failures": 0, "stop_reason": "request_limit"}, 0),
        ]
        for result, expected in outcomes:
            with self.subTest(result=result):
                with (
                    patch.object(Config, "from_env", return_value=config()),
                    patch.object(generator_main, "TrafficGenerator") as generator,
                    patch.object(generator_main.signal, "signal"),
                    patch("builtins.print"),
                ):
                    generator.return_value.run.return_value = result
                    self.assertEqual(generator_main.main(), expected)


if __name__ == "__main__":
    unittest.main()
