---
name: providers-common-sql
description: "Apache Airflow common SQL provider for reusable SQL operators, data quality checks, inserts, transfers, and DbApiHook helpers across SQL backends"
metadata:
  languages: "python"
  versions: "1.32.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,sql,database,data-quality,dag,python"
---

# apache-airflow-providers-common-sql

Use `apache-airflow-providers-common-sql` when your DAGs need Airflow's shared SQL operators and `DbApiHook` helpers across supported SQL backends. This package is the common layer used by many database-specific providers; it is not a standalone database client.

This guide targets provider version `1.32.0`.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment.

If you are building a fresh Airflow environment, install Airflow first with the official constraints file, then add the provider:

```bash
AIRFLOW_VERSION=3.1.8
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-common-sql==1.32.0"
```

If you are adding the provider to an existing Airflow environment, keep `apache-airflow` pinned in the same command so dependency resolution does not silently change your Airflow core version:

```bash
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-common-sql==1.32.0"
```

DataFrame helpers need optional extras:

```bash
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-common-sql[pandas]==1.32.0"
python -m pip install "apache-airflow==3.1.8" "apache-airflow-providers-common-sql[polars]==1.32.0"
```

Upstream documents `apache-airflow>=2.11.0` as the minimum compatible Airflow version for this provider.

## Configure Airflow Connections

`apache-airflow-providers-common-sql` does not introduce its own database connection type. Instead, its operators and hooks work through an Airflow connection that is backed by a database-specific provider such as Postgres, MySQL, MsSQL, or SQLite.

For example, with a PostgreSQL connection:

```bash
export AIRFLOW_CONN_WAREHOUSE='postgresql://airflow:secret@db.example.com:5432/warehouse'
```

With that environment variable in place:

- the Airflow connection id is `warehouse`
- common SQL operators use `conn_id="warehouse"`
- the matching database provider package still needs to be installed anywhere your DAG code runs

Keep credentials in Airflow connections, environment variables, or a secrets backend instead of hard-coding them in DAG files.

## Run SQL With `SQLExecuteQueryOperator`

