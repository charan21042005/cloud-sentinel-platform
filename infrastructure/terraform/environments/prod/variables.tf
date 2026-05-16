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

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnets" {
  description = "CIDR blocks for private app subnets"
  type        = list(string)
  default     = ["10.0.16.0/20", "10.0.32.0/20", "10.0.48.0/20"]
}

variable "private_data_subnets" {
  description = "CIDR blocks for private data subnets"
  type        = list(string)
  default     = ["10.0.64.0/24", "10.0.65.0/24", "10.0.66.0/24"]
}
