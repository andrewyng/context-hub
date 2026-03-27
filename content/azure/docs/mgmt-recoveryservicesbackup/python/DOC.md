---
name: mgmt-recoveryservicesbackup
description: "Azure Recovery Services Backup management SDK for Python for vault backup policies, protected items, recovery points, jobs, and on-demand backups"
metadata:
  languages: "python"
  versions: "10.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,backup,recovery-services,management,vault,python"
---

# Azure Recovery Services Backup Management SDK for Python

## Golden Rule

Use `azure-mgmt-recoveryservicesbackup` for Azure Backup management-plane operations inside an existing Recovery Services vault: listing policies, inspecting protected items, enumerating recovery points, checking jobs, and triggering backup or restore operations.

For `10.0.0`, pair it with `azure-identity`, authenticate with a `TokenCredential`, and import the main client from `azure.mgmt.recoveryservicesbackup`. Do not copy older examples that still use `azure.common.credentials` or old `activestamp` imports.

## Install

This package requires Python 3.9+.

```bash
python -m pip install "azure-mgmt-recoveryservicesbackup==10.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-recoveryservicesbackup==10.0.0" azure-identity
poetry add "azure-mgmt-recoveryservicesbackup==10.0.0" azure-identity
```

Minimum environment variables:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_BACKUP_RESOURCE_GROUP="example-backup-rg"
export AZURE_BACKUP_VAULT_NAME="example-vault"
```

If you authenticate with a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

You also need an existing Recovery Services vault and at least one protected item if you want to inspect backup state or trigger backups.

## Authentication And Client Setup

Use `DefaultAzureCredential()` for reusable code and CI, or `AzureCliCredential()` for local scripts after `az login`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservicesbackup import RecoveryServicesBackupClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
resource_group_name = os.environ["AZURE_BACKUP_RESOURCE_GROUP"]
vault_name = os.environ["AZURE_BACKUP_VAULT_NAME"]

credential = DefaultAzureCredential()
client = RecoveryServicesBackupClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.recoveryservicesbackup import RecoveryServicesBackupClient

client = RecoveryServicesBackupClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The current client docs show a default ARM API version of `2025-02-01`. The constructor accepts `api_version=...`, but Microsoft warns that overriding the default may result in unsupported behavior.

## A Small Helper For Backup Item Identifiers

Many operations need `fabric_name`, `container_name`, and `protected_item_name`. A protected item resource ID already contains all three, so parse them from `item.id` instead of hand-building strings.

```python
def backup_item_names(resource_id: str) -> tuple[str, str, str]:
    parts = resource_id.strip("/").split("/")
    fabric_name = parts[parts.index("backupFabrics") + 1]
    container_name = parts[parts.index("protectionContainers") + 1]
    protected_item_name = parts[parts.index("protectedItems") + 1]
    return fabric_name, container_name, protected_item_name
```

## List Backup Policies In A Vault

Use `client.backup_policies.list(...)` to enumerate policies, then `client.protection_policies.get(...)` when you need one policy by name.

```python
for policy in client.backup_policies.list(vault_name, resource_group_name):
    print(policy.name, type(policy.properties).__name__)

policy = client.protection_policies.get(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    policy_name="DefaultPolicy",
)

print(policy.name)
print(type(policy.properties).__name__)
```

## List Protected Items And Inspect One Item

`backup_protected_items.list(...)` gives you the protected items in the vault. `protected_items.get(...)` fetches one item using its fabric/container/item identifiers.

```python
protected_items = list(
    client.backup_protected_items.list(
        vault_name=vault_name,
        resource_group_name=resource_group_name,
    )
)

for item in protected_items:
    props = item.properties
    print(
        item.name,
        getattr(props, "friendly_name", None),
        getattr(props, "policy_name", None),
        getattr(props, "last_backup_status", None),
    )

selected_item = protected_items[0]
fabric_name, container_name, protected_item_name = backup_item_names(selected_item.id)

protected_item = client.protected_items.get(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    fabric_name=fabric_name,
    container_name=container_name,
    protected_item_name=protected_item_name,
)

props = protected_item.properties
print(protected_item.name)
print(getattr(props, "friendly_name", None))
print(getattr(props, "source_resource_id", None))
print(getattr(props, "protection_state", None))
print(getattr(props, "last_recovery_point", None))
```

For Azure IaaS VM items, the workload-specific model includes useful fields such as `container_name`, `friendly_name`, `policy_name`, `source_resource_id`, `protection_state`, `last_backup_status`, and `last_recovery_point`.

## List Recovery Points For A Protected Item

Use the same identifiers from the protected item to list recovery points:

```python
for recovery_point in client.recovery_points.list(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    fabric_name=fabric_name,
    container_name=container_name,
    protected_item_name=protected_item_name,
):
    print(recovery_point.name, type(recovery_point.properties).__name__)
```

If you already know the recovery point ID, fetch one directly:

```python
recovery_point = client.recovery_points.get(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    fabric_name=fabric_name,
    container_name=container_name,
    protected_item_name=protected_item_name,
    recovery_point_id="348916168024334",
)

print(recovery_point.name)
```

## Trigger An On-Demand Backup For An Azure VM

`client.backups.trigger(...)` is the SDK call for an on-demand backup. For Azure IaaS VM items, send a `BackupRequestResource` with `IaasVMBackupRequest`.

```python
from datetime import datetime, timedelta, timezone

from azure.mgmt.recoveryservicesbackup.models import (
    BackupRequestResource,
    IaasVMBackupRequest,
)

request = BackupRequestResource(
    properties=IaasVMBackupRequest(
        recovery_point_expiry_time_in_utc=datetime.now(timezone.utc) + timedelta(days=30)
    )
)

client.backups.trigger(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    fabric_name=fabric_name,
    container_name=container_name,
    protected_item_name=protected_item_name,
    parameters=request,
)
```

For Azure VM backup flows, the REST API examples show `fabric_name` as `Azure`. Other workload types use different item identifiers and workload-specific backup request models such as Azure File Share or Azure Workload backup requests.

This operation is asynchronous. The REST API returns `Azure-AsyncOperation` and `Location` headers for tracking, and the client exposes `backup_operation_statuses.get(...)` if you already have the operation ID:

```python
operation_status = client.backup_operation_statuses.get(
    vault_name=vault_name,
    resource_group_name=resource_group_name,
    operation_id="00000000-0000-0000-0000-000000000000",
)

print(operation_status.status)
```

## List Recent Backup Jobs

Use `backup_jobs.list(...)` to inspect vault job activity:

```python
for job in client.backup_jobs.list(vault_name, resource_group_name):
    props = job.properties
    print(
        job.name,
        getattr(props, "operation", None),
        getattr(props, "status", None),
        getattr(props, "start_time", None),
    )
```

For Azure IaaS VM jobs, workload-specific properties include `entity_friendly_name`, `operation`, `status`, `start_time`, `end_time`, and `is_user_triggered`.

## Common Pitfalls

- `azure-mgmt-recoveryservicesbackup` is a management-plane client. It manages backup configuration and operations in a vault; it is not a data-plane SDK for reading backed-up content directly.
- `backup_policies.list(...)` and `protection_policies.get(...)` are different operation groups. Use the list API to enumerate policies and the protection policy API when you need a specific policy or policy update flow.
- Most protected-item operations need `fabric_name`, `container_name`, and `protected_item_name`. Parse them from `protected_item.id` instead of guessing string formats.
- `backups.trigger(...)` is workload-specific. `IaasVMBackupRequest` is correct for Azure VM items, but Azure File Share and Azure Workload items need different request models.
- `10.0.0` changed imports: `passivestamp` moved into the separate `azure-mgmt-recoveryservicesbackup-passivestamp` package, and older `azure.mgmt.recoveryservicesbackup.activestamp` imports should be updated to direct imports from `azure.mgmt.recoveryservicesbackup`.
- Older Azure SDK examples that still use `azure.common.credentials` or `msrestazure.azure_active_directory` are from a previous SDK generation and should not be copied into new `10.0.0` code.

## Official Sources Used

- https://learn.microsoft.com/en-us/python/api/overview/azure/mgmt-recoveryservicesbackup-readme?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.recoveryservicesbackupclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.backuppoliciesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.backupprotecteditemsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.protecteditemsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.recoverypointsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.backupsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.backupoperationstatusesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.operations.backupjobsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.models.iaasvmbackuprequest?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.models.azureiaascomputevmprotecteditem?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservicesbackup/azure.mgmt.recoveryservicesbackup.models.azureiaasvmjob?view=azure-python
- https://learn.microsoft.com/en-us/rest/api/backup/backups/trigger?view=rest-backup-2025-02-01
- https://pypi.org/project/azure-mgmt-recoveryservicesbackup/
