<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,100:B45309&height=300&section=header&text=Grafana%20Dashboards&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Grafana Dashboards</h3>
<p align="center"><strong>"Docker Compose • Containerized Observability • Local Analytics"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Visualization-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Docker_Compose-F59E0B?style=for-the-badge&logo=docker&logoColor=white" alt="Managed By Docker" />
  <img src="https://img.shields.io/badge/Environment-Local_Dev-B45309?style=for-the-badge&logo=grafana&logoColor=white" alt="Environment" />
</p>

---

The **Grafana Dashboards** module provides Dashboards and visualization settings for local Docker Compose monitoring. This directory supports the standalone Docker Compose monitoring stack, enabling rich observability outside of a full Kubernetes deployment.

---

## 🏗️ 1. Architecture & Integration Decisions
We utilize these configurations for local development and standalone validation:
*   **Decoupled Operation**: Runs seamlessly alongside the application stack using Docker Compose.
*   **Volume Mapping**: Config files in this directory are mounted directly into the respective containers.
*   **Portability**: Allows developers to visualize logs and metrics instantly without spinning up EKS.

---

## 🚀 2. Quick Start & Validation
To spin up the entire standalone observability stack locally:

```bash
cd infrastructure/monitoring
docker-compose up -d
```

To modify configurations for this specific component, edit the files in this directory and restart its container:
```bash
docker-compose restart grafana
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F59E0B,100:B45309&height=100&section=footer" width="100%" />
</p>
