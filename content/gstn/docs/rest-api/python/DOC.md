---
name: rest-api
description: "GSTN (GST Network) - India's Goods and Services Tax filing, verification, e-Invoice, and e-Way Bill APIs"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "india,gst,gstn,tax,e-invoice,e-waybill,compliance,government"
---

# GSTN (GST Network) REST API

## Golden Rule

GSTN APIs are **not directly accessible** to end developers. Access is mediated through licensed **GST Suvidha Providers (GSPs)** who act as authorized gateways to the GSTN system. You must either become a GSP (heavy licensing process) or integrate through an existing GSP (e.g., Vayana, ClearTax, MasterGST, WhiteBooks, FinAGG). The GSP handles connectivity to GSTN and provides you with API credentials. All payloads involving sensitive data are encrypted using AES-256 with a session encryption key (SEK) that is itself encrypted with RSA. The **sandbox OTP for testing is always `575757`**.

## Installation

```bash
pip install httpx cryptography
```

Cryptography is needed for AES/RSA encryption of payloads.

## Base URL

GSTN APIs are accessed through your chosen GSP's gateway, which proxies to GSTN's `taxpayerapi` and `commonapi` endpoints.

### Via Vayana GSP

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://yoda.api.vayanagsp.in/gus` |
| Production | `https://api.gsp.vayana.com/gus` |

### Via MasterGST

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.mastergst.com` |

### Via WhiteBooks

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://apisandbox.whitebooks.in` |
| Production | `https://api.whitebooks.in` |

### GSTN Endpoint Patterns (via GSP)

| Path Pattern | Purpose |
|--------------|---------|
| `/gus/taxpayerapi/v1.0/authenticate` | Authentication |
| `/gus/taxpayerapi/v1.0/returns/gstr1` | GSTR-1 (outward supplies) |
| `/gus/taxpayerapi/v1.0/returns/gstr2a` | GSTR-2A (inward supplies) |
| `/gus/taxpayerapi/v1.0/returns/gstr3b` | GSTR-3B (summary return) |
| `/gus/commonapi/v1.1/search` | Taxpayer search (public) |
| `/gus/gstn-health/main` | Health check |

### e-Invoice IRPs (6 authorized portals)

| IRP | Production URL | Sandbox URL |
|-----|---------------|-------------|
| NIC-IRP 1 | `https://einvoice1.gst.gov.in` | `https://einv-apisandbox.nic.in` |
| NIC-IRP 2 | `https://einvoice2.gst.gov.in` | `https://einv-apisandbox.nic.in` |
| Cygnet | `https://einvoice3.gst.gov.in` | `https://sandbox.einvoice3.gst.gov.in` |
| Clear | `https://einvoice4.gst.gov.in` | `https://irp-sandbox.clear.in` |
| EY | `https://einvoice5.gst.gov.in` | `https://sandbox.einvoice5.gst.gov.in` |
| IRIS | `https://einvoice6.gst.gov.in` | Via portal registration |

### e-Way Bill

| Environment | Base URL |
|-------------|----------|
| Documentation | `https://docs.ewaybillgst.gov.in/apidocs/` |

## Authentication

GSTN uses a multi-step authentication process with OTP verification and encrypted session keys.

### Step 1: Authenticate with GSTN (via GSP)

```python
import httpx
import json
import os
import base64
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


GSP_BASE_URL = "https://yoda.api.vayanagsp.in/gus"  # Vayana sandbox


def encrypt_with_public_key(data: bytes, public_key_pem: bytes) -> str:
    """Encrypt data with GSTN's RSA public key."""
    public_key = serialization.load_pem_public_key(public_key_pem)
    encrypted = public_key.encrypt(data, asym_padding.PKCS1v15())
    return base64.b64encode(encrypted).decode()


async def authenticate_gstn(
    username: str, gstin: str, otp: str, public_key_pem: bytes
) -> dict:
    """
    Authenticate with GSTN. Returns auth_token and encrypted SEK.
    In sandbox, use OTP '575757'.
    """
    # Generate a random 256-bit AES key as the app_key
    app_key = os.urandom(32)
    encrypted_app_key = encrypt_with_public_key(app_key, public_key_pem)
    encrypted_otp = encrypt_with_public_key(otp.encode(), public_key_pem)

    headers = {
        "Content-Type": "application/json",
        "clientid": "your-gsp-client-id",
        "client-secret": "your-gsp-client-secret",
        "state-cd": gstin[:2],           # First 2 digits of GSTIN
        "ip-usr": "127.0.0.1",
        "txn": "unique-transaction-id",
    }

    payload = {
        "action": "AUTHTOKEN",
        "username": username,
        "app_key": encrypted_app_key,
        "otp": encrypted_otp,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GSP_BASE_URL}/taxpayerapi/v1.0/authenticate",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        # data: { "status_cd": "1", "auth_token": "...", "expiry": 120, "sek": "..." }
        # The SEK must be decrypted with your app_key using AES
        return data
```

