---
name: rest-api
description: "GlobalGiving - World's largest crowdfunding community for nonprofits. Search projects, organizations, themes, and submit donations."
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "globalgiving,charity,nonprofit,crowdfunding,donations,projects,api"
---

# GlobalGiving REST API - Python Reference (httpx)

## Golden Rule

Authentication uses an `api_key` **query parameter** on every request. Request a free API key by creating an account at https://www.globalgiving.org/api/. All responses default to XML; always pass the `Accept: application/json` header or append `&json=true` to get JSON. Paginated endpoints return a maximum of 10 results per page by default -- use `nextProjectId` or `nextOrgId` to page through results. Featured projects always return exactly 10 results and rotate hourly.

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
            f"{BASE_URL}/all/projects",
            params={"api_key": API_KEY},
            headers={"Accept": "application/json"},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.globalgiving.org/api/public/projectservice
```

```python
import os

API_KEY = os.environ["GLOBALGIVING_API_KEY"]
BASE_URL = "https://api.globalgiving.org/api/public/projectservice"
HEADERS = {"Accept": "application/json"}
```

## Authentication

GlobalGiving uses an **API key as a query parameter** on every request:

```
https://api.globalgiving.org/api/public/projectservice/all/projects?api_key=YOUR_API_KEY
```

There are no authorization headers. The key is always the `api_key` parameter. Obtain a key at https://www.globalgiving.org/api/getting-started/.

## Rate Limiting

GlobalGiving does not publicly document specific rate limits, but excessive usage may result in throttling. Implement reasonable delays between batch requests.

```python
import asyncio

async def gg_request(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    request_params = {**(params or {}), "api_key": API_KEY}
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params, headers=HEADERS)
        except httpx.RequestError as e:
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json()

        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            await asyncio.sleep(wait)
            continue

        resp.raise_for_status()

    raise Exception("Max retries exceeded")
```

## Methods

### Get All Projects

Retrieve all active projects with pagination. Returns max 10 projects per request.

**Parameters:**
- `nextProjectId` (int) -- Starting project ID for pagination (from `hasNext`/`nextProjectId` in response)

```python
async def get_all_projects(client: httpx.AsyncClient, next_project_id: int = None) -> dict:
    params = {}
    if next_project_id:
        params["nextProjectId"] = next_project_id
    return await gg_request(client, "/all/projects", params)

# Usage -- paginate through all projects
projects = await get_all_projects(client)
project_list = projects["projects"]["project"]
if projects["projects"].get("hasNext"):
    next_page = await get_all_projects(client, projects["projects"]["nextProjectId"])
```

### Get Featured Projects

Retrieve 10 featured projects. Rotated hourly based on ranking algorithm. Always returns exactly 10 results.

```python
async def get_featured_projects(client: httpx.AsyncClient) -> dict:
    return await gg_request(client, "/featured/projects")

# Usage
featured = await get_featured_projects(client)
for proj in featured["projects"]["project"]:
    print(f"{proj['id']}: {proj['title']} - {proj['country']}")
```

### Get Specific Project

Retrieve full details for a single project by ID.

```python
async def get_project(client: httpx.AsyncClient, project_id: int) -> dict:
    return await gg_request(client, f"/projects/{project_id}")

# Usage
project = await get_project(client, 1234)
print(project["project"]["title"])
print(project["project"]["funding"])
```

### Search Projects

Search projects by keyword.

**Parameters:**
- `q` (str) -- Search keyword

```python
async def search_projects(client: httpx.AsyncClient, query: str) -> dict:
    return await gg_request(client, "/search/projects", {"q": query})

# Usage
results = await search_projects(client, "clean water")
for proj in results["search"]["response"]["projects"]["project"]:
    print(f"{proj['id']}: {proj['title']}")
```

### Get Projects by Theme

Retrieve all projects for a specific theme.

```python
async def get_projects_by_theme(client: httpx.AsyncClient, theme_id: str) -> dict:
    return await gg_request(client, f"/themes/{theme_id}/projects")

# Usage -- theme IDs: climate, edu, health, hunger, etc.
projects = await get_projects_by_theme(client, "edu")
```

### Get Projects by Country/Region

Retrieve all projects for a specific country or region.

```python
async def get_projects_by_country(client: httpx.AsyncClient, country_iso: str) -> dict:
    return await gg_request(client, f"/countries/{country_iso}/projects")

# Usage -- ISO 3166-1 alpha-2 country codes
projects = await get_projects_by_country(client, "KE")
```

### Get Projects by Organization

Retrieve all projects for a specific organization.

```python
async def get_org_projects(
    client: httpx.AsyncClient,
    org_id: int,
    next_project_id: int = None,
) -> dict:
    params = {}
    if next_project_id:
        params["nextProjectId"] = next_project_id
    return await gg_request(client, f"/organizations/{org_id}/projects", params)

# Usage
org_projects = await get_org_projects(client, 189)
```

### Get Organization

Retrieve details for a specific organization.

```python
async def get_organization(client: httpx.AsyncClient, org_id: int) -> dict:
    return await gg_request(client, f"/organizations/{org_id}")

# Usage
org = await get_organization(client, 189)
print(org["organization"]["name"])
```

### Get All Organizations (Bulk)

Retrieve all organizations. Max 10 per request; paginate with `nextOrgId`.

```python
async def get_all_organizations(client: httpx.AsyncClient, next_org_id: int = None) -> dict:
    params = {}
    if next_org_id:
        params["nextOrgId"] = next_org_id
    return await gg_request(client, "/organizations", params)

# Usage -- paginate
orgs = await get_all_organizations(client)
```

### Get Themes

Retrieve all available project themes.

```python
async def get_themes(client: httpx.AsyncClient) -> dict:
    return await gg_request(client, "/themes")

# Usage
themes = await get_themes(client)
for theme in themes["themes"]["theme"]:
    print(f"{theme['id']}: {theme['name']}")
```

### Get Themes with Project IDs

Retrieve themes along with their associated project IDs.

```python
async def get_themes_with_projects(client: httpx.AsyncClient) -> dict:
    return await gg_request(client, "/themes/projects/ids")
```

### Get Regions

Retrieve all regions with project counts.

```python
async def get_regions(client: httpx.AsyncClient) -> dict:
    return await gg_request(client, "/regions")
```

### Get Image Gallery

Retrieve the image gallery for a specific project.

```python
async def get_image_gallery(client: httpx.AsyncClient, project_id: int) -> dict:
    return await gg_request(client, f"/projects/{project_id}/imagegallery")
```

### Get Progress Report

Retrieve the latest progress report for a project.

```python
async def get_progress_report(client: httpx.AsyncClient, project_id: int) -> dict:
    return await gg_request(client, f"/projects/{project_id}/report")
```

## Error Handling

Successful responses return HTTP 200 with a JSON or XML body.

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- missing or invalid parameters |
| 401 | Unauthorized -- invalid or missing API key |
| 404 | Not Found -- project/organization does not exist |
| 429 | Too Many Requests -- rate limit exceeded |
| 500 | Internal Server Error |

```python
import logging

logger = logging.getLogger(__name__)

class GlobalGivingError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def gg_request_safe(
    client: httpx.AsyncClient,
    path: str,
    params: dict = None,
    max_retries: int = 3,
) -> dict:
    request_params = {**(params or {}), "api_key": API_KEY}
    url = f"{BASE_URL}{path}"

    for attempt in range(max_retries):
        try:
            resp = await client.get(url, params=request_params, headers=HEADERS)
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

        raise GlobalGivingError(resp.status_code, resp.text)

    raise GlobalGivingError(429, "Max retries exceeded")
```

## Common Pitfalls

1. **Default response format is XML.** Always set `Accept: application/json` header or append `json=true` parameter. Forgetting this returns XML which will fail JSON parsing.

2. **Pagination returns max 10 items.** Every list endpoint paginates with 10 results per page. Check the `hasNext` field and use `nextProjectId` or `nextOrgId` to continue.

3. **Featured projects always return exactly 10.** There is no "get more" -- the featured set rotates hourly.

4. **Project IDs are not sequential.** Do not assume project IDs are contiguous. Always use the pagination tokens from the API response.

5. **Some projects may be inactive.** The API returns active projects by default. Check the `active` field if you need to filter.

6. **Organization bulk download is slow.** With max 10 per page, downloading all organizations requires many requests. Implement delays between requests.

7. **Country codes use ISO 3166-1 alpha-2.** Use two-letter country codes (e.g., `KE` for Kenya, `IN` for India).

8. **Theme IDs are string slugs.** Theme identifiers are strings like `climate`, `edu`, `health`, not numeric IDs.

9. **The API key must be in query parameters.** Unlike many modern APIs, GlobalGiving does not support API keys in headers.

10. **JSON responses wrap data in nested objects.** Projects are inside `projects.project`, organizations inside `organizations.organization`. Always navigate the nesting correctly.
