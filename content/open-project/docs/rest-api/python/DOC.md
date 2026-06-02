---
name: rest-api
description: "OpenProject Integration"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "openproject,developer-tools,project-management,issues,api,integration"
---

# OpenProject API

> **Golden Rule:** OpenProject has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. Always handle rate limits, retries, and error responses explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://<domain>/api/v3`

## Authentication

**Type:** Basic

```python
import httpx

API_KEY = "your-api-key"
DOMAIN = "your-domain"
BASE_URL = f"https://{DOMAIN}/api/v3"

# Basic auth: API key as username, "X" as password
auth = httpx.BasicAuth(API_KEY, "X")
client = httpx.AsyncClient(auth=auth)
```

## Rate Limiting

**Limit:** 100 requests/minute

The API enforces rate limits. Check `X-RateLimit-Remaining` and `Retry-After` response headers. Implement exponential backoff on 429 responses.

## Methods

### `list_projects`

**Endpoint:** `GET /projects`



| Parameter | Type | Default |
|---|---|---|
| `limit` | `int` | `50` |

**Returns:** JSON response

```python
params = {
    "limit": 50
}
response = await client.get(f"{BASE_URL}/projects", params=params)
response.raise_for_status()
data = response.json()
```

### `list_work_packages`

**Endpoint:** `GET /work_packages`

List work packages (issues/tasks)

| Parameter | Type | Default |
|---|---|---|
| `project_id` | `str` | `None` |
| `limit` | `int` | `50` |

**Returns:** JSON response

```python
params = {
    "project_id": None,
    "limit": 50
}
response = await client.get(f"{BASE_URL}/work_packages", params=params)
response.raise_for_status()
data = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/projects")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        retry_after = e.response.headers.get("Retry-After", "60")
        print(f"Rate limited -- retry after {retry_after}s")
    else:
        print(f"OpenProject API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Always call `response.raise_for_status()` to catch HTTP errors
- Use `async with httpx.AsyncClient() as client:` to auto-close connections
- Handle 429 (rate limit) responses with exponential backoff
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
- The `limit` / `per_page` parameter controls page size, not total results -- paginate to get all data
