---
name: event-tracking
description: "Dreamdata server-side Tracking API for sending identify, track, and page events to the Dreamdata attribution platform."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "dreamdata,tracking,attribution,events,b2b,revenue"
---

# Dreamdata Server-Side Tracking API — Python Guide

You are a Dreamdata API coding expert. Help me write Python code using the Dreamdata Server-Side Tracking API.

Official documentation: https://developer.dreamdata.io/server-side/server-side-tracking/

> **Direction:** This API is for sending events TO Dreamdata (inbound tracking). It is not a data extraction API. To pull attribution data OUT of Dreamdata, use their BigQuery V2 or Snowflake V3 warehouse export.

## Authentication

HTTP Basic Auth. API key is the username; password is empty.

Get your Source API Key in the Dreamdata platform under: Data Platform → Sources → Server Side Analytics APIs.

```python
import httpx

API_KEY = "YOUR_DREAMDATA_API_KEY"
auth = httpx.BasicAuth(API_KEY, "")  # API key as username, empty password
BATCH_URL = "https://api.dreamdata.cloud/v1/batch"
```

## Sending Events

All events are sent as a batch to `POST https://api.dreamdata.cloud/v1/batch`. Max 500KB per request. Each event needs a unique `messageId` (UUID) and an ISO 8601 `timestamp`.

### Identify + Track (known user)

Use both `identify` and `track` when you know the user (e.g. form submission, login).

```python
import asyncio
import uuid
from datetime import datetime, timezone
import httpx

async def send_events(api_key: str, events: list[dict]) -> None:
    auth = httpx.BasicAuth(api_key, "")
    payload = {
        "messageId": str(uuid.uuid4()),
        "sentAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "batch": events,
    }
    async with httpx.AsyncClient(auth=auth) as client:
        r = await client.post(
            BATCH_URL,
            json=payload,
        )
        r.raise_for_status()

events = [
    {
        "type": "identify",
        "messageId": str(uuid.uuid4()),
        "userId": "user-123",
        "traits": {
            "email": "jane@example.com",
            "name": "Jane Smith",
        },
        "context": {
            "ip": "1.2.3.4",
            "campaign": {
                "source": "google",
                "medium": "cpc",
                "name": "q4-trial-signup",
            },
            "library": {"name": "custom-backend", "version": "1.0"},
        },
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    },
    {
        "type": "track",
        "messageId": str(uuid.uuid4()),
        "userId": "user-123",
        "event": "form_submitted",
        "properties": {
            "form_name": "contact",
            "plan": "pro",
        },
        "context": {
            "ip": "1.2.3.4",
            "page": {"url": "https://example.com/contact"},
            "campaign": {
                "source": "google",
                "medium": "cpc",
                "name": "q4-trial-signup",
            },
            "library": {"name": "custom-backend", "version": "1.0"},
            "userAgent": "python-httpx/0.27",
        },
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    },
]

asyncio.run(send_events(API_KEY, events))
```

### Page View (anonymous visitor)

Use `anonymousId` when the user is not yet identified.

```python
page_event = {
    "type": "page",
    "messageId": str(uuid.uuid4()),
    "anonymousId": "anon-uuid-here",
    "context": {
        "ip": "1.2.3.4",
        "page": {
            "url": "https://example.com/pricing",
            "referrer": "https://google.com",
        },
        "campaign": {
            "source": "google",
            "medium": "cpc",
            "name": "brand",
        },
        "library": {"name": "custom-backend", "version": "1.0"},
        "userAgent": "Mozilla/5.0 ...",
    },
    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
}
```

### Group Event (Account Association)

Use `group` to associate a user with a company/account — critical for B2B revenue attribution.

```python
group_event = {
    "type": "group",
    "messageId": str(uuid.uuid4()),
    "userId": "user-123",
    "groupId": "company-456",
    "traits": {
        "name": "Acme Corp",
        "industry": "SaaS",
        "plan": "enterprise",
        "employee_count": 500,
    },
    "context": {
        "library": {"name": "custom-backend", "version": "1.0"},
    },
    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
}
```

### Link Anonymous to Known User

When a visitor identifies (e.g. signs up), send an `alias` event to merge the anonymous and known identities:

```python
alias_event = {
    "type": "alias",
    "userId": "user-123",
    "previousId": "anon-uuid-here",
}
```

## User Identification Rules

- Use `userId` when user is logged in or you have a CRM/DB ID
- Use `anonymousId` for pre-login or unauthenticated visitors
- Every event requires either `userId` or `anonymousId`

## Cookieless Tracking (company-level only)

When you only need company-level attribution via IP lookup:

```python
cookieless_event = {
    "type": "track",
    "anonymousId": "cookieless",
    "event": "Page Viewed",
    "context": {"ip": "203.0.113.42"},
}
```

## Batch Size Limits

- Max payload: **500KB per request**
- Mix `identify`, `track`, `page`, and `alias` events freely in one batch
- Timestamps must be ISO 8601 format

## Installation

```bash
pip install httpx
```
