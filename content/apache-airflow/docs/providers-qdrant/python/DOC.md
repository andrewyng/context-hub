---
name: providers-qdrant
description: "Apache Airflow Qdrant provider for configuring Qdrant connections, ingesting vectors, and using QdrantClient from DAG tasks"
metadata:
  languages: "python"
  versions: "1.5.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "apache-airflow,airflow,qdrant,vector-database,embeddings,python"
---

# Apache Airflow Qdrant Provider Guide

Use `apache-airflow-providers-qdrant` when an Airflow DAG needs to write vectors into Qdrant with `QdrantIngestOperator` or reuse an Airflow-managed Qdrant connection through `QdrantHook`.

## Golden Rule

- This package extends Airflow; it is not a standalone Qdrant SDK.
- Put the Qdrant endpoint and API key on an Airflow `qdrant` connection, then let `QdrantHook` and `QdrantIngestOperator` resolve credentials from that connection.
- Use `QdrantIngestOperator` for bulk vector uploads. Use `QdrantHook` when DAG code needs direct `QdrantClient` access for collection setup, querying, or other custom client calls.
- Keep API keys in Airflow connections, environment variables, or a secrets backend instead of embedding them in DAG code.

## What This Package Adds

The provider exposes two main entry points:

- `airflow.providers.qdrant.hooks.qdrant.QdrantHook`
- `airflow.providers.qdrant.operators.qdrant.QdrantIngestOperator`

`QdrantHook.get_conn()` returns a `qdrant_client.QdrantClient`, so you can call the normal Qdrant Python client methods from inside Airflow tasks.

## Install

Install the provider into the same Python environment as Airflow. Provider `1.5.3` requires:

- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-compat>=1.8.0`
- `qdrant_client>=1.15.1,!=1.17.0`
- Python `>=3.10`

If Airflow is already installed, pin your current Airflow version in the same command so the resolver does not silently replace core:

```bash
AIRFLOW_VERSION="3.1.8"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-qdrant==1.5.3"
```

If you are building a new environment from scratch, install Airflow first using the official constrained install flow for your Python version, then add this provider.

## Configure A Qdrant Connection

The hook uses `qdrant_default` by default.

Qdrant connection fields supported by the provider:

- `Host`: Qdrant host name
- `Password`: Qdrant API key
- `Port`: REST port, default `6333`
- `extra.url`: full Qdrant URL; if set, it overrides `host` and `port`
- `extra.grpc_port`: gRPC port, default `6334`
- `extra.prefer_gprc`: whether to prefer gRPC for custom methods
- `extra.https`: whether to use HTTPS
- `extra.prefix`: path prefix added to REST endpoints

The most reliable environment-variable form is JSON:

```bash
export AIRFLOW_CONN_QDRANT_DEFAULT='{
  "conn_type": "qdrant",
  "host": "xyz-example.us-east.aws.cloud.qdrant.io",
  "password": "your-qdrant-api-key",
  "port": 6333,
  "extra": {
    "https": true,
    "grpc_port": 6334,
    "prefer_gprc": false
  }
}'
```

If you want the connection stored in the Airflow metadata database instead of an environment variable:

```bash
airflow connections add 'qdrant_default' \
  --conn-json '{
    "conn_type": "qdrant",
    "host": "xyz-example.us-east.aws.cloud.qdrant.io",
    "password": "your-qdrant-api-key",
    "port": 6333,
    "extra": {
      "https": true,
      "grpc_port": 6334,
      "prefer_gprc": false
    }
  }'
```

Practical notes:

- Environment-variable connections work, but they do not show up in the Airflow UI.
- If your deployment uses a single fully qualified endpoint, set `extra.url` and skip separate `host` and `port`.
- The provider's extra key is spelled `prefer_gprc` in connection JSON and UI fields. The hook maps that field to the Qdrant client's `prefer_grpc` argument.

## Test The Connection

The provider implements Airflow connection testing. Airflow disables test-connection support by default, so enable it first if you want UI or CLI checks:

```bash
export AIRFLOW__CORE__TEST_CONNECTION="Enabled"
airflow connections test qdrant_default
```

Behind the scenes, the hook verifies the connection by calling `get_collections()` on the Qdrant client.

## Ingest Vectors With `QdrantIngestOperator`

`QdrantIngestOperator` is the provider's built-in task for bulk uploads. It passes your data to `QdrantClient.upload_collection(...)`.

```python
from airflow import DAG
from airflow.providers.qdrant.operators.qdrant import QdrantIngestOperator
from pendulum import datetime

