<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:0369A1&height=300&section=header&text=Cloud%20Autoscaling&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Cloud Autoscaling</h3>
<p align="center"><strong>"Native AWS Integration • IAM Least Privilege • Cloud-Native Storage"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Infrastructure_Elasticity-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-0EA5E9?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-0369A1?style=for-the-badge&logo=amazonwebservices&logoColor=white" alt="Environment" />
</p>

---

The **Cloud Autoscaling** module provides Karpenter and Cluster Autoscaler configs mapped strictly to AWS ASGs. This directory forms the critical bridge between abstract Kubernetes primitives and tangible AWS infrastructure components.

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
cd infrastructure/kubernetes/cloud/autoscaling
kubectl kustomize .
```

To forcefully apply bypassing ArgoCD (Emergency Only):
```bash
kubectl apply -k .
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:0369A1&height=100&section=footer" width="100%" />
</p>
