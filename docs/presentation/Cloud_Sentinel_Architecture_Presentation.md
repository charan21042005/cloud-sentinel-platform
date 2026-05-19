---
marp: true
theme: default
class: invert
paginate: true
backgroundColor: #0d1117
color: #c9d1d9
---

<!-- slide -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:4facfe,100:00f2fe&height=300&section=header&text=Cloud%20Sentinel%20Platform&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h2 align="center">🚀 Full-Stack Enterprise SRE & Cloud Architecture</h2>
<p align="center"><strong>From Application Code to Production-Grade Kubernetes & GitOps</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Kubernetes-Infrastructure-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" />
  <img src="https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" />
</p>

<p align="center"><strong>Prepared by:</strong> Platform Engineering Team</p>

---

<!-- slide -->
# 🎯 1. The Complete Engineering Journey
This presentation covers the **End-to-End lifecycle** of the Cloud Sentinel Platform. We didn't just build infrastructure; we built the application from scratch to prove the infrastructure works.

**The Roadmap:**
1. 🐍 **Application Layer:** Building the FastAPI Backend & Chaos Engine.
2. ⚛️ **Dashboard Layer:** Building the Next.js Real-Time UI.
3. 🌍 **Infrastructure Layer:** AWS VPC, IAM, and EKS via Terraform.
4. 🐙 **Platform Layer:** GitOps, Ingress, and Observability via Kubernetes.

---

<!-- slide -->
# 🐍 2. Phase 1: Backend Engineering (FastAPI)
<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSockets-Real__Time-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
</p>

**Tech Used:** Python, FastAPI, WebSockets.
**What we built:**
- A high-throughput API Gateway.
- **Chaos Engine (`/api/v1/chaos`):** Endpoints to artificially inject latency, simulate 500 errors, and trigger memory leaks to test system resilience.
- **WebSocket Manager:** Streams live system metrics to the frontend.

**Key Commands Used:**
```bash
python -m venv venv
pip install fastapi uvicorn websockets
uvicorn app.main:app --reload --port 8000
```

---

<!-- slide -->
# ⚛️ 3. Phase 2: Frontend Dashboard (Next.js)
<p align="center">
  <img src="https://img.shields.io/badge/React-UI__Library-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

**Tech Used:** Next.js, React, Recharts, TailwindCSS.
**What we built:**
- A stunning dark-mode SRE operations console.
- **Live Graphs:** Used Recharts to plot real-time CPU/Memory data streamed via WebSockets from the FastAPI backend.
- **Chaos Control Panel:** UI buttons that hit the backend Chaos routes to simulate live production incidents.

**Key Commands Used:**
```bash
npx create-next-app@latest web-dashboard
npm install recharts lucide-react
npm run dev
```

---

<!-- slide -->
# 📊 4. Phase 3: Telemetry & Grafana Integration
Before deploying to the cloud, we established how data flows:

1. **Dashboard ↔ Backend:** The Next.js dashboard connects via WebSockets to FastAPI.
2. **Backend ↔ Prometheus:** FastAPI exposes a `/metrics` route (using Prometheus Python Client) that tracks HTTP requests and Chaos injection counts.
3. **Prometheus ↔ Grafana:** Grafana reads the TSDB and visualizes the exact moment a Chaos Spike is triggered from the Dashboard.

*This proved our application was "Cloud-Ready" and observable.*

---

<!-- slide -->
# 🌍 5. Phase 4: AWS Network Backbone
<p align="center">
  <img src="https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" />
</p>

**Tech Used:** HashiCorp Terraform, AWS VPC.
**What we built:**
- A highly available, Multi-AZ VPC (`10.0.0.0/16`).
- **FinOps Optimization:** We specifically engineered a **Single NAT Gateway** instead of 3, slashing AWS costs for the startup/student budget.

**Key Commands Used:**
```bash
cd infrastructure/terraform/environments/prod
terraform init
terraform plan
terraform apply -auto-approve
```

---

<!-- slide -->
# 🔐 6. Phase 5: Zero-Trust Security (IAM)
<p align="center">
  <img src="https://img.shields.io/badge/AWS__IAM-Least__Privilege-D32F2F?style=for-the-badge&logo=amazonaws&logoColor=white" />
</p>

**Tech Used:** AWS IAM, AWS KMS (Key Management Service).
**What we built:**
- **No static keys:** We created strictly scoped IAM roles for the EKS Control Plane and Worker Nodes.
- **Envelope Encryption:** Provisioned KMS keys to encrypt Kubernetes Secrets natively inside the EKS `etcd` database.

