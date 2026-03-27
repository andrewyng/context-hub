---
name: providers-apache-impala
description: "Apache Airflow Impala provider for Airflow-managed Impala connections, SQL tasks, and hook-based queries"
metadata:
  languages: "python"
  versions: "1.9.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,impala,sql,dag,python"
---

# apache-airflow-providers-apache-impala

Use `apache-airflow-providers-apache-impala` when an Airflow DAG needs to execute SQL against Apache Impala through an Airflow connection or open an Impala DB-API connection from task code with `ImpalaHook`.

This package is an Airflow provider, not a standalone Impala client for ordinary Python applications.

This guide targets provider version `1.9.0`.

## Install

Install the provider into the same Python environment as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-apache-impala==1.9.0"
```

If you manage Airflow and providers together, pin both in the same command so `pip` does not drift your Airflow core version:

```bash
AIRFLOW_VERSION="<your-airflow-version>"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-impala==1.9.0"
```

Provider requirements published by Apache Airflow:

- Apache Airflow `>=2.11.0`
- Python `>=3.10`
- `impyla>=0.22.0,<1.0`

Optional extras published on PyPI:

```bash
python -m pip install "apache-airflow-providers-apache-impala[kerberos]==1.9.0"
python -m pip install "apache-airflow-providers-apache-impala[sqlalchemy]==1.9.0"
```

Use the `kerberos` extra if your Impala environment authenticates with Kerberos. Use the `sqlalchemy` extra only if you need SQLAlchemy URL support from the hook.

## Choose The Right Interface

This provider exposes two practical entry points:

- `SQLExecuteQueryOperator`: run Impala SQL as a normal Airflow task
- `ImpalaHook`: open an Impala connection inside Python task code

For most DAGs, start with `SQLExecuteQueryOperator`. Reach for `ImpalaHook` only when later task logic needs to inspect rows in Python.

## Configure The Airflow Connection

The provider defines an Airflow connection type named `impala`. The default connection id is `impala_default`.

You can create it in the Airflow UI, with the Airflow CLI, or with an environment variable. A JSON environment variable is the least error-prone way to carry host, port, credentials, and extras together:

```bash
export AIRFLOW_CONN_IMPALA_WAREHOUSE='{
  "conn_type": "impala",
  "host": "impala.example.com",
  "port": 21050,
  "login": "airflow",
  "password": "secret",
  "schema": "analytics",
  "extra": {
    "auth": "NOSASL",
    "use_ssl": false
  }
}'
```

With that environment variable in place:

- the Airflow connection id is `impala_warehouse`
- `SQLExecuteQueryOperator` uses `conn_id="impala_warehouse"`
- `ImpalaHook` uses `impala_conn_id="impala_warehouse"`

Important connection behavior from the provider docs and hook source:

- connection extras are forwarded to `impyla.dbapi.connect(...)`
- operator keyword arguments such as `schema`, `login`, or `password` override values from the stored connection
- if you define connections with `AIRFLOW_CONN_*`, they are available at runtime but do not show up in the Airflow UI or `airflow connections list`

## Run SQL In A DAG

The provider docs use `SQLExecuteQueryOperator` for Impala tasks.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="impala_sql_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="impala_warehouse",
        sql="""
        CREATE TABLE IF NOT EXISTS analytics.customers (
            customer_id BIGINT,
            email STRING
        )
        STORED AS PARQUET
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="impala_warehouse",
        sql="""
        INSERT INTO analytics.customers (customer_id, email)
        VALUES (1, 'alice@example.com'), (2, 'bob@example.com')
        """,
    )

    read_rows = SQLExecuteQueryOperator(
        task_id="read_rows",
        conn_id="impala_warehouse",
        sql="""
        SELECT customer_id, email
        FROM analytics.customers
        ORDER BY customer_id
        LIMIT 10
        """,
    )

    create_table >> insert_rows >> read_rows
```

This is the normal pattern when Airflow should treat the Impala statement itself as the task boundary.

## Query Impala From Python Tasks

Use `ImpalaHook` when Python task code needs an actual DB-API connection.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.impala.hooks.impala import ImpalaHook
from pendulum import datetime

with DAG(
    dag_id="impala_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def fetch_recent_counts() -> list[tuple[str, int]]:
        hook = ImpalaHook(impala_conn_id="impala_warehouse")
        conn = hook.get_conn()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                SELECT ds, COUNT(*) AS row_count
                FROM analytics.events
                GROUP BY ds
                ORDER BY ds DESC
                LIMIT 7
                """
            )
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    fetch_recent_counts()
```

This keeps connection setup in Airflow while still letting task code branch on query results or hand small result sets to later tasks.

## Build A SQLAlchemy URL

If your task code needs a SQLAlchemy URL instead of a live connection, install the `sqlalchemy` extra and use the hook helper:

```python
from airflow.providers.apache.impala.hooks.impala import ImpalaHook

hook = ImpalaHook(impala_conn_id="impala_warehouse")
print(hook.get_uri())
```

The hook raises a `ValueError` if the stored connection is missing `host` or `login`, so keep those fields set on the Airflow connection.

## Important Notes

- Use `SQLExecuteQueryOperator` for new DAG code. The provider docs explicitly point users to the common SQL operator rather than a dedicated Impala operator.
- Keep auth and transport settings such as `auth` and `use_ssl` on the Airflow connection, not hard-coded in DAG files.
- Use `ImpalaHook` only for small, Python-driven result handling. If the work is just SQL execution, keep it as an operator task.
- If you rely on `AIRFLOW_CONN_*` variables, remember that they are runtime-only configuration and will not appear in the UI for manual inspection.
- `get_uri()` and `sqlalchemy_url` need the optional `sqlalchemy` dependency; plain query execution through `get_conn()` does not.

## Version Notes

- Apache Airflow's provider docs and PyPI both show `1.9.0` as the current release on March 13, 2026.
- The `1.9.0` changelog notes hook-level lineage support for SQL hooks.
- The `1.8.1` changelog made SQLAlchemy an optional dependency for this provider. If you upgrade older DAG utilities that called `get_uri()` or `sqlalchemy_url`, install the `sqlalchemy` extra explicitly.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/index.html`
- Impala connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/connections/impala.html`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/operators.html`
- `ImpalaHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/_api/airflow/providers/apache/impala/hooks/impala/index.html`
- `ImpalaHook` source view: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/_modules/airflow/providers/apache/impala/hooks/impala.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-apache-impala/stable/changelog.html`
- Managing connections: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-impala/`
