---
name: mgmt-security
description: "Azure Security Center / Microsoft Defender for Cloud management SDK for Python for subscription pricing, assessments, secure posture, and security contacts"
metadata:
  languages: "python"
  versions: "7.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,security,defender-for-cloud,management,arm,python"
---

# Azure Security Center / Defender for Cloud SDK for Python

## Golden Rule

Use `azure-mgmt-security` for Azure Resource Manager management-plane automation against Microsoft Defender for Cloud. Pair it with `azure-identity`, authenticate with a `TokenCredential`, and pass a subscription ID into `SecurityCenter`.

This package does not scan machines or onboard agents by itself. It manages and queries `Microsoft.Security` resources such as Defender plans, assessments, secure score, contacts, and connector-related resources.

Microsoft Learn documents `SecurityCenter` as a multi-version client: one package exposes many operation groups across different API versions, and the default profile uses the latest public Azure mapping. For routine code, use the default client unless you have a verified reason to pin `api_version` or `profile`.

## Install

Pin the package version you want and install `azure-identity` alongside it:

```bash
python -m pip install "azure-mgmt-security==7.0.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-security==7.0.0" azure-identity
poetry add "azure-mgmt-security==7.0.0" azure-identity
```

PyPI lists Python `3.8+` for `7.0.0`.

## Authentication And Setup

For local development, sign in with Azure CLI:

```bash
az login
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
```

For service-principal auth with `DefaultAzureCredential`, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = SecurityCenter(
    credential=credential,
    subscription_id=subscription_id,
)

try:
    # use client here
    pass
finally:
    client.close()
```

If you want local CLI auth only, use `AzureCliCredential()` instead of `DefaultAzureCredential()`.

## Core Workflows

### List Defender For Cloud Pricing Plans

Use `pricings.list()` to see which subscription-level plans are enabled before changing anything:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

try:
    for pricing in client.pricings.list():
        print(pricing.name)
        print("  tier:", pricing.pricing_tier)
        print("  sub-plan:", pricing.sub_plan)
        print("  free-trial:", pricing.free_trial_remaining_time)
finally:
    client.close()
```

The `Pricing` model documents two pricing tiers: `"Free"` and `"Standard"`. Some plans also expose an optional `sub_plan`.

### Enable Or Change A Specific Defender Plan

`pricings.update()` expects the versioned `Pricing` model used by the `v2022_03_01` operation group:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter
from azure.mgmt.security.v2022_03_01.models import Pricing

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

try:
    updated = client.pricings.update(
        pricing_name="VirtualMachines",
        pricing=Pricing(pricing_tier="Standard"),
    )
    print(updated.name, updated.pricing_tier)
finally:
    client.close()
```

Use `client.pricings.list()` first to discover valid `pricing_name` values in your subscription instead of guessing them.

If a Standard plan supports multiple sub-plans, you can pass `sub_plan="..."` to `Pricing(...)`. The Learn reference says that when `sub_plan` is omitted, the full plan is applied.

### List Assessment Metadata For Remediation Guidance

`assessments_metadata.list_by_subscription()` is useful when you need the catalog of assessment types and their built-in remediation text:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

try:
    for item in client.assessments_metadata.list_by_subscription():
        props = item.properties
        print(item.name)
        print("  title:", props.display_name)
        print("  severity:", props.severity)
        print("  remediation:", props.remediation_description)
finally:
    client.close()
```

This is a practical way to map an assessment key to a user-facing title and remediation instructions before you query concrete assessment results.

### List Assessment Results Across A Subscription

`assessments.list()` takes a scope string. Microsoft Learn documents subscription and management-group scopes:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=subscription_id,
)

try:
    scope = f"/subscriptions/{subscription_id}"

    for assessment in client.assessments.list(scope=scope):
        props = assessment.properties
        print(assessment.name)
        print("  title:", props.display_name)
        print("  resource:", props.resource_details.id)
finally:
    client.close()
