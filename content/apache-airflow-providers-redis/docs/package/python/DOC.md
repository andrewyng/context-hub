---
name: package
description: "Apache Airflow Redis provider for Redis connections, hook-based tasks, and publish operations from DAGs"
metadata:
  languages: "python"
  versions: "4.4.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,redis,apache-airflow,python,dag,hooks,pubsub"
---

# Apache Airflow Redis Provider Guide

Use `apache-airflow-providers-redis` when an Airflow DAG needs to connect to Redis through an Airflow connection, run Redis commands from Python task code, or publish messages to a Redis channel.

## Golden Rule

- Install this provider alongside `apache-airflow`; it is not a standalone Redis client or worker runtime.
- Put Redis host, port, password, and database selection on an Airflow connection, then keep DAG code focused on keys, channels, and task logic.
- Use `RedisHook` when task code needs direct Redis commands, and use `RedisPublishOperator` when the task is simply “publish this message to this channel”.
- Keep credentials in Airflow connections or a secrets backend instead of hard-coding them in DAG files.

## What This Package Adds

This provider supplies Airflow's Redis integration, including:

- `RedisHook`
- `RedisPublishOperator`

These are the main entry points most DAGs use from this package.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment. Follow Airflow's normal provider-install pattern and keep Airflow pinned in the same command so `pip` does not silently move core to an incompatible version.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.4.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-redis==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful check after installation:

```bash
airflow providers list | grep -i redis
```

In practice, every Airflow image or environment that imports DAGs or runs tasks must have the provider installed.

## Configure A Redis Connection

Create an Airflow connection with connection type `redis`, or define one with an environment variable.

```bash
export AIRFLOW_CONN_REDIS_DEFAULT='redis://:secret@redis.example.com:6379/0'
```

With that environment variable in place:

- the Airflow connection id is `redis_default`
- `RedisHook` uses `redis_conn_id="redis_default"`
- `RedisPublishOperator` uses `redis_conn_id="redis_default"`

Practical notes:

- the `/0` path segment selects Redis database `0`
- URL-encode special characters in passwords before putting them in `AIRFLOW_CONN_REDIS_DEFAULT`
- if you prefer not to use the URI form, create the connection in the Airflow UI or CLI with the equivalent host, port, password, and database settings

Keep Redis credentials in Airflow connections or a secrets backend instead of embedding them in task code.

## Use `RedisHook` In A Task

Use `RedisHook` when task code needs direct access to the Redis client.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.redis.hooks.redis import RedisHook
from pendulum import datetime

with DAG(
    dag_id="redis_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def write_and_read() -> str | None:
        hook = RedisHook(redis_conn_id="redis_default")
        client = hook.get_conn()

        if not client.ping():
            raise RuntimeError("Redis is not reachable")

        client.set("airflow:demo:status", "ready", ex=300)
        value = client.get("airflow:demo:status")

        return value.decode("utf-8") if value else None

    write_and_read()
```

The important pattern is:

1. create `RedisHook(redis_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned Redis client for normal Redis commands such as `ping()`, `set()`, `get()`, `delete()`, and `publish()`

## Publish A Message With `RedisPublishOperator`

Use `RedisPublishOperator` when the task is just a channel publish and you do not need custom Python code around it.

```python
from airflow import DAG
from airflow.providers.redis.operators.redis_publish import RedisPublishOperator
from pendulum import datetime

with DAG(
    dag_id="redis_publish_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    publish_event = RedisPublishOperator(
        task_id="publish_event",
        redis_conn_id="redis_default",
        channel="events",
        message='{"type": "order.created", "id": "ord_123"}',
    )
```

This is the simplest pattern for pub/sub notifications emitted from a DAG.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep Redis endpoint and credentials in an Airflow connection
- create the Redis client inside a task with `RedisHook` when you need normal Redis commands
- use `RedisPublishOperator` for one-step publish tasks
- return only small derived values from tasks instead of large payloads or large key dumps

## Pitfalls

- Installing the provider only on the webserver or scheduler: workers also need it anywhere task code imports `airflow.providers.redis`.
- Using the wrong connection parameter name: `RedisHook` and `RedisPublishOperator` use `redis_conn_id`.
- Embedding passwords or hostnames directly in DAG code instead of using Airflow connections.
- Forgetting to URL-encode reserved characters when you define `AIRFLOW_CONN_REDIS_DEFAULT` manually.
- Assuming a connection that works from one Airflow container will also work from workers; make sure every runtime can actually reach the Redis endpoint.

## Version Notes

- This guide covers `apache-airflow-providers-redis` version `4.4.2`.
- If you upgrade the provider, recheck the provider docs and API reference before rolling the change across Airflow images.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/`
- Redis connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/connections/redis.html`
- `RedisHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/_api/airflow/providers/redis/hooks/redis/index.html`
- `RedisPublishOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-redis/stable/_api/airflow/providers/redis/operators/redis_publish/index.html`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-redis/`
