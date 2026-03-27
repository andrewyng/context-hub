---
name: bigquery-datatransfer
description: "Google Cloud BigQuery Data Transfer Service Python client for scheduled queries, managed transfers, and transfer run operations"
metadata:
  languages: "python"
  versions: "3.21.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,bigquery,data-transfer,gcp,scheduled-query,cloud-storage,python"
---

# google-cloud-bigquery-datatransfer Python Package Guide

## What This Package Is

`google-cloud-bigquery-datatransfer` is the official Python client for the BigQuery Data Transfer Service. Use it when your application needs to:

- create scheduled queries
- create recurring transfers from supported sources such as Cloud Storage
- inspect transfer configs and transfer runs
- start manual backfills for an existing transfer

The client does not move data out of BigQuery. It manages transfer configurations and runs that load data into BigQuery.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-bigquery-datatransfer==3.21.0"
```

Common alternatives:

```bash
uv add "google-cloud-bigquery-datatransfer==3.21.0"
poetry add "google-cloud-bigquery-datatransfer==3.21.0"
```

Upstream package metadata currently lists Python `>=3.7`.

## Authentication And Setup

Before using the client:

- enable billing on the project
- enable BigQuery and BigQuery Data Transfer Service
- create the destination BigQuery dataset
- configure Application Default Credentials (ADC)

Typical local setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Practical IAM guidance from the product docs:

- Google recommends `roles/bigquery.admin` for users who create transfers because it includes the common BigQuery Data Transfer and dataset permissions.
- Scheduled queries and dataset copies run using the transfer owner credentials unless you set `service_account_name`.
- Most other data sources rely on the BigQuery Data Transfer Service agent to create jobs and write into the destination dataset.

## Initialize A Client

Use the explicit `bigquery_datatransfer_v1` namespace in new code:

```python
import os

from google.cloud import bigquery_datatransfer_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = "us"

client = bigquery_datatransfer_v1.DataTransferServiceClient()
parent = f"projects/{project_id}/locations/{location}"
```

If you need to pass credentials explicitly:

```python
from google.cloud import bigquery_datatransfer_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = bigquery_datatransfer_v1.DataTransferServiceClient(credentials=credentials)
```

## Common Workflows

### List Available Data Sources

Data source ids such as `scheduled_query` and `google_cloud_storage` are product-defined. Query them instead of guessing.

```python
import os

from google.cloud import bigquery_datatransfer_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
client = bigquery_datatransfer_v1.DataTransferServiceClient()

for source in client.list_data_sources(parent=f"projects/{project_id}"):
    print(source.data_source_id, source.display_name)
```

### Create A Scheduled Query

This is the most common automation workflow for BigQuery-native jobs.

```python
import os

from google.cloud import bigquery_datatransfer_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
dataset_id = "analytics"
service_account_name = "scheduler@your-project-id.iam.gserviceaccount.com"

query_string = """
SELECT
  CURRENT_TIMESTAMP() AS current_time,
  @run_time AS intended_run_time,
  @run_date AS intended_run_date,
  COUNT(*) AS row_count
FROM `your-project-id.analytics.events`
"""

client = bigquery_datatransfer_v1.DataTransferServiceClient()

transfer_config = bigquery_datatransfer_v1.TransferConfig(
    destination_dataset_id=dataset_id,
    display_name="Daily event summary",
    data_source_id="scheduled_query",
    params={
        "query": query_string,
        "destination_table_name_template": "daily_summary_{run_date}",
        "write_disposition": "WRITE_TRUNCATE",
        "partitioning_field": "",
    },
    schedule="every 24 hours",
)

created = client.create_transfer_config(
    request=bigquery_datatransfer_v1.CreateTransferConfigRequest(
        parent=f"projects/{project_id}",
        transfer_config=transfer_config,
        service_account_name=service_account_name,
    )
)

