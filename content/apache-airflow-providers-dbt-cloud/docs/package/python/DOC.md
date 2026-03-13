---
name: package
description: "Apache Airflow provider for triggering and monitoring dbt Cloud job runs from DAGs"
metadata:
  languages: "python"
  versions: "4.6.5"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,dbt,dbt-cloud,operators,sensors,elt"
---

# Apache Airflow dbt Cloud Provider Guide

Use `apache-airflow-providers-dbt-cloud` when an Airflow DAG needs to start an existing dbt Cloud job, wait for the run to finish, and keep dbt Cloud credentials on an Airflow connection instead of in DAG source.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone dbt client.
- Keep the dbt Cloud host, API token, and account-specific settings on an Airflow connection such as `dbt_cloud_default`.
- Pass a dbt Cloud `job_id` to the operator. The provider triggers an existing dbt Cloud job; it does not create the job definition for you.
- Use `DbtCloudRunJobOperator` when one Airflow task should launch the run, and add `DbtCloudJobRunSensor` if you want the wait step to be a separate task.

## What This Package Adds

The provider's main entry points are:

- `DbtCloudRunJobOperator`
- `DbtCloudJobRunSensor`
- `DbtCloudHook`

Most DAGs only need the operator and, for asynchronous orchestration, the sensor.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment. Keep Airflow pinned in the same command so dependency resolution stays aligned with the Airflow constraints model.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.6.5"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-dbt-cloud==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Every Airflow runtime that parses or runs DAGs needs the provider installed, including the scheduler, webserver, triggerer, and workers.

Useful checks after installation:

```bash
airflow providers list | grep -i dbt
python -c "from airflow.providers.dbt.cloud.operators.dbt import DbtCloudRunJobOperator; from airflow.providers.dbt.cloud.sensors.dbt import DbtCloudJobRunSensor; print('ok')"
```

## Authentication And Connection Setup

Start with a minimal Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

Set the values you want to store on the Airflow connection and reuse in DAGs:

```bash
export DBT_CLOUD_HOST="https://cloud.getdbt.com"
export DBT_CLOUD_API_TOKEN="<dbt-cloud-api-token>"
export DBT_CLOUD_ACCOUNT_ID="<dbt-cloud-account-id>"
export DBT_CLOUD_JOB_ID="<dbt-cloud-job-id>"
```

Then create the Airflow connection:

```bash
airflow connections add 'dbt_cloud_default' \
  --conn-type 'dbt_cloud' \
  --conn-host "$DBT_CLOUD_HOST" \
  --conn-password "$DBT_CLOUD_API_TOKEN" \
  --conn-extra "{\"account_id\":\"${DBT_CLOUD_ACCOUNT_ID}\"}"
```

Confirm the connection before you wire it into a DAG:

```bash
airflow connections get dbt_cloud_default
```

Practical notes:

- If your dbt Cloud account uses a region-specific base URL, store that host on the Airflow connection instead of the default `https://cloud.getdbt.com`.
- Keep the token in the Airflow connection or a secrets backend, not in Python source.
- Keep the Airflow connection id stable and move environment-specific values into deployment config.

## Common Workflow: Trigger A dbt Cloud Job And Wait In One Task

Use `DbtCloudRunJobOperator` when a single Airflow task should both start the dbt Cloud run and wait for it to complete.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from airflow.providers.dbt.cloud.operators.dbt import DbtCloudRunJobOperator


DBT_CLOUD_JOB_ID = int(os.environ["DBT_CLOUD_JOB_ID"])


with DAG(
    dag_id="dbt_cloud_run_job",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["dbt-cloud"],
):
    run_dbt_cloud_job = DbtCloudRunJobOperator(
        task_id="run_dbt_cloud_job",
        dbt_cloud_conn_id="dbt_cloud_default",
        job_id=DBT_CLOUD_JOB_ID,
        check_interval=30,
        timeout=60 * 60,
    )
```

Use this pattern when the DAG only needs a simple task boundary around an existing dbt Cloud job.

The key arguments most teams set are:

- `dbt_cloud_conn_id`: Airflow connection id for dbt Cloud, usually `dbt_cloud_default`
- `job_id`: the existing dbt Cloud job to trigger
- `check_interval`: how often the operator polls run state while waiting
- `timeout`: maximum seconds to wait before the task fails

## Common Workflow: Trigger Asynchronously And Wait With A Sensor

Split the start and wait steps when you want a separate monitoring task in the DAG graph.

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from airflow.providers.dbt.cloud.operators.dbt import DbtCloudRunJobOperator
from airflow.providers.dbt.cloud.sensors.dbt import DbtCloudJobRunSensor


DBT_CLOUD_JOB_ID = int(os.environ["DBT_CLOUD_JOB_ID"])


with DAG(
    dag_id="dbt_cloud_run_job_async",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["dbt-cloud"],
):
    trigger_job = DbtCloudRunJobOperator(
        task_id="trigger_job",
        dbt_cloud_conn_id="dbt_cloud_default",
        job_id=DBT_CLOUD_JOB_ID,
        wait_for_termination=False,
    )

    wait_for_run = DbtCloudJobRunSensor(
        task_id="wait_for_run",
        dbt_cloud_conn_id="dbt_cloud_default",
        run_id=trigger_job.output,
        poke_interval=30,
        timeout=60 * 60,
    )

    trigger_job >> wait_for_run
```

This pattern keeps the DAG graph explicit and is the simplest way to reuse the run id emitted by the operator in a downstream monitoring step.

## When To Reach For `DbtCloudHook`

Use `DbtCloudHook` when task code needs lower-level control than the canned operator and sensor provide, but keep the same `dbt_cloud_conn_id` so credentials stay in Airflow's connection layer.

```python
from airflow.providers.dbt.cloud.hooks.dbt import DbtCloudHook


hook = DbtCloudHook(dbt_cloud_conn_id="dbt_cloud_default")
```

In most DAGs, start with `DbtCloudRunJobOperator` first and only drop down to the hook when you need custom task logic around the dbt Cloud API.

## Operational Checks

Confirm the provider is installed and the connection exists:

```bash
airflow providers list | grep -i dbt
airflow connections get dbt_cloud_default
airflow dags list
```

For isolated debugging, use `airflow tasks test` against the task that launches the job before you depend on a scheduler-triggered run.

## Common Pitfalls

- Installing the provider only in a local shell instead of in the actual Airflow runtime image.
- Confusing the Airflow connection id with dbt Cloud values such as `account_id` or `job_id`.
- Hard-coding the API token or account-specific settings directly in the DAG file.
- Pointing the Airflow connection at the wrong dbt Cloud host for your region.
- Using the separate sensor pattern without setting `wait_for_termination=False` on the operator.
- Assuming the provider creates dbt Cloud jobs. It triggers and monitors jobs that already exist in dbt Cloud.

## Version Notes

This guide targets `apache-airflow-providers-dbt-cloud` version `4.6.5`.

Airflow provider packages are versioned separately from Apache Airflow core, so pin the provider to the Airflow environment you actually run and re-check the provider docs before upgrading either one independently.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-dbt-cloud/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-dbt-cloud/stable/index.html`
- `DbtCloudHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-dbt-cloud/stable/_api/airflow/providers/dbt/cloud/hooks/dbt/index.html`
- `DbtCloudRunJobOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-dbt-cloud/stable/_api/airflow/providers/dbt/cloud/operators/dbt/index.html`
- `DbtCloudJobRunSensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-dbt-cloud/stable/_api/airflow/providers/dbt/cloud/sensors/dbt/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-dbt-cloud/`
