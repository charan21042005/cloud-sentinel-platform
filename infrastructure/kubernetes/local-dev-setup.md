# 💻 Cloud Sentinel Local Kubernetes Runtime Setup (Phase 2D)

## 1. Local Architecture Overview
To achieve local testing fidelity without relying on cloud provider credentials, developers use **Kind (Kubernetes in Docker)** integrated with a local container registry.

```text
┌────────────────────────────────────────────────────────┐
│                  Local Docker Host                     │
│                                                        │
│   ┌──────────────────────┐      ┌──────────────────┐   │
│   │    Kind Cluster      │◄────►│  Local Registry  │   │
│   │ (sentinel-local-dev) │ Pull │ (localhost:5001) │   │
│   └──────────────────────┘      └──────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Cluster Creation with Local Registry Integration
Save this configuration file locally as `kind-config.yaml` to configure an NGINX Ingress controller alongside local persistent mounts:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
containerdConfigPatches:
  - |-
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:5001"]
      endpoint = ["http://sentinel-registry:5000"]
```

### Scripted Bootstrap Workflow
Run this initialization script in your terminal to create the registry and initialize the target nodes:

```bash
#!/usr/bin/env bash
set -o errexit

# 1. Spin up local container registry
reg_name='sentinel-registry'
reg_port='5001'
if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  docker run -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" registry:2
fi

# 2. Boot Kind with the local configuration map
kind create cluster --name sentinel-local-dev --config kind-config.yaml

# 3. Connect the registry container to the Kind network
docker network connect "kind" "${reg_name}" || true

# 4. Document registry configurations for target compilation nodes
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
```

---

## 3. Developer Workload Deployments
Once your base namespaces are initialized, compile and tag local runtime builds:

```bash
# 1. Build Gateway Engine
docker build -t localhost:5001/cloud-sentinel/gateway:dev ./services/api-gateway
docker push localhost:5001/cloud-sentinel/gateway:dev

# 2. Build Next.js Operations Console
docker build -t localhost:5001/cloud-sentinel/frontend:dev ./frontend
docker push localhost:5001/cloud-sentinel/frontend:dev

# 3. Apply Local Ingress Controllers
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

---

## 4. Local Persistence Storage Simulation
Since AWS EBS CSI provisioners cannot execute inside Kind, we use a custom static storage class targeting local HostPath partitions:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: sentinel-gp3-sc
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer
```
