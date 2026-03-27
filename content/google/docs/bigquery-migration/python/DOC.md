---
name: bigquery-migration
description: "Google Cloud BigQuery Migration Python client for batch SQL translation workflows and interactive query translation"
metadata:
  languages: "python"
  versions: "0.13.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,bigquery,migration,google-cloud,gcp,sql,translation,python"
---

# google-cloud-bigquery-migration Python Package Guide

## Golden Rule

Use the official `google-cloud-bigquery-migration` package with Google Cloud credentials.

In practice, the Python surface is split:

- `google.cloud.bigquery_migration_v2.MigrationServiceClient` for migration workflows such as batch SQL translation jobs
- `google.cloud.bigquery_migration_v2alpha.SqlTranslationServiceClient` for direct `translate_query()` calls

Authenticate with Application Default Credentials (ADC), keep the `project` and `location` explicit in resource names, and use Cloud Storage paths for batch translation inputs and outputs.

## Install

Pin the package version you want to reason about:

```bash
python -m pip install "google-cloud-bigquery-migration==0.13.0"
```

Other common package managers:

```bash
uv add "google-cloud-bigquery-migration==0.13.0"
poetry add "google-cloud-bigquery-migration==0.13.0"
```

PyPI lists support for Python 3.7 and newer, including Python 3.14.

## Authentication And Setup

Enable the API, authenticate locally, and set the project you want the client to use:

```bash
gcloud services enable bigquerymigration.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="your-project-id"
export BIGQUERY_MIGRATION_LOCATION="us"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export BIGQUERY_MIGRATION_LOCATION="us"
```

Practical setup notes:

- BigQuery Migration resources are location-scoped, so build parents like `projects/PROJECT_ID/locations/us`.
- Batch translation expects Cloud Storage source and target directories such as `gs://my-bucket/input/` and `gs://my-bucket/output/`.
- The API requires Google Cloud OAuth credentials with the `cloud-platform` scope. Do not use API keys for this client.

## Initialize Clients

```python
import os

from google.cloud import bigquery_migration_v2
from google.cloud import bigquery_migration_v2alpha

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("BIGQUERY_MIGRATION_LOCATION", "us")
parent = f"projects/{project_id}/locations/{location}"

workflow_client = bigquery_migration_v2.MigrationServiceClient()
translation_client = bigquery_migration_v2alpha.SqlTranslationServiceClient()
```

If your environment requires a regional or custom endpoint, the generated client docs say to pass `client_options={"api_endpoint": ...}` when constructing the client.

## Common Workflows

### Create A Batch SQL Translation Workflow

This follows the official Python sample shape for a Teradata-to-BigQuery batch translation job:

```python
import os

from google.cloud import bigquery_migration_v2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("BIGQUERY_MIGRATION_LOCATION", "us")
parent = f"projects/{project_id}/locations/{location}"

client = bigquery_migration_v2.MigrationServiceClient()

source_dialect = bigquery_migration_v2.Dialect()
source_dialect.teradata_dialect = bigquery_migration_v2.TeradataDialect(
    mode=bigquery_migration_v2.TeradataDialect.Mode.SQL
)

target_dialect = bigquery_migration_v2.Dialect()
target_dialect.bigquery_dialect = bigquery_migration_v2.BigQueryDialect()

translation_config = bigquery_migration_v2.TranslationConfigDetails(
    gcs_source_path="gs://my-bucket/teradata/input/",
    gcs_target_path="gs://my-bucket/teradata/output/",
    source_dialect=source_dialect,
    target_dialect=target_dialect,
)

migration_task = bigquery_migration_v2.MigrationTask(
    type_="Translation_Teradata2BQ",
    translation_config_details=translation_config,
)

workflow = bigquery_migration_v2.MigrationWorkflow(
    display_name="teradata-batch-translation",
)
workflow.tasks["translation-task"] = migration_task

request = bigquery_migration_v2.CreateMigrationWorkflowRequest(
    parent=parent,
    migration_workflow=workflow,
)

response = client.create_migration_workflow(request=request)

print(response.name)
print(response.display_name)
print(response.state)
```

The product docs list batch translation task types for Redshift, HiveQL, Impala, Spark SQL, Azure Synapse, BigQuery, Greenplum, Db2, Netezza, MySQL, Oracle, PostgreSQL, Presto or Trino, Snowflake, SQLite, SQL Server, Teradata, and Vertica. Change the task `type_` and source dialect fields to match the source system you are migrating from.

### Start And Inspect A Workflow

Creating a workflow and starting a workflow are separate operations in the API. The start call is valid for workflows in `DRAFT` or `RUNNING`.

