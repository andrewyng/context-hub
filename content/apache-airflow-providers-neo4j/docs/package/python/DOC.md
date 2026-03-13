---
name: package
description: "Apache Airflow Neo4j provider for Airflow connections and Neo4j hook-based DAG tasks"
metadata:
  languages: "python"
  versions: "3.11.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,neo4j,cypher,graph,dag,python"
---

# apache-airflow-providers-neo4j

Use `apache-airflow-providers-neo4j` when your Airflow DAGs need an Airflow-managed Neo4j connection and Python-task access to the Neo4j driver through `Neo4jHook`.

This guide targets provider version `3.11.3`.

## Install

Install the provider in the same Python environment or container image as Airflow. In practice, that means the scheduler, webserver, and every worker that imports DAG code all need the package.

Airflow providers are normally installed with the Airflow constraints file that matches your Airflow and Python versions:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.11.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-neo4j==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already pinned in your environment, keep that pin explicit when you add the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-neo4j==3.11.3"
```

Useful checks after installation:

```bash
airflow providers list | grep neo4j
airflow info
```

## Configure The Airflow Connection

Keep the Neo4j endpoint and credentials in an Airflow connection instead of hard-coding them in DAG files.

Environment variables for a typical setup:

```bash
export NEO4J_HOST='neo4j.example.com'
export NEO4J_PORT='7687'
export NEO4J_DATABASE='neo4j'
export NEO4J_USERNAME='neo4j'
export NEO4J_PASSWORD='secret'
```

Create the Airflow connection:

```bash
airflow connections add 'neo4j_default' \
  --conn-type 'neo4j' \
  --conn-host "$NEO4J_HOST" \
  --conn-port "$NEO4J_PORT" \
  --conn-schema "$NEO4J_DATABASE" \
  --conn-login "$NEO4J_USERNAME" \
  --conn-password "$NEO4J_PASSWORD"
```

Or define the same connection with an environment variable:

```bash
export AIRFLOW_CONN_NEO4J_DEFAULT='neo4j://neo4j:secret@neo4j.example.com:7687/neo4j'
```

With that connection in place:

- the Airflow connection id is `neo4j_default`
- DAG code passes `neo4j_conn_id="neo4j_default"`
- the database name can stay in the connection schema or be chosen explicitly in the session you open inside the task

Use the connection to hold credentials, host, port, and deployment-specific connection settings. If your Neo4j deployment needs TLS, routing, or other driver-specific options, keep them in the Airflow connection rather than scattering them through DAG code.

## Common Workflow: Run Cypher In A Python Task

Use `Neo4jHook` when you need to run Cypher from Python code inside a task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.neo4j.hooks.neo4j import Neo4jHook


with DAG(
    dag_id="neo4j_hook_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["neo4j"],
):
    @task
    def write_and_read() -> str | None:
        hook = Neo4jHook(neo4j_conn_id="neo4j_default")
        driver = hook.get_conn()

        try:
            with driver.session(database="neo4j") as session:
                session.run(
                    """
                    MERGE (p:Person {id: $id})
                    SET p.name = $name
                    """,
                    id="user-123",
                    name="Ada Lovelace",
                )

                record = session.run(
                    """
                    MATCH (p:Person {id: $id})
                    RETURN p.name AS name
                    """,
                    id="user-123",
                ).single()

                return record["name"] if record else None
        finally:
            driver.close()

    write_and_read()
```

The basic pattern is:

1. create `Neo4jHook(neo4j_conn_id="...")`
2. call `get_conn()`
3. open a session on the returned Neo4j driver
4. execute Cypher with `session.run(...)`
5. close the driver before the task exits when you manage it directly

## Common Workflow: Return A Small Derived Result

Airflow tasks work best when they return small values through XCom instead of large raw query results. A common pattern is to query Neo4j, derive the value you actually need, and return only that.

```python
from airflow.decorators import task
from airflow.providers.neo4j.hooks.neo4j import Neo4jHook


@task
def count_people() -> int:
    hook = Neo4jHook(neo4j_conn_id="neo4j_default")
    driver = hook.get_conn()

    try:
        with driver.session(database="neo4j") as session:
            record = session.run(
                "MATCH (p:Person) RETURN count(p) AS total"
            ).single()
            return int(record["total"]) if record else 0
    finally:
        driver.close()
```

Use this pattern when downstream tasks only need a count, a status flag, or a short identifier.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep the host, credentials, and connection options in an Airflow connection
- create the Neo4j driver inside the task with `Neo4jHook`
- run Cypher with standard Neo4j driver calls on the returned connection
- return only small derived values through XCom unless a downstream task really needs the full result set

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or worker is missing `apache-airflow-providers-neo4j`.
- Keep `apache-airflow` pinned when adding or upgrading the provider so `pip` does not silently replace your Airflow core version.
- Keep secrets in Airflow connections or a secrets backend, not in DAG source.
- Use a Neo4j host and port reachable from workers, not just from the machine where you authored the DAG.
- Open the Neo4j driver inside the task body, not at DAG import time. Airflow repeatedly parses DAG files, and top-level network setup makes scheduling less reliable.
- Return small task outputs. Large Neo4j result payloads are a bad fit for XCom.

## Version Notes

- This guide covers `apache-airflow-providers-neo4j` version `3.11.3`.
- Provider packages follow Airflow's provider release cycle, not your Neo4j server version. Re-check the provider docs before upgrading Airflow core or the provider in production.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-neo4j/stable/`
- Neo4j connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-neo4j/stable/connections/neo4j.html`
- `Neo4jHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-neo4j/stable/_api/airflow/providers/neo4j/hooks/neo4j/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-neo4j/`
