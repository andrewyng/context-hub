---
name: mgmt-resource-policy
description: "Azure Policy management SDK for Python for policy definitions, assignments, initiatives, and policy definition version resources"
metadata:
  languages: "python"
  versions: "1.0.0b1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,policy,governance,arm,management,python"
---

# azure-mgmt-resource-policy Python Package Guide

## What This Package Is For

`azure-mgmt-resource-policy` is the Azure Resource Manager management-plane SDK for Azure Policy.

Use it when you need to:

- create or update custom policy definitions
- assign policies or initiatives at subscription, resource-group, resource, or management-group scope
- create policy set definitions (initiatives)
- inspect policy definition and initiative versions
- access policy-specific management operations exposed by `PolicyClient`

Primary import surface:

```python
from azure.mgmt.resource.policy import PolicyClient
```

This is an ARM management client. It is for Azure Policy resource management, not for querying compliance results from Policy Insights.

## Install

Install the package together with `azure-identity`:

```bash
python -m pip install "azure-mgmt-resource-policy==1.0.0b1" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-resource-policy==1.0.0b1" azure-identity
poetry add "azure-mgmt-resource-policy==1.0.0b1" azure-identity
```

Version notes from current official public sources:

- PyPI currently lists `1.0.0b1` as the published release and requires Python `>=3.9`.
- Azure's Python package index also lists `1.0.0b1`.
- Azure's dependency report already lists `1.0.0b2` in source, so check the package version your environment actually resolves before pinning a prerelease newer than PyPI's public project page.

## Authentication And Setup

For local development:

```bash
az login
az account set --subscription "<subscription-id-or-name>"
export AZURE_SUBSCRIPTION_ID="<subscription-id>"
```

For service principal auth:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export AZURE_SUBSCRIPTION_ID="<subscription-id>"
```

If you also use management-group operations:

```bash
export AZURE_MANAGEMENT_GROUP_ID="<management-group-id>"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.resource.policy import PolicyClient

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = PolicyClient(
    credential=DefaultAzureCredential(),
    subscription_id=subscription_id,
)
```

For local scripts that should only use the Azure CLI login:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.resource.policy import PolicyClient

client = PolicyClient(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

The current `PolicyClient` surface includes these main operation groups:

- `policy_definitions`
- `policy_assignments`
- `policy_set_definitions`
- `policy_definition_versions`
- `policy_set_definition_versions`
- `policy_tokens`
- `data_policy_manifests`

## Scope Handling

Policy assignments and some lookup APIs require full ARM scope strings.

Common patterns:

```python
import os

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
management_group_id = os.environ["AZURE_MANAGEMENT_GROUP_ID"]

subscription_scope = f"/subscriptions/{subscription_id}"
resource_group_scope = (
    f"/subscriptions/{subscription_id}/resourceGroups/example-rg"
)
resource_scope = (
    f"{resource_group_scope}"
    "/providers/Microsoft.Storage/storageAccounts/examplestorage"
)
management_group_scope = (
    f"/providers/Microsoft.Management/managementGroups/{management_group_id}"
)
```

If the scope string is malformed, the SDK call fails even when authentication is correct.

## Common Workflows

### List Built-In Policy Definitions

Use the built-in list APIs first when you want to reuse an existing Azure Policy instead of creating a custom one:

```python
for definition in client.policy_definitions.list_built_in(
    filter="category eq 'Storage'",
    top=5,
):
    print(definition.name)
    print(definition.display_name)
    print(definition.id)
```

You can fetch one built-in definition by name after you discover it:

```python
first = next(client.policy_definitions.list_built_in(top=1))

definition = client.policy_definitions.get_built_in(
    policy_definition_name=first.name
)

print(definition.id)
print(definition.display_name)
```

### Create A Custom Policy Definition At Subscription Scope

This example uses the storage-account audit rule from the Azure Policy "Programmatically create policies" article:

```python
from azure.mgmt.resource.policy.models import PolicyDefinition

definition = client.policy_definitions.create_or_update(
    policy_definition_name="audit-storage-public-network",
    parameters=PolicyDefinition(
        policy_type="Custom",
        mode="All",
        display_name="Audit Storage Accounts Open to Public Networks",
        description=(
            "Audit storage accounts whose network default action allows "
            "public access."
        ),
        metadata={"category": "Storage"},
        version="1.0.0",
        policy_rule={
            "if": {
                "allOf": [
                    {
                        "field": "type",
                        "equals": "Microsoft.Storage/storageAccounts",
                    },
                    {
                        "field": (
                            "Microsoft.Storage/storageAccounts/"
                            "networkAcls.defaultAction"
                        ),
                        "equals": "Allow",
                    },
                ]
            },
            "then": {"effect": "audit"},
        },
    ),
)

print(definition.id)
```

To create the same kind of definition at management-group scope, call `create_or_update_at_management_group(...)` instead and pass `management_group_id`.

### Assign A Policy To A Resource Group

Use the returned definition ID and a full scope string:

```python
from azure.mgmt.resource.policy.models import PolicyAssignment

