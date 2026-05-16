<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:b92b27,100:1565C0&height=300&section=header&text=Identity%20&%20Security&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🛡️ AWS IAM & Security Governance Foundation</h3>
<p align="center"><strong>"Least Privilege • Zero-Trust Readiness • Cryptographic Integrity"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/iam/"><img src="https://img.shields.io/badge/Service-AWS_IAM-b92b27?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS IAM" /></a>
  <a href="https://aws.amazon.com/kms/"><img src="https://img.shields.io/badge/Encryption-AWS_KMS-1565C0?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS KMS" /></a>
  <a href="https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html"><img src="https://img.shields.io/badge/Governance-IRSA_Prepared-b92b27?style=for-the-badge&logo=springsecurity&logoColor=white" alt="IRSA" /></a>
</p>

---

The **Cloud Sentinel IAM Module** establishes the absolute security perimeter for the platform. By decoupling IAM generation from actual EKS deployment, we enforce a strict separation of concerns, ensuring roles and cryptographic keys are provisioned with extreme auditability before any compute is instantiated.

---

## 🏗️ 1. IAM Architecture & Least Privilege Model
We operate under a strict "Default-Deny" and "Least Privilege" enterprise model. There are no `AdministratorAccess` policies attached to any compute resource.

*   **Cluster Role**: Handcuffed to `eks.amazonaws.com`. It only possesses the permissions necessary to manage the raw AWS resources required by the Kubernetes control plane.
*   **Worker Node Role**: Handcuffed to `ec2.amazonaws.com`. It is only permitted to pull images from ECR (`AmazonEC2ContainerRegistryReadOnly`) and attach to the VPC (`AmazonEKS_CNI_Policy`).
*   **Karpenter Node Role**: Prepared specifically for our future Just-In-Time (JIT) compute elasticity. We included `AmazonSSMManagedInstanceCore` to completely eradicate the need for SSH keys. Engineers will access nodes entirely via audited AWS Systems Manager (SSM) sessions.

---

## 🔑 2. IRSA Strategy & OIDC Preparation
In traditional legacy architectures, EC2 nodes are granted blanket IAM permissions (e.g., granting all pods the ability to read S3). **This is banned in Cloud Sentinel.**

Instead, we are preparing for **IAM Roles for Service Accounts (IRSA)**. 
1.  Once the EKS cluster is provisioned (Phase 4), it will generate an OpenID Connect (OIDC) Issuer URL.
2.  We will feed that OIDC URL back into the IAM stack.
3.  This allows us to grant an IAM role to a *specific Kubernetes Pod* (like Velero or External Secrets), rather than an entire physical server.

---

## 🔒 3. Cryptographic Governance (KMS)
By default, Kubernetes stores `Secrets` (like database passwords) as base64-encoded strings inside etcd. This is a critical security vulnerability. 

We have provisioned the `cloud-sentinel-eks-secrets` Customer Managed Key (CMK) via AWS KMS. When EKS is deployed, it will use this key to perform **Envelope Encryption**. Even if an attacker physically steals the underlying etcd hard drives, the secrets are cryptographically shredded and useless without IAM access to KMS.

---

## 💰 4. FinOps & Cost Impact
This phase continues our commitment to the student/demo budget constraints:
*   **IAM Roles/Policies**: **$0.00 / month** (IAM is a free service globally).
*   **AWS KMS Key**: **$1.00 / month** (for the key itself) + tiny fraction of a cent per 10,000 encryption requests.
*   **AWS Security Hub / GuardDuty**: We specifically *avoided* turning these on in Terraform, as they would immediately violate the $100 budget constraint.

---

## 🚀 5. Validation Commands
To validate the security boundaries and ensure no syntax errors exist in the IAM policies:

```bash
cd infrastructure/terraform/environments/prod
terraform init
terraform validate
terraform plan
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:b92b27,100:1565C0&height=100&section=footer" width="100%" />
</p>
