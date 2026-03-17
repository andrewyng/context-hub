---
name: rest-api
description: "DigiLocker - India's digital document storage, sharing, and verification platform (Digital India initiative)"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "india,digilocker,kyc,documents,digital-india,government,identity,aadhaar"
---

# DigiLocker REST API

## Golden Rule

DigiLocker is India's official cloud-based platform for storage, sharing, and verification of documents and certificates. It is a key initiative under the Digital India program. There are **three integration roles**: Requester (fetch user documents), Issuer (push documents to users), and Authorized Partner (embed DigiLocker in your app). Access requires formal onboarding as a partner through the DigiLocker partner portal or via an aggregator like APISetu / Setu. You **cannot** call DigiLocker APIs without an approved client ID and secret. All document access requires explicit user consent via OAuth2.

## Installation

```bash
pip install httpx
```

## Base URL

DigiLocker APIs are accessed through aggregator gateways or the direct DigiLocker partner endpoints.

**Via Setu (recommended aggregator):**

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://dg-sandbox.setu.co` |
| Production | `https://dg.setu.co` |

**Direct DigiLocker (Authorized Partner - requires formal onboarding):**

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.digitallocker.gov.in` |
| Authorization | `https://digilocker.meripehchaan.gov.in` |

**APISetu:**

| Environment | Base URL |
|-------------|----------|
| Production | `https://apisetu.gov.in/digilocker` |

## Authentication

DigiLocker uses **OAuth 2.0 Authorization Code flow** for user consent. The aggregator layer (e.g., Setu) simplifies this into a redirect-based flow.

### Via Setu Aggregator

All requests require these headers:

| Header | Description |
|--------|-------------|
| `x-client-id` | Your Setu client ID |
| `x-client-secret` | Your Setu client secret |
| `x-product-instance-id` | Your product instance ID |

```python
import httpx

BASE_URL = "https://dg-sandbox.setu.co"
HEADERS = {
    "x-client-id": "your-client-id",
    "x-client-secret": "your-client-secret",
    "x-product-instance-id": "your-product-instance-id",
    "Content-Type": "application/json",
}


async def create_digilocker_request(redirect_url: str) -> dict:
    """Initiate a DigiLocker consent session. Returns a URL to redirect the user."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/digilocker/",
            headers=HEADERS,
            json={"redirectUrl": redirect_url},
        )
        resp.raise_for_status()
        return resp.json()
        # Response: { "id": "...", "status": "unauthenticated", "url": "...", "validUpto": "..." }
```

### Direct Partner OAuth2 Flow

For authorized partners integrating directly:

```python
import httpx
from urllib.parse import urlencode

AUTHORIZE_URL = "https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize"
TOKEN_URL = "https://api.digitallocker.gov.in/public/oauth2/1/token"
CLIENT_ID = "your-app-client-id"
CLIENT_SECRET = "your-app-client-secret"
REDIRECT_URI = "https://your-app.com/callback"


def get_authorization_url() -> str:
    """Build the OAuth2 authorization URL to redirect the user."""
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "state": "random-csrf-token",
    }
    return f"{AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code_for_token(authorization_code: str) -> dict:
    """Exchange the authorization code for an access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": authorization_code,
                "redirect_uri": REDIRECT_URI,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            },
        )
        resp.raise_for_status()
        return resp.json()
```

## Rate Limiting

DigiLocker does not publish explicit rate limits. In practice, the Setu aggregator layer and DigiLocker impose fair-use limits. Expect throttling above ~100 requests/minute. Implement exponential backoff for 429 responses.

## Methods

### Create DigiLocker Request (Setu)

`POST /api/digilocker/`

Initiates a consent session. User must be redirected to the returned URL to authenticate and grant document access.

```python
async def create_request(redirect_url: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/digilocker/",
            headers=HEADERS,
            json={"redirectUrl": redirect_url},
        )
        resp.raise_for_status()
        return resp.json()
```

### Get Request Status

`GET /api/digilocker/{id}/status`

Check whether the user has completed authentication and consent.

```python
async def get_request_status(request_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/digilocker/{request_id}/status",
            headers=HEADERS,
        )
        resp.raise_for_status()
        return resp.json()
        # Response includes: id, status ("authenticated" | "unauthenticated"),
        # digilockerUserDetails: { digilockerId, email, phoneNumber }
```

### Get Available Documents List

`GET /api/digilocker/documents`

