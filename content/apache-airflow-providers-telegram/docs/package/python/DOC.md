---
name: package
description: "Apache Airflow Telegram provider for sending bot messages from DAGs with TelegramOperator and TelegramHook"
metadata:
  languages: "python"
  versions: "4.9.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,telegram,python,notifications,dag"
---

# apache-airflow-providers-telegram

Use `apache-airflow-providers-telegram` when an Airflow DAG should send Telegram bot messages to a user, group, or channel.

This package extends Apache Airflow. It is not the standalone Telegram Bot SDK for general Python applications outside Airflow.

This guide targets provider version `4.9.2`.

## What This Package Adds

The Telegram provider gives Airflow Telegram-specific task and hook integrations built around an Airflow connection:

- `TelegramOperator` for sending a message as a DAG task
- `TelegramHook` for sending a message from Python task code
- a `telegram` connection type, usually referenced as `telegram_default`

Keep the bot token in an Airflow connection or secrets backend instead of hard-coding it in DAG source.

## Install

Install the provider in the same Python environment or container image as every Airflow component that imports or executes DAG code:

```bash
python -m pip install "apache-airflow-providers-telegram==4.9.2"
```

If your Airflow deployment uses constraints files, keep the provider pinned alongside the Airflow version your environment supports instead of upgrading it in isolation.

## Prerequisites

You need:

- a Telegram bot token
- a target `chat_id`
- an Airflow connection that stores the bot token

Example shell variables for local setup:

```bash
export TELEGRAM_BOT_TOKEN='123456789:your-bot-token'
export TELEGRAM_CHAT_ID='-1001234567890'
```

## Configure The Airflow Connection

Create an Airflow connection for the bot token.

In the Airflow UI, use:

- **Connection Id:** `telegram_default`
- **Connection Type:** `telegram`
- **Password:** your Telegram bot token
- **Extra:** `{"chat_id": "-1001234567890"}` if you want a default chat id on the connection

You can also create it from the CLI:

```bash
airflow connections add 'telegram_default' \
  --conn-type 'telegram' \
  --conn-password "$TELEGRAM_BOT_TOKEN" \
  --conn-extra "{\"chat_id\": \"$TELEGRAM_CHAT_ID\"}"
```

Useful check:

```bash
airflow connections get telegram_default
```

Practical notes:

- If you keep `chat_id` in connection extras, tasks can omit it and only pass `text`.
- If different DAGs send to different chats, keep only the bot token on the connection and pass `chat_id` explicitly in each task.
- Keep the raw bot token out of DAG files.

## Send A Message With `TelegramOperator`

Use `TelegramOperator` when sending the message should appear as a normal task in the DAG graph.

```python
from airflow import DAG
from airflow.providers.telegram.operators.telegram import TelegramOperator
from pendulum import datetime


with DAG(
    dag_id="telegram_operator_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    send_message = TelegramOperator(
        task_id="send_message",
        telegram_conn_id="telegram_default",
        chat_id="{{ var.value.telegram_chat_id }}",
        text="Airflow run {{ run_id }} finished for DAG {{ dag.dag_id }}.",
    )
```

The main parameters are:

- `telegram_conn_id`: Airflow connection id for the bot token
- `chat_id`: target Telegram chat; omit it only if the connection already defines a default `chat_id`
- `text`: the message body to send

Use this path when Telegram delivery is a first-class step in the workflow and should be visible in task history.

## Use `TelegramHook` Inside Python Tasks

Use `TelegramHook` when the message content depends on Python logic or task output.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.models import Variable
from airflow.providers.telegram.hooks.telegram import TelegramHook
from pendulum import datetime


with DAG(
    dag_id="telegram_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def notify_summary() -> None:
        chat_id = Variable.get("telegram_chat_id")

        hook = TelegramHook(telegram_conn_id="telegram_default")
        hook.send_message(
            {
                "chat_id": chat_id,
                "text": "Daily pipeline finished successfully.",
            }
        )

    notify_summary()
```

`TelegramHook` uses `telegram_conn_id`, not `conn_id`.

This pattern is the better fit when the Telegram message is assembled dynamically in Python code instead of being a dedicated standalone task.

## Common Setup Pattern

For most DAGs, a clean split is:

- store the bot token on `telegram_default`
- keep the destination `chat_id` in an Airflow Variable or the connection extras
- use `TelegramOperator` for a simple visible notification task
- use `TelegramHook` inside `@task` code when the message depends on runtime logic

## Pitfalls

- Install the provider everywhere Airflow imports DAG code. Import errors usually mean one scheduler, worker, or image is missing the package.
- Use `telegram_conn_id` for this provider's classes; do not replace it with a generic `conn_id`.
- Do not hard-code the bot token in Python source. Keep it in an Airflow connection or secrets backend.
- If you configure a default `chat_id` on the connection, make sure it matches the actual destination for the DAG; otherwise pass `chat_id` explicitly per task.
- Keep messages small and plain enough for the target Telegram chat and your bot permissions.

## Version Notes

- This guide covers `apache-airflow-providers-telegram` version `4.9.2`.
- Airflow provider packages are versioned separately from Apache Airflow core, so check the provider docs before changing core and provider versions independently.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-telegram/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-telegram/stable/index.html`
- Telegram connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-telegram/stable/connections/telegram.html`
- `TelegramHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-telegram/stable/_api/airflow/providers/telegram/hooks/telegram/index.html`
- `TelegramOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-telegram/stable/_api/airflow/providers/telegram/operators/telegram/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-telegram/`
