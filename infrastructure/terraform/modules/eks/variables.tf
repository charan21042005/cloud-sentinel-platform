variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
}

variable "cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster."
  type        = string
  default     = "1.30" # Match remote deployed state
}

variable "cluster_role_arn" {
  description = "IAM role ARN for the EKS control plane."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs to place the EKS cluster ENIs into (Private App subnets)."
  type        = list(string)
}

variable "kms_key_arn" {
  description = "KMS Key ARN for Envelope Encryption of Kubernetes secrets."
  type        = string
}
