---
name: package
description: "Apache Airflow Databricks provider for submitting Jobs runs and triggering existing Databricks jobs from Python DAGs"
metadata:
  languages: "python"
  versions: "7.10.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,databricks,jobs,dag,python"
---

# apache-airflow-providers-databricks

Use `apache-airflow-providers-databricks` when an Airflow DAG needs to submit a one-time Databricks job run or trigger an existing Databricks job through an Airflow connection.

This guide targets provider version `7.10.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
pip install apache-airflow-providers-databricks==7.10.0
```

In practice, the scheduler, workers, and any other component that imports DAG files must all have the provider installed.

If you are bootstrapping Airflow itself, install Airflow first with the official constraints guidance from the main Airflow docs, then add the provider to that same environment.

## Configure The Airflow Connection

The provider uses an Airflow connection referenced by `databricks_conn_id`, typically `databricks_default`.

Create a Databricks connection in the Airflow UI or via your secrets backend, then reuse that connection id in operators and hooks.

Values you usually need available when creating the connection:

```bash
export DATABRICKS_HOST="https://<your-workspace-host>"
export DATABRICKS_TOKEN="<your-databricks-token>"
```

Connection fields to fill in:

- `Conn Id`: `databricks_default` or another stable connection id
- `Conn Type`: `Databricks`
- workspace host URL
- Databricks access token or other credential material supported by your Airflow connection setup

Keep credentials in Airflow connections or a secrets backend instead of hard-coding them in DAG files.

## Submit A One-Time Databricks Run

Use `DatabricksSubmitRunOperator` when the DAG should submit a run directly from a Databricks Jobs API-style payload instead of triggering an already-created job.

```python
from __future__ import annotations

from airflow import DAG
from airflow.providers.databricks.operators.databricks import (
    DatabricksSubmitRunOperator,
)
from pendulum import datetime


with DAG(
    dag_id="databricks_submit_run_demo",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["databricks"],
) as dag:
    submit_one_time_run = DatabricksSubmitRunOperator(
        task_id="submit_one_time_run",
        databricks_conn_id="databricks_default",
        json={
            "run_name": "airflow-submit-run",
            "new_cluster": {
                "spark_version": "13.3.x-scala2.12",
                "node_type_id": "i3.xlarge",
                "num_workers": 1,
            },
            "notebook_task": {
                "notebook_path": "/Shared/airflow-demo",
                "base_parameters": {
                    "run_date": "{{ ds }}",
                    "source": "airflow",
                },
            },
        },
    )
```

Important details:

- The `json` argument mirrors the Databricks Jobs Runs Submit request body.
- Cluster fields such as `spark_version` and `node_type_id` must match values that exist in your Databricks workspace.
- Template only the parameters that truly vary per run; keep the rest of the job spec stable.

## Trigger An Existing Databricks Job

Use `DatabricksRunNowOperator` when the Databricks job already exists and the DAG should launch that saved job definition.

```python
from __future__ import annotations

from airflow import DAG
from airflow.providers.databricks.operators.databricks import DatabricksRunNowOperator
from pendulum import datetime


with DAG(
    dag_id="databricks_run_now_demo",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["databricks"],
) as dag:
    trigger_existing_job = DatabricksRunNowOperator(
        task_id="trigger_existing_job",
        databricks_conn_id="databricks_default",
        job_id=123456789012345,
        notebook_params={
            "run_date": "{{ ds }}",
            "source": "airflow",
        },
    )
```

Use this pattern when:

- the job is managed primarily in Databricks
- Airflow is only responsible for scheduling or dependency control
- you want Databricks-side edits to the saved job to apply without rewriting the DAG's full run payload

## Choosing Between `submit_run` And `run_now`

- Use `DatabricksSubmitRunOperator` when the DAG owns the one-off run definition.
- Use `DatabricksRunNowOperator` when the job already exists in Databricks and Airflow should only trigger it.

If a task becomes hard to read because the `json` payload is large, move the payload into a Python variable or helper module in your DAG repository rather than inlining hundreds of lines inside the operator call.

## Operational Checks

Confirm the provider is installed:

```bash
airflow providers list | grep databricks
```

Confirm the Airflow connection exists:

```bash
airflow connections get databricks_default
```

Check that Airflow can parse and test the DAG:

```bash
airflow dags list
airflow tasks test databricks_submit_run_demo submit_one_time_run 2026-03-12
```

Use `airflow tasks test` for isolated task debugging before you rely on scheduler-triggered runs.

## Common Pitfalls

- Installing the provider only in a local shell instead of in the actual Airflow runtime image.
- Hard-coding workspace URLs or tokens directly in the DAG instead of using an Airflow connection.
- Copying a `new_cluster` block from another workspace without checking `spark_version`, node type, or policy constraints.
- Using `submit_run` when the real requirement is to trigger a long-lived, separately managed Databricks job.
