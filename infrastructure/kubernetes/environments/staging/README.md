<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,100:B45309&height=300&section=header&text=Staging%20Environment&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Staging Environment</h3>
<p align="center"><strong>"Environment Parity • Kustomize Overlays • Isolated Topologies"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Pre-Production-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-F59E0B?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Active-B45309?style=for-the-badge&logo=gitkraken&logoColor=white" alt="Environment" />
</p>

---

The **Staging Environment** module provides Pre-production Kustomize overlays designed to strictly mirror production topologies. This directory contains the final layer of configuration overrides before Kubernetes manifests are materialized by the GitOps controller.

---

## 🏗️ 1. Architecture & Overlay Decisions
We use Kustomize exclusively to enforce strict environment isolation while preventing configuration drift:
*   **Base Inheritance**: This environment inherits directly from the immutable `base` layers, preventing code duplication.
*   **Strategic Patching**: Environment-specific resource limits, scaling bounds, and domain names are injected via targeted strategic-merge patches.
*   **Strict Promotion**: Manifests are promoted sequentially from Dev → Staging → Prod.

---

## 🚀 2. Quick Start & Validation
To validate this environment's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/environments/staging
kubectl kustomize .
```

To forcefully apply bypassing ArgoCD (Emergency Only):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,100:B45309&height=100&section=footer" width="100%" />
</p>
