---
name: providers-plexus
description: "Apache Airflow provider for authenticating to Plexus with Airflow Variables and submitting Plexus jobs from DAGs"
metadata:
  languages: "python"
  versions: "3.4.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,plexus,hooks,operators,dags"
---

# Apache Airflow Plexus Provider Guide

Use `apache-airflow-providers-plexus` when an Airflow DAG needs to authenticate to Plexus and submit a Plexus job through the provider's built-in hook and operator.

This guide covers provider version `3.4.1`.

## Golden Rule

- Treat this as an Airflow 2 provider, not a standalone Plexus SDK. Upstream documents `apache-airflow>=2.6.0` as the minimum supported Airflow version.
- Configure Plexus credentials as Airflow Variables named `email` and `password`. The official hook does not read an Airflow Connection.
- Use `PlexusJobOperator` for normal job submission. It resolves the Plexus app id, queue id, and billing account id for you before it calls the Plexus API.
- Plan conservatively: upstream marks `3.4.1` as removed and no longer maintained by the Airflow community.

## What This Package Adds

This provider is small. The public integration surface is:

- `airflow.providers.plexus.hooks.plexus.PlexusHook`
- `airflow.providers.plexus.operators.job.PlexusJobOperator`

The hook:

- reads `Variable.get("email")` and `Variable.get("password")`
- authenticates against `https://apiplexus.corescientific.com/sso/jwt-token/`
- caches the JWT and exposes it through `hook.token`

The operator:

- accepts a `job_params` dict
- looks up `app` by app `name`
- looks up `queue` by queue `public_name`
- looks up the first billing account for the authenticated user
- submits the job to `https://apiplexus.corescientific.com/jobs/`

## Install

Install the provider into the same environment as your Airflow scheduler and workers. Upstream says this package installs on top of an existing Airflow 2 installation and requires Airflow `>=2.6.0`.

Use a virtual environment and keep `apache-airflow` pinned when adding the provider:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-2.x-version>"
PROVIDER_VERSION="3.4.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-plexus==${PROVIDER_VERSION}"
```

PyPI lists Python `3.8` through `3.11` for `apache-airflow-providers-plexus==3.4.1`.

Useful checks after installation:

```bash
airflow providers list | grep -i plexus
python -c "from airflow.providers.plexus.operators.job import PlexusJobOperator; print(PlexusJobOperator.__name__)"
```

## Configure Credentials

The hook requires two Airflow Variables:

```bash
export AIRFLOW_VAR_EMAIL="user@example.com"
export AIRFLOW_VAR_PASSWORD="your-plexus-password"
```

Those environment variables become Airflow Variables named `email` and `password`.

If you prefer to create them inside Airflow instead of through environment variables:

```bash
airflow variables set email "user@example.com"
airflow variables set password "your-plexus-password"
```

Important behavior from the official hook:

- the Plexus API host is fixed to `https://apiplexus.corescientific.com/`
- missing credentials raise `AirflowException("No valid email/password supplied.")`
- there is no `plexus_conn_id` parameter and no Airflow connection type for this provider

## Submit A Plexus Job

`PlexusJobOperator` is the main workflow this package supports.

Required `job_params` keys:

- `name`
- `app`
- `queue`
- `num_nodes`
- `num_cores`

Minimal DAG example:

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.plexus.operators.job import PlexusJobOperator


with DAG(
    dag_id="plexus_submit_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["plexus"],
) as dag:
    submit_job = PlexusJobOperator(
        task_id="submit_job",
        job_params={
            "name": "airflow-plexus-demo",
            "app": "my-plexus-app",
            "queue": "my-public-cluster",
            "num_nodes": 1,
            "num_cores": 4,
        },
    )
```

What the operator does for you:

- authenticates with `PlexusHook()`
- calls `GET /apps/` to map the human-readable app name to the Plexus app id
- calls `GET /queues/` to map the public queue name to the queue id
- calls `GET /users/{user_id}/billingaccounts/` and takes the first billing account id
- calls `POST /jobs/` with the resolved job parameters
- polls `GET /jobs/{job_id}/` every three seconds until the job reaches its terminal state

## Inspect Apps Or Queues Before Submitting

If you need to confirm the exact Plexus app name or queue public name before wiring the operator into a DAG, create a small Python task with `PlexusHook`.

```python
from __future__ import annotations

import requests

from airflow.decorators import task
from airflow.providers.plexus.hooks.plexus import PlexusHook


@task
def list_plexus_apps() -> list[str]:
    hook = PlexusHook()
    response = requests.get(
        f"{hook.host}apps/",
        headers={"Authorization": f"Bearer {hook.token}"},
        timeout=5,
    )
    response.raise_for_status()
    return [item["name"] for item in response.json()["results"]]
```

The same pattern works for queues:

```python
response = requests.get(
    f"{hook.host}queues/",
    headers={"Authorization": f"Bearer {hook.token}"},
    timeout=5,
)
response.raise_for_status()
queue_names = [item["public_name"] for item in response.json()["results"]]
```

Use this for diagnostics and discovery. Use `PlexusJobOperator` for actual job submission so the provider handles the lookup and polling flow consistently.

## Runtime Behavior And Pitfalls

- `app` must match the Plexus app `name`, not an id.
- `queue` must match the Plexus queue `public_name`, not an id.
- The operator does not let you choose a billing account explicitly. It requests `/users/{user_id}/billingaccounts/` and uses the first result.
- If the app lookup fails or the queue lookup fails, the operator raises an `AirflowException`.
- If the job ever moves to `Cancelled` or `Failed`, the operator raises an `AirflowException`.
- Service apps and batch apps finish differently. For service apps, the operator waits for `Running` when `expected_runtime` is not set, and waits for `Finished` when `expected_runtime` is set. For non-service apps, it waits for `Completed`.
- Every request uses a five-second HTTP timeout in the provider code, so transient API latency can surface as task failures.

## Operational Checks

Check that Airflow can import the provider and that your DAG parses:

```bash
airflow dags list | grep plexus
airflow tasks test plexus_submit_demo submit_job 2026-03-13
```

When task execution fails early, verify these first:

- `AIRFLOW_VAR_EMAIL` and `AIRFLOW_VAR_PASSWORD` are set where the worker runs
- the `app` value matches a Plexus app name exactly
- the `queue` value matches a Plexus queue public name exactly
- the Airflow environment is still on a compatible Python and Airflow 2 version

## Version Notes

- This guide targets `apache-airflow-providers-plexus==3.4.1`.
- Upstream marks `3.4.1` as the release where the Plexus provider was scheduled for removal and states that it is no longer maintained by the Airflow community.
- The provider documentation says the minimum supported Airflow version is `2.6.0`.
- The PyPI metadata for `3.4.1` lists Python `3.8`, `3.9`, `3.10`, and `3.11`.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-plexus/stable/`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-plexus/stable/changelog.html`
- Hook source docs: `https://airflow.apache.org/docs/apache-airflow-providers-plexus/stable/_modules/airflow/providers/plexus/hooks/plexus.html`
- Operator source docs: `https://airflow.apache.org/docs/apache-airflow-providers-plexus/stable/_modules/airflow/providers/plexus/operators/job.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-plexus/`
