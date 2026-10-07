terraform {
  backend "s3" {
    bucket  = "cloud-sentinel-terraform-state-434504869339"
    key     = "environments/prod/06-rds/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
