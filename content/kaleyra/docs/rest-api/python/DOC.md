---
name: rest-api
description: "Kaleyra - Cloud Communications Platform (SMS, Voice, WhatsApp)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "kaleyra,sms,voice,whatsapp,cpaas,communications,india,api"
---

# Kaleyra REST API Reference (Python / httpx)

Kaleyra is a cloud communications platform (CPaaS) offering SMS, Voice, WhatsApp, Email, and OTP verification APIs. It has a strong presence in India and serves global markets. All APIs are RESTful with JSON responses.

## Golden Rule

Always use async `httpx` for all HTTP calls. Never use `requests` or any third-party Kaleyra SDK. All endpoints require the `api-key` header. The account SID is part of the URL path for every request.

## Installation

```bash
pip install httpx
```

## Base URL

The base URL varies by region. Your SID (account identifier) is part of the URL path.

| Region | Base URL |
|--------|----------|
| India (IN) | `https://api.in.kaleyra.io/v1/<SID>` |
| Singapore (SG) | `https://api.kaleyra.io/v1/<SID>` |
| Europe (EU) | `https://api.eu.kaleyra.io/v1/<SID>` |
| North America (NA) | `https://api.na.kaleyra.io/v1/<SID>` |

Replace `<SID>` with your account SID (e.g. `HXXXXXXX071IN`).

## Authentication

Every request requires the `api-key` header. Obtain your API key from **Kaleyra Customer Portal > API Settings**.

```python
import os
import httpx

KALEYRA_SID = os.environ["KALEYRA_SID"]
KALEYRA_API_KEY = os.environ["KALEYRA_API_KEY"]
KALEYRA_BASE = f"https://api.in.kaleyra.io/v1/{KALEYRA_SID}"

HEADERS = {"api-key": KALEYRA_API_KEY, "content-type": "application/json"}
```

## Rate Limiting

Kaleyra does not publish explicit rate limits. Throughput depends on your account tier and channel. Use `callback_profile_id` (SMS) or `callback_url` (WhatsApp) for async delivery status instead of polling.

## Methods

### Send SMS

`POST /messages` -- Send a transactional or marketing SMS message.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient phone number with country code |
| `sender` | string | Yes | Alphanumeric Sender ID |
| `body` | string | Yes | SMS message body |
| `type` | string | Yes | Route: `OTP`, `TXN`, `MKT`, `SI` |
| `callback_profile_id` | string | Yes | Webhook profile ID for delivery status |
| `template_id` | string | Conditional | DLT template ID (required for India) |

```python
async def send_sms(
    to: str, sender: str, body: str, msg_type: str = "TXN",
    callback_profile_id: str = "", template_id: str | None = None,
) -> dict:
    payload = {
        "to": to, "sender": sender, "body": body,
        "type": msg_type, "callback_profile_id": callback_profile_id,
    }
    if template_id:
        payload["template_id"] = template_id
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{KALEYRA_BASE}/messages", json=payload, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()
```

Response includes `id`, `data[].message_id`, and `data[].recipient`.

---

### Send WhatsApp Message

`POST /messages` -- Send a text or template message via WhatsApp Business API.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient WhatsApp number (E.164) |
| `from` | string | Yes | Registered WhatsApp Business number (E.164) |
| `type` | string | Yes | `text`, `template`, `image`, `document`, `video`, `audio` |
| `channel` | string | Yes | Must be `"whatsapp"` |
| `body` | string | Yes | Message content |
| `template` | object | Conditional | Required when `type` is `template` |

```python
async def send_whatsapp(
    to: str, from_number: str, body: str,
    msg_type: str = "text", template: dict | None = None,
    callback_url: str | None = None,
) -> dict:
    payload = {
        "to": to, "from": from_number, "type": msg_type,
        "channel": "whatsapp", "body": body,
    }
    if template:
        payload["template"] = template
    if callback_url:
        payload["callback_url"] = callback_url
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{KALEYRA_BASE}/messages", json=payload, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()

# Text message:
# await send_whatsapp(to="+919876543210", from_number="+919123456789", body="Hello!")

# Template message (required for initiating conversations):
# await send_whatsapp(
#     to="+919876543210", from_number="+919123456789",
#     body="", msg_type="template",
#     template={"template_name": "order_confirmation", "language": "en",
#               "body_params": ["Rahul", "ORD-98765"]},
# )
```

---

### Make Outbound Voice Call

`POST /voice/outbound` -- Initiate an outbound voice call. Uses `application/x-www-form-urlencoded`.

**Note:** Not available in the NA region.

```python
async def make_call(to: str, target: str, bridge: str | None = None) -> dict:
    """target: flow ID, sound ID, or TTS string like 'tts:en-IN:Your code is 1234'"""
    data = {"to": to, "target": target}
    if bridge:
        data["bridge"] = bridge
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{KALEYRA_BASE}/voice/outbound", data=data,
            headers={"api-key": KALEYRA_API_KEY, "content-type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        return resp.json()
```

---

### Generate OTP (Verify API)

`POST /verify` -- Generate and send an OTP to a mobile number.

```python
async def generate_otp(mobile: str, flow_id: str | None = None) -> dict:
    payload: dict = {"to": {"mobile": mobile}}
    if flow_id:
        payload["flow_id"] = flow_id
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{KALEYRA_BASE}/verify", json=payload, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()
    # Save result["data"]["verify_id"] for validation
```

---

### Validate OTP (Verify API)

`POST /verify/validate` -- Validate a previously sent OTP.

```python
async def validate_otp(verify_id: str, otp: str) -> dict:
    payload = {"verify_id": verify_id, "otp": otp}
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{KALEYRA_BASE}/verify/validate", json=payload, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

Kaleyra returns errors with a code and message:

```json
{"code": "RBC1001", "message": "Error description", "data": [], "error": {"detail": "..."}}
```

### Reusable Error-Handling Client

```python
class KaleyraError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(f"[{code}] {message}")
        self.code = code

async def safe_kaleyra_call(method: str, path: str, **kwargs) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(
            method, f"{KALEYRA_BASE}{path}", headers=HEADERS, **kwargs,
        )
        data = resp.json()
        if resp.status_code >= 400 or data.get("error"):
            raise KaleyraError(data.get("code", "UNKNOWN"), data.get("message", str(data.get("error"))))
        return data
```

### Common Verify API Error Codes

| Code | Description |
|------|-------------|
| `E804` | Missing mobile number |
| `E805` | Invalid mobile number format |
| `E802` | Invalid email address |
| `E905` | Invalid or unapproved flow ID |
| `E600` | Missing `to` field |

## Common Pitfalls

1. **SID is always in the URL path** -- Every endpoint requires `https://api.<region>.kaleyra.io/v1/<SID>/...`.

2. **India SMS requires DLT template_id** -- All India-bound SMS must include a pre-registered DLT `template_id`. Without it, messages are rejected.

3. **SMS route types** -- `OTP` (one-time passwords), `TXN` (transactional), `MKT` (marketing), `SI` (service implicit). Wrong type may cause delivery failure.

4. **WhatsApp opt-in required** -- Messages to users who have not opted-in require an approved template message.

5. **Voice outbound uses form-data** -- Unlike SMS and WhatsApp (JSON), voice calls use `application/x-www-form-urlencoded`.

6. **OTP is a two-step flow** -- Generate (`/verify`) then validate (`/verify/validate`), linked by `verify_id`.

7. **E.164 phone format** -- Phone numbers must include `+` prefix and country code (e.g., `+919876543210`).

8. **NA region voice restriction** -- Outbound voice calls are not available for North America region accounts.
