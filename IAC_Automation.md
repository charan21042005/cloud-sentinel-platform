<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b09b,100:96c93d&height=300&section=header&text=Infrastructure%20as%20Code&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🤖 Phase 9: Infrastructure as Code (Terraform)</h3>
<p align="center"><strong>"Automating Cloud Infrastructure Like Real DevOps Engineers"</strong></p>
<p align="center"><strong>Terraform • S3 Remote State • Modules • Declarative Automation</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Automation-00b09b?style=for-the-badge" alt="Automation Phase" />
  <img src="https://img.shields.io/badge/Tool-Terraform-96c93d?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Standard-IaC-00b09b?style=for-the-badge" alt="Standard" />
</p>

---

## 🏗️ 9.0 Why Infrastructure Automation?

Before **IaC**, engineers manually clicked through the AWS console. This led to human errors and "Snowflake Servers" (servers that are unique and impossible to replicate).
*   **The Solution:** Infrastructure becomes **Code**. You write the definition, and the machine builds the reality.
*   **The Analogy:** Instead of building a house by hand every time, you create a **3D-Blueprint** and feed it into an automated construction robot.

---

## 🤖 9.2 What is Terraform?

Terraform (by HashiCorp) is the industry-standard tool for building cloud resources.
*   **Declarative vs. Imperative:**
    *   **Imperative:** "First create a VPC, then create a Subnet, then add an Instance."
    *   **Declarative (Terraform):** "I want 1 VPC and 1 EC2." (Terraform figures out the 'How').
*   **Why it wins:** It is **Cloud-Agnostic**. You can use the same logic for AWS, Azure, GCP, or even Kubernetes.

---

## 🔄 9.4 Terraform Architecture & Workflow

Terraform works by comparing your code to the actual cloud state.

### ⚡ The Standard Workflow:
1.  **`terraform init`**: Downloads the necessary plugins (AWS Providers).
2.  **`terraform plan`**: Previews exactly what will be created/destroyed (Safety first!).
3.  **`terraform apply`**: Executes the code and builds the infrastructure.

---

## 🧠 9.7 The State File: Terraform’s Memory

The `.tfstate` file is the "Long-Term Memory" of your infrastructure.
*   **The Risk:** If you lose this file, Terraform forgets what it built, leading to orphaned resources and billing nightmares.
*   **Industry Standard:** **Remote State**. We store this file in an **AWS S3 Bucket** with locking enabled so multiple teammates can’t break the infrastructure at once.

---

## 🧱 📂 Modular Architecture (The LEGO Model)

We don't put 500 lines of code in one file. We use **Modules** to keep things clean.

```text
terraform/
├── main.tf           # Entry point
├── variables.tf      # Environment settings
├── modules/
│   ├── vpc/          # Networking logic
│   ├── ec2/          # Compute logic
│   └── rds/          # Database logic
```

---

## 🛠️ 9.16 How OUR Platform is Automated

Terraform acts as the master automation engine for our cloud footprint. Instead of manual setup, Terraform will automatically provision:

*   ✅ **VPC & Subnets:** Establishes our isolated private network "neighborhood."
*   ✅ **Security Groups:** Configures the digital "Security Gates" to protect our services.
*   ✅ **EC2 & ECR:** Provisions our raw compute power and the registry for our container storage.
*   ✅ **IAM Roles:** Creates the secure "Digital Keys" that allow Jenkins to communicate with AWS safely.

---

## ⚖️ 9.17 Beginner vs. Industry IaC

| Feature | Beginner (Click-Ops) | Industry (Our Project) |
| :--- | :--- | :--- |
| **Creation** | Manual AWS Console clicks | **Automated Terraform Apply** |
| **Reproduction** | Hard to duplicate | **Instant Environment Duplication** |
| **History** | No record of changes | **Version-Controlled Infrastructure** |
| **Collaboration** | Single person only | **Remote State Collaboration** |

---

## 🧩 9.18 Mental Models for Terraform

To master Terraform, keep these three analogies in mind:
1.  **Blueprint:** The master architectural plan for our entire "Cloud City."
2.  **Robot Engineer:** You provide the high-level instructions; the robot builds the reality.
3.  **State Engine:** An persistent brain constantly ensuring that the **Cloud Reality** matches your **Code.**

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00b09b,100:96c93d&height=100&section=footer" width="100%" />
</p>