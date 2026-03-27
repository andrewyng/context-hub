---
name: providers-pinecone
description: "Apache Airflow Pinecone provider for creating indexes, ingesting vectors, and querying Pinecone from Airflow DAGs"
metadata:
  languages: "python"
  versions: "2.4.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,pinecone,vector-database,embeddings,dag,python"
---

# apache-airflow-providers-pinecone

Use `apache-airflow-providers-pinecone` when an Airflow DAG needs an Airflow-managed Pinecone connection plus provider operators and hooks for index creation, vector ingest, and query-time lookups.

This guide targets provider version `2.4.2`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment.

If Airflow is already installed, pin the existing Airflow version in the same command so the resolver does not silently replace core:

```bash
AIRFLOW_VERSION="3.1.8"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-pinecone==2.4.2"
```

The PyPI metadata for `2.4.2` lists these key requirements:

- `apache-airflow>=2.11.0`
- `pinecone>=7.0.0`
- Python `>=3.10`

Install the provider anywhere DAG code can import it: scheduler, webserver, workers, and any separate task runtime image.

## Configure The Airflow Connection

The provider uses the Airflow connection type `pinecone`. The default connection id is `pinecone_default`.

Connection fields exposed by the provider:

- `Host`: optional Pinecone host for a specific index
- `Login`: Pinecone environment, used for pod-based indexes
- `Password`: Pinecone API key
- `Extra.region`: serverless region
- `Extra.project_id`: optional project id
- `Extra.debug_curl`: optional Pinecone client debug flag

You can create the connection in the Airflow UI, or define it with an environment variable. A practical serverless setup is:

```bash
export AIRFLOW_CONN_PINECONE_DEFAULT='{"conn_type":"pinecone","password":"pcsk_your_api_key","extra":{"region":"us-west-2"}}'
```

For pod-based indexes, also set the Pinecone environment in the connection:

```bash
export AIRFLOW_CONN_PINECONE_DEFAULT='{"conn_type":"pinecone","login":"us-east1-gcp","password":"pcsk_your_api_key"}'
```

If Pinecone gave you a per-index host and you want the hook to reuse it, include `host`:

```bash
export AIRFLOW_CONN_PINECONE_DEFAULT='{"conn_type":"pinecone","host":"https://docs-demo-xxxx.svc.us-west2-aws.pinecone.io","password":"pcsk_your_api_key","extra":{"region":"us-west-2"}}'
```

Keep API keys in Airflow Connections, environment variables, or a secrets backend instead of hard-coding them in DAG files.

## Create A Serverless Index

Use `CreateServerlessIndexOperator` when the DAG should create a Pinecone serverless index as a task.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.pinecone.operators.pinecone import CreateServerlessIndexOperator

