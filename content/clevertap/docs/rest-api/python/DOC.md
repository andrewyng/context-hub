---
name: rest-api
description: "CleverTap Customer Engagement & Analytics API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "clevertap,customer-engagement,analytics,campaigns,push-notifications,events,profiles,api,integration"
---

# CleverTap API

> **Golden Rule:** CleverTap has no official Python SDK on PyPI. Use `httpx` (async) or `requests` (sync) for direct REST API access. Auth uses two custom headers: `X-CleverTap-Account-Id` and `X-CleverTap-Passcode`. Base URL is region-specific. Rate limits are concurrent (not time-based).

## Installation

```bash
pip install httpx
```

## Base URL

Region-specific (check your CleverTap dashboard):

| Region | URL |
|---|---|
| Europe (Default) | `https://api.clevertap.com` |
| India | `https://in1.api.clevertap.com` |
| Singapore | `https://sg1.api.clevertap.com` |
| US | `https://us1.api.clevertap.com` |
| Indonesia | `https://aps3.api.clevertap.com` |
| UAE | `https://mec1.api.clevertap.com` |

## Authentication

**Type:** Custom Headers (Account ID + Passcode)

```python
import httpx

ACCOUNT_ID = "your-clevertap-account-id"
PASSCODE = "your-clevertap-passcode"
BASE_URL = "https://in1.api.clevertap.com"  # Use your region

headers = {
    "X-CleverTap-Account-Id": ACCOUNT_ID,
    "X-CleverTap-Passcode": PASSCODE,
    "Content-Type": "application/json; charset=utf-8"
}
client = httpx.AsyncClient(headers=headers)
```

## Rate Limiting

CleverTap uses **concurrent request limits** (not per-minute):

| API Category | Max Concurrent |
|---|---|
| Upload (profiles/events) | 15 |
| All other endpoints | 3 |

Returns HTTP 429 when exceeded.

## Methods

### `upload_profiles`

**Endpoint:** `POST /1/upload`

Create or update user profiles. Max 1000 records per call.

| Parameter | Type | Default |
|---|---|---|
| `d` | `list` | **required** (array of profile objects) |

**Returns:** JSON with `status`, `processed`, `unprocessed`

```python
payload = {
    "d": [{
        "type": "profile",
        "identity": "user@example.com",
        "profileData": {
            "Name": "Jane Doe",
            "Email": "user@example.com",
            "Phone": "+919876543210",
            "Plan": "Premium"
        }
    }]
}
response = await client.post(f"{BASE_URL}/1/upload", json=payload)
response.raise_for_status()
data = response.json()
# {"status": "success", "processed": 1, "unprocessed": []}
```

### `upload_events`

**Endpoint:** `POST /1/upload`

Track user events. Same endpoint as profiles; differentiated by `type: "event"`.

```python
payload = {
    "d": [{
        "identity": "user@example.com",
        "type": "event",
        "evtName": "Product Viewed",
        "evtData": {
            "Product name": "Wireless Headphones",
            "Category": "Electronics",
            "Price": 79.99
        }
    }]
}
response = await client.post(f"{BASE_URL}/1/upload", json=payload)
response.raise_for_status()
```

### `query_profiles`

**Endpoint:** `POST /1/profiles.json` → `GET /1/profiles.json?cursor={cursor}`

Query user profiles with cursor-based pagination.

```python
# Step 1: Initial query
query = {"event_name": "App Launched", "from": 20240101, "to": 20240131}
response = await client.post(f"{BASE_URL}/1/profiles.json", json=query)
response.raise_for_status()
data = response.json()
profiles = data.get("records", [])
cursor = data.get("cursor")

# Step 2: Paginate with cursor
while cursor:
    response = await client.get(f"{BASE_URL}/1/profiles.json", params={"cursor": cursor})
    response.raise_for_status()
    data = response.json()
    profiles.extend(data.get("records", []))
    cursor = data.get("cursor")
```

### `query_events`

**Endpoint:** `POST /1/events.json` → `GET /1/events.json?cursor={cursor}`

Query events by name and date range.

```python
query = {"event_name": "Product Viewed", "from": 20240101, "to": 20240131}
response = await client.post(f"{BASE_URL}/1/events.json", json=query)
response.raise_for_status()
data = response.json()
events = data.get("records", [])
```

### `create_campaign`

**Endpoint:** `POST /1/targets/create.json`

Create push, email, SMS, or web push campaigns.

```python
payload = {
    "name": "Welcome Email",
    "target_mode": "email",
    "where": {"event_name": "App Launched", "from": 20240101, "to": 20240131},
    "content": {"subject": "Welcome!", "body": "<html>Welcome aboard!</html>"},
    "when": "now"
}
response = await client.post(f"{BASE_URL}/1/targets/create.json", json=payload)
response.raise_for_status()
```

### `get_realtime_counts`

**Endpoint:** `POST /1/now.json`

Get real-time user/event counts.

```python
payload = {"event_name": "App Launched"}
response = await client.post(f"{BASE_URL}/1/now.json", json=payload)
response.raise_for_status()
counts = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/1/upload", json=payload)
    response.raise_for_status()
    data = response.json()
    if data.get("unprocessed"):
        print(f"Partial failure: {len(data['unprocessed'])} records failed")
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check Account ID and Passcode")
    elif e.response.status_code == 429:
        print("Too many concurrent requests -- reduce parallelism")
    else:
        print(f"CleverTap API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Auth uses TWO custom headers (`X-CleverTap-Account-Id` + `X-CleverTap-Passcode`), not Bearer
- Base URL is region-specific -- using wrong region causes auth failures
- Profiles and events share the same `/1/upload` endpoint -- the `type` field differentiates them
- Max 1000 records per upload call
- Rate limits are **concurrent** (not per-minute) -- 15 for uploads, 3 for queries
- Query APIs use cursor-based pagination: POST to start, GET with `cursor` param to paginate
- Check `unprocessed` array in response -- HTTP 200 doesn't mean all records succeeded
- Add `?dryRun=1` to upload URLs to validate without persisting
- Date format in queries: `YYYYMMDD` as integer (e.g., `20240101`)
- Set `Content-Type: application/json; charset=utf-8` (charset matters)
