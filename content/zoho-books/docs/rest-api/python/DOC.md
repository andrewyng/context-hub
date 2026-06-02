---
name: rest-api
description: "Zoho Books - Cloud Accounting & Invoicing REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "zoho,books,accounting,invoicing,expenses,payments,tax,gst,api"
---

# Zoho Books REST API v3 -- Python (`httpx` Async)

Zoho Books is cloud-based accounting software for managing invoices, expenses,
bills, payments, taxes, and more. All examples below use **`httpx`** with
`AsyncClient`.

## Golden Rule

Always use the correct regional API domain, include `organization_id` as a query parameter on every call, and refresh your OAuth token before it expires. Access tokens last 1 hour.

**Installation:** `pip install httpx`

## Base URL & Region Domains

| Region | Accounts Server | API Base URL |
|---|---|---|
| US | `https://accounts.zoho.com` | `https://www.zohoapis.com/books/v3` |
| EU | `https://accounts.zoho.eu` | `https://www.zohoapis.eu/books/v3` |
| India | `https://accounts.zoho.in` | `https://www.zohoapis.in/books/v3` |
| Australia | `https://accounts.zoho.com.au` | `https://www.zohoapis.com.au/books/v3` |
| Japan | `https://accounts.zoho.jp` | `https://www.zohoapis.jp/books/v3` |
| Canada | `https://accounts.zoho.ca` | `https://www.zohoapis.ca/books/v3` |

## Authentication -- OAuth 2.0

Zoho Books uses the same OAuth 2.0 flow shared across the Zoho ecosystem.

1. **Register a Client** at <https://api-console.zoho.com/> (Server-based).
2. **Obtain Authorization Code** -- redirect to `{accounts_server}/oauth/v2/auth?client_id=...&response_type=code&redirect_uri=...&scope=ZohoBooks.invoices.ALL,ZohoBooks.contacts.ALL&access_type=offline`
3. **Exchange Code for Tokens:**

```python
import httpx

async def exchange_code(accounts_server: str, client_id: str, client_secret: str, code: str, redirect_uri: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{accounts_server}/oauth/v2/token", params={
            "grant_type": "authorization_code", "code": code,
            "client_id": client_id, "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        })
        resp.raise_for_status()
        return resp.json()
```

4. **Refresh Access Token** (tokens expire after 1 hour; refresh tokens do not expire, max 20 per user):

```python
async def refresh_access_token(accounts_server: str, client_id: str, client_secret: str, refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{accounts_server}/oauth/v2/token", params={
            "grant_type": "refresh_token", "refresh_token": refresh_token,
            "client_id": client_id, "client_secret": client_secret,
        })
        resp.raise_for_status()
        return resp.json()
```

### OAuth Scopes

Format: `ZohoBooks.{module}.{operation}` -- Operations: `CREATE`, `READ`, `UPDATE`, `DELETE`, `ALL`

Key modules: `contacts`, `invoices`, `estimates`, `creditnotes`, `bills`, `expenses`, `customerpayments`, `settings`

## Rate Limits

| Plan | Daily Requests | Concurrent |
|---|---|---|
| Free | 1,000 | 5 |
| Standard | 2,000 | 10 |
| Professional | 5,000 | 10 |
| Premium+ | 10,000 | 10 |

Per-minute soft cap: 100 requests per org. Exceeding returns HTTP 429.

## Reusable Client with Auto-Refresh

```python
import httpx, time

class ZohoBooksClient:
    def __init__(self, client_id: str, client_secret: str, refresh_token: str, org_id: str, region: str = "com"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.org_id = org_id
        self.accounts_url = f"https://accounts.zoho.{region}"
        self.api_base = f"https://www.zohoapis.{region}/books/v3"
        self._access_token: str | None = None
        self._token_expiry: float = 0.0

    async def _ensure_token(self, client: httpx.AsyncClient) -> str:
        if self._access_token and time.time() < self._token_expiry:
            return self._access_token
        resp = await client.post(f"{self.accounts_url}/oauth/v2/token", params={
            "grant_type": "refresh_token", "refresh_token": self.refresh_token,
            "client_id": self.client_id, "client_secret": self.client_secret,
        })
        resp.raise_for_status()
        data = resp.json()
        self._access_token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600) - 60
        return self._access_token

    async def request(self, method: str, path: str, *, json: dict | None = None, params: dict | None = None) -> dict:
        async with httpx.AsyncClient() as client:
            token = await self._ensure_token(client)
            all_params = {"organization_id": self.org_id}
            if params:
                all_params.update(params)
            resp = await client.request(method, f"{self.api_base}{path}",
                headers={"Authorization": f"Zoho-oauthtoken {token}"}, params=all_params, json=json)
            resp.raise_for_status()
            return resp.json()
```

### Retrieving Your Organization ID

```python
async def get_organizations(access_token: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://www.zohoapis.com/books/v3/organizations",
            headers={"Authorization": f"Zoho-oauthtoken {access_token}"})
        resp.raise_for_status()
        return resp.json()["organizations"]
```

