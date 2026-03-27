---
name: filestore
description: "google-cloud-filestore package guide for Python with ADC setup, instance administration, backups, and restore operations"
metadata:
  languages: "python"
  versions: "1.15.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,filestore,gcp,nfs,storage,python,admin"
---

# google-cloud-filestore Python Package Guide

`google-cloud-filestore` is the official Google Cloud Python client for the Filestore control plane.

Use it to create, inspect, back up, restore, and delete Filestore resources. Do not use it for file I/O against the mounted NFS share itself.

Primary import:

```python
from google.cloud import filestore_v1
```

## Golden Rule

- Use `google-cloud-filestore` for Filestore administration.
- Use Application Default Credentials (ADC) for normal authentication.
- Treat create, delete, backup, and restore calls as long-running operations.
- Use the generated resource-name helpers such as `instance_path()` and `backup_path()` instead of concatenating `projects/...` strings by hand.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-filestore==1.15.0"
```

Common alternatives:

```bash
uv add "google-cloud-filestore==1.15.0"
poetry add "google-cloud-filestore==1.15.0"
```

PyPI currently lists Python `>=3.7` for this package.

## Authentication And Setup

Enable the Filestore API and set up ADC before creating a client:

```bash
gcloud services enable file.googleapis.com
gcloud auth application-default login
gcloud config set project MY_PROJECT_ID
```

If you must use a service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="MY_PROJECT_ID"
```

For production on Google Cloud, prefer attached service accounts or workload identity over shipping key files with your app.

## Initialize The Client

Default client with ADC:

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
```

Explicit credentials object:

```python
from google.cloud import filestore_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = filestore_v1.CloudFilestoreManagerClient(credentials=credentials)
```

Useful resource helpers:

```python
project_id = "my-project"
zone = "us-central1-b"
instance_id = "filestore-dev"

instance_name = client.instance_path(project_id, zone, instance_id)
backup_name = client.backup_path(project_id, "us-central1", "filestore-dev-backup")
```

## Core Workflow

### List instances

`list_instances()` returns a pager:

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
parent = "projects/my-project/locations/us-central1-b"

for instance in client.list_instances(request={"parent": parent}):
    print(instance.name)
    print(instance.tier.name)
    print(instance.state.name)
```

### Get one instance

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
name = client.instance_path("my-project", "us-central1-b", "filestore-dev")

instance = client.get_instance(request={"name": name})

print(instance.name)
print(instance.description)
print(instance.file_shares)
print(instance.networks)
print(instance.state.name)
```

### Create an instance

Creating an instance requires a service tier, at least one file share, and at least one network config. `capacity_gb` must be at least `1024`.

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
project_id = "my-project"
zone = "us-central1-b"

instance = filestore_v1.Instance(
    tier=filestore_v1.Instance.Tier.BASIC_HDD,
    description="Development Filestore instance",
    file_shares=[
        filestore_v1.FileShareConfig(
            name="vol1",
            capacity_gb=1024,
        )
    ],
    networks=[
        filestore_v1.NetworkConfig(
            network="default",
            modes=[filestore_v1.NetworkConfig.AddressMode.MODE_IPV4],
        )
    ],
)

operation = client.create_instance(
    request={
        "parent": f"projects/{project_id}/locations/{zone}",
        "instance_id": "filestore-dev",
        "instance": instance,
    }
)

created = operation.result(timeout=1800)
print(created.name)
print(created.state.name)
```

The `network` field accepts either the bare VPC network name such as `default` or the full path `projects/{project_number}/global/networks/{network}`.

### Create a backup

Backups are separate resources. The backup request points at the source instance and the file share name to capture.

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
project_id = "my-project"
instance_zone = "us-central1-b"
backup_location = "us-central1"

source_instance = client.instance_path(project_id, instance_zone, "filestore-dev")

backup = filestore_v1.Backup(
    source_instance=source_instance,
    source_file_share="vol1",
    description="Nightly backup",
)

operation = client.create_backup(
    request={
        "parent": f"projects/{project_id}/locations/{backup_location}",
        "backup_id": "filestore-dev-backup",
        "backup": backup,
    }
)

created_backup = operation.result(timeout=1800)
print(created_backup.name)
print(created_backup.state.name)
```

### Restore an instance from a backup

`restore_instance()` restores one file share on an existing instance from a backup resource.

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()

instance_name = client.instance_path("my-project", "us-central1-b", "filestore-dev")
backup_name = client.backup_path("my-project", "us-central1", "filestore-dev-backup")

operation = client.restore_instance(
    request={
        "name": instance_name,
        "file_share": "vol1",
        "source_backup": backup_name,
    }
)

restored = operation.result(timeout=1800)
print(restored.name)
print(restored.state.name)
```

### Delete an instance

Delete is also a long-running operation:

```python
from google.cloud import filestore_v1

client = filestore_v1.CloudFilestoreManagerClient()
name = client.instance_path("my-project", "us-central1-b", "filestore-dev")

operation = client.delete_instance(request={"name": name})
operation.result(timeout=1800)
```

## Common Pitfalls

- This package manages Filestore resources. It does not mount the exported NFS share or perform filesystem reads and writes for you.
- Do not assume mutating methods finish immediately. Wait for `operation.result()` before reading follow-up state.
- Do not omit `file_shares` or `networks` on create. They are required parts of the instance definition.
- `FileShareConfig.capacity_gb` has a minimum of `1024`.
- `NetworkConfig.network` is the VPC network name or full network resource path, not a subnet name.
- Use the correct location type for the resource you are creating. Instance examples commonly use zonal locations like `us-central1-b`, while backup resource names use their own `locations/{location}` path.

## Version Notes For 1.15.0

- This guide is pinned to `google-cloud-filestore==1.15.0`.
- The official changelog lists `1.15.0` on January 8, 2026.
- The generated Python reference for this package documents `CloudFilestoreManagerClient`, `Instance`, `FileShareConfig`, `NetworkConfig`, `Backup`, and `RestoreInstanceRequest`, which are the main surfaces used here.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-filestore/
- Package docs on GitHub: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-filestore
- Python reference root: https://docs.cloud.google.com/python/docs/reference/file/latest
- Client reference: https://docs.cloud.google.com/python/docs/reference/file/latest/google.cloud.filestore_v1.services.cloud_filestore_manager.CloudFilestoreManagerClient
- `FileShareConfig` reference: https://docs.cloud.google.com/python/docs/reference/file/latest/google.cloud.filestore_v1.types.FileShareConfig
- `NetworkConfig` reference: https://docs.cloud.google.com/python/docs/reference/file/latest/google.cloud.filestore_v1.types.NetworkConfig
- `Backup` reference: https://docs.cloud.google.com/python/docs/reference/file/latest/google.cloud.filestore_v1.types.Backup
- `RestoreInstanceRequest` reference: https://docs.cloud.google.com/python/docs/reference/file/latest/google.cloud.filestore_v1.types.RestoreInstanceRequest
- Filestore create-instance docs: https://cloud.google.com/filestore/docs/create-instances
- Filestore create-backup docs: https://cloud.google.com/filestore/docs/backup-restore/create-instance-backups
- Google Cloud ADC docs: https://cloud.google.com/docs/authentication/provide-credentials-adc
