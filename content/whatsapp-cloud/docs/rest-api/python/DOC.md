---
name: rest-api
description: "WhatsApp Cloud API - Business Messaging Platform (Meta)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "whatsapp,meta,messaging,business,cloud-api,webhook,api,integration"
---

# WhatsApp Cloud API

The WhatsApp Cloud API, hosted by Meta, allows businesses to send and receive messages through WhatsApp programmatically. It supports text, template, media, interactive, location, and contact messages. Webhook notifications deliver inbound messages and status updates in real time.

## Golden Rule

Always use async `httpx` for all HTTP calls. Never use the `facebook-sdk`, `requests`, or any third-party WhatsApp SDK. Message bodies are JSON (`json=`), media uploads are multipart form-data (`files=`). All endpoints require a valid System User Access Token in the `Authorization: Bearer` header. Template messages are the only way to initiate conversations outside the 24-hour customer service window.

## Installation

```bash
pip install httpx
```

## Base URL

```
https://graph.facebook.com/v21.0
```

All endpoints are relative to this base. Replace `v21.0` with the latest Graph API version as needed. Responses are JSON.

## Authentication

All requests require a **System User Access Token** (long-lived, generated in Meta Business Suite) or a temporary access token from the App Dashboard.

```python
import httpx

ACCESS_TOKEN = "your_system_user_access_token"
PHONE_NUMBER_ID = "your_whatsapp_business_phone_number_id"

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
}

BASE_URL = "https://graph.facebook.com/v21.0"
```

### Token Types

| Token | Lifetime | Use Case |
|---|---|---|
| Temporary token | 24 hours | Testing from App Dashboard |
| System User Access Token | Does not expire | Production (recommended) |

Generate a System User Access Token in **Meta Business Suite > Business Settings > System Users**. Required permissions: `whatsapp_business_messaging`, `whatsapp_business_management`.

## Rate Limiting

| Tier | Default | Upgraded |
|---|---|---|
| Messages per second (MPS) | 80 MPS per phone number | Up to 1,000 MPS |

Messaging limits determine how many unique users you can message in a rolling 24-hour window (business portfolio level):

| Tier | Unique Users / 24 Hours |
|---|---|
| Tier 1 (new) | 1,000 |
| Tier 2 | 10,000 |
| Tier 3 | 100,000 |
| Tier 4 | Unlimited |

Key rate limits: media upload 25 req/s per phone number, general Graph API 200 calls/hour per user token. When rate-limited, the API returns HTTP `429` or error code `4`/`80007`.

## Methods

### Send Text Message

Send a plain text message to a WhatsApp user. The user must have messaged you first (within 24-hour window) or you must use a template.

```python
async def send_text_message(
    client: httpx.AsyncClient, to: str, body: str, preview_url: bool = False,
) -> dict:
    resp = await client.post(
        f"{BASE_URL}/{PHONE_NUMBER_ID}/messages",
        headers=HEADERS,
        json={
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": preview_url, "body": body},
        },
    )
    resp.raise_for_status()
    return resp.json()
```

**Parameters:** `to` -- recipient phone in international format (no `+` prefix, e.g., `919876543210`). `messaging_product` -- always `"whatsapp"`. `recipient_type` -- always `"individual"`.

---

### Send Template Message

Template messages are pre-approved formats required for initiating conversations outside the 24-hour service window.

```python
async def send_template_message(
    client: httpx.AsyncClient, to: str, template_name: str,
    language_code: str = "en_US", components: list | None = None,
) -> dict:
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {"name": template_name, "language": {"code": language_code}},
    }
    if components:
        payload["template"]["components"] = components
    resp = await client.post(
        f"{BASE_URL}/{PHONE_NUMBER_ID}/messages", headers=HEADERS, json=payload,
    )
    resp.raise_for_status()
    return resp.json()

# Example: Template with body parameters
result = await send_template_message(
    client, to="919876543210", template_name="order_confirmation",
    components=[{
        "type": "body",
        "parameters": [
            {"type": "text", "text": "ORDER-12345"},
            {"type": "text", "text": "$49.99"},
        ],
    }],
)
```

---

### Send Media Message (Image, Document, Audio, Video)

All media types follow the same pattern. Provide either a URL (`link`) or a previously uploaded `media_id`:

```python
async def send_media_message(
    client: httpx.AsyncClient, to: str,
    media_type: str, media_url: str | None = None,
    media_id: str | None = None, caption: str = "", filename: str = "",
) -> dict:
    media_obj = {"id": media_id} if media_id else {"link": media_url}
    if caption:
        media_obj["caption"] = caption
    if filename and media_type == "document":
        media_obj["filename"] = filename
    resp = await client.post(
        f"{BASE_URL}/{PHONE_NUMBER_ID}/messages",
        headers=HEADERS,
        json={
            "messaging_product": "whatsapp", "to": to,
            "type": media_type, media_type: media_obj,
        },
    )
    resp.raise_for_status()
    return resp.json()
```

Supported `media_type` values: `image`, `document`, `audio`, `video`. Size limits: images 5 MB, audio/video 16 MB, documents 100 MB.

---

### Send Interactive Message (Buttons)

