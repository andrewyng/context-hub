---
name: numbers-compliance
description: "Manage regulatory requirements, number bundles, supporting documents, and verified numbers for compliance."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,compliance,regulatory,documents"
---

# Telnyx Numbers Compliance Ruby SDK Coding Guidelines

You are a Telnyx Numbers Compliance API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `require "telnyx"`
- **Incorrect:** unofficial gems or raw HTTP calls

## Installation

```bash
gem install telnyx
```

## Setup

```ruby
require "telnyx"

client = Telnyx::Client.new(
  api_key: ENV["TELNYX_API_KEY"], # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## Retrieve Bundles

Get all allowed bundles.

`GET /bundle_pricing/billing_bundles`

```ruby
page = client.bundle_pricing.billing_bundles.list

puts(page)
```

Returns: `cost_code` (string), `created_at` (date), `currency` (string), `id` (uuid), `is_public` (boolean), `mrc_price` (float), `name` (string), `slug` (string), `specs` (array[string])

## Get Bundle By Id

Get a single bundle by ID.

`GET /bundle_pricing/billing_bundles/{bundle_id}`

```ruby
billing_bundle = client.bundle_pricing.billing_bundles.retrieve("8661948c-a386-4385-837f-af00f40f111a")

puts(billing_bundle)
```

Returns: `active` (boolean), `bundle_limits` (array[object]), `cost_code` (string), `created_at` (date), `id` (uuid), `is_public` (boolean), `name` (string), `slug` (string)

## Get User Bundles

Get a paginated list of user bundles.

`GET /bundle_pricing/user_bundles`

```ruby
page = client.bundle_pricing.user_bundles.list

puts(page)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Create User Bundles

Creates multiple user bundles for the user.

`POST /bundle_pricing/user_bundles/bulk`

Optional: `idempotency_key` (uuid), `items` (array[object])

```ruby
user_bundle = client.bundle_pricing.user_bundles.create

puts(user_bundle)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get Unused User Bundles

Returns all user bundles that aren't in use.

`GET /bundle_pricing/user_bundles/unused`

```ruby
response = client.bundle_pricing.user_bundles.list_unused

puts(response)
```

Returns: `billing_bundle` (object), `user_bundle_ids` (array[string])

## Get User Bundle by Id

Retrieves a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}`

```ruby
user_bundle = client.bundle_pricing.user_bundles.retrieve("ca1d2263-d1f1-43ac-ba53-248e7a4bb26a")

puts(user_bundle)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Deactivate User Bundle

Deactivates a user bundle by its ID.

`DELETE /bundle_pricing/user_bundles/{user_bundle_id}`

```ruby
response = client.bundle_pricing.user_bundles.deactivate("ca1d2263-d1f1-43ac-ba53-248e7a4bb26a")

puts(response)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get User Bundle Resources

Retrieves the resources of a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}/resources`

```ruby
response = client.bundle_pricing.user_bundles.list_resources("ca1d2263-d1f1-43ac-ba53-248e7a4bb26a")

puts(response)
```

Returns: `created_at` (date), `id` (uuid), `resource` (string), `resource_type` (string), `updated_at` (date)

## List all document links

List all documents links ordered by created_at descending.

`GET /document_links`

```ruby
page = client.document_links.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## List all documents

List all documents ordered by created_at descending.

`GET /documents`

```ruby
page = client.documents.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## Upload a document

Upload a document.  Uploaded files must be linked to a service within 30 minutes or they will be automatically deleted.

`POST /documents`

Optional: `customer_reference` (string), `file` (byte), `filename` (string), `url` (string)

```ruby
response = client.documents.upload_json(document: {})

