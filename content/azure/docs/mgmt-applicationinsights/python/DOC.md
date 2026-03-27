---
name: mgmt-applicationinsights
description: "Azure Application Insights management SDK for Python for ARM components, billing and quota settings, web tests, and workbooks"
metadata:
  languages: "python"
  versions: "4.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,application-insights,monitoring,arm,workbooks,synthetics,python"
---

# Azure Application Insights Management SDK for Python

## Golden Rule

Use `azure-mgmt-applicationinsights` for Azure Resource Manager work around Application Insights resources: creating and reading Application Insights components, checking billing and quota settings, managing synthetic web tests, and working with workbooks. This package is a management-plane SDK. It does not send telemetry from your app and it does not query telemetry data at runtime.

Stay on the stable `4.1.0` line unless your project is intentionally testing the `5.0.0b1` prerelease that PyPI also lists.

## Install

Install the package together with `azure-identity`:

```bash
python -m pip install "azure-mgmt-applicationinsights==4.1.0" "azure-identity"
```

Common alternatives:

```bash
uv add "azure-mgmt-applicationinsights==4.1.0" "azure-identity"
poetry add "azure-mgmt-applicationinsights==4.1.0" "azure-identity"
```

PyPI lists `azure-mgmt-applicationinsights 4.1.0` as supporting Python `3.8+`.

## Authentication And Setup

Use Azure Identity credentials and provide the subscription explicitly.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

For service-principal auth, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Local development after `az login`:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.applicationinsights import ApplicationInsightsManagementClient

client = ApplicationInsightsManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Reusable app or automation setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.applicationinsights import ApplicationInsightsManagementClient

credential = DefaultAzureCredential()
client = ApplicationInsightsManagementClient(
    credential=credential,
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

Close the client when the script exits:

```python
client.close()
```

## What The Client Covers

`ApplicationInsightsManagementClient` defaults to API version `2023-06-01`. In `4.1.0`, the documented operation groups include:

- `components`
- `component_current_billing_features`
- `component_quota_status`
- `api_keys`
- `analytics_items`
- `annotations`
- `favorites`
- `proactive_detection_configurations`
- `web_test_locations`
- `web_tests`
- `workbooks`
- `my_workbooks`
- `workbook_templates`

`deleted_workbooks` is also present in `4.1.0`, but the client docs mark it under `2024-02-01-preview`, so use a preview `api_version` when you need that operation group.

## Core Usage

### Create Or Update A Workspace-Based Application Insights Component

As of the `4.x` line, create components as workspace-based resources and pass the Log Analytics workspace ARM ID explicitly.

```python
from azure.mgmt.applicationinsights.models import ApplicationInsightsComponent

workspace_id = (
    "/subscriptions/00000000-0000-0000-0000-000000000000/"
    "resourceGroups/example-rg/providers/"
    "Microsoft.OperationalInsights/workspaces/example-law"
)

component = client.components.create_or_update(
    resource_group_name="example-rg",
    resource_name="example-ai",
    insight_properties=ApplicationInsightsComponent(
        location="westus2",
        kind="web",
        application_type="web",
        workspace_resource_id=workspace_id,
        retention_in_days=90,
        ingestion_mode="LogAnalytics",
        public_network_access_for_ingestion="Enabled",
        public_network_access_for_query="Enabled",
        tags={
            "env": "dev",
            "owner": "context-hub",
        },
    ),
)

print(component.id)
print(component.workspace_resource_id)
```

Important details from the current docs:

- `location` and `kind` are required model fields.
- `4.0.0` added `workspace_resource_id` as a required parameter on `ApplicationInsightsComponent`.
- Older examples for classic, non-workspace resources are not the safe default for `4.1.0`.

### List And Get Components

```python
for item in client.components.list_by_resource_group("example-rg"):
    print(item.name, item.location, item.workspace_resource_id)

component = client.components.get(
    resource_group_name="example-rg",
    resource_name="example-ai",
)

print(component.app_id)
print(component.connection_string)
```

Use `list_by_subscription_id()` when you need a cross-resource-group inventory for the current subscription.

### Read Billing Features And Quota Settings

```python
billing = client.component_current_billing_features.get(
    resource_group_name="example-rg",
    resource_name="example-ai",
)

print(billing.current_billing_features)

quota = client.component_quota_status.get(
    resource_group_name="example-rg",
    resource_name="example-ai",
)

print(quota)
```

These calls are useful when automation needs to inspect current pricing or daily-cap related state before making changes.

### Discover Web Test Locations And Existing Web Tests

List the supported synthetic test locations for a component:

```python
for location in client.web_test_locations.list(
    resource_group_name="example-rg",
    resource_name="example-ai",
):
    print(location)
```

List the web tests currently attached to a component:

```python
for test in client.web_tests.list_by_component(
    component_name="example-ai",
    resource_group_name="example-rg",
):
    print(test.name, test.web_test_kind, test.enabled)
```

Read one specific web test:

```python
web_test = client.web_tests.get(
    resource_group_name="example-rg",
    web_test_name="example-ping-test",
)

print(web_test.name)
print(web_test.synthetic_monitor_id)
```

The package also exposes `web_tests.create_or_update(...)`, but the request body is large enough that it is worth starting from the current model docs instead of guessing fields from older samples.

### List Workbooks And Fetch Workbook Content

`workbooks` in the current client supports listing, fetching, updating, deleting, and reading revisions.

List workbook resources in a resource group:

```python
for workbook in client.workbooks.list_by_resource_group(
    resource_group_name="example-rg",
    category="workbook",
    can_fetch_content=False,
):
    print(workbook.name, workbook.display_name, workbook.category)
```

Fetch a workbook and include serialized content:

```python
workbook = client.workbooks.get(
    resource_group_name="example-rg",
    resource_name="11111111-2222-3333-4444-555555555555",
    can_fetch_content=True,
)

print(workbook.display_name)
print(workbook.version)
print(workbook.serialized_data)
```

Inspect workbook revisions:

```python
for revision in client.workbooks.revisions_list(
    resource_group_name="example-rg",
    resource_name="11111111-2222-3333-4444-555555555555",
):
    print(revision.revision)
```

Practical rule: the workbook resource name is a UUID-like resource identifier, while `display_name` is the human-facing title.

### Use The Preview Deleted Workbooks Surface

`deleted_workbooks` is documented under `2024-02-01-preview`, so create a second client with that API version when you need it:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.applicationinsights import ApplicationInsightsManagementClient

preview_client = ApplicationInsightsManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
    api_version="2024-02-01-preview",
)

