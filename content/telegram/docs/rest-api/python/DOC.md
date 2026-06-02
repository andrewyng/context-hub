---
name: rest-api
description: "Telegram Bot API - Messaging Platform for AI Bots"
metadata:
  languages: "python"
  versions: "0.1.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "telegram,bot,messaging,chat,webhook,api,integration"
---

# Telegram Bot API - Python Reference (httpx)

## Golden Rule

The bot token IS the authentication. It is embedded directly in the URL path, not sent as a header. Treat your bot token like a password -- never commit it to version control, never log full request URLs, and rotate it via @BotFather if compromised.

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
        resp = await client.get(f"{BASE_URL}/getMe")
        print(resp.json())

asyncio.run(main())
```

## Base URL

```
https://api.telegram.org/bot<token>/<method>
```

Replace `<token>` with your bot token (e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).

```python
import os

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
```

## Authentication

Telegram Bot API uses **token-in-URL** authentication. There are no `Authorization` headers. The token is part of the URL path itself:

```
https://api.telegram.org/bot<token>/sendMessage
```

The API accepts both GET and POST requests. Parameters can be passed as:
- URL query string
- `application/x-www-form-urlencoded` body
- `application/json` body (except for file uploads)
- `multipart/form-data` body (required for file uploads)

## Rate Limiting

| Scope | Limit |
|---|---|
| Different chats (broadcast) | ~30 messages/second |
| Same private chat | ~1 message/second (short bursts allowed) |
| Same group chat | 20 messages/minute |
| Paid broadcast (100k+ MAU) | Up to 1000 messages/second (0.1 Stars/msg over 30/s) |

When you exceed limits, the API returns HTTP `429 Too Many Requests` with a `retry_after` field in the JSON body indicating how many seconds to wait.

```python
async def send_with_retry(client: httpx.AsyncClient, url: str, payload: dict, max_retries: int = 3):
    for attempt in range(max_retries):
        resp = await client.post(url, json=payload)
        data = resp.json()
        if data["ok"]:
            return data["result"]
        if resp.status_code == 429:
            retry_after = data.get("parameters", {}).get("retry_after", 1)
            await asyncio.sleep(retry_after)
            continue
        raise Exception(f"Telegram API error {data['error_code']}: {data['description']}")
    raise Exception("Max retries exceeded")
```

## Methods

### getMe

Returns basic information about the bot. Use this to verify your token is valid.

```python
async def get_me(client: httpx.AsyncClient) -> dict:
    resp = await client.get(f"{BASE_URL}/getMe")
    data = resp.json()
    assert data["ok"]
    return data["result"]
    # Returns: {"id": 123456, "is_bot": true, "first_name": "MyBot", "username": "my_bot"}
