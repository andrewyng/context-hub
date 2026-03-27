---
name: os-config
description: "Google Cloud OS Config Python client for VM Manager inventory, vulnerability reports, patch jobs, patch deployments, and OS policy assignments"
metadata:
  languages: "python"
  versions: "1.23.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-os-config,gcp,google-cloud,vm-manager,os-config,patching,inventory,python"
---

# google-cloud-os-config Python Package Guide

Use `google-cloud-os-config` for Python code that reads VM Manager inventory and vulnerability data, runs patch jobs, manages patch deployments, and works with OS policy assignments in Google Cloud.

## Golden Rule

- Install `google-cloud-os-config`, then import `osconfig_v1` from `google.cloud`.
- Use Application Default Credentials (ADC) or explicit service-account credentials. This library does not use API keys.
- Use the right client for the resource scope:
  - `OsConfigServiceClient` for project-level patch jobs and patch deployments
  - `OsConfigZonalServiceClient` for zonal inventory, vulnerability reports, and OS policy assignments
- Use the generated path helpers when you need full resource names.

## Install

```bash
python -m pip install "google-cloud-os-config==1.23.0"
```

## Setup And Authentication

Before using the client library:

1. Enable the OS Config API for the target project.
2. Set up VM Manager for the Compute Engine VMs you want to inspect or patch.
3. Authenticate with ADC locally or attach a service account in Google Cloud.

Local development with ADC:

```bash
gcloud services enable osconfig.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ZONE="us-central1-a"
```

Service account file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ZONE="us-central1-a"
```

## Initialize The Clients

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]

service_client = osconfig_v1.OsConfigServiceClient()
zonal_client = osconfig_v1.OsConfigZonalServiceClient()

project_parent = f"projects/{project_id}"
zone_parent = f"projects/{project_id}/locations/{zone}"
```

With explicit credentials:

```python
import os

from google.cloud import osconfig_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
)

service_client = osconfig_v1.OsConfigServiceClient(credentials=credentials)
zonal_client = osconfig_v1.OsConfigZonalServiceClient(credentials=credentials)
```

## Read VM Inventory

Inventory data is zonal. The request parent format is:

```text
projects/{project}/locations/{zone}
```

List inventory records for every VM in a zone:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]

client = osconfig_v1.OsConfigZonalServiceClient()

for inventory in client.list_inventories(
    request={"parent": f"projects/{project_id}/locations/{zone}"}
):
    print(inventory.name)
    print(inventory.os_info)
```

Fetch one inventory resource when you already know the instance segment:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]
instance = "instance-id-or-name"

client = osconfig_v1.OsConfigZonalServiceClient()
name = client.inventory_path(project_id, zone, instance)

inventory = client.get_inventory(request={"name": name})
print(inventory.name)
print(inventory.os_info)
```

## Read Vulnerability Reports

Vulnerability reports are also zonal and follow the same parent shape as inventories.

List the reports available in a zone:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]

client = osconfig_v1.OsConfigZonalServiceClient()

for report in client.list_vulnerability_reports(
    request={"parent": f"projects/{project_id}/locations/{zone}"}
):
    print(report.name)
```

Get one report by resource name:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]
instance = "instance-id-or-name"

client = osconfig_v1.OsConfigZonalServiceClient()
name = client.vulnerability_report_path(project_id, zone, instance)

report = client.get_vulnerability_report(request={"name": name})
print(report.name)
```

## Run A Patch Job

Patch jobs use the project-level service client. The request parent format is:

```text
projects/{project}
```

Start with a dry run so you can confirm the instance filter matches the VMs you expect:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]

client = osconfig_v1.OsConfigServiceClient()

patch_job = client.execute_patch_job(
    request={
        "parent": f"projects/{project_id}",
        "description": "Preview the next web patch run",
        "instance_filter": {
            "zones": [zone],
            "instance_name_prefixes": ["web-"],
        },
        "dry_run": True,
    }
)

print(patch_job.name)
print(patch_job.state)
```

Inspect the VM-level results for that job:

```python
for detail in client.list_patch_job_instance_details(
    request={"parent": patch_job.name}
):
    print(detail.name, detail.state)
```

Fetch the current job state again later:

```python
current = client.get_patch_job(request={"name": patch_job.name})
print(current.state)
```

Run a one-off patch against a specific instance resource:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]
instance_name = "vm-1"

client = osconfig_v1.OsConfigServiceClient()

patch_job = client.execute_patch_job(
    request={
        "parent": f"projects/{project_id}",
        "description": "Patch one VM now",
        "instance_filter": {
            "instances": [f"zones/{zone}/instances/{instance_name}"],
        },
    }
)

print(patch_job.name)
```

## Patch Deployments And OS Policy Assignments

The same package also exposes:

- `create_patch_deployment`, `get_patch_deployment`, `list_patch_deployments`, `pause_patch_deployment`, `resume_patch_deployment`, and `delete_patch_deployment` on `OsConfigServiceClient`
- `create_os_policy_assignment`, `update_os_policy_assignment`, `get_os_policy_assignment`, `list_os_policy_assignments`, `delete_os_policy_assignment`, and report methods on `OsConfigZonalServiceClient`

Important behavior differences:

- Patch deployments are scheduled resources. Patch jobs are immediate executions.
- OS policy assignment create, update, and delete methods return long-running operations. Wait for `operation.result()` before assuming rollout is finished.

List current OS policy assignments in a zone:

```python
import os

from google.cloud import osconfig_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
zone = os.environ["GOOGLE_CLOUD_ZONE"]

client = osconfig_v1.OsConfigZonalServiceClient()

for assignment in client.list_os_policy_assignments(
    request={"parent": f"projects/{project_id}/locations/{zone}"}
):
    print(assignment.name)
```

## Common Pitfalls

- The package name is `google-cloud-os-config`, but the import is `from google.cloud import osconfig_v1`.
- Inventory, vulnerability, and OS policy assignment methods are zonal. Patch jobs and patch deployments are project-level. Using the wrong parent format causes `InvalidArgument` or `NotFound` errors.
- Inventory and vulnerability data only exist for VMs that are set up for VM Manager / OS Config.
- Use `dry_run=True` on patch jobs first. It is the safest way to verify the instance filter before patching production VMs.
- `execute_patch_job()` returns a `PatchJob`, not a long-running operation. Re-read it with `get_patch_job()` or inspect `list_patch_job_instance_details()` for progress.
- `create_os_policy_assignment()` and `update_os_policy_assignment()` do use long-running operations. Wait on `operation.result()`.
- If your app uses multiprocessing, create client objects after `os.fork()`, not before.

## Official Sources

- PyPI: https://pypi.org/project/google-cloud-os-config/
- GitHub package directory: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-os-config
- Google Cloud Python reference root: https://cloud.google.com/python/docs/reference/osconfig/latest
- `OsConfigServiceClient` reference: https://cloud.google.com/python/docs/reference/osconfig/latest/google.cloud.osconfig_v1.services.os_config_service.OsConfigServiceClient
- `OsConfigZonalServiceClient` reference: https://cloud.google.com/python/docs/reference/osconfig/latest/google.cloud.osconfig_v1.services.os_config_zonal_service.OsConfigZonalServiceClient
- VM Manager setup: https://cloud.google.com/compute/vm-manager/docs/setup
- Patch jobs overview: https://cloud.google.com/compute/vm-manager/docs/patch
- Multiprocessing note: https://cloud.google.com/python/docs/reference/osconfig/latest/multiprocessing
