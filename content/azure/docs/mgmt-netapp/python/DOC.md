---
name: mgmt-netapp
description: "Azure NetApp Files management SDK for Python for NetApp accounts, capacity pools, volumes, snapshots, and quota inspection"
metadata:
  languages: "python"
  versions: "15.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,netapp,storage,arm,management,capacity-pools,volumes,snapshots"
---

# Azure NetApp Files Management SDK for Python

## Golden Rule

Use `azure-mgmt-netapp` for Azure Resource Manager control-plane work only: creating and updating NetApp accounts, capacity pools, volumes, snapshots, quotas, and related Azure NetApp Files resources. It does not mount or read file data. For `15.0.0`, pair it with `azure-identity`, pass the subscription ID explicitly, and expect most create, update, move, revert, and delete operations to be long-running `begin_*` calls that need `.result()`.

## Install

PyPI lists `azure-mgmt-netapp 15.0.0` as the latest release and requires Python 3.9+.

```bash
python -m pip install "azure-mgmt-netapp==15.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-netapp==15.0.0" azure-identity
poetry add "azure-mgmt-netapp==15.0.0" azure-identity
```

## Prerequisites

Azure NetApp Files has a few setup requirements before the SDK calls succeed:

- Register the resource provider for the subscription:

```bash
az account set --subscription "$AZURE_SUBSCRIPTION_ID"
az provider register --namespace Microsoft.NetApp --wait
az provider show --namespace Microsoft.NetApp --query registrationState -o tsv
```

- Create or reuse a virtual network subnet delegated to `Microsoft.NetApp/volumes`.
- Plan the delegated subnet size up front. Microsoft notes that `/28` is often too small and that only one delegated subnet can be used per VNet for Azure NetApp Files volume creation.
- Create resources in hierarchy order: NetApp account -> capacity pool -> volume -> snapshot.

Environment variables used in the examples:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_RESOURCE_GROUP="my-netapp-rg"
export AZURE_LOCATION="eastus"
export AZURE_NETAPP_ACCOUNT="my-anf-account"
export AZURE_NETAPP_POOL="pool-premium"
export AZURE_NETAPP_VOLUME="appdata"
export AZURE_NETAPP_SUBNET_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/network-rg/providers/Microsoft.Network/virtualNetworks/my-vnet/subnets/anf-subnet"
```

If you authenticate with a service principal through environment variables, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Authentication And Client Setup

For reusable code, use `DefaultAzureCredential()`. For local scripts after `az login`, `AzureCliCredential()` is also fine.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.netapp import NetAppManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = NetAppManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local CLI-driven scripts can use:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.netapp import NetAppManagementClient

client = NetAppManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

`NetAppManagementClient` defaults to ARM API version `2025-09-01`. The Learn docs warn that overriding `api_version` may result in unsupported behavior.

## Create An Account, Pool, And Volume

These are the main operations most apps need. Azure NetApp Files sizes are in bytes, so use helpers for GiB and TiB instead of hard-coding large integers.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.netapp import NetAppManagementClient

GIB = 1024 ** 3
TIB = 1024 ** 4

resource_group = os.environ["AZURE_RESOURCE_GROUP"]
location = os.environ["AZURE_LOCATION"]
account_name = os.environ["AZURE_NETAPP_ACCOUNT"]
pool_name = os.environ["AZURE_NETAPP_POOL"]
volume_name = os.environ["AZURE_NETAPP_VOLUME"]
subnet_id = os.environ["AZURE_NETAPP_SUBNET_ID"]

client = NetAppManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

account = client.accounts.begin_create_or_update(
    resource_group_name=resource_group,
    account_name=account_name,
    body={
        "location": location,
        "properties": {},
    },
).result()

pool = client.pools.begin_create_or_update(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    body={
        "location": location,
        "properties": {
            "qosType": "Auto",
            "serviceLevel": "Premium",
            "size": 4 * TIB,
        },
    },
).result()

volume = client.volumes.begin_create_or_update(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
    body={
        "location": location,
        "properties": {
            "creationToken": "appdata",
            "serviceLevel": "Premium",
            "subnetId": subnet_id,
            "usageThreshold": 100 * GIB,
        },
    },
).result()

print(account.id)
print(pool.id)
print(volume.id)
print(volume.file_system_id)
```

Important details from the official docs:

- `properties.subnetId` must point to a delegated subnet with `Microsoft.NetApp/volumes`.
- `properties.usageThreshold` is in bytes and must be a multiple of 1 GiB.
- Current documented limits for regular volumes are 50 GiB minimum and 100 TiB maximum.
- Current documented minimum capacity pool size is 1 TiB if all volumes in the pool use Standard network features; otherwise the minimum is 4 TiB.

### Add Explicit NFSv4.1 Export Rules

If you want an explicit NFS export policy instead of relying on minimal defaults, add `protocolTypes` and `exportPolicy` to the volume payload:

```python
volume = client.volumes.begin_create_or_update(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
    body={
        "location": location,
        "properties": {
            "creationToken": "appdata",
            "serviceLevel": "Premium",
            "subnetId": subnet_id,
            "usageThreshold": 100 * GIB,
            "protocolTypes": ["NFSv4.1"],
            "exportPolicy": {
                "rules": [
                    {
                        "ruleIndex": 1,
                        "unixReadOnly": True,
                        "unixReadWrite": True,
                        "nfsv3": False,
                        "nfsv41": True,
                        "allowedClients": "10.0.0.0/24",
                        "hasRootAccess": True,
                    }
                ]
            },
        },
    },
).result()
```