print(created.name)
```

Notes:

- The scheduled query sample uses a project-scoped `parent` rather than a location-scoped one.
- The query can reference the built-in `@run_time` and `@run_date` parameters.
- Omit `service_account_name` if the scheduled query should run as the caller represented by your ADC credentials.

### Create A Cloud Storage Transfer

Use the `google_cloud_storage` data source when you want recurring load jobs from `gs://` objects.

```python
import os

from google.cloud import bigquery_datatransfer_v1
from google.protobuf import struct_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = "us"

client = bigquery_datatransfer_v1.DataTransferServiceClient()
parent = f"projects/{project_id}/locations/{location}"

params = struct_pb2.Struct()
params.update(
    {
        "data_path_template": "gs://my-bucket/orders/*.csv",
        "destination_table_name_template": "orders_{run_date}",
        "file_format": "CSV",
        "skip_leading_rows": "1",
    }
)

transfer_config = bigquery_datatransfer_v1.TransferConfig(
    destination_dataset_id="analytics",
    display_name="Cloud Storage orders import",
    data_source_id="google_cloud_storage",
    params=params,
    schedule="every 24 hours",
)

created = client.create_transfer_config(
    request=bigquery_datatransfer_v1.CreateTransferConfigRequest(
        parent=parent,
        transfer_config=transfer_config,
    )
)

print(created.name)
```

Use the location-scoped `projects/{project}/locations/{location}` parent format shown in the official transfer-management samples.

### Inspect Transfer Configs And Runs

Use location-scoped resource names for config and run operations.

```python
import os

from google.cloud import bigquery_datatransfer_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = "us"
transfer_config_id = "abcd1234-0000-1111-2222-efgh5678"

client = bigquery_datatransfer_v1.DataTransferServiceClient()
parent = f"projects/{project_id}/locations/{location}"
config_name = f"{parent}/transferConfigs/{transfer_config_id}"

for config in client.list_transfer_configs(parent=parent):
    print(config.name, config.data_source_id, config.schedule)

config = client.get_transfer_config(name=config_name)
print(config.display_name, config.destination_dataset_id, config.disabled)

for run in client.list_transfer_runs(parent=config_name):
    print(run.name, run.run_time)
```

### Start A Manual Backfill

Use `start_manual_transfer_runs()` for missed dates or historical reprocessing.

```python
from datetime import datetime, timedelta, timezone

from google.cloud.bigquery_datatransfer_v1 import (
    DataTransferServiceClient,
    StartManualTransferRunsRequest,
)

client = DataTransferServiceClient()
transfer_config_name = "projects/1234/locations/us/transferConfigs/abcd"

now = datetime.now(timezone.utc)
start_time = now - timedelta(days=5)
end_time = now - timedelta(days=2)

# Some data sources, such as scheduled_query, only support daily runs.
# Truncate to midnight UTC before requesting a time range.
start_time = datetime(
    start_time.year, start_time.month, start_time.day, tzinfo=timezone.utc
)
end_time = datetime(end_time.year, end_time.month, end_time.day, tzinfo=timezone.utc)

request = StartManualTransferRunsRequest(
    parent=transfer_config_name,
    requested_time_range=StartManualTransferRunsRequest.TimeRange(
        start_time=start_time,
        end_time=end_time,
    ),
)

response = client.start_manual_transfer_runs(request=request)

for run in response.runs:
    print(run.name, run.run_time)
```

### Update Metadata Or Switch To A Service Account

`update_transfer_config()` is partial-update only. Always pass an update mask.

```python
from google.cloud import bigquery_datatransfer_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = bigquery_datatransfer_v1.DataTransferServiceClient()
transfer_config_name = "projects/1234/locations/us/transferConfigs/abcd"

updated = client.update_transfer_config(
    request={
        "transfer_config": bigquery_datatransfer_v1.TransferConfig(
            name=transfer_config_name,
            display_name="Nightly orders sync",
        ),
        "update_mask": FieldMask(paths=["display_name"]),
    }
)

print(updated.display_name)
```

