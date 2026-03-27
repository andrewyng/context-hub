---
name: providers-singularity
description: "Apache Airflow Singularity provider for running container commands with SingularityOperator"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,singularity,containers,python,dag,operator"
---

# apache-airflow-providers-singularity

Use `apache-airflow-providers-singularity` when an Airflow DAG needs to start a Singularity container on the worker with `SingularityOperator`.

This guide targets provider version `3.9.2`.

## What This Package Adds

`apache-airflow-providers-singularity` is an Apache Airflow provider package. Its public entry point is:

- `airflow.providers.singularity.operators.singularity.SingularityOperator`

This package extends Airflow. It is not a standalone container SDK for ordinary Python applications outside Airflow.

## Install

PyPI lists these minimum runtime requirements for `3.9.2`:

- `apache-airflow >= 2.11.0`
- Python `3.10`, `3.11`, `3.12`, or `3.13`

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-singularity==3.9.2"
```

Upstream also lists `apache-airflow-providers-common-compat>=1.6.1` and `spython>=0.0.56` as package dependencies. A normal `pip install` of the provider resolves those automatically.

Useful checks after installation:

```bash
airflow providers list | grep -i singularity
python -m pip check
```

## Prerequisites

Before using the operator, make sure:

- the Airflow worker that runs the task has the provider installed
- that worker can run a working Singularity-compatible container runtime
- the image URI or local image path you reference is reachable from that worker
- any bind-mounted host paths exist on that worker

The operator source calls `spython.main.Client` to pull, start, and stop the container. In practice, that means the container runtime setup lives on the worker image or host, not in an Airflow connection.

Environment variables are usually the cleanest way to keep DAG code portable:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export SINGULARITY_IMAGE="docker://busybox:1.36.1"
export APP_ENV="dev"
export HOST_DATA_DIR="/opt/airflow/data"
```

## Minimal `SingularityOperator` DAG

Use `image` plus `command` for the basic case. `environment` values are exported before the instance starts.

```python
import os

from airflow import DAG
from airflow.providers.singularity.operators.singularity import SingularityOperator
from pendulum import datetime


SINGULARITY_IMAGE = os.environ.get("SINGULARITY_IMAGE", "docker://busybox:1.36.1")


with DAG(
    dag_id="singularity_basic",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["singularity"],
) as dag:
    run_container = SingularityOperator(
        task_id="run_container",
        image=SINGULARITY_IMAGE,
        command='/bin/sh -c "echo APP_ENV=$APP_ENV && uname -a"',
        environment={"APP_ENV": os.environ.get("APP_ENV", "dev")},
    )
```

Arguments you will use most often:

- `image`: local image path or remote URI such as `docker://busybox:1.36.1`
- `command`: command run inside the container
- `environment`: environment variables exported before launch
- `working_dir`: working directory inside the container
- `volumes`: bind mounts in `host_path:container_path` form
- `force_pull`: pull the image before running when it is not already present locally
- `pull_folder`: directory used for pulled images
- `options`: extra runtime flags passed through to Singularity
- `auto_remove`: remove the local pulled image path after the task finishes

## Pull An Image And Bind A Host Directory

This is the practical pattern when the worker should pull an image on demand and expose a host directory inside the container:

```python
import os

from airflow import DAG
from airflow.providers.singularity.operators.singularity import SingularityOperator
from pendulum import datetime


HOST_DATA_DIR = os.environ.get("HOST_DATA_DIR", "/opt/airflow/data")


with DAG(
    dag_id="singularity_bind_mount",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_report = SingularityOperator(
        task_id="run_report",
        image="docker://busybox:1.36.1",
        command='/bin/sh -c "ls -la /workspace && cat /workspace/input.txt"',
        volumes=[f"{HOST_DATA_DIR}:/workspace"],
        working_dir="/workspace",
        force_pull=True,
        pull_folder="/opt/airflow/singularity",
        auto_remove=False,
    )
```

Use this pattern when:

- workers do not already have the image staged locally
- each worker has a stable local directory for pulled images
- the task needs a simple host bind mount instead of a more complex executor-specific volume system

## Templating Behavior

The operator templates these fields:

- `command`
- `environment`

That means Jinja values such as `{{ ds }}` or `{{ dag_run.run_id }}` work in those arguments:

```python
from airflow import DAG
from airflow.providers.singularity.operators.singularity import SingularityOperator
from pendulum import datetime


with DAG(
    dag_id="singularity_templated_command",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False,
) as dag:
    print_context = SingularityOperator(
        task_id="print_context",
        image="docker://busybox:1.36.1",
        command='/bin/sh -c "echo ds={{ ds }} run_id={{ dag_run.run_id }}"',
        environment={"RUN_ID": "{{ dag_run.run_id }}"},
    )
```

The operator source only marks `command` and `environment` as template fields. Do not expect Airflow to template `image`, `working_dir`, `pull_folder`, or `volumes`.

## Important Pitfalls

- This provider exposes an operator, not an Airflow connection type. Runtime setup happens through worker host configuration and operator arguments.
- `force_pull=True` does not mean "always refresh". In the operator source it only pulls when the `image` path does not already exist locally.
- Bind mounts in `volumes` are resolved on the Airflow worker that launches the task, not on the scheduler and not on your laptop unless that is also the worker.
- The operator logs container output but does not return it from `execute()`. Do not depend on command stdout appearing as an XCom value.
- Only `command` and `environment` are templated. If you need a per-run image name or bind path, compute it in Python before constructing the operator.
- `auto_remove=True` is for cleaning up the local pulled image path after the run. Leave it off if the image path is shared across tasks or managed outside the task lifecycle.

## Version Notes

This doc is scoped to `apache-airflow-providers-singularity` `3.9.2`. Provider versions are separate from Airflow core versions, so re-check compatibility when you upgrade either Airflow or the provider package.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-singularity/stable/`
- Installation and package metadata: `https://airflow.apache.org/docs/apache-airflow-providers-singularity/stable/index.html`
- `SingularityOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-singularity/stable/_api/airflow/providers/singularity/operators/singularity/index.html`
- `SingularityOperator` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-singularity/stable/_modules/airflow/providers/singularity/operators/singularity.html#SingularityOperator`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-singularity/`
