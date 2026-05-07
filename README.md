<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:000046,100:1CB5E0&height=300&section=header&text=Cloud%20Sentinel&fontSize=90&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🛡️ Your Cloud-Native Sentinel</h3>
<p align="center"><strong>Production-Grade SRE & Observability Platform</strong></p>
<p align="center"><strong>Monitor • Detect • Recover • Scale</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/"><img src="https://img.shields.io/badge/Infrastructure-AWS-000046?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" /></a>
  <a href="https://kubernetes.io/"><img src="https://img.shields.io/badge/Orchestration-Kubernetes-1CB5E0?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" /></a>
  <a href="https://www.terraform.io/"><img src="https://img.shields.io/badge/IaC-Terraform-000046?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" /></a>
  <a href="https://www.jenkins.io/"><img src="https://img.shields.io/badge/CI/CD-Jenkins-1CB5E0?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins" /></a>
</p>
<p align="center">
  <a href="https://prometheus.io/"><img src="https://img.shields.io/badge/Observability-Prometheus-000046?style=for-the-badge&logo=Prometheus&logoColor=white" alt="Prometheus" /></a>
  <a href="https://grafana.com/"><img src="https://img.shields.io/badge/Visualization-Grafana-1CB5E0?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" /></a>
  <a href="https://github.com/charan21042005/cloud-sentinel-platform"><img src="https://img.shields.io/badge/Status-Active-000046?style=for-the-badge" alt="Status" /></a>
</p>

---

## 📌 Overview

**Cloud Sentinel Platform** is an industry-inspired cloud-native observability and incident management system designed to simulate real-world **DevOps** and **Site Reliability Engineering (SRE)** workflows.

In today's distributed systems, downtime is not an option. Cloud Sentinel doesn't just watch your infrastructure—it understands it. By leveraging a full-stack observability suite and automated recovery workflows, it ensures your services remain resilient under pressure.

### Why It Matters?
- **Proactive Reliability:** Detect anomalies before they become outages.
- **Automated Recovery:** Self-healing Kubernetes workloads reduce MTTR (Mean Time To Recovery).
- **Production Simulation:** Experience the full lifecycle of a cloud-native app, from Terraform provisioning to Jenkins-driven deployments.

---

## 🎯 Project Goals

- [x] **Build** a production-grade cloud-native platform.
- [x] **Demonstrate** complete DevOps lifecycle implementation.
- [x] **Showcase** Kubernetes orchestration concepts (HPA, Self-healing).
- [x] **Implement** CI/CD automation pipelines with Jenkins.
- [x] **Deploy** scalable microservices on AWS.
- [x] **Integrate** a unified Monitoring & Observability stack.
- [x] **Practice** Infrastructure as Code (IaC) using Terraform.

---

## 🚀 Core Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Observability** | Real-time infrastructure monitoring, API performance tracking, and pod health. |
| ⚙️ **DevOps Automation** | Full CI/CD pipelines, automated Docker builds, and rolling deployments. |
| ☸️ **K8s Self-Healing** | Liveness/Readiness probes and HPA for autonomous workload management. |
| 📊 **Monitoring Stack** | Prometheus metrics, Grafana dashboards, and Loki log aggregation. |
| 🔐 **DevSecOps** | IAM least privilege, JWT auth, and K8s secrets management. |
| 💥 **Chaos Engineering** | Injecting synthetic faults to test system resilience. |

---

## 🏗️ High-Level Architecture

```mermaid
graph TD
    User((Users)) --> ALB[AWS Load Balancer]

    ALB --> K8S[Kubernetes Cluster]

    subgraph Application_Services
        K8S --> FE[Frontend Service]
        K8S --> BE[Backend API Service]
        K8S --> AUTH[Authentication Service]
        K8S --> ALERT[Alert Service]
    end

    subgraph Observability_Stack
        K8S --> PROM[Prometheus]
        K8S --> GRAF[Grafana]
        K8S --> LOKI[Loki]
    end

    BE --> DB[(PostgreSQL Database)]

    PROM --> GRAF
    LOKI --> GRAF
```

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-000046?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-1CB5E0?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-000046?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-1CB5E0?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-000046?style=flat&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Kubernetes-1CB5E0?style=flat&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/Terraform-000046?style=flat&logo=terraform&logoColor=white" alt="Terraform" />
  <img src="https://img.shields.io/badge/Jenkins-1CB5E0?style=flat&logo=jenkins&logoColor=white" alt="Jenkins" />
  <img src="https://img.shields.io/badge/AWS-000046?style=flat&logo=amazon-aws&logoColor=white" alt="AWS" />
</p>

---

## 📂 Repository Structure

```text
cloud-sentinel-platform/
│
├── frontend/             # React + Tailwind Source
├── backend/              # FastAPI Source
├── monitoring/           # Prometheus/Grafana/Loki Configs
├── kubernetes/           # K8s Manifests (Deployments, HPA, Ingress)
├── terraform/            # IaC (VPC, EKS, RDS Modules)
├── jenkins/              # Jenkinsfile & Pipeline Scripts
├── docker/               # Master Dockerfiles & Build Scripts
├── docs/                 # Architecture, Diagrams, Screenshots
└── assets/               # Branding & Static Assets
```

---

## 🔄 CI/CD Workflow

1.  **Developer Push:** Triggered via GitHub Webhook.
2.  **Jenkins Pipeline:** Automates testing, linting, and security audits.
3.  **Artifact Creation:** Builds Docker image and pushes to **AWS ECR**.
4.  **IaC Validation:** Terraform plan/apply to sync infrastructure.
5.  **K8s Deployment:** Rolling update to the cluster via Helm/Kubectl.
6.  **Health Check:** Prometheus verifies service availability.

---

## ☁️ AWS Services

- **Amazon EC2/EKS:** Scalable compute and orchestration.
- **Amazon ECR:** Private container registry.
- **Amazon RDS:** Managed PostgreSQL database.
- **AWS IAM:** Granular security and identity management.
- **Amazon S3:** Scalable object storage for logs/artifacts.
- **AWS VPC:** Isolated network infrastructure.

---

## 📊 Monitoring & Observability

- **Prometheus:** High-dimensional data model for metrics (CPU, RAM, Latency).
- **Grafana:** Beautifully visualized dashboards for real-time insights.
- **Loki:** Like Prometheus, but for logs. Optimized for cloud-native workflows.

---

## 🔐 Security Objectives

- **Least Privilege:** Tailored IAM roles.
- **Secrets Management:** K8s Secrets for sensitive data.
- **Auth:** Secure JWT-based user authentication.
- **Scanning:** Automated vulnerability scanning in CI/CD.

---

## 📅 Project Roadmap

| Phase | Milestone | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project Planning & Architecture | ✅ Completed |
| **Phase 2** | Backend Development (FastAPI) | 🚧 In Progress |
| **Phase 3** | Frontend Dashboard (React) | ⏳ Upcoming |
| **Phase 4** | Infrastructure as Code (Terraform) | ⏳ Upcoming |
| **Phase 5** | Kubernetes & Observability | ⏳ Upcoming |

---

## 👨‍💻 Author

**Patty**
*B.Tech Student — Cloud Computing & DevOps Engineering*

<p align="center">
  <a href="https://linkedin.com/in/yourprofile"><img src="https://img.shields.io/badge/LinkedIn-4facfe?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://github.com/charan21042005"><img src="https://img.shields.io/badge/GitHub-00d2ff?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
</p>

---

## 📜 License

This project is licensed under the MIT License.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:000046,100:1CB5E0&height=100&section=footer" width="100%" />
</p>