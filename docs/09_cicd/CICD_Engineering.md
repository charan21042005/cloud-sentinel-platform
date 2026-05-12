<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f46b45,100:eea849&height=300&section=header&text=GitHub%20Actions%20CI/CD&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🚀 Phase 13: GitHub Actions CI/CD Engineering</h3>
<p align="center"><strong>"The Automated Assembly Line of Cloud Sentinel"</strong></p>
<p align="center"><strong>Pipeline as Code • GitHub Webhooks • Build • Scan • Deploy</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-CICD-f46b45?style=for-the-badge&logoColor=white" alt="CICD Phase" />
  <img src="https://img.shields.io/badge/Tool-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Method-Automated-f46b45?style=for-the-badge&logoColor=white" alt="Method" />
</p>

---

## 📑 Table of Contents
* [13.1 What is CI/CD?](#-131-what-is-cicd)
* [13.2 GitHub Actions: The Modern Workhorse](#-132-github-actions-the-modern-workhorse)
* [13.3 Pipeline as Code (YAML Workflows)](#-133-pipeline-as-code-yaml-workflows)
* [13.4 The Multi-Stage Workflow](#-134-the-multi-stage-workflow)
* [13.5 Event Triggers: Real-Time Integration](#-135-event-triggers-real-time-integration)
* [13.6 Artifact Management: Docker & ECR](#-136-artifact-management-docker--ecr)
* [13.7 Beginner vs. Industry Automation](#-137-beginner-vs-industry-automation)
* [13.8 Mental Models for CI/CD](#-138-mental-models-for-cicd)

---

## 🏎️ 13.1 What is CI/CD?

In the old days, software was manually uploaded to servers. This was slow and buggy.
*   **Continuous Integration (CI):** Every time a developer saves code, it is automatically merged and **Tested**.
*   **Continuous Delivery (CD):** Every valid change is automatically **Built** and **Deployed** to the cloud.
*   **The Advantage:** High velocity. You can deploy 10 times a day without fear of breaking the system.

---

## ⚙️ 13.2 GitHub Actions: The Modern Workhorse

**GitHub Actions** is a cloud-native automation engine natively integrated into GitHub. It acts as the "Manager" of our entire software lifecycle.
*   **The Role:** It watches our repository, runs our Vitest suites, builds Docker images using Buildx cache, and commands Kubernetes to update.
*   **Why GitHub Actions?** Unlike legacy tools that require provisioning and maintaining dedicated servers, Actions provides zero-maintenance, serverless runners with deep Git context out-of-the-box.

---

## 📜 13.3 Pipeline as Code (YAML Workflows)

We don't configure our pipeline by clicking buttons; we write declarative **YAML workflows**.
*   **Concept:** The entire build logic is written in `.github/workflows/sentinel-pipeline.yml`.
*   **Benefit:** The pipeline itself is version-controlled alongside the code. If the build process changes, we can trace exactly who changed it and why.

---

## 🏗️ 13.4 The Multi-Stage Workflow

Our pipeline is divided into logical, dependent "Stages" (Jobs) to catch errors early:
1.  **Checkout:** Pull the latest code using `actions/checkout`.
2.  **Test & Verify:** Run Vitest coverage suites and strict Next.js production dry-run builds. If they fail, the pipeline instantly halts.
3.  **Setup Buildx:** Initialize Docker's advanced caching engines to drastically speed up compilation.
4.  **Build & Push:** Compile the Docker image and push it to a secure Container Registry (GHCR/AWS ECR).
5.  **Deploy:** Authenticate securely to the Kubernetes cluster and apply the new rolling deployment manifests.

---

## ⚓ 13.5 Event Triggers: Real-Time Integration

We use **GitHub Push Events** to make the system feel "alive."
*   **The Flow:** Developer pushes code to `main` $\rightarrow$ GitHub detects the event $\rightarrow$ The runner instantly spins up and starts the assembly line.
*   **Result:** Zero manual effort between writing code and seeing it securely deployed in production.

---

## ⚖️ 13.7 Beginner vs. Industry Automation

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Method** | Manual Drag-and-Drop | **100% Automated YAML Pipeline** |
| **Testing** | "I'll test it later" | **Automated Vitest/Coverage Matrix** |
| **Hosting** | Maintaining Jenkins Servers | **Serverless GitHub Runners** |
| **Feedback** | No notification | **Visual Status Checks on PRs** |

---

## 🧩 13.8 Mental Models for CI/CD
1.  **Assembly Line:** Raw code enters; finished products exit.
2.  **Quality Gate:** Every stage must pass for the code to move forward.
3.  **The Heartbeat:** Continuous integration is the pulse of a healthy dev team.

---

## Continue the Cloud-Native Journey 🚀

> "The assembly line is operational. Now, let's learn how to monitor the health of our deployed platform using the Prometheus and Grafana Observability stack."

**Previous Module:**
← [Terraform IaC](../08_iac/Terraform_IaC.md)

**Next Module:**
→ [Monitoring & Observability](../10_observability/Monitoring_Observability.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f46b45,100:eea849&height=100&section=footer" width="100%" />
</p>