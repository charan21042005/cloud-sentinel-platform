locals {
  environment = "prod"
  project     = "cloud-sentinel"
  common_tags = {
    Environment = local.environment
    Project     = local.project
    ManagedBy   = "Terraform"
    Compliance  = "soc2"
    CostCenter  = "engineering-core"
    Criticality = "tier-1"
  }
}
