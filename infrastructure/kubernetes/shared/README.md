<div align="center">
  <img src="https://img.shields.io/badge/Shared_Resources-A855F7?style=for-the-badge&logo=share&logoColor=white" alt="Shared Resources" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Architecture-Common_Configuration-blue?style=flat-square" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Kustomize-026e00?style=flat-square&logo=kubernetes" alt="Managed By Kustomize" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-success?style=flat-square" alt="Environment" />
</div>

<br />

# 🚀 Shared Resources

> **Shared configurations, ConfigMaps, and cross-boundary secrets.**

---

## 📋 Overview
This directory contains the declarative Kubernetes definitions for **Shared Resources** within the Cloud Sentinel Platform. Engineered for maximum portability, scalability, and resilience, these configurations adhere strictly to GitOps principles and zero-trust security models.

## 🏗️ Core Architecture
The resources within this module are grouped into logical components to provide Common Configuration:

* **Declarative Immutability**: All resources are strictly defined in YAML.
* **Kustomize Overlays**: Built natively to integrate with Kustomize bases and environment-specific patches.
* **GitOps Synchronization**: Fully compatible with ArgoCD for continuous reconciliation.

## ⚙️ Components
Inside this module, you will find:
- Core Kubernetes Primitives (Deployments, Services, ConfigMaps)
- Environment-specific tuning patches (if applicable)
- Resource allocation and scaling policies

## 🚀 Quick Start

### 1️⃣ Validation (Dry Run)
Before committing changes to this directory, validate the rendering locally:
```bash
kubectl kustomize .
```

### 2️⃣ Application (Manual/Emergency)
While ArgoCD handles standard deployments, emergency manual applies can be executed via:
```bash
kubectl apply -k .
```
> **⚠️ WARNING**: Manual applies will be eventually overwritten by the GitOps controller if they drift from the source of truth!

## 🛡️ Operational Best Practices
- **Never hardcode secrets** in these manifests. Always rely on `ExternalSecrets` integration.
- Ensure that any new components respect the global `PodSecurityStandards`.
- Use relative paths when referencing bases in Kustomize.

---
<div align="center">
  <i>Maintained by the Cloud Sentinel Platform Team</i>
</div>
