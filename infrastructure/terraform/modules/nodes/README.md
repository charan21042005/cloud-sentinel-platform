<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=300&section=header&text=EKS%20Worker%20Nodes&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ AWS Terraform Module: EKS Worker Nodes</h3>
<p align="center"><strong>"Infrastructure as Code • AWS Native • Secure By Default"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Compute_Resources-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Terraform-844FBA?style=for-the-badge&logo=terraform&logoColor=white" alt="Managed By Terraform" />
  <img src="https://img.shields.io/badge/Provider-AWS_Linux-047857?style=for-the-badge&logo=linux&logoColor=white" alt="Environment" />
</p>

---

The **Cloud Sentinel EKS Worker Nodes Module** provides EKS Managed Node Groups, Launch Templates, and EC2 instance profiles.

---

## 🏗️ 1. Architecture & Security Decisions
This Terraform module is built around strict AWS well-architected principles:
*   **Encrypted by Default**: All data at rest is encrypted using AWS KMS.
*   **Private Connectivity**: Resources are deployed to private subnets without direct internet ingress.
*   **Least Privilege IAM**: Policies are scoped strictly to the minimal permissions required.
*   **Modular Design**: Completely decoupled variables and outputs to support multi-environment deployments.

---

## 🚀 2. Quick Start & Validation
To validate this Terraform module locally before a pipeline execution, run:

```bash
cd infrastructure/terraform/modules/nodes
terraform init
terraform validate
```

> **⚠️ Note**: This module is designed to be called by an environment root (e.g., `environments/prod`), not applied directly.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=100&section=footer" width="100%" />
</p>
