---
name: mgmt-datalake-store
description: "Azure Data Lake Storage Gen1 management SDK for Python for account lifecycle, account inspection, firewall rules, and location capability checks"
metadata:
  languages: "python"
  versions: "0.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,adls,gen1,management,python,networking,legacy"
---

# azure-mgmt-datalake-store Python Package Guide

## Golden Rule

Use `azure-mgmt-datalake-store` only to manage **Azure Data Lake Storage Gen1** accounts. This is a management-plane package for account metadata, firewall rules, virtual network rules, trusted identity providers, and location-level capability and usage checks. It is not the file I/O SDK.

Azure Data Lake Storage Gen1 was retired on **February 29, 2024**, and Microsoft now says you cannot create new Gen1 accounts unless you already have one. For new storage work, use **Azure Data Lake Storage Gen2** and the `azure-storage-file-datalake` package instead.

## Install

Pin the package if you are maintaining an older codebase that still targets the stable `0.5.0` line:

```bash
python -m pip install "azure-mgmt-datalake-store==0.5.0" azure-common
```

If you are using a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "azure-mgmt-datalake-store==0.5.0" azure-common
```

The official Azure management sample for this package used these environment variables:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

## Authentication And Client Setup

The stable `0.5.0` package line comes from the older Azure management SDK generation. In practice, the safe default is service-principal auth via `azure-common`:

```python
import os

from azure.common.credentials import ServicePrincipalCredentials
from azure.mgmt.datalake.store import DataLakeStoreAccountManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

credentials = ServicePrincipalCredentials(
    client_id=os.environ["AZURE_CLIENT_ID"],
    secret=os.environ["AZURE_CLIENT_SECRET"],
    tenant=os.environ["AZURE_TENANT_ID"],
)

client = DataLakeStoreAccountManagementClient(credentials, subscription_id)
```

Keep the subscription ID separate from the credentials. The management client needs both.

## Core Usage

The client exposes these main operation groups:

- `accounts`
- `firewall_rules`
- `virtual_network_rules`
- `trusted_id_providers`
- `locations`

### List And Inspect Existing Accounts

```python
import os

from azure.common.credentials import ServicePrincipalCredentials
from azure.mgmt.datalake.store import DataLakeStoreAccountManagementClient

credentials = ServicePrincipalCredentials(
    client_id=os.environ["AZURE_CLIENT_ID"],
    secret=os.environ["AZURE_CLIENT_SECRET"],
    tenant=os.environ["AZURE_TENANT_ID"],
)

