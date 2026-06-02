---
name: rest-api
description: "Zoom Integration with Complete API Implementation"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "zoom,communication,video,meetings,api,integration"
---

# Zoom API

> **Golden Rule:** Zoom has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. Always handle rate limits, retries, and error responses explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.zoom.us/v2`

## Authentication

**Type:** Oauth2

```python
import httpx

ACCESS_TOKEN = "your-oauth-access-token"
BASE_URL = "https://api.zoom.us/v2"

headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
client = httpx.AsyncClient(headers=headers)
```

## Rate Limiting

**Limit:** 60 requests/minute

The API enforces rate limits. Check `X-RateLimit-Remaining` and `Retry-After` response headers. Implement exponential backoff on 429 responses.

## Methods

### `get_user`

**Endpoint:** `GET /users/me`

Get user

| Parameter | Type | Default |
|---|---|---|
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "limit": 100
}
response = await client.get(f"{BASE_URL}/users/me", params=params)
response.raise_for_status()
data = response.json()
```

### `list_meetings`

**Endpoint:** `GET /users/me/meetings`

List meetings

| Parameter | Type | Default |
|---|---|---|
| `type` | `str` | **required** |
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "type": "...",
    "limit": 100
}
response = await client.get(f"{BASE_URL}/users/me/meetings", params=params)
response.raise_for_status()
data = response.json()
```

### `get_meeting`

**Endpoint:** `GET /meetings/{meetingId}`

Get meeting

| Parameter | Type | Default |
|---|---|---|
| `meetingId` | `str` | **required** |
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "meetingId": "...",
    "limit": 100
}
response = await client.get(f"{BASE_URL}/meetings/{meetingId}", params=params)
response.raise_for_status()
data = response.json()
```

### `list_users`

**Endpoint:** `GET /users`

List users

| Parameter | Type | Default |
|---|---|---|
| `status` | `str` | **required** |
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "status": "...",
    "limit": 100
}
response = await client.get(f"{BASE_URL}/users", params=params)
response.raise_for_status()
data = response.json()
```

### `list_recordings`

**Endpoint:** `GET /users/me/recordings`

List cloud recordings

| Parameter | Type | Default |
|---|---|---|
| `from` | `str` | **required** |
| `to` | `str` | **required** |
| `page_size` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "from": "2024-01-01",
    "to": "2024-12-31",
    "page_size": 100
}
response = await client.get(f"{BASE_URL}/users/me/recordings", params=params)
response.raise_for_status()
data = response.json()
```

### `get_recording`

**Endpoint:** `GET /meetings/{meetingId}/recordings`

Get meeting recordings

| Parameter | Type | Default |
|---|---|---|
| `meetingId` | `str` | **required** |
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "meetingId": "...",
    "limit": 100
}
response = await client.get(f"{BASE_URL}/meetings/{meetingId}/recordings", params=params)
response.raise_for_status()
data = response.json()
```

### `list_webinars`

**Endpoint:** `GET /users/me/webinars`

List webinars

| Parameter | Type | Default |
|---|---|---|
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "limit": 100
}
response = await client.get(f"{BASE_URL}/users/me/webinars", params=params)
response.raise_for_status()
data = response.json()
```

### `get_webinar`

**Endpoint:** `GET /webinars/{webinarId}`

Get webinar

| Parameter | Type | Default |
|---|---|---|
| `webinarId` | `str` | **required** |
| `limit` | `int` | `100` |

**Returns:** JSON response

```python
params = {
    "webinarId": "...",
    "limit": 100
}
response = await client.get(f"{BASE_URL}/webinars/{webinarId}", params=params)
response.raise_for_status()
data = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/users/me")
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        retry_after = e.response.headers.get("Retry-After", "60")
        print(f"Rate limited -- retry after {retry_after}s")
    else:
        print(f"Zoom API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Always call `response.raise_for_status()` to catch HTTP errors
- Use `async with httpx.AsyncClient() as client:` to auto-close connections
- Handle 429 (rate limit) responses with exponential backoff
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
- The `limit` / `per_page` parameter controls page size, not total results -- paginate to get all data
