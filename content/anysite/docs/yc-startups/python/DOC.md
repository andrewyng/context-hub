---
name: yc-startups
description: "Search Y Combinator companies, founders, batches, and startup ecosystem data"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "ycombinator,accelerator,founder,batch,seed,incubator"
---

# Y Combinator API Coding Guidelines (Python)

You are a Y Combinator API coding expert. Help me write Python code using the Anysite REST API for Y Combinator data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** Companies use slugs

## Authentication

```python
import requests

BASE_URL = "https://api.anysite.io"
API_KEY = "your-api-key"  # Use env vars in production

HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}


def anysite_post(endpoint: str, payload: dict) -> dict:
    """Make a POST request to the Anysite API."""
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    return response.json()
```

Store your API key in an environment variable:

```python
import os
API_KEY = os.environ["ANYSITE_API_KEY"]
```

## Y Combinator Endpoints

### Get YC Company

Retrieve Y Combinator company details by slug. Costs 1 credit.

**POST** `/api/yc/company`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `company` | string | Yes | YC company slug (e.g. `"airbnb"`, `"stripe"`) |

```python
result = anysite_post("/api/yc/company", {
    "company": "openai"
})

company = result[0]
print(company["name"])
print(company["one_liner"])
print(company["long_description"])
print(company["batch"])
print(company["team_size"])
print(company["website"])
print(company["industries"])
print(company["status"])
```

**Key response fields (`YCCompany`):**

| Field | Type | Description |
|---|---|---|
| `name` | string | Company name |
| `slug` | string | URL slug on YC |
| `one_liner` | string | One-line description |
| `long_description` | string | Detailed description |
| `batch` | string | YC batch (e.g. "W21", "S19") |
| `team_size` | integer | Current team size |
| `website` | string | Company website URL |
| `industries` | array | Industry tags |
| `status` | string | Company status (Active, Acquired, etc.) |
| `regions` | array | Geographic regions |
| `is_hiring` | boolean | Whether actively hiring |
| `top_company` | boolean | Whether it is a YC Top Company |
| `nonprofit` | boolean | Whether it is a nonprofit |
| `small_logo_thumb_url` | string | Company logo thumbnail URL |
| `all_locations` | string | Office locations |
| `launched_at` | integer | Unix timestamp of YC launch |
| `industry` | string | Primary industry |
| `subindustry` | string | Sub-industry classification |
| `stage` | string | Company stage (e.g. `"Growth"`) |
| `tags` | array | Tags |
| `former_names` | array | Previous company names |
| `founders` | array | List of founder objects |

### Search YC Companies

Search Y Combinator companies with advanced filters. Costs 1 credit per batch.

**POST** `/api/yc/search/companies`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | No | null | Search query keywords |
| `count` | integer | Yes | - | Number of results to return |
| `batches` | array of string | No | null | Filter by YC batches (e.g. `["W24", "S23"]`) |
| `industries` | array of string | No | null | Filter by industries |
| `regions` | array of string | No | null | Filter by geographic regions |
| `is_hiring` | boolean | No | null | Filter to companies that are hiring |
| `top_company` | boolean | No | null | Filter to YC Top Companies |
| `nonprofit` | boolean | No | null | Filter to nonprofits |
| `team_size_min` | integer | No | null | Minimum team size |
| `team_size_max` | integer | No | null | Maximum team size |
| `sort_by` | string | No | `"relevance"` | Sort order |

```python
results = anysite_post("/api/yc/search/companies", {
    "query": "AI",
    "batches": ["W24", "S24"],
    "is_hiring": True,
    "count": 50,
    "sort_by": "relevance"
})

for company in results:
    print(company["name"], f"({company['batch']})")
    print(company["one_liner"])
    print(company["team_size"], "employees")
    print("---")
```

Returns an array of `YCCompany`.

### Search YC Founders

Search Y Combinator founders with filters. Costs 1 credit per batch.

**POST** `/api/yc/search/founders`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | No | null | Search query (name, keyword) |
| `count` | integer | Yes | - | Number of results to return |
| `batches` | array of string | No | null | Filter by YC batches |
| `industries` | array of string | No | null | Filter by industries |
| `titles` | array of string | No | null | Filter by titles (e.g. `["CEO", "CTO"]`) |
| `top_company` | boolean | No | null | Filter to founders of YC Top Companies |

```python
results = anysite_post("/api/yc/search/founders", {
    "query": "machine learning",
    "titles": ["CEO"],
    "count": 20
})

for founder in results:
    print(founder["first_name"], founder["last_name"])
    print(founder["current_title"])
    print(founder["current_company"])
    print(founder["company_slug"])
    print(founder.get("hnid"))
    print("---")
```

**Key response fields (`YCFounderSearchResult`):**

| Field | Type | Description |
|---|---|---|
| `id` | integer | Founder ID |
| `first_name` | string | Founder first name |
| `last_name` | string | Founder last name (may include title and company) |
| `current_title` | string | Current title/role |
| `current_company` | string | Current company name |
| `company_slug` | string | Company slug on YC |
| `top_company` | boolean | Whether it is a YC Top Company |
| `hnid` | string | Hacker News ID |
| `avatar_thumb` | string | Profile photo thumbnail URL |
| `url_slug` | string | URL slug for the founder |
| `all_companies_text` | string | Text listing all associated companies |

## Error Handling

```python
import requests


def anysite_post_safe(endpoint: str, payload: dict) -> dict | None:
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            print("Invalid or missing access-token")
        elif status == 422:
            print("Validation error:", e.response.json())
        elif status == 429:
            print("Rate limit exceeded - wait and retry")
        elif status >= 500:
            print("Server error - retry later")
        else:
            print(f"HTTP {status}:", e.response.text)
        return None
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
```

### Common Error Codes

| Status Code | Meaning | Action |
|---|---|---|
| 401 | Invalid or missing `access-token` header | Check your API key |
| 422 | Validation error (bad parameters) | Check parameter names and types |
| 429 | Rate limit exceeded | Back off and retry |
| 500 | Server error | Retry after a delay |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.
