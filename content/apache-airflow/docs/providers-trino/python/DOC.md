---
name: providers-trino
description: "Apache Airflow Trino provider for Airflow connections, SQL tasks, and Python tasks built on TrinoHook"
metadata:
  languages: "python"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,trino,sql,dag,python"
---

# Apache Airflow Trino Provider Guide

Use `apache-airflow-providers-trino` when an Airflow DAG needs to run SQL against Trino through an Airflow connection or access Trino from Python task code with `TrinoHook`.

This guide targets provider version `6.5.0`.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone Trino client.
- Put Trino host, credentials, and session extras on an Airflow `Trino` connection instead of hard-coding them in DAG files.
- Use `SQLExecuteQueryOperator` for ordinary SQL tasks and `TrinoHook` when Python task code needs to query or write rows directly.
- Do not use `TrinoOperator`. The provider changelog shows it was removed in `6.0.0` in favor of the common SQL operator.
- Configure exactly one authentication method per connection. The provider changelog documents that newer releases reject multiple auth methods on the same connection.

## Install

The provider docs list these minimum runtime requirements for `6.5.0`:

- `apache-airflow >= 2.11.0`
- `apache-airflow-providers-common-compat >= 1.8.0`
- `apache-airflow-providers-common-sql >= 1.27.2`
- `trino >= 0.319.0`

Install the provider into the same image or virtual environment used by your Airflow scheduler, API server, and workers. Keep your deployed Airflow pin in the same command so the resolver does not silently replace core:

```bash
AIRFLOW_VERSION="<your-airflow-version>"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-trino==6.5.0"
```

If you plan to use `GCSToTrinoOperator`, install the Google extra as well:

```bash
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-trino[google]==6.5.0"
```

Useful checks after installation:

```bash
airflow providers list | grep -i trino
python -m pip check
```

## Configure A Trino Connection

The provider uses an Airflow connection with connection type `trino`. The connection form exposes these fields:

- `Host`: Trino coordinator host
- `Login`: Trino user
- `Password`: optional; used for basic authentication
- `Port`: Trino port
- `Extra`: provider-specific options such as auth type, JWT settings, Kerberos settings, client tags, session properties, and timezone

For a repeatable local or container setup, define the connection with `AIRFLOW_CONN_TRINO_DEFAULT`:

```bash
export AIRFLOW_CONN_TRINO_DEFAULT='{
  "conn_type": "trino",
  "host": "trino.example.com",
  "port": 8443,
  "login": "airflow",
  "password": "replace-me",
  "extra": {
    "protocol": "https",
    "session_properties": {
      "query_max_run_time": "10m"
    },
    "client_tags": ["airflow", "etl"],
    "timezone": "UTC"
  }
}'
```

Notes that matter in practice:

- `trino_default` is the default connection id used by the provider examples.
- Airflow supports connection definitions from environment variables, but upstream notes that connections created this way are not stored in the metadata database, do not appear in the UI, and do not show up in `airflow connections list`.
- If you need custom ids, change the environment variable name, for example `AIRFLOW_CONN_ANALYTICS_TRINO=...`, then use that id in DAG code.

### Authentication Extras

The provider connection docs support these auth modes in `Extra`:

- `auth=jwt` with `jwt__token` or `jwt__file`
- `auth=certs` with `certs__client_cert_path` and `certs__client_key_path`
- `auth=kerberos` with Kerberos extras such as `kerberos__service_name`, `kerberos__config`, and `kerberos__principal`

For password-based basic auth, set `login` and `password` and leave `auth` unset. Do not combine password auth with JWT, certs, or Kerberos on the same connection.

## Run SQL In A DAG

The provider docs show Trino SQL tasks using `SQLExecuteQueryOperator`. `sql` can be a single statement, a list of statements, or a templated `.sql` file.

