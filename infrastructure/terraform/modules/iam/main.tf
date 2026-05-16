# -----------------------------------------------------------------------------
# EKS Control Plane IAM Role
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "cluster_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cluster_role" {
  name               = "${var.cluster_name}-control-plane-role"
  assume_role_policy = data.aws_iam_policy_document.cluster_assume_role_policy.json
  tags               = { Name = "${var.cluster_name}-control-plane-role" }
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster_role.name
}

# -----------------------------------------------------------------------------
# Default Worker Node IAM Role (For initial managed node groups if any)
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "node_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "node_role" {
  name               = "${var.cluster_name}-worker-node-role"
  assume_role_policy = data.aws_iam_policy_document.node_assume_role_policy.json
  tags               = { Name = "${var.cluster_name}-worker-node-role" }
}

# Required Managed Policies for standard worker nodes
resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node_role.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node_role.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node_role.name
}

# -----------------------------------------------------------------------------
# Karpenter Node IAM Role Preparation
# -----------------------------------------------------------------------------
# Karpenter provisions raw EC2 instances. They need an Instance Profile.
resource "aws_iam_role" "karpenter_node_role" {
  name               = "${var.cluster_name}-karpenter-node-role"
  assume_role_policy = data.aws_iam_policy_document.node_assume_role_policy.json
  tags               = { Name = "${var.cluster_name}-karpenter-node-role" }
}

resource "aws_iam_role_policy_attachment" "karpenter_AmazonEKSWorkerNodePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.karpenter_node_role.name
}

resource "aws_iam_role_policy_attachment" "karpenter_AmazonEKS_CNI_Policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.karpenter_node_role.name
}

resource "aws_iam_role_policy_attachment" "karpenter_AmazonEC2ContainerRegistryReadOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.karpenter_node_role.name
}

resource "aws_iam_role_policy_attachment" "karpenter_AmazonSSMManagedInstanceCore" {
  # Enables SSM Session Manager access without opening SSH ports
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.karpenter_node_role.name
}

resource "aws_iam_instance_profile" "karpenter_node_profile" {
  name = "${var.cluster_name}-karpenter-profile"
  role = aws_iam_role.karpenter_node_role.name
}

# -----------------------------------------------------------------------------
# KMS Encryption Key (Control Plane Secrets Governance)
# -----------------------------------------------------------------------------
# Ensures all Kubernetes Secrets are encrypted at rest via AWS KMS (envelope encryption)
resource "aws_kms_key" "eks_secrets" {
  description             = "EKS Secret Encryption Key for ${var.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags                    = { Name = "${var.cluster_name}-kms-key" }
}

resource "aws_kms_alias" "eks_secrets_alias" {
  name          = "alias/${var.cluster_name}-secrets"
  target_key_id = aws_kms_key.eks_secrets.key_id
}
