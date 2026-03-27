---
name: mgmt-marketplaceordering
description: "Azure Marketplace Ordering management SDK for Python for reading, accepting, listing, and canceling Marketplace agreement terms"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,marketplace,management,marketplaceordering,virtual-machine,agreements"
---

# azure-mgmt-marketplaceordering Python Package Guide

## What This Package Is For

`azure-mgmt-marketplaceordering` is the Azure Resource Manager management-plane SDK for Marketplace agreement terms at the subscription level.

Use it when you need to:

- read the current legal terms for a Marketplace VM offer
- accept those terms programmatically before deployment
- list agreements already stored on the subscription
- cancel previously accepted terms

Import path:

```python
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements
```

The current Learn reference exposes `MarketplaceOrderingAgreements.marketplace_agreements` with these methods: `get`, `sign`, `get_agreement`, `list`, `cancel`, and `create`.

## Golden Rule

Use this package only for Marketplace terms and agreement state. It does not deploy the VM or managed application for you.

For Marketplace VM flows, Microsoft documents two separate requirements:

- the subscription must accept the legal terms for the `publisher / offer / plan`
- the later VM deployment request must still include the matching Marketplace plan information

If the terms are not accepted, Azure returns `MarketplacePurchaseEligibilityFailed`. If the VM request omits plan information, Azure returns `VMMarketplaceInvalidInput`.

## Install

Pin the package version your project expects and install `azure-identity` with it:

```bash
python -m pip install "azure-mgmt-marketplaceordering==1.1.0" azure-identity
```

Common alternatives:

```bash
uv add "azure-mgmt-marketplaceordering==1.1.0" azure-identity
poetry add "azure-mgmt-marketplaceordering==1.1.0" azure-identity
```

Version notes from PyPI:

- stable version `1.1.0` was released on March 18, 2021
- PyPI also lists newer preview releases such as `1.2.0b2`
- unless your project intentionally tracks previews, pin the stable `1.1.0` line

## Authentication And Setup

Use `DefaultAzureCredential` for reusable code or `AzureCliCredential` for local scripts after `az login`.

Required environment:

```bash
export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_MARKETPLACE_PUBLISHER_ID="contoso"
export AZURE_MARKETPLACE_OFFER_ID="contoso-product"
export AZURE_MARKETPLACE_PLAN_ID="contoso-plan"
```

If you authenticate with a service principal, also set:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Microsoft's Marketplace deployment guidance notes that:

- Product ID is also called Offer ID in some APIs
- Plan ID is also called SKU ID in some APIs
- you can find Publisher ID, Product ID, and Plan ID on the Marketplace product's `Usage Information + Support` tab in the Azure portal

Basic client setup:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
credential = DefaultAzureCredential()

client = MarketplaceOrderingAgreements(
    credential=credential,
    subscription_id=subscription_id,
)
```

For local CLI-driven scripts:

```python
import os

from azure.identity import AzureCliCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    credential=AzureCliCredential(),
    subscription_id=os.environ["AZURE_SUBSCRIPTION_ID"],
)
```

## Core Workflow

### Read The Current Terms For A Marketplace VM Plan

Use `get()` first when you want the current legal links and the existing acceptance state.

The Learn reference documents `offer_type` on `get()` and `create()`. For Marketplace VM terms, use `"virtualmachine"`.

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

terms = client.marketplace_agreements.get(
    offer_type="virtualmachine",
    publisher_id=os.environ["AZURE_MARKETPLACE_PUBLISHER_ID"],
    offer_id=os.environ["AZURE_MARKETPLACE_OFFER_ID"],
    plan_id=os.environ["AZURE_MARKETPLACE_PLAN_ID"],
)

print("accepted:", terms.accepted)
print("license:", terms.license_text_link)
print("privacy:", terms.privacy_policy_link)
print("marketplace:", terms.marketplace_terms_link)
print("signature:", terms.signature)
```

`AgreementTerms` includes the fields that are usually most useful in approval flows:

- `accepted`
- `license_text_link`
- `privacy_policy_link`
- `marketplace_terms_link`
- `retrieve_datetime`
- `signature`

### Accept Terms

If the current terms are not yet accepted on the subscription, sign them:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

signed_terms = client.marketplace_agreements.sign(
    publisher_id=os.environ["AZURE_MARKETPLACE_PUBLISHER_ID"],
    offer_id=os.environ["AZURE_MARKETPLACE_OFFER_ID"],
    plan_id=os.environ["AZURE_MARKETPLACE_PLAN_ID"],
)

