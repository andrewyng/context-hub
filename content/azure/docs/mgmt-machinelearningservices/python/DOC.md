---
name: mgmt-machinelearningservices
description: "Azure Machine Learning Services management SDK for Python for ARM workspace, compute, quota, and private link operations"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-machine-learning,arm,management,workspaces,compute,python"
---

# Azure Machine Learning Services Management SDK for Python

## Golden Rule

Use `azure-mgmt-machinelearningservices==1.0.0` for Azure Resource Manager operations on Azure Machine Learning workspaces and workspace compute. In the stable `1.0.0` line, the main client is `AzureMachineLearningWorkspaces`. Do not copy newer preview examples that use `MachineLearningServicesMgmtClient` unless you also move to that newer package line.

This package is the management-plane SDK. It is for provisioning and administering Azure Machine Learning resources. If you need the newer Azure ML v2 authoring surface for jobs, models, pipelines, and endpoints, use `azure-ai-ml` instead.

## Install

Install the pinned package together with Azure Identity:

```bash
python -m pip install "azure-mgmt-machinelearningservices==1.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-machinelearningservices==1.0.0" azure-identity
poetry add "azure-mgmt-machinelearningservices==1.0.0" azure-identity
```

## Authentication And Setup

The client requires a `TokenCredential` and an Azure subscription ID.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, `DefaultAzureCredential()` can also use existing Azure CLI, Azure PowerShell, or Azure Developer CLI sign-in state. For one-off local scripts, `AzureCliCredential()` is often the least surprising option after `az login`.

### Basic client initialization

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.machinelearningservices import AzureMachineLearningWorkspaces

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = AzureMachineLearningWorkspaces(
    credential=credential,
    subscription_id=subscription_id,
)
```

### Local CLI-driven initialization

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.machinelearningservices import AzureMachineLearningWorkspaces

client = AzureMachineLearningWorkspaces(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## What The Stable Client Covers

The stable `AzureMachineLearningWorkspaces` client exposes these management groups:

- `workspaces`
- `workspace_features`
- `notebooks`
- `usages`
- `virtual_machine_sizes`
- `quotas`
- `workspace_connections`
- `machine_learning_compute`
- `private_endpoint_connections`
- `private_link_resources`

That is the `1.0.0` management surface to expect. If you see examples for registries, batch endpoints, model containers, or the preview `compute` group, those belong to newer preview docs, not the stable `1.0.0` client this guide covers.

## Common Workflows

### List workspaces in a subscription

`list_by_subscription()` returns paged `WorkspaceListResult` objects, so iterate the page results and then their `value` lists:

```python
for page in client.workspaces.list_by_subscription():
    for workspace in page.value:
        print(workspace.name, workspace.location, workspace.id)
```

To scope the listing to one resource group:

```python
for page in client.workspaces.list_by_resource_group("my-resource-group"):
    for workspace in page.value:
        print(workspace.name, workspace.location)
```

### Get one workspace

```python
workspace = client.workspaces.get(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
)

print(workspace.id)
print(workspace.location)
print(workspace.discovery_url)
```

### Create or update a workspace

The `Workspace` model exposes fields for the Azure resources commonly associated with a workspace: storage account, key vault, application insights, and container registry. Using explicit ARM resource IDs is the safest approach for this package because it keeps the request shape obvious.

```bash
export AML_RESOURCE_GROUP="my-resource-group"
export AML_WORKSPACE_NAME="my-ml-workspace"
export AML_LOCATION="eastus"
export AML_STORAGE_ACCOUNT_ID="/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<name>"
export AML_KEY_VAULT_ID="/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.KeyVault/vaults/<name>"
export AML_APP_INSIGHTS_ID="/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Insights/components/<name>"
export AML_CONTAINER_REGISTRY_ID="/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.ContainerRegistry/registries/<name>"
```

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.machinelearningservices import AzureMachineLearningWorkspaces
from azure.mgmt.machinelearningservices.models import Workspace

client = AzureMachineLearningWorkspaces(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

workspace = client.workspaces.begin_create_or_update(
    resource_group_name=os.environ["AML_RESOURCE_GROUP"],
    workspace_name=os.environ["AML_WORKSPACE_NAME"],
    parameters=Workspace(
        location=os.environ["AML_LOCATION"],
        friendly_name="Demo AML Workspace",
        description="Workspace managed from Python",
        storage_account=os.environ["AML_STORAGE_ACCOUNT_ID"],
        key_vault=os.environ["AML_KEY_VAULT_ID"],
        application_insights=os.environ["AML_APP_INSIGHTS_ID"],
        container_registry=os.environ["AML_CONTAINER_REGISTRY_ID"],
        hbi_workspace=False,
        tags={"env": "dev"},
    ),
).result()

print(workspace.id)
```

`begin_create_or_update(...)` is a long-running ARM operation. Call `.result()` before assuming the workspace exists.

### Read workspace keys

The stable client exposes `list_keys(...)` and `resync_keys(...)` on `workspaces`.

```python
keys = client.workspaces.list_keys(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
)

print(keys)
```

Treat this result as sensitive. The docs explicitly say it includes keys for the backing storage account, Application Insights, and container registry password.

### Discover quota and recommended VM sizes before creating compute

Check region quota and supported sizes before choosing a cluster SKU:

```python
quota_pages = client.quotas.list(location="eastus")
for page in quota_pages:
    for item in page.value:
        print(item)

vm_sizes = client.virtual_machine_sizes.list(
    location="eastus",
    compute_type="AmlCompute",
    recommended=True,
)

print(vm_sizes)
```

