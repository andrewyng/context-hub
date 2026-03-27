---
name: mgmt-sqlvirtualmachine
description: "Azure SQL Virtual Machine management SDK for Python for registering SQL Server VMs, managing SQL VM groups, and configuring SQL IaaS extension settings"
metadata:
  languages: "python"
  versions: "0.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,sql-virtual-machine,sql,management,arm,vm"
---

# Azure SQL Virtual Machine Management SDK For Python

## Golden Rule

Use `azure-mgmt-sqlvirtualmachine` for Azure Resource Manager control-plane work on SQL Server running in Azure virtual machines. This package manages SQL virtual machine resources, SQL virtual machine groups, and availability-group-related resources exposed by the SQL IaaS extension. It does not open TDS connections or run SQL queries inside the instance.

For Python code, the safe pattern is:

1. Authenticate with `azure-identity`
2. Construct `SqlVirtualMachineManagementClient`
3. Use an operation group such as `sql_virtual_machines` or `sql_virtual_machine_groups`
4. Wait on `.result()` for `begin_*` operations

## Install

Pin the package version you actually target and install `azure-identity` alongside it:

```bash
python -m pip install "azure-mgmt-sqlvirtualmachine==0.5.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-sqlvirtualmachine==0.5.0" azure-identity
poetry add "azure-mgmt-sqlvirtualmachine==0.5.0" azure-identity
```

PyPI describes `0.5.0` as tested with Python 2.7, 3.5, 3.6, and 3.7. If you are running a newer Python version, verify compatibility in your own environment before you rely on this package in production.

## Authentication And Client Setup

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

For local development, sign in with Azure CLI:

```bash
az login
```

For CI or other non-interactive environments, set a service principal:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.sqlvirtualmachine import SqlVirtualMachineManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = SqlVirtualMachineManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Use this import path:

```python
from azure.mgmt.sqlvirtualmachine import SqlVirtualMachineManagementClient
```

The PyPI release history for `0.4.0` explicitly calls out that importing from `azure.mgmt.sqlvirtualmachine.sql_virtual_machine_management_client` is no longer the supported path.

## Core Usage

The client exposes these main operation groups in the current Microsoft Learn reference:

- `sql_virtual_machines`
- `sql_virtual_machine_groups`
- `availability_group_listeners`
- `sql_virtual_machine_troubleshoot`
- `operations`

This guide stays focused on the stable `0.5.0` line and the core SQL virtual machine flows that are clearly documented across PyPI and Learn.

### List SQL virtual machines in a resource group

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.sqlvirtualmachine import SqlVirtualMachineManagementClient

client = SqlVirtualMachineManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

for sql_vm in client.sql_virtual_machines.list_by_resource_group("rg-sqlvm-prod"):
    print(sql_vm.name, sql_vm.location, sql_vm.virtual_machine_resource_id)
```

### Get one SQL virtual machine resource

```python
sql_vm = client.sql_virtual_machines.get(
    resource_group_name="rg-sqlvm-prod",
    sql_virtual_machine_name="sqlvm-prod",
)

print(sql_vm.name)
print(sql_vm.sql_management)
print(sql_vm.sql_server_license_type)
print(sql_vm.virtual_machine_resource_id)
```

### Create or update a SQL virtual machine registration

The `SqlVirtualMachine` model requires `location`. The current model reference also documents fields such as `virtual_machine_resource_id`, `sql_server_license_type`, `sql_management`, and `storage_configuration_settings`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.sqlvirtualmachine import SqlVirtualMachineManagementClient
from azure.mgmt.sqlvirtualmachine.models import (
    SQLStorageSettings,
    SqlVirtualMachine,
    StorageConfigurationSettings,
)

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
resource_group_name = "rg-sqlvm-prod"
sql_virtual_machine_name = "sqlvm-prod"
vm_resource_id = (
    f"/subscriptions/{subscription_id}"
    f"/resourceGroups/{resource_group_name}"
    "/providers/Microsoft.Compute/virtualMachines/sqlvm-prod"
)

client = SqlVirtualMachineManagementClient(
    DefaultAzureCredential(),
    subscription_id,
)

poller = client.sql_virtual_machines.begin_create_or_update(
    resource_group_name=resource_group_name,
    sql_virtual_machine_name=sql_virtual_machine_name,
    parameters=SqlVirtualMachine(
        location="eastus",
        virtual_machine_resource_id=vm_resource_id,
        sql_server_license_type="PAYG",
        sql_management="Full",
        storage_configuration_settings=StorageConfigurationSettings(
            disk_configuration_type="NEW",
            storage_workload_type="OLTP",
            sql_data_settings=SQLStorageSettings(
                luns=[0],
                default_file_path=r"F:\SQLData",
            ),
            sql_log_settings=SQLStorageSettings(
                luns=[1],
                default_file_path=r"G:\SQLLogs",
            ),
        ),
        tags={"env": "dev"},
    ),
)

sql_vm = poller.result()
print(sql_vm.id)
print(sql_vm.provisioning_state)
```

