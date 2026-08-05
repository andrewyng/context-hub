---
name: package
description: "Slack Python SDK for Web API calls, webhooks, OAuth installs, Socket Mode, and request verification"
metadata:
  languages: "python"
  versions: "3.42.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "slack,slack-sdk,python,chat,web-api,oauth,webhooks,socket-mode"
---

# Slack Python SDK Package Guide

## Golden Rule

Use `slack-sdk` from PyPI, import it as `slack_sdk`, and choose the client that matches the integration shape:

- `WebClient` for Slack Web API calls
- `AsyncWebClient` for async code
- `WebhookClient` for incoming webhooks and `response_url`
- `SocketModeClient` for WebSocket-based app connections

Do not start from the deprecated `slack` / `slackclient` package. The current package is `slack-sdk`, and most current examples should use `slack_sdk.*` imports.

## Install

Pin the version your project expects:

```bash
python -m pip install "slack-sdk==3.42.0"
```

If you use async clients, install `aiohttp` explicitly:

```bash
python -m pip install "slack-sdk==3.42.0" aiohttp
```

For Socket Mode with alternate transports, add the corresponding library yourself:

```bash
python -m pip install "slack-sdk==3.42.0" websocket-client
python -m pip install "slack-sdk==3.42.0" aiohttp
python -m pip install "slack-sdk==3.42.0" websockets
```

## Authentication And Setup

### Token types you will actually use

- Bot token: starts with `xoxb-`; the usual token for `WebClient`
- User token: starts with `xoxp-`; use only when a method must act as a user
- App-level token: starts with `xapp-`; required for Socket Mode connections
- Signing secret: used to verify inbound HTTP requests from Slack

Common environment variables:

```bash
export SLACK_BOT_TOKEN="xoxb-..."
export SLACK_APP_TOKEN="xapp-..."
export SLACK_SIGNING_SECRET="..."
export SLACK_CLIENT_ID="..."
export SLACK_CLIENT_SECRET="..."
```

### Single-workspace install

For an internal app installed to one workspace, install the app from the Slack app settings and keep the bot token in environment variables or a secret manager.

```python
import os
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])
```

### Multi-workspace OAuth

For distributed apps, start the OAuth flow at `https://slack.com/oauth/v2/authorize`, then exchange the returned `code` with `oauth_v2_access`.

```python
import os
from slack_sdk import WebClient

client = WebClient()

oauth_response = client.oauth_v2_access(
    client_id=os.environ["SLACK_CLIENT_ID"],
    client_secret=os.environ["SLACK_CLIENT_SECRET"],
    code="temporary-code-from-redirect",
)

bot_token = oauth_response["access_token"]
```

If you enable token rotation, Slack access tokens expire every 12 hours and must be refreshed with the rotation flow. Bolt handles this more conveniently than raw SDK code.

## Core Usage

### Send a message with `WebClient`

Use channel IDs when possible. If the bot is not in the target channel, Slack will typically return `not_in_channel` or `channel_not_found` unless you have `chat:write.public` for public channels.

```python
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

try:
    response = client.chat_postMessage(
        channel="C0123456789",
        text="Deployment finished successfully.",
    )
    print(response["ts"])
except SlackApiError as exc:
    print(exc.response["error"])
    raise
```

### Upload a file

Use `files_upload_v2` in current examples:

```python
import os
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

client.files_upload_v2(
    channel="C0123456789",
    file="./build.log",
    title="Build log",
)
```

### Read workspace data

Most workspace reads are direct Web API wrappers with Pythonic method names:

```python
import os
from slack_sdk import WebClient

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])

info = client.conversations_info(
    channel="C0123456789",
    include_num_members=True,
)

print(info["channel"]["name"])
```

### Use `AsyncWebClient`

`AsyncWebClient` requires `aiohttp` and should be used only inside an async application.

```python
import os
import asyncio
from slack_sdk.web.async_client import AsyncWebClient

client = AsyncWebClient(token=os.environ["SLACK_BOT_TOKEN"])

async def main() -> None:
    response = await client.chat_postMessage(
        channel="C0123456789",
        text="Hello from async code.",
    )
    print(response["ts"])

asyncio.run(main())
```

### Send via incoming webhook or `response_url`

