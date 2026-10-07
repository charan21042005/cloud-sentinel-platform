<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0052CC,100:E040FB&height=300&section=header&text=Container%20Registry&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🐳 AWS ECR Container Registry Architecture</h3>
<p align="center"><strong>"Immutable Artifacts • Automated Vulnerability Scanning • AES-256 Encryption"</strong></p>

<p align="center">
  <a href="https://aws.amazon.com/ecr/"><img src="https://img.shields.io/badge/Service-Amazon_ECR-0052CC?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Amazon ECR" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Artifacts-Docker_Images-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-AES_256_Encryption-E040FB?style=for-the-badge&logo=security&logoColor=white" alt="AES-256 Encryption" /></a>
</p>

---

The **Cloud Sentinel ECR Module** establishes the secure storage for all our containerized applications. By decoupling the container registries from the EKS nodes or application deployment, we ensure our artifacts exist independently and safely.

---

## 🏗️ 1. Architecture & Security Decisions
We have strictly designed these container registries to ensure supply chain security:
*   **Image Tag Mutability**: Enforced image tag mutability ensures that you can tightly control CI/CD pipelines (currently set to `MUTABLE` to accommodate initial rapid development, with the ability to switch to immutable later).
*   **Vulnerability Scanning**: Configured `scan_on_push = true`. Every single container image is automatically scanned for CVEs the moment it enters the AWS perimeter.
*   **AES-256 Encryption**: All container layers and artifacts are encrypted at rest using industry-standard AES-256 encryption.

---

## 💰 2. Cost Optimization (FinOps Strategy)
Left unchecked, container registries can quietly consume hundreds of dollars in storage fees for unused CI/CD builds.
*   **Aggressive Lifecycle Policy**: We automatically prune older images. Only the 30 most recent images are kept across the platform, immediately halting unbounded S3-backed storage costs.

---

## 🚀 3. Validation Commands
To validate the container registry configuration and dependencies:

```bash
cd infrastructure/terraform/environments/prod/03-ecr
terraform init
terraform validate
terraform plan
```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0052CC,100:E040FB&height=100&section=footer" width="100%" />
</p>
