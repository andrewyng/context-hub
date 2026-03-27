---
name: mgmt-loganalytics
description: "Azure Log Analytics management SDK for Python for workspaces, tables, shared keys, query packs, and purge operations"
metadata:
  languages: "python"
  versions: "13.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,log-analytics,azure-monitor,management,arm,workspaces,tables,query-packs"
---

# Azure Log Analytics Management SDK for Python

## Golden Rule

Use `azure-mgmt-loganalytics` for control-plane management of Log Analytics resources through Azure Resource Manager: workspaces, workspace tables, shared keys, query packs, linked services, data exports, and purge operations. Install `azure-identity` with it and pass an explicit Azure subscription ID when you create `LogAnalyticsManagementClient`.

This guide is pinned to `azure-mgmt-loganalytics 13.1.1`, the current stable PyPI release as of March 13, 2026. PyPI also says this package requires Python 3.9+.

## Install

```bash
python -m pip install "azure-mgmt-loganalytics==13.1.1" "azure-identity"
```

Common alternatives:

```bash
uv add "azure-mgmt-loganalytics==13.1.1" "azure-identity"
poetry add "azure-mgmt-loganalytics==13.1.1" "azure-identity"
```

## Authentication And Setup

For local development, `DefaultAzureCredential()` usually works best after `az login`.

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
from azure.mgmt.loganalytics import LogAnalyticsManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = LogAnalyticsManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

For local scripts that should use your Azure CLI session explicitly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.loganalytics import LogAnalyticsManagementClient

client = LogAnalyticsManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## High-Value Operation Groups

The current `LogAnalyticsManagementClient` exposes these practical operation groups:

- `workspaces`
- `tables`
- `shared_keys`
- `query_packs`
- `available_service_tiers`
- `deleted_workspaces`
- `workspace_purge`
- `data_exports`
- `linked_storage_accounts`
- `summary_logs`

Use this package when you are provisioning or configuring Log Analytics resources. It is not the package you reach for first when application code needs to run log queries as part of normal request handling.

## Core Usage

### Create or update a workspace

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.loganalytics import LogAnalyticsManagementClient
from azure.mgmt.loganalytics.models import Workspace, WorkspaceSku

resource_group_name = "example-rg"
workspace_name = "example-law"

client = LogAnalyticsManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

