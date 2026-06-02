---
name: rest-api
description: "MSG91 - Transactional SMS, Email & WhatsApp API (India)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "msg91,sms,email,whatsapp,otp,india,messaging,api"
---

# MSG91 REST API Reference (Python / httpx)

MSG91 is India's leading cloud communication platform for transactional SMS, email, WhatsApp messaging, and OTP verification. All API requests authenticate via the `authkey` header.

**Base URL:** `https://control.msg91.com/api/v5`

## Authentication

Every request requires your MSG91 authkey in the header:

```
authkey: <your_authkey>
```

Obtain your authkey from the MSG91 dashboard under **API Keys**.

---

## 1. Send SMS

Send transactional SMS using a pre-approved template.

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /flow` |
| **Full URL** | `https://control.msg91.com/api/v5/flow` |
| **Content-Type** | `application/json` |

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template_id` | string | Yes | SMS template ID from MSG91 dashboard |
| `recipients` | array | Yes | List of recipient objects |
| `recipients[].mobiles` | string | Yes | Phone number with country code (e.g. `919876543210`) |
| `recipients[].VAR1` | string | No | Template variable (case-sensitive, matches template) |
| `recipients[].VAR2` | string | No | Additional template variable |
| `short_url` | string | No | `"1"` to enable URL shortening, `"0"` to disable |
| `short_url_expiry` | string | No | Short URL expiry in seconds |
| `realTimeResponse` | string | No | `"1"` for real-time error response |

### Example

```python
import httpx

async def send_sms(authkey: str, template_id: str, mobile: str, variables: dict) -> dict:
    """Send transactional SMS via MSG91 Flow API."""
    url = "https://control.msg91.com/api/v5/flow"
    headers = {
        "accept": "application/json",
        "authkey": authkey,
        "content-type": "application/json",
    }
    recipient = {"mobiles": mobile}
    recipient.update(variables)

    payload = {
        "template_id": template_id,
        "recipients": [recipient],
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()

# Usage:
# result = await send_sms(
#     authkey="your_authkey",
#     template_id="6123abcdef01234567890abc",
#     mobile="919876543210",
#     variables={"VAR1": "John", "VAR2": "12345"},
# )
```

### Response

```json
{
  "type": "success",
  "message": "5e1e93cad6fc054d8e759a5b"
}
```

The `message` field contains the request ID for tracking.

---

## 2. Send OTP

Send a one-time password to a mobile number.

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /otp` |
| **Full URL** | `https://control.msg91.com/api/v5/otp` |
| **Content-Type** | `application/json` |

### Request Body / Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authkey` | string | Yes | Your MSG91 authkey |
| `mobile` | string | Yes | Phone with country code (e.g. `919876543210`) |
| `template_id` | string | Yes | OTP template ID (template must contain `##OTP##` placeholder) |
| `otp` | string | No | Specify a custom OTP value |
| `otp_expiry` | integer | No | Expiry in minutes (default 15, max 10080) |
| `otp_length` | integer | No | Number of digits (4-9, default 4) |
| `unicode` | string | No | `"1"` for non-English languages |
| `invisible` | string | No | `"1"` for mobile app silent verification |
| `userip` | string | No | End-user IP address |
| `realTimeResponse` | string | No | `"1"` for real-time error codes |

### Example

```python
import httpx

async def send_otp(
    authkey: str,
    mobile: str,
    template_id: str,
    otp_length: int = 6,
    otp_expiry: int = 10,
) -> dict:
    """Send OTP to a mobile number via MSG91."""
    url = "https://control.msg91.com/api/v5/otp"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
    }
    payload = {
        "authkey": authkey,
        "mobile": mobile,
        "template_id": template_id,
        "otp_length": otp_length,
        "otp_expiry": otp_expiry,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()

# Usage:
# result = await send_otp(
#     authkey="your_authkey",
#     mobile="919876543210",
#     template_id="6123abcdef01234567890abc",
# )
```

### Response

```json
{
  "type": "success",
  "request_id": "34676b6d426b303131363537"
}
```

---

## 3. Verify OTP

Verify an OTP previously sent to a mobile number.

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /otp/verify` |
| **Full URL** | `https://control.msg91.com/api/v5/otp/verify` |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authkey` | string | Yes | Your MSG91 authkey |
| `mobile` | string | Yes | Phone with country code |
| `otp` | string | Yes | OTP entered by the user |

### Example

```python
import httpx

async def verify_otp(authkey: str, mobile: str, otp: str) -> dict:
    """Verify an OTP sent via MSG91."""
    url = "https://control.msg91.com/api/v5/otp/verify"
    params = {
        "authkey": authkey,
        "mobile": mobile,
        "otp": otp,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

# Usage:
# result = await verify_otp(
#     authkey="your_authkey",
#     mobile="919876543210",
#     otp="482901",
# )
```

### Response

```json
{
  "type": "success",
  "message": "OTP verified successfully"
}
```

---

## 4. Resend OTP

Resend OTP to the same mobile number via SMS or voice.

| Field | Value |
|-------|-------|
| **Endpoint** | `GET /otp/retry` |
| **Full URL** | `https://control.msg91.com/api/v5/otp/retry` |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authkey` | string | Yes | Your MSG91 authkey |
| `mobile` | string | Yes | Phone with country code |
| `retrytype` | string | No | `"text"` for SMS (default), `"voice"` for voice call |

### Example

```python
import httpx

async def resend_otp(authkey: str, mobile: str, retrytype: str = "text") -> dict:
    """Resend OTP via SMS or voice call."""
    url = "https://control.msg91.com/api/v5/otp/retry"
    params = {
        "authkey": authkey,
        "mobile": mobile,
        "retrytype": retrytype,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
```

---

## 5. Send Email

Send transactional email using a pre-approved template.

| Field | Value |
|-------|-------|
| **Endpoint** | `POST /email/send` |
| **Full URL** | `https://control.msg91.com/api/v5/email/send` |
| **Content-Type** | `application/json` |

### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | Yes | Verified sending domain |
| `template_id` | string | Yes | Email template ID from MSG91 dashboard |
| `recipients` | array | Yes | List of recipient objects |
| `recipients[].to` | array | Yes | Array of `{"email": "...", "name": "..."}` objects |
| `recipients[].variables` | object | No | Template variable key-value pairs |
| `from` | object | Yes | `{"email": "sender@domain.com", "name": "Sender Name"}` |

### Example

```python
import httpx

async def send_email(
    authkey: str,
    domain: str,
    template_id: str,
    to_email: str,
    to_name: str,
    from_email: str,
    from_name: str,
    variables: dict | None = None,
) -> dict:
    """Send transactional email via MSG91."""
    url = "https://control.msg91.com/api/v5/email/send"
    headers = {
        "accept": "application/json",
        "authkey": authkey,
        "content-type": "application/json",
    }
    payload = {
        "domain": domain,
        "template_id": template_id,
        "recipients": [
            {
                "to": [{"email": to_email, "name": to_name}],
                "variables": variables or {},
            }
        ],
        "from": {"email": from_email, "name": from_name},
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()

# Usage:
# result = await send_email(
#     authkey="your_authkey",
#     domain="mail.example.com",
#     template_id="global_otp_01",
#     to_email="user@example.com",
#     to_name="Priya Sharma",
#     from_email="noreply@mail.example.com",
#     from_name="MyApp",
#     variables={"company_name": "MyApp", "otp": "482901"},
# )
```

### Response

```json
{
  "type": "success",
  "message": "Request accepted"
}
```

---

## Error Handling

MSG91 returns errors in a consistent format:

```json
{
  "type": "error",
  "message": "Description of the error"
}
```

Common error messages:

| Error | Cause |
|-------|-------|
| `Auth Key missing` | Missing `authkey` header or parameter |
| `Please enter atleast one number` | No mobile number provided |
| `The provided flow ID or template ID is invalid` | Invalid template/flow ID |
| `Invalid OTP` | OTP verification failed |
| `OTP expired` | OTP has passed its expiry window |

### Reusable Error Handler

```python
import httpx

class MSG91Error(Exception):
    """Custom exception for MSG91 API errors."""
    def __init__(self, message: str, response: httpx.Response):
        super().__init__(message)
        self.response = response

async def msg91_request(
    method: str,
    url: str,
    authkey: str,
    **kwargs,
) -> dict:
    """Generic MSG91 API request with error handling."""
    headers = kwargs.pop("headers", {})
    headers.update({
        "accept": "application/json",
        "authkey": authkey,
    })

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(method, url, headers=headers, **kwargs)
        data = resp.json()

        if resp.status_code >= 400 or data.get("type") == "error":
            raise MSG91Error(data.get("message", "Unknown error"), resp)

        return data
```

---

## Rate Limits and Notes

- Templates must be pre-approved via the MSG91 dashboard before use.
- OTP templates must include the `##OTP##` placeholder.
- SMS sending uses the Flow API (`/flow`), which requires a template-based approach.
- The `authkey` is your primary credential; keep it secret.
- Phone numbers must include the country code without `+` (e.g. `919876543210` for India).
- Email domains must be verified with DNS (TXT + MX records) before sending.

## References

- MSG91 API Docs: https://docs.msg91.com/
- SMS: https://docs.msg91.com/sms/send-sms
- OTP: https://docs.msg91.com/otp/sendotp
- Email: https://docs.msg91.com/email/send-email
