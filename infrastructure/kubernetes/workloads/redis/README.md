<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:DC2626,100:991B1B&height=300&section=header&text=Redis%20Cache&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Redis Cache</h3>
<p align="center"><strong>"Declarative Deployment • Scalable Architecture • Secure Isolation"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-State_Management-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-DC2626?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-991B1B?style=for-the-badge&logo=redis&logoColor=white" alt="Environment" />
</p>

---

The **Redis Cache** module provides In-memory datastore for fast session, token, and metric caching. It strictly isolates the deployment topology while seamlessly integrating into the broader GitOps pipeline.

---

## 🏗️ 1. Architecture & Security Decisions
We have engineered this workload to adhere strictly to defense-in-depth principles:
*   **Immutable Pods**: All container filesystems run securely as read-only.
*   **Minimal Privileges**: `runAsNonRoot` is enforced globally via Pod Security Contexts.
*   **Horizontal Scalability**: Fully pre-configured Horizontal Pod Autoscalers (HPA) ensure seamless traffic handling.
*   **Self-Healing**: Built-in readiness and liveness probes recover broken nodes natively.

---

## 🚀 2. Quick Start & Validation
To validate this workload's raw configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/workloads/redis
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:DC2626,100:991B1B&height=100&section=footer" width="100%" />
</p>