Returns the catalog of document types available for fetching. Cache this locally and refresh monthly.

```python
async def list_available_documents() -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/digilocker/documents",
            headers=HEADERS,
        )
        resp.raise_for_status()
        return resp.json()
        # Each doc: { docType, orgId, orgName, description, availableFormats, parameters }
```

### Fetch a Document

`POST /api/digilocker/{id}/document`

Fetch a specific document for an authenticated user. Requires the request ID from an authenticated session.

```python
async def fetch_document(request_id: str, doc_type: str, org_id: str) -> dict:
    """Fetch a document from DigiLocker for a consented user."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/digilocker/{request_id}/document",
            headers=HEADERS,
            json={
                "docType": doc_type,       # e.g., "PANCR" for PAN card
                "orgId": org_id,           # e.g., "002317"
                "format": "pdf",
                "consent": "Y",
                "parameters": [
                    {"name": "AC_NO", "value": "12345678"},
                ],
            },
        )
        resp.raise_for_status()
        return resp.json()
        # Response: { "fileUrl": "https://s3-url...", "validUpto": "..." }
```

### Fetch Aadhaar Data

`GET /api/digilocker/{id}/aadhaar`

Retrieve Aadhaar demographic data (name, DOB, address, gender) for an authenticated user who has consented.

```python
async def fetch_aadhaar_data(request_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/digilocker/{request_id}/aadhaar",
            headers=HEADERS,
        )
        resp.raise_for_status()
        return resp.json()
        # Returns: name, dob, address, gender, masked aadhaar, fileUrl (signed XML)
```

### Revoke Request

`GET /api/digilocker/{id}/revoke`

Revoke a previously authenticated session, invalidating all associated access.

```python
async def revoke_request(request_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/digilocker/{request_id}/revoke",
            headers=HEADERS,
        )
        resp.raise_for_status()
        return resp.json()
        # Response: { "success": true }
```

## Redirect Callback Parameters

After user consent, DigiLocker redirects back to your `redirectUrl` with these query params:

| Parameter | Description |
|-----------|-------------|
| `success` | `True` or `False` |
| `id` | The request ID |
| `scope` | Consented document types, e.g., `ADHAR+PANCR+DRVLC` |
| `errCode` | Error code (on failure) |
| `errMessage` | Error message (on failure) |

**Scope values:** `ADHAR` (Aadhaar), `PANCR` (PAN), `DRVLC` (Driver's License).

## Error Handling

```python
import httpx


async def safe_digilocker_call(request_id: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{BASE_URL}/api/digilocker/{request_id}/status",
                headers=HEADERS,
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            status = e.response.status_code
            if status == 400:
                print("Bad request - check parameters")
            elif status == 401:
                print("Unauthorized - session expired or user revoked consent")
            elif status == 404:
                print("Request ID not found")
            elif status == 429:
                print("Rate limited - implement backoff")
            elif status == 500:
                print("DigiLocker server error - retry later")
            raise
        except httpx.ConnectError:
            print("Connection failed - DigiLocker may be down")
            raise
```

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 400 | Bad request / invalid parameters |
| 401 | Unauthorized / consent revoked / session expired |
| 404 | Request ID not found |
| 429 | Rate limited |
| 500 | DigiLocker internal server error |

## Common Pitfalls

1. **User's mobile must be linked to Aadhaar** - DigiLocker account creation requires an Aadhaar-linked mobile number. If the user's mobile is not linked, the consent flow will fail.

2. **Document identification requires both docType AND orgId** - The same document type (e.g., driving license) may be issued by different organizations. Always use the combination of `docType` + `orgId` to uniquely identify a document.

3. **Redirect URL must be publicly accessible** - The `redirectUrl` provided during session creation must be reachable from the internet. Localhost URLs will not work even in sandbox.

4. **File URLs are temporary** - The `fileUrl` returned by the document fetch endpoint has an expiry (`validUpto`). Download the document promptly and store it on your side.

5. **Consent scope matters** - The user may grant partial consent (e.g., only Aadhaar, not PAN). Always check the `scope` parameter in the redirect callback before attempting to fetch specific documents.

6. **Setu vs Direct integration** - Using the Setu aggregator is significantly easier to onboard with (API keys via dashboard) compared to direct DigiLocker partnership which requires government approval. Start with Setu for development.

7. **Document parameters vary by issuer** - Each document type requires different parameters (e.g., account number, registration number). Fetch the document catalog first and inspect the `parameters` array for each document type.
