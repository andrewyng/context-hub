---
name: mgmt-cognitiveservices
description: "Azure AI Services and Azure OpenAI management-plane SDK for Python for accounts, models, deployments, keys, and project resources"
metadata:
  languages: "python"
  versions: "14.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,ai-services,cognitive-services,openai,arm,management,azure-identity"
---

# Azure Cognitive Services Management SDK for Python

## Golden Rule

Use `azure-mgmt-cognitiveservices` only for Azure Resource Manager control-plane work such as creating Azure AI Services or Azure OpenAI accounts, listing available models, managing deployments, rotating keys, and creating project resources. Pair it with `azure-identity`, authenticate with a modern `TokenCredential`, and use a service-specific data-plane SDK after the resource exists.

## Install

Install the management client and an Azure credential package together:

```bash
python -m pip install "azure-mgmt-cognitiveservices==14.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-cognitiveservices==14.1.0" azure-identity
poetry add "azure-mgmt-cognitiveservices==14.1.0" azure-identity
```

`14.1.0` supports Python `3.9+`.

## Authentication And Setup

Management-plane calls use Microsoft Entra tokens. The usual setup is:

- local development: `az login` plus `DefaultAzureCredential()` or `AzureCliCredential()`
- CI or local non-interactive scripts: service principal credentials
- Azure-hosted workloads: managed identity

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

If you use environment-based service-principal auth directly:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = CognitiveServicesManagementClient(
    credential=credential,
    subscription_id=subscription_id,
)
```

For local scripts that should use the active Azure CLI login explicitly:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

client = CognitiveServicesManagementClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## Core Usage

These patterns matter throughout the package:

- most writes are `begin_*` long-running ARM operations; call `.result()` before assuming the resource exists
- `subscription_id` is required even when the credential is valid
- this package manages ARM resources and metadata; it does not send prompts, synthesize speech, or run inference itself

### Discover Valid Kinds And SKUs For A Region

Do not guess the account `kind` or `sku`. Check what the subscription can create in your target region first:

```python
LOCATION = "eastus"

for sku in client.resource_skus.list():
    locations = {loc.lower() for loc in (sku.locations or [])}

    if LOCATION.lower() in locations and sku.kind in {"AIServices", "OpenAI"}:
        print(
            f"kind={sku.kind} sku={sku.name} "
            f"tier={sku.tier} restrictions={sku.restrictions}"
        )
```

This is the safest way to confirm whether your subscription and region support `AIServices`, `OpenAI`, or another resource kind before creating anything.

### Create Or Update An Account

Use `accounts.begin_create(...)` and keep the request body explicit. This example creates a generic Azure AI Services account using the first unrestricted SKU found for the region:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

RESOURCE_GROUP = "example-rg"
ACCOUNT_NAME = "example-ai-1234"
LOCATION = "eastus"

client = CognitiveServicesManagementClient(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

selected_sku = next(
    sku
    for sku in client.resource_skus.list()
    if sku.kind == "AIServices"
    and LOCATION.lower() in {loc.lower() for loc in (sku.locations or [])}
    and not sku.restrictions
)

account = client.accounts.begin_create(
    resource_group_name=RESOURCE_GROUP,
    account_name=ACCOUNT_NAME,
    account={
        "kind": selected_sku.kind,
        "location": LOCATION,
        "sku": {"name": selected_sku.name},
        "properties": {
            "custom_sub_domain_name": ACCOUNT_NAME,
            "public_network_access": "Enabled",
            "disable_local_auth": False,
        },
    },
).result()

print(account.id)
print(account.kind)
print(account.properties.endpoint)
```

Important account properties from the SDK docs:

- `custom_sub_domain_name` is the custom subdomain used for token-based authentication
- `public_network_access` controls whether the public endpoint stays reachable
- `disable_local_auth` disables key-based downstream authentication
- `allow_project_management` must be `True` if you plan to create child project resources under the account

### Read Keys Or Rotate One

The management client can return account keys for downstream service clients:

```python
keys = client.accounts.list_keys(
    resource_group_name="example-rg",
    account_name="example-ai-1234",
)

print(keys.key1)
print(keys.key2)
```

Rotate one key without replacing both:

```python
rotated = client.accounts.regenerate_key(
    resource_group_name="example-rg",
    account_name="example-ai-1234",
    key_name="Key2",
)

print(rotated.key2)
```

If you set `disable_local_auth=True`, do not expect key-based data-plane clients to keep working.

### List Deployable Models For An Account

Use `accounts.list_models(...)` to inspect models available to the account before creating a deployment:

```python
models = client.accounts.list_models(
    resource_group_name="example-rg",
    account_name="example-ai-1234",
)

for model in models:
    if model.skus:
        sku_names = [sku.name for sku in model.skus]
        print(model.format, model.name, model.version, sku_names)
```

This is safer than hardcoding a model name, version, or deployment SKU from an older example.

### Create Or Update A Deployment

Deployment creation goes through `client.deployments.begin_create_or_update(...)`. The deployment `sku` lives on the deployment resource itself; current SDK docs mark `properties.scale_settings` as deprecated.

```python
RESOURCE_GROUP = "example-rg"
ACCOUNT_NAME = "example-ai-1234"
DEPLOYMENT_NAME = "default-deployment"

model = next(
    item
    for item in client.accounts.list_models(
        resource_group_name=RESOURCE_GROUP,
        account_name=ACCOUNT_NAME,
    )
    if item.skus
)

deployment = client.deployments.begin_create_or_update(
    resource_group_name=RESOURCE_GROUP,
    account_name=ACCOUNT_NAME,
    deployment_name=DEPLOYMENT_NAME,
    deployment={
        "sku": {
            "name": model.skus[0].name,
            "capacity": 1,
        },
        "properties": {
            "model": {
                "format": model.format,
                "name": model.name,
                "version": model.version,
            },
            "version_upgrade_option": "NoAutoUpgrade",
        },
    },
).result()

print(deployment.id)
print(deployment.properties.provisioning_state)
```

Before you copy this into a real app, confirm the chosen model SKU and capacity match your quota for that region and account.

### Create A Project Under An Account

If you use Azure AI Foundry project resources, enable project management on the parent account first:

```python
client.accounts.begin_update(
    resource_group_name="example-rg",
    account_name="example-ai-1234",
    account={
        "properties": {
            "allow_project_management": True,
        }
    },
).result()
```

Then create the project:

```python
project = client.projects.begin_create(
    resource_group_name="example-rg",
    account_name="example-ai-1234",
    project_name="demo-project",
    project={
        "location": "eastus",
        "properties": {
            "display_name": "demo-project",
            "description": "Project container for app-specific resources",
        },
    },
).result()

print(project.id)
```

## Configuration Notes

- `CognitiveServicesManagementClient` defaults to API version `2025-09-01`. The SDK docs warn that overriding `api_version` may result in unsupported behavior.
- Reuse a long-lived client within a script or service instead of constructing one per call.
- `14.1.0` adds `cloud_setting` support for non-public Azure clouds. Keep the credential authority host and ARM cloud setting aligned if you target Azure Government or another sovereign cloud.
- Many create and update operations depend on ARM authorization at subscription, resource-group, or resource scope. A successful token from `DefaultAzureCredential` does not guarantee the caller can create accounts or deployments.

## Version-Sensitive Notes For 14.1.0

- PyPI lists `14.1.0` as released on `2025-10-24`.
- `14.1.0` adds `cloud_setting` on the management client plus `rai_topics` and `quota_tiers` operation groups.
- `14.0.0` is the breaking release that removed `NetworkInjections` in favor of `NetworkInjection`.
- `13.7.0` added `projects`, `account_connections`, `project_connections`, `account_capability_hosts`, and `project_capability_hosts`, plus related account properties such as `allow_project_management`.
- `13.0.0` is the release where the package stopped shipping older API-version subpackages and moved to the latest API version only. If your code imports older versioned namespaces, pin an earlier package release instead of mixing examples across major versions.

## Common Pitfalls

- Installing only `azure-mgmt-cognitiveservices` and forgetting `azure-identity`
- Using this package for data-plane inference, speech synthesis, vision analysis, or embeddings instead of only ARM management
- Omitting `AZURE_SUBSCRIPTION_ID`
- Skipping `.result()` on `begin_create`, `begin_update`, `begin_delete`, or deployment operations
- Hardcoding account `kind`, account `sku`, model name, or deployment SKU without checking `resource_skus.list()` and `accounts.list_models(...)`
- Setting `disable_local_auth=True` and then expecting account keys to keep working in downstream clients
- Forgetting `custom_sub_domain_name` when the target service requires a token-auth-enabled custom subdomain
- Using deprecated deployment `scale_settings` instead of the deployment-level `sku`
- Trying to create projects before enabling `allow_project_management` on the parent account

## Official Sources Used

- https://pypi.org/project/azure-mgmt-cognitiveservices/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.cognitiveservicesmanagementclient?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.operations.accountsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.operations.deploymentsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.operations.projectsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.account?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.accountproperties?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.deployment?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.deploymentproperties?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.project?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-cognitiveservices/azure.mgmt.cognitiveservices.models.sku?view=azure-python
- https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts
