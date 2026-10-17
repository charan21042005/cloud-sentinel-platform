# Cloud Sentinel Platform — Professor Demo Runbook

This guide demonstrates the existing local Docker stack first, then gives read-only commands for the AWS EKS environment. It does not perform deployments or change infrastructure.

## Evidence boundary (checked 2026-10-17)

- Git was on `main` at `c2b47e45a78cf41ca0b8056499cbadc3abfcab77` with a clean working tree before this file was created.
- Local frontend login, API, database, Redis, Grafana, Prometheus, Alertmanager, and Adminer returned HTTP 200.
- All four active local Prometheus scrape jobs reported their target UP: `sentinel-api`, `node-exporter`, `postgres-exporter`, and `redis-exporter`.
- The frontend is not a service in the inspected Compose configuration; it is accessed separately on port 3001.
- The AWS CLI could not find configured credentials in this session. Windows denied access to the kubeconfig, so the current Kubernetes context and live EKS state could not be verified. No AWS identity, EKS node, live workload, or public application URL is claimed in this guide.

Recheck each result immediately before presenting. A successful health endpoint or Prometheus target does not prove every dashboard panel is live or that AWS is reachable.

## 1. Project overview

Cloud Sentinel is a cloud-observability and incident-management project. A Next.js frontend provides login, dashboard, and incident pages. A FastAPI API gateway handles authentication, role checks, incidents, telemetry, and health checks. PostgreSQL stores application data; Redis provides the cache/event support used by the backend. Prometheus scrapes metrics, and Grafana displays dashboards. Kubernetes and Terraform files describe an AWS deployment, but live AWS status must be checked separately.

For the presentation, explain telemetry exactly as the dashboard labels it. The API has a simulated fallback. A Prometheus target marked UP proves that Prometheus can scrape that target; it does not by itself prove that a particular dashboard card is displaying fresh Prometheus data. The alert feed in the local frontend is sample/mock data. The Alertmanager-to-incident webhook exists, but its end-to-end delivery has not been verified here.

## 2. Verified local architecture and ports

The Compose files were verified as `infrastructure/docker/docker-compose.yml` plus the monitoring override `infrastructure/docker/docker-compose.monitoring.yml`.

| Component | Local port | Evidence and notes |
| --- | ---: | --- |
| Frontend (Next.js) | 3001 | Login page returned HTTP 200. Not a Compose service; run separately only if port 3001 is not already listening. |
| API gateway (FastAPI) | 8000 | Compose service `api-gateway`; `/health` returned HTTP 200. Depends on PostgreSQL and Redis. |
| PostgreSQL | 5432 | Compose service `postgres`; `/health/database` returned HTTP 200. Persistent volume is `sentinel_postgres_data`. |
| Redis | 6379 | Compose service `redis`; `/health/redis` returned HTTP 200. |
| Adminer (database browser) | 8888 | Compose service `adminer`; UI returned HTTP 200. It is a browser for the local database, not the database server itself. Sign in privately; do not put database credentials in screenshots or this report. |
| Prometheus | 9090 | Compose service `prometheus`; health returned HTTP 200; all four configured scrape jobs were UP during this check. |
| Grafana | 3002 | Compose service `grafana`; health returned HTTP 200. The health response does not alone verify every dashboard panel. Persistent volume: `docker_grafana_data`. |
| Alertmanager | 9093 | Compose service `alertmanager`; health returned HTTP 200. Do not trigger alerts during a read-only demonstration. |
| Node exporter | 9100 | Scrape target for host metrics. |
| PostgreSQL exporter | 9187 | Scrape target for database metrics. |
| Redis exporter | 9121 | Scrape target for Redis metrics. |

Other named Compose volumes include `docker_prometheus_data`. The override also declares a `traffic-generator` service; it was not in the running-container listing during this check, so the startup command below deliberately leaves it out.

## 3. Local startup and verification

### Terminal 1 — inspect before starting

Open PowerShell at the repository root. These commands only list existing containers and Compose services:

```powershell
Set-Location "C:\Users\Tokachichu SriCharan\OneDrive\Documents\GitHub\cloud-sentinel-platform"
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
```

