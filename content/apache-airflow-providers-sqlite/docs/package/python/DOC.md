---
name: package
description: "Apache Airflow SQLite provider for Airflow connections, SQL tasks, and SqliteHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "4.3.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,sqlite,sql,python,dag,database"
---

# apache-airflow-providers-sqlite

Use `apache-airflow-providers-sqlite` to connect Airflow tasks to a SQLite database file through an Airflow connection, run SQL from DAG tasks, and query SQLite from Python tasks with `SqliteHook`.

This guide targets provider version `4.3.0`.

## What This Package Adds

`apache-airflow-providers-sqlite` is an Apache Airflow provider package. Install it when your DAGs need SQLite connections and hook-based access from Airflow tasks.

This package extends Airflow. It is not a standalone SQLite client for regular application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-sqlite==4.3.0"
```

In practice, that means the scheduler, workers, and webserver all need the provider available anywhere DAG code imports it.

If you are adding the provider to an existing Airflow environment, keep `apache-airflow` pinned in the same command so dependency resolution does not silently change your Airflow core version:

```bash
python -m pip install "apache-airflow==<your-current-airflow-version>" "apache-airflow-providers-sqlite==4.3.0"
```

If you are building a fresh Airflow environment, install Airflow itself with the official constraints file first, then add the provider.

## Configure The Airflow Connection

The provider reads connection settings from an Airflow connection with connection type `sqlite`. The default connection id is usually `sqlite_default`.

The simplest portable setup is an environment-defined connection:

```bash
export AIRFLOW_CONN_SQLITE_DEFAULT='sqlite:////opt/airflow/data/warehouse.db'
```

With that environment variable in place:

- the Airflow connection id is `sqlite_default`
- SQL operators use `conn_id="sqlite_default"`
- `SqliteHook` uses `sqlite_conn_id="sqlite_default"`

Use an absolute database path in worker environments so every task resolves the same file location.

Keep the connection definition in Airflow connections, environment variables, or a secrets backend instead of hard-coding SQLite paths in DAG files.

## Minimal Connection Check

Use `SqliteHook` for a quick connection check from a task:

```python
from airflow.decorators import task
from airflow.providers.sqlite.hooks.sqlite import SqliteHook


@task
def ping_sqlite() -> int:
    hook = SqliteHook(sqlite_conn_id="sqlite_default")
    row = hook.get_first("SELECT 1")
    return int(row[0])
```

`SqliteHook` uses `sqlite_conn_id`, not `conn_id`.

## Run SQL In A DAG

For SQL-only tasks, use Airflow's generic SQL operator with a SQLite connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="sqlite_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="sqlite_default",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="sqlite_default",
        sql="""
        INSERT INTO events (event_name)
        VALUES ('signup'), ('purchase')
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need Python logic around the query result.

## Query SQLite From Python Tasks

Use `SqliteHook` when you need to branch on query results, fetch rows into Python, or combine database work with other task logic.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.sqlite.hooks.sqlite import SqliteHook
from pendulum import datetime


with DAG(
    dag_id="sqlite_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> None:
        hook = SqliteHook(sqlite_conn_id="sqlite_default")

        row = hook.get_first("SELECT COUNT(*) FROM events")
        event_count = row[0] if row else 0

        records = hook.get_records(
            "SELECT id, event_name, created_at FROM events ORDER BY id DESC LIMIT 10"
        )

        print(f"total events: {event_count}")
        for event_id, event_name, created_at in records:
            print(f"{event_id}: {event_name} at {created_at}")

    read_summary()
```

Useful hook methods for everyday DAG work:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying DB-API connection

## Common Setup Pattern

For many DAGs, a clean split is:

- use `SQLExecuteQueryOperator` for schema setup, inserts, updates, and other SQL-only tasks
- use `SqliteHook` inside `@task` functions when later task logic needs query results in Python
- keep the connection id stable across DAGs, such as `sqlite_default` or `local_sqlite`
- store the SQLite file on a path that exists on the worker where the task runs

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the provider package.
- `SqliteHook` expects `sqlite_conn_id`; Airflow's generic SQL operators use `conn_id`.
- Pointing different workers at different local files. A path like `/opt/airflow/data/warehouse.db` refers to each worker's filesystem unless you mount shared storage.
- Assuming SQLite is a good fit for heavy concurrent writes or multi-host database workloads. It works best for lightweight local or single-node patterns.
- Hard-coding database paths directly in DAG code instead of using an Airflow connection or environment variable.
- Forgetting that the parent directory for the SQLite file must already exist and be writable by the task runtime.

## Version Notes

- This guide covers `apache-airflow-providers-sqlite` version `4.3.0`.
- Provider packages track Airflow compatibility separately from SQLite itself. When you upgrade Airflow core, review the provider's version-specific docs before upgrading this package in production.
- Keep `apache-airflow` pinned when you add or upgrade the provider so dependency resolution does not silently change your Airflow core version.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-sqlite/4.3.0/`
- SQLite connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-sqlite/4.3.0/connections/sqlite.html`
- `SqliteHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-sqlite/4.3.0/_api/airflow/providers/sqlite/hooks/sqlite/index.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-sqlite/`
