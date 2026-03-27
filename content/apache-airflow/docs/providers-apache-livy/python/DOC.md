---
name: providers-apache-livy
description: "Apache Airflow provider for submitting and monitoring Apache Livy batch jobs from DAGs"
metadata:
  languages: "python"
  versions: "4.5.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,livy,spark,python,dag"
---

# Apache Airflow Apache Livy Provider Guide

Use `apache-airflow-providers-apache-livy` when an Airflow DAG should submit a Spark batch job to a Livy server over HTTP and optionally wait for that batch to finish.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone Livy client.
- Put the Livy server URL and credentials on an Airflow `livy` connection, then keep DAG code focused on `file`, `args`, `conf`, and executor sizing.
- Use `LivyOperator` for most DAGs. Use `LivySensor` only when you intentionally submit without polling and want a separate wait step.
- Point `file`, `py_files`, `jars`, `files`, and `archives` at artifacts your Livy deployment can actually read.

## Install

This provider requires Apache Airflow `>=2.11.0` and is versioned separately from Airflow core.

Install it into the same Python environment or container image that parses and runs your DAGs:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-apache-livy==4.5.3"
```

If you are creating a new Airflow environment from scratch, install Airflow first using the official Airflow installation guide, then add this provider.

After installation, verify that Airflow sees the provider:

```bash
airflow providers list | grep -i livy
```

Install the provider everywhere Airflow imports or executes DAG code:

- scheduler
- API server or webserver image, if it imports DAGs
- workers or task execution image

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `livy`. The default connection id is `livy_default`.

Minimal environment-variable form:

```bash
export AIRFLOW_CONN_LIVY_DEFAULT='livy://livy-user:livy-password@livy.example.com:8998/http'
```

Equivalent Airflow UI fields:

- **Connection Id:** `livy_default`
- **Connection Type:** `livy`
- **Host:** `livy.example.com`
- **Port:** `8998`
- **Login / Password:** Livy credentials if your server requires them
- **Schema:** `http` or `https`

The connection also supports `headers` in Extra or in the URI query string. When you use the URI form, URL-encode reserved characters and JSON values.

Example with a custom header:

```bash
export AIRFLOW_CONN_LIVY_DEFAULT='livy://livy-user:livy-password@livy.example.com:8998/http?headers=%7B%22X-Requested-By%22%3A%22airflow%22%7D'
```

If your Livy server is mounted behind a reverse proxy path such as `/livy`, pass that path with `livy_endpoint_prefix` on the operator or `endpoint_prefix` on the hook and sensor.

## Submit A Batch Job With `LivyOperator`

`LivyOperator` is the main entry point for this provider. It creates a Livy batch with the same fields exposed by Livy's batch REST API, including `file`, `args`, `class_name`, `jars`, `py_files`, `files`, `archives`, and Spark config in `conf`.

Minimal PySpark batch example:

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.apache.livy.operators.livy import LivyOperator

with DAG(
    dag_id="livy_batch_example",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    tags=["livy"],
) as dag:
    submit_pi = LivyOperator(
        task_id="submit_pi",
        livy_conn_id="livy_default",
        file="/opt/spark/jobs/pi.py",
        args=["1000"],
        conf={
            "spark.executor.memory": "2g",
            "spark.executor.cores": "1",
        },
        executor_memory="2g",
        executor_cores=1,
        num_executors=2,
        polling_interval=30,
    )
```

The arguments most DAGs need are:

- `file`: required batch entrypoint accepted by Livy
- `args`: positional arguments passed to the job
- `conf`: Spark configuration sent with the batch request
- `driver_memory`, `driver_cores`, `executor_memory`, `executor_cores`, `num_executors`: resource sizing
- `polling_interval`: seconds between status checks; values `<=0` submit the batch and return immediately without polling
- `livy_endpoint_prefix`: optional path prefix when Livy is not served from `/`

When `polling_interval` is greater than zero, the operator waits for the batch to reach a terminal state. A successful batch returns normally. Terminal states such as `dead`, `error`, or `killed` fail the task.

## Submit Now, Wait Later With `LivySensor`

