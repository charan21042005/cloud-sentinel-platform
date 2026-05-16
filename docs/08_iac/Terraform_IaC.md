<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:5C4EE5,100:000000&height=300&section=header&text=Infrastructure%20as%20Code&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🏗️ Phase 12: Terraform & IaC</h3>
<p align="center"><strong>"Coding the Infrastructure of Cloud Sentinel"</strong></p>
<p align="center"><strong>Providers • State Management • Modules • Declarative Syntax</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-IaC-5C4EE5?style=for-the-badge&logoColor=white" alt="IaC Phase" />
  <img src="https://img.shields.io/badge/Tool-Terraform-623CE4?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Method-Declarative-5C4EE5?style=for-the-badge&logoColor=white" alt="Method" />
</p>

---

## 📑 Table of Contents
* [12.1 What is Infrastructure as Code (IaC)?](#-121-what-is-infrastructure-as-code-iac)
* [12.2 Why Terraform?](#-122-why-terraform)
* [12.3 The Declarative Workflow](#-123-the-declarative-workflow)
* [12.4 Providers & Resources](#-124-providers--resources)
* [12.5 The "State" File: The Source of Truth](#-125-the-state-file-the-source-of-truth)
* [12.6 Modules: Reusable Infrastructure](#-126-modules-reusable-infrastructure)
* [12.7 Beginner vs. Industry IaC Practices](#-127-beginner-vs-industry-iac-practices)
* [12.8 Mental Models for Terraform](#-128-mental-models-for-terraform)

---

## 🏗️ 12.1 What is Infrastructure as Code (IaC)?

In the past, engineers created servers by clicking buttons in a web console. This was slow, prone to errors, and impossible to track.
*   **The Solution:** Writing code to define your hardware.
*   **The Advantage:** Your infrastructure can now be **version-controlled** in Git, just like your application code. If you need 10 more servers, you change a number in a file—you don't click 100 buttons.

---

## 🌍 12.2 Why Terraform?

**Terraform** is the industry standard for IaC because it is **Platform Agnostic**.
*   **Multi-Cloud:** You can use the same language (HCL - HashiCorp Configuration Language) to manage AWS, Azure, Google Cloud, and even GitHub or Cloudflare.
*   **The Analogy:** A **Universal Remote Control** for the entire cloud.

---

## 🔄 12.3 The Declarative Workflow

Unlike Python or Java, Terraform is **Declarative**.
*   **Imperative (Python):** "Go to the kitchen, open the fridge, get a soda." (Step-by-step).
*   **Declarative (Terraform):** "I want a cold soda on the table." (State the goal; Terraform figures out how to make it happen).

### 🛠️ The Core Commands:
1.  **`terraform init`:** Download the AWS plugins.
2.  **`terraform plan`:** Show me a preview of what will change.
3.  **`terraform apply`:** Execute the changes and build the infrastructure.

---

## 🔌 12.4 Providers & Resources

*   **Providers:** Plugins that tell Terraform how to talk to specific APIs (e.g., the AWS Provider).
*   **Resources:** The actual components you want to build (e.g., `aws_vpc`, `aws_instance`, `aws_db_instance`).

---

## 💾 12.5 The "State" File: The Source of Truth

Terraform keeps a file called `terraform.tfstate`.
*   **Purpose:** It acts as the "Memory" of your infrastructure. It knows exactly what exists in AWS and compares it to your code every time you run a command.
*   **Industry Warning ⚠️:** Never lose or manually edit this file. It is the "Brain" of your deployment.

---

## 🧩 12.6 Modules: Reusable Infrastructure

As projects grow, we avoid "spaghetti code" by using **Modules**.
*   **Concept:** Grouping related resources into a folder (e.g., a "VPC Module" that creates subnets, gateways, and routing).
*   **Benefit:** We can reuse the same VPC code for "Development," "Staging," and "Production" environments with 100% consistency.

---

## ⚖️ 12.7 Beginner vs. Industry IaC Practices

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Method** | Manual Console Clicks | **100% Terraform Code** |
| **State** | Local State File | **Remote S3 State (Locking)** |
| **Structure** | One giant file | **Modular Architecture** |
| **Reproducibility** | "It works on my PC" | **Multi-Environment Ready** |

---

## 🏗️ 12.8 Real-World Implementation (Our Project)

In this project, we have fully transitioned from theoretical IaC to a **Production-Grade Implementation**. You can explore our physical Terraform architecture here:

*   **[Core Architecture & Bootstrap](../../infrastructure/terraform/README.md)**: Details our S3 remote state and DynamoDB locking.
*   **[Multi-AZ Networking](../../infrastructure/terraform/modules/networking/README.md)**: The VPC, Subnets, and NAT Gateway implementation.
*   **[IAM & Security Governance](../../infrastructure/terraform/modules/iam/README.md)**: Least-privilege roles and KMS encryption.
*   **[Amazon EKS Control Plane](../../infrastructure/terraform/modules/eks/README.md)**: The Kubernetes orchestration engine.

---

## 🧩 12.8 Mental Models for Terraform
1.  **Blueprint:** The code defines the building; Terraform is the builder.
2.  **Wishlist:** You list what you want, and Terraform goes shopping for it.
3.  **Universal Remote:** One tool to control every cloud provider.

---

## Continue the Cloud-Native Journey 🚀

> "Infrastructure is now code. Now, let's learn how to automate the build and deployment of this infrastructure using our Jenkins CI/CD Pipeline."

**Previous Module:**
← [AWS Cloud Infrastructure](../07_cloud_infrastructure/AWS_Cloud_Infrastructure.md)

**Next Module:**
→ [Jenkins CI/CD Engineering](../09_cicd/CICD_Engineering.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:5C4EE5,100:000000&height=100&section=footer" width="100%" />
</p>