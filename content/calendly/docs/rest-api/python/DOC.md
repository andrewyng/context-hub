---
name: rest-api
description: "Calendly - Scheduling & Availability API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "calendly,scheduling,calendar,meetings,availability,events,invitees,webhooks,booking,api,integration"
---

# Calendly API v2

> **Golden Rule:** Calendly has no official Python SDK. Use `httpx` for direct REST access. Auth uses Bearer token (Personal Access Token or OAuth 2.0). Resources are referenced by **full URIs** (not just UUIDs) in filter parameters. First call should always be `GET /users/me` to obtain your user URI and organization URI. Cursor-based pagination with `page_token`/`count` params.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://api.calendly.com
```

## Authentication

**Type:** Bearer Token (Personal Access Token or OAuth 2.0)

```python
import httpx

TOKEN = "your-calendly-personal-access-token"
BASE_URL = "https://api.calendly.com"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}
client = httpx.AsyncClient(headers=headers, timeout=30.0)
```

**Important:** Generate Personal Access Tokens from Calendly > Integrations > API & Webhooks. Use OAuth 2.0 for multi-user public apps.

## Rate Limiting

Not publicly documented with specific numbers. Monitor for HTTP 429 and respect `Retry-After` headers. Implement exponential backoff.

## Methods

### `get_current_user`

**Endpoint:** `GET /users/me`

Get the authenticated user's info. **Call this first** to obtain your user URI and organization URI needed for all other endpoints.

**Returns:** JSON with `resource` containing `uri`, `name`, `email`, `timezone`, `current_organization`

```python
response = await client.get(f"{BASE_URL}/users/me")
response.raise_for_status()
user = response.json()["resource"]
user_uri = user["uri"]  # "https://api.calendly.com/users/ABCDEF123"
org_uri = user["current_organization"]  # needed for other endpoints
```

### `list_event_types`

**Endpoint:** `GET /event_types`

List event type configurations (e.g., "30 Minute Meeting"). These are templates, not scheduled bookings.

| Parameter | Type | Default |
|---|---|---|
| `user` | `str` | filter by user URI |
| `organization` | `str` | filter by org URI |
| `active` | `bool` | `None` (`true` or `false`) |
| `count` | `int` | `20` (max 100) |
| `page_token` | `str` | `None` |

```python
params = {"user": user_uri, "active": "true"}
response = await client.get(f"{BASE_URL}/event_types", params=params)
response.raise_for_status()
data = response.json()
event_types = data["collection"]
```

### `list_scheduled_events`

**Endpoint:** `GET /scheduled_events`

List actual scheduled events (bookings) with optional date range filters.

| Parameter | Type | Default |
|---|---|---|
| `user` | `str` | filter by user URI |
| `organization` | `str` | filter by org URI |
| `min_start_time` | `str` | `None` (ISO 8601) |
| `max_start_time` | `str` | `None` (ISO 8601) |
| `status` | `str` | `None` (`active` or `canceled`) |
| `invitee_email` | `str` | `None` |
| `sort` | `str` | `None` (e.g., `start_time:asc`) |
| `count` | `int` | `20` (max 100) |
| `page_token` | `str` | `None` |

```python
params = {
    "user": user_uri,
    "min_start_time": "2026-03-01T00:00:00Z",
    "max_start_time": "2026-03-31T23:59:59Z",
    "status": "active",
    "sort": "start_time:asc"
}
response = await client.get(f"{BASE_URL}/scheduled_events", params=params)
response.raise_for_status()
data = response.json()
events = data["collection"]

# Paginate
next_token = data["pagination"].get("next_page_token")
while next_token:
    params["page_token"] = next_token
    response = await client.get(f"{BASE_URL}/scheduled_events", params=params)
    response.raise_for_status()
    data = response.json()
    events.extend(data["collection"])
    next_token = data["pagination"].get("next_page_token")
