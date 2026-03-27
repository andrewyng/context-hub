---
name: mgmt-policyinsights
description: "Azure Policy Insights management SDK for Python for policy state queries, compliance summaries, remediation jobs, and policy restriction checks"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,policy,policy-insights,compliance,remediation,governance,python"
---

# Azure Policy Insights SDK for Python

## Golden Rule

Use `azure-mgmt-policyinsights` for Azure Policy compliance and remediation workflows after a policy or initiative is already assigned. It is a management-plane SDK for querying policy states and events, triggering reevaluation scans, creating remediation jobs, and checking what Azure Policy would deny before you create a resource.

For `1.0.0`, pair it with `azure-identity` and the modern `credential=` constructor. Older examples that use `azure.common.credentials`, `CloudError`, or non-`begin_` long-running methods are from the pre-`1.0.0` client line.

## Install

```bash
python -m pip install "azure-mgmt-policyinsights==1.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-policyinsights==1.0.0" azure-identity
poetry add "azure-mgmt-policyinsights==1.0.0" azure-identity
```

## Authentication And Setup

For local development, sign in with Azure CLI:

```bash
az login
az account set --subscription "<subscription-id-or-name>"
export AZURE_SUBSCRIPTION_ID="<subscription-id>"
```

For service principal authentication, also set:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

Minimal client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.policyinsights import PolicyInsightsClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = PolicyInsightsClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

`PolicyInsightsClient` requires `subscription_id` even when the credential comes from Azure CLI, managed identity, or another `azure-identity` credential.

## What The Client Exposes

The stable `1.0.0` client exposes these main operation groups:

- `policy_states`
- `policy_events`
- `remediations`
- `policy_tracked_resources`
- `policy_metadata`
- `policy_restrictions`

The most common entry points are `policy_states`, `policy_events`, `remediations`, and `policy_restrictions`.

## Query Compliance State

Use policy states when you need the current or historical compliance records for resources.

- `"latest"` returns the latest policy state in the requested scope
- `"default"` returns all policy state records in the requested time window

`QueryOptions` supports `top`, `filter`, `order_by`, `select`, `from_property`, `to`, `apply`, `skip_token`, and `expand`.

### List the latest non-compliant resources in a subscription

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.policyinsights import PolicyInsightsClient
from azure.mgmt.policyinsights.models import QueryOptions

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = PolicyInsightsClient(
    credential=DefaultAzureCredential(),
    subscription_id=subscription_id,
)

pages = client.policy_states.list_query_results_for_subscription(
    policy_states_resource="latest",
    subscription_id=subscription_id,
    query_options=QueryOptions(
        filter="ComplianceState eq 'NonCompliant'",
        order_by="Timestamp desc",
        top=20,
    ),
)

for page in pages:
    for state in page.value or []:
        print(state.resource_id)
        print(state.policy_assignment_name)
        print(state.policy_definition_name)
        print(state.compliance_state)
        print(state.timestamp)
```

### Query one resource directly

If you already know the ARM resource ID, query that resource instead of the whole subscription:

```python
resource_id = (
    "/subscriptions/<subscription-id>/resourceGroups/example-rg/"
    "providers/Microsoft.Storage/storageAccounts/examplestorage"
)

pages = client.policy_states.list_query_results_for_resource(
    policy_states_resource="latest",
    resource_id=resource_id,
)

for page in pages:
    for state in page.value or []:
        print(state.resource_id, state.compliance_state)
```

### Summarize compliance counts

Use `summarize_*` when you need counts, not raw records:

```python
summary = client.policy_states.summarize_for_subscription(
    subscription_id=subscription_id,
    query_options=QueryOptions(filter="ComplianceState eq 'NonCompliant'"),
)

for item in summary.value or []:
    results = item.results
    print("non_compliant_resources:", results.non_compliant_resources)
    print("non_compliant_policies:", results.non_compliant_policies)

    for detail in results.policy_details or []:
        print(detail.compliance_state, detail.count)
```

The response shape is `SummarizeResults`, whose `value` contains one summary object with `results`.

## Query Policy Evaluation Events

Use policy events when you need evaluation history tied to resource operations rather than the current compliance snapshot.

```python
from datetime import datetime, timedelta, timezone

from azure.mgmt.policyinsights.models import QueryOptions

window_end = datetime.now(timezone.utc)
window_start = window_end - timedelta(hours=24)

pages = client.policy_events.list_query_results_for_resource_group(
    subscription_id=subscription_id,
    resource_group_name="example-rg",
    query_options=QueryOptions(
        from_property=window_start,
        to=window_end,
        order_by="Timestamp desc",
        top=50,
    ),
)

for page in pages:
    for event in page.value or []:
        print(event.timestamp)
        print(event.resource_id)
        print(event.policy_assignment_name)
        print(event.compliance_state)
        print(event.principal_oid)
