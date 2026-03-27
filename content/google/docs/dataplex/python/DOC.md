---
name: dataplex
description: "Google Cloud Dataplex Python client for lake management, catalog lookups, and data scans"
metadata:
  languages: "python"
  versions: "2.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,dataplex,gcp,python,data-governance,data-quality,catalog"
---

# Google Cloud Dataplex Python Package Guide

## Golden Rule

Use the official `google-cloud-dataplex` client with Google Cloud authentication.

For most Python code, the important clients are:

- `dataplex_v1.DataplexServiceClient` for lakes, zones, assets, tasks, and environments
- `dataplex_v1.DataScanServiceClient` for data profile and data quality scans
- `dataplex_v1.CatalogServiceClient` for catalog entry lookup and search

Dataplex uses Google Cloud credentials, not API keys.

## Install

```bash
python -m pip install --upgrade pip
python -m pip install "google-cloud-dataplex==2.16.0"
```

Common alternatives:

```bash
uv add "google-cloud-dataplex==2.16.0"
poetry add "google-cloud-dataplex==2.16.0"
```

## Authentication And Setup

Enable Dataplex for the target project and authenticate with Application Default Credentials (ADC):

```bash
gcloud auth application-default login
gcloud services enable dataplex.googleapis.com

export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATAPLEX_LOCATION="us-central1"
```

If you need to use a service account key file explicitly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATAPLEX_LOCATION="us-central1"
```

If your workflow scans BigQuery tables or catalogs Cloud Storage data, those resources must already exist and be accessible to the caller.

## Initialize Clients

Create clients once and reuse them:

```python
import os

from google.cloud import dataplex_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.getenv("DATAPLEX_LOCATION", "us-central1")

dataplex_client = dataplex_v1.DataplexServiceClient()
scan_client = dataplex_v1.DataScanServiceClient()
catalog_client = dataplex_v1.CatalogServiceClient()
```

If you need explicit credentials:

```python
import os

from google.cloud import dataplex_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

scan_client = dataplex_v1.DataScanServiceClient(credentials=credentials)
```

## Core Workflows

### List Or Create Lakes

List lakes in one project and location:

```python
import os

from google.cloud import dataplex_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("DATAPLEX_LOCATION", "us-central1")

client = dataplex_v1.DataplexServiceClient()
parent = f"projects/{project_id}/locations/{location}"

for lake in client.list_lakes(parent=parent):
    print(lake.name, lake.display_name)
```

Create a lake:

```python
import os

from google.cloud import dataplex_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("DATAPLEX_LOCATION", "us-central1")

client = dataplex_v1.DataplexServiceClient()
parent = f"projects/{project_id}/locations/{location}"

operation = client.create_lake(
    parent=parent,
    lake_id="analytics-lake",
    lake=dataplex_v1.Lake(
        display_name="Analytics Lake",
    ),
)

lake = operation.result(timeout=900)
print(lake.name)
```

`create_lake` is a long-running operation. Wait on `operation.result()` before assuming the lake exists.

### Create And Run A Data Quality Scan

This example creates a scan against a BigQuery table using the full resource name format documented for `DataSource.resource`:

```python
import os

from google.cloud import dataplex_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("DATAPLEX_LOCATION", "us-central1")
dataset_id = "analytics"
table_id = "customers"

client = dataplex_v1.DataScanServiceClient()
parent = f"projects/{project_id}/locations/{location}"

scan = dataplex_v1.DataScan(
    data=dataplex_v1.DataSource(
        resource=(
            f"//bigquery.googleapis.com/projects/{project_id}"
            f"/datasets/{dataset_id}/tables/{table_id}"
        )
    ),
    data_quality_spec=dataplex_v1.DataQualitySpec(
        rules=[
            dataplex_v1.DataQualityRule(
                name="customer-id-not-null",
                dimension="COMPLETENESS",
                column="customer_id",
                non_null_expectation=dataplex_v1.DataQualityRule.NonNullExpectation(),
            ),
            dataplex_v1.DataQualityRule(
                name="email-format",
                dimension="VALIDITY",
                column="email",
                ignore_null=True,
                regex_expectation=dataplex_v1.DataQualityRule.RegexExpectation(
                    regex=r"^[^@]+@[^@]+\.[^@]+$"
                ),
            ),
        ],
        sampling_percent=100.0,
        catalog_publishing_enabled=True,
    ),
)

