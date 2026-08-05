---
name: workspace
description: "Slack Python SDK for building Slack apps, bots, and workspace integrations"
metadata:
  languages: "python"
  versions: "3.42.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "slack,bot,workspace,messaging,events-api"
---

# Slack Python SDK Coding Guidelines

You are a Slack SDK coding expert. Help me with writing code using the Slack
Python SDK for building Slack apps and integrations.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://docs.slack.dev/tools/python-slack-sdk/

## Golden Rule: Use the Correct and Current SDK

Always use the official Slack Python SDK (`slack_sdk`) for all Slack integrations. Do not use the legacy `slackclient` library which is in maintenance mode.

- **Library Name:** Slack Python SDK
- **Python Package:** `slack_sdk`
- **Legacy Library:** `slackclient` is deprecated and in maintenance mode

**Installation:**

- **Incorrect:** `pip install slackclient`
- **Correct:** `pip install slack_sdk`

**APIs and Usage:**

- **Incorrect:** `from slackclient import SlackClient` -> **Correct:** `from slack_sdk import WebClient`
- **Incorrect:** `import slackclient` -> **Correct:** `import slack_sdk`
- **Incorrect:** `from slack_sdk.web_client import WebClient` -> **Correct:** `from slack_sdk import WebClient`
- **Incorrect:** `from slack_sdk.errors import SlackApiError` -> **Correct:** `from slack_sdk.errors import SlackApiError`

## Initialization and Authentication

The `slack_sdk` library supports multiple authentication methods. For Web API calls, always use the `WebClient` class.

- Always use `client = WebClient(token='your-token')` to create a client object
- Set `SLACK_BOT_TOKEN` or `SLACK_API_TOKEN` environment variable for security
- Use Bot User OAuth tokens (`xoxb-*`) for most integrations
- Use User tokens (`xoxp-*`) only when user-specific actions are required

## Basic Web API Usage

Here's how to send a message to Slack using the Web API:

```python
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

try:
    response = client.chat_postMessage(channel='#general', text="Hello world!")
    assert response["ok"]
except SlackApiError as e:
    print(f"Error posting message: {e.response['error']}")
```

## File Uploads

For uploading files to Slack, use the `files_upload_v2` method:

```python
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

try:
    response = client.files_upload_v2(
        channel='C0123456789',
        file='./document.pdf',
        title='Document Upload'
    )
    assert response["file"]
except SlackApiError as e:
    print(f"Error uploading file: {e.response['error']}")
```

## Async Usage

For asynchronous operations, use `AsyncWebClient`:

```python
import asyncio
import os
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError

client = AsyncWebClient(token=os.environ['SLACK_BOT_TOKEN'])

async def post_message():
    try:
        response = await client.chat_postMessage(
            channel='#general', 
            text="Hello from async!"
        )
        assert response["ok"]
    except SlackApiError as e:
        print(f"Error: {e.response['error']}")

asyncio.run(post_message())
```

## Block Kit and Rich Messages

Use Block Kit to create rich, interactive messages:

```python
from slack_sdk import WebClient
from slack_sdk.models.blocks import SectionBlock, DividerBlock, ActionsBlock
from slack_sdk.models.block_elements import ButtonElement

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

blocks = [
    SectionBlock(text="Hello from Block Kit!"),
    DividerBlock(),
    ActionsBlock(elements=[
        ButtonElement(text="Click me", action_id="button_click")
    ])
]

response = client.chat_postMessage(
    channel='#general',
    text="Fallback text",
    blocks=blocks
)
```

## Error Handling

Always handle `SlackApiError` exceptions for robust error handling:

```python
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

client = WebClient(token=os.environ['SLACK_BOT_TOKEN'])

try:
    response = client.chat_postMessage(channel='#general', text="Hello!")
except SlackApiError as e:
    if e.response["error"] == "channel_not_found":
        print("Channel does not exist")
    elif e.response["error"] == "invalid_auth":
        print("Invalid token")
    else:
        print(f"Slack API Error: {e.response['error']}")
    print(f"Status code: {e.response.status_code}")
```

## Webhooks

For simple webhook-based integrations:

```python
from slack_sdk.webhook import WebhookClient

webhook = WebhookClient("https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX")

response = webhook.send(
    text="Hello from webhook!",
    blocks=[
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "Hello from webhook!"}
        }
    ]
)
```

## Socket Mode (Real-time Events)

For real-time event handling using Socket Mode:

```python
import os
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk import WebClient

def process_event(client: SocketModeClient, req):
    if req.type == "events_api":
        # Handle events here
        client.send_socket_mode_response(req.envelope_id)

socket_client = SocketModeClient(
    app_token=os.environ["SLACK_APP_TOKEN"],
    web_client=WebClient(token=os.environ["SLACK_BOT_TOKEN"])
)

socket_client.socket_mode_request_listeners.append(process_event)
socket_client.connect()
```

## Available SDK Modules

The Python Slack SDK provides several specialized modules:

- `slack_sdk.web`: Web API client for most Slack API interactions
- `slack_sdk.webhook`: Webhook client for incoming webhooks
- `slack_sdk.socket_mode`: Socket Mode client for real-time events
- `slack_sdk.oauth`: OAuth flow implementation
- `slack_sdk.audit_logs`: Audit Logs API client
- `slack_sdk.scim`: SCIM API client for user management
- `slack_sdk.models`: Block Kit and message models
- `slack_sdk.signature`: Request signature verification

## Advanced Configuration

Configure SSL, proxies, and other advanced options:

```python
import ssl
from slack_sdk import WebClient

ssl_context = ssl.create_default_context()
proxy = "http://proxy.company.com:8080"

client = WebClient(
    token=os.environ['SLACK_BOT_TOKEN'],
    ssl=ssl_context,
    proxy=proxy,
    timeout=60
)
```

## Migration from Legacy Libraries

If migrating from `slackclient` v1 or v2:
- Replace `slackclient` imports with `slack_sdk`
- Update authentication patterns to use `WebClient(token=...)`
- Review method signatures as some parameters may have changed
- Update error handling to use `SlackApiError`

## Best Practices

1. **Always handle errors**: Use try/except blocks with `SlackApiError`
2. **Use environment variables**: Store tokens securely in environment variables
3. **Validate responses**: Check `response["ok"]` before processing results
4. **Use appropriate token types**: Bot tokens for bot actions, user tokens only when necessary
5. **Implement rate limiting**: Be aware of Slack's rate limits and implement backoff strategies
6. **Use Block Kit**: Prefer Block Kit over legacy attachments for rich messages

## Requirements

- Python 3.9 or higher
- For async usage: Install with `pip install slack_sdk[optional]` for performance improvements

## Useful Links

- Documentation: https://docs.slack.dev/tools/python-slack-sdk/
- API Methods: https://api.slack.com/methods
- Block Kit Builder: https://app.slack.com/block-kit-builder/
- GitHub Issues: https://github.com/slackapi/python-slack-sdk/issues
- Slack Community: https://slackcommunity.com/

## Notes

This SDK is the official and recommended way to interact with Slack APIs from Python. Always use the latest version and refer to the official documentation for the most up-to-date examples and best practices. For building full Slack apps with event handling, consider using the Bolt for Python framework which builds on top of this SDK.