puts(response)
```

Returns: `data` (object)

## Retrieve a document

Retrieve a document.

`GET /documents/{id}`

```ruby
document = client.documents.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(document)
```

Returns: `data` (object)

## Update a document

Update a document.

`PATCH /documents/{id}`

```ruby
document = client.documents.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(document)
```

Returns: `data` (object)

## Delete a document

Delete a document.  A document can only be deleted if it's not linked to a service. If it is linked to a service, it must be unlinked prior to deleting.

`DELETE /documents/{id}`

```ruby
document = client.documents.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(document)
```

Returns: `data` (object)

## Download a document

Download a document.

`GET /documents/{id}/download`

```ruby
response = client.documents.download("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

## Generate a temporary download link for a document

Generates a temporary pre-signed URL that can be used to download the document directly from the storage backend without authentication.

`GET /documents/{id}/download_link`

```ruby
response = client.documents.generate_download_link("550e8400-e29b-41d4-a716-446655440000")

puts(response)
```

Returns: `url` (uri)

## Update requirement group for a phone number order

`POST /number_order_phone_numbers/{id}/requirement_group` — Required: `requirement_group_id`

```ruby
response = client.number_order_phone_numbers.update_requirement_group(
  "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  requirement_group_id: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e"
)

puts(response)
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (string), `status` (string), `sub_number_order_id` (uuid)

## Retrieve regulatory requirements for a list of phone numbers

`GET /phone_numbers_regulatory_requirements`

```ruby
phone_numbers_regulatory_requirement = client.phone_numbers_regulatory_requirements.retrieve

puts(phone_numbers_regulatory_requirement)
```

Returns: `phone_number` (string), `phone_number_type` (string), `record_type` (string), `region_information` (array[object]), `regulatory_requirements` (array[object])

## Retrieve regulatory requirements

`GET /regulatory_requirements`

```ruby
regulatory_requirement = client.regulatory_requirements.retrieve

puts(regulatory_requirement)
```

Returns: `action` (string), `country_code` (string), `phone_number_type` (string), `regulatory_requirements` (array[object])

## List requirement groups

`GET /requirement_groups`

```ruby
requirement_groups = client.requirement_groups.list

puts(requirement_groups)
```

## Create a new requirement group

`POST /requirement_groups` — Required: `country_code`, `phone_number_type`, `action`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```ruby
requirement_group = client.requirement_groups.create(action: :ordering, country_code: "US", phone_number_type: :local)

puts(requirement_group)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Get a single requirement group by ID

`GET /requirement_groups/{id}`

```ruby
requirement_group = client.requirement_groups.retrieve("id")

puts(requirement_group)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Update requirement values in requirement group

`PATCH /requirement_groups/{id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```ruby
requirement_group = client.requirement_groups.update("id")

puts(requirement_group)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Delete a requirement group by ID

`DELETE /requirement_groups/{id}`

```ruby
requirement_group = client.requirement_groups.delete("id")

puts(requirement_group)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Submit a Requirement Group for Approval

`POST /requirement_groups/{id}/submit_for_approval`

```ruby
requirement_group = client.requirement_groups.submit_for_approval("id")

puts(requirement_group)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## List all requirement types

List all requirement types ordered by created_at descending

`GET /requirement_types`

```ruby
requirement_types = client.requirement_types.list

puts(requirement_types)
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## Retrieve a requirement types

Retrieve a requirement type by id

`GET /requirement_types/{id}`

```ruby
requirement_type = client.requirement_types.retrieve("a38c217a-8019-48f8-bff6-0fdd9939075b")

puts(requirement_type)
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## List all requirements

List all requirements with filtering, sorting, and pagination

`GET /requirements`

```ruby
page = client.requirements.list

puts(page)
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Retrieve a document requirement

Retrieve a document requirement record

`GET /requirements/{id}`

```ruby
requirement = client.requirements.retrieve("a9dad8d5-fdbd-49d7-aa23-39bb08a5ebaa")

puts(requirement)
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Update requirement group for a sub number order

`POST /sub_number_orders/{id}/requirement_group` — Required: `requirement_group_id`

```ruby
response = client.sub_number_orders.update_requirement_group(
  "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  requirement_group_id: "a4b201f9-8646-4e54-a7d2-b2e403eeaf8c"
)

puts(response)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (string), `updated_at` (date-time)

## List all user addresses

Returns a list of your user addresses.

`GET /user_addresses`

```ruby
page = client.user_addresses.list

puts(page)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Creates a user address

Creates a user address.

`POST /user_addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `skip_address_verification` (boolean)

```ruby
user_address = client.user_addresses.create(
  business_name: "Toy-O'Kon",
  country_code: "US",
  first_name: "Alfred",
  last_name: "Foster",
  locality: "Austin",
  street_address: "600 Congress Avenue"
)

puts(user_address)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Retrieve a user address

Retrieves the details of an existing user address.

`GET /user_addresses/{id}`

```ruby
user_address = client.user_addresses.retrieve("id")

puts(user_address)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## List all Verified Numbers

Gets a paginated list of Verified Numbers.

`GET /verified_numbers`

```ruby
page = client.verified_numbers.list

puts(page)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Request phone number verification

Initiates phone number verification procedure. Supports DTMF extension dialing for voice calls to numbers behind IVR systems.

`POST /verified_numbers` — Required: `phone_number`, `verification_method`

Optional: `extension` (string)

```ruby
verified_number = client.verified_numbers.create(phone_number: "+15551234567", verification_method: :sms)

puts(verified_number)
```

Returns: `phone_number` (string), `verification_method` (string)

## Retrieve a verified number

`GET /verified_numbers/{phone_number}`

```ruby
verified_number_data_wrapper = client.verified_numbers.retrieve("+15551234567")

puts(verified_number_data_wrapper)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Delete a verified number

`DELETE /verified_numbers/{phone_number}`

```ruby
verified_number_data_wrapper = client.verified_numbers.delete("+15551234567")

puts(verified_number_data_wrapper)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Submit verification code

`POST /verified_numbers/{phone_number}/actions/verify` — Required: `verification_code`

```ruby
verified_number_data_wrapper = client.verified_numbers.actions.submit_verification_code("+15551234567", verification_code: "123456")

puts(verified_number_data_wrapper)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)
