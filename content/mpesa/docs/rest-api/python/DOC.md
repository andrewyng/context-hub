---
name: rest-api
description: "M-Pesa Daraja - Mobile Money API (Safaricom Kenya)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mpesa,mobile-money,safaricom,kenya,africa,payments,api"
---

# M-Pesa Daraja API — Python (httpx)

## Golden Rule

Always generate a **fresh OAuth token** before each batch of requests — tokens expire in 3600 seconds. The **Password** field for STK Push is a Base64 encoding of `BusinessShortCode + Passkey + Timestamp`. All callbacks are POST requests to your `CallbackURL` — you must expose a publicly accessible HTTPS endpoint. Amounts are in whole **KES** (no decimals). Phone numbers must be in format `2547XXXXXXXX` (country code, no leading zero or plus).

## Installation

```bash
pip install httpx
```

## Base URL

| Environment | Base URL |
|---|---|
| **Sandbox** | `https://sandbox.safaricom.co.ke` |
| **Production** | `https://api.safaricom.co.ke` |

All endpoint paths are identical between sandbox and production — only the domain changes.

## Authentication

Daraja uses **OAuth 2.0 Client Credentials** flow. Send your Consumer Key and Consumer Secret via HTTP Basic Auth to get a time-limited access token.

```python
import httpx
import os
import base64
from datetime import datetime

CONSUMER_KEY = os.environ["MPESA_CONSUMER_KEY"]
CONSUMER_SECRET = os.environ["MPESA_CONSUMER_SECRET"]
BASE_URL = os.environ.get("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

async def get_access_token() -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/oauth/v1/generate",
            params={"grant_type": "client_credentials"},
            auth=(CONSUMER_KEY, CONSUMER_SECRET),
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()["access_token"]

async def get_client() -> httpx.AsyncClient:
    token = await get_access_token()
    return httpx.AsyncClient(
        base_url=BASE_URL,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        timeout=30.0,
    )
```

**Credentials:**
- **Consumer Key / Consumer Secret** — obtained from the Daraja portal (developer.safaricom.co.ke)
- **Passkey** — provided by Safaricom for Lipa Na M-Pesa Online (STK Push)
- **Initiator Name / Security Credential** — required for B2C, B2B, and query APIs

## Rate Limiting

Safaricom enforces rate limits per app. Sandbox is more restrictive than production. Typical production limits:
- ~50 transactions/second for STK Push
- Exact limits depend on your approved throughput tier

HTTP **500** or **503** often indicates throttling on Daraja. Implement retry with backoff:

```python
import asyncio

async def request_with_retry(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    for attempt in range(5):
        resp = await client.request(method, url, **kwargs)
        if resp.status_code in (429, 500, 503):
            wait = 2 ** attempt
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("M-Pesa API request failed after retries")
```

## Methods

### STK Push (Lipa Na M-Pesa Online)

Trigger a payment prompt on the customer's phone.

```python
BUSINESS_SHORTCODE = os.environ["MPESA_SHORTCODE"]
PASSKEY = os.environ["MPESA_PASSKEY"]

def generate_password() -> tuple[str, str]:
    """Returns (password, timestamp) for STK Push."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = f"{BUSINESS_SHORTCODE}{PASSKEY}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp

async def stk_push(client: httpx.AsyncClient, phone: str, amount: int,
                    account_ref: str, description: str, callback_url: str):
    """
    phone: 2547XXXXXXXX format
    amount: whole KES (no decimals)
    """
    password, timestamp = generate_password()
    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",  # or "CustomerBuyGoodsOnline"
        "Amount": amount,
        "PartyA": phone,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": callback_url,
        "AccountReference": account_ref,
        "TransactionDesc": description,
    }
    resp = await client.post("/mpesa/stkpush/v1/processrequest", json=payload)
    resp.raise_for_status()
    return resp.json()
    # Returns: {"MerchantRequestID": "...", "CheckoutRequestID": "...", "ResponseCode": "0", ...}
```

### STK Push Query

Check the status of an STK Push request.

