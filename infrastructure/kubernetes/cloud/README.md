<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0052D4,50:4364F7,100:6FB1FC&height=300&section=header&text=Cloud%20Productionization&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">☁️ Enterprise Managed Cloud Architecture (EKS / GKE / AKS)</h3>
<p align="center"><strong>"Managed Identity • Layer 4 Edge Networking • Autonomous Elasticity"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/eks/"><img src="https://img.shields.io/badge/Provider-EKS_Ready-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS EKS" /></a>
  <a href="https://karpenter.sh/"><img src="https://img.shields.io/badge/Compute-Karpenter_JIT-4364F7?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Karpenter" /></a>
  <a href="https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html"><img src="https://img.shields.io/badge/Identity-IRSA_Bound-0052D4?style=for-the-badge&logo=springsecurity&logoColor=white" alt="IRSA" /></a>
  <a href="https://github.com/kubernetes-sigs/external-dns"><img src="https://img.shields.io/badge/DNS-ExternalDNS-6FB1FC?style=for-the-badge&logo=cloudflare&logoColor=white" alt="ExternalDNS" /></a>
</p>

---

The **Cloud Sentinel Platform** is fully abstracted for enterprise production deployment on managed cloud providers. The configurations within this module bridge native Kubernetes primitives to physical cloud provider infrastructure logic seamlessly.

---

## 🏗️ 1. Cloud Load Balancing & DNS (Phase 9B)
Rather than relying on primitive `NodePort` mapping, the platform binds directly to robust Cloud network edges:
*   **Layer 4 NLB Integration**: The `ingress-nginx-controller` is patched with `service.beta.kubernetes.io/aws-load-balancer-type` annotations, prompting the cloud provider to provision a highly available Network Load Balancer (NLB) capable of millions of requests per second.
*   **WAF & TLS Edge Defense**: AWS ACM Certificates and Web Application Firewall (WAF) WebACLs are statically bound directly to the NLB, ensuring malicious payloads are neutralized at the cloud edge before hitting the Kubernetes cluster.
*   **ExternalDNS Sync**: Route53 domains are automatically updated as Ingress rules are applied to the cluster via GitOps.

---

## 🔐 2. Cloud IAM & Identity Governance (Phase 9C)
We strictly forbid the mounting of long-lived access keys (like AWS `ACCESS_KEY_ID`) inside container definitions.
*   **IRSA (IAM Roles for Service Accounts)**: Workloads assume specific Cloud Identity roles natively. E.g., The `external-secrets-sa` utilizes an `eks.amazonaws.com/role-arn` to communicate with AWS Secrets Manager dynamically, utilizing short-lived tokens governed by the Kubernetes API.

---

## 💾 3. Managed Storage Interfaces (Phase 9D)
Data persistence shifts from primitive local-path storage to highly resilient cloud volumes:
*   **CSI Native Volumes**: The `sentinel-gp3-sc` StorageClass communicates over the `ebs.csi.aws.com` driver to provision encrypted, multi-AZ replicated block storage dynamically as pods request it.
*   **Snapshot Resilience**: VolumeSnapshotClass structures prepare the environment for Velero-driven disaster recovery loops.

---

## 📈 4. Cluster Elasticity & Karpenter (Phase 9E)
Standard Horizontal Pod Autoscaling (HPA) only scales pods. To scale the underlying physical servers, we integrate **Karpenter**:
*   **Just-In-Time Node Provisioning**: The `NodePool` definition bypasses static Auto Scaling Groups (ASGs). If an HPA demands 20 new pods, Karpenter analyzes the footprint, purchases precisely-sized Spot or On-Demand EC2 instances, and joins them to the cluster in milliseconds.
*   **Consolidation**: When traffic dies, Karpenter violently defragments the cluster by moving pods and terminating underutilized nodes to minimize hourly cloud compute costs.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0052D4,50:4364F7,100:6FB1FC&height=100&section=footer" width="100%" />
</p>
