---
name: package
description: "Apache Airflow SMTP provider for Airflow email backends, EmailOperator tasks, SmtpHook calls, and notifier callbacks"
metadata:
  languages: "python"
  versions: "2.4.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,smtp,email,python,dag,notifications"
---

# apache-airflow-providers-smtp

Use `apache-airflow-providers-smtp` when your Airflow deployment needs to send email through an SMTP server from DAG code, Airflow email alerts, or notifier callbacks.

This package extends Apache Airflow. It is not a general-purpose email library for non-Airflow applications.

This guide targets provider version `2.4.2`.

## What This Package Adds

The SMTP provider adds Airflow-specific email integrations built around an Airflow connection:

- `EmailOperator` for email-sending tasks in DAGs
- `SmtpHook` for sending mail from Python task code
- `send_smtp_notification(...)` for callback-style notifications
- an SMTP email backend you can wire into Airflow's global email settings

Use the Airflow connection id `smtp_default` unless you have a reason to create a separate SMTP connection.

## Install

Install the provider into the same Python environment or container image as every Airflow component that imports or executes DAG code:

```bash
python -m pip install "apache-airflow-providers-smtp==2.4.2"
```

In practice, the scheduler, workers, and any triggerer or webserver process that loads DAGs should all have the provider available.

## Configure The SMTP Connection

Create an Airflow connection with:

- **Connection Id:** `smtp_default`
- **Connection Type:** `smtp`
- **Host:** your SMTP host name
- **Port:** your provider's SMTP port, commonly `587` for STARTTLS or `465` for implicit TLS
- **Login / Password:** your SMTP credentials

You can also define the connection with an environment variable:

```bash
export AIRFLOW_CONN_SMTP_DEFAULT='smtp://smtp-user:smtp-password@smtp.example.com:587?disable_ssl=true&from_email=airflow%40example.com'
```

Practical notes:

- Use `disable_ssl=true` for a STARTTLS-style connection on port `587`.
- Use port `465` when your provider expects implicit TLS instead of STARTTLS.
- URL-encode reserved characters in usernames, passwords, and query values.
- Keep credentials in Airflow connections or a secrets backend instead of hard-coding them in DAG files.

If your SMTP relay requires a fixed sender address, set `from_email` on the connection or pass it directly in the operator, hook, or notifier call.

## Configure Airflow's Global Email Backend

If you want Airflow's built-in email features to use this provider, configure the email backend and connection id:

```bash
export AIRFLOW__EMAIL__EMAIL_BACKEND='airflow.providers.smtp.utils.emailer.send_email'
export AIRFLOW__EMAIL__EMAIL_CONN_ID='smtp_default'
export AIRFLOW__EMAIL__FROM_EMAIL='airflow@example.com'
```

Use this when you want task or DAG failure emails sent through the same SMTP connection instead of relying on older SMTP-only config blocks.

## Send An Email Task With `EmailOperator`

Use `EmailOperator` when email delivery is a first-class task in the DAG:

```python
from airflow import DAG
from airflow.providers.smtp.operators.smtp import EmailOperator
from pendulum import datetime


with DAG(
    dag_id="smtp_email_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    send_report = EmailOperator(
        task_id="send_report",
        conn_id="smtp_default",
        to=["ops@example.com"],
        subject="Nightly pipeline finished",
        html_content="""
        <h3>Pipeline complete</h3>
        <p>The nightly load finished successfully.</p>
        """,
        files=["/opt/airflow/reports/daily.csv"],
    )
```

Important details:

- `html_content` is the message body field used by the operator.
- `conn_id` points to an Airflow connection of type `smtp`.
- `files` takes file paths that must exist in the worker's filesystem when the task runs.
- `to`, `cc`, and `bcc` can be lists when you need multiple recipients.

## Send Mail From Python With `SmtpHook`

Use `SmtpHook` when a Python task needs to send mail directly:

```python
from airflow.decorators import task
from airflow.providers.smtp.hooks.smtp import SmtpHook


@task
def send_summary_email() -> None:
    hook = SmtpHook(smtp_conn_id="smtp_default")
    hook.send_email_smtp(
        to=["ops@example.com"],
        subject="Daily summary",
        html_content="<p>The daily job completed successfully.</p>",
    )
```

`SmtpHook` uses `smtp_conn_id`, not `conn_id`.

Use this path when the email depends on Python-side logic, generated content, or task output that is easier to assemble in code than in a dedicated operator.

## Use SMTP Notifications For Callbacks

Use `send_smtp_notification(...)` for DAG or task callbacks such as failure alerts:

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.providers.smtp.notifications.smtp import send_smtp_notification
from pendulum import datetime


with DAG(
    dag_id="smtp_failure_callback_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    on_failure_callback=send_smtp_notification(
        conn_id="smtp_default",
        to="ops@example.com",
        subject="Airflow task failed: {{ ti.task_id }}",
        html_content="""
        <p>DAG: {{ dag.dag_id }}</p>
        <p>Task: {{ ti.task_id }}</p>
        <p>Run id: {{ run_id }}</p>
        <p>Log URL: <a href="{{ ti.log_url }}">Open logs</a></p>
        """,
    ),
) as dag:
    start = EmptyOperator(task_id="start")
```

This pattern is useful when you want alerting tied to callback hooks instead of adding a standalone email task to the DAG graph.

## Common Pitfalls

- Install the provider everywhere DAG code is imported or executed, not only on the scheduler.
- Use `conn_id` with `EmailOperator` and `smtp_conn_id` with `SmtpHook`.
- For STARTTLS on port `587`, set `disable_ssl=true` on the connection so Airflow does not try implicit TLS.
- Ensure any file paths in `files=[...]` exist inside the worker container or runtime environment.
- Keep sender addresses and credentials in the connection or Airflow config instead of hard-coding them in DAG source.

## Minimal Decision Guide

- Use `EmailOperator` when sending the email is a visible DAG task.
- Use `SmtpHook` inside a Python task when the message is assembled programmatically.
- Use `send_smtp_notification(...)` for DAG or task callbacks.
- Configure `AIRFLOW__EMAIL__EMAIL_BACKEND` and `AIRFLOW__EMAIL__EMAIL_CONN_ID` when you want Airflow's built-in email path to use this provider globally.
