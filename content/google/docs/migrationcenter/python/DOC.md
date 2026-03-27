---
name: migrationcenter
description: "Google Cloud Migration Center Python client for asset inventory reads, group management, and import jobs"
metadata:
  languages: "python"
  versions: "0.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,migrationcenter,migration,inventory,discovery,python"
---

# Google Cloud Migration Center Python Client

## Golden Rule

Use the official `google-cloud-migrationcenter` package with `from google.cloud import migrationcenter_v1`, and authenticate with Google Cloud credentials instead of API keys or custom bearer-token code.

Migration Center resources are location-scoped. Before you automate against this API, enable Migration Center for the project and choose the location that will store your discovery data. The product docs say that location cannot be changed later.

## Install

```bash
python -m pip install "google-cloud-migrationcenter==0.3.0"
```

Common alternatives:

```bash
uv add "google-cloud-migrationcenter==0.3.0"
poetry add "google-cloud-migrationcenter==0.3.0"
```

PyPI for `0.3.0` lists Python `>=3.7`.

## Authentication And Setup

1. Enable the Migration Center API for the Google Cloud project.
2. Activate Migration Center for the project and pick the location you will use.
3. Use Application Default Credentials (ADC) for local development and deployed workloads.
4. Set the project ID and location explicitly when your environment does not already provide them.

Local ADC setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## Initialize A Client

```python
import os

from google.cloud import migrationcenter_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.environ["GOOGLE_CLOUD_LOCATION"]
PARENT = f"projects/{PROJECT_ID}/locations/{LOCATION}"

client = migrationcenter_v1.MigrationCenterClient()
```

The generated client reference notes that some Google APIs support regional endpoints through `client_options`. For Migration Center, the resource name you pass in `parent` or `name` is the main location control you need in normal code.

## Core Workflows

### List assets

```python
import os

from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()
parent = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}/locations/{os.environ['GOOGLE_CLOUD_LOCATION']}"

pager = client.list_assets(
    request={
        "parent": parent,
        "page_size": 100,
    }
)

for asset in pager:
    print(asset.name)
```

`list_assets()` returns a pager. Iterate over it directly unless you have a reason to manage page tokens yourself.

### Get one asset

```python
from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()

asset = client.get_asset(
    request={
        "name": "projects/your-project-id/locations/us-central1/assets/1234567890",
    }
)

print(asset.name)
print(asset.display_name)
```

### Create a group and add assets to it

Groups are lightweight containers in Migration Center. The REST resource only exposes server-managed fields, so creating a group uses an empty `group` body plus your chosen `group_id`.

```python
import os

from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()
parent = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}/locations/{os.environ['GOOGLE_CLOUD_LOCATION']}"

create_operation = client.create_group(
    request={
        "parent": parent,
        "group_id": "wave-1",
        "group": migrationcenter_v1.Group(),
    }
)
group = create_operation.result()

add_operation = client.add_assets_to_group(
    request={
        "group": group.name,
        "assets": [
            "projects/your-project-id/locations/us-central1/assets/1234567890",
            "projects/your-project-id/locations/us-central1/assets/9876543210",
        ],
    }
)
add_operation.result()
```

Remove assets later with the symmetric call:

```python
client.remove_assets_from_group(
    request={
        "group": "projects/your-project-id/locations/us-central1/groups/wave-1",
        "assets": [
            "projects/your-project-id/locations/us-central1/assets/1234567890",
        ],
    }
).result()
```

### Create an upload source and import job

An import job points at a source. For file-based imports, create a source with `SOURCE_TYPE_UPLOAD` first.

```python
import os

from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()
parent = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}/locations/{os.environ['GOOGLE_CLOUD_LOCATION']}"

source_operation = client.create_source(
    request={
        "parent": parent,
        "source_id": "rvtools-upload",
        "source": migrationcenter_v1.Source(
            type_=migrationcenter_v1.Source.SourceType.SOURCE_TYPE_UPLOAD
        ),
    }
)
source = source_operation.result()

job_operation = client.create_import_job(
    request={
        "parent": parent,
        "import_job_id": "rvtools-import-001",
        "import_job": migrationcenter_v1.ImportJob(
            display_name="rvtools-import-001",
            asset_source=source.name,
        ),
    }
)
import_job = job_operation.result()
```

