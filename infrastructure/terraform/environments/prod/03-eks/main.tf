data "terraform_remote_state" "networking" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/01-networking/terraform.tfstate"
    region = "us-east-1"
  }
}
data "terraform_remote_state" "iam" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/02-iam/terraform.tfstate"
    region = "us-east-1"
  }
}
module "eks" {
  source           = "../../../modules/eks"
  environment      = local.environment
  cluster_name     = var.cluster_name
  cluster_role_arn = data.terraform_remote_state.iam.outputs.cluster_role_arn
  kms_key_arn      = data.terraform_remote_state.iam.outputs.kms_key_arn
  subnet_ids       = data.terraform_remote_state.networking.outputs.private_app_subnet_ids
}
