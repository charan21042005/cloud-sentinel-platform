output "cluster_role_arn" {
  description = "The ARN of the IAM role for the EKS control plane"
  value       = aws_iam_role.cluster_role.arn
}

output "node_role_arn" {
  description = "The ARN of the IAM role for default worker nodes"
  value       = aws_iam_role.node_role.arn
}

output "karpenter_node_role_name" {
  description = "The name of the IAM role utilized by Karpenter for JIT nodes"
  value       = aws_iam_role.karpenter_node_role.name
}

output "karpenter_node_profile_name" {
  description = "The Instance Profile name for Karpenter nodes"
  value       = aws_iam_instance_profile.karpenter_node_profile.name
}

output "kms_key_arn" {
  description = "The ARN of the KMS key used for encrypting EKS secrets"
  value       = aws_kms_key.eks_secrets.arn
}
