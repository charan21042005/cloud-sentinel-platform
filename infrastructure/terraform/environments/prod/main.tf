# -----------------------------------------------------------------------------
# Cloud Sentinel Production Environment
# -----------------------------------------------------------------------------
# This file serves as the root module for the Production environment.
# Future phases will instantiate shared modules (VPC, EKS, IAM) here.

# Example structure for Phase 2:
# module "networking" {
#   source   = "../../modules/networking"
#   vpc_cidr = var.vpc_cidr
# }

# module "eks" {
#   source       = "../../modules/eks"
#   cluster_name = var.cluster_name
#   vpc_id       = module.networking.vpc_id
#   subnet_ids   = module.networking.private_subnets
# }
