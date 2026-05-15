<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8e2de2,100:4a00e0&height=300&section=header&text=Chaos%20Engineering&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🌪️ Failure Simulation & SRE Operational Validation</h3>
<p align="center"><strong>"Test Production Bounds • Validate Recovery • Eradicate Brittleness"</strong></p>

<p align="center">
  <a href="https://chaos-mesh.org/"><img src="https://img.shields.io/badge/Chaos_Mesh-Native-8E2DE2?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Chaos Mesh" /></a>
  <a href="https://argoproj.github.io/cd/"><img src="https://img.shields.io/badge/GitOps-Self_Healing-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" alt="ArgoCD" /></a>
  <a href="https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/"><img src="https://img.shields.io/badge/Validation-HPA_Burst-4A00E0?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Validation" /></a>
  <a href="https://sre.google/"><img src="https://img.shields.io/badge/Runbooks-SRE_Approved-326CE5?style=for-the-badge&logo=google&logoColor=white" alt="Runbooks" /></a>
</p>

---

The **Cloud Sentinel Chaos Engineering** suite is designed to deliberately and mathematically break underlying infrastructure boundaries in order to aggressively validate our Phase 7 High Availability engineering and Phase 5 GitOps reconciliation loops.

---

## 🎯 1. Chaos Framework Boundaries (Phase 8A)
All chaos tests strictly operate from within the tightly constrained `sentinel-chaos` namespace.
*   **Blast Radius Governance**: Chaos agents are bound by `chaos-injector-role` restricting them explicitly to the `sentinel-apps` and `sentinel-monitoring` perimeters. They cannot mutate critical Kubernetes control planes (like `kube-system`).
*   **GitOps Orchestrated Failures**: Failures are declared as code. If an experiment spirals out of control, ArgoCD can delete the `PodChaos` custom resource to instantly cease destruction.

---

## 💥 2. Workload & Node Failure Simulation (Phase 8B)
We actively validate the resilience of our HA Scheduling rules:
*   **Pod Deletion Recovery**: `api-gateway-pod-kill` arbitrarily massacres frontend APIs. We validate that native ReplicaSets instantly replace the dead nodes before the Ingress controllers return a 502 Bad Gateway to the user.
*   **Observability Restarts**: `prometheus-restart-survival` kills TSDB nodes to ensure persistent volume bindings successfully re-attach under volatile conditions.

---

## 🚦 3. Autoscaling & Network Validation (Phase 8C & 8E)
We aggressively validate our HPA thresholds and Network Timeout resilience:
*   **Latency Injection**: `api-latency-injection` forces a synthetic 200ms delay into the networking stack. We validate that WebSocket pipelines buffer seamlessly rather than violently dropping live SOC telemetry feeds.
*   **Load Spikes**: Synthetic traffic generators ensure that HPA stabilization windows perform perfectly, absorbing bursts and cooling down predictably.

---

## 🔄 4. GitOps Drift & Operational Runbooks (Phase 8D & 8F)
If an engineer accidentally bypasses CI/CD and manually deletes a deployment, ArgoCD must fix it. Below are the core Operational Runbooks for handling production degradation:

### 📖 SRE Runbook: Node Outage Simulation
1.  **Symptom**: Underlying physical EC2/VM node goes offline.
2.  **Validation Check**: PodAntiAffinity constraints ensure that at least 66% of the API gateway remains actively serving on surviving nodes.
3.  **Recovery**: ArgoCD senses missing replicas and schedules new ones on healthy nodes. Operator monitors the `frontend-dashboard` to ensure no 500 errors hit the user.

### 📖 SRE Runbook: GitOps Desynchronization
1.  **Symptom**: An operator manually edits a `Service` or `Deployment` bypassing Git.
2.  **Validation Check**: ArgoCD flags the application as `OutOfSync`.
3.  **Recovery**: ArgoCD's automated Self-Heal policy instantly overwrites the rogue manual changes, resetting the cluster to match the exact `main` branch Git state.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8e2de2,100:4a00e0&height=100&section=footer" width="100%" />
</p>
