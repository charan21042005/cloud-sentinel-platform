<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f46b45,100:eea849&height=300&section=header&text=Jenkins%20CI/CD%20Pipeline&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🚀 Phase 13: Jenkins CI/CD Engineering</h3>
<p align="center"><strong>"The Automated Assembly Line of Cloud Sentinel"</strong></p>
<p align="center"><strong>Pipeline as Code • GitHub Webhooks • Build • Scan • Deploy</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-CICD-f46b45?style=for-the-badge&logoColor=white" alt="CICD Phase" />
  <img src="https://img.shields.io/badge/Tool-Jenkins-eea849?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins" />
  <img src="https://img.shields.io/badge/Method-Automated-f46b45?style=for-the-badge&logoColor=white" alt="Method" />
</p>

---

## 📑 Table of Contents
* [13.1 What is CI/CD?](#-131-what-is-cicd)
* [13.2 Jenkins: The Industry Workhorse](#-132-jenkins-the-industry-workhorse)
* [13.3 Pipeline as Code (Jenkinsfile)](#-133-pipeline-as-code-jenkinsfile)
* [13.4 The Multi-Stage Workflow](#-134-the-multi-stage-workflow)
* [13.5 Webhooks: Real-Time Integration](#-135-webhooks-real-time-integration)
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

## ⚙️ 13.2 Jenkins: The Industry Workhorse

**Jenkins** is an open-source automation server. It acts as the "Manager" of our entire software lifecycle.
*   **The Role:** It watches GitHub, runs our tests, builds Docker images, and tells Kubernetes to update.
*   **Why Jenkins?** It is highly flexible with thousands of plugins, making it the most used CI/CD tool in the world.

---

## 📜 13.3 Pipeline as Code (Jenkinsfile)

We don't configure Jenkins by clicking buttons; we write a **Jenkinsfile**.
*   **Concept:** The entire build logic is written in Groovy script and stored in our GitHub repository.
*   **Benefit:** The pipeline itself is version-controlled. If the build process changes, we can see who changed it and why.

---

## 🏗️ 13.4 The Multi-Stage Workflow

Our pipeline is divided into logical "Stages" to catch errors early:
1.  **Checkout:** Pull the latest code from GitHub.
2.  **Test:** Run unit and integration tests. If they fail, the pipeline stops.
3.  **Security Scan:** Use **Trivy** to scan for vulnerabilities in our code and libraries.
4.  **Build:** Create the Docker image.
5.  **Push:** Send the image to **AWS ECR**.
6.  **Deploy:** Update the Kubernetes cluster to use the new image.

---

## ⚓ 13.5 Webhooks: Real-Time Integration

We use **GitHub Webhooks** to make the system feel "alive."
*   **The Flow:** Developer pushes code $\rightarrow$ GitHub sends a signal to Jenkins $\rightarrow$ Jenkins immediately starts the build.
*   **Result:** Zero manual effort between writing code and seeing it live in production.

---

## ⚖️ 13.7 Beginner vs. Industry Automation

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Method** | Manual Deployment | **100% Automated Pipeline** |
| **Testing** | "I'll test it later" | **Automated Unit/Integration Tests** |
| **Pipeline** | UI-configured | **Declarative Jenkinsfile** |
| **Feedback** | No notification | **Slack/Email Alerts on Failure** |

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