---
name: rapidmigrationassessment
description: "Google Cloud Rapid Migration Assessment Python client for collector lifecycle management and project annotations"
metadata:
  languages: "python"
  versions: "0.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,rapidmigrationassessment,migration,collector,python"
---

# Google Cloud Rapid Migration Assessment Python Client

## Golden Rule

Use the official `google-cloud-rapidmigrationassessment` package with `from google.cloud import rapidmigrationassessment_v1`, and authenticate with Google Cloud Application Default Credentials (ADC).

This client manages Rapid Migration Assessment control-plane resources such as collectors and annotations. It does not replace the product-side workflow for deploying and running the actual discovery client.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-rapidmigrationassessment==0.3.0"
```

Common alternatives:

```bash
uv add "google-cloud-rapidmigrationassessment==0.3.0"
poetry add "google-cloud-rapidmigrationassessment==0.3.0"
```

PyPI for `0.3.0` lists Python `>=3.7`.

## Authentication And Setup

Before you call the API:

1. Enable Migration Center and the Rapid Migration Assessment API for the target Google Cloud project.
2. Choose the Google Cloud location where the Migration Center data lives.
3. Use ADC for local development, CI, and deployed workloads.

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

The product IAM docs list Rapid Migration Assessment roles such as `roles/rma.admin`, `roles/rma.runner`, and `roles/rma.viewer`. For setup and collector management, the broader Migration Center roles and prerequisite permissions in the product docs still matter.

## Initialize A Client

```python
import os

from google.cloud import rapidmigrationassessment_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.environ["GOOGLE_CLOUD_LOCATION"]
PARENT = f"projects/{PROJECT_ID}/locations/{LOCATION}"

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()
```

Use fully qualified resource names throughout the API:

- Parent: `projects/{project}/locations/{location}`
- Collector: `projects/{project}/locations/{location}/collectors/{collector}`
- Annotation: `projects/{project}/locations/{location}/annotations/{annotation}`

## Common Workflows

### List collectors

```python
import os

from google.cloud import rapidmigrationassessment_v1

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()
parent = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}/locations/{os.environ['GOOGLE_CLOUD_LOCATION']}"

pager = client.list_collectors(
    request={
        "parent": parent,
        "page_size": 50,
    }
)

for collector in pager:
    print(collector.name, collector.state.name)
```

`list_collectors()` returns a pager. Iterate over it directly unless you need manual page-token handling.

### Create a collector

`create_collector()` is a long-running operation. Wait for `.result()` before assuming the collector exists.

```python
import os
import uuid

from google.cloud import rapidmigrationassessment_v1

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()
parent = f"projects/{os.environ['GOOGLE_CLOUD_PROJECT']}/locations/{os.environ['GOOGLE_CLOUD_LOCATION']}"

operation = client.create_collector(
    request={
        "parent": parent,
        "collector_id": "rma-collector-01",
        "collector": rapidmigrationassessment_v1.Collector(
            display_name="rma-collector-01",
            description="Primary VMware assessment collector",
            expected_asset_count=250,
            collection_days=14,
            labels={"env": "prod", "wave": "1"},
        ),
        "request_id": str(uuid.uuid4()),
    }
)

collector = operation.result()

print(collector.name)
print(collector.state.name)
print(collector.service_account)
print(collector.eula_uri)
```

Practical note: the REST resource marks fields such as `guest_os_scan`, `vsphere_scan`, `bucket`, `client_version`, and `state` as output only. Do not try to send those in your create body.

### Get one collector

```python
from google.cloud import rapidmigrationassessment_v1

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()

collector = client.get_collector(
    request={
        "name": "projects/your-project-id/locations/us-central1/collectors/rma-collector-01",
    }
)

print(collector.name)
print(collector.display_name)
print(collector.state.name)
```

### Register, pause, and resume a collector

These lifecycle methods return long-running operations.

```python
import uuid

