terraform {
  backend "s3" {
    bucket         = "cloud-sentinel-terraform-state-prod"
    key            = "environments/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cloud-sentinel-terraform-locks"
    encrypt        = true
  }
}