```python
from google.cloud import bigquery_migration_v2

client = bigquery_migration_v2.MigrationServiceClient()
workflow_name = "projects/your-project-id/locations/us/workflows/12345678"

client.start_migration_workflow(name=workflow_name)

current = client.get_migration_workflow(name=workflow_name)
print(current.name)
print(current.state)

for workflow in client.list_migration_workflows(parent="projects/your-project-id/locations/us"):
    print(workflow.name, workflow.display_name, workflow.state)
```

### List Subtasks After A Workflow Starts

Subtasks are useful when you need per-task progress or error inspection:

```python
from google.cloud import bigquery_migration_v2

client = bigquery_migration_v2.MigrationServiceClient()
workflow_name = "projects/your-project-id/locations/us/workflows/12345678"

for subtask in client.list_migration_subtasks(parent=workflow_name):
    print(subtask.name, subtask.task_id, subtask.type_, subtask.state)
```

If you only want subtasks for one task inside the workflow, the request supports filters such as `migration_task = "task_id"`.

### Translate A Single Query Interactively

Use the v2alpha SQL translation client when you want a direct string-to-string translation call instead of a Cloud Storage-backed batch workflow:

```python
import os

from google.cloud import bigquery_migration_v2alpha

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("BIGQUERY_MIGRATION_LOCATION", "us")
parent = f"projects/{project_id}/locations/{location}"

client = bigquery_migration_v2alpha.SqlTranslationServiceClient()

request = bigquery_migration_v2alpha.TranslateQueryRequest(
    parent=parent,
    source_dialect=bigquery_migration_v2alpha.TranslateQueryRequest.SqlTranslationSourceDialect.TERADATA,
    query="SELECT TOP 5 * FROM sales;",
)

response = client.translate_query(request=request)

print(response.translation_job)
print(response.translated_query)
print(len(response.warnings), len(response.errors))
```

The current `TranslateQueryRequest` reference only documents `TERADATA` as the interactive `source_dialect` enum value.

## Common Pitfalls

- Do not mix the workflow client and the direct translation client. Batch workflows live under `bigquery_migration_v2`; direct `translate_query()` lives under `bigquery_migration_v2alpha`.
- Do not omit the location segment in `parent` or workflow names. The API examples use `projects/PROJECT_ID/locations/LOCATION`.
- Do not pass local filesystem paths for batch translation. Batch jobs use Cloud Storage URIs.
- Do not assume `create_migration_workflow()` also starts execution. Use `start_migration_workflow()` when you need to move a draft workflow into `RUNNING`.
- Do not hardcode API keys or custom auth headers. Use ADC or an explicit Google credentials object.
- The generated Python docs note that some calls may require regional endpoints. If requests fail because of endpoint routing, set `client_options.api_endpoint` instead of changing resource-name formats.
- The product docs note that translated output can reference helper UDFs in the public `bqutil` dataset. That is useful for initial translation, but Google explicitly warns against relying on `bqutil` directly for production workloads.

## Version-Sensitive Notes For 0.13.0

- PyPI shows `google-cloud-bigquery-migration 0.13.0` released on January 9, 2026.
- The current Python reference still documents the two-surface model: workflow management in `v2`, direct query translation in `v2alpha`.
- The latest published changelog page for this package currently stops at `0.12.0`, where Google added Python 3.14 support and deprecated the `credentials_file` argument. Prefer ADC or `credentials=` over older credentials-file shortcuts.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-bigquery-migration/
- BigQuery Migration API client libraries page: https://docs.cloud.google.com/bigquery/docs/reference/migration
- BigQuery Migration product docs for translation jobs: https://docs.cloud.google.com/bigquery/docs/api-sql-translator
- Python `MigrationServiceClient` reference: https://cloud.google.com/python/docs/reference/bigquerymigration/latest/google.cloud.bigquery_migration_v2.services.migration_service.MigrationServiceClient
- Python `SqlTranslationServiceClient` reference: https://docs.cloud.google.com/python/docs/reference/bigquerymigration/latest/google.cloud.bigquery_migration_v2alpha.services.sql_translation_service.SqlTranslationServiceClient
- Python `TranslateQueryRequest` reference: https://cloud.google.com/python/docs/reference/bigquerymigration/latest/google.cloud.bigquery_migration_v2alpha.types.TranslateQueryRequest
- Python `TranslateQueryResponse` reference: https://cloud.google.com/python/docs/reference/bigquerymigration/latest/google.cloud.bigquery_migration_v2alpha.types.TranslateQueryResponse
- Python package changelog: https://docs.cloud.google.com/python/docs/reference/bigquerymigration/latest/changelog
- BigQuery Migration RPC reference: https://docs.cloud.google.com/bigquery/docs/reference/migration/rpc
