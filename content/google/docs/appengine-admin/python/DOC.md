---
name: appengine-admin
description: "Google Cloud App Engine Admin Python client for managing applications, services, versions, traffic splits, and deployments"
metadata:
  languages: "python"
  versions: "1.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,app-engine,appengine,google-cloud,deployment,traffic-splitting,python"
---

# Google Cloud App Engine Admin Python Client

## What This Package Is For

`google-cloud-appengine-admin` is the generated control-plane client for App Engine Admin API operations in Python.

Use it when your code needs to:

- inspect the App Engine application attached to a project
- list services and versions
- deploy a new version from a Cloud Storage artifact
- change service traffic splitting
- manage other admin resources exposed by the App Engine Admin API

This package manages App Engine resources. It does not replace the runtime behavior of the app you deploy.

The main import surface is:

```python
from google.cloud import appengine_admin_v1
```

## Install

Pin the version you want to reason about:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-appengine-admin==1.16.0"
```

Common alternatives:

```bash
uv add "google-cloud-appengine-admin==1.16.0"
poetry add "google-cloud-appengine-admin==1.16.0"
```

## Authentication And Setup

Use Google Cloud Application Default Credentials (ADC).

Local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Service account credentials when you need them explicitly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

App Engine resource names are project-scoped. The patterns you will use most often are:

- application: `apps/{project_id}`
- service: `apps/{project_id}/services/{service_id}`
- version parent: `apps/{project_id}/services/{service_id}`
- version: `apps/{project_id}/services/{service_id}/versions/{version_id}`

## Initialize Clients

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"

applications_client = appengine_admin_v1.ApplicationsClient()
services_client = appengine_admin_v1.ServicesClient()
versions_client = appengine_admin_v1.VersionsClient()
```

Create the App Engine application once if the project does not already have one:

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
applications_client = appengine_admin_v1.ApplicationsClient()

operation = applications_client.create_application(
    request=appengine_admin_v1.CreateApplicationRequest(
        application=appengine_admin_v1.Application(
            id=project_id,
            location_id="us-central",
        )
    )
)

application = operation.result()
print(application.name)
```

Important:

- `location_id` is the App Engine location for the application.
- The App Engine Admin REST docs state that the location choice cannot be changed later.

## Inspect The Current Application

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"

applications_client = appengine_admin_v1.ApplicationsClient()
application = applications_client.get_application(name=app_name)

print(application.name)
print(application.location_id)
print(application.default_hostname)
print(application.serving_status)
```

`default_hostname` is useful when you need the project's default `*.appspot.com` hostname.

## List Services And Versions

List services:

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"

services_client = appengine_admin_v1.ServicesClient()

for service in services_client.list_services(parent=app_name):
    print(service.name)
    if service.split.allocations:
        print(dict(service.split.allocations))
```

List versions for a service:

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"
service_name = f"{app_name}/services/default"
versions_client = appengine_admin_v1.VersionsClient()

for version in versions_client.list_versions(parent=service_name):
    print(version.name, version.id, version.serving_status)
```

Fetch one version:

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"
version_name = f"{app_name}/services/default/versions/v20260313"
versions_client = appengine_admin_v1.VersionsClient()

version = versions_client.get_version(name=version_name)
print(version.name)
print(version.serving_status)
```

## Deploy A Version From Cloud Storage

`create_version()` is a long-running operation. Wait for `.result()` before assuming the version is ready.

The App Engine types expose `Deployment.zip.source_url`, and the REST docs describe that source as a Cloud Storage URL for a zip file.

```python
import os

from google.cloud import appengine_admin_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"
service_name = f"{app_name}/services/default"
versions_client = appengine_admin_v1.VersionsClient()

operation = versions_client.create_version(
    request=appengine_admin_v1.CreateVersionRequest(
        parent=service_name,
        version=appengine_admin_v1.Version(
            id="v20260313",
            deployment=appengine_admin_v1.Deployment(
                zip=appengine_admin_v1.ZipInfo(
                    source_url="https://storage.googleapis.com/my-app-deploys/app-v20260313.zip"
                )
            ),
        ),
    )
)

created = operation.result()
print(created.name)
```

Use this pattern when your deployment artifact is already staged in Cloud Storage and you want Python code to drive the admin API directly.

## Split Traffic Between Versions

Updating a service is also a long-running operation. Patch only the `split` field so the request stays narrow and predictable.

```python
import os

from google.cloud import appengine_admin_v1
from google.protobuf import field_mask_pb2

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
app_name = f"apps/{project_id}"
service_name = f"{app_name}/services/default"
services_client = appengine_admin_v1.ServicesClient()

operation = services_client.update_service(
    request=appengine_admin_v1.UpdateServiceRequest(
        name=service_name,
        service=appengine_admin_v1.Service(
            name=service_name,
            split=appengine_admin_v1.TrafficSplit(
                shard_by=appengine_admin_v1.TrafficSplit.ShardBy.IP,
                allocations={
                    "v20260301": 0.9,
                    "v20260313": 0.1,
                },
            ),
        ),
        update_mask=field_mask_pb2.FieldMask(paths=["split"]),
        migrate_traffic=False,
    )
)

updated = operation.result()
print(dict(updated.split.allocations))
```

Practical guidance:

- `allocations` is a mapping of version id to traffic fraction.
- `shard_by` controls how requests are split. The generated types expose values such as `IP`.
- If you use `migrate_traffic=True`, treat that as a deliberate deployment action and wait for the operation to finish.

## Common Pitfalls

- This is an admin client, not a local deployment tool. It manages App Engine resources after you authenticate and provide the right resource names.
- The package documentation is hosted under `latest` generated reference pages, while your project may be pinned to `1.16.0`. Keep your lockfile authoritative when debugging behavior differences.
- Create and update calls often return long-running operations. Call `.result()` before reading follow-up state.
- Application, service, and version names are full resource names, not bare ids. Build strings like `apps/{project}/services/{service}` explicitly.
- The application location is a one-time choice. Do not automate `create_application()` casually in shared projects.
- `create_version()` expects a deployment definition. The verified source shape in the upstream types is a `Deployment` with fields such as `zip.source_url`; do not assume the client uploads a local directory for you.

## Version-Sensitive Notes

- This guide is pinned to PyPI package version `1.16.0`.
- The official Python reference for this library is published as `latest` rather than a version-pinned `1.16.0` tree, so new generated methods or fields can appear in the hosted docs before your application upgrades.

## Official Sources

- PyPI: `https://pypi.org/project/google-cloud-appengine-admin/`
- Package docs root: `https://docs.cloud.google.com/python/docs/reference/appengine/latest`
- `ApplicationsClient`: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.services.applications.ApplicationsClient`
- `ServicesClient`: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.services.services.ServicesClient`
- `VersionsClient`: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.services.versions.VersionsClient`
- `Application` type: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.types.Application`
- `Version` type: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.types.Version`
- `Deployment` type: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.types.Deployment`
- `ZipInfo` type: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.types.ZipInfo`
- `TrafficSplit` type: `https://docs.cloud.google.com/python/docs/reference/appengine/latest/google.cloud.appengine_admin_v1.types.TrafficSplit`
- App Engine Admin REST `apps.create`: `https://cloud.google.com/appengine/docs/admin-api/reference/rest/v1/apps`
- App Engine Admin REST `apps.services.patch`: `https://cloud.google.com/appengine/docs/admin-api/reference/rest/v1/apps.services`
- ADC setup: `https://cloud.google.com/docs/authentication/application-default-credentials`
