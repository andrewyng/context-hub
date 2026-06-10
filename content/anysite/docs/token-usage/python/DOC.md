---
name: token-usage
description: "Monitor Anysite API credit consumption, request history, and usage statistics"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "billing,credits,quota,monitoring,account,rate-limit"
---

# Token Usage API Coding Guidelines (Python)

You are a Token Usage API coding expert. Help me write Python code using the Anysite REST API for monitoring API usage and credit consumption.

API documentation: https://api.anysite.io/docs

## Golden Rule: Token Endpoints Use GET

- **Base URL:** `https://api.anysite.io`
- **Method:** Token/account endpoints use `GET`
- **Auth:** Pass your API key in the `access-token` header

## Authentication

```python
import requests

BASE_URL = "https://api.anysite.io"
API_KEY = "your-api-key"  # Use env vars in production

HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}


def anysite_get(endpoint: str, params: dict = None) -> dict:
    """Make a GET request to the Anysite API."""
    response = requests.get(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        params=params
    )
    response.raise_for_status()
    return response.json()
```

Store your API key in an environment variable:

```python
import os
API_KEY = os.environ["ANYSITE_API_KEY"]
```

## Token/Account Endpoints

### Get Token Request History

Retrieve your recent API request history. Uses `GET`.

**GET** `/token/requests`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `start_time` | string (datetime) | No | - | Filter start time (ISO 8601) |
| `end_time` | string (datetime) | No | - | Filter end time (ISO 8601) |
| `limit` | integer | No | 10 | Number of records (1-100) |
| `cursor` | string (datetime) | No | - | Pagination cursor |

```python
history = anysite_get("/token/requests", {
    "limit": 20
})

for entry in history:
    print(entry["endpoint"])
    print(entry["response_status_code"])
    print(entry["started_at"])
    print(entry["cost"], "credits")
    print(entry["points_left"], "remaining")
    print(entry["duration"], "seconds")
    print("---")
```

**Key response fields (`TokenHistory`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Request record ID |
| `endpoint` | string | API endpoint called |
| `cost` | integer | Number of credits consumed |
| `points_left` | integer | Remaining credit points after request |
| `is_paid` | boolean | Whether this was a paid request |
| `token_id` | string | API token ID |
| `plan` | string | Account plan (e.g. `"API"`) |
| `started_at` | string | Timestamp of the request (ISO 8601) |
| `duration` | number | Total request duration in seconds |
| `response_status_code` | integer | HTTP response status code |
| `response_error_text` | string | Error text (null if successful) |
| `response_count` | integer | Number of results returned |
| `response_execution_time` | number | Execution time in seconds |
| `response_request_id` | string | Unique request identifier |

### Get Token Request Count

Get the total number of API requests in a time range. Uses `GET`.

**GET** `/token/requests/count`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `start_time` | string (datetime) | No | Filter start time (ISO 8601) |
| `end_time` | string (datetime) | No | Filter end time (ISO 8601) |

```python
count = anysite_get("/token/requests/count", {
    "start_time": "2026-03-01T00:00:00Z",
    "end_time": "2026-03-16T00:00:00Z"
})

print(count["total"])
```

**Key response fields (`TokenRequestsCount`):**

| Field | Type | Description |
|---|---|---|
| `total` | integer | Total number of requests in the time range |

### Get Token Statistics

Retrieve usage statistics for your API token. Uses `GET`.

**GET** `/token/statistic`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `include_mcp` | boolean | No | false | Include MCP-related usage |

```python
stats = anysite_get("/token/statistic", {
    "include_mcp": True
})

print(stats["points"])            # remaining credit points
print(stats["purchase_credits"])  # purchased credits
print(stats["plan"])              # account plan (e.g. "API")
print(stats["is_primary"])        # whether this is the primary token
print(stats["usage_context"])     # usage context (e.g. "standard")
print(stats["user"]["login"])     # account login
print(stats["user"]["email"])     # account email
```

**Key response fields (`TokenStatistic`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Token ID |
| `user` | object | User account info with `id`, `login`, `role`, `email` |
| `is_primary` | boolean | Whether this is the primary API token |
| `points` | integer | Remaining credit points |
| `purchase_credits` | integer | Purchased credits balance |
| `plan` | string | Account plan (e.g. `"API"`) |
| `usage_context` | string | Usage context (e.g. `"standard"`) |

## Error Handling

```python
import requests


def anysite_get_safe(endpoint: str, params: dict = None) -> dict | None:
    try:
        response = requests.get(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            params=params,
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            print("Invalid or missing access-token")
        elif status == 422:
            print("Validation error:", e.response.json())
        elif status == 429:
            print("Rate limit exceeded - wait and retry")
        elif status >= 500:
            print("Server error - retry later")
        else:
            print(f"HTTP {status}:", e.response.text)
        return None
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
```

### Common Error Codes

| Status Code | Meaning | Action |
|---|---|---|
| 401 | Invalid or missing `access-token` header | Check your API key |
| 422 | Validation error (bad parameters) | Check parameter names and types |
| 429 | Rate limit exceeded | Back off and retry |
| 500 | Server error | Retry after a delay |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.
