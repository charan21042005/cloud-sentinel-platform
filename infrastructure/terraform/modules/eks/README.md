<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F7931A,100:FFB84D&height=300&section=header&text=EKS%20Control%20Plane&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🛳️ AWS EKS Control Plane Architecture</h3>
<p align="center"><strong>"Managed Orchestration • Encrypted State • FinOps Logging Boundaries"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/eks/"><img src="https://img.shields.io/badge/Service-Amazon_EKS-F7931A?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Amazon EKS" /></a>
  <a href="https://kubernetes.io/"><img src="https://img.shields.io/badge/Version-v1.28-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-KMS_Envelope-1565C0?style=for-the-badge&logo=security&logoColor=white" alt="KMS Encryption" /></a>
</p>

---

The **Cloud Sentinel EKS Module** establishes the managed Kubernetes Control Plane. By deploying this via native modular Terraform, we guarantee that the "Brain" of the platform is strictly integrated with our previously established IAM roles and private VPC subnets.

---

## 🏗️ 1. Architecture & Security Decisions
We have intentionally designed this control plane to maximize security while minimizing unnecessary overhead:
*   **Private Subnet Integration**: The Elastic Network Interfaces (ENIs) for the Control Plane are statically pinned to the `private_app` subnets created in Phase 2. This ensures the master nodes are invisible to the public internet.
*   **API Endpoint Access**: We enabled both `private_access` and `public_access`. While pure enterprise limits to private only, enabling public allows student/demo workstations to authenticate via `kubectl` without requiring an expensive AWS Client VPN setup.
*   **KMS Envelope Encryption**: All Kubernetes `Secrets` are transparently encrypted at rest inside `etcd` utilizing the Customer Managed Key (CMK) generated in Phase 3.

---

## 💰 2. Cost Optimization (FinOps Strategy)
A naked EKS cluster runs ~$73/month. To prevent secondary costs from spiraling, we enforced strict FinOps logic:
*   **Audit Logging Only**: AWS charges heavily for CloudWatch ingestion. We explicitly disabled all control plane logs except for `audit`. This satisfies SOC2 compliance without paying for unnecessary scheduler/controller telemetry.
*   **Aggressive Retention**: By default, AWS CloudWatch stores logs indefinitely. I enforced a strict `7-day` retention policy on the `/aws/eks/<cluster_name>/cluster` Log Group to permanently cap storage costs.

---

## 🔑 3. Identity Federation (OIDC/IRSA)
To prepare for native application security, this module natively hooks into the EKS Identity Provider.
*   It automatically extracts the cluster's internal TLS Certificate Thumbprint.
*   It generates an `aws_iam_openid_connect_provider`.
*   This immediately unblocks Phase 5, allowing us to assign IAM roles directly to Kubernetes Service Accounts instead of entire EC2 nodes.

---

## 🚀 4. Interaction & Validation
After applying this module, you can inject the cluster credentials into your local machine using the AWS CLI:

```bash
# Update local kubeconfig to communicate with the newly provisioned Control Plane
aws eks update-kubeconfig --region us-east-1 --name cloud-sentinel-prod
```

### ⚠️ Destroy Workflow Guidance
Because EKS creates Elastic Network Interfaces (ENIs) dynamically within the subnets, you must wait ~15 minutes if you ever run `terraform destroy`. Attempting to delete the VPC immediately after the Cluster will fail until AWS internally releases the associated IP addresses.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F7931A,100:FFB84D&height=100&section=footer" width="100%" />
</p>
