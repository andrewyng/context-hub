---
name: mgmt-recoveryservices
description: "Azure Recovery Services management SDK for Python for vault lifecycle, name checks, private link discovery, usage queries, and related ARM operations"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,recovery-services,management,arm,backup,site-recovery,python"
---

# Azure Recovery Services Management SDK for Python

## Golden Rule

Use `azure-mgmt-recoveryservices` for management-plane work on Recovery Services vaults: creating the vault resource, checking name availability, listing vault metadata, reading usage, and discovering related ARM resources such as private link resources. Install `azure-identity` with it and authenticate with `DefaultAzureCredential()` unless you have a more specific credential for the runtime.

Do not use this package for backup items, backup policies, restore jobs, or Site Recovery replication workflows. Those APIs live in sibling Recovery Services management packages.

## Install

Pin the package version your project expects and install Azure Identity alongside it:

```bash
python -m pip install "azure-mgmt-recoveryservices==4.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-recoveryservices==4.0.0" azure-identity
poetry add "azure-mgmt-recoveryservices==4.0.0" azure-identity
```

`4.0.0` requires Python `3.9+`.

## Authentication And Setup

Use `DefaultAzureCredential` for code that should work both locally and in Azure. It checks environment-based service principal settings first, then workload identity, managed identity, and developer credentials such as Azure CLI.

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

For local development, `az login` is usually enough because `DefaultAzureCredential` can reuse Azure CLI authentication.

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

with RecoveryServicesClient(
    credential=credential,
    subscription_id=subscription_id,
) as client:
    for vault in client.vaults.list_by_subscription_id():
        print(vault.name, vault.location)
```

Use the client as a context manager, or call `.close()`, so the underlying HTTP transport is cleaned up.

## Core Usage

The main operation groups exposed by `RecoveryServicesClient` include:

- `vaults`
- `recovery_services`
- `private_link_resources`
- `usages`
- `deleted_vaults`
- `vault_certificates`

### Check Vault Name Availability Before Create

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

resource_group_name = "example-rg"
location = "westus2"
vault_name = "example-recovery-vault"

with RecoveryServicesClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    availability = client.recovery_services.check_name_availability(
        resource_group_name=resource_group_name,
        location=location,
        input={
            "name": vault_name,
            "type": "Microsoft.RecoveryServices/Vaults",
        },
    )

    print(availability.name_available)
    print(availability.reason)
    print(availability.message)
```

The service can keep a deleted vault name unavailable for up to 24 hours while deleted resources are cleaned up. Check first instead of assuming a recent delete immediately frees the name.

### Create Or Update A Vault

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

resource_group_name = "example-rg"
vault_name = "example-recovery-vault"

with RecoveryServicesClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    vault = client.vaults.begin_create_or_update(
        resource_group_name=resource_group_name,
        vault_name=vault_name,
        vault={
            "location": "westus2",
            "sku": {"name": "Standard"},
            "tags": {
                "env": "dev",
                "owner": "context-hub",
            },
        },
    ).result()

    print(vault.id)
```

Create the vault in the same Azure region as the workloads you plan to protect. The Recovery Services vault resource is regional.

### Get, List, And Update Vault Metadata

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

resource_group_name = "example-rg"
vault_name = "example-recovery-vault"

with RecoveryServicesClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for vault in client.vaults.list_by_resource_group(resource_group_name):
        print(vault.name, vault.location, vault.tags)

    current = client.vaults.get(resource_group_name, vault_name)

    desired_tags = dict(current.tags or {})
    desired_tags["cost-center"] = "finops-001"

    updated = client.vaults.begin_update(
        resource_group_name=resource_group_name,
        vault_name=vault_name,
        vault={
            "tags": desired_tags,
        },
    ).result()

    print(updated.tags)
```

`begin_create_or_update`, `begin_update`, and `begin_delete` are long-running ARM operations. Call `.result()` when the next step depends on completion.

### Discover Private Link Resources And Vault Usage

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

resource_group_name = "example-rg"
vault_name = "example-recovery-vault"

with RecoveryServicesClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    for resource in client.private_link_resources.list(resource_group_name, vault_name):
        print(resource.name, resource.id)

    for usage in client.usages.list_by_vaults(resource_group_name, vault_name):
        print(usage.current_value, usage.limit, usage.unit)
```

This is the package to use when you need ARM-level vault inventory or capacity/usage information in automation before handing off to backup-specific SDKs.

### Delete A Vault

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.recoveryservices import RecoveryServicesClient

with RecoveryServicesClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
) as client:
    client.vaults.begin_delete(
        resource_group_name="example-rg",
        vault_name="example-recovery-vault",
    ).result()
```

Vault deletion is not just ARM cleanup. Azure Backup documentation calls out several dependencies that block deletion, including backup items, soft-deleted items, registered servers or storage accounts, private endpoints, and Site Recovery state. Clear those dependencies first.

## Configuration Notes

- `subscription_id` is required. The client does not infer it from the credential.
- `DefaultAzureCredential` tries environment credentials before Azure CLI. Old `AZURE_CLIENT_ID` or `AZURE_TENANT_ID` values can shadow a working `az login`.
- Keep one credential and one client instance for a unit of work instead of constructing them repeatedly inside loops.
- The client constructor accepts an `api_version`, but the package already targets the current supported Recovery Services management API. Override it only when you have a verified reason.

## Common Pitfalls

- Installing `azure-mgmt-recoveryservices` without `azure-identity`
- Using this package for backup jobs, restore points, or protected items instead of the backup-specific SDK
- Forgetting `AZURE_SUBSCRIPTION_ID`
- Treating `begin_*` methods like synchronous calls and skipping `.result()`
- Reusing a deleted vault name immediately and getting a name-availability failure
- Deleting the vault before removing backup or Site Recovery dependencies
- Assuming tag updates are additive. Send the full desired tag set in your patch payload.

## Version-Sensitive Notes

### `4.0.0`

The `4.0.0` package page calls out a few behavior changes compared with older `azure-mgmt-recoveryservices` releases:

- async client support is available under `azure.mgmt.recoveryservices.aio`
- long-running operations use `azure.core.polling.LROPoller`
- several legacy operation names and model names were renamed to match current Azure conventions

If you are upgrading older code, verify any pre-`4.x` examples before copying them into a current project.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-recoveryservices/4.0.0/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservices/?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservices/azure.mgmt.recoveryservices.recoveryservicesclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-recoveryservices/azure.mgmt.recoveryservices.operations.vaultsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/overview/azure/recoveryservices?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
- https://learn.microsoft.com/en-us/azure/backup/backup-azure-delete-vault
- https://learn.microsoft.com/en-us/azure/backup/backup-create-rs-vault
