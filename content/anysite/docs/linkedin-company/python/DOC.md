---
name: linkedin-company
description: "Extract LinkedIn company profiles, employee statistics, workforce data, and company posts"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "organization,employer,headcount,hiring,corporate"
---

# Anysite LinkedIn Company API (Python)

You are an Anysite LinkedIn API coding expert. Help me write Python code to extract LinkedIn company profiles, employee statistics, workforce data, and company posts.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** LinkedIn companies use a single `company` parameter that accepts URNs (e.g., `company:1035`), aliases (URL slugs), or full URLs

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

### Get Company Info

Fetch company details by passing a `company` identifier (alias, URL, or URN). Returns company profile with description, employee count, locations, and website.

```python
result = anysite_post("/api/linkedin/company", {
    "company": "microsoft"
})

company = result[0]
print(company["name"])
print(company["employee_count"])
print(company["website"])
print(company["urn"])  # object: {"type": "fsd_company", "value": "1035"}
```

### Get Employee Stats

Retrieve employee distribution statistics by location, function, seniority, and growth trends.

```python
stats = anysite_post("/api/linkedin/company/employee_stats", {
    "urn": {"type": "company", "value": "1035"}
})

for loc in stats[0]["locations"]:
    print(loc["name"], "-", loc["count"])
```

### Get Company Posts

Retrieve posts from a company page.

```python
posts = anysite_post("/api/linkedin/company/posts", {
    "urn": {"type": "company", "value": "1035"},
    "count": 10
})

for post in posts:
    print(post["url"])
    print(post["share_url"])
    print(post["author"]["name"])
    print(post["created_at"])
```

### Get Company Employees

Retrieve a list of employees for one or more companies. Cost: 150 credits per 100 results.

```python
employees = anysite_post("/api/linkedin/company/employees", {
    "companies": ["company:1035"],
    "count": 50
})

for emp in employees:
    print(emp["name"])
    print(emp["urn"])   # {"type": "fsd_profile", "value": "..."}
    print(emp["url"])
    print(emp["image"])
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

### URN Formats

| Entity | URN Format | Example |
|---|---|---|
| Company | `company:{id}` | `company:1035` |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.

## Reference

Detailed endpoint documentation with full parameter tables and response schemas:

- [Company Endpoints](references/company-endpoints.md) - 4 endpoints for company profiles, employees, posts, and stats
