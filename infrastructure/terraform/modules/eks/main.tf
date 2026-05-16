# -----------------------------------------------------------------------------
# EKS Cluster Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "EKS cluster security group"
  vpc_id      = data.aws_subnet.first.vpc_id

  # Allow inbound traffic from worker nodes (future)
  ingress {
    from_port = 443
    to_port   = 443
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-cluster-sg"
  }
}

# Helper data source to extract VPC ID from subnet
data "aws_subnet" "first" {
  id = var.subnet_ids[0]
}

# -----------------------------------------------------------------------------
# Amazon EKS Control Plane
# -----------------------------------------------------------------------------
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = var.cluster_role_arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true # Set to true for student/demo access without VPN
  }

  encryption_config {
    provider {
      key_arn = var.kms_key_arn
    }
    resources = ["secrets"]
  }

  # Cost Optimization: Only enable essential audit logging for compliance
  enabled_cluster_log_types = ["audit"]

  tags = {
    Name = var.cluster_name
  }
}

# -----------------------------------------------------------------------------
# CloudWatch Log Group Retention (FinOps Governance)
# -----------------------------------------------------------------------------
# Overrides default infinite retention to save costs
resource "aws_cloudwatch_log_group" "eks_cluster" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7 # FinOps constraint: Delete logs after 7 days
}

# -----------------------------------------------------------------------------
# IAM OIDC Provider (IRSA Preparation)
# -----------------------------------------------------------------------------
# Retrieves the TLS certificate for the OIDC issuer
data "tls_certificate" "eks" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# Registers the EKS cluster as an IAM OIDC Identity Provider
resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}
