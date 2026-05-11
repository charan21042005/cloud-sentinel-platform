<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,100:0EA5E9&height=300&section=header&text=Orchestration&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🐳 Distributed Stack Orchestration</h3>
<p align="center"><strong>"Containerization • Infrastructure as Code • Local Development Cloud"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Stack-Docker--Compose-06B6D4?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Infrastructure-Local--Distributed-0EA5E9?style=for-the-badge" alt="Infrastructure" />
  <img src="https://img.shields.io/badge/Status-Fully--Operational-06B6D4?style=for-the-badge" alt="Status" />
</p>

---

## 📌 1. Infrastructure Overview

This module manages the lifecycle of the **Cloud Sentinel** distributed stack. We use **Docker Compose** to orchestrate a cluster of high-performance services that mirror a production cloud environment.

### 🌐 Network Topology

```mermaid
graph LR
    User("🌐 External User")
    
    subgraph "Orchestration"
        API("⚡ API Gateway")
        Admin("🛠️ Adminer UI")
    end
    
    subgraph "Data"
        DB[("🐘 PostgreSQL")]
        Cache[("🔴 Redis")]
    end
    
    User --> API
    User --> Admin
    
    API --> DB
    API --> Cache
    Admin --> DB

    style API fill:#e0f7fa,stroke:#00acc1
    style DB fill:#ecfdf5,stroke:#059669
    style Cache fill:#fff1f2,stroke:#e11d48
    style Admin fill:#f3e5f5,stroke:#8e24aa
```

---

## 🚀 2. Service Catalog

| Service | Container Name | Internal Port | External Port | Role |
| :--- | :--- | :--- | :--- | :--- |
| **api-gateway** | `sentinel-api-gateway` | `8000` | `8000` | Platform Core Engine |
| **postgres** | `sentinel-postgres` | `5432` | `5432` | Relational Persistence |
| **redis** | `sentinel-redis` | `6379` | `6379` | Distributed Cache |
| **adminer** | `sentinel-adminer` | `8080` | `8888` | SQL Management UI |

---

## 🛠️ 3. Operations Guide

### Launching the Stack
```powershell
docker compose up -d
```

### Resource Management
```powershell
# Stop all services
docker compose stop

# Check Service Health
docker compose ps
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,100:0EA5E9&height=120&section=footer" width="100%" />
</p>
