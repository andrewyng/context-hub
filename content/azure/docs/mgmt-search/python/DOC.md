---
name: mgmt-search
description: "Azure AI Search management SDK for Python for service lifecycle, scaling, API keys, and subscription-level administration"
metadata:
  languages: "python"
  versions: "9.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-ai-search,management,arm,api-keys,python"
---

# azure-mgmt-search Python Package Guide

## What This Package Is

`azure-mgmt-search` is the Azure Resource Manager SDK for Azure AI Search. Use it for management-plane work:

- create, update, list, upgrade, and delete search services
- read and rotate admin keys
- create, list, and delete query keys
- inspect subscription-level search services and usage-related management surfaces

Do not use this package for indexes, documents, queries, or indexers. Those are data-plane operations and belong to `azure-search-documents`.

Package and import path differ:

- PyPI package: `azure-mgmt-search`
- Python namespace: `azure.mgmt.search`

This guide is scoped to package version `9.2.0` on PyPI.

## Golden Rules

- Use `SearchManagementClient` for Azure AI Search service administration, not for document or index operations
- Install `azure-identity` alongside this package; the client expects a `TokenCredential`
- Pass the Azure subscription ID explicitly; the management client does not infer it
- Treat service creation as a long-running operation and wait on the returned poller with `.result()`
- Query keys are deleted by key value, not by key name
- `SearchManagementClient` defaults to ARM API version `2025-05-01`; do not override `api_version` unless you have a specific compatibility reason

## Install

PyPI lists `Requires: Python >=3.9`.

```bash
python -m pip install "azure-mgmt-search==9.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-search==9.2.0" azure-identity
poetry add "azure-mgmt-search==9.2.0" azure-identity
```

## Authentication And Environment

Minimum environment for management-plane scripts:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_RESOURCE_GROUP="example-rg"
export AZURE_SEARCH_SERVICE_NAME="example-search-svc"
export AZURE_LOCATION="westus2"
```

If you authenticate with a service principal, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, `DefaultAzureCredential()` usually works after `az login`. Management calls still require Azure RBAC permissions on the subscription or resource group, so successful authentication does not guarantee authorization.

## Initialize The Client

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

credential = DefaultAzureCredential()
subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = SearchManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

## Check Whether A Service Name Is Available

Search service names are globally unique because they become part of `https://<name>.search.windows.net`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

availability = client.services.check_name_availability(
    os.environ["AZURE_SEARCH_SERVICE_NAME"]
)

print(availability)
```

The management docs also document the naming constraints: lowercase letters, digits, and dashes only; no consecutive dashes; not starting with two dashes or ending with one; length `2` to `60`.

## Create Or Update A Search Service

This is the core provisioning flow for the package. `begin_create_or_update()` returns a long-running-operation poller.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient
from azure.mgmt.search.models import SearchService, Sku

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.services.begin_create_or_update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
    service=SearchService(
        location=os.environ["AZURE_LOCATION"],
        sku=Sku(name="basic"),
        replica_count=1,
        partition_count=1,
    ),
)

service = poller.result()
print(service.id)
print(service.status)
```

What matters in practice:

- `location` is required for creation
- `sku` is required; a minimal example is `Sku(name="basic")`
- `replica_count` and `partition_count` control scale and capacity
- if the service already exists, `begin_create_or_update()` updates all properties you pass

## Get And List Existing Services

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

service = client.services.get(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
)

print(service.name, service.location, service.status)

for item in client.services.list_by_resource_group(os.environ["AZURE_RESOURCE_GROUP"]):
    print(item.name, item.sku.name)
```

Use `list_by_subscription()` when you need to inventory all Azure AI Search services in the current subscription.

## Update Scale Or Tier

Use `SearchServiceUpdate` with `services.update()` for partial updates to an existing service.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient
from azure.mgmt.search.models import SearchServiceUpdate, Sku

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

updated = client.services.update(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
    service=SearchServiceUpdate(
        replica_count=2,
        partition_count=1,
        sku=Sku(name="basic"),
    ),
)

print(updated.replica_count, updated.partition_count)
```

The current model surface also includes `public_network_access`, so verify your network posture before copying older examples that assume public access is always enabled.

## Upgrade An Existing Service

Version `9.2.0` includes `begin_upgrade()` on `services`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

poller = client.services.begin_upgrade(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
)

service = poller.result()
print(service.status)
```

Use this only when the service reports an upgrade path. Do not assume every service needs it during normal provisioning.

## Read And Rotate Admin Keys

Admin keys allow full access to the search service data plane. Azure AI Search creates both a primary and secondary admin key so you can rotate one while clients temporarily use the other.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

admin_keys = client.admin_keys.get(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["AZURE_SEARCH_SERVICE_NAME"],
)

print(admin_keys.primary_key)
print(admin_keys.secondary_key)
```

Rotate one key at a time:

```python
rotated = client.admin_keys.regenerate(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["AZURE_SEARCH_SERVICE_NAME"],
    "primary",
)

print(rotated.primary_key)
```

Practical rotation flow:

- move clients to the secondary key
- regenerate the primary key
- update clients to the new primary key
- only then consider rotating the secondary key

## Manage Query Keys

Query keys are read-only and are the safer choice for client apps that only run searches.

Create one:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

query_key = client.query_keys.create(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
    name="frontend-search",
)

print(query_key.name)
print(query_key.key)
```

List all query keys:

```python
for key in client.query_keys.list_by_search_service(
    os.environ["AZURE_RESOURCE_GROUP"],
    os.environ["AZURE_SEARCH_SERVICE_NAME"],
):
    print(key.name, key.key)
```

Delete a query key:

```python
client.query_keys.delete(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
    key=query_key.key,
)
```

Important: the delete call takes the key value, not the display name.

## Delete A Search Service

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.search import SearchManagementClient

client = SearchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

client.services.delete(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    search_service_name=os.environ["AZURE_SEARCH_SERVICE_NAME"],
)
```

This deletes the search service and its associated resources. Treat it as destructive.

## Common Pitfalls

- Using `azure-mgmt-search` for indexes or documents instead of `azure-search-documents`
- Installing only `azure-mgmt-search` and forgetting `azure-identity`
- Forgetting to set `AZURE_SUBSCRIPTION_ID`
- Assuming successful `DefaultAzureCredential()` authentication also means the principal has permission to create services or manage keys
- Treating `begin_create_or_update()` and `begin_upgrade()` like immediate calls and forgetting `.result()`
- Deleting query keys by name instead of by key value
- Copying older examples that rely on outdated API versions or omit newer network-related settings

## Version-Sensitive Notes For 9.2.0

- PyPI release history for `9.2.0` calls out support for the Search management API version `2025-05-01`
- The current Learn reference for `SearchManagementClient` also shows `2025-05-01` as the default API version
- The `9.2.0` release adds the `network_security_perimeter_configurations` operation group and `services.begin_upgrade()`

## Official Sources Used

- https://pypi.org/project/azure-mgmt-search/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.searchmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.operations.servicesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.operations.adminkeysoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.operations.querykeysoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.models.searchservice?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.models.searchserviceupdate?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-search/azure.mgmt.search.models.sku?view=azure-python
- https://learn.microsoft.com/en-us/azure/search/search-security-api-keys
