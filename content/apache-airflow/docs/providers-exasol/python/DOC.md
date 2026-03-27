---
name: providers-exasol
description: "Apache Airflow Exasol provider for Airflow connections, SQL tasks, and ExasolHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,exasol,sql,database,python,dag"
---

# apache-airflow-providers-exasol

Use `apache-airflow-providers-exasol` to connect Airflow tasks to Exasol through an Airflow connection, run SQL with Airflow's generic SQL operator, and query or export data from Python tasks with `ExasolHook`.

This guide targets provider version `4.10.0`.

## What This Package Adds

`apache-airflow-providers-exasol` is an Apache Airflow provider package. Install it when your DAGs need Exasol connections and hook-based access from Airflow tasks.

This package extends Airflow. It is not a standalone Exasol client for general application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-exasol==4.10.0"
```

The provider metadata for `4.10.0` requires:

- `apache-airflow >= 2.11.0`
- `apache-airflow-providers-common-compat >= 1.8.0`
- `apache-airflow-providers-common-sql >= 1.27.0`
- `pyexasol >= 0.26.0`
- `python >= 3.10`

In practice, that means the scheduler, workers, and webserver all need the provider installed anywhere DAG code imports it.

If you are adding the provider to an existing Airflow environment, keep `apache-airflow` pinned in the same install command so dependency resolution does not silently change your Airflow core version:

```bash
python -m pip install "apache-airflow==<your-airflow-version>" "apache-airflow-providers-exasol==4.10.0"
```

If you need the hook's SQLAlchemy URL helpers, install the optional extra:

```bash
python -m pip install "apache-airflow-providers-exasol[sqlalchemy]==4.10.0"
```

## Configure The Airflow Connection

The provider reads connection settings from an Airflow connection with connection type `exasol`. The default connection id is usually `exasol_default`.

In the Airflow UI, configure:

- **Connection Id:** `exasol_default`
- **Connection Type:** `exasol`
- **Host:** your Exasol host name
- **Schema:** the default Exasol schema
- **Login / Password:** Exasol credentials
- **Port:** usually `8563`

You can also define the connection with an environment variable. JSON is the clearest format when you need extras:

```bash
export AIRFLOW_CONN_EXASOL_DEFAULT='{
  "conn_type": "exasol",
  "host": "exasol.example.com",
  "port": 8563,
  "schema": "analytics",
  "login": "sys",
  "password": "secret",
  "extra": {
    "encryption": true,
    "compression": true,
    "client_name": "airflow"
  }
}'
```

With that environment variable in place:

- the Airflow connection id is `exasol_default`
- SQL operators use `conn_id="exasol_default"`
- `ExasolHook` uses `exasol_conn_id="exasol_default"`

The current `ExasolHook` implementation forwards these connection extras into `pyexasol.connect(...)`:

- `compression`
- `encryption`
- `json_lib`
- `client_name`

If you define `AIRFLOW_CONN_*` as a URI instead of JSON, URL-encode reserved characters in the username, password, and query string values.

Keep credentials in Airflow connections, environment variables, or a secrets backend instead of hard-coding them in DAG files.

## Minimal Connection Check

Use `ExasolHook` for a quick sanity check from a task:

```python
from airflow.decorators import task
from airflow.providers.exasol.hooks.exasol import ExasolHook


@task
def ping_exasol() -> int:
    hook = ExasolHook(exasol_conn_id="exasol_default")
    row = hook.get_first("SELECT 1")
    return int(row[0])
