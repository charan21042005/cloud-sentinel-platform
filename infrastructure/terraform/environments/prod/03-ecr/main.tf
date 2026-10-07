module "ecr" {
  source       = "../../../modules/ecr"
  environment  = local.environment
  project      = local.project
  repositories = var.repositories
}
