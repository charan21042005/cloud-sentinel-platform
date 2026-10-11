"""Bounded, read-only synthetic traffic for Cloud Sentinel's API gateway."""

from __future__ import annotations

import json
import os
import random
import signal
import socket
import threading
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Callable, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import (
    HTTPRedirectHandler,
    ProxyHandler,
    build_opener,
)


DEFAULT_API_URL = "http://api-gateway-svc.sentinel-apps.svc.cluster.local:8000"
DEFAULT_DURATION_SECONDS = 30
DEFAULT_MAX_REQUESTS = 10
DEFAULT_REQUEST_TIMEOUT_SECONDS = 3
DEFAULT_CONCURRENCY = 2
MAX_DURATION_SECONDS = 300
MAX_REQUESTS = 100
MAX_REQUEST_TIMEOUT_SECONDS = 10
MAX_CONCURRENCY = 4
HEALTH_PATH = "/health"


class NoRedirectHandler(HTTPRedirectHandler):
    """Do not follow a health endpoint redirect to another destination."""

    def redirect_request(self, _request, _response, _code, _message, _headers, _url):
        return None


def open_gateway_url(url: str, timeout: float):
    """Open the configured gateway directly, without ambient proxy settings."""
    opener = build_opener(ProxyHandler({}), NoRedirectHandler())
    return opener.open(url, timeout=timeout)


class ConfigurationError(ValueError):
    """Raised when a safety setting is missing or outside its allowed range."""


def _bounded_int(name: str, value: str, minimum: int, maximum: int) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError) as exc:
        raise ConfigurationError(f"{name} must be an integer") from exc
    if not minimum <= parsed <= maximum:
        raise ConfigurationError(f"{name} must be between {minimum} and {maximum}")
    return parsed


@dataclass(frozen=True)
class Config:
    api_url: str
    duration_seconds: int = DEFAULT_DURATION_SECONDS
    max_requests: int = DEFAULT_MAX_REQUESTS
    request_timeout_seconds: int = DEFAULT_REQUEST_TIMEOUT_SECONDS
    concurrency: int = DEFAULT_CONCURRENCY
    random_seed: Optional[int] = None

    @classmethod
    def from_env(cls) -> "Config":
        api_url = os.environ.get("API_URL", DEFAULT_API_URL).strip()
        try:
            parsed = urlsplit(api_url)
        except ValueError as exc:
            raise ConfigurationError("API_URL is malformed") from exc
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.netloc
            or parsed.username is not None
            or parsed.password is not None
            or parsed.path not in {"", "/"}
            or parsed.query
            or parsed.fragment
        ):
            raise ConfigurationError(
                "API_URL must be an http(s) service origin without credentials, "
                "path, query, or fragment"
            )
        try:
            parsed.port
        except ValueError as exc:
            raise ConfigurationError("API_URL contains an invalid port") from exc

        seed_value = os.environ.get("RANDOM_SEED")
        try:
            seed = int(seed_value) if seed_value is not None else None
        except ValueError as exc:
            raise ConfigurationError("RANDOM_SEED must be an integer") from exc

        return cls(
            api_url=api_url.rstrip("/"),
            duration_seconds=_bounded_int(
                "MAX_DURATION_SECONDS",
                os.environ.get("MAX_DURATION_SECONDS", str(DEFAULT_DURATION_SECONDS)),
                1,
                MAX_DURATION_SECONDS,
            ),
            max_requests=_bounded_int(
                "MAX_REQUESTS",
                os.environ.get("MAX_REQUESTS", str(DEFAULT_MAX_REQUESTS)),
                1,
                MAX_REQUESTS,
            ),
            request_timeout_seconds=_bounded_int(
                "REQUEST_TIMEOUT_SECONDS",
                os.environ.get(
                    "REQUEST_TIMEOUT_SECONDS", str(DEFAULT_REQUEST_TIMEOUT_SECONDS)
                ),
                1,
                MAX_REQUEST_TIMEOUT_SECONDS,
            ),
            concurrency=_bounded_int(
                "CONCURRENCY",
                os.environ.get("CONCURRENCY", str(DEFAULT_CONCURRENCY)),
                1,
                MAX_CONCURRENCY,
            ),
            random_seed=seed,
        )


