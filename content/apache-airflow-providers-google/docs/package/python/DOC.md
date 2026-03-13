---
name: package
description: "Apache Airflow Google provider for running Google Cloud workflows with Airflow operators, hooks, sensors, and transfers"
metadata:
  languages: "python"
  versions: "20.0.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "apache-airflow,airflow,google-cloud,gcp,bigquery,gcs,dag"
---

# Apache Airflow Google Provider Python Guide

## Golden Rule

`apache-airflow-providers-google` is an Airflow provider package, not a standalone SDK. Install it into an existing Airflow environment, configure a Google connection such as `google_cloud_default`, and let operators and hooks authenticate through Airflow Connections or Application Default Credentials instead of embedding service-account keys in DAG code.

## Install

Install the provider into the same virtual environment as Airflow.

If you already have Airflow installed, pin the existing Airflow version in the same command so the resolver does not silently replace core:

```bash
AIRFLOW_VERSION="3.1.8"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-google==20.0.0"
```

If you are creating the environment from scratch, install Airflow first using the official Airflow installation flow for your Python version, then add this provider.

## Authentication And Connection Setup

The provider reads credentials from an Airflow connection. The conventional connection ID is `google_cloud_default`, and most operators let you override it with `gcp_conn_id`.

For local development, the simplest setup is an empty Google connection plus Google Application Default Credentials:

```bash
export AIRFLOW_CONN_GOOGLE_CLOUD_DEFAULT='google-cloud-platform://'
export GOOGLE_APPLICATION_CREDENTIALS='/path/to/service-account.json'
export GOOGLE_CLOUD_PROJECT='your-gcp-project'
```

What this does:

- `AIRFLOW_CONN_GOOGLE_CLOUD_DEFAULT` creates the Airflow connection from an environment variable
- `GOOGLE_APPLICATION_CREDENTIALS` points Google auth to a service-account JSON file
- `GOOGLE_CLOUD_PROJECT` gives client libraries and some tasks a default project value

Production guidance:

- Prefer an attached service account, Workload Identity, or another short-lived credential flow over long-lived JSON keys.
- Keep credentials in Airflow Connections, secret backends, or the runtime environment, not in DAG source files.
- Pass `gcp_conn_id="your-connection-id"` explicitly when a DAG uses anything other than `google_cloud_default`.
- Use `impersonation_chain` when tasks should run as a different Google service account than the worker's base identity.

## BigQuery Jobs

For SQL, load jobs, and copy jobs, `BigQueryInsertJobOperator` is the operator to reach for first. It submits a standard BigQuery job configuration and works well for idempotent DAG tasks.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator

with DAG(
    dag_id="bigquery_daily_report",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["google", "bigquery"],
):
    run_query = BigQueryInsertJobOperator(
        task_id="run_query",
        gcp_conn_id="google_cloud_default",
        project_id="your-gcp-project",
        location="US",
        configuration={
            "query": {
                "query": """
                CREATE OR REPLACE TABLE `your-gcp-project.analytics.daily_orders` AS
                SELECT CURRENT_DATE() AS run_date, COUNT(*) AS order_count
                FROM `bigquery-public-data.samples.shakespeare`
                """,
                "useLegacySql": False,
            }
        },
    )
```

Important BigQuery details:

- Set `location` to the region or multi-region used by the dataset and job.
- Keep `useLegacySql` explicit unless you intentionally need legacy SQL.
- Treat `configuration` as the source of truth for the BigQuery job you want to run.

## Cloud Storage Uploads And Listing

For Cloud Storage file movement inside a DAG, use the provider's transfer and operator classes instead of shelling out to `gsutil`.

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG
from airflow.providers.google.cloud.operators.gcs import GCSListObjectsOperator
from airflow.providers.google.cloud.transfers.local_to_gcs import LocalFilesystemToGCSOperator

with DAG(
    dag_id="gcs_upload_and_list",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["google", "gcs"],
):
    upload_report = LocalFilesystemToGCSOperator(
        task_id="upload_report",
        gcp_conn_id="google_cloud_default",
        src="/opt/airflow/dags/data/report.csv",
        dst="incoming/report.csv",
        bucket="your-bucket",
        mime_type="text/csv",
    )

    list_incoming = GCSListObjectsOperator(
        task_id="list_incoming",
        gcp_conn_id="google_cloud_default",
        bucket="your-bucket",
        prefix="incoming/",
    )

    upload_report >> list_incoming
```

Use this pattern when a DAG needs to stage files into GCS before BigQuery loads, Dataflow jobs, or downstream batch processing.

## Hooks Inside Python Tasks

When you need custom Python logic instead of a prebuilt operator, import a Google hook from `airflow.providers.google.cloud.hooks.*` and let it resolve credentials from the same Airflow connection.

Example import paths you will commonly reach for:

```python
from airflow.providers.google.cloud.hooks.bigquery import BigQueryHook
from airflow.providers.google.cloud.hooks.gcs import GCSHook
```

Use hooks inside Python tasks for small, service-specific operations. Use operators when the provider already exposes the workflow you need as a first-class Airflow task.

## Common Patterns

- Use `gcp_conn_id` consistently across related tasks in the same DAG.
- Pass `project_id`, dataset names, bucket names, and locations explicitly instead of assuming every operator will infer them.
- Keep Google-specific configuration in operator arguments and Airflow connections, not in ad hoc environment parsing inside task bodies.
- Reuse the provider's transfers and operators for common workflows such as local-file-to-GCS, GCS-to-BigQuery, and BigQuery job submission.

## Pitfalls

- This package does not replace `apache-airflow`; it extends it.
- A task can authenticate successfully and still fail if the target Google API is not enabled or the service account lacks IAM permissions.
- BigQuery region mismatches are a common source of job failures; align `location` with the dataset and destination resources.
- Do not hard-code service-account JSON into DAG files or commit key files into the repository.
- If a DAG uses multiple Google identities, set separate Airflow connections or use `impersonation_chain` deliberately instead of relying on whichever ambient credentials happen to exist.

## When To Reach For The Provider

Use `apache-airflow-providers-google` when Airflow should orchestrate Google Cloud work as DAG tasks. If you are writing a regular Python application instead of an Airflow DAG or plugin, use the service-specific Google client library directly, such as `google-cloud-storage` or `google-cloud-bigquery`.
