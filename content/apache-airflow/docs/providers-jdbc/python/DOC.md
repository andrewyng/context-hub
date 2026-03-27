---
name: providers-jdbc
description: "Apache Airflow JDBC provider for Airflow connections, SQL tasks, and JdbcHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "5.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,jdbc,sql,java,python,dag,database"
---

# apache-airflow-providers-jdbc

Use `apache-airflow-providers-jdbc` when an Airflow task needs to talk to a database through a JDBC driver instead of a database-specific Airflow provider.

This guide targets provider version `5.4.0`.

## What This Package Adds

`apache-airflow-providers-jdbc` is an Apache Airflow provider package. It adds:

- the `jdbc` connection type
- `JdbcHook` for Python task code
- JDBC support for Airflow's generic SQL operators such as `SQLExecuteQueryOperator`

This package extends Airflow. It is not a standalone JDBC client for regular application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-jdbc==5.4.0"
```

`5.4.0` requires:

- `apache-airflow>=2.11.0`
- Python `>=3.10`

If you are adding the provider to an existing Airflow environment, keep `apache-airflow` pinned in the same command so dependency resolution does not silently change your Airflow core version:

```bash
python -m pip install "apache-airflow==<your-current-airflow-version>" "apache-airflow-providers-jdbc==5.4.0"
```

You also need these non-Python prerequisites anywhere JDBC tasks run:

- a JVM
- `JAVA_HOME` pointing at that JVM
- the vendor JDBC driver JAR for your database

Example environment variables:

```bash
export JAVA_HOME="/usr/lib/jvm/temurin-17-jdk"
export AIRFLOW_HOME="$PWD/.airflow"
export JDBC_DRIVER_PATH="/opt/airflow/drivers/postgresql-42.7.5.jar"
export JDBC_DRIVER_CLASS="org.postgresql.Driver"
```

Install the provider and place the JDBC driver JAR on every scheduler, worker, and other runtime image that may import or execute the DAG.

## Configure The Airflow Connection

`JdbcHook` uses `jdbc_default` by default. The JDBC provider expects the full JDBC URL in the connection's `host` field, which Airflow relabels as `Connection URL` in the UI.

A portable way to define the connection is a JSON environment variable:

```bash
export AIRFLOW_CONN_JDBC_DEFAULT='{
  "conn_type": "jdbc",
  "host": "jdbc:postgresql://db.example.com:5432/warehouse",
  "login": "airflow",
  "password": "secret"
}'
```

You can also create the same connection with the CLI:

```bash
airflow connections add jdbc_default --conn-json '{
  "conn_type": "jdbc",
  "host": "jdbc:postgresql://db.example.com:5432/warehouse",
  "login": "airflow",
  "password": "secret"
}'
```

Important connection details:

- Put the entire JDBC URL in `host`, not just a hostname.
- `JdbcHook` reads username and password from the Airflow connection.
- Keep credentials in Airflow connections, environment variables, or a secrets backend instead of hard-coding them in DAG files.

## Configure Driver Class And Driver Path

The safest pattern is to pass `driver_class` and `driver_path` in code:

- `JdbcHook(..., driver_class=..., driver_path=...)`
- `SQLExecuteQueryOperator(..., hook_params={"driver_class": ..., "driver_path": ...})`

The provider can also read `driver_class` and `driver_path` from connection `extra`, but only if you explicitly enable both config flags:

```bash
export AIRFLOW__PROVIDERS_JDBC__ALLOW_DRIVER_CLASS_IN_EXTRA=true
export AIRFLOW__PROVIDERS_JDBC__ALLOW_DRIVER_PATH_IN_EXTRA=true
```

If those flags stay at their default `False` values, `driver_class` and `driver_path` in the connection extra are ignored.

## Run SQL In A DAG

Use Airflow's generic SQL operator for SQL-only tasks. For JDBC connections, pass the Airflow connection id with `conn_id` and the driver settings through `hook_params`.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime


with DAG(
    dag_id="jdbc_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="jdbc_default",
        sql="""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            event_name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL
        )
        """,
        autocommit=True,
        hook_params={
            "driver_class": "org.postgresql.Driver",
            "driver_path": "/opt/airflow/drivers/postgresql-42.7.5.jar",
        },
    )

    insert_row = SQLExecuteQueryOperator(
        task_id="insert_row",
        conn_id="jdbc_default",
        sql="""
        INSERT INTO events (event_name, created_at)
        VALUES ('signup', CURRENT_TIMESTAMP)
        """,
        autocommit=True,
        hook_params={
            "driver_class": "org.postgresql.Driver",
            "driver_path": "/opt/airflow/drivers/postgresql-42.7.5.jar",
        },
    )

    create_table >> insert_row
```

