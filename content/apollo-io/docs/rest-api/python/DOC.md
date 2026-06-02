---
name: rest-api
description: "Apollo.io B2B Contact & Company Enrichment API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "apollo,b2b,enrichment,contacts,companies,leads,sales,api,integration"
---

# Apollo.io API

> **Golden Rule:** Apollo.io has no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. People search is free (no credits); enrichment consumes credits. Always handle rate limits and error responses explicitly.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.apollo.io/api/v1`

Note: Organization enrichment (single) uses `https://api.apollo.io/v1/` (no `/api/` prefix).

## Authentication

**Type:** API Key

```python
import httpx

API_KEY = "your-apollo-api-key"
BASE_URL = "https://api.apollo.io/api/v1"

headers = {"x-api-key": API_KEY, "Content-Type": "application/json"}
client = httpx.AsyncClient(headers=headers)
```

## Rate Limiting

| Plan | Per Minute | Daily |
|---|---|---|
| Free | 50 | 600 |
| Basic/Pro | 200 | 2,000 |

Bulk endpoints are capped at 50% of single-endpoint per-minute rates. Check `POST /usage_stats/api_usage_stats` (requires master API key) to monitor consumption.

## Methods

### `search_people`

**Endpoint:** `POST /mixed_people/api_search`

Search for people matching criteria. **Free -- does not consume credits.** Does NOT return emails/phone numbers (use enrichment for that).

| Parameter | Type | Default |
|---|---|---|
| `first_name` | `str` | `None` |
| `last_name` | `str` | `None` |
| `organization_name` | `str` | `None` |
| `domain` | `str` | `None` |
| `linkedin_url` | `str` | `None` |
| `page` | `int` | `1` |

**Returns:** JSON with `people` array and `pagination` object (100 per page, max 500 pages)

```python
payload = {
    "organization_name": "Anthropic",
    "page": 1
}
response = await client.post(f"{BASE_URL}/mixed_people/api_search", json=payload)
response.raise_for_status()
data = response.json()
people = data.get("people", [])
```

### `enrich_person`

**Endpoint:** `POST /people/match`

Enrich a single person record. **Consumes credits.** Returns emails and phone numbers.

| Parameter | Type | Default |
|---|---|---|
| `first_name` | `str` | `None` |
| `last_name` | `str` | `None` |
| `email` | `str` | `None` |
| `domain` | `str` | `None` |
| `organization_name` | `str` | `None` |
| `linkedin_url` | `str` | `None` |
| `id` | `str` | `None` |
| `reveal_personal_emails` | `bool` | `False` |
| `reveal_phone_number` | `bool` | `False` |

**Returns:** JSON with `person` and `organization` objects

```python
payload = {
    "first_name": "Jane",
    "last_name": "Doe",
    "domain": "anthropic.com",
    "reveal_personal_emails": True
}
response = await client.post(f"{BASE_URL}/people/match", json=payload)
response.raise_for_status()
data = response.json()
person = data.get("person", {})
email = person.get("email")
```

### `bulk_enrich_people`

**Endpoint:** `POST /people/bulk_match`

Enrich up to 10 people per request. **Consumes credits.**

| Parameter | Type | Default |
|---|---|---|
| `details` | `list` | **required** |
| `reveal_personal_emails` | `bool` | `False` |
| `reveal_phone_number` | `bool` | `False` |

**Returns:** JSON with `matches` array, `credits_consumed`, `missing_records`

```python
payload = {
    "details": [
        {"first_name": "Jane", "last_name": "Doe", "domain": "anthropic.com"},
        {"email": "john@example.com"}
    ],
    "reveal_personal_emails": True
}
response = await client.post(f"{BASE_URL}/people/bulk_match", json=payload)
response.raise_for_status()
data = response.json()
matches = data.get("matches", [])
```

### `enrich_organization`

**Endpoint:** `GET https://api.apollo.io/v1/organizations/enrich`

Enrich a single company by domain. **Consumes credits.** Note: uses `/v1/` base (no `/api/` prefix).

| Parameter | Type | Default |
|---|---|---|
| `domain` | `str` | `None` |
| `organization_name` | `str` | `None` |

**Returns:** JSON with organization data (industry, employee count, funding, technologies, etc.)

```python
ORG_URL = "https://api.apollo.io/v1/organizations/enrich"
params = {"domain": "anthropic.com"}
response = await client.get(ORG_URL, params=params)
response.raise_for_status()
data = response.json()
org = data.get("organization", {})
```

### `create_contact`

**Endpoint:** `POST /contacts`

Save an enriched lead to Apollo CRM. Does not consume credits.

| Parameter | Type | Default |
|---|---|---|
| `first_name` | `str` | **required** |
| `last_name` | `str` | **required** |
| `email` | `str` | `None` |
| `organization_name` | `str` | `None` |
| `title` | `str` | `None` |

**Returns:** JSON with full contact object

```python
payload = {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@anthropic.com",
    "organization_name": "Anthropic",
    "title": "Engineer"
}
response = await client.post(f"{BASE_URL}/contacts", json=payload)
response.raise_for_status()
contact = response.json()
```

### `search_organizations`

**Endpoint:** `POST /mixed_companies/search`

Search for companies matching criteria.

| Parameter | Type | Default |
|---|---|---|
| `page` | `int` | `1` |

**Returns:** JSON with companies array and pagination

```python
payload = {
    "page": 1
}
response = await client.post(f"{BASE_URL}/mixed_companies/search", json=payload)
response.raise_for_status()
data = response.json()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/people/match", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API key")
    elif e.response.status_code == 429:
        print("Rate limited -- back off and retry")
    elif e.response.status_code == 403:
        print("Forbidden -- this endpoint may require a master API key")
    else:
        print(f"Apollo API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- People search (`/mixed_people/api_search`) is free but does NOT return emails/phones -- you must enrich separately
- Use `domain` (not full URL) for organization enrichment -- strip `www.` and `https://`
- Provide as many identifying fields as possible to increase enrichment match accuracy
- Bulk endpoints accept max 10 records per request and are rate-limited at 50% of single endpoints
- Organization enrichment (single) uses a different base URL: `https://api.apollo.io/v1/` (no `/api/`)
- Pagination caps at 500 pages (50,000 records) -- use filters to narrow results
- Always call `response.raise_for_status()` to catch HTTP errors
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
