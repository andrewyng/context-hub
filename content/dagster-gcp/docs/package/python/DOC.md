---
name: package
description: "dagster-gcp package guide for using Dagster with Google Cloud Storage and BigQuery resources"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,gcp,dagster-gcp,python,gcs,bigquery,data-orchestration"
---

# dagster-gcp Python Package Guide

## Golden Rule

Use `dagster-gcp` as Dagster's integration layer for Google Cloud services, but keep authentication and authorization in standard Google Cloud credential flows. Install `dagster-gcp` on the matching Dagster release line, configure Google Cloud credentials through Application Default Credentials (ADC) or a service account, and inject Dagster resources into assets and ops instead of constructing ad-hoc clients everywhere.

For most projects, the lowest-friction starting point is the direct resource pattern: configure a resource in `dg.Definitions(...)`, receive it as a parameter in an asset, and call the underlying Google Cloud client for reads and writes.

## Install

Install `dagster-gcp` alongside the matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-gcp==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-gcp
```

## Prerequisites

Before wiring `dagster-gcp` into a project, make sure you already have:

- a Dagster project with a loadable top-level `defs = dg.Definitions(...)`
- the Google Cloud APIs enabled for the services you actually use, such as Cloud Storage or BigQuery
- Google Cloud credentials available through ADC or `GOOGLE_APPLICATION_CREDENTIALS`
- a target project ID, plus any bucket, dataset, or table names your assets need
- IAM permissions for the exact Storage and BigQuery operations your code performs

## Configure Google Cloud Credentials

`dagster-gcp` relies on normal Google Cloud authentication behavior from the underlying client libraries.

For local development, ADC is the simplest setup:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

Service account JSON fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

On GCP runtimes such as Cloud Run, GKE, or Compute Engine, ADC usually comes from the attached service account. In that case, keep `GOOGLE_CLOUD_PROJECT` set when project discovery would otherwise be ambiguous.

## Use `GCSResource` In Assets

Use `GCSResource` when an asset needs the Google Cloud Storage Python client.

```python
import os

import dagster as dg
from dagster_gcp.gcs import GCSResource

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
BUCKET = os.environ["GCS_BUCKET"]
KEY = "examples/hello.txt"


@dg.asset
def write_example_file(gcs: GCSResource) -> str:
    client = gcs.get_client()
    bucket = client.bucket(BUCKET)
    blob = bucket.blob(KEY)
    blob.upload_from_string(
        "hello from dagster-gcp\n",
        content_type="text/plain",
    )
    return f"gs://{BUCKET}/{KEY}"


@dg.asset(deps=[write_example_file])
def read_example_file(gcs: GCSResource) -> str:
    client = gcs.get_client()
    bucket = client.bucket(BUCKET)
    blob = bucket.blob(KEY)
    return blob.download_as_text()


defs = dg.Definitions(
    assets=[write_example_file, read_example_file],
    resources={
        "gcs": GCSResource(project=PROJECT_ID),
    },
)
```

Important details:

- the resource key in `resources={"gcs": ...}` must match the asset parameter name `gcs`
- the underlying Storage client still uses normal Google Cloud IAM, so the runtime identity needs permission for the bucket and object operations you call
- when project inference is unreliable, pass `project=` explicitly and keep `GOOGLE_CLOUD_PROJECT` set in the environment

## Use `BigQueryResource` For Queries

Use `BigQueryResource` when an asset or op needs the BigQuery Python client.

```python
import os

import dagster as dg
from dagster_gcp.bigquery import BigQueryResource

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
DATASET = os.environ["BIGQUERY_DATASET"]


@dg.asset
def recent_events(bigquery: BigQueryResource) -> list[dict]:
    client = bigquery.get_client()
    query = f"""
    SELECT user_id, event_type, event_time
    FROM `{PROJECT_ID}.{DATASET}.events`
    ORDER BY event_time DESC
    LIMIT 10
    """
    rows = client.query(query).result()
    return [dict(row.items()) for row in rows]


defs = dg.Definitions(
    assets=[recent_events],
    resources={
        "bigquery": BigQueryResource(project=PROJECT_ID),
    },
)
```

Keep the BigQuery job location aligned with the datasets you query. If your environment spans multiple locations, do not assume the default location will always be correct.

## Local Development Workflow

Validate the Dagster definitions before starting the UI:

```bash
dg check defs
```

Then run your local Dagster instance:

```bash
dg dev -m my_project.definitions
```

This is usually enough for local iteration when your Google Cloud credentials are already available through ADC or a service account.

## Common Pitfalls

- Keep Dagster package versions aligned. `dagster-gcp 0.28.18` belongs on the Dagster `1.12.18` release line.
- Do not assume `dagster-gcp` bypasses Google Cloud IAM. The runtime identity still needs the right Storage and BigQuery permissions.
- Resource injection is name-based. The resource dictionary key must match the function parameter name used in the asset or op.
- BigQuery jobs are location-sensitive. A dataset and a query job in different locations can fail even when credentials and SQL are otherwise correct.
- Set `GOOGLE_CLOUD_PROJECT` when project discovery is ambiguous, especially in local shells and CI.
- Keep service account keys out of source control and out of constant Dagster config values.

## Version Notes For `0.28.18`

- `dagster-gcp==0.28.18` matches the Dagster `1.12.18` release line, so pin related Dagster packages together.
- Authentication and client behavior come from the underlying Google Cloud Python clients, so deployment behavior can differ between local shells, CI, containers, and GCP runtimes depending on which ADC source is available.

## Official Sources

- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-gcp`
- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-gcp/dagster_gcp/gcs`
- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-gcp/dagster_gcp/bigquery`
- `https://docs.dagster.io/api/python-api/libraries/dagster-gcp`
- `https://cloud.google.com/docs/authentication/application-default-credentials`
- `https://cloud.google.com/python/docs/reference/storage/latest`
- `https://cloud.google.com/python/docs/reference/bigquery/latest`
- `https://pypi.org/project/dagster-gcp/`
