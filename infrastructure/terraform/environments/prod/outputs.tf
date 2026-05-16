output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "IDs of the private app subnets"
  value       = module.networking.private_app_subnet_ids
}

output "private_data_subnet_ids" {
  description = "IDs of the private data subnets"
  value       = module.networking.private_data_subnet_ids
}

output "cluster_role_arn" {
  description = "The ARN of the EKS control plane role"
  value       = module.iam.cluster_role_arn
}

output "node_role_arn" {
  description = "The ARN of the default worker node role"
  value       = module.iam.node_role_arn
}

output "kms_key_arn" {
  description = "The ARN of the KMS key for EKS secret encryption"
  value       = module.iam.kms_key_arn
}