The Compose configuration requires `GF_SECURITY_ADMIN_PASSWORD`. Do not run `docker compose config` without filtering: its full output can include resolved environment settings. If you need to start missing local services, use the hidden prompt below; it sets the variable only in this PowerShell process and does not save it to a file or command history.

### Terminal 1 — start only the existing API, data, and monitoring services if needed

`--no-recreate` preserves existing containers and `--no-build` avoids image builds. This command does not include the traffic generator. Do not run it if the services are already running and healthy.

```powershell
$secure = Read-Host "Grafana admin password (hidden; not saved)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:GF_SECURITY_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    docker compose `
      -f .\infrastructure\docker\docker-compose.yml `
      -f .\infrastructure\docker\docker-compose.monitoring.yml `
      up -d --no-recreate --no-build `
      api-gateway postgres redis adminer prometheus grafana `
      node-exporter postgres-exporter redis-exporter alertmanager
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    Remove-Item Env:\GF_SECURITY_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    $secure.Dispose()
}
```

The hidden prompt is needed even when only some services are selected because Compose parses the Grafana override. If startup reports a missing image or daemon problem, stop and diagnose it; do not add a rebuild, reset, prune, or volume-removal command.

Check status without printing environment values:

```powershell
docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
```

### Terminal 2 — frontend, only if it is not already available

The frontend is not part of the Compose service list. First check whether its port is already in use:

```powershell
Test-NetConnection 127.0.0.1 -Port 3001 -InformationLevel Quiet
```

If that returns `True`, do not start a second frontend. If it returns `False` and the frontend dependencies are already installed, start this in a separate PowerShell window and leave that window open:

```powershell
Set-Location "C:\Users\Tokachichu SriCharan\OneDrive\Documents\GitHub\cloud-sentinel-platform\frontend"
$env:NEXT_PUBLIC_API_URL = "/api-proxy"
$env:API_PROXY_ORIGIN = "http://127.0.0.1:8000"
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Keep this terminal open during the demo. To stop only the frontend process started in this terminal, press `Ctrl+C` there. Do not stop any shared or pre-existing container.

### Health and monitoring checks

The following loop prints only HTTP status codes, not response bodies:

```powershell
$checks = [ordered]@{
  Frontend = "http://127.0.0.1:3001/auth/login"
  API = "http://127.0.0.1:8000/health"
  Database = "http://127.0.0.1:8000/health/database"
  Redis = "http://127.0.0.1:8000/health/redis"
  Prometheus = "http://127.0.0.1:9090/-/healthy"
  Grafana = "http://127.0.0.1:3002/api/health"
  Alertmanager = "http://127.0.0.1:9093/-/healthy"
  Adminer = "http://127.0.0.1:8888/"
}
foreach ($name in $checks.Keys) {
  $code = & curl.exe -sS -o NUL -w "%{http_code}" --max-time 5 $checks[$name] 2>$null
  if ($LASTEXITCODE -eq 0) { "$name HTTP $code" } else { "$name unavailable" }
}
```

Check Prometheus target health without printing target URLs or labels:

```powershell
$targets = Invoke-RestMethod "http://127.0.0.1:9090/api/v1/targets?state=active" -TimeoutSec 5
$targets.data.activeTargets | Group-Object { $_.labels.job } | ForEach-Object {
  [pscustomobject]@{
    Job = $_.Name
    Up = @($_.Group | Where-Object { $_.health -eq "up" }).Count
    Total = $_.Count
  }
} | Format-Table -AutoSize
```

### Local browser URLs

| What to show | URL |
| --- | --- |
| Login | <http://127.0.0.1:3001/auth/login> |
| Dashboard | <http://127.0.0.1:3001/dashboard> |
| Incidents | <http://127.0.0.1:3001/dashboard/incidents> |
| Admin user management | <http://127.0.0.1:3001/dashboard/users> |
| API documentation | <http://127.0.0.1:8000/docs> |
| API health | <http://127.0.0.1:8000/health> |
| PostgreSQL health | <http://127.0.0.1:8000/health/database> |
| Redis health | <http://127.0.0.1:8000/health/redis> |
| Prometheus targets | <http://127.0.0.1:9090/targets> |
| Grafana dashboards | <http://127.0.0.1:3002/dashboards> |
| Alertmanager UI | <http://127.0.0.1:9093/> |
| Adminer database browser | <http://127.0.0.1:8888/> |

