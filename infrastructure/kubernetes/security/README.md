<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:cb2d3e,100:ef473a&height=300&section=header&text=Platform%20Security&fontSize=80&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🛡️ Enterprise Production Runtime Hardening</h3>
<p align="center"><strong>"Zero-Trust Networks • Immutable Execution • Disaster Recovery Preparedness"</strong></p>

<p align="center">
  <a href="https://kubernetes.io/docs/concepts/security/pod-security-standards/"><img src="https://img.shields.io/badge/Pod_Security-Restricted-CB2D3E?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Pod Security" /></a>
  <a href="https://kubernetes.io/docs/reference/access-authn-authz/rbac/"><img src="https://img.shields.io/badge/RBAC-Least_Privilege-EF473A?style=for-the-badge&logo=springsecurity&logoColor=white" alt="RBAC" /></a>
  <a href="https://kubernetes.io/docs/concepts/services-networking/network-policies/"><img src="https://img.shields.io/badge/Network-Zero_Trust-CB2D3E?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Network" /></a>
  <a href="https://velero.io/"><img src="https://img.shields.io/badge/Disaster_Recovery-Velero_Ready-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Velero" /></a>
</p>

---

A strict, highly constrained **Governance Framework** built to lock down the Cloud Sentinel Platform against lateral threat escalation, ensuring node scheduling predictability and strict workload reliability.

---

## 🔒 1. Pod Security Standards (Phase 6A)
Kubernetes namespaces are rigidly locked using Kubernetes native **Pod Security Standards (PSS)** mapping:
*   **Restricted Profile (`sentinel-apps`)**: Forbids privileged escalation, drops all capabilities, blocks hostPath mounting, and demands non-root execution profiles (`runAsNonRoot: true`).
*   **Baseline Profile (`sentinel-ingress`, `sentinel-monitoring`)**: Safely scopes network proxy services (`NET_BIND_SERVICE`) and host-logging mounts without offering raw host PID or root isolation breaks.

---

## 🔑 2. Role-Based Access Control Governance (Phase 6B)
Administrative surface areas are aggressively constrained using strict `Role` and `RoleBinding` associations:
*   **No Default Automounting**: `api-gateway-sa` explicitly unmounts cluster API tokens to halt any downstream API reconnaissance attacks originating from container compromises.
*   **Operational Separation**: `workload-operator` roles permit purely `get/list/watch` commands against deployment layers, preventing direct imperative hot-patching.

---

## 🕸️ 3. Advanced Egress Network Policy (Phase 6C)
Egress traffic is fundamentally blocked on all tenant workloads using `default-deny-egress` models.
*   **DNS & Intranet Whitelists**: Pods are explicitly permitted to negotiate only with core API boundaries and the local observability (`sentinel-monitoring`) ingestion layer via specifically mapped ports (`9090`, `3100`).

---

## 📦 4. Supply Chain & Image Security Strategy (Phase 6D)
Enterprise image rollout integrity relies heavily on verified upstream constraints:
1.  **Immutable Hash Tagging**: CI/CD pipelines tag artifacts with exact Git `sha256` commits instead of mutable `latest` tags.
2.  **Pull Policy Standards**: Enforcement of `imagePullPolicy: IfNotPresent` ensures image digest overrides are caught at node caching levels.
3.  **Future Integration Path (SBOM)**: Docker outputs are structured to integrate seamlessly into modern container scanning mechanisms (Trivy/Grype) prior to GitOps registry commits.

---

## ⚡ 5. Reliability Guardrails (Phase 6E)
Resource constraints are globally enforced to defend against denial-of-service or noisy neighbor disruption.
*   **Compute Quotas**: Strict `ResourceQuotas` assign maximum CPU/Memory allocations to the `sentinel-apps` scope.
*   **Priority Classes**: Ingress APIs receive `sentinel-critical-infra` (Preemption Priority) while standard workloads are mapped appropriately, safeguarding proxy packet flow during node pressure.

---

## 💾 6. Disaster Recovery Architecture (Phase 6F)
To ensure complete state recovery following catastrophic cluster failure, the platform prepares for continuous synchronization:
1.  **GitOps Baseline**: 95% of state is actively declared via ArgoCD. Complete cluster wiping requires zero backup—just point ArgoCD to the repo.
2.  **Stateful Snapshots (Velero)**: Critical persistent TSDB storage (`sentinel-gp3-sc`) utilizes CSI snapshots triggered through future Velero plugin schedules.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:cb2d3e,100:ef473a&height=100&section=footer" width="100%" />
</p>
