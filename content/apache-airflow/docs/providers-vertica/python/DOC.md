---
name: providers-vertica
description: "Apache Airflow Vertica provider for Airflow connections, SQL tasks, and VerticaHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "4.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,vertica,sql,database,dag,python"
---

# apache-airflow-providers-vertica

Use `apache-airflow-providers-vertica` to connect Airflow to Vertica through an Airflow connection, run SQL in DAG tasks, and access Vertica from Python tasks with `VerticaHook`.

This guide targets provider version `4.3.0`.

## What This Package Adds

`apache-airflow-providers-vertica` is an Apache Airflow provider package. Install it when your DAGs need Vertica connections and hook-based access from Airflow tasks.

This package extends Airflow. It is not a general-purpose Vertica client for application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-vertica==4.3.0"
```

If you need the hook's `sqlalchemy_url` property, install the optional SQLAlchemy extra:

```bash
python -m pip install "apache-airflow-providers-vertica[sqlalchemy]==4.3.0"
```

Version requirements called out by upstream for `4.3.0`:

- Apache Airflow `>=2.11.0`
- Python `>=3.10,<3.14`
- `vertica-python>=1.3.0` is installed as a dependency

In practice, the scheduler, webserver, and every worker image must all have the provider available anywhere DAG code imports it.

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `vertica`. The default connection id is `vertica_default`.

In the Airflow UI, configure:

- **Connection Id:** `vertica_default` or a project-specific id such as `vertica_warehouse`
- **Connection Type:** `vertica`
- **Host:** your Vertica host name
- **Schema:** the default database name
- **Login / Password:** Vertica credentials
- **Port:** usually `5433`

You can also define the connection with an environment variable:

```bash
export AIRFLOW_CONN_VERTICA_WAREHOUSE='{
  "conn_type": "vertica",
  "host": "vertica.example.com",
  "login": "dbadmin",
  "password": "secret",
  "schema": "analytics",
  "port": 5433,
  "extra": {
    "ssl": true,
    "session_label": "airflow-vertica",
    "connection_timeout": 30,
    "connection_load_balance": true
  }
}'
```

With that environment variable in place:

- the Airflow connection id is `vertica_warehouse`
- SQL operators use `conn_id="vertica_warehouse"`
- `VerticaHook` uses `vertica_conn_id="vertica_warehouse"`

Common extra fields documented by the provider include:

- `ssl`
- `connection_timeout`
- `backup_server_node`
- `connection_load_balance`
- `session_label`
- `use_prepared_statements`

Keep credentials in Airflow connections or a secrets backend instead of hard-coding usernames and passwords in DAG files.

## Run SQL In A DAG

For SQL-only tasks, use Airflow's generic SQL operator with a Vertica connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="vertica_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="vertica_warehouse",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id IDENTITY PRIMARY KEY,
            event_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="vertica_warehouse",
        sql="""
        INSERT INTO events (event_name)
        VALUES ('signup'), ('purchase')
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need custom Python logic around the query results.

## Query Vertica From Python Tasks

Use `VerticaHook` when you need to fetch rows, branch on results, or mix database work with other task logic.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.vertica.hooks.vertica import VerticaHook
from pendulum import datetime


with DAG(
    dag_id="vertica_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> None:
        hook = VerticaHook(vertica_conn_id="vertica_warehouse")

        row = hook.get_first("SELECT COUNT(*) FROM events")
        event_count = row[0] if row else 0

        records = hook.get_records(
            """
            SELECT event_name, COUNT(*)
            FROM events
            GROUP BY event_name
            ORDER BY event_name
            """
        )

        print(f"total events: {event_count}")
        for event_name, count in records:
            print(f"{event_name}: {count}")

    read_summary()
```

Useful hook methods for everyday DAG work:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying `vertica_python` connection

`VerticaHook` supports autocommit, so you can use it for DDL and DML inside Python tasks when SQL needs to live next to other task logic.

## Build A SQLAlchemy URL

If another part of your Airflow code needs a SQLAlchemy URL, use `VerticaHook.sqlalchemy_url`. This requires the provider's optional `sqlalchemy` extra.

```python
from airflow.providers.vertica.hooks.vertica import VerticaHook


hook = VerticaHook(vertica_conn_id="vertica_warehouse")
engine_url = hook.sqlalchemy_url

print(engine_url)
```

The hook builds that URL from the Airflow connection, including supported extra fields as SQLAlchemy query parameters.

## Common Setup Pattern

For most DAGs, a clean split is:

- use `SQLExecuteQueryOperator` for schema changes, inserts, updates, and other SQL-only tasks
- use `VerticaHook` inside `@task` functions when later task logic needs query results in Python
- keep the connection id stable across DAGs, such as `vertica_default`, `vertica_warehouse`, or `analytics_db`

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the package.
- `VerticaHook` uses `vertica_conn_id`; generic SQL operators use `conn_id`.
- Older examples may still use `VerticaOperator`, but upstream removed it in provider `4.0.0`. Use `SQLExecuteQueryOperator` instead.
- If you need `hook.sqlalchemy_url`, install `apache-airflow-providers-vertica[sqlalchemy]`. Since `4.2.1`, SQLAlchemy is an optional extra instead of an unconditional dependency.
- Use valid JSON booleans and numbers in `AIRFLOW_CONN_*` JSON values. For example, `true` is valid JSON; `"True"` is just a string.
- Keep passwords and TLS settings in Airflow connections or a secrets backend, not in DAG source files.

## Version Notes

- Provider `4.3.0` supports Python `3.10` through `3.13`.
- Provider `4.3.0` raises the minimum SQLAlchemy version for the optional SQLAlchemy integration to `1.4.54`.
- Provider `4.2.0` raised the minimum Airflow version for this package to `2.11.0`.
- Provider `4.0.0` removed the legacy `VerticaOperator`; current DAGs should use the generic SQL operator plus `VerticaHook`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-vertica/stable/`
- Vertica connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-vertica/stable/connections/vertica.html`
- `VerticaHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-vertica/stable/_api/airflow/providers/vertica/hooks/vertica/index.html`
- SQL operator docs: `https://airflow.apache.org/docs/apache-airflow-providers-vertica/stable/operators.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-vertica/stable/changelog.html`
- Airflow connection environment variables: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-vertica/`