## Invoices

### Create an Invoice

```python
async def create_invoice(books: ZohoBooksClient, customer_id: str, line_items: list[dict], **optional) -> dict:
    payload = {"customer_id": customer_id, "line_items": line_items, **optional}
    result = await books.request("POST", "/invoices", json=payload)
    return result["invoice"]
```

### List Invoices

```python
async def list_invoices(books: ZohoBooksClient, status: str | None = None, page: int = 1, per_page: int = 200) -> dict:
    params = {"page": page, "per_page": per_page}
    if status:
        params["status"] = status
    return await books.request("GET", "/invoices", params=params)
```

### Get / Email / Mark Sent

```python
async def get_invoice(books: ZohoBooksClient, invoice_id: str) -> dict:
    result = await books.request("GET", f"/invoices/{invoice_id}")
    return result["invoice"]

async def email_invoice(books: ZohoBooksClient, invoice_id: str, to_emails: list[str], subject: str = "", body: str = "") -> dict:
    return await books.request("POST", f"/invoices/{invoice_id}/email",
        json={"to_mail_ids": to_emails, "subject": subject, "body": body})

async def mark_invoice_sent(books: ZohoBooksClient, invoice_id: str) -> dict:
    return await books.request("POST", f"/invoices/{invoice_id}/status/sent")
```

### Other Invoice Status Endpoints

| Action | Method | Path |
|---|---|---|
| Void invoice | POST | `/invoices/{id}/status/void` |
| Revert to draft | POST | `/invoices/{id}/status/draft` |
| Approve invoice | POST | `/invoices/{id}/approve` |

## Contacts

```python
async def create_contact(books: ZohoBooksClient, contact_name: str, contact_type: str = "customer", **optional) -> dict:
    payload = {"contact_name": contact_name, "contact_type": contact_type, **optional}
    result = await books.request("POST", "/contacts", json=payload)
    return result["contact"]

async def list_contacts(books: ZohoBooksClient, contact_type: str | None = None) -> dict:
    params = {}
    if contact_type:
        params["contact_type"] = contact_type
    return await books.request("GET", "/contacts", params=params)
```

Key endpoints: `GET /contacts/{id}`, `PUT /contacts/{id}`, `DELETE /contacts/{id}`, `POST /contacts/{id}/active`, `POST /contacts/{id}/inactive`.

## Additional Module Endpoints

| Module | Create | List | Get | Update | Delete |
|---|---|---|---|---|---|
| Items | `POST /items` | `GET /items` | `GET /items/{id}` | `PUT /items/{id}` | `DELETE /items/{id}` |
| Expenses | `POST /expenses` | `GET /expenses` | `GET /expenses/{id}` | `PUT /expenses/{id}` | `DELETE /expenses/{id}` |
| Bills | `POST /bills` | `GET /bills` | `GET /bills/{id}` | `PUT /bills/{id}` | `DELETE /bills/{id}` |
| Payments | `POST /customerpayments` | `GET /customerpayments` | `GET /customerpayments/{id}` | `PUT /customerpayments/{id}` | `DELETE /customerpayments/{id}` |
| Credit Notes | `POST /creditnotes` | `GET /creditnotes` | `GET /creditnotes/{id}` | `PUT /creditnotes/{id}` | `DELETE /creditnotes/{id}` |
| Taxes | `POST /settings/taxes` | `GET /settings/taxes` | `GET /settings/taxes/{id}` | `PUT /settings/taxes/{id}` | `DELETE /settings/taxes/{id}` |

## Error Handling

All responses include a `code` field (0 = success) and a `message`.

```python
import asyncio

async def safe_request(books: ZohoBooksClient, method: str, path: str, **kw):
    try:
        return await books.request(method, path, **kw)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            retry_after = int(exc.response.headers.get("Retry-After", "60"))
            await asyncio.sleep(retry_after)
            return await books.request(method, path, **kw)
        raise
```

Common status codes: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized (token expired), `404` Not Found, `429` Rate Limit, `500` Internal Error.

## Pagination

List endpoints accept `page` (1-based) and `per_page` (max 200). Response includes `page_context` with `has_more_page`.

```python
async def fetch_all_invoices(books: ZohoBooksClient) -> list[dict]:
    all_invoices, page = [], 1
    while True:
        data = await books.request("GET", "/invoices", params={"page": page, "per_page": 200})
        all_invoices.extend(data["invoices"])
        if not data["page_context"]["has_more_page"]:
            break
        page += 1
    return all_invoices
```

## Common Pitfalls

1. **`organization_id` is a query parameter**, not a header (unlike Zoho Desk).
2. Updates use **`PUT`**, not `PATCH` (unlike Zoho Desk).
3. Pagination uses **`page` + `per_page`** (max 200), 1-based.
4. Field names are **snake_case** (e.g., `customer_id`, `contact_name`).
5. Response bodies wrap data in a named key (e.g., `resp["invoice"]`, `resp["invoices"]`).
