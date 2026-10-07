output "repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "repository_arns" {
  description = "ECR repository ARNs"
  value       = module.ecr.repository_arns
}