This package returns SDK model objects here. Inspect the returned quota and size objects first, then pick a `vm_size` for compute creation.

### Create an AmlCompute cluster

The stable compute API hangs off `client.machine_learning_compute`. Cluster creation is another long-running operation.

```python
from datetime import timedelta
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.machinelearningservices import AzureMachineLearningWorkspaces
from azure.mgmt.machinelearningservices.models import (
    AmlCompute,
    AmlComputeProperties,
    ComputeResource,
    ScaleSettings,
)

client = AzureMachineLearningWorkspaces(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

compute = client.machine_learning_compute.begin_create_or_update(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
    compute_name="cpu-cluster",
    parameters=ComputeResource(
        location="eastus",
        properties=AmlCompute(
            compute_location="eastus",
            properties=AmlComputeProperties(
                vm_size="Standard_DS3_v2",
                vm_priority="Dedicated",
                scale_settings=ScaleSettings(
                    min_node_count=0,
                    max_node_count=4,
                    node_idle_time_before_scale_down=timedelta(minutes=20),
                ),
            ),
        ),
    ),
).result()

print(compute.id)
```

Important details from the official model docs:

- `ScaleSettings.max_node_count` is required.
- `ScaleSettings.min_node_count` defaults to `0`.
- `MachineLearningComputeOperations.begin_create_or_update(...)` overwrites an existing compute if it already exists.

### Inspect or delete a compute target

```python
compute = client.machine_learning_compute.get(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
    compute_name="cpu-cluster",
)

print(compute.name)
print(compute.location)
```

```python
client.machine_learning_compute.begin_delete(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
    compute_name="cpu-cluster",
    underlying_resource_action="Delete",
).result()
```

For compute deletion, the SDK requires `underlying_resource_action`. Use:

- `"Delete"` to delete the underlying compute resource
- `"Detach"` to detach the underlying compute from the workspace

### Check private link resources for a workspace

```python
private_links = client.private_link_resources.list_by_workspace(
    resource_group_name="my-resource-group",
    workspace_name="my-ml-workspace",
)

print(private_links)
```

Use this when you are wiring private endpoints or validating what private link resources the workspace exposes.

## Configuration Notes

- This package does not create generic Azure infrastructure outside Azure Machine Learning itself. If the resource group does not exist yet, create it with `azure-mgmt-resource` or another ARM tool first.
- Workspace creation commonly depends on associated Azure resources such as Storage, Key Vault, Application Insights, and Container Registry. Microsoft’s workspace docs and ARM template samples treat these as the standard dependency set.
- `DefaultAzureCredential` authenticates; it does not choose a subscription. You still must pass `subscription_id`.
- Management calls succeed only if the identity has the right Azure RBAC permissions at the subscription, resource group, or resource scope.

## Common Pitfalls

- Installing only `azure-mgmt-machinelearningservices` and forgetting `azure-identity`
- Copying preview Learn examples that use `MachineLearningServicesMgmtClient` and newer operation groups into a project pinned to `1.0.0`
- Treating `begin_create_or_update(...)` or `begin_delete(...)` as synchronous and skipping `.result()`
- Logging the output of `workspaces.list_keys(...)` or `machine_learning_compute.list_keys(...)`
- Creating compute before checking quota and region VM-size availability
- Forgetting that compute creation and delete calls can overwrite or remove underlying resources
- Expecting this package to replace `azure-ai-ml` for jobs, models, pipelines, or current endpoint workflows

## Version-Sensitive Notes

- PyPI lists `1.0.0` as the stable release published on `2021-01-04`.
- The stable `1.0.0` API root documents `AzureMachineLearningWorkspaces` as the client class.
- Microsoft Learn also publishes newer preview documentation for `MachineLearningServicesMgmtClient` and additional AML resource types. That is a different API line. If you pin `azure-mgmt-machinelearningservices==1.0.0`, stay on the stable `AzureMachineLearningWorkspaces` surface shown in this guide.

## Official Sources

- PyPI project page: `https://pypi.org/project/azure-mgmt-machinelearningservices/`
- Azure Machine Learning Services management package API root: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/`
- `AzureMachineLearningWorkspaces` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.azuremachinelearningworkspaces?view=azure-python`
- `WorkspacesOperations` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.operations.workspacesoperations?view=azure-python`
- `Workspace` model reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.models.workspace?view=azure-python`
- `MachineLearningComputeOperations` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.operations.machinelearningcomputeoperations?view=azure-python`
- `ComputeResource` model reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.models.computeresource?view=azure-python`
- `AmlCompute` model reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.models.amlcompute?view=azure-python`
- `AmlComputeProperties` model reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.models.amlcomputeproperties?view=azure-python`
- `ScaleSettings` model reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.models.scalesettings?view=azure-python`
- `QuotasOperations` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.operations.quotasoperations?view=azure-python`
- `VirtualMachineSizesOperations` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.operations.virtualmachinesizesoperations?view=azure-python`
- `PrivateLinkResourcesOperations` reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-machinelearningservices/azure.mgmt.machinelearningservices.operations.privatelinkresourcesoperations?view=azure-python`
- Azure authentication overview for Python: `https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication-overview`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python`
- `AzureCliCredential` reference: `https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python`
- Azure ML workspace management article: `https://learn.microsoft.com/en-us/azure/machine-learning/how-to-manage-workspace`
- Azure ML workspace ARM template sample: `https://learn.microsoft.com/en-us/samples/azure/azure-quickstart-templates/machine-learning-workspace/`
