---
name: providers-odbc
description: "Apache Airflow ODBC provider for Airflow connections, SQL tasks, and OdbcHook workflows via pyodbc"
metadata:
  languages: "python"
  versions: "4.12.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,odbc,pyodbc,sql,dag,python"
---

# apache-airflow-providers-odbc

Use `apache-airflow-providers-odbc` when your Airflow DAGs need to connect to an ODBC-accessible database through `pyodbc`, execute SQL with Airflow's generic SQL operator, or open a `pyodbc` connection from `OdbcHook`.

This guide targets provider version `4.12.0`.

## Install

`apache-airflow-providers-odbc` `4.12.0` requires:

- Apache Airflow `>=2.11.0`
- Python `3.10` through `3.13`
- `pyodbc >=5.0.0` on Python `<3.13`, or `pyodbc >=5.2.0` on Python `3.13`

Install the provider into the same Python environment your Airflow components use:

```bash
python -m pip install "apache-airflow-providers-odbc==4.12.0"
```

The provider docs also use this Airflow extra when enabling ODBC support from an Airflow install:

```bash
python -m pip install "apache-airflow[odbc]"
```

System prerequisites matter here:

- `pyodbc` has native system dependencies.
- You must install an actual ODBC driver on the host or container where Airflow runs.
- Some databases also require an OS-level DSN definition before Airflow can connect.

## Configure The Airflow Connection

The provider adds the `odbc` connection type. `OdbcHook` uses `odbc_conn_id`, and its default connection id is `odbc_default`.

Connection fields from the provider docs:

- `Host`: required
- `Schema`: optional database/schema name
- `Login`: required
- `Password`: required
- `Extra`: arbitrary key/value pairs added to the ODBC connection string

Special `extra` keys handled by the provider:

- `connect_kwargs`: passed to `pyodbc.connect(...)`
- `sqlalchemy_scheme`: overrides the default SQLAlchemy scheme `mssql+pyodbc`
- `driver`: only used when `allow_driver_in_extra` is enabled

Airflow core supports defining connections with `AIRFLOW_CONN_{CONN_ID}` in either JSON or URI format. JSON is usually easier for ODBC because nested `extra` values stay readable:

```bash
export AIRFLOW_CONN_MY_ODBC_CONN='{
  "conn_type": "odbc",
  "host": "db.example.com",
  "port": 1433,
  "schema": "warehouse",
  "login": "airflow",
  "password": "secret",
  "extra": {
    "Driver": "ODBC Driver 18 for SQL Server",
    "ApplicationIntent": "ReadOnly",
    "TrustedConnection": "No",
    "connect_kwargs": {
      "autocommit": false
    }
  }
}'
```

If you want the provider to honor `driver` from connection `extra`, enable it explicitly:

```bash
export AIRFLOW__PROVIDERS_ODBC__ALLOW_DRIVER_IN_EXTRA=true
```

If you do not want that global setting, pass the driver directly to `OdbcHook` or through `hook_params` on SQL operators.

## Run SQL In A DAG

The provider docs use `SQLExecuteQueryOperator` for ODBC SQL tasks.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="odbc_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="my_odbc_conn",
        hook_params={"driver": "ODBC Driver 18 for SQL Server"},
        sql="""
        CREATE TABLE IF NOT EXISTS my_table (
            dt VARCHAR(50),
            value VARCHAR(255)
        );
        """,
        autocommit=True,
    )

    insert_row = SQLExecuteQueryOperator(
        task_id="insert_row",
        conn_id="my_odbc_conn",
        hook_params={"driver": "ODBC Driver 18 for SQL Server"},
        sql="""
        INSERT INTO my_table (dt, value)
        VALUES ('{{ ds }}', 'test_value');
        """,
        autocommit=True,
    )

    create_table >> insert_row
```

Notes:

- `conn_id` points to the Airflow connection.
- `autocommit` defaults to `False`; set it when your database and task pattern need statement-level commits.
- `hook_params={"driver": ...}` is the documented operator-side way to pass the ODBC driver without enabling `allow_driver_in_extra`.

## Use `OdbcHook` In Python Tasks

`OdbcHook` returns a `pyodbc` connection from `get_conn()`. The hook constructor supports `driver`, `dsn`, `connect_kwargs`, and `sqlalchemy_scheme`.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.odbc.hooks.odbc import OdbcHook
from pendulum import datetime


with DAG(
    dag_id="odbc_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_rows() -> list[tuple[str, str]]:
        hook = OdbcHook(
            odbc_conn_id="my_odbc_conn",
            driver="ODBC Driver 18 for SQL Server",
            connect_kwargs={"autocommit": False},
        )

        with hook.get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT TOP 10 dt, value
                FROM my_table
                ORDER BY dt DESC
                """
            )
            rows = cursor.fetchall()

        return [(row[0], row[1]) for row in rows]

    read_rows()
```

Use `driver=` on the hook when:

- you do not want to enable `allow_driver_in_extra`
- you need to override the connection's driver for one task
- you are using the hook directly rather than an operator

If your database relies on a DSN, pass `dsn="YourDsnName"` to the hook, or make sure the DSN is already available where the task runs.

## SQLAlchemy Workflow

`OdbcHook` also exposes `get_sqlalchemy_engine()` and `get_sqlalchemy_connection()`. The default SQLAlchemy scheme is `mssql+pyodbc`, and you can override it with `sqlalchemy_scheme` when the target database needs a different dialect string.

## Common Pitfalls

- Installing only the Python package is not enough. Airflow still needs a working system ODBC driver.
- Putting `driver` in connection `extra` does nothing unless `AIRFLOW__PROVIDERS_ODBC__ALLOW_DRIVER_IN_EXTRA=true` is set.
- `SQLExecuteQueryOperator` takes `conn_id`; hook-specific settings such as `driver` belong in `hook_params`.
- ODBC is only the transport layer. Your SQL still has to match the target database dialect.
- Environment-defined connections do not appear in the Airflow UI or in `airflow connections list`.
- If you depend on a DSN, that DSN must exist inside the runtime where the task executes, not just on your laptop.

## Version Notes

- `4.12.0` was released on `2026-03-02`.
- The `4.12.0` provider line requires Airflow `2.11.0` or later.
- The `4.12.0` changelog includes `Add Hook Level Lineage to SQL hooks`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-odbc/stable/`
- ODBC connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-odbc/stable/connections/odbc.html`
- ODBC operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-odbc/stable/operators.html`
- `OdbcHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-odbc/stable/_api/airflow/providers/odbc/hooks/odbc/index.html`
- Airflow connection management: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-odbc/`
