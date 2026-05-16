# -----------------------------------------------------------------------------
# Cloud Sentinel Production Infrastructure
# -----------------------------------------------------------------------------

module "networking" {
  source = "../../modules/networking"

  environment        = local.environment
  cluster_name       = var.cluster_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  public_subnets       = var.public_subnets
  private_app_subnets  = var.private_app_subnets
  private_data_subnets = var.private_data_subnets
}

module "iam" {
  source = "../../modules/iam"

  environment  = local.environment
  cluster_name = var.cluster_name
}

module "eks" {
  source = "../../modules/eks"

  environment      = local.environment
  cluster_name     = var.cluster_name
  cluster_role_arn = module.iam.cluster_role_arn
  kms_key_arn      = module.iam.kms_key_arn

  # EKS ENIs are explicitly placed in the Private App subnets
  subnet_ids = module.networking.private_app_subnet_ids
}

module "nodes" {
  source = "../../modules/nodes"

  environment               = local.environment
  cluster_name              = var.cluster_name
  node_role_arn             = module.iam.node_role_arn
  subnet_ids                = module.networking.private_app_subnet_ids
  cluster_security_group_id = module.eks.cluster_security_group_id

  # FinOps Constraints: Minimal Compute Sizing
  desired_size   = 1
  min_size       = 1
  max_size       = 2
  instance_types = ["t3.small"]
}
