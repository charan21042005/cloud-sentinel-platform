terraform {
  backend "s3" {
    bucket         = "cloud-sentinel-terraform-state-434504869339"
    key            = "environments/prod/05-nodes/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cloud-sentinel-terraform-locks"
    encrypt        = true
  }
}
