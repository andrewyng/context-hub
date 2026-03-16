---
name: crunchbase
description: "Extract Crunchbase company profiles, funding rounds, employee data, and search companies"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "startup,funding,valuation,investor,venture-capital,techcrunch"
---

# Crunchbase API Coding Guidelines (Python)

You are a Crunchbase API coding expert. Help me write Python code using the Anysite REST API for Crunchbase data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** Companies use slugs, names, or URLs

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

## Crunchbase Endpoints

### Get Crunchbase Company

Retrieve detailed company information from Crunchbase. Costs 20 credits.

**POST** `/api/crunchbase/company`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `company` | string | Yes | Company slug, name, or Crunchbase URL |

```python
result = anysite_post("/api/crunchbase/company", {
    "company": "openai"
})

company = result[0]
print(company["name"])
print(company["short_description"])
print(company["founded_on"])
print(company["employee_count_range"])
print(company["website"])
print(company["categories"])
print(company["location"]["city"], company["location"]["country"])
print(company["contacts"]["email"])
```

**Key response fields (`CrunchbaseCompany`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Crunchbase entity ID |
| `name` | string | Company name |
| `alias` | string | Company slug |
| `url` | string | Crunchbase profile URL |
| `short_description` | string | Brief company description |
| `description` | string | Detailed company description |
| `legal_name` | string | Legal entity name |
| `founded_on` | string | Founding date |
| `employee_count_range` | string | Employee count range (e.g. `"5001-10000"`) |
| `revenue_range` | string | Revenue range estimate (may be null) |
| `website` | string | Company website |
| `operating_status` | string | Active, closed, etc. |
| `company_type` | string | Company type (e.g. `"for_profit"`) |
| `ipo_status` | string | IPO status (`"private"`, `"public"`) |
| `categories` | array | Industry categories |
| `location` | object | Location with `city`, `region`, `country`, `country_code`, `continent`, `groups` |
| `contacts` | object | Contact info with `email`, `phone`, `facebook_url`, `linkedin_url`, `twitter_url`, `num_contacts` |
| `logo_url` | string | Company logo URL |

### Search Crunchbase Companies

Search Crunchbase companies by filters. Costs 20 credits per 50 results.

**POST** `/api/crunchbase/search`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `keywords` | array or string | No | Search keywords |
| `count` | integer | Yes | Number of results to return |
| `location` | array or string | No | Location filter |
| `industry` | array or string | No | Industry filter |
| `employee_count_min` | integer | No | Minimum employee count |
| `employee_count_max` | integer | No | Maximum employee count |
| `funding_total_min` | integer | No | Minimum total funding (USD) |
| `funding_total_max` | integer | No | Maximum total funding (USD) |
| `last_funding_type` | array or string | No | Last funding round type filter |
| `founded_after` | string | No | Founded after date |
| `founded_before` | string | No | Founded before date |

```python
results = anysite_post("/api/crunchbase/search", {
    "keywords": ["artificial intelligence", "healthcare"],
    "count": 20
})

for company in results:
    print(company["name"])
    print(company["short_description"])
    print(company["employee_count_range"])
    print(company["location"]["city"], company["location"]["country"])
    print("---")
```

**Key response fields (`CrunchbaseSearchCompany`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Crunchbase entity ID |
| `name` | string | Company name |
| `alias` | string | Company slug |
| `url` | string | Crunchbase profile URL |
| `cb_rank` | integer | Crunchbase rank |
| `short_description` | string | Brief description |
| `description` | string | Detailed description |
| `employee_count_range` | string | Employee count range (e.g. `"1001-5000"`) |
| `categories` | array | Industry categories |
| `founded_on` | string | Founding date |
| `location` | object | Location with `city`, `region`, `country`, etc. |
| `logo_url` | string | Company logo URL |

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