operation = client.create_data_scan(
    parent=parent,
    data_scan_id="customers-dq",
    data_scan=scan,
)

created_scan = operation.result(timeout=900)
print(created_scan.name)
```

If you do not configure an execution trigger, Dataplex defaults the scan to on-demand execution. Start it explicitly with `run_data_scan`:

```python
run_response = client.run_data_scan(name=created_scan.name)
print(run_response.job.name)
```

Fetch the job with the full view to inspect the latest result:

```python
job = client.get_data_scan_job(
    request=dataplex_v1.GetDataScanJobRequest(
        name=run_response.job.name,
        view=dataplex_v1.GetDataScanJobRequest.DataScanJobView.FULL,
    )
)

print(job.state)
print(job.data_quality_result.passed)
print(job.data_quality_result.score)
```

### Search The Catalog Or Read One Entry

Search entries visible from a project:

```python
import os

from google.cloud import dataplex_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = dataplex_v1.CatalogServiceClient()

request = dataplex_v1.SearchEntriesRequest(
    page_size=100,
    name=f"projects/{project_id}/locations/global",
    scope=f"projects/{project_id}",
    query='name:"customers"',
)

for result in client.search_entries(request=request):
    print(result.dataplex_entry.name)
```

Read one known entry and request the `FULL` view:

```python
import os

from google.cloud import dataplex_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("DATAPLEX_LOCATION", "us-central1")
entry_group_id = "example-group"
entry_id = "example-entry"

client = dataplex_v1.CatalogServiceClient()

entry = client.get_entry(
    request=dataplex_v1.GetEntryRequest(
        name=(
            f"projects/{project_id}/locations/{location}"
            f"/entryGroups/{entry_group_id}/entries/{entry_id}"
        ),
        view=dataplex_v1.EntryView.FULL,
    )
)

print(entry.name)
```

Use `get_entry` when you want Dataplex-side access checks. Use `lookup_entry` when you need source-system permission checks instead.

## Common Pitfalls

- Do not use API keys. Dataplex Python clients expect Google credentials.
- `create_lake` and `create_data_scan` are long-running operations. Wait on `.result()` before using the created resource.
- `DataScan.ExecutionSpec` defaults to on-demand execution. If you do not configure a trigger, call `run_data_scan()` yourself.
- `DataQualitySpec.rules` is required and must contain at least one rule.
- `DataSource` is a one-of. Set either `entity` or `resource`, not both.
- `SearchEntriesRequest.name` uses `projects/{project}/locations/global`, while many other Dataplex resources are regional.
- `get_entry` and `lookup_entry` are not interchangeable. The official samples and reference docs distinguish Dataplex permission checks from source-system permission checks.
- If you use a client as a context manager, leaving the `with` block closes its underlying transport.

## Version-Sensitive Notes

- PyPI lists `google-cloud-dataplex 2.16.0` as the current package version for this guide.
- The hosted `latest` reference pages are version-skewed on some Dataplex subpages and may still show `2.15.0` or older headings. Use PyPI for package version pinning, and use the reference docs for method names, request types, and resource formats.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-dataplex/
- Python client overview: https://cloud.google.com/python/docs/reference/dataplex/latest
- Dataplex Python reference root: https://docs.cloud.google.com/python/docs/reference/dataplex/latest
- `DataplexServiceClient` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.services.dataplex_service.DataplexServiceClient
- `DataScanServiceClient` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.services.data_scan_service.DataScanServiceClient
- `CatalogServiceClient` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.services.catalog_service.CatalogServiceClient
- `DataSource` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.types.DataSource
- `DataQualityRule` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.types.DataQualityRule
- `DataQualitySpec` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.types.DataQualitySpec
- `DataScan.ExecutionSpec` reference: https://docs.cloud.google.com/python/docs/reference/dataplex/latest/google.cloud.dataplex_v1.types.DataScan.ExecutionSpec
- Catalog search sample: https://docs.cloud.google.com/dataplex/docs/samples/dataplex-search-entries
- Catalog get-entry sample: https://docs.cloud.google.com/dataplex/docs/samples/dataplex-get-entry
- Data profiling and data scan samples: https://docs.cloud.google.com/dataplex/docs/use-data-profiling
- Create-lake guide: https://docs.cloud.google.com/dataplex/docs/create-lake
