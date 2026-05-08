<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:11998e,100:38ef7d&height=300&section=header&text=System%20Observability&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">📊 Phase 11: Monitoring & Observability</h3>
<p align="center"><strong>"The Heart of Cloud Sentinel Platform"</strong></p>
<p align="center"><strong>Prometheus • Grafana • Centralized Logging • SRE Metrics</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Observability-11998e?style=for-the-badge&logoColor=white" alt="Observability Phase" />
  <img src="https://img.shields.io/badge/Stack-Prometheus--Grafana-38ef7d?style=for-the-badge&logo=prometheus&logoColor=white" alt="Stack" />
  <img src="https://img.shields.io/badge/Goal-Real--Time--Visibility-11998e?style=for-the-badge&logoColor=white" alt="Goal" />
</p>

---

## 🏥 11.0 Why Monitoring is Critical

In modern distributed systems, failures are inevitable. Without monitoring, an engineering team is "blind."
*   **The Analogy:** An **ICU Hospital**. You wouldn't treat a patient without heart monitors, oxygen sensors, and alarms. Monitoring is the life-support system for our code.
*   **Business Impact:** Companies like Amazon or Netflix lose millions for every minute of downtime. Observability helps us fix things before they break the business.

---

## 🔍 11.1 Monitoring vs. Observability

*   **Monitoring:** Tells you **"Is the system healthy?"** (e.g., Is CPU > 90%?). It tracks known failures.
*   **Observability:** Tells you **"Why is this happening?"** It allows you to dig deep into logs and traces to find the root cause of an unknown issue.
*   **The Car Analogy:** Monitoring is the **Fuel Warning Light**. Observability is the **Full Engine Diagnostics System**.

---

## 🏛️ 11.2 The Three Pillars of Observability

To truly understand a system, you need all three:
1.  **Metrics (Prometheus):** Numerical data over time (e.g., "Memory usage is 4GB").
2.  **Logs (Loki):** Detailed text records of events (e.g., "Database timeout at 10:01 AM").
3.  **Traces (Advanced):** Tracking a single request as it travels from Frontend ➔ Backend ➔ Database.

---

## 🕵️‍♂️ 11.3 Prometheus Architecture (The Collector)

Prometheus is our metrics engine. It works on a **Pull Model** (Scraping).
*   **Scraping:** Every 15 seconds, Prometheus "calls" our apps at the `/metrics` endpoint and pulls the data.
*   **TSDB:** Prometheus stores this data in a **Time-Series Database**, specifically optimized for high-velocity, timestamped numbers.

---

## 📺 11.6 Grafana Dashboards (The Visualization)

Grafana is the "TV Screen" for our data. It converts raw numbers from Prometheus into beautiful, actionable dashboards.

### Our Dashboards:
*   **Infrastructure:** CPU, RAM, and Node health.
*   **Kubernetes:** Pod restarts and Namespace health.
*   **Incident:** Active alerts, severity levels, and resolution status.

---

## 🪵 11.7 Loki: Centralized Logging

Instead of manually checking logs inside every container (which is impossible in production), we use **Loki**.
*   **Promtail:** An agent that "ships" logs from the containers to Loki.
*   **Benefit:** You can search logs from all 50 pods in one single search bar in Grafana.

---

## 🚨 11.8 AlertManager (The Alarm)

Prometheus **detects** the problem, but AlertManager **manages** the notification.
*   **Flow:** Prometheus triggers ➔ AlertManager groups them ➔ Sends to Slack/Email.
*   **Alert Fatigue:** We avoid "Alert Storms" by grouping similar alerts so engineers don't get overwhelmed and ignore them.

---

## 📏 SRE Concepts: SLI, SLO, and SLA

These are the metrics that define "Success" in an industry environment:
*   **SLI (Indicator):** What we measure (e.g., Latency).
*   **SLO (Objective):** Our target (e.g., Latency < 200ms).
*   **SLA (Agreement):** Our business contract (e.g., "We will be up 99.9% of the time").

---

## ⚖️ Beginner vs. Industry Monitoring

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Visibility** | `console.log()` | **Centralized Dashboards (Grafana)** |
| **Storage** | None (Logs lost on restart) | **Time-Series DB & Loki Aggregation** |
| **Detection** | Manual checking | **Automated Alerting (AlertManager)** |
| **Context** | "Something broke" | **Golden Signals (Latency, Traffic, Errors, Saturation)** |

---

## 🧩 Mental Models for Observability
1.  **Hospital ICU:** Continuous health monitoring + emergency alarms.
2.  **Airplane Cockpit:** Pilots rely on dials and telemetry to fly, not just looking out the window.
3.  **Security Control Room:** Centralized visibility across every "room" (service) in the infrastructure.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:11998e,100:38ef7d&height=100&section=footer" width="100%" />
</p>