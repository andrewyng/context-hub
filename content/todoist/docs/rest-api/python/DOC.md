---
name: rest-api
description: "Todoist REST API v2 - Task and project management for personal productivity"
metadata:
  languages: "python"
  versions: "v2"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "todoist,tasks,productivity,todo,adhd,organization,api"
---

# Todoist REST API v2 - Python Reference (httpx)

## Golden Rule

Use the **REST API v2** at `https://api.todoist.com/rest/v2`. Authentication is a Bearer token in the `Authorization` header. Rate limit is **1,000 requests per 15 minutes per user**. All responses are JSON. Task due dates use natural language or explicit date strings. Always use `X-Request-Id` header with a UUID for POST/PUT requests to enable idempotent retries.

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
            f"{BASE_URL}/tasks",
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.todoist.com/rest/v2
```

```python
import os

API_TOKEN = os.environ["TODOIST_API_TOKEN"]
BASE_URL = "https://api.todoist.com/rest/v2"
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}
```

## Authentication

Todoist uses **Bearer token** authentication:

```
Authorization: Bearer <API-TOKEN>
```

Obtain your personal API token from Todoist Settings > Integrations > Developer. For third-party apps, use the OAuth2 flow to get user tokens.

## Rate Limiting

| Limit | Value |
|---|---|
| Requests per user | 1,000 per 15 minutes |

When exceeded, the API returns HTTP `429 Too Many Requests`.

```python
import asyncio
import uuid

async def todoist_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_data: dict = None,
    max_retries: int = 3,
) -> httpx.Response:
    headers = {**HEADERS}
    if method.upper() in ("POST", "PUT", "PATCH"):
        headers["X-Request-Id"] = str(uuid.uuid4())

    for attempt in range(max_retries):
        resp = await client.request(
            method,
            f"{BASE_URL}{path}",
            headers=headers,
            params=params,
            json=json_data,
        )
        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        return resp
    raise Exception("Max retries exceeded due to rate limiting")
```

## Methods

### Projects

#### List All Projects

```python
async def list_projects(client: httpx.AsyncClient) -> list:
    resp = await todoist_request(client, "GET", "/projects")
    return resp.json()

# Returns: [{"id": "123", "name": "Work", "color": "blue", "order": 1, ...}]
```

#### Create a Project

```python
async def create_project(
    client: httpx.AsyncClient,
    name: str,
    color: str = None,
    parent_id: str = None,
    is_favorite: bool = False,
) -> dict:
    payload = {"name": name, "is_favorite": is_favorite}
    if color:
        payload["color"] = color
    if parent_id:
        payload["parent_id"] = parent_id
    resp = await todoist_request(client, "POST", "/projects", json_data=payload)
    return resp.json()
```

#### Get / Update / Delete a Project

```python
async def get_project(client: httpx.AsyncClient, project_id: str) -> dict:
    resp = await todoist_request(client, "GET", f"/projects/{project_id}")
    return resp.json()

async def update_project(client: httpx.AsyncClient, project_id: str, **kwargs) -> dict:
    resp = await todoist_request(client, "POST", f"/projects/{project_id}", json_data=kwargs)
    return resp.json()

async def delete_project(client: httpx.AsyncClient, project_id: str) -> None:
    await todoist_request(client, "DELETE", f"/projects/{project_id}")
```

### Tasks

#### List Active Tasks

**Parameters:**
- `project_id` (str) -- Filter by project
- `section_id` (str) -- Filter by section
- `label` (str) -- Filter by label name
- `filter` (str) -- Todoist filter query (e.g., `"today"`, `"overdue"`, `"p1"`)
- `ids` (str) -- Comma-separated task IDs

```python
async def list_tasks(
    client: httpx.AsyncClient,
    project_id: str = None,
    section_id: str = None,
    label: str = None,
    filter_query: str = None,
) -> list:
    params = {}
    if project_id:
        params["project_id"] = project_id
    if section_id:
        params["section_id"] = section_id
    if label:
        params["label"] = label
    if filter_query:
        params["filter"] = filter_query
    resp = await todoist_request(client, "GET", "/tasks", params=params)
    return resp.json()

# Usage -- get today's tasks
today = await list_tasks(client, filter_query="today")
for t in today:
    print(f"[{'x' if t['is_completed'] else ' '}] {t['content']} (p{t['priority']})")
```

#### Create a Task

```python
async def create_task(
    client: httpx.AsyncClient,
    content: str,
    project_id: str = None,
    section_id: str = None,
    description: str = "",
    due_string: str = None,
    due_date: str = None,
    priority: int = 1,
    labels: list[str] = None,
    parent_id: str = None,
) -> dict:
    payload = {"content": content, "priority": priority}
    if project_id:
        payload["project_id"] = project_id
    if section_id:
        payload["section_id"] = section_id
    if description:
        payload["description"] = description
    if due_string:
        payload["due_string"] = due_string  # Natural language: "tomorrow at 3pm"
    elif due_date:
        payload["due_date"] = due_date  # ISO date: "2026-04-01"
    if labels:
        payload["labels"] = labels
    if parent_id:
        payload["parent_id"] = parent_id
    resp = await todoist_request(client, "POST", "/tasks", json_data=payload)
    return resp.json()