Use the local demo account privately. Do not type its password into a terminal command, share a token, or include either in presentation material. Do not execute state-changing API operations from Swagger during this demo.

## 4. AWS EKS read-only demo commands

These commands are for an already-authorized AWS CLI identity and an already-selected Kubernetes context. They do not change AWS or Kubernetes resources. **At preparation time, AWS credentials were unavailable and the Windows kubeconfig access was denied. Therefore these commands and EKS state have not been verified in this environment.** Do not present EKS as live until the checks succeed on your machine.

### Confirm identity, region, and cluster metadata without printing account identifiers

Run in PowerShell. The caller ARN/account identifier is held only in a variable and is not printed:

```powershell
$identityJson = aws sts get-caller-identity --output json 2>$null
if ($LASTEXITCODE -ne 0) { throw "AWS authentication is unavailable; stop the EKS demo." }
$identity = $identityJson | ConvertFrom-Json
$principalType = if ($identity.Arn -match ":assumed-role/") { "assumed role" } elseif ($identity.Arn -match ":user/") { "IAM user" } else { "other principal" }
"AWS identity check passed; principal type: $principalType (identifier withheld)"
$defaultRegion = aws configure get region 2>$null
if ($defaultRegion) { "AWS CLI default region: $defaultRegion" } else { "No AWS CLI default region; using explicit us-east-1 for this demo." }

$clusterJson = aws eks describe-cluster `
  --name cloud-sentinel-prod `
  --region us-east-1 `
  --query 'cluster.{status:status,version:version}' `
  --output json 2>$null
if ($LASTEXITCODE -ne 0) { throw "Cluster metadata is unavailable or not authorized; stop the EKS demo." }
$clusterJson | ConvertFrom-Json | Format-List
```

### Confirm the already-selected context, then inspect live resources

The context check captures the context name instead of printing it. It does not select or create a context. If it fails, do not switch profiles or rewrite kubeconfig during the presentation.

```powershell
$context = kubectl config current-context 2>$null
if ($LASTEXITCODE -ne 0) { throw "Kubeconfig is unreadable or no context is selected; stop the EKS demo." }
if ($context -notmatch "cloud-sentinel-prod") { throw "The selected context does not identify the expected cluster; stop and verify it." }
"Expected cluster name found in selected context; context details withheld."
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
kubectl get deployments,pods,services -n sentinel-apps
kubectl get deployments,pods,services -n sentinel-monitoring
kubectl get ingress -A
kubectl get services -A
kubectl get events -n sentinel-apps --sort-by=.metadata.creationTimestamp
```

The context name alone is not proof of cluster identity; compare the selected context and successful cluster metadata check before continuing. Do not run `kubectl get secrets`, print pod environment variables, or copy credential-bearing output into slides.

The repository declares the app Services as ClusterIP: `frontend-svc` port 80 and `api-gateway-svc` port 8000 in `sentinel-apps`; `grafana` port 80 and Prometheus Service(s) port 9090 in `sentinel-monitoring`. **First confirm a specific Service exists in the live `kubectl get services` output.** Then, if needed, start each port-forward in its own PowerShell window:

```powershell
kubectl port-forward -n sentinel-apps svc/frontend-svc 13001:80
```

```powershell
kubectl port-forward -n sentinel-apps svc/api-gateway-svc 18000:8000
```

```powershell
kubectl port-forward -n sentinel-monitoring svc/grafana 13002:80
```

```powershell
kubectl port-forward -n sentinel-monitoring svc/sentinel-prometheus 19090:9090
```

The last command is conditional: if the live Service list instead contains `prometheus`, use that observed name in place of `sentinel-prometheus`. These commands keep their terminal open; press `Ctrl+C` in that same terminal to close only that tunnel. They do not change cluster resources.

Port-forward URLs, only while the corresponding command is running:

- Frontend page preview: <http://127.0.0.1:13001/auth/login>
- API health/docs: <http://127.0.0.1:18000/health> and <http://127.0.0.1:18000/docs>
- Grafana: <http://127.0.0.1:13002/dashboards>
- Prometheus targets: <http://127.0.0.1:19090/targets>

The frontend manifest uses same-origin API paths intended to be routed by the Ingress. A frontend-only port-forward may display the UI while its API calls fail; do not describe it as an end-to-end EKS application flow unless the live Ingress route or another verified routing path is working. Separate API/Grafana/Prometheus forwards are useful for showing those services independently.

The Kubernetes Ingress manifest declares a host name and an internet-facing load-balancer scheme, but neither a live Ingress address, DNS resolution, nor public reachability was verified here. Treat any address shown by `kubectl get ingress -A` as an advertised address only until DNS and HTTP(S) reachability are separately checked. Do not invent or promise a public app URL.

## 5. Source-code map

Paths and line numbers refer to the repository state checked for this guide. Re-run `rg -n` if files change.

| Feature | Implementation location |
| --- | --- |
| Main dashboard route | `frontend/src/app/dashboard/page.tsx:7` — `DashboardPage` |
| Metrics dashboard/cards and source badge | `frontend/src/features/metrics/components/MetricsDashboard.tsx:45`; metric card `MetricCard.tsx:24`; graph `TimeSeriesChart.tsx:23` |
| Telemetry frontend API and polling/history merge | `frontend/src/features/metrics/api/index.ts:4`; `frontend/src/features/metrics/hooks/useMetrics.ts:14` (`mergeMetricHistory`), `:29` (`mergeSystemMetrics`), `:66` (`useSystemMetrics`); polling hook `frontend/src/services/realtime/polling/usePolling.ts:12` |
| Frontend API proxy and authenticated client | `frontend/src/lib/api-client.ts:3`; rewrite configuration `frontend/next.config.ts:3` |
| Login and registration pages/forms | `frontend/src/app/auth/login/page.tsx:4`; `frontend/src/features/auth/components/LoginForm.tsx:25`; `frontend/src/app/auth/register/page.tsx:4`; `frontend/src/features/auth/components/RegisterForm.tsx:46` |
| Frontend session and auth API | `frontend/src/features/auth/context/AuthContext.tsx:21` (`AuthProvider`); `frontend/src/features/auth/api.ts:4` (`authApi`) |
| Backend login/register and password/token helpers | `services/api-gateway/app/api/v1/routes/auth.py:17` (register), `:30` (login); `services/api-gateway/app/services/auth_service.py:12`; `services/api-gateway/app/core/security.py:14` (`verify_password`), `:19` (`get_password_hash`), `:24` (`create_access_token`) |
| Role enforcement and user management | `services/api-gateway/app/dependencies/auth.py:81` (`require_admin`); `services/api-gateway/app/api/v1/routes/users.py:17` (`list_users`), `:29` (`create_user`), `:38` (`get_my_profile`); UI `frontend/src/app/dashboard/users/page.tsx:27` |
| Incident page, API client, and actions | `frontend/src/app/dashboard/incidents/page.tsx:12`; `frontend/src/features/incidents/api/index.ts:4`; hooks `frontend/src/features/incidents/hooks/useIncidents.ts:5`, `:14`, `:26`; backend routes `services/api-gateway/app/api/v1/routes/incidents.py:23` (analytics), `:64` (webhook), `:84` (list), `:100` (acknowledge), `:122` (resolve); service `services/api-gateway/app/services/incident_service.py:19` |
| Alert/notification panel | `frontend/src/features/alerts/components/AlertFeed.tsx:13`; `frontend/src/features/alerts/api/index.ts:24`; hook `frontend/src/features/alerts/hooks/useAlerts.ts:7`. Local alert feed is sample/mock data per the existing demo guide. |
| Telemetry API and source selection | `services/api-gateway/app/api/v1/routes/telemetry.py:14` (`get_live_telemetry`); `services/api-gateway/app/services/telemetry/aggregator.py:17`; Prometheus client `prometheus_client.py:9`; simulator `simulation.py:12` |
| WebSockets | Backend incident, telemetry, and system-event handlers: `services/api-gateway/app/api/ws/routes.py:11`, `:36`, `:60`; frontend generic hook `frontend/src/services/realtime/websocket/useWebSocket.ts:16` |
| API/database/Redis health | `services/api-gateway/app/api/routes/health.py:9`; `services/api-gateway/app/api/routes/database_health.py:12`, `:24`; Redis manager `services/api-gateway/app/db/redis.py:7` |
| Audit events | Backend `services/api-gateway/app/api/v1/routes/audit.py:13`; service `services/api-gateway/app/services/audit_service.py:8` |
| Local Docker services | `infrastructure/docker/docker-compose.yml:1`; monitoring override `infrastructure/docker/docker-compose.monitoring.yml:3`; API build `services/api-gateway/Dockerfile`; frontend build `frontend/Dockerfile` |
| Local Prometheus/Grafana files | `infrastructure/monitoring/prometheus/prometheus.yml`; alert rules `alert_rules.yml` and `alert.rules.yml`; Grafana dashboard `infrastructure/monitoring/grafana/dashboards/platform_overview.json`; provisioning under `infrastructure/monitoring/grafana/provisioning/` |
| Kubernetes API/frontend/Redis | Deployments and Services under `infrastructure/kubernetes/workloads/{api-gateway,frontend,redis}/`; app Ingress `infrastructure/kubernetes/networking/routes/apps-ingress.yaml` |
| Kubernetes monitoring | Prometheus `infrastructure/kubernetes/monitoring/prometheus/`; Grafana `infrastructure/kubernetes/monitoring/grafana/`; Alertmanager resources `infrastructure/kubernetes/monitoring/alertmanager/` |
| Terraform | Environment stages `infrastructure/terraform/environments/prod/01-networking` through `06-rds`; core modules `infrastructure/terraform/modules/{networking,eks,nodes,rds,ecr,iam}` |
| CI/CD and manifest validation | `.github/workflows/backend-ci.yml`; `.github/workflows/sentinel-pipeline.yml`; `.github/workflows/gitops-infrastructure-ci.yml`. The frontend workflow builds/pushes an image; its deployment job is commented out. The Kubernetes workflow validates/renders manifests; it does not prove a live deployment. |

