variable "environment" {
  description = "Environment name (e.g. prod, dev)"
  type        = string
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "private_app_subnets" {
  description = "CIDR blocks for private app subnets"
  type        = list(string)
}

variable "private_data_subnets" {
  description = "CIDR blocks for private data subnets"
  type        = list(string)
}

variable "cluster_name" {
  description = "Name of the EKS cluster (for tagging)"
  type        = string
}
