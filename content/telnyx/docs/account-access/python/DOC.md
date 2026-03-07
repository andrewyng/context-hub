---
name: account-access
description: "Configure account addresses, authentication providers, IP access controls, billing groups, and integration secrets."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,account,addresses,ip-access,authentication"
---

# Telnyx Account Access Python SDK Coding Guidelines

You are a Telnyx Account Access API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List all Access IP Addresses

`GET /access_ip_address`

```python
page = client.access_ip_address.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Create new Access IP Address

`POST /access_ip_address` — Required: `ip_address`

Optional: `description` (string)

```python
access_ip_address_response = client.access_ip_address.create(
    ip_address="ip_address",
)
print(access_ip_address_response.id)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Retrieve an access IP address

`GET /access_ip_address/{access_ip_address_id}`

```python
access_ip_address_response = client.access_ip_address.retrieve(
    "access_ip_address_id",
)
print(access_ip_address_response.id)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Delete access IP address

`DELETE /access_ip_address/{access_ip_address_id}`

```python
access_ip_address_response = client.access_ip_address.delete(
    "access_ip_address_id",
)
print(access_ip_address_response.id)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## List all addresses

Returns a list of your addresses.

`GET /addresses`

```python
page = client.addresses.list()
page = page.data[0]
print(page.id)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Creates an address

Creates an address.

`POST /addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `address_book` (boolean), `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `validate_address` (boolean)

```python
address = client.addresses.create(
    business_name="Toy-O'Kon",
    country_code="US",
    first_name="Alfred",
    last_name="Foster",
    locality="Austin",
    street_address="600 Congress Avenue",
)
print(address.data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Validate an address

Validates an address for emergency services.

`POST /addresses/actions/validate` — Required: `country_code`, `street_address`, `postal_code`

Optional: `administrative_area` (string), `extended_address` (string), `locality` (string)

```python
response = client.addresses.actions.validate(
    country_code="US",
    postal_code="78701",
    street_address="600 Congress Avenue",
)
print(response.data)
```

Returns: `errors` (array[object]), `record_type` (string), `result` (enum: valid, invalid), `suggested` (object)

## Retrieve an address

Retrieves the details of an existing address.

`GET /addresses/{id}`

```python
address = client.addresses.retrieve(
    "id",
)
print(address.data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Deletes an address

Deletes an existing address.

`DELETE /addresses/{id}`

```python
address = client.addresses.delete(
    "id",
)
print(address.data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Accepts this address suggestion as a new emergency address for Operator Connect and finishes the uploads of the numbers associated with it to Microsoft.

`POST /addresses/{id}/actions/accept_suggestions`

Optional: `id` (string)

```python
response = client.addresses.actions.accept_suggestions(
    address_uuid="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `accepted` (boolean), `id` (uuid), `record_type` (enum: address_suggestion)

## List all SSO authentication providers

Returns a list of your SSO authentication providers.

`GET /authentication_providers`

```python
page = client.authentication_providers.list()
page = page.data[0]
print(page.id)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Creates an authentication provider

Creates an authentication provider.

`POST /authentication_providers` — Required: `name`, `short_name`, `settings`

Optional: `active` (boolean), `settings_url` (uri)

```python
authentication_provider = client.authentication_providers.create(
    name="Okta",
    settings={
        "idp_cert_fingerprint": "13:38:C7:BB:C9:FF:4A:70:38:3A:E3:D9:5C:CD:DB:2E:50:1E:80:A7",
        "idp_entity_id": "https://myorg.myidp.com/saml/metadata",
        "idp_sso_target_url": "https://myorg.myidp.com/trust/saml2/http-post/sso",
    },
    short_name="myorg",
)
print(authentication_provider.data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Retrieve an authentication provider

Retrieves the details of an existing authentication provider.

`GET /authentication_providers/{id}`

```python
authentication_provider = client.authentication_providers.retrieve(
    "id",
)
print(authentication_provider.data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Update an authentication provider

Updates settings of an existing authentication provider.

`PATCH /authentication_providers/{id}`

Optional: `active` (boolean), `name` (string), `settings` (object), `settings_url` (uri), `short_name` (string)

```python
authentication_provider = client.authentication_providers.update(
    id="id",
    active=True,
    name="Okta",
    settings={
        "idp_entity_id": "https://myorg.myidp.com/saml/metadata",
        "idp_sso_target_url": "https://myorg.myidp.com/trust/saml2/http-post/sso",
        "idp_cert_fingerprint": "13:38:C7:BB:C9:FF:4A:70:38:3A:E3:D9:5C:CD:DB:2E:50:1E:80:A7",
        "idp_cert_fingerprint_algorithm": "sha1",
    },
    short_name="myorg",
)
print(authentication_provider.data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Deletes an authentication provider

Deletes an existing authentication provider.

`DELETE /authentication_providers/{id}`

```python
authentication_provider = client.authentication_providers.delete(
    "id",
)
print(authentication_provider.data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## List all billing groups

`GET /billing_groups`

```python
page = client.billing_groups.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Create a billing group

`POST /billing_groups`

Optional: `name` (string)

```python
billing_group = client.billing_groups.create(
    name="string",
)
print(billing_group.data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Get a billing group

`GET /billing_groups/{id}`

```python
billing_group = client.billing_groups.retrieve(
    "f5586561-8ff0-4291-a0ac-84fe544797bd",
)
print(billing_group.data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Update a billing group

`PATCH /billing_groups/{id}`

Optional: `name` (string)

```python
billing_group = client.billing_groups.update(
    id="f5586561-8ff0-4291-a0ac-84fe544797bd",
    name="string",
)
print(billing_group.data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Delete a billing group

`DELETE /billing_groups/{id}`

```python
billing_group = client.billing_groups.delete(
    "f5586561-8ff0-4291-a0ac-84fe544797bd",
)
print(billing_group.data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## List integration secrets

Retrieve a list of all integration secrets configured by the user.

`GET /integration_secrets`

```python
page = client.integration_secrets.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `id` (string), `identifier` (string), `record_type` (string), `updated_at` (date-time)

## Create a secret

Create a new secret with an associated identifier that can be used to securely integrate with other services.

`POST /integration_secrets` — Required: `identifier`, `type`

Optional: `password` (string), `token` (string), `username` (string)

```python
integration_secret = client.integration_secrets.create(
    identifier="my_secret",
    type="bearer",
    token="my_secret_value",
)
print(integration_secret.data)
```

Returns: `created_at` (date-time), `id` (string), `identifier` (string), `record_type` (string), `updated_at` (date-time)

## Delete an integration secret

Delete an integration secret given its ID.

`DELETE /integration_secrets/{id}`

```python
client.integration_secrets.delete(
    "id",
)
```

## Create an Access Token.

Create an Access Token (JWT) for the credential.

`POST /telephony_credentials/{id}/token`

```python
response = client.telephony_credentials.create_token(
    "id",
)
print(response)
```
