# 🔐 Cloud Sentinel TLS & Certificate Architecture Blueprint (Phase 3D)

## 1. Zero-Trust HTTPS-Only Strategy
To prevent session replay attacks across public operator endpoints, the **Cloud Sentinel Platform** enforces automated Transport Layer Security (TLS) across all client boundaries using **cert-manager**.

```text
┌──────────────────────────────────────────────────────────┐
│                   Public Access Plane                    │
│                                                          │
│        [*.sentinel.ops.internal Wildcard Requests]       │
│                             │                            │
│                             ▼                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │             sentinel-ingress Namespace           │   │
│   │                                                  │   │
│   │   ┌──────────────────────────────────────────┐   │   │
│   │   │         Cert-Manager Controller          │   │   │
│   │   │  (Issues Wildcard TLS certs via ACME)    │   │   │
│   │   └─────────────────────┬────────────────────┘   │   │
│   │                         │ Inject TLS Keys        │   │
│   │                         ▼                        │   │
│   │   ┌──────────────────────────────────────────┐   │   │
│   │   │         sentinel-wildcard-tls            │   │   │
│   │   │        (Kubernetes Opaque Secret)        │   │   │
│   │   └──────────────────────────────────────────┘   │   │
│   └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Declarative ClusterIssuer Configuration Template
To integrate with enterprise PKI or Let's Encrypt automated ACME challenges without manual rotation overhead, schedule this foundational scaffold block:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: sentinel-enterprise-ca
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: soc-security@sentinel.ops.internal
    privateKeySecretRef:
      name: letsencrypt-production-account-key
    solvers:
      - dns01:
          route53:
            region: us-east-1
            hostedZoneID: Z0123456789ABCDEF
```

---

## 3. Wildcard Secret Architecture Mapping
Rather than generating and managing separate SSL keys for individual frontend, API, or monitoring hosts, our ingress configs reference a single master wildcard target (`sentinel-wildcard-tls`). This centralizes certificate revocation checks and simplifies auditing lifecycles:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: sentinel-wildcard-certificate
  namespace: sentinel-ingress
spec:
  secretName: sentinel-wildcard-tls
  issuerRef:
    name: sentinel-enterprise-ca
    kind: ClusterIssuer
  dnsNames:
    - "*.sentinel.ops.internal"
    - "sentinel.ops.internal"
```
