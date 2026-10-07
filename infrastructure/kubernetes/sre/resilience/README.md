<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=300&section=header&text=Cluster%20Resilience&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Cluster Resilience</h3>
<p align="center"><strong>"Site Reliability • Automated Resilience • GitOps Managed"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Fault_Tolerance-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-EF4444?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-B91C1C?style=for-the-badge&logo=gitkraken&logoColor=white" alt="Environment" />
</p>

---

The **Cluster Resilience** module provides Pod Disruption Budgets (PDB) guaranteeing minimum availability during cluster upgrades. This module acts as the core SRE heartbeat, ensuring workloads survive node failures and unpredictable traffic surges.

---

## 🏗️ 1. Architecture & Reliability Decisions
We have engineered this SRE component to enforce strict Service Level Objectives (SLOs):
*   **Declarative Thresholds**: Thresholds for scaling, disruption, or scheduling are mathematically defined via Kustomize patches.
*   **Infrastructure as Code**: Eliminates manual `kubectl drain` errors by relying on Kubernetes control plane protections.
*   **Automated Recovery**: Directly interfaces with horizontal autoscaling capabilities to match infrastructure capacity with demand.

---

## 🚀 2. Quick Start & Validation
To validate this SRE module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/sre/resilience
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
