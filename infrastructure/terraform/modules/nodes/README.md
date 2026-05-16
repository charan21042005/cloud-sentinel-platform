<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:34A853,100:0F9D58&height=300&section=header&text=Compute%20Layer&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🖥️ Amazon EKS Managed Compute Nodes</h3>
<p align="center"><strong>"Ephemeral Capacity • Immutable Security • FinOps Scalability"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/ec2/"><img src="https://img.shields.io/badge/Compute-Amazon_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" alt="Amazon EC2" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-IMDSv2-34A853?style=for-the-badge&logo=security&logoColor=white" alt="IMDSv2" /></a>
  <a href="#"><img src="https://img.shields.io/badge/FinOps-Strict_Bounds-0F9D58?style=for-the-badge&logo=cashapp&logoColor=white" alt="FinOps" /></a>
</p>

---

The **Cloud Sentinel Nodes Module** provisions the physical hardware (Worker Nodes) that execute the Kubernetes workloads. We utilize EKS Managed Node Groups to automate the lifecycle, patching, and draining of these instances, ensuring absolute compliance with cloud-native immutability principles.

---

## 🏗️ 1. Architecture & Compute Constraints
To absolutely guarantee the platform does not violate the designated student/demo budget constraints (~$100 total), the physical compute boundaries are strictly constrained:
*   **Instance Sizing**: Forced to `t3.small` (2 vCPU, 2GB RAM). This is the absolute smallest footprint capable of running the `kubelet` daemon while leaving headroom for lightweight observability agents.
*   **Scale Bounds**: The Autoscaler is mathematically blocked from spawning excessive capacity.
    *   `min_size` = 1
    *   `desired_size` = 1
    *   `max_size` = 2

---

## 🛡️ 2. Security & Immutability Baseline
These worker nodes are treated as hostile, ephemeral resources. Human operators are explicitly forbidden from establishing direct persistence.
*   **No SSH Access**: The EC2 key pair requirement has been completely removed. If break-glass access is required, engineers must authenticate via AWS SSM Session Manager.
*   **Encrypted Storage**: The EC2 Launch Template intercepts the node bootstrap process and enforces **EBS Volume Encryption** via KMS for all `/dev/xvda` root partitions.
*   **IMDSv2 Enforcement**: We force the metadata service to require session tokens (`http_tokens = "required"`), completely eliminating the risk of Server-Side Request Forgery (SSRF) data exfiltration.
*   **Private Subnet Isolation**: Nodes are spawned exclusively in the `private_app` tier. They possess no public IP addresses.

---

## 🏷️ 3. Node Labeling & Segregation
We inject standard Kubernetes labels directly at the Terraform level. This allows the Kubernetes scheduler to perform advanced bin-packing and workload segregation without requiring manual `kubectl label` commands.
```hcl
labels = {
  "role"                               = "core-compute"
  "platform.sentinel.io/observability" = "true"
  "platform.sentinel.io/system"        = "true"
}
```

---

## 🚀 4. Interaction & Validation
After applying this module, you can verify the compute capacity directly via Kubernetes:

```bash
# 1. Update your local credentials
aws eks update-kubeconfig --region us-east-1 --name cloud-sentinel-prod

# 2. Verify the physical compute layer is ready
kubectl get nodes -L role,instance-type

# Expected Output: 
# NAME                             STATUS   ROLES    AGE   VERSION   ROLE           INSTANCE-TYPE
# ip-10-0-16-42.ec2.internal       Ready    <none>   2m    v1.28     core-compute   t3.small
```

### ⚠️ Destroy Workflow Guidance
When executing `terraform destroy`, Terraform will coordinate with the Kubernetes API to safely **cordon and drain** the node. Do not interrupt this process. If you force-kill the Terraform execution during a destroy, the underlying EC2 instances may become orphaned and continue accruing hourly charges.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:34A853,100:0F9D58&height=100&section=footer" width="100%" />
</p>
