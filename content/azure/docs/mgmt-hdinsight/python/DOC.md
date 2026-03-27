---
name: mgmt-hdinsight
description: "Azure HDInsight management SDK for Python for cluster lifecycle, script actions, tagging, and private endpoint operations"
metadata:
  languages: "python"
  versions: "9.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,hdinsight,arm,management,spark,hadoop,private-link"
---

# Azure HDInsight Management SDK for Python

## Golden Rule

Use `azure-mgmt-hdinsight` for Azure Resource Manager management-plane operations only: create and delete HDInsight clusters, inspect cluster state, patch tags, run script actions, and manage private endpoint or private link resources. Install `azure-identity` with it, authenticate with a `TokenCredential`, pass the subscription ID explicitly, and expect most write operations to be `begin_*` long-running operations that need `.result()`.

The Learn HDInsight overview page still shows older `azure.common.credentials.ServicePrincipalCredentials` examples and non-`begin_*` calls such as `client.clusters.create(...)`. Those are pre-8.x patterns. For `9.0.0`, the current client docs and PyPI release notes use `azure-identity`, a `credential=` constructor argument, and `begin_*` pollers.

## Install

Pin the package version your project expects and install `azure-identity` alongside it:

```bash
python -m pip install "azure-mgmt-hdinsight==9.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-hdinsight==9.0.0" azure-identity
poetry add "azure-mgmt-hdinsight==9.0.0" azure-identity
```

If this subscription has never used HDInsight before, register the resource provider once:

```bash
az provider register --namespace Microsoft.HDInsight
```

## Authentication And Setup

For most projects, use one of these patterns:

- `DefaultAzureCredential()` for reusable code that should work locally, in CI, and on Azure
- `AzureCliCredential()` for local scripts after `az login`

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you want `DefaultAzureCredential` to use a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.hdinsight import HDInsightManagementClient

credential = DefaultAzureCredential()
subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = HDInsightManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.hdinsight import HDInsightManagementClient

client = HDInsightManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The package also exposes an async client at `azure.mgmt.hdinsight.aio.HDInsightManagementClient` if the rest of your application is already async.

## Core Operation Groups

`HDInsightManagementClient` exposes these operation groups in `9.0.0`:

- `clusters`
- `applications`
- `locations`
- `configurations`
- `extensions`
- `script_actions`
- `script_execution_history`
- `virtual_machines`
- `private_endpoint_connections`
- `private_link_resources`

The most common workflows are under `client.clusters`, plus `locations` for preflight checks and the script/private-link groups for post-create management.

## Common Workflows

### Inspect regional capabilities before you build a cluster

Cluster creation is region-sensitive. Use the location APIs before you hard-code an HDInsight version or VM size:

```python
capabilities = client.locations.get_capabilities("eastus")
usages = client.locations.list_usages("eastus")

print(capabilities)
print(usages)
```

Use `client.locations.check_name_availability(...)` before choosing a cluster name and `client.locations.validate_cluster_create_request(...)` before submitting a large create payload.

### Create a Spark cluster

This package creates Azure resources through ARM. You still need supporting resources such as a resource group and default storage account first.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.hdinsight import HDInsightManagementClient
from azure.mgmt.hdinsight.models import (
    ClusterCreateParametersExtended,
    ClusterCreateProperties,
    ClusterDefinition,
    ComputeProfile,
    HardwareProfile,
    LinuxOperatingSystemProfile,
    OSType,
    OsProfile,
    Role,
    StorageAccount,
    StorageProfile,
    Tier,
)

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()
client = HDInsightManagementClient(credential=credential, subscription_id=subscription_id)

resource_group_name = "example-rg"
cluster_name = "example-hdinsight"
location = "eastus"

cluster_login_username = "admin"
cluster_login_password = "ReplaceWithAStrongPassword123!"
ssh_username = "sshuser"
ssh_password = "ReplaceWithAnotherStrongPassword123!"

storage_account_name = "examplestorageacct"
storage_account_key = os.environ["HDINSIGHT_STORAGE_ACCOUNT_KEY"]
storage_container = "hdinsight"

create_parameters = ClusterCreateParametersExtended(
    location=location,
    tags={"env": "dev"},
    properties=ClusterCreateProperties(
        # Pick a version supported in this region from client.locations.get_capabilities(...)
        cluster_version="<supported-hdinsight-version>",
        os_type=OSType.linux,
        tier=Tier.standard,
        cluster_definition=ClusterDefinition(
            kind="Spark",
            configurations={
                "gateway": {
                    "restAuthCredential.isEnabled": True,
                    "restAuthCredential.username": cluster_login_username,
                    "restAuthCredential.password": cluster_login_password,
                }
            },
        ),
        compute_profile=ComputeProfile(
            roles=[
                Role(
                    name="headnode",
                    target_instance_count=2,
                    hardware_profile=HardwareProfile(vm_size="Standard_D3_V2"),
                    os_profile=OsProfile(
                        linux_operating_system_profile=LinuxOperatingSystemProfile(
                            username=ssh_username,
                            password=ssh_password,
                        )
                    ),
                ),
                Role(
                    name="workernode",
                    target_instance_count=3,
                    hardware_profile=HardwareProfile(vm_size="Standard_D3_V2"),
                    os_profile=OsProfile(
                        linux_operating_system_profile=LinuxOperatingSystemProfile(
                            username=ssh_username,
                            password=ssh_password,
                        )
                    ),
                ),
            ]
        ),
        storage_profile=StorageProfile(
            storageaccounts=[
                StorageAccount(
                    name=f"{storage_account_name}.blob.core.windows.net",
                    is_default=True,
                    container=storage_container,
                    key=storage_account_key,
                )
            ]
        ),
    ),
)

