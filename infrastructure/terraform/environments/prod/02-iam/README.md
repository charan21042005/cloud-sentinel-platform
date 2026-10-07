<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EAB308,100:A16207&height=300&section=header&text=Prod%20IAM&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ AWS Production State: Prod IAM</h3>
<p align="center"><strong>"Production Grade • Immutable Infrastructure • Verified State"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Identity_Management-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Terraform-844FBA?style=for-the-badge&logo=terraform&logoColor=white" alt="Managed By Terraform" />
  <img src="https://img.shields.io/badge/Environment-PROD_Passport-A16207?style=for-the-badge&logo=passport&logoColor=white" alt="Environment" />
</p>

---

The **Prod IAM Layer** provides Production-grade IAM roles with exact, least-privilege KMS and EKS access.

---

## 🏗️ 1. Architecture & Deployment Decisions
This is a live Production Terraform State directory. It instantiates the underlying modules with production values:
*   **Remote State**: State files are strictly locked and stored securely in the production AWS S3 bucket.
*   **Sequential Execution**: This is Layer `02-iam` and MUST be executed in numerical order relative to other layers.
*   **Strict Variables**: Hardcoded, peer-reviewed `terraform.tfvars` strictly define the boundaries of this production deployment.

---

## 🚀 2. Quick Start & Validation
To interact with this live production state (Requires valid AWS Prod Credentials):

```bash
cd infrastructure/terraform/environments/prod/02-iam
terraform init
terraform plan -out=tfplan
```

> **⚠️ DANGER**: Running `terraform apply` in this directory modifies live production infrastructure. Ensure you have approval.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EAB308,100:A16207&height=100&section=footer" width="100%" />
</p>
