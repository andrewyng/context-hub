---
name: package
description: "Apache Airflow HTTP provider for calling HTTP and REST endpoints with hooks, operators, and sensors"
metadata:
  languages: "python"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,http,rest,operators,sensors,hooks"
---

# Apache Airflow HTTP Provider Guide

Use `apache-airflow-providers-http` when an Airflow DAG needs to call an HTTP endpoint, wait for a health check to succeed, or wrap a custom REST workflow in Python code.

## Golden Rule

- Install this package alongside `apache-airflow`; it is not a standalone HTTP client.
- Put the remote server details on an Airflow `HTTP` connection, then keep DAG code focused on `endpoint`, headers, and response handling.
- Use `HttpOperator` for request/response tasks, `HttpSensor` for readiness checks, and `HttpHook` when task code needs lower-level control.
- Keep API tokens and passwords in Airflow connections, variables, or a secrets backend instead of hard-coding them in DAG files.

## What This Package Adds

This provider supplies Airflow's HTTP integration, including:

- `HttpOperator`
- `HttpSensor`
- `HttpHook`

These are the core entry points most DAGs use from this provider.

## Install

Install the provider with your Airflow environment and keep the provider version pinned:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="6.0.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-http==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i http
```

## Configure An HTTP Connection

Start with a basic Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

For a plain HTTP endpoint, define the connection as a URI:

```bash
export AIRFLOW_CONN_HTTP_DEFAULT='http://api_user:api_password@api.example.com:80'
```

For an HTTPS endpoint, the HTTP provider uses Airflow's historical connection parsing, so the URI looks unusual:

```bash
export AIRFLOW_CONN_HTTP_DEFAULT='http://api_user:api_password@api.example.com:443/https'
```

Important notes:

- The connection id in the examples below is `http_default` because it matches `AIRFLOW_CONN_HTTP_DEFAULT`.
- The `/https` path segment is the provider's documented way to signal TLS when using URI-style environment variables.
- If you prefer not to use the URI form, create the connection in the Airflow UI or CLI with connection type `HTTP`.
- If usernames or passwords contain reserved URL characters, URL-encode them before putting them in `AIRFLOW_CONN_HTTP_DEFAULT`.

## Call An API With `HttpOperator`

Use `HttpOperator` when the task is mostly "make a request, check the response, optionally return a small parsed value".

```python
import json

from airflow import DAG
from airflow.providers.http.operators.http import HttpOperator
from pendulum import datetime

with DAG(
    dag_id="http_operator_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_order = HttpOperator(
        task_id="create_order",
        http_conn_id="http_default",
        method="POST",
        endpoint="v1/orders",
        data=json.dumps({"sku": "sku_123", "quantity": 1}),
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer {{ var.value.example_api_token }}",
        },
        response_check=lambda response: response.status_code == 201,
        response_filter=lambda response: response.json()["id"],
        log_response=True,
    )
```

Practical points:

- `http_conn_id` selects the Airflow HTTP connection.
- `endpoint` is the path appended to that connection's base URL.
- `response_check` should return `True` for a successful response.
- `response_filter` is the easiest way to return a small JSON fragment to XCom instead of the entire response body.

## Wait For A Service With `HttpSensor`

Use `HttpSensor` when a downstream task should not run until an HTTP endpoint is ready:

```python
from airflow import DAG
from airflow.providers.http.sensors.http import HttpSensor
from pendulum import datetime

with DAG(
    dag_id="http_sensor_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    wait_for_api = HttpSensor(
        task_id="wait_for_api",
        http_conn_id="http_default",
        endpoint="health",
        response_check=lambda response: response.status_code == 200,
        poke_interval=30,
        timeout=300,
    )
```

This pattern is useful for partner APIs, internal services, and rollout checks where a simple `200 OK` gate is enough.

## Use `HttpHook` Inside TaskFlow Code

Use `HttpHook` when task logic needs direct access to the response object:

```python
from airflow import DAG
from airflow.decorators import task
from airflow.models import Variable
from airflow.providers.http.hooks.http import HttpHook
from pendulum import datetime

with DAG(
    dag_id="http_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def fetch_user() -> dict:
        token = Variable.get("example_api_token")

        hook = HttpHook(method="GET", http_conn_id="http_default")
        response = hook.run(
            endpoint="v1/users/42",
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {token}",
            },
        )

        response.raise_for_status()
        return response.json()

    fetch_user()
```

`hook.run(...)` returns a `requests.Response`, so you can call normal response methods such as `raise_for_status()`, `json()`, and `text`.

## Auth And Configuration Pattern

For most DAGs, a clean split is:

- keep the host, port, and basic connection details on `http_default` or another named Airflow HTTP connection
- keep bearer tokens in an Airflow Variable or secrets backend and pass them through the `Authorization` header
- use `HttpOperator` when the task only needs a request plus a small parsed result
- use `HttpHook` when Python code must inspect headers, status codes, or response bodies more directly

## Pitfalls

- Install the provider everywhere Airflow imports DAG code. Import errors usually mean one scheduler, worker, or task image is missing the package.
- Use `http_conn_id` for this provider's classes. Do not replace it with a generic `conn_id`.
- HTTPS connection URIs are intentionally counter-intuitive in environment-variable form; use the documented `...:443/https` pattern or configure the connection in the Airflow UI.
- Keep XCom payloads small. If an endpoint returns large JSON, use `response_filter` to return only the fields later tasks need.
- Keep credentials out of DAG source. Use Airflow connections, variables, or your secrets backend instead of literal tokens in Python files.

## Version Notes

This guide targets `apache-airflow-providers-http` version `6.0.0`. Provider packages track Airflow compatibility separately from Airflow core, so re-check the provider docs before changing Airflow core and provider versions independently.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-http/stable/`
- HTTP connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-http/stable/connections/http.html`
- `HttpHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-http/stable/_api/airflow/providers/http/hooks/http/index.html`
- `HttpOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-http/stable/_api/airflow/providers/http/operators/http/index.html`
- `HttpSensor` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-http/stable/_api/airflow/providers/http/sensors/http/index.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-http/6.0.0/`
