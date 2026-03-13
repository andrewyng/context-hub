---
name: package
description: "Apache Airflow HDFS provider for HDFS and WebHDFS hooks and sensors"
metadata:
  languages: "python"
  versions: "4.11.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,hdfs,webhdfs,hooks,sensors,data-pipelines"
---

# Apache Airflow HDFS Provider Guide

Use `apache-airflow-providers-apache-hdfs` when an Airflow DAG needs to check for files in HDFS, wait for HDFS paths to appear, or talk to a cluster through WebHDFS from Python task code.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone HDFS client for regular Python applications.
- Put cluster connection details and credentials in Airflow connections such as `hdfs_default` or `webhdfs_default` instead of hard-coding them in DAG files.
- Use `HdfsSensor` or `HdfsRegexSensor` when a task should wait for files or directories to arrive.
- Use `WebHDFSHook` when task code needs lower-level file operations against a WebHDFS endpoint.

## What This Package Adds

This provider supplies Airflow's HDFS integration, centered around:

- `HDFSHook`
- `WebHDFSHook`
- `HdfsSensor`
- `HdfsRegexSensor`

In practice, most DAGs either use a sensor to wait for upstream data in HDFS or a hook inside a Python task for custom WebHDFS operations.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment. Keep Airflow pinned in the same command so `pip` does not silently upgrade or downgrade core.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.11.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-hdfs==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Every Airflow runtime that imports DAG code needs the provider installed, including the scheduler and all workers.

## Choose The Connection Type

The provider supports two common ways to reach HDFS:

- `HDFS` connection: classic HDFS access used by the HDFS hook and sensors
- `WebHDFS` connection: HTTP-based access through the NameNode's WebHDFS endpoint

If your platform exposes WebHDFS, it is usually the simpler choice for custom Python task logic because `WebHDFSHook.get_conn()` returns a WebHDFS client object you can call directly.

## Configure Airflow Connections

You can create the connections in the Airflow UI, with the CLI, or through environment variables.

Example URI-style environment variables:

```bash
export AIRFLOW_CONN_HDFS_DEFAULT='hdfs://hdfs@namenode.example.com:8020'
export AIRFLOW_CONN_WEBHDFS_DEFAULT='webhdfs://hdfs@namenode.example.com:9870'
```

Use stable connection ids in DAG code:

- `hdfs_default` for `HdfsSensor`, `HdfsRegexSensor`, or `HDFSHook`
- `webhdfs_default` for `WebHDFSHook`

Keep usernames, passwords, Kerberos settings, and any cluster-specific extras in the Airflow connection layer or your secrets backend.

## Wait For Files With Sensors

Use `HdfsSensor` when a downstream task should not run until a known path exists.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG
from airflow.providers.apache.hdfs.sensors.hdfs import HdfsSensor, HdfsRegexSensor

with DAG(
    dag_id="hdfs_wait_for_inputs",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["hdfs"],
):
    wait_for_success = HdfsSensor(
        task_id="wait_for_success",
        filepath="/data/landing/orders/_SUCCESS",
        hdfs_conn_id="hdfs_default",
    )

    wait_for_parquet = HdfsRegexSensor(
        task_id="wait_for_parquet",
        filepath="/data/landing/orders/2026-03-12",
        regex=r".*\.parquet$",
        hdfs_conn_id="hdfs_default",
    )

    wait_for_success >> wait_for_parquet
```

Use this pattern when an upstream Spark, Hadoop, or batch job writes a completion marker or drops files into a partitioned directory before the rest of the DAG should continue.

## Use `WebHDFSHook` Inside Python Tasks

When you need custom file operations instead of a sensor, create a `WebHDFSHook`, get the client, and call the WebHDFS client methods directly.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import dag, task
from airflow.providers.apache.hdfs.hooks.webhdfs import WebHDFSHook

@dag(
    dag_id="webhdfs_inspect_and_upload",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["webhdfs"],
)
def webhdfs_inspect_and_upload():
    @task()
    def inspect_hdfs() -> dict[str, object]:
        hook = WebHDFSHook(webhdfs_conn_id="webhdfs_default")
        client = hook.get_conn()

        exists = client.status("/data/landing/orders.csv", strict=False) is not None
        listing = client.list("/data/landing")

        return {
            "exists": exists,
            "listing": listing,
        }

    @task()
    def upload_file() -> None:
        hook = WebHDFSHook(webhdfs_conn_id="webhdfs_default")
        client = hook.get_conn()

        client.upload(
            "/data/landing/orders.csv",
            "/opt/airflow/dags/data/orders.csv",
            overwrite=True,
        )

    inspect_hdfs() >> upload_file()

webhdfs_inspect_and_upload()
```

The important flow is:

1. create the hook with the Airflow connection id
2. call `get_conn()`
3. use the returned WebHDFS client for operations such as `status`, `list`, `upload`, or `download`

## Use `HDFSHook` When A Task Needs The HDFS Client

If your Airflow environment uses the classic HDFS connection type, instantiate `HDFSHook` with an HDFS connection id and then work through the returned client object.

```python
from airflow.providers.apache.hdfs.hooks.hdfs import HDFSHook

hook = HDFSHook(hdfs_conn_id="hdfs_default")
client = hook.get_conn()
```

Use this pattern when the worker can reach the cluster over the standard HDFS interface and your DAG code needs direct HDFS client behavior instead of the WebHDFS REST endpoint.

## Common Patterns

- Keep the connection id stable across DAGs so sensors and hooks all point at the same HDFS cluster configuration.
- Prefer a completion marker such as `_SUCCESS` over guessing with arbitrary sleep delays.
- Keep DAG code focused on paths and task logic; keep auth, hostnames, and port details in Airflow connections.
- Use sensors for readiness checks and hooks for custom file operations.

## Pitfalls

- This provider extends Airflow; it does not replace `apache-airflow`.
- Install the provider everywhere DAG code runs. Import errors usually mean one worker image or service is missing the package.
- An Airflow connection that works from the webserver container can still fail on workers if they do not have network access to the NameNode or HDFS service.
- Use `WebHDFSHook` only when the cluster actually exposes a WebHDFS endpoint. Not every HDFS deployment does.
- Keep credentials and Kerberos-related configuration in connections or secret backends instead of embedding them in DAG source files.

## When To Reach For The Provider

Use `apache-airflow-providers-apache-hdfs` when Airflow should orchestrate HDFS-related checks or file movement as DAG tasks. If you are writing a regular Python application instead of an Airflow DAG or plugin, use a dedicated HDFS client library directly rather than importing Airflow hooks.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/`
- HDFS connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/connections/hdfs.html`
- WebHDFS connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/connections/webhdfs.html`
- `HDFSHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/_api/airflow/providers/apache/hdfs/hooks/hdfs/index.html`
- `WebHDFSHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/_api/airflow/providers/apache/hdfs/hooks/webhdfs/index.html`
- HDFS sensor API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hdfs/stable/_api/airflow/providers/apache/hdfs/sensors/hdfs/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-hdfs/`
