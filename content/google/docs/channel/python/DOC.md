---
name: channel
description: "Google Cloud Channel Python client for reseller customer management, SKU discovery, offers, and entitlements"
metadata:
  languages: "python"
  versions: "1.26.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,cloud-channel,reseller,subscriptions,customers,entitlements,python"
---

# google-cloud-channel Python Package Guide

## What It Is

`google-cloud-channel` is the official Python client for the Google Cloud Channel API. It is for reseller flows: managing customers, browsing purchasable SKUs and offers, and inspecting entitlements under a reseller account.

Use this package when your integration already has Cloud Channel reseller access and you need to call resource paths such as `accounts/{account_id}` and `accounts/{account_id}/customers/{customer_id}` from Python.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-channel==1.26.0"
```

Common alternatives:

```bash
uv add "google-cloud-channel==1.26.0"
poetry add "google-cloud-channel==1.26.0"
```

PyPI currently lists `Requires: Python >=3.7`.

## Authentication And Setup

Use Google Application Default Credentials (ADC). For local development:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_ACCOUNT_ID="1234567890"
```

Service account key fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_ACCOUNT_ID="1234567890"
```

Important setup notes:

- Most requests need your reseller account resource in the form `accounts/{account_id}`.
- Customer-scoped requests use names such as `accounts/{account_id}/customers/{customer_id}`.
- Install `google-auth` separately only when you need to work with credential objects directly; the Cloud Channel client uses ADC underneath.

## Initialize A Client

```python
import os

from google.cloud import channel_v1

ACCOUNT_ID = os.environ["GOOGLE_CLOUD_ACCOUNT_ID"]
ACCOUNT_NAME = f"accounts/{ACCOUNT_ID}"

client = channel_v1.CloudChannelServiceClient()
```

If you need to override the endpoint or mTLS behavior, the generated client supports standard Google API client options and environment variables such as `GOOGLE_API_USE_MTLS_ENDPOINT` and `GOOGLE_API_USE_CLIENT_CERTIFICATE`.

## Core Workflows

### List Customers

```python
import os

from google.cloud import channel_v1

account_name = f"accounts/{os.environ['GOOGLE_CLOUD_ACCOUNT_ID']}"
client = channel_v1.CloudChannelServiceClient()

request = channel_v1.ListCustomersRequest(parent=account_name)

for customer in client.list_customers(request=request):
    print(customer.name, customer.org_display_name)
```

### Get One Customer

```python
from google.cloud import channel_v1

client = channel_v1.CloudChannelServiceClient()

request = channel_v1.GetCustomerRequest(
    name="accounts/1234567890/customers/C012abcde"
)

customer = client.get_customer(request=request)
print(customer.org_display_name)
```

### Create A Customer

`create_customer` requires `Customer.org_display_name`, `Customer.org_postal_address`, and one of `Customer.domain` or `Customer.cloud_identity_id`.

```python
import os

from google.cloud import channel_v1
from google.type.postal_address_pb2 import PostalAddress

account_name = f"accounts/{os.environ['GOOGLE_CLOUD_ACCOUNT_ID']}"
client = channel_v1.CloudChannelServiceClient()

request = channel_v1.CreateCustomerRequest(
    parent=account_name,
    customer=channel_v1.Customer(
        org_display_name="Example Resold Customer",
        domain="example.com",
        org_postal_address=PostalAddress(
            region_code="US",
            postal_code="94043",
            administrative_area="CA",
            locality="Mountain View",
            address_lines=["1600 Amphitheatre Parkway"],
        ),
    ),
)

customer = client.create_customer(request=request)
print(customer.name)
```

### List Purchasable SKUs For A Customer

Use the full customer resource name, not just the account id.

```python
from google.cloud import channel_v1

client = channel_v1.CloudChannelServiceClient()

request = channel_v1.ListPurchasableSkusRequest(
    customer="accounts/1234567890/customers/C012abcde"
)

for sku in client.list_purchasable_skus(request=request):
    print(sku.name)
```

### List Entitlements For A Customer

```python
from google.cloud import channel_v1

client = channel_v1.CloudChannelServiceClient()

request = channel_v1.ListEntitlementsRequest(
    parent="accounts/1234567890/customers/C012abcde"
)

for entitlement in client.list_entitlements(request=request):
    print(entitlement.name)
```

## Async Usage

The package also exposes `CloudChannelServiceAsyncClient` with the same resource-name patterns and request types:

```python
import asyncio
import os

from google.cloud import channel_v1


async def main() -> None:
    client = channel_v1.CloudChannelServiceAsyncClient()
    request = channel_v1.ListCustomersRequest(
        parent=f"accounts/{os.environ['GOOGLE_CLOUD_ACCOUNT_ID']}"
    )

    async for customer in client.list_customers(request=request):
        print(customer.name)


asyncio.run(main())
```

## Common Pitfalls

- Install `google-cloud-channel`, but import from `google.cloud import channel_v1`.
- Do not pass bare ids where the API expects full resource names. Use `accounts/{account_id}` and `accounts/{account_id}/customers/{customer_id}` exactly.
- `create_customer` is stricter than older blog posts imply: the generated request docs require an org display name, an org postal address, and either a domain or a Cloud Identity id.
- `list_purchasable_skus` uses the customer resource name. It does not accept only an account-level parent.
- The package README on PyPI says the report service module was deprecated in `1.20.0`; for reporting flows, use the Cloud Channel Reports API package instead of adding new dependencies on the deprecated report service module here.

## Version-Sensitive Notes

- PyPI currently lists `1.26.0`, but the generated reference pages under the current `latest` docs tree still display `1.25.0` in page chrome. If you are debugging a behavior difference, trust your installed package version first and then confirm the generated surface in the reference docs.
- The current package metadata on PyPI requires Python `>=3.7`.

## Official Sources

- PyPI: `https://pypi.org/project/google-cloud-channel/`
- Package docs root: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest`
- `CloudChannelServiceClient` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.services.cloud_channel_service.CloudChannelServiceClient`
- `ListCustomersRequest` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.types.ListCustomersRequest`
- `CreateCustomerRequest` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.types.CreateCustomerRequest`
- `Customer` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.types.Customer`
- `ListPurchasableSkusRequest` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.types.ListPurchasableSkusRequest`
- `ListEntitlementsRequest` reference: `https://docs.cloud.google.com/python/docs/reference/cloudchannel/latest/google.cloud.channel_v1.types.ListEntitlementsRequest`
- API overview: `https://cloud.google.com/channel/docs/reference/rest`
- ADC setup: `https://cloud.google.com/docs/authentication/application-default-credentials`
