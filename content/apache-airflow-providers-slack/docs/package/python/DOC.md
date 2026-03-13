---
name: package
description: "Apache Airflow Slack provider guide for posting messages, sending webhooks, and using Slack hooks from Python DAGs"
metadata:
  languages: "python"
  versions: "9.7.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "apache-airflow,airflow,slack,python,operators,hooks,notifications"
---

# Apache Airflow Slack Provider Guide

This package adds Slack operators and hooks to Apache Airflow. Install it into an Airflow environment, then reference Airflow connection IDs from your DAG code instead of hard-coding Slack secrets in tasks.

## Install

Install the provider in the same Python environment as Airflow:

```bash
python -m pip install "apache-airflow-providers-slack==9.7.0"
```

If you manage Airflow dependencies with a constraints file, keep the provider pinned with the Airflow version your deployment supports instead of upgrading it in isolation.

## Choose The Right Auth Path

The provider supports two common Slack paths:

- **Slack Web API**: use a bot token when you want to call Slack API methods such as posting a message to a channel
- **Incoming Webhook**: use a webhook URL when you only need to send a fixed webhook-style message

Keep the raw secrets outside your DAG code:

```bash
export SLACK_API_TOKEN='xoxb-your-bot-token'
export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
```

In Airflow, create connections that hold those secrets and reference them by ID from the provider:

- `slack_api_alerts`: a Slack API connection backed by the bot token
- `slack_webhook_alerts`: a Slack Incoming Webhook connection backed by the webhook URL

The provider code then reads `slack_conn_id` or `slack_webhook_conn_id`; operators and hooks do not need the raw token in the constructor.

## Post A Message With `SlackAPIPostOperator`

Use `SlackAPIPostOperator` when you want a normal Slack API `chat.postMessage` call from a DAG task.

```python
from airflow import DAG
from airflow.providers.slack.operators.slack import SlackAPIPostOperator
from pendulum import datetime

with DAG(
    dag_id="slack_api_post_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    post_summary = SlackAPIPostOperator(
        task_id="post_summary",
        slack_conn_id="slack_api_alerts",
        channel="#data-alerts",
        text="Airflow run {{ run_id }} finished for DAG {{ dag.dag_id }}.",
    )
```

Use this path when you need channel-based posting, richer Slack API access, or follow-up API calls from the same connection.

## Send A Webhook Message With `SlackWebhookOperator`

Use `SlackWebhookOperator` when your team already has a Slack incoming webhook and you only need to send a message payload.

```python
from airflow import DAG
from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator
from pendulum import datetime

with DAG(
    dag_id="slack_webhook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    send_webhook_message = SlackWebhookOperator(
        task_id="send_webhook_message",
        slack_webhook_conn_id="slack_webhook_alerts",
        message="Daily load for {{ ds }} finished successfully.",
        blocks=[
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Daily load complete* for `{{ ds }}`.",
                },
            }
        ],
    )
```

This is the simplest path when you do not need broader Slack Web API methods.

## Use Hooks Inside Python Tasks

When you need runtime logic instead of a single purpose-built operator, use the provider hooks.

### Slack Web API hook

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.slack.hooks.slack import SlackHook
from pendulum import datetime

with DAG(
    dag_id="slack_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def notify_row_count(row_count: int) -> None:
        hook = SlackHook(slack_conn_id="slack_api_alerts")
        hook.client.chat_postMessage(
            channel="#data-alerts",
            text=f"Loaded {row_count} rows into the warehouse.",
        )

    notify_row_count(1250)
```

### Incoming webhook hook

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.slack.hooks.slack_webhook import SlackWebhookHook
from pendulum import datetime

with DAG(
    dag_id="slack_webhook_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def notify_failure() -> None:
        hook = SlackWebhookHook(slack_webhook_conn_id="slack_webhook_alerts")
        hook.send(text="The DAG failed. Check the Airflow task logs for details.")

    notify_failure()
```

Use the API hook when you need to call Slack methods directly. Use the webhook hook when the webhook itself is the integration boundary.

## Common Patterns

### Keep Slack config in Airflow connections

Provider code expects connection IDs, so treat the connection as the boundary between Airflow code and Slack secrets. That keeps DAG files portable across local, staging, and production environments.

### Template message content with Airflow context

Operator fields such as `text` and `message` are good places for Jinja-templated Airflow context:

```python
text="Task {{ ti.task_id }} in DAG {{ dag.dag_id }} finished at {{ ts }}"
```

### Use the API path for richer Slack behavior

If you need more than a basic webhook payload, prefer the Slack Web API path with `SlackAPIPostOperator` or `SlackHook`. That gives you a normal Slack client and broader API method coverage.

## Common Pitfalls

- Do not pass raw bot tokens or webhook URLs directly in DAG code; store them in Airflow connections and reference the connection ID.
- `SlackAPIPostOperator` and `SlackHook` use a Slack API connection. `SlackWebhookOperator` and `SlackWebhookHook` use a webhook connection. Do not swap those IDs.
- A webhook integration is simpler, but it is not the same thing as a full Slack Web API client. Use the Web API path when you need API-level behavior beyond posting a webhook payload.
- Install this provider as part of an Airflow environment. The package imports from `airflow.providers.slack...` and is not a standalone Slack SDK.
- If Slack returns permission errors, fix the Slack app or webhook configuration instead of retrying the Airflow task blindly.

## Version Notes For `9.7.0`

- This guide targets `apache-airflow-providers-slack==9.7.0`.
- Airflow provider packages are versioned independently from Apache Airflow core, so check the provider docs and your Airflow dependency constraints together before upgrading.

## Official Sources

- Provider docs root: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/
- Package index: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/index.html
- Slack API operators: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/operators/slack_api.html
- Slack webhook operators: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/operators/slack_webhook.html
- `SlackHook` API reference: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/_api/airflow/providers/slack/hooks/slack/index.html
- `SlackWebhookHook` API reference: https://airflow.apache.org/docs/apache-airflow-providers-slack/stable/_api/airflow/providers/slack/hooks/slack_webhook/index.html
- PyPI package page: https://pypi.org/project/apache-airflow-providers-slack/
