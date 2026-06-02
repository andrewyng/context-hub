---
name: rest-api
description: "Pushover API for sending push notifications to phones, tablets, and desktops for alerts, reminders, and accessibility notifications"
metadata:
  languages: "python"
  versions: "1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "pushover,notifications,push,alerts,personal,reminders,api"
---

# Pushover REST API Coding Guidelines (Python)

You are a Pushover API coding expert. Help me with writing code using httpx async to send push notifications via the Pushover REST API for personal alerts, reminders, and accessibility-focused notifications.

You can find the official documentation here: https://pushover.net/api

## Golden Rule: Use httpx Async for All API Calls

Always use `httpx` with async/await for all Pushover REST API interactions.

- **Library Name:** httpx
- **Python Package:** `httpx`
- **Installation:** `pip install httpx`

**Correct Usage:**

- **Correct:** `import httpx`
- **Correct:** `async with httpx.AsyncClient() as client:`
- **Correct:** `response = await client.post(url, data=payload)`
- **Incorrect:** Using `requests` or the unofficial `python-pushover` package

## Base URL and Authentication

Pushover uses simple token-based authentication with no OAuth required.

- **Base URL:** `https://api.pushover.net/1/`
- **App Token:** 30-character alphanumeric string (register at https://pushover.net/apps/build)
- **User Key:** 30-character alphanumeric string (found on dashboard after login)
- **Content-Type:** `application/x-www-form-urlencoded` (default) or `multipart/form-data` (for attachments)

### Environment Variable Configuration

Never hardcode tokens. Always use environment variables:

```bash
export PUSHOVER_TOKEN="your_app_api_token_here"
export PUSHOVER_USER="your_user_key_here"
```

```python
import os
import httpx

PUSHOVER_URL = "https://api.pushover.net/1"
PUSHOVER_TOKEN = os.environ["PUSHOVER_TOKEN"]
PUSHOVER_USER = os.environ["PUSHOVER_USER"]
```

## Prerequisites

Before using the Pushover API:

- Create a Pushover account at https://pushover.net
- Install the Pushover app on your device(s) (iOS, Android, or Desktop)
- Register an application at https://pushover.net/apps/build to get an API token
- Note your User Key from the Pushover dashboard
- Free trial: 30 days, then one-time $5 purchase per platform

## Sending Messages

### Basic Notification

```python
import httpx
import os

PUSHOVER_URL = "https://api.pushover.net/1"
PUSHOVER_TOKEN = os.environ["PUSHOVER_TOKEN"]
PUSHOVER_USER = os.environ["PUSHOVER_USER"]


async def send_notification(message: str, title: str = None):
    payload = {
        "token": PUSHOVER_TOKEN,
        "user": PUSHOVER_USER,
        "message": message,
    }
    if title:
        payload["title"] = title

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/messages.json", data=payload
        )
        response.raise_for_status()
        result = response.json()
        print(f"Sent. Request ID: {result['request']}")
        return result
```

### Notification with All Options

```python
async def send_rich_notification(
    message: str,
    title: str = None,
    device: str = None,
    url: str = None,
    url_title: str = None,
    priority: int = 0,
    sound: str = None,
    html: bool = False,
    timestamp: int = None,
    ttl: int = None,
):
    """Send a notification with full options.

    Args:
        message: Message body (max 1024 chars, supports HTML if html=True)
        title: Message title (max 250 chars, defaults to app name)
        device: Target specific device name
        url: Supplementary URL (max 512 chars)
        url_title: URL title (max 100 chars)
        priority: -2 (lowest) to 2 (emergency)
        sound: Notification sound name
        html: Enable HTML formatting in message
        timestamp: Unix timestamp to display instead of send time
        ttl: Time-to-live in seconds (message deleted after expiry)
    """
    payload = {
        "token": PUSHOVER_TOKEN,
        "user": PUSHOVER_USER,
        "message": message,
    }
    if title:
        payload["title"] = title
    if device:
        payload["device"] = device
    if url:
        payload["url"] = url
    if url_title:
        payload["url_title"] = url_title
    if priority != 0:
        payload["priority"] = priority
    if sound:
        payload["sound"] = sound
    if html:
        payload["html"] = 1
    if timestamp:
        payload["timestamp"] = timestamp
    if ttl:
        payload["ttl"] = ttl

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/messages.json", data=payload
        )
        response.raise_for_status()
        return response.json()
```

### Priority Levels

```python
# Priority -2: No notification, no sound, no vibration (lowest)
await send_rich_notification("Background sync complete", priority=-2)

# Priority -1: Quiet, no sound or vibration
await send_rich_notification("Daily report ready", priority=-1)

# Priority 0: Normal (default)
await send_rich_notification("New message received")

# Priority 1: High priority, bypasses quiet hours
await send_rich_notification("Meeting starts in 5 minutes", priority=1)

# Priority 2: Emergency, requires acknowledgment (see below)
```

### Emergency Priority Notifications

Emergency priority (2) requires `retry` and `expire` parameters. The notification repeats until acknowledged:

```python
async def send_emergency(
    message: str,
    title: str = None,
    retry: int = 60,
    expire: int = 3600,
    callback: str = None,
    tags: str = None,
):
    """Send an emergency notification that repeats until acknowledged.

    Args:
        message: Message body
        title: Message title
        retry: Seconds between retries (min 30)
        expire: Seconds before stopping retries (max 10800 = 3 hours)
        callback: URL to POST when user acknowledges
        tags: Comma-separated tags for cancellation
    """
    payload = {
        "token": PUSHOVER_TOKEN,
        "user": PUSHOVER_USER,
        "message": message,
        "priority": 2,
        "retry": max(retry, 30),
        "expire": min(expire, 10800),
    }
    if title:
        payload["title"] = title
    if callback:
        payload["callback"] = callback
    if tags:
        payload["tags"] = tags

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/messages.json", data=payload
        )
        response.raise_for_status()
        result = response.json()
        print(f"Emergency receipt: {result.get('receipt')}")
        return result


# Example: Medication reminder that repeats every 60s for 1 hour
# await send_emergency("Time to take your medication!", title="Medication Reminder", retry=60, expire=3600)
```

### Cancel Emergency by Tag

```python
async def cancel_emergency_by_tag(tag: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/receipts/cancel_by_tag/{tag}.json",
            data={"token": PUSHOVER_TOKEN},
        )
        response.raise_for_status()
        return response.json()
```

### HTML Formatted Messages

```python
async def send_html_notification(message_html: str, title: str = None):
    """Send HTML-formatted notification.

    Supported tags: <b>, <i>, <u>, <font color="#hex">, <a href="url">
    """
    payload = {
        "token": PUSHOVER_TOKEN,
        "user": PUSHOVER_USER,
        "message": message_html,
        "html": 1,
    }
    if title:
        payload["title"] = title

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/messages.json", data=payload
        )
        response.raise_for_status()
        return response.json()


# Example: Accessible formatted alert
# await send_html_notification(
#     '<b>Door unlocked</b> at <font color="#ff0000">10:32 PM</font>',
#     title="Security Alert"
# )
```

### Send with Image Attachment

```python
async def send_with_image(message: str, image_path: str, title: str = None):
    """Send notification with image attachment (max 5MB)."""
    with open(image_path, "rb") as f:
        files = {"attachment": (image_path.split("/")[-1], f, "image/jpeg")}
        data = {
            "token": PUSHOVER_TOKEN,
            "user": PUSHOVER_USER,
            "message": message,
        }
        if title:
            data["title"] = title

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PUSHOVER_URL}/messages.json",
                data=data,
                files=files,
            )
            response.raise_for_status()
            return response.json()
```

## Validation and Limits

### Validate User/Group Key

```python
async def validate_user(user_key: str, device: str = None):
    payload = {
        "token": PUSHOVER_TOKEN,
        "user": user_key,
    }
    if device:
        payload["device"] = device

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PUSHOVER_URL}/users/validate.json", data=payload
        )
        result = response.json()
        if result["status"] == 1:
            print(f"Valid user. Devices: {result.get('devices', [])}")
        else:
            print(f"Invalid: {result.get('errors', [])}")
        return result
```

### Check Application Limits

```python
async def check_limits():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PUSHOVER_URL}/apps/limits.json",
            params={"token": PUSHOVER_TOKEN},
        )
        response.raise_for_status()
        result = response.json()
        print(f"Limit: {result['limit']}")
        print(f"Remaining: {result['remaining']}")
        print(f"Resets at: {result['reset']}")
        return result
```

### Get Available Sounds

```python
async def get_sounds():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PUSHOVER_URL}/sounds.json",
            params={"token": PUSHOVER_TOKEN},
        )
        response.raise_for_status()
        sounds = response.json()["sounds"]
        for name, description in sounds.items():
            print(f"{name}: {description}")
        return sounds
```

## Error Handling

```python
async def safe_send(message: str, **kwargs):
    try:
        payload = {
            "token": PUSHOVER_TOKEN,
            "user": PUSHOVER_USER,
            "message": message,
            **kwargs,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PUSHOVER_URL}/messages.json", data=payload
            )
            result = response.json()

            if result["status"] == 1:
                return result

            # Handle errors
            errors = result.get("errors", [])
            print(f"Pushover errors: {errors}")

            # Check rate limit headers
            remaining = response.headers.get("X-Limit-App-Remaining")
            if remaining and int(remaining) == 0:
                reset = response.headers.get("X-Limit-App-Reset")
                print(f"Rate limit reached. Resets at timestamp: {reset}")

            return result

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            print("Rate limit exceeded")
        else:
            print(f"HTTP error: {e.response.status_code}")
        raise
    except httpx.ConnectError:
        print("Cannot connect to Pushover API")
        raise
```

### Response Format

All responses include:

| Field | Type | Description |
|-------|------|-------------|
| `status` | int | 1 = success, 0 = failure |
| `request` | string | Unique request identifier |
| `errors` | array | Error messages (when status = 0) |
| `receipt` | string | Receipt ID (emergency priority only) |

### Rate Limits

| Limit | Value |
|-------|-------|
| Monthly messages (free) | 10,000 per app |
| Monthly messages (team) | 25,000 per app |
| Max concurrent connections | 2 |
| Message body | 1,024 UTF-8 characters |
| Title | 250 characters |
| URL | 512 characters |
| URL title | 100 characters |
| Attachment size | 5 MB |
| Emergency retry minimum | 30 seconds |
| Emergency expire maximum | 10,800 seconds (3 hours) |

## Accessibility Use Cases

### Medication Reminder System

```python
async def medication_reminder(medication_name: str, dosage: str):
    """Send an emergency-priority medication reminder."""
    await send_emergency(
        message=f"Take {dosage} of {medication_name} now.",
        title="Medication Reminder",
        retry=300,
        expire=3600,
        tags=f"med-{medication_name.lower().replace(' ', '-')}",
    )


# Cancel a specific medication reminder
# await cancel_emergency_by_tag("med-aspirin")
```

### Safety Alert

```python
async def safety_alert(sensor_name: str, status: str):
    """Send high-priority safety alert from smart home sensor."""
    await send_rich_notification(
        message=f"{sensor_name} reports: {status}",
        title="Home Safety Alert",
        priority=1,
        sound="siren",
    )
```

## Useful Links

- **Official API Documentation:** https://pushover.net/api
- **Register Application:** https://pushover.net/apps/build
- **FAQ:** https://pushover.net/faq
- **Groups API:** https://pushover.net/api/groups
- **Glances API:** https://pushover.net/api/glances
- **Receipt/Callback API:** https://pushover.net/api/receipts

## Notes

- Pushover is a one-time $5 purchase per platform (iOS, Android, Desktop) after 30-day trial
- No ongoing subscription required
- Messages are delivered via Apple Push Notification Service (iOS), Firebase (Android), or WebSocket (Desktop)
- Group keys allow sending to multiple users with a single API call
- The Glances API can update smartwatch complications and widget data
- Maximum 2 concurrent HTTP connections per IP
- Retry failed requests with minimum 5-second delay
- IP blocking may occur for excessive 4xx error responses
