<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:000046,100:1CB5E0&height=200&section=header&text=Viva%20&%20Interview%20Mastery&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />

  <h3>Cloud Sentinel: The Definitive Interview Guide</h3>
  <p><strong>Use this guide to confidently explain the architecture, tech stack, and user journey of the Cloud Sentinel Platform to recruiters, senior engineers, or college professors.</strong></p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-Interview_Ready-05998b?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Complexity-Senior_Level-E6522C?style=for-the-badge" alt="Complexity" />
    <img src="https://img.shields.io/badge/Focus-SRE_&_Cloud_Native-326CE5?style=for-the-badge" alt="Focus" />
  </p>
</div>

---

## 🎙️ 1. The Elevator Pitch
**If someone asks: *"What did you build?"***

> "I built **Cloud Sentinel**, an enterprise-grade Site Reliability Engineering (SRE) and Observability platform. In modern cloud architecture, if a database spikes or a container crashes, engineers lose valuable time digging through raw logs. Cloud Sentinel solves this by acting as the central nervous system for distributed applications. It automatically scrapes live infrastructure metrics, mathematically evaluates them for anomalies, and triggers real-time alerts to a secure, role-based React dashboard. It’s a full-stack, cloud-native ecosystem deployed via Kubernetes and automated by a zero-downtime CI/CD pipeline."

---

## 🧠 2. The Technical Talk (For Technical Interviews)
**If an interviewer asks: *"You used a lot of technologies here. Can you walk me through the architecture and why you chose these stacks?"***

### ⚡ The Frontend: High-Performance React Architecture
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

"For the UI, I used **Next.js 15** with the App Router and **Tailwind CSS v4**. Because observability platforms render high-frequency streaming data (like live CPU charts), performance is critical. I utilized **Recharts** for rendering and built a custom **Telemetry Adapter** that normalizes raw Prometheus JSON payloads to ensure the UI thread doesn't lag. To ensure zero-trust security, I engineered a granular **Capability Matrix (RBAC)**, meaning the UI dynamically hides buttons or routes depending on whether you are a Viewer, Analyst, or Admin. The entire frontend is compiled into a standalone, multi-stage **Docker** container and served by an **NGINX** reverse proxy for maximum speed and security."

### ⚙️ The Backend Engine: High-Concurrency Python
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=flat-square&logo=JSON%20web%20tokens)

"The backend API Gateway is written in **Python using FastAPI**. I chose FastAPI because its Starlette-based asynchronous event-loop is perfect for handling high-volume telemetry ingestion and WebSocket streaming without blocking the main thread. It handles **JWT authentication** state and acts as the secure, sanitized middleman between the vulnerable infrastructure databases and the public-facing React frontend."

### 👁️ The Observability Stack: The 'Eyes' of the Platform
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=Prometheus&logoColor=white) ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white)

"Instead of writing a custom monitoring agent, I implemented industry-standard **Prometheus**. I deployed sidecar containers like **Node Exporter** to read real-time kernel data (CPU, RAM, Disk I/O) directly from the host machines. I then wrote mathematical threshold rules in Prometheus (`alert_rules.yml`). If a server's CPU exceeds 90% for 5 minutes, Prometheus detects the breach and fires a webhook payload to **Alertmanager**, which instantly routes the alert to our frontend Incident Feed. I also integrated **Grafana** for deep-dive historical metric visualization."

### 🐳 The DevOps & Cloud-Native Runtime
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat-square&logo=docker&logoColor=white) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

"A platform isn't 'Enterprise' if it's just running on `localhost`. I orchestrated the entire application using **Kubernetes**. I wrote YAML manifests defining strict resource limits (to prevent noisy-neighbor memory leaks) and Liveness/Readiness HTTP probes (so K8s automatically restarts deadlocked containers). Finally, I built an advanced **GitHub Actions CI/CD Pipeline**. Whenever code is pushed, the pipeline automatically runs a **Vitest coverage suite** on the security logic, does a dry-run Next.js production build, compiles the Docker image using registry layer-caching to save compilation time, and executes a zero-downtime rolling update to the cluster."

