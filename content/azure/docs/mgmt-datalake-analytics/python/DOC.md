---
name: mgmt-datalake-analytics
description: "Azure Data Lake Analytics management SDK for Python for legacy account, storage, compute policy, firewall, and job-management code"
metadata:
  languages: "python"
  versions: "0.6.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,datalake,analytics,management,legacy,python"
---

# Azure Data Lake Analytics Management SDK for Python

## Golden Rule

Use `azure-mgmt-datalake-analytics` only for legacy Azure Data Lake Analytics automation and code maintenance. Microsoft says in its official retirement FAQ that Azure Data Lake Analytics retired on February 29, 2024 and is no longer available as a live service, so do not choose this package for new analytics work. For new systems, use current Azure analytics services instead of building fresh code on ADLA.

When you do need this package, install `azure-identity` with it and authenticate explicitly. The current Python reference still documents the account-management client and its operation groups even though the service itself is retired.

## Install

Pin the version your project already expects:

```bash
python -m pip install "azure-mgmt-datalake-analytics==0.6.0" azure-identity
```

Practical install notes from PyPI:

- `0.6.0` is the latest stable release on PyPI; `1.0.0b1` and `1.0.0b2` are prereleases.
- The PyPI project description says `0.6.0` was tested with Python 2.7, 3.4, 3.5, and 3.6.
- If your environment still has the old `azure<1.0` metapackage installed, uninstall it before troubleshooting imports.

## Package Surface

The official overview page describes this package as the management API for:

- Data Lake Analytics accounts
- jobs
- policies
- catalogs

The current Learn reference pages are easiest to use for the `azure.mgmt.datalake.analytics.account` client, which exposes these operation groups:

- `accounts`
- `data_lake_store_accounts`
- `storage_accounts`
- `compute_policies`
- `firewall_rules`
- `operations`
- `locations`

## Authentication And Client Setup

For reusable code, use `DefaultAzureCredential`. For local scripts after `az login`, `AzureCliCredential` is simpler.

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
from azure.mgmt.datalake.analytics.account import DataLakeAnalyticsAccountManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

with DataLakeAnalyticsAccountManagementClient(
    credential=credential,
    subscription_id=subscription_id,
) as client:
    print(client)
```

Local CLI-driven script:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.datalake.analytics.account import DataLakeAnalyticsAccountManagementClient

client = DataLakeAnalyticsAccountManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Important client detail: the current class reference documents a default `api_version` of `2019-11-01-preview` and warns that overriding it may lead to unsupported behavior.

## Common Workflows

Because the service is retired, the safest remaining use cases are inventory, migration analysis, and legacy-code reading.

### List accounts in a subscription

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.datalake.analytics.account import DataLakeAnalyticsAccountManagementClient

client = DataLakeAnalyticsAccountManagementClient(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

for account in client.accounts.list():
    print(account.name, account.location)
```

### Get one account and inspect its linked default store

```python
resource_group_name = "example-rg"
account_name = "example-adla"

account = client.accounts.get(resource_group_name, account_name)

print(account.id)
print(account.location)
print(account.endpoint)
print(account.default_data_lake_store_account)
```

### Inspect subscription capability for a region

Use this when reading old provisioning code that tuned job-count or parallelism settings:

```python
capability = client.locations.get_capability("eastus2")

print(capability.max_job_count)
print(capability.max_degree_of_parallelism)
```

### List linked Data Lake Store accounts

```python
resource_group_name = "example-rg"
account_name = "example-adla"

for store in client.data_lake_store_accounts.list_by_account(
    resource_group_name,
    account_name,
):
    print(store.name, store.suffix)
```

### List linked Azure Storage accounts and containers

```python
resource_group_name = "example-rg"
account_name = "example-adla"
storage_account_name = "examplestorage"

for storage_account in client.storage_accounts.list_by_account(
    resource_group_name,
    account_name,
):
    print(storage_account.name, storage_account.suffix)

for container in client.storage_accounts.list_storage_containers(
    resource_group_name,
    account_name,
    storage_account_name,
):
    print(container.name)
```

The same operation group also exposes:

- `get_storage_container(...)`
- `list_sas_tokens(...)`
- `add(...)`
- `update(...)`
- `delete(...)`

### List compute policies and firewall rules

```python
resource_group_name = "example-rg"
account_name = "example-adla"

for policy in client.compute_policies.list_by_account(
    resource_group_name,
    account_name,
):
    print(
        policy.name,
        policy.object_type,
        policy.max_degree_of_parallelism_per_job,
        policy.min_priority_per_job,
    )

for rule in client.firewall_rules.list_by_account(
    resource_group_name,
    account_name,
):
    print(rule.name, rule.start_ip_address, rule.end_ip_address)
```

## Legacy Mutation Shapes

These methods still exist in the SDK reference, but because Azure Data Lake Analytics retired on February 29, 2024, treat them as legacy code-maintenance surfaces, not live provisioning guidance.

### Add a linked Azure Storage account

The current model reference documents `AddStorageAccountParameters(access_key, suffix='azuredatalakestore.net')`:

```python
import os

from azure.mgmt.datalake.analytics.account.models import AddStorageAccountParameters

client.storage_accounts.add(
    resource_group_name="example-rg",
    account_name="example-adla",
    storage_account_name="examplestorage",
    parameters=AddStorageAccountParameters(
        access_key=os.environ["AZURE_STORAGE_ACCOUNT_KEY"],
        suffix="azuredatalakestore.net",
    ),
)
```

### Current create/update payload shape for accounts, compute policies, and firewall rules

The REST API examples show these field names for the management payloads:

- account create: `location`, `tags`, `properties.defaultDataLakeStoreAccount`, `properties.dataLakeStoreAccounts`, `properties.storageAccounts`, `properties.computePolicies`, `properties.firewallRules`
- compute policy create/update: `properties.objectId`, `properties.objectType`, `properties.maxDegreeOfParallelismPerJob`, `properties.minPriorityPerJob`
- firewall rule create/update: `properties.startIpAddress`, `properties.endIpAddress`

If you are reading or migrating older code, those are the shapes the SDK models map to.

## Legacy Job Management Pattern

The official package overview still shows a job-management client:

```python
import uuid

from azure.identity import DefaultAzureCredential
from azure.mgmt.datalake.analytics.job import DataLakeAnalyticsJobManagementClient
from azure.mgmt.datalake.analytics.job.models import JobInformation, USqlJobProperties

job_id = uuid.uuid4()
script = "PRINT 'hello';"

job_client = DataLakeAnalyticsJobManagementClient(
    DefaultAzureCredential(),
    "azuredatalakeanalytics.net",
)

job_result = job_client.job.create(
    "example-adla",
    job_id,
    JobInformation(
        name="Sample Job",
        type="USql",
        properties=USqlJobProperties(script=script),
    ),
)
```

Keep this in the doc only as a legacy reference. The service retirement means new job submission code should not be your default path.

## Important Pitfalls

- This package is for Azure Data Lake Analytics management-plane work, not modern Azure analytics development.
- The official overview page still shows older examples such as `client.account.create(...)`, but the current account client reference exposes `client.accounts.begin_create(...)`, `client.accounts.get(...)`, and `client.accounts.list(...)`.
- The package is old. PyPI says `0.6.0` was tested against much older Python versions, so compatibility with modern runtimes is not something you should assume.
- `subscription_id` is always required for the current account-management client.
- The current account-management client documents long-running account mutations through `begin_create`, `begin_update`, and `begin_delete`, so legacy code may need `.result()` or equivalent poller handling.
- Many official examples predate the service retirement. Read them as API-shape references, not as proof that provisioning or job submission still works in a current Azure tenant.

## Official Sources

- https://pypi.org/project/azure-mgmt-datalake-analytics/
- https://learn.microsoft.com/en-us/python/api/overview/azure/data-lake-analytics?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.datalakeanalyticsaccountmanagementclient?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.accountsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.storageaccountsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.datalakestoreaccountsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.computepoliciesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.firewallrulesoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-datalake-analytics/azure.mgmt.datalake.analytics.account.operations.locationsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/rest/api/datalakeanalytics/accounts/create?view=rest-datalakeanalytics-2016-11-01
- https://learn.microsoft.com/en-us/rest/api/datalakeanalytics/compute-policies/create-or-update?view=rest-datalakeanalytics-2016-11-01
- https://learn.microsoft.com/en-us/answers/questions/776944/azure-data-lake-analytics-retirement-frequently-as
