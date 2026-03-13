---
name: package
description: "Apache Airflow Microsoft SQL Server provider for Airflow connections, SQL tasks, and MsSqlHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "4.5.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,mssql,sql-server,python,dag,sql"
---

# apache-airflow-providers-microsoft-mssql

Use `apache-airflow-providers-microsoft-mssql` to connect Airflow to Microsoft SQL Server through an Airflow connection, run T-SQL in DAG tasks, and query SQL Server from Python tasks with `MsSqlHook`.

This guide targets provider version `4.5.0`.

## What This Package Adds

`apache-airflow-providers-microsoft-mssql` is an Apache Airflow provider package. Install it when your DAGs need SQL Server connections and hook-based access from Airflow tasks.

This package extends Airflow. It is not a standalone SQL Server client for regular application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-microsoft-mssql==4.5.0"
```

In practice, that means the scheduler, workers, and webserver all need the provider available anywhere DAG code imports it.

## Configure The Airflow Connection

The provider reads connection settings from an Airflow connection. The default connection id is `mssql_default`.

In the Airflow UI, configure:

- **Connection Id:** `mssql_default`
- **Connection Type:** `mssql`
- **Host:** your SQL Server host name
- **Schema:** the default database name
- **Login / Password:** SQL Server credentials
- **Port:** usually `1433`

You can also define the connection with an environment variable:

```bash
export AIRFLOW_CONN_MSSQL_DEFAULT='mssql://airflow:secret@sqlserver.example.com:1433/warehouse'
```

With that environment variable in place:

- the Airflow connection id is `mssql_default`
- SQL operators use `conn_id="mssql_default"`
- `MsSqlHook` uses `mssql_conn_id="mssql_default"`

If the password contains reserved URL characters such as `@`, `:`, or `/`, URL-encode it before putting it in the URI.

Keep credentials in Airflow connections or a secrets backend instead of hard-coding them in DAG files.

## Minimal Connection Check

Use `MsSqlHook` for a quick connection check from a task:

```python
from airflow.decorators import task
from airflow.providers.microsoft.mssql.hooks.mssql import MsSqlHook


@task
def ping_mssql() -> int:
    hook = MsSqlHook(mssql_conn_id="mssql_default")
    row = hook.get_first("SELECT 1")
    return int(row[0])
```

`MsSqlHook` uses `mssql_conn_id`, not `conn_id`.

## Run SQL In A DAG

For SQL-only tasks, use Airflow's generic SQL operator with an MSSQL connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="mssql_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="mssql_default",
        sql="""
        IF OBJECT_ID('dbo.events', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.events (
                id INT IDENTITY(1,1) PRIMARY KEY,
                event_name NVARCHAR(255) NOT NULL,
                created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
            )
        END
        """,
    )

    insert_row = SQLExecuteQueryOperator(
        task_id="insert_row",
        conn_id="mssql_default",
        sql="""
        INSERT INTO dbo.events (event_name)
        VALUES ('signup')
        """,
    )

    create_table >> insert_row
```

Use this pattern when the task is just SQL execution and you do not need Python logic around the query result.

## Query SQL Server From Python Tasks

Use `MsSqlHook` when you need to branch on query results, fetch rows into Python, or combine database work with other task logic.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.microsoft.mssql.hooks.mssql import MsSqlHook
from pendulum import datetime


with DAG(
    dag_id="mssql_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> None:
        hook = MsSqlHook(mssql_conn_id="mssql_default")

        row = hook.get_first("SELECT COUNT(*) FROM dbo.events")
        event_count = row[0] if row else 0

        records = hook.get_records(
            "SELECT TOP 10 id, event_name FROM dbo.events ORDER BY id DESC"
        )

        print(f"total events: {event_count}")
        for event_id, event_name in records:
            print(f"{event_id}: {event_name}")

    read_summary()
```

Useful hook methods for everyday DAG work:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying database connection

## Common Setup Pattern

For many DAGs, a clean split is:

- use `SQLExecuteQueryOperator` for schema setup, inserts, updates, and other SQL-only tasks
- use `MsSqlHook` inside `@task` functions when later task logic needs query results in Python
- keep the connection id stable across DAGs, such as `mssql_default`, `warehouse`, or `analytics_db`

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the provider package.
- `MsSqlHook` expects `mssql_conn_id`; Airflow's generic SQL operators use `conn_id`.
- URL-encode special characters in connection URIs if you define `AIRFLOW_CONN_*` variables manually.
- Use SQL Server syntax in your tasks. For example, `SELECT TOP 10 ...` and `IDENTITY(1,1)` are SQL Server patterns; copying `LIMIT` or `AUTO_INCREMENT` from MySQL or PostgreSQL examples will fail.
- Keep secrets in Airflow connections or a secrets backend instead of embedding usernames and passwords in DAG code.

## Version Notes

Provider packages track Airflow compatibility separately from SQL Server itself. If you upgrade Airflow core, check the provider's version-specific documentation before upgrading this package in production.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-microsoft-mssql/4.5.0/`
- MSSQL connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-microsoft-mssql/4.5.0/connections/mssql.html`
- `MsSqlHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-microsoft-mssql/4.5.0/_api/airflow/providers/microsoft/mssql/hooks/mssql/index.html`
