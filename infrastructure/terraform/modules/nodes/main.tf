# -----------------------------------------------------------------------------
# EC2 Launch Template (Compute Security Baseline)
# -----------------------------------------------------------------------------
resource "aws_launch_template" "eks_nodes" {
  name_prefix   = "${var.cluster_name}-node-template-"
  description   = "Hardened launch template for EKS Managed Node Groups"
  
  # Ensure all root volumes are encrypted by default
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  # Enforce IMDSv2 for protection against SSRF attacks
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  # Bind to the EKS cluster security group
  vpc_security_group_ids = [var.cluster_security_group_id]

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.cluster_name}-worker-node"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Amazon EKS Managed Node Group
# -----------------------------------------------------------------------------
resource "aws_eks_node_group" "main" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-core-ng"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids

#  launch_template {
#    id      = aws_launch_template.eks_nodes.id
#    version = aws_launch_template.eks_nodes.latest_version
#  }

  # Cost-optimized sizing boundary
  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  # Default capacity type (Switch to SPOT in future phases for 70% cost reduction)
  capacity_type  = "ON_DEMAND"
  ami_type = "AL2023_x86_64_STANDARD"
  instance_types = var.instance_types

  # Initial Labeling Strategy for Workload Segregation
  labels = {
    "role"                               = "core-compute"
    "platform.sentinel.io/observability" = "true"
    "platform.sentinel.io/system"        = "true"
  }

  # Required to allow nodes to properly drain during scaling operations
  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "${var.cluster_name}-core-ng"
  }

  lifecycle {
    ignore_changes = [scaling_config[0].desired_size] # Allow Karpenter/ClusterAutoscaler to manage
  }
}
