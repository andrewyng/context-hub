---
name: rest-api
description: "Canvas LMS REST API - Learning management system for courses, assignments, grades, and enrollments"
metadata:
  languages: "python"
  versions: "v1"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "canvas,lms,education,courses,assignments,grades,students,api"
---

# Canvas LMS REST API - Python Reference (httpx)

## Golden Rule

Canvas API requests go to **your institution's Canvas domain** (e.g., `https://yourschool.instructure.com`). Authentication uses an OAuth2 Bearer token in the `Authorization` header. All responses are JSON. Pagination uses `Link` headers with `rel="next"` -- always follow these rather than constructing page URLs manually. Default page size is 10 items; use `per_page` (max varies by endpoint) to increase.

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
            f"{BASE_URL}/api/v1/courses",
            headers=HEADERS,
            params={"per_page": 50},
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://{your-canvas-domain}/api/v1
```

Examples:
- `https://yourschool.instructure.com/api/v1`
- `https://canvas.instructure.com/api/v1` (free-for-teacher accounts)

```python
import os

ACCESS_TOKEN = os.environ["CANVAS_ACCESS_TOKEN"]
BASE_URL = os.environ.get("CANVAS_BASE_URL", "https://yourschool.instructure.com")
API_URL = f"{BASE_URL}/api/v1"
HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
```

## Authentication

Canvas uses **OAuth2 Bearer tokens**. Include the token in the `Authorization` header on every request:

```
Authorization: Bearer <ACCESS-TOKEN>
```

Tokens can be:
- **Personal access tokens** -- generated in Canvas under Account > Settings > Approved Integrations
- **OAuth2 tokens** -- obtained via the OAuth2 flow for third-party apps

Never pass tokens as query parameters in production (supported but insecure).

## Rate Limiting

Canvas uses a token-bucket rate limiter. Each account gets a bucket of requests that refills over time. The response headers indicate your current quota:

| Header | Meaning |
|---|---|
| `X-Rate-Limit-Remaining` | Requests remaining in the current bucket |
| `X-Request-Cost` | Cost of the current request |

When the bucket is empty, Canvas returns HTTP `403` with a `Retry-After` header.

```python
import asyncio

async def canvas_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_data: dict = None,
    max_retries: int = 3,
) -> httpx.Response:
    for attempt in range(max_retries):
        resp = await client.request(
            method,
            f"{API_URL}{path}",
            headers=HEADERS,
            params=params,
            json=json_data,
        )
        if resp.status_code == 403 and "Rate Limit" in resp.text:
            wait = float(resp.headers.get("Retry-After", 2 ** attempt))
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp
    raise Exception("Max retries exceeded due to rate limiting")
```

## Pagination

Canvas uses **Link header pagination**. Responses include a `Link` header with URLs for `current`, `next`, `prev`, `first`, and `last` pages.

```python
import re

async def paginate(client: httpx.AsyncClient, path: str, params: dict = None) -> list:
    all_items = []
    url = f"{API_URL}{path}"
    request_params = {**(params or {}), "per_page": 100}

    while url:
        resp = await client.get(url, headers=HEADERS, params=request_params)
        resp.raise_for_status()
        all_items.extend(resp.json())

        # After first request, params are encoded in the Link URL
        request_params = None

        # Parse Link header for next page
        link_header = resp.headers.get("Link", "")
        match = re.search(r'<([^>]+)>;\s*rel="next"', link_header)
        url = match.group(1) if match else None

    return all_items
```

## Methods

### List Courses

List courses for the authenticated user.

**Parameters:**
- `enrollment_type` (str) -- Filter by role: `teacher`, `student`, `ta`, `observer`, `designer`
- `enrollment_state` (str) -- Filter by state: `active`, `invited_or_pending`, `completed`
- `state[]` (str) -- Course state: `unpublished`, `available`, `completed`, `deleted`
- `include[]` (str) -- Extra data: `total_students`, `teachers`, `term`, `course_image`
- `per_page` (int) -- Results per page (default 10)

