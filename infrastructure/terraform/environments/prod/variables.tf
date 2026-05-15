variable "aws_region" {
  description = "The AWS region to deploy the production environment into."
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
  default     = "cloud-sentinel-prod"
}

variable "vpc_cidr" {
  description = "The CIDR block for the production VPC."
  type        = string
  default     = "10.0.0.0/16"
}
