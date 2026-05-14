# 🚦 Cloud Sentinel Ingress Controller Architecture (Phase 3A)

## 1. High-Performance Ingress Fabric Overview
To protect distributed internal microservices from public network exposure, the **Cloud Sentinel Platform** implements a dedicated **NGINX Ingress Controller Plane** isolated inside the `sentinel-ingress` namespace.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      Public Client Traversal                           │
│                                                                        │
│               [HTTPS / WSS Upstream Packets]                           │
│                             │                                          │
│                             ▼                                          │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             sentinel-ingress Namespace Boundary                │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │            NGINX Ingress Pod Controller Plane          │   │   │
│   │   │  (Tuned for Low-Latency Keepalive WebSockets & JSON)   │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────┬──────────────────────────────┘   │
│                                     │                                  │
│        ┌────────────────────────────┴───────────────────────────┐      │
│        ▼                                                        ▼      │
│ ┌──────────────┐                                         ┌───────────┐ │
│ │ sentinel-apps│                                         │ monitoring│ │
│ └──────────────┘                                         └───────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Real-Time WebSocket Tuning Parameters
Standard web proxies automatically drop idle connections after 60 seconds. Since SOC operators monitor live streaming threat visualizations continuously, we tuned the underlying connection variables within `configmap-tuning.yaml`:

*   **`proxy-read-timeout: "3600"`**: Permits streaming feeds to remain open up to 1 hour without manual reconnection storms.
*   **`proxy-send-timeout: "3600"`**: Guarantees large asynchronous fanout broadcast payloads arrive reliably across congested client pipes.
*   **`keep-alive-requests: "10000"`**: Allows single TCP handshakes to process large numbers of client events without TLS overhead renegotiation.

---

## 3. Observability Tracing Integration (Phase 3E)
Upstream execution logs inject custom parameter keys into formatted JSON logs to assist telemetry platforms in tracing performance anomalies:

```json
{
  "time": "2026-05-14T10:42:00+00:00",
  "request_id": "a9b8c7d6-e5f4-3a2b-1c0d",
  "upstream_response_time": 0.012,
  "status": 101,
  "request_proto": "HTTP/1.1",
  "path": "/ws/incidents"
}
```
This structured format allows **Loki** and **Elasticsearch** ingesters to parse metrics instantly without executing manual regular expression filters.
