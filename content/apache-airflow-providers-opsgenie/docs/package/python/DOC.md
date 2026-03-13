---
name: package
description: "Apache Airflow provider for creating and closing Opsgenie alerts from DAGs"
metadata:
  languages: "python"
  versions: "5.10.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,opsgenie,alerts,incident-management,dag"
---

# Apache Airflow Providers Opsgenie Guide

Use `apache-airflow-providers-opsgenie` to send alert actions from Airflow DAGs into Opsgenie through Airflow connections, hooks, and operators.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Opsgenie client.
- Store the Opsgenie API key in an Airflow connection such as `opsgenie_default` instead of hard-coding it in DAG files.
- Use a stable alert `alias` when you may need to close or deduplicate the same alert later.

## Install

Start from an Airflow installation that uses the official constraints file for your Airflow and Python versions, then add the Opsgenie provider in the same command.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.10.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-opsgenie==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-opsgenie==5.10.1"
```

Useful checks after installation:

```bash
airflow providers list | grep opsgenie
airflow info
```

## Authentication And Connection Setup

Most DAG code uses the conventional connection ID `opsgenie_default`, and provider APIs let you override it with `opsgenie_conn_id`.

Create shell variables for your Opsgenie account first:

```bash
export OPSGENIE_API_KEY="<opsgenie-api-key>"
export OPSGENIE_HOST="api.opsgenie.com"
```

If your account uses the EU region, set:

```bash
export OPSGENIE_HOST="api.eu.opsgenie.com"
```

Then create the Airflow connection:

```bash
airflow connections add 'opsgenie_default' \
  --conn-type 'opsgenie' \
  --conn-host "$OPSGENIE_HOST" \
  --conn-password "$OPSGENIE_API_KEY"
```

Confirm the connection exists before you wire it into a DAG:

```bash
airflow connections get opsgenie_default
```

## Common Workflow: Create And Close An Alert From A DAG

Use a create operator to open the alert and a close operator that refers to the same `alias`.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.opsgenie.operators.opsgenie import (
    OpsgenieCloseAlertOperator,
    OpsgenieCreateAlertOperator,
)


with DAG(
    dag_id="opsgenie_alert_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["opsgenie"],
):
    create_alert = OpsgenieCreateAlertOperator(
        task_id="create_alert",
        opsgenie_conn_id="opsgenie_default",
        message="Airflow pipeline needs attention",
        alias="airflow-opsgenie-demo-{{ ds_nodash }}",
        description="Investigate the DAG run in Airflow",
        source="airflow",
        priority="P3",
        tags=["airflow", "demo"],
        details={
            "dag_id": "{{ dag.dag_id }}",
            "run_id": "{{ run_id }}",
        },
        responders=[
            {"name": "platform-oncall", "type": "team"},
        ],
    )

    close_alert = OpsgenieCloseAlertOperator(
        task_id="close_alert",
        opsgenie_conn_id="opsgenie_default",
        identifier="airflow-opsgenie-demo-{{ ds_nodash }}",
        identifier_type="alias",
        note="Closed by Airflow after successful follow-up work",
    )

    create_alert >> close_alert
```

This pattern is useful when you want Airflow itself to own the alert lifecycle instead of calling the Opsgenie REST API manually inside a Python task.

## Common Workflow: Create An Alert From Python Code In A Task

Use the hook when you need normal Python control flow inside a task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.opsgenie.hooks.opsgenie import OpsgenieAlertHook


with DAG(
    dag_id="opsgenie_hook_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["opsgenie"],
):
    @task()
    def notify_opsgenie() -> None:
        hook = OpsgenieAlertHook(opsgenie_conn_id="opsgenie_default")
        hook.create_alert(
            message="Warehouse sync failed",
            alias="warehouse-sync-demo",
            description="Check the Airflow task log for details",
            source="airflow",
            priority="P2",
            tags=["airflow", "warehouse"],
            details={
                "dag_id": "opsgenie_hook_demo",
                "task_id": "notify_opsgenie",
            },
        )

    notify_opsgenie()
```

Use the operator form when you want a declarative DAG node. Use the hook form when the alert payload depends on Python logic in the task body.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep opsgenie
airflow dags list | grep opsgenie
```

Run an isolated task test while you wire up the connection and payload:

```bash
airflow tasks test opsgenie_alert_demo create_alert 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Use a normal DAG trigger when you need scheduler behavior, retries, callbacks, and downstream tasks to participate.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Hard-coding the API key in DAG code: keep it in the Airflow connection instead.
- Reusing a vague `alias`: use an alias format that matches how your team identifies alerts and closes them later.
- Forgetting the Opsgenie region host: use `api.eu.opsgenie.com` for EU accounts instead of the default US host.
- Relying on an implicit connection name: pass `opsgenie_conn_id` explicitly when a DAG does not use `opsgenie_default`.

## Version Notes

- This guide covers `apache-airflow-providers-opsgenie` version `5.10.1`.
- Keep `apache-airflow` pinned when installing or upgrading the provider so `pip` does not silently change your Airflow core version.
