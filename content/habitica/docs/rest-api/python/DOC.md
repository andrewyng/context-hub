---
name: rest-api
description: "Habitica API v3 - Gamified habit and task tracker for productivity and neurodivergent support"
metadata:
  languages: "python"
  versions: "v3"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "habitica,habits,tasks,gamification,adhd,neurodivergent,productivity,api"
---

# Habitica API v3 - Python Reference (httpx)

## Golden Rule

All requests go to `https://habitica.com/api/v3`. Authentication uses three custom headers on every request: `x-api-user` (your User ID), `x-api-key` (your API token), and `x-client` (your tool identifier in `UserID-AppName` format). Rate limit is **30 requests per 60 seconds per user**. All responses are JSON wrapped in `{"success": true, "data": ...}`. Task types are `habit`, `daily`, `todo`, and `reward`.

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
            f"{BASE_URL}/tasks/user",
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://habitica.com/api/v3
```

```python
import os

USER_ID = os.environ["HABITICA_USER_ID"]
API_TOKEN = os.environ["HABITICA_API_TOKEN"]
BASE_URL = "https://habitica.com/api/v3"
HEADERS = {
    "x-api-user": USER_ID,
    "x-api-key": API_TOKEN,
    "x-client": f"{USER_ID}-MyHabiticaApp",
    "Content-Type": "application/json",
}
```

## Authentication

Habitica uses **custom headers** for authentication on every request:

| Header | Value | Required |
|---|---|---|
| `x-api-user` | Your Habitica User ID | Yes |
| `x-api-key` | Your Habitica API Token | Yes |
| `x-client` | `UserID-AppName` (identifies your tool) | Yes |

Find your User ID and API Token at: Settings > Site Data (API) in the Habitica web app.

## Rate Limiting

| Limit | Value |
|---|---|
| Requests per user | 30 per 60 seconds |

Response headers indicate quota status:

| Header | Meaning |
|---|---|
| `X-RateLimit-Limit` | Total requests allowed (always 30) |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Timestamp when the window resets |

When exceeded, the API returns HTTP `429 Too Many Requests`.

```python
import asyncio

async def habitica_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    params: dict = None,
    json_data: dict = None,
    max_retries: int = 3,
) -> dict:
    for attempt in range(max_retries):
        resp = await client.request(
            method,
            f"{BASE_URL}{path}",
            headers=HEADERS,
            params=params,
            json=json_data,
        )
        if resp.status_code == 429:
            reset = resp.headers.get("X-RateLimit-Reset")
            if reset:
                import datetime
                reset_time = datetime.datetime.fromisoformat(reset.replace("Z", "+00:00"))
                wait = max((reset_time - datetime.datetime.now(datetime.timezone.utc)).total_seconds(), 1)
            else:
                wait = min(2 ** attempt, 60)
            await asyncio.sleep(wait)
            continue
        resp.raise_for_status()
        data = resp.json()
        if not data.get("success"):
            raise Exception(f"Habitica error: {data.get('message', 'Unknown')}")
        return data["data"]
    raise Exception("Max retries exceeded due to rate limiting")
```

## Methods

### Get User Data

```python
async def get_user(client: httpx.AsyncClient) -> dict:
    return await habitica_request(client, "GET", "/user")

# Returns extensive user object including:
# - stats (hp, mp, exp, gp, lvl, class)
# - preferences, items, achievements
# - tasksOrder (lists of task IDs by type)

# Usage
user = await get_user(client)
stats = user["stats"]
print(f"Level {stats['lvl']} {stats['class']} -- HP: {stats['hp']}/{stats['maxHealth']}")
print(f"Gold: {stats['gp']:.0f}, Gems: {user.get('balance', 0) * 4:.0f}")
```

### Tasks

#### List All Tasks

**Parameters:**
- `type` (str) -- Filter by type: `habits`, `dailys`, `todos`, `rewards`, `completedTodos`

```python
async def list_tasks(client: httpx.AsyncClient, task_type: str = None) -> list:
    params = {}
    if task_type:
        params["type"] = task_type  # habits, dailys, todos, rewards, completedTodos
    return await habitica_request(client, "GET", "/tasks/user", params=params)

