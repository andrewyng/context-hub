---
name: rest-api
description: "JustGiving - UK charity fundraising platform API for managing fundraising pages, donations, charities, events, and campaigns."
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "justgiving,charity,fundraising,uk,donations,api"
---

# JustGiving REST API - Python Reference (httpx)

## Golden Rule

Authentication requires an **App ID** (obtained from the developer portal) passed either in the URL path as `/{appId}/v1/...` or as an `x-api-key` header. User-level operations (creating pages, donating) additionally require **Basic Authentication** with Base64-encoded credentials. Always use the staging environment (`api.staging.justgiving.com`) for testing before switching to production (`api.justgiving.com`). Register at https://developer.justgiving.com/ to get your App ID.

## Installation

```bash
pip install httpx
```

All examples use `httpx` with async/await. For scripts that need a synchronous entrypoint:

```python
import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/v1/charity/search",
            params={"q": "cancer research"},
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
# Production
https://api.justgiving.com

# Staging (testing)
https://api.staging.justgiving.com
```

```python
import os
import base64

APP_ID = os.environ["JUSTGIVING_APP_ID"]
BASE_URL = "https://api.justgiving.com"  # Switch to staging for testing
HEADERS = {
    "x-api-key": APP_ID,
    "Accept": "application/json",
    "Content-Type": "application/json",
}
```

## Authentication

JustGiving uses two layers of authentication:

**1. App-level (required for all requests):**
Pass your App ID via the `x-api-key` header or embed it in the URL path:

```python
# Option A: Header (preferred)
headers = {"x-api-key": APP_ID, "Accept": "application/json"}

# Option B: URL path
url = f"{BASE_URL}/{APP_ID}/v1/charity/search"
```

**2. User-level (required for account operations):**
Basic Authentication with Base64-encoded email:password over HTTPS:

```python
def get_auth_headers(email: str, password: str) -> dict:
    credentials = base64.b64encode(f"{email}:{password}".encode()).decode()
    return {
        **HEADERS,
        "Authorization": f"Basic {credentials}",
    }
```

## Rate Limiting

JustGiving does not publicly document specific rate limits. Implement reasonable throttling for batch operations.

```python
import asyncio

async def jg_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_body: dict = None,
    auth_headers: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}/v1{path}"
    headers = auth_headers or HEADERS

    for attempt in range(max_retries):
        try:
            resp = await client.request(
                method, url, params=params, json=json_body, headers=headers,
            )
        except httpx.RequestError:
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code in (200, 201):
            return resp.json() if resp.content else {}

        if resp.status_code == 429:
            await asyncio.sleep(min(2 ** attempt, 30))
            continue

        resp.raise_for_status()

    raise Exception("Max retries exceeded")
```

## Methods

### Search Charities

Search over 13,000 registered charities on JustGiving.

**Parameters:**
- `q` (str) -- Search query

```python
async def search_charities(client: httpx.AsyncClient, query: str) -> dict:
    return await jg_request(client, "GET", "/charity/search", params={"q": query})

# Usage
results = await search_charities(client, "cancer research")
for charity in results.get("charitySearchResults", []):
    print(f"{charity['charityId']}: {charity['name']}")
```

### Get Charity Details

Retrieve detailed information about a specific charity.

```python
async def get_charity(client: httpx.AsyncClient, charity_id: int) -> dict:
    return await jg_request(client, "GET", f"/charity/{charity_id}")

# Usage
charity = await get_charity(client, 2357)
print(charity["name"])
print(charity["description"])
print(charity["websiteUrl"])
```

### Get Fundraising Page

Retrieve details for a fundraising page by its short name.

```python
async def get_fundraising_page(client: httpx.AsyncClient, page_short_name: str) -> dict:
    return await jg_request(client, "GET", f"/fundraising/pages/{page_short_name}")

# Usage
page = await get_fundraising_page(client, "my-marathon-run")
print(f"Target: {page['targetAmount']}, Raised: {page['grandTotalRaisedExcludingGiftAid']}")
```

### Get Fundraising Page Donations

Retrieve donations for a specific fundraising page.

**Parameters:**
- `pageSize` (int) -- Results per page
- `pageNum` (int) -- Page number

```python
async def get_page_donations(
    client: httpx.AsyncClient,
    page_short_name: str,
    page_size: int = 25,
    page_num: int = 1,
) -> dict:
    return await jg_request(
        client, "GET",
        f"/fundraising/pages/{page_short_name}/donations",
        params={"pageSize": page_size, "pageNum": page_num},
    )

# Usage
donations = await get_page_donations(client, "my-marathon-run")
for d in donations.get("donations", []):
    print(f"{d['donorDisplayName']}: {d['amount']} {d['currencyCode']}")
```

### Search Events

Search for charity events.

```python
async def search_events(client: httpx.AsyncClient, query: str) -> dict:
    return await jg_request(client, "GET", "/event/search", params={"q": query})

# Usage
events = await search_events(client, "marathon 2026")
```

### Get Event Details

