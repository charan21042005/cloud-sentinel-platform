<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:0369A1&height=300&section=header&text=Cloud%20Sentinel%20Helm%20Stack&fontSize=50&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Cloud Sentinel Cloud Sentinel Helm Stack</h3>
<p align="center"><strong>"Umbrella Packaging • Versioned Deployments • Templated Rollouts"</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Package_Management-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Managed_By-Helm-0EA5E9?style=for-the-badge&logo=helm&logoColor=white" alt="Managed By Helm" />
  <img src="https://img.shields.io/badge/Environment-Production_Ready-0369A1?style=for-the-badge&logo=helm&logoColor=white" alt="Environment" />
</p>

---

The **Cloud Sentinel Helm Stack** provides Umbrella Helm chart for packaging and deploying the entire platform. It enables seamless, reproducible installations of the platform across any Kubernetes environment.

---

## 🏗️ 1. Architecture & Packaging Decisions
We have engineered this Helm chart to act as the primary distribution method for environments that don't rely strictly on Kustomize:
*   **Umbrella Structure**: This chart wraps multiple sub-charts (dependencies), allowing one-click deployment of the full SOC platform.
*   **Templated Values**: A robust `values.yaml` acts as the single source of truth, enabling easy environment overrides.
*   **Release Management**: Helm provides built-in rollback mechanisms and atomic upgrades for safer production transitions.

---

## 🚀 2. Quick Start & Validation
To validate this Helm chart locally before an installation:

```bash
cd infrastructure/kubernetes/helm/cloud-sentinel-stack
helm lint .
helm template my-release .
```

To install or upgrade the stack:
```bash
helm upgrade --install cloud-sentinel . --namespace sentinel-apps --create-namespace
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:0369A1&height=100&section=footer" width="100%" />
</p>
