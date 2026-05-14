<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff758c,100:ff7eb3&height=300&section=header&text=GitOps%20Automation&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">⚙️ Continuous Deployment & GitOps Automation Architecture</h3>
<p align="center"><strong>"Self-Reconciling Delivery • Automated Wave Sequencing • Sealed Secrets Lifecycle"</strong></p>

<p align="center">
  <a href="https://argoproj.github.io/cd/"><img src="https://img.shields.io/badge/ArgoCD-App__of__Apps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" alt="ArgoCD" /></a>
  <a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/Pipeline-Validation__Gated-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" /></a>
  <a href="https://external-secrets.io/"><img src="https://img.shields.io/badge/Secrets-External__Store-8B5CF6?style=for-the-badge&logo=springsecurity&logoColor=white" alt="External Secrets" /></a>
  <a href="https://kustomize.io"><img src="https://img.shields.io/badge/Sync-Wave__Ordered-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Sync Ordering" /></a>
</p>

---

A resilient, **GitOps-native release engineering backbone** designed to enforce deterministic declarative environments, automatically drift-reconcile production runtime resources, and decouple secret encryption lifecycles from application runtime routes.

---

## 🌊 1. Application-of-Apps Sync Ordering (Phase 5A)
To guarantee that low-level networking and storage provisioners are verified and healthy before high-level UI/API workloads instantiate, the **Cloud Sentinel Platform** implements a deterministic sync-wave priority model managed via a root orchestration manifest (`root-app-of-apps.yaml`).

```mermaid
graph TD
    classDef cd fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#9d174d,rx:10px,ry:10px;
    classDef root fill:#ffedd5,stroke:#ea580c,stroke-width:1px,color:#9a3412,rx:5px,ry:5px;
    classDef wave fill:#e0f2fe,stroke:#0284c7,stroke-width:1px,color:#0369a1,rx:5px,ry:5px;
    classDef target fill:#fef3c7,stroke:#d97706,stroke-width:1px,color:#b45309,rx:5px,ry:5px;

    subgraph GitOpsFabric["ArgoCD Automation Control Plane"]
        Root["sentinel-root-app-of-apps<br/>(Master Discovery Loop)"]:::root

        W1["sentinel-infra-core<br/>Sync-Wave: -10"]:::wave
        W2["sentinel-ingress-controller<br/>Sync-Wave: -5"]:::wave
        W3["sentinel-monitoring-platform<br/>Sync-Wave: 0"]:::wave
        W4["sentinel-workloads<br/>Sync-Wave: +5"]:::wave

        Root -->|"Discovers & Syncs"| W1
        Root -->|"Discovers & Syncs"| W2
        Root -->|"Discovers & Syncs"| W3
        Root -->|"Discovers & Syncs"| W4
    end

    subgraph RuntimeReconciliation["Target Namespace Rollouts"]
        T1["StorageClasses & Namespace Maps<br/>(base/)"]:::target
        T2["NGINX Proxy Controllers<br/>(sentinel-ingress)"]:::target
        T3["Prometheus/Grafana Stacks<br/>(sentinel-monitoring)"]:::target
        T4["Next.js UI & FastAPI Nodes<br/>(sentinel-apps)"]:::target
    end

    W1 -->|"Applies First"| T1
    W2 -->|"Applies Second"| T2
    W3 -->|"Applies Third"| T3
    W4 -->|"Applies Fourth"| T4

    class GitOpsFabric,RuntimeReconciliation cd;
```

---

## 🔄 2. Environment Promotion Lifecycle (Phase 5D)
Our release engineering pipeline forbids manual hot-patching. Container tags progress deterministically through automated continuous integration gates:

```text
[ Feature Branch Push ]
         │
         ▼
[ CI Manifest Validations ] ──( kubeconform / dry-run lint )──► [ Auto-Reject on Failure ]
         │
         ▼
[ Dev Overlay Sync ] ────────► Commit SHA pinned to dev channel
         │
         ▼
[ Staging Verification ] ────► End-to-End Test Execution Loop
         │
         ▼
[ Production Release ] ──────► Merge to main triggers immutable production rollout
```

---

## 🔐 3. Secrets & Configuration Governance (Phase 5E)
To support both decentralized GitOps source repositories and strict enterprise cloud security perimeters, we combine two distinct key handling models:
1.  **SealedSecrets Architecture**: Uses asymmetric private-key controllers inside the cluster to safely store encrypted secret configuration values straight into Git repository trees without leaking access keys.
2.  **ExternalSecrets Framework**: Dynamically maps cross-account AWS Systems Manager ParameterStore references (`ClusterSecretStore`) to inject short-lived OAuth tokens and container connection credentials during live synchronization cycles.

---

## 🛡️ 4. Operational Deployment Reliability (Phase 5F)
The architecture embeds robust health checking configurations directly into application definitions:
*   **Progressive Rollout Safety**: Uses native ArgoCD resource state badges and out-of-sync indicators to instantly detect configuration drift.
*   **Pruning Failsafes**: Configures retry backoffs alongside dry-run checks to prevent destructive teardown sweeps if physical API node connectivity drops.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:ff758c,100:ff7eb3&height=100&section=footer" width="100%" />
</p>
