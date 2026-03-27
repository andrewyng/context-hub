---
name: providers-dingding
description: "Apache Airflow DingTalk provider for sending custom robot messages with DingdingOperator and DingdingHook"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,dingtalk,dingding,python,notifications,operators,hooks"
---

# Apache Airflow DingTalk Provider Guide

Use `apache-airflow-providers-dingding` when an Airflow DAG should send messages to a DingTalk group through a custom robot webhook.

This package extends Apache Airflow. It is not a general-purpose DingTalk Python SDK for apps outside Airflow.

## Install

Install the provider in the same Python environment as your Airflow scheduler, workers, and any image that imports DAG code:

```bash
python -m pip install "apache-airflow-providers-dingding==3.9.2"
```

Version notes from PyPI for `3.9.2`:

- requires Python `>=3.10`
- requires `apache-airflow>=2.11.0`

If your deployment pins Airflow with constraints, keep this provider pinned with the Airflow version your environment supports instead of upgrading it in isolation.

## Prerequisites

Before writing DAG code:

- add a DingTalk custom robot to the target group
- collect the custom robot webhook token
- store only the token in the Airflow connection password field, not the full webhook URL

The provider uses `https://oapi.dingtalk.com` by default. Only set a custom connection host if your DingTalk endpoint differs.

## Configure The Airflow Connection

The provider's default connection id is `dingding_default`, and the hook declares the connection type as `dingding`.

Environment variable example using Airflow's JSON connection format:

```bash
export DINGDING_TOKEN='your-custom-robot-token'

export AIRFLOW_CONN_DINGDING_DEFAULT="{\"conn_type\": \"dingding\", \"host\": \"https://oapi.dingtalk.com\", \"password\": \"${DINGDING_TOKEN}\"}"
```

Equivalent CLI setup:

```bash
export DINGDING_TOKEN='your-custom-robot-token'

airflow connections add 'dingding_default' \
  --conn-json "{\"conn_type\": \"dingding\", \"host\": \"https://oapi.dingtalk.com\", \"password\": \"${DINGDING_TOKEN}\"}"
```

UI setup:

- **Connection Id:** `dingding_default`
- **Connection Type:** `dingding`
- **Host:** `https://oapi.dingtalk.com` unless you need a different DingTalk endpoint
- **Password:** the webhook token only

## Send A Text Message With `DingdingOperator`

Use `DingdingOperator` when message delivery should be a normal task in the DAG graph.

```python
from airflow import DAG
from airflow.providers.dingding.operators.dingding import DingdingOperator
from pendulum import datetime


with DAG(
    dag_id="dingding_text_message_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    send_text_message = DingdingOperator(
        task_id="send_text_message",
        dingding_conn_id="dingding_default",
        message_type="text",
        message="Airflow run {{ run_id }} finished for DAG {{ dag.dag_id }}.",
        at_all=False,
    )
```

Key parameters:

- `dingding_conn_id`: Airflow connection id, defaulting to `dingding_default`
- `message_type`: one of `text`, `link`, `markdown`, `actionCard`, or `feedCard`
- `message`: string for `text`, dict payload for the rich message types
- `at_mobiles`: optional list of users to mention
- `at_all`: mention everyone in the group

## Send A Markdown Message

Markdown is the rich message type that still supports targeted mentions.

```python
from airflow import DAG
from airflow.providers.dingding.operators.dingding import DingdingOperator
from pendulum import datetime


with DAG(
    dag_id="dingding_markdown_message_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    send_markdown_message = DingdingOperator(
        task_id="send_markdown_message",
        dingding_conn_id="dingding_default",
        message_type="markdown",
        message={
            "title": "Airflow DingTalk alert",
            "text": "# DAG failed\n"
            "DAG: {{ dag.dag_id }}\n"
            "Run: {{ run_id }}\n"
            "See the Airflow task logs for details.",
        },
        at_mobiles=["156XXXXXXXX"],
        at_all=False,
    )
```

For `link`, `actionCard`, and `feedCard`, pass the message payload as the corresponding DingTalk robot payload dict. The provider sends that dict under the selected `message_type`.

## Use `DingdingHook` In Callbacks Or Python Task Code

Use `DingdingHook` when the message is assembled in Python or attached to a task callback.

Failure callback example:

```python
from airflow.providers.dingding.hooks.dingding import DingdingHook


def dingding_failure_callback(context) -> None:
    task_instance = context["ti"]
    message = (
        f"Task {task_instance.task_id} failed in DAG "
        f"{task_instance.dag_id} for run {task_instance.run_id}."
    )

    DingdingHook(
        dingding_conn_id="dingding_default",
        message_type="text",
        message=message,
        at_all=True,
    ).send()
```

Attach it to a DAG or task:

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from pendulum import datetime


with DAG(
    dag_id="dingding_callback_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    on_failure_callback=dingding_failure_callback,
) as dag:
    task = EmptyOperator(task_id="task")
```

## Common Usage Pattern

For most Airflow projects:

- keep the webhook token on `dingding_default`
- use `DingdingOperator` for visible notification tasks
- use `DingdingHook(...).send()` in callbacks when you only want alerts on failure or retry
- keep message bodies in `message`, where Airflow templating is supported

## Pitfalls

- Put only the webhook token in the connection password. Do not paste the full webhook URL there.
- `at_all=True` overrides `at_mobiles`.
- Only `message` is a templated field on `DingdingOperator`. If you need dynamic mention lists, build the message in Python and use `DingdingHook`.
- Rich message types other than `markdown` do not support reminding specific users through `at_mobiles`.
- If you omit the connection host, the provider posts to `https://oapi.dingtalk.com`.
- Install the provider everywhere Airflow imports DAG code. Import errors usually mean one scheduler, worker, or image is missing the package.

## Version Notes

- This guide targets `apache-airflow-providers-dingding==3.9.2`.
- PyPI lists support for Python 3.10, 3.11, 3.12, and 3.13.
- PyPI lists a minimum Airflow version of `2.11.0`.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-dingding/stable/`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-dingding/stable/operators.html`
- `DingdingOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-dingding/stable/_api/airflow/providers/dingding/operators/dingding/index.html`
- `DingdingHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-dingding/stable/_api/airflow/providers/dingding/hooks/dingding/index.html`
- `DingdingHook` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-dingding/stable/_modules/airflow/providers/dingding/hooks/dingding.html`
- Airflow connection management: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-dingding/`
