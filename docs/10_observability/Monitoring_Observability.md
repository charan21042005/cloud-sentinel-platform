<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:373B44,100:4286f4&height=300&section=header&text=Monitoring%20and%20Observability&fontSize=60&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">📊 Phase 14: Monitoring & Observability</h3>
<p align="center"><strong>"The Eyes and Ears of Cloud Sentinel Platform"</strong></p>
<p align="center"><strong>Prometheus • Grafana • Loki • AlertManager • Metrics</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase-Observability-373B44?style=for-the-badge&logoColor=white" alt="Observability Phase" />
  <img src="https://img.shields.io/badge/Stack-LGTM-4286f4?style=for-the-badge&logoColor=white" alt="LGTM Stack" />
  <img src="https://img.shields.io/badge/Goal-Total--Visibility-373B44?style=for-the-badge&logoColor=white" alt="Goal" />
</p>

---

## 📑 Table of Contents
* [14.1 Why Monitoring is the Soul of SRE](#-141-why-monitoring-is-the-soul-of-sre)
* [14.2 The "LGTM" Stack Overview](#-142-the-lgtm-stack-overview)
* [14.3 Prometheus: Metrics Collection](#-143-prometheus-metrics-collection)
* [14.4 Grafana: Visualizing Reality](#-144-grafana-visualizing-reality)
* [14.5 Loki: The Modern Logging Standard](#-145-loki-the-modern-logging-standard)
* [14.6 AlertManager: Incident Notification](#-146-alertmanager-incident-notification)
* [14.7 Beginner vs. Industry Observability](#-147-beginner-vs-industry-observability)
* [14.8 Mental Models for Observability](#-148-mental-models-for-observability)

---

## 🧐 14.1 Why Monitoring is the Soul of SRE

In the industry, a system is only as good as its visibility. If your backend is slow but you don't have a graph showing **why**, you are flying blind.
*   **The Goal:** Moving from "I think it's broken" to "I **know** the Database Latency is 200ms."
*   **The SRE Truth:** Monitoring doesn't just fix problems; it prevents them by showing trends (e.g., "Memory usage is slowly growing over time").

---

## 🏗️ 14.2 The "LGTM" Stack Overview

We use the industry-standard **LGTM** stack (Loki, Grafana, Tempo, Prometheus). In Cloud Sentinel, we focus on:
1.  **Loki:** Log Aggregation.
2.  **Grafana:** Visualization.
3.  **Prometheus:** Metrics.

---

## 🔥 14.3 Prometheus: Metrics Collection

Prometheus is a time-series database. It "scrapes" (pulls) numerical data from our microservices every few seconds.
*   **Target Metrics:** CPU usage, RAM, Number of HTTP 500 Errors, and Request Latency.
*   **Analogy:** A **Heart Rate Monitor** for your application. It records every beat and pulse.

---

## 📊 14.4 Grafana: Visualizing Reality

Raw numbers are hard for humans to read. **Grafana** connects to Prometheus and turns those numbers into beautiful, interactive dashboards.
*   **The Role:** It is the "Single Pane of Glass" for the entire engineering team.
*   **Key Dashboards:** We monitor "The Four Golden Signals"—Latency, Traffic, Errors, and Saturation.

---

## 🪵 14.5 Loki: The Modern Logging Standard

Loki is like Prometheus, but for **Logs**. Unlike heavy tools like ELK, Loki is designed for high-speed cloud-native logs.
*   **Searchability:** It lets us search through millions of log lines from all our containers in one place.
*   **Efficiency:** It doesn't index every word, making it much faster and cheaper to run in the cloud.

---

## 🚨 14.6 AlertManager: Incident Notification

Monitoring is useless if no one looks at the graphs. **AlertManager** watches the data and triggers an alarm if something goes wrong.
*   **Rules:** "If CPU is > 90% for 2 minutes, send a message."
*   **Channels:** Notifications are sent to Slack, Email, or PagerDuty to wake up the engineer on call.

---

## ⚖️ 14.7 Beginner vs. Industry Observability

| Feature | Beginner | Industry (Our Project) |
| :--- | :--- | :--- |
| **Perspective** | "It's running on my screen" | **Real-time Metrics & Dashboards** |
| **Logging** | Printing to console | **Centralized Log Aggregation (Loki)** |
| **Response** | Waiting for user complaints | **Proactive Alerting (AlertManager)** |
| **Context** | Single-server focus | **Multi-cluster Cluster-wide visibility** |

---

## 🧩 14.8 Mental Models for Observability
1.  **Cockpit:** The dashboards give the pilot total situational awareness.
2.  **CCTV System:** Monitoring every corner of the infrastructure.
3.  **Medical Monitor:** Constant vital signs tracking (Pulse, Blood Pressure).

---

## Continue the Cloud-Native Journey 🚀

> "The watchtower is built. Now, let's learn how to secure this platform against threats using professional DevSecOps and Security principles."

**Previous Module:**
← [Jenkins CI/CD Engineering](../09_cicd/CICD_Engineering.md)

**Next Module:**
→ [Security & DevSecOps](../11_security/Security_DevSecOps.md)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:373B44,100:4286f4&height=100&section=footer" width="100%" />
</p>