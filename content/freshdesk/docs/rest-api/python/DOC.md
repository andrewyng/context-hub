---
name: rest-api
description: "Freshdesk API integration with 2 methods"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "freshdesk,support,helpdesk,tickets,api,integration"
---

# Freshdesk API

> **Golden Rule:** Freshdesk has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. Always handle rate limits, retries, and error responses explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://<domain>.freshdesk.com/api/v2`

## Authentication

**Type:** Basic

```python
import httpx

API_KEY = "your-api-key"
DOMAIN = "your-domain"
BASE_URL = f"https://{DOMAIN}.freshdesk.com/api/v2"

# Basic auth: API key as username, "X" as password
auth = httpx.BasicAuth(API_KEY, "X")
client = httpx.AsyncClient(auth=auth)
```

## Rate Limiting

**Limit:** 100 requests/minute

The API enforces rate limits. Check `X-RateLimit-Remaining` and `Retry-After` response headers. Implement exponential backoff on 429 responses.

## Methods

### `list_tickets`

**Endpoint:** `GET /tickets`



| Parameter | Type | Default |
|---|---|---|
| `limit` | `int` | `30` |

**Returns:** JSON response

```python
params = {
    "limit": 30
}
response = await client.get(f"{BASE_URL}/tickets", params=params)
response.raise_for_status()
data = response.json()
```

### `list_contacts`

**Endpoint:** `GET /contacts`



| Parameter | Type | Default |
|---|---|---|
| `limit` | `int` | `30` |

**Returns:** JSON response

```python
params = {
    "limit": 30
}
response = await client.get(f"{BASE_URL}/contacts", params=params)
response.raise_for_status()
data = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/tickets")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        retry_after = e.response.headers.get("Retry-After", "60")
        print(f"Rate limited -- retry after {retry_after}s")
    else:
        print(f"Freshdesk API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Always call `response.raise_for_status()` to catch HTTP errors
- Use `async with httpx.AsyncClient() as client:` to auto-close connections
- Handle 429 (rate limit) responses with exponential backoff
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
- The `limit` / `per_page` parameter controls page size, not total results -- paginate to get all data
