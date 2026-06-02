---
name: rest-api
description: "Charity Navigator - US charity ratings, research data, and nonprofit organization profiles API."
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "charity-navigator,charity,ratings,nonprofit,usa,api"
---

# Charity Navigator REST API v2 - Python Reference (httpx)

## Golden Rule

Authentication uses **two query parameters** on every request: `app_id` and `app_key`, obtained from the developer portal at https://developer.charitynavigator.org/. All responses are JSON. Pagination defaults to 100 results per page (max 1,000) with a hard limit of 10,000 total results per query. Organizations are identified by their IRS **EIN** (Employer Identification Number). Charity Navigator also offers a GraphQL API, but this document covers the REST API v2.

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
            f"{BASE_URL}/Organizations",
            params={"app_id": APP_ID, "app_key": APP_KEY, "search": "red cross"},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.data.charitynavigator.org/v2
```

```python
import os

APP_ID = os.environ["CHARITY_NAV_APP_ID"]
APP_KEY = os.environ["CHARITY_NAV_APP_KEY"]
BASE_URL = "https://api.data.charitynavigator.org/v2"
```

## Authentication

Charity Navigator uses **app_id + app_key as query parameters** on every request:

```
https://api.data.charitynavigator.org/v2/Organizations?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY
```

Register at https://developer.charitynavigator.org/ to obtain credentials.

```python
def auth_params(**extra) -> dict:
    return {"app_id": APP_ID, "app_key": APP_KEY, **extra}
```

## Rate Limiting

Charity Navigator does not publicly document specific rate limits. Implement reasonable throttling for batch operations.

```python
import asyncio

async def cn_request(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict | list:
    request_params = auth_params(**(params or {}))
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params)
        except httpx.RequestError:
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            await asyncio.sleep(min(2 ** attempt, 30))
            continue

        resp.raise_for_status()

    raise Exception("Max retries exceeded")
```

## Methods

### Search Organizations

Search for charitable organizations with filtering and sorting.

**Parameters:**
- `search` (str) -- Search term
- `searchType` (str) -- `DEFAULT` or `NAME_ONLY`
- `rated` (str) -- `TRUE` (rated only) or `FALSE` (unrated only)
- `categoryID` (int) -- Filter by category
- `causeID` (int) -- Filter by cause
- `state` (str) -- US state abbreviation (e.g., `NY`)
- `city` (str) -- City name
- `zip` (str) -- ZIP code
- `minRating` (int) -- Minimum overall rating (0-4)
- `maxRating` (int) -- Maximum overall rating (0-4)
- `sizeRange` (int) -- Organization size: 1 (small), 2 (mid), 3 (large)
- `sort` (str) -- `NAME:ASC`, `RATING:DESC`, or `RELEVANCE:DESC`
- `pageSize` (int) -- Results per page (default: 100, max: 1,000)
- `pageNum` (int) -- Page number (default: 1)

```python
async def search_organizations(
    client: httpx.AsyncClient,
    search: str = None,
    state: str = None,
    rated: str = None,
    min_rating: int = None,
    sort: str = "RELEVANCE:DESC",
    page_size: int = 100,
    page_num: int = 1,
) -> list:
    params = {"pageSize": page_size, "pageNum": page_num, "sort": sort}
    if search:
        params["search"] = search
    if state:
        params["state"] = state
    if rated:
        params["rated"] = rated
    if min_rating is not None:
        params["minRating"] = min_rating
    return await cn_request(client, "/Organizations", params)

# Usage
orgs = await search_organizations(client, search="habitat for humanity", state="NY")
for org in orgs:
    print(f"{org['ein']}: {org['charityName']} - Rating: {org.get('currentRating', {}).get('rating')}")
```

### Get Organization

Retrieve full details for a single organization by EIN.

```python
async def get_organization(client: httpx.AsyncClient, ein: str) -> dict:
    return await cn_request(client, f"/Organizations/{ein}")

# Usage
org = await get_organization(client, "13-1788491")
print(f"{org['charityName']}")
print(f"Rating: {org['currentRating']['rating']}")
print(f"Category: {org['category']['categoryName']}")
print(f"Cause: {org['cause']['causeName']}")
```

### Get Organization Ratings

Retrieve all ratings for an organization (historical).

**Parameters:**
- `pageSize` (int) -- Results per page
- `pageNum` (int) -- Page number

```python
async def get_ratings(
    client: httpx.AsyncClient,
    ein: str,
    page_size: int = 100,
    page_num: int = 1,
) -> list:
    return await cn_request(
        client, f"/Organizations/{ein}/Ratings",
        {"pageSize": page_size, "pageNum": page_num},
    )

# Usage
ratings = await get_ratings(client, "13-1788491")
for r in ratings:
    print(f"Rating: {r['rating']} (Score: {r['score']}) - {r['ratingDate']}")
```

### Get Specific Rating

Retrieve a single rating by organization EIN and rating ID.

```python
async def get_rating(client: httpx.AsyncClient, ein: str, rating_id: int) -> dict:
    return await cn_request(client, f"/Organizations/{ein}/Ratings/{rating_id}")
