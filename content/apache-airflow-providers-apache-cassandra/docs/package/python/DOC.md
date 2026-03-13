---
name: package
description: "Apache Airflow provider for connecting DAGs to Apache Cassandra with Airflow connections and CassandraHook"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,cassandra,cql,dag,python"
---

# apache-airflow-providers-apache-cassandra

Use `apache-airflow-providers-apache-cassandra` when an Airflow DAG needs a managed Cassandra connection and Python tasks that execute CQL through `CassandraHook`.

This guide targets provider version `3.9.2`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Cassandra client for regular Python apps.
- Keep cluster hosts, credentials, and driver-specific options in an Airflow connection such as `cassandra_default` instead of hard-coding them in DAG files.
- Use `CassandraHook` inside tasks and send values as query parameters rather than building CQL strings with Python interpolation.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment.

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
  "apache-airflow-providers-apache-cassandra==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep `apache-airflow` pinned when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-apache-cassandra==3.9.2"
```

Useful checks after installation:

```bash
airflow providers list | grep cassandra
airflow info
```

## Configure The Airflow Connection

This provider reads Cassandra connection details from an Airflow connection. A practical setup is to keep the raw values in environment variables, then create the Airflow connection from them.

```bash
export CASSANDRA_HOST='cassandra.example.com'
export CASSANDRA_PORT='9042'
export CASSANDRA_KEYSPACE='analytics'
export CASSANDRA_USERNAME='airflow'
export CASSANDRA_PASSWORD='secret'
```

Create the connection:

```bash
airflow connections add 'cassandra_default' \
  --conn-type 'cassandra' \
  --conn-host "$CASSANDRA_HOST" \
  --conn-port "$CASSANDRA_PORT" \
  --conn-schema "$CASSANDRA_KEYSPACE" \
  --conn-login "$CASSANDRA_USERNAME" \
  --conn-password "$CASSANDRA_PASSWORD"
```

Confirm the connection exists before wiring it into a DAG:

```bash
airflow connections get cassandra_default
```

Keep any cluster-specific settings that go beyond host, port, keyspace, and credentials in the Airflow connection itself. That includes settings such as TLS or other driver-related options that should not live in DAG source files.

## Common Workflow: Check Connectivity And Read Cluster Metadata

Use `CassandraHook` inside a task when you want to run CQL directly from Python code. A simple first query is `system.local`, which exists on Cassandra clusters and is useful for connectivity checks.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.cassandra.hooks.cassandra import CassandraHook
from pendulum import datetime


with DAG(
    dag_id="cassandra_cluster_info",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["cassandra"],
):
    @task
    def read_cluster_info() -> dict[str, str]:
        hook = CassandraHook(cassandra_conn_id="cassandra_default")
        session = hook.get_conn()

        row = session.execute(
            "SELECT cluster_name, release_version FROM system.local"
        ).one()

        if row is None:
            raise RuntimeError("system.local returned no rows")

        return {
            "cluster_name": row.cluster_name,
            "release_version": row.release_version,
        }

    read_cluster_info()
```

The important pattern is:

1. create `CassandraHook(cassandra_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned session to execute CQL

## Common Workflow: Execute Parameterized CQL In A Task

For application tables, use parameterized CQL and keep the query itself inside the task that owns the business logic.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.cassandra.hooks.cassandra import CassandraHook
from pendulum import datetime


with DAG(
    dag_id="cassandra_insert_and_read",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["cassandra"],
):
    @task
    def insert_event() -> None:
        hook = CassandraHook(cassandra_conn_id="cassandra_default")
        session = hook.get_conn()

        session.execute(
            """
            INSERT INTO analytics.events (event_id, event_type, source)
            VALUES (%s, %s, %s)
            """,
            ("evt-001", "signup", "airflow"),
        )

    @task
    def read_recent_events() -> list[str]:
        hook = CassandraHook(cassandra_conn_id="cassandra_default")
        session = hook.get_conn()

        rows = session.execute(
            "SELECT event_id, event_type, source FROM analytics.events LIMIT 10"
        )

        return [f"{row.event_id}:{row.event_type}:{row.source}" for row in rows]

    insert_event() >> read_recent_events()
```

Adapt the table name, partition-key filters, and values to your schema. If the connection schema already points at your keyspace, you can use unqualified table names in your own DAGs.

## Common Setup Pattern

For most Airflow DAGs that touch Cassandra, a clean split is:

- put host, port, keyspace, credentials, and connection extras in `cassandra_default` or another shared Airflow connection id
- use `CassandraHook` inside `@task` functions when the task needs to execute CQL directly
- keep table names and task-specific queries in DAG code, but keep secrets and endpoint details in the connection layer
- use small, purpose-built queries so task retries do not turn into expensive full-table reads

## Pitfalls

- Install the provider everywhere DAG code runs. Scheduler, worker, and local test environments all need the package if they import `airflow.providers.apache.cassandra`.
- Keep `apache-airflow` pinned when you add or upgrade the provider so `pip` does not silently replace your Airflow core version.
- Use worker-reachable hosts. A Cassandra hostname that works from a laptop or bastion may still fail from Airflow containers or remote workers.
- Keep credentials and TLS-related settings in Airflow connections or a secrets backend instead of embedding them directly in DAG code.
- Use query parameters instead of string formatting when values come from upstream tasks or runtime input.

## Version Notes

- This guide covers `apache-airflow-providers-apache-cassandra` version `3.9.2`.
- Re-check the provider's version-specific documentation when you upgrade Airflow core or move to a newer provider release.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-cassandra/3.9.2/`
- Cassandra connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-cassandra/3.9.2/connections/cassandra.html`
- `CassandraHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-cassandra/3.9.2/_api/airflow/providers/apache/cassandra/hooks/cassandra/index.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-apache-cassandra/`
