---
name: assured-workloads
description: "Google Cloud Assured Workloads Python client for workload creation, compliance operations, and violation management"
metadata:
  languages: "python"
  versions: "2.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,gcp,assured-workloads,compliance,folders,violations,python"
---

# Google Cloud Assured Workloads Python Client

## Golden Rule

Use `google-cloud-assured-workloads` with `from google.cloud import assuredworkloads_v1`, authenticate with Application Default Credentials (ADC), and build requests with full resource names such as `organizations/123456789012/locations/us-central1`. Prefer the GA `assuredworkloads_v1` surface unless you have a verified reason to use the beta namespace.

This client is useful only after the Assured Workloads product prerequisites already exist: an organization, an allowed Assured Workloads location, the Assured Workloads API, and the IAM roles needed for the operation you are calling.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-assured-workloads==2.2.0"
```

Common alternatives:

```bash
uv add "google-cloud-assured-workloads==2.2.0"
poetry add "google-cloud-assured-workloads==2.2.0"
```

PyPI publishes `2.2.0` for Python `>=3.7`.

## Authentication And Setup

Use ADC unless you have a hard requirement to load credentials explicitly.

Local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_ORGANIZATION="123456789012"
export ASSURED_WORKLOADS_LOCATION="us-central1"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

If you manage service enablement with `gcloud`, the Assured Workloads API service name is `assuredworkloads.googleapis.com`.

Practical permission notes from the product docs:

- `roles/assuredworkloads.reader` is enough for read-only workload and violation access.
- `roles/assuredworkloads.editor` or `roles/assuredworkloads.admin` is required for changes such as restriction updates or violation acknowledgement.
- Creating workloads also commonly requires organization-level visibility such as `roles/resourcemanager.organizationViewer`.

## Initialize The Client

The generated client supports the global endpoint and regional endpoints. For location-bound workloads, prefer an endpoint that matches the workload location.

```python
import os

from google.api_core.client_options import ClientOptions
from google.cloud import assuredworkloads_v1

organization_id = os.environ["GOOGLE_CLOUD_ORGANIZATION"]
location = os.getenv("ASSURED_WORKLOADS_LOCATION", "us-central1")

client = assuredworkloads_v1.AssuredWorkloadsServiceClient(
    client_options=ClientOptions(
        api_endpoint=f"{location}-assuredworkloads.googleapis.com"
    )
)

parent = f"organizations/{organization_id}/locations/{location}"
```

If you want default ADC behavior with the global endpoint, `assuredworkloads_v1.AssuredWorkloadsServiceClient()` also works.

Explicit credentials example:

```python
from google.api_core.client_options import ClientOptions
from google.cloud import assuredworkloads_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = assuredworkloads_v1.AssuredWorkloadsServiceClient(
    credentials=credentials,
    client_options=ClientOptions(
        api_endpoint="us-central1-assuredworkloads.googleapis.com"
    ),
)
```

## Core Workflows

### List workloads in a location

```python
import os

from google.cloud import assuredworkloads_v1

organization_id = os.environ["GOOGLE_CLOUD_ORGANIZATION"]
location = os.getenv("ASSURED_WORKLOADS_LOCATION", "us-central1")

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()
parent = f"organizations/{organization_id}/locations/{location}"

for workload in client.list_workloads(parent=parent):
    print(workload.name)
    print(workload.display_name)
    print(workload.compliance_regime)
```

### Get one workload

```python
from google.cloud import assuredworkloads_v1

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()

workload_name = (
    "organizations/123456789012/locations/us-central1/workloads/WORKLOAD_ID"
)

workload = client.get_workload(name=workload_name)
print(workload.name)
print(workload.display_name)
print(workload.etag)
```

### Create a workload

`create_workload()` returns a long-running operation. Wait for `result()` before assuming the folder and related resources exist.

```python
import os

from google.cloud import assuredworkloads_v1

organization_id = os.environ["GOOGLE_CLOUD_ORGANIZATION"]
location = os.getenv("ASSURED_WORKLOADS_LOCATION", "us-central1")

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()
parent = f"organizations/{organization_id}/locations/{location}"

workload = assuredworkloads_v1.Workload(
    display_name="aw-prod-us",
    compliance_regime=assuredworkloads_v1.Workload.ComplianceRegime.US_REGIONAL_ACCESS,
    billing_account="billingAccounts/012345-567890-ABCDEF",
    labels={
        "env": "prod",
        "team": "platform",
    },
)

operation = client.create_workload(parent=parent, workload=workload)
created = operation.result(timeout=1800)

print(created.name)
print(created.resources)
```

If you need Google Cloud resources created with specific names, supply `resource_settings` on the workload:

```python
from google.cloud import assuredworkloads_v1