```python
async def send_button_message(
    client: httpx.AsyncClient, to: str, body_text: str,
    buttons: list[dict], header_text: str = "", footer_text: str = "",
) -> dict:
    interactive = {
        "type": "button",
        "body": {"text": body_text},
        "action": {"buttons": [
            {"type": "reply", "reply": {"id": btn["id"], "title": btn["title"]}}
            for btn in buttons
        ]},
    }
    if header_text:
        interactive["header"] = {"type": "text", "text": header_text}
    if footer_text:
        interactive["footer"] = {"text": footer_text}
    resp = await client.post(
        f"{BASE_URL}/{PHONE_NUMBER_ID}/messages",
        headers=HEADERS,
        json={
            "messaging_product": "whatsapp", "to": to,
            "type": "interactive", "interactive": interactive,
        },
    )
    resp.raise_for_status()
    return resp.json()
```

**Limits:** Maximum 3 reply buttons. Button titles max 20 characters.

---

### Upload Media

Upload a media file to WhatsApp's servers. Returns a `media_id` for use in messages.

```python
async def upload_media(client: httpx.AsyncClient, file_path: str, mime_type: str) -> str:
    with open(file_path, "rb") as f:
        resp = await client.post(
            f"{BASE_URL}/{PHONE_NUMBER_ID}/media",
            headers={"Authorization": f"Bearer {ACCESS_TOKEN}"},
            data={"messaging_product": "whatsapp", "type": mime_type},
            files={"file": (file_path.split("/")[-1], f, mime_type)},
        )
    resp.raise_for_status()
    return resp.json()["id"]
```

Uploaded media is stored for **30 days**. Media download URLs (via `GET /{media_id}`) expire after **5 minutes**.

---

### Webhook Verification (GET)

When you configure a webhook URL in the App Dashboard, Meta sends a GET request to verify your endpoint.

```python
async def webhook_verify(request) -> str:
    VERIFY_TOKEN = "your_verify_token_string"
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == VERIFY_TOKEN:
        return PlainTextResponse(challenge, status_code=200)
    return PlainTextResponse("Forbidden", status_code=403)
```

Your endpoint must use HTTPS with a valid CA-signed TLS certificate. Return the `hub.challenge` value as plain text (not JSON).

---

### Webhook Event Handler (POST)

Inbound messages and status updates arrive as POST requests to your webhook URL.

```python
async def webhook_handler(request) -> dict:
    body = await request.json()
    for entry in body.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for message in value.get("messages", []):
                sender = message["from"]
                msg_type = message["type"]
                msg_id = message["id"]
                if msg_type == "text":
                    text_body = message["text"]["body"]
                elif msg_type == "image":
                    media_id = message["image"]["id"]
                elif msg_type == "interactive":
                    if "button_reply" in message["interactive"]:
                        button_id = message["interactive"]["button_reply"]["id"]
            for status in value.get("statuses", []):
                status_value = status["status"]  # sent/delivered/read/failed
    return {"status": "ok"}
```

## Error Handling

### Error Response Format

```json
{
    "error": {
        "message": "Human-readable description",
        "type": "OAuthException",
        "code": 100,
        "error_subcode": 33,
        "fbtrace_id": "trace_id_for_debugging"
    }
}
```

### Common Error Codes

| Code | Subcode | Meaning |
|---|---|---|
| `4` | -- | API throttling (rate limited) |
| `100` | `33` | Parameter missing or invalid |
| `100` | `2494010` | Phone number not registered on WhatsApp |
| `131047` | -- | Re-engagement: >24 hours since last reply |
| `131048` | -- | Spam rate limit hit |
| `132000` | -- | Template parameter count mismatch |
| `132001` | -- | Template does not exist |
| `190` | -- | Access token expired or invalid |
| `80007` | -- | Rate limit exceeded |

### Recommended Error Handling Pattern

```python
class WhatsAppAPIError(Exception):
    def __init__(self, code: int, message: str, subcode: int = 0):
        self.code = code
        self.subcode = subcode
        super().__init__(f"[{code}/{subcode}] {message}")

async def safe_send(client: httpx.AsyncClient, payload: dict) -> dict:
    try:
        resp = await client.post(
            f"{BASE_URL}/{PHONE_NUMBER_ID}/messages", headers=HEADERS, json=payload,
        )
        data = resp.json()
        if "error" in data:
            err = data["error"]
            raise WhatsAppAPIError(err.get("code", 0), err.get("message", "Unknown"), err.get("error_subcode", 0))
        resp.raise_for_status()
        return data
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            await asyncio.sleep(5)
            return await safe_send(client, payload)
        raise
```

## Common Pitfalls

1. **24-hour messaging window** -- Free-form messages only within 24 hours of the user's last message. Outside this window, use an approved template. Violating this returns error `131047`.

2. **Phone number format** -- International format without `+` prefix or formatting: `919876543210`, not `+91 98765 43210`.

3. **`messaging_product` is required** -- Every message body must include `"messaging_product": "whatsapp"`. Omitting it returns 400.

4. **Template approval delay** -- New templates must be approved by Meta before use (minutes to 24+ hours). Unapproved template returns `132001`.

5. **Media URL expiry** -- Download URLs expire after **5 minutes**. Uploaded media expires after **30 days**.

6. **Webhook must return 200 quickly** -- Process messages asynchronously. Meta retries and disables webhooks that time out.

7. **Webhook verification is GET, events are POST** -- Verification returns challenge as plain text. Events arrive as POST with JSON. Self-signed certificates are not supported.

8. **Template parameter indexing** -- Parameters are positional. Mismatched count returns `132000`.

9. **Duplicate webhook events** -- Use WAMID (`message.id`) to deduplicate. One webhook per Meta App; fan out internally.
