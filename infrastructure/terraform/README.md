<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:5e2563,100:654ea3&height=300&section=header&text=Terraform%20Architecture&fontSize=70&animation=fadeIn&fontAlignY=38&fontColor=ffffff" width="100%" />
</p>

<h3 align="center">🏗️ Enterprise Infrastructure-as-Code (IaC) Foundation</h3>
<p align="center"><strong>"Modular • State-Locked • Environment-Isolated • FinOps Governed"</strong></p>

<p align="center">
  <a href="https://www.terraform.io/"><img src="https://img.shields.io/badge/IaC-Terraform-5e2563?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform" /></a>
  <a href="https://aws.amazon.com/s3/"><img src="https://img.shields.io/badge/State-S3_Backend-654ea3?style=for-the-badge&logo=amazons3&logoColor=white" alt="S3 Backend" /></a>
  <a href="https://aws.amazon.com/dynamodb/"><img src="https://img.shields.io/badge/Locking-DynamoDB-5e2563?style=for-the-badge&logo=amazondynamodb&logoColor=white" alt="DynamoDB" /></a>
</p>

---

The **Cloud Sentinel Terraform Architecture** establishes the physical AWS cloud foundation required to host the Kubernetes platform. It enforces strict separation of concerns, utilizing isolated state files per environment and highly reusable module boundaries.

---

## 🗂️ 1. Directory Architecture
The repository strictly adheres to Enterprise IaC best practices, forbidding raw monolithic `.tf` structures in favor of scoped modularity:

*   **`bootstrap/`**: Contains the "Chicken-and-Egg" state persistence infrastructure (S3 Buckets and DynamoDB lock tables). This is applied once.
*   **`environments/`**: The operational entrypoints. Isolated directories (`dev`, `staging`, `prod`) that instantiate reusable modules. Each environment possesses a distinct remote state file to prevent blast-radius crossover.
*   **`modules/`**: Reusable, abstracted infrastructure components (`networking`, `eks`, `iam`, etc.). Modules do not define providers or backend blocks.
*   **`policies/`**: Reserved for future HashiCorp Sentinel or OPA (Open Policy Agent) compliance-as-code rules.

---

## 🔒 2. Remote State & Locking Mechanism
To prevent state corruption and allow CI/CD pipelines (GitHub Actions) to safely execute concurrent runs:
*   **AES256 Encrypted S3 Bucket**: Stores the `.tfstate` files securely with versioning enabled, allowing rollback of corrupted states.
*   **DynamoDB Lock Table**: Utilizes `PAY_PER_REQUEST` billing mode to establish a Mutex lock via `LockID`. If a developer is running `terraform apply`, the CI pipeline is physically blocked from mutating the infrastructure simultaneously.

---

## 🏷️ 3. Tagging & FinOps Governance
Universal tagging is enforced at the AWS Provider level and via `locals.tf` to satisfy Phase 10 FinOps requirements natively at the infrastructure layer:
```hcl
locals {
  common_tags = {
    Environment   = "prod"
    Project       = "cloud-sentinel"
    ManagedBy     = "Terraform"
    CostCenter    = "engineering-core"
    Criticality   = "tier-1"
    Compliance    = "soc2"
  }
}
```

---

## 🚀 4. Deployment Workflow (Bootstrapping)
To initialize this infrastructure from scratch:

1.  **Initialize the Bootstrap**:
    ```bash
    cd bootstrap/
    terraform init
    terraform apply -auto-approve
    ```
2.  **Initialize the Production Environment**:
    ```bash
    cd ../environments/prod/
    terraform init
    terraform validate
    terraform plan
    ```

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:5e2563,100:654ea3&height=100&section=footer" width="100%" />
</p>