workload = assuredworkloads_v1.Workload(
    display_name="aw-prod-us",
    compliance_regime=assuredworkloads_v1.Workload.ComplianceRegime.US_REGIONAL_ACCESS,
    resource_settings=[
        assuredworkloads_v1.Workload.ResourceSettings(
            resource_type=assuredworkloads_v1.Workload.ResourceInfo.ResourceType.CONSUMER_FOLDER,
            display_name="aw-prod-us-folder",
        ),
        assuredworkloads_v1.Workload.ResourceSettings(
            resource_type=assuredworkloads_v1.Workload.ResourceInfo.ResourceType.ENCRYPTION_KEYS_PROJECT,
            resource_id="aw-prod-us-kms",
            display_name="aw-prod-us-kms",
        ),
    ],
)
```

For folder resources, the API docs mark `resource_id` as output only. Set `display_name` and let the service create the folder identifier.

### Update workload metadata

Use an update mask so you only change the fields you intend to patch.

```python
from google.cloud import assuredworkloads_v1
from google.protobuf.field_mask_pb2 import FieldMask

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()
workload_name = (
    "organizations/123456789012/locations/us-central1/workloads/WORKLOAD_ID"
)

workload = client.get_workload(name=workload_name)
workload.labels["cost-center"] = "sec-001"

updated = client.update_workload(
    workload=workload,
    update_mask=FieldMask(paths=["labels"]),
)

print(updated.labels)
```

Refetch the workload before updating if another system might have changed it, because the API uses `etag` for optimistic concurrency.

### List and inspect violations

```python
from google.cloud import assuredworkloads_v1

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()
workload_name = (
    "organizations/123456789012/locations/us-central1/workloads/WORKLOAD_ID"
)

for violation in client.list_violations(parent=workload_name):
    print(violation.name)
    print(violation.state)
```

Fetch one violation when you need the full remediation details:

```python
from google.cloud import assuredworkloads_v1

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()

violation_name = (
    "organizations/123456789012/locations/us-central1/"
    "workloads/WORKLOAD_ID/violations/VIOLATION_ID"
)

violation = client.get_violation(name=violation_name)
print(violation.name)
print(violation.description)

for command in violation.remediation.instructions.gcloud.gcloud_commands:
    print(command)
```

### Acknowledge a violation

Use this only after recording the remediation or risk acceptance your process requires.

```python
from google.cloud import assuredworkloads_v1

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()

violation_name = (
    "organizations/123456789012/locations/us-central1/"
    "workloads/WORKLOAD_ID/violations/VIOLATION_ID"
)

client.acknowledge_violation(
    request=assuredworkloads_v1.AcknowledgeViolationRequest(
        name=violation_name,
        comment="Reviewed by platform security on 2026-03-13",
    )
)
```

### Restrict allowed resources to compliant products

The Python client method is `restrict_allowed_resources()`. In product and REST docs, the operation is still described as restricting allowed services.

```python
from google.cloud import assuredworkloads_v1

client = assuredworkloads_v1.AssuredWorkloadsServiceClient()
workload_name = (
    "organizations/123456789012/locations/us-central1/workloads/WORKLOAD_ID"
)

client.restrict_allowed_resources(
    request=assuredworkloads_v1.RestrictAllowedResourcesRequest(
        name=workload_name,
        restriction_type=assuredworkloads_v1.RestrictAllowedResourcesRequest.RestrictionType.ALLOW_COMPLIANT_RESOURCES,
    )
)
```

To remove the restriction later, use `ALLOW_ALL_GCP_RESOURCES`.

## Important Pitfalls

- This is an organization-scoped product. Supplying only a project ID is not enough; most calls want organization, location, workload, or violation resource names.
- Do not assume the global endpoint is always the right choice. The Assured Workloads docs publish regional endpoints, and the generated Python docs note that regional endpoints may be required.
- `create_workload()` and `delete_workload()` are long-running operations. Wait for `.result()` and handle timeouts explicitly.
- `labels` is the only field the v1 client documents as filterable in `list_workloads()`. Do not assume general-purpose search syntax.
- `KMSSettings` is deprecated in the Workload type docs. Prefer `resource_settings` for keys, keyrings, folders, and related resources.
- `CONSUMER_PROJECT` in `ResourceSettings` is deprecated for create requests. Use `CONSUMER_FOLDER` and other current resource types instead.
- The package also ships `assuredworkloads_v1beta1`. Some product REST methods appear outside the GA Python v1 client surface. If you need a capability that is present in REST docs but missing from `AssuredWorkloadsServiceClient`, verify whether it is beta-only before you write wrappers around a nonexistent client method.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-assured-workloads/2.2.0/
- Python client reference root: https://cloud.google.com/python/docs/reference/assuredworkloads/latest
- `AssuredWorkloadsServiceClient` reference: https://cloud.google.com/python/docs/reference/assuredworkloads/latest/google.cloud.assuredworkloads_v1.services.assured_workloads_service.AssuredWorkloadsServiceClient
- `Workload` type reference: https://cloud.google.com/python/docs/reference/assuredworkloads/latest/google.cloud.assuredworkloads_v1.types.Workload
- `RestrictAllowedResourcesRequest` type reference: https://cloud.google.com/python/docs/reference/assuredworkloads/latest/google.cloud.assuredworkloads_v1.types.RestrictAllowedResourcesRequest
- REST reference and regional endpoints: https://cloud.google.com/assured-workloads/docs/reference/rest
- Assured Workloads roles and permissions: https://cloud.google.com/assured-workloads/docs/access-control
- Assured Workloads folders and supported products guidance: https://cloud.google.com/assured-workloads/docs/create-folder
