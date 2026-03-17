---
name: rest-api
description: "Zoho CRM - Customer Relationship Management REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "zoho,crm,sales,leads,contacts,deals,accounts,automation,api"
---

# Zoho CRM REST API v7 - Python (httpx)

## Golden Rule

**Always refresh your OAuth access token before it expires, and always use the correct regional API domain.** A token generated on `accounts.zoho.com` will NOT work against `www.zohoapis.eu`. Match your accounts server and API domain to the datacenter where the Zoho org was created. Access tokens expire every hour.

## Installation

```bash
pip install httpx
```

All examples use `httpx` with async/await. Minimal client skeleton:

```python
import httpx, time
from typing import Any

class ZohoCRMClient:
    REGIONS = {
        "us": {"accounts": "https://accounts.zoho.com", "api": "https://www.zohoapis.com"},
        "eu": {"accounts": "https://accounts.zoho.eu", "api": "https://www.zohoapis.eu"},
        "in": {"accounts": "https://accounts.zoho.in", "api": "https://www.zohoapis.in"},
        "au": {"accounts": "https://accounts.zoho.com.au", "api": "https://www.zohoapis.com.au"},
        "jp": {"accounts": "https://accounts.zoho.jp", "api": "https://www.zohoapis.jp"},
    }

    def __init__(self, client_id: str, client_secret: str, refresh_token: str, region: str = "us"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.accounts_url = self.REGIONS[region]["accounts"]
        self.api_base = self.REGIONS[region]["api"] + "/crm/v7"
        self._access_token: str | None = None
        self._token_expiry: float = 0
        self._client = httpx.AsyncClient(timeout=30.0)

    async def _ensure_token(self) -> str:
        if self._access_token and time.time() < self._token_expiry - 60:
            return self._access_token
        resp = await self._client.post(f"{self.accounts_url}/oauth/v2/token", params={
            "grant_type": "refresh_token", "client_id": self.client_id,
            "client_secret": self.client_secret, "refresh_token": self.refresh_token,
        })
        resp.raise_for_status()
        data = resp.json()
        if "access_token" not in data:
            raise ValueError(f"Token refresh failed: {data}")
        self._access_token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600)
        return self._access_token

    async def _headers(self) -> dict[str, str]:
        token = await self._ensure_token()
        return {"Authorization": f"Zoho-oauthtoken {token}"}

    async def close(self):
        await self._client.aclose()
```

## Base URL

`https://www.zohoapis.com/crm/v7/` -- use the regional variant matching your datacenter (see REGIONS dict above).

## Authentication

Zoho CRM uses **OAuth 2.0** exclusively. Recommended for backend: **Self-Client** flow.

