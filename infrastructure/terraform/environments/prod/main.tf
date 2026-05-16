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
