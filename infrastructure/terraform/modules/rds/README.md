<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=300&section=header&text=Relational%20Database&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🐘 AWS RDS PostgreSQL Architecture</h3>
<p align="center"><strong>"Managed Data • Secure Subnets • KMS Encryption"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/rds/"><img src="https://img.shields.io/badge/Service-Amazon_RDS-10B981?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Amazon RDS" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/Engine-PostgreSQL_16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-AWS_KMS_Encryption-047857?style=for-the-badge&logo=security&logoColor=white" alt="AWS KMS Encryption" /></a>
</p>

---

The **Cloud Sentinel RDS Module** provides a fully managed relational database backend for the platform. It places the PostgreSQL instance securely in isolated private subnets, ensuring that the database is entirely invisible to the public internet while securely serving the EKS workloads.

---

## 🏗️ 1. Architecture & Security Decisions
We have engineered this database layer to adhere strictly to defense-in-depth principles:
*   **Private Isolation**: The RDS instance is deployed into a dedicated `aws_db_subnet_group` tied exclusively to internal private data subnets. There is zero public internet ingress.
*   **KMS Encryption at Rest**: All underlying GP3 EBS volumes and automated snapshots are encrypted at rest using AWS KMS.
*   **RDS Managed Credentials**: By leveraging `manage_master_user_password`, the database master credentials are automatically rotated and securely stored inside AWS Secrets Manager. No plain-text passwords exist in the Terraform state.
*   **Security Group Egress/Ingress**: Ingress traffic on port `5432` is explicitly allowed *only* from the EKS cluster security group, ensuring that only authenticated EKS nodes can communicate with the database.

---

## 💰 2. Cost Optimization (FinOps Strategy)
This module makes deliberate architectural choices to maintain an extremely low cost profile for our academic/demo environment:
*   **Burstable Compute**: Utilizing the `db.t3.micro` instance class provides sufficient baseline performance while minimizing monthly compute expenditure.
*   **Single-AZ Deployment**: Running in a single Availability Zone avoids the duplicated compute and storage costs of Multi-AZ, which is acceptable for a temporary demo environment.
*   **GP3 Storage Profile**: Leveraging a minimal 20GB GP3 volume provides strong performance baselines without over-provisioning IOPS or throughput.
*   **Sensible Backups**: Automated backup retention is limited to 1 day, significantly reducing S3 snapshot storage costs.

---

## 🚀 3. Validation Commands
To validate the database infrastructure configuration and dependencies:

```bash
cd infrastructure/terraform/environments/prod/06-rds
terraform init
terraform validate
terraform plan
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10B981,100:047857&height=100&section=footer" width="100%" />
</p>