```python
async def list_courses(
    client: httpx.AsyncClient,
    enrollment_type: str = None,
    enrollment_state: str = "active",
    include: list[str] = None,
) -> list:
    params = {"enrollment_state": enrollment_state}
    if enrollment_type:
        params["enrollment_type"] = enrollment_type
    if include:
        params["include[]"] = include
    return await paginate(client, "/courses", params)

# Usage
courses = await list_courses(client, enrollment_type="teacher", include=["total_students", "term"])
for c in courses:
    print(f"{c['id']}: {c['name']} ({c.get('total_students', '?')} students)")
```

### Get a Single Course

```python
async def get_course(client: httpx.AsyncClient, course_id: int, include: list[str] = None) -> dict:
    params = {}
    if include:
        params["include[]"] = include
    resp = await canvas_request(client, "GET", f"/courses/{course_id}", params=params)
    return resp.json()
```

### List Assignments

**Parameters:**
- `search_term` (str) -- Partial match on assignment name
- `bucket` (str) -- Filter by: `past`, `overdue`, `undated`, `ungraded`, `unsubmitted`, `upcoming`, `future`
- `order_by` (str) -- `position`, `name`, `due_at`
- `include[]` (str) -- `submission`, `assignment_visibility`, `all_dates`, `overrides`, `score_statistics`

```python
async def list_assignments(
    client: httpx.AsyncClient,
    course_id: int,
    bucket: str = None,
    search_term: str = None,
    include: list[str] = None,
) -> list:
    params = {}
    if bucket:
        params["bucket"] = bucket
    if search_term:
        params["search_term"] = search_term
    if include:
        params["include[]"] = include
    return await paginate(client, f"/courses/{course_id}/assignments", params)

# Usage -- get upcoming assignments with submission status
assignments = await list_assignments(client, 12345, bucket="upcoming", include=["submission"])
for a in assignments:
    print(f"{a['name']} -- due: {a.get('due_at', 'no date')}")
```

### Create an Assignment

```python
async def create_assignment(
    client: httpx.AsyncClient,
    course_id: int,
    name: str,
    points_possible: float = 0,
    due_at: str = None,
    submission_types: list[str] = None,
    description: str = "",
) -> dict:
    payload = {
        "assignment": {
            "name": name,
            "points_possible": points_possible,
            "description": description,
            "submission_types": submission_types or ["online_text_entry"],
        }
    }
    if due_at:
        payload["assignment"]["due_at"] = due_at  # ISO 8601 format
    resp = await canvas_request(client, "POST", f"/courses/{course_id}/assignments", json_data=payload)
    return resp.json()

# Usage
new_assignment = await create_assignment(
    client, 12345,
    name="Week 5 Essay",
    points_possible=100,
    due_at="2026-04-01T23:59:00Z",
    submission_types=["online_upload", "online_text_entry"],
)
```

### List Enrollments

```python
async def list_enrollments(
    client: httpx.AsyncClient,
    course_id: int,
    enrollment_type: str = None,
    state: str = "active",
) -> list:
    params = {"state[]": state}
    if enrollment_type:
        params["type[]"] = enrollment_type  # e.g., "StudentEnrollment", "TeacherEnrollment"
    return await paginate(client, f"/courses/{course_id}/enrollments", params)

# Usage -- list all active students
students = await list_enrollments(client, 12345, enrollment_type="StudentEnrollment")
for s in students:
    print(f"{s['user']['name']} -- grade: {s.get('grades', {}).get('current_score', 'N/A')}")
```

### List Submissions for an Assignment

```python
async def list_submissions(
    client: httpx.AsyncClient,
    course_id: int,
    assignment_id: int,
    include: list[str] = None,
) -> list:
    params = {}
    if include:
        params["include[]"] = include  # e.g., ["user", "submission_comments"]
    return await paginate(client, f"/courses/{course_id}/assignments/{assignment_id}/submissions", params)
```

