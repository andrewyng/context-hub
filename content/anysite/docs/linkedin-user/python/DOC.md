---
name: linkedin-user
description: "Extract LinkedIn profiles, work history, education, skills, posts, comments, and reactions"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "scraping,profile,experience,education,employment,resume"
---

# Anysite LinkedIn User & Posts API (Python)

You are an Anysite LinkedIn API coding expert. Help me write Python code to extract LinkedIn user profiles, work history, education, skills, posts, comments, and reactions.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** LinkedIn entities use a single `user` or `urn` parameter that accepts URNs (e.g., `fsd_profile:ACoAABXy1234`), aliases (URL slugs), or full URLs

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

### Get User Profile

Retrieve a full LinkedIn profile by passing a `user` identifier (alias, URL, or URN). Toggle sections with boolean flags to reduce response size and credit cost (1-9 credits depending on sections).

```python
result = anysite_post("/api/linkedin/user", {
    "user": "williamhgates",
    "with_experience": True,
    "with_education": True,
    "with_skills": True,
    "with_honors": False,
    "with_certificates": False,
    "with_languages": False,
    "with_patents": False,
    "with_description_and_top_skills": True
})

user = result[0]
print(user["name"])
print(user["headline"])
print(user["urn"])  # object: {"type": "fsd_profile", "value": "ACoAABXy1234"}
```

The `user` parameter accepts an alias (URL slug), full LinkedIn profile URL, or URN:

```python
result = anysite_post("/api/linkedin/user", {
    "user": "https://www.linkedin.com/in/williamhgates"
})
```

### Get User Experience

Retrieve work history for a user by URN. Returns an array of positions.

```python
experience = anysite_post("/api/linkedin/user/experience", {
    "urn": "fsd_profile:ACoAABXy1234",
    "count": 50
})

for position in experience:
    print(position["company_name"], "-", position["title"])
    print(position["start_date"], "to", position.get("end_date", "Present"))
```

### Get Post

Retrieve a LinkedIn post by URN or URL. Returns post content, author info, and engagement metrics.

```python
result = anysite_post("/api/linkedin/post", {
    "urn": "activity:7234173400267538433"
})

post = result[0]
print(post["text"])
print(post["num_likes"], "likes")
print(post["num_comments"], "comments")
```

### Get Post Comments

Retrieve comments on a post. Paginated with `count` (1 credit per 10 results).

```python
comments = anysite_post("/api/linkedin/post/comments", {
    "urn": "activity:7234173400267538433",
    "count": 20
})

for comment in comments:
    print(comment["author_name"], ":", comment["text"])
```

## Pagination

Endpoints that return lists use a `count` parameter to control how many results to return:

```python
posts = anysite_post("/api/linkedin/user/posts", {
    "urn": "fsd_profile:ACoAABXy1234",
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

### URN Formats

| Entity | URN Format | Example |
|---|---|---|
| User profile | `fsd_profile:{id}` | `fsd_profile:ACoAABXy1234` |
| Post/Activity | `activity:{id}` | `activity:7234173400267538433` |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.

## Reference

Detailed endpoint documentation with full parameter tables and response schemas:

- [User Endpoints](references/user-endpoints.md) - 12 endpoints for profiles, experience, education, skills, posts, and more
- [Post Endpoints](references/post-endpoints.md) - 4 endpoints for post details, comments, reactions, and reposts
