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
    key    = "environments/prod/03-eks/terraform.tfstate"
    region = "us-east-1"
  }
}
module "nodes" {
  source                    = "../../../modules/nodes"
  environment               = local.environment
  cluster_name              = var.cluster_name
  node_role_arn             = data.terraform_remote_state.iam.outputs.node_role_arn
  subnet_ids                = data.terraform_remote_state.networking.outputs.private_app_subnet_ids
  cluster_security_group_id = data.terraform_remote_state.eks.outputs.cluster_security_group_id
  desired_size              = 2
  min_size                  = 1
  max_size                  = 2
  instance_types            = ["t3.small"]
}
