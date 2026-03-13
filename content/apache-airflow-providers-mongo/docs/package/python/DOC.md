---
name: package
description: "Apache Airflow provider for connecting DAGs to MongoDB with Airflow connections, MongoHook, and MongoSensor"
metadata:
  languages: "python"
  versions: "5.3.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,mongodb,mongo,pymongo,dags"
---

# Apache Airflow Providers Mongo Guide

Use `apache-airflow-providers-mongo` to connect Airflow DAGs to MongoDB through an Airflow connection, use `MongoHook` inside Python tasks, and wait for records with `MongoSensor`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone MongoDB client.
- Put credentials and connection options in an Airflow connection such as `mongo_default` instead of hard-coding them in DAG files.
- Treat the object returned by `MongoHook.get_conn()` as a normal PyMongo client and use standard database and collection calls from there.

## Install

Install the provider in the same environment as Airflow, using the official Airflow constraints file for your Airflow and Python versions.

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
  "apache-airflow-providers-mongo==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-mongo==5.3.2"
```

Useful checks after installation:

```bash
airflow providers list | grep mongo
airflow info
```

## Authentication And Connection Setup

This provider reads MongoDB credentials from an Airflow connection. A safe pattern is to keep the connection values in environment variables, then create the Airflow connection from those values.

```bash
export MONGO_HOST='mongo.example.com'
export MONGO_PORT='27017'
export MONGO_DB='analytics'
export MONGO_USER='airflow'
export MONGO_PASSWORD='secret'
```

Create the Airflow connection:

```bash
airflow connections add 'mongo_default' \
  --conn-type 'mongo' \
  --conn-host "$MONGO_HOST" \
  --conn-port "$MONGO_PORT" \
  --conn-schema "$MONGO_DB" \
  --conn-login "$MONGO_USER" \
  --conn-password "$MONGO_PASSWORD"
```

Confirm the connection exists before you wire it into a DAG:

```bash
airflow connections get mongo_default
```

If your deployment needs TLS, replica set settings, SRV, or another connection option beyond the basic host, port, database, and credentials shown here, add that configuration in the Airflow connection itself using the provider's Mongo connection documentation.

## Common Workflow: Read And Write Documents In A Python Task

Use `MongoHook` when the task needs normal MongoDB operations from Python code.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.mongo.hooks.mongo import MongoHook


with DAG(
    dag_id="mongo_hook_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["mongo"],
):
    @task
    def write_and_read() -> None:
        hook = MongoHook(mongo_conn_id="mongo_default")
        client = hook.get_conn()

        try:
            collection = client["analytics"]["events"]

            collection.insert_one(
                {
                    "event_type": "signup",
                    "source": "airflow",
                    "status": "queued",
                }
            )

            document = collection.find_one({"event_type": "signup"})
            print(document)

            collection.update_one(
                {"event_type": "signup"},
                {"$set": {"status": "processed"}},
            )
        finally:
            client.close()

    write_and_read()
```

This pattern is usually the simplest way to work with MongoDB in Airflow:

- get the hook with `MongoHook(mongo_conn_id="...")`
- call `get_conn()` once inside the task
- use normal PyMongo APIs on the returned client
- close the client before the task exits when you manage it directly

## Common Workflow: Wait For A Matching Document

Use `MongoSensor` when a DAG should pause until a collection contains a document that matches a query.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.mongo.sensors.mongo import MongoSensor


with DAG(
    dag_id="mongo_sensor_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["mongo"],
):
    wait_for_ready_document = MongoSensor(
        task_id="wait_for_ready_document",
        mongo_conn_id="mongo_default",
        collection="events",
        query={"status": "ready"},
        poke_interval=30,
        timeout=60 * 20,
    )
```

Keep the query small and index-backed when possible. Sensors poll repeatedly, so broad collection scans can turn a simple readiness check into steady load on the database.

## Common Setup Pattern

For most DAGs, a clean split is:

- put the database name, host, and credentials in the Airflow connection
- use `MongoHook` inside `@task` functions when you need custom reads, writes, or updates
- use `MongoSensor` when downstream work should not start until a document exists
- keep the connection id stable across DAGs, such as `mongo_default` or `warehouse_mongo`

## Pitfalls

- Install the provider everywhere DAG code runs. Scheduler, worker, and local test environments all need the package if they import `airflow.providers.mongo`.
- Keep credentials in Airflow connections or a secrets backend. Do not embed MongoDB usernames and passwords directly in DAG code.
- Keep `apache-airflow` pinned when adding or upgrading the provider so `pip` does not silently replace your Airflow core version.
- Use worker-reachable hostnames. A MongoDB host that works from your laptop may not resolve from a container or remote worker.
- Keep connection-specific options in the Airflow connection instead of scattering them through DAG code.

## Version Notes

- This guide covers `apache-airflow-providers-mongo` version `5.3.2`.
- Provider packages track Airflow compatibility separately from your MongoDB server version. If you are upgrading Airflow core, re-check provider compatibility and release notes before changing production pins.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-mongo/stable/`
- Mongo connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-mongo/stable/connections/mongo.html`
- `MongoHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-mongo/stable/_api/airflow/providers/mongo/hooks/mongo/index.html`
- `MongoSensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-mongo/stable/_api/airflow/providers/mongo/sensors/mongo/index.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-mongo/`
