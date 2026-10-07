output "db_instance_identifier" {
  value = module.rds.db_instance_identifier
}

output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_port" {
  value = module.rds.db_port
}

output "db_name" {
  value = module.rds.db_name
}

output "db_security_group_id" {
  value = module.rds.db_security_group_id
}

output "db_subnet_group_name" {
  value = module.rds.db_subnet_group_name
}

output "db_master_user_secret_arn" {
  value = module.rds.db_master_user_secret_arn
}