# Usage
todos = await list_tasks(client, "todos")
for t in todos:
    print(f"[{'x' if t['completed'] else ' '}] {t['text']} (priority: {t['priority']})")
```

#### Create a Task

Task types: `habit`, `daily`, `todo`, `reward`

```python
async def create_task(
    client: httpx.AsyncClient,
    text: str,
    task_type: str = "todo",
    notes: str = "",
    priority: float = 1,
    tags: list[str] = None,
    checklist: list[dict] = None,
    **kwargs,
) -> dict:
    payload = {
        "text": text,
        "type": task_type,
        "notes": notes,
        "priority": priority,  # 0.1=trivial, 1=easy, 1.5=medium, 2=hard
    }
    if tags:
        payload["tags"] = tags
    if checklist:
        payload["checklist"] = checklist  # [{"text": "Step 1"}, {"text": "Step 2"}]
    payload.update(kwargs)
    return await habitica_request(client, "POST", "/tasks/user", json_data=payload)

# Usage -- create a todo with checklist
task = await create_task(
    client,
    text="Pack lunch for school",
    task_type="todo",
    priority=1.5,
    notes="Remember allergen-free snacks!",
    checklist=[
        {"text": "Main dish"},
        {"text": "Fruit"},
        {"text": "Water bottle"},
        {"text": "Allergen-free snack"},
    ],
)
```

#### Create a Habit

```python
async def create_habit(
    client: httpx.AsyncClient,
    text: str,
    up: bool = True,
    down: bool = True,
    notes: str = "",
    priority: float = 1,
) -> dict:
    return await create_task(
        client, text, task_type="habit",
        up=up, down=down, notes=notes, priority=priority,
    )

# Usage -- habit that can only be scored up (good habit tracking)
habit = await create_habit(client, "Drank water", up=True, down=False)
```

#### Create a Daily

```python
async def create_daily(
    client: httpx.AsyncClient,
    text: str,
    frequency: str = "weekly",
    repeat: dict = None,
    every_x: int = 1,
    start_date: str = None,
    notes: str = "",
    priority: float = 1,
) -> dict:
    payload = {
        "frequency": frequency,  # daily, weekly, monthly, yearly
        "everyX": every_x,
    }
    if repeat:
        payload["repeat"] = repeat  # {"m": True, "t": True, "w": True, ...}
    if start_date:
        payload["startDate"] = start_date  # ISO date string
    return await create_task(
        client, text, task_type="daily",
        notes=notes, priority=priority, **payload,
    )

# Usage -- daily that repeats on weekdays
daily = await create_daily(
    client, "Morning routine checklist",
    frequency="weekly",
    repeat={"m": True, "t": True, "w": True, "th": True, "f": True, "s": False, "su": False},
    notes="Brush teeth, get dressed, pack bag",
)
```

#### Get / Update / Delete a Task

```python
async def get_task(client: httpx.AsyncClient, task_id: str) -> dict:
    return await habitica_request(client, "GET", f"/tasks/{task_id}")

async def update_task(client: httpx.AsyncClient, task_id: str, **kwargs) -> dict:
    return await habitica_request(client, "PUT", f"/tasks/{task_id}", json_data=kwargs)

async def delete_task(client: httpx.AsyncClient, task_id: str) -> None:
    await habitica_request(client, "DELETE", f"/tasks/{task_id}")
```

#### Score a Task (Complete / +/-)

Scoring a task awards XP, gold, and affects health. This is the core gamification mechanic.

```python
async def score_task(
    client: httpx.AsyncClient,
    task_id: str,
    direction: str = "up",
) -> dict:
    return await habitica_request(client, "POST", f"/tasks/{task_id}/score/{direction}")
    # direction: "up" (positive/complete) or "down" (negative/undo)
    # Returns: {"hp": 50, "mp": 25, "exp": 100, "gp": 10.5, "lvl": 5, ...}

