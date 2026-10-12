# Cloud Sentinel — Local Demo Runbook

This guide covers the verified localhost demo flow. It does not describe a production deployment.

## Local URLs

| Purpose | URL |
| --- | --- |
| Frontend login | <http://127.0.0.1:3001/auth/login> |
| Dashboard | <http://127.0.0.1:3001/dashboard> |
| Incidents | <http://127.0.0.1:3001/dashboard/incidents> |
| API documentation | <http://127.0.0.1:8000/docs> |
| API health | <http://127.0.0.1:8000/health> |
| Database health | <http://127.0.0.1:8000/health/database> |
| Redis health | <http://127.0.0.1:8000/health/redis> |
| Telemetry REST | <http://127.0.0.1:8000/api/v1/telemetry/system/live> |
| Telemetry WebSocket | `ws://127.0.0.1:8000/ws/telemetry` |

## Demo flow

1. Open the frontend login page and sign in with the local demo account created through the existing registration flow. Keep its password and session token private.
2. Open **Dashboard** and **Incidents** from the application navigation. Registration, login, and the authenticated incident page were confirmed by the owner. This runbook does not assert that the incident list contains records.
3. On the dashboard, point out the telemetry source badge. The locally checked API response identifies its source as `simulated`; do not present these values as live Prometheus measurements.
4. The dashboard requests telemetry over REST and polls every five seconds. The separate `/ws/telemetry` endpoint also completed a local connection and delivered a frame during verification; that does not mean the dashboard charts use the WebSocket stream.
5. The API health endpoints above returned HTTP 200 during the final local check.

## Scope and limitations

- The alert feed in `frontend/src/features/alerts/api/index.ts` uses in-memory sample alerts. Treat that feed as mock data.
- The authenticated incidents page is backed by the API. Its successful display was confirmed by the owner; incident contents were not independently inspected for this sign-off.
- The Alertmanager configuration points to the API webhook route, but end-to-end delivery was not tested. Do not trigger it during a read-only demo because webhook processing can create or update incident records.
- A Grafana dashboard JSON file exists in the repository, but live Grafana provisioning and dashboard rendering were not verified in this check.
- This local smoke test does not establish production readiness, application capacity, or live Prometheus telemetry.

## Stopping demo processes

Use `Ctrl+C` only in terminal windows where you personally started a frontend or API development process. Do not stop shared or pre-existing containers as part of cleanup. If you started a separate service yourself, stop only that service using the same local workflow that started it; retain database volumes and the existing traffic-generator container.
