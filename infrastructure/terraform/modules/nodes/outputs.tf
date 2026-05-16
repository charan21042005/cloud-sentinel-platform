output "node_group_id" {
  description = "EKS Cluster name and EKS Node Group name separated by a colon (:)."
  value       = aws_eks_node_group.main.id
}

output "node_group_arn" {
  description = "Amazon Resource Name (ARN) of the EKS Node Group."
  value       = aws_eks_node_group.main.arn
}

output "node_group_status" {
  description = "Status of the EKS Node Group."
  value       = aws_eks_node_group.main.status
}
