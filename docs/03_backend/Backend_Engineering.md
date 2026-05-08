<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,100:302b63&height=300&section=header&text=Backend%20Engineering&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">⚙️ Phase 4: Backend Engineering</h3>
<p align="center"><strong>"Building the Brain & Control Center of Cloud Sentinel"</strong></p>
<p align="center"><strong>FastAPI • JWT Security • Async Logic • Microservice Patterns</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Backend-0f0c29?style=for-the-badge" alt="Backend Phase" />
  <img src="https://img.shields.io/badge/Framework-FastAPI-302b63?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Security-JWT-0f0c29?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
</p>

---

## ⚙️ 4.0 What is Backend Engineering?

If the **Frontend** is the car's dashboard, the **Backend** is the engine and control systems.
*   **The Role:** It handles the "heavy lifting"—authentication, database operations, metrics processing, and business logic.
*   **Why it matters:** Without a backend, the frontend has no data to show and no way to securely communicate with the cloud infrastructure.

---

## ⚡ 4.1 Why We Choose FastAPI

We are using **FastAPI**, a modern, high-performance Python framework.
*   **Performance:** It is one of the fastest Python frameworks available, built on **Starlette** and **Pydantic**.
*   **Async Support:** It handles multiple tasks (like streaming metrics) simultaneously without blocking.
*   **Automatic Docs:** It generates industry-standard Swagger/OpenAPI documentation automatically.
*   **Industry Usage:** Used by Microsoft, Uber, and top AI startups for scalable microservices.

---

## 🍽️ 4.2 REST APIs: The Universal Waiter

**REST API** is the standardized way our Frontend and Backend talk.
*   **Analogy:** The Frontend is the **Customer**, the Backend is the **Kitchen**, and the API is the **Waiter**. The customer requests data, and the waiter brings it from the kitchen.
*   **Key Methods:**
    *   `GET`: Fetch metrics/incidents.
    *   `POST`: Create a new incident or login.
    *   `PATCH`: Update an incident status.

---

## 🏛️ 4.3 Clean & Layered Architecture

We avoid the "Beginner Mistake" of putting everything in one file. We use a **Layered Design**:

1.  **Routes Layer:** Handles incoming requests and endpoints.
2.  **Service Layer:** The "Brain"—contains logic for metrics calculation and alerts.
3.  **Repository Layer:** Dedicated to Database (PostgreSQL) operations.
4.  **Infrastructure Layer:** Communicates with **Prometheus** and **Kubernetes**.

---

## 🔐 4.5 Security & Authentication (JWT)

We implement **Stateless Authentication** using **JWT (JSON Web Tokens)**.
*   **Flow:** User Logs in $\rightarrow$ Backend hashes password $\rightarrow$ Validates $\rightarrow$ Issues a JWT.
*   **Best Practice:** We never store plain passwords; we use industry-standard hashing like **Bcrypt**.

---

## 🍳 4.8 Background Workers & Async

Some tasks (like sending alerts or processing massive logs) are too "expensive" to do in the main request.
*   **Analogy:** A chef (Backend) continues taking orders while the oven (Background Worker) cooks the food.
*   **Tooling:** We start with `FastAPI BackgroundTasks` and scale to `Celery + Redis` for production-grade task queuing.

---

## 📞 4.11 Real-Time Streaming with WebSockets

Traditional HTTP is "Request-Response." Monitoring needs **"Live Streaming."**
*   **WebSocket Flow:** Backend opens a persistent socket $\rightarrow$ Metrics stream continuously $\rightarrow$ Frontend updates instantly without refreshing.

---

## 📂 Industry-Grade Folder Structure

```text
backend/
├── app/
│   ├── api/          # Endpoints (Routes)
│   ├── core/         # Config & Security
│   ├── models/       # DB Models
│   ├── services/     # Business Logic
│   ├── repositories/ # DB Access
│   └── websocket/    # Live stream logic
├── main.py           # Entry point
└── Dockerfile        # Containerization
```

---

## ⚖️ 4.16 Beginner vs. Industry Backend

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Logic** | Single massive file | **Layered Architecture** |
| **Database** | Direct queries in routes | **Repository Pattern** |
| **Execution** | Synchronous (Blocking) | **Asynchronous (Non-blocking)** |
| **Security** | Plain text passwords | **JWT + Hashed Passwords** |

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,100:302b63&height=100&section=footer" width="100%" />
</p>