```

To inspect one assessment in more detail and ask the service to include metadata, call `get(..., expand="metadata")`:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

try:
    vm_id = (
        "/subscriptions/00000000-0000-0000-0000-000000000000/"
        "resourceGroups/example-rg/providers/Microsoft.Compute/virtualMachines/example-vm"
    )

    assessment = client.assessments.get(
        resource_id=vm_id,
        assessment_name="<assessment-key>",
        expand="metadata",
    )

    print(assessment.properties.display_name)
    print(assessment.properties.status.code)
    print(assessment.properties.metadata.remediation_description)
finally:
    client.close()
```

Get the `<assessment-key>` from `assessments.list(...)` or `assessments_metadata.list_by_subscription()`.

### Read The Current Secure Score

For the default initiative, Microsoft Learn says to use `ascScore`:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.security import SecurityCenter

client = SecurityCenter(
    credential=DefaultAzureCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)

try:
    score = client.secure_scores.get("ascScore")
    print(score.id)
    print(score.name)
finally:
    client.close()
```

Use `client.secure_scores.list()` if you need every initiative in the current scope, not just the default `ascScore` view.

## Configuration Notes

- `subscription_id` is required. The client does not infer it from the credential.
- For sovereign clouds, keep the credential authority and `base_url` aligned with the cloud you are targeting.
- Reuse one client instance for a batch of operations and close it when done. The package enables HTTP connection pooling.
- When an operation group expects a versioned model, import that model from the matching namespace. For example, `client.pricings.update(...)` uses `azure.mgmt.security.v2022_03_01.models.Pricing`.

## Version-Sensitive Notes For `7.0.0`

- PyPI lists `7.0.0` as the current stable release and also shows a newer pre-release, `8.0.0b1`, published on August 25, 2025. Pin `7.0.0` unless you intentionally want preview surface changes.
- The `6.0.0` release added `APICollectionsOperations` and `DefenderForStorageOperations`.
- The `6.0.0` release changed `SecurityContact`: it added `emails` and `notifications_by_role`, removed the older `email` and `alerts_to_admins` parameters, and removed `SecurityContactsOperations.update`.
- Since `5.0.0`, the package uses simplified exceptions and removed `CloudError`; catch `azure.core.exceptions.HttpResponseError` in new code.
- PyPI release notes for `5.0.0` also say the package has stable async support under the `azure.mgmt.security.aio` namespace.

## Common Pitfalls

- Treating this as a data-plane SDK. It is an ARM management client for `Microsoft.Security`.
- Forgetting `AZURE_SUBSCRIPTION_ID`; auth alone is not enough to build the client.
- Importing the wrong model namespace for update/create operations on versioned operation groups.
- Copying older security-contact examples that still use `email`, `alerts_to_admins`, or `update(...)`; those do not match `7.0.0`.
- Catching legacy `CloudError` exceptions in code written for current Azure SDK packages.
- Leaving many short-lived clients unclosed in long-running processes.

## Official Sources

- PyPI package page and release history: https://pypi.org/project/azure-mgmt-security/
- Azure package index: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security?view=azure-python
- `SecurityCenter` client: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.securitycenter?view=azure-python
- `PricingsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2022_03_01.operations.pricingsoperations?view=azure-python
- `Pricing` model: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2022_03_01.models.pricing?view=azure-python
- `AssessmentsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2021_06_01.operations.assessmentsoperations?view=azure-python
- `AssessmentsMetadataOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2021_06_01.operations.assessmentsmetadataoperations?view=azure-python
- `SecurityAssessmentPropertiesResponse`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.models.securityassessmentpropertiesresponse?view=azure-python-preview
- `SecurityAssessmentMetadataPropertiesResponse`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.models.securityassessmentmetadatapropertiesresponse?view=azure-python-preview
- `SecureScoresOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2020_01_01.operations.securescoresoperations?view=azure-python
- `SecurityContactsOperations`: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.v2020_01_01_preview.operations.securitycontactsoperations?view=azure-python
- `SecurityContact` model: https://learn.microsoft.com/en-us/python/api/azure-mgmt-security/azure.mgmt.security.models.securitycontact?view=azure-python-preview