Use `WebhookClient` when you already have a webhook URL or a `response_url` from a slash command or interactive payload.

```python
from slack_sdk.webhook import WebhookClient

webhook = WebhookClient("https://hooks.slack.com/services/...")
webhook.send(text="Build completed.")
```

### Verify inbound Slack requests

When handling slash commands, interactivity, or Events API callbacks over HTTP, verify the request before processing it. Use the raw request body and original headers, not a reconstructed JSON body.

```python
import os
from flask import Flask, request, abort
from slack_sdk.signature import SignatureVerifier

app = Flask(__name__)
signature_verifier = SignatureVerifier(os.environ["SLACK_SIGNING_SECRET"])

@app.post("/slack/events")
def slack_events():
    body = request.get_data()
    if not signature_verifier.is_valid_request(body, request.headers):
        abort(401)
    return "", 200
```

### Use Socket Mode

Socket Mode requires both:

- `SLACK_APP_TOKEN` with `connections:write`
- a Web API token such as `SLACK_BOT_TOKEN`

```python
import os
from threading import Event
from slack_sdk.web import WebClient
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest
from slack_sdk.socket_mode.response import SocketModeResponse

client = SocketModeClient(
    app_token=os.environ["SLACK_APP_TOKEN"],
    web_client=WebClient(token=os.environ["SLACK_BOT_TOKEN"]),
)

def process(socket_client: SocketModeClient, req: SocketModeRequest) -> None:
    if req.type == "events_api":
        socket_client.send_socket_mode_response(
            SocketModeResponse(envelope_id=req.envelope_id)
        )

client.socket_mode_request_listeners.append(process)
client.connect()
Event().wait()
```

If you use `slack_sdk.socket_mode.aiohttp.SocketModeClient` or `slack_sdk.socket_mode.websockets.SocketModeClient`, keep the transport library installed and pair it with `AsyncWebClient`.

## Configuration Notes

### Retries and rate limits

The default client only enables a connection-error retry handler. If you want automatic retries for Slack rate limits (`HTTP 429`), add `RateLimitErrorRetryHandler` yourself.

```python
import os
from slack_sdk.web import WebClient
from slack_sdk.http_retry.builtin_handlers import RateLimitErrorRetryHandler

client = WebClient(token=os.environ["SLACK_BOT_TOKEN"])
client.retry_handlers.append(RateLimitErrorRetryHandler(max_retry_count=1))
```

### Secrets handling

- Keep tokens and signing secrets out of source control.
- Prefer environment variables or a secret manager.
- If you support OAuth installations across many workspaces, persist installations in your own store instead of keeping tokens only in process memory.

### When to use Bolt instead

`slack-sdk` is the right package when you want direct API clients and low-level control. If you are building a full Slack app with slash commands, Events API listeners, interactivity, OAuth persistence, or token rotation, `slack-bolt` is often the better top-level framework and still uses this SDK underneath.

## Common Pitfalls

- The PyPI project is `slack-sdk`, but the import package is `slack_sdk`. Old `import slack` examples are migration leftovers.
- `slackclient` is in maintenance mode. Do not add new code against it.
- Async support is not bundled automatically in v3. Install `aiohttp` yourself before using `AsyncWebClient`, `AsyncWebhookClient`, or asyncio-based Socket Mode clients.
- Verify Slack signatures against the raw request body before deserializing it. Reading parsed JSON first can break signature validation.
- Socket Mode needs an app-level `xapp-` token for the connection and a bot or user token for API calls. One token is not enough.
- Prefer channel IDs over channel names. Names can be ambiguous or change.
- A bot must usually be in the channel to post there unless the app has the appropriate public-posting scope.
- Use `WebhookClient` only for webhook URLs or `response_url`. For normal Web API methods, use `WebClient`.

## Version-Sensitive Notes

- As of Friday, May 29, 2026, PyPI lists `3.42.0` as the latest release of `slack-sdk`.
- The current Slack docs still describe Python `3.7+` support and the same client surface used here.
- Since SDK v3, the project name is `slack_sdk` / `slack-sdk`, not `slackclient`, and async-related dependencies are no longer installed automatically.
- Current docs and PyPI examples use `files_upload_v2`; prefer that over older file-upload examples.