For manual QoS pools, Azure's REST examples show `qosType="Manual"` with `serviceLevel="Flexible"` and `customThroughputMibps`.

## List And Inspect Resources

```python
for account in client.accounts.list(resource_group):
    print("account:", account.name)

for pool in client.pools.list(resource_group, account_name):
    print("pool:", pool.name, pool.size)

for volume in client.volumes.list(resource_group, account_name, pool_name):
    print("volume:", volume.name, volume.provisioning_state)
```

The official Azure sample notes that returned `.name` values for capacity pools, volumes, and snapshots can include the parent hierarchy, so do not assume `volume.name` is always the leaf name you can pass directly back into `get()`.

## Snapshots And Restore

Create a snapshot:

```python
snapshot = client.snapshots.begin_create(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
    snapshot_name="snap-001",
    body={"location": location},
).result()

print(snapshot.id)
```

List snapshots for a volume:

```python
for snapshot in client.snapshots.list(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
):
    print(snapshot.name)
```

Revert a volume to a snapshot:

```python
client.volumes.begin_revert(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
    body={"snapshotId": snapshot.id},
).result()
```

## Move A Volume To Another Pool

Azure NetApp Files exposes a dedicated pool-change operation instead of a generic patch for service-level moves:

```python
target_pool_id = (
    f"/subscriptions/{os.environ['AZURE_SUBSCRIPTION_ID']}"
    f"/resourceGroups/{resource_group}"
    f"/providers/Microsoft.NetApp/netAppAccounts/{account_name}"
    f"/capacityPools/pool-premium-2"
)

client.volumes.begin_pool_change(
    resource_group_name=resource_group,
    account_name=account_name,
    pool_name=pool_name,
    volume_name=volume_name,
    body={"newPoolResourceId": target_pool_id},
).result()
```

`newPoolResourceId` must be the full ARM resource ID of the destination capacity pool.

## Check Regional And Account Quotas

Region-level quota inspection:

```python
for quota in client.net_app_resource_quota_limits.list(location):
    print(quota.name)
```

Account-level quota inspection:

```python
for quota in client.net_app_resource_quota_limits_account.list(
    resource_group_name=resource_group,
    account_name=account_name,
):
    print(quota.name)
```

The current Learn docs say account-level quota listing is mainly for quotas under the account, and currently `PoolsPerAccount` is the primary one exposed there.

## Common Pitfalls

- This package is management plane only. It provisions Azure NetApp Files resources but does not mount NFS or SMB shares.
- Forgetting to register `Microsoft.NetApp` is a common setup failure.
- Volume creation fails unless the subnet is delegated to `Microsoft.NetApp/volumes`.
- Azure NetApp Files resource sizes use bytes, not GiB strings.
- Many operations are long-running. Call `.result()` before using the created resource in the next step.
- Delete in reverse hierarchy order: snapshots -> volumes -> pools -> accounts.
- Volume, pool, and snapshot `.name` values can include parent segments; keep your own leaf names instead of relying on returned display names.

## Version-Sensitive Notes

### `15.0.0`

PyPI release history for `15.0.0` calls out these relevant changes:

- `NetAppManagementClient` adds the `ransomware_reports` operation group.
- `VolumesOperations` adds `begin_list_quota_report`.
- Several ransomware-protection related models and enums were added.
- The release also notes a breaking change: a model named `Type` was deleted or renamed.

If you copy older examples that predate `15.0.0`, do not assume quota-report or ransomware-report APIs are available.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-netapp/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.netappmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.accountsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.poolsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.volumesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.snapshotsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.netappresourcequotalimitsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-netapp/azure.mgmt.netapp.operations.netappresourcequotalimitsaccountoperations?view=azure-python
- https://learn.microsoft.com/en-us/rest/api/netapp/accounts/create-or-update?view=rest-netapp-2025-09-01
- https://learn.microsoft.com/en-us/rest/api/netapp/pools/create-or-update?view=rest-netapp-2025-06-01
- https://learn.microsoft.com/en-us/rest/api/netapp/volumes/create-or-update?view=rest-netapp-2025-09-01
- https://learn.microsoft.com/en-us/rest/api/netapp/volumes/pool-change?view=rest-netapp-2025-09-01
- https://learn.microsoft.com/en-us/rest/api/netapp/volumes/revert?view=rest-netapp-2025-09-01
- https://learn.microsoft.com/en-us/rest/api/netapp/snapshots/create?view=rest-netapp-2025-09-01
- https://learn.microsoft.com/en-us/azure/azure-netapp-files/azure-netapp-files-register
- https://learn.microsoft.com/en-us/azure/azure-netapp-files/azure-netapp-files-delegate-subnet
- https://learn.microsoft.com/en-us/azure/azure-netapp-files/azure-netapp-files-resource-limits
- https://learn.microsoft.com/en-us/samples/azure-samples/netappfiles-python-sdk-sample/azure-netappfiles-sdk-sample-for-python/