```python
from __future__ import annotations

import pendulum

from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from airflow.sdk import DAG

CATALOG = "lakehouse"
SCHEMA = "analytics"
TABLE = "cities"

with DAG(
    dag_id="trino_sql_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["trino"],
):
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="trino_default",
        sql=f"""
        CREATE TABLE IF NOT EXISTS {CATALOG}.{SCHEMA}.{TABLE} (
            cityid BIGINT,
            cityname VARCHAR
        )
        """,
        handler=list,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="trino_default",
        sql=f"""
        INSERT INTO {CATALOG}.{SCHEMA}.{TABLE} (cityid, cityname)
        VALUES (1, 'San Francisco'), (2, 'New York')
        """,
        handler=list,
        requires_result_fetch=True,
    )

    query_rows = SQLExecuteQueryOperator(
        task_id="query_rows",
        conn_id="trino_default",
        sql=f"""
        SELECT cityid, cityname
        FROM {CATALOG}.{SCHEMA}.{TABLE}
        WHERE cityname = ?
        ORDER BY cityid
        """,
        parameters=("San Francisco",),
        handler=list,
    )

    create_table >> insert_rows >> query_rows
```

Use this pattern when the task is primarily SQL execution and Airflow should manage retries, templating, and task boundaries around the statement.

## Use `TrinoHook` In Python Tasks

Use `TrinoHook` when task code needs to fetch rows, write rows, or mix Trino queries with Python control flow.

```python
from __future__ import annotations

import pendulum

from airflow.providers.trino.hooks.trino import TrinoHook
from airflow.sdk import DAG, task

CATALOG = "lakehouse"
SCHEMA = "analytics"
TABLE = "daily_orders"

with DAG(
    dag_id="trino_hook_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["trino"],
):
    @task()
    def summarize() -> None:
        hook = TrinoHook(trino_conn_id="trino_default")

        row = hook.get_first(
            f"SELECT COUNT(*) FROM {CATALOG}.{SCHEMA}.{TABLE}"
        )
        total = row[0] if row else 0

        recent_rows = hook.get_records(
            f"""
            SELECT order_date, order_count
            FROM {CATALOG}.{SCHEMA}.{TABLE}
            WHERE order_date >= ?
            ORDER BY order_date
            """,
            parameters=("2026-03-01",),
        )

        print(f"total rows: {total}")
        for order_date, order_count in recent_rows:
            print(order_date, order_count)

    summarize()
```

Common hook methods exposed by the provider API:

- `get_first(...)` for one row
- `get_records(...)` for multiple rows
- `get_pandas_df(...)` when you want a DataFrame
- `insert_rows(...)` for batched inserts
- `run(...)` for general SQL execution
- `test_connection()` for a lightweight connectivity check

## Optional: Load CSV Data From GCS

The provider also exposes `GCSToTrinoOperator` when a DAG needs to load CSV data from Google Cloud Storage into Trino.

Use it only if all of these are true:

- you installed the provider with the `google` extra
- the destination table already exists
- your Trino table uses one of the supported destination column types documented by the operator API

This is a targeted transfer operator, not a general replacement for arbitrary Trino ingestion workflows.

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow service image is missing the package.
- Prefer JSON for `AIRFLOW_CONN_*` values when you need nested extras like `session_properties` or auth-specific settings.
- Only one auth method may be configured per connection in current provider releases.
- If you define the connection only through `AIRFLOW_CONN_TRINO_DEFAULT`, it will work at runtime but will not appear in the Airflow UI.
- `TrinoOperator` examples from old blog posts are outdated for `6.x`; use `SQLExecuteQueryOperator` or `TrinoHook` instead.
- The provider docs show `trino_default` as the default connection id. When you instantiate `SQLExecuteQueryOperator` directly, pass the Trino connection with `conn_id`.

## Version Notes

- `6.0.0` removed `TrinoOperator`; migrate old DAGs to `SQLExecuteQueryOperator`.
- `6.3.3` tightened connection auth handling so a single connection cannot declare multiple auth methods.
- `6.5.0` is the current stable provider release published by the Airflow docs and PyPI as of March 13, 2026.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-trino/stable/index.html`
- Connection reference: `https://airflow.apache.org/docs/apache-airflow-providers-trino/stable/connections.html`
- Operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-trino/stable/operators.html`
- `TrinoHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-trino/stable/_api/airflow/providers/trino/hooks/trino/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-trino/stable/changelog.html`
- Airflow connection management docs: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-trino/`