cluster = client.clusters.begin_create(
    resource_group_name=resource_group_name,
    cluster_name=cluster_name,
    parameters=create_parameters,
).result()

print(cluster.id)
print(cluster.location)
```

Practical notes:

- The create model now requires `location`.
- Check the regional capability APIs before copying an HDInsight version or VM size from an old example.
- The default storage account must be in the same Azure region as the cluster.
- Deleting the cluster does not delete the storage account.

### Get, list, and delete clusters

Read a specific cluster:

```python
cluster = client.clusters.get(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
)

print(cluster.name)
print(cluster.provisioning_state)
```

List clusters in a resource group:

```python
for item in client.clusters.list_by_resource_group("example-rg"):
    print(item)
```

Delete a cluster:

```python
client.clusters.begin_delete(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
).result()
```

### Patch cluster tags

`update(...)` is the patch operation for supported mutable fields such as tags:

```python
from azure.mgmt.hdinsight.models import ClusterPatchParameters

updated = client.clusters.update(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
    parameters=ClusterPatchParameters(
        tags={
            "env": "prod",
            "owner": "data-platform",
        }
    ),
)

print(updated.tags)
```

### Run a script action and inspect history

Execute a script action against one or more roles:

```python
from azure.mgmt.hdinsight.models import (
    ExecuteScriptActionParameters,
    RuntimeScriptAction,
)

client.clusters.begin_execute_script_actions(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
    parameters=ExecuteScriptActionParameters(
        persist_on_success=True,
        script_actions=[
            RuntimeScriptAction(
                name="install-custom-tooling",
                uri="https://example.blob.core.windows.net/scripts/bootstrap.sh",
                roles=["headnode", "workernode"],
                parameters="--example true",
            )
        ],
    ),
).result()
```

Inspect persisted script actions:

```python
for item in client.script_actions.list_by_cluster("example-rg", "example-hdinsight"):
    print(item)
```

Inspect execution history:

```python
for item in client.script_execution_history.list_by_cluster("example-rg", "example-hdinsight"):
    print(item)
```

The Learn overview samples use role names such as `headnode`, `workernode`, `zookeepernode`, and `edgenode`.

### Inspect private endpoint and private link resources

These operation groups were added in the `9.0.0` line:

```python
for connection in client.private_endpoint_connections.list_by_cluster(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
):
    print(connection)

resources = client.private_link_resources.list_by_cluster(
    resource_group_name="example-rg",
    cluster_name="example-hdinsight",
)

print(resources)
```

You can also approve or reject a specific private endpoint connection manually with `client.private_endpoint_connections.begin_create_or_update(...)`.

## Configuration Notes

- `HDInsightManagementClient` requires a `TokenCredential` and a `subscription_id`. It does not infer the subscription from Azure CLI state unless you pass the ID yourself.
- `DefaultAzureCredential` selects a credential based on the environment. If it authenticates unexpectedly, check whether environment variables, Azure CLI login, managed identity, or another source won the chain.
- Treat cluster creation as a preflight-heavy flow. Use `check_name_availability`, `get_capabilities`, and `validate_cluster_create_request` before firing a long-running create request.
- HDInsight cluster creation depends on other Azure resources and quota in the target region. Authentication success does not guarantee cluster creation will succeed.

## Version-Sensitive Notes

### `9.0.0`

PyPI lists `9.0.0` as the stable release for this package and also shows newer `9.1.0b1` and `9.1.0b2` prereleases. The `9.0.0` release adds:

- `PrivateLinkResourcesOperations`
- `PrivateEndpointConnectionsOperations`
- new `zones` and `system_data` fields on cluster-related models
- private link configuration fields on cluster models

The `9.0.0` release also makes `location` required on the tracked cluster models.

### `8.0.0` and later generator changes still matter

The major SDK behavior change happened in `8.0.0`, and it still defines how `9.0.0` code should look:

- old `azure.common.credentials` objects are no longer supported
- `credentials=` became `credential=`
- long-running operations moved to `begin_*`
- `CloudError`-style handling was replaced by `azure.core.exceptions.HttpResponseError`
- the package gained official async support under the `aio` namespace

If you copy a pre-8.x sample from an old blog post or the older HDInsight overview page, update it to the current auth and polling model before using it.

## Common Pitfalls

- Copying the legacy Learn overview auth sample with `ServicePrincipalCredentials` instead of using `azure-identity`
- Calling `client.clusters.create(...)` or `client.clusters.delete(...)` from older examples instead of the current `begin_*` methods
- Forgetting to register `Microsoft.HDInsight` in a subscription that has never used the service
- Omitting `AZURE_SUBSCRIPTION_ID`
- Hard-coding an HDInsight version or VM size without checking `client.locations.get_capabilities(...)` for the target region
- Assuming cluster deletion also deletes the default storage account
- Creating the default storage account in a different region than the cluster

## Official Sources Used

- https://pypi.org/project/azure-mgmt-hdinsight/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.hdinsightmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.clustersoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.locationsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.scriptactionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.scriptexecutionhistoryoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.privateendpointconnectionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-hdinsight/azure.mgmt.hdinsight.operations.privatelinkresourcesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python
- https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-sdk-python-samples
- https://learn.microsoft.com/en-us/azure/hdinsight/hdinsight-python-sdk-azure-resource-manager
- https://learn.microsoft.com/en-us/azure/hdinsight/interactive-query/quickstart-resource-manager-template