client = DataLakeStoreAccountManagementClient(
    credentials,
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

for account in client.accounts.list():
    print(account.name, account.location)

account = client.accounts.get("example-rg", "existing-adlsg1")
print(account.name)
print(account.location)
print(account.type)
```

Use this when you are inventorying existing Gen1 accounts before cleanup or migration.

### Check Regional Capability And Current Usage

`locations.get_capability()` and `locations.get_usage()` are useful when you need to understand what the subscription can still do in a region:

```python
capability = client.locations.get_capability("eastus2")
print(capability)

for usage in client.locations.get_usage("eastus2"):
    print(usage)
```

The location string must be the Azure region name without whitespace, such as `eastus2`.

### Create Or Update An Existing Account Definition

Current Microsoft Learn reference pages show `begin_create()` and `begin_update()` for this package family. If your installed `0.5.0` build exposes older `create()` or `update()` methods instead, use the older name with the same model object.

```python
from azure.mgmt.datalake.store.models import CreateDataLakeStoreAccountParameters

create_parameters = CreateDataLakeStoreAccountParameters(
    location="eastus2",
    tags={"env": "legacy"},
)

create_call = getattr(client.accounts, "begin_create", None) or client.accounts.create
result = create_call("example-rg", "existing-adlsg1", create_parameters)

if hasattr(result, "result"):
    account = result.result()
else:
    account = result

print(account.name)
```

Minimal update example:

```python
from azure.mgmt.datalake.store.models import UpdateDataLakeStoreAccountParameters

update_parameters = UpdateDataLakeStoreAccountParameters(
    tags={"env": "migration", "owner": "platform"},
)

update_call = getattr(client.accounts, "begin_update", None) or client.accounts.update
result = update_call("example-rg", "existing-adlsg1", update_parameters)

if hasattr(result, "result"):
    account = result.result()
else:
    account = result

print(account.tags)
```

### Update A Firewall Rule

Firewall rules are managed from the `firewall_rules` operation group, not through generic ARM networking APIs:

```python
from azure.mgmt.datalake.store.models import UpdateFirewallRuleParameters

rule = client.firewall_rules.update(
    "example-rg",
    "existing-adlsg1",
    "office-ip",
    UpdateFirewallRuleParameters(
        start_ip_address="203.0.113.10",
        end_ip_address="203.0.113.10",
    ),
)

print(rule.name)
print(rule.start_ip_address, rule.end_ip_address)
```

To inspect current firewall rules first:

```python
for rule in client.firewall_rules.list_by_account("example-rg", "existing-adlsg1"):
    print(rule.name, rule.start_ip_address, rule.end_ip_address)
```

## Configuration Notes

- This package manages the Azure resource, not files and folders inside the account.
- The service endpoint is Azure Resource Manager, so the subscription ID is always part of the client context.
- The current Learn reference documents `accounts.begin_create`, `accounts.begin_delete`, `accounts.begin_update`, `accounts.get`, `accounts.list`, `accounts.list_by_resource_group`, `accounts.check_name_availability`, and `accounts.enable_key_vault`.
- `virtual_network_rules` and `trusted_id_providers` are exposed as separate operation groups if the account still uses those Gen1 controls.
- The generated client also exposes `locations.get_capability` and `locations.get_usage` for subscription-level regional checks.

## Common Pitfalls

- Do not use this package for ADLS Gen2 data access. Use `azure-storage-file-datalake` for current file and directory operations.
- Do not assume Gen1 is still a viable target for new deployments. The service retired on February 29, 2024, and Microsoft says new Gen1 accounts cannot be created unless you already have one.
- Do not copy current Learn auth examples blindly into a codebase pinned to `0.5.0`. The old stable line uses legacy Azure management auth patterns, while current Learn reference pages are generated from a newer package line.
- Do not instantiate operation classes like `AccountsOperations` or `FirewallRulesOperations` directly. Use them through `DataLakeStoreAccountManagementClient`.
- Do not forget the subscription ID. Authentication settings alone are not enough to build the management client.
- If you are updating older scripts, watch for method-name drift: current docs show `begin_create` and `begin_update`, while older installs may still expose `create` and `update`.
- Firewall and virtual network settings are account-level controls for Gen1. They are not interchangeable with ADLS Gen2 storage firewall guidance.

## Version-Sensitive Notes For `0.5.0`

- The official Azure sample page for this package still describes the older management-library generation and says the SDK sample was compatible with Python `2.7`, `3.3`, `3.4`, `3.5`, and `3.6`.
- Current Microsoft Learn API reference pages for `azure-mgmt-datalake-store` are on the preview doc view and show the newer generated method shape, including `begin_*` long-running operations.
- That means there is real documentation drift between the stable `0.5.0` package line and the newer reference pages. Keep your dependency pinned and verify the methods exposed by your installed package before bulk-updating old scripts.
- If you are starting a new project rather than maintaining existing Gen1 resources, skip this package and move straight to ADLS Gen2 guidance.

## Official Sources

- PyPI package page and release history: https://pypi.org/project/azure-mgmt-datalake-store/
- Microsoft Learn package reference root: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/
- `azure.mgmt.datalake.store` package reference: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store?view=azure-python-preview
- `AccountsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.operations.accountsoperations?view=azure-python-preview
- `FirewallRulesOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.operations.firewallrulesoperations?view=azure-python-preview
- `LocationsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.operations.locationsoperations?view=azure-python-preview
- `CreateDataLakeStoreAccountParameters`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.models.createdatalakestoreaccountparameters?view=azure-python-preview
- `UpdateDataLakeStoreAccountParameters`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.models.updatedatalakestoreaccountparameters?view=azure-python-preview
- `UpdateFirewallRuleParameters`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-store/azure.mgmt.datalake.store.models.updatefirewallruleparameters?view=azure-python-preview
- Azure management sample for Data Lake Store: https://learn.microsoft.com/en-us/samples/azure-samples/azure-samples-python-management/datalakestore/
- Azure Data Lake Storage Gen1 retirement note: https://learn.microsoft.com/en-us/power-query/connectors/azure-data-lake-storage-gen1
- Azure Data Lake Storage Gen2 Python guide: https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-directory-file-acl-python
