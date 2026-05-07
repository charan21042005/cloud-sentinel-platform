<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF9900,100:FFCC00&height=300&section=header&text=Initiation%20Phase&fontSize=80&animation=fadeIn&fontAlignY=38" width="100%" />
</p>

<h3 align="center">🚀 Project Vision & High-Level Design</h3>
<p align="center"><strong>The blueprint for an industry-grade SRE platform</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Initiation-blue?style=for-the-badge" alt="Initiation Phase" />
  <img src="https://img.shields.io/badge/Complexity-9%2F10-red?style=for-the-badge" alt="Complexity" />
  <img src="https://img.shields.io/badge/Status-Approved-brightgreen?style=for-the-badge" alt="Status" />
</p>

---

## 🛡️ Overview

Modern distributed systems fail. Whether it's a CPU spike, a pod crash, or a memory leak, downtime costs money. **Cloud Sentinel** is a production-ready Site Reliability Engineering (SRE) platform designed to monitor, detect, and automatically recover from cloud infrastructure anomalies. Think of it as a **Mini-Datadog** tailored for modern DevOps workflows.

### Core Capabilities:
*   **Real-time Monitoring:** Tracking pod health and API latency.
*   **Anomaly Detection:** Identifying CPU/Memory spikes before they cause outages.
*   **Automated Recovery:** Self-healing workflows for Kubernetes workloads.
*   **Centralized Observability:** Unified logs and metrics visualization.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((Users)) --> ALB[AWS Load Balancer]
    ALB --> K8S{Kubernetes Cluster}
    
    subgraph "Microservices Layer"
        K8S --> FE[Frontend Pod - React]
        K8S --> BE[Backend API Pod - FastAPI]
        K8S --> AS[Alert Service Pod]
        K8S --> AU[Auth Service Pod]
    end

    subgraph "Observability Stack"
        K8S --> Prom[Prometheus]
        K8S --> Graf[Grafana]
        K8S --> Loki[Loki Logs]
    end

    BE --> DB[(PostgreSQL RDS)]
    Prom --> Graf
    Loki --> Graf
```

---

## 🛠️ Tech Stack & Tooling

| Category | Tools |
| :--- | :--- |
| **Cloud Provider** | AWS (EKS, RDS, ECR, IAM, S3, VPC) |
| **Containerization** | Docker, Kubernetes (EKS/k3s), Helm |
| **Infrastructure as Code** | Terraform |
| **CI/CD Pipeline** | Jenkins, GitHub Webhooks |
| **Backend** | Python FastAPI / Node.js |
| **Frontend** | React + Tailwind CSS |
| **Monitoring/Logs** | Prometheus, Grafana, Loki |

---

## 🔄 CI/CD Workflow
*High-velocity deployment pipeline ensuring code quality and infrastructure stability:*

1.  **Developer Push:** Triggered via **GitHub Webhook**.
2.  **Jenkins Pipeline:** Automates testing, linting, and security audits.
3.  **Artifact Creation:** Builds Docker image and pushes to **AWS ECR**.
4.  **IaC Validation:** Terraform plan/apply to sync infrastructure.
5.  **K8s Deployment:** Rolling update to the cluster via Helm/Kubectl.
6.  **Health Check:** **Prometheus** verifies the deployment success and service availability.

---

## ☸️ Kubernetes Implementation
This project leverages advanced K8s features to mimic a production environment:

*   **HPA (Horizontal Pod Autoscaler):** Automatically scales pods based on CPU/RAM metrics.
*   **Self-Healing:** Custom Liveness and Readiness probes for automated container restarts.
*   **ConfigMaps & Secrets:** Secure, decoupled environment and credential management.
*   **Ingress Controller:** Advanced traffic routing, load balancing, and SSL termination.

---

## 🔐 Security (DevSecOps)
*   **Least Privilege:** IAM roles strictly tailored for specific service needs.
*   **Secrets Management:** Sensitive data handled securely via Kubernetes Secrets.
*   **Authentication:** Secure JWT-based user authentication for the dashboard.
*   **Scanning:** Automated container vulnerability scanning within the CI/CD pipeline.

---

## 📈 Project Value
*   **Estimated Complexity:** 9/10
*   **Resume Impact:** 10/10 (Screams Cloud/DevOps Engineer)
*   **Uniqueness:** Moves beyond basic CRUD into real-world distributed systems reliability.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF9900,100:FFCC00&height=100&section=footer" width="100%" />
</p>DevOps Initiative</sub>
</p>

---