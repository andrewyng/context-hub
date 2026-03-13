---
name: package
description: "Apache Airflow OpenSearch provider for Airflow connections and OpenSearch hook-based DAG tasks"
metadata:
  languages: "python"
  versions: "1.8.4"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,opensearch,search,dag,python"
---

# apache-airflow-providers-opensearch

Use `apache-airflow-providers-opensearch` when your Airflow DAGs need an Airflow-managed connection and a Python hook for talking to an OpenSearch cluster from tasks.

This guide targets provider version `1.8.4`.

## Install

Install the provider into the same Python environment or container image used by your Airflow deployment:

```bash
pip install apache-airflow-providers-opensearch==1.8.4
```

In practice, the scheduler, webserver, and every worker that imports DAG code must all have the provider available.

## Configure The Airflow Connection

The provider uses an Airflow connection for the OpenSearch endpoint. The default connection id is commonly `opensearch_default`.

You can create it in the Airflow UI, or define it with an environment variable:

```bash
export AIRFLOW_CONN_OPENSEARCH_DEFAULT='opensearch://admin:admin@opensearch.example.com:9200?use_ssl=true&verify_certs=true'
```

With that environment variable in place:

- the Airflow connection id is `opensearch_default`
- DAG code passes `opensearch_conn_id="opensearch_default"`
- credentials stay in the Airflow connection layer instead of in DAG files

Connection values you usually need:

- `Host`: the OpenSearch endpoint
- `Port`: usually `9200` for self-managed clusters or `443` behind HTTPS
- `Login` and `Password`: if your cluster uses basic auth
- `Schema`: `http` or `https` as appropriate
- `Extra`: TLS-related settings such as certificate verification when needed

Keep connection secrets and TLS settings in Airflow connections or a secrets backend instead of hard-coding them in tasks.

## Use The Hook In A DAG

Use `OpenSearchHook` inside a TaskFlow or Python task when you need to call the OpenSearch client directly.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.opensearch.hooks.opensearch import OpenSearchHook
from pendulum import datetime

with DAG(
    dag_id="opensearch_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def write_and_search() -> list[dict]:
        hook = OpenSearchHook(opensearch_conn_id="opensearch_default")
        client = hook.get_conn()

        if not client.ping():
            raise RuntimeError("OpenSearch is not reachable")

        index_name = "airflow-demo"

        if not client.indices.exists(index=index_name):
            client.indices.create(
                index=index_name,
                body={
                    "settings": {
                        "index": {
                            "number_of_shards": 1,
                            "number_of_replicas": 0,
                        }
                    }
                },
            )

        client.index(
            index=index_name,
            id="1",
            body={"message": "hello from airflow", "source": "dag-task"},
            refresh=True,
        )

        response = client.search(
            index=index_name,
            body={
                "query": {
                    "match": {
                        "message": "airflow",
                    }
                }
            },
        )

        hits = response["hits"]["hits"]
        print(hits)
        return hits

    write_and_search()
```

The important pattern is:

1. create `OpenSearchHook(opensearch_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned OpenSearch client for normal `opensearch-py` calls such as `ping()`, `indices.create()`, `index()`, and `search()`

## Read Cluster Metadata In A Task

For health checks or debugging, call the client returned by the hook and inspect cluster info.

```python
from airflow.decorators import task
from airflow.providers.opensearch.hooks.opensearch import OpenSearchHook

@task
def show_cluster_info() -> None:
    hook = OpenSearchHook(opensearch_conn_id="opensearch_default")
    client = hook.get_conn()

    info = client.info()
    print(info["version"]["number"])
    print(info["cluster_name"])
```

Use this pattern when a DAG should fail early if the endpoint is unreachable or pointed at the wrong cluster.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep the endpoint, auth, and TLS configuration in an Airflow connection
- create the client inside a task with `OpenSearchHook`
- use normal OpenSearch client calls for index creation, indexing, and search
- return only small derived results from tasks instead of large raw search payloads when downstream tasks do not need the full response

## Pitfalls

- Install the provider everywhere DAG code runs. Import errors usually mean one Airflow image or worker is missing the package.
- Use `opensearch_conn_id`, not a generic `conn_id`, when creating `OpenSearchHook`.
- Make sure workers can reach the OpenSearch endpoint over the network. A connection that works from the webserver container may still fail on workers.
- Keep auth and TLS options in the Airflow connection instead of embedding them in DAG source.
- If a task writes a document and immediately searches for it in the same run, use `refresh=True` on `index()` or an explicit refresh before `search()`.

## Version Notes

- This guide covers `apache-airflow-providers-opensearch` version `1.8.4`.
- If you upgrade the provider, check the provider docs and API reference for any changes to connection handling or hook behavior before rolling the change across production Airflow images.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-opensearch/stable/`
- OpenSearch connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-opensearch/stable/connections/opensearch.html`
- `OpenSearchHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-opensearch/stable/_api/airflow/providers/opensearch/hooks/opensearch/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-opensearch/`