### Step 2: Decrypt Session Encryption Key

```python
def decrypt_sek(encrypted_sek_b64: str, app_key: bytes) -> bytes:
    """Decrypt the Session Encryption Key using your app_key."""
    encrypted_sek = base64.b64decode(encrypted_sek_b64)
    cipher = Cipher(algorithms.AES(app_key), modes.ECB())
    decryptor = cipher.decryptor()
    sek = decryptor.update(encrypted_sek) + decryptor.finalize()
    return sek
```

### Headers for Authenticated Requests

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `clientid` | GSP-assigned client ID |
| `client-secret` | GSP-assigned client secret |
| `state-cd` | First 2 digits of GSTIN |
| `ip-usr` | Requester IP address |
| `txn` | Unique transaction identifier |
| `username` | GSTN username |
| `auth-token` | Token from authentication response |
| `gstin` | GSTIN of the taxpayer |

## Rate Limiting

GSTN enforces rate limits through the GSP layer. Specific limits vary by GSP but typically:

- Authentication: 1 request per 6 hours (token is reused)
- Return filing APIs: Subject to GSTN system load
- Search API: Fair-use limits apply
- e-Invoice auth token: Valid 6 hours (production), 1 hour (sandbox); same token returned within validity

Implement exponential backoff for HTTP 429 or GSTN error codes indicating throttling.

## Methods

### Search Taxpayer (Public API)

`GET /commonapi/v1.1/search`

Search for a taxpayer by GSTIN. This is a **public** endpoint that does not require authentication.

```python
async def search_taxpayer(gstin: str) -> dict:
    """Search for a taxpayer by GSTIN. Public API - no auth needed."""
    headers = {
        "Content-Type": "application/json",
        "clientid": "your-gsp-client-id",
        "client-secret": "your-gsp-client-secret",
        "state-cd": gstin[:2],
        "ip-usr": "127.0.0.1",
        "txn": "unique-txn-id",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GSP_BASE_URL}/commonapi/v1.1/search",
            headers=headers,
            params={"action": "TP", "gstin": gstin},
        )
        resp.raise_for_status()
        return resp.json()
```

### File GSTR-1 (Outward Supplies)

`POST /taxpayerapi/v1.0/returns/gstr1`

Submit outward supply details. Payload must be encrypted with the SEK.

```python
def encrypt_payload(payload_json: str, sek: bytes) -> str:
    """Encrypt a JSON payload using AES-256-ECB with the session key."""
    # PKCS5 padding
    block_size = 16
    pad_len = block_size - (len(payload_json.encode()) % block_size)
    padded = payload_json.encode() + bytes([pad_len] * pad_len)

    cipher = Cipher(algorithms.AES(sek), modes.ECB())
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded) + encryptor.finalize()
    return base64.b64encode(encrypted).decode()


async def save_gstr1(
    gstin: str, return_period: str, data: dict,
    auth_token: str, sek: bytes,
) -> dict:
    """Save GSTR-1 data. The payload is AES-encrypted with the SEK."""
    encrypted_data = encrypt_payload(json.dumps(data), sek)

    headers = {
        "Content-Type": "application/json",
        "clientid": "your-gsp-client-id",
        "client-secret": "your-gsp-client-secret",
        "state-cd": gstin[:2],
        "ip-usr": "127.0.0.1",
        "txn": "unique-txn-id",
        "username": "your-gstn-username",
        "auth-token": auth_token,
        "gstin": gstin,
    }

    payload = {
        "action": "RETSAVE",
        "data": encrypted_data,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GSP_BASE_URL}/taxpayerapi/v1.0/returns/gstr1",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()
```

### e-Invoice Authentication (NIC IRP)

`POST /eivital/v1.03/auth`

Authenticate with the e-Invoice system to obtain an access token.

