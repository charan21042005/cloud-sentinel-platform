<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=300&section=header&text=API%20Gateway&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🔮 Sentinel Core Command Center</h3>
<p align="center"><strong>"Distributed Intelligence • High-Concurrency Engine • Asynchronous Mastery"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Module-API--Gateway-667eea?style=for-the-badge" alt="Module" />
  <img src="https://img.shields.io/badge/Stack-FastAPI--Async-764ba2?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Security-Sentinel--Guard-667eea?style=for-the-badge" alt="Security" />
</p>

---

## 📌 1. Platform Intelligence

The **API Gateway** serves as the distributed brain of the Cloud Sentinel Platform. It orchestrates high-speed data flow between our observers and the persistence layer, using a sophisticated **Service-Repository** architecture to ensure zero-latency business logic processing.

### 🏗️ Domain Orchestration

```mermaid
graph LR
    subgraph "Ingress"
        R[API Controllers]
    end
    
    subgraph "Core Intelligence"
        S[Domain Services]
    end
    
    subgraph "Deep Memory"
        Repo[Async Repositories]
        DB[(PostgreSQL)]
    end
    
    R --> S
    S --> Repo
    Repo --> DB
    
    style R fill:#eef2ff,stroke:#667eea
    style S fill:#eef2ff,stroke:#667eea
    style Repo fill:#eef2ff,stroke:#667eea
    style DB fill:#f5f3ff,stroke:#7c3aed
```

---

## 🚀 2. Command Catalog (v1)

| Method | Endpoint | Logic Domain | Action |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/users/` | Identity | Register new platform sentinel |
| `POST` | `/api/v1/incidents/` | Observability | Ingest real-time platform incident |
| `GET` | `/api/v1/incidents/` | Observability | Stream historical incident logs |
| `GET` | `/health` | Liveness | Core platform heartbeat |

---

## 🛠️ 3. Operations & DX

### Schema Evolution
Managed via **Alembic** (Asyncpg).
```powershell
# Sync database to latest head
docker compose exec api-gateway alembic upgrade head

# Generate intelligence revision
docker compose exec api-gateway alembic revision --autogenerate -m "new_feature_schema"
```

### Integrated Testing
```powershell
# Run the sentinel validation suite
docker compose exec api-gateway pytest
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=120&section=footer" width="100%" />
</p>
