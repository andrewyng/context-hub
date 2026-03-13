---
name: package
description: "Apache Airflow Celery provider for CeleryExecutor-based task execution, workers, and Flower monitoring"
metadata:
  languages: "python"
  versions: "3.17.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,celery,executor,workers,flower,distributed-tasks"
---

# Apache Airflow Providers Celery Guide

Use `apache-airflow-providers-celery` when an Airflow deployment needs distributed task execution through Celery workers instead of the default local executor model.

## Golden Rule

- Install this package alongside `apache-airflow`; it is not a standalone runtime.
- Switch the executor only after you have a real metadata database plus a working Celery broker and result backend.
- Run Airflow services and Celery workers as separate processes.
- Keep DAG code and Airflow configuration consistent across the scheduler and worker environment.

## What This Package Adds

This provider supplies Airflow's Celery integration, including:

- `CeleryExecutor`
- `CeleryKubernetesExecutor`
- `airflow celery worker`
- `airflow celery flower`

In normal DAG code you usually do not import from this provider directly. You install it so Airflow can load the executor and Celery-related CLI commands.

## Install

Start from a pinned Airflow installation that uses the official constraints file. Then install the provider in the same command so `pip` does not silently change your Airflow version.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION=3.1.8
PROVIDER_VERSION=3.17.0
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-celery==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep the Airflow package pinned when adding the provider:

```bash
python -m pip install \
  "apache-airflow==3.1.8" \
  "apache-airflow-providers-celery==3.17.0"
```

Useful checks after installation:

```bash
airflow providers list | grep celery
airflow config get-value core executor
```

## Minimal CeleryExecutor Configuration

This package is mainly configuration-driven. A practical starting point is PostgreSQL for the Airflow metadata database, Redis as the Celery broker, and PostgreSQL again for the Celery result backend.

```bash
export AIRFLOW_HOME="$PWD/.airflow"

export AIRFLOW__CORE__EXECUTOR="CeleryExecutor"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

export AIRFLOW__DATABASE__SQL_ALCHEMY_CONN="postgresql+psycopg2://airflow:secret@localhost:5432/airflow"

export AIRFLOW__CELERY__BROKER_URL="redis://localhost:6379/0"
export AIRFLOW__CELERY__RESULT_BACKEND="db+postgresql://airflow:secret@localhost:5432/airflow"
```

Important notes:

- Do not use SQLite for a CeleryExecutor deployment.
- `AIRFLOW__DATABASE__SQL_ALCHEMY_CONN` configures the Airflow metastore.
- `AIRFLOW__CELERY__BROKER_URL` is where Celery workers receive tasks.
- `AIRFLOW__CELERY__RESULT_BACKEND` is where task completion state is stored for Celery.

If you intentionally use the hybrid executor, set:

```bash
export AIRFLOW__CORE__EXECUTOR="CeleryKubernetesExecutor"
```

## Start The Services

Initialize the database once:

```bash
airflow db migrate
```

Then run each component in its own terminal, container, or service unit:

```bash
airflow api-server --port 8080
```

```bash
airflow scheduler
```

```bash
airflow dag-processor
```

```bash
airflow triggerer
```

```bash
airflow celery worker
```

Optional monitoring UI:

```bash
airflow celery flower
```

Once Flower is running, it is typically available on `http://localhost:5555`.

## DAG Code Does Not Change

The provider changes how Airflow executes tasks, not how you author most DAGs. A normal TaskFlow DAG still works; the executor decides whether task instances run locally or through Celery workers.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import dag, task


@dag(
    dag_id="celery_demo",
    schedule=None,
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    tags=["celery"],
)
def celery_demo():
    @task()
    def extract() -> dict[str, int]:
        return {"orders": 3, "returns": 1}

    @task()
    def summarize(stats: dict[str, int]) -> str:
        return f"net={stats['orders'] - stats['returns']}"

    @task()
    def emit(message: str) -> None:
        print(message)

    emit(summarize(extract()))


celery_demo()
```

Put the DAG in your configured DAGs folder, then check that Airflow can parse it:

```bash
airflow dags list
airflow dags show celery_demo
```

To execute it through the configured executor, trigger the DAG normally:

```bash
airflow dags trigger celery_demo
```

## Common Operational Checks

Confirm the executor value:

```bash
airflow config get-value core executor
```

List installed providers:

```bash
airflow providers list | grep celery
```

Local task debugging still works:

```bash
airflow tasks test celery_demo emit 2026-03-12
```

Use `airflow tasks test` for isolated task debugging. Use `airflow dags trigger` when you need the full scheduler plus Celery worker path.

## Common Pitfalls

- Installing the provider without `apache-airflow`: the provider extends Airflow; it does not replace it.
- Forgetting to start a worker: tasks stay queued when the scheduler is healthy but no `airflow celery worker` process is consuming from the broker.
- Mixing local-development defaults with a distributed executor: move off SQLite before enabling Celery.
- Assuming DAG code needs provider-specific imports: most DAGs stay the same; the important change is executor configuration.
- Debugging only with `airflow tasks test`: that command is useful, but it does not replace a real end-to-end run through the scheduler and workers.

## Version Notes

- This guide covers `apache-airflow-providers-celery` version `3.17.0`.
- The examples follow the Airflow 3 service layout and CLI, including `airflow api-server`, `airflow dag-processor`, and `airflow triggerer`.
- If your deployment uses a different Airflow major or minor release, keep the Airflow package pinned when adding or upgrading this provider.
