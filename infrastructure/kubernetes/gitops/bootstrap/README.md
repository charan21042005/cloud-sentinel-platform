<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=300&section=header&text=Cluster%20Bootstrap&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Cluster Bootstrap</h3>
<p align="center"><strong>"Git is Truth • Automated Synchronization • Policy as Code"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-App_of_Apps-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-ArgoCD-10B981?style=for-the-badge&logo=argo&logoColor=white" alt="Managed By ArgoCD" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-047857?style=for-the-badge&logo=linux&logoColor=white" alt="Environment" />
</p>

---

The **Cluster Bootstrap** module provides The root App of Apps pattern for initializing the cluster state. This directory defines the mechanisms that continuously synchronize our declarative repository state directly into the live cluster.

---

## 🏗️ 1. Architecture & GitOps Decisions
We have engineered this component to act as the autonomous operational core of the platform:
*   **Pull-Based Deployment**: ArgoCD continuously polls the Git repository, eliminating the need for push-based CI/CD credentials.
*   **Self-Healing**: Automatic drift detection and reconciliation forces the cluster to match the repository.
*   **App of Apps**: A hierarchical structure allows the entire platform to be provisioned by applying a single root application.

---

## 🚀 2. Quick Start & Validation
To validate this module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/gitops/bootstrap
kubectl kustomize .
```

To forcefully apply bypassing ArgoCD (Emergency Only):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=100&section=footer" width="100%" />
</p>
