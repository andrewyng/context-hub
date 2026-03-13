---
name: package
description: "Prefect Azure integration for storing Azure Blob Storage credentials in Prefect blocks and creating Blob Storage clients inside flows"
metadata:
  languages: "python"
  versions: "0.4.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,azure,python,workflow,orchestration,blob-storage,blocks"
---

# Prefect Azure Python Package Guide

## Golden Rule

Use `prefect-azure` as a Prefect integration package for Azure-backed workflows. Keep writing flows and tasks with core `prefect`; use this package to store Azure connection details in a Prefect block and create Azure Blob Storage clients inside your flow code.

If you only need the raw Azure SDK outside Prefect orchestration, start with the Azure SDK directly.

## Install

Install the package version this guide covers:

```bash
python -m pip install "prefect-azure==0.4.9"
```

Common alternatives:

```bash
uv add prefect-azure
poetry add prefect-azure
```

If your project does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-azure
```

Sanity-check the install:

```bash
python -m pip show prefect-azure
python -c "import prefect_azure; print(prefect_azure.__file__)"
```

## Prerequisites And Environment

Before you use `prefect-azure` in a flow, make sure:

- the runtime already has access to the Azure Storage account you want to use
- the storage connection string or equivalent credential grants permission for the container and blob operations you call
- the target Blob Storage container already exists
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Example environment variables:

```bash
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
export AZURE_STORAGE_CONTAINER="prefect-artifacts"

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

There is no separate long-lived `prefect-azure` client to initialize first. A practical starting point is an `AzureBlobStorageCredentials` block.

## Initialize Azure Blob Storage Credentials

Create an `AzureBlobStorageCredentials` block from environment variables when your flow needs to authenticate to Azure Blob Storage.

```python
import os

from prefect_azure.credentials import AzureBlobStorageCredentials


azure_credentials = AzureBlobStorageCredentials(
    connection_string=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
)
```

Use this direct-instantiation pattern when credentials already come from environment variables or another secret manager and you do not need to persist a named Prefect block yet.

## Save And Reuse A Named Block

When several flows or deployments should share the same Azure connection definition, save the block in Prefect and load it by name later.

```python
import os

from prefect_azure.credentials import AzureBlobStorageCredentials


azure_credentials = AzureBlobStorageCredentials(
    connection_string=os.environ["AZURE_STORAGE_CONNECTION_STRING"],
)

azure_credentials.save("azure-blob-creds", overwrite=True)
```

Load that block later:

```python
from prefect_azure.credentials import AzureBlobStorageCredentials


azure_credentials = AzureBlobStorageCredentials.load("azure-blob-creds")
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they require a working Prefect API configuration
- direct instantiation of `AzureBlobStorageCredentials(...)` does not require Prefect Cloud or a self-hosted server

## Create A Blob Service Client And Read Or Write A Blob

The most direct workflow is to load the saved or in-memory block, turn it into a Blob Storage client, then use normal Azure Blob Storage client calls.

```python
import os

from prefect_azure.credentials import AzureBlobStorageCredentials


azure_credentials = AzureBlobStorageCredentials.load("azure-blob-creds")
blob_service_client = azure_credentials.get_client()

container_client = blob_service_client.get_container_client(
    os.environ["AZURE_STORAGE_CONTAINER"],
)

container_client.upload_blob(
    name="healthcheck.txt",
    data=b"ok\n",
    overwrite=True,
)

content = container_client.download_blob("healthcheck.txt").readall()
print(content.decode("utf-8"))
```

This pattern is a good default when you want Prefect to manage credentials and orchestration while the actual storage operations still use the normal Azure client surface.

## Use Saved Azure Credentials Inside A Flow

Load the block inside tasks or flows where the Azure client is actually needed.

```python
import os

from prefect import flow, task
from prefect_azure.credentials import AzureBlobStorageCredentials


@task
def upload_marker() -> None:
    azure_credentials = AzureBlobStorageCredentials.load("azure-blob-creds")
    blob_service_client = azure_credentials.get_client()
    container_client = blob_service_client.get_container_client(
        os.environ["AZURE_STORAGE_CONTAINER"],
    )
    container_client.upload_blob(
        name="prefect/demo.txt",
        data=b"written from Prefect\n",
        overwrite=True,
    )


@task
def read_marker() -> str:
    azure_credentials = AzureBlobStorageCredentials.load("azure-blob-creds")
    blob_service_client = azure_credentials.get_client()
    container_client = blob_service_client.get_container_client(
        os.environ["AZURE_STORAGE_CONTAINER"],
    )
    return container_client.download_blob("prefect/demo.txt").readall().decode("utf-8")


@flow(log_prints=True)
def azure_blob_demo() -> None:
    upload_marker()
    print(read_marker())


if __name__ == "__main__":
    azure_blob_demo()
```

This is usually enough for simple artifact exchange, health checks, marker files, or other blob-backed workflow state where Prefect orchestrates the workflow and Azure Blob Storage holds the data.

## Save A Reusable Container Block Definition

If several flows should refer to the same container definition, save an `AzureBlobStorageContainer` block alongside your credentials.

```python
import os

from prefect_azure.blob_storage import AzureBlobStorageContainer
from prefect_azure.credentials import AzureBlobStorageCredentials


azure_credentials = AzureBlobStorageCredentials.load("azure-blob-creds")

azure_container = AzureBlobStorageContainer(
    container_name=os.environ["AZURE_STORAGE_CONTAINER"],
    credentials=azure_credentials,
)

azure_container.save("app-container", overwrite=True)
```

Use this pattern when the container itself is part of reusable deployment configuration, not just a string passed into one function.

## Common Pitfalls

- Installing `prefect-azure` does not replace core `prefect`; you still use `prefect` for `@flow`, `@task`, deployments, workers, and configuration.
- Saving or loading blocks by name requires a reachable Prefect API. Direct instantiation does not.
- `prefect-azure` does not bypass Azure RBAC or storage account permissions. A valid connection string still needs the right permissions for the blob operations you call.
- The environment that runs the deployment or worker needs both the Python package and Azure access, not just the machine where you registered the flow.
- Keep connection strings and other Azure secrets out of flow source. Prefer environment variables, your platform secret manager, or Prefect blocks.
- Older Prefect examples may use agent-based orchestration patterns. For current orchestration, prefer current Prefect flows, deployments, work pools, workers, and blocks.

## Version Notes For `prefect-azure` 0.4.9

- This guide covers the PyPI package version `0.4.9`.
- Treat `prefect-azure` as an integration layered on top of core Prefect instead of a standalone workflow framework.
- Azure service behavior and storage account configuration are versioned separately from the Python integration package, so pin the package version your project expects and manage Azure-side compatibility independently.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Package integration docs: `https://docs.prefect.io/integrations/prefect-azure/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Python reference root: `https://reference.prefect.io/prefect_azure/`
- PyPI package page: `https://pypi.org/project/prefect-azure/`
