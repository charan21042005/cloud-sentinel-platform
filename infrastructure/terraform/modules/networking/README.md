<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c6ff,100:0072ff&height=300&section=header&text=Cloud%20Networking&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🌐 AWS Networking Foundation Module</h3>
<p align="center"><strong>"Multi-AZ Resilience • Tiered Subnet Isolation • FinOps Optimized"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/vpc/"><img src="https://img.shields.io/badge/Service-AWS_VPC-00c6ff?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS VPC" /></a>
  <a href="https://aws.amazon.com/vpc/pricing/"><img src="https://img.shields.io/badge/Pricing-Cost_Aware-0072ff?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Cost Aware" /></a>
  <a href="https://kubernetes.io/docs/concepts/cluster-administration/networking/"><img src="https://img.shields.io/badge/Target-EKS_Optimized-00c6ff?style=for-the-badge&logo=kubernetes&logoColor=white" alt="EKS Optimized" /></a>
</p>

---

The **Networking Foundation Module** provides the physical communication layer for the Cloud Sentinel platform. It is engineered to provide production-grade isolation and high availability while maintaining a minimal cost footprint for demo environments.

---

## 🏗️ 1. Subnet Topology & CIDR Strategy
We utilize a **Tiered Subnet Design** spanning **3 Availability Zones** to ensure the platform remains resilient against single-zone failures.

| Tier | CIDR Mask | Purpose | Internet Access |
| :--- | :--- | :--- | :--- |
| **Public** | `/24` | Load Balancers, NAT Gateway | Direct (via IGW) |
| **Private App** | `/20` | **EKS Worker Nodes**, Karpenter | Egress-Only (via NAT) |
| **Private Data** | `/24` | RDS, Redis, Stateful Sets | No Direct Access |

---

## 💰 2. Cost Governance Features
To keep infrastructure spend within a student/demo budget, this module implements the following:
*   **Single NAT Gateway**: Consolidates egress traffic from all 3 AZs into a single gateway, saving ~$70/month compared to a standard HA setup.
*   **S3 Gateway Endpoint**: Routes all S3 traffic (image pulls, logs) through a **free** VPC endpoint instead of the paid NAT Gateway, eliminating data processing fees.
*   **Elastic IP Reuse**: Ensures static IPs are managed efficiently to avoid idle EIP charges.

---

## 🏷️ 3. Kubernetes & Karpenter Integration
Subnets are automatically tagged with metadata required for the AWS Load Balancer Controller and Karpenter:
*   `kubernetes.io/role/elb = 1`: Discovers public subnets for external ALBs.
*   `kubernetes.io/role/internal-elb = 1`: Discovers private subnets for internal ALBs.
*   `karpenter.sh/discovery = <cluster_name>`: Allows Karpenter to dynamically provision nodes into the App tier.

---

## 🚀 4. Usage Example
```hcl
module "networking" {
  source = "../../modules/networking"

  environment        = "prod"
  cluster_name       = "cloud-sentinel-prod"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

  public_subnets       = ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]
  private_app_subnets  = ["10.0.16.0/20", "10.0.32.0/20", "10.0.48.0/20"]
  private_data_subnets = ["10.0.64.0/24", "10.0.65.0/24", "10.0.66.0/24"]
}
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c6ff,100:0072ff&height=100&section=footer" width="100%" />
</p>