# Usage
task = await create_task(
    client,
    content="Review math homework",
    due_string="tomorrow at 4pm",
    priority=3,
    labels=["school", "important"],
)
```

#### Get / Update / Close / Reopen / Delete a Task

```python
async def get_task(client: httpx.AsyncClient, task_id: str) -> dict:
    resp = await todoist_request(client, "GET", f"/tasks/{task_id}")
    return resp.json()

async def update_task(client: httpx.AsyncClient, task_id: str, **kwargs) -> dict:
    resp = await todoist_request(client, "POST", f"/tasks/{task_id}", json_data=kwargs)
    return resp.json()

async def close_task(client: httpx.AsyncClient, task_id: str) -> None:
    await todoist_request(client, "POST", f"/tasks/{task_id}/close")

async def reopen_task(client: httpx.AsyncClient, task_id: str) -> None:
    await todoist_request(client, "POST", f"/tasks/{task_id}/reopen")

async def delete_task(client: httpx.AsyncClient, task_id: str) -> None:
    await todoist_request(client, "DELETE", f"/tasks/{task_id}")
```

### Sections

```python
async def list_sections(client: httpx.AsyncClient, project_id: str) -> list:
    resp = await todoist_request(client, "GET", "/sections", params={"project_id": project_id})
    return resp.json()

async def create_section(client: httpx.AsyncClient, project_id: str, name: str, order: int = None) -> dict:
    payload = {"project_id": project_id, "name": name}
    if order is not None:
        payload["order"] = order
    resp = await todoist_request(client, "POST", "/sections", json_data=payload)
    return resp.json()
```

### Labels

```python
async def list_labels(client: httpx.AsyncClient) -> list:
    resp = await todoist_request(client, "GET", "/labels")
    return resp.json()

async def create_label(client: httpx.AsyncClient, name: str, color: str = None) -> dict:
    payload = {"name": name}
    if color:
        payload["color"] = color
    resp = await todoist_request(client, "POST", "/labels", json_data=payload)
    return resp.json()
```

### Comments

```python
async def list_comments(
    client: httpx.AsyncClient,
    task_id: str = None,
    project_id: str = None,
) -> list:
    params = {}
    if task_id:
        params["task_id"] = task_id
    if project_id:
        params["project_id"] = project_id
    resp = await todoist_request(client, "GET", "/comments", params=params)
    return resp.json()

async def create_comment(
    client: httpx.AsyncClient,
    content: str,
    task_id: str = None,
    project_id: str = None,
) -> dict:
    payload = {"content": content}
    if task_id:
        payload["task_id"] = task_id
    elif project_id:
        payload["project_id"] = project_id
    resp = await todoist_request(client, "POST", "/comments", json_data=payload)
    return resp.json()
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success (GET, POST updates) |
| 204 | Success (DELETE, close, reopen) |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- invalid token |
| 403 | Forbidden -- insufficient permissions |
| 404 | Not Found -- resource does not exist |
| 429 | Too Many Requests -- rate limit exceeded |
| 500 | Internal Server Error |

```python
class TodoistError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_todoist_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    **kwargs,
) -> dict | None:
    try:
        resp = await todoist_request(client, method, path, **kwargs)
        if resp.status_code == 204:
            return None
        return resp.json()
    except httpx.HTTPStatusError as e:
        raise TodoistError(e.response.status_code, e.response.text) from e
```

## Common Pitfalls

1. **Priority numbering is inverted.** Priority 1 is normal (lowest), priority 4 is urgent (highest). The UI shows `p1` as urgent, but the API value for urgent is `4`.

2. **Use `X-Request-Id` for write operations.** POST and PUT requests should include a UUID in the `X-Request-Id` header. This makes retries safe -- Todoist deduplicates requests with the same ID.

3. **`due_string` uses natural language.** Pass strings like `"every Monday"`, `"tomorrow at 3pm"`, `"in 2 hours"`. The API parses these using Todoist's date engine. Use `due_date` for explicit ISO dates.

4. **IDs are strings, not integers.** All resource IDs in REST API v2 are returned as strings. Do not cast them to integers.

5. **`filter` parameter uses Todoist filter syntax.** This is not a generic search. Use Todoist filter expressions like `"today | overdue"`, `"#Work & p1"`, `"assigned to: me"`.

6. **Labels are referenced by name, not ID, in task creation.** The `labels` field on tasks takes an array of label name strings, not IDs.

7. **Closing a task is not deleting.** `POST /tasks/{id}/close` marks it complete. `DELETE /tasks/{id}` permanently removes it. Closed tasks can be reopened; deleted tasks cannot.

8. **No built-in pagination for tasks.** The REST API v2 returns all matching tasks in a single response. For very large task lists, use project or section filters to reduce response size.

9. **Recurring tasks reset on close.** Closing a recurring task automatically creates the next occurrence. The task ID stays the same but the due date advances.

10. **REST API v2 may be superseded.** Todoist has announced a unified API v1. Check the developer portal for migration guidance if building new integrations.
