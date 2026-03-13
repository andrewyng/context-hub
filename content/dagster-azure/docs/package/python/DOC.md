---
name: package
description: "Dagster Azure integrations for Python: configure Azure Blob Storage and ADLS Gen2 resources inside Dagster code"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,azure,python,blob-storage,adls2,data-orchestration"
---

# dagster-azure Python Package Guide

## Golden Rule

Install `dagster-azure` on the same Dagster release line as the rest of your Dagster packages, then use the package to give ops and assets an Azure storage client through Dagster resources. After the resource is configured, the code you write against Blob Storage or ADLS Gen2 is the normal Azure SDK client flow.

## Installation

For the package version in this guide, keep the Dagster packages aligned:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-azure==0.28.18"
```

If you already have a Dagster project and do not need the local web UI in that environment, `dagster-webserver` is optional.

## Prerequisites

These examples assume:

- You already have an Azure Storage account.
- The target Blob container or ADLS Gen2 file system already exists.
- Your Dagster process can read the storage account name and credential from environment variables.

Example environment setup:

```bash
export AZURE_STORAGE_ACCOUNT="<storage-account-name>"
export AZURE_STORAGE_KEY="<storage-account-key>"
export AZURE_STORAGE_BLOB_CONTAINER="dagster"
export AZURE_STORAGE_FILE_SYSTEM="dagster"
```

## Use Azure Blob Storage In Dagster

Use the Blob resource when you want Dagster code to read or write regular Azure blobs.

```python
import os

import dagster as dg
from dagster_azure.blob import azure_blob_storage_resource


@dg.asset(required_resource_keys={"blob"})
def upload_blob(context: dg.AssetExecutionContext) -> str:
    blob_name = "examples/hello.txt"
    blob_service_client = context.resources.blob

    blob_client = blob_service_client.get_blob_client(
        container=os.environ["AZURE_STORAGE_BLOB_CONTAINER"],
        blob=blob_name,
    )
    blob_client.upload_blob(b"hello from dagster-azure\n", overwrite=True)
    return blob_name


defs = dg.Definitions(
    assets=[upload_blob],
    resources={
        "blob": azure_blob_storage_resource.configured(
            {
                "storage_account": {"env": "AZURE_STORAGE_ACCOUNT"},
                "credential": {"env": "AZURE_STORAGE_KEY"},
            }
        )
    },
)
```

What matters in the snippet:

- `azure_blob_storage_resource` creates the Azure Blob service client for Dagster.
- `context.resources.blob` is the client you use inside the asset.
- Blob operations still use the standard Azure client API such as `get_blob_client(...)` and `upload_blob(...)`.

## Use ADLS Gen2 In Dagster

Use the ADLS2 resource when your data lives in a hierarchical namespace and you want to work with file systems and file paths instead of flat blob keys.

```python
import os

import dagster as dg
from dagster_azure.adls2 import adls2_resource


@dg.asset(required_resource_keys={"adls2"})
def write_marker_file(context: dg.AssetExecutionContext) -> str:
    path = "runs/marker.txt"
    service_client = context.resources.adls2

    file_system_client = service_client.get_file_system_client(
        file_system=os.environ["AZURE_STORAGE_FILE_SYSTEM"]
    )
    file_client = file_system_client.get_file_client(path)

    data = b"ok\n"
    file_client.create_file()
    file_client.append_data(data, offset=0, length=len(data))
    file_client.flush_data(len(data))
    return path


defs = dg.Definitions(
    assets=[write_marker_file],
    resources={
        "adls2": adls2_resource.configured(
            {
                "storage_account": {"env": "AZURE_STORAGE_ACCOUNT"},
                "credential": {"env": "AZURE_STORAGE_KEY"},
            }
        )
    },
)
```

This pattern is useful when your Dagster code needs the underlying ADLS Gen2 client directly, for example to create or append files with the Azure Data Lake API.

## How To Choose Between Blob And ADLS2

- Use `dagster_azure.blob` for standard Blob Storage containers and blob objects.
- Use `dagster_azure.adls2` when your storage account has hierarchical namespace enabled and your code needs file-system style operations.
- In both cases, Dagster handles resource construction and your asset code calls the Azure client methods.

## Important Pitfalls

- Keep `dagster`, `dagster-webserver`, and `dagster-azure` on the same release line.
- Create the Blob container or ADLS2 file system before materializing these assets.
- Treat Azure authentication failures and missing-container or missing-file-system errors as Azure client issues first; the Dagster resource wrapper does not change the underlying storage API semantics.
- Prefer environment variables or your deployment system's secret manager for storage credentials instead of hard-coding keys in source.

## Version Notes

This guide targets `dagster-azure==0.28.18`. If you upgrade Dagster to a different release line, upgrade `dagster-azure` with it and re-check the corresponding library docs before copying config between versions.
