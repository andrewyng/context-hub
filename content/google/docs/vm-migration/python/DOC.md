---
name: vm-migration
description: "Google Cloud VM Migration Python client for target projects, sources, migrating VMs, and clone or cutover jobs"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,gcp,vm-migration,migrate-to-virtual-machines,compute,python"
---

# Google Cloud VM Migration Python Client

## Golden Rule

Use the official `google-cloud-vm-migration` package with `from google.cloud import vmmigration_v1`, and authenticate with Application Default Credentials (ADC).

This API is location-scoped and follows the Migrate to Virtual Machines lifecycle: configure the host project and source, onboard a VM, replicate it, then create clone or cutover jobs and finalize the migration. The Python client is not a shortcut around product setup such as enabling services, installing a Migrate Connector for VMware or VMware Engine, or configuring target details for the VM you plan to migrate.

## Install

```bash
python -m pip install "google-cloud-vm-migration==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-vm-migration==1.15.0"
poetry add "google-cloud-vm-migration==1.15.0"
```

The official package page for `1.15.0` lists Python `>=3.7`.

## Authentication And Setup

Before you use the client:

- choose a host project for Migrate to Virtual Machines
- enable the required services on that host project: `vmmigration.googleapis.com`, `servicemanagement.googleapis.com`, `servicecontrol.googleapis.com`, `iam.googleapis.com`, `cloudresourcemanager.googleapis.com`, and `compute.googleapis.com`
- grant an IAM role that matches the work: `roles/vmmigration.viewer` for read-only access or `roles/vmmigration.admin` for migration operations
- prepare at least one migration source
- if you are migrating from VMware or VMware Engine, install a Migrate Connector in each Google Cloud region you plan to use

Local ADC setup:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-host-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
export VM_MIGRATION_SOURCE_ID="my-source"
export VM_MIGRATING_VM_ID="my-source-vm"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-host-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

Optional SDK logging:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE="google.cloud.vmmigration_v1"
```

## Initialize A Client

```python
import os

from google.cloud import vmmigration_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.environ["GOOGLE_CLOUD_LOCATION"]
SOURCE_ID = os.environ["VM_MIGRATION_SOURCE_ID"]
MIGRATING_VM_ID = os.environ["VM_MIGRATING_VM_ID"]

client = vmmigration_v1.VmMigrationClient()

parent = client.common_location_path(PROJECT_ID, LOCATION)
source_name = client.source_path(PROJECT_ID, LOCATION, SOURCE_ID)
migrating_vm_name = client.migrating_vm_path(
    PROJECT_ID,
    LOCATION,
    SOURCE_ID,
    MIGRATING_VM_ID,
)
```

Use the path helpers instead of hard-coding resource names. Most methods expect one of these location-scoped names.

## Core Workflows

### List or add target projects

Use target projects when the migrated Compute Engine VM should land somewhere other than the host project.

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
parent = client.common_location_path("your-host-project", "us-central1")

for target in client.list_target_projects(request={"parent": parent}):
    print(target.name, target.project)
```

Create one:

```python
import uuid

from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
parent = client.common_location_path("your-host-project", "us-central1")

operation = client.create_target_project(
    request={
        "parent": parent,
        "target_project_id": "prod-target",
        "target_project": vmmigration_v1.TargetProject(
            project="my-compute-project",
            description="Primary Compute Engine target project",
        ),
        "request_id": str(uuid.uuid4()),
    }
)

target = operation.result()
print(target.name)
print(target.project)
```

### List sources and inspect one source

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
parent = client.common_location_path("your-host-project", "us-central1")

for source in client.list_sources(request={"parent": parent, "page_size": 50}):
    print(source.name)
```

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
source_name = client.source_path("your-host-project", "us-central1", "my-source")

source = client.get_source(request={"name": source_name})
print(source.name)
print(source.description)
```

### List migrating VMs under a source

`list_migrating_vms()` is scoped to a source, not directly to the location.

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
source_name = client.source_path("your-host-project", "us-central1", "my-source")

for vm in client.list_migrating_vms(
    request={
        "parent": source_name,
        "view": vmmigration_v1.MigratingVmView.MIGRATING_VM_VIEW_BASIC,
    }
):
    print(vm.name, vm.state)
```

Fetch one VM with the fuller view:

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
migrating_vm_name = client.migrating_vm_path(
    "your-host-project",
    "us-central1",
    "my-source",
    "my-source-vm",
)

vm = client.get_migrating_vm(
    request={
        "name": migrating_vm_name,
        "view": vmmigration_v1.MigratingVmView.MIGRATING_VM_VIEW_FULL,
    }
)

print(vm.name)
print(vm.state)
```

