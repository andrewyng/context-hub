---
name: providers-cloudant
description: "Apache Airflow IBM Cloudant provider for Cloudant connections and hook-based database operations from DAG tasks"
metadata:
  languages: "python"
  versions: "4.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,cloudant,ibm-cloudant,nosql,dag,python"
---

# Apache Airflow Cloudant Provider Guide

Use `apache-airflow-providers-cloudant` when an Airflow DAG needs to connect to IBM Cloudant through an Airflow connection and call Cloudant from Python task code with `CloudantHook`.

## Golden Rule

- Install this provider into the same environment as `apache-airflow`; it is not a standalone Cloudant client.
- Put the Cloudant account and credentials on an Airflow connection with type `cloudant`.
- Use `CloudantHook(...).get_conn()` inside task code, then call the returned IBM Cloudant SDK client with explicit `db=...` arguments.
- Keep the database name in task code, an environment variable, or an Airflow Variable instead of relying on the connection `schema` field.

## What This Package Adds

This provider exposes Airflow's Cloudant integration through:

- `airflow.providers.cloudant.hooks.cloudant.CloudantHook`

There are no public Cloudant operators documented for this provider. The practical workflow is hook-based.

## Install

The provider docs for `4.3.2` list these minimum requirements:

- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-compat>=1.10.1`
- `ibmcloudant>=0.10.0`

Install the provider in the same Python environment or container image used by your Airflow deployment. Keep Airflow pinned in the same command so `pip` does not silently replace core with another version.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.3.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-cloudant==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful check after installation:

```bash
airflow providers list | grep -i cloudant
```

PyPI lists provider `4.3.2` as supporting Python `3.10`, `3.11`, `3.12`, and `3.13`.

## Configure A Cloudant Connection

Create an Airflow connection with connection type `cloudant`.

Airflow's Cloudant connection UI relabels fields like this:

- `Host` -> `Account`
- `Login` -> `Username (or API Key)`
- `Schema` -> `Database`

A practical setup is to keep credentials in the Airflow connection and keep the database name separate:

```bash
export CLOUDANT_ACCOUNT='your-account'
export CLOUDANT_USERNAME='your-username-or-api-key'
export CLOUDANT_PASSWORD='your-password-or-api-key-secret'
export CLOUDANT_DB='events'
```

```bash
airflow connections add 'cloudant_default' \
  --conn-type 'cloudant' \
  --conn-host "$CLOUDANT_ACCOUNT" \
  --conn-login "$CLOUDANT_USERNAME" \
  --conn-password "$CLOUDANT_PASSWORD"
```

Why keep `CLOUDANT_DB` separate: Airflow release notes for the provider explicitly say the hook no longer uses the connection `schema` attribute and the old `.db()` helper was removed.

## Use `CloudantHook` In A Task

`CloudantHook.get_conn()` returns the Cloudant client object used to call IBM Cloudant APIs. After that, use normal SDK methods such as `get_database_information`, `post_document`, `put_document`, and `post_all_docs`.

```python
from __future__ import annotations

import os

import pendulum
from airflow import DAG
from airflow.decorators import task
from airflow.providers.cloudant.hooks.cloudant import CloudantHook
from ibmcloudant.cloudant_v1 import Document


with DAG(
    dag_id="cloudant_hook_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["cloudant"],
):
    @task
    def write_and_list() -> None:
        db_name = os.environ["CLOUDANT_DB"]
        service = CloudantHook(cloudant_conn_id="cloudant_default").get_conn()

        db_info = service.get_database_information(db=db_name).get_result()
        print({"db_name": db_info["db_name"], "doc_count": db_info["doc_count"]})

        event_doc = Document(
            type="event",
            source="airflow",
            status="queued",
        )
        created = service.post_document(db=db_name, document=event_doc).get_result()
        print(created)

        rows = service.post_all_docs(
            db=db_name,
            include_docs=True,
            limit=10,
        ).get_result()

        for row in rows.get("rows", []):
            print(row.get("id"))

    write_and_list()
