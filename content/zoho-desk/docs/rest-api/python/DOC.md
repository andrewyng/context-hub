---
name: rest-api
description: "Zoho Desk - Help Desk & Customer Support REST API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "zoho,desk,helpdesk,support,tickets,customer-service,api"
---

# Zoho Desk REST API v1 -- Python (`httpx` Async)

Zoho Desk is help desk and customer support software for managing tickets,
contacts, accounts, agents, departments, and knowledge base articles. All
examples below use **`httpx`** with `AsyncClient`.

## Golden Rule

Always use the correct regional domain and include the `orgId` header on every request (except `/organizations`). Access tokens expire every hour -- build automatic refresh into every client.

**Installation:** `pip install httpx`

## Base URL & Region Domains

| Region | Accounts Server | API Base URL |
|---|---|---|
| US | `https://accounts.zoho.com` | `https://desk.zoho.com/api/v1` |
| EU | `https://accounts.zoho.eu` | `https://desk.zoho.eu/api/v1` |
| India | `https://accounts.zoho.in` | `https://desk.zoho.in/api/v1` |
| Australia | `https://accounts.zoho.com.au` | `https://desk.zoho.com.au/api/v1` |
| Japan | `https://accounts.zoho.jp` | `https://desk.zoho.jp/api/v1` |
| Canada | `https://accounts.zoho.ca` | `https://desk.zoho.ca/api/v1` |

## Authentication -- OAuth 2.0

Zoho Desk shares the Zoho-wide OAuth 2.0 flow.

1. **Register a Client** at <https://api-console.zoho.com/> (Server-based). You get a Client ID and Client Secret.
2. **Obtain an Authorization Code** -- redirect user to `{accounts_server}/oauth/v2/auth?client_id=...&response_type=code&redirect_uri=...&scope=Desk.tickets.ALL,Desk.contacts.READ,Desk.basic.READ&access_type=offline`
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

Format: `Desk.{module}.{operation}` -- Operations: `READ`, `WRITE`, `UPDATE`, `DELETE`, `ALL`

Key scopes: `Desk.tickets.ALL`, `Desk.contacts.READ`, `Desk.contacts.WRITE`, `Desk.basic.READ`, `Desk.search.READ`, `Desk.articles.ALL`

## Rate Limits

| Plan | Base Credits | Per User | Concurrent |
|---|---|---|---|
| Free / Trial | 5,000 | -- | 5 |
| Standard | 50,000 | +250 | 10 |
| Professional | 75,000 | +500 | 15 |
| Enterprise | 100,000 | +1,000 | 25 |

Headers: `X-Rate-Limit-Remaining-v3` (credits left), `Retry-After` (seconds, on 429).

## Reusable Client with Auto-Refresh

```python
import httpx, time

class ZohoDeskClient:
    def __init__(self, client_id: str, client_secret: str, refresh_token: str, org_id: str, region: str = "com"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.org_id = org_id
        self.accounts_url = f"https://accounts.zoho.{region}"
        self.api_base = f"https://desk.zoho.{region}/api/v1"
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

    def _base_headers(self, token: str) -> dict:
        return {"Authorization": f"Zoho-oauthtoken {token}", "orgId": self.org_id, "Content-Type": "application/json"}

    async def request(self, method: str, path: str, *, json: dict | None = None, params: dict | None = None, files: dict | None = None) -> dict:
        async with httpx.AsyncClient() as client:
            token = await self._ensure_token(client)
            headers = self._base_headers(token)
            if files:
                headers.pop("Content-Type", None)
            resp = await client.request(method, f"{self.api_base}{path}", headers=headers, params=params, json=json, files=files)
            resp.raise_for_status()
            return resp.json()
```

### Retrieving Your Organization ID

```python
async def get_organizations(access_token: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://desk.zoho.com/api/v1/organizations",
            headers={"Authorization": f"Zoho-oauthtoken {access_token}"})
        resp.raise_for_status()
        return resp.json()["data"]
```

## Tickets

### Create a Ticket

```python
async def create_ticket(desk: ZohoDeskClient, subject: str, department_id: str, contact_id: str, **optional) -> dict:
    payload = {"subject": subject, "departmentId": department_id, "contactId": contact_id, **optional}
    return await desk.request("POST", "/tickets", json=payload)
```