Why this example matters for `0.5.0`:

- PyPI release notes for `0.5.0` specifically call out the new `storage_configuration_settings` parameter on `SqlVirtualMachine`
- the current Learn model reference still documents the same field and its nested `StorageConfigurationSettings` / `SQLStorageSettings` types

### List the SQL virtual machines in a SQL VM group

`list_by_sql_vm_group` is another feature explicitly called out in the `0.5.0` PyPI release notes.

```python
for sql_vm in client.sql_virtual_machines.list_by_sql_vm_group(
    resource_group_name="rg-sqlvm-prod",
    sql_virtual_machine_group_name="ag-group-prod",
):
    print(sql_vm.name, sql_vm.sql_virtual_machine_group_resource_id)
```

### List SQL VM groups in a resource group

```python
for group in client.sql_virtual_machine_groups.list_by_resource_group("rg-sqlvm-prod"):
    print(group.name, group.location)
```

## SQL VM Groups And Availability Group Work

The SQL VM service can also manage:

- SQL virtual machine groups
- availability group listeners
- troubleshooting and extension redeploy operations

Use those only after checking the exact versioned reference for your installed package. The live Learn pages describe a newer preview-generated surface than the stable `0.5.0` release on PyPI, so not every operation shown there should be assumed to exist unchanged in `0.5.0`.

For SQL VM groups specifically, the official REST examples show that create/update payloads are cluster-specific and require Windows Server Failover Cluster and Active Directory details such as `wsfcDomainProfile`, SQL image offer/SKU, and related account settings. Treat those flows as infrastructure provisioning work, not as simple CRUD updates.

## Common Pitfalls

- This is a management-plane package. It provisions and configures Azure SQL VM resources; it does not connect to SQL Server for query execution.
- Do not guess the import path from old blog posts. Use `from azure.mgmt.sqlvirtualmachine import SqlVirtualMachineManagementClient`.
- Many writes are long-running operations. If you do not call `.result()`, your script can exit before ARM finishes.
- `sql_virtual_machine_name` is the ARM resource name for the SQL VM resource, not a SQL login, instance name, or connection string.
- `virtual_machine_resource_id` must point at the underlying Azure VM resource, not at the SQL VM ARM resource you are creating.
- The package is old. PyPI `0.5.0` predates the newer preview line and predates the modern Python baselines used by current Azure SDK packages.
- The current Learn client reference defaults to API version `2022-08-01-preview`. Do not assume newer preview-only properties or operations map cleanly to a project pinned to `0.5.0`.

## Version-Sensitive Notes

- PyPI lists `0.5.0` as the latest non-prerelease release of `azure-mgmt-sqlvirtualmachine`.
- The Azure SDK package index currently lists `1.0.0b6` as the available preview line for this library family.
- PyPI release history for `0.5.0` calls out two concrete additions relative to `0.4.0`: `storage_configuration_settings` on `SqlVirtualMachine`, and `SqlVirtualMachinesOperations.list_by_sql_vm_group`.
- PyPI release history for `0.4.0` also notes a generator-driven import-path change and introduces the `sql_management` parameter on `SqlVirtualMachine`.
- If your project needs newer preview features such as assessment or troubleshooting flows documented in the live Learn reference, re-check the package version you actually install before copying those examples.

## Official Sources

- Microsoft Learn package index: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/`
- Microsoft Learn package overview: `https://learn.microsoft.com/en-us/python/api/overview/azure/mgmt-sqlvirtualmachine-readme?view=azure-python-preview`
- Microsoft Learn client reference: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.sqlvirtualmachinemanagementclient?view=azure-python-preview`
- Microsoft Learn SQL virtual machines operations: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.operations.sqlvirtualmachinesoperations?view=azure-python-preview`
- Microsoft Learn SQL virtual machine groups operations: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.operations.sqlvirtualmachinegroupsoperations?view=azure-python-preview`
- Microsoft Learn `SqlVirtualMachine` model: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.models.sqlvirtualmachine?view=azure-python-preview`
- Microsoft Learn `StorageConfigurationSettings` model: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.models.storageconfigurationsettings?view=azure-python-preview`
- Microsoft Learn `SQLStorageSettings` model: `https://learn.microsoft.com/en-us/python/api/azure-mgmt-sqlvirtualmachine/azure.mgmt.sqlvirtualmachine.models.sqlstoragesettings?view=azure-python-preview`
- Microsoft Learn Azure Identity overview: `https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication/overview`
- Microsoft Learn `DefaultAzureCredential`: `https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python`
- Microsoft Learn Azure SDK package index: `https://learn.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-library-package-index`
- PyPI package page: `https://pypi.org/project/azure-mgmt-sqlvirtualmachine/`
