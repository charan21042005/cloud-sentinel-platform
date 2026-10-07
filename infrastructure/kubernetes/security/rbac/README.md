<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F43F5E,100:BE123C&height=300&section=header&text=Role-Based%20Access&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Role-Based Access</h3>
<p align="center"><strong>"Zero-Trust Architecture • Least Privilege • Secure By Default"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Identity_&_Access-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-F43F5E?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-BE123C?style=for-the-badge&logo=passport&logoColor=white" alt="Environment" />
</p>

---

The **Role-Based Access** module provides Least-privilege ServiceAccounts and strictly bound API access roles. It hardens the Kubernetes environment by enforcing rigorous security boundaries and actively preventing unauthorized lateral movement.

---

## 🏗️ 1. Architecture & Security Decisions
We have engineered this component to strictly comply with zero-trust principles:
*   **Default Deny Boundaries**: Configurations inherently block all traffic or privileges unless explicitly whitelisted.
*   **Immutable Guardrails**: Security policies are declared as code and enforced via Kustomize prior to workload deployment.
*   **Attack Surface Reduction**: Minimal privileges ensure that even if a container is compromised, blast radius is contained.

---

## 🚀 2. Quick Start & Validation
To validate this security module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/security/rbac
kubectl kustomize .
```

To apply manually during an emergency:
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F43F5E,100:BE123C&height=100&section=footer" width="100%" />
</p>
