<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8B5CF6,100:5B21B6&height=300&section=header&text=Platform%20Audit&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Platform Audit</h3>
<p align="center"><strong>"Operational Excellence • Cost Awareness • Deep Auditing"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Compliance-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-8B5CF6?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-5B21B6?style=for-the-badge&logo=gitkraken&logoColor=white" alt="Environment" />
</p>

---

The **Platform Audit** module provides Audit logging configurations and Kubernetes API server event tracking. This module translates operational maturity concepts into declarative code, ensuring platform health and cost compliance.

---

## 🏗️ 1. Architecture & Operations Decisions
We have engineered this component to strictly comply with FinOps and operational compliance frameworks:
*   **Immutable Tagging**: All resources are subjected to Kustomize label transformers ensuring billing allocation across all nodes.
*   **Metric Curation**: Granular observability overrides prevent metric ingestion bloat.
*   **Audit Continuity**: Ensuring transparent records of cluster state changes and API behaviors for zero-trust compliance.

---

## 🚀 2. Quick Start & Validation
To validate this operations module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/operations/audit
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8B5CF6,100:5B21B6&height=100&section=footer" width="100%" />
</p>