for workbook in preview_client.deleted_workbooks.list_by_subscription(
    category="workbook",
):
    print(workbook.name)

preview_client.close()
```

Do not expect `deleted_workbooks` to be available from the default `2023-06-01` client.

## Version-Sensitive Notes

### `4.1.0`

PyPI release history for `4.1.0` notes:

- `DeletedWorkbooksOperations` was added.
- `system_data` was added to `Resource` and `TrackedResource`.

### `4.0.0`

The `4.0.0` release is the important compatibility break for current examples:

- `ApplicationInsightsComponent` added `workspace_resource_id` as a required parameter.
- Workbook operations changed signatures: `create_or_update`, `list_by_resource_group`, `list_by_subscription`, and `update`.

If you are copying older Learn articles, verify that the sample is not from the pre-workspace or pre-`4.0.0` package line.

## Common Pitfalls

- Installing `azure-mgmt-applicationinsights` without `azure-identity`
- Omitting `AZURE_SUBSCRIPTION_ID`; the credential does not provide the subscription automatically
- Copying pre-`4.0.0` examples that create classic Application Insights components without `workspace_resource_id`
- Expecting this package to send telemetry or query runtime logs; it manages Azure resources through ARM
- Calling `deleted_workbooks` on the default client instead of constructing a preview client with `api_version="2024-02-01-preview"`
- Treating workbook `display_name` as the ARM resource name; `workbooks.get(...)` and revision APIs use the workbook resource name
- Using Application Insights component purge guidance for workspace-based resources; the official component docs say purge is intended only for Classic resources and direct workspace-based purges should happen at the Log Analytics workspace

## Official Sources Used

- https://pypi.org/project/azure-mgmt-applicationinsights/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.applicationinsightsmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.models.applicationinsightscomponent?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.operations.componentsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.operations.webtestsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.operations.workbooksoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-applicationinsights/azure.mgmt.applicationinsights.operations.deletedworkbooksoperations?view=azure-python-preview
