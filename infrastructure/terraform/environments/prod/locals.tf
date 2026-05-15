locals {
  environment = "prod"
  project     = "cloud-sentinel"
  
  # Enterprise FinOps Tagging Governance
  common_tags = {
    Environment   = local.environment
    Project       = local.project
    ManagedBy     = "Terraform"
    CostCenter    = "engineering-core"
    Criticality   = "tier-1"
    Compliance    = "soc2"
  }
}
