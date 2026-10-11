# Bounded API traffic generator

The generator is a read-only smoke workload. It calls only `GET /health`; it
does not log in, create incidents, or write application data. Failed requests
are counted and never retried.

## Runtime limits

| Setting | Environment variable | Default | Allowed range |
| --- | --- | ---: | ---: |
| Gateway service origin | `API_URL` | `http://api-gateway-svc.sentinel-apps.svc.cluster.local:8000` | HTTP(S) origin only; no path, credentials, query, or fragment |
| Maximum run duration | `MAX_DURATION_SECONDS` | 30 seconds | 1–300 |
| Maximum HTTP attempts | `MAX_REQUESTS` | 10 | 1–100 |
| Per-request timeout | `REQUEST_TIMEOUT_SECONDS` | 3 seconds | 1–10 |
| Concurrent workers | `CONCURRENCY` | 2 | 1–4 |
| Repeatable random jitter | `RANDOM_SEED` | unset | Optional integer |

The attempt limit counts reservations before network I/O, including failed and
timed-out requests. A shared lock and counter cover both normal workers and the
occasional 30-request spike batch. The batch is issued one request at a time;
it is not queued in advance. The final reserved attempt may finish while all
other workers stop scheduling. At most the configured worker count can issue
requests concurrently.

`API_URL` is a service origin. The gateway's health endpoint is at `/health`,
outside the `/api/v1` prefix. The generator does not use environment proxies or
follow redirects, so a redirect cannot send health requests to another host.

## Kubernetes configuration and verified run

The API Service is `api-gateway-svc` in `sentinel-apps` on port `8000`; the
Job targets its in-cluster DNS name. The standalone Job is in `job/` and is
excluded from the active workload Kustomization. This keeps a one-shot smoke
Job out of normal GitOps reconciliation. The existing traffic-generator
Deployment remains a legacy resource with desired replicas set to zero.

The committed Job template stays suspended (`suspend: true`). It configures
one completion, one parallel pod, no retries, a 60-second active deadline, and
a one-hour completion TTL. It explicitly sets a 30-second generator duration,
10 total request attempts, a 3-second per-request timeout, and concurrency 2.
The container disables service-account token mounting and runs non-root with a
read-only root filesystem and restricted capabilities. Render the standalone
manifest locally with:

```powershell
kubectl kustomize infrastructure/kubernetes/workloads/traffic-generator/job
```

### Historical Phase 7V execution

The separately authorized one-time run completed on 2026-10-11. The committed
manifest remains a suspended template; that does not describe the historical
live Job state. No live re-verification was performed while writing this
documentation.

The run used source commit
`52a0a23c766c48b482b58da3454e177594e3634d`, Job-manifest commit
`67e7306b31a1392136dfdf297465c5676666b613`, and image tag
`bounded-52a0a23-c2-5f5bc4c7`. The immutable image reference was:

```text
434504869339.dkr.ecr.us-east-1.amazonaws.com/cloud-sentinel-prod-traffic-generator@sha256:b20afb140569b574003e34d6b14e2053b77698ee1a3524ddcd47bf1403019f78
```

That digest identifies the ECR OCI index. Its `linux/amd64` platform manifest
digest was
`sha256:6dfa416e6c5d5fb56169e3a30e50914b93e3f1f98c516fe91365c9d85b094809`;
these are distinct OCI objects.

Job `traffic-generator-phase-7v` in `sentinel-apps` had one pod and completed
successfully: `Complete=True`, one success, zero retries, and pod exit code 0.
It made 10 attempts, all 10 succeeded with HTTP 200; there were zero reported
failures and timeouts. Runtime was 5.899 seconds and the stop reason was
`request_limit`. The 30-second duration is an upper bound; the request budget
ended this run first.

Before the run, API, database, and Redis health checks reported healthy; the
API had 2/2 ready pods, Redis 1/1, and both Kubernetes nodes were Ready. After
the run, those health checks remained healthy, API stayed 2/2 and Redis 1/1,
both nodes remained Ready, and all five Prometheus targets were up. The
available five-minute HTTP metric samples showed 2xx traffic; rates also
included background and health-check requests and cannot be attributed solely
to this Job. No 5xx series or in-flight request metric was available. Those
metrics are unavailable, not evidence of zero errors or zero in-flight
requests.

This was a controlled smoke test of the read-only `/health` endpoint, not a
load-capacity or performance test and not proof of a zero error rate. See
[`docs/report/Cloud_Sentinel_Phase_7V_Execution_Report.md`](../../../../docs/report/Cloud_Sentinel_Phase_7V_Execution_Report.md)
for the recorded timeline, pre/post evidence, and monitoring limitations.

For any future run, separately verify the current namespace, service, image,
and live baseline, then obtain explicit authorization for the Job lifecycle.
The static Job name also requires a reviewed lifecycle decision before another
same-name run.

## Local smoke run and offline tests

From the repository root, a local run must target a deliberately selected local
API and uses the same small limits:

```powershell
$env:API_URL = "http://localhost:8000"
python infrastructure/tools/traffic_generator/main.py
```

The program prints effective limits and a JSON summary with attempts, successes,
failures, timeouts, HTTP status counts, elapsed time, and stop reason. It handles
`Ctrl+C` and container termination by stopping new work and awaiting in-flight
calls. It does not log credentials or response bodies.

Offline unit tests replace HTTP behavior with fakes and need no network access:

```powershell
python -m unittest discover -s infrastructure/tools/traffic_generator -v
```