Use `SQLExecuteQueryOperator` for normal DDL, DML, and query tasks that only need SQL.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="common_sql_execute_query",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="warehouse",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id BIGINT PRIMARY KEY,
            event_type TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL
        )
        """,
    )

    insert_seed_rows = SQLExecuteQueryOperator(
        task_id="insert_seed_rows",
        conn_id="warehouse",
        sql="""
        INSERT INTO events (id, event_type, created_at)
        VALUES
            (1, 'signup', CURRENT_TIMESTAMP),
            (2, 'purchase', CURRENT_TIMESTAMP)
        """,
    )

    create_table >> insert_seed_rows
```

Useful options from the provider docs:

- pass `parameters={...}` to bind query parameters
- set `split_statements=True` when `sql` contains multiple statements
- set `handler=None` when you do not need query results returned
- set `return_last=False` if you need all result sets instead of only the last one

## Insert Python Rows With `SQLInsertRowsOperator`

Use `SQLInsertRowsOperator` when you already have rows in Python and want the provider hook to insert them.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLInsertRowsOperator
from pendulum import datetime


with DAG(
    dag_id="common_sql_insert_rows",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    load_daily_metrics = SQLInsertRowsOperator(
        task_id="load_daily_metrics",
        conn_id="warehouse",
        table_name="daily_metrics",
        rows=[
            ("2026-03-13", "signup", 41),
            ("2026-03-13", "purchase", 7),
        ],
        target_fields=["ds", "metric_name", "metric_value"],
    )
```

`insert_args` are passed through to the underlying database hook, so keep them limited to options that your database-specific provider documents.

## Add Data Quality Checks

The provider includes reusable check operators for table-level and column-level assertions.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import (
    SQLColumnCheckOperator,
    SQLTableCheckOperator,
)
from pendulum import datetime


with DAG(
    dag_id="common_sql_quality_checks",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    column_checks = SQLColumnCheckOperator(
        task_id="column_checks",
        conn_id="warehouse",
        table="daily_metrics",
        column_mapping={
            "metric_value": {
                "null_check": {"equal_to": 0},
                "min": {"greater_than": 0},
            }
        },
    )

    table_checks = SQLTableCheckOperator(
        task_id="table_checks",
        conn_id="warehouse",
        table="daily_metrics",
        checks={
            "has_rows": {"check_statement": "COUNT(*) > 0"},
            "signup_rows_present": {
                "check_statement": "SUM(CASE WHEN metric_name = 'signup' THEN 1 ELSE 0 END) > 0"
            },
        },
    )

    column_checks >> table_checks
```

Important behavior from the provider docs:

- `partition_clause` can be set at the operator, column, or individual check level
- `accept_none=True` is the default for `SQLColumnCheckOperator`, so `None` results are converted to `0`
- table checks can be partitioned the same way as column checks when you need date-scoped assertions

## Move Data Between Connections With `GenericTransfer`

`GenericTransfer` copies rows from one Airflow SQL connection to another by reading from a source hook and writing to a destination hook.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.generic_transfer import GenericTransfer
from pendulum import datetime


with DAG(
    dag_id="common_sql_transfer",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    copy_active_users = GenericTransfer(
        task_id="copy_active_users",
        source_conn_id="warehouse",
        destination_conn_id="reporting",
        sql="SELECT id, email FROM users WHERE is_active = true",
        destination_table="active_users",
        preoperator="TRUNCATE TABLE active_users",
    )
```

Upstream notes that `GenericTransfer` reads all rows into memory before writing them out, so use it for small to moderate result sets rather than very large table copies.

## Use DataFrame Helpers From Compatible Hooks

When a database-specific Airflow hook subclasses `DbApiHook`, the common SQL provider adds DataFrame helpers such as `get_df(...)` and `get_df_by_chunks(...)`.

For example, with a database hook that supports the common SQL interface:

```python
import pandas as pd
from airflow.providers.postgres.hooks.postgres import PostgresHook


hook = PostgresHook(postgres_conn_id="warehouse")

df = hook.get_df(
    "SELECT metric_name, metric_value FROM daily_metrics WHERE ds = %(ds)s",
    parameters={"ds": "2026-03-13"},
    df_type="pandas",
)

for chunk in hook.get_df_by_chunks(
    "SELECT * FROM daily_metrics",
    chunksize=1000,
    df_type="pandas",
):
    assert isinstance(chunk, pd.DataFrame)
    print(len(chunk))
```

Install the matching extra first:

- `apache-airflow-providers-common-sql[pandas]` for `df_type="pandas"`
- `apache-airflow-providers-common-sql[polars]` for `df_type="polars"`

## Pitfalls

- Install the package everywhere DAG code runs. If one scheduler, worker, or image is missing it, imports like `airflow.providers.common.sql...` will fail.
- Install the matching database provider too. `apache-airflow-providers-common-sql` gives you shared operators and hook helpers, but your actual database connection type still comes from a provider such as Postgres, MySQL, MsSQL, or SQLite.
- Set `conn_id` explicitly in each task. Do not rely on implicit defaults across different DAGs or providers.
- Use `handler=None` for `SQLExecuteQueryOperator` when you only care about side effects and do not need rows returned.
- Review `accept_none` on column checks. The default is helpful for empty partitions, but it can also hide missing data if you expected the query to return a real value.
- Use `GenericTransfer` only when the selected result set fits comfortably in worker memory.

## Version Notes For `1.32.0`

- The official `1.32.0` release notes include a new `@task.sql` decorator.
- The same release adds hook-level OpenLineage support.
- The release notes also bump the minimum SQLAlchemy version to `1.4.54`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/`
- Supported database types: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/supported_db.html`
- SQL operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html`
- DataFrame integration: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/dataframes.html`
- `DbApiHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/_api/airflow/providers/common/sql/hooks/sql/index.html`
- Release notes: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/commits.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-common-sql/`
