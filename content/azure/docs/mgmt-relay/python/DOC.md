---
name: mgmt-relay
description: "Azure Relay management-plane SDK for Python for namespaces, hybrid connections, WCF relays, and shared access authorization rules"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,relay,arm,management,hybrid-connections,wcf-relay,python"
---

# Azure Relay Management SDK for Python

## Golden Rule

Use `azure-mgmt-relay` for Azure Resource Manager control-plane work only: creating Relay namespaces, provisioning Hybrid Connections or WCF relays, and managing shared access authorization rules. In `1.1.0`, the main client is `RelayAPI`. This package does not open listener sockets or send application traffic through Azure Relay for you.

## Install

Install the management package with an Azure credential package:

```bash
python -m pip install "azure-mgmt-relay==1.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-relay==1.1.0" azure-identity
poetry add "azure-mgmt-relay==1.1.0" azure-identity
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

`azure-mgmt-relay 1.1.0` uses Azure Active Directory credentials from `azure-identity`.

For most projects, use one of these patterns:

- `DefaultAzureCredential()` for reusable code, CI, managed identity, or workload identity
- `AzureCliCredential()` for local scripts after `az login`

Basic setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.relay import RelayAPI

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = RelayAPI(
    credential=credential,
    subscription_id=subscription_id,
)
```

CLI-driven local setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.relay import RelayAPI

client = RelayAPI(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Authentication success is separate from authorization. The principal also needs Azure RBAC permission to create or update `Microsoft.Relay/*` resources at the subscription, resource-group, or namespace scope you target.

## Core Workflows

The main operation groups in `1.1.0` are:

- `namespaces`
- `hybrid_connections`
- `wcf_relays`

### Check namespace name availability

Check first before creating a namespace:

```python
availability = client.namespaces.check_name_availability(
    {"name": "ctxhub-relay-ns-01"}
)

if not availability.name_available:
    raise RuntimeError(availability.message or availability.reason)
```

### Create a Relay namespace

Namespace creation is a long-running ARM operation, so wait on the poller:

```python
poller = client.namespaces.begin_create_or_update(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    parameters={
        "location": "eastus",
        "sku": {
            "name": "Standard",
            "tier": "Standard",
        },
        "tags": {
            "env": "dev",
            "owner": "context-hub",
        },
    },
)

namespace = poller.result()
print(namespace.id)
print(namespace.service_bus_endpoint)
```

The Relay namespace SKU documented for the ARM resource is `Standard`.

### Create a Hybrid Connection

Create the namespace first, then create the Hybrid Connection inside it:

```python
hybrid_connection = client.hybrid_connections.create_or_update(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    hybrid_connection_name="orders-hc",
    parameters={
        "requires_client_authorization": True,
        "user_metadata": (
            '[{"key":"endpoint","value":"orders.internal.example:443"}]'
        ),
    },
)

print(hybrid_connection.id)
print(hybrid_connection.requires_client_authorization)
```

Important Hybrid Connection properties exposed by the SDK docs include:

- `requires_client_authorization`
- `user_metadata`
- `created_at`
- `updated_at`
- `listener_count`

If you use Hybrid Connections with Azure App Service, the App Service docs require `userMetadata` to be a JSON string array describing the endpoint, for example `[{\"key\":\"endpoint\",\"value\":\"host:port\"}]`.

### Create a WCF relay

Use `wcf_relays` when you need a WCF relay resource rather than a Hybrid Connection:

```python
wcf_relay = client.wcf_relays.create_or_update(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    relay_name="orders-wcf",
    parameters={
        "relay_type": "NetTcp",
        "requires_client_authorization": True,
        "requires_transport_security": True,
        "user_metadata": "orders service relay",
    },
)

print(wcf_relay.id)
print(wcf_relay.relay_type)
```

The ARM resource definition for WCF relays documents these main writable properties:

- `relay_type`
- `requires_client_authorization`
- `requires_transport_security`
- `user_metadata`

### Create an authorization rule and list keys

Create a SAS rule only when your app needs shared-access-key authentication:

```python
rule = client.hybrid_connections.create_or_update_authorization_rule(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    hybrid_connection_name="orders-hc",
    authorization_rule_name="send-listen",
    parameters={
        "rights": ["Listen", "Send"],
    },
)

keys = client.hybrid_connections.list_keys(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    hybrid_connection_name="orders-hc",
    authorization_rule_name="send-listen",
)

print(rule.rights)
print(keys.primary_connection_string)
```

For namespace-scoped keys, use `client.namespaces.create_or_update_authorization_rule(...)` and `client.namespaces.list_keys(...)` instead.

### Rotate SAS keys

Use `regenerate_keys` when you need to rotate a primary or secondary key without deleting the rule:

```python
rotated = client.hybrid_connections.regenerate_keys(
    resource_group_name="example-rg",
    namespace_name="ctxhub-relay-ns-01",
    hybrid_connection_name="orders-hc",
    authorization_rule_name="send-listen",
    parameters={
        "key_type": "PrimaryKey",
    },
)

print(rotated.primary_key)
```

### List existing resources

```python
for namespace in client.namespaces.list():
    print(namespace.name, namespace.location)

for hc in client.hybrid_connections.list_by_namespace(
    "example-rg",
    "ctxhub-relay-ns-01",
):
    print(hc.name, hc.listener_count)

for relay in client.wcf_relays.list_by_namespace(
    "example-rg",
    "ctxhub-relay-ns-01",
):
    print(relay.name, relay.relay_type)
```

## Configuration Notes

- `subscription_id` is required; the client does not infer it from the credential.
- `begin_create_or_update` on namespaces returns a poller. Wait on `.result()` before you depend on the namespace.
- Hybrid Connection and WCF relay authorization rules are narrower than namespace-level rules. Prefer the smallest scope your app actually needs.
- `user_metadata` is a plain string field in the management model. If another Azure service expects a specific JSON shape there, you need to write that exact string yourself.
- `azure-mgmt-relay` is the management SDK. Provisioning the Relay resource and using the Relay endpoint at runtime are separate concerns.

## Version-Sensitive Notes

For `1.1.0`, the documented client surface is `RelayAPI` with `TokenCredential` authentication from `azure-identity`. If older internal code expects different client names or older Azure credential helpers, verify that code before reusing it with `1.1.0`.

## Common Pitfalls

- Importing `RelayManagementClient` from older examples instead of `RelayAPI` in `1.1.0`
- Installing only `azure-mgmt-relay` and forgetting `azure-identity`
- Omitting `AZURE_SUBSCRIPTION_ID`
- Treating namespace creation like an immediate call instead of waiting for the long-running operation
- Putting arbitrary text into Hybrid Connection `user_metadata` when an integrating service expects a specific JSON string shape
- Creating namespace-scoped SAS keys when your app only needs one Hybrid Connection or WCF relay

## Official Sources Used

- https://pypi.org/project/azure-mgmt-relay/1.1.0/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-relay/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-relay/azure.mgmt.relay.relayapi?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-relay/azure.mgmt.relay.operations.namespacesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-relay/azure.mgmt.relay.operations.hybridconnectionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-relay/azure.mgmt.relay.operations.wcfrelaysoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme?view=azure-python
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/overview
- https://learn.microsoft.com/en-us/azure/templates/microsoft.relay/namespaces
- https://learn.microsoft.com/en-us/azure/templates/microsoft.relay/namespaces/hybridconnections
- https://learn.microsoft.com/en-us/azure/templates/microsoft.relay/namespaces/hybridconnections/authorizationrules
- https://learn.microsoft.com/en-us/azure/templates/microsoft.relay/namespaces/wcfrelays
- https://learn.microsoft.com/en-us/azure/app-service/app-service-hybrid-connections
