---
name: providers-apache-pinot
description: "Apache Airflow Pinot provider for Airflow-managed Pinot SQL queries and Pinot controller admin tasks"
metadata:
  languages: "python"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,pinot,apache-pinot,sql,dag,python"
---

# apache-airflow-providers-apache-pinot

Use `apache-airflow-providers-apache-pinot` when an Airflow DAG needs to query Apache Pinot through a broker connection or call Pinot controller admin endpoints for schemas, tables, and segments.

This provider is not a standalone Pinot client for ordinary Python applications. It plugs Pinot into Airflow through:

- `SQLExecuteQueryOperator` for SQL tasks
- `PinotDbApiHook` for Python-driven broker queries
- `PinotAdminHook` for controller admin operations

This guide targets provider version `4.10.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-apache-pinot==4.10.0"
```

If you manage Airflow and providers together, pin Airflow in the same command so `pip` does not silently upgrade or downgrade core:

```bash
AIRFLOW_VERSION="<your-airflow-version>"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-pinot==4.10.0"
```

Upstream lists these minimum requirements for `4.10.0`:

- Python `>=3.10`
- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-sql>=1.23.0`

Install the provider anywhere Airflow imports or runs DAG code:

- scheduler
- webserver
- workers or task execution image

## Configure Airflow Connections

This provider uses two separate Airflow connection types:

- `pinot` for broker SQL queries
- `pinot_admin` for Pinot controller admin APIs

Keep endpoints and credentials in Airflow connections or your secrets backend instead of hard-coding them in DAG files.

### Broker SQL Connection

`PinotDbApiHook` uses the default connection id `pinot_broker_default`. The provider's `pinot` connection type uses:

- `Host`: Pinot broker or router host
- `Port`: defaults to `8000`
- `Extra`: optional `endpoint` value such as `query/sql`

Example environment-variable connection:

```bash
export AIRFLOW_CONN_PINOT_BROKER_DEFAULT='{"conn_type":"pinot","host":"pinot-broker.example.com","port":8000,"extra":{"endpoint":"query/sql"}}'
```

Useful check:

```bash
airflow connections get pinot_broker_default
```

`PinotDbApiHook.get_conn()` builds the underlying `pinotdb.connect(...)` call from the Airflow connection host, port, and the optional `endpoint` extra.

### Pinot Controller Admin Connection

`PinotAdminHook` uses the default connection id `pinot_admin_default`. The provider's `pinot_admin` connection type uses:

- `Host`: Pinot controller host
- `Port`: defaults to `9000`
- `Login`: optional username
- `Password`: optional password

Example environment-variable connection:

```bash
export AIRFLOW_CONN_PINOT_ADMIN_DEFAULT='{"conn_type":"pinot_admin","host":"pinot-controller.example.com","port":9000,"login":"airflow","password":"secret"}'
```

Useful check:

```bash
airflow connections get pinot_admin_default
```

Point this connection at the Pinot controller, not the broker. `PinotAdminHook` calls controller REST endpoints such as schema, table, and segment APIs.

## Run Pinot SQL In A DAG

The provider docs recommend Airflow's generic SQL operator for Pinot SQL work. Use `conn_id` with your Pinot broker connection:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="pinot_sql_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    query_top_cities = SQLExecuteQueryOperator(
        task_id="query_top_cities",
        conn_id="pinot_broker_default",
        sql="""
        SELECT city, COUNT(*) AS row_count
        FROM trips
        GROUP BY city
        ORDER BY row_count DESC
        LIMIT 10
        """,
    )
```

Use this pattern when the task is just SQL execution and you do not need custom Python logic around the query.

## Query Pinot From Python Tasks

Use `PinotDbApiHook` when later task logic needs query results in Python:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.pinot.hooks.pinot import PinotDbApiHook
from pendulum import datetime

with DAG(
    dag_id="pinot_hook_query_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def summarize_trips() -> None:
        hook = PinotDbApiHook(pinot_conn_id="pinot_broker_default")

        total_row = hook.get_first("SELECT COUNT(*) FROM trips")
        top_cities = hook.get_records(
            """
            SELECT city, COUNT(*) AS row_count
            FROM trips
            GROUP BY city
            ORDER BY row_count DESC
            LIMIT 5
            """
        )

        total = total_row[0] if total_row else 0
        print(f"total rows: {total}")
        for city, row_count in top_cities:
            print(city, row_count)

    summarize_trips()
```

Use this when:

- downstream logic depends on query results
- you need to branch or format output in Python
- the result set is small enough to move through an Airflow task

## Manage Pinot Schemas, Tables, And Segments

Use `PinotAdminHook` when a task needs Pinot controller admin APIs.

### Create Or Update A Schema And Table

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.pinot.hooks.pinot import PinotAdminHook
from pendulum import datetime

SCHEMA = {
    "schemaName": "events",
    "dimensionFieldSpecs": [
        {"name": "event_type", "dataType": "STRING"},
    ],
    "dateTimeFieldSpecs": [
        {
            "name": "event_time",
            "dataType": "LONG",
            "format": "1:MILLISECONDS:EPOCH",
            "granularity": "1:MILLISECONDS",
        }
    ],
}

TABLE_CONFIG = {
    "tableName": "events_OFFLINE",
    "tableType": "OFFLINE",
    "segmentsConfig": {
        "schemaName": "events",
        "replication": "1",
    },
    "tenants": {},
}

with DAG(
    dag_id="pinot_admin_schema_table_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def ensure_pinot_objects() -> None:
        hook = PinotAdminHook(pinot_admin_conn_id="pinot_admin_default")
        hook.add_schema(schema_name="events", schema=SCHEMA)
        hook.add_table(table_name="events_OFFLINE", table_config=TABLE_CONFIG)

    ensure_pinot_objects()
```

### Upload A Segment

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.pinot.hooks.pinot import PinotAdminHook
from pendulum import datetime

with DAG(
    dag_id="pinot_upload_segment_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def upload_segment() -> None:
        hook = PinotAdminHook(pinot_admin_conn_id="pinot_admin_default")
        hook.upload_segment(
            segment_name="events_20260313_0",
            table_name="events_OFFLINE",
            segment_uri="file:///opt/airflow/pinot/events_20260313_0.tar.gz",
        )

    upload_segment()
```

`PinotAdminHook` also exposes `create_segment(...)` when your workflow uses the Pinot segment-generation command and controller APIs together.

## Common Setup Pattern

For most DAGs, keep the split simple:

- use `pinot_broker_default` with `SQLExecuteQueryOperator` or `PinotDbApiHook` for SQL
- use `pinot_admin_default` with `PinotAdminHook` for controller operations
- keep hosts, ports, and credentials on Airflow connections rather than in DAG code

That keeps DAGs portable across environments and makes it obvious whether a task talks to the broker or the controller.

## Pitfalls

- Install the provider everywhere Airflow imports or executes DAG code. One missing worker image is enough to cause import failures.
- Do not point `pinot_admin_default` at a broker endpoint or `pinot_broker_default` at a controller endpoint. They target different Pinot services.
- Set the broker `endpoint` extra if your Pinot deployment exposes SQL on a non-default path.
- Keep controller credentials in the Airflow connection or secrets backend instead of embedding them in Python.
- Use worker-accessible file paths or URIs for segment uploads. A file path on your laptop will not exist inside a worker container unless you mount it there.

## Version Notes

- This guide covers `apache-airflow-providers-apache-pinot` version `4.10.0`.
- The provider's published requirements for `4.10.0` include Airflow `2.11.0+` and Python `3.10+`.
- Provider release notes state that `PinotAdminHook` gained username and password support in `4.7.0`. If you are copying older examples, they may omit controller authentication.
- Provider release notes also note that `PinotAdminHook.create_segment()` no longer accepts a custom `cmd_path` as of `4.0.0`; the hook uses the hard-coded `pinot-admin.sh` command name.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/index.html`
- Providers installation guide: `https://airflow.apache.org/docs/apache-airflow-providers/index.html`
- Pinot SQL operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/operators.html`
- Pinot connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/connections/pinot.html`
- Pinot admin connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/connections/pinot_admin.html`
- `PinotDbApiHook` and `PinotAdminHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/_api/airflow/providers/apache/pinot/hooks/pinot/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pinot/stable/changelog.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-pinot/`
