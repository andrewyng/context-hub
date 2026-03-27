---
name: providers-presto
description: "Apache Airflow Presto provider for Presto connections, SQL tasks, and hook-based DAG workflows"
metadata:
  languages: "python"
  versions: "5.11.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,presto,sql,dag,python"
---

# apache-airflow-providers-presto

Use `apache-airflow-providers-presto` when an Airflow DAG needs to run Presto SQL through an Airflow connection or access Presto from Python task code with `PrestoHook`.

This package is an Airflow provider, not a standalone Presto client for regular Python applications.

This guide targets provider version `5.11.0`.

## Install

Install the provider into the same Python environment or container image as `apache-airflow`. In practice, the scheduler, webserver, and every worker that imports DAG code must all have the provider available.

Pin Airflow and the provider together, and use the Airflow constraints file for your Airflow version:

```bash
AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.11.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-presto==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If you add the provider later, keep `apache-airflow` pinned in the same install command so `pip` does not silently move core Airflow to another version.

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `Presto`.

You can create it in the Airflow UI, or define it with an environment variable:

```bash
export AIRFLOW_CONN_PRESTO_ANALYTICS='{"conn_type":"presto","host":"presto.example.com","port":8443,"login":"airflow","password":"secret","schema":"analytics","extra":{"catalog":"hive","protocol":"https","session_props":{"query_max_run_time":"5m"}}}'
```

With that environment variable in place:

- the Airflow connection id is `presto_analytics`
- `SQLExecuteQueryOperator` uses `conn_id="presto_analytics"`
- `PrestoHook` uses `presto_conn_id="presto_analytics"`

Connection fields you usually need:

- `Host`: Presto coordinator host name
- `Login`: user name sent to Presto
- `Password`: password when your cluster requires basic auth
- `Port`: coordinator port, typically `8080` or `8443`
- `Schema`: default schema for unqualified table names
- `Extra.catalog`: default catalog, such as `hive`
- `Extra.protocol`: `http` or `https`

Useful connection extras documented by the provider include:

- `catalog`
- `protocol`
- `requests_kwargs`
- `session_props`
- JWT auth fields such as `jwt__file` or `jwt__token`
- Kerberos fields such as `kerberos__config` and `kerberos__service_name`

Keep auth and cluster-specific settings in Airflow connections or your secrets backend instead of hard-coding them in DAG files.

## Run SQL In A DAG

For normal SQL tasks, use Airflow's common SQL operator with the Presto connection.

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="presto_sql_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_table = SQLExecuteQueryOperator(
        task_id="create_table",
        conn_id="presto_analytics",
        sql="""
        CREATE TABLE IF NOT EXISTS hive.analytics.daily_counts (
            ds DATE,
            row_count BIGINT
        )
        """,
    )

    insert_rows = SQLExecuteQueryOperator(
        task_id="insert_rows",
        conn_id="presto_analytics",
        sql="""
        INSERT INTO hive.analytics.daily_counts
        SELECT current_date, COUNT(*)
        FROM hive.analytics.events
        """,
    )

    create_table >> insert_rows
```

Use this pattern when the task is just SQL execution and you do not need custom Python logic around the query.

## Query Presto From Python Tasks

Use `PrestoHook` when task code needs cursor-level access from Python.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.presto.hooks.presto import PrestoHook
from pendulum import datetime

with DAG(
    dag_id="presto_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_recent_orders() -> None:
        hook = PrestoHook(presto_conn_id="presto_analytics")
        conn = hook.get_conn()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT order_id, total_amount
            FROM hive.analytics.orders
            ORDER BY created_at DESC
            LIMIT 10
            """
        )

        for order_id, total_amount in cursor.fetchall():
            print(order_id, total_amount)

    read_recent_orders()
```

`get_conn()` returns a DB-API style connection backed by the Presto Python client, so standard cursor methods like `execute()` and `fetchall()` work as expected.

## Insert Rows From Python

`PrestoHook.insert_rows(...)` is the provider's write helper when a Python task already has rows prepared.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.presto.hooks.presto import PrestoHook
from pendulum import datetime

with DAG(
    dag_id="presto_insert_rows_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def write_audit_rows() -> None:
        hook = PrestoHook(presto_conn_id="presto_analytics")
        hook.insert_rows(
            table="task_audit",
            rows=[
                ("presto_insert_rows_example", "success"),
                ("presto_insert_rows_example", "complete"),
            ],
            target_fields=["dag_id", "status"],
            commit_every=1000,
        )

    write_audit_rows()
```

Use unqualified table names only when your connection's `schema` and `extra.catalog` already point at the destination you want.

## Important Notes

- Install the provider everywhere DAG code runs. A missing worker image is enough to trigger `ModuleNotFoundError` at parse time or task runtime.
- Set both the schema and the catalog correctly. In this provider, the catalog lives in connection extras, not in the main schema field.
- Keep coordinator URLs, credentials, JWT files, and Kerberos settings in Airflow connections or a secrets backend, not in DAG source files.
- This provider is for Airflow DAGs. If you are writing a normal Python service outside Airflow, use a dedicated Presto client directly instead of importing Airflow hooks.

## Version Notes

- `PrestoHook.get_pandas_df(...)` was deprecated in the `5.10.0` line. Do not start new code with that helper.
- `5.11.0` adds hook-level OpenLineage database info support and raises the minimum SQLAlchemy version for the provider's SQLAlchemy integration to `1.4.54`.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-presto/stable/`
- Presto connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-presto/stable/connections/presto.html`
- Presto operators docs: `https://airflow.apache.org/docs/apache-airflow-providers-presto/stable/operators.html`
- `PrestoHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-presto/stable/_api/airflow/providers/presto/hooks/presto/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-presto/stable/changelog.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-presto/5.11.0/`