## 6. Timed 9-minute presentation script

| Time | Open/run | Look for | Suggested explanation |
| --- | --- | --- | --- |
| 0:00–1:00 | Open the dashboard login at `http://127.0.0.1:3001/auth/login`. | Login page loads. Sign in privately; never project or share the password. | “This is the local demonstration environment. The UI talks to a FastAPI service, which uses PostgreSQL and Redis.” |
| 1:00–2:00 | Show `docker ps` and the health-check loop from Section 3. | Existing API/database/Redis/monitoring containers and HTTP 200 checks. | “Compose provides the backend and monitoring services. The frontend runs separately from Compose.” |
| 2:00–3:15 | Open `http://127.0.0.1:3001/dashboard`. | Dashboard cards, graph history, and telemetry source badge. | Read the source badge aloud. Say simulated if it says simulated; say Prometheus live only if the badge says live and its freshness state is current. |
| 3:15–4:15 | Show Prometheus targets at `http://127.0.0.1:9090/targets`. | Target health for API and exporters; confirm UP at presentation time. | “These targets show scrape connectivity. They are separate evidence from the dashboard’s displayed source label.” |
| 4:15–5:15 | Open `http://127.0.0.1:3002/dashboards` and the provisioned overview if present. | Grafana loads and dashboard panels render. | “Grafana queries Prometheus. A successful Grafana health response alone is not proof every panel is populated.” |
| 5:15–6:15 | Open `http://127.0.0.1:3001/dashboard/incidents`; optionally show `http://127.0.0.1:8000/docs`. | Authenticated incident page/API schema. Do not acknowledge or resolve an incident. | “The incident page uses authenticated API routes. I am not changing incident state in this read-only demonstration.” |
| 6:15–7:00 | Show the local API/database/Redis health URLs. | Each returns HTTP 200. | “These are dependency health checks, not a production availability guarantee.” |
| 7:00–8:30 | **Optional AWS segment only if the identity, context, and cluster commands in Section 4 succeed.** | Ready nodes, desired deployments/pods, Services, monitoring namespace, and actual Ingress status. | Explain only what the live commands show. Do not infer public reachability from a manifest or a load-balancer address alone. |
| 8:30–9:00 | Return to the dashboard or show saved screenshots if AWS access fails. | Honest source label and evidence. | “AWS access is unavailable today, so I’m showing the verified local stack and clearly marking AWS as not tested.” |

