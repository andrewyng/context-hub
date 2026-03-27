---
name: mgmt-managedservices
description: "Azure Lighthouse management-plane SDK for Python for registration definitions, registration assignments, and marketplace-managed services delegations"
metadata:
  languages: "python"
  versions: "6.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-lighthouse,managed-services,management,delegation,multitenant,python"
---

# azure-mgmt-managedservices Python Package Guide

## What This Package Is For

`azure-mgmt-managedservices` is the Azure Resource Manager SDK for Azure Lighthouse delegated resource management.

Use it when you need to:

- create or inspect a registration definition in the customer subscription
- create or inspect registration assignments at subscription or resource-group scope
- read marketplace registration definitions exposed by Azure Managed Services offers

Primary import surface:

```python
from azure.mgmt.managedservices import ManagedServicesClient
```

This is a management-plane client. It works with ARM scopes such as `/subscriptions/<id>` and `/subscriptions/<id>/resourceGroups/<name>`.

## Install

Install the package with `azure-identity`:

```bash
python -m pip install "azure-mgmt-managedservices==6.0.0" azure-identity
```

`6.0.0` is the stable track-2 package line. PyPI also lists newer `7.0.0b*` prereleases, so pin `6.0.0` if you want the API surface covered here.

## Authentication And Setup

Use `DefaultAzureCredential` for most code and sign in locally with Azure CLI:

```bash
az login
```

Example environment variables used by the snippets below:

```bash
export CUSTOMER_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export CUSTOMER_RESOURCE_GROUP="delegated-rg"
export MANAGING_TENANT_ID="11111111-1111-1111-1111-111111111111"
export MANAGING_PRINCIPAL_ID="22222222-2222-2222-2222-222222222222"
export ACTIVE_ROLE_DEFINITION_ID="<built-in-role-guid>"
export ELIGIBLE_ROLE_DEFINITION_ID="<built-in-role-guid>"
```

If you use a service principal directly, `DefaultAzureCredential` also supports:

```bash
export AZURE_TENANT_ID="11111111-1111-1111-1111-111111111111"
export AZURE_CLIENT_ID="33333333-3333-3333-3333-333333333333"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Client initialization:

```python
from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient

credential = DefaultAzureCredential()
client = ManagedServicesClient(credential=credential)
```

Important setup detail: `ManagedServicesClient` is scope-based. Unlike many Azure management SDKs, you do not pass a subscription ID to the client constructor. Each operation takes a `scope` argument instead.

## Required Azure Roles And Scope Rules

Azure Lighthouse onboarding creates two ARM resources:

- a registration definition at subscription scope
- a registration assignment at each delegated scope

The onboarding identity in the customer tenant needs permission to create those resources. Microsoft documents this as requiring permissions such as `Microsoft.ManagedServices/registrationDefinitions/write` and `Microsoft.Authorization/roleAssignments/write`, which built-in roles such as `Owner` include.

For `authorization.role_definition_id` and `eligible_authorization.role_definition_id`, use built-in role GUIDs supported by Azure delegated resource management. The onboarding docs explicitly say not to use roles with `DataActions`, and not to use the `Owner` role.

## Core Workflow

### Create A Registration Definition

Create the definition at the customer subscription scope. The SDK call is a long-running operation, so wait on `.result()`.

```python
import os
import uuid
from datetime import timedelta

from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient
from azure.mgmt.managedservices.models import (
    Authorization,
    EligibleAuthorization,
    JustInTimeAccessPolicy,
    RegistrationDefinition,
    RegistrationDefinitionProperties,
)

subscription_scope = f"/subscriptions/{os.environ['CUSTOMER_SUBSCRIPTION_ID']}"

client = ManagedServicesClient(credential=DefaultAzureCredential())

definition = client.registration_definitions.begin_create_or_update(
    registration_definition_id=str(uuid.uuid4()),
    scope=subscription_scope,
    request_body=RegistrationDefinition(
        properties=RegistrationDefinitionProperties(
            registration_definition_name="Contoso delegation",
            description="Delegation for the Contoso operations team",
            managed_by_tenant_id=os.environ["MANAGING_TENANT_ID"],
            authorizations=[
                Authorization(
                    principal_id=os.environ["MANAGING_PRINCIPAL_ID"],
                    principal_id_display_name="Contoso Operations",
                    role_definition_id=os.environ["ACTIVE_ROLE_DEFINITION_ID"],
                )
            ],
            eligible_authorizations=[
                EligibleAuthorization(
                    principal_id=os.environ["MANAGING_PRINCIPAL_ID"],
                    principal_id_display_name="Contoso Operations",
                    role_definition_id=os.environ["ELIGIBLE_ROLE_DEFINITION_ID"],
                    just_in_time_access_policy=JustInTimeAccessPolicy(
                        multi_factor_auth_provider="Azure",
                        maximum_activation_duration=timedelta(hours=2),
                    ),
                )
            ],
        )
    ),
).result()

print(definition.id)
print(definition.properties.provisioning_state)
```

Why both `authorizations` and `eligible_authorizations` appear here:

- `authorizations` define always-active delegated roles
- `eligible_authorizations` define just-in-time roles for Azure Lighthouse eligible authorization flows

Microsoft's eligible-authorization guidance says:

- eligible authorizations cannot be used with service principals
- every eligible authorization must have a matching permanent `Reader` authorization for the same principal
- `maximum_activation_duration` must be between 30 minutes and 8 hours
- if you omit approvers, any user in the managing tenant with the eligible role can activate it

### Assign The Definition To A Delegated Scope

After the definition exists, create a registration assignment at the delegated subscription or resource-group scope.

```python
import os
import uuid

