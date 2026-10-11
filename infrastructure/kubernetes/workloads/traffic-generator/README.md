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

## Prepared Kubernetes configuration

The API Service is `api-gateway-svc` in `sentinel-apps` on port `8000`; the Job
uses its in-cluster DNS name. A separate suspended Job is in `job/`. It is
intentionally excluded from both the traffic-generator Kustomization and the
GitOps workloads tree, so GitOps sync will not create or start it. The existing
Deployment manifest is preserved as a legacy resource with desired replicas set
to zero. Its URL now follows the service-origin convention.

The Job has one completion, one worker pod, no retries, a 60-second active
deadline, and a one-hour TTL after completion. Its generator limits are set
explicitly to 30 seconds, 10 attempts, 3 seconds per request, and concurrency 2.
It also disables service-account token mounting and applies a non-root,
read-only container security context.

The image field is a placeholder. No image was built or verified in this phase.
Before a future run, replace it with the immutable digest of an image built from
the reviewed bounded source. Render and review the configuration locally:

```powershell
kubectl kustomize infrastructure/kubernetes/workloads/traffic-generator/job
```

This phase did not render or apply the Job, and the Job remains suspended. In a
later specifically authorized phase, after confirming the namespace, service,
image digest, and live baseline, the intended manual sequence is:

```powershell
kubectl apply -k infrastructure/kubernetes/workloads/traffic-generator/job
kubectl -n sentinel-apps patch job traffic-generator-phase-7v --type=merge -p '{"spec":{"suspend":false}}'
```

The second command starts the one-shot run. Do not run it until the later phase
has verified prerequisites. The static Job name prevents a second same-name Job
from being created concurrently; a subsequent run requires a separately
reviewed lifecycle decision after the prior Job is complete.

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
