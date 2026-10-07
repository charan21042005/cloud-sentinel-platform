<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=300&section=header&text=Alertmanager&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Alertmanager</h3>
<p align="center"><strong>"Docker Compose • Containerized Observability • Local Analytics"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Incident_Response-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Docker_Compose-EF4444?style=for-the-badge&logo=docker&logoColor=white" alt="Managed By Docker" />
  <img src="https://img.shields.io/badge/Environment-Local_Dev-B91C1C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Environment" />
</p>

---

The **Alertmanager** module provides Alert routing, deduplication, and notification configs for Docker Compose. This directory supports the standalone Docker Compose monitoring stack, enabling rich observability outside of a full Kubernetes deployment.

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
docker-compose restart alertmanager
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,100:B91C1C&height=100&section=footer" width="100%" />
</p>
