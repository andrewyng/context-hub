---
name: providers-discord
description: "Apache Airflow Discord provider for sending webhook messages from DAG tasks, Python code, and callback notifiers"
metadata:
  languages: "python"
  versions: "3.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,discord,python,webhooks,notifications"
---

# apache-airflow-providers-discord

Use `apache-airflow-providers-discord` when an Airflow DAG needs to send Discord webhook messages from a task, from Python task code, or from a callback such as `on_failure_callback`.

This package extends Apache Airflow. It is not a general-purpose Discord bot SDK.

This guide targets provider version `3.12.0`.

## What This Package Adds

The Discord provider is centered on Discord webhook delivery through an Airflow connection:

- `DiscordWebhookOperator` for a visible DAG task that posts to Discord
- `DiscordWebhookHook` for sending a webhook from Python task code
- `DiscordNotifier` for DAG-level or task-level callbacks
- a Discord webhook connection that keeps the webhook token out of DAG source

If you need a Discord bot token, slash commands, gateway events, or channel management APIs, use a Discord bot library outside this provider. This provider is for webhook-based message delivery inside Airflow.

## Install

The provider docs for `3.12.0` list these minimum runtime requirements:

- `apache-airflow >= 2.11.0`
- `apache-airflow-providers-common-compat >= 1.8.0`
- `discord-webhook >= 1.2.1`
- Python `>= 3.10`

Install the provider into the same environment or image as every Airflow component that imports or executes DAG code:

```bash
python -m pip install "apache-airflow-providers-discord==3.12.0"
```

If you install providers with Airflow constraints, keep the Airflow core package pinned in the same command:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-discord==3.12.0"
```

Useful checks:

```bash
airflow providers list | grep discord
airflow info
```

## Configure The Discord Webhook Connection

Create a Discord webhook in the target Discord channel, then store the secret parts in an Airflow connection instead of hard-coding them in DAG files.

Useful local shell variables:

```bash
export DISCORD_WEBHOOK_TOKEN='123456789012345678/your-webhook-token'
export DISCORD_WEBHOOK_ENDPOINT='https://discord.com/api/webhooks'
```

In Airflow, create a connection such as:

- **Connection Id:** `discord_default`
- **Connection Type:** Discord webhook (`discordwebhook` in URI form)
- **Password:** the webhook token segment from the Discord webhook URL
- **Extra:** `{"webhook_endpoint": "https://discord.com/api/webhooks"}`

Practical notes:

- The provider docs show the connection URI scheme as `discordwebhook://`.
- Keep the webhook token in the connection password or a secrets backend, not in DAG code.
- `webhook_endpoint` is optional if you use the standard Discord endpoint, but it is the documented place to override the webhook base URL.

## Send A Message With `DiscordWebhookOperator`

Use `DiscordWebhookOperator` when sending the Discord message should appear as a normal task in the DAG graph.

```python
from airflow import DAG
from airflow.providers.discord.operators.discord_webhook import DiscordWebhookOperator
from pendulum import datetime


with DAG(
    dag_id="discord_webhook_operator_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    notify_success = DiscordWebhookOperator(
        task_id="notify_success",
        discord_webhook_conn_id="discord_default",
        message="Airflow run {{ run_id }} finished for DAG {{ dag.dag_id }}.",
        username="Airflow",
    )
```

Main parameters you will usually set:

- `discord_webhook_conn_id`: Airflow connection id for the Discord webhook
- `message`: text content sent to Discord
- `username`: optional display name override for the webhook sender
- `avatar_url`: optional avatar image URL for the webhook sender
- `tts`: set `True` only if you want a text-to-speech message

## Send An Embed With `DiscordWebhookOperator`

Version `3.12.0` added `embed` support to the operator, hook, and notifier APIs.

Use an embed when the message should include a title, description, or structured rich content:

