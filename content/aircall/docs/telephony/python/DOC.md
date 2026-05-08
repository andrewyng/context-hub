---
name: telephony
description: "Aircall REST API for accessing call data, contacts, users, and phone numbers via Basic Auth or OAuth."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "aircall,telephony,calls,contacts,voip,call-center"
---

# Aircall REST API — Python Guide

You are an Aircall API coding expert. Help me write Python code using the Aircall Public REST API.

Official API documentation: https://developer.aircall.io/api-references/

## Authentication

Aircall supports two auth methods:

### Basic Auth (Aircall customers — own account only)

Get `api_id` and `api_token` from Dashboard → Company Settings → API Keys.

```python
import httpx

api_id = "YOUR_API_ID"
api_token = "YOUR_API_TOKEN"
auth = httpx.BasicAuth(api_id, api_token)
BASE_URL = "https://api.aircall.io/v1"
```

### OAuth Bearer Token (Technology Partners — multi-tenant)

```python
import httpx

headers = {"Authorization": f"Bearer {access_token}"}
BASE_URL = "https://api.aircall.io/v1"
```

Use the `/v1/ping` endpoint to validate a token:

```python
async with httpx.AsyncClient(headers=headers) as client:
    r = await client.get(f"{BASE_URL}/ping")
    # 200 OK → {"ping": "pong"}
```

## Rate Limiting

- **60 requests per minute** per company
- Response headers on limit: `X-AircallApi-Limit`, `X-AircallApi-Remaining`, `X-AircallApi-Reset`

## API Versioning

- Most endpoints: `/v1/` (stable)
- Users: `/v2/users` available (v2 adds `substatus` field, per-user number listing via `GET /v2/users/:id/numbers`, and v2-specific webhook events)
- Webhooks: v2 event names are suffixed `.v2` (e.g. `user.connected.v2`)

## Core Resources

### Calls

```python
async with httpx.AsyncClient(auth=auth) as client:
    # List calls
    r = await client.get(f"{BASE_URL}/calls")
    calls = r.json()["calls"]

    # Get a specific call
    r = await client.get(f"{BASE_URL}/calls/{call_id}")
    call = r.json()["call"]

    # Get call transcription (requires AI Assist or AI Assist Pro)
    r = await client.get(f"{BASE_URL}/calls/{call_id}/transcription")
```

### Contacts

Contact attributes: `id`, `first_name`, `last_name`, `company_name`, `information`, `is_shared`, `phone_numbers`, `emails`, `created_at`, `updated_at`.

All contacts returned via the Public API are shared contacts. Contacts synced from third-party CRM integrations are not accessible via the API.

```python
async with httpx.AsyncClient(auth=auth) as client:
    # List contacts
    r = await client.get(f"{BASE_URL}/contacts")
    contacts = r.json()["contacts"]

    # Update a contact — NOTE: uses POST, not PUT
    r = await client.post(
        f"{BASE_URL}/contacts/{contact_id}",
        json={"first_name": "Jane", "company_name": "Acme Corp"},
    )
    updated = r.json()["contact"]
```

Phone numbers and emails must be updated via dedicated sub-endpoints, not the main update call.

### Users

```python
async with httpx.AsyncClient(auth=auth) as client:
    # List users (v2 recommended)
    r = await client.get("https://api.aircall.io/v2/users")
    users = r.json()["users"]
```

## Common Patterns

### Paginated fetch with async

```python
import httpx
import asyncio

async def fetch_all_calls(auth: httpx.BasicAuth) -> list:
    results = []
    page = 1
    async with httpx.AsyncClient(auth=auth) as client:
        while True:
            r = await client.get(
                f"{BASE_URL}/calls",
                params={"page": page, "per_page": 50},
            )
            data = r.json()
            results.extend(data["calls"])
            meta = data.get("meta", {})
            if page >= meta.get("total_pages", 1):
                break
            page += 1
    return results
```

### Handle rate limit

```python
import asyncio
import httpx

async def get_with_retry(client: httpx.AsyncClient, url: str, max_retries: int = 5):
    for attempt in range(max_retries):
        r = await client.get(url)
        if r.status_code == 429:
            # X-AircallApi-Reset header gives exact reset timestamp — use it for precise retry timing
            await asyncio.sleep(2 ** attempt)
            continue
        r.raise_for_status()
        return r.json()
    raise RuntimeError("Max retries exceeded after rate limiting")
```

## Webhooks

Common events: `call.created`, `call.answered`, `call.ended`, `call.transferred`, `call.external_transferred`, `call.evaluation.created`, `contact.created`, `contact.updated`, `user.created.v2`, `user.connected.v2`, `number.deleted`

Configure webhooks in Dashboard → Integrations → Webhooks or via API (`POST /v1/webhooks`).

## Numbers

```python
async with httpx.AsyncClient(auth=auth) as client:
    # List all numbers
    r = await client.get(f"{BASE_URL}/numbers")
    numbers = r.json()["numbers"]

    # Get numbers for a specific user (v2)
    r = await client.get(f"https://api.aircall.io/v2/users/{user_id}/numbers")
    user_numbers = r.json()["numbers"]
```

## Outbound Calls

```python
async with httpx.AsyncClient(auth=auth) as client:
    # Initiate an outbound call from a user
    r = await client.post(
        f"{BASE_URL}/users/{user_id}/calls",
        json={"to": "+15551234567"},
    )
    call = r.json()["call"]
```

## Installation

```bash
pip install httpx
```
