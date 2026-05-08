<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF4E50,100:F9D423&height=300&section=header&text=AWS%20Cloud%20Infrastructure&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Phase 11: AWS Cloud Infrastructure</h3>
<p align="center"><strong>"Building Cloud Sentinel on a Global Scalable Foundation"</strong></p>
<p align="center"><strong>EC2 • VPC Networking • IAM Security • Cost Optimization</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-AWS-FF4E50?style=for-the-badge" alt="AWS Phase" />
  <img src="https://img.shields.io/badge/Provider-Amazon--Web--Services-F9D423?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Status-Cloud--Ready-FF4E50?style=for-the-badge" alt="Status" />
</p>

---

## 📑 Table of Contents
* [11.1 The Cloud Revolution](#-111-the-cloud-revolution)
* [11.2 EC2: The Virtual Engines](#-112-ec2-the-virtual-engines)
* [11.3 IAM: The Security Guard](#-113-iam-the-security-guard)
* [11.4 VPC: The Gated Colony](#-114-vpc-the-gated-colony)
* [11.5 Load Balancers: The Traffic Police](#-115-load-balancers-the-traffic-police)
* [11.6 AWS Cost Optimization](#-116-aws-cost-optimization-student-guide)
* [11.7 Beginner vs. Industry Cloud](#-117-beginner-vs-industry-cloud)

---

## 🏢 11.1 The Cloud Revolution

Before the cloud, companies had to buy physical hardware. Today, we rent **Infrastructure on Demand**.
*   **The Analogy:** Instead of buying your own power generator, you simply plug into the city's electricity grid.
*   **Our Project:** We use AWS because it is the industry gold standard for DevOps and scalable microservices.

---

## 💻 11.2 EC2: The Virtual Engines

**EC2 (Elastic Compute Cloud)** provides the raw "processing power" for our platform.
*   **The Role:** These are virtual servers that run our Docker containers and Kubernetes cluster.
*   **Student Strategy:** We use `t3.medium` or `t2.micro` instances to stay within the **Free Tier** while still demonstrating real-world compute power.

---

## 🔐 11.3 IAM: The Security Guard

**IAM (Identity & Access Management)** determines "who can touch what."
*   **Best Practice:** **Least Privilege Access**. We never give a service more power than it needs.
*   **Example:** Jenkins can push images to ECR, but it is strictly forbidden from deleting our PostgreSQL database.

---

## 🏘️ 11.4 VPC: The Gated Colony

A **VPC (Virtual Private Cloud)** is our private corner of the AWS cloud.
*   **Public Subnet:** Holds the **Load Balancer** so users can reach our UI.
*   **Private Subnet:** Holds our **Database (RDS)** and internal services.
*   **Security Rule:** Databases should *never* be exposed to the public internet.

---

## 🚦 11.5 Load Balancers: The Traffic Police

The **Application Load Balancer (ALB)** is the entry point for all users.
*   **Flow:** `User` ➔ `Route53 (DNS)` ➔ `ALB` ➔ `K8s Ingress` ➔ `Frontend Pod`.
*   **Benefit:** It ensures that even if one server fails, the traffic is automatically rerouted to a healthy one.

---

## 💰 11.6 AWS Cost Optimization (Student Guide)

Managed services like **EKS** or **NAT Gateways** can burn a $100 credit in days. We use a "Smart Student Architecture":

| Service | Strategy | Cost Impact |
| :--- | :--- | :--- |
| **Kubernetes** | Use **k3s** on a single EC2 instead of managed EKS. | Saves ~$70/mo |
| **Database** | Run Postgres as a container or use RDS Free Tier. | $0 |
| **Compute** | Stick to `t3.medium` (or lower) and **Stop EC2** when idle. | High Savings |

### 🛠️ Billing Safety Checklist:
* [ ] **Set Billing Alerts:** Get notified the moment you spend $5.
* [ ] **Use Tags:** Tag everything with `Project=CloudSentinel`.
* [ ] **Delete Unused:** Clean up abandoned Elastic IPs and EBS volumes.

---

## ⚖️ 11.7 Beginner vs. Industry Cloud

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Setup** | Manual clicks in Console | **Infrastructure as Code (Terraform)** |
| **Networking** | All resources in Public Subnet | **VPC with Private/Public Subnets** |
| **Security** | Shared passwords/keys | **IAM Roles & Security Groups** |
| **Scaling** | Single server | **Autoscaling & Load Balancing** |

---

## Continue the Cloud-Native Journey 🚀

> "AWS provides the raw power and networking. Now, let's learn how to manage this massive cloud landscape automatically using Terraform: Infrastructure as Code."

**Previous Module:**
← [Kubernetes Deep Dive](../06_kubernetes/Kubernetes_Deep_Dive.md)

**Next Module:**
→ [Terraform IaC](../08_iac/Terraform_IaC.md)

## Cloud Sentinel Platform Documentation Series

---

## Cloud Sentinel Platform — Production-Grade Cloud-Native DevOps & Observability Engineering Documentation

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF4E50,100:F9D423&height=100&section=footer" width="100%" />
</p>