---
name: rest-api
description: "LINE Messaging API - Chat Bot Platform for Japan/Asia"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "line,messaging,japan,asia,bot,chat,api"
---

# LINE Messaging API - Python Reference (httpx)

## Golden Rule

Authentication uses a **channel access token** in the `Authorization: Bearer` header. Never embed your channel access token in client-side code or commit it to version control. Create your channel through the LINE Official Account Manager (direct creation from LINE Developers Console is no longer supported as of September 2024).

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
            f"{BASE_URL}/v2/bot/info",
            headers=HEADERS,
        )
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.line.me
```

For large data transfers (content retrieval, file uploads, rich menu images):

```
https://api-data.line.me
```

```python
import os

CHANNEL_ACCESS_TOKEN = os.environ["LINE_CHANNEL_ACCESS_TOKEN"]
BASE_URL = "https://api.line.me"
DATA_URL = "https://api-data.line.me"
HEADERS = {"Authorization": f"Bearer {CHANNEL_ACCESS_TOKEN}"}
```

## Authentication

LINE Messaging API uses **Bearer token** authentication via the `Authorization` header on every request:

```
Authorization: Bearer {channel access token}
```

Channel access tokens come in two types:
- **Short-lived** (expires in 30 days) -- issued via the LINE Developers Console or the token endpoint
- **Stateless channel access tokens** (v2.1) -- issued programmatically via JWT assertion

```python
async def issue_stateless_token(client: httpx.AsyncClient, client_id: str, client_secret: str) -> str:
    """Issue a short-lived channel access token v2.1."""
    resp = await client.post(
        "https://api.line.me/oauth2/v3/token",
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]
```

## Rate Limiting

Rate limits are **per-channel** and vary by endpoint:

| Endpoint Category | Limit |
|---|---|
| Most API endpoints | 2,000 requests/second |
| Multicast, membership, coupons | 200 requests/second |
| Webhook configuration | 1,000 requests/minute |
| Rich menu operations | 100 requests/hour |
| Narrowcast, broadcast, statistics | 60 requests/hour |
| Audience management | 60 requests/minute |

When you exceed limits, the API returns HTTP `429 Too Many Requests`.

```python
import asyncio

async def request_with_retry(client: httpx.AsyncClient, method: str, url: str, max_retries: int = 3, **kwargs):
    for attempt in range(max_retries):
        resp = await client.request(method, url, headers=HEADERS, **kwargs)
        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            await asyncio.sleep(wait)
            continue
        return resp
    raise Exception("Max retries exceeded due to rate limiting")
```

## Methods

### Reply Message

Reply to a user event (message, follow, postback, etc.) using the `replyToken` from the webhook event. The reply token expires after 1 minute.

**Required parameters:**
- `replyToken` (str) -- Token from the webhook event
- `messages` (list[dict]) -- Up to 5 message objects

```python
async def reply_message(client: httpx.AsyncClient, reply_token: str, messages: list[dict]) -> dict:
    resp = await client.post(
        f"{BASE_URL}/v2/bot/message/reply",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"replyToken": reply_token, "messages": messages},
    )
    resp.raise_for_status()
    return resp.json()

# Usage
await reply_message(client, reply_token, [
    {"type": "text", "text": "Hello! How can I help you?"}
])
```

### Push Message

Send a message to a user, group, or room at any time (not in response to an event).

**Required parameters:**
- `to` (str) -- User ID, group ID, or room ID
- `messages` (list[dict]) -- Up to 5 message objects

```python
async def push_message(client: httpx.AsyncClient, to: str, messages: list[dict]) -> dict:
    resp = await client.post(
        f"{BASE_URL}/v2/bot/message/push",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"to": to, "messages": messages},
    )
    resp.raise_for_status()
    return resp.json()

# Usage -- send a text message to a specific user
await push_message(client, user_id, [
    {"type": "text", "text": "Your order has been shipped!"}
])
```

### Multicast Message

Send a message to multiple users at once (up to 500 user IDs per request).

```python
async def multicast_message(client: httpx.AsyncClient, to: list[str], messages: list[dict]) -> dict:
    resp = await client.post(
        f"{BASE_URL}/v2/bot/message/multicast",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"to": to, "messages": messages},
    )
    resp.raise_for_status()
    return resp.json()
```

### Broadcast Message

Send a message to all users who have added the bot as a friend.

```python
async def broadcast_message(client: httpx.AsyncClient, messages: list[dict]) -> dict:
    resp = await client.post(
        f"{BASE_URL}/v2/bot/message/broadcast",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"messages": messages},
    )
    resp.raise_for_status()
    return resp.json()
