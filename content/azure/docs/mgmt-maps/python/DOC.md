---
name: mgmt-maps
description: "Azure Maps management SDK for Python for provisioning Maps accounts, managing keys, generating SAS tokens, and handling management-plane resources"
metadata:
  languages: "python"
  versions: "2.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-maps,management,arm,provisioning,python"
---

# Azure Maps Management SDK for Python

## Golden Rule

Use `azure-mgmt-maps` for Azure Resource Manager work on Azure Maps resources: creating and updating Maps accounts, listing or regenerating account keys, generating SAS tokens, and inspecting management resources. Do not use it for search, routing, rendering, or other data-plane requests. Those calls belong in the Azure Maps client packages such as `azure-maps-search`, `azure-maps-route`, or `azure-maps-render`.

## Install

Install the management client together with Azure Identity:

```bash
python -m pip install "azure-mgmt-maps==2.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-maps==2.1.0" azure-identity
poetry add "azure-mgmt-maps==2.1.0" azure-identity
```

Practical version guidance:

- PyPI metadata for `2.1.0` still declares Python `>=3.7`.
- The current Azure SDK for Python support policy is Python `3.9+`.
- For new environments, use Python `3.9+` even if older interpreters can still install this package.

## Authentication And Client Setup

For local scripts, Azure CLI credentials are usually the quickest path:

```bash
az login
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

Reusable application code should prefer `DefaultAzureCredential`:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client initialization:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.maps import AzureMapsManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = AzureMapsManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven scripts can use `AzureCliCredential` explicitly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.maps import AzureMapsManagementClient

client = AzureMapsManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The main operation groups in `2.1.0` are:

- `client.accounts`
- `client.creators`
- `client.maps`

## Create Or Update A Maps Account

Create a Gen2 Maps account with `accounts.create_or_update(...)`:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.maps import AzureMapsManagementClient

client = AzureMapsManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

account = client.accounts.create_or_update(
    resource_group_name="example-rg",
    account_name="example-maps-account",
    maps_account={
        "location": "global",
        "kind": "Gen2",
        "sku": {"name": "G2"},
        "tags": {
            "env": "dev",
            "owner": "context-hub",
        },
    },
)

print(account.id)
print(account.properties.unique_id)
```

Use `accounts.update(...)` for partial changes:

```python
updated = client.accounts.update(
    resource_group_name="example-rg",
    account_name="example-maps-account",
    maps_account_update_parameters={
        "tags": {
            "env": "prod",
            "owner": "platform",
        },
    },
)

print(updated.tags)
```

Important account settings exposed by the current ARM resource schema include:

- `disableLocalAuth`: disables shared-key and SAS authentication
- `publicNetworkAccess`: enables or blocks public endpoint access
- `cors`: CORS rules for the account
- `linkedResources`: linked storage resources

If you plan to use account keys or SAS tokens, do not enable `disableLocalAuth`.

## List Accounts And Read Account Details

List Maps accounts in a resource group:

```python
for account in client.accounts.list_by_resource_group("example-rg"):
    print(account.name, account.location, account.kind)
```

Read one account:

```python
account = client.accounts.get(
    resource_group_name="example-rg",
    account_name="example-maps-account",
)

print(account.id)
print(account.location)
print(account.properties.unique_id)
```

## List And Regenerate Account Keys

Use the management client to retrieve the shared keys that data-plane clients can use with `AzureKeyCredential`:

```python
keys = client.accounts.list_keys(
    resource_group_name="example-rg",
    account_name="example-maps-account",
)

print(keys.primary_key)
print(keys.secondary_key)
```

Rotate one key with `regenerate_keys(...)`:

```python
from azure.mgmt.maps.models import MapsKeySpecification

new_keys = client.accounts.regenerate_keys(
    resource_group_name="example-rg",
    account_name="example-maps-account",
    key_specification=MapsKeySpecification(key_type="primary"),
)

print(new_keys.primary_key)
```

Use a staged rotation flow in production:

1. move clients to the secondary key
2. regenerate the primary key
3. move clients back if needed
4. regenerate the secondary key

## Generate A SAS Token For Azure Maps Data-Plane Clients

`2.1.0` adds `accounts.list_sas(...)`, which is the management-plane call used to mint SAS tokens for the newer Azure Maps SDKs.

```python
import os
from datetime import datetime, timedelta, timezone

from azure.identity import DefaultAzureCredential
from azure.mgmt.maps import AzureMapsManagementClient
from azure.mgmt.maps.models import AccountSasParameters

client = AzureMapsManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

start = datetime.now(timezone.utc)
expiry = start + timedelta(hours=1)

token = client.accounts.list_sas(
    resource_group_name="example-rg",
    account_name="example-maps-account",
    maps_account_sas_parameters=AccountSasParameters(
        signing_key="primaryKey",
        principal_id=os.environ["AZURE_MAPS_UAMI_OBJECT_ID"],
        max_rate_per_second=500,
        start=start.isoformat().replace("+00:00", "Z"),
        expiry=expiry.isoformat().replace("+00:00", "Z"),
        regions=["eastus"],
    ),
)

print(token.account_sas_token)
```

Before this works:

- the Maps account must already have a user-assigned managed identity attached
- the identity must be in the same region as the Maps account
- local auth must still be enabled on the account

The returned SAS token is what the data-plane Azure Maps packages use with `AzureSasCredential`.

## Delete An Account

Delete a Maps account with `accounts.delete(...)`:

```python
client.accounts.delete(
    resource_group_name="example-rg",
    account_name="example-maps-account",
)
```

## Creator Resources

The `client.creators` operation group still exists in the `2.1.0` SDK and the ARM template reference still documents `Microsoft.Maps/accounts/creators`. Treat this as a compatibility surface, not a default new build target: Microsoft announced Azure Maps Creator retirement effective September 30, 2025.

If you inherit code that already uses Creator resources, verify service availability and retirement impact before writing new automation around `client.creators`.

## Common Pitfalls

- Using `azure-mgmt-maps` for search or routing calls instead of a data-plane Azure Maps package
- Forgetting `azure-identity`; this package does not include credential implementations
- Omitting `AZURE_SUBSCRIPTION_ID`; management clients do not infer the subscription automatically
- Enabling `disableLocalAuth` and then expecting `list_keys(...)` or SAS-based app auth to remain usable
- Treating SAS generation as self-contained; the account identity prerequisite must already be configured
- Building new Creator automation without checking the post-September 30, 2025 retirement status first

## Version-Sensitive Notes

### `2.1.0`

PyPI release notes for `2.1.0` call out these changes:

- added `accounts.list_sas`
- added async support
- added `cors`, `disable_local_auth`, `linked_resources`, `public_network_access`, and encryption-related account fields
- added a `Maps` operation group including `list_subscription_operations`

If you are maintaining code written against `2.0.x` or earlier, verify these newer methods and fields before assuming they exist.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-maps/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-maps/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-maps/azure.mgmt.maps.azuremapsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-maps/azure.mgmt.maps.operations.accountsoperations?view=azure-python
- https://learn.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication
- https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-authentication
- https://learn.microsoft.com/en-us/azure/templates/microsoft.maps/accounts
- https://learn.microsoft.com/en-us/azure/templates/microsoft.maps/accounts/creators
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-overview
- https://azure.microsoft.com/en-us/updates?id=azure-maps-creator-services-retirement-on-30-september-2025
