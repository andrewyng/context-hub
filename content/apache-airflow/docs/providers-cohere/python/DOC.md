---
name: providers-cohere
description: "Apache Airflow Cohere provider for generating embeddings with Airflow operators and hooks"
metadata:
  languages: "python"
  versions: "1.6.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "apache-airflow,airflow,cohere,embeddings,llm,dag"
---

# Apache Airflow Cohere Provider Python Guide

## Golden Rule

`apache-airflow-providers-cohere` is an Airflow provider package, not a standalone Cohere SDK. Install it into an existing Airflow environment, configure a `Cohere` connection with your API key in the connection password field, and use it for embedding tasks inside DAGs.

This provider is small by design:

- `airflow.providers.cohere.operators.embedding.CohereEmbeddingOperator`
- `airflow.providers.cohere.hooks.cohere.CohereHook`

If you need other Cohere endpoints or more control over embedding parameters than this provider exposes, call the Cohere Python SDK directly inside a Python task or write a custom operator.

## Install

The provider requires:

- Python 3.10 to 3.13
- `apache-airflow>=2.11.0`
- `cohere>=5.13.4`

Install the provider into the same virtual environment as Airflow. Pin your Airflow version in the same command so the resolver does not silently replace core:

```bash
AIRFLOW_VERSION="3.1.8"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-cohere==1.6.2"
```

If your environment runs Python 3.13, version `1.6.2` also includes the provider's `fastavro>=1.10.0` compatibility fix.

Useful check after installation:

```bash
airflow providers list | grep -i cohere
```

## Configure A Cohere Connection

The provider's default connection ID is `cohere_default`.

In the Airflow UI, create a connection with:

- Connection Type: `Cohere`
- Connection ID: `cohere_default`
- Password: your Cohere API key
- Host: optional base URL override

Only `password` and `host` are used by the hook. The hook maps them to:

- `password` -> `api_key`
- `host` -> `base_url`

If you prefer environment variables, Airflow supports JSON-formatted connections:

```bash
export AIRFLOW_CONN_COHERE_DEFAULT='{
  "conn_type": "cohere",
  "password": "your-cohere-api-key"
}'
```

If you need to point at a non-default Cohere API base URL, add `host`:

```bash
export AIRFLOW_CONN_COHERE_STAGING='{
  "conn_type": "cohere",
  "password": "your-cohere-api-key",
  "host": "https://api.cohere.com"
}'
```

Practical notes:

- Environment-defined connections are available at runtime but do not appear in the Airflow UI or `airflow connections list`.
- Keep API keys in environment variables or a secrets backend, not in DAG files.
- If you use a connection ID other than `cohere_default`, pass it explicitly as `conn_id=...`.

## Create Embeddings With `CohereEmbeddingOperator`

Use `CohereEmbeddingOperator` when a DAG step needs embeddings and returning `list[list[float]]` through XCom is acceptable.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG, task
from airflow.providers.cohere.operators.embedding import CohereEmbeddingOperator

with DAG(
    dag_id="cohere_embeddings_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["cohere", "embeddings"],
) as dag:
    embed_documents = CohereEmbeddingOperator(
        task_id="embed_documents",
        conn_id="cohere_default",
        input_text=[
            "Airflow provider packages extend Airflow with external integrations.",
            "Cohere embeddings can be stored in a vector database for retrieval.",
        ],
        request_options={
            "timeout_in_seconds": 30,
            "max_retries": 2,
        },
    )

    @task
    def inspect_vectors(vectors: list[list[float]]) -> None:
        print(f"embedded {len(vectors)} texts")
        print(f"first vector length: {len(vectors[0])}")

    inspect_vectors(embed_documents.output)
```

Behavior that matters:

- `input_text` can be a single string or a list of strings.
- The operator normalizes a single string to a one-item list.
- The return value is a `list[list[float]]`, which makes it easier to pass through XCom than a complex Cohere response object.
- `input_text` is a templated field, so you can render it from params, macros, or mapped task inputs.

## Use `CohereHook` Inside Python Tasks

Use the hook when a Python task needs a cached Cohere client or when you want to keep embedding logic inside normal task code.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG, task
from airflow.providers.cohere.hooks.cohere import CohereHook

with DAG(
    dag_id="cohere_hook_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["cohere", "hook"],
) as dag:
    @task
    def embed_query() -> list[list[float]]:
        hook = CohereHook(
            conn_id="cohere_default",
            request_options={"timeout_in_seconds": 15, "max_retries": 2},
        )
        return hook.create_embeddings(
            ["What changed in apache-airflow-providers-cohere 1.6.2?"]
        )

    embed_query()
```

The hook creates a `cohere.ClientV2` with the connection password as the API key and the connection host as the optional base URL override.

## What The Provider Actually Sends

The implementation is opinionated. `CohereHook.create_embeddings(...)` sends:

- `model="embed-multilingual-v3.0"` by default
- `input_type="search_document"`
- `embedding_types=["float"]`

This has two important consequences:

- `CohereEmbeddingOperator` does not expose a `model` argument and always calls the hook with its defaults.
- The provider is suited to document-style embeddings, not arbitrary access to every Cohere embeddings option.

If you need a different model, a different `input_type`, or other Cohere API surfaces such as chat or generation, this provider is not enough on its own. Use the Cohere SDK directly in a task or extend the provider.

## Common Pattern: Feed Embeddings To A Downstream Task

Because the operator returns plain float vectors, the common Airflow pattern is:

1. generate embeddings with `CohereEmbeddingOperator`
2. transform them in a Python task
3. write them to your database or vector store in another task/operator

Keep the payload size in mind. Large embedding batches can make XCom heavy; for bigger corpora, batch the work or persist outputs outside XCom.

## Pitfalls

- This package does not install Airflow for you. Install `apache-airflow` first or pin it in the same `pip install` command.
- The provider supports Airflow `2.11.0+` only. That minimum changed in provider `1.6.0`.
- `max_retries` on `CohereHook` and `CohereEmbeddingOperator` is deprecated. Prefer `request_options={"max_retries": ...}`.
- The connection test in `CohereHook.test_connection()` uses the chat API with model `command-r-plus-08-2024`, not the embedding endpoint. A failed UI connection test can therefore reflect chat-model access rather than a broken embeddings configuration.
- Only the connection password and optional host are used by the hook. Do not expect login, schema, port, or extra fields to affect requests.
- If you define the connection through `AIRFLOW_CONN_...`, it will not show up in the Airflow UI.

## Version Notes For `1.6.2`

- `1.6.2` was released on February 2, 2026.
- The `1.6.2` changelog entry is a Python 3.13 compatibility fix: minimum `fastavro` was pinned to `1.10.0`.
- The provider's minimum supported Airflow version remains `2.11.0`.

## Official Sources

- Provider docs: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/
- Provider package page: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/index.html
- Cohere connection docs: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/connections.html
- Cohere embedding operator guide: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/operators/embedding.html
- `CohereHook` API reference: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/_api/airflow/providers/cohere/hooks/cohere/index.html
- `CohereEmbeddingOperator` API reference: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/_api/airflow/providers/cohere/operators/embedding/index.html
- `CohereHook` source docs: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/_modules/airflow/providers/cohere/hooks/cohere.html
- `CohereEmbeddingOperator` source docs: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/_modules/airflow/providers/cohere/operators/embedding.html
- Provider changelog: https://airflow.apache.org/docs/apache-airflow-providers-cohere/stable/changelog.html
- PyPI package page: https://pypi.org/project/apache-airflow-providers-cohere/
- Airflow connection management: https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html
