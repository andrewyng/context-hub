---
name: package
description: "Apache Airflow PostgreSQL provider for Airflow connections, SQL tasks, and Postgres hook-based workflows"
metadata:
  languages: "python"
  versions: "6.6.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,postgres,postgresql,sql,dag,python"
---

# apache-airflow-providers-postgres

Use `apache-airflow-providers-postgres` to connect Airflow to PostgreSQL through an Airflow connection, run SQL in DAG tasks, and access PostgreSQL from Python tasks with `PostgresHook`.

This guide targets provider version `6.6.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
pip install apache-airflow-providers-postgres==6.6.0
```

In practice, that means the scheduler, webserver, and workers must all have the provider available anywhere DAG code imports it.

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `Postgres`.

You can create it in the Airflow UI, or define it with an environment variable:

```bash
export AIRFLOW_CONN_ANALYTICS_DB='postgresql://airflow:secret@db.example.com:5432/analytics'
```

With that environment variable in place:

- the Airflow connection id is `analytics_db`
- SQL operators use `conn_id="analytics_db"`
- `PostgresHook` uses `postgres_conn_id="analytics_db"`

Connection fields you usually need:

- `Host`: PostgreSQL host name
- `Schema`: database name
- `Login`: database user
- `Password`: database password
- `Port`: usually `5432`

Use Airflow connections or a secrets backend for credentials instead of hard-coding database URLs in DAG files.

## Run SQL In A DAG

For normal DDL and DML tasks, use Airflow's SQL operator with a Postgres connection.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="postgres_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="analytics_db",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id BIGSERIAL PRIMARY KEY,
            event_type TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="analytics_db",
        sql="""
        INSERT INTO events (event_type)
        VALUES ('signup'), ('purchase')
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need custom Python logic around the query.

## Query Postgres From Python Tasks

Use `PostgresHook` when you need to fetch rows, branch on results, or mix database work with Python code.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.postgres.hooks.postgres import PostgresHook
from pendulum import datetime

with DAG(
    dag_id="postgres_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> None:
        hook = PostgresHook(postgres_conn_id="analytics_db")

        row = hook.get_first(
            "SELECT COUNT(*) FROM events WHERE created_at >= NOW() - INTERVAL '1 day'"
        )
        event_count = row[0] if row else 0

        records = hook.get_records(
            "SELECT event_type, COUNT(*) FROM events GROUP BY event_type ORDER BY event_type"
        )

        print(f"events in last day: {event_count}")
        for event_type, count in records:
            print(f"{event_type}: {count}")

    read_summary()
```

Useful hook methods for everyday tasks:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying database connection

## Load Data With `COPY`

`PostgresHook.copy_expert(...)` is the practical way to use PostgreSQL `COPY` from an Airflow task.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.postgres.hooks.postgres import PostgresHook
from pendulum import datetime

with DAG(
    dag_id="postgres_copy_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def load_csv() -> None:
        hook = PostgresHook(postgres_conn_id="analytics_db")

        hook.run(
            """
            CREATE TABLE IF NOT EXISTS staging_users (
                id BIGINT,
                email TEXT
            )
            """
        )

        hook.copy_expert(
            sql="""
            COPY staging_users (id, email)
            FROM STDIN WITH (FORMAT CSV, HEADER TRUE)
            """,
            filename="/opt/airflow/dags/data/users.csv",
        )

    load_csv()
```

The file path is resolved on the Airflow worker that runs the task. If you use Celery, Kubernetes, or another distributed executor, make sure that file exists inside the worker runtime, not just on your local machine.

## Common Setup Pattern

For many DAGs, a clean split is:

- use `SQLExecuteQueryOperator` for schema setup, inserts, updates, and idempotent SQL tasks
- use `PostgresHook` inside `@task` functions when later steps need query results in Python
- keep the connection id stable across DAGs, such as `analytics_db` or `warehouse`

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the provider package.
- Keep credentials in Airflow connections or secrets backends. Do not embed usernames and passwords directly in DAG code.
- URL-encode special characters in connection URIs if you define `AIRFLOW_CONN_*` variables manually.
- Use worker-accessible paths with `copy_expert(...)`. A path that exists on your laptop may not exist in a container or remote worker.
- Use `PostgresHook` for Python-driven logic and `SQLExecuteQueryOperator` for plain SQL tasks. That keeps DAGs simpler and easier to reason about.

## Version Notes

Provider packages track Airflow compatibility separately from PostgreSQL server compatibility. If you are upgrading Airflow core, check the provider's release notes and compatibility information before pinning or upgrading this package in production.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/`
- Airflow Postgres connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/connections/postgres.html`
- `PostgresHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-postgres/stable/_api/airflow/providers/postgres/hooks/postgres/index.html`