### Evidence-based claims

**Verified for this preparation check:** local HTTP endpoints listed in Section 2 returned 200; the four listed local Prometheus jobs were UP; Compose defines the listed services and ports; the dashboard has source/freshness labels; the source code has a simulated telemetry fallback; the local frontend alert feed is mock/sample data.

**Not verified in this check:** current EKS identity, cluster/nodes/pods/services, external Ingress/DNS, public AWS application access, AWS frontend-to-API integration, current authenticated telemetry response, incident-record contents, end-to-end Alertmanager delivery, and current Grafana panel data. No capability in this list should be claimed as working until its check succeeds.

## 7. Safe troubleshooting

- **Local URL unavailable:** run the health loop and `Test-NetConnection 127.0.0.1 -Port <port>`. Check `docker ps` and Compose `ps -a`. Do not start a duplicate process when a port is already listening.
- **Container unhealthy:** inspect only safe status fields, for example `docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' sentinel-api-gateway`. Do not dump container configuration or environment values. Capture the status and stop; do not restart or recreate shared services during the presentation.
- **Prometheus target down:** refresh `/targets` and use the target job/state summary. Do not claim live metrics from a down target and do not restart exporters as a presentation fix.
- **Failed Kubernetes pod:** after confirming the selected context, run `kubectl get pods -n sentinel-apps` or `kubectl get pods -n sentinel-monitoring`. For a concise, value-free status check, run `kubectl get pod <observed-pod-name> -n <observed-namespace> -o jsonpath='{.status.phase}{" "}{.status.containerStatuses[*].state.waiting.reason}{"\n"}'`. Do not dump a full Pod definition, inspect Secrets, print environment values, delete pods, or run rollout commands.
- **EKS command denied or kubeconfig unreadable:** stop the AWS segment. Use the authorized account owner’s normal access process to restore intended credentials and read access to kubeconfig. Do not broaden ACLs or regenerate kubeconfig as part of this read-only runbook.
- **Ingress URL uncertain:** use only the hostname/address returned by live `kubectl get ingress -A`; check DNS and HTTP(S) reachability separately. If either is unverified, use the local demo and describe AWS access as unavailable.
- **Incident/action panel looks empty:** do not create, acknowledge, or resolve data for the presentation. An empty list is a valid result; the alert sample feed is mock data.

## 8. Pre-demo checklist

- [ ] Open the login, dashboard, incidents, API docs, Prometheus targets, and Grafana tabs.
- [ ] Sign in privately; keep passwords and browser storage out of screen shares and screenshots.
- [ ] Check ports before starting services; do not duplicate the frontend or backend.
- [ ] Confirm `/health`, `/health/database`, and `/health/redis` return 200.
- [ ] Confirm Prometheus targets and read the dashboard source badge/freshness honestly.
- [ ] Keep the frontend terminal open only if you started it for this demo.
- [ ] For AWS, verify AWS identity without displaying it, confirm the intended existing context, and run only read-only cluster queries.
- [ ] Confirm any EKS Service before starting its port-forward; keep each forward in its own terminal and stop only that forward with `Ctrl+C`.
- [ ] Check screenshots for passwords, tokens, account identifiers, personal data, and secret-bearing browser panels before sharing.
- [ ] If AWS is unavailable, present the healthy local stack and label EKS as not tested today.

## Cleanup

Press `Ctrl+C` only in terminals where you personally started the frontend or a `kubectl port-forward`. Do not run `docker compose down`, stop shared containers, remove volumes, or change cloud resources as demo cleanup.
