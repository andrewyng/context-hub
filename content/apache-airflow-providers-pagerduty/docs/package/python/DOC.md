---
name: package
description: "Apache Airflow provider for sending PagerDuty Events API alerts and callback notifications from DAGs"
metadata:
  languages: "python"
  versions: "5.2.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,pagerduty,events,alerts,notifications"
---

# apache-airflow-providers-pagerduty

Use `apache-airflow-providers-pagerduty` to send PagerDuty Events API v2 alerts from Airflow task code and callback notifications.

This package extends Apache Airflow. It is not a standalone PagerDuty REST client for managing incidents, services, schedules, or users.

This guide targets provider version `5.2.3`.

## What This Package Adds

The PagerDuty provider centers on Airflow-native event delivery through an Airflow connection:

- `PagerdutyEventsHook` for sending events from Python task code
- `send_pagerduty_notification(...)` for DAG or task callbacks
- PagerDuty connection handling so you can keep the routing key out of DAG source

Use this provider when Airflow needs to trigger or deduplicate PagerDuty alerts. Keep using a PagerDuty REST client outside this provider when you need broader account or incident-management APIs.

## Install

Install the provider into the same Airflow environment as every scheduler, worker, triggerer, and webserver process that imports your DAGs.

Start from a pinned Airflow install and use the official constraints file for your Airflow and Python versions:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.2.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-pagerduty==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep the Airflow core package pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-pagerduty==5.2.3"
```

Useful checks after installation:

```bash
airflow providers list | grep pagerduty
airflow info
```

## Configure The PagerDuty Connection

Create a PagerDuty Events API integration in PagerDuty and copy its **routing key**. That routing key is what this provider sends with each event.

Recommended Airflow connection fields:

- **Connection Id:** `pagerduty_default`
- **Connection Type:** `pagerduty`
- **Host:** `events.pagerduty.com`
- **Password:** your PagerDuty Events API v2 routing key

Example with the Airflow CLI:

```bash
export PAGERDUTY_EVENTS_HOST='events.pagerduty.com'
export PAGERDUTY_ROUTING_KEY='<pagerduty-events-routing-key>'

airflow connections add 'pagerduty_default' \
  --conn-type 'pagerduty' \
  --conn-host "$PAGERDUTY_EVENTS_HOST" \
  --conn-password "$PAGERDUTY_ROUTING_KEY"
```

Confirm the connection before you wire it into a DAG:

```bash
airflow connections get pagerduty_default
```

Practical notes:

- Use a PagerDuty **Events API routing key**, not a PagerDuty REST API token.
- Keep the routing key in the Airflow connection or a secrets backend instead of hard-coding it in DAG files.
- Use a stable `dedup_key` when you want repeated events to collapse into the same PagerDuty incident.

## Send An Event From Python With `PagerdutyEventsHook`

Use `PagerdutyEventsHook` when the event payload depends on task logic or Airflow runtime context.

```python
from airflow import DAG
from airflow.decorators import get_current_context, task
from airflow.providers.pagerduty.hooks.pagerduty_events import PagerdutyEventsHook
from pendulum import datetime


with DAG(
    dag_id="pagerduty_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def trigger_pagerduty_event() -> None:
        context = get_current_context()

        hook = PagerdutyEventsHook()
        hook.send_event(
            summary=f"Airflow failure in {context['dag'].dag_id}",
            severity="critical",
            source="airflow",
            dedup_key=f"{context['dag'].dag_id}:{context['run_id']}",
            custom_details={
                "dag_id": context["dag"].dag_id,
                "task_id": context["ti"].task_id,
                "run_id": context["run_id"],
                "log_url": context["ti"].log_url,
            },
        )

    trigger_pagerduty_event()
```

Important details:

- `summary`, `severity`, and `source` are the core event fields you should set explicitly.
- `dedup_key` is the field you keep stable when the same logical alert should update the same PagerDuty incident.
- `custom_details` is the right place for DAG metadata such as `dag_id`, `task_id`, `run_id`, and a log URL.

Use the hook inside a Python task when the event body is assembled dynamically from task output or execution context.

## Use PagerDuty Notifications For Callbacks

Use `send_pagerduty_notification(...)` when you want PagerDuty alerting attached to a DAG or task callback instead of adding a standalone task node.

```python
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.providers.pagerduty.notifications.pagerduty import (
    send_pagerduty_notification,
)
from pendulum import datetime


with DAG(
    dag_id="pagerduty_failure_callback_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    on_failure_callback=send_pagerduty_notification(
        summary="Airflow task failed: {{ ti.task_id }}",
        severity="critical",
        source="airflow",
        dedup_key="{{ dag.dag_id }}:{{ run_id }}",
        custom_details={
            "dag_id": "{{ dag.dag_id }}",
            "task_id": "{{ ti.task_id }}",
            "run_id": "{{ run_id }}",
            "log_url": "{{ ti.log_url }}",
        },
    ),
) as dag:
    start = EmptyOperator(task_id="start")
```

Use this path when PagerDuty is an alerting side effect of a failure callback rather than a first-class task in the DAG graph.

## Operational Checks

Check the provider import path and connection before debugging payload details:

```bash
airflow providers list | grep pagerduty
airflow connections get pagerduty_default
```

Run a task-level test after the provider and connection are in place:

```bash
airflow tasks test pagerduty_hook_example trigger_pagerduty_event 2026-03-12
```

Use `airflow tasks test` for quick feedback on imports, connection lookup, and Python task logic without waiting for a full scheduler-driven DAG run.

## Common Pitfalls

- Using a PagerDuty REST API token instead of an Events API v2 routing key.
- Installing the provider only on the scheduler. Workers and any process that imports DAG files also need the package.
- Letting `dedup_key` change on every retry when you actually want repeated failures to map to the same incident.
- Treating this provider like a general PagerDuty SDK. Its practical role in Airflow is event delivery and callback-based notification.
- Forgetting that workers need outbound network access to PagerDuty's events endpoint.

## Minimal Decision Guide

- Use `PagerdutyEventsHook` inside a Python task when the event payload is assembled dynamically.
- Use `send_pagerduty_notification(...)` for DAG-level or task-level callbacks.
- Keep the routing key in an Airflow connection and reference the connection id from DAG code.
- Keep Airflow and provider versions pinned together when you install or upgrade.

## Version Notes

- This guide covers `apache-airflow-providers-pagerduty` version `5.2.3`.
- Airflow provider packages are versioned separately from Apache Airflow core, so install or upgrade them with an explicit Airflow pin.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-pagerduty/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-pagerduty/stable/index.html`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-pagerduty/`