scope = (
    f"/subscriptions/{subscription_id}/resourceGroups/example-rg"
)

assignment = client.policy_assignments.create(
    scope=scope,
    policy_assignment_name="audit-storage-public-network",
    parameters=PolicyAssignment(
        display_name="Audit Storage Accounts Open to Public Networks",
        description="Audit storage accounts in this resource group.",
        policy_definition_id=definition.id,
        enforcement_mode="Default",
        not_scopes=[
            (
                f"{scope}/providers/Microsoft.Storage/"
                "storageAccounts/excludedaccount"
            )
        ],
    ),
)

print(assignment.id)
```

To inspect effective assignment version metadata, the assignment APIs support:

```python
assignment = client.policy_assignments.get_by_id(
    policy_assignment_id=(
        f"{scope}/providers/Microsoft.Authorization/"
        "policyAssignments/audit-storage-public-network"
    ),
    expand="LatestDefinitionVersion,EffectiveDefinitionVersion",
)

print(assignment.latest_definition_version)
print(assignment.effective_definition_version)
```

### Create An Initiative (Policy Set Definition)

Initiatives group one or more policy definitions under a single assignable object:

```python
from azure.mgmt.resource.policy.models import (
    PolicyDefinitionReference,
    PolicySetDefinition,
)

initiative = client.policy_set_definitions.create_or_update(
    policy_set_definition_name="storage-guardrails",
    parameters=PolicySetDefinition(
        policy_type="Custom",
        display_name="Storage Guardrails",
        description="Group storage-related governance rules.",
        metadata={"category": "Storage"},
        version="1.0.0",
        policy_definitions=[
            PolicyDefinitionReference(
                policy_definition_id=definition.id,
                policy_definition_reference_id="audit-storage-public-network",
            )
        ],
    ),
)

print(initiative.id)
```

Management-group initiatives use `create_or_update_at_management_group(...)`.

### List Definition Versions

The current package exposes first-class version operations for both policy definitions and initiatives:

```python
for item in client.policy_definition_versions.list(
    policy_definition_name="audit-storage-public-network"
):
    print(item.name)
    print(item.id)
```

```python
for item in client.policy_set_definition_versions.list(
    policy_set_definition_name="storage-guardrails"
):
    print(item.name)
    print(item.id)
```

The version operation groups also expose built-in and management-group variants when you need to inspect non-subscription definitions.

### Query Data Policy Manifests

If you need policy-mode metadata for data resource types, use `data_policy_manifests`:

```python
for manifest in client.data_policy_manifests.list(
    filter="namespace eq 'Microsoft.KeyVault.Data'"
):
    print(manifest.namespace)
    print(manifest.resource_type)
```

## Important Pitfalls

- `subscription_id` is still required when you construct `PolicyClient`, even if you later call management-group operations.
- Scope strings must be full ARM IDs. Use `/providers/Microsoft.Management/managementGroups/{managementGroup}` for management groups, not just the group name.
- When you use the SDK model classes, pass `policy_rule` directly as the rule body. Do not wrap it in a top-level REST-style `properties` object.
- `PolicyAssignment.location` is only required when you attach a managed identity. If you add `identity`, set `location` too.
- Assignment list filters use specific service-side expressions such as `atScope()`, `atExactScope()`, or `policyDefinitionId eq '{value}'`. Definition list filters use patterns such as `category eq '{value}'`.
- The version operations expect semantic versions in `x.y.z` form for individual definition-version resources.
- This package is part of the Azure Resource Manager split packages. Newer `azure-mgmt-resource` docs explicitly call out `azure-mgmt-resource-policy` as the package that now owns policy operations.

## Version-Sensitive Notes

- `azure-mgmt-resource-policy` is still in beta in the current public docs.
- Public Azure package pages currently align on `1.0.0b1`, while Azure's dependency report already shows `1.0.0b2` in the source tree. If your project is pinned from an internal or prerelease feed, verify which version is actually available before copying examples unchanged.
- The split from `azure-mgmt-resource` matters for migrations. In current `azure-mgmt-resource 25.x` guidance, `policy` is no longer treated as part of the main resource management package.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-resource-policy/
- https://learn.microsoft.com/en-us/azure/developer/python/sdk/azure-sdk-library-package-index
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.policyclient?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.policydefinitionsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.policyassignmentsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.policysetdefinitionsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.policydefinitionversionsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.policysetdefinitionversionsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.operations.datapolicymanifestsoperations?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.models.policydefinition?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.models.policyassignment?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.models.policysetdefinition?view=azure-python-preview
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource-policy/azure.mgmt.resource.policy.models.policydefinitionreference?view=azure-python-preview
- https://learn.microsoft.com/en-us/azure/governance/policy/how-to/programmatically-create
- https://azuresdkartifacts.blob.core.windows.net/azure-sdk-for-python/dependencies/dependencies.html
