---
name: providers-weaviate
description: "Apache Airflow Weaviate provider for Airflow-managed Weaviate connections, collection setup, and batch ingestion from DAGs"
metadata:
  languages: "python"
  versions: "3.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,weaviate,vector-database,embeddings,dag,python"
---

# apache-airflow-providers-weaviate

Use `apache-airflow-providers-weaviate` when your DAGs need an Airflow-managed Weaviate connection plus provider helpers for creating collections and ingesting objects into Weaviate.

This guide targets provider version `3.3.1`.

## Install

Install the provider into the same Python environment or container image as Airflow. Upstream documents `apache-airflow>=2.11.0` as the minimum supported Airflow version for `apache-airflow-providers-weaviate==3.3.1`.

For a fresh Airflow environment, install Airflow and the provider together with the matching constraints file:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="3.1.8"
PROVIDER_VERSION="3.3.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-weaviate==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed, keep the Airflow version pinned when you add the provider so dependency resolution does not silently replace core Airflow:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-weaviate==3.3.1"
```

Useful checks:

```bash
airflow providers list | grep -i weaviate
python -m pip show apache-airflow-providers-weaviate weaviate-client
```

Important dependency notes from upstream:

- `weaviate-client` must be `>=4.4.0` and must not be `4.16.7`
- `httpx>=0.25.0` is required
- `pandas` is part of the provider dependency set and is used by the hook helpers that accept DataFrames

## Configure The Airflow Connection

The provider uses the Airflow connection type `weaviate`, and `WeaviateHook` defaults to `weaviate_default`.

The connection guide is strict about one detail: `Host` must be only the hostname. Do not include `http://` or `https://`.

Environment variables for a typical HTTPS setup:

```bash
export WEAVIATE_HOST="cluster.example.weaviate.network"
export WEAVIATE_HTTP_PORT="443"
export WEAVIATE_GRPC_HOST="$WEAVIATE_HOST"
export WEAVIATE_GRPC_PORT="443"
export WEAVIATE_API_KEY="replace-me"
```

Create the Airflow connection:

```bash
airflow connections add 'weaviate_default' \
  --conn-type 'weaviate' \
  --conn-host "$WEAVIATE_HOST" \
  --conn-port "$WEAVIATE_HTTP_PORT" \
  --conn-extra "{\"api_key\":\"${WEAVIATE_API_KEY}\",\"http_secure\":true,\"grpc_host\":\"${WEAVIATE_GRPC_HOST}\",\"grpc_port\":${WEAVIATE_GRPC_PORT},\"grpc_secure\":true}"
```

The hook reads these connection fields:

- `host` and `port` for REST and GraphQL traffic
- `http_secure` in `extra` to switch the HTTP side to HTTPS
- `grpc_host`, `grpc_port`, and `grpc_secure` in `extra` for the Weaviate gRPC API
- authentication from one of:
  - `api_key` or `token` in `extra`
  - `access_token` in `extra`
  - `client_secret` in `extra`
  - `login` and `password` on the Airflow connection for password auth

If the collection uses a server-side vectorizer that needs third-party embedding credentials, put those headers in `extra.additional_headers`:

```json
{
  "api_key": "replace-me",
  "http_secure": true,
  "grpc_host": "cluster.example.weaviate.network",
  "grpc_port": 443,
  "grpc_secure": true,
  "additional_headers": {
    "<embedding-provider-header>": "<embedding-provider-secret>"
  }
}
```

## Create A Collection And Ingest Objects

`WeaviateHook.create_collection(...)` is the main setup call, and `WeaviateIngestOperator` is the main batch-ingest entry point.

This DAG creates a collection that uses a Weaviate-managed OpenAI vectorizer, then inserts rows without precomputed vectors:

```python
from __future__ import annotations

import pendulum
from weaviate.classes.config import DataType, Property
from weaviate.collections.classes.config import Configure

try:
    from airflow.sdk import dag, task
except ImportError:
    from airflow.decorators import dag, task  # type: ignore[attr-defined,no-redef]

from airflow.providers.weaviate.hooks.weaviate import WeaviateHook
from airflow.providers.weaviate.operators.weaviate import WeaviateIngestOperator


QUESTIONS = [
    {
        "id": "q-1",
        "question": "This organ removes excess glucose from the blood and stores it as glycogen",
        "answer": "Liver",
        "category": "SCIENCE",
        "docLink": "https://example.com/docs/biology-1",
    },
    {
        "id": "q-2",
        "question": "It is the only living mammal in the order Proboscidea",
        "answer": "Elephant",
        "category": "ANIMALS",
        "docLink": "https://example.com/docs/animals-1",
    },
]


@dag(
    dag_id="weaviate_ingest_example",
    schedule=None,
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    tags=["weaviate"],
)
def weaviate_ingest_example():
    @task()
    def create_collection() -> None:
        hook = WeaviateHook(conn_id="weaviate_default")
        hook.create_collection(
            "QuestionWithOpenAIVectorizer",
            description="Question and answer corpus",
            properties=[
                Property(name="question", data_type=DataType.TEXT),
                Property(name="answer", data_type=DataType.TEXT),
                Property(name="category", data_type=DataType.TEXT),
                Property(name="docLink", data_type=DataType.TEXT),
            ],
            vectorizer_config=Configure.Vectorizer.text2vec_openai(),
        )

    ingest_questions = WeaviateIngestOperator(
        task_id="ingest_questions",
        conn_id="weaviate_default",
        collection_name="QuestionWithOpenAIVectorizer",
        input_data=QUESTIONS,
    )

    create_collection() >> ingest_questions


weaviate_ingest_example()
```

