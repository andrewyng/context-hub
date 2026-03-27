---
name: mgmt-batch
description: "Azure Batch management SDK for Python for Batch accounts, account keys, auto-storage synchronization, application packages, and regional quota discovery through Azure Resource Manager"
metadata:
  languages: "python"
  versions: "18.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,batch,arm,management,python,compute"
---

# Azure Batch Management SDK for Python

## Golden Rule

Use `azure-mgmt-batch` for Azure Resource Manager management-plane work around Azure Batch accounts. This package manages Batch accounts, account-level settings, keys, applications, and regional capacity metadata. If you need to create pools, jobs, or tasks inside a Batch account, switch to the Batch service API and the `azure-batch` package instead of trying to do runtime workload operations through `azure-mgmt-batch`.

For `18.0.0`, the generated client expects an `azure-core` `TokenCredential`, so the safe default is `azure-identity` with `DefaultAzureCredential`.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-batch==18.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-batch==18.0.0" azure-identity
poetry add "azure-mgmt-batch==18.0.0" azure-identity
```

PyPI lists `18.0.0` as released on `2025-05-30` and requiring Python `>=3.7`.

If the same Python program also creates the resource group or storage account that your Batch account depends on, install those management packages separately:

```bash
python -m pip install azure-mgmt-resource azure-mgmt-storage
```

## Authentication And Setup

Set the subscription ID explicitly. The Batch management client does not infer it from the credential.

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

For service-principal auth through environment variables, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

For local development, `DefaultAzureCredential()` can also use an Azure CLI login from `az login`.

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.batch import BatchManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = BatchManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

The main operation groups exposed in the current Learn reference are:

- `batch_account`
- `application`
- `application_package`
- `location`
- `operations`

## Create A Batch Account

The account create flow is a long-running ARM operation, so call `.result()` on the poller before using the new account.

If you want the account linked to an Azure Storage account for auto-storage, pass the full storage account resource ID, not just the storage account name.

```bash
export AZURE_BATCH_RESOURCE_GROUP="example-rg"
export AZURE_BATCH_ACCOUNT_NAME="examplebatchacct"
export AZURE_BATCH_LOCATION="westus2"
export AZURE_STORAGE_ACCOUNT_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/example-rg/providers/Microsoft.Storage/storageAccounts/examplestorageacct"
```

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.batch import BatchManagementClient
from azure.mgmt.batch.models import AutoStorageBaseProperties, BatchAccountCreateParameters

client = BatchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

account = client.batch_account.begin_create(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
    parameters=BatchAccountCreateParameters(
        location=os.environ["AZURE_BATCH_LOCATION"],
        auto_storage=AutoStorageBaseProperties(
            os.environ["AZURE_STORAGE_ACCOUNT_ID"],
        ),
    ),
).result()

print(account.id)
```

Read or enumerate accounts with the same operation group:

```python
account = client.batch_account.get(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
)

print(account.name, account.location)

for item in client.batch_account.list():
    print(item.name)
```

Delete is also long-running:

```python
client.batch_account.begin_delete(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
).result()
```

## Update Account Settings

Patch-style account changes use `batch_account.update(...)`, not `begin_update(...)`.

The current model reference documents `public_network_access` and `allowed_authentication_modes` on `BatchAccountUpdateParameters`, which are the settings most likely to affect new integrations.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.batch import BatchManagementClient
from azure.mgmt.batch.models import BatchAccountUpdateParameters

client = BatchManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

updated = client.batch_account.update(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
    parameters=BatchAccountUpdateParameters(
        public_network_access="Enabled",
        allowed_authentication_modes=["AAD", "SharedKey"],
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
)

print(updated.name)
```

Use `allowed_authentication_modes` deliberately. If your environment is supposed to be Microsoft Entra ID only, do not keep `SharedKey` enabled by habit.

## Work With Account Keys And Auto-Storage

The management client can retrieve account keys, regenerate them, and resync the linked auto-storage keys.

Fetch the current Batch account keys:

```python
keys = client.batch_account.get_keys(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
)

print(keys.primary)
print(keys.secondary)
```

If the linked storage account keys were rotated outside Batch, resync the Batch account's stored auto-storage keys:

```python
client.batch_account.synchronize_auto_storage_keys(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
)
```

Treat key retrieval as a management exception, not the default app-auth pattern. For new automation, prefer Entra ID where the surrounding Azure service supports it.

## Check Regional Quotas And Supported VM SKUs

Before provisioning pools or scaling account usage, query the Batch regional metadata instead of guessing what a region allows.

```python
location = os.environ["AZURE_BATCH_LOCATION"]

quota = client.location.get_quotas(location)
print(quota)

for sku in client.location.list_supported_virtual_machine_skus(location):
    print(sku.name)
```

The quota response and supported-SKU list are useful guardrails when your automation needs to pick a region or validate capacity assumptions ahead of time.

## Applications And Application Packages

The current client includes `application` and `application_package` operation groups for account-scoped application metadata.

For package inspection, use the application-package operation group:

```python
for package in client.application_package.list(
    resource_group_name=os.environ["AZURE_BATCH_RESOURCE_GROUP"],
    account_name=os.environ["AZURE_BATCH_ACCOUNT_NAME"],
    application_name="ffmpeg",
):
    print(package)
```

For create, activate, or delete flows on application packages, use the same `client.application_package.*` surface and verify the exact model shape against the current Learn reference before copying older samples.

## Common Pitfalls

- `azure-mgmt-batch` is the ARM management SDK, not the Batch runtime SDK. Use `azure-batch` for jobs, tasks, and pool runtime workflows.
- Forgetting `azure-identity` is common. The current client constructor takes a `TokenCredential`, not the older Track 1 auth types.
- `subscription_id` is required even when the credential resolves successfully.
- `begin_create()` and `begin_delete()` return pollers. Do not assume the account exists or is gone until you wait on `.result()`.
- `AutoStorageBaseProperties` expects a storage account resource ID. A plain account name is not enough.
- Pulling shared keys into app code is usually the wrong default. Decide whether the account should allow `SharedKey`, `AAD`, or both before wiring auth flows around the management API.

## Version-Sensitive Notes For 18.0.0

- This guide covers `azure-mgmt-batch 18.0.0`.
- PyPI lists `18.0.0` as the current package version for this guide's input and publishes wheels for Python `>=3.7`.
- The current Microsoft Learn reference for `BatchManagementClient` is based on `TokenCredential` auth and exposes operation groups such as `batch_account`, `application_package`, and `location`. Older examples that still assume legacy Azure auth helpers are not the right default for `18.0.0`.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-batch/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.batchmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.operations.batchaccountoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.operations.locationoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.operations.applicationpackageoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.models.batchaccountcreateparameters?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.models.autostoragebaseproperties?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-batch/azure.mgmt.batch.models.batchaccountupdateparameters?view=azure-python
- https://learn.microsoft.com/en-us/azure/batch/batch-apis-tools
- https://learn.microsoft.com/en-us/python/api/overview/azure/batch?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
