locals {
  environment = "prod"
  project     = "cloud-sentinel"
  common_tags = {
    Environment = local.environment
    Project     = local.project
    ManagedBy   = "Terraform"
    CostCenter  = "engineering-core"
    Criticality = "tier-1"
    Compliance  = "soc2"
  }
}
