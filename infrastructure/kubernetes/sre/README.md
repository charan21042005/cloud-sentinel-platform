<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f5af19,100:f12711&height=300&section=header&text=SRE%20Operations&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🔥 High Availability, Scalability & Platform Resilience</h3>
<p align="center"><strong>"Hyperscale Burst Capability • Absolute Zero Downtime • Topology Isolation"</strong></p>

<p align="center">
  <a href="https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/"><img src="https://img.shields.io/badge/Autoscaling-HPA_Burst-F5AF19?style=for-the-badge&logo=kubernetes&logoColor=white" alt="HPA" /></a>
  <a href="https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/"><img src="https://img.shields.io/badge/Topology-AZ_Spread-F12711?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Topology Spread" /></a>
  <a href="https://kubernetes.io/docs/concepts/workloads/pods/disruptions/"><img src="https://img.shields.io/badge/Resilience-Disruption_Safety-F5AF19?style=for-the-badge&logo=kubernetes&logoColor=white" alt="PDB" /></a>
  <a href="https://sre.google/"><img src="https://img.shields.io/badge/Operations-SRE_Standards-F12711?style=for-the-badge&logo=google&logoColor=white" alt="SRE" /></a>
</p>

---

The **Cloud Sentinel Site Reliability Engineering (SRE)** architecture prevents node exhaustion, eliminates single points of failure, and handles volatile telemetry ingestion bursts without operator intervention.

---

## 📈 1. Advanced Autoscaling Architecture (Phase 7A)
Horizontal Pod Autoscalers (HPAs) aggressively scale workloads during threat spikes and gracefully cool down to prevent "flapping."
*   **Dual-Metric Sensing**: Scales on both Memory (`75%` target) and CPU (`65%` target) saturation limits.
*   **Anti-Thrashing Windows**: Scale-down stabilization forces a 5-minute cooldown (`300s`) ensuring sporadic traffic drops do not prematurely tear down serving capacity.
*   **Burst Allowances**: Scale-up policies permit immediate `100%` cluster doubling every 15 seconds to ingest sudden DDoS or traffic influxes.

---

## 🌍 2. High Availability Engineering (Phase 7B)
To survive complete AWS Availability Zone (AZ) outages or massive underlying node hardware failures, workloads are strictly decentralized using declarative scheduling hooks:
*   **TopologySpreadConstraints**: Replicas are explicitly partitioned across different zones (`topology.kubernetes.io/zone`) with a maximum skew of `1`, guaranteeing perfect load symmetry.
*   **Pod Anti-Affinity**: Identical workload types are forbidden (`requiredDuringSchedulingIgnoredDuringExecution`) from cohabitating on the exact same physical node.

---

## 🛡️ 3. Cluster Resilience & Disruption Safety (Phase 7C)
Zero-downtime cluster maintenance is achieved using absolute eviction boundaries.
*   **PodDisruptionBudgets (PDBs)**: Hard constraints guarantee that operations (like cluster upgrades or node draining) cannot evict workloads if doing so would drop API availability below `66%` or take the Frontend completely offline.

---

## 🗄️ 4. Node Governance & Isolation (Phase 7E)
High-IOPS logging applications (Loki/Prometheus) actively degrade network proxies if co-located. We isolate them using Taints and Tolerations:
*   **Observability Node Pinning**: Prometheus pods are patched with strict `Equal` tolerations that explicitly route them only toward nodes possessing the `node-role.kubernetes.io/observability` taint, guaranteeing noisy-neighbor immunity for the API gateway.

---

## 🚨 5. Operational SRE Standards & Incident Matrix (Phase 7F)
In the event of a platform alert escalating to PageDuty, operators adhere strictly to the Cloud Sentinel Incident Severity Matrix:

| Severity | Definition | Target Response (SLO) | Action Protocol |
| :--- | :--- | :--- | :--- |
| **SEV-1** | Total Cluster Outage / Ingress Down | < 5 Minutes | Break-glass IAM, execute `velero restore`, page primary architect |
| **SEV-2** | Observability Stack Failure (Blind) | < 15 Minutes | Re-deploy `sentinel-monitoring-platform` ArgoCD app sync |
| **SEV-3** | CPU/Memory Saturation Warn | < 45 Minutes | Scale underlying Auto Scaling Group via infrastructure layer |
| **SEV-4** | HPA Burst Limits Reached | Next Business Day | Recalculate HPA upper bounds and storage retention limits |

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f5af19,100:f12711&height=100&section=footer" width="100%" />
</p>
