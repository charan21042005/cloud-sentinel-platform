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

data "terraform_remote_state" "eks" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/04-eks/terraform.tfstate"
    region = "us-east-1"
  }
}

module "rds" {
  source                   = "../../../modules/rds"
  project                  = local.project
  environment              = local.environment
  vpc_id                   = data.terraform_remote_state.networking.outputs.vpc_id
  subnet_ids               = data.terraform_remote_state.networking.outputs.private_data_subnet_ids
  client_security_group_id = data.terraform_remote_state.eks.outputs.cluster_security_group_id
  kms_key_arn              = data.terraform_remote_state.iam.outputs.kms_key_arn
}
