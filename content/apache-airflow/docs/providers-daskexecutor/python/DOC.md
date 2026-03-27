---
name: providers-daskexecutor
description: "Apache Airflow Dask executor provider for running Airflow 2 tasks on a Dask Distributed cluster"
metadata:
  languages: "python"
  versions: "1.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,dask,executor,distributed-tasks"
---

# Apache Airflow Providers DaskExecutor Guide

Use `apache-airflow-providers-daskexecutor` when you need an Airflow 2 deployment to submit task execution to a Dask Distributed cluster instead of running tasks locally.

## Golden Rule

- Treat this package as a legacy Airflow 2 provider.
- Install it on top of an existing `apache-airflow` installation; it is not a standalone runtime.
- Configure the executor and Dask cluster in Airflow config instead of importing provider-specific APIs in DAG code.
- Make sure every Dask worker can import Airflow and every Python dependency your tasks need.

## What This Package Adds

This provider publishes the `DaskExecutor` class in the `airflow.providers.daskexecutor` package.

Operationally, that means:

- Airflow's scheduler hands task execution off to a Dask Distributed scheduler
- Dask workers run the Airflow task subprocesses
- DAG code usually stays normal Airflow DAG code

There is no provider client to initialize in your DAG files. Airflow initializes the Dask client from your executor configuration.

## Install

Install Airflow first, then add the provider package to the same environment.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="2.11.1"  # replace with the Airflow 2.x version your deployment already uses
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-daskexecutor==1.1.1"
```

Published package requirements for `1.1.1`:

- `apache-airflow >= 2.5.0`
- `cloudpickle >= 1.4.1`
- `dask >= 2.9.0, !=2022.10.1, !=2023.5.0`
- `distributed >= 2.11.1, !=2023.5.0`

Useful checks:

```bash
python -m pip show apache-airflow-providers-daskexecutor
airflow providers list | grep daskexecutor
```

## Configure The Executor

The provider's executor class is `airflow.providers.daskexecutor.executors.dask_executor.DaskExecutor`. In practice, configure Airflow to use that full class path and provide the Dask scheduler address in the `[dask]` section.

Environment-variable form:

```bash
export AIRFLOW__CORE__EXECUTOR="airflow.providers.daskexecutor.executors.dask_executor.DaskExecutor"
export AIRFLOW__DASK__CLUSTER_ADDRESS="127.0.0.1:8786"
```

Equivalent `airflow.cfg` settings:

```ini
[core]
executor = airflow.providers.daskexecutor.executors.dask_executor.DaskExecutor

[dask]
cluster_address = 127.0.0.1:8786
```

Optional TLS settings supported by the executor:

```bash
export AIRFLOW__DASK__TLS_CA="/etc/ssl/certs/dask-ca.pem"
export AIRFLOW__DASK__TLS_CERT="/etc/ssl/certs/dask-client.pem"
export AIRFLOW__DASK__TLS_KEY="/etc/ssl/private/dask-client.key"
```

The executor reads `cluster_address`, `tls_ca`, `tls_cert`, and `tls_key` from the `[dask]` config section.

## Start A Dask Cluster

For a minimal local cluster, start a scheduler first:

```bash
export DASK_HOST=127.0.0.1
export DASK_PORT=8786

dask-scheduler --host "$DASK_HOST" --port "$DASK_PORT"
```

Then start at least one worker that can reach that scheduler:

```bash
dask-worker "$DASK_HOST:$DASK_PORT"
```

Important runtime rule:

- Each Dask worker must be able to import Airflow and any task dependencies.

That usually means installing the same Python environment or container image on the Airflow scheduler host and on every Dask worker host.

## Start Airflow

After setting the executor config, start the normal Airflow services for an Airflow 2 deployment:

```bash
airflow webserver
```

```bash
airflow scheduler
```

Check the configured executor:

```bash
airflow config get-value core executor
```

## DAG Code Stays Normal

Most DAGs do not import anything from this provider directly. You keep writing ordinary Airflow DAGs and let the configured executor decide where tasks run.

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from pendulum import datetime


def emit(label: str) -> None:
    print(f"running {label}")


with DAG(
    dag_id="dask_executor_example",
    start_date=datetime(2024, 1, 1, tz="UTC"),
    schedule_interval=None,
    catchup=False,
) as dag:
    default_task = PythonOperator(
        task_id="default_task",
        python_callable=emit,
        op_args=["default"],
    )

    gpu_task = PythonOperator(
        task_id="gpu_task",
        python_callable=emit,
        op_args=["gpu"],
        queue="gpu",
    )

    default_task >> gpu_task
```

Put the DAG in your configured DAGs folder and verify Airflow can parse it:

```bash
airflow dags list
airflow dags show dask_executor_example
```

## Queues Use Dask Worker Resources

This executor maps Airflow task queues to Dask worker resources.

If you use `queue="gpu"` or another non-default Airflow queue, start workers with matching resource names:

```bash
dask-worker "$DASK_HOST:$DASK_PORT" --resources="gpu=1"
```

For multiple queues:

```bash
dask-worker "$DASK_HOST:$DASK_PORT" --resources="gpu=1,etl=1"
```

Practical behavior to expect:

- the default Airflow queue behaves like "no specific Dask resource requested"
- non-default queues require a matching worker resource name
- tasks for a non-default queue only run on workers that advertise the matching resource

## Common Pitfalls

- Installing the provider without Airflow. This package only extends Airflow.
- Configuring the executor but not starting a reachable Dask scheduler and worker.
- Running workers that do not have Airflow, DAG dependencies, or provider dependencies installed.
- Using Airflow queues without matching Dask worker resources.
- Assuming Airflow 3 service layout or `airflow.sdk` examples apply here. This provider is documented for Airflow 2 installations.

## Version Notes

- PyPI lists `1.1.1` as the latest published version of `apache-airflow-providers-daskexecutor`.
- The provider changelog says `1.1.1` marks the provider as removed and not maintained anymore.
- The stable provider index still shows `Release: 1.1.0`, so use PyPI and the changelog when checking the latest package version.
- PyPI lists supported Python versions `3.8`, `3.9`, `3.10`, and `3.11`.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-daskexecutor/stable/`
- Provider package index: `https://airflow.apache.org/docs/apache-airflow-providers-daskexecutor/stable/index.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-daskexecutor/stable/changelog.html`
- `DaskExecutor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-daskexecutor/stable/_api/airflow/providers/daskexecutor/executors/dask_executor/index.html`
- `DaskExecutor` module source: `https://airflow.apache.org/docs/apache-airflow-providers-daskexecutor/stable/_modules/airflow/providers/daskexecutor/executors/dask_executor.html`
- Airflow Dask executor guide: `https://airflow.apache.org/docs/apache-airflow/2.6.3/core-concepts/executor/dask.html`
- Airflow executor configuration overview: `https://airflow.apache.org/docs/apache-airflow/2.6.0/core-concepts/executor/index.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/2.6.0/installation/installing-from-pypi.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-daskexecutor/`
