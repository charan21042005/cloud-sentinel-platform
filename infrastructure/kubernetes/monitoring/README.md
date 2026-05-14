<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b09b,100:96c93d&height=300&section=header&text=Cluster%20Observability&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">📊 Enterprise Observability & Stateful Infrastructure Stack</h3>
<p align="center"><strong>Production TSDB Storage, Log Scraping Engine & Centralized Operator Console</strong></p>

<p align="center">
  <a href="https://prometheus.io"><img src="https://img.shields.io/badge/Prometheus-TSDB_Engine-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" /></a>
  <a href="https://grafana.com"><img src="https://img.shields.io/badge/Grafana-Operations_UI-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" /></a>
  <a href="https://grafana.com/oss/loki/"><img src="https://img.shields.io/badge/Loki-Log_Aggregation-5E2750?style=for-the-badge&logo=grafana&logoColor=white" alt="Loki" /></a>
  <a href="https://prometheus.io/docs/alerting/latest/alertmanager/"><img src="https://img.shields.io/badge/Alertmanager-Mesh_Routing-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Alertmanager" /></a>
  <a href="https://kubernetes.io/docs/concepts/storage/persistent-volumes/"><img src="https://img.shields.io/badge/Storage-EBS_GP3_Backed-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="GP3 Storage" /></a>
</p>

---

A high-concurrency, **stateful operations framework** engineered to securely aggregate continuous metrics, trace internal request telemetry, ingest structured threat logs, and display distributed stream health across a centralized analytical console.

---

## 💎 1. High-Availability Operational Layout
To guarantee perfect visibility into distributed WebSocket communication failures and threat anomaly spikes without risking timeseries data loss during cluster maintenance, the **Cloud Sentinel Platform** establishes a persistent **Observability Fabric** inside the `sentinel-monitoring` namespace.

```mermaid
graph TD
    classDef ns fill:#f3e8ff,stroke:#764ba2,stroke-width:2px,color:#3b0764,rx:10px,ry:10px;
    classDef prom fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#9a3412,rx:5px,ry:5px;
    classDef graf fill:#fef3c7,stroke:#d97706,stroke-width:1px,color:#b45309,rx:5px,ry:5px;
    classDef loki fill:#fce7f3,stroke:#db2777,stroke-width:1px,color:#9d174d,rx:5px,ry:5px;
    classDef store fill:#e0f2fe,stroke:#0284c7,stroke-width:1px,color:#0369a1,rx:5px,ry:5px;
    classDef scrape fill:#e0e7ff,stroke:#4f46e5,stroke-width:1px,color:#312e81,rx:5px,ry:5px;

    subgraph Monitoring["sentinel-monitoring Namespace"]
        Prom["Prometheus Operator Engine<br/>(2x StatefulSet Pod Mesh)"]:::prom
        Graf["Grafana Operations Console<br/>(Stateful SQLite Base)"]:::graf
        Loki["Loki Timeseries Log Engine<br/>(Single-Binary Log Chunks)"]:::loki
        Alert["Alertmanager Peer Mesh<br/>(Threat Group Routing)"]:::prom

        GP3["sentinel-gp3-sc StorageClass<br/>(AWS EBS PersistentVolumes)"]:::store

        Prom -->|"Dynamic Volume Claims"| GP3
        Graf -->|"Static SQLite Persistent Volume"| GP3
        Loki -->|"Static Index Persistent Volume"| GP3
        Prom -->|"Paging Triggers"| Alert
    end

    subgraph Telemetry["Cluster-Wide Node Scraper Plane"]
        KSM["kube-state-metrics<br/>(API Core Metrics)"]:::scrape
        NodeExp["node-exporter<br/>(Kernel Load & IOPS)"]:::scrape
        Promtail["Promtail DaemonSet agents<br/>(Container HostPath logs)"]:::scrape
    end

    KSM -->|"Scraped by"| Prom
    NodeExp -->|"Scraped by"| Prom
    Promtail -->|"Pushes structured JSON"| Loki

    class Monitoring,Telemetry ns;
```

> [!IMPORTANT]
> **Storage Decoupling Principle**: Stateful databases (Prometheus TSDB arrays, Grafana SQlite profiles, and Loki index chunks) bind strictly to dedicated AWS EBS GP3 PersistentVolumeClaims (`gp3`) to survive pod rolling updates without metadata corruption.

---

## 💾 2. Stateful Storage Sizing & Scheduling Guidelines (Phase 4E)
Because monitoring pipelines continuously ingest high-velocity streaming timeseries metrics, underlying storage boundaries must be configured dynamically to prevent disk exhaustion:

| Service | Target Persistence | Retention | Volume Strategy | IOPS Baseline |
| :--- | :--- | :--- | :--- | :--- |
| **Prometheus TSDB** | `50Gi` per node | `15d` | Dynamic volumeClaimTemplate | `3000` GP3 |
| **Loki Index/Chunks**| `50Gi` shared | `30d` | Static persistent storage claim | `3000` GP3 |
| **Grafana DB** | `10Gi` persistent | Infinite | Static persistent storage claim | `3000` GP3 |
| **Alertmanager State**| `2Gi` local cache| Ephemeral | Ephemeral local states | Default |

### 🛠️ Stateful Scheduling Rules
*   **Availability Zone Panning**: StatefulSets use pod anti-affinity rules to distribute persistent copies across distinct hardware nodes.
*   **Binding Interlocking**: Volumes utilize `WaitForFirstConsumer` binding modes to ensure persistent layers are instantiated close to scheduled compute capacity.

---

## 📡 3. Cluster Telemetry Integration (Phase 4F)
The architecture includes custom monitoring frameworks mapping edge metrics automatically:
*   **`kube-state-metrics`**: Collects running instance states, horizontal pod auto-scaler scaling thresholds, and pod crashloop delays.
*   **`node-exporter`**: Tracks physical server kernel load averages, network packet drops, and local storage utilization limits.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b09b,100:96c93d&height=100&section=footer" width="100%" />
</p>
