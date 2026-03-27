---
name: mgmt-eventhub
description: "Azure Event Hubs management-plane SDK for Python for namespaces, event hubs, authorization rules, and ARM configuration"
metadata:
  languages: "python"
  versions: "11.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,eventhubs,arm,management,namespaces,provisioning,python"
---

# Azure Event Hubs Management SDK for Python

## Golden Rule

Use `azure-mgmt-eventhub` for Azure Resource Manager control-plane work: creating namespaces, creating event hubs, managing authorization rules, and updating namespace settings. Do not use it to publish or consume events. For data-plane send and receive code, use `azure-eventhub`.

For package version `11.2.0`, the main client is `EventHubManagementClient`. The client defaults to the stable `2024-01-01` Event Hubs ARM API unless you explicitly override `api_version`.

## Install

Install the management package and an Azure credential package together:

```bash
python -m pip install "azure-mgmt-eventhub==11.2.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-eventhub==11.2.0" azure-identity
poetry add "azure-mgmt-eventhub==11.2.0" azure-identity
```

Environment you usually need:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Authentication And Client Setup

Use one of these credential patterns:

- `DefaultAzureCredential()` for reusable code, CI, managed identity, or workload identity
- `AzureCliCredential()` for local scripts after `az login`

Basic setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.eventhub import EventHubManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = EventHubManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven scripts can use Azure CLI credentials directly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.eventhub import EventHubManagementClient

client = EventHubManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Authentication success is not enough by itself. The principal also needs Azure RBAC permissions to create or update `Microsoft.EventHub/*` resources at the subscription, resource-group, or namespace scope you target.

## Core Workflows

### Check namespace name availability

Namespace names are globally unique. Check first instead of learning from a failed create call:

```python
namespace_name = "ctxhub-eh-ns-01"

availability = client.namespaces.check_name_availability(
    {"name": namespace_name}
)

if not availability.name_available:
    raise RuntimeError(availability.message or availability.reason)
```

### Create a namespace

Namespace creation is a long-running ARM operation, so call `.result()` on the poller before using the namespace:

```python
poller = client.namespaces.begin_create_or_update(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    parameters={
        "location": "eastus",
        "sku": {
            "name": "Standard",
            "tier": "Standard",
            "capacity": 1,
        },
        "minimum_tls_version": "1.2",
        "public_network_access": "Enabled",
        "is_auto_inflate_enabled": True,
        "maximum_throughput_units": 4,
        "tags": {
            "env": "dev",
            "owner": "context-hub",
        },
    },
)

namespace = poller.result()
print(namespace.id)
```

Use `disable_local_auth=True` only when downstream apps authenticate with Microsoft Entra ID instead of SAS connection strings.

### Create an event hub

Create the event hub after the namespace exists:

```python
event_hub = client.event_hubs.create_or_update(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    event_hub_name="orders",
    parameters={
        "partition_count": 4,
        "message_retention_in_days": 7,
    },
)

print(event_hub.id)
```

The documented `Eventhub` model for this client version includes `partition_count`, `message_retention_in_days`, and optional `capture_description`. Keep the event hub configuration aligned with the namespace SKU you actually provisioned.

### Create an authorization rule and get a connection string

Create SAS authorization rules only if your application really needs shared-access-key auth. For a single event hub, create the rule on the event hub and then read its keys:

```python
client.event_hubs.create_or_update_authorization_rule(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    event_hub_name="orders",
    authorization_rule_name="send-listen",
    parameters={
        "rights": ["Listen", "Send"],
    },
)

keys = client.event_hubs.list_keys(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
    event_hub_name="orders",
    authorization_rule_name="send-listen",
)

print(keys.primary_connection_string)
```

Use namespace authorization rules only when you want namespace-wide access. Event-hub-level rules are narrower and produce connection strings scoped to that event hub.

### List or inspect existing resources

```python
for namespace in client.namespaces.list_by_resource_group("example-rg"):
    print(namespace.name, namespace.location, namespace.sku.name)

for hub in client.event_hubs.list_by_namespace("example-rg", namespace_name):
    print(hub.name, hub.partition_count)

namespace = client.namespaces.get(
    resource_group_name="example-rg",
    namespace_name=namespace_name,
)

print(namespace.minimum_tls_version)
print(namespace.public_network_access)
```

## Configuration Notes

- `EventHubManagementClient` needs `subscription_id`; it is not inferred from the credential.
- `begin_create_or_update`, `begin_delete`, and other `begin_*` methods return pollers. Wait on `.result()` before assuming the ARM operation is finished.
- The client constructor accepts `api_version`, but the package docs state the default is the latest public version. Only override it when you intentionally need a different stable or preview API surface.
- Namespace auth rules and event-hub auth rules are different resources. Use event-hub rules when your application should be scoped to one hub instead of the whole namespace.
- If you turn off local auth with `disable_local_auth`, SAS-based connection strings stop being the right integration path. Use Entra ID with the data-plane `azure-eventhub` client instead.

## Version-Sensitive Notes

`11.2.0` adds several new generated surface areas compared with earlier `11.x` builds, including:

- `NamespacesOperations.begin_failover`
- `EHNamespace.geo_data_replication`
- `Eventhub.identifier`
- `Eventhub.message_timestamp_description`
- `RetentionDescription.min_compaction_lag_in_mins`

If copied code or internal wrappers were written against earlier `11.x` releases, verify that they still match the current generated models before reusing them.

The package docs also show multiple versioned operation groups under `azure.mgmt.eventhub.v20xx_xx_xx...`. Those are not interchangeable. If you choose a preview API version explicitly, keep the operation group, model imports, and expected fields aligned to that version.

## Common Pitfalls

- Using `azure-mgmt-eventhub` for producing or consuming events instead of `azure-eventhub`
- Forgetting `AZURE_SUBSCRIPTION_ID`
- Calling a long-running `begin_*` method and then using the resource before `poller.result()`
- Creating a namespace-wide SAS rule when the app only needs one event hub
- Expecting SAS connection strings to remain usable after enabling `disable_local_auth`
- Copying snippets from a different `azure.mgmt.eventhub.v20xx_*` API-versioned namespace into the default `11.2.0` client without checking model drift

## Official Sources Used

- https://pypi.org/project/azure-mgmt-eventhub/11.2.0/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/azure.mgmt.eventhub.eventhubmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/azure.mgmt.eventhub.operations.namespacesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/azure.mgmt.eventhub.operations.eventhubsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/azure.mgmt.eventhub.models.ehnamespace?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-eventhub/azure.mgmt.eventhub.models.eventhub?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python
- https://learn.microsoft.com/en-us/rest/api/eventhub/controlplane-stable/check-name-availability-namespaces/check-name-availability
- https://learn.microsoft.com/en-us/rest/api/eventhub/operations/list?view=rest-eventhub-2024-01-01
