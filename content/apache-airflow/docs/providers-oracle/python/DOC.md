---
name: providers-oracle
description: "Apache Airflow Oracle provider for Airflow connections, SQL tasks, and OracleHook-based DAG workflows"
metadata:
  languages: "python"
  versions: "4.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,oracle,oracledb,sql,dag,python"
---

# apache-airflow-providers-oracle

Use `apache-airflow-providers-oracle` to connect Airflow to Oracle Database through an Airflow connection, run SQL from DAG tasks, and call Oracle from Python tasks with `OracleHook`.

This guide targets provider version `4.5.0`.

## What This Package Adds

`apache-airflow-providers-oracle` is an Apache Airflow provider package. Install it when your DAGs need Oracle connections and hook-based access from Airflow tasks.

This package extends Airflow. It is not a standalone Oracle client for general application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-oracle==4.5.0"
```

The 4.5.0 provider docs list these minimum requirements:

- `apache-airflow >= 2.11.0`
- `oracledb >= 2.0.0`
- `apache-airflow-providers-common-sql >= 1.26.0`

In practice, the scheduler, workers, and webserver all need the provider installed anywhere DAG code imports it.

## Configure The Airflow Connection

The provider reads connection settings from an Airflow connection with connection type `oracle`. The default connection id is `oracle_default`.

In the Airflow UI, configure:

- **Connection Id:** `oracle_default`
- **Connection Type:** `oracle`
- **Host:** Oracle host name
- **Schema:** default Oracle schema to use after connecting
- **Login / Password:** Oracle credentials
- **Port:** usually `1521`

Use one of these extras to select the database service:

- `service_name`
- `sid`
- `dsn`

Do not set both `sid` and `service_name` in the same connection.

Environment variable example using a service name:

```bash
export AIRFLOW_CONN_ORACLE_DEFAULT='oracle://app_user:secret@db.example.com:1521/analytics?service_name=orclpdb1'
```

With that environment variable in place:

- the Airflow connection id is `oracle_default`
- SQL operators use `conn_id="oracle_default"`
- `OracleHook` uses `oracle_conn_id="oracle_default"`
- `analytics` is the default schema, while `service_name=orclpdb1` selects the Oracle service

Useful extras you may need in real deployments:

```json
{
  "service_name": "orclpdb1",
  "mode": "sysdba",
  "fetch_lobs": true,
  "fetch_decimals": true,
  "thick_mode": true,
  "thick_mode_lib_dir": "/opt/oracle/instantclient_23_5",
  "thick_mode_config_dir": "/opt/oracle/network/admin"
}
```

Connection notes:

- Use `service_name`, `sid`, or `dsn` in extras to choose the database target. In the 4.x provider line, `schema` is not the service selector.
- If you need Oracle Client libraries, enable `thick_mode` and make those libraries available on every Airflow runtime that may open the connection.
- For wallet and TLS-based setups, the provider also supports extras such as `wallet_location`, `wallet_password`, `ssl_server_cert_dn`, and `ssl_server_dn_match`.
- If the password or extras contain reserved URL characters, URL-encode them before putting them in `AIRFLOW_CONN_*`.

## Minimal Connection Check

Use `OracleHook` for a quick sanity check from a task:

```python
from airflow.decorators import task
from airflow.providers.oracle.hooks.oracle import OracleHook


@task
def ping_oracle() -> int:
    hook = OracleHook(oracle_conn_id="oracle_default")
    row = hook.get_first("SELECT 1 FROM dual")
    return int(row[0])
```

`OracleHook` uses `oracle_conn_id`, not `conn_id`.

## Run SQL In A DAG

For SQL-only tasks, use Airflow's generic SQL operator with an Oracle connection:

```python
from __future__ import annotations

from datetime import datetime

from airflow.decorators import dag
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator


@dag(
    dag_id="oracle_sql_example",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    tags=["oracle"],
)
def oracle_sql_example():
    insert_row = SQLExecuteQueryOperator(
        task_id="insert_row",
        conn_id="oracle_default",
        sql="""
        INSERT INTO customer_events (event_name, created_at)
        VALUES (:event_name, SYSDATE)
        """,
        parameters={"event_name": "signup"},
    )

    mark_processed = SQLExecuteQueryOperator(
        task_id="mark_processed",
        conn_id="oracle_default",
        sql="""
        UPDATE customer_events
        SET processed_at = SYSDATE
        WHERE event_name = :event_name
        """,
        parameters={"event_name": "signup"},
    )

    insert_row >> mark_processed


