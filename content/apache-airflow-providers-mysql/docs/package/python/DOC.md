---
name: package
description: "Apache Airflow MySQL provider guide for configuring MySQL connections and using MySqlHook in Airflow DAGs"
metadata:
  languages: "python"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,mysql,python,dags,sql,orchestration"
---

# Apache Airflow MySQL Provider Python Guide

## What This Package Adds

`apache-airflow-providers-mysql` is the MySQL provider package for Apache Airflow. Install it in the same Python environment as `apache-airflow` when your DAGs need to connect to MySQL through Airflow connections and hooks.

This provider is for Airflow tasks and DAG code. It is not a standalone MySQL client library for general application code.

## Install

Pin the provider version your Airflow environment expects:

```bash
python -m pip install "apache-airflow-providers-mysql==6.5.0"
```

Install the provider into the environment used by your Airflow scheduler, workers, and webserver. If you build a custom Airflow image, add the provider during the image build so every Airflow component sees the same installed providers.

## Configure A MySQL Connection

The provider reads credentials and connection settings from an Airflow connection. The default connection id is `mysql_default`.

In the Airflow UI, create a connection with:

- **Connection Id:** `mysql_default`
- **Connection Type:** `mysql`
- **Host:** your MySQL hostname
- **Schema:** the default database name
- **Login / Password:** database credentials
- **Port:** usually `3306`

You can also define the connection with an environment variable:

```bash
export AIRFLOW_CONN_MYSQL_DEFAULT='mysql://airflow:airflow@mysql:3306/analytics?charset=utf8mb4'
```

If the password contains reserved URL characters such as `@`, `:`, or `/`, URL-encode it before putting it in the URI.

Useful connection extras for MySQL deployments:

```json
{
  "charset": "utf8mb4",
  "cursor": "dictcursor",
  "local_infile": false
}
```

Use extras for connection-level behavior such as character set, cursor type, SSL settings, Unix socket settings, or `LOAD DATA LOCAL INFILE` support instead of hardcoding those details in each DAG.

## Minimal Connection Check

Use `MySqlHook` for a quick sanity check from a task:

```python
from airflow.decorators import task
from airflow.providers.mysql.hooks.mysql import MySqlHook

@task
def ping_mysql() -> int:
    hook = MySqlHook(mysql_conn_id="mysql_default")
    row = hook.get_first("SELECT 1")
    return int(row[0])
```

`MySqlHook` uses `mysql_conn_id`, not `conn_id`.

## Common DAG Workflow

For most DAGs, use `MySqlHook` to create tables, write rows, and read results:

```python
from __future__ import annotations

from datetime import datetime

from airflow.decorators import dag, task
from airflow.providers.mysql.hooks.mysql import MySqlHook


@dag(
    dag_id="mysql_provider_example",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    tags=["mysql"],
)
def mysql_provider_example():
    @task
    def create_table() -> None:
        hook = MySqlHook(mysql_conn_id="mysql_default")
        hook.run(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

    @task
    def insert_event() -> None:
        hook = MySqlHook(mysql_conn_id="mysql_default")
        hook.run(
            "INSERT INTO events (name) VALUES (%s)",
            parameters=("signup",),
        )

    @task
    def fetch_recent() -> list[tuple[int, str]]:
        hook = MySqlHook(mysql_conn_id="mysql_default")
        return hook.get_records(
            "SELECT id, name FROM events ORDER BY id DESC LIMIT 10"
        )

    create_table() >> insert_event() >> fetch_recent()


mysql_provider_example()
```

The main hook methods you will use most often are:

- `get_first(sql, parameters=None)` for a single row
- `get_records(sql, parameters=None)` for multiple rows
- `run(sql, parameters=None)` for DDL or DML statements
- `get_conn()` when you need raw DB-API cursor access

## Raw Cursor Access

Drop down to the driver connection when you need explicit cursor handling:

```python
from airflow.providers.mysql.hooks.mysql import MySqlHook

hook = MySqlHook(mysql_conn_id="mysql_default")
conn = hook.get_conn()
cursor = conn.cursor()

try:
    cursor.execute(
        "UPDATE events SET name=%s WHERE id=%s",
        ("activated", 1),
    )
    conn.commit()
finally:
    cursor.close()
    conn.close()
```

When you use `get_conn()` directly, commit write operations yourself.

## Query Parameters And Result Shape

Use MySQL parameter placeholders, not SQLite-style placeholders:

```python
hook.run(
    "INSERT INTO events (name) VALUES (%s)",
    parameters=("signup",),
)
```

Use the connection extra `{"cursor": "dictcursor"}` when you want rows keyed by column name instead of positional tuples.

## Pitfalls

- `MySqlHook` expects `mysql_conn_id`; Airflow's generic SQL operators use `conn_id`
- Use `%s` placeholders for query parameters; do not use `?`
- Commit explicitly when you use a raw connection from `get_conn()`
- Do not push large MySQL result sets through XCom; keep task returns small
- Only enable `local_infile` when you intentionally need local file loading and the server is configured for it

## Version Notes

This guide targets `apache-airflow-providers-mysql` version `6.5.0`. Keep the provider installed in the same Airflow environment as your DAG code, and check Airflow's provider compatibility requirements before upgrading Airflow core or the provider independently.