```python
E_INVOICE_SANDBOX = "https://einv-apisandbox.nic.in"


async def einvoice_authenticate(
    client_id: str, client_secret: str, username: str, password: str,
) -> dict:
    """Authenticate with the e-Invoice IRP system."""
    headers = {
        "Content-Type": "application/json",
        "client_id": client_id,
        "client_secret": client_secret,
        "user_name": username,
        "Gstin": "your-gstin",
    }

    # Password is encrypted with the IRP's public key (RSA/ECB/PKCS1Padding)
    # and the response SEK is decrypted with AES-256
    payload = {
        "UserName": username,
        "Password": password,  # Must be encrypted with IRP public key
        "ForceRefreshAccessToken": "true",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{E_INVOICE_SANDBOX}/eivital/v1.03/auth",
            headers=headers,
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()
        # Returns: AuthToken, Sek, TokenExpiry (360 min prod, 60 min sandbox)
```

### Generate e-Invoice

`POST /eicore/v1.03/Invoice`

Generate an IRN (Invoice Reference Number) for an e-Invoice.

```python
async def generate_einvoice(
    auth_token: str, sek: bytes, invoice_data: dict, gstin: str,
) -> dict:
    """Generate an e-Invoice and obtain an IRN."""
    encrypted_payload = encrypt_payload(json.dumps(invoice_data), sek)

    headers = {
        "Content-Type": "application/json",
        "client_id": "your-client-id",
        "client_secret": "your-client-secret",
        "Gstin": gstin,
        "user_name": "your-username",
        "AuthToken": auth_token,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{E_INVOICE_SANDBOX}/eicore/v1.03/Invoice",
            headers=headers,
            json={"Data": encrypted_payload},
        )
        resp.raise_for_status()
        return resp.json()
```

## Error Handling

```python
import httpx


GSTN_ERROR_CODES = {
    "AUTH4033": "Invalid credentials",
    "AUTH4034": "OTP expired",
    "AUTH4035": "Account locked - too many failed attempts",
    "RET11402": "Return period invalid",
    "RET11403": "GSTIN mismatch",
    "RET11416": "Return already filed for this period",
}


async def safe_gstn_call(url: str, headers: dict, payload: dict) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

            # GSTN returns status_cd "0" for errors even with HTTP 200
            if data.get("status_cd") == "0":
                error = data.get("error", {})
                error_cd = error.get("error_cd", "UNKNOWN")
                message = GSTN_ERROR_CODES.get(
                    error_cd, error.get("message", "Unknown GSTN error")
                )
                raise ValueError(f"GSTN error {error_cd}: {message}")

            return data

        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            if status == 401:
                print("Auth token expired - re-authenticate")
            elif status == 403:
                print("Forbidden - check GSP credentials")
            elif status == 429:
                print("Rate limited - backoff and retry")
            elif status == 503:
                print("GSTN system unavailable - retry later")
            raise
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success (check `status_cd` in body) |
| 401 | Authentication token expired |
| 403 | Invalid GSP credentials |
| 429 | Rate limited |
| 500 | GSP/GSTN internal error |
| 503 | GSTN system temporarily unavailable |

## Common Pitfalls

1. **HTTP 200 does not mean success** - GSTN returns `status_cd: "0"` in the response body for business errors, even with an HTTP 200 status. Always check the `status_cd` field.

2. **Auth token reuse** - The authentication token is valid for approximately 6 hours. Hitting the auth endpoint within that window returns the same token. Do not authenticate on every API call.

3. **Payload encryption is mandatory** - All sensitive payloads (returns, invoices) must be AES-256-ECB encrypted with the SEK. Sending plaintext will result in errors.

4. **SEK decryption** - The SEK returned by the auth endpoint is itself encrypted with your app_key. You must decrypt it with AES before using it to encrypt/decrypt payloads.

5. **Sandbox OTP is always 575757** - For GSTN sandbox testing, use the default OTP `575757`. In production, the OTP is sent to the registered mobile/email.

6. **GSP is mandatory** - You cannot call GSTN endpoints directly. You must go through a licensed GSP. Choose a GSP, register, and obtain API credentials from them.

7. **State code in headers** - The `state-cd` header must match the first 2 digits of the GSTIN being queried. Mismatches cause silent failures.

8. **e-Invoice IRP selection** - There are 6 authorized IRPs. All offer the same core APIs. Choose based on pricing and reliability. NIC IRPs (1 and 2) are the original government portals.

9. **GSTIN format** - A GSTIN is a 15-character alphanumeric code: `{2-digit state code}{10-digit PAN}{1-digit entity code}{1-digit check digit}{Z}`. Validate format before API calls.

10. **SSL certificates** - Some GSPs require specific SSL certificates for production. Check your GSP's documentation for certificate requirements.
