---
name: providers-datadog
description: "Apache Airflow Datadog provider guide for configuring a Datadog connection, sending metrics and events, and polling Datadog from Python DAGs"
metadata:
  languages: "python"
  versions: "3.10.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "apache-airflow,airflow,datadog,python,metrics,events,sensors,hooks"
---

# Apache Airflow Datadog Provider Guide

Use `apache-airflow-providers-datadog` when an Airflow DAG needs to send Datadog metrics, post Datadog events, or poll Datadog's event stream. The provider exposes one Airflow connection type (`datadog`), one hook (`DatadogHook`), and one sensor (`DatadogSensor`).

This package extends Apache Airflow. It is not a general Datadog SDK for dashboards, monitors, or account management.

## Install

The current provider release `3.10.2` requires `apache-airflow>=2.11.0`, `apache-airflow-providers-common-compat>=1.10.1`, and `datadog>=0.50.0`.

Install it in the same Python environment as every Airflow component that imports your DAGs:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-datadog==3.10.2"
```

PyPI currently publishes wheels for Python `3.10` through `3.13`.

## Configure The Airflow Connection

The provider's Datadog connection uses these fields:

- `conn_type`: `datadog`
- `host`: host name attached to submitted metrics and events
- `extra.api_host`: Datadog API base URL such as `https://api.datadoghq.com` or your regional Datadog site
- `extra.api_key`: Datadog API key
- `extra.app_key`: Datadog application key
- `extra.source_type_name`: optional source label attached to emitted events

Datadog documents API keys and application keys separately. In practice:

- keep an API key in the connection for write calls such as metrics and events
- add an application key for read/query calls such as `query_metric(...)` and `DatadogSensor`

Example environment variables:

```bash
export DATADOG_API_KEY='<datadog-api-key>'
export DATADOG_APP_KEY='<datadog-application-key>'
export DATADOG_API_HOST='https://api.datadoghq.com'
export DATADOG_EVENT_HOST='airflow-prod'
```

Create the Airflow connection as JSON:

```bash
export AIRFLOW_CONN_DATADOG_DEFAULT='{"conn_type":"datadog","host":"airflow-prod","extra":{"api_host":"https://api.datadoghq.com","api_key":"<datadog-api-key>","app_key":"<datadog-application-key>","source_type_name":"airflow"}}'
```

Or create the same connection with the Airflow CLI:

```bash
airflow connections add 'datadog_default' \
  --conn-json '{
    "conn_type": "datadog",
    "host": "airflow-prod",
    "extra": {
      "api_host": "https://api.datadoghq.com",
      "api_key": "<datadog-api-key>",
      "app_key": "<datadog-application-key>",
      "source_type_name": "airflow"
    }
  }'
```

Keep keys in the connection or your Airflow secrets backend instead of embedding them in DAG code.

## Send Metrics With `DatadogHook`

`DatadogHook.send_metric(...)` sends a single point with the connection's configured host.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.datadog.hooks.datadog import DatadogHook
from pendulum import datetime


with DAG(
    dag_id="datadog_metrics_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def publish_metric() -> None:
        hook = DatadogHook(datadog_conn_id="datadog_default")
        hook.send_metric(
            metric_name="airflow.etl.rows_loaded",
            datapoint=1284,
            tags=["env:prod", "dag_id:datadog_metrics_example"],
            type_="gauge",
        )

    publish_metric()
```

Use tags for dimensions you plan to query later. The method forwards `metric_name`, `datapoint`, `tags`, `type_`, `interval`, and `host` to the Datadog client.

## Post Events And Query Metrics

Use `post_event(...)` for Datadog Events and `query_metric(...)` when a task needs historical metric data from Datadog.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.datadog.hooks.datadog import DatadogHook
from pendulum import datetime


with DAG(
    dag_id="datadog_event_and_query_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def publish_and_query() -> None:
        hook = DatadogHook(datadog_conn_id="datadog_default")

        hook.post_event(
            title="Warehouse load finished",
            text="Loaded 1284 rows into analytics.",
            alert_type="success",
            aggregation_key="warehouse-load",
            tags=["env:prod", "team:data-platform"],
        )

        series = hook.query_metric(
            query="avg:airflow.etl.rows_loaded{env:prod}.rollup(avg, 300)",
            from_seconds_ago=1800,
            to_seconds_ago=0,
        )
        print(series)

    publish_and_query()
```

`query_metric(...)` queries a relative time window ending `to_seconds_ago` seconds before now. If this call fails with Datadog authorization errors, check the application key and its scopes first.

## Wait For Events With `DatadogSensor`

`DatadogSensor` queries the Datadog event stream on each poke. Use `priority`, `sources`, and `tags` to narrow the query, and add `response_check` when you want an explicit success condition based on the returned event payload.

```python
from airflow import DAG
from airflow.providers.datadog.sensors.datadog import DatadogSensor
from pendulum import datetime


with DAG(
    dag_id="datadog_sensor_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    wait_for_event = DatadogSensor(
        task_id="wait_for_event",
        datadog_conn_id="datadog_default",
        from_seconds_ago=1800,
        up_to_seconds_from_now=0,
        priority="normal",
        sources="airflow",
        tags=["env:prod", "service:payments"],
    )
```

Use `response_check` when you need task-specific filtering beyond the built-in `priority`, `sources`, and `tags` arguments:

```python
response_check=lambda response: bool(response.get("events"))
```

## Practical Notes

- `host` in the Airflow connection is not the Datadog API endpoint. Put the Datadog site URL in `extra.api_host`.
- Use the Datadog site for your account. `https://api.datadoghq.com` is only the default US1 endpoint.
- Install the provider on every Airflow process that imports DAG files, not just on the scheduler.
- This provider does not ship Datadog operators. Use `DatadogHook` inside Python tasks and `DatadogSensor` when you need polling behavior.
- Keep Datadog secrets in Airflow connections or a secrets backend. Do not hard-code them into DAG source.

## Version Notes For `3.10.2`

- This guide targets `apache-airflow-providers-datadog==3.10.2`.
- The provider version is independent from Apache Airflow core. The package index for `3.10.2` requires Airflow `>=2.11.0`.

## Official Sources

- Provider docs root: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/
- Package index: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/index.html
- Datadog connection type: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/connections/datadog.html
- `DatadogHook` API: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/_api/airflow/providers/datadog/hooks/datadog/index.html
- `DatadogSensor` API: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/_api/airflow/providers/datadog/sensors/datadog/index.html
- `DatadogHook` source listing: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/_modules/airflow/providers/datadog/hooks/datadog.html
- `DatadogSensor` source listing: https://airflow.apache.org/docs/apache-airflow-providers-datadog/stable/_modules/airflow/providers/datadog/sensors/datadog.html
- Airflow provider installation docs: https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html
- Airflow managing connections docs: https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html
- Datadog API and application keys: https://docs.datadoghq.com/account_management/api-app-keys/
- PyPI package page: https://pypi.org/project/apache-airflow-providers-datadog/
