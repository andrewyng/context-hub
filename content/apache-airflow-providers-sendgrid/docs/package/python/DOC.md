---
name: package
description: "Apache Airflow SendGrid provider for configuring Airflow email delivery through SendGrid connections and the SendGrid email backend"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,sendgrid,email,python,notifications"
---

# apache-airflow-providers-sendgrid

Use `apache-airflow-providers-sendgrid` when your Airflow deployment should send Airflow email through SendGrid instead of a local SMTP relay.

This package extends Apache Airflow. It is not the standalone `sendgrid` SDK for general Python applications.

This guide targets provider version `4.2.1`.

## What This Package Adds

The SendGrid provider plugs a SendGrid-backed emailer into Airflow's normal email path:

- a SendGrid email backend at `airflow.providers.sendgrid.utils.emailer.send_email`
- an Airflow connection you reference by id, commonly `sendgrid_default`
- compatibility with Airflow's built-in email utilities and email-on-failure settings

In practice, you configure the backend once, store the SendGrid API key in an Airflow connection, and then use Airflow's standard email APIs.

## Install

Install the provider in the same Python environment or container image as every Airflow component that imports DAGs or sends email:

```bash
python -m pip install "apache-airflow-providers-sendgrid==4.2.1"
```

If you manage Airflow with a constraints file, keep `apache-airflow` pinned alongside the provider instead of upgrading the provider in isolation.

Useful checks after installation:

```bash
airflow providers list | grep sendgrid
airflow info
```

## Configure A SendGrid Connection

Create a SendGrid API key in your SendGrid account, then store it in an Airflow connection instead of hard-coding it in DAG code.

Set shell variables first:

```bash
export SENDGRID_API_KEY='SG.your-api-key'
export AIRFLOW_SEND_FROM='airflow@example.com'
```

Then create the Airflow connection:

```bash
airflow connections add 'sendgrid_default' \
  --conn-type 'sendgrid' \
  --conn-password "$SENDGRID_API_KEY"
```

Confirm the connection exists:

```bash
airflow connections get sendgrid_default
```

Use a dedicated connection id if different DAGs should use different SendGrid credentials, but pass that id explicitly in your Airflow email config.

## Wire SendGrid Into Airflow Email Settings

Point Airflow's email backend at the provider and set a sender address:

```bash
export AIRFLOW__EMAIL__EMAIL_BACKEND='airflow.providers.sendgrid.utils.emailer.send_email'
export AIRFLOW__EMAIL__EMAIL_CONN_ID='sendgrid_default'
export AIRFLOW__EMAIL__FROM_EMAIL="$AIRFLOW_SEND_FROM"
```

The equivalent `airflow.cfg` section is:

```ini
[email]
email_backend = airflow.providers.sendgrid.utils.emailer.send_email
email_conn_id = sendgrid_default
from_email = airflow@example.com
```

This is the key setup step. Without `AIRFLOW__EMAIL__EMAIL_BACKEND`, Airflow will keep using whatever email backend is already configured.

## Send Email From Task Code

Once the backend is configured, use Airflow's email utility from Python task code instead of calling SendGrid's HTTP API directly.

```python
from airflow import DAG
from airflow.decorators import get_current_context, task
from airflow.utils.email import send_email
from pendulum import datetime


with DAG(
    dag_id="sendgrid_email_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def notify_with_sendgrid() -> None:
        context = get_current_context()

        send_email(
            to=["ops@example.com"],
            subject=f"Airflow run {context['run_id']} finished",
            html_content=(
                f"<p>DAG: {context['dag'].dag_id}</p>"
                f"<p>Task: {context['ti'].task_id}</p>"
                f"<p>Logical date: {context['ds']}</p>"
            ),
        )

    notify_with_sendgrid()
```

The important pattern is:

1. configure the SendGrid provider as Airflow's email backend
2. import `send_email` from `airflow.utils.email`
3. pass normal Airflow email fields such as `to`, `subject`, and `html_content`

This keeps your DAG code tied to Airflow's public email API instead of a provider-specific HTTP client.

## Use Built-In Failure Emails

If you want failures to send mail automatically, configure email recipients in the DAG and let Airflow use the SendGrid backend behind the scenes:

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from pendulum import datetime


with DAG(
    dag_id="sendgrid_failure_email_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    default_args={
        "email": ["ops@example.com"],
        "email_on_failure": True,
        "email_on_retry": False,
    },
) as dag:
    start = EmptyOperator(task_id="start")
```

This is the simplest setup when you want Airflow's built-in task and DAG failure emails to go through SendGrid without adding a dedicated notification task.

## Operational Checks

Check the provider, connection, and active backend before debugging DAG code:

```bash
airflow providers list | grep sendgrid
airflow connections get sendgrid_default
airflow config get-value email email_backend
airflow config get-value email email_conn_id
```

Run a task-level test after you wire up the connection and backend:

```bash
airflow tasks test sendgrid_email_example notify_with_sendgrid 2026-03-12
```

Use `airflow tasks test` when you need fast feedback on imports, connection lookup, and task logic without waiting for a full scheduler-driven run.

## Common Pitfalls

- Installing the provider only on the scheduler. Workers and any other process that imports DAG code also need it.
- Creating the SendGrid connection but forgetting to set `AIRFLOW__EMAIL__EMAIL_BACKEND`.
- Storing the API key directly in DAG source instead of an Airflow connection or secrets backend.
- Forgetting to set `from_email` in Airflow email config.
- Treating this provider like the standalone SendGrid SDK. In Airflow, the normal entry point is `airflow.utils.email.send_email` after backend configuration.

## Version Notes

- This guide covers `apache-airflow-providers-sendgrid` version `4.2.1`.
- Airflow provider packages are versioned separately from Apache Airflow core, so keep your Airflow installation strategy and provider pins aligned.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-sendgrid/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-sendgrid/stable/index.html`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-sendgrid/`
