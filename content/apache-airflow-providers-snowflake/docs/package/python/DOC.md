---
name: package
description: "Apache Airflow Snowflake provider for Snowflake connections, SQL tasks, and hook-based workflows in DAGs"
metadata:
  languages: "python"
  versions: "6.10.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,snowflake,sql,dag,python"
---

# Apache Airflow Snowflake Provider Python Guide

Use `apache-airflow-providers-snowflake` when Airflow tasks need to run SQL against Snowflake or access Snowflake from Python task code through Airflow connections.

This provider extends `apache-airflow`; it is not a standalone Snowflake client for regular application code.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-snowflake==6.10.0"
```

In practice, the scheduler, workers, and any other Airflow service importing DAG code all need the same provider installed.

## Configure The Airflow Connection

The provider reads Snowflake credentials and session defaults from an Airflow connection. The conventional connection id is `snowflake_default`.

You can create the connection in the Airflow UI, or define it with an environment variable:

```bash
export AIRFLOW_CONN_SNOWFLAKE_DEFAULT='snowflake://AIRFLOW_USER:secret@your-account-identifier/ANALYTICS/PUBLIC?warehouse=COMPUTE_WH&role=TRANSFORMER'
```

With that environment variable in place:

- the Airflow connection id is `snowflake_default`
- generic SQL operators use `conn_id="snowflake_default"`
- `SnowflakeHook` and `SnowflakeSqlApiOperator` use `snowflake_conn_id="snowflake_default"`

Connection values you usually need:

- Snowflake account identifier
- user credentials or another auth method configured on the connection
- warehouse
- database
- schema
- role

Keep credentials and auth material in Airflow connections or a secrets backend instead of DAG files. If you define `AIRFLOW_CONN_*` manually, URL-encode reserved password characters such as `@`, `:`, and `/`.

## Run SQL In A DAG

For normal DDL and DML tasks, use Airflow's SQL operator with a Snowflake connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="snowflake_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="snowflake_default",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id NUMBER AUTOINCREMENT,
            event_type STRING,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="snowflake_default",
        sql="""
        INSERT INTO events (event_type)
        VALUES ('signup'), ('purchase')
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need custom Python logic around the result.

## Query Snowflake From Python Tasks

Use `SnowflakeHook` when later task logic needs query results in Python:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.snowflake.hooks.snowflake import SnowflakeHook
from pendulum import datetime

with DAG(
    dag_id="snowflake_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> list[tuple[str, int]]:
        hook = SnowflakeHook(snowflake_conn_id="snowflake_default")

        version_row = hook.get_first("SELECT CURRENT_VERSION()")
        print(f"Snowflake version: {version_row[0]}")

        records = hook.get_records(
            """
            SELECT event_type, COUNT(*)
            FROM events
            GROUP BY event_type
            ORDER BY event_type
            """
        )

        return [(event_type, int(count)) for event_type, count in records]

    read_summary()
```

Useful hook methods for everyday tasks:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying connection object

`SnowflakeHook` uses `snowflake_conn_id`, not `conn_id`.

## Run Multi-Statement SQL With The SQL API Operator

Use `SnowflakeSqlApiOperator` when you specifically want the Snowflake SQL API operator instead of the generic SQL operator:

```python
from airflow import DAG
from airflow.providers.snowflake.operators.snowflake import SnowflakeSqlApiOperator
from pendulum import datetime

with DAG(
    dag_id="snowflake_sql_api_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_batch = SnowflakeSqlApiOperator(
        task_id="run_batch",
        snowflake_conn_id="snowflake_default",
        sql="""
        CREATE OR REPLACE TEMP TABLE tmp_numbers AS
        SELECT 1 AS n
        UNION ALL
        SELECT 2 AS n;

        SELECT COUNT(*) FROM tmp_numbers;
        """,
        statement_count=2,
    )
```

When you send multiple statements, keep `statement_count` aligned with the actual number of SQL statements in `sql`.

## Common Setup Pattern

For most DAGs, a clean split is:

- use `SQLExecuteQueryOperator` for plain SQL tasks
- use `SnowflakeHook` inside `@task` functions when downstream Python needs query results
- keep the Snowflake connection id stable across DAGs, such as `snowflake_default` or `analytics_wh`
- keep warehouse, database, schema, and role consistent on the Airflow connection so tasks do not depend on accidental session state

## Pitfalls

- Install the provider everywhere Airflow imports DAG code. Import errors usually mean one image or service is missing the package.
- `SnowflakeHook` and `SnowflakeSqlApiOperator` use `snowflake_conn_id`; generic SQL operators use `conn_id`.
- Keep credentials in Airflow connections or a secrets backend instead of embedding them in DAG code.
- URL-encode passwords if you define `AIRFLOW_CONN_SNOWFLAKE_DEFAULT` manually.
- Keep large query results out of XCom. Return small summaries or write larger outputs to storage.
- If you use `SnowflakeSqlApiOperator` for multi-statement SQL, set `statement_count` correctly.

## Version Notes

This guide targets `apache-airflow-providers-snowflake` version `6.10.0`. Provider packages track Airflow compatibility separately from your Snowflake account setup, so re-check the provider docs before changing Airflow core and provider versions independently.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-snowflake/stable/`
- Snowflake connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-snowflake/stable/connections/snowflake.html`
- `SnowflakeHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-snowflake/stable/_api/airflow/providers/snowflake/hooks/snowflake/index.html`
- Snowflake operators API reference: `https://airflow.apache.org/docs/apache-airflow-providers-snowflake/stable/_api/airflow/providers/snowflake/operators/snowflake/index.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-snowflake/6.10.0/`