Retrieve details for a specific event.

```python
async def get_event(client: httpx.AsyncClient, event_id: int) -> dict:
    return await jg_request(client, "GET", f"/event/{event_id}")
```

### Get Event Pages

Retrieve fundraising pages associated with an event.

```python
async def get_event_pages(
    client: httpx.AsyncClient,
    event_id: int,
    page_size: int = 25,
    page_num: int = 1,
) -> dict:
    return await jg_request(
        client, "GET",
        f"/event/{event_id}/pages",
        params={"pageSize": page_size, "pageNum": page_num},
    )
```

### OneSearch

Unified search across charities, fundraising pages, events, and users.

```python
async def one_search(client: httpx.AsyncClient, query: str, index: str = None) -> dict:
    params = {"q": query}
    if index:
        params["i"] = index  # "Charity", "Fundraiser", "Event", "User"
    return await jg_request(client, "GET", "/onesearch", params=params)

# Usage
results = await one_search(client, "london marathon", index="Event")
```

### Validate Account

Check if an email address is already registered.

```python
async def validate_account(client: httpx.AsyncClient, email: str) -> dict:
    return await jg_request(client, "GET", f"/account/{email}")
```

### Get Account Donations

Retrieve donation history for an authenticated account.

```python
async def get_account_donations(
    client: httpx.AsyncClient,
    email: str,
    password: str,
) -> dict:
    auth = get_auth_headers(email, password)
    return await jg_request(client, "GET", "/account/donations", auth_headers=auth)
```

### Get Countries

Retrieve list of countries supported by JustGiving.

```python
async def get_countries(client: httpx.AsyncClient) -> list:
    return await jg_request(client, "GET", "/countries")
```

### Get Fundraising Leaderboard

Retrieve top fundraisers for a charity or event.

```python
async def get_charity_leaderboard(client: httpx.AsyncClient, charity_id: int) -> dict:
    return await jg_request(client, "GET", f"/charity/{charity_id}/leaderboard")
```

### Donate to a Fundraising Page

Submit a donation to a fundraising page (requires user auth).

```python
async def donate_to_page(
    client: httpx.AsyncClient,
    page_short_name: str,
    amount: float,
    currency_code: str = "GBP",
    email: str = None,
    password: str = None,
) -> dict:
    auth = get_auth_headers(email, password) if email else HEADERS
    body = {
        "amount": str(amount),
        "currencyCode": currency_code,
    }
    return await jg_request(
        client, "POST",
        f"/fundraising/pages/{page_short_name}/donate",
        json_body=body,
        auth_headers=auth,
    )
```

## Error Handling

Successful responses return HTTP 200 or 201 with JSON body.

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created (e.g., new fundraising page) |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- missing or invalid App ID or credentials |
| 403 | Forbidden -- insufficient permissions |
| 404 | Not Found -- charity/page/event not found |
| 409 | Conflict -- resource already exists (e.g., duplicate page name) |
| 500 | Internal Server Error |

```python
import logging

logger = logging.getLogger(__name__)

class JustGivingError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def jg_request_safe(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_body: dict = None,
    auth_headers: dict = None,
    max_retries: int = 3,
) -> dict:
    url = f"{BASE_URL}/v1{path}"
    headers = auth_headers or HEADERS

    for attempt in range(max_retries):
        try:
            resp = await client.request(
                method, url, params=params, json=json_body, headers=headers,
            )
        except httpx.RequestError as e:
            logger.warning(f"Network error (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code in (200, 201):
            return resp.json() if resp.content else {}

        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            logger.warning(f"Rate limited, retrying in {wait}s")
            await asyncio.sleep(wait)
            continue

        raise JustGivingError(resp.status_code, resp.text)

    raise JustGivingError(429, "Max retries exceeded")
```

## Common Pitfalls

1. **App ID can go in URL or header, not both.** Use `x-api-key` header (preferred) or URL path `/{appId}/v1/...`, but be consistent. Mixing both can cause issues.

2. **Staging and production are separate environments.** Test data on staging does not carry over to production. Switch `BASE_URL` for deployment.

3. **Page short names are URL slugs.** The `pageShortName` is the URL-friendly identifier (e.g., `my-marathon-run`), not the page title.

4. **Currency defaults to GBP.** JustGiving is UK-based. Always specify `currencyCode` for non-GBP donations.

5. **Basic Auth credentials travel over HTTPS.** Always use HTTPS endpoints. Never transmit credentials over plain HTTP.

6. **Donation endpoints require user authentication.** Public endpoints (search, read) only need the App ID. Write operations (create page, donate) require Basic Auth.

7. **Page names must be unique.** Creating a fundraising page with a name already in use returns 409 Conflict.

8. **Search results are paginated.** Use `pageSize` and `pageNum` parameters. Default page size varies by endpoint.

9. **The staging environment uses test payment credentials.** Use the provided test card numbers from the developer documentation for staging donations.

10. **Response format depends on Accept header.** The API supports JSON and XML. Always set `Accept: application/json` to avoid XML responses.
