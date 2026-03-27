---
name: mgmt-servicefabric
description: "Azure Service Fabric management SDK for Python for classic clusters, application types, applications, services, and runtime version checks through Azure Resource Manager"
metadata:
  languages: "python"
  versions: "2.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,service-fabric,arm,management,python,clusters"
---

# Azure Service Fabric Management SDK for Python

## Golden Rule

Use `azure-mgmt-servicefabric` for Azure Resource Manager management-plane work against classic Service Fabric cluster resources: clusters, application types, application type versions, applications, services, available cluster code versions, and unsupported VM sizes. Install `azure-identity` alongside it, authenticate with a `TokenCredential`, and use `ServiceFabricManagementClient` as a context manager or call `close()` when you are done.

If your code uses `ServiceFabricManagedClustersManagementClient`, `managed_clusters`, or managed-cluster node type operations, you are in the separate `azure-mgmt-servicefabricmanagedclusters` package and should not copy examples from this guide blindly.

## Install

Pin the package version your project expects and install Azure Identity with it:

```bash
python -m pip install "azure-mgmt-servicefabric==2.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-servicefabric==2.1.0" azure-identity
poetry add "azure-mgmt-servicefabric==2.1.0" azure-identity
```

PyPI lists this package as requiring Python `>=3.7`.

## Authentication And Setup

Use `DefaultAzureCredential` for reusable code and CI, or `AzureCliCredential` for local scripts after `az login`.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

with ServiceFabricManagementClient(
    credential=credential,
    subscription_id=subscription_id,
) as client:
    print(type(client))
```

For local Azure CLI-driven scripts:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for cluster in client.clusters.list():
        print(cluster.name)
```

## Main Operation Groups

`ServiceFabricManagementClient` exposes the operation groups you will usually need:

- `clusters`
- `cluster_versions`
- `application_types`
- `application_type_versions`
- `applications`
- `services`
- `unsupported_vm_sizes`

## Common Workflows

### List And Inspect Clusters

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for cluster in client.clusters.list_by_resource_group("rg-servicefabric"):
        print(cluster.name, cluster.location, cluster.id)

    cluster = client.clusters.get(
        resource_group_name="rg-servicefabric",
        cluster_name="sf-cluster",
    )
    print(cluster.name, cluster.location, cluster.id)
```

Use `list()` for subscription-wide inventory and `list_by_resource_group()` when you already know the resource group.

### Check Available Runtime Versions For A Region And OS

`cluster_versions.list_by_environment(...)` returns a `ClusterCodeVersionsListResult`, not a paged iterator. Read the `.value` list from the result.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    versions = client.cluster_versions.list_by_environment(
        location="eastus",
        environment="Linux",
    )

    for item in versions.value or []:
        print(item.code_version)
```

The documented environment values are `"Windows"` and `"Linux"`.

### Check Whether A Cluster Can Upgrade To Newer Code Versions

`clusters.list_upgradable_versions(...)` asks ARM for the minimum and maximum upgradeable versions from the cluster's current code version. If you already know the target version, pass an `UpgradableVersionsDescription` as `versions_description`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    upgrade_info = client.clusters.list_upgradable_versions(
        resource_group_name="rg-servicefabric",
        cluster_name="sf-cluster",
    )

    print(upgrade_info)
```

Use this before editing cluster code versions manually. Microsoft documents supported upgrade paths separately from the SDK API reference.

### Preflight Unsupported VM Sizes

Before changing node sizes for a classic cluster, query the unsupported sizes for the region instead of guessing:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for vm_size in client.unsupported_vm_sizes.list("eastus"):
        print(vm_size.name)
```

`unsupported_vm_sizes.get(location, vm_size)` is the direct lookup if you want to check one size.

### List Registered Application Types And Versions

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for app_type in client.application_types.list(
        resource_group_name="rg-servicefabric",
        cluster_name="sf-cluster",
    ):
        print(app_type.name)

    for app_version in client.application_type_versions.list(
        resource_group_name="rg-servicefabric",
        cluster_name="sf-cluster",
        application_type_name="VotingType",
    ):
        print(app_version.name)
```

This is the safest way to discover what application package names and versions are already registered before you create or update an application resource.

### List Applications And Services In A Cluster

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.servicefabric import ServiceFabricManagementClient

resource_group_name = "rg-servicefabric"
cluster_name = "sf-cluster"
application_name = "voting-app"

with ServiceFabricManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for application in client.applications.list(
        resource_group_name=resource_group_name,
        cluster_name=cluster_name,
    ):
        print(application.name, application.id)

    for service in client.services.list(
        resource_group_name=resource_group_name,
        cluster_name=cluster_name,
        application_name=application_name,
    ):
        print(service.name, service.type)
```

For `services.get(...)` and service update calls, the official docs require `service_name` in the format `{applicationName}~{serviceName}`.

## Publishing An Application Package Through ARM

The management flow is split across several resource types. The usual sequence is:

1. `client.application_types.create_or_update(...)`
2. `client.application_type_versions.begin_create_or_update(...)`
3. `client.applications.begin_create_or_update(...)`
4. `client.services.begin_create_or_update(...)`

Important payload details verified from Microsoft template and API docs:

- an application type version resource needs an `appPackageUrl`
- an application resource needs the application `typeName` and `typeVersion`
- version, application, and service create/update flows are long-running operations, so use `.result()` on the returned poller

Keep create payloads aligned with the exact ARM API version your environment uses. Service Fabric resource bodies are large enough that copying old blog examples is high risk.

## Common Pitfalls

- Installing `azure-mgmt-servicefabric` without `azure-identity`
- Forgetting `AZURE_SUBSCRIPTION_ID`; the credential does not supply it automatically
- Treating `cluster_versions.list_by_environment(...)` like a paged iterator instead of reading the returned `.value`
- Confusing the `cluster_versions` location argument with a cluster resource ID; the API expects a region string such as `eastus`
- Mixing classic Service Fabric cluster operations with the separate managed-clusters package
- Forgetting to close the client or use it as a context manager
- Assuming every write call is immediate; `begin_*` methods return pollers and need `.result()` when you must wait for completion
- Passing the wrong `service_name` shape to `services.get(...)` or update calls; the docs require `{applicationName}~{serviceName}`

## Version-Sensitive Notes For `2.1.0`

- PyPI lists `2.1.0` as released on `2023-12-18`.
- The `2.1.0` release added the `ClusterVersionsEnvironment` model, which is relevant when you query runtime versions by OS environment.
- The modern Azure SDK behavior from the `1.0.0` line still applies in `2.1.0`: long-running operations use `azure.core.polling.LROPoller`, `begin_*` prefixes are used for those operations, and most failures surface as `azure.core.exceptions.HttpResponseError`.
- PyPI also notes stable async support via the package's `aio` namespace. Use that only if the rest of your application already runs on asyncio.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-servicefabric/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.servicefabricmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.clustersoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.clusterversionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.applicationtypesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.applicationtypeversionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.applicationsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.servicesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-servicefabric/azure.mgmt.servicefabric.operations.unsupportedvmsizesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python
- https://learn.microsoft.com/en-us/azure/service-fabric/service-fabric-cluster-upgrade-version-azure
- https://learn.microsoft.com/en-us/azure/templates/microsoft.servicefabric/2021-06-01/clusters/applicationtypes
- https://learn.microsoft.com/en-us/azure/templates/microsoft.servicefabric/2021-06-01/clusters/applicationtypes/versions
- https://learn.microsoft.com/en-us/azure/templates/microsoft.servicefabric/clusters/applications
