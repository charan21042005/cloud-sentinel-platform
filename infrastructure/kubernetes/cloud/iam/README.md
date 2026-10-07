<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EAB308,100:A16207&height=300&section=header&text=Cloud%20IAM%20and%20IRSA&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Cloud IAM & IRSA</h3>
<p align="center"><strong>"Native AWS Integration • IAM Least Privilege • Cloud-Native Storage"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Identity_&_Access-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-EAB308?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-A16207?style=for-the-badge&logo=passport&logoColor=white" alt="Environment" />
</p>

---

The **Cloud IAM & IRSA** module provides IAM Roles for Service Accounts (IRSA) bindings for zero-trust AWS access. This directory forms the critical bridge between abstract Kubernetes primitives and tangible AWS infrastructure components.

---

## 🏗️ 1. Architecture & Integration Decisions
We have engineered this component to securely extend the EKS boundary directly into the AWS control plane:
*   **Zero-Trust IAM**: Kubernetes ServiceAccounts are securely mapped to AWS IAM Roles via IRSA, completely eliminating long-lived credentials.
*   **Native Infrastructure**: Compute, storage, and networking layers are accelerated by native AWS CSI and CNI drivers.
*   **Cost & Performance**: Resources like EBS volumes are dynamically requested using fine-tuned GP3 StorageClasses to optimize AWS billing.

---

## 🚀 2. Quick Start & Validation
To validate this cloud module's configuration locally before a GitOps rollout, run:

```bash
cd infrastructure/kubernetes/cloud/iam
kubectl kustomize .
```

To forcefully apply bypassing ArgoCD (Emergency Only):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EAB308,100:A16207&height=100&section=footer" width="100%" />
</p>