### Start, pause, or resume replication

These methods act on an existing migrating VM resource.

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
migrating_vm_name = client.migrating_vm_path(
    "your-host-project",
    "us-central1",
    "my-source",
    "my-source-vm",
)

client.start_migration(request={"name": migrating_vm_name})
client.pause_migration(request={"name": migrating_vm_name})
client.resume_migration(request={"name": migrating_vm_name})
```

The product docs say replication runs every two hours by default unless you change the replication policy in the migration target details.

### Create a clone job

Clone jobs are the usual test phase before cutover. Wait for the long-running operation to finish.

```python
import uuid

from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
migrating_vm_name = client.migrating_vm_path(
    "your-host-project",
    "us-central1",
    "my-source",
    "my-source-vm",
)

operation = client.create_clone_job(
    request={
        "parent": migrating_vm_name,
        "clone_job_id": "test-clone-001",
        "clone_job": vmmigration_v1.CloneJob(),
        "request_id": str(uuid.uuid4()),
    }
)

clone_job = operation.result()
print(clone_job.name)
```

List prior clone jobs:

```python
for clone_job in client.list_clone_jobs(request={"parent": migrating_vm_name}):
    print(clone_job.name, clone_job.state)
```

### Create a cutover job and then finalize

Use cutover only when you are ready to stop the source VM and perform the final sync.

```python
import uuid

from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
migrating_vm_name = client.migrating_vm_path(
    "your-host-project",
    "us-central1",
    "my-source",
    "my-source-vm",
)

operation = client.create_cutover_job(
    request={
        "parent": migrating_vm_name,
        "cutover_job_id": "cutover-001",
        "cutover_job": vmmigration_v1.CutoverJob(),
        "request_id": str(uuid.uuid4()),
    }
)

cutover_job = operation.result()
print(cutover_job.name)
```

After the VM reaches cutover state, finalize the migration:

```python
from google.cloud import vmmigration_v1

client = vmmigration_v1.VmMigrationClient()
migrating_vm_name = client.migrating_vm_path(
    "your-host-project",
    "us-central1",
    "my-source",
    "my-source-vm",
)

client.finalize_migration(request={"name": migrating_vm_name})
```

## Common Pitfalls

- The package name is `google-cloud-vm-migration`, but the import path is `from google.cloud import vmmigration_v1`.
- Resources are region-scoped. Use the same location that you used when you prepared the source and, for VMware-based sources, the connector.
- If you migrate VMware or VMware Engine workloads to multiple regions, Google requires a separate Migrate Connector per region.
- Clone and cutover jobs depend on target details already being configured for the migrating VM. If target project, zone, machine settings, or licensing are still incomplete, the job can fail even though the API call itself is correct.
- Mutating calls such as `create_target_project()`, `create_clone_job()`, and `create_cutover_job()` return long-running operations. Call `.result()` before assuming the change is complete.
- Use `request_id` on mutating calls so retries stay idempotent.
- The product docs cap in-progress migrations at 200 per host project and region, excluding migrations already in finalize.
- Finalize deletes replication data and other migration resources, but it does not delete Compute Engine instances or test-clone resources you already created.

## Version-Sensitive Notes

- PyPI lists `google-cloud-vm-migration 1.15.0` released on January 15, 2026.
- As of March 13, 2026, Google Cloud's `latest` Python reference pages for this library still show mixed generated page versions such as `1.14.0`, `1.13.0`, and `1.12.x`. The v1 surface used above is still the current maintainer reference, but expect page headers in the docs to lag the package release.

## Official Sources

- Python client library overview: https://cloud.google.com/python/docs/reference/vmmigration/latest
- `VmMigrationClient` reference: https://docs.cloud.google.com/python/docs/reference/vmmigration/latest/google.cloud.vmmigration_v1.services.vm_migration.VmMigrationClient
- Target project types: https://cloud.google.com/python/docs/reference/vmmigration/latest/google.cloud.vmmigration_v1.types.TargetProject
- Enable services and IAM roles: https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/get-started/enable-services
- VMware source and per-region connector guidance: https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/create-a-vmware-source
- Migration lifecycle, replication interval, clone, cutover, and finalize behavior: https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migrating-vms
- Finalize behavior reference: https://cloud.google.com/migrate/virtual-machines/docs/5.0/discover/lifecycle
- PyPI package and release history: https://pypi.org/project/google-cloud-vm-migration/
