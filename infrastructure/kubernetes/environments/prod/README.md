<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=300&section=header&text=Production%20Environment&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Production Environment</h3>
<p align="center"><strong>"Environment Parity • Kustomize Overlays • Isolated Topologies"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Production-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-EF4444?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Active-B91C1C?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Environment" />
</p>

---

The **Production Environment** module provides Hardened Kustomize overlays defining the highly-available, secure production cluster. This directory contains the final layer of configuration overrides before Kubernetes manifests are materialized by the GitOps controller.

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
cd infrastructure/kubernetes/environments/prod
kubectl kustomize .
```

To forcefully apply bypassing ArgoCD (Emergency Only):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=100&section=footer" width="100%" />
</p>
