---
name: providers-edge3
description: "Apache Airflow Edge3 provider for running tasks on remote edge workers over HTTPS with EdgeExecutor and worker management commands"
metadata:
  languages: "python"
  versions: "3.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,edge,edge-worker,executor,distributed-execution,dag"
---

# Apache Airflow Edge3 Provider Guide

Use `apache-airflow-providers-edge3` when an Airflow deployment needs to run tasks on remote machines that sit behind separate network boundaries and can only reach the central Airflow site over outbound HTTP(S).

## Golden Rule

- Install this provider in the central Airflow environment and in every edge worker environment.
- Configure `airflow.providers.edge3.executors.EdgeExecutor`, the shared edge API settings, and the shared JWT secret before starting workers.
- Keep DAG files and task dependencies synchronized between the central Airflow instance and each edge worker.
- Do not pair provider version `3.1.0` with `apache-airflow==3.1.0`; the maintainer docs explicitly exclude that Airflow core version.

## Install

Install Airflow with the official constraints file, then add the provider in the same command. This example uses `apache-airflow==3.1.1` because provider `3.1.0` requires `apache-airflow>=3.0.0,!=3.1.0`.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="3.1.1"
PROVIDER_VERSION="3.1.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-edge3==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Upstream lists these direct requirements for `apache-airflow-providers-edge3==3.1.0`:

- `apache-airflow>=3.0.0,!=3.1.0`
- `apache-airflow-providers-common-compat>=1.14.0`
- `pydantic>=2.11.0`
- `retryhttp>=1.4.0`
- `aiofiles>=23.2.0`
- `aiohttp>=3.9.2`

## Configure The Central Airflow Instance

The provider expects the central deployment to run the Edge executor and expose the edge API endpoints. Environment-variable configuration is the cleanest setup:

```bash
export AIRFLOW__CORE__EXECUTOR="airflow.providers.edge3.executors.EdgeExecutor"
export AIRFLOW__EDGE__API_ENABLED="True"
export AIRFLOW__EDGE__API_URL="https://airflow.example.com/edge_worker/v1/rpcapi"
export AIRFLOW__API_AUTH__JWT_SECRET="replace-with-a-long-random-shared-secret"

# Required on the central Airflow instance for Airflow 3.0.x and 3.1.x
export AIRFLOW__DATABASE__EXTERNAL_DB_MANAGERS="airflow.providers.edge3.models.db.EdgeDBManager"
```

If you are also using `FabAuthManager` on Airflow 3.0.x or 3.1.x, upstream documents `external_db_managers` as a comma-separated list:

```bash
export AIRFLOW__DATABASE__EXTERNAL_DB_MANAGERS="airflow.providers.fab.auth_manager.models.db.FABDBManager,airflow.providers.edge3.models.db.EdgeDBManager"
```

Then create or migrate the edge tables on the central instance:

```bash
airflow db migrate
```

Start the central services that the workers depend on:

```bash
airflow api-server --port 8080
airflow scheduler
```

Notes:

- If `AIRFLOW__CORE__EXECUTION_API_SERVER_URL` is unset, Airflow derives it from `edge.api_url`.
- The edge API endpoints are disabled by default until `AIRFLOW__EDGE__API_ENABLED=True` is set.

## Start An Edge Worker

Each worker needs Airflow, this provider, access to the same DAG files, and any extra libraries that the assigned tasks import at runtime.

```bash
export AIRFLOW__CORE__EXECUTOR="airflow.providers.edge3.executors.EdgeExecutor"
export AIRFLOW__CORE__DAGS_FOLDER="/opt/airflow/dags"
export AIRFLOW__EDGE__API_ENABLED="True"
export AIRFLOW__EDGE__API_URL="https://airflow.example.com/edge_worker/v1/rpcapi"
export AIRFLOW__API_AUTH__JWT_SECRET="replace-with-the-same-shared-secret"

airflow edge worker -q factory-floor,warehouse -c 4
```

Useful variations:

```bash
airflow edge status
airflow edge stop --wait
airflow edge worker -D --stdout edge-worker.out.log --stderr edge-worker.err.log -q factory-floor
```

