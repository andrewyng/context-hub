---
name: mgmt-datafactory
description: "Azure Data Factory management-plane SDK for Python for factories, linked services, datasets, pipelines, pipeline runs, and activity monitoring"
metadata:
  languages: "python"
  versions: "9.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,data-factory,arm,management,pipelines,etl"
---

# Azure Data Factory Management SDK for Python

## Golden Rule

Use `azure-mgmt-datafactory` for Azure Resource Manager control-plane work: creating factories, defining linked services and datasets, publishing pipelines, starting pipeline runs, and reading run status. Do not use it for data-plane access to Blob Storage, SQL, or other services. Pair it with `azure-identity` for authentication.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-datafactory==9.3.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-datafactory==9.3.0" azure-identity
poetry add "azure-mgmt-datafactory==9.3.0" azure-identity
```

PyPI lists `9.3.0` as requiring Python `>=3.9`.

Environment you usually need:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<key>;EndpointSuffix=core.windows.net"
```

For a service principal, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, the simplest path is usually:

```bash
az login
```

## Authentication And Client Setup

Recommended credential patterns:

- `DefaultAzureCredential()` for app code that should work locally, in CI, or in Azure-hosted environments
- `AzureCliCredential()` for local scripts after `az login`
- `ClientSecretCredential()` only when you explicitly want a service principal secret flow

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.datafactory import DataFactoryManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = DataFactoryManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local script variant:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.datafactory import DataFactoryManagementClient

client = DataFactoryManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The current Learn client reference documents these high-value operation groups:

- `factories`
- `linked_services`
- `datasets`
- `pipelines`
- `pipeline_runs`
- `activity_runs`
- `integration_runtimes`

## Create Or Update A Factory

Factory creation is an ARM management call on `client.factories`:

```python
from azure.mgmt.datafactory.models import Factory

resource_group_name = "example-rg"
factory_name = "example-adf-factory"
location = "eastus"

factory = client.factories.create_or_update(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    factory=Factory(location=location),
)

print(factory.id)
print(factory.provisioning_state)
```

Read the factory back with `get()` when you need the current provisioning state or identity settings:

```python
factory = client.factories.get(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
)

print(factory.location)
print(factory.provisioning_state)
```

## Define A Linked Service, Datasets, And A Copy Pipeline

The official quickstart builds a minimal Blob Storage copy pipeline. This is the smallest practical end-to-end authoring example to keep around.

```python
import os

from azure.mgmt.datafactory.models import (
    AzureBlobDataset,
    AzureStorageLinkedService,
    BlobSink,
    BlobSource,
    CopyActivity,
    DatasetReference,
    DatasetResource,
    LinkedServiceReference,
    LinkedServiceResource,
    PipelineResource,
    SecureString,
)

resource_group_name = "example-rg"
factory_name = "example-adf-factory"
storage_connection_string = os.environ["AZURE_STORAGE_CONNECTION_STRING"]

linked_service_name = "AzureStorageLinkedService"
input_dataset_name = "InputDataset"
output_dataset_name = "OutputDataset"
pipeline_name = "BlobCopyPipeline"
source_blob_path = "input-container/incoming"
source_file_name = "data.txt"
sink_blob_path = "output-container/copied"

client.linked_services.create_or_update(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    linked_service_name=linked_service_name,
    linked_service=LinkedServiceResource(
        properties=AzureStorageLinkedService(
            connection_string=SecureString(value=storage_connection_string),
        )
    ),
)

client.datasets.create_or_update(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    dataset_name=input_dataset_name,
    dataset=DatasetResource(
        properties=AzureBlobDataset(
            linked_service_name=LinkedServiceReference(
                reference_name=linked_service_name,
            ),
            folder_path=source_blob_path,
            file_name=source_file_name,
        )
    ),
)

client.datasets.create_or_update(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    dataset_name=output_dataset_name,
    dataset=DatasetResource(
        properties=AzureBlobDataset(
            linked_service_name=LinkedServiceReference(
                reference_name=linked_service_name,
            ),
            folder_path=sink_blob_path,
        )
    ),
)

copy_activity = CopyActivity(
    name="CopyFromBlobToBlob",
    inputs=[DatasetReference(reference_name=input_dataset_name)],
    outputs=[DatasetReference(reference_name=output_dataset_name)],
    source=BlobSource(),
    sink=BlobSink(),
)

client.pipelines.create_or_update(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    pipeline_name=pipeline_name,
    pipeline=PipelineResource(
        activities=[copy_activity],
    ),
)
```

