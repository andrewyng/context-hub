---
name: providers-elasticsearch
description: "Apache Airflow Elasticsearch provider for SQL and Python hook access plus Elasticsearch-backed task logging"
metadata:
  languages: "python"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,elasticsearch,logging,sql,dag,python"
---

# apache-airflow-providers-elasticsearch

Use `apache-airflow-providers-elasticsearch` when your Airflow deployment needs one of two things:

- Airflow-managed access to Elasticsearch through `ElasticsearchSQLHook`
- Elasticsearch-backed task logging, including `write_to_es` support on Airflow 3

This guide targets provider version `6.5.0`.

## Install

Install the provider into the same Python environment or container image used by your Airflow scheduler, webserver, and workers:

```bash
python -m pip install "apache-airflow-providers-elasticsearch==6.5.0"
```

Upstream lists these runtime requirements for `6.5.0`:

- Apache Airflow `>=2.11.0`
- Python `>=3.10`
- `apache-airflow-providers-common-sql>=1.26.0`
- `elasticsearch>=8.10.0,<9.0.0`

If one Airflow service is missing the provider, DAG parsing or task execution will fail with import errors even if other services have it installed.

## Configure The Airflow Connection

The provider defines the `ElasticSearch` connection type. The default connection id is typically `elasticsearch_default`.

Set it with an environment variable:

```bash
export AIRFLOW_CONN_ELASTICSEARCH_DEFAULT='elasticsearch://elastic:api_key@es.example.com:9200/https'
```

With that environment variable in place:

- the Airflow connection id is `elasticsearch_default`
- `ElasticsearchSQLHook` uses `elasticsearch_conn_id="elasticsearch_default"`
- `SQLExecuteQueryOperator` uses `conn_id="elasticsearch_default"`

Important connection fields from the maintainer docs:

- `Host`: Elasticsearch endpoint
- `Port`: `9200` for a direct node or `443` behind HTTPS proxies
- `Login`: login value for the initial connection
- `Password`: Elasticsearch API key for the initial connection
- `Schema`: `http` or `https`
- `Extra`: optional JSON such as `{"http_compress": true, "timeout": 30}`

All connection URI parts must be URL-encoded if they contain special characters.

## Query Elasticsearch Through The SQL Hook

Use `ElasticsearchSQLHook` when you want Airflow to manage the connection and you want to call the Elasticsearch SQL API from a task.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchSQLHook
from pendulum import datetime