### Create an import data file

Use `create_import_data_file()` to ask Migration Center for a signed upload target. The official type reference documents the signed URI, the required headers, and the expiration time.

```python
from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()

data_file = client.create_import_data_file(
    request={
        "parent": "projects/your-project-id/locations/us-central1/importJobs/rvtools-import-001",
        "import_data_file": {
            "display_name": "rvtools.xlsx",
            "format": migrationcenter_v1.ImportJobFormat.IMPORT_JOB_FORMAT_RVTOOLS_XLSX,
        },
    }
)

print(data_file.name)
print(data_file.upload_file_info.signed_uri)
print(dict(data_file.upload_file_info.headers))
```

Inference from the official `UploadFileInfo` reference: the Python client stops after it gives you the signed upload URL and headers, so the file transfer itself is a normal HTTPS upload outside this SDK.

```python
from pathlib import Path

import requests

payload = Path("rvtools.xlsx").read_bytes()

response = requests.put(
    data_file.upload_file_info.signed_uri,
    data=payload,
    headers=dict(data_file.upload_file_info.headers),
    timeout=300,
)
response.raise_for_status()
```

### Validate and run an import job

```python
from google.cloud import migrationcenter_v1

client = migrationcenter_v1.MigrationCenterClient()
name = "projects/your-project-id/locations/us-central1/importJobs/rvtools-import-001"

client.validate_import_job(request={"name": name}).result()
client.run_import_job(request={"name": name}).result()
```

Both methods return long-running operations. Wait for `.result()` before you assume the request completed successfully.

## Configuration Notes

- Migration Center uses location-qualified resource names everywhere: `projects/{project}/locations/{location}/...`.
- The product setup flow requires you to choose a Migration Center location up front. The product docs say you cannot change it later for that project.
- Use ADC for routine code. Avoid inventing API-key authentication or passing raw bearer tokens into generated clients.
- `create_group()`, `create_source()`, `create_import_job()`, `add_assets_to_group()`, `remove_assets_from_group()`, `validate_import_job()`, and `run_import_job()` are long-running operations.

## Common Pitfalls

- Do not omit the location in resource names. `projects/{project}/assets/...` is wrong for this API.
- Do not assume groups carry custom metadata. In the REST reference, `Group` only exposes server-managed fields such as `name`, `createTime`, and `updateTime`.
- Do not assume the SDK uploads import files for you. `create_import_data_file()` only returns `upload_file_info`; your code still needs to upload the file bytes to the signed URI.
- Keep `group_id`, `source_id`, and `import_job_id` RFC 1034 compatible: lowercase letters, digits, and hyphens, starting with a letter and ending with a letter or digit.
- Use the supported import format enum that matches your file. The REST reference lists `RVTOOLS_XLSX`, `RISC_XLSX`, and `STRATOZONE_CSV`.

## Version Notes

- This guide is pinned to `google-cloud-migrationcenter==0.3.0`.
- The hosted Python reference is published under a `latest` path, so verify the package version if your project depends on behavior added after `0.3.0`.
- The package is still in the `0.x` series, so treat minor-version upgrades as potentially meaningful changes instead of assuming strict long-term stability.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-migrationcenter/0.3.0/
- Maintainer package directory: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-migrationcenter
- Python client reference: https://docs.cloud.google.com/python/docs/reference/migrationcenter/latest/google.cloud.migrationcenter_v1.services.migration_center.MigrationCenterClient
- Get started with Migration Center: https://cloud.google.com/migration-center/docs/get-started
- Group REST resource and create method: https://cloud.google.com/migration-center/docs/reference/rest/v1/projects.locations.groups/create
- Source REST resource and create method: https://cloud.google.com/migration-center/docs/reference/rest/v1/projects.locations.sources/create
- Import job REST resource and create method: https://cloud.google.com/migration-center/docs/reference/rest/v1/projects.locations.importJobs/create
- Import data file REST resource and create method: https://cloud.google.com/migration-center/docs/reference/rest/v1/projects.locations.importJobs.importDataFiles/create