```

`from_property` is the correct argument name in Python because `from` is a reserved keyword.

## Trigger A Fresh Evaluation Scan

Azure Policy data is not instant. If you need an updated compliance snapshot before querying policy states, trigger a reevaluation first.

For a whole subscription:

```python
poller = client.policy_states.begin_trigger_subscription_evaluation(
    subscription_id=subscription_id,
)
poller.result()
```

For one resource group:

```python
poller = client.policy_states.begin_trigger_resource_group_evaluation(
    subscription_id=subscription_id,
    resource_group_name="example-rg",
)
poller.result()
```

These are long-running operations and return `LROPoller[None]`.

## Create And Inspect Remediation Jobs

Use remediations when a policy assignment uses a `deployIfNotExists` or `modify` effect and you want Azure to fix existing non-compliant resources.

### Create a remediation at subscription scope

```python
from azure.mgmt.policyinsights.models import Remediation

policy_assignment_id = (
    f"/subscriptions/{subscription_id}"
    "/providers/Microsoft.Authorization/policyAssignments/enforce-tags"
)

remediation = client.remediations.create_or_update_at_subscription(
    remediation_name="enforce-tags-remediation",
    parameters=Remediation(
        policy_assignment_id=policy_assignment_id,
        resource_discovery_mode="ExistingNonCompliant",
    ),
)

print(remediation.id)
print(remediation.name)
print(remediation.provisioning_state)
```

If the assignment targets an initiative, set `policy_definition_reference_id` to the specific definition reference inside that initiative.

### Reevaluate compliance before remediation

Use `resource_discovery_mode="ReEvaluateCompliance"` when you want Azure Policy to reevaluate resources instead of using the existing compliance snapshot:

```python
remediation = client.remediations.create_or_update_at_subscription(
    remediation_name="recheck-and-remediate",
    parameters=Remediation(
        policy_assignment_id=policy_assignment_id,
        resource_discovery_mode="ReEvaluateCompliance",
    ),
)
```

### Check remediation status later

```python
current = client.remediations.get_at_subscription(
    remediation_name="enforce-tags-remediation",
)

print(current.provisioning_state)
print(current.deployment_status)
```

You can also list existing remediations with `client.remediations.list_for_subscription()`.

## Check What Azure Policy Would Deny Before Creating A Resource

Use policy restrictions to evaluate a planned resource shape before calling the resource provider.

```python
from azure.mgmt.policyinsights.models import (
    CheckRestrictionsRequest,
    CheckRestrictionsResourceDetails,
    PendingField,
)

request = CheckRestrictionsRequest(
    resource_details=CheckRestrictionsResourceDetails(
        api_version="2023-05-01",
        resource_content={
            "type": "Microsoft.Storage/storageAccounts",
            "name": "examplestorageacct",
            "location": "westus2",
            "kind": "StorageV2",
            "sku": {"name": "Standard_LRS"},
            "properties": {},
        },
    ),
    pending_fields=[
        PendingField(field="location", values=["westus2", "eastus2"]),
        PendingField(
            field="Microsoft.Storage/storageAccounts/sku.name",
            values=["Standard_LRS", "Standard_GRS"],
        ),
    ],
)

result = client.policy_restrictions.check_at_subscription_scope(parameters=request)

for restriction in result.field_restrictions or []:
    print(restriction.field)
    print(restriction.values)
```

If you already know the target resource group, use `check_at_resource_group_scope(resource_group_name=..., parameters=request)` instead.

`resource_content` can be partial, but it needs to be realistic enough for Azure Policy to evaluate the fields your assignments care about. If the resource is a child resource, set `scope` on `CheckRestrictionsResourceDetails` to the parent resource ID.

## Common Pitfalls

- Installing only `azure-mgmt-policyinsights` and forgetting `azure-identity`
- Passing old `credentials=` arguments copied from pre-`1.0.0` samples instead of `credential=...`
- Using `"default"` for all queries when you only need the current compliance snapshot; `"latest"` is usually the better default
- Using `from=` in Python code instead of `from_property=...` in `QueryOptions`
- Iterating the query iterator as if each item were a single policy record; the iterator yields result objects whose `.value` contains the records
- Creating a remediation without the full policy assignment resource ID
- Forgetting `policy_definition_reference_id` when remediating one definition inside an initiative assignment
- Expecting remediation to fix `deny` or `audit` policies; remediation is for remediable effects such as `deployIfNotExists` and `modify`
- Expecting newly assigned policies to appear immediately in policy state queries without waiting for evaluation or triggering a scan

## Version Notes For `1.0.0`

- PyPI lists `azure-mgmt-policyinsights 1.0.0` as released on January 4, 2021.
- The `1.0.0` release added `PolicyRestrictionsOperations`.
- The `1.0.0b1` line introduced the modern Azure SDK patterns this guide uses: `azure-identity` credentials, `credential=` instead of `credentials=`, `azure.core.exceptions.HttpResponseError`, `begin_` long-running methods, and official async support in the `aio` namespace.
- Older blog posts and snippets from the `0.x` package line are often wrong for `1.0.0` if they use deprecated auth imports or older long-running method names.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-policyinsights/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.policyinsightsclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.operations.policystatesoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.operations.policyeventsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.operations.remediationsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.operations.policyrestrictionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.models.queryoptions?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.models.remediation?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.models.checkrestrictionsrequest?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-policyinsights/azure.mgmt.policyinsights.models.pendingfield?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-identity/azure.identity.defaultazurecredential?view=azure-python
