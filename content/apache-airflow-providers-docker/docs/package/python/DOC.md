---
name: package
description: "Apache Airflow Docker provider for running containerized tasks with DockerOperator and Docker connections"
metadata:
  languages: "python"
  versions: "4.5.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,docker,containers,python,dag,operator"
---

# apache-airflow-providers-docker

Use `apache-airflow-providers-docker` to run containerized work from Airflow DAGs with `DockerOperator` and Airflow's Docker connection type.

This guide targets provider version `4.5.2`.

## What This Package Adds

`apache-airflow-providers-docker` is an Apache Airflow provider package. Install it when DAG tasks need to start Docker containers, pass files or environment variables into those containers, or connect to a local or remote Docker Engine from Airflow.

This package extends Airflow. It is not a standalone replacement for the Docker SDK in regular application code outside Airflow.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-docker==4.5.2"
```

In practice, the scheduler, workers, and any other Airflow runtime that imports DAG code need the provider available.

## Prerequisites

Before using the operator, make sure:

- the Airflow worker that runs the task can reach a Docker daemon
- that daemon can pull or access the image you reference
- any bind-mounted host paths exist on the worker that launches the container

If you run Airflow with Celery, Kubernetes, or another distributed executor, Docker access must exist in the worker runtime, not just on the machine where you edit DAGs.

## Configure Docker Access

The provider supports two practical setup patterns:

- pass `docker_url` directly in the operator, usually from `DOCKER_HOST`
- create an Airflow Docker connection and use `docker_conn_id`

For direct configuration, keep the daemon URL in an environment variable:

```bash
export DOCKER_HOST='unix://var/run/docker.sock'
export APP_ENV='dev'
export API_TOKEN='replace-me'
```

For connection-based configuration, create an Airflow connection with connection type `docker`, point it at your Docker daemon URL, and use that connection id in the operator. If your Docker daemon requires TLS client certificates, configure the TLS settings on the connection instead of hard-coding them in each DAG.

## Minimal `DockerOperator` Task

This is the smallest useful pattern for running a container from a DAG:

```python
import os

from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from pendulum import datetime


DOCKER_HOST = os.environ.get("DOCKER_HOST", "unix://var/run/docker.sock")


with DAG(
    dag_id="docker_operator_basic",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_container = DockerOperator(
        task_id="run_container",
        image="python:3.12-slim",
        command='python -c "import os; print(f\"APP_ENV={os.environ[\\\"APP_ENV\\\"]}\")"',
        docker_url=DOCKER_HOST,
        api_version="auto",
        environment={"APP_ENV": os.environ.get("APP_ENV", "dev")},
    )
```

Key arguments in everyday use:

- `image` selects the container image to run
- `command` is the command executed inside the container
- `docker_url` points at the Docker daemon when you are not using an Airflow connection
- `api_version="auto"` lets the Docker client negotiate the engine API version
- `environment` passes non-secret environment variables into the container

## Use An Airflow Connection Instead Of `docker_url`

If you already manage infrastructure access through Airflow connections, switch to `docker_conn_id` and let the connection hold the daemon details:

```python
from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from pendulum import datetime


with DAG(
    dag_id="docker_operator_connection",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_via_connection = DockerOperator(
        task_id="run_via_connection",
        image="bash:5.2",
        command="date -Iseconds",
        docker_conn_id="docker_default",
        api_version="auto",
    )
```

Use one approach consistently inside a DAG. Connection-based configuration is usually easier to rotate and centralize across environments.

## Pass Secrets And Mount Files

Use `private_environment` for sensitive values and `mounts` when the container needs files from the worker host.

```python
import os

from airflow import DAG
from airflow.providers.docker.operators.docker import DockerOperator
from docker.types import Mount
from pendulum import datetime


DOCKER_HOST = os.environ.get("DOCKER_HOST", "unix://var/run/docker.sock")


with DAG(
    dag_id="docker_operator_mounts",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_job = DockerOperator(
        task_id="run_job",
        image="python:3.12-slim",
        command="python /workspace/jobs/build_report.py",
        docker_url=DOCKER_HOST,
        api_version="auto",
        working_dir="/workspace/jobs",
        environment={"APP_ENV": os.environ.get("APP_ENV", "dev")},
        private_environment={"API_TOKEN": os.environ["API_TOKEN"]},
        mounts=[
            Mount(
                source="/opt/airflow/dags/jobs",
                target="/workspace/jobs",
                type="bind",
            )
        ],
        mount_tmp_dir=False,
    )
```

`private_environment` is the right place for secrets that should not be exposed the same way as ordinary task environment values. For bind mounts, remember that `/opt/airflow/dags/jobs` must exist on the Airflow worker that starts the container.

## Important Pitfalls

- `DockerOperator` runs against the Docker daemon visible from the worker. A mounted socket or reachable TCP endpoint on the scheduler alone is not enough.
- By default, the operator can create and mount a temporary host directory into the container and expose it as `AIRFLOW_TMP_DIR`. If you use a remote engine or Docker-in-Docker and that bind mount cannot work, set `mount_tmp_dir=False` and use explicit mounts or volumes instead.
- Use `private_environment` or an Airflow secrets backend for secrets. Keep `environment` for non-sensitive values.
- Host paths in `Mount(...)` are resolved on the worker host, not on your laptop and not inside the scheduler container unless that is also the worker.
- Keep `api_version="auto"` unless you have a reason to pin a specific Docker API version for daemon compatibility.

## Version Notes

This doc is scoped to `apache-airflow-providers-docker` `4.5.2`. Airflow provider packages are versioned separately from Airflow core, so check provider compatibility when upgrading Airflow or when rebuilding Airflow images with a different provider set.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-docker/4.5.2/`
- Docker operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-docker/4.5.2/operators/docker.html`
- Docker connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-docker/4.5.2/connections/docker.html`
- `DockerOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-docker/4.5.2/_api/airflow/providers/docker/operators/docker/index.html`
- `DockerHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-docker/4.5.2/_api/airflow/providers/docker/hooks/docker/index.html`
