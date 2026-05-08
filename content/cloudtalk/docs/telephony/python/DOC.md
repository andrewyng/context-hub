---
name: telephony
description: "CloudTalk REST API for accessing call data, agents, and groups via HTTP Basic Auth."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "cloudtalk,telephony,calls,agents,voip,call-center"
---

# CloudTalk REST API — Python Guide

You are a CloudTalk API coding expert. Help me write Python code using the CloudTalk REST API.

Official API documentation: https://developers.cloudtalk.io/

## Authentication

Auth method: HTTP Basic Auth. Generate an API key in the CloudTalk dashboard under Account Settings → Integrations → API. Note both the Key ID and Key Secret.

```python
import base64
import httpx

key_id = "YOUR_KEY_ID"
key_secret = "YOUR_KEY_SECRET"
credentials = base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()

headers = {"Authorization": f"Basic {credentials}"}
BASE_URL = "https://my.cloudtalk.io/api"
```

**Important:** All endpoints use a `.json` suffix (e.g. `/api/agents.json`). This is non-standard but required.

## Response Format

All responses are wrapped:

```json
{
  "responseCode": 200,
  "data": {
    "items": [...],
    "total": 42
  }
}
```

Check `responseCode` — HTTP 200 does not guarantee success; the body `responseCode` field is authoritative.

## Pagination

All list endpoints use offset pagination:
- `page` — page number starting at 1
- `limit` — items per page (default: 20, max: 100)

```python
params = {"page": 1, "limit": 100}
```

## Core Resources

### Agents

```python
async with httpx.AsyncClient() as client:
    # List all agents (paginated)
    r = await client.get(
        f"{BASE_URL}/agents.json",
        headers=headers,
        params={"page": 1, "limit": 100},
    )
    data = r.json()
    agents = data["data"]["items"]
    total = data["data"]["total"]

    # Get a single agent
    r = await client.get(f"{BASE_URL}/agents/{agent_id}.json", headers=headers)
    agent = r.json()["data"]
```

Agent fields: `id`, `name`, `email`, `role`, `status`, `extension`, `phone_number`, `groups`, `created_at`, `updated_at`.

### Calls

```python
async with httpx.AsyncClient() as client:
    r = await client.get(
        f"{BASE_URL}/calls.json",
        headers=headers,
        params={"page": 1, "limit": 100},
    )
    calls = r.json()["data"]["items"]
```

Call fields include: `id`, `agent_id`, `direction` (`inbound`/`outbound`).

### Groups (Queues)

```python
async with httpx.AsyncClient() as client:
    r = await client.get(f"{BASE_URL}/groups.json", headers=headers)
    groups = r.json()["data"]["items"]
```

## Common Pattern: Fetch All Pages

```python
import httpx

async def fetch_all(resource: str, headers: dict) -> list:
    results = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            r = await client.get(
                f"https://my.cloudtalk.io/api/{resource}.json",
                headers=headers,
                params={"page": page, "limit": 100},
            )
            r.raise_for_status()
            body = r.json()
            items = body["data"]["items"]
            results.extend(items)
            total = body["data"]["total"]
            if len(results) >= total:
                break
            page += 1
    return results
```

## Rate Limits

CloudTalk does not publicly document rate limit thresholds. Implement exponential backoff on HTTP 429.

```python
import asyncio
import httpx

async def get_with_backoff(client: httpx.AsyncClient, url: str, headers: dict, params: dict = None):
    for attempt in range(5):
        r = await client.get(url, headers=headers, params=params)
        if r.status_code == 429:
            await asyncio.sleep(2 ** attempt)
            continue
        r.raise_for_status()
        return r.json()
    raise RuntimeError("Max retries exceeded")
```

## Webhooks

CloudTalk supports outbound webhooks configured in the dashboard under Integrations → Webhooks.

Documented webhook events:
- `call.started`
- `call.answered`
- `call.ended`
- `call.missed`
- `voicemail.received`
- `sms.received`

## Installation

```bash
pip install httpx
```
