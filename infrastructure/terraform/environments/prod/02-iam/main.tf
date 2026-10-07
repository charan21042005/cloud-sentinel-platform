module "iam" {
  source       = "../../../modules/iam"
  environment  = local.environment
  cluster_name = var.cluster_name
}