with DAG(
    dag_id="qdrant_ingest_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["qdrant"],
) as dag:
    ingest_vectors = QdrantIngestOperator(
        task_id="ingest_vectors",
        conn_id="qdrant_default",
        collection_name="products",
        vectors=[
            [0.732, 0.611, 0.289, 0.421],
            [0.217, 0.526, 0.416, 0.981],
            [0.326, 0.483, 0.376, 0.136],
        ],
        ids=[101, 102, 103],
        payload=[
            {"sku": "sku-101", "category": "books"},
            {"sku": "sku-102", "category": "games"},
            {"sku": "sku-103", "category": "books"},
        ],
        batch_size=64,
        parallel=1,
        max_retries=3,
        wait=True,
    )
```

What the operator controls:

- `collection_name`: target collection
- `vectors`: iterable of vectors to upload
- `payload`: optional payload objects aligned with the vectors
- `ids`: optional point ids; if you omit them, Qdrant can generate ids client-side
- `batch_size`: upload chunk size, default `64`
- `parallel`: number of parallel upload processes, default `1`
- `method`: multiprocessing start method
- `max_retries`: retry count for failed upload requests, default `3`
- `wait`: wait for server-side application, default `True` in the operator

## Use `QdrantHook` For Collection Setup And Queries

Use the hook when you need the underlying Qdrant Python client in task code.

Example: create a collection if it does not exist, then query it.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.qdrant.hooks.qdrant import QdrantHook
from pendulum import datetime
from qdrant_client import models

with DAG(
    dag_id="qdrant_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["qdrant"],
) as dag:
    @task
    def ensure_collection() -> None:
        client = QdrantHook(conn_id="qdrant_default").get_conn()

        if not client.collection_exists("products"):
            client.create_collection(
                collection_name="products",
                vectors_config=models.VectorParams(
                    size=4,
                    distance=models.Distance.COSINE,
                ),
            )

    @task
    def query_collection() -> list[dict]:
        client = QdrantHook(conn_id="qdrant_default").get_conn()

        hits = client.query_points(
            collection_name="products",
            query=[0.73, 0.61, 0.29, 0.42],
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="category",
                        match=models.MatchValue(value="books"),
                    )
                ]
            ),
            limit=3,
            with_payload=True,
        ).points

        return [
            {"id": point.id, "score": point.score, "payload": point.payload}
            for point in hits
        ]

    ensure_collection() >> query_collection()
```

This pattern is useful when the DAG needs to:

- create or inspect collections
- run a filtered similarity query
- call other `QdrantClient` methods that do not have a dedicated Airflow operator

## Common Pattern

For most Airflow + Qdrant DAGs, a clean split is:

- use `QdrantHook` once for collection creation or one-off client operations
- use `QdrantIngestOperator` for bulk uploads of vectors and payload
- keep the same `conn_id` across related tasks, usually `qdrant_default`

## Pitfalls

- Install the provider everywhere Airflow imports or executes DAG code. Missing package errors usually mean one scheduler, worker, or image does not have `apache-airflow-providers-qdrant` installed.
- `QdrantIngestOperator` uploads to an existing collection name. Create the collection first if your workflow needs explicit vector size and distance configuration.
- The provider's connection extra key is `prefer_gprc`, not `prefer_grpc`. Use the provider's spelling in Airflow connection JSON.
- Provider `1.5.3` explicitly excludes `qdrant_client==1.17.0`. Do not pin that client version alongside this provider release.
- Airflow connection testing is disabled by default. If `airflow connections test qdrant_default` is unavailable, set `AIRFLOW__CORE__TEST_CONNECTION="Enabled"` first.
- Environment-variable connections are convenient for local development and containers, but they do not appear in the Airflow UI.

## Version Notes

- This guide targets `apache-airflow-providers-qdrant` `1.5.3`, released on March 2, 2026.
- Starting with provider `1.5.0`, the minimum supported Airflow version is `2.11.0`.
- Test-connection support was added in provider `1.1.0`.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/index.html`
- Qdrant connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/connections.html`
- `QdrantHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/_api/airflow/providers/qdrant/hooks/qdrant/index.html`
- `QdrantHook` source docs: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/_modules/airflow/providers/qdrant/hooks/qdrant.html`
- `QdrantIngestOperator` guide: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/operators/qdrant.html`
- `QdrantIngestOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/_api/airflow/providers/qdrant/operators/qdrant/index.html`
- `QdrantIngestOperator` source docs: `https://airflow.apache.org/docs/apache-airflow-providers-qdrant/stable/_modules/airflow/providers/qdrant/operators/qdrant.html`
- Airflow managing connections: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-qdrant/`
- Qdrant Python client docs: `https://python-client.qdrant.tech/`
