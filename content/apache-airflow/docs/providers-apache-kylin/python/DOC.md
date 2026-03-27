---
name: providers-apache-kylin
description: "Apache Airflow Kylin provider for running Kylin SQL and cube jobs from DAGs with Airflow-managed connections"
metadata:
  languages: "python"
  versions: "3.10.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,kylin,apache-kylin,olap,dag,python"
---

# apache-airflow-providers-apache-kylin

Use `apache-airflow-providers-apache-kylin` when an Airflow DAG needs to run Kylin SQL or trigger cube jobs against an Apache Kylin project through an Airflow connection.

This package is an Airflow provider, not a standalone Kylin client for ordinary Python applications.

This guide targets provider version `3.10.2`.

## Install

Install the provider into the same Python environment or container image as `apache-airflow`. In practice, that means the scheduler, webserver, and every worker that imports DAG code must have the provider available.

PyPI metadata for this package lists these minimum requirements:

- Python `>=3.10`
- `apache-airflow >=2.10.0`

For a fresh Airflow environment, install Airflow core first using the Airflow installation guide. Then add the Kylin provider alongside your pinned Airflow version:

```bash
AIRFLOW_VERSION="3.1.8"
PROVIDER_VERSION="3.10.2"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-kylin==${PROVIDER_VERSION}"
```

You do not initialize a separate SDK client package directly. Airflow imports the provider classes from your DAG code and uses an Airflow connection to reach Kylin.

## Prerequisites

Before using the provider, make sure your runtime already has:

- an Airflow deployment that can import this provider
- network access from Airflow task runtime to your Kylin server
- a Kylin project name and the cube or model names your DAG will operate on

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `kylin`. The default connection id used by the hook and operator is `kylin_default`.

The Kylin connection docs map the connection fields like this:

- Host: Kylin server hostname
- Project Name: Kylin project to use
- Username and Password: Kylin credentials
- Extra: optional JSON such as `{"timeout": 60, "is_debug": 1}`

If you prefer environment variables, Airflow supports `AIRFLOW_CONN_*` connection URIs. The provider docs show the Kylin DSN format as:

```bash
export AIRFLOW_CONN_KYLIN_DEFAULT='kylin://ADMIN:KYLIN@kylin.example.com/learn_kylin?timeout=60&is_debug=1'
```

Use the Airflow UI or `airflow connections get kylin_default` to confirm the connection resolves the host, project, and optional extras you expect.

Keep credentials and timeout/debug settings on the Airflow connection instead of hard-coding them in DAG files.

## Run Kylin SQL In A DAG

Use `SQLExecuteQueryOperator` when the task should run SQL through the Kylin connection.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="kylin_sql_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    show_tables = SQLExecuteQueryOperator(
        task_id="show_tables",
        conn_id="kylin_default",
        sql="SHOW TABLES",
    )
```

Use this pattern for SQL queries and lightweight administrative statements that should run as normal Airflow tasks.

## Trigger A Cube Job

Use `KylinCubeOperator` when the task should trigger a cube job such as `build`, `merge`, or `refresh`.

```python
from airflow import DAG
from airflow.providers.apache.kylin.operators.kylin_cube import KylinCubeOperator
from pendulum import datetime

with DAG(
    dag_id="kylin_cube_build_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    build_cube = KylinCubeOperator(
        task_id="build_cube",
        kylin_conn_id="kylin_default",
        project="learn_kylin",
        cube="kylin_sales_cube",
        command="build",
        start_time="{{ data_interval_start.int_timestamp * 1000 }}",
        end_time="{{ data_interval_end.int_timestamp * 1000 }}",
        is_track_job=True,
        interval=10,
        timeout=600,
    )
```

Important operator arguments:

- `project`: Kylin project name
- `cube`: cube or model identifier to operate on
- `command`: job action such as `build`, `merge`, `refresh`, `disable`, or `enable`
- `start_time` and `end_time`: time range for commands that operate on a segment window
- `is_track_job`: when `True`, the Airflow task waits until the Kylin job ends, errors, or times out
- `interval` and `timeout`: polling controls used when tracking the job

The API docs also expose `offset_start` and `offset_end` for streaming-oriented commands.

## Use The Hook In Python Tasks

Use `KylinHook` when a Python task needs to talk to Kylin directly instead of using a prebuilt operator.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.kylin.hooks.kylin import KylinHook
from pendulum import datetime

with DAG(
    dag_id="kylin_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def print_job_status(job_id: str) -> None:
        hook = KylinHook(
            kylin_conn_id="kylin_default",
            project="learn_kylin",
        )

        status = hook.get_job_status(job_id)
        print(status)

    print_job_status("your-kylin-job-id")
```

The provider hook exposes methods documented in the API reference, including:

- `get_conn()`
- `cube_run(...)`
- `get_job_status(job_id)`
- `stop_job(job_id)`
- `get_job_info()`

Use the hook for small control-flow decisions and metadata lookups. For normal DAG orchestration, prefer `SQLExecuteQueryOperator` or `KylinCubeOperator`.

## Important Notes

- Install the provider everywhere Airflow parses or executes DAG code. One missing worker image is enough to cause `ModuleNotFoundError`.
- The Kylin connection owns the host, project, credentials, and extras. Keep DAG code portable by passing only the connection id and task-specific values.
- `KylinCubeOperator` can submit a job without waiting for completion. Set `is_track_job=True` if downstream tasks depend on the finished Kylin job.
- `start_time` and `end_time` are passed through to the provider as segment boundaries. Keep them in the format your Kylin deployment expects; the provider docs demonstrate millisecond timestamps.
- This provider orchestrates Kylin from Airflow. If you are writing a regular Python application outside Airflow, use a dedicated Kylin client or HTTP integration instead of importing Airflow hooks and operators.

## Version Notes

- This guide covers `apache-airflow-providers-apache-kylin` version `3.10.2`.
- The official Airflow source tree publishes Kylin provider examples from the `providers-apache-kylin/3.10.2` branch, while some Airflow stable documentation pages for this provider still display `3.10.1` or `3.9.2` in their page chrome. Use the stable API pages for current hook and operator signatures, and re-check the package index before changing a production pin.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kylin/stable/`
- Kylin connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kylin/stable/connections/kylin.html`
- `KylinHook` API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kylin/stable/_api/airflow/providers/apache/kylin/hooks/kylin/index.html`
- `KylinCubeOperator` API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-kylin/stable/_api/airflow/providers/apache/kylin/operators/kylin_cube/index.html`
- Example DAG: `https://github.com/apache/airflow/blob/providers-apache-kylin/3.10.2/providers/tests/system/apache/kylin/example_kylin_dag.py`
- Airflow managing connections with environment variables: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-kylin/`