```python
async def stk_query(client: httpx.AsyncClient, checkout_request_id: str):
    password, timestamp = generate_password()
    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id,
    }
    resp = await client.post("/mpesa/stkpushquery/v1/query", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### C2B Register URL

Register your confirmation and validation URLs for C2B payments.

```python
async def c2b_register(client: httpx.AsyncClient, shortcode: str,
                        confirmation_url: str, validation_url: str):
    payload = {
        "ShortCode": shortcode,
        "ResponseType": "Completed",  # or "Cancelled"
        "ConfirmationURL": confirmation_url,
        "ValidationURL": validation_url,
    }
    resp = await client.post("/mpesa/c2b/v1/registerurl", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### C2B Simulate (Sandbox Only)

```python
async def c2b_simulate(client: httpx.AsyncClient, shortcode: str,
                        amount: int, phone: str, bill_ref: str):
    payload = {
        "ShortCode": shortcode,
        "CommandID": "CustomerPayBillOnline",
        "Amount": amount,
        "Msisdn": phone,
        "BillRefNumber": bill_ref,
    }
    resp = await client.post("/mpesa/c2b/v1/simulate", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### B2C Payment (Business to Customer)

Send money to a customer (salaries, refunds, promotions).

```python
async def b2c_payment(client: httpx.AsyncClient, initiator_name: str,
                       security_credential: str, amount: int,
                       phone: str, shortcode: str,
                       result_url: str, timeout_url: str,
                       command_id: str = "BusinessPayment",
                       remarks: str = "", occasion: str = ""):
    """
    command_id: BusinessPayment, SalaryPayment, or PromotionPayment
    security_credential: encrypted initiator password (RSA with Safaricom cert)
    """
    payload = {
        "InitiatorName": initiator_name,
        "SecurityCredential": security_credential,
        "CommandID": command_id,
        "Amount": amount,
        "PartyA": shortcode,
        "PartyB": phone,
        "Remarks": remarks,
        "QueueTimeOutURL": timeout_url,
        "ResultURL": result_url,
        "Occasion": occasion,
    }
    resp = await client.post("/mpesa/b2c/v1/paymentrequest", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### Account Balance Query

```python
async def account_balance(client: httpx.AsyncClient, initiator_name: str,
                           security_credential: str, shortcode: str,
                           result_url: str, timeout_url: str):
    payload = {
        "Initiator": initiator_name,
        "SecurityCredential": security_credential,
        "CommandID": "AccountBalance",
        "PartyA": shortcode,
        "IdentifierType": "4",  # 4 = Shortcode
        "Remarks": "Balance query",
        "QueueTimeOutURL": timeout_url,
        "ResultURL": result_url,
    }
    resp = await client.post("/mpesa/accountbalance/v1/query", json=payload)
    resp.raise_for_status()
    return resp.json()
```

### Transaction Status Query

```python
async def transaction_status(client: httpx.AsyncClient, initiator_name: str,
                              security_credential: str, transaction_id: str,
                              shortcode: str, result_url: str, timeout_url: str):
    payload = {
        "Initiator": initiator_name,
        "SecurityCredential": security_credential,
        "CommandID": "TransactionStatusQuery",
        "TransactionID": transaction_id,
        "PartyA": shortcode,
        "IdentifierType": "4",
        "Remarks": "Status check",
        "QueueTimeOutURL": timeout_url,
        "ResultURL": result_url,
    }
    resp = await client.post("/mpesa/transactionstatus/v1/query", json=payload)
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Daraja returns a `ResponseCode` in the JSON body. HTTP status may be 200 even on logical errors.

**STK Push Result Codes (callback):**

| ResultCode | Meaning |
|---|---|
| 0 | Success |
| 1 | Insufficient balance |
| 1025 | Push request issue (system error) |
| 1032 | Request cancelled by user |
| 1037 | DS timeout (user did not respond) |
| 2001 | Invalid credentials / wrong initiator |

**HTTP-level errors:**

| Status | Meaning |
|---|---|
| 400 | Bad request (malformed JSON, missing fields) |
| 401 | Invalid or expired access token |
| 403 | Forbidden (IP not whitelisted in production) |
| 404 | Endpoint not found |
| 500 | Safaricom internal error (often transient) |
| 503 | Service unavailable (throttled or maintenance) |

```python
class MpesaError(Exception):
    def __init__(self, response_code: str, response_desc: str, http_status: int = 200):
        self.response_code = response_code
        self.response_desc = response_desc
        self.http_status = http_status
        super().__init__(f"[{response_code}] {response_desc}")

async def safe_request(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    resp = await client.request(method, url, **kwargs)
    body = resp.json()
    if resp.status_code >= 400:
        raise MpesaError(
            str(resp.status_code),
            body.get("errorMessage", body.get("ResponseDescription", "Unknown error")),
            resp.status_code,
        )
    response_code = body.get("ResponseCode", body.get("errorCode", ""))
    if response_code and response_code != "0":
        raise MpesaError(response_code, body.get("ResponseDescription", "Request failed"))
    return body
```

## Common Pitfalls

1. **Expired OAuth tokens** — Tokens last 3600 seconds. Always fetch a fresh token or cache with a TTL slightly under 1 hour.
2. **Phone number format** — Must be `2547XXXXXXXX`. Leading `+`, `07`, or `7` formats cause 400 errors. Strip and normalize.
3. **Password generation** — The Password is `base64(ShortCode + Passkey + Timestamp)`. A wrong Passkey or mismatched Timestamp causes "Invalid credentials."
4. **Callback URL must be HTTPS** — Daraja rejects HTTP callback URLs. In development, use ngrok or similar tunneling.
5. **Sandbox vs. production domain** — Forgetting to switch from `sandbox.safaricom.co.ke` to `api.safaricom.co.ke` is the most common go-live failure.
6. **IP whitelisting** — Production apps require your server IP to be whitelisted via the Daraja portal. Requests from non-whitelisted IPs get 403.
7. **Security Credential for B2C** — The initiator password must be encrypted with Safaricom's public certificate (different cert for sandbox vs. production). Use OpenSSL or Python's `cryptography` library.
8. **Callback response** — Your callback endpoint must respond with HTTP 200 and a JSON body `{"ResultCode": 0, "ResultDesc": "Success"}`. Otherwise, Daraja retries and may mark the transaction as failed.
9. **Amount as integer** — M-Pesa does not support decimal amounts. Passing `10.5` causes errors. Always use whole numbers.
10. **TransactionType confusion** — STK Push uses `CustomerPayBillOnline` for Paybill and `CustomerBuyGoodsOnline` for Till. Using the wrong type causes the push to fail silently.
