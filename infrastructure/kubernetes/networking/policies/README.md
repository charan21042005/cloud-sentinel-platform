<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=300&section=header&text=Network%20Policies&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Network Policies</h3>
<p align="center"><strong>"Secure Boundaries • Traffic Optimization • Internal Routing"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Zero-Trust_Isolation-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-EF4444?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-B91C1C?style=for-the-badge&logo=cisco&logoColor=white" alt="Environment" />
</p>

---

The **Network Policies** module provides Strict internal subnetting and Calico/Cilium network boundaries. This module acts as the core nervous system for all microservice communication.

---

## 🏗️ 1. Architecture & Security Decisions
We have engineered this networking component to strictly enforce secure data flows:
*   **Encrypted Ingress**: All edge traffic is terminated securely with strict TLS profiles.
*   **Micro-Segmentation**: Explicit network boundaries isolate distinct application tiers, mitigating horizontal movement.
*   **Intelligent Routing**: Optimized pathing ensures minimal latency across services.

---

## 🚀 2. Quick Start & Validation
To validate this networking module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/networking/policies
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
