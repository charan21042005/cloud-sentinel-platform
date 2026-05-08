<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F2994A,100:F2C94C&height=300&section=header&text=Requirement%20Analysis&fontSize=65&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">📋 Phase 2: Requirement Analysis</h3>
<p align="center"><strong>"Designing the system before building it."</strong></p>
<p align="center"><strong>Functional • Non-Functional • User Roles • Scalability</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Analysis-F2994A?style=for-the-badge" alt="Analysis Phase" />
  <img src="https://img.shields.io/badge/Blueprint-Clarity-F2C94C?style=for-the-badge" alt="Clarity" />
  <img src="https://img.shields.io/badge/Security-RBAC-F2994A?style=for-the-badge" alt="RBAC" />
</p>

---

## 📑 Table of Contents
* [2.1 What is Requirement Analysis?](#-21-what-is-requirement-analysis)
* [2.2 Product Definition](#-22-product-definition)
* [2.3 Functional Requirements](#-23-functional-requirements-what-it-must-do)
* [2.4 Non-Functional Requirements](#-24-non-functional-requirements-how-it-performs)
* [2.5 User Roles (RBAC)](#-25-user-roles-rbac)
* [2.6 MVP vs. Advanced Scope](#-26-the-mvp-vs-advanced-scope)
* [2.7 Scalability Goals](#-27-scalability-goals)
* [2.8 Mental Model: The Layered Approach](#-28-mental-model-the-layered-approach)

---

## 🏗️ 2.1 What is Requirement Analysis?

In industry, we don't start "placing bricks" (coding) without a blueprint. Requirement analysis prevents **Scope Creep**, where a project becomes too messy to finish.

### 🏢 The Skyscraper Analogy
Before building a skyscraper, engineers calculate load capacity and define rooms. In Cloud DevOps, we define our API limits, user roles, and monitoring thresholds before we touch the AWS Console.

---

## 📝 2.2 Product Definition

*   **Non-Technical View:** A smart dashboard that helps engineers see if their servers are "healthy" and fixes them automatically if they "get sick."
*   **Technical View:** A distributed observability platform providing metrics collection (Prometheus), log aggregation (Loki), and automated recovery (Kubernetes).

---

## ✅ 2.3 Functional Requirements (What it MUST do)

| Feature | Description | Tech Component |
| :--- | :--- | :--- |
| **Auth System** | Secure Login/Signup for sensitive infra data. | JWT / FastAPI |
| **Dashboard** | Real-time visualization of CPU, Memory, and Pods. | React / Tailwind |
| **Metrics** | Scrape and store infrastructure health data. | Prometheus |
| **Logging** | Centralized search for all system errors. | Loki |
| **Alerting** | Notify engineers when CPU > 90% via Slack/UI. | AlertManager |
| **Self-Healing** | Automatically restart crashed application pods. | Kubernetes |

---

## ⚡ 2.4 Non-Functional Requirements (How it performs)

*   **Scalability:** The architecture must be **Horizontally Scalable** (add more pods, not just a bigger server).
*   **Availability:** The dashboard must have **99.9% Uptime** targets.
*   **Performance:** API responses must be under **500ms**.
*   **Portability:** Must run identically on a Local Laptop, Docker, and AWS.

---

## 🔐 2.5 User Roles (RBAC)

We implement **Role-Based Access Control (RBAC)**, a core security concept:
1.  **Admin:** Full access to infrastructure settings and user management.
2.  **DevOps Engineer:** Can view logs, investigate incidents, and trigger deployments.
3.  **Viewer:** Read-only access to dashboards.

---

## 🎯 2.6 The MVP vs. Advanced Scope

To ensure we finish within the semester, we follow the **MVP (Minimum Viable Product)** approach:

### 🚀 MVP (Build First)
*   React Dashboard + FastAPI + PostgreSQL.
*   Docker & Kubernetes Deployment.
*   Jenkins CI/CD + Prometheus/Grafana.
*   Terraform for AWS VPC/EC2.

### ⭐ Advanced (Build Later)
*   AI-powered log summarization.
*   Canary/Blue-Green Deployment strategies.
*   Chaos Engineering (intentional fault injection).

---

## 📈 2.7 Scalability Goals

We aren't building a "static" app. We are building for growth:
*   **Horizontal Pod Autoscaler (HPA):** If traffic spikes, Kubernetes will automatically spin up more containers.
*   **Metrics Scaling:** Prometheus is configured to handle a growing number of microservices.

---

## 🗺️ 2.8 Mental Model: The Layered Approach

We think in layers to keep the system organized:
1.  **User Layer:** Accessing the UI.
2.  **Frontend Layer:** React Dashboard.
3.  **API Layer:** FastAPI Gateways.
4.  **Logic Layer:** Monitoring & Alerting scripts.
5.  **Infra Layer:** Kubernetes & AWS.

---

## Continue the Cloud-Native Journey 🚀

> "Requirements are the contracts of engineering. With the blueprint finalized, it's time to initiate the actual project lifecycle."

**Previous Module:**
← [Project Vision](01_Vision.md)

**Next Module:**
→ [Project Initiation](03_Initiation.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F2994A,100:F2C94C&height=100&section=footer" width="100%" />
</p>