from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient
from azure.mgmt.managedservices.models import (
    RegistrationAssignment,
    RegistrationAssignmentProperties,
)

subscription_scope = f"/subscriptions/{os.environ['CUSTOMER_SUBSCRIPTION_ID']}"
resource_group_scope = (
    f"{subscription_scope}/resourceGroups/{os.environ['CUSTOMER_RESOURCE_GROUP']}"
)

client = ManagedServicesClient(credential=DefaultAzureCredential())

definition_id = "/subscriptions/00000000-0000-0000-0000-000000000000/providers/Microsoft.ManagedServices/registrationDefinitions/44444444-4444-4444-4444-444444444444"

assignment = client.registration_assignments.begin_create_or_update(
    scope=resource_group_scope,
    registration_assignment_id=str(uuid.uuid4()),
    request_body=RegistrationAssignment(
        properties=RegistrationAssignmentProperties(
            registration_definition_id=definition_id,
        )
    ),
).result()

print(assignment.id)
print(assignment.properties.provisioning_state)
```

Use the `definition.id` returned by the definition-create step for `registration_definition_id`.

### Read A Definition Or Assignment

Fetch a definition by subscription scope plus definition GUID:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient

subscription_scope = f"/subscriptions/{os.environ['CUSTOMER_SUBSCRIPTION_ID']}"
definition_id = "44444444-4444-4444-4444-444444444444"

client = ManagedServicesClient(credential=DefaultAzureCredential())

definition = client.registration_definitions.get(
    scope=subscription_scope,
    registration_definition_id=definition_id,
)

print(definition.properties.registration_definition_name)
print(definition.properties.managed_by_tenant_id)
```

Fetch an assignment and ask ARM to expand the linked definition:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient

resource_group_scope = (
    f"/subscriptions/{os.environ['CUSTOMER_SUBSCRIPTION_ID']}"
    f"/resourceGroups/{os.environ['CUSTOMER_RESOURCE_GROUP']}"
)
assignment_id = "55555555-5555-5555-5555-555555555555"

client = ManagedServicesClient(credential=DefaultAzureCredential())

assignment = client.registration_assignments.get(
    scope=resource_group_scope,
    registration_assignment_id=assignment_id,
    expand_registration_definition=True,
)

print(assignment.properties.registration_definition_id)
print(assignment.properties.registration_definition.properties.registration_definition_name)
```

Use `expand_registration_definition=True` when you need the definition details in the same response instead of making a second lookup.

### Remove A Delegation

Delete the assignment at the delegated scope, then remove the definition from the customer subscription scope.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.managedservices import ManagedServicesClient

subscription_scope = f"/subscriptions/{os.environ['CUSTOMER_SUBSCRIPTION_ID']}"
resource_group_scope = (
    f"{subscription_scope}/resourceGroups/{os.environ['CUSTOMER_RESOURCE_GROUP']}"
)

client = ManagedServicesClient(credential=DefaultAzureCredential())

client.registration_assignments.begin_delete(
    scope=resource_group_scope,
    registration_assignment_id="55555555-5555-5555-5555-555555555555",
).result()

client.registration_definitions.delete(
    scope=subscription_scope,
    registration_definition_id="44444444-4444-4444-4444-444444444444",
)
```

`registration_assignments.begin_delete(...)` is long-running. `registration_definitions.delete(...)` is not.

## Marketplace Definitions

The package also exposes marketplace-focused operation groups:

- `marketplace_registration_definitions`
- `marketplace_registration_definitions_without_scope`

Use them when you need to inspect Azure Managed Services marketplace offer definitions rather than creating your own direct Azure Lighthouse delegation.

## Common Pitfalls

- Forgetting that the client constructor does not take `subscription_id`; every operation needs a full ARM `scope`.
- Passing a full ARM role definition resource ID where Azure Lighthouse expects a built-in role GUID.
- Using unsupported roles in `authorizations`; Azure Lighthouse onboarding docs explicitly reject `Owner` and roles with `DataActions`.
- Creating eligible authorizations for service principals. Azure Lighthouse eligible authorization is only for user or group principals.
- Skipping the permanent `Reader` authorization that must accompany an eligible authorization for the same principal.
- Creating the definition at a resource-group scope. Registration definitions are created at the subscription level.
- Expecting portal visibility immediately. Microsoft notes that onboarding changes can take time to propagate.

## Version Notes For `6.0.0`

- PyPI release notes for `6.0.0b1` describe the track-2 migration for this package: credential-based client construction, `azure-identity` authentication, `azure-core` transport, and `begin_` long-running operation methods.
- PyPI release notes for `6.0.0` add the `marketplace_registration_definitions_without_scope` operation group.
- If you copy older `msrestazure`-style examples for this package, they may not match the `6.x` client shape.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-managedservices/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managedservices/azure.mgmt.managedservices.operations.registrationdefinitionsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managedservices/azure.mgmt.managedservices.operations.registrationassignmentsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managedservices/azure.mgmt.managedservices.models.authorization?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managedservices/azure.mgmt.managedservices.models.eligibleauthorization?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-managedservices/azure.mgmt.managedservices.models.justintimeaccesspolicy?view=azure-python
- https://learn.microsoft.com/en-us/azure/lighthouse/concepts/architecture
- https://learn.microsoft.com/en-us/azure/lighthouse/how-to/onboard-customer
- https://learn.microsoft.com/en-us/azure/lighthouse/how-to/create-eligible-authorizations
