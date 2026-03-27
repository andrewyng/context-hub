---
name: service-control
description: "Google Cloud Service Control Python client guide for admission checks, telemetry reporting, and quota allocation"
metadata:
  languages: "python"
  versions: "1.18.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,service-control,service-infrastructure,quota,telemetry"
---

# google-cloud-service-control Python Package Guide

## Golden Rule

Use `google-cloud-service-control` when you are integrating a managed service with Google Service Infrastructure as a service producer. The main import is:

```python
from google.cloud import servicecontrol_v1
```

For most code, the package surfaces that matter are:

- `servicecontrol_v1.ServiceControllerClient` for `check(...)` and `report(...)`
- `servicecontrol_v1.QuotaControllerClient` for `allocate_quota(...)`

This package is not a general Google Cloud application SDK. It is for service producers that already have a managed service and service config in Service Management.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-service-control==1.18.0"
```

Common alternatives:

```bash
uv add "google-cloud-service-control==1.18.0"
poetry add "google-cloud-service-control==1.18.0"
```

## Authentication And Prerequisites

This library uses Application Default Credentials (ADC).

Local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-producer-project-id"
export SERVICE_NAME="example-api.endpoints.your-producer-project-id.cloud.goog"
export CONSUMER_ID="project:consumer-project-id"
```

Service account credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/abs/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-producer-project-id"
export SERVICE_NAME="example-api.endpoints.your-producer-project-id.cloud.goog"
export CONSUMER_ID="project:consumer-project-id"
```

Before these calls work, confirm:

- the producer project already owns a managed service in Service Management
- the caller has permission to call Service Control, typically `roles/servicemanagement.serviceController`
- the service config already defines the monitored resources, metrics, logs, or quota rules you reference in requests

`consumer_id` is required on operations. Common forms are:

- `project:consumer-project-id`
- `project_number:123456789012`
- another producer-supported consumer identifier from your service config

## Initialize Clients

```python
import google.auth
from google.cloud import servicecontrol_v1

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

credentials, project_id = google.auth.default(scopes=SCOPES)

service_client = servicecontrol_v1.ServiceControllerClient(credentials=credentials)
quota_client = servicecontrol_v1.QuotaControllerClient(credentials=credentials)

print(project_id)
```

If your code already uses `asyncio`, the package also exposes `ServiceControllerAsyncClient` and `QuotaControllerAsyncClient`.

## Resource Naming

The methods here expect your managed service name, not just a project ID:

```python
import os

service_name = os.environ["SERVICE_NAME"]
consumer_id = os.environ["CONSUMER_ID"]
```

Typical values:

- `SERVICE_NAME="example-api.endpoints.my-project.cloud.goog"`
- `CONSUMER_ID="project:consumer-project-id"`

When you are working with the active config, using `service_config_id="latest"` is the practical default.

## Check Before Serving A Request

Call `check(...)` before executing protected work. Service Control evaluates the operation against your managed service config and returns any admission errors in `check_errors`.

```python
import os
import uuid
from datetime import datetime, timezone

from google.cloud import servicecontrol_v1
from google.protobuf.timestamp_pb2 import Timestamp

service_name = os.environ["SERVICE_NAME"]
consumer_id = os.environ["CONSUMER_ID"]

now = Timestamp()
now.FromDatetime(datetime.now(timezone.utc))

operation_id = str(uuid.uuid4())

client = servicecontrol_v1.ServiceControllerClient()
response = client.check(
    request=servicecontrol_v1.CheckRequest(
        service_name=service_name,
        service_config_id="latest",
        operation=servicecontrol_v1.Operation(
            operation_id=operation_id,
            operation_name="google.example.library.v1.LibraryService.ListShelves",
            consumer_id=consumer_id,
            start_time=now,
            labels={
                "cloud.googleapis.com/location": "us-central1",
            },
        ),
    )
)

if response.check_errors:
    for error in response.check_errors:
        print(error.code.name, error.subject, error.detail)
    raise PermissionError("Service Control check failed")
```

Practical guidance:

- reuse the same `operation_id` later in `report(...)` for the same request
- use request objects when you need nested protobuf messages; it is easier to keep the field names correct
- `check(...)` results are intended to be cached. The product docs recommend a cache entry TTL of 60 seconds and note that policy changes can take about a minute to propagate

## Report After The Operation Finishes

Call `report(...)` after the work completes so Service Infrastructure can ingest logs and metrics for the operation. `end_time` is required on the reported operation.

```python
import os
import uuid
from datetime import datetime, timezone

from google.cloud import servicecontrol_v1
from google.protobuf.timestamp_pb2 import Timestamp

service_name = os.environ["SERVICE_NAME"]
consumer_id = os.environ["CONSUMER_ID"]

start_time = Timestamp()
start_time.FromDatetime(datetime.now(timezone.utc))

end_time = Timestamp()
end_time.FromDatetime(datetime.now(timezone.utc))

operation_id = str(uuid.uuid4())  # Generate once in your request path and reuse it in check() and report().

client = servicecontrol_v1.ServiceControllerClient()
response = client.report(
    request=servicecontrol_v1.ReportRequest(
        service_name=service_name,
        service_config_id="latest",
        operations=[
            servicecontrol_v1.Operation(
                operation_id=operation_id,
                operation_name="google.example.library.v1.LibraryService.ListShelves",
                consumer_id=consumer_id,
                start_time=start_time,
                end_time=end_time,
                labels={
                    "cloud.googleapis.com/location": "us-central1",
                },
            )
        ],
    )
)

if response.report_errors:
    for error in response.report_errors:
        print(error.operation_id, error.status.message)
```

Important limits from the Service Control docs:

- batch report calls for up to 5 seconds before sending to reduce RPC overhead
- keep each report request at or below 1 MB
- inspect `report_errors`; the RPC can succeed while individual operations still fail validation

## Allocate Quota Before Execution

Use `allocate_quota(...)` when your service config defines quota rules and the request should reserve or verify capacity before executing.

```python
import os
import uuid

from google.cloud import servicecontrol_v1

service_name = os.environ["SERVICE_NAME"]
consumer_id = os.environ["CONSUMER_ID"]

client = servicecontrol_v1.QuotaControllerClient()
response = client.allocate_quota(
    request=servicecontrol_v1.AllocateQuotaRequest(
        service_name=service_name,
        service_config_id="latest",
        allocate_operation=servicecontrol_v1.QuotaOperation(
            operation_id=str(uuid.uuid4()),
            consumer_id=consumer_id,
            method_name="google.example.library.v1.LibraryService.ListShelves",
            quota_mode=servicecontrol_v1.QuotaOperation.QuotaMode.NORMAL,
        ),
    )
)

if response.allocate_errors:
    for error in response.allocate_errors:
        print(error.code.name, error.subject, error.detail)
    raise RuntimeError("Quota allocation failed")
```

Use `QuotaMode.CHECK_ONLY` when you want to verify quota without consuming it.

## Configuration Notes

- The default endpoint for this package is `servicecontrol.googleapis.com`.
- The generated clients support per-call `retry`, `timeout`, and `metadata` arguments through Google API Core. Use them explicitly in CI jobs or request paths with hard deadlines.
- The package supports the standard Google client logging hook through `GOOGLE_SDK_PYTHON_LOGGING_SCOPE`.

Example:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google.cloud.servicecontrol_v1
```

## Common Pitfalls

- Package name and import path differ: install `google-cloud-service-control`, import `servicecontrol_v1`.
- `check(...)` is for admission control before work runs; `report(...)` is for telemetry after work completes. Do not swap them.
- `report(...)` requires `end_time` on each operation.
- `check(...)`, `report(...)`, and `allocate_quota(...)` all operate on your managed service name. A bare project ID is not enough.
- Quota allocation only makes sense if the referenced method or quota metrics exist in the deployed service config.
- Service Control has its own producer-project quota. The product quota page documents 6,000,000 quota units per minute by default, and each `check`, `report`, or `allocateQuota` call consumes one unit.
- Do not hard-code long-lived service account key files into app code. Prefer ADC on Google Cloud runtimes or a managed secret path outside the repo.

## Version-Sensitive Notes

- PyPI currently publishes `google-cloud-service-control 1.18.0`; pin that if you want reproducible generated-client behavior.
- The Python reference pages under `latest` are the right source for request and response field shapes, but Google Cloud reference pages can lag or mix generated version labels. Use PyPI for the installed package version you lock and the reference docs for API shape.
- This package is a generated client library. Minor releases commonly update generated protobuf and transport surfaces without changing the core workflow shown above.

## Official Sources

- PyPI project page: `https://pypi.org/project/google-cloud-service-control/`
- Package docs root: `https://docs.cloud.google.com/python/docs/reference/servicecontrol/latest`
- `ServiceControllerClient` reference: `https://docs.cloud.google.com/python/docs/reference/servicecontrol/latest/google.cloud.servicecontrol_v1.services.service_controller.ServiceControllerClient`
- `QuotaControllerClient` reference: `https://docs.cloud.google.com/python/docs/reference/servicecontrol/latest/google.cloud.servicecontrol_v1.services.quota_controller.QuotaControllerClient`
- Access control: `https://cloud.google.com/service-infrastructure/docs/access-control`
- Checking request status: `https://cloud.google.com/service-infrastructure/docs/checking-api-status`
- Reporting metrics: `https://cloud.google.com/service-infrastructure/docs/reporting-metrics`
- Service Control quotas: `https://cloud.google.com/service-infrastructure/docs/service-control/reference/limits`
- REST reference for `services.check`: `https://cloud.google.com/service-infrastructure/docs/service-control/reference/rest/v1/services/check`
- REST reference for `services.report`: `https://cloud.google.com/service-infrastructure/docs/service-control/reference/rest/v1/services/report`
- REST reference for `services.allocateQuota`: `https://cloud.google.com/service-infrastructure/docs/service-control/reference/rest/v1/services/allocateQuota`
- Repository package root: `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-service-control`
