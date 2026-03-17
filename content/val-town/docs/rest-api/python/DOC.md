---
name: rest-api
description: "Val Town Serverless Functions, SQLite & Blob Storage API"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: community
  tags: "valtown,serverless,functions,sqlite,blob,email,api,integration"
---

# Val Town API

> **Golden Rule:** Val Town has a TypeScript SDK but no official Python SDK. Use `httpx` (async) or `requests` (sync) for direct REST API access. Val Town provides serverless functions, SQLite, blob storage, and email sending -- all via simple REST endpoints.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.val.town`

## Authentication

**Type:** Bearer Token

```python
import httpx

VALTOWN_TOKEN = "your-val-town-api-token"  # Create at val.town/settings/api
BASE_URL = "https://api.val.town"

headers = {"Authorization": f"Bearer {VALTOWN_TOKEN}"}
client = httpx.AsyncClient(headers=headers)
```

Tokens support configurable scopes: `val` (read/write), `user` (read/write), `blob` (read/write), `sqlite` (read/write), `email` (read/write). Default excludes `val:write` and `user:write` for safety.

## Rate Limiting

- Email sending: 100/minute
- Blob storage: Free = 10MB, Pro = 1GB
- Private vals: Free = 5, Pro = unlimited
- Max files per val: 1,000

## Methods

### `list_vals`

**Endpoint:** `GET /v2/vals`

List vals (serverless functions).

**Returns:** JSON with array of val objects

```python
response = await client.get(f"{BASE_URL}/v2/vals")
response.raise_for_status()
data = response.json()
vals = data.get("data", [])
```

### `create_val`

**Endpoint:** `POST /v2/vals`

Create a new serverless function.

| Parameter | Type | Default |
|---|---|---|
| `name` | `str` | **required** |
| `type` | `str` | `"script"` (also: `"http"`, `"email"`, `"cron"`) |

**Returns:** JSON with created val details

```python
payload = {
    "name": "myFunction",
    "type": "http"
}
response = await client.post(f"{BASE_URL}/v2/vals", json=payload)
response.raise_for_status()
val = response.json()
```

### `get_val`

**Endpoint:** `GET /v2/vals/{valId}`

Get val details.

```python
val_id = "abc123"
response = await client.get(f"{BASE_URL}/v2/vals/{val_id}")
response.raise_for_status()
val = response.json()
```

### `get_val_by_name`

**Endpoint:** `GET /v2/alias/vals/{username}/{valName}`

Look up a val by username and name.

```python
response = await client.get(f"{BASE_URL}/v2/alias/vals/myuser/myFunction")
response.raise_for_status()
val = response.json()
```

### `get_me`

**Endpoint:** `GET /v1/me`

Get the authenticated user's profile.

```python
response = await client.get(f"{BASE_URL}/v1/me")
response.raise_for_status()
user = response.json()
```

### `execute_sql`

**Endpoint:** `POST /v1/sqlite/execute`

Execute a SQL statement against your Val Town SQLite database.

| Parameter | Type | Default |
|---|---|---|
| `statement` | `str` | **required** |
| `args` | `list` or `dict` | `[]` |

**Returns:** JSON with `columns`, `columnTypes`, `rows`, `rowsAffected`, `lastInsertRowid`

```python
payload = {
    "statement": "SELECT * FROM users WHERE age > ?",
    "args": [21]
}
response = await client.post(f"{BASE_URL}/v1/sqlite/execute", json=payload)
response.raise_for_status()
data = response.json()
rows = data.get("rows", [])
columns = data.get("columns", [])
```

```python
# Create a table
payload = {
    "statement": "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, content TEXT, created_at TEXT)"
}
response = await client.post(f"{BASE_URL}/v1/sqlite/execute", json=payload)
response.raise_for_status()
```

### `send_email`

**Endpoint:** `POST /v1/email`

Send an email. Free tier can only email yourself; Pro can email anyone.

| Parameter | Type | Default |
|---|---|---|
| `to` | `str` | **required** |
| `subject` | `str` | **required** |
| `text` | `str` | `None` |
| `from` | `str` | `None` |
| `replyTo` | `str` | `None` |
| `cc` | `str` | `None` |
| `bcc` | `str` | `None` |

**Returns:** JSON confirmation

```python
payload = {
    "to": "user@example.com",
    "subject": "Hello from Val Town",
    "text": "This email was sent via the Val Town API."
}
response = await client.post(f"{BASE_URL}/v1/email", json=payload)
response.raise_for_status()
```

### `store_blob`

**Endpoint:** `POST /v1/blob/{key}`

Store a blob (binary data, JSON, text).

```python
key = "my-data"
data = {"results": [1, 2, 3]}
response = await client.post(
    f"{BASE_URL}/v1/blob/{key}",
    json=data
)
response.raise_for_status()
```

### `get_blob`

**Endpoint:** `GET /v1/blob/{key}`

Retrieve a stored blob.

```python
response = await client.get(f"{BASE_URL}/v1/blob/{key}")
response.raise_for_status()
data = response.json()  # or response.content for binary
```

### `list_blobs`

**Endpoint:** `GET /v1/blob`

List all blob keys.

```python
response = await client.get(f"{BASE_URL}/v1/blob")
response.raise_for_status()
keys = response.json()
```

### `delete_blob`

**Endpoint:** `DELETE /v1/blob/{key}`

Delete a stored blob.

```python
response = await client.delete(f"{BASE_URL}/v1/blob/{key}")
response.raise_for_status()
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/v1/sqlite/execute", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Authentication failed -- check your API token")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency")
    elif e.response.status_code == 403:
        print("Forbidden -- check token scopes")
    else:
        print(f"Val Town API error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Val Town has two API versions: use `/v2/` for vals, `/v1/` for SQLite, email, and blobs
- Token scopes matter -- default tokens exclude `val:write` and `user:write` for safety
- Free tier email sending is restricted to your own email address only
- Blob keys have a max length of 512 characters
- SQLite `args` can be a positional array `[1, "two"]` or named object `{"id": 1}`
- Email sending is rate-limited to 100/minute
- Free tier blob storage is capped at 10MB total
- Always call `response.raise_for_status()` to catch HTTP errors
- Set a reasonable timeout: `httpx.AsyncClient(timeout=30.0)`