Notes:

- `input_data` is required. It can be a list of dictionaries or a pandas DataFrame.
- `uuid_column` defaults to `"id"`.
- `vector_col` defaults to `"Vector"`. If your rows include a `Vector` field, the operator passes those vectors through instead of asking Weaviate to vectorize the text.
- If you want custom vectors instead of a collection vectorizer, create the collection without `vectorizer_config` and include `Vector` in each input row.

## Keep Document-Derived Objects In Sync

`WeaviateDocumentIngestOperator` is the provider helper for collections where multiple rows belong to a source document and you need predictable replacement behavior when that source changes.

```python
from airflow.providers.weaviate.operators.weaviate import WeaviateDocumentIngestOperator


DOCUMENT_ROWS = [
    {
        "id": "q-1",
        "question": "This organ removes excess glucose from the blood and stores it as glycogen",
        "answer": "Liver",
        "category": "SCIENCE",
        "docLink": "https://example.com/docs/biology-1",
    },
    {
        "id": "q-2",
        "question": "It is the only living mammal in the order Proboscidea",
        "answer": "Elephant",
        "category": "ANIMALS",
        "docLink": "https://example.com/docs/animals-1",
    },
]


sync_documents = WeaviateDocumentIngestOperator(
    task_id="sync_documents",
    conn_id="weaviate_default",
    collection_name="QuestionWithOpenAIVectorizer",
    input_data=DOCUMENT_ROWS,
    document_column="docLink",
    existing="replace",
)
```

The `existing` strategies are source-backed and important:

- `skip`: keep existing objects and add only missing rows
- `replace`: delete objects for changed documents and recreate them
- `error`: fail if the ingest would create an object for a document that already exists

Use `replace` only when your document key is stable and you are comfortable with the operator deleting and recreating objects for changed documents.

## Use Hook Methods In Python Tasks

The hook also exposes direct collection helpers that are useful in TaskFlow tasks:

```python
from __future__ import annotations

import pendulum

try:
    from airflow.sdk import dag, task
except ImportError:
    from airflow.decorators import dag, task  # type: ignore[attr-defined,no-redef]

from airflow.providers.weaviate.hooks.weaviate import WeaviateHook


@dag(
    dag_id="weaviate_hook_example",
    schedule=None,
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
)
def weaviate_hook_example():
    @task()
    def list_object_uuids() -> list[str]:
        hook = WeaviateHook(conn_id="weaviate_default")
        objects = hook.get_all_objects(
            collection_name="QuestionWithOpenAIVectorizer",
        )
        return [str(obj.uuid) for obj in objects]

    @task(trigger_rule="all_done")
    def drop_collection() -> None:
        hook = WeaviateHook(conn_id="weaviate_default")
        hook.delete_collections("QuestionWithOpenAIVectorizer")

    list_object_uuids() >> drop_collection()


weaviate_hook_example()
```

Other public hook methods exposed by the provider include:

- `get_collection(name)`
- `query_with_text(search_text, collection_name, properties, limit=...)`
- `query_with_vector(embeddings, collection_name, properties, certainty=..., limit=...)`
- `delete_by_property(collection_names=..., filter_criteria=...)`

## Pitfalls

- Keep the host field schema-free. `example.weaviate.network` is correct; `https://example.weaviate.network` is not.
- Set the HTTP and gRPC security fields explicitly. The provider changelog notes that the historical defaults may not be suitable for real Weaviate deployments.
- Install the provider everywhere Airflow imports DAG code. Scheduler-only installs still fail once a worker imports the provider classes.
- Use `collection_name`, not `class_name`. The provider switched to the Weaviate v4 client API in `2.0.0`.
- Use `input_data`, not the removed `input_json` argument.
- If your rows do not include `Vector`, the target collection must already have a compatible vectorizer configured, and any required embedding-provider headers must be present in `additional_headers`.
- The operator constructors still expose `tenant`, but the `3.3.1` execute path does not pass `tenant` through to `WeaviateHook.batch_data(...)` or `create_or_replace_document_objects(...)`. Do not rely on operator-level tenant routing without checking newer upstream docs first.
- Create hooks inside tasks, not at module import time. Airflow repeatedly parses DAG files, and top-level network setup slows down scheduling and can fail unexpectedly.

## Version Notes

- This guide covers `apache-airflow-providers-weaviate==3.3.1`.
- Upstream documents Airflow `2.11.0` as the minimum supported core version for the `3.3.x` provider line.
- The `2.0.0` provider line migrated to `weaviate-client` v4, renamed several hook methods, changed `class_name` to `collection_name`, and removed `batch_params`.
- The `3.0.0` provider line removed the deprecated `input_json` parameter from `WeaviateIngestOperator`.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/index.html`
- Connection guide: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/connections.html`
- Operator guide: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/operators/weaviate.html`
- Hook API reference: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/_api/airflow/providers/weaviate/hooks/weaviate/index.html`
- Hook source: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/_modules/airflow/providers/weaviate/hooks/weaviate.html`
- Operator source and system test examples: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/_modules/airflow/providers/weaviate/operators/weaviate.html`
- Example DAG source: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/_modules/tests/system/weaviate/example_weaviate_operator.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-weaviate/stable/changelog.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-weaviate/`
