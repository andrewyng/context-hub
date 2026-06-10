---
name: linkedin-search
description: "Search LinkedIn users, companies, jobs, posts, industries, and locations with filters"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "find,lookup,filter,people,recruitment,discovery"
---

# Anysite LinkedIn Search API (Python)

You are an Anysite LinkedIn API coding expert. Help me write Python code to search LinkedIn users, companies, jobs, posts, industries, and locations.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`

## Authentication

```python
import requests
import os

BASE_URL = "https://api.anysite.io"
API_KEY = os.environ["ANYSITE_API_KEY"]

HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}


def anysite_post(endpoint: str, payload: dict) -> dict:
    """Make a POST request to the Anysite LinkedIn API."""
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    return response.json()
```

## Common Operations

### Search Users

Search LinkedIn users with filters. Returns paginated results (1 credit per 10 results).

```python
results = anysite_post("/api/linkedin/search/users", {
    "keywords": "machine learning",
    "title": "Engineer",
    "location": "San Francisco",
    "current_company": "Google",
    "count": 20
})

for user in results:
    print(user["name"], "-", user["headline"])
    print(user["urn"])
```

### Search Companies

Search for companies by keyword. Supports location, industry, and employee count filters.

```python
results = anysite_post("/api/linkedin/search/companies", {
    "keywords": "artificial intelligence",
    "location": "San Francisco",
    "employee_count": ["51-200", "201-500"],
    "count": 20
})

for company in results:
    print(company["name"], "-", company["alias"])
```

### Search Jobs

Search for LinkedIn job postings. Cost: 1 credit per 25 results.

```python
jobs = anysite_post("/api/linkedin/search/jobs", {
    "keywords": "python developer",
    "location": "New York",
    "count": 25
})

for job in jobs:
    print(job["title"], "at", job["company_name"])
    print(job["location"])
```

### Search Posts

Search for LinkedIn posts by keyword. Cost: 1 credit per 50 results.

```python
posts = anysite_post("/api/linkedin/search/posts", {
    "keywords": "generative AI startups",
    "count": 20
})

for post in posts:
    print(post["author_name"], ":", post["text"][:100])
```

### Helper Searches (Educations, Industries, Locations)

Use these to get URN filter values for the main search endpoints:

```python
# Search educational institutions
schools = anysite_post("/api/linkedin/search/educations", {
    "name": "Stanford", "count": 10
})

# Search industries
industries = anysite_post("/api/linkedin/search/industries", {
    "name": "software", "count": 10
})

# Search locations
locations = anysite_post("/api/linkedin/search/locations", {
    "name": "San Francisco", "count": 10
})
```

## Pagination

Endpoints that return lists use a `count` parameter to control how many results to return:

```python
results = anysite_post("/api/linkedin/search/users", {
    "keywords": "data scientist",
    "count": 50
})
```

## Error Handling

```python
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

| Status Code | Meaning | Action |
|---|---|---|
| 401 | Invalid or missing `access-token` header | Check your API key |
| 422 | Validation error (bad parameters) | Check parameter names and types |
| 429 | Rate limit exceeded | Back off and retry |
| 500 | Server error | Retry after a delay |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.

## Reference

Detailed endpoint documentation with full parameter tables and response schemas:

- [Search Endpoints](references/search-endpoints.md) - 7 endpoints for searching users, companies, jobs, posts, and more
