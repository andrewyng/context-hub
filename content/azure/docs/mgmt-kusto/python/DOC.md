---
name: mgmt-kusto
description: "Azure Data Explorer management SDK for Python for clusters, databases, data connections, and principal assignments"
metadata:
  languages: "python"
  versions: "3.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,kusto,data-explorer,management,arm,python"
---

# Azure Data Explorer Management SDK for Python

## Golden Rule

Use `azure-mgmt-kusto` for Azure Resource Manager work against Azure Data Explorer: creating clusters, managing databases, wiring data connections, and assigning cluster or database principals. Do not use it for KQL queries or application-side ingestion. Microsoft documents `azure-kusto-data` and `azure-kusto-ingest` as the Python packages for those data-plane tasks.

## Install

`azure-mgmt-kusto 3.4.0` on PyPI requires Python 3.8+.

```bash
python -m pip install "azure-mgmt-kusto==3.4.0" azure-identity
```

You also need:

- an Azure subscription
- permission to manage `Microsoft.Kusto/*` resources in the target resource group or subscription

## Authentication And Setup

`KustoManagementClient` needs a `TokenCredential` and a subscription ID. `DefaultAzureCredential` is the safe default for scripts and services because it can use environment credentials, managed identity, or local developer credentials such as Azure CLI.

Set the values your deployment actually uses:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"

export AZURE_RESOURCE_GROUP="rg-kusto-demo"
export AZURE_LOCATION="eastus"
export AZURE_KUSTO_CLUSTER="adx-demo-cluster"
export AZURE_KUSTO_DATABASE="appdb"
```

Client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.kusto import KustoManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
resource_group = os.environ["AZURE_RESOURCE_GROUP"]
location = os.environ["AZURE_LOCATION"]
cluster_name = os.environ["AZURE_KUSTO_CLUSTER"]
database_name = os.environ["AZURE_KUSTO_DATABASE"]

credential = DefaultAzureCredential()
client = KustoManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Important operation groups on the client:

- `client.clusters`
- `client.databases`
- `client.data_connections`
- `client.database_principal_assignments`
- `client.cluster_principal_assignments`
- `client.scripts`
- `client.attached_database_configurations`

When you are done with a long-lived script or worker, close the client:

```python
client.close()
```

## Common Workflows

### Create a cluster

Cluster creation is a long-running ARM operation. Call `.result()` on the poller before assuming the cluster exists.

```python
from azure.mgmt.kusto.models import AzureSku, Cluster

poller = client.clusters.begin_create_or_update(
    resource_group_name=resource_group,
    cluster_name=cluster_name,
    parameters=Cluster(
        location=location,
        sku=AzureSku(
            name="Standard_D13_v2",
            tier="Standard",
            capacity=2,
        ),
        enable_streaming_ingest=True,
        public_network_access="Enabled",
    ),
    if_none_match="*",
)

cluster = poller.result()

print(cluster.id)
print(cluster.uri)
print(cluster.data_ingestion_uri)
```

The SKU name and tier must match a supported Kusto SKU. If you are provisioning dynamically, inspect `client.clusters.list_skus()` instead of guessing from generic VM names.

### List, get, stop, and start clusters

```python
for cluster in client.clusters.list_by_resource_group(resource_group):
    print(cluster.name, cluster.location, cluster.state)

cluster = client.clusters.get(resource_group, cluster_name)
print(cluster.uri)

client.clusters.begin_stop(resource_group, cluster_name).result()
client.clusters.begin_start(resource_group, cluster_name).result()
```

### Create a read-write database

`ReadWriteDatabase` uses Python `timedelta` objects for retention and cache periods.

```python
from datetime import timedelta

from azure.mgmt.kusto.models import ReadWriteDatabase

database = client.databases.begin_create_or_update(
    resource_group_name=resource_group,
    cluster_name=cluster_name,
    database_name=database_name,
    parameters=ReadWriteDatabase(
        location=location,
        soft_delete_period=timedelta(days=365),
        hot_cache_period=timedelta(days=7),
    ),
).result()

print(database.name, database.kind, database.provisioning_state)
```

List databases on a cluster:

```python
for db in client.databases.list_by_cluster(resource_group, cluster_name):
    print(db.name, db.kind)
