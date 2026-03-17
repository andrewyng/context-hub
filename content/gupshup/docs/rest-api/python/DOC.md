---
name: rest-api
description: "Gupshup - WhatsApp Business Messaging API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "gupshup,whatsapp,messaging,whatsapp-business,templates,notifications,conversational,api,integration"
---

# Gupshup WhatsApp Business API

> **Golden Rule:** Gupshup has no official Python SDK. Use `httpx` for direct REST access. Auth uses an `apikey` header. **Critical:** All message-sending endpoints use `application/x-www-form-urlencoded`, NOT JSON. The `message` field is a JSON string within a form body. Session messages require a 24-hour window; template messages can be sent anytime.

## Installation

```bash
pip install httpx
```

## Base URLs

| Purpose | URL |
|---|---|
| Session Messages | `https://api.gupshup.io/wa/api/v1/msg` |
| Template Messages | `https://api.gupshup.io/wa/api/v1/template/msg` |

## Authentication

**Type:** API Key (custom header)

```python
import httpx
import json

API_KEY = "your-gupshup-api-key"
SOURCE_NUMBER = "919876543210"  # Your registered WhatsApp Business number
APP_NAME = "YourAppName"       # Gupshup app name for the source number

headers = {"apikey": API_KEY}
client = httpx.AsyncClient(headers=headers)
```

**Important:** Get your API key from Gupshup Dashboard > App Settings.

## Rate Limiting

| Limit Type | Value |
|---|---|
| Gupshup API | ~20 messages/second per app |
| WhatsApp platform | 20-50 API calls/second (varies by tier) |
| Daily unique users | Tiered: 250 / 1K / 10K / 100K / unlimited |

## Methods

### `send_session_message`

**Endpoint:** `POST https://api.gupshup.io/wa/api/v1/msg`

Send a free-form message within the 24-hour customer session window.

| Parameter | Type | Default |
|---|---|---|
| `channel` | `str` | **required** (`whatsapp`) |
| `source` | `str` | **required** (your WhatsApp Business number) |
| `src.name` | `str` | **required** (Gupshup app name) |
| `destination` | `str` | **required** (recipient number) |
| `message` | `str` | **required** (JSON string of message payload) |

**Returns:** JSON with `status` (`submitted`) and `messageId`

```python
import json

message_payload = json.dumps({"type": "text", "text": "Hello from Gupshup!"})

data = {
    "channel": "whatsapp",
    "source": SOURCE_NUMBER,
    "src.name": APP_NAME,
    "destination": "919123456789",
    "message": message_payload
}
response = await client.post(
    "https://api.gupshup.io/wa/api/v1/msg",
    data=data,  # form-encoded, NOT json=
    headers={"Content-Type": "application/x-www-form-urlencoded", **headers}
)
response.raise_for_status()
result = response.json()
message_id = result["messageId"]
```

### `send_image_message`

**Endpoint:** `POST https://api.gupshup.io/wa/api/v1/msg`

Send an image within a session window.

```python
message_payload = json.dumps({
    "type": "image",
    "originalUrl": "https://example.com/image.jpg",
    "caption": "Check this out",
    "previewUrl": "https://example.com/thumb.jpg"
})

data = {
    "channel": "whatsapp",
    "source": SOURCE_NUMBER,
    "src.name": APP_NAME,
    "destination": "919123456789",
    "message": message_payload
}
response = await client.post(
    "https://api.gupshup.io/wa/api/v1/msg",
    data=data,
    headers={"Content-Type": "application/x-www-form-urlencoded", **headers}
)
response.raise_for_status()
```

### `send_template_message`

**Endpoint:** `POST https://api.gupshup.io/wa/api/v1/template/msg`

Send a pre-approved template message (works outside the 24-hour session window).

| Parameter | Type | Default |
|---|---|---|
| `source` | `str` | **required** (sender number) |
| `src.name` | `str` | **required** (app name) |
| `destination` | `str` | **required** (recipient number) |
| `template` | `str` | **required** (JSON string with `id` and `params`) |

**Returns:** JSON with `messageId` and `status`

```python
template_payload = json.dumps({
    "id": "your_template_id",
    "params": ["John", "Order #12345"]
})

data = {
    "source": SOURCE_NUMBER,
    "src.name": APP_NAME,
    "destination": "919123456789",
    "template": template_payload
}
response = await client.post(
    "https://api.gupshup.io/wa/api/v1/template/msg",
    data=data,
    headers={"Content-Type": "application/x-www-form-urlencoded", **headers}
)
response.raise_for_status()
result = response.json()
```

### `send_location_message`

**Endpoint:** `POST https://api.gupshup.io/wa/api/v1/msg`

Send a location pin within a session window.

```python
message_payload = json.dumps({
    "type": "location",
    "longitude": 72.8777,
    "latitude": 19.0760,
    "name": "Mumbai",
    "address": "Maharashtra, India"
})

data = {
    "channel": "whatsapp",
    "source": SOURCE_NUMBER,
    "src.name": APP_NAME,
    "destination": "919123456789",
    "message": message_payload
}
response = await client.post(
    "https://api.gupshup.io/wa/api/v1/msg",
    data=data,
    headers={"Content-Type": "application/x-www-form-urlencoded", **headers}
)
response.raise_for_status()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(
        "https://api.gupshup.io/wa/api/v1/msg",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded", **headers}
    )
    response.raise_for_status()
    result = response.json()
    if result.get("status") == "error":
        print(f"Gupshup error: {result.get('message')}")
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Auth failed -- check apikey header")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce message throughput")
    else:
        print(f"Gupshup API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- **Content-Type is `application/x-www-form-urlencoded`**, NOT `application/json` -- this is the #1 mistake
- The `message` field is a **JSON string inside a form body** -- use `json.dumps()` then pass via `data=`
- **24-hour session window**: Free-form messages only work within 24 hours of user's last message; use template messages outside this window
- Templates must be **pre-approved by Meta** before use
- Phone numbers use **E.164 without the `+` prefix** (e.g., `919876543210` for India)
- API response `"status": "submitted"` means Gupshup accepted it -- NOT that it was delivered; use webhooks for delivery confirmation
- Message processing is **asynchronous** -- delivery is not guaranteed by a 200 response
- Gupshup error codes: `1002` = number not on WhatsApp, `1003` = insufficient wallet balance, `1004` = user not opted-in
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
