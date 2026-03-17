---
name: rest-api
description: "ntfy open-source push notification API for sending alerts, reminders, and notifications to phones and desktops with no account required"
metadata:
  languages: "python"
  versions: "2.x"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "ntfy,notifications,push,open-source,alerts,reminders,free,api"
---

# ntfy REST API Coding Guidelines (Python)

You are an ntfy API coding expert. Help me with writing code using httpx async to send and subscribe to push notifications via the ntfy REST API for personal alerts, reminders, and accessibility-focused notifications.

You can find the official documentation here: https://docs.ntfy.sh/

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx` with async/await for all ntfy REST API interactions.

- **Library Name:** httpx
- **Python Package:** `httpx`

## Installation

```bash
pip install httpx
```

## Base URL and Authentication

ntfy requires no account for the public server. Authentication is optional for self-hosted instances.

- **Public Server:** `https://ntfy.sh`
- **Self-Hosted:** `https://your-ntfy-server.example.com`
- **No signup required** for the public server
- **Topics act as channels** -- pick an unpredictable topic name as your "password"

### Authentication (Optional, for self-hosted or protected topics)

```python
import httpx
import os

NTFY_URL = os.environ.get("NTFY_URL", "https://ntfy.sh")
NTFY_TOPIC = os.environ["NTFY_TOPIC"]

# Option 1: Bearer token
NTFY_TOKEN = os.environ.get("NTFY_TOKEN")
HEADERS_TOKEN = {"Authorization": f"Bearer {NTFY_TOKEN}"} if NTFY_TOKEN else {}

# Option 2: Basic auth
from base64 import b64encode
NTFY_USER = os.environ.get("NTFY_USER")
NTFY_PASS = os.environ.get("NTFY_PASS")
if NTFY_USER and NTFY_PASS:
    credentials = b64encode(f"{NTFY_USER}:{NTFY_PASS}".encode()).decode()
    HEADERS_BASIC = {"Authorization": f"Basic {credentials}"}
else:
    HEADERS_BASIC = {}
```

## Rate Limiting

| Resource | Limit |
|----------|-------|
| Message body | 4,096 bytes (excess becomes attachment) |
| Attachment size | 15 MB per file |
| Attachment expiry | 3 hours |
| Action buttons | 3 per notification |
| Scheduled delivery | 10 seconds to 3 days in the future |
| Cache duration (default) | 12 hours |
| Default rate limit burst | 60 requests |

## Methods

### Simple Text Message

```python
async def send_notification(message: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{NTFY_URL}/{NTFY_TOPIC}", content=message)
        response.raise_for_status()
        return response.json()
```

### Notification with Title, Priority, and Tags

All options can be set via HTTP headers:

```python
async def send_rich_notification(
    message: str, title: str = None, priority: int = None,
    tags: list[str] = None, click_url: str = None,
    attach_url: str = None, delay: str = None, markdown: bool = False,
):
    """Send a notification with full options via headers.

    Args:
        message: Message body (max 4096 bytes)
        title: Notification title
        priority: 1=min, 2=low, 3=default, 4=high, 5=urgent
        tags: List of tags (can include emoji shortcodes like "warning")
        click_url: URL to open when notification is tapped
        attach_url: URL of file to attach
        delay: Schedule delivery ("30m", "2h", "tomorrow 9am", Unix timestamp)
        markdown: Enable markdown formatting
    """
    headers = {}
    if title: headers["X-Title"] = title
    if priority: headers["X-Priority"] = str(priority)
    if tags: headers["X-Tags"] = ",".join(tags)
    if click_url: headers["X-Click"] = click_url
    if attach_url: headers["X-Attach"] = attach_url
    if delay: headers["X-Delay"] = delay
    if markdown: headers["Content-Type"] = "text/markdown"

    async with httpx.AsyncClient() as client:
        response = await client.post(f"{NTFY_URL}/{NTFY_TOPIC}", content=message, headers=headers)
        response.raise_for_status()
        return response.json()
```

### JSON Publishing (Action Buttons)

For notifications with interactive action buttons, use the JSON endpoint:

```python
async def send_json_notification(
    message: str, title: str = None, priority: int = None,
    tags: list[str] = None, actions: list[dict] = None,
    click: str = None, delay: str = None, markdown: bool = False,
):
    payload = {"topic": NTFY_TOPIC, "message": message}
    if title: payload["title"] = title
    if priority: payload["priority"] = priority
    if tags: payload["tags"] = tags
    if actions: payload["actions"] = actions  # max 3 action buttons
    if click: payload["click"] = click
    if delay: payload["delay"] = delay
    if markdown: payload["markdown"] = True

    async with httpx.AsyncClient() as client:
        response = await client.post(f"{NTFY_URL}/", json=payload)
        response.raise_for_status()
        return response.json()
```