Production note: the example uses a storage connection string because that is what the official quickstart demonstrates. Keep that secret out of source control and prefer a stronger secret-management pattern before shipping real workloads.

## Start A Pipeline Run And Monitor It

Start the pipeline with `client.pipelines.create_run(...)`, then poll `client.pipeline_runs.get(...)` until the status is terminal:

```python
import time

run = client.pipelines.create_run(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    pipeline_name=pipeline_name,
)

while True:
    pipeline_run = client.pipeline_runs.get(
        resource_group_name=resource_group_name,
        factory_name=factory_name,
        run_id=run.run_id,
    )
    print(pipeline_run.status)

    if pipeline_run.status not in {"Queued", "InProgress"}:
        break

    time.sleep(15)
```

To inspect individual activity results, query activity runs for a time window that covers the pipeline execution:

```python
from datetime import datetime, timedelta, timezone

from azure.mgmt.datafactory.models import RunFilterParameters

activity_runs = client.activity_runs.query_by_pipeline_run(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    run_id=run.run_id,
    filter_parameters=RunFilterParameters(
        last_updated_after=datetime.now(timezone.utc) - timedelta(hours=1),
        last_updated_before=datetime.now(timezone.utc) + timedelta(hours=1),
    ),
)

for activity_run in activity_runs.value:
    print(activity_run.activity_name, activity_run.status)
```

If you need to stop a run:

```python
client.pipeline_runs.cancel(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    run_id=run.run_id,
    is_recursive=True,
)
```

## Integration Runtime Operations

For an existing `ManagedReserved` integration runtime, the SDK exposes lifecycle and monitoring calls on `client.integration_runtimes`:

```python
poller = client.integration_runtimes.begin_start(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    integration_runtime_name="AutoResolveIntegrationRuntime",
)
poller.result()

monitoring = client.integration_runtimes.get_monitoring_data(
    resource_group_name=resource_group_name,
    factory_name=factory_name,
    integration_runtime_name="AutoResolveIntegrationRuntime",
)

print(monitoring.name)
```

Use the `begin_*` form when the operation returns a poller and wait on `.result()` before assuming the runtime state changed.

## Configuration Notes

- `subscription_id` is required. `DataFactoryManagementClient` does not infer it from the credential.
- The Learn client reference documents a default `api_version` of `2018-06-01`. The constructor allows overriding it, but the docs warn that doing so may result in unsupported behavior.
- Authentication success is not authorization success. The principal still needs RBAC permission to manage Data Factory resources in the target subscription or resource group.
- `create_or_update()` upserts ARM resources. If you need concurrency protection when editing existing artifacts, use the `if_match` or `if_none_match` parameters documented on the operation methods.
- The copy-pipeline example above defines metadata in Data Factory. It does not create storage containers or upload files for you.

## Version-Sensitive Notes

### `9.3.0`

PyPI release history for `9.3.0` calls out a new `cloud_setting` constructor argument on `DataFactoryManagementClient`. If you target Azure Government or another sovereign cloud, verify your cloud configuration against the installed `9.3.0` package instead of copying older public-cloud-only examples.

### Older generated samples

Older samples often use `ClientSecretCredential` directly and hard-code secrets or connection strings in the script. The current SDK still supports that pattern, but it is better to move credentials and linked-service secrets into environment variables or a secret-management system before using the code in real deployments.

## Common Pitfalls

- Installing only `azure-mgmt-datafactory` and forgetting `azure-identity`
- Treating this package as a data-plane SDK for Blob Storage, SQL, or other sources and sinks
- Omitting `AZURE_SUBSCRIPTION_ID`; credential resolution and client construction are separate concerns
- Hard-coding linked-service secrets in Python source
- Querying activity runs without a time window that actually includes the pipeline execution
- Assuming every management operation is immediate; integration runtime start and stop flows return pollers

## Official Sources Used

- https://pypi.org/project/azure-mgmt-datafactory/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datafactory/?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datafactory/azure.mgmt.datafactory.datafactorymanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/azure/data-factory/quickstart-create-data-factory-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python
