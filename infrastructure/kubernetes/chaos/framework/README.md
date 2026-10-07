<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:C2410C&height=300&section=header&text=Chaos%20Framework&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Chaos Framework</h3>
<p align="center"><strong>"Proactive Resilience • Fault Injection • Controlled Chaos"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Chaos_Controller-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-F97316?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Testing_Only-C2410C?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Environment" />
</p>

---

The **Chaos Framework** module provides Chaos Mesh or Litmus core installation profiles and RBAC permissions. This directory defines the proactive resilience tooling used to harden the SOC platform against unpredictable outages.

---

## 🏗️ 1. Architecture & Reliability Decisions
We use Chaos Engineering selectively to expose weaknesses before they impact production:
*   **Scoped Blast Radius**: Experiments are tightly constrained to specific namespaces and label selectors, protecting core infrastructure.
*   **Declarative Chaos**: All experiments and framework constraints are defined as code, allowing automated injection pipelines.
*   **Observability Integration**: Chaos events are tagged and mapped against Prometheus metrics to measure recovery times.

---

## 🚀 2. Quick Start & Validation
To validate this chaos module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/chaos/framework
kubectl kustomize .
```

To apply an experiment manually (Use Caution!):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:C2410C&height=100&section=footer" width="100%" />
</p>
