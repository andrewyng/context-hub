---
name: providers-openfaas
description: "Apache Airflow provider for deploying, updating, deleting, and invoking OpenFaaS functions from DAG tasks"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,openfaas,faas,serverless,hooks"
---

# Apache Airflow OpenFaaS Provider Guide

Use `apache-airflow-providers-openfaas` when an Airflow DAG needs to talk to an OpenFaaS gateway to deploy a function, update it, remove it, or invoke it over HTTP.

## Golden Rule

- Install this package into an existing Airflow environment; it is not a standalone OpenFaaS SDK.
- The provider exposes a single hook, `OpenFaasHook`. Use it from TaskFlow tasks, `PythonOperator`, or your own operator.
- Put the gateway base URL on an Airflow connection of type `openfaas` and keep function names plus deployment-specific values outside the DAG file.
- For authenticated gateways or strict HTTP error handling, plan to wrap or subclass the hook. In `3.9.2`, the hook only reads `conn.host`, sends payloads with `requests.post(..., data=...)`, and returns response text without calling `raise_for_status()`.

## What This Package Adds

This provider's main entry points are:

- `OpenFaasHook`
- Airflow connection type `openfaas`

There is no operator or sensor layer in this package. DAG code usually imports the hook directly.

## Install

The provider depends on Apache Airflow `>=2.10.0`. Install it into the same environment used by the scheduler, workers, and any task runtime that imports your DAG code.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.9.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-openfaas==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider so `pip` does not silently change your Airflow core version:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-openfaas==3.9.2"
```

Useful checks after installation:

```bash
airflow providers list | grep -i openfaas
python -c "from airflow.providers.openfaas.hooks.openfaas import OpenFaasHook; print('ok')"
```

## Configure The OpenFaaS Connection

Start with a normal Airflow environment and keep the gateway URL plus function name in deployment config:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

export OPENFAAS_GATEWAY_URL="http://127.0.0.1:8080"
export OPENFAAS_FUNCTION_NAME="hello"
```

Create the Airflow connection:

```bash
airflow connections add 'openfaas_default' \
  --conn-type 'openfaas' \
  --conn-host "$OPENFAAS_GATEWAY_URL"
```

Confirm it exists:

```bash
airflow connections get openfaas_default
```

The provider docs list `host`, `login`, `password`, and `extra` as optional connection fields. The `3.9.2` hook implementation uses the connection host as the base gateway URL and does not read the other fields when it makes requests.

## Common Workflow: Invoke A Function From A DAG

For a local or otherwise unauthenticated gateway, call `invoke_function` directly from a task:

```python
from __future__ import annotations

import os

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.openfaas.hooks.openfaas import OpenFaasHook


FUNCTION_NAME = os.environ["OPENFAAS_FUNCTION_NAME"]


with DAG(
    dag_id="openfaas_invoke_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["openfaas"],
):
    @task()
    def invoke_function() -> str:
        hook = OpenFaasHook(openfaas_conn_id="openfaas_default")
        response_text = hook.invoke_function(
            function_name=FUNCTION_NAME,
            body="hello from airflow",
        )
        if not response_text:
            raise ValueError("OpenFaaS returned an empty response")
        return response_text

    invoke_function()
```

The hook posts to the OpenFaaS gateway path `/function/<function_name>` and returns the response body as text.

## Common Workflow: Deploy, Update, And Delete Functions

The hook also exposes the OpenFaaS admin paths used for function lifecycle operations:

```python
from airflow.providers.openfaas.hooks.openfaas import OpenFaasHook


hook = OpenFaasHook(openfaas_conn_id="openfaas_default")

hook.deploy_function(
    function_name="hello-python",
    body={
        "service": "hello-python",
        "image": "ghcr.io/example/hello-python:latest",
        "envProcess": "python index.py",
    },
)

hook.update_function(
    function_name="hello-python",
    body={
        "service": "hello-python",
        "image": "ghcr.io/example/hello-python:v2",
    },
)

hook.delete_function(function_name="hello-python")
```

These methods target:

- `POST /system/functions`
- `PUT /system/functions`
- `DELETE /system/functions`

For OpenFaaS deployments that expose the gateway admin API, the upstream REST API docs describe these as privileged endpoints and show Basic Auth on the gateway.

## Authenticated Or Strictly Checked Requests

OpenFaaS CE and Standard commonly protect the gateway with Basic Auth. If you need auth headers, response status checks, or request timeouts, use the hook for connection lookup and issue the HTTP request yourself:

```python
from __future__ import annotations

import os

import requests

from airflow.providers.openfaas.hooks.openfaas import OpenFaasHook


hook = OpenFaasHook(openfaas_conn_id="openfaas_default")
gateway_url = hook.get_conn()

response = requests.post(
    f"{gateway_url}/function/{os.environ['OPENFAAS_FUNCTION_NAME']}",
    data="hello from airflow",
    auth=(
        os.environ["OPENFAAS_ADMIN_USERNAME"],
        os.environ["OPENFAAS_ADMIN_PASSWORD"],
    ),
    timeout=30,
)
response.raise_for_status()
print(response.text)
```

Use this pattern when the thin provider hook is not enough for your gateway policy or observability requirements.

## Available Hook Methods

`OpenFaasHook` in `3.9.2` exposes these methods:

- `get_conn()` returns the configured gateway base URL string
- `deploy_function(function_name, body)`
- `delete_function(function_name)`
- `invoke_function(function_name, body)`
- `update_function(function_name, body)`

## Pitfalls

- Install the provider everywhere Airflow imports DAG code. A missing package on a worker or image causes import failures even if the scheduler has it.
- Do not expect this provider to manage authentication for you. In `3.9.2`, the hook reads `conn.host` and ignores the documented `login`, `password`, and `extra` connection fields when making requests.
- The hook returns response text only. It does not expose HTTP status codes or raise exceptions on non-2xx responses.
- The hook sends request bodies with `requests.post(..., data=...)`, not `json=...`. If your function or gateway expects JSON semantics, serialize carefully or issue the HTTP request yourself.
- `function_name` is used directly in the gateway path. Keep it stable and deployment-specific through env vars, Airflow Variables, or other config instead of hard-coding it repeatedly across DAG files.

## Version Notes

- This guide covers `apache-airflow-providers-openfaas` version `3.9.2`.
- The provider documentation added a dedicated `openfaas` connection type in the `3.9.0` line. If you are pinned below that, re-check the provider docs before copying connection setup commands.
- Provider versions and Airflow core versions move independently. Re-check provider compatibility before upgrading one without the other.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/`
- Requirements: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/index.html#requirements`
- OpenFaaS connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/connections/openfaas.html`
- `OpenFaasHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/_api/airflow/providers/openfaas/hooks/openfaas/index.html`
- `OpenFaasHook` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/_modules/airflow/providers/openfaas/hooks/openfaas.html`
- OpenFaaS REST API docs: `https://docs.openfaas.com/reference/rest-api/`
- OpenFaaS function invocation docs: `https://docs.openfaas.com/reference/async/`
- Airflow `3.9.0` release notes entry for OpenFaaS connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-openfaas/stable/changelog.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-openfaas/`