```

### Get Organization Advisories

Retrieve advisories (cautionary communications) for an organization.

**Parameters:**
- `status` (str) -- `ALL`, `ACTIVE`, or `REMOVED` (default: `ALL`)

```python
async def get_advisories(
    client: httpx.AsyncClient,
    ein: str,
    status: str = "ALL",
) -> list:
    return await cn_request(
        client, f"/Organizations/{ein}/Advisories",
        {"status": status},
    )

# Usage
advisories = await get_advisories(client, "13-1788491", status="ACTIVE")
for adv in advisories:
    print(f"{adv['advisoryDate']}: {adv['description']}")
```

### Get Specific Advisory

Retrieve a single advisory by ID.

```python
async def get_advisory(client: httpx.AsyncClient, ein: str, advisory_id: int) -> dict:
    return await cn_request(client, f"/Organizations/{ein}/Advisories/{advisory_id}")
```

### Get All Active Advisories

Retrieve all organizations that currently have active advisories.

```python
async def get_all_active_advisories(
    client: httpx.AsyncClient,
    page_size: int = 100,
    page_num: int = 1,
) -> list:
    return await cn_request(
        client, "/Advisory",
        {"pageSize": page_size, "pageNum": page_num},
    )

# Usage
active = await get_all_active_advisories(client)
for entry in active:
    print(f"{entry['organization']['charityName']}: {entry['description']}")
```

### Get Lists

Retrieve curated or generated lists of organizations published by Charity Navigator.

```python
async def get_lists(
    client: httpx.AsyncClient,
    page_size: int = 100,
    page_num: int = 1,
) -> list:
    return await cn_request(
        client, "/Lists",
        {"pageSize": page_size, "pageNum": page_num},
    )

# Usage
lists = await get_lists(client)
for lst in lists:
    print(f"{lst['listID']}: {lst['title']}")
```

### Get Specific List

Retrieve details for a single curated list.

```python
async def get_list(client: httpx.AsyncClient, list_id: int) -> dict:
    return await cn_request(client, f"/Lists/{list_id}")

# Usage
charity_list = await get_list(client, 1)
print(charity_list["title"])
for org in charity_list.get("organizations", []):
    print(f"  {org['charityName']}")
```

### Get Categories

Retrieve all charity classification categories.

```python
async def get_categories(client: httpx.AsyncClient) -> list:
    return await cn_request(client, "/Categories")

# Usage
categories = await get_categories(client)
for cat in categories:
    print(f"{cat['categoryID']}: {cat['categoryName']}")
    for cause in cat.get("causes", []):
        print(f"  {cause['causeID']}: {cause['causeName']}")
```

## Error Handling

Successful responses return HTTP 200 with a JSON body (array or object).

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- invalid parameter values or missing required parameters |
| 404 | Not Found -- EIN not found, or page number exceeds available data |
| 500 | Internal Server Error |

```python
import logging

logger = logging.getLogger(__name__)

class CharityNavError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def cn_request_safe(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict | list:
    request_params = auth_params(**(params or {}))
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params)
        except httpx.RequestError as e:
            logger.warning(f"Network error (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            logger.warning(f"Rate limited, retrying in {wait}s")
            await asyncio.sleep(wait)
            continue

        raise CharityNavError(resp.status_code, resp.text)

    raise CharityNavError(429, "Max retries exceeded")
```

## Common Pitfalls

1. **Two credentials required.** Unlike most APIs, Charity Navigator requires both `app_id` and `app_key` on every request. Missing either returns an error.

2. **EIN format includes a hyphen.** EINs are formatted as `XX-XXXXXXX` (e.g., `13-1788491`). Some endpoints accept with or without the hyphen, but always include it for consistency.

3. **Pagination maxes out at 10,000 results.** Even with multiple pages, the total accessible results cap at 10,000. Use more specific filters to narrow results.

4. **Default page size is 100.** If you need fewer results, set `pageSize` explicitly to reduce response size and improve performance.

5. **Rating scale is 0-4 stars.** Charity Navigator uses a 0-4 star rating system, not 0-5. Filter parameters `minRating` and `maxRating` use this range.

6. **Not all organizations are rated.** Use `rated=TRUE` to filter to only rated organizations. Unrated organizations have no `currentRating` field.

7. **The `sort` parameter uses a colon format.** Sort values are `NAME:ASC`, `RATING:DESC`, or `RELEVANCE:DESC` -- not separate sort/direction parameters.

8. **Advisories are cautionary, not ratings.** Advisories flag unusual events (governance issues, fraud alerts). They are separate from the star rating system.

9. **Categories have a two-level hierarchy.** Each category contains multiple causes. Filter by `categoryID` for broad filtering or `causeID` for specific targeting.

10. **The API returns arrays for collection endpoints.** Unlike many APIs that wrap results in an object, collection endpoints return a plain JSON array. Check the return type annotation.