Useful `SQLExecuteQueryOperator` parameters for JDBC tasks:

- `sql`: a single SQL string, a list of SQL strings, or a `.sql` template file path
- `autocommit`: commit each statement automatically when set to `True`
- `parameters`: values used when rendering the SQL query

## Query JDBC Sources From Python Tasks

Use `JdbcHook` when your task needs query results in Python.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.jdbc.hooks.jdbc import JdbcHook
from pendulum import datetime


with DAG(
    dag_id="jdbc_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_summary() -> int:
        hook = JdbcHook(
            jdbc_conn_id="jdbc_default",
            driver_class="org.postgresql.Driver",
            driver_path="/opt/airflow/drivers/postgresql-42.7.5.jar",
        )

        row = hook.get_first("SELECT COUNT(*) FROM events")
        return int(row[0]) if row else 0

    read_summary()
```

`JdbcHook` uses `jdbc_conn_id`, not `conn_id`.

The hook's connection method calls `jaydebeapi.connect(...)` with:

- the driver class
- the JDBC URL from the Airflow connection
- the Airflow login and password
- the configured driver JAR path

## Optional: SQLAlchemy Engine Access

If you call `JdbcHook.get_sqlalchemy_engine()`, set `sqlalchemy_scheme` in the connection extra. Without it, Airflow raises an exception because `jdbc` is a protocol, not a SQLAlchemy dialect.

Example connection with SQLAlchemy metadata for PostgreSQL:

```bash
export AIRFLOW_CONN_JDBC_ANALYTICS='{
  "conn_type": "jdbc",
  "host": "jdbc:postgresql://db.example.com:5432/warehouse",
  "login": "airflow",
  "password": "secret",
  "extra": {
    "sqlalchemy_scheme": "postgresql+psycopg2"
  }
}'
```

Then:

```python
from airflow.providers.jdbc.hooks.jdbc import JdbcHook


hook = JdbcHook(
    jdbc_conn_id="jdbc_analytics",
    driver_class="org.postgresql.Driver",
    driver_path="/opt/airflow/drivers/postgresql-42.7.5.jar",
)
engine = hook.get_sqlalchemy_engine()
```

## Common Setup Pattern

For most DAGs, a practical split is:

- store the full JDBC URL and credentials in an Airflow connection
- pass `driver_class` and `driver_path` directly to `JdbcHook` or `hook_params`
- use `SQLExecuteQueryOperator` for SQL-only tasks
- use `JdbcHook` inside `@task` functions when later logic depends on query results

## Pitfalls

- No JVM or missing `JAVA_HOME`. The provider needs a working Java runtime.
- Missing JDBC driver JAR or wrong `driver_class`.
- Putting only a hostname in the connection instead of the full JDBC URL.
- `SQLExecuteQueryOperator` uses `conn_id`; `JdbcHook` uses `jdbc_conn_id`.
- Setting `driver_class` or `driver_path` in connection `extra` without enabling `AIRFLOW__PROVIDERS_JDBC__ALLOW_DRIVER_CLASS_IN_EXTRA` and `AIRFLOW__PROVIDERS_JDBC__ALLOW_DRIVER_PATH_IN_EXTRA`.
- Calling `get_sqlalchemy_engine()` without `extra.sqlalchemy_scheme`.
- Using old `JdbcOperator` examples. The JDBC provider removed `JdbcOperator` in `5.0.0`; use `SQLExecuteQueryOperator` instead.

## Version Notes

- This guide covers `apache-airflow-providers-jdbc` version `5.4.0`.
- PyPI lists `5.4.0` as the current stable release on March 13, 2026.
- `5.4.0` requires Airflow `2.11.0+`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/`
- JDBC connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/connections/jdbc.html`
- JDBC configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/configurations-ref.html`
- `JdbcHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/_api/airflow/providers/jdbc/hooks/jdbc/index.html`
- `JdbcHook` source docs: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/_modules/airflow/providers/jdbc/hooks/jdbc.html`
- JDBC operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-jdbc/stable/operators.html`
- SQL operator docs: `https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html`
- Airflow connection management: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-jdbc/`
