---
name: slack
description: "Prefect Slack integration for sending bot-token messages and incoming-webhook notifications from Python flows"
metadata:
  languages: "python"
  versions: "0.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,slack,python,notifications,blocks,workflow"
---

# Prefect Slack Python Package Guide

## Golden Rule

Use `prefect-slack` when a Prefect flow needs to post to Slack with either a bot token or an incoming webhook. Keep using core `prefect` for flows, tasks, deployments, workers, and block storage; this package adds Slack-specific blocks and tasks on top.

If you only need a generic incoming-webhook notification block and do not need the Slack SDK client, Prefect also ships a built-in `prefect.blocks.notifications.SlackWebhook` block in core `prefect`.

## Install

The Prefect integration docs recommend installing the Slack integration through the Prefect extra:

```bash
python -m pip install "prefect[slack]"
```

If you are pinning the integration package directly, install the package version this guide covers:

```bash
python -m pip install "prefect-slack==0.3.1"
```

Common alternatives:

```bash
uv add prefect-slack
poetry add prefect-slack
```

Sanity-check the install:

```bash
python -m pip show prefect-slack
python -c "import prefect_slack; print(prefect_slack.__file__)"
```

## Prerequisites And Environment

Choose one Slack authentication path before you write flow code:

- Bot token workflow: a Slack bot token such as `xoxb-...` with permission to post to the target channel
- Incoming webhook workflow: a Slack incoming webhook URL for the target channel

Example environment variables:

```bash
export SLACK_BOT_TOKEN="xoxb-..."
export SLACK_CHANNEL="#alerts"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

If you want to save and later load named Prefect blocks, configure Prefect as well:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted server instead of Prefect Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

Direct instantiation of `SlackCredentials(...)` or `SlackWebhook(...)` does not require a Prefect API. Saving with `save(...)` and loading with `load(...)` does.

## Send A Channel Message With A Bot Token

Use `SlackCredentials` plus `send_chat_message` when you want normal Slack chat messages backed by a bot token.

```python
import os

from prefect import flow
from prefect_slack import SlackCredentials
from prefect_slack.messages import send_chat_message


@flow
async def post_status_message() -> None:
    slack_credentials = SlackCredentials(token=os.environ["SLACK_BOT_TOKEN"])

    await send_chat_message(
        slack_credentials=slack_credentials,
        channel=os.environ["SLACK_CHANNEL"],
        text="Nightly sync completed successfully.",
    )


if __name__ == "__main__":
    import asyncio

    asyncio.run(post_status_message())
```

Use this path when you need a real Slack bot identity and channel posting through Slack's Web API.

## Save And Reuse A Slack Bot Credentials Block

When several flows share the same bot token, save the credentials as a named Prefect block and load it where needed.

```python
import os

from prefect_slack import SlackCredentials


slack_credentials = SlackCredentials(token=os.environ["SLACK_BOT_TOKEN"])
slack_credentials.save("slack-bot", overwrite=True)
```

Load the block inside your flow:

```python
import os

from prefect import flow
from prefect_slack import SlackCredentials
from prefect_slack.messages import send_chat_message


@flow
async def notify_ops() -> None:
    slack_credentials = SlackCredentials.load("slack-bot")

    await send_chat_message(
        slack_credentials=slack_credentials,
        channel=os.environ["SLACK_CHANNEL"],
        text="Flow run needs attention.",
    )
```

## Send A Message Through An Incoming Webhook

Use `SlackWebhook` plus `send_incoming_webhook_message` when you already have a Slack webhook URL and only need notification-style delivery.

```python
import os

from prefect import flow
from prefect_slack import SlackWebhook
from prefect_slack.messages import send_incoming_webhook_message


@flow
async def post_webhook_message() -> None:
    slack_webhook = SlackWebhook(url=os.environ["SLACK_WEBHOOK_URL"])

    await send_incoming_webhook_message(
        slack_webhook=slack_webhook,
        text="Warehouse load finished.",
    )


if __name__ == "__main__":
    import asyncio

    asyncio.run(post_webhook_message())
```

If the webhook configuration is shared across flows, save it once:

```python
import os

from prefect_slack import SlackWebhook


slack_webhook = SlackWebhook(url=os.environ["SLACK_WEBHOOK_URL"])
slack_webhook.save("slack-webhook", overwrite=True)
```

Then load it later:

```python
from prefect_slack import SlackWebhook


slack_webhook = SlackWebhook.load("slack-webhook")
```

## Use The Slack SDK Client Directly

`SlackCredentials` can also create an authenticated Slack SDK client when you need an API call that is not wrapped by a Prefect task.

```python
import os

from prefect import flow
from prefect_slack import SlackCredentials


@flow
async def post_with_sdk() -> None:
    slack_credentials = SlackCredentials(token=os.environ["SLACK_BOT_TOKEN"])
    client = slack_credentials.get_client()

    await client.chat_postMessage(
        channel=os.environ["SLACK_CHANNEL"],
        text="Posted through slack_sdk.AsyncWebClient",
    )
```

This is the escape hatch for Slack API methods beyond the packaged helper tasks.

## Common Pitfalls

- `prefect-slack` does not replace core `prefect`; install and configure Prefect itself when you need flows, deployments, workers, or block storage.
- Bot tokens and incoming webhook URLs are different authentication surfaces. Use `SlackCredentials` for token-based chat API calls and `SlackWebhook` for incoming webhooks.
- Saving and loading blocks requires a working Prefect API configuration. Inline construction from environment variables does not.
- The core `prefect.blocks.notifications.SlackWebhook` block and `prefect_slack.SlackWebhook` are different block types. A block saved under one class is not loaded through the other.
- Prefer sending a plain-text `text` field even if you later add richer Slack formatting. Slack's webhook guidance treats `text` as a best practice and fallback for accessibility.
- The runtime that executes the flow needs the Slack credentials or webhook URL and the `prefect-slack` package installed; registering a deployment elsewhere is not enough.

## Version Notes For `prefect-slack` 0.3.1

- This guide covers the PyPI package version `0.3.1`.
- PyPI currently marks `prefect-slack` as requiring Python `>=3.9`.
- The current Prefect integrations docs recommend `pip install "prefect[slack]"` instead of treating `prefect-slack` as a fully standalone install path.
- The PyPI project description still references Prefect 2 wording, but the maintained integration docs live under the current Prefect docs and fit current Prefect block and configuration guidance.

## Official Sources

- Prefect integrations root: `https://docs.prefect.io/integrations/`
- Prefect Slack integration docs: `https://docs.prefect.io/integrations/prefect-slack/`
- Prefect blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Prefect settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Prefect Cloud connection docs: `https://docs.prefect.io/v3/manage/cloud/connect-to-cloud`
- Prefect Slack Python reference: `https://reference.prefect.io/prefect_slack/`
- PyPI package page: `https://pypi.org/project/prefect-slack/`
