---
name: package
description: "Apache Airflow provider for triggering and monitoring Airbyte connection syncs from DAGs"
metadata:
  languages: "python"
  versions: "5.3.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,airbyte,elt,operators,sensors"
---

# Apache Airflow Providers Airbyte Guide

Use `apache-airflow-providers-airbyte` when an Airflow DAG needs to start an Airbyte sync for an existing Airbyte connection and optionally wait for that sync job to finish.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone Airbyte SDK.
- Keep Airbyte server details and any authentication on an Airflow connection such as `airbyte_default` instead of hard-coding them in DAG files.
- Pass the Airbyte connection UUID to `connection_id`. That value identifies the Airbyte source-to-destination connection inside Airbyte; it is not the Airflow connection id.
- Use `AirbyteTriggerSyncOperator` to start the sync and `AirbyteJobSensor` when you want the wait step as a separate task.

## What This Package Adds

The Airbyte provider's main entry points are:

- `AirbyteTriggerSyncOperator`
- `AirbyteJobSensor`
- `AirbyteHook`

These are the classes most DAGs use from this provider.

## Install

Install the provider into the same Airflow environment used by your scheduler, webserver, triggerer, and workers.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.3.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-airbyte==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-airbyte==5.3.2"
```

Useful checks after installation:

```bash
airflow providers list | grep airbyte
python -c "from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator; from airflow.providers.airbyte.sensors.airbyte import AirbyteJobSensor; print('ok')"
```

## Configure The Airflow Connection

Start with a basic Airflow environment and keep the Airbyte server address outside the DAG file:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
export AIRBYTE_HOST="airbyte.example.internal"
export AIRBYTE_PORT="8000"
export AIRBYTE_CONNECTION_ID="<your-airbyte-connection-uuid>"
```

Create an Airflow connection for the Airbyte server:

```bash
airflow connections add 'airbyte_default' \
  --conn-type 'airbyte' \
  --conn-host "$AIRBYTE_HOST" \
  --conn-port "$AIRBYTE_PORT"
```

Confirm the connection exists before you wire it into a DAG:

```bash
airflow connections get airbyte_default
```

If your Airbyte deployment requires authentication or extra connection settings, put those values on the Airflow connection itself instead of embedding them in DAG code.

## Common Workflow: Trigger A Sync And Wait In One Task

Use a synchronous operator run when one task should both start the Airbyte job and keep polling until the job finishes.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator


AIRBYTE_CONNECTION_ID = os.environ["AIRBYTE_CONNECTION_ID"]


with DAG(
    dag_id="airbyte_sync_connection",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["airbyte"],
):
    trigger_sync = AirbyteTriggerSyncOperator(
        task_id="trigger_sync",
        airbyte_conn_id="airbyte_default",
        connection_id=AIRBYTE_CONNECTION_ID,
        asynchronous=False,
        timeout=60 * 60,
        wait_seconds=3,
    )
```

Use this when the DAG only needs one Airbyte task and you do not need a separate sensor step.

## Common Workflow: Trigger Asynchronously And Wait With A Sensor

Use this pattern when you want the trigger and wait phases to be separate tasks.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from airflow.providers.airbyte.operators.airbyte import AirbyteTriggerSyncOperator
from airflow.providers.airbyte.sensors.airbyte import AirbyteJobSensor


AIRBYTE_CONNECTION_ID = os.environ["AIRBYTE_CONNECTION_ID"]


with DAG(
    dag_id="airbyte_async_connection",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["airbyte"],
):
    trigger_sync = AirbyteTriggerSyncOperator(
        task_id="trigger_sync",
        airbyte_conn_id="airbyte_default",
        connection_id=AIRBYTE_CONNECTION_ID,
        asynchronous=True,
    )

    wait_for_sync = AirbyteJobSensor(
        task_id="wait_for_sync",
        airbyte_conn_id="airbyte_default",
        airbyte_job_id=trigger_sync.output,
    )

    trigger_sync >> wait_for_sync
```

The important handoff is `airbyte_job_id=trigger_sync.output`: the operator returns the Airbyte job id, and the sensor polls that job until it reaches a terminal state.

## Configuration Pattern

For most DAGs, a clean split is:

- keep the Airbyte server address and any credentials on `airbyte_default` or another named Airflow connection
- keep the Airbyte connection UUID in an environment variable, Airflow Variable, or another deployment-specific config source
- use `AirbyteTriggerSyncOperator` when the task only needs to start one Airbyte sync
- add `AirbyteJobSensor` when downstream work should not begin until the Airbyte job finishes

## Pitfalls

- Install the provider everywhere Airflow imports DAG code. A missing package on a worker or task image causes import failures even if the scheduler has it.
- Do not confuse `airbyte_conn_id` with `connection_id`. `airbyte_conn_id` is the Airflow connection name; `connection_id` is the Airbyte connection UUID.
- Keep Airbyte server details out of DAG source. Put host, port, and credentials on the Airflow connection or a secrets backend.
- Make sure the Airbyte server is reachable from the worker environment, not just from your laptop or the Airflow web UI.
- Keep `apache-airflow` pinned when adding or upgrading the provider so `pip` does not silently change your Airflow core version.

## Version Notes

- This guide covers `apache-airflow-providers-airbyte` version `5.3.2`.
- Airflow provider packages are versioned independently from Apache Airflow core and from Airbyte itself, so check provider compatibility before changing Airflow or provider pins in production.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-airbyte/stable/`
- Airbyte connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-airbyte/stable/connections/airbyte.html`
- `AirbyteHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-airbyte/stable/_api/airflow/providers/airbyte/hooks/airbyte/index.html`
- `AirbyteTriggerSyncOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-airbyte/stable/_api/airflow/providers/airbyte/operators/airbyte/index.html`
- `AirbyteJobSensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-airbyte/stable/_api/airflow/providers/airbyte/sensors/airbyte/index.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-airbyte/`
