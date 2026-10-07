<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=300&section=header&text=Nginx%20Ingress&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Nginx Ingress</h3>
<p align="center"><strong>"Secure Boundaries • Traffic Optimization • Internal Routing"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Cluster_Ingress-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-10B981?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-047857?style=for-the-badge&logo=nginx&logoColor=white" alt="Environment" />
</p>

---

The **Nginx Ingress** module provides Nginx ingress configurations serving internal cluster traffic. This module acts as the core nervous system for all microservice communication.

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
cd infrastructure/kubernetes/networking/ingress-nginx
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=100&section=footer" width="100%" />
</p>