What the worker needs before it can pick up tasks:

- outbound HTTP(S) access to the central Airflow API server
- the same DAG files available in `DAGS_FOLDER`
- compatible Airflow and `apache-airflow-providers-edge3` versions on both sides
- the provider packages needed by the operators executed on that worker

## Route Tasks To Edge Workers

Edge workers pull from queues. Assign a queue in your DAG, then start workers that listen to the same queue name.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task


with DAG(
    dag_id="edge_site_healthcheck",
    schedule=None,
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    tags=["edge"],
) as dag:
    @task(executor="EdgeExecutor", queue="factory-floor", pool_slots=1)
    def read_local_sensor() -> str:
        return "sensor-ok"

    @task
    def report(status: str) -> None:
        print(status)

    report(read_local_sensor())
```

Practical rules from the maintainer docs:

- `queue` decides which workers can claim the task.
- A worker started with `airflow edge worker -q factory-floor` only serves that queue.
- If `EdgeExecutor` is not your default executor, set `executor="EdgeExecutor"` at the task or DAG level in addition to the queue.
- Match task `pool_slots` to worker concurrency so a task does not ask for more slots than the worker can provide.

## Operate And Maintain Workers

Local maintenance on the worker host:

```bash
airflow edge maintenance --comments "kernel patching" on --wait
airflow edge status
airflow edge maintenance off
```

Cluster-wide maintenance commands on the central Airflow instance:

```bash
airflow edge list-workers -o json
airflow edge remote-edge-worker-request-maintenance -H edge-host-01 -c "planned restart"
airflow edge remote-edge-worker-exit-maintenance -H edge-host-01
```

These remote-management commands need database access and only work from the central Airflow instance.

## UI And API

With Airflow 3.1 and newer, the provider adds:

- `Admin -> Edge Worker` for worker status and maintenance state
- `Admin -> Edge Worker Jobs` for queued and running job visibility
- `/edge_worker/v1/jobs`
- `/edge_worker/v1/logs`
- `/edge_worker/v1/workers`
- `/edge_worker/v1/health`

Open `/edge_worker/docs` in the Airflow UI to inspect the generated API documentation.

The UI plugin requires either role `Admin`, role `Op`, or the individual permissions `can read on Plugins` and `can read on Jobs`.

## Common Pitfalls

- On Airflow 3.0.x and 3.1.x, forgetting `AIRFLOW__DATABASE__EXTERNAL_DB_MANAGERS=airflow.providers.edge3.models.db.EdgeDBManager` means `airflow db migrate` will not create the edge tables the provider needs.
- Central and edge environments must stay aligned. If the worker detects that the Airflow version or Edge provider version does not match the API server, it stops accepting new tasks and shuts down gracefully.
- The worker only executes tasks whose runtime dependencies are installed locally. Installing the edge provider alone is not enough if your DAG also imports other providers or third-party packages.
- Airflow 3.0 does not support the Edge UI plugin. Use the CLI commands for status and maintenance if the central deployment is still on 3.0.x.
- If you run multiple API server or webserver instances without a shared log volume, edge log uploads can be split across instances.

## Version Notes For Provider 3.1.0

- `apache-airflow-providers-edge3==3.1.0` was released on March 4, 2026.
- This release introduces `EdgeDBManager` and the docs add the `external_db_managers` requirement for central Airflow instances before Airflow 3.2.
- The changelog also notes a fix for an Edge executor startup crash on Airflow versions earlier than 3.2.

## Official Docs

- Provider home: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/`
- Provider package page: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/index.html`
- Edge worker deployment: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/deployment.html`
- Edge executor details: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/edge_executor.html`
- Edge UI plugin and REST API: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/ui_plugin.html`
- Configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/configurations-ref.html`
- CLI reference: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/cli-ref.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-edge3/3.1.0/changelog.html`
- Providers package reference: `https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html`
- Apache Airflow PyPI package: `https://pypi.org/project/apache-airflow/`
- Provider PyPI package: `https://pypi.org/project/apache-airflow-providers-edge3/`