If you want submission and waiting to be separate tasks, disable polling on the operator and pass the returned batch id into `LivySensor`.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.apache.livy.operators.livy import LivyOperator
from airflow.providers.apache.livy.sensors.livy import LivySensor

with DAG(
    dag_id="livy_async_batch_example",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    submit_batch = LivyOperator(
        task_id="submit_batch",
        livy_conn_id="livy_default",
        file="/opt/spark/jobs/pi.py",
        args=["5000"],
        polling_interval=0,
    )

    wait_for_batch = LivySensor(
        task_id="wait_for_batch",
        livy_conn_id="livy_default",
        batch_id="{{ ti.xcom_pull(task_ids='submit_batch') }}",
    )

    submit_batch >> wait_for_batch
```

`batch_id` is a templated field, so a normal Jinja `xcom_pull` works.

## Use `LivyHook` In Task Code

Use `LivyHook` when task code needs direct control over batch submission, status checks, logs, or cancellation.

```python
from airflow.decorators import task
from airflow.providers.apache.livy.hooks.livy import LivyHook


@task
def inspect_batch(batch_id: int) -> dict[str, object]:
    hook = LivyHook(
        livy_conn_id="livy_default",
        endpoint_prefix="/livy",
    )

    batch = hook.get_batch(batch_id)
    state = hook.get_batch_state(batch_id)
    logs = hook.get_batch_logs(
        batch_id=batch_id,
        log_start_position=0,
        log_batch_size=20,
    )

    return {
        "app_id": batch.get("appId"),
        "state": state.value,
        "log_lines": logs.get("log", []),
    }
```

The hook methods you will typically use are:

- `post_batch(...)`: create a batch directly
- `get_batch(batch_id)`: fetch batch metadata
- `get_batch_state(batch_id)`: fetch only the current state
- `get_batch_logs(batch_id, log_start_position=0, log_batch_size=100)`: fetch log pages
- `delete_batch(batch_id)`: cancel a batch

Use the operator for normal DAG tasks and the hook only when you need custom Python logic around the Livy API.

## Common Workflow Pattern

For most deployments, the cleanest setup is:

1. Create one Airflow `livy` connection per Livy environment.
2. Keep authentication and custom headers on that connection.
3. Submit batches with `LivyOperator`.
4. Use `polling_interval=0` plus `LivySensor` only when you need an explicit submit/wait split.
5. Use `LivyHook` for log inspection, custom retries, or cancellation logic inside Python tasks.

## Pitfalls

- Install the provider everywhere DAGs are parsed or run. Import errors usually mean one Airflow image is missing the package.
- `file`, `jars`, `py_files`, `files`, and `archives` are resolved by Livy and Spark, not by your laptop or the scheduler.
- If `polling_interval <= 0`, the operator only submits the batch and returns the Livy batch id. It does not wait for success.
- `deferrable=True` requires a running Airflow triggerer. Without one, the task cannot defer correctly.
- If your Livy server lives behind `/livy` or another path prefix, set `livy_endpoint_prefix` or `endpoint_prefix` explicitly.
- The operator's kill path calls Livy's delete-batch endpoint for the current batch. That matters if you expect a Spark job to keep running after an Airflow task is cancelled or killed.
- URL-encode usernames, passwords, and JSON header values when you build `AIRFLOW_CONN_LIVY_DEFAULT` by hand.

## Version Notes

- This guide targets `apache-airflow-providers-apache-livy` version `4.5.3`.
- The stable provider docs for `4.5.3` list Apache Airflow `2.11.0` as the minimum supported core version.
- Provider packages have their own release cadence, so re-check the provider docs before changing Airflow core and provider versions independently.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/`
- Package index and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/index.html`
- Livy connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/connections.html`
- `LivyOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/_api/airflow/providers/apache/livy/operators/livy/index.html`
- `LivyHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/_api/airflow/providers/apache/livy/hooks/livy/index.html`
- `LivySensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/_api/airflow/providers/apache/livy/sensors/livy/index.html`
- Example DAG source: `https://airflow.apache.org/docs/apache-airflow-providers-apache-livy/stable/_modules/tests/system/apache/livy/example_livy.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- Apache Livy REST API: `https://livy.apache.org/docs/latest/rest-api.html`