```

### Get User Profile

Retrieve a user's display name, profile picture, and status message.

```python
async def get_profile(client: httpx.AsyncClient, user_id: str) -> dict:
    resp = await client.get(
        f"{BASE_URL}/v2/bot/profile/{user_id}",
        headers=HEADERS,
    )
    resp.raise_for_status()
    return resp.json()
    # Returns: {"displayName": "Taro", "userId": "U...", "pictureUrl": "https://...", "statusMessage": "..."}
```

### Get Message Content

Download image, video, audio, or file content sent by a user.

```python
async def get_content(client: httpx.AsyncClient, message_id: str) -> bytes:
    resp = await client.get(
        f"{DATA_URL}/v2/bot/message/{message_id}/content",
        headers=HEADERS,
    )
    resp.raise_for_status()
    return resp.content
```

### Set Webhook URL

Configure the webhook endpoint that LINE sends events to.

```python
async def set_webhook(client: httpx.AsyncClient, endpoint: str) -> dict:
    resp = await client.put(
        f"{BASE_URL}/v2/bot/channel/webhook/endpoint",
        headers={**HEADERS, "Content-Type": "application/json"},
        json={"endpoint": endpoint},
    )
    resp.raise_for_status()
    return resp.json()
```

## Error Handling

Successful responses return HTTP 200 with a JSON body (often `{}`).

On failure, the API returns an error JSON:

```json
{
    "message": "The request body has 1 error(s)",
    "details": [
        {
            "message": "May not be empty",
            "property": "messages[0].text"
        }
    ]
}
```

**Common status codes:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request -- invalid parameters or message format |
| 401 | Unauthorized -- missing or invalid channel access token |
| 403 | Forbidden -- bot lacks permission for this action |
| 404 | Not Found -- resource does not exist |
| 429 | Too Many Requests -- rate limit exceeded |
| 500 | Internal Server Error |

**Robust error handling pattern:**

```python
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

class LineAPIError(Exception):
    def __init__(self, status_code: int, message: str, details: list = None):
        self.status_code = status_code
        self.message = message
        self.details = details or []
        super().__init__(f"[{status_code}] {message}")

async def line_request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    max_retries: int = 3,
    **kwargs,
) -> dict:
    url = f"{BASE_URL}{path}"
    for attempt in range(max_retries):
        try:
            resp = await client.request(method, url, headers=HEADERS, **kwargs)
        except httpx.RequestError as e:
            logger.warning(f"Network error on {path} (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if resp.status_code == 200:
            return resp.json() if resp.content else {}

        if resp.status_code == 429:
            wait = min(2 ** attempt, 30)
            logger.warning(f"Rate limited on {path}, retrying in {wait}s")
            await asyncio.sleep(wait)
            continue

        data = resp.json() if resp.content else {}
        raise LineAPIError(
            resp.status_code,
            data.get("message", "Unknown error"),
            data.get("details", []),
        )

    raise LineAPIError(429, f"Max retries exceeded for {path}")
```

## Common Pitfalls

1. **Reply tokens expire in 1 minute.** You must call the reply endpoint promptly after receiving a webhook event. If the token expires, use `push` instead (which counts toward your monthly message quota).

2. **Webhook signature verification is essential.** Always verify the `X-Line-Signature` header using HMAC-SHA256 with your channel secret. Skipping this allows anyone to forge webhook events to your server.

3. **Push messages count toward monthly quotas.** The free plan includes a limited number of push messages per month. Reply messages are free. Design your bot to use reply messages whenever possible.

4. **User IDs are channel-scoped.** A user's ID is different for each channel (provider). You cannot use a user ID obtained from one channel with another channel's access token.

5. **Message types are strict.** Each message object must include `type` (text, image, video, audio, file, location, sticker, template, flex, imagemap). Sending an invalid type returns a 400 error with no useful description.

6. **Rich menu images have exact size requirements.** Rich menu images must be 2500x1686 or 2500x843 pixels, JPEG or PNG, and under 1 MB. Use the `api-data.line.me` domain for uploading.

7. **Flex Messages JSON is deeply nested.** Flex Message containers have strict schema validation. Test your Flex Message JSON in the LINE Bot Designer or Flex Message Simulator before deploying.

8. **Narrowcast requires audience.** Narrowcast messages target a specific audience segment. You must create an audience first using the audience management endpoints.

9. **Webhook events are not retried.** If your server returns a non-200 status for a webhook delivery, LINE does not retry. Implement a fallback polling mechanism if reliability is critical.

10. **Content download URLs are temporary.** Message content (images, videos, files) must be downloaded soon after receipt. The content may become unavailable after some time.