with DAG(
    dag_id="pinecone_create_serverless_index",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_index = CreateServerlessIndexOperator(
        task_id="create_index",
        conn_id="pinecone_default",
        index_name="docs-demo",
        dimension=3,
        metric="cosine",
        cloud="aws",
        region="us-west-2",
    )
```

`region` can come from the operator argument or the Airflow connection extra field.

## Create A Pod-Based Index

Use `CreatePodIndexOperator` when you need Pinecone's pod-based index flow instead of serverless.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.pinecone.operators.pinecone import CreatePodIndexOperator

with DAG(
    dag_id="pinecone_create_pod_index",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_index = CreatePodIndexOperator(
        task_id="create_index",
        conn_id="pinecone_default",
        index_name="docs-pod-demo",
        dimension=3,
        metric="cosine",
        environment="us-east1-gcp",
        pods=1,
        replicas=1,
        shards=1,
        pod_type="p1.x1",
    )
```

For pod-based indexes, `environment` can come from the operator argument or the connection `Login` field.

## Ingest Vectors From A DAG

Use `PineconeIngestOperator` to upsert vectors into an index from a normal Airflow task.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.pinecone.operators.pinecone import (
    CreateServerlessIndexOperator,
    PineconeIngestOperator,
)

with DAG(
    dag_id="pinecone_ingest_vectors",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    create_index = CreateServerlessIndexOperator(
        task_id="create_index",
        conn_id="pinecone_default",
        index_name="docs-demo",
        dimension=3,
        metric="cosine",
        cloud="aws",
        region="us-west-2",
    )

    ingest_vectors = PineconeIngestOperator(
        task_id="ingest_vectors",
        conn_id="pinecone_default",
        index_name="docs-demo",
        namespace="docs",
        input_vectors=[
            ("doc-1", [0.1, 0.2, 0.3], {"source": "faq"}),
            ("doc-2", [0.3, 0.2, 0.1], {"source": "guide"}),
        ],
        batch_size=100,
    )

    create_index >> ingest_vectors
```

`input_vectors` matches the provider API: each item is an id, a numeric vector, and optional metadata.

## Query And Inspect An Index With `PineconeHook`

Use `PineconeHook` inside a Python task when you need methods that do not have their own operator, such as list, query, stats, collections, or delete operations.

```python
from datetime import datetime

from airflow import DAG
from airflow.decorators import task
from airflow.providers.pinecone.hooks.pinecone import PineconeHook

with DAG(
    dag_id="pinecone_query_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def query_index() -> None:
        hook = PineconeHook(conn_id="pinecone_default")

        print(hook.list_indexes())

        stats = hook.describe_index_stats(index_name="docs-demo")
        print(stats)

        result = hook.query_vector(
            index_name="docs-demo",
            vector=[0.1, 0.2, 0.3],
            namespace="docs",
            top_k=2,
            include_metadata=True,
        )
        print(result)

    query_index()
```

Other hook methods documented in the provider source include:

- `describe_index(...)`
- `delete_index(...)`
- `create_collection(...)`
- `describe_collection(...)`
- `delete_collection(...)`

Use the hook when the DAG needs Python control flow around Pinecone calls. Use the provider operators when the Pinecone action should be a first-class Airflow task in the graph.

## Common Patterns

- Keep the Airflow connection id stable across DAGs, for example `pinecone_default` or `pinecone_prod`.
- Put API keys and region or environment settings in the Airflow connection so DAG code only passes `conn_id`.
- Use `CreateServerlessIndexOperator` or `CreatePodIndexOperator` for index provisioning, `PineconeIngestOperator` for upserts, and `PineconeHook` for query-time logic.

## Pitfalls

- This package extends Airflow; it does not replace `apache-airflow` or the underlying Pinecone Python client.
- Install the provider everywhere DAG code runs. A successful import on the scheduler does not mean workers have the package.
- Serverless index creation needs a region. Set it in `CreateServerlessIndexOperator(..., region=...)` or in the connection extra.
- Pod-based index creation needs a Pinecone environment. Set it in `CreatePodIndexOperator(..., environment=...)` or in the connection `Login` field.
- Keep credentials in Airflow Connections or a secrets backend. Do not embed API keys in DAG source files.

## Version Notes

- This guide covers `apache-airflow-providers-pinecone` version `2.4.2`.
- The provider docs page for `2.4.2` is the current stable maintainer reference as of `2026-03-13`.
- If you upgrade the provider, re-check the package dependencies and the operator and hook API reference before rolling the change across Airflow images.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-pinecone/stable/`
- Pinecone connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-pinecone/stable/connections/pinecone.html`
- Pinecone operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-pinecone/stable/operators/index.html`
- `PineconeHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-pinecone/stable/_api/airflow/providers/pinecone/hooks/pinecone/index.html`
- `PineconeHook` source reference: `https://airflow.apache.org/docs/apache-airflow-providers-pinecone/stable/_modules/airflow/providers/pinecone/hooks/pinecone.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-pinecone/2.4.2/`