Switch credentials for a supported data source:

```python
from google.cloud import bigquery_datatransfer_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = bigquery_datatransfer_v1.DataTransferServiceClient()

updated = client.update_transfer_config(
    request={
        "transfer_config": bigquery_datatransfer_v1.TransferConfig(
            name="projects/1234/locations/us/transferConfigs/abcd",
        ),
        "update_mask": FieldMask(paths=["service_account_name"]),
        "service_account_name": "scheduler@your-project-id.iam.gserviceaccount.com",
    }
)

print(updated.name)
```

### Delete A Transfer Config

```python
from google.cloud import bigquery_datatransfer_v1

client = bigquery_datatransfer_v1.DataTransferServiceClient()
transfer_config_name = "projects/1234/locations/us/transferConfigs/abcd"

client.delete_transfer_config(name=transfer_config_name)
```

## Important Pitfalls

- Do not assume every transfer uses the same credential model. Scheduled queries and dataset copies run with user or explicit service-account credentials, while most other sources rely on the BigQuery Data Transfer Service agent.
- Do not remove the service agent dataset permissions that BigQuery Data Transfer Service adds for non-scheduled-query transfers. Google documents `roles/bigquery.dataEditor` on the destination dataset as required for the service agent to write data.
- `start_manual_transfer_runs()` is the current backfill API. The older `schedule_transfer_runs()` API is deprecated.
- Disabling a transfer stops future scheduled runs and also blocks new backfills until you re-enable it.
- Starting on **March 17, 2026**, Google documents additional dataset IAM requirements for transfer creators and updaters: `bigquery.datasets.getIamPolicy` and `bigquery.datasets.setIamPolicy`.
- Data source parameters are source-specific. Use `list_data_sources()` and the product docs for the exact `params` keys supported by a given `data_source_id`.

## Version Notes

- PyPI currently lists `3.21.0` as the package version published on January 9, 2026.
- The Google Cloud Python reference pages currently expose the latest library reference under the 3.20.0 documentation tree even though PyPI lists package version 3.21.0.
- The package changelog shows `scheduleOptionsV2` support was added in `3.16.0`. Prefer the plain `schedule` string unless you specifically need newer schedule configuration fields from the generated types.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-bigquery-datatransfer/
- Maintainer package docs: https://cloud.google.com/python/docs/reference/bigquerydatatransfer/latest
- Maintainer package source: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-bigquery-datatransfer
- BigQuery Data Transfer Service overview: https://cloud.google.com/bigquery/docs/dts-introduction
- Enable the BigQuery Data Transfer Service: https://cloud.google.com/bigquery/docs/enable-transfer-service
- Authorize accounts for data transfer: https://cloud.google.com/bigquery/docs/dts-authentication-authorization
- Manage transfers: https://cloud.google.com/bigquery/docs/working-with-transfers
- Scheduling queries: https://cloud.google.com/bigquery/docs/scheduling-queries
- Create a scheduled query with a service account: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-create-scheduled-query-with-service-account
- Create a Cloud Storage transfer: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-create-cloudstorage-transfer
- Start manual transfer runs: https://cloud.google.com/python/docs/reference/bigquerydatatransfer/latest/google.cloud.bigquery_datatransfer_v1.services.data_transfer_service.DataTransferServiceClient#google_cloud_bigquery_datatransfer_v1_services_data_transfer_service_DataTransferServiceClient_start_manual_transfer_runs
- Get a transfer configuration: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-get-config-info
- List transfer configurations: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-list-configs
- List transfer runs: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-get-run-history
- Update a transfer configuration: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-update-config
- Update transfer configuration credentials: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-update-credentials
- Delete a transfer configuration: https://cloud.google.com/bigquery/docs/samples/bigquerydatatransfer-delete-transfer
