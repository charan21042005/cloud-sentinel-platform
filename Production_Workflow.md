<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:d4145a,100:fbb03b&height=300&section=header&text=Production%20Workflow&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">⚙️ Phase 15: Final Production Workflow</h3>
<p align="center"><strong>"The Complete Cloud-Native Assembly Line"</strong></p>
<p align="center"><strong>CI/CD Factory • Infrastructure as Code • Orchestration • Continuous Observability</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Production-d4145a?style=for-the-badge&logoColor=white" alt="Production Phase" />
  <img src="https://img.shields.io/badge/System-Self--Healing-fbb03b?style=for-the-badge&logoColor=black" alt="System" />
  <img src="https://img.shields.io/badge/Status-Fully--Interconnected-d4145a?style=for-the-badge&logoColor=white" alt="Status" />
</p>

---

## 🏗️ 15.1 The COMPLETE Big Picture

This diagram represents the "Nervous System" of the Cloud Sentinel Platform. It shows how **CI/CD**, **Infrastructure as Code**, **Orchestration**, and **Observability** communicate.

```mermaid
graph TD
    %% Developer Section
    Dev[Developer] -->|Git Push| GH(GitHub Repo)

    %% CI/CD Section
    GH -->|Webhook Trigger| Jen[Jenkins Pipeline]
    
    subgraph "CI/CD Pipeline (The Factory)"
        Jen -->|1. Test| Test[Unit/API Testing]
        Test -->|2. Build| DB[Docker Build]
        DB -->|3. Scan| Sec[Security Scan - Trivy]
        Sec -->|4. Push| ECR[AWS ECR]
    end

    %% Infrastructure Section
    ECR -->|Pull Image| K8s[Kubernetes Cluster]
    Tf[Terraform] -->|Provision/Update| AWS_Infra[AWS Infrastructure - VPC/EC2/RDS]
    AWS_Infra -.-> K8s

    %% Runtime Section
    subgraph "Production Runtime (The Smart City)"
        K8s --> FE[Frontend Pod]
        K8s --> BE[Backend API Pod]
        BE --> Postgres[(PostgreSQL RDS)]
    end

    %% Monitoring Section
    subgraph "Observability Stack (The Watchtower)"
        Prom[Prometheus] -->|Scrape Metrics| BE
        Loki[Loki] -->|Collect Logs| BE
        Prom --> Graf[Grafana Dashboards]
        Loki --> Graf
        Prom --> AM[AlertManager]
        AM -->|Notify| Alert[Incident Detection]
    end

    %% User Access
    User((User)) -->|HTTPS| ALB[AWS Load Balancer]
    ALB -->|Ingress| FE
```

---

## 🔄 15.2 The Continuous Lifecycle

Unlike traditional academic projects, **Cloud Sentinel** follows a **Circular Lifecycle**. In the world of SRE, there is no "End"—only a cycle of continuous improvement and feedback.

*   **Develop:** New features are written in VS Code and validated locally using **Docker Compose**.
*   **Integrate:** **Jenkins** validates the code automatically using the shared `Jenkinsfile` logic.
*   **Deliver:** Optimized Docker images are versioned and stored securely in **AWS ECR**.
*   **Orchestrate:** **Kubernetes** performs a **Rolling Update** to replace pods without a single second of downtime.
*   **Observe:** **Prometheus** & **Loki** monitor the live release for performance spikes or errors.
*   **React:** If a bug is detected, **AlertManager** notifies the team, and we trigger an automated **Rollback** to the last stable version.

---

## 🛰️ Internal Component Communication

To understand the "Nervous System" of our platform, we must look at how our services communicate within the cluster:

| Communication Path | Protocol | Purpose |
| :--- | :--- | :--- |
| **Frontend ➔ Backend** | HTTPS / JSON | API Data requests & User Auth |
| **Backend ➔ Database** | TCP (Port 5432) | Persistent data storage and retrieval |
| **Prometheus ➔ Apps** | HTTP GET /metrics | Real-time performance scraping |
| **Jenkins ➔ K8s** | Kube-API | Automated deployment orchestration |
| **Terraform ➔ AWS** | AWS API | Cloud infrastructure provisioning |

---

## ⚖️ 15.3 Beginner vs. Industry System Thinking

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Perspective** | "I built a website." | "I built an **automated ecosystem**." |
| **Deployment** | Manual Drag-and-Drop | **GitOps / Pipeline-driven** automation. |
| **Failure** | "I hope it doesn't break." | **Design for Failure** (Self-Healing clusters). |
| **Complexity** | Linear (Start to Finish) | **Cyclic** (Continuous Observability). |

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:d4145a,100:fbb03b&height=100&section=footer" width="100%" />
</p>