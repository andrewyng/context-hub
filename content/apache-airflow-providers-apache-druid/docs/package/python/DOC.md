---
name: package
description: "Apache Airflow Druid provider for submitting ingestion specs, running Druid SQL checks, and querying Druid from Airflow tasks"
metadata:
  languages: "python"
  versions: "4.5.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,druid,apache-druid,dag,python"
---

# apache-airflow-providers-apache-druid

Use `apache-airflow-providers-apache-druid` when an Airflow DAG needs to submit a Druid ingestion spec, run a Druid SQL data check, or query Druid from Python task code through Airflow-managed connections.

This package is an Airflow provider, not a standalone Druid client for ordinary Python applications.

This guide targets provider version `4.5.0`.

## Install

Install the provider into the same Python environment or container image as `apache-airflow`. In practice, that means the scheduler, webserver, and every worker that imports DAG code must have the provider available.

Pin Airflow and the provider together, and use the Airflow constraints file for your Airflow version:

```bash
AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.5.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-druid==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

## Choose The Right Interface

This provider exposes three common integration paths:

- `DruidOperator`: submit an indexing task to Druid ingestion
- `DruidCheckOperator`: run a SQL check against Druid and fail the Airflow task when the result is not truthy
- `DruidDbApiHook`: query Druid from Python task code

Most DAGs use one of these patterns:

- submit an ingestion spec with `DruidOperator`
- verify a datasource with `DruidCheckOperator`
- fetch a small result set in Python with `DruidDbApiHook`

## Configure Airflow Connections

Keep Druid endpoints, credentials, and TLS settings in Airflow connections instead of hard-coding them in DAG files.

Typical connection ids used by this provider:

- `druid_ingest_default` for ingestion through the Druid overlord or indexing service
- `druid_broker_default` for Druid SQL queries through the broker or router

Example environment-variable connections:

```bash
export AIRFLOW_CONN_DRUID_INGEST_DEFAULT='{"conn_type":"druid","host":"druid-overlord.example.com","port":8081}'

export AIRFLOW_CONN_DRUID_BROKER_DEFAULT='{"conn_type":"druid","host":"druid-broker.example.com","port":8888}'
```

If your Druid deployment requires authentication, TLS, or custom extras, keep those values on the Airflow connection instead of embedding them in Python code.

Useful check:

```bash
airflow connections get druid_ingest_default
airflow connections get druid_broker_default
```

## Submit An Ingestion Task

Use `DruidOperator` when the Airflow task should submit a Druid ingestion spec file.

```python
from airflow import DAG
from airflow.providers.apache.druid.operators.druid import DruidOperator
from pendulum import datetime

with DAG(
    dag_id="druid_ingestion_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    submit_index = DruidOperator(
        task_id="submit_index",
        json_index_file="/opt/airflow/dags/druid/index_wikipedia.json",
    )
```

`json_index_file` must point to a valid Druid ingestion spec that is readable by the Airflow worker running the task.

If you do not use the default ingestion connection id, pass `druid_ingest_conn_id` explicitly.

## Run A Druid SQL Check

Use `DruidCheckOperator` when a task should fail unless a query returns a truthy result.

```python
from airflow import DAG
from airflow.providers.apache.druid.operators.druid_check import DruidCheckOperator
from pendulum import datetime

with DAG(
    dag_id="druid_check_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    check_rows_loaded = DruidCheckOperator(
        task_id="check_rows_loaded",
        sql="SELECT COUNT(*) FROM wikipedia",
    )
```

By default, the check uses the Druid broker connection. If your deployment uses a different Airflow connection id, pass `druid_broker_conn_id` explicitly.

This is the simplest pattern for guardrail tasks such as:

- checking that a datasource has at least one row
- verifying a filtered query returns data before downstream publishing steps
- stopping the DAG early when ingestion produced an empty result

## Query Druid From Python Tasks

Use `DruidDbApiHook` when task code needs a query result in Python.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.druid.hooks.druid import DruidDbApiHook
from pendulum import datetime

with DAG(
    dag_id="druid_hook_query_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def print_top_countries() -> None:
        hook = DruidDbApiHook()

        rows = hook.get_records(
            """
            SELECT country, COUNT(*) AS row_count
            FROM wikipedia
            GROUP BY country
            ORDER BY row_count DESC
            LIMIT 10
            """
        )

        for country, row_count in rows:
            print(country, row_count)

    print_top_countries()
```

Use this for small result sets and branching logic. Keep large aggregations and scans inside Druid rather than moving big datasets through an Airflow worker.

## Important Notes

- Use the ingestion connection for indexing tasks and the broker connection for SQL queries. They target different Druid services.
- `json_index_file` is resolved on the worker that runs the task. A local path on your laptop is not enough if tasks run in containers or on remote workers.
- Install the provider everywhere DAG code is imported or executed. One missing worker image is enough to cause import failures at runtime.
- Keep credentials and TLS settings in Airflow connections or your secrets backend, not in DAG source files.
- This provider orchestrates Druid from Airflow. If you are writing a regular Python application outside Airflow, use a dedicated Druid client library instead of Airflow hooks and operators.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-druid/stable/`
- Druid connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-druid/stable/connections/druid.html`
- Hook API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-druid/stable/_api/airflow/providers/apache/druid/hooks/druid/index.html`
- Operator API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-druid/stable/_api/airflow/providers/apache/druid/operators/druid/index.html`
- Druid check operator API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-druid/stable/_api/airflow/providers/apache/druid/operators/druid_check/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-druid/`