### Update a Grade

```python
async def update_grade(
    client: httpx.AsyncClient,
    course_id: int,
    assignment_id: int,
    user_id: int,
    grade: str,
    comment: str = None,
) -> dict:
    payload = {"submission": {"posted_grade": grade}}
    if comment:
        payload["comment"] = {"text_comment": comment}
    resp = await canvas_request(
        client, "PUT",
        f"/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}",
        json_data=payload,
    )
    return resp.json()

# Usage
await update_grade(client, 12345, 67890, 11111, "85", comment="Good work!")
```

### List Users in a Course

```python
async def list_users(
    client: httpx.AsyncClient,
    course_id: int,
    enrollment_type: str = None,
    search_term: str = None,
    include: list[str] = None,
) -> list:
    params = {}
    if enrollment_type:
        params["enrollment_type[]"] = enrollment_type
    if search_term:
        params["search_term"] = search_term
    if include:
        params["include[]"] = include  # e.g., ["email", "enrollments", "avatar_url"]
    return await paginate(client, f"/courses/{course_id}/users", params)
```

### List Modules

```python
async def list_modules(client: httpx.AsyncClient, course_id: int) -> list:
    return await paginate(client, f"/courses/{course_id}/modules")

async def list_module_items(client: httpx.AsyncClient, course_id: int, module_id: int) -> list:
    return await paginate(client, f"/courses/{course_id}/modules/{module_id}/items")
```

## Error Handling

Canvas returns standard HTTP status codes with JSON error bodies.

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- invalid or expired token |
| 403 | Forbidden -- rate limited or insufficient permissions |
| 404 | Not Found -- resource does not exist or user lacks access |
| 422 | Unprocessable Entity -- validation error |
| 500 | Internal Server Error |

```python
import httpx
import logging

logger = logging.getLogger(__name__)

class CanvasAPIError(Exception):
    def __init__(self, status_code: int, errors: list):
        self.status_code = status_code
        self.errors = errors
        super().__init__(f"[{status_code}] {errors}")

async def safe_canvas_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    **kwargs,
) -> dict:
    try:
        resp = await canvas_request(client, method, path, **kwargs)
        return resp.json()
    except httpx.HTTPStatusError as e:
        body = e.response.json() if e.response.content else {}
        errors = body.get("errors", [body.get("message", "Unknown error")])
        raise CanvasAPIError(e.response.status_code, errors) from e
```

## Common Pitfalls

1. **Pagination is mandatory.** Default page size is 10. If you do not follow `Link` headers, you will silently miss data. Always use a pagination helper.

2. **Timestamps are UTC ISO 8601.** Canvas returns and expects `YYYY-MM-DDTHH:MM:SSZ`. Do not send local times without timezone info.

3. **`include[]` parameters are arrays.** Pass them as repeated query parameters (`include[]=submission&include[]=user`) or as a list in httpx params.

4. **Token scopes matter.** Personal tokens have full user permissions, but OAuth tokens are limited to requested scopes. A 401 may mean a scope issue, not an invalid token.

5. **`per_page` has an unpublished maximum.** Instructure can change the max at any time. Request 100 and follow pagination rather than trying to get all results in one call.

6. **SIS IDs require prefixes.** When using SIS IDs instead of Canvas IDs, prefix them: `sis_course_id:MATH101`, `sis_user_id:student42`.

7. **Assignment `submission_types` is required for creation.** Omitting it causes a 422. Valid values include: `online_text_entry`, `online_url`, `online_upload`, `media_recording`, `none`.

8. **Grades are strings.** The `posted_grade` field accepts strings like `"85"`, `"A-"`, `"pass"`, or `"incomplete"`.

9. **Deleted items may still appear.** Use `state[]` filters or check the `workflow_state` field to exclude deleted or unpublished items.

10. **Rate limit cost varies by endpoint.** Listing operations cost more than single-resource GETs. Monitor `X-Request-Cost` headers and batch wisely.