```

### sendMessage

Send a text message to a chat.

**Required parameters:**
- `chat_id` (int | str) -- Target chat ID or @channelusername
- `text` (str) -- Message text, 1-4096 characters

**Optional parameters:**
- `parse_mode` (str) -- `"HTML"`, `"Markdown"`, or `"MarkdownV2"`
- `reply_to_message_id` (int) -- ID of the message to reply to
- `reply_markup` (dict) -- Inline keyboard, custom reply keyboard, etc.

```python
async def send_message(client: httpx.AsyncClient, chat_id: int, text: str, parse_mode: str = None) -> dict:
    payload = {"chat_id": chat_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    resp = await client.post(f"{BASE_URL}/sendMessage", json=payload)
    data = resp.json()
    if not data["ok"]:
        raise Exception(f"sendMessage failed: {data['description']}")
    return data["result"]

# Usage
await send_message(client, chat_id=123456789, text="<b>Hello!</b>", parse_mode="HTML")
```

### getUpdates

Receive incoming updates via long polling. Returns an array of `Update` objects.

**Optional parameters:**
- `offset` (int) -- Identifier of the first update to return. Use `last_update_id + 1` to acknowledge previous updates.
- `limit` (int) -- Number of updates to retrieve, 1-100. Default: 100.
- `timeout` (int) -- Timeout in seconds for long polling. Recommended: 30-60.
- `allowed_updates` (list[str]) -- List of update types to receive (e.g., `["message", "callback_query"]`).

```python
async def poll_updates(client: httpx.AsyncClient, timeout: int = 30):
    """Long-polling loop for receiving updates."""
    offset = 0
    while True:
        params = {"offset": offset, "timeout": timeout, "allowed_updates": ["message", "callback_query"]}
        resp = await client.get(f"{BASE_URL}/getUpdates", params=params, timeout=timeout + 10)
        data = resp.json()
        if not data["ok"]:
            await asyncio.sleep(1)
            continue
        for update in data["result"]:
            offset = update["update_id"] + 1
            yield update

# Usage
async with httpx.AsyncClient() as client:
    async for update in poll_updates(client):
        if "message" in update:
            chat_id = update["message"]["chat"]["id"]
            text = update["message"].get("text", "")
            await send_message(client, chat_id, f"Echo: {text}")
```

### setWebhook

Set a webhook URL so Telegram pushes updates to your server instead of polling.

**Required parameters:**
- `url` (str) -- HTTPS URL to receive updates

**Optional parameters:**
- `certificate` (file) -- Public key certificate for self-signed certs
- `max_connections` (int) -- Max simultaneous connections, 1-100. Default: 40.
- `allowed_updates` (list[str]) -- Update types to receive
- `secret_token` (str) -- Secret token for `X-Telegram-Bot-Api-Secret-Token` header validation, 1-256 chars
- `drop_pending_updates` (bool) -- Drop all pending updates on webhook set

```python
async def set_webhook(client: httpx.AsyncClient, webhook_url: str, secret_token: str = None) -> bool:
    payload = {"url": webhook_url}
    if secret_token:
        payload["secret_token"] = secret_token
    resp = await client.post(f"{BASE_URL}/setWebhook", json=payload)
    data = resp.json()
    if not data["ok"]:
        raise Exception(f"setWebhook failed: {data['description']}")
    return data["result"]

# Usage -- set webhook with secret for verification
await set_webhook(client, "https://example.com/webhook/telegram", secret_token="my-secret-123")
```

**Webhook handler example (using a lightweight ASGI framework):**

```python
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route

WEBHOOK_SECRET = os.environ["TELEGRAM_WEBHOOK_SECRET"]

async def webhook_handler(request: Request):
    # Verify the secret token header
    token = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
    if token != WEBHOOK_SECRET:
        return JSONResponse({"error": "unauthorized"}, status_code=403)

    update = await request.json()

    # Process the update
    if "message" in update:
        chat_id = update["message"]["chat"]["id"]
        text = update["message"].get("text", "")
        async with httpx.AsyncClient() as client:
            await send_message(client, chat_id, f"Webhook echo: {text}")

    return JSONResponse({"ok": True})

app = Starlette(routes=[Route("/webhook/telegram", webhook_handler, methods=["POST"])])
```

### sendPhoto

Send a photo to a chat.

**Required parameters:**
- `chat_id` (int | str) -- Target chat
- `photo` (str | file) -- Photo file_id, HTTP URL, or file upload

```python
async def send_photo_by_url(client: httpx.AsyncClient, chat_id: int, photo_url: str, caption: str = None) -> dict:
    payload = {"chat_id": chat_id, "photo": photo_url}
    if caption:
        payload["caption"] = caption
    resp = await client.post(f"{BASE_URL}/sendPhoto", json=payload)
    return resp.json()["result"]

async def send_photo_file(client: httpx.AsyncClient, chat_id: int, filepath: str, caption: str = None) -> dict:
    """Upload a local file as photo."""
    with open(filepath, "rb") as f:
        files = {"photo": (os.path.basename(filepath), f, "image/jpeg")}
        data = {"chat_id": str(chat_id)}
        if caption:
            data["caption"] = caption
        resp = await client.post(f"{BASE_URL}/sendPhoto", data=data, files=files)
    return resp.json()["result"]
```

### sendDocument

Send a general file/document.

**Required parameters:**
- `chat_id` (int | str) -- Target chat
- `document` (str | file) -- Document file_id, HTTP URL, or file upload

```python
async def send_document(client: httpx.AsyncClient, chat_id: int, filepath: str, caption: str = None) -> dict:
    with open(filepath, "rb") as f:
        files = {"document": (os.path.basename(filepath), f, "application/octet-stream")}
        data = {"chat_id": str(chat_id)}
        if caption:
            data["caption"] = caption
        resp = await client.post(f"{BASE_URL}/sendDocument", data=data, files=files)
    data = resp.json()
    if not data["ok"]:
        raise Exception(f"sendDocument failed: {data['description']}")
    return data["result"]
```

### answerCallbackQuery

Respond to a callback query from an inline keyboard button press. Must be called to stop the loading indicator on the button.

**Required parameters:**
- `callback_query_id` (str) -- Unique ID from the callback query

**Optional parameters:**
- `text` (str) -- Notification text shown to the user (0-200 chars)
- `show_alert` (bool) -- If true, show an alert dialog instead of a toast notification

```python
async def answer_callback(client: httpx.AsyncClient, callback_query_id: str, text: str = None, show_alert: bool = False) -> bool:
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
    if show_alert:
        payload["show_alert"] = True
    resp = await client.post(f"{BASE_URL}/answerCallbackQuery", json=payload)
    return resp.json()["result"]

# Typical usage inside an update handler:
async def handle_callback(client, update):
    cq = update["callback_query"]
    await answer_callback(client, cq["id"], text="Button clicked!")
    # Now edit the message or take further action
    if cq.get("data") == "confirm":
        await edit_message_text(client, cq["message"]["chat"]["id"], cq["message"]["message_id"], "Confirmed!")
```

### editMessageText

Edit the text of a previously sent message.

**Required parameters (bot-sent messages):**
- `chat_id` (int | str) -- Target chat
- `message_id` (int) -- ID of the message to edit
- `text` (str) -- New message text

**Required parameters (inline messages):**
- `inline_message_id` (str) -- ID of the inline message
- `text` (str) -- New message text

```python
async def edit_message_text(client: httpx.AsyncClient, chat_id: int, message_id: int, text: str, parse_mode: str = None, reply_markup: dict = None) -> dict:
    payload = {"chat_id": chat_id, "message_id": message_id, "text": text}
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup:
        payload["reply_markup"] = reply_markup
    resp = await client.post(f"{BASE_URL}/editMessageText", json=payload)
    data = resp.json()
    if not data["ok"]:
        raise Exception(f"editMessageText failed: {data['description']}")
    return data["result"]
```

## Error Handling

All API responses are JSON with this structure:

```json
{
    "ok": true,
    "result": { ... }
}
```

On failure:

```json
{
    "ok": false,
    "error_code": 400,
    "description": "Bad Request: chat not found",
    "parameters": {
        "retry_after": 30
    }
}
```

The `parameters` field is optional and may contain:
- `retry_after` (int) -- Seconds to wait before retrying (on 429 errors)
- `migrate_to_chat_id` (int) -- New chat ID when a group is migrated to a supergroup

**Common error codes:**

| Code | Meaning |
|---|---|
| 400 | Bad Request -- invalid parameters, chat not found, message too long |
| 401 | Unauthorized -- invalid or revoked bot token |
| 403 | Forbidden -- bot was blocked by user, or lacks permissions in chat |
| 404 | Not Found -- method does not exist |
| 409 | Conflict -- webhook is already set (when using getUpdates) or another getUpdates instance is running |
| 429 | Too Many Requests -- rate limited, check `retry_after` |

**Robust error handling pattern:**

```python
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

class TelegramAPIError(Exception):
    def __init__(self, error_code: int, description: str, parameters: dict = None):
        self.error_code = error_code
        self.description = description
        self.parameters = parameters or {}
        super().__init__(f"[{error_code}] {description}")

async def api_request(client: httpx.AsyncClient, method: str, payload: dict = None, max_retries: int = 3) -> dict:
    url = f"{BASE_URL}/{method}"
    for attempt in range(max_retries):
        try:
            resp = await client.post(url, json=payload or {})
            data = resp.json()
        except httpx.RequestError as e:
            logger.warning(f"Network error on {method} (attempt {attempt+1}): {e}")
            await asyncio.sleep(2 ** attempt)
            continue

        if data["ok"]:
            return data["result"]

        error_code = data.get("error_code", 0)
        description = data.get("description", "Unknown error")
        parameters = data.get("parameters", {})

        if error_code == 429:
            retry_after = parameters.get("retry_after", 1)
            logger.warning(f"Rate limited on {method}, retrying in {retry_after}s")
            await asyncio.sleep(retry_after)
            continue

        raise TelegramAPIError(error_code, description, parameters)

    raise TelegramAPIError(429, f"Max retries exceeded for {method}")
```

## Common Pitfalls

1. **Polling and webhooks conflict.** You cannot use `getUpdates` while a webhook is active. Call `deleteWebhook` first, or you will get a 409 error. Conversely, setting a webhook disables `getUpdates`.

2. **Not acknowledging updates.** When using `getUpdates`, always set `offset` to `last_update_id + 1`. Otherwise Telegram re-delivers the same updates on every poll, and your bot processes duplicates forever.

3. **Forgetting to answer callback queries.** If you handle an `InlineKeyboardButton` press but never call `answerCallbackQuery`, the user sees a perpetual loading spinner on the button.

4. **Token in logs.** Since the token is in the URL, standard HTTP logging will leak it. Filter or redact URLs in your logging configuration.

5. **httpx timeout vs. long polling timeout.** When using `getUpdates` with `timeout=30`, set your httpx client timeout higher (e.g., `timeout=40`) or the HTTP client will close the connection before Telegram responds.

6. **File uploads require multipart.** You cannot send local files with `application/json`. Use `multipart/form-data` (the `files=` parameter in httpx) for uploading photos, documents, etc.

7. **HTML parse_mode escaping.** When using `parse_mode="HTML"`, you must escape `<`, `>`, and `&` in user-supplied text as `&lt;`, `&gt;`, and `&amp;` or the API returns a 400 error.

8. **Group chat message limit.** The 20 messages/minute limit per group is much stricter than private chats. Batch or queue messages when your bot serves active groups.

9. **Chat migration.** When a group upgrades to a supergroup, the `chat_id` changes. Watch for error responses containing `migrate_to_chat_id` and update your stored IDs.

10. **Webhook must be HTTPS.** Self-signed certificates work but must be uploaded via the `certificate` parameter in `setWebhook`. Plain HTTP URLs are rejected.