print("accepted:", signed_terms.accepted)
print("accepted_at:", signed_terms.retrieve_datetime)
```

Microsoft's Marketplace deployment article says that once the EULA is accepted one time in an Azure subscription, you can deploy the same VM offer again in that subscription without accepting the terms again.

### Fetch The Stored Agreement Resource

Use `get_agreement()` when you want the stored agreement resource after acceptance. `agreement_id` is a required parameter, so fetch it from an existing agreement instead of guessing a placeholder value:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

agreement_id = None
for item in client.marketplace_agreements.list():
    if (
        item.publisher == os.environ["AZURE_MARKETPLACE_PUBLISHER_ID"]
        and item.product == os.environ["AZURE_MARKETPLACE_OFFER_ID"]
        and item.plan == os.environ["AZURE_MARKETPLACE_PLAN_ID"]
    ):
        agreement_id = item.name
        break

if agreement_id is None:
    raise RuntimeError("Agreement not found on this subscription")

agreement = client.marketplace_agreements.get_agreement(
    publisher_id=os.environ["AZURE_MARKETPLACE_PUBLISHER_ID"],
    offer_id=os.environ["AZURE_MARKETPLACE_OFFER_ID"],
    plan_id=os.environ["AZURE_MARKETPLACE_PLAN_ID"],
    agreement_id=agreement_id,
)

print(agreement.id)
print(agreement.name)
print(agreement.accepted)
```

### List Agreements On The Subscription

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

for agreement in client.marketplace_agreements.list():
    print(
        agreement.publisher,
        agreement.product,
        agreement.plan,
        agreement.accepted,
    )
```

### Cancel Accepted Terms

Use `cancel()` to remove the accepted terms record for a specific `publisher / offer / plan` tuple:

```python
import os

from azure.identity import DefaultAzureCredential
from azure.mgmt.marketplaceordering import MarketplaceOrderingAgreements

client = MarketplaceOrderingAgreements(
    DefaultAzureCredential(),
    os.environ["AZURE_SUBSCRIPTION_ID"],
)

cancelled_terms = client.marketplace_agreements.cancel(
    publisher_id=os.environ["AZURE_MARKETPLACE_PUBLISHER_ID"],
    offer_id=os.environ["AZURE_MARKETPLACE_OFFER_ID"],
    plan_id=os.environ["AZURE_MARKETPLACE_PLAN_ID"],
)

print("accepted:", cancelled_terms.accepted)
```

## Configuration Notes

- `subscription_id` is required when constructing `MarketplaceOrderingAgreements`.
- `get()` and `create()` take `offer_type`; `sign()`, `get_agreement()`, `list()`, and `cancel()` do not.
- The package is an ARM management client. Use ARM credentials from `azure-identity`, not older `azure.common.credentials` patterns.
- PyPI release notes for the `1.x` line call out the move to unified authentication with `azure-identity` and the removal of the older `config` attribute pattern on the client.
- `AgreementTerms` fields are documented as server-populated and ignored when sending a request. For a normal acceptance flow, prefer `get()` plus `sign()` instead of trying to build and submit terms objects yourself.

## Common Pitfalls

- Using this package to discover Marketplace products. It only manages agreement terms for identifiers you already know.
- Forgetting that `get()` needs `offer_type="virtualmachine"` for Marketplace VM terms.
- Accepting terms successfully, then forgetting to include the matching Marketplace `plan` when creating the VM.
- Assuming one acceptance covers every plan from the same publisher. Terms are tracked per `publisher / offer / plan`.
- Copying pre-`1.0.0` authentication examples that still use `azure.common.credentials` or `msrestazure`.
- Assuming a successful token means the principal can accept or view agreements. Azure RBAC still applies at the subscription scope.

## Version-Sensitive Notes For `1.1.0`

- PyPI lists `1.1.0` as the stable release covered here.
- PyPI release notes for `1.1.0` say `AgreementTerms` added `system_data` and `marketplace_terms_link`.
- PyPI release notes for `1.0.0b1` introduced the modern Azure SDK credential model, async support under `aio`, `begin_` naming for long-running operations, and `azure.core.exceptions.HttpResponseError` instead of older `CloudError` patterns.
- PyPI still labels the project with older Python classifiers and says it was tested with Python `2.7` and `3.4` through `3.7`. Treat those as package metadata from the release era, not as current Azure Python ecosystem guidance.

## Official Sources Used

- https://pypi.org/project/azure-mgmt-marketplaceordering/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-marketplaceordering/
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-marketplaceordering/azure.mgmt.marketplaceordering.marketplaceorderingagreements?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-marketplaceordering/azure.mgmt.marketplaceordering.operations.marketplaceagreementsoperations?view=azure-python
- https://learn.microsoft.com/en-us/python/api/azure-mgmt-marketplaceordering/azure.mgmt.marketplaceordering.models.agreementterms?view=azure-python
- https://learn.microsoft.com/en-us/marketplace/programmatic-deploy-of-marketplace-products