### Scheduled / Delayed Delivery

```python
# Delay by duration
await send_rich_notification("Time to stretch!", title="Break Reminder", delay="30m")
# Delay until specific time
await send_rich_notification("Take evening medication", title="Medication", delay="8:30pm")
# Delay until date and time
await send_rich_notification("Appointment tomorrow", delay="tomorrow, 9am")
```

### Cancel a Scheduled Message

```python
async def cancel_scheduled(message_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{NTFY_URL}/{NTFY_TOPIC}/{message_id}")
        response.raise_for_status()
        return response.json()
```

### Upload File Attachment

```python
async def send_with_file(filepath: str, message: str = None, title: str = None):
    """Upload a local file as attachment (max 15MB)."""
    filename = filepath.split("/")[-1]
    headers = {"X-Filename": filename}
    if message: headers["X-Message"] = message
    if title: headers["X-Title"] = title
    with open(filepath, "rb") as f:
        async with httpx.AsyncClient() as client:
            response = await client.put(f"{NTFY_URL}/{NTFY_TOPIC}", content=f.read(), headers=headers)
            response.raise_for_status()
            return response.json()
```

## Subscribing / Polling

### Poll for Cached Messages

```python
import json

async def poll_messages(since: str = "10m"):
    """Retrieve cached messages. since: duration ("10m", "1h"), message ID, or "all"."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{NTFY_URL}/{NTFY_TOPIC}/json", params={"poll": "1", "since": since},
        )
        response.raise_for_status()
        return [json.loads(line) for line in response.text.strip().split("\n")
                if line and json.loads(line).get("event") == "message"]
```

### Subscribe with Streaming (Long-lived connection)

```python
async def subscribe_stream(callback, since: str = "all"):
    """Subscribe to topic with streaming JSON response."""
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("GET", f"{NTFY_URL}/{NTFY_TOPIC}/json", params={"since": since}) as response:
            async for line in response.aiter_lines():
                if line.strip():
                    data = json.loads(line)
                    if data.get("event") == "message":
                        await callback(data)
```

### Server Health Check

```python
async def health_check():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{NTFY_URL}/v1/health")
        response.raise_for_status()
        return response.json()
```

## Error Handling

```python
async def safe_send(message: str, **kwargs):
    try:
        headers = {}
        for key, value in kwargs.items():
            headers[f"X-{key.replace('_', '-').title()}"] = str(value)
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{NTFY_URL}/{NTFY_TOPIC}", content=message, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        status_map = {401: "Authentication required", 403: "Access denied",
                      413: "Message or attachment too large", 429: "Rate limit exceeded"}
        print(status_map.get(e.response.status_code, f"HTTP error {e.response.status_code}: {e.response.text}"))
        raise
    except httpx.ConnectError:
        print(f"Cannot connect to ntfy server at {NTFY_URL}")
        raise
```

## Common Pitfalls

1. **Topic names are public** -- On the public ntfy.sh server, anyone who knows your topic name can read/write. Use long, random strings as topic names.
2. **Message size limit** -- Messages over 4,096 bytes are automatically converted to file attachments.
3. **Scheduled delivery window** -- Delays must be between 10 seconds and 3 days in the future.
4. **Priority levels** -- Priority 5 (urgent) bypasses Do Not Disturb on most devices. Use sparingly.
5. **Action button limit** -- Maximum 3 action buttons per notification. HTTP actions can include custom headers and body.
6. **Subscription formats** -- ntfy supports JSON stream, SSE, raw stream, and WebSocket. Use `/json` for structured data.
7. **Cache duration** -- Messages are cached for 12 hours by default. Use `since` parameter to fetch cached messages.
8. **Self-hosted auth** -- The public server needs no auth, but self-hosted instances can require bearer tokens or basic auth.

## Useful Links

- **Official Documentation:** https://docs.ntfy.sh/
- **Publishing API:** https://docs.ntfy.sh/publish/
- **Subscribe API:** https://docs.ntfy.sh/subscribe/api/
- **Self-Hosting:** https://docs.ntfy.sh/install/
- **Web App:** https://ntfy.sh/app
- **GitHub Repository:** https://github.com/binwiederhier/ntfy
