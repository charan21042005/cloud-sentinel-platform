variable "environment" {
  description = "Environment name (e.g., prod, staging, dev)"
  type        = string
}

variable "cluster_name" {
  description = "The name of the EKS cluster to associate these IAM roles with."
  type        = string
}
