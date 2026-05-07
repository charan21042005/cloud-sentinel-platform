<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF4E50,100:F9D423&height=300&section=header&text=AWS%20Cloud%20Infrastructure&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Phase 8: AWS Cloud Infrastructure</h3>
<p align="center"><strong>"Building Cloud Sentinel on a Global Scalable Foundation"</strong></p>
<p align="center"><strong>EC2 • VPC Networking • IAM Security • Cost Optimization</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-AWS-FF4E50?style=for-the-badge" alt="AWS Phase" />
  <img src="https://img.shields.io/badge/Provider-Amazon--Web--Services-F9D423?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Status-Cloud--Ready-FF4E50?style=for-the-badge" alt="Status" />
</p>

---

## 🏢 8.0 The Cloud Revolution

Before the cloud, companies had to buy physical hardware. Today, we rent **Infrastructure on Demand**.
*   **The Analogy:** Instead of buying your own power generator, you simply plug into the city's electricity grid.
*   **Our Project:** We use AWS because it is the industry gold standard for DevOps and scalable microservices.

---

## 💻 8.3 EC2: The Virtual Engines

**EC2 (Elastic Compute Cloud)** provides the raw "processing power" for our platform.
*   **The Role:** These are virtual servers that run our Docker containers and Kubernetes cluster.
*   **Student Strategy:** We use `t3.medium` or `t2.micro` instances to stay within the **Free Tier** while still demonstrating real-world compute power.

---

## 🔐 8.5 IAM: The Security Guard

**IAM (Identity & Access Management)** determines "who can touch what."
*   **Best Practice:** **Least Privilege Access**. We never give a service more power than it needs.
*   **Example:** Jenkins can push images to ECR, but it is strictly forbidden from deleting our PostgreSQL database.

---

## 🏘️ 8.8 VPC: The Gated Colony

A **VPC (Virtual Private Cloud)** is our private corner of the AWS cloud.
*   **Public Subnet:** Holds the **Load Balancer** so users can reach our UI.
*   **Private Subnet:** Holds our **Database (RDS)** and internal services.
*   **Security Rule:** Databases should *never* be exposed to the public internet.

---

## 🚦 8.13 Load Balancers: The Traffic Police

The **Application Load Balancer (ALB)** is the entry point for all users.
*   **Flow:** `User` ➔ `Route53 (DNS)` ➔ `ALB` ➔ `K8s Ingress` ➔ `Frontend Pod`.
*   **Benefit:** It ensures that even if one server fails, the traffic is automatically rerouted to a healthy one.

---

## 💰 AWS Cost Optimization (Student Guide)

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

## ⚖️ Beginner vs. Industry Cloud

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Setup** | Manual clicks in Console | **Infrastructure as Code (Terraform)** |
| **Networking** | All resources in Public Subnet | **VPC with Private/Public Subnets** |
| **Security** | Shared passwords/keys | **IAM Roles & Security Groups** |
| **Scaling** | Single server | **Autoscaling & Load Balancing** |

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF4E50,100:F9D423&height=100&section=footer" width="100%" />
</p>