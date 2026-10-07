<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=300&section=header&text=Alertmanager&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Alertmanager</h3>
<p align="center"><strong>"Deep Observability • Real-Time Insights • Proactive Alerting"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Incident_Response-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-EF4444?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-B91C1C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Environment" />
</p>

---

The **Alertmanager** module provides Alert routing, deduplication, and notification configurations. This module builds the backbone of the Cloud Sentinel Platform's observability stack.

---

## 🏗️ 1. Architecture & Reliability Decisions
We have engineered this monitoring component to ensure extreme visibility without compromising cluster performance:
*   **Decoupled State**: Monitoring layers are distinct from application workloads, ensuring metric availability even during workload failure.
*   **Automated Discovery**: Dynamic ServiceMonitors and PodMonitors eliminate manual scrape configs.
*   **GitOps Dashboards**: All dashboards, alerts, and rules are declarative, version-controlled JSON/YAML structures.

---

## 🚀 2. Quick Start & Validation
To validate this monitoring module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/monitoring/alertmanager
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=100&section=footer" width="100%" />
</p>