```python
from airflow import DAG
from airflow.providers.discord.operators.discord_webhook import DiscordWebhookOperator
from discord_webhook import DiscordEmbed
from pendulum import datetime


embed = DiscordEmbed(
    title="Daily pipeline finished",
    description="DAG `daily_load` completed successfully.",
    color="03b2f8",
)

with DAG(
    dag_id="discord_embed_operator_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    send_embed = DiscordWebhookOperator(
        task_id="send_embed",
        discord_webhook_conn_id="discord_default",
        message="Status update from Airflow",
        embed=embed,
        username="Airflow",
    )
```

## Use `DiscordWebhookHook` Inside Python Tasks

Use `DiscordWebhookHook` when the message depends on Python logic or task output instead of being a fixed standalone task.

```python
from airflow.decorators import task
from airflow.providers.discord.hooks.discord_webhook import DiscordWebhookHook


@task
def notify_row_count(row_count: int) -> None:
    hook = DiscordWebhookHook(
        discord_webhook_conn_id="discord_default",
        message=f"Loaded {row_count} rows into the warehouse.",
        username="Airflow",
        wait=True,
    )
    hook.execute()
```

Important details from the hook API:

- `discord_webhook_conn_id` selects the Airflow webhook connection.
- `message` is the text body shortcut for a plain webhook post.
- `body` can be a raw string or a request dictionary if you need lower-level control.
- `wait=True` asks Discord to return a response after accepting the webhook.

Use the hook when Python code needs to decide at runtime whether to send a message and what it should contain.

## Use `DiscordNotifier` For Callbacks

Use `DiscordNotifier` for DAG or task callbacks such as `on_failure_callback`.

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.providers.discord.notifications.discord import DiscordNotifier
from pendulum import datetime


with DAG(
    dag_id="discord_failure_callback_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    on_failure_callback=DiscordNotifier(
        webhook_conn_id="discord_default",
        message="Task {{ ti.task_id }} failed in DAG {{ dag.dag_id }} for run {{ run_id }}.",
        username="Airflow",
    ),
) as dag:
    start = EmptyOperator(task_id="start")
```

Important parameter name difference:

- `DiscordWebhookOperator` and `DiscordWebhookHook` use `discord_webhook_conn_id`
- `DiscordNotifier` uses `webhook_conn_id`

That mismatch is easy to miss when you move the same webhook between tasks and callbacks.

## Common Setup Pattern

For most Airflow deployments, a clean split is:

- keep the Discord webhook token in an Airflow connection or secrets backend
- use `DiscordWebhookOperator` when Discord delivery is a visible DAG task
- use `DiscordWebhookHook` inside `@task` code when the message is assembled dynamically
- use `DiscordNotifier` for DAG-level or task-level callbacks

## Common Pitfalls

- Install the provider everywhere Airflow imports DAG code. Scheduler-only installs still fail when workers or other components import the missing provider package.
- This provider sends Discord webhooks. It does not expose a full Discord bot client.
- Store only the webhook token in the connection password; do not paste the entire webhook URL into DAG code.
- `DiscordNotifier` uses `webhook_conn_id`, while the operator and hook use `discord_webhook_conn_id`.
- Use `wait=True` only when your task logic actually needs Discord to send a response before continuing.

## Version Notes

- This guide covers `apache-airflow-providers-discord` version `3.12.0`.
- The official `3.12.0` changelog notes the addition of embed support for the hook, operator, and notifier.
- Provider packages are versioned independently from Airflow core, so keep the provider pin explicit when you upgrade Airflow.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/index.html`
- Discord connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/connections/discord.html`
- Discord webhook operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/operators/discord_operator_howto_guide.html`
- Discord notifier guide: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/notifications/discord_notifier_howto_guide.html`
- `DiscordWebhookHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/_api/airflow/providers/discord/hooks/discord_webhook/index.html`
- `DiscordWebhookOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/_api/airflow/providers/discord/operators/discord_webhook/index.html`
- `DiscordNotifier` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/_api/airflow/providers/discord/notifications/discord/index.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-discord/stable/changelog.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-discord/`
