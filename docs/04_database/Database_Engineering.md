<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:4e54c8,100:8f94fb&height=300&section=header&text=Database%20Engineering&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🗄️ Phase 5: Database Engineering</h3>
<p align="center"><strong>"Designing the Memory & Persistence Layer of Cloud Sentinel"</strong></p>
<p align="center"><strong>PostgreSQL • AWS RDS • Schema Design • Query Optimization</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Database-4e54c8?style=for-the-badge" alt="Database Phase" />
  <img src="https://img.shields.io/badge/Engine-PostgreSQL-8f94fb?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Cloud-AWS--RDS-4e54c8?style=for-the-badge&logo=amazon-rds&logoColor=white" alt="AWS RDS" />
</p>

---

## 🗄️ 5.0 What is Database Engineering?

If the **Frontend** is the face and the **Backend** is the brain logic, the **Database** is the **Long-Term Memory**.
*   **The Role:** It ensures that when a server restarts, the application doesn't "forget" its users or past incidents.
*   **Analogy:** A hospital's filing system. Doctors (Backend) process patients, but the files (Database) store the history securely for years.

---

## 🐘 5.1 Why We Choose PostgreSQL

We are using **PostgreSQL**, an advanced, open-source relational database.
*   **Relational Integrity:** It excels at connecting data (e.g., linking a specific 'Incident' to the 'User' who resolved it).
*   **ACID Compliance:** Guarantees that database transactions are processed reliably (No partial data saves).
*   **Industry Standard:** Trusted by giants like Instagram, Reddit, and Spotify for its enterprise-grade performance.

---

## 📐 5.3 Database Schema Design (The Blueprint)

We don't just "dump" data; we organize it into structured tables:

### 📋 Core Tables:
1.  **Users:** Stores account info, hashed passwords, and RBAC roles.
2.  **Incidents:** Stores title, severity (Critical/High), status (Active/Resolved), and timestamps.
3.  **Alerts:** Stores threshold rules (e.g., "Alert if CPU > 90%").
4.  **Deployments:** Tracks CI/CD history and version timestamps.

### 🧩 Example Schema:
```text
Users Table           Incidents Table
├── id (PK)           ├── id (PK)
├── email             ├── title
├── password_hash     ├── severity
└── role              └── user_id (FK -> Users.id)
```

---

## 🔗 5.4 Entity Relationships

We implement **One-to-Many** relationships to structurally link our platform data:
*   **The Logic:** One **User** (DevOps Engineer) can acknowledge and resolve **Many Incidents**.
*   **The Benefit:** This architecture avoids data duplication (Redundancy) and ensures a **"Single Source of Truth"** across the entire monitoring ecosystem.

---

## 📊 5.6 Metrics Storage: SQL vs. Time-Series

**Industry Insight:** Monitoring metrics (like CPU usage every 5 seconds) are high-volume and fundamentally different from standard relational data.

*   **PostgreSQL:** Optimized for **Relational Data** (User profiles, persistent incident logs, and settings).
*   **Prometheus TSDB:** Specialized for **Time-Series Data** (Raw performance metrics like CPU, RAM, and Latency).
*   **Our Strategy:** We utilize a **Hybrid Storage Pattern**—Postgres for management logic and Prometheus for high-velocity performance data.

---

## 📖 5.8 Indexing & Optimization

To prevent system latency as our incident logs grow into the thousands:
*   **Indexing:** Acts like a book's index. Instead of the database scanning every single row (Full Table Scan), it jumps directly to the relevant data using a B-Tree or Hash index.
*   **Query Optimization:** We practice **Data Parsimony**—only fetching specific required fields.
*   **Beginner Mistake ⚠️:** Using `SELECT *` on a table with 1 million rows, which chokes the network and memory.

---

## ☁️ 5.13 Managed Cloud Database: AWS RDS

In a production environment, we do not manage the underlying database server OS manually. We use **AWS RDS (Relational Database Service)**.
*   **The Benefits:** Automated daily backups, automated software patching, and vertical/horizontal scaling at the click of a button.
*   **Student Strategy:** We develop locally using a **Dockerized PostgreSQL** container to save costs, then migrate to **AWS RDS** for the final production-grade cloud deployment.

---

## ⚖️ 5.15 Beginner vs. Industry Database Design

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Structure** | Single table / No relationships | **Normalized Relational Schema** |
| **Performance** | No indexes (Slow lookups) | **Optimized Indexing Strategy** |
| **Reliability** | No backups (High risk) | **Automated Snapshots (RDS)** |
| **Operations** | Manual SQL edits | **Schema Migrations (Alembic/Flyway)** |

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:4e54c8,100:8f94fb&height=100&section=footer" width="100%" />
</p>