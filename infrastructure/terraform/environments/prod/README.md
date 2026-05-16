<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8E2DE2,100:4A00E0&height=300&section=header&text=Production%20Environment&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">💎 Cloud Sentinel Production Infrastructure</h3>
<p align="center"><strong>"Immutable Foundation • Enterprise Governance • Zero-Trust Identity"</strong></p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Environment-Production-8E2DE2?style=for-the-badge&logo=opsgenie&logoColor=white" alt="Production" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Criticality-Tier_1-4A00E0?style=for-the-badge&logo=securityscorecard&logoColor=white" alt="Criticality" /></a>
  <a href="#"><img src="https://img.shields.io/badge/State-Remote_Locked-8E2DE2?style=for-the-badge&logo=terraform&logoColor=white" alt="Remote State" /></a>
</p>

---

The **Production Environment** directory serves as the primary deployment entrypoint for the Cloud Sentinel live infrastructure. It instantiates the platform's core modules with strict production-grade parameters, ensuring security, reliability, and cost-governance.

---

## 🛠️ 1. Infrastructure Stack
This environment orchestrates the following infrastructure modules:

*   **Networking**: Multi-AZ VPC with tiered subnets (implemented).
*   **IAM & Security**: IRSA for EKS, Least-Privilege service accounts (pending).
*   **EKS Control Plane**: Managed Kubernetes runtime with encryption (pending).
*   **Storage**: Encrypted EBS CSI and S3 disaster recovery (pending).

---

## 🔐 2. Remote State Management
Production state is strictly isolated from development and staging to prevent accidental blast-radius crossover.

*   **Bucket**: `cloud-sentinel-terraform-state-prod`
*   **Lock Table**: `cloud-sentinel-terraform-locks`
*   **Encryption**: AES-256 (At Rest), TLS (In Transit)

---

## 🏷️ 3. Tagging & FinOps Governance
All resources in this environment automatically inherit the following tags at the provider level:

| Tag Key | Value | Purpose |
| :--- | :--- | :--- |
| **Environment** | `prod` | Resource lifecycle tracking |
| **Project** | `cloud-sentinel` | Cost allocation |
| **CostCenter** | `engineering-core` | Showback / Chargeback |
| **Compliance** | `soc2` | Audit scoping |

---

## 🚀 4. Deployment Procedure
Access to this directory is strictly controlled. Follow the standard "Plan-then-Apply" workflow:

```bash
# 1. Initialize backend and fetch modules
terraform init

# 2. Generate a deterministic execution plan
terraform plan -out=tfplan

# 3. Apply the changes (Human approval required in CI)
terraform apply tfplan
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8E2DE2,100:4A00E0&height=100&section=footer" width="100%" />
</p>
