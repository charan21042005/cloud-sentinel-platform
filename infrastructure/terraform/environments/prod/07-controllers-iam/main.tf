terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "cloud-sentinel-terraform-state-434504869339"
    key            = "environments/prod/07-controllers-iam/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "cloud-sentinel-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project     = "Cloud Sentinel"
      Environment = "prod"
      ManagedBy   = "Terraform"
      Layer       = "07-controllers-iam"
    }
  }
}

data "terraform_remote_state" "eks" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/04-eks/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "rds" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/06-rds/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "iam" {
  backend = "s3"
  config = {
    bucket = "cloud-sentinel-terraform-state-434504869339"
    key    = "environments/prod/02-iam/terraform.tfstate"
    region = "us-east-1"
  }
}

locals {
  # OIDC provider URL without https://
  oidc_url = replace(data.terraform_remote_state.eks.outputs.oidc_provider_arn, "/^arn:aws:iam::[0-9]+:oidc-provider\\//", "")
}

# -----------------------------------------------------------------------------
# AWS Load Balancer Controller IAM
# -----------------------------------------------------------------------------
resource "aws_iam_policy" "albc" {
  name        = "cloud-sentinel-prod-aws-load-balancer-controller-policy"
  description = "Permissions for AWS Load Balancer Controller"
  policy      = file("../../../policies/aws_load_balancer_controller_iam_policy.json")
}

data "aws_iam_policy_document" "albc_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      type        = "Federated"
      identifiers = [data.terraform_remote_state.eks.outputs.oidc_provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_url}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_url}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "albc" {
  name               = "cloud-sentinel-prod-aws-load-balancer-controller-role"
  assume_role_policy = data.aws_iam_policy_document.albc_trust.json
}

resource "aws_iam_role_policy_attachment" "albc" {
  role       = aws_iam_role.albc.name
  policy_arn = aws_iam_policy.albc.arn
}

# -----------------------------------------------------------------------------
# External Secrets Operator IAM
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "eso_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    principals {
      type        = "Federated"
      identifiers = [data.terraform_remote_state.eks.outputs.oidc_provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_url}:sub"
      values   = ["system:serviceaccount:sentinel-ops:external-secrets-sa"]
    }
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_url}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eso" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [
      data.terraform_remote_state.rds.outputs.db_master_user_secret_arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = [
      data.terraform_remote_state.iam.outputs.kms_key_arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter"
    ]
    resources = [
      "arn:aws:ssm:us-east-1:434504869339:parameter/sentinel/production/api-gateway/jwt-secret"
    ]
  }
}

resource "aws_iam_policy" "eso" {
  name        = "cloud-sentinel-prod-external-secrets-policy"
  description = "Permissions for External Secrets Operator to access RDS secret"
  policy      = data.aws_iam_policy_document.eso.json
}

resource "aws_iam_role" "eso" {
  name               = "SentinelExternalSecretsRole"
  assume_role_policy = data.aws_iam_policy_document.eso_trust.json
}

resource "aws_iam_role_policy_attachment" "eso" {
  role       = aws_iam_role.eso.name
  policy_arn = aws_iam_policy.eso.arn
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------
output "aws_load_balancer_controller_role_arn" {
  description = "IAM Role ARN for AWS Load Balancer Controller"
  value       = aws_iam_role.albc.arn
}

output "external_secrets_role_arn" {
  description = "IAM Role ARN for External Secrets Operator"
  value       = aws_iam_role.eso.arn
}
