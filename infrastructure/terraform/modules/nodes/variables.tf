variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
}

variable "cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for the EKS worker nodes."
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs to place the worker nodes into (Private App subnets)."
  type        = list(string)
}

variable "instance_types" {
  description = "List of instance types for the node group."
  type        = list(string)
  default     = ["t3.small"]
}

variable "desired_size" {
  description = "Desired number of worker nodes."
  type        = number
  default     = 1
}

variable "min_size" {
  description = "Minimum number of worker nodes."
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of worker nodes."
  type        = number
  default     = 2
}

variable "cluster_security_group_id" {
  description = "Security group ID of the EKS cluster to associate with the launch template."
  type        = string
}