```

### `get_event_invitees`

**Endpoint:** `GET /scheduled_events/{event_uuid}/invitees`

List invitees for a specific scheduled event.

| Parameter | Type | Default |
|---|---|---|
| `status` | `str` | `None` (`active` or `canceled`) |
| `email` | `str` | `None` |
| `count` | `int` | `20` (max 100) |

**Returns:** JSON collection with invitee `name`, `email`, `timezone`, `status`, `questions_and_answers`

```python
event_uuid = "EVT_UUID"
response = await client.get(f"{BASE_URL}/scheduled_events/{event_uuid}/invitees")
response.raise_for_status()
invitees = response.json()["collection"]
for invitee in invitees:
    print(f"{invitee['name']} - {invitee['email']}")
```

### `cancel_event`

**Endpoint:** `POST /scheduled_events/{event_uuid}/cancellation`

Cancel a scheduled event.

```python
event_uuid = "EVT_UUID"
payload = {"reason": "Schedule conflict"}
response = await client.post(
    f"{BASE_URL}/scheduled_events/{event_uuid}/cancellation",
    json=payload
)
response.raise_for_status()
```

### `get_available_times`

**Endpoint:** `GET /event_type_available_times`

Get available time slots for an event type within a date range (max 1 month).

| Parameter | Type | Default |
|---|---|---|
| `event_type` | `str` | **required** (event type URI) |
| `start_time` | `str` | **required** (ISO 8601) |
| `end_time` | `str` | **required** (ISO 8601, max 1 month from start) |

```python
params = {
    "event_type": "https://api.calendly.com/event_types/EVTYPE_UUID",
    "start_time": "2026-03-13T00:00:00Z",
    "end_time": "2026-03-20T23:59:59Z"
}
response = await client.get(f"{BASE_URL}/event_type_available_times", params=params)
response.raise_for_status()
slots = response.json()["collection"]
```

### `get_busy_times`

**Endpoint:** `GET /user_busy_times`

Get a user's busy time blocks.

| Parameter | Type | Default |
|---|---|---|
| `user` | `str` | **required** (user URI) |
| `start_time` | `str` | **required** (ISO 8601) |
| `end_time` | `str` | **required** (ISO 8601) |

```python
params = {
    "user": user_uri,
    "start_time": "2026-03-13T00:00:00Z",
    "end_time": "2026-03-20T23:59:59Z"
}
response = await client.get(f"{BASE_URL}/user_busy_times", params=params)
response.raise_for_status()
busy = response.json()["collection"]
```

### `create_webhook`

**Endpoint:** `POST /webhook_subscriptions`

Subscribe to event notifications. Requires Professional plan or above.

```python
payload = {
    "url": "https://your-endpoint.com/webhook",
    "events": ["invitee.created", "invitee.canceled"],
    "scope": "user",
    "organization": org_uri,
    "user": user_uri
}
response = await client.post(f"{BASE_URL}/webhook_subscriptions", json=payload)
response.raise_for_status()
webhook = response.json()["resource"]
```

## Error Handling

```python
import httpx

try:
    response = await client.get(f"{BASE_URL}/scheduled_events", params=params)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check Bearer token or refresh OAuth token")
    elif e.response.status_code == 403:
        print("Forbidden -- insufficient permissions or plan upgrade needed")
    elif e.response.status_code == 422:
        error = e.response.json()
        print(f"Validation error: {error.get('message')} - {error.get('details')}")
    elif e.response.status_code == 429:
        print("Rate limited -- implement exponential backoff")
    else:
        print(f"Calendly error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Call `GET /users/me` first** -- you need the user URI and org URI for almost all other endpoints
- Filter parameters expect **full resource URIs** (e.g., `https://api.calendly.com/users/UUID`), not just UUIDs
- **Event types vs scheduled events**: Event types are templates ("30 min meeting"); scheduled events are actual bookings
- Availability date range cannot exceed **1 month**
- Maximum **100 results** per page; paginate with `page_token`
- Timestamps must be **ISO 8601 in UTC** (e.g., `2026-03-13T10:00:00Z`)
- Timezones use **IANA format** (e.g., `America/New_York`)
- Reschedules trigger **two webhook events**: `invitee.canceled` (old) + `invitee.created` (new)
- Webhooks require **Professional plan** or above
- Webhook endpoint must respond with **2xx within 10 seconds**; 25 retries over 24 hours before auto-disable
- Maximum **10 additional guests** per event
- API v1 was deprecated August 27, 2025 -- use v2 only