---

## 👤 3. The User Journey (How a Human Uses It)
*Imagine a DevOps Engineer named Sarah starts her shift.*

1. **Login & RBAC**: Sarah navigates to `sentinel.company.com`. She logs in via the Next.js frontend. Because the **Capability Matrix** recognizes her as an `Admin`, she sees the full dashboard, including restricted Settings panels.
2. **Live Monitoring**: On her screen, the React Recharts components are constantly updating, showing the live CPU usage, Memory, and Network traffic of all the company's servers.
3. **The Incident Event**: Suddenly, a marketing campaign launches, and website traffic skyrockets. The CPU on the main server hits 98%.
4. **Response**: An alert instantly pops up on Sarah's **Tactical Alert Feed**. She clicks the alert, opening the Incident Drawer. Because she has admin permissions, she clicks the *"Acknowledge"* button to let the team know she is handling it. Once the servers auto-scale and the CPU drops, she changes the status to *"Resolved"*.

---

## 🔍 4. In-Depth: How Prometheus & Grafana Actually Work Here
*To make that "Incident Event" happen automatically, a highly complex background engine is required:*

*   **The Translators (Node Exporter)**: On every server, a tiny daemon called `node-exporter` is running. It reads raw Linux kernel data (like how fast the hard drive is spinning via `/proc/stat`) and translates it into a standard HTTP text format.
*   **The Vacuum Cleaner (Prometheus)**: Prometheus operates on a "Pull Model." Every 15 seconds, it reaches out via HTTP to the Node Exporters and "pulls" all that data into its massive Time-Series Database (TSDB).
*   **The Judge (Alert_Rules.yml)**: Every 15 seconds, Prometheus runs the mathematical rules we gave it. It evaluates the PromQL query: *"Is `node_cpu_seconds_total` > 90%?"* If the answer is yes, it fires a critical payload to our FastAPI backend, which pushes the alert to Sarah's React screen.
*   **The Magnifying Glass (Grafana)**: The Next.js UI is for quick, tactical responses. But if Sarah wants to analyze *why* the CPU spiked last Tuesday at 4 AM, she opens Grafana. Grafana connects directly to Prometheus' massive database and allows Sarah to run highly complex PromQL queries to investigate historical anomalies.

---

## ☁️ 5. The Enterprise AWS Deployment Architecture
*When this moves from Local Docker to Amazon Web Services (AWS), the architecture scales up to an Enterprise tier:*

1. **AWS EKS (Elastic Kubernetes Service)**: The Kubernetes manifests we wrote will be deployed into EKS. AWS will provision massive underlying EC2 servers (worker nodes) to run our pods. If a pod crashes, EKS brings it back online.
2. **AWS Application Load Balancer (ALB)**: When we deploy our `main-ingress.yaml`, AWS automatically creates a physical Application Load Balancer. This ALB gets a public IP address. When users type the URL into their browser, the ALB intercepts the traffic, handles the SSL/HTTPS decryption at the edge, and routes the traffic directly into the Kubernetes cluster.
3. **AWS RDS (Relational Database Service)**: Instead of running Postgres inside a fragile Docker container, FastAPI will connect to an AWS RDS instance. This ensures the database is automatically backed up across multiple geographical Availability Zones (Multi-AZ) so no incident data is ever lost if a data center goes down.
4. **The CI/CD Flow**: When you push code to GitHub, the **GitHub Actions** pipeline builds the Docker image and pushes it into **AWS ECR (Elastic Container Registry)**. It then securely authenticates with the AWS EKS cluster and commands it to pull the new image, updating the platform with zero downtime using a rolling update strategy.

---

<div align="center">
  <h3>🌟 Why this project makes you stand out:</h3>
  <p>Most developers build a standard "To-Do app" or an "E-Commerce clone." <strong>You built DevOps Infrastructure.</strong> You demonstrated that you don't just know how to write a React button; you know how to securely deploy that button, monitor the server hosting it, and automate its delivery pipeline. You combined Software Engineering with Site Reliability Engineering. <strong>That is exactly what Senior Cloud Architects do.</strong></p>
</div>