with DAG(
    dag_id="elasticsearch_sql_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def show_tables() -> None:
        hook = ElasticsearchSQLHook(elasticsearch_conn_id="elasticsearch_default")
        conn = hook.get_conn()

        response = conn.execute_sql("SHOW TABLES")
        print(response)

    show_tables()
```

If you prefer an operator, provider `6.1.0` added cursor support so the same connection can be used with `SQLExecuteQueryOperator`:

```python
from airflow import DAG
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator
from pendulum import datetime

with DAG(
    dag_id="elasticsearch_sql_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    show_tables = SQLExecuteQueryOperator(
        task_id="show_tables",
        conn_id="elasticsearch_default",
        sql="SHOW TABLES",
    )
```

Use this pattern when your task is just SQL execution and you do not need extra Python logic around the response.

## Use The Native Elasticsearch Client In A Task

Use `ElasticsearchPythonHook` when you want the provider to create an `elasticsearch.Elasticsearch` client directly.

```python
import os

from airflow import DAG
from airflow.decorators import task
from airflow.providers.elasticsearch.hooks.elasticsearch import ElasticsearchPythonHook
from pendulum import datetime

with DAG(
    dag_id="elasticsearch_python_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def search_logs() -> dict:
        hook = ElasticsearchPythonHook(
            hosts=[os.environ["ELASTICSEARCH_URL"]],
            es_conn_args={
                "basic_auth": (
                    os.environ["ELASTICSEARCH_USER"],
                    os.environ["ELASTICSEARCH_PASSWORD"],
                ),
                "verify_certs": True,
            },
        )

        result = hook.search(
            index="airflow-logs-*",
            query={
                "query": {
                    "match": {
                        "message": "failed",
                    }
                }
            },
        )
        print(result)
        return result

    search_logs()
```

Environment variables for that task-level pattern:

```bash
export ELASTICSEARCH_URL="https://es.example.com:9200"
export ELASTICSEARCH_USER="elastic"
export ELASTICSEARCH_PASSWORD="your-password-or-api-key"
```

`ElasticsearchPythonHook` takes `hosts` and optional `es_conn_args`; it does not use an Airflow connection id in the same way that `ElasticsearchSQLHook` does. The hook docs explicitly call out `basic_auth` and `ca_cert` as examples of values passed through `es_conn_args`.

## Send Airflow Task Logs To Elasticsearch

The same provider also ships the Elasticsearch task log handler. The common setup is:

```bash
export AIRFLOW__LOGGING__REMOTE_LOGGING="True"
export AIRFLOW__ELASTICSEARCH__HOST="https://es.example.com:9200"
export AIRFLOW__ELASTICSEARCH__WRITE_STDOUT="True"
export AIRFLOW__ELASTICSEARCH__JSON_FORMAT="True"
export AIRFLOW__ELASTICSEARCH__JSON_FIELDS="asctime,filename,lineno,levelname,message"
export AIRFLOW__ELASTICSEARCH_CONFIGS__VERIFY_CERTS="True"
```

Use `WRITE_STDOUT="True"` when another runtime component collects stdout and forwards it to Elasticsearch.

If Airflow should write logs to Elasticsearch itself, enable `write_to_es` and set the target index:

```bash
export AIRFLOW__LOGGING__REMOTE_LOGGING="True"
export AIRFLOW__ELASTICSEARCH__HOST="https://es.example.com:9200"
export AIRFLOW__ELASTICSEARCH__WRITE_TO_ES="True"
export AIRFLOW__ELASTICSEARCH__TARGET_INDEX="airflow-logs"
export AIRFLOW__ELASTICSEARCH__JSON_FORMAT="True"
export AIRFLOW__ELASTICSEARCH_CONFIGS__VERIFY_CERTS="True"
```

Useful logging settings from the maintainer configuration reference:

- `host`: Elasticsearch endpoint used by the log handler
- `frontend`: base URL for the Kibana or OpenSearch Dashboards UI when Airflow should generate external log links
- `write_stdout`: write structured logs to stdout instead of writing to Elasticsearch directly
- `write_to_es`: send logs directly from Airflow to Elasticsearch
- `json_format` and `json_fields`: control structured log payloads
- `target_index`: index used when `write_to_es` is enabled
- `elasticsearch_configs`: extra client options such as TLS verification

## Pitfalls

- Install the provider everywhere DAG code runs. Scheduler-only installation is not enough.
- URL-encode special characters in `AIRFLOW_CONN_*` URIs.
- `ElasticsearchSQLHook` is the Airflow-connection-backed hook. The older deprecated `ElasticsearchHook` was removed in provider `6.0.0`.
- `ElasticsearchPythonHook` expects `hosts` and client kwargs directly. Do not pass `elasticsearch_conn_id` to it and expect SQL-hook behavior.
- If you enable `write_to_es`, keep the Airflow logging config consistent across scheduler, workers, and webserver or log retrieval will be inconsistent.
- `delete_local_logs=True` only removes local task logs after a successful remote upload, so keep local storage available while you are still validating the remote logging path.

## Version Notes

- This guide covers `apache-airflow-providers-elasticsearch` version `6.5.0`.
- Provider `6.5.0` fixes `write_to_es` behavior for Airflow 3.
- Provider `6.1.0` added cursor support so `ElasticsearchSQLHook` works with `SQLExecuteQueryOperator`.
- Provider `6.0.0` removed the deprecated `ElasticsearchHook`; use `ElasticsearchSQLHook` instead.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/`
- Installation and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/index.html`
- Elasticsearch connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/connections/elasticsearch.html`
- Elasticsearch hook API reference: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/_api/airflow/providers/elasticsearch/hooks/elasticsearch/index.html`
- Elasticsearch logging configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/configurations-ref.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-elasticsearch/stable/changelog.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-elasticsearch/`
