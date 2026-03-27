---
name: mgmt-logic
description: "Azure Logic Apps management SDK for Python for workflows, triggers, runs, integration accounts, and integration service environments"
metadata:
  languages: "python"
  versions: "10.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,logic-apps,management,arm,workflows,triggers,integration-accounts,python"
---

# Azure Logic Apps Management SDK for Python

## Golden Rule

Use `azure-mgmt-logic` with `azure-identity` when you need to manage Azure Logic Apps resources through Azure Resource Manager. Start with `LogicManagementClient(credential, subscription_id)` and treat workflow definitions as raw Logic Apps Workflow Definition Language JSON.

This package is for management-plane operations such as creating workflows, listing triggers, reading run history, managing integration accounts, and working with integration service environments. It is not a replacement for calling a workflow's runtime callback URL or for connector-specific data-plane SDKs.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-logic==10.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-logic==10.0.0" azure-identity
poetry add "azure-mgmt-logic==10.0.0" azure-identity
```

PyPI describes `10.0.0` as the stable Azure Logic Apps management client and notes that the package has been tested with Python 3.6+, but in practice you should use a currently supported Python runtime.

## Authentication And Client Setup

For reusable code, use `DefaultAzureCredential`. For local scripts, `AzureCliCredential` is often simpler after `az login`.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_RESOURCE_GROUP="example-rg"
export LOGIC_APP_LOCATION="westus2"
export LOGIC_APP_NAME="example-http-workflow"
```

Minimal client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.logic import LogicManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = LogicManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

Local Azure CLI setup:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.logic import LogicManagementClient

client = LogicManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The client constructor defaults `base_url` to `https://management.azure.com` and the Learn reference warns that overriding the default `api_version` (`2019-05-01`) can result in unsupported behavior.

## Create Or Update A Workflow

The `workflows.create_or_update(...)` call expects a `Workflow` model. The most important field is `definition`, which is the underlying Logic Apps workflow JSON.

This example creates a simple HTTP request/response workflow:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.logic import LogicManagementClient
from azure.mgmt.logic.models import Workflow

resource_group = os.environ["AZURE_RESOURCE_GROUP"]
workflow_name = os.environ["LOGIC_APP_NAME"]
location = os.environ["LOGIC_APP_LOCATION"]

client = LogicManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

definition = {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "triggers": {
        "Request": {
            "type": "Request",
            "kind": "Http",
            "inputs": {
                "method": "POST",
                "schema": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                    },
                },
            },
        }
    },
    "actions": {
        "Response": {
            "type": "Response",
            "kind": "http",
            "inputs": {
                "statusCode": 200,
                "headers": {
                    "content-type": "application/json",
                },
                "body": {
                    "message": "@{coalesce(triggerBody()?['name'], 'world')}",
                },
            },
            "runAfter": {},
        }
    },
    "outputs": {},
}

workflow = Workflow(
    location=location,
    state="Enabled",
    definition=definition,
)

result = client.workflows.create_or_update(
    resource_group_name=resource_group,
    workflow_name=workflow_name,
    workflow=workflow,
)

print(result.id)
print(result.state)
print(result.access_endpoint)
```

Important details:

- The request trigger creates an endpoint, but you still need the callback URL before you can call it.
- The `Workflow` model in `10.0.0` also accepts `identity`, `tags`, `integration_account`, `integration_service_environment`, and `parameters` when your workflow needs them.
- If you want to check a definition before writing it, the same operation group also exposes `validate_by_location(...)` and `validate_by_resource_group(...)`.

## Get The Callback URL

For a request trigger, use `workflow_triggers.list_callback_url(...)` after the workflow exists:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.logic import LogicManagementClient

client = LogicManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

callback = client.workflow_triggers.list_callback_url(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    trigger_name="Request",
)

print(callback.value)
```

If you need an expiring URL or want to choose the primary versus secondary key, use `workflows.list_callback_url(...)` with `GetCallbackUrlParameters`:

```python
import os
from datetime import datetime, timedelta, timezone

from azure.identity import DefaultAzureCredential
from azure.mgmt.logic import LogicManagementClient
from azure.mgmt.logic.models import GetCallbackUrlParameters

client = LogicManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

callback = client.workflows.list_callback_url(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    list_callback_url=GetCallbackUrlParameters(
        not_after=datetime.now(timezone.utc) + timedelta(hours=1),
        key_type="Primary",
    ),
)

print(callback.value)
```

## Call The Workflow Endpoint

Once you have the callback URL, the runtime call is a normal HTTP request:

```python
import json
import urllib.request

callback_url = "https://...the callback URL from list_callback_url..."
payload = json.dumps({"name": "Azure"}).encode("utf-8")

request = urllib.request.Request(
    callback_url,
    data=payload,
    method="POST",
    headers={"Content-Type": "application/json"},
)

with urllib.request.urlopen(request, timeout=30) as response:
    print(response.status)
    print(response.read().decode("utf-8"))
```

## Inspect Workflows, Triggers, And Runs

### List workflows in a resource group

`workflows.list_by_resource_group(...)` supports `State`, `Trigger`, and `ReferencedResourceId` filters.

```python
import os

for workflow in client.workflows.list_by_resource_group(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    top=20,
):
    print(workflow.name, workflow.state, workflow.provisioning_state)
```

### Inspect triggers

```python
import os

trigger = client.workflow_triggers.get(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    trigger_name="Request",
)

print(trigger.name, trigger.state, trigger.status)

schema = client.workflow_triggers.get_schema_json(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    trigger_name="Request",
)

print(schema)
```

The same operation group also exposes `run(...)`, `reset(...)`, and `set_state(...)` when you need to manually run, reset, enable, or disable a trigger.

### Inspect recent runs

`workflow_runs.list(...)` supports `Status`, `StartTime`, and `ClientTrackingId` filters.

```python
import os

for run in client.workflow_runs.list(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    top=10,
):
    print(run.name, run.status, run.start_time)
```

Fetch one run in full:

```python
import os

run = client.workflow_runs.get(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    run_name="<run-name>",
)

print(run.status)
print(run.correlation_id)
print(run.outputs)
```

If a run is still active and you need to stop it:

```python
client.workflow_runs.cancel(
    resource_group_name=os.environ["AZURE_RESOURCE_GROUP"],
    workflow_name=os.environ["LOGIC_APP_NAME"],
    run_name="<run-name>",
)
```

## Other Operation Groups You Will Probably Need

The `LogicManagementClient` surface is broader than workflows alone. Common operation groups in the official reference include:

- `integration_accounts`
- `integration_account_agreements`
- `integration_account_assemblies`
- `integration_account_batch_configurations`
- `integration_account_certificates`
- `integration_account_maps`
- `integration_account_partners`
- `integration_account_schemas`
- `integration_service_environments`

If your project is doing B2B or EDI automation, start by creating or locating the integration account resource first, then use the corresponding artifact operation groups under that account.

## Common Pitfalls

- Installing only `azure-mgmt-logic` and forgetting `azure-identity`
- Treating this package as the runtime client for workflow invocations instead of using the callback URL or ordinary HTTP requests
- Forgetting `AZURE_SUBSCRIPTION_ID`; the client does not infer it from the credential
- Overriding `api_version` on `LogicManagementClient` even though the reference marks that as potentially unsupported
- Calling `list_callback_url(...)` before the workflow and trigger actually exist
- Copying old Azure SDK for Python examples that still use `azure.common.credentials` or `CloudError`
- Forgetting that workflow definitions are raw Workflow Definition Language JSON, not Python-native helper objects

## Version-Sensitive Notes

### `10.0.0`

PyPI release history for `10.0.0` calls out:

- `Workflow` has a new `identity` parameter
- `IntegrationServiceEnvironment` has a new `identity` parameter
- `IntegrationServiceEnvironmentManagedApisOperations.begin_put(...)` has a new required parameter compared with earlier releases

### Upgrading from `8.x` or older

The `9.0.0` generation switched this package to the modern Azure SDK patterns:

- use `azure-identity` credentials instead of `azure.common.credentials` or `msrestazure.azure_active_directory`
- expect `credential=...` rather than older `credentials=...`
- expect long-running operations to use `begin_...`
- handle failures primarily as `azure.core.exceptions.HttpResponseError`
- use the `aio` namespace for async clients, for example `azure.mgmt.logic.aio.LogicManagementClient`

If a script still imports `azure.common.credentials`, it predates the current client generation and should not be copied directly into a `10.0.0` codebase.

## Official Sources Used

- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.logicmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.operations.workflowsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.operations.workflowtriggersoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.operations.workflowrunsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.models.workflow?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-logic/azure.mgmt.logic.models.getcallbackurlparameters?view=azure-python
- https://learn.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-schema
- https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-workflow-actions-triggers
- https://pypi.org/project/azure-mgmt-logic/