workspace = client.workspaces.begin_create_or_update(
    resource_group_name=resource_group_name,
    workspace_name=workspace_name,
    parameters=Workspace(
        location="eastus",
        sku=WorkspaceSku(name="PerGB2018"),
        retention_in_days=30,
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
).result()

print(workspace.id)
print(workspace.customer_id)
```

`begin_create_or_update()` is a long-running operation, so call `.result()` when you need the workspace before continuing.

### List, get, and update a workspace

```python
for workspace in client.workspaces.list_by_resource_group("example-rg"):
    print(workspace.name, workspace.location, workspace.provisioning_state)
```

```python
workspace = client.workspaces.get(
    resource_group_name="example-rg",
    workspace_name="example-law",
)

print(workspace.customer_id)
print(workspace.sku.name)
```

```python
from azure.mgmt.loganalytics.models import WorkspacePatch

updated = client.workspaces.update(
    resource_group_name="example-rg",
    workspace_name="example-law",
    parameters=WorkspacePatch(
        retention_in_days=60,
        tags={
            "env": "dev",
            "owner": "platform-team",
        },
    ),
)

print(updated.retention_in_days)
```

### Delete a workspace and understand recovery behavior

```python
delete_poller = client.workspaces.begin_delete(
    resource_group_name="example-rg",
    workspace_name="example-law",
)
delete_poller.result()
```

The current docs say a normal delete keeps the workspace name reserved for 14 days so the workspace can be recovered by creating it again with the same name, subscription, resource group, and location. Use `force=True` only when you intentionally want permanent deletion with no recovery option.

### Inspect available service tiers

```python
tiers = client.available_service_tiers.list_by_workspace(
    resource_group_name="example-rg",
    workspace_name="example-law",
)

for tier in tiers:
    print(tier.name)
```

### Read and update workspace tables

Get one table:

```python
table = client.tables.get(
    resource_group_name="example-rg",
    workspace_name="example-law",
    table_name="Heartbeat",
)

print(table.name, table.plan, table.retention_in_days)
```

List tables in a workspace:

```python
pages = client.tables.list_by_workspace(
    resource_group_name="example-rg",
    workspace_name="example-law",
)

for page in pages:
    for table in page.value:
        print(table.name, table.plan, table.retention_in_days)
```

Update table retention or plan:

```python
from azure.mgmt.loganalytics.models import Table

updated_table = client.tables.update(
    resource_group_name="example-rg",
    workspace_name="example-law",
    table_name="Heartbeat",
    parameters=Table(
        retention_in_days=30,
        total_retention_in_days=60,
        plan="Analytics",
    ),
)

print(updated_table.total_retention_in_days)
```

The `Table` model documents these important constraints:

- `retention_in_days` for Analytics tables must be between 4 and 730, or `-1` to inherit the workspace retention.
- `total_retention_in_days` must be between 4 and 4383, or `-1` to inherit `retention_in_days`.
- `plan` can be `Basic`, `Analytics`, or `Auxiliary`.

### List query packs in a resource group

```python
for query_pack in client.query_packs.list_by_resource_group("example-rg"):
    print(query_pack.name, query_pack.id)
```

The SDK also exposes `create_or_update`, `create_or_update_without_name`, `get`, `delete`, and `update_tags` on `client.query_packs`.

### Get workspace shared keys

```python
keys = client.shared_keys.get_shared_keys(
    resource_group_name="example-rg",
    workspace_name="example-law",
)

print(keys.primary_shared_key)
print(keys.secondary_shared_key)
```

The SDK also exposes `client.shared_keys.regenerate(...)`. Treat that as a credential rotation event because existing agents or ingestion pipelines that still use an old shared key will stop authenticating.

### Submit a purge request and poll its status

```python
from azure.mgmt.loganalytics.models import WorkspacePurgeBody, WorkspacePurgeBodyFilters

response = client.workspace_purge.purge(
    resource_group_name="example-rg",
    workspace_name="example-law",
    body=WorkspacePurgeBody(
        table="Heartbeat",
        filters=[
            WorkspacePurgeBodyFilters(
                column="TimeGenerated",
                operator=">=",
                value="2026-01-01T00:00:00Z",
            )
        ],
    ),
)
```

Then poll the purge operation with the purge ID returned by that response:

```python
purge_id = "<operation-id-from-purge-response>"

status = client.workspace_purge.get_purge_status(
    resource_group_name="example-rg",
    workspace_name="example-law",
    purge_id=purge_id,
)

print(status.status)
```

## Configuration Notes

- `subscription_id` is required. The client constructor does not infer it from the credential.
- The client constructor documents a default ARM API version of `2025-07-01`. The Learn reference warns that overriding `api_version` may result in unsupported behavior.
- The `Workspace` model supports `public_network_access_for_ingestion` and `public_network_access_for_query` with `Enabled`, `Disabled`, and `SecuredByPerimeter`.
- `Workspace.default_data_collection_rule_resource_id` expects a full ARM resource ID.
- If you authenticate successfully but requests still fail, check Azure RBAC on the subscription, resource group, or workspace. Credential success does not imply authorization success.

## Version-Sensitive Notes

### 13.1.1

PyPI release history for `13.1.1` says the change in this patch release is:

- `RuleDefinition.destination_table` is now writable

### 13.1.0

PyPI release history for `13.1.0` says this line added:

- `WorkspacesOperations.begin_failback`
- `WorkspacesOperations.begin_failover`
- `WorkspacesOperations.begin_reconcile_nsp`
- `WorkspacesOperations.get_nsp`
- `WorkspacesOperations.list_nsp`
- `SummaryLogsOperations`

If you copy older examples that do not mention failover, network security perimeter, or summary logs, check whether they were written against an earlier `13.x` preview or a pre-`13.1.0` stable release.

## Common Pitfalls

- Installing `azure-mgmt-loganalytics` without `azure-identity`
- Forgetting `AZURE_SUBSCRIPTION_ID`
- Treating `begin_create_or_update()` and `begin_delete()` like synchronous calls and never waiting on the poller
- Assuming `client.tables.list_by_workspace()` yields `Table` objects directly instead of paged `TablesListResult` pages
- Using `force=True` on workspace deletion when you actually wanted the default recoverable-delete behavior
- Regenerating shared keys without rotating dependent agents or ingestion endpoints
- Using purge for routine cleanup; the official docs say purge is throttled at 50 requests per hour and only supported for GDPR-driven data removal

## Official Sources Used

- https://pypi.org/project/azure-mgmt-loganalytics/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.loganalyticsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.operations.workspacesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.workspace?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.workspacepatch?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.workspacesku?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.operations.tablesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.table?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.operations.querypacksoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.operations.sharedkeysoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.sharedkeys?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.operations.workspacepurgeoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.workspacepurgebody?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models.workspacepurgebodyfilters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-loganalytics/azure.mgmt.loganalytics.models?view=azure-python
