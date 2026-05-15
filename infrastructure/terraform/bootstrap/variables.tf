variable "aws_region" {
  description = "The AWS region to deploy the bootstrap infrastructure into."
  type        = string
  default     = "us-east-1"
}

variable "state_bucket_name" {
  description = "Name of the S3 bucket to store Terraform state. Must be globally unique."
  type        = string
  default     = "cloud-sentinel-terraform-state-prod"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for state locking."
  type        = string
  default     = "cloud-sentinel-terraform-locks"
}