1. Register a Self Client at [Zoho API Console](https://api-console.zoho.com/)
2. Generate a grant code with scopes: `ZohoCRM.modules.ALL,ZohoCRM.settings.ALL`
3. Exchange for tokens (grant code expires in ~3 minutes):

```python
async def get_initial_tokens(accounts_url: str, client_id: str, client_secret: str, grant_code: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{accounts_url}/oauth/v2/token", params={
            "grant_type": "authorization_code", "client_id": client_id,
            "client_secret": client_secret, "code": grant_code,
        })
        resp.raise_for_status()
        return resp.json()
```

Token limits: max 15 active access tokens per refresh token, max 20 refresh tokens per user, access tokens expire in 1 hour.

### OAuth Scopes

| Scope | Description |
|-------|-------------|
| `ZohoCRM.modules.ALL` | Full CRUD on all modules |
| `ZohoCRM.modules.{Module}.{Op}` | Per-module: READ, CREATE, UPDATE, DELETE, WRITE |
| `ZohoCRM.settings.ALL` | Org settings and metadata |
| `ZohoSearch.securesearch.READ` | Required for search_records |

## Rate Limiting

Credit-based system on a rolling 24-hour window. Base: 50,000 credits (Free: 5,000). Per-user additions vary by edition (+250 to +2,000). Concurrent limit: 5-25 depending on edition; sub-concurrency of 10 for heavy operations (search, COQL, bulk insert/update >10 records).

```python
import asyncio

async def _request_with_retry(self, method: str, url: str, **kwargs) -> httpx.Response:
    headers = await self._headers()
    for attempt in range(3):
        resp = await self._client.request(method, url, headers=headers, **kwargs)
        if resp.status_code == 429:
            await asyncio.sleep(int(resp.headers.get("Retry-After", 60)))
            continue
        return resp
    return resp
```

## Methods

All methods are async and belong to the `ZohoCRMClient` class.

### get_records -- `GET /crm/v7/{module}`

```python
async def get_records(self, module: str, fields: list[str], per_page: int = 200, page: int = 1,
                      sort_by: str = "id", sort_order: str = "desc", page_token: str | None = None) -> dict[str, Any]:
    params: dict = {"fields": ",".join(fields), "per_page": per_page, "sort_by": sort_by, "sort_order": sort_order}
    if page_token:
        params["page_token"] = page_token
    else:
        params["page"] = page
    resp = await self._client.get(f"{self.api_base}/{module}", headers=await self._headers(), params=params)
    resp.raise_for_status()
    return resp.json()
```

Pagination: `page` works for first 2,000 records. Beyond that, use `page_token` from `info.next_page_token`. Tokens expire after 24 hours. Max 100,000 records via page_token.

### create_records -- `POST /crm/v7/{module}`

```python
async def create_records(self, module: str, records: list[dict[str, Any]], trigger: list[str] | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {"data": records}
    if trigger is not None:
        body["trigger"] = trigger
    resp = await self._client.post(f"{self.api_base}/{module}", headers=await self._headers(), json=body)
    resp.raise_for_status()
    return resp.json()

# Example: create a Lead
# result = await crm.create_records("Leads", [{"Last_Name": "Doe", "Email": "doe@example.com", "Company": "Acme"}])
```

### search_records -- `GET /crm/v7/{module}/search`

```python
async def search_records(self, module: str, criteria: str | None = None, email: str | None = None,
                         word: str | None = None, fields: list[str] | None = None, per_page: int = 200) -> dict[str, Any]:
    params: dict[str, Any] = {"per_page": per_page}
    if criteria:
        params["criteria"] = criteria
    if email:
        params["email"] = email
    if word:
        params["word"] = word
    if fields:
        params["fields"] = ",".join(fields)
    resp = await self._client.get(f"{self.api_base}/{module}/search", headers=await self._headers(), params=params)
    resp.raise_for_status()
    return resp.json()

# Criteria syntax: "((Company:equals:Acme Corp)and(Email:contains:acme))"
# Operators: equals, not_equal, starts_with, contains, in, between, greater_than, less_than, etc.
# Max 10 criteria, max 2,000 records returned. Requires ZohoSearch.securesearch.READ scope.
```

### upsert_records -- `POST /crm/v7/{module}/upsert`

```python
async def upsert_records(self, module: str, records: list[dict[str, Any]],
                         duplicate_check_fields: list[str] | None = None, trigger: list[str] | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {"data": records}
    if duplicate_check_fields:
        body["duplicate_check_fields"] = duplicate_check_fields
    if trigger is not None:
        body["trigger"] = trigger
    resp = await self._client.post(f"{self.api_base}/{module}/upsert", headers=await self._headers(), json=body)
    resp.raise_for_status()
    return resp.json()

# Defaults: Leads->Email, Contacts->Email, Accounts->Account_Name, Deals->Deal_Name
# result["data"][0]["action"] returns "insert" or "update"
```

### Other Methods

| Operation | HTTP | Endpoint | Notes |
|-----------|------|----------|-------|
| Get record | GET | `/{module}/{record_id}` | Single record by ID |
| Update records | PUT | `/{module}` | Body: `{"data": [{...}]}`, each must include `id` |
| Delete records | DELETE | `/{module}?ids=id1,id2` | Max 100 per request |
| COQL query | POST | `/coql` | SQL-like: `SELECT ... FROM ... WHERE ...` (WHERE required, max 200/call) |

## Error Handling

| Status | Meaning |
|--------|---------|
| 200/201 | Success |
| 204 | No Content (empty result -- not an error) |
| 400 | Bad Request (invalid params/body) |
| 401 | Unauthorized (expired token) |
| 403 | Forbidden (insufficient scope) |
| 404 | Not Found (invalid module or ID) |
| 429 | Rate limit exceeded |

```python
class ZohoCRMError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict | None = None):
        self.status_code = status_code
        self.code = code
        self.details = details or {}
        super().__init__(f"[{status_code}] {code}: {message}")

async def _handle_response(resp: httpx.Response) -> dict[str, Any]:
    if resp.status_code == 204:
        return {"data": []}
    data = resp.json()
    if resp.status_code >= 400:
        raise ZohoCRMError(resp.status_code, data.get("code", "UNKNOWN"), data.get("message", resp.text))
    if "data" in data:
        for item in data["data"]:
            if isinstance(item, dict) and item.get("status") == "error":
                raise ZohoCRMError(resp.status_code, item.get("code", "UNKNOWN"),
                    item.get("message", ""), item.get("details", {}))
    return data
```

Common error codes: `INVALID_TOKEN` (refresh it), `INVALID_DATA` (validation), `MANDATORY_NOT_FOUND`, `DUPLICATE_DATA`, `INVALID_MODULE`, `LIMIT_EXCEEDED`.

## Common Pitfalls

1. **Wrong regional domain.** EU org requires `zohoapis.eu` + `accounts.zoho.eu`. Using `.com` returns 401 even with valid tokens.
2. **Grant code expires in ~3 minutes.** Have your exchange script ready before generating it.
3. **Refresh token limits.** Max 20 per user. Multiple services generating their own will silently invalidate older ones.
4. **Field API names, not display labels.** Use `Last_Name` not "Last Name". Check metadata API for API names.
5. **Bulk limit is 100.** Create/update/upsert/delete cap at 100 records per request.
6. **Pagination beyond 2,000 records** requires `page_token`. Page tokens expire after 24 hours.
7. **Search caps at 2,000 records.** Use COQL for larger result sets (up to 100,000 via LIMIT/OFFSET).
8. **204 No Content is not an error.** Check for 204 before parsing JSON.
9. **`trigger` parameter controls side effects.** Pass `trigger=[]` to skip workflows during bulk migrations.
10. **COQL requires a WHERE clause.** Use `WHERE id > 0` as a workaround for all records.