---

<!-- slide -->
# ☸️ 7. Phase 6: EKS Control Plane
<p align="center">
  <img src="https://img.shields.io/badge/Amazon__EKS-Control__Plane-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
</p>

**Tech Used:** Amazon EKS v1.30.
**What we built:**
- The Kubernetes Master nodes, abstracted by AWS.
- Mapped our custom IAM roles to the cluster using `aws-auth`.

**Key Commands Used:**
```bash
# Connecting our local terminal to the AWS Cluster
aws eks update-kubeconfig --region us-east-1 --name cloud-sentinel-prod
kubectl get svc
```

---

<!-- slide -->
# 💻 8. Phase 7: Compute Nodes (FinOps)
**Tech Used:** AWS EC2 Auto Scaling Groups.
**What we built:**
- Hardcoded `t3.small` managed node groups to maintain a near-zero AWS bill.
- **The Scheduling Challenge:** We hit an AWS VPC CNI limitation (`Too many pods`) because a `t3.small` only supports 11 pods.
- **The Fix:** We updated our Terraform configuration (`desired_size = 2`) to safely spin up a second node and grant more IP addresses.

**Key Commands Used:**
```bash
kubectl get nodes
# Validating the new node joined successfully
```

---

<!-- slide -->
# 🐙 9. Phase 8: GitOps Automation
<p align="center">
  <img src="https://img.shields.io/badge/ArgoCD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" />
</p>

**Tech Used:** ArgoCD, Kubernetes Manifests.
**What we built:**
- We deployed ArgoCD *inside* the cluster to continuously pull from GitHub.
- Created an "App of Apps" structure to deploy everything declaratively.

**Key Commands Used:**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
# Accessing the ArgoCD Dashboard
kubectl port-forward svc/argocd-server -n argocd 9090:443
```

---

<!-- slide -->
# 👁️ 10. Phase 9: Observability Stack
**Tech Used:** Prometheus, Grafana, Loki, AWS EBS.
**What we built:**
- **Stateful Persistence:** We mapped Grafana and Prometheus to AWS EBS GP3 volumes using Kubernetes `PersistentVolumeClaims`. If a pod dies, the metrics survive.
- **Loki:** Deployed Promtail as a DaemonSet on our nodes to instantly stream all backend API logs directly into Loki without heavy indexing.

---

<!-- slide -->
# 🚦 11. Phase 10: Edge Routing (Ingress)
<p align="center">
  <img src="https://img.shields.io/badge/NGINX-Ingress-009639?style=for-the-badge&logo=nginx&logoColor=white" />
</p>

**Tech Used:** NGINX Ingress Controller, AWS Network Load Balancer (NLB), Kustomize.
**What we built:**
- Used Kustomize to dynamically pull the AWS-compatible NGINX deployment from GitHub.
- Added a `patch-resources.yaml` to shrink the controller's RAM footprint to `250Mi`, saving our `t3.small` nodes from crashing.

**Key Commands Used:**
```bash
# Triggering ArgoCD to sync the Kustomization
git commit -m "feat(gitops): implement ingress-nginx"
git push
# Retrieving the AWS Cloud URL
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

---

<!-- slide -->
# 🏗️ 12. Full System Flow
```mermaid
graph TD
    classDef aws fill:#ff9900,color:#232f3e,stroke:#232f3e;
    classDef web fill:#000000,color:#fff,stroke:#fff;
    classDef api fill:#009688,color:#fff,stroke:#fff;
    
    User((Client)) -->|Click "Inject Chaos"| Dashboard["Next.js Dashboard"]:::web
    Dashboard -->|HTTP POST /chaos| NLB["AWS NLB"]:::aws
    NLB -->|TCP| Ingress["NGINX Ingress"]
    Ingress -->|Path Routing| API["FastAPI Backend"]:::api
    
    API -->|Memory Spike / Latency| API
    API -->|Metrics Exposed| Prom["Prometheus TSDB"]
    Prom -->|Visualized| Grafana["Grafana Ops UI"]
```

---

<!-- slide -->
# 🏁 13. Conclusion
We did not just write code, and we did not just provision servers. 

We built a **Full-Lifecycle Platform**.
From writing the Python endpoints, to designing the React UI, to scripting the Terraform IaC, to orchestrating the GitOps rollout on AWS EKS—this is the exact blueprint of a modern Cloud Reliability Engineering team.

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production__Ready-00C853?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:4facfe,100:00f2fe&height=100&section=footer" width="100%" />
</p>
