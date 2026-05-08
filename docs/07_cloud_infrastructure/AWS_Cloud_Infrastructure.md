<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF9900,100:000000&height=300&section=header&text=AWS%20Infrastructure&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Phase 11: AWS Cloud Infrastructure</h3>
<p align="center"><strong>"Building the Global Foundation of Cloud Sentinel"</strong></p>
<p align="center"><strong>VPC • EC2 • RDS • ECR • IAM Security</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Cloud--Infra-FF9900?style=for-the-badge&logoColor=white" alt="Cloud Phase" />
  <img src="https://img.shields.io/badge/Provider-AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/Security-IAM-FF9900?style=for-the-badge&logoColor=white" alt="IAM" />
</p>

---

## 📑 Table of Contents
* [11.1 Why AWS (Amazon Web Services)?](#-111-why-aws-amazon-web-services)
* [11.2 Networking: The VPC Blueprint](#-112-networking-the-vpc-blueprint)
* [11.3 Compute: EC2 vs. EKS](#-113-compute-ec2-vs-eks)
* [11.4 Storage & Databases: RDS & S3](#-114-storage--databases-rds--s3)
* [11.5 Security: The IAM Policy Engine](#-115-security-the-iam-policy-engine)
* [11.6 Registry: ECR (Elastic Container Registry)](#-116-registry-ecr-elastic-container-registry)
* [11.7 Beginner vs. Industry AWS Architecture](#-117-beginner-vs-industry-aws-architecture)
* [11.8 Mental Models for AWS](#-118-mental-models-for-aws)

---

## ☁️ 11.1 Why AWS (Amazon Web Services)?

Building a data center is expensive and slow. **AWS** provides "Infrastructure as a Service"—renting computing power on demand.
*   **The Advantage:** Global reach, infinite scaling, and pay-as-you-go pricing.
*   **The Industry Context:** AWS is the market leader. Mastering it means you are building on the same platform as Netflix, NASA, and Salesforce.

---

## 🕸️ 11.2 Networking: The VPC Blueprint

Before we launch servers, we build a **VPC (Virtual Private Cloud)**—our own isolated slice of the Amazon cloud.
*   **Subnets:** Dividing our network into **Public** (facing the internet) and **Private** (hidden and secure).
*   **Security Groups:** Digital "Firewalls" that only allow specific traffic (e.g., only allowing Port 443 for HTTPS).

---

## 🏗️ 11.3 Compute: EC2 vs. EKS

*   **EC2 (Elastic Compute Cloud):** Standard virtual servers. We use these for our Jenkins automation server.
*   **EKS (Elastic Kubernetes Service):** A managed Kubernetes cluster. AWS handles the "Master Node" management, so we only focus on our application code.

---

## 🗄️ 11.4 Storage & Databases: RDS & S3

*   **RDS (Relational Database Service):** Managed PostgreSQL. It handles backups, patching, and failover automatically.
*   **S3 (Simple Storage Service):** Unlimited storage for static assets and logs. It is the "Hard Drive of the Internet."

---

## 🔐 11.5 Security: The IAM Policy Engine

In AWS, **IAM (Identity and Access Management)** is the most critical service.
*   **Principle of Least Privilege:** We never give a user or service more access than it needs.
*   **Example:** Our Jenkins server can *push* to ECR but cannot *delete* our Database.

---

## 📦 11.6 Registry: ECR (Elastic Container Registry)

Our Docker images must be stored somewhere secure before Kubernetes can run them.
*   **The Workflow:** Developer ➔ Jenkins ➔ **AWS ECR** ➔ Kubernetes.
*   **Security:** ECR automatically scans our images for vulnerabilities like malware or outdated libraries.

---

## ⚖️ 11.7 Beginner vs. Industry AWS Architecture

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Networking** | Default VPC (No isolation) | **Custom VPC (Public/Private Subnets)** |
| **Database** | Installed on Server | **Managed RDS (High Availability)** |
| **Security** | Root User / Broad Access | **IAM Roles & Least Privilege** |
| **Scaling** | Fixed size | **Auto-Scaling Groups (ASG)** |

---

## 🧩 11.8 Mental Models for AWS
1.  **Virtual Real Estate:** Renting land (VPC) and building structures (EC2/RDS).
2.  **Lego Bricks:** Modular services that connect together to build a complex system.
3.  **Security Guard:** IAM checking the badge of every request.

---

## Continue the Cloud-Native Journey 🚀

> "The cloud foundation is set. Now, instead of clicking buttons in the AWS Console, let's learn how to write our infrastructure as code using Terraform."

**Previous Module:**
← [Kubernetes Deep Dive](../06_kubernetes/Kubernetes_Deep_Dive.md)

**Next Module:**
→ [Terraform IaC](../08_iac/Terraform_IaC.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF9900,100:000000&height=100&section=footer" width="100%" />
</p>