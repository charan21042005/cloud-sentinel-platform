variable "aws_region" {
  description = "The AWS region to deploy the production environment into."
  type        = string
  default     = "us-east-1"
}

variable "repositories" {
  description = "List of repositories to create"
  type        = list(string)
  default     = ["api-gateway", "frontend", "traffic-generator"]
}
