# Container Clusters Endpoint Reference

## GET /v3/containers/clusters

Returns all Kubernetes clusters with full node inventories.

**Quirks:**
- Do NOT send `Content-Type: application/json` header — returns 400
- Do NOT send pagination parameters (`limit`, `offset`) — returns 400
- Response can take up to 60 seconds for large deployments
- Response is nested under `result.clusters[]`, unlike other endpoints that use `result[]`

## GET /v3/containers/clusters/{clusterId}

Returns a single cluster by UUID.

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique cluster identifier |
| `name` | string | Cluster name |
| `lastSeen` | string | ISO 8601 timestamp of last data collection |
| `firstSeen` | string | ISO 8601 timestamp of first appearance |
| `provisionedAt` | string | Provisioning timestamp (`0001-01-01T00:00:00Z` if unknown) |
| `metadata` | object | Additional cluster metadata |
| `nodes` | array | Nodes in the cluster |
| `nodes[].vendor` | string | Cloud provider (e.g. `Amazon`) |
| `nodes[].resourceIdentifier` | string | Provider instance ID (e.g. `i-048241ebfab4baa82`) |

### Cloud Providers

| Vendor | Platform | Identifier Format |
|--------|----------|-------------------|
| Amazon | AWS EKS | EC2 instance ID (`i-*`) |
| Google Cloud | GCP GKE / Autopilot | GCE instance name |

### Cluster Naming Conventions (observed)

| Pattern | Description |
|---------|-------------|
| `k8s-{cloud}-{org}-{product}-{env}-{region}-{n}` | Standard clusters |
| `k8s-{cloud}-{org}-{product}-autopilot-{env}-{region}-{n}` | GCP Autopilot clusters |
| `production-{location}` | Legacy AWS production clusters |
| `{platform}-gke-{env}-{region}` | Platform-specific GKE clusters |

### Scale

Node counts range from 0 (inactive/decommissioned) to several thousand for large Autopilot clusters.

### Full Response Example

```json
{
  "result": {
    "clusters": [
      {
        "id": "3a59440b-d6f9-416a-bb32-ece4c1302c09",
        "name": "production-singapore",
        "lastSeen": "2026-03-14T00:00:00Z",
        "firstSeen": "2023-06-09T00:00:00Z",
        "provisionedAt": "0001-01-01T00:00:00Z",
        "metadata": {},
        "nodes": [
          {
            "vendor": "Amazon",
            "resourceIdentifier": "i-048241ebfab4baa82"
          },
          {
            "vendor": "Amazon",
            "resourceIdentifier": "i-0eb68fb0e0b6a7d1f"
          },
          {
            "vendor": "Amazon",
            "resourceIdentifier": "i-060eadc10c842ed69"
          }
        ]
      },
      {
        "id": "bb52e86d-b7fb-4b59-ab32-861feb9f6dd6",
        "name": "nonproduction",
        "lastSeen": "2026-03-14T00:00:00Z",
        "firstSeen": "2022-01-15T00:00:00Z",
        "provisionedAt": "0001-01-01T00:00:00Z",
        "metadata": {},
        "nodes": [
          {
            "vendor": "Amazon",
            "resourceIdentifier": "i-0fca6ba155416ceb0"
          }
        ]
      }
    ]
  }
}
```
