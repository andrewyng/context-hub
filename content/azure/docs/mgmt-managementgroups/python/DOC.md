---
name: mgmt-managementgroups
description: "Azure management group SDK for Python for tenant hierarchy, management group CRUD, subscriptions, and hierarchy settings"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,management-groups,tenant,subscriptions,governance"
---

# azure-mgmt-managementgroups Python Package Guide

## What This Package Is For

`azure-mgmt-managementgroups` is the Azure Resource Manager management-plane SDK for tenant hierarchy operations:

- list and inspect management groups
- create, update, and delete management groups
- list descendants
- move subscriptions into or out of management groups
- read or update tenant hierarchy settings

Import path:

```python
from azure.mgmt.managementgroups import ManagementGroupsAPI
```

Use this package for Azure governance and tenant hierarchy work. Do not use it for subscription-scoped resources like storage accounts, virtual machines, or Key Vault objects; those belong in service-specific management SDKs.

## Install

Install the management client and Azure Identity together:

```bash
python -m pip install "azure-mgmt-managementgroups==1.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-managementgroups==1.1.0" azure-identity
poetry add "azure-mgmt-managementgroups==1.1.0" azure-identity
```

PyPI lists `1.1.0` as supporting Python `>=3.9`.

## Authentication And Setup

For local development, sign in with Azure CLI:

```bash
az login
```

For service principal auth, set the standard Azure Identity environment variables:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic setup with `DefaultAzureCredential`:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

credential = DefaultAzureCredential()
client = ManagementGroupsAPI(credential=credential)
```

For a local script that should only use Azure CLI credentials:

```python
from azure.identity import AzureCliCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(credential=AzureCliCredential())
```

Important setup notes:

- `ManagementGroupsAPI` does not take a subscription ID.
- The current package documentation on PyPI uses `azure-identity` credentials. Older task articles still show `azure.common` and `azure-cli-core`; do not copy those auth patterns into new code.
- Azure management group APIs are tenant-level ARM APIs. Authentication can succeed while later calls still fail because the principal lacks tenant or root management group permissions.

## Core Usage

The current client exposes these main operation groups:

- `management_groups`
- `management_group_subscriptions`
- `entities`
- `operations`
- `hierarchy_settings`

### List Management Groups Visible To The Credential

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(DefaultAzureCredential())

for group in client.management_groups.list():
    print(group.name, group.id)
```

### Get One Management Group And Expand Children

Use `expand="children"` to include direct children. Add `recurse=True` if you need the full nested hierarchy under that group.

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(DefaultAzureCredential())

group = client.management_groups.get(
    group_id="contoso-platform",
    expand="children",
    recurse=True,
)

print(group.name)
print(group.display_name)

for child in group.children or []:
    print(child.name, child.type)
```

### Create A Management Group

Management group creation is a long-running ARM operation. Use the `begin_*` method and wait for the poller when you need the result.

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(DefaultAzureCredential())

poller = client.management_groups.begin_create_or_update(
    group_id="contoso-platform",
    create_management_group_request={
        "name": "contoso-platform",
        "display_name": "Contoso Platform",
    },
)

group = poller.result()
print(group.id)
print(group.display_name)
```

### Move A Subscription Under A Management Group

Associate a subscription to a management group with `management_group_subscriptions.create()`:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

subscription_id = "00000000-0000-0000-0000-000000000000"

client = ManagementGroupsAPI(DefaultAzureCredential())
association = client.management_group_subscriptions.create(
    group_id="contoso-platform",
    subscription_id=subscription_id,
)

print(association.id)
```

To remove the subscription association:

```python
client.management_group_subscriptions.delete(
    group_id="contoso-platform",
    subscription_id=subscription_id,
)
```

### Inspect Tenant Hierarchy Settings

Hierarchy settings apply to the tenant root management group. Use them to inspect defaults such as whether authorization is required for group creation and which management group becomes the default for new subscriptions.

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(DefaultAzureCredential())

settings = client.hierarchy_settings.get(
    group_id="contoso-root"
)

print(settings.require_authorization_for_group_creation)
print(settings.default_management_group)
```

### Inspect Supported ARM Operations

This is useful when you need to confirm the tenant hierarchy operations the installed client exposes:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managementgroups import ManagementGroupsAPI

client = ManagementGroupsAPI(DefaultAzureCredential())

for operation in client.operations.list():
    print(operation.name)
```

## Configuration Notes

- `management_groups.get()` supports `expand` and `recurse` for hierarchy traversal. Use those instead of making one request per child group when you need the tree.
- `begin_create_or_update()` and `begin_delete()` return Azure long-running operation pollers.
- `hierarchy_settings` is for the tenant root management group, not for arbitrary child groups.
- `management_group_subscriptions.create()` changes hierarchy placement, not subscription metadata like display name or tags.
- If you keep the client around in a long-lived process, close it when done.

## Version-Sensitive Notes For `1.1.0`

- PyPI lists stable version `1.1.0`, released on November 8, 2023.
- PyPI release notes for `1.1.0` call out an import fix and an updated code generator.
- PyPI `1.0.0b1` notes switched examples to `azure-identity` and added async support. If you find much older samples using `ServicePrincipalCredentials` or `get_azure_cli_credentials`, treat them as outdated.
- Microsoft Learn still has a management group task article that uses the older `create_or_update()` method name and legacy auth imports. For current projects on `1.1.0`, prefer the generated client reference and current PyPI guidance.

## Common Pitfalls

- Do not pass a subscription ID to `ManagementGroupsAPI`; this client is tenant-scoped.
- Do not reuse older `azure.common.credentials` or `azure-cli-core` authentication snippets. Use `azure-identity`.
- Creating the first management group in a directory can take up to 15 minutes.
- Hierarchy changes are not always immediately visible everywhere. Azure Resource Manager can cache management group changes for up to 30 minutes.
- Moving a subscription into or out of a management group requires the right RBAC assignments. Authentication alone is not enough.
- If a subscription has not been in another management group before, Microsoft notes that you generally need `Owner` on the subscription to move it.
- `begin_delete()` only works when the target management group has no child groups or subscriptions under it.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-managementgroups/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managementgroups/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managementgroups/azure.mgmt.managementgroups.managementgroupsapi?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managementgroups/azure.mgmt.managementgroups.operations.managementgroupsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managementgroups/azure.mgmt.managementgroups.operations.managementgroupsubscriptionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managementgroups/azure.mgmt.managementgroups.operations.hierarchysettingsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.azureclicredential?view=azure-python
- https://learn.microsoft.com/en-us/azure/governance/management-groups/overview
- https://learn.microsoft.com/en-us/azure/governance/management-groups/create-management-group-python