oracle_sql_example()
```

Use this pattern when the task is just SQL execution and you do not need Python logic around the result set.

## Query Oracle From Python Tasks

Use `OracleHook` when you need to fetch rows, branch on results, or mix database work with Python task logic:

```python
from __future__ import annotations

from datetime import datetime

from airflow.decorators import dag, task
from airflow.providers.oracle.hooks.oracle import OracleHook


@dag(
    dag_id="oracle_hook_example",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    tags=["oracle"],
)
def oracle_hook_example():
    @task
    def read_summary() -> dict[str, int]:
        hook = OracleHook(oracle_conn_id="oracle_default")

        row = hook.get_first(
            """
            SELECT COUNT(*)
            FROM customer_events
            WHERE event_name = :event_name
            """,
            parameters={"event_name": "signup"},
        )

        records = hook.get_records(
            """
            SELECT id, event_name
            FROM customer_events
            WHERE ROWNUM <= 10
            ORDER BY id
            """
        )

        print(records)
        return {"signup_count": int(row[0]) if row else 0}

    read_summary()


oracle_hook_example()
```

Useful hook methods for everyday DAG work:

- `get_first(...)` for a single row
- `get_records(...)` for multiple rows
- `run(...)` for executing SQL from Python code
- `get_conn()` when you need the underlying DB-API connection

## Call Stored Procedures

For procedure calls from a Python task, use `OracleHook.callproc(...)`:

```python
from airflow.decorators import task
from airflow.providers.oracle.hooks.oracle import OracleHook


@task
def run_procedure() -> int:
    hook = OracleHook(oracle_conn_id="oracle_default")

    result = hook.callproc(
        "refresh_customer_rollups",
        parameters=[42, int],
    )

    return int(result[1])
```

Pass `OUT` parameters as Python types or instances. In the example above, the procedure receives one input argument (`42`) and one integer output argument.

## Bulk Insert Rows

Use `bulk_insert_rows(...)` when you need batched inserts from a Python task:

```python
from airflow.decorators import task
from airflow.providers.oracle.hooks.oracle import OracleHook


@task
def load_batch() -> None:
    hook = OracleHook(oracle_conn_id="oracle_default")
    hook.bulk_insert_rows(
        table="customer_events",
        rows=[
            ("signup",),
            ("purchase",),
            ("refund",),
        ],
        target_fields=["event_name"],
        commit_every=1000,
    )
```

If your table uses an Oracle sequence instead of an identity column, pass `sequence_column` and `sequence_name` as well.

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or service is missing the package.
- `OracleHook` expects `oracle_conn_id`; generic SQL operators use `conn_id`.
- For 4.x providers, use `extra.service_name` or `extra.sid` to pick the Oracle database target. Do not rely on `schema` for that older behavior.
- Regular SQL statements passed to `insert_rows(...)` should not end with `;`. Use PL/SQL block syntax only when you are intentionally executing a `BEGIN ... END;` block.
- Thick mode needs Oracle Client libraries on the worker runtime. Setting `thick_mode=true` without those libraries will not work.
- Keep credentials in Airflow connections or a secrets backend instead of hard-coding usernames and passwords in DAG files.

## Version Notes

- This guide targets `apache-airflow-providers-oracle` version `4.5.0`.
- The 4.5.0 provider docs list `apache-airflow >= 2.11.0` as the minimum compatible Airflow version.
- Oracle connection extras for wallets, TLS server DN checks, `fetch_decimals`, `fetch_lobs`, and connection-class settings were added in the 4.3.0 line. Older blog posts may not mention them.
- The 4.4.0 line specialized Oracle hook `get_first(...)` and `get_records(...)` return handling to avoid Oracle data types causing XCom serialization failures.
- The 4.0.0 line removed deprecated behavior that treated `schema` as the Oracle service name. Use `extra.service_name` instead.
- The 4.5.0 operator guide points new SQL work to `SQLExecuteQueryOperator`. The generated Python API docs still include `OracleStoredProcedureOperator`, but `OracleHook.callproc(...)` is the clearest current API for procedure calls.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/`
- Oracle connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/connections/oracle.html`
- `OracleHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/_api/airflow/providers/oracle/hooks/oracle/index.html`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/operators.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/changelog.html`
- 4.5.0 package page: `https://airflow.apache.org/docs/apache-airflow-providers-oracle/stable/index.html`
