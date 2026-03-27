---
name: dataproc-metastore
description: "Google Cloud Dataproc Metastore Python client for managing metastore services, imports, backups, restores, and metadata queries"
metadata:
  languages: "python"
  versions: "1.21.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,dataproc,metastore,hive,python"
---

# google-cloud-dataproc-metastore Python Package Guide

## Golden Rule

Use the official `google-cloud-dataproc-metastore` client with Google Cloud credentials.

This package is the control-plane SDK for Dataproc Metastore. Use it to create and manage metastore services, run metadata imports, query metadata, and manage backups. It is not a Hive or SQL client for talking directly to your metastore endpoint.

The import surface is:

```python
from google.cloud import metastore_v1
```

## Install

```bash
python -m pip install --upgrade pip
python -m pip install "google-cloud-dataproc-metastore==1.21.0"
```

Common alternatives:

```bash
uv add "google-cloud-dataproc-metastore==1.21.0"
poetry add "google-cloud-dataproc-metastore==1.21.0"
```

PyPI currently lists `1.21.0` and publishes this package for Python `>=3.7`.

## Authentication And Setup

The client library uses Application Default Credentials (ADC), not API keys.

Local development:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable metastore.googleapis.com
```

Service account fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export METASTORE_REGION="us-central1"
```

Prefer workload identity or an attached service account in deployed environments instead of long-lived JSON keys.

## Initialize A Client

The default endpoint is `metastore.googleapis.com`, so a plain client is usually enough:

```python
import os

from google.cloud import metastore_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
REGION = os.getenv("METASTORE_REGION", "us-central1")

client = metastore_v1.DataprocMetastoreClient()
location_name = f"projects/{PROJECT_ID}/locations/{REGION}"
```

If you need explicit credentials:

```python
from google.cloud import metastore_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/path/to/service-account.json"
)

client = metastore_v1.DataprocMetastoreClient(credentials=credentials)
```

Most methods use full resource names:

```python
service_name = (
    f"projects/{PROJECT_ID}/locations/{REGION}/services/my-metastore"
)
```

## Core Workflows

### List Existing Metastore Services

`list_services()` returns a pager. Iterate over it directly:

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()
parent = "projects/your-project/locations/us-central1"

for service in client.list_services(request={"parent": parent}):
    print(service.name, service.state, service.endpoint_uri)
```

### Create A Metastore Service

Create calls return a long-running operation. Wait for `.result()` before using the service.

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()
parent = "projects/your-project/locations/us-central1"

service = metastore_v1.Service(
    network="projects/your-project/global/networks/default",
    port=9083,
    tier=metastore_v1.Service.Tier.DEVELOPER,
    hive_metastore_config=metastore_v1.Service.HiveMetastoreConfig(
        version=metastore_v1.Service.HiveMetastoreConfig.Version.V3_1_2
    ),
)

operation = client.create_service(
    request=metastore_v1.CreateServiceRequest(
        parent=parent,
        service_id="dev-metastore",
        service=service,
    )
)

created = operation.result(timeout=1800)
print(created.name)
print(created.endpoint_uri)
```

The `network` field expects a full VPC resource name such as `projects/{project}/global/networks/{network}`. The service documentation also notes that all subnet IP ranges in that network must be RFC 1918 ranges.

### Import Metadata From A Database Dump In Cloud Storage

Use a metadata import when you already have a supported database dump in Cloud Storage and want to load it into a Dataproc Metastore service.

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()
service_name = (
    "projects/your-project/locations/us-central1/services/dev-metastore"
)

metadata_import = metastore_v1.MetadataImport(
    database_dump=metastore_v1.MetadataImport.DatabaseDump(
        database_type=metastore_v1.MetadataImport.DatabaseDump.DatabaseType.MYSQL,
        gcs_uri="gs://your-bucket/metastore/hive.sql",
    )
)

operation = client.create_metadata_import(
    request=metastore_v1.CreateMetadataImportRequest(
        parent=service_name,
        metadata_import_id="bootstrap-import",
        metadata_import=metadata_import,
    )
)

result = operation.result(timeout=1800)
print(result.name)
print(result.state)
```

The database dump source is a Cloud Storage URI. The generated types expose MySQL and PostgreSQL dump types.

### Query Metastore Metadata

`query_metadata()` lets you send a metadata query against a running metastore service:

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()

response = client.query_metadata(
    request=metastore_v1.QueryMetadataRequest(
        service=(
            "projects/your-project/locations/us-central1/services/dev-metastore"
        ),
        query="SHOW DATABASES",
    )
)

print(response.result_manifest)
print(response.result_uri)
```

The response includes a `result_manifest` and a `result_uri` for the query output.

### Create A Backup And Restore From It

Backup creation is also a long-running operation:

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()
service_name = (
    "projects/your-project/locations/us-central1/services/dev-metastore"
)

operation = client.create_backup(
    request=metastore_v1.CreateBackupRequest(
        parent=service_name,
        backup_id="nightly-backup-20260313",
        backup=metastore_v1.Backup(),
    )
)

backup = operation.result(timeout=1800)
print(backup.name)
print(backup.state)
```

Restore a service from a backup by passing the backup resource name:

```python
from google.cloud import metastore_v1

client = metastore_v1.DataprocMetastoreClient()

operation = client.restore_service(
    request=metastore_v1.RestoreServiceRequest(
        service=(
            "projects/your-project/locations/us-central1/services/dev-metastore"
        ),
        backup=(
            "projects/your-project/locations/us-central1/"
            "services/dev-metastore/backups/nightly-backup-20260313"
        ),
    )
)

restored = operation.result(timeout=1800)
print(restored.name)
print(restored.state)
```

The generated `Backup` type notes that backups are supported only for Dataproc Metastore services running supported Hive Metastore versions.

## Configuration Notes

- Use full resource names in requests instead of short IDs.
- Create, import, backup, restore, update, and delete operations are long-running operations.
- If your code is async, use `metastore_v1.DataprocMetastoreAsyncClient`.
- `QueryMetadataRequest.query` is the metadata query string; treat it as service input, not a safe place to interpolate untrusted text.

## Common Pitfalls

- Do not try to authenticate with API keys. This package expects Google Cloud credentials.
- Do not confuse the admin SDK with direct Hive access. The library manages services and admin operations.
- Do not pass a bare network name like `default`; `Service.network` expects the full VPC resource path.
- Do not assume service creation is instant. Wait on the returned operation before using the service endpoint.
- Do not point metadata imports at local files. `MetadataImport.DatabaseDump.gcs_uri` must reference Cloud Storage.
- Do not assume every Hive Metastore version supports backup. Check the service version when you depend on backup workflows.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-dataproc-metastore/
- Python client reference root: https://cloud.google.com/python/docs/reference/metastore/latest
- `DataprocMetastoreClient` reference: https://cloud.google.com/python/docs/reference/metastore/latest/google.cloud.metastore_v1.services.dataproc_metastore_service.DataprocMetastoreClient
- Package source tree: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-dataproc-metastore
- Generated types source: https://raw.githubusercontent.com/googleapis/google-cloud-python/main/packages/google-cloud-dataproc-metastore/google/cloud/metastore_v1/types/metastore.py
- Google Cloud client-library authentication guide: https://cloud.google.com/docs/authentication/client-libraries