```

### Add an Event Hub data connection

Use a data connection when the cluster should ingest from Azure Event Hubs. The `event_hub_resource_id` is the ARM resource ID of the Event Hub. `managed_identity_resource_id` is the system-assigned or user-assigned managed identity resource ID that Kusto should use to authenticate to Event Hubs.

```bash
export AZURE_EVENTHUB_RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-messaging/providers/Microsoft.EventHub/namespaces/ns-demo/eventhubs/orders"
export AZURE_EVENTHUB_MANAGED_IDENTITY_RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-kusto-demo/providers/Microsoft.ManagedIdentity/userAssignedIdentities/adx-eh-reader"
```

```python
from datetime import datetime, timezone

from azure.mgmt.kusto.models import EventHubDataConnection

connection = client.data_connections.begin_create_or_update(
    resource_group_name=resource_group,
    cluster_name=cluster_name,
    database_name=database_name,
    data_connection_name="orders-eh",
    parameters=EventHubDataConnection(
        location=location,
        event_hub_resource_id=os.environ["AZURE_EVENTHUB_RESOURCE_ID"],
        consumer_group="$Default",
        table_name="OrdersRaw",
        mapping_rule_name="OrdersJsonMapping",
        data_format="JSON",
        managed_identity_resource_id=os.environ["AZURE_EVENTHUB_MANAGED_IDENTITY_RESOURCE_ID"],
        retrieval_start_date=datetime.now(timezone.utc),
    ),
).result()

print(connection.name)
```

List data connections for a database:

```python
for item in client.data_connections.list_by_database(
    resource_group,
    cluster_name,
    database_name,
):
    print(item.name, item.kind)
```

### Grant database permissions

`DatabasePrincipalAssignment` is the direct way to grant a role to a user, app, or group at the database scope.

```bash
export AZURE_PRINCIPAL_ID="analysts@contoso.com"
export AZURE_PRINCIPAL_TENANT_ID="00000000-0000-0000-0000-000000000000"
```

```python
from azure.mgmt.kusto.models import DatabasePrincipalAssignment

assignment = client.database_principal_assignments.begin_create_or_update(
    resource_group_name=resource_group,
    cluster_name=cluster_name,
    database_name=database_name,
    principal_assignment_name="analysts-viewer",
    parameters=DatabasePrincipalAssignment(
        principal_id=os.environ["AZURE_PRINCIPAL_ID"],
        tenant_id=os.environ["AZURE_PRINCIPAL_TENANT_ID"],
        principal_type="User",
        role="Viewer",
    ),
).result()

print(assignment.name)
```

For cluster-wide roles, use `client.cluster_principal_assignments.begin_create_or_update(...)` with `ClusterPrincipalAssignment`. The supported cluster-wide roles in `3.4.0` are `AllDatabasesAdmin`, `AllDatabasesViewer`, and `AllDatabasesMonitor`.

## Important Notes

- `subscription_id` is required. `KustoManagementClient` does not infer it from the credential.
- `KustoManagementClient` defaults to ARM API version `2024-04-13`. The official docs warn that overriding `api_version` may result in unsupported behavior.
- Most mutating operations are `begin_*` long-running operations. Always wait on the returned poller with `.result()` when your next step depends on the resource existing.
- `principal_id` for principal assignments is not restricted to an object GUID. The docs explicitly allow a user email, application ID, or security group name.
- If you disable `public_network_access`, the cluster is reachable only through private endpoint connectivity. Do not turn it off before your private networking path exists.
- This package manages ARM resources only. Query execution, control commands, and ingestion from application code belong in `azure-kusto-data` or `azure-kusto-ingest`.

## Version-Sensitive Notes For 3.4.0

- PyPI currently lists `3.4.0` as the latest release for `azure-mgmt-kusto`.
- `3.4.0` adds cluster callout policy support, including `Cluster.callout_policies`, `ClustersOperations.begin_add_callout_policies`, `begin_remove_callout_policy`, and `list_callout_policies`.
- The same `3.4.0` release adds `ClustersOperations.list_follower_databases_get` and new follower database response models. If you need those methods, pin `3.4.0` or newer.
- `3.2.0` added the separate `client.database` operation group and pagination parameters `top` and `skiptoken` on `client.databases.list_by_cluster`. If you are copying older examples, check whether they predate those APIs.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-kusto/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.kustomanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.operations.clustersoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.operations.databasesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.operations.dataconnectionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.operations.databaseprincipalassignmentsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.cluster?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.azuresku?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.readwritedatabase?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.eventhubdataconnection?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.databaseprincipalassignment?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-kusto/azure.mgmt.kusto.models.clusterprincipalassignment?view=azure-python
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication-overview
- https://learn.microsoft.com/en-us/kusto/api/python/kusto-python-client-library?view=azure-data-explorer&preserve-view=true
