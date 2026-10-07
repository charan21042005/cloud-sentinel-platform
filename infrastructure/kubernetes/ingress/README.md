<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:C2410C&height=300&section=header&text=Ingress%20Routing&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Ingress Routing Architecture</h3>
<p align="center"><strong>"Declarative Immutability • GitOps Synchronization • Zero-Trust"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Traffic_Management-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-F97316?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-C2410C?style=for-the-badge&logo=nginx&logoColor=white" alt="Environment" />
</p>

---

The **Cloud Sentinel Ingress Routing Module** provides Nginx Ingress controllers and core routing configurations. It places the resources securely within isolated Kustomize structures, ensuring that the Kubernetes manifests are completely declarative and easy to audit.

---

## 🏗️ 1. Architecture & Security Decisions
We have engineered this Kubernetes layer to adhere strictly to defense-in-depth principles:
*   **Declarative Infrastructure**: All components are fully defined in code, ensuring absolute drift protection when synchronized via ArgoCD.
*   **Kustomize Native**: Built natively to integrate with Kustomize bases and environment-specific patches, avoiding redundant code.
*   **Role-Based Access Control**: Pod Security Standards (PSS) and native RBAC are inherently supported across all deployments.
*   **No Hardcoded Secrets**: Secrets are entirely decoupled using ExternalSecrets.

---

## 🚀 2. Quick Start & Validation
To validate the configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/ingress
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,100:C2410C&height=100&section=footer" width="100%" />
</p>
