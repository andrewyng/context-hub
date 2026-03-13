---
name: package
description: "Airflow provider for triggering and monitoring Fivetran connector syncs from DAGs"
metadata:
  languages: "python"
  versions: "1.1.4"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,fivetran,elt,operators,sensors"
---

# Airflow Provider Fivetran Python Guide

Use `airflow-provider-fivetran` when an Apache Airflow DAG needs to trigger a sync for an existing Fivetran connector and optionally wait for that sync to finish.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone Fivetran SDK.
- Keep the Fivetran API key and API secret in an Airflow connection such as `fivetran_default` instead of hard-coding them in DAG files.
- Pass the Fivetran connector id to your tasks. The provider works with an already-created connector in Fivetran.
- Use `FivetranOperator` to start a sync and `FivetranSensor` when you want the wait step as a separate Airflow task.

## What This Package Adds

The maintainer examples for this package center on these DAG entry points:

- `FivetranOperator`
- `FivetranSensor`

The package imports use the `fivetran_provider_async` module name even though the PyPI package name is `airflow-provider-fivetran`.

## Install

Install the provider into the same Python environment or container image used by your Airflow scheduler, webserver, and workers:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "airflow-provider-fivetran==1.1.4"
```

If Airflow is already installed, keep the Airflow version pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "airflow-provider-fivetran==1.1.4"
```

Useful checks after installation:

```bash
python -c "from fivetran_provider_async.operators import FivetranOperator; from fivetran_provider_async.sensors import FivetranSensor; print('ok')"
airflow info
```

## Configure The Airflow Connection

Start with a minimal Airflow environment and keep Fivetran credentials out of DAG code:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
export FIVETRAN_API_KEY="<your-fivetran-api-key>"
export FIVETRAN_API_SECRET="<your-fivetran-api-secret>"
export FIVETRAN_CONNECTOR_ID="<your-fivetran-connector-id>"
```

Create an Airflow connection for the Fivetran account:

```bash
airflow connections add 'fivetran_default' \
  --conn-type 'fivetran' \
  --conn-login "$FIVETRAN_API_KEY" \
  --conn-password "$FIVETRAN_API_SECRET"
```

Confirm the connection exists before wiring it into a DAG:

```bash
airflow connections get fivetran_default
```

Keep secrets in Airflow connections or a secrets backend instead of embedding them in Python files.

## Common Workflow: Trigger A Connector Sync

Use `FivetranOperator` when a single Airflow task should request a sync for one connector.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from fivetran_provider_async.operators import FivetranOperator


FIVETRAN_CONNECTOR_ID = os.environ["FIVETRAN_CONNECTOR_ID"]


with DAG(
    dag_id="fivetran_trigger_sync",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["fivetran"],
):
    trigger_sync = FivetranOperator(
        task_id="trigger_sync",
        fivetran_conn_id="fivetran_default",
        connector_id=FIVETRAN_CONNECTOR_ID,
    )
```

Use this pattern when the DAG's job is simply to request a sync for a connector that already exists in Fivetran.

## Common Workflow: Trigger And Wait In Separate Tasks

Use a sensor when you want one task to request the sync and a second task to block until the connector finishes.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from fivetran_provider_async.operators import FivetranOperator
from fivetran_provider_async.sensors import FivetranSensor


FIVETRAN_CONNECTOR_ID = os.environ["FIVETRAN_CONNECTOR_ID"]


with DAG(
    dag_id="fivetran_trigger_and_wait",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["fivetran"],
):
    trigger_sync = FivetranOperator(
        task_id="trigger_sync",
        fivetran_conn_id="fivetran_default",
        connector_id=FIVETRAN_CONNECTOR_ID,
    )

    wait_for_sync = FivetranSensor(
        task_id="wait_for_sync",
        fivetran_conn_id="fivetran_default",
        connector_id=FIVETRAN_CONNECTOR_ID,
        poke_interval=60,
        timeout=60 * 60,
    )

    trigger_sync >> wait_for_sync
```

This split-task pattern is useful when downstream tasks should run only after Fivetran has finished the connector sync.

## Operational Checks

Confirm that Airflow can see the connection and DAG before you debug connector behavior:

```bash
airflow connections get fivetran_default
airflow dags list | grep fivetran
airflow tasks test fivetran_trigger_and_wait trigger_sync 2026-03-12
```

Use `airflow tasks test` for task-level debugging while you wire up credentials and connector ids.

## Common Pitfalls

- Install the provider everywhere DAG code runs. A working import in one container does not help if the scheduler or workers are missing the package.
- Keep the Fivetran API key and secret in the Airflow connection or a secrets backend instead of embedding them in DAG code.
- Pass the Fivetran connector id, not a group id or destination id.
- Make sure the connector already exists in Fivetran. This provider triggers and monitors syncs; it does not replace connector setup in the Fivetran UI.
- Increase the sensor `timeout` for long-running syncs so Airflow does not fail a healthy connector run too early.
- Keep `apache-airflow` pinned when installing or upgrading the provider so dependency resolution does not silently replace Airflow core.

## Version Notes

- This guide covers `airflow-provider-fivetran` version `1.1.4`.
- The provider version is separate from Apache Airflow core. Check the package repository and release notes before upgrading it independently of Airflow.

## Official Docs

- Maintainer repository: `https://github.com/fivetran/airflow-provider-fivetran`
- PyPI: `https://pypi.org/project/airflow-provider-fivetran/`
