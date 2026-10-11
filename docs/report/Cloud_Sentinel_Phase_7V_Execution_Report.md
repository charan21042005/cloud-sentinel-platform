# Cloud Sentinel Phase 7V — Bounded Traffic-Generator Execution Report

**Evidence date:** 2026-10-11

**Evidence source:** Historical Phase 7V-D verification report supplied for this documentation closeout. No live cluster, AWS, or monitoring verification was performed while preparing this document.

## Identity and artifact

| Item | Verified value |
| --- | --- |
| Bounded generator source commit | `52a0a23c766c48b482b58da3454e177594e3634d` |
| Job manifest commit | `67e7306b31a1392136dfdf297465c5676666b613` |
| Namespace / Job | `sentinel-apps` / `traffic-generator-phase-7v` |
| Image tag | `bounded-52a0a23-c2-5f5bc4c7` |
| Immutable ECR reference | `434504869339.dkr.ecr.us-east-1.amazonaws.com/cloud-sentinel-prod-traffic-generator@sha256:b20afb140569b574003e34d6b14e2053b77698ee1a3524ddcd47bf1403019f78` |
| ECR OCI index digest | `sha256:b20afb140569b574003e34d6b14e2053b77698ee1a3524ddcd47bf1403019f78` |
| `linux/amd64` platform manifest digest | `sha256:6dfa416e6c5d5fb56169e3a30e50914b93e3f1f98c516fe91365c9d85b094809` |

The index digest and its platform-specific manifest digest identify different OCI objects. The Job used the immutable index reference above.

## Job contract and outcome

The Job was configured for one completion and one parallel pod, `backoffLimit: 0`, a 60-second active deadline, and a 3,600-second completion TTL. The generator targeted the in-cluster `api-gateway-svc` in `sentinel-apps` and issued only read-only `GET /health` calls. Runtime bounds were 30 seconds, 10 total request attempts, a 3-second request timeout, and concurrency 2. The committed Job template has `suspend: true`; the historical one-time run was separately resumed after its preflight.

| Event | UTC |
| --- | --- |
| Job started | `2026-10-11T07:23:54Z` |
| Job completed | `2026-10-11T07:24:12Z` |

The generator summary recorded 10 attempts, 10 successes, 0 failures, 0 timeouts, and 10 HTTP 200 responses. Elapsed generator runtime was 5.899 seconds; exit code was 0; stop reason was `request_limit`. The Job condition was `Complete=True`, with one successful pod and no retry. The pod was reported `Succeeded`, with zero restarts.

## Pre-run and post-run evidence

These are historical snapshots from the supplied execution report, not fresh observations.

| Evidence | Before run | After run |
| --- | --- | --- |
| Health endpoints | At `2026-10-11T07:22:04.7459161Z`, API `/health`, `/health/database` (PostgreSQL `SELECT 1` route), and `/health/redis` (Redis `PING`) reported healthy. | At `2026-10-11T07:26:19.7106540Z`, the same three checks reported healthy. |
| API workload | 2/2 pods ready; no restarts reported. | 2/2 pods ready; no restarts reported. |
| Redis workload | 1/1 pod ready; no restarts reported. | 1/1 pod ready; no restarts reported. |
| API endpoints | Two ready endpoints on port 8000. | Two ready endpoints on port 8000. |
| Kubernetes nodes | 2/2 Ready. | 2/2 Ready. |
| Prometheus | Five targets up, including both API targets. | Five targets up, including both API targets. |

The pre-run Prometheus sample was timestamped `2026-10-11T07:22:07.717Z`; the post-run sample was timestamped `2026-10-11T07:26:30.133Z`. The reported five-minute HTTP rate for status 2xx was approximately 0.72982456 requests/second before and 0.77894737 requests/second after. These windows include background and health-check traffic, so they do not isolate the Job's requests.

No 5xx series and no in-flight request metric were available in those observations. Their absence does not establish zero 5xx responses or zero in-flight requests. The generator's own summary reported zero failures and timeouts for its 10 attempts; that is a separate, bounded observation.

## Observer timeout discrepancy

The polling observer reached its own 70-second limit and emitted `observationTimeout=true`. Its collected status output included `Complete=True`, but a PowerShell comparison issue caused the observer's timeout flag to be misleading. Independent Job status showed completion at `2026-10-11T07:24:12Z` with one success; the pod was `Succeeded` with exit code 0, and its retrieved summary log contained the 10-success result. The observer timeout therefore was not treated as the Job outcome.

## Scope and limitations

This was a controlled health-endpoint smoke test with a global cap of 10 total attempts and a 30-second maximum duration. It demonstrates that this small run completed and that the recorded health checks remained healthy around it. It does not establish application capacity, performance under load, or a zero error rate. Prometheus did not provide a 5xx series or in-flight metric in the recorded evidence.

The historical evidence also noted an earlier failed migration artifact and a later successful retry. No root cause was verified, and no causal relationship to this traffic-generator run is asserted.