```

`ExasolHook` uses `exasol_conn_id`, not `conn_id`.

## Run SQL In A DAG

For SQL-only tasks, use Airflow's generic SQL operator with an Exasol connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="exasol_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="exasol_default",
        sql="""
        CREATE TABLE IF NOT EXISTS airflow_events (
            event_name VARCHAR(100),
            event_value DECIMAL(18, 2)
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="exasol_default",
        sql="""
        INSERT INTO airflow_events (event_name, event_value)
        VALUES ('signup', 1.00), ('purchase', 2.00)
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need Python logic around the result set.

## Query Exasol From Python Tasks

Use `ExasolHook` when you need to fetch rows into Python, branch on query results, or combine Exasol work with other task logic:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.exasol.hooks.exasol import ExasolHook
from pendulum import datetime


with DAG(
    dag_id="exasol_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> None:
        hook = ExasolHook(exasol_conn_id="exasol_default")

        row = hook.get_first("SELECT COUNT(*) FROM airflow_events")
        event_count = int(row[0]) if row else 0

        records = hook.get_records(
            """
            SELECT event_name, event_value
            FROM airflow_events
            ORDER BY event_name
            """
        )

        print(f"total events: {event_count}")
        for event_name, event_value in records:
            print(f"{event_name}: {event_value}")

    read_summary()
```

Useful hook methods for everyday DAG work:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying `pyexasol.ExaConnection`
- `export_to_file(...)` when you need to write a query result to a local file on the worker

## Export Query Results To A File

`ExasolHook.export_to_file(...)` wraps the underlying Exasol export API:

```python
from airflow.decorators import task
from airflow.providers.exasol.hooks.exasol import ExasolHook


@task
def export_events() -> None:
    hook = ExasolHook(exasol_conn_id="exasol_default")
    hook.export_to_file(
        filename="/opt/airflow/data/airflow_events.csv",
        query_or_table="SELECT * FROM airflow_events",
    )
```

The destination path is resolved on the Airflow worker that runs the task. If you use a distributed executor, make sure that path exists inside the worker runtime and is writable there.

## Optional SQLAlchemy URL Support

The hook exposes `sqlalchemy_url` and `get_uri()` helpers, but they require the provider's `sqlalchemy` extra.

```python
from airflow.providers.exasol.hooks.exasol import ExasolHook


hook = ExasolHook(exasol_conn_id="exasol_default")
print(hook.sqlalchemy_url)
print(hook.get_uri())
```

If you need a non-default SQLAlchemy dialect, set `sqlalchemy_scheme` in connection extras. The provider source accepts:

- `exa.websocket`
- `exa+websocket`
- `exa+pyodbc`
- `exa+turbodbc`

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the package.
- `ExasolHook` expects `exasol_conn_id`; Airflow's generic SQL operators use `conn_id`.
- Use `SQLExecuteQueryOperator` for new SQL tasks. The provider still exposes `ExasolOperator` as a subclass, but the user-facing operator docs tell you to use the generic SQL operator instead.
- Keep credentials in Airflow connections or a secrets backend instead of embedding usernames and passwords in DAG code.
- Only a small set of connection extras are forwarded by the current hook implementation: `compression`, `encryption`, `json_lib`, and `client_name`. If you need other `pyexasol` connection kwargs, verify them against your exact provider build before depending on them.
- `get_pandas_df()` is deprecated in the provider source. Avoid starting new DAG code with it.
- `sqlalchemy_url` and `get_uri()` raise an exception unless you installed `apache-airflow-providers-exasol[sqlalchemy]`.

## Version Notes

- This guide covers `apache-airflow-providers-exasol` version `4.10.0`.
- Provider packages track Airflow compatibility separately from Exasol server compatibility. Check the provider release notes before upgrading this package alongside Airflow core.
- The stable provider docs and PyPI package metadata for March 2026 both identify `4.10.0` as the current provider line for this package.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-exasol/stable/`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-exasol/stable/operators.html`
- `ExasolHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-exasol/stable/_api/airflow/providers/exasol/hooks/exasol/index.html`
- `ExasolHook` source listing: `https://airflow.apache.org/docs/apache-airflow-providers-exasol/stable/_modules/airflow/providers/exasol/hooks/exasol.html`
- Airflow managing connections: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-exasol/`
