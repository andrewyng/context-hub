---
name: providers-influxdb
description: "Apache Airflow InfluxDB provider for Flux queries and hook-based InfluxDB workflows from DAGs"
metadata:
  languages: "python"
  versions: "2.10.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,influxdb,flux,time-series,dags,python"
---

# Apache Airflow InfluxDB Provider Guide

Use `apache-airflow-providers-influxdb` when an Airflow DAG needs to query InfluxDB with Flux or call the InfluxDB Python client through an Airflow connection.

## Golden Rule

- Install this package alongside `apache-airflow`; it is not a standalone InfluxDB client setup.
- Put the server URL parts on an Airflow `influxdb` connection and keep the token plus org in connection extras.
- Use `InfluxDBOperator` for query-only tasks and `InfluxDBHook` inside Python tasks when you need lower-level reads or writes.
- Keep the bucket in the query or write call. The connection stores auth and endpoint details, not the bucket name.

## What This Package Adds

The provider exposes two main entry points:

- `InfluxDBOperator`
- `InfluxDBHook`

Those are the only classes most DAGs need from this package.

## Install

PyPI metadata for `2.10.2` requires Python `>=3.10,<3.14` and `apache-airflow>=2.11.0`.

Install the provider in the same Airflow environment or image that parses DAGs and runs tasks:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="2.10.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-influxdb==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful check after installation:

```bash
airflow providers list | grep -i influxdb
```

## Configure An InfluxDB Connection

The provider's connection type is `influxdb`.

Connection fields the provider documents or uses directly:

- `Host`: required InfluxDB host name
- `Port`: set this explicitly; InfluxDB 2 usually uses `8086`
- `Schema`: `https` for InfluxDB Cloud, `http` or `https` for self-managed deployments
- `Extra`: JSON with `token`, `org`, and optional `timeout` in milliseconds

Airflow supports JSON connection values in `AIRFLOW_CONN_*` environment variables, which is the easiest way to keep the connection reproducible in local development and containers:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

export AIRFLOW_CONN_INFLUXDB_DEFAULT='{
  "conn_type": "influxdb",
  "host": "us-east-1-1.aws.cloud2.influxdata.com",
  "port": 8086,
  "schema": "https",
  "extra": {
    "token": "your-influxdb-token",
    "org": "your-org",
    "timeout": 10000
  }
}'
```

Practical notes:

- The connection id is `influxdb_default` because that matches `AIRFLOW_CONN_INFLUXDB_DEFAULT`.
- Put only the host in `host`; do not include `https://` there when you already set `schema`.
- Keep the token in connection extras or a secrets backend, not in DAG source.
- Set `port` and `schema` explicitly. The provider code builds the URI from those fields.

## Run A Flux Query With `InfluxDBOperator`

Use `InfluxDBOperator` when the task is just “run this Flux query against InfluxDB”.

```python
from airflow import DAG
from airflow.providers.influxdb.operators.influxdb import InfluxDBOperator
from pendulum import datetime

with DAG(
    dag_id="influxdb_query_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    query_cpu_usage = InfluxDBOperator(
        task_id="query_cpu_usage",
        influxdb_conn_id="influxdb_default",
        sql="""
        from(bucket: "metrics")
          |> range(start: -1h)
          |> filter(fn: (r) => r["_measurement"] == "cpu")
          |> filter(fn: (r) => r["_field"] == "usage_user")
        """,
    )
```

Important details:

- `sql` is the operator argument name even though the query language here is Flux.
- The bucket must be part of the Flux query, for example `from(bucket: "metrics")`.
- `sql` is a templated field, so you can inject Airflow macros if the time window or measurement changes per run.

## Use `InfluxDBHook` In Python Tasks

Use `InfluxDBHook` when task code needs to inspect returned records or write points.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.influxdb.hooks.influxdb import InfluxDBHook
from pendulum import datetime

with DAG(
    dag_id="influxdb_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def write_point() -> None:
        hook = InfluxDBHook(conn_id="influxdb_default")
        hook.get_conn()
        hook.write(
            bucket_name="metrics",
            point_name="cpu",
            tag_name="host",
            tag_value="web-1",
            field_name="usage_user",
            field_value=0.82,
            synchronous=True,
        )

    @task
    def read_points() -> None:
        hook = InfluxDBHook(conn_id="influxdb_default")
        tables = hook.query(
            """
            from(bucket: "metrics")
              |> range(start: -1h)
              |> filter(fn: (r) => r["_measurement"] == "cpu")
              |> filter(fn: (r) => r["host"] == "web-1")
            """
        )

        for table in tables:
            for record in table.records:
                print(record.get_time(), record.get_value())

    write_point() >> read_points()
```

Why this pattern matters:

- `query(...)` initializes the client for you if needed.
- `write(...)`, `create_bucket(...)`, and similar hook methods rely on the hook's client state, so call `get_conn()` before using them.
- Returned query data is the InfluxDB client's normal Flux table structure, so iterate through `table.records` to access values.

## Common Setup Pattern

For most DAGs, keep the workflow split simple:

- create one shared Airflow connection such as `influxdb_default`
- use `InfluxDBOperator` for query-only tasks
- use `InfluxDBHook` in `@task` functions when you need Python logic around query results or writes
- keep buckets, measurements, tags, and field names in task code or templated params instead of trying to store them on the connection

## Pitfalls

- Install the provider anywhere Airflow imports DAG code or executes tasks. Scheduler-only installs still fail once workers import `airflow.providers.influxdb`.
- Set both `schema` and `port` on the Airflow connection instead of relying on defaults.
- Keep the bucket inside the Flux query. The provider does not infer it from the connection.
- Call `hook.get_conn()` before `write(...)` or other client-state methods.
- Keep tokens out of DAG files. Use Airflow connections, environment-backed connections, or a secrets backend.

## Version Notes

- This guide targets `apache-airflow-providers-influxdb` version `2.10.2`.
- The PyPI package metadata for `2.10.2` requires `apache-airflow>=2.11.0`.
- If you upgrade Airflow core or the provider independently, recheck the provider API reference before changing imports or connection settings.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-influxdb/stable/`
- InfluxDB connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-influxdb/stable/connections/influxdb.html`
- `InfluxDBHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-influxdb/stable/_api/airflow/providers/influxdb/hooks/influxdb/index.html`
- `InfluxDBOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-influxdb/stable/_api/airflow/providers/influxdb/operators/influxdb/index.html`
- System test example: `https://airflow.apache.org/docs/apache-airflow-providers-influxdb/stable/_modules/tests/system/influxdb/example_influxdb_query.html`
- Airflow connection env-var docs: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-influxdb/2.10.2/`
