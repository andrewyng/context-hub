---
name: mgmt-resourcegraph
description: "Azure Resource Graph management SDK for Python for cross-subscription queries, management-group scopes, paging, and shared query resources"
metadata:
  languages: "python"
  versions: "8.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,resource-graph,management,query,kql,subscriptions"
---

# Azure Resource Graph Management SDK for Python

## Golden Rule

Use `azure-mgmt-resourcegraph` when you need to query Azure Resource Graph from Python or manage shared Resource Graph queries as Azure resources. Pair it with `azure-identity` for authentication. The client constructor takes a credential, not a subscription ID; query scope is supplied on each `QueryRequest`.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-resourcegraph==8.0.1" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-resourcegraph==8.0.1" azure-identity
poetry add "azure-mgmt-resourcegraph==8.0.1" azure-identity
```

PyPI metadata for `8.0.1` requires Python 3.9+. The project description still says "tested with Python 3.7+", so prefer the package metadata and classifiers when choosing a runtime.

## Authentication And Setup

For local development:

```bash
az login
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_RESOURCE_GROUP="resource-graph-queries"  # only needed for shared-query examples
export AZURE_LOCATION="westus2"  # only needed for shared-query examples
```

If you use a service principal directly, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Minimal client setup:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient

credential = DefaultAzureCredential()
client = ResourceGraphClient(credential)
```

`DefaultAzureCredential` is the practical default because it can use environment credentials, workload identity, managed identity, Azure CLI, Azure PowerShell, or Azure Developer CLI. For Azure-hosted production code, switch to `ManagedIdentityCredential` when the runtime is fixed and managed identity is available.

## Run A Query

Use `QueryRequest` to provide both the KQL query text and the scope to run it against:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()
client = ResourceGraphClient(credential)

try:
    request = QueryRequest(
        subscriptions=[subscription_id],
        query="""
Resources
| where type =~ 'microsoft.compute/virtualmachines'
| project id, name, location, resourceGroup
| order by name asc
""",
        options=QueryRequestOptions(
            top=100,
            result_format=ResultFormat.OBJECT_ARRAY,
        ),
    )

    response = client.resources(request)

    print(f"count={response.count} total_records={response.total_records}")
    for row in response.data:
        print(row["name"], row["location"], row["id"])
finally:
    client.close()
```

Important details:

- `subscriptions` is a list, even if you query only one subscription.
- `result_format=ResultFormat.OBJECT_ARRAY` returns `response.data` as a list of JSON objects, which is the easiest format to consume from Python.
- Azure Resource Graph defaults to returning at most 1,000 records per query response.

## Query Multiple Subscriptions

Resource Graph is useful when you need one query across many subscriptions instead of looping through service-specific clients:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat

subscription_ids = [
    item.strip()
    for item in os.environ["AZURE_SUBSCRIPTION_IDS"].split(",")
    if item.strip()
]

client = ResourceGraphClient(DefaultAzureCredential())

try:
    response = client.resources(
        QueryRequest(
            subscriptions=subscription_ids,
            query="""
Resources
| summarize resources=count() by type
| top 20 by resources desc
""",
            options=QueryRequestOptions(
                result_format=ResultFormat.OBJECT_ARRAY,
            ),
        )
    )

    for row in response.data:
        print(row["type"], row["resources"])
finally:
    client.close()
```

Set the environment variable as a comma-separated list:

```bash
export AZURE_SUBSCRIPTION_IDS="sub-1,sub-2,sub-3"
```

## Paginate Large Result Sets

For SDK callers, you handle pagination yourself by passing the previous `skip_token` into the next `QueryRequestOptions`:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
query_text = """
Resources
| project id, name, type
| order by id asc
"""

client = ResourceGraphClient(DefaultAzureCredential())
results = []
skip_token = None

try:
    while True:
        response = client.resources(
            QueryRequest(
                subscriptions=[subscription_id],
                query=query_text,
                options=QueryRequestOptions(
                    top=1000,
                    skip_token=skip_token,
                    result_format=ResultFormat.OBJECT_ARRAY,
                ),
            )
        )

        results.extend(response.data)

        if not response.skip_token:
            break

        skip_token = response.skip_token

    print(f"fetched={len(results)}")
finally:
    client.close()
```

Use an explicit `order by` when paginating or skipping results. Without sorting, Resource Graph results are not repeatable.

## Query A Management Group

Use `management_groups` when the scope should follow a management-group hierarchy instead of a subscription list:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import QueryRequest, QueryRequestOptions, ResultFormat

client = ResourceGraphClient(DefaultAzureCredential())

try:
    response = client.resources(
        QueryRequest(
            management_groups=["myMG"],
            query="""
Resources
| summarize resources=count() by type
| top 10 by resources desc
""",
            options=QueryRequestOptions(
                allow_partial_scopes=True,
                result_format=ResultFormat.OBJECT_ARRAY,
            ),
        )
    )

    for row in response.data:
        print(row["type"], row["resources"])
finally:
    client.close()
```

Important scope rules:

- `management_groups` and `subscriptions` cannot be used in the same request.
- The `management_groups` value is the management group ID, not the display name.
- Management-group scope includes only the first 10,000 subscriptions in or under that hierarchy.
- `allow_partial_scopes` matters only for tenant-level or management-group-level queries.

## Create And Read Shared Queries

The package also manages shared Resource Graph queries through the `graph_query` operation group:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resourcegraph import ResourceGraphClient
from azure.mgmt.resourcegraph.models import GraphQueryResource

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
resource_group_name = os.environ["AZURE_RESOURCE_GROUP"]
location = os.environ["AZURE_LOCATION"]

client = ResourceGraphClient(DefaultAzureCredential())

try:
    shared_query = client.graph_query.create_or_update(
        subscription_id=subscription_id,
        resource_group_name=resource_group_name,
        resource_name="count-vms-by-os",
        properties=GraphQueryResource(
            location=location,
            description="Count VMs by OS type",
            query=(
                "Resources "
                "| where type =~ 'microsoft.compute/virtualmachines' "
                "| summarize count() by tostring(properties.storageProfile.osDisk.osType)"
            ),
        ),
    )

    print(shared_query.id)

    saved = client.graph_query.get(
        subscription_id=subscription_id,
        resource_group_name=resource_group_name,
        resource_name="count-vms-by-os",
    )

    print(saved.query)
finally:
    client.close()
```

Use `client.graph_query.list_by_subscription(subscription_id)` to enumerate shared queries across a subscription, or `client.graph_query.list(subscription_id, resource_group_name)` to scope the listing to one resource group.

## Common Pitfalls

- Do not pass `subscription_id` to `ResourceGraphClient`. Query scope lives on `QueryRequest`.
- Do not assume preview docs match stable `8.0.1`. Preview `8.1.0b*` adds `authorization_scope_filter` and resource history/change operations that are not part of stable `8.0.1`.
- Do not use `limit` or `take` in the KQL query if you expect SDK pagination with `skip_token`; Resource Graph can omit the continuation token in that case.
- Do not pass a management group display name to `management_groups`; use the management group ID.
- Do not forget to install `azure-identity`. This package expects a `TokenCredential`.
- Large or bursty query workloads can be throttled. Azure Resource Graph documents per-user quota headers such as `x-ms-user-quota-remaining` and `x-ms-user-quota-resets-after`; group subscription IDs into fewer queries and back off when the remaining quota reaches zero.
- Shared queries are Azure resources. Creating them requires a subscription ID, resource group, and a `location` on the resource body.

## Version-Sensitive Notes For `8.0.1`

- PyPI lists `8.0.1` as the current stable release, published on November 24, 2025.
- The `8.0.1` release notes say the package was regenerated for API version `2021-03-01`.
- `management_groups` on `QueryRequest` and `allow_partial_scopes` on `QueryRequestOptions` were added in `8.0.0`, so they are safe to use in `8.0.1`.
- The package still exposes `GraphQueryOperations` for shared queries, which has existed since `2.1.0`.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-resourcegraph/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.resourcegraphclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.models.queryrequest?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.models.queryrequestoptions?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.models.queryresponse?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.models.graphqueryresource?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resourcegraph/azure.mgmt.resourcegraph.operations.graphqueryoperations?view=azure-python
- https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/query-language
- https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/work-with-data
- https://learn.microsoft.com/en-us/azure/governance/resource-graph/concepts/guidance-for-throttled-requests
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/authentication-overview
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
