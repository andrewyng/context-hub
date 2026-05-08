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
import base64
import httpx

api_id = "YOUR_API_ID"
api_token = "YOUR_API_TOKEN"
credentials = base64.b64encode(f"{api_id}:{api_token}".encode()).decode()

headers = {"Authorization": f"Basic {credentials}"}
BASE_URL = "https://api.aircall.io/v1"
```

### OAuth Bearer Token (Technology Partners — multi-tenant)

```python
headers = {"Authorization": f"Bearer {access_token}"}
BASE_URL = "https://api.aircall.io/v1"
```

Use the `/v1/ping` endpoint to validate a token:

```python
async with httpx.AsyncClient() as client:
    r = await client.get(f"{BASE_URL}/ping", headers=headers)
    # 200 OK → {"ping": "pong"}
```

## Rate Limiting

- **60 requests per minute** per company
- Response headers on limit: `X-AircallApi-Limit`, `X-AircallApi-Remaining`, `X-AircallApi-Reset`

## API Versioning

- Most endpoints: `/v1/` (stable)
- Users: `/v2/users` available (v2 adds fields)
- Webhooks: v2 event names are suffixed `.v2` (e.g. `user.connected.v2`)

## Core Resources

### Calls

```python
async with httpx.AsyncClient() as client:
    # List calls
    r = await client.get(f"{BASE_URL}/calls", headers=headers)
    calls = r.json()["calls"]

    # Get a specific call
    r = await client.get(f"{BASE_URL}/calls/{call_id}", headers=headers)
    call = r.json()["call"]

    # Get call transcription (requires AI Assist Pro)
    r = await client.get(
        f"{BASE_URL}/calls/{call_id}/transcription", headers=headers
    )
```

### Contacts

Contact attributes: `id`, `first_name`, `last_name`, `company_name`, `information`, `is_shared`, `phone_numbers`, `emails`, `created_at`, `updated_at`.

All contacts returned via the Public API are shared contacts. Contacts synced from third-party CRM integrations are not accessible via the API.

```python
async with httpx.AsyncClient() as client:
    # List contacts
    r = await client.get(f"{BASE_URL}/contacts", headers=headers)
    contacts = r.json()["contacts"]

    # Update a contact — NOTE: uses POST, not PUT
    r = await client.post(
        f"{BASE_URL}/contacts/{contact_id}",
        headers=headers,
        json={"first_name": "Jane", "company_name": "Acme Corp"},
    )
    updated = r.json()["contact"]
```

Phone numbers and emails must be updated via dedicated sub-endpoints, not the main update call.

### Users

```python
async with httpx.AsyncClient() as client:
    # List users (v2 recommended)
    r = await client.get(f"https://api.aircall.io/v2/users", headers=headers)
    users = r.json()["users"]
```

## Common Patterns

### Paginated fetch with async

```python
import httpx
import asyncio

async def fetch_all_calls(headers: dict) -> list:
    results = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            r = await client.get(
                f"{BASE_URL}/calls",
                headers=headers,
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

async def get_with_retry(client: httpx.AsyncClient, url: str, headers: dict):
    r = await client.get(url, headers=headers)
    if r.status_code == 429:
        reset = int(r.headers.get("X-AircallApi-Reset", 60))
        await asyncio.sleep(reset)
        r = await client.get(url, headers=headers)
    r.raise_for_status()
    return r.json()
```

## Installation

```bash
pip install httpx
```
