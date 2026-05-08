---
name: webinars
description: "Livestorm REST API for managing events, registrants, and engagement data from webinars and virtual meetings."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "livestorm,webinars,events,registrants,engagement"
---

# Livestorm REST API — Python Guide

You are a Livestorm API coding expert. Help me write Python code using the Livestorm REST API.

Official documentation: https://developers.livestorm.co/docs/getting-started-api

## Authentication

Livestorm supports two auth methods:

### API Token (private apps — own workspace)

Generate a token in Account Settings → Integrations → Public API. Tokens require scope permissions chosen at creation time.

```python
import httpx

API_TOKEN = "YOUR_API_TOKEN"
BASE_URL = "https://api.livestorm.co/v1"

headers = {"Authorization": API_TOKEN}
```

Note: the header value is the token directly (no `Bearer` prefix).

### OAuth2 (Technology Partners — public integrations only)

OAuth2 is only available for official Technology Partners building publicly-listed apps.

## Rate Limits

- **Monthly**: 10,000 requests per 30-day rolling window (from first request)
- **Burst**: 5 requests per second

Response headers on every request:
- `RateLimit-Monthly-Limit` — max calls per 30-day period
- `RateLimit-Monthly-Remaining` — calls left this period
- `RateLimit-Interval-Limit` — burst limit per second
- `RateLimit-Interval-Remaining` — remaining in current second window
- `RateLimit-Reset` — timestamp when monthly period resets
- `Retry-After` — seconds until next available window (on 429)

## Pagination

List endpoints use cursor-style pagination with JSON:API conventions:

- `page[number]` — zero-indexed page number (default: `0`)
- `page[size]` — items per page (default: `20`, max: `50`)

Response shape:

```json
{
  "data": [...],
  "meta": {
    "current_page": 0,
    "previous_page": null,
    "next_page": 1,
    "record_count": 25,
    "page_count": 2,
    "items_per_page": 20
  }
}
```

## Core Resources

### Events

```python
async with httpx.AsyncClient() as client:
    # List events (paginated)
    r = await client.get(
        f"{BASE_URL}/events",
        headers=headers,
        params={"page[number]": 0, "page[size]": 50},
    )
    r.raise_for_status()
    payload = r.json()
    events = payload["data"]
    meta = payload["meta"]
```

Filter events by title:

```python
params = {
    "page[number]": 0,
    "page[size]": 50,
    "filter[title]": "Product Demo",
}
```

## Common Pattern: Fetch All Pages

```python
import httpx

async def fetch_all_events(api_token: str) -> list:
    headers = {"Authorization": api_token}
    base_url = "https://api.livestorm.co/v1"
    results = []
    page = 0

    async with httpx.AsyncClient() as client:
        while True:
            r = await client.get(
                f"{base_url}/events",
                headers=headers,
                params={"page[number]": page, "page[size]": 50},
            )
            r.raise_for_status()
            payload = r.json()
            results.extend(payload["data"])
            meta = payload["meta"]
            if meta["next_page"] is None:
                break
            page = meta["next_page"]

    return results
```

## Rate Limit Handling

```python
import asyncio
import httpx

async def get_with_retry(client: httpx.AsyncClient, url: str, headers: dict, params: dict = None):
    r = await client.get(url, headers=headers, params=params)
    if r.status_code == 429:
        wait = int(r.headers.get("Retry-After", 1))
        await asyncio.sleep(wait)
        r = await client.get(url, headers=headers, params=params)
    r.raise_for_status()
    return r.json()
```

## Notes

- API access requires a **validated Livestorm workspace**. Contact support@livestorm.co to enable API access.
- Token scopes are set at creation time and cannot be changed — create a new token to change scopes.

## Installation

```bash
pip install httpx
```