```

This is the usual pattern:

1. Create `CloudantHook(cloudant_conn_id="...")`
2. Call `get_conn()`
3. Pass `db="your-database"` to each Cloudant SDK method

## Common Workflow: Create Or Replace A Known Document

Use `put_document()` when your DAG owns the document ID.

```python
from __future__ import annotations

import os

from airflow.providers.cloudant.hooks.cloudant import CloudantHook
from ibmcloudant.cloudant_v1 import Document


def upsert_status() -> None:
    db_name = os.environ["CLOUDANT_DB"]
    service = CloudantHook(cloudant_conn_id="cloudant_default").get_conn()

    status_doc = Document(
        type="job_status",
        airflow_dag_id="cloudant_hook_example",
        state="processed",
    )

    response = service.put_document(
        db=db_name,
        doc_id="job-status:cloudant_hook_example",
        document=status_doc,
    ).get_result()

    print(response)
```

## Common Workflow: Bulk Write Documents

Use `post_bulk_docs()` when one task needs to write many documents in one request.

```python
from __future__ import annotations

import os

from airflow.providers.cloudant.hooks.cloudant import CloudantHook
from ibmcloudant.cloudant_v1 import BulkDocs, Document


def write_batch() -> None:
    db_name = os.environ["CLOUDANT_DB"]
    service = CloudantHook(cloudant_conn_id="cloudant_default").get_conn()

    docs = BulkDocs(
        docs=[
            Document(_id="event-1", type="event", status="queued"),
            Document(_id="event-2", type="event", status="queued"),
        ]
    )

    response = service.post_bulk_docs(
        db=db_name,
        bulk_docs=docs,
    ).get_result()

    print(response)
```

## Query And Pagination Notes

The Cloudant SDK supports selector queries with `post_find(...)` and pagination helpers in `ibmcloudant`.

IBM's Cloudant docs explicitly recommend the SDK pagination helpers instead of paginating with `skip` or offsets.

```python
from __future__ import annotations

import os

from airflow.providers.cloudant.hooks.cloudant import CloudantHook
from ibmcloudant import Pagination, PagerType


def iterate_matches() -> None:
    db_name = os.environ["CLOUDANT_DB"]
    service = CloudantHook(cloudant_conn_id="cloudant_default").get_conn()

    opts = {
        "db": db_name,
        "limit": 50,
        "fields": ["_id", "type", "status"],
        "selector": {"status": {"$eq": "queued"}},
    }

    pagination = Pagination.new_pagination(
        service,
        PagerType.POST_FIND,
        **opts,
    )

    for row in pagination.rows():
        print(row)
```

## Pitfalls

- Install the provider everywhere DAG code runs. Scheduler, workers, and local test environments all need `apache-airflow-providers-cloudant` if they import `airflow.providers.cloudant`.
- Do not rely on the connection `schema` field to pick the database. Provider release notes say the hook no longer uses `schema`, and the old `.db()` helper was removed.
- Pass `db=...` explicitly to Cloudant SDK methods like `get_database_information`, `post_document`, `put_document`, and `post_all_docs`.
- Keep result sizes bounded. IBM Cloudant documents request classes and rate limits; large unbounded reads in scheduled DAGs are easy to turn into noisy tasks.
- Prefer SDK pagination helpers over `skip` for repeated reads. IBM Cloudant documents both correctness and performance problems with `skip`-based pagination.

## Version Notes

- This guide covers `apache-airflow-providers-cloudant` version `4.3.2`.
- The provider docs list `apache-airflow>=2.11.0` as the minimum supported Airflow version for this release.
- PyPI lists Python `3.10` through `3.13` for this provider release.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-cloudant/stable/`
- Provider index / API surface: `https://airflow.apache.org/docs/apache-airflow-providers-cloudant/stable/genindex.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-cloudant/`
- IBM Cloudant API docs: `https://cloud.ibm.com/apidocs/cloudant?code=python`
- Airflow provider release notes covering the Cloudant hook changes: `https://airflow.apache.org/docs/apache-airflow/2.10.4/release_notes.html`