# Usage -- complete a todo
result = await score_task(client, task["_id"], "up")
print(f"Earned {result.get('gp', 0):.1f} gold, {result.get('exp', 0)} XP!")
```

### Tags

```python
async def list_tags(client: httpx.AsyncClient) -> list:
    return await habitica_request(client, "GET", "/tags")

async def create_tag(client: httpx.AsyncClient, name: str) -> dict:
    return await habitica_request(client, "POST", "/tags", json_data={"name": name})

async def delete_tag(client: httpx.AsyncClient, tag_id: str) -> None:
    await habitica_request(client, "DELETE", f"/tags/{tag_id}")
```

### Challenges

```python
async def list_user_challenges(client: httpx.AsyncClient) -> list:
    return await habitica_request(client, "GET", "/challenges/user")

async def join_challenge(client: httpx.AsyncClient, challenge_id: str) -> dict:
    return await habitica_request(client, "POST", f"/challenges/{challenge_id}/join")
```

### Cron (Trigger Daily Reset)

```python
async def run_cron(client: httpx.AsyncClient) -> None:
    await habitica_request(client, "POST", "/cron")
    # Processes dailies, applies damage for missed dailies, resets daily counters
```

## Error Handling

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- invalid parameters |
| 401 | Unauthorized -- invalid or missing auth headers |
| 404 | Not Found -- task or resource does not exist |
| 429 | Too Many Requests -- rate limit exceeded (30/min) |
| 500 | Internal Server Error |

All responses have the shape `{"success": bool, "data": ..., "message": str}`.

```python
class HabiticaError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"[{status_code}] {message}")

async def safe_habitica_request(client: httpx.AsyncClient, method: str, path: str, **kwargs) -> dict:
    try:
        return await habitica_request(client, method, path, **kwargs)
    except httpx.HTTPStatusError as e:
        body = e.response.json() if e.response.content else {}
        raise HabiticaError(
            e.response.status_code,
            body.get("message", "Unknown error"),
        ) from e
```

## Common Pitfalls

1. **Rate limit is strict: 30 requests per 60 seconds.** This is per-user, not per-app. If the user has multiple tools, they share this quota. Batch operations where possible.

2. **`x-client` header is mandatory.** All API calls must include an `x-client` header with the format `UserID-AppName`. Omitting it may result in requests being blocked.

3. **Priority values are not intuitive.** Priority is a float: `0.1` = trivial, `1` = easy, `1.5` = medium, `2` = hard. This does not match the 1-4 scale you might expect.

4. **Task type plural for list, singular for create.** List endpoint uses plural (`?type=dailys`), but the `type` field in creation payload uses singular (`"type": "daily"`). Note the irregular plural `dailys` (not `dailies`).

5. **Scoring a completed todo again has no effect.** Scoring `"up"` on a todo that is already complete does nothing. Score `"down"` first to uncomplete, then `"up"` again if needed.

6. **Cron must be triggered manually via API.** Unlike the web app, API clients must call `/cron` to process daily resets. Without this, missed dailies do not apply damage and streaks do not update.

7. **The `repeat` object uses short day keys.** For weekly dailies, the repeat object uses: `m`, `t`, `w`, `th`, `f`, `s`, `su` (not full day names).

8. **Habitica uses its own ID format.** Task IDs are UUIDs (e.g., `"550e8400-e29b-41d4-a716-446655440000"`). The user's `tasksOrder` object lists IDs by type for ordering.

9. **Gold and gems are separate currencies.** Gold (`gp`) is earned from tasks. Gems are stored as `balance * 4` (balance is in USD equivalent). Do not confuse them.

10. **Tags are UUIDs, not names.** When creating tasks with tags, use tag IDs (UUIDs), not tag names. List tags first to get the mapping.