### List Tickets

```python
async def list_tickets(desk: ZohoDeskClient, from_index: int = 0, limit: int = 50, **filters) -> dict:
    params = {"from": from_index, "limit": limit, **filters}
    return await desk.request("GET", "/tickets", params=params)
```

### Get / Update / Close Tickets

```python
async def get_ticket(desk: ZohoDeskClient, ticket_id: str) -> dict:
    return await desk.request("GET", f"/tickets/{ticket_id}")

async def update_ticket(desk: ZohoDeskClient, ticket_id: str, **fields) -> dict:
    return await desk.request("PATCH", f"/tickets/{ticket_id}", json=fields)

async def close_tickets(desk: ZohoDeskClient, ticket_ids: list[str]) -> dict:
    return await desk.request("POST", "/closeTickets", json={"ids": ticket_ids})
```

### Other Ticket Endpoints

| Action | Method | Path |
|---|---|---|
| Move to trash | POST | `/tickets/moveToTrash` (body: `{"ticketIds": [...]}`) |
| Merge tickets | POST | `/tickets/{id}/merge` |
| Ticket history | GET | `/tickets/{id}/History` |
| Send reply | POST | `/tickets/{id}/sendReply` |
| List threads | GET | `/tickets/{id}/threads` |
| Add comment | POST | `/tickets/{id}/comments` |
| List comments | GET | `/tickets/{id}/comments` |

## Contacts

```python
async def create_contact(desk: ZohoDeskClient, last_name: str, email: str, **optional) -> dict:
    payload = {"lastName": last_name, "email": email, **optional}
    return await desk.request("POST", "/contacts", json=payload)
```

Key endpoints: `POST /contacts` (create), `GET /contacts` (list), `GET /contacts/{id}` (get), `PATCH /contacts/{id}` (update), `GET /contacts/{id}/tickets` (contact's tickets).

## Additional Module Endpoints

| Module | Create | List | Get | Update |
|---|---|---|---|---|
| Accounts | `POST /accounts` | `GET /accounts` | `GET /accounts/{id}` | `PATCH /accounts/{id}` |
| Agents | `POST /agents` | `GET /agents` | `GET /agents/{id}` | `PATCH /agents/{id}` |
| Departments | `POST /departments` | `GET /departments` | `GET /departments/{id}` | `PATCH /departments/{id}` |
| Tasks | `POST /tasks` | `GET /tasks` | `GET /tasks/{id}` | `PATCH /tasks/{id}` |
| Attachments | `POST /tickets/{tid}/attachments` | `GET /tickets/{tid}/attachments` | -- | -- |

## Error Handling

```python
import asyncio

async def safe_request(desk: ZohoDeskClient, method: str, path: str, **kw):
    try:
        return await desk.request(method, path, **kw)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            retry_after = int(exc.response.headers.get("Retry-After", "60"))
            await asyncio.sleep(retry_after)
            return await desk.request(method, path, **kw)
        raise
```

Common status codes: `200` OK, `201` Created, `204` No Content, `400` Bad Request, `401` Unauthorized (token expired), `403` Forbidden, `404` Not Found, `429` Rate Limit, `500` Internal Error.

## Pagination

List endpoints use offset-based pagination: `from` (0-based offset) + `limit` (max 50 per page).

```python
async def fetch_all_tickets(desk: ZohoDeskClient) -> list[dict]:
    all_tickets, offset, limit = [], 0, 50
    while True:
        data = await desk.request("GET", "/tickets", params={"from": offset, "limit": limit})
        tickets = data.get("data", [])
        if not tickets:
            break
        all_tickets.extend(tickets)
        if len(tickets) < limit:
            break
        offset += limit
    return all_tickets
```

## Common Pitfalls

1. **`orgId` is a header**, not a query parameter (unlike Zoho Books).
2. Updates use **`PATCH`**, not `PUT`.
3. Pagination uses **`from` + `limit`** (max 50), not `page` + `per_page`.
4. Field names are **camelCase** (e.g., `departmentId`, `contactId`).
5. The `from` param is 0-based offset, not 1-based page number.
