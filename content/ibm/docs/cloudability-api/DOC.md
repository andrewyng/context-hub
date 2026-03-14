---
name: cloudability-api
description: "IBM Apptio Cloudability API v3 for cloud cost management — authentication, cost views, business mappings, container clusters, and budgets"
metadata:
  languages: "http"
  versions: "v3"
  revision: 1
  updated-on: "2026-03-14"
  source: community
  tags: "ibm,apptio,cloudability,finops,cloud-cost,api,rest,kubernetes,containers"
---

# IBM Apptio Cloudability API v3

REST API for cloud cost management. Retrieve cost views, business dimension/metric mappings, container cluster inventories, and budgets.

Base URL: `https://api.cloudability.com/v3`

## Authentication

### API Key (Basic Auth)

Create a key at `https://app.apptio.com/cloudability#/settings/preferences`. The key is the username; the password is empty.

```bash
curl https://api.cloudability.com/v3/budgets -u 'YOUR_API_KEY:'
```

### apptio-opentoken

Required for GovCloud. Obtain from Access Administration.

```bash
curl https://api.cloudability.com/v3/budgets \
  -H "apptio-opentoken: YOUR_TOKEN" \
  -H "apptio-environmentid: YOUR_ENV_ID"
```

## Regional Endpoints

| Region | Base URL |
|--------|----------|
| US | `https://api.cloudability.com/v3` |
| Europe | `https://api-eu.cloudability.com/v3` |
| Asia Pacific | `https://api-au.cloudability.com/v3` |
| Middle East | `https://api-me.cloudability.com/v3` |

## Request Headers

- `Accept: application/json` — required on all requests
- `Content-Type: application/json` — POST/PUT only; do **not** send on GET requests (some endpoints reject it)

## Response Format

```json
{
  "result": {} or [],
  "meta": {}
}
```

- Dates: ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`)
- Missing primitives: `null`
- Missing collections: `[]` or `{}`

### Error Response

```json
{
  "error": {
    "status": 404,
    "code": "not_found",
    "messages": ["Not Found"],
    "uniqueid": "...",
    "traceid": "..."
  }
}
```

## Endpoints

### Views

```
GET /v3/views
```

Returns all cost views. No pagination parameters.

```bash
curl https://api.cloudability.com/v3/views -u 'YOUR_API_KEY:'
```

Response:

```json
{
  "result": [
    {
      "id": "131863",
      "title": "Production Costs",
      "description": "",
      "ownerId": "113155",
      "ownerEmail": "user@example.com",
      "sharedWithUsers": [],
      "sharedWithOrganization": true,
      "filters": [
        {
          "field": "vendor_account_name",
          "comparator": "==",
          "value": "123456"
        }
      ],
      "parentViewId": "-1",
      "viewSource": "SYSTEM",
      "defaultUserIds": [169765, 169949]
    }
  ]
}
```

### Business Mappings

```
GET /v3/business-mappings
```

Returns all custom dimension and metric rules. No pagination parameters.

```bash
curl https://api.cloudability.com/v3/business-mappings -u 'YOUR_API_KEY:'
```

Response:

```json
{
  "result": [
    {
      "name": "Environment",
      "index": 2,
      "kind": "BUSINESS_DIMENSION",
      "defaultValue": "Not Set",
      "updatedAt": "2021-07-14T11:57:33.686Z",
      "statements": [
        {
          "matchExpression": "TAG['Environment'] CONTAINS 'prod'",
          "valueExpression": "'Production'"
        },
        {
          "matchExpression": "TAG['Environment'] CONTAINS 'dev'",
          "valueExpression": "'Non-Production'"
        }
      ]
    }
  ]
}
```

`kind` is either `BUSINESS_DIMENSION` (categorical) or `BUSINESS_METRIC` (numeric).

#### Expression Syntax

Match expressions:

- `TAG['tag_name']` — cloud resource tag
- `DIMENSION['dimension_name']` — cost dimension (e.g. `vendor`, `vendor_account_name`, `vendor_account_identifier`)
- `METRIC['metric_name']` — cost metric (e.g. `list_cost`, `unblended_cost`)

Operators: `CONTAINS 'value'`, `== 'value'`, `||`, `&&`

Value expressions: string literals (`'Production'`) or metric calculations (`METRIC['list_cost'] - METRIC['unblended_cost']`).

### Container Clusters

```
GET /v3/containers/clusters
```

Returns all Kubernetes clusters with node inventories. No query parameters accepted.

```bash
curl https://api.cloudability.com/v3/containers/clusters -u 'YOUR_API_KEY:'
```

**Important:** Do not send `Content-Type` header or pagination parameters on this endpoint — it returns 400. Can be slow (up to 60s) for large deployments.

Response (note: nested under `result.clusters`, not `result[]`):

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
          }
        ]
      }
    ]
  }
}
```

Node vendors include `Amazon` (AWS EKS, identified by EC2 instance IDs) and Google Cloud (GKE/Autopilot clusters).

### Budgets

```
GET /v3/budgets
```

Supports pagination, sorting, and filtering.

```bash
# List all budgets
curl https://api.cloudability.com/v3/budgets -u 'YOUR_API_KEY:'

# With pagination
curl "https://api.cloudability.com/v3/budgets?limit=100&offset=0" -u 'YOUR_API_KEY:'

# With filter
curl "https://api.cloudability.com/v3/budgets?filter=status==active" -u 'YOUR_API_KEY:'

# Sorted descending
curl "https://api.cloudability.com/v3/budgets?sort=-totalBudget" -u 'YOUR_API_KEY:'
```

#### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `limit` | Records per page (default 50, max 500) | `limit=100` |
| `offset` | Records to skip | `offset=50` |
| `sort` | `+field` ascending, `-field` descending | `sort=-totalBudget` |
| `filter` | Comma-separated conditions | `filter=status==active,totalBudget>10000` |

Filter operators: `==`, `!=`, `>`, `<`, `=@` (contains).

### Get Single Record

```bash
# Budget by ID
curl https://api.cloudability.com/v3/budgets/{budgetId} -u 'YOUR_API_KEY:'

# View by ID
curl https://api.cloudability.com/v3/views/{viewId} -u 'YOUR_API_KEY:'

# Business mapping by index
curl https://api.cloudability.com/v3/business-mappings/{index} -u 'YOUR_API_KEY:'

# Cluster by ID
curl https://api.cloudability.com/v3/containers/clusters/{clusterId} -u 'YOUR_API_KEY:'
```

## Permission-Restricted Endpoints

These endpoints exist but require elevated API permissions:

| Endpoint | Status | Description |
|----------|--------|-------------|
| `GET /v3/vendors` | 401 | Cloud vendor accounts |
| `GET /v3/reservations` | 401 | Reserved instance data |
| `GET /v3/containers` | 401 | Container-level detail |
| `GET /v3/users` | 401 | User management |
| `GET /v3/anomalies` | 403 | Cost anomaly detection |
| `GET /v3/forecast` | 422 | Cost forecasting (needs query params) |
| `GET /v3/reporting/cost/run` | 422/403 | Cost reporting (needs params + permissions) |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Successful delete |
| 400 | Bad request (invalid params or headers) |
| 401 | Unauthorized (bad/expired credentials) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 422 | Missing required parameters |
| 500 | Server error |

## Python Client Example

```python
import os
import requests
import base64

api_key = os.environ["APPTIO_KEY"]
auth = base64.b64encode(f"{api_key}:".encode()).decode()
headers = {"Authorization": f"Basic {auth}", "Accept": "application/json"}
base = "https://api.cloudability.com/v3"

# List views
views = requests.get(f"{base}/views", headers=headers).json()["result"]

# List business mappings
mappings = requests.get(f"{base}/business-mappings", headers=headers).json()["result"]

# List clusters
clusters = requests.get(
    f"{base}/containers/clusters", headers=headers, timeout=60
).json()["result"]["clusters"]

# List budgets with filter
budgets = requests.get(
    f"{base}/budgets",
    headers=headers,
    params={"filter": "status==active", "limit": 100},
).json()["result"]
```

## Official Documentation

- [Getting Started](https://www.ibm.com/docs/en/cloudability-commercial/cloudability-premium/saas?topic=api-getting-started-cloudability-v3)
- [IBM Cloudability Docs](https://www.ibm.com/docs/en/cloudability-commercial/cloudability-premium/saas)