class TrafficGenerator:
    """Runs a fixed number of workers against one shared request budget."""

    def __init__(
        self,
        config: Config,
        *,
        open_url: Callable = open_gateway_url,
        clock: Callable[[], float] = time.monotonic,
        rng: Optional[random.Random] = None,
    ) -> None:
        self.config = config
        self.health_url = f"{config.api_url}{HEALTH_PATH}"
        self._open_url = open_url
        self._clock = clock
        self._rng = rng or random.Random(config.random_seed)
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._started_at: Optional[float] = None
        self._deadline: Optional[float] = None
        self._stop_reason: Optional[str] = None
        # `attempts` counts reserved HTTP attempts, including errors and timeouts.
        self._attempts = 0
        self._successes = 0
        self._failures = 0
        self._timeouts = 0
        self._status_counts: Counter[str] = Counter()

    def stop(self, reason: str = "signal") -> None:
        with self._lock:
            if self._stop_reason is None:
                self._stop_reason = reason
        self._stop_event.set()

    def _reserve_request(self) -> bool:
        """Atomically reserve one attempt before any worker can issue it."""
        with self._lock:
            if self._stop_event.is_set():
                return False
            if self._deadline is not None and self._clock() >= self._deadline:
                self._stop_reason = "duration_limit"
                self._stop_event.set()
                return False
            if self._attempts >= self.config.max_requests:
                self._stop_reason = "request_limit"
                self._stop_event.set()
                return False
            self._attempts += 1
            if self._attempts == self.config.max_requests:
                # The reserved final attempt is still issued by its caller;
                # all other workers stop scheduling immediately.
                self._stop_reason = "request_limit"
                self._stop_event.set()
            return True

    def _request_once(self) -> None:
        if not self._reserve_request():
            return
        try:
            # A context manager closes every response, including successful ones.
            with self._open_url(
                self.health_url,
                timeout=min(self.config.request_timeout_seconds, self._remaining_seconds()),
            ) as response:
                status = int(response.status)
            with self._lock:
                self._status_counts[str(status)] += 1
                if 200 <= status < 300:
                    self._successes += 1
                else:
                    self._failures += 1
        except HTTPError as exc:
            with self._lock:
                self._status_counts[str(exc.code)] += 1
                self._failures += 1
            exc.close()
        except (TimeoutError, socket.timeout) as exc:
            with self._lock:
                self._timeouts += 1
                self._failures += 1
        except URLError as exc:
            is_timeout = isinstance(exc.reason, (TimeoutError, socket.timeout))
            with self._lock:
                self._timeouts += int(is_timeout)
                self._failures += 1
        except Exception:
            # Keep logs free of URL, response body, and any transport details.
            with self._lock:
                self._failures += 1

    def _remaining_seconds(self) -> float:
        assert self._deadline is not None
        return max(0.0, self._deadline - self._clock())

    def _normal_worker(self) -> None:
        while not self._stop_event.is_set():
            self._request_once()
            if self._stop_event.is_set():
                return
            delay = min(self._rng.uniform(0.1, 1.5), self._remaining_seconds())
            if self._stop_event.wait(delay):
                return

    def _spike_worker(self) -> None:
        # Preserve the old occasional batch shape, but check the same cap for
        # every request instead of constructing or queuing a batch in advance.
        while not self._stop_event.is_set():
            delay = self._rng.uniform(60, 180)
            if self._stop_event.wait(min(delay, self._remaining_seconds())):
                return
            if self._remaining_seconds() <= 0:
                self._reserve_request()  # Records the duration stop reason.
                return
            for _ in range(30):
                if self._stop_event.is_set():
                    return
                self._request_once()

    def run(self) -> dict:
        self._started_at = self._clock()
        self._deadline = self._started_at + self.config.duration_seconds
        normal_workers = max(1, self.config.concurrency - 1)
        with ThreadPoolExecutor(max_workers=self.config.concurrency) as pool:
            futures = [pool.submit(self._normal_worker) for _ in range(normal_workers)]
            futures.append(pool.submit(self._spike_worker))
            try:
                for future in futures:
                    future.result()
            finally:
                with self._lock:
                    if self._stop_reason is None:
                        if self._deadline is not None and self._clock() >= self._deadline:
                            self._stop_reason = "duration_limit"
                        elif self._attempts >= self.config.max_requests:
                            self._stop_reason = "request_limit"
                        else:
                            self._stop_reason = "worker_error"
                    self._stop_event.set()

        elapsed = max(0.0, self._clock() - self._started_at)
        with self._lock:
            if self._stop_reason is None:
                self._stop_reason = "stopped"
            return {
                "api_url": self.config.api_url,
                "endpoint": HEALTH_PATH,
                "limits": {
                    "duration_seconds": self.config.duration_seconds,
                    "max_request_attempts": self.config.max_requests,
                    "request_timeout_seconds": self.config.request_timeout_seconds,
                    "concurrency": self.config.concurrency,
                },
                "attempts": self._attempts,
                "successes": self._successes,
                "failures": self._failures,
                "timeouts": self._timeouts,
                "http_status_counts": dict(self._status_counts),
                "elapsed_seconds": round(elapsed, 3),
                "stop_reason": self._stop_reason,
            }


def main() -> int:
    try:
        config = Config.from_env()
    except ConfigurationError as exc:
        print(json.dumps({"error": str(exc)}))
        return 2

    generator = TrafficGenerator(config)
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda _signum, _frame: generator.stop("signal"))

    print(
        json.dumps(
            {
                "event": "traffic_generator_started",
                "api_url": config.api_url,
                "endpoint": HEALTH_PATH,
                "duration_seconds": config.duration_seconds,
                "max_request_attempts": config.max_requests,
                "request_timeout_seconds": config.request_timeout_seconds,
                "concurrency": config.concurrency,
            }
        ),
        flush=True,
    )
    result = generator.run()
    print(json.dumps(result, sort_keys=True), flush=True)
    # Let Kubernetes report failed or externally interrupted runs as failed Jobs.
    return int(result["failures"] > 0 or result["stop_reason"] == "signal")


if __name__ == "__main__":
    raise SystemExit(main())