from google.cloud import rapidmigrationassessment_v1

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()
name = "projects/your-project-id/locations/us-central1/collectors/rma-collector-01"

client.register_collector(
    request={
        "name": name,
        "request_id": str(uuid.uuid4()),
    }
).result()

client.pause_collector(
    request={
        "name": name,
        "request_id": str(uuid.uuid4()),
    }
).result()

client.resume_collector(
    request={
        "name": name,
        "request_id": str(uuid.uuid4()),
    }
).result()
```

Use a fresh UUID `request_id` on mutating requests when you want retry-safe deduplication.

### Update mutable collector fields

Use `update_mask` so the API only changes the fields you intend to change.

```python
import uuid

from google.cloud import rapidmigrationassessment_v1
from google.protobuf import field_mask_pb2

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()

collector = rapidmigrationassessment_v1.Collector(
    name="projects/your-project-id/locations/us-central1/collectors/rma-collector-01",
    display_name="rma-collector-prod",
    description="Collector for the production VMware estate",
    labels={"env": "prod", "owner": "platform"},
    collection_days=21,
)

operation = client.update_collector(
    request={
        "collector": collector,
        "update_mask": field_mask_pb2.FieldMask(
            paths=["display_name", "description", "labels", "collection_days"]
        ),
        "request_id": str(uuid.uuid4()),
    }
)

updated = operation.result()
print(updated.display_name)
print(updated.collection_days)
```

### Delete a collector

```python
import uuid

from google.cloud import rapidmigrationassessment_v1

client = rapidmigrationassessment_v1.RapidMigrationAssessmentClient()

client.delete_collector(
    request={
        "name": "projects/your-project-id/locations/us-central1/collectors/rma-collector-01",
        "request_id": str(uuid.uuid4()),
    }
).result()
```

## Configuration Notes And Pitfalls

- Resource names are location-scoped. If `parent` or `name` points at the wrong location, the API will not find your collectors.
- Mutating methods such as `create_collector()`, `register_collector()`, `pause_collector()`, `resume_collector()`, `update_collector()`, and `delete_collector()` return long-running operations. Call `.result()` before you depend on the side effect.
- Use `update_mask` on updates. Sending a partial `Collector` without a mask is not the safe default.
- Generated Google Cloud Python clients can emit structured logging if you set `GOOGLE_SDK_PYTHON_LOGGING_SCOPE`, for example `google`. Treat that as opt-in because logs can still include operational metadata.
- As of 2026-03-13, PyPI lists `google-cloud-rapidmigrationassessment 0.3.0`, while the public Google Cloud Python reference pages visible for this library are labeled with older generated doc versions. Pin the package version you install instead of assuming the reference page label matches PyPI.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-rapidmigrationassessment/
- Python client reference root: https://cloud.google.com/python/docs/reference/rapidmigrationassessment/latest
- `RapidMigrationAssessmentClient` reference: https://cloud.google.com/python/docs/reference/rapidmigrationassessment/latest/google.cloud.rapidmigrationassessment_v1.services.rapid_migration_assessment.RapidMigrationAssessmentClient
- `Collector` type reference: https://cloud.google.com/python/docs/reference/rapidmigrationassessment/latest/google.cloud.rapidmigrationassessment_v1.types.Collector
- Product IAM and permissions: https://cloud.google.com/migration-center/docs/rapidmigrationassessment/iam-permissions
- REST collector resource: https://cloud.google.com/migration-center/docs/rapidmigrationassessment/reference/rest/v1/projects.locations.collectors
- REST create collector method: https://cloud.google.com/migration-center/docs/rapidmigrationassessment/reference/rest/v1/projects.locations.collectors/create
- REST annotations resource: https://cloud.google.com/migration-center/docs/rapidmigrationassessment/reference/rest/v1/projects.locations.annotations
- Changelog: https://cloud.google.com/python/docs/reference/rapidmigrationassessment/latest/changelog
