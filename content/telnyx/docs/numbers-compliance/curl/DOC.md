---
name: numbers-compliance
description: "Manage regulatory requirements, number bundles, supporting documents, and verified numbers for compliance."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,compliance,regulatory,documents"
---

# Telnyx Numbers Compliance REST API Coding Guidelines

You are a Telnyx Numbers Compliance API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## Retrieve Bundles

Get all allowed bundles.

`GET /bundle_pricing/billing_bundles`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/billing_bundles"
```

Returns: `cost_code` (string), `created_at` (date), `currency` (string), `id` (uuid), `is_public` (boolean), `mrc_price` (float), `name` (string), `slug` (string), `specs` (array[string])

## Get Bundle By Id

Get a single bundle by ID.

`GET /bundle_pricing/billing_bundles/{bundle_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/billing_bundles/8661948c-a386-4385-837f-af00f40f111a"
```

Returns: `active` (boolean), `bundle_limits` (array[object]), `cost_code` (string), `created_at` (date), `id` (uuid), `is_public` (boolean), `name` (string), `slug` (string)

## Get User Bundles

Get a paginated list of user bundles.

`GET /bundle_pricing/user_bundles`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/user_bundles"
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Create User Bundles

Creates multiple user bundles for the user.

`POST /bundle_pricing/user_bundles/bulk`

Optional: `idempotency_key` (uuid), `items` (array[object])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "idempotency_key": "12ade33a-21c0-473b-b055-b3c836e1c292"
}' \
  "https://api.telnyx.com/v2/bundle_pricing/user_bundles/bulk"
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get Unused User Bundles

Returns all user bundles that aren't in use.

`GET /bundle_pricing/user_bundles/unused`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/user_bundles/unused"
```

Returns: `billing_bundle` (object), `user_bundle_ids` (array[string])

## Get User Bundle by Id

Retrieves a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/user_bundles/ca1d2263-d1f1-43ac-ba53-248e7a4bb26a"
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Deactivate User Bundle

Deactivates a user bundle by its ID.

`DELETE /bundle_pricing/user_bundles/{user_bundle_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/bundle_pricing/user_bundles/ca1d2263-d1f1-43ac-ba53-248e7a4bb26a"
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get User Bundle Resources

Retrieves the resources of a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}/resources`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bundle_pricing/user_bundles/ca1d2263-d1f1-43ac-ba53-248e7a4bb26a/resources"
```

Returns: `created_at` (date), `id` (uuid), `resource` (string), `resource_type` (string), `updated_at` (date)

## List all document links

List all documents links ordered by created_at descending.

`GET /document_links`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/document_links"
```

Returns: `data` (array[object]), `meta` (object)

## List all documents

List all documents ordered by created_at descending.

`GET /documents`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/documents?filter={'filename': {'contains': 'invoice'}, 'customer_reference': {'in': ['REF001', 'REF002']}, 'created_at': {'gt': '2021-01-01T00:00:00Z'}}&sort=['filename']"
```

Returns: `data` (array[object]), `meta` (object)

## Upload a document

Upload a document.  Uploaded files must be linked to a service within 30 minutes or they will be automatically deleted.

`POST /documents`

Optional: `customer_reference` (string), `file` (byte), `filename` (string), `url` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -F "file=@/path/to/file" \
  -F "customer_reference=MY REF 001" \
  "https://api.telnyx.com/v2/documents"
```

Returns: `data` (object)

## Retrieve a document

Retrieve a document.

`GET /documents/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/documents/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Update a document

Update a document.

`PATCH /documents/{id}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/documents/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Delete a document

Delete a document.  A document can only be deleted if it's not linked to a service. If it is linked to a service, it must be unlinked prior to deleting.

`DELETE /documents/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/documents/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `data` (object)

## Download a document

Download a document.

`GET /documents/{id}/download`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/documents/6a09cdc3-8948-47f0-aa62-74ac943d6c58/download"
```

## Generate a temporary download link for a document

Generates a temporary pre-signed URL that can be used to download the document directly from the storage backend without authentication.

`GET /documents/{id}/download_link`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/documents/550e8400-e29b-41d4-a716-446655440000/download_link"
```

Returns: `url` (uri)

## Update requirement group for a phone number order

`POST /number_order_phone_numbers/{id}/requirement_group` — Required: `requirement_group_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "requirement_group_id": "550e8400-e29b-41d4-a716-446655440000"
}' \
  "https://api.telnyx.com/v2/number_order_phone_numbers/{id}/requirement_group"
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (string), `status` (string), `sub_number_order_id` (uuid)

## Retrieve regulatory requirements for a list of phone numbers

`GET /phone_numbers_regulatory_requirements`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/phone_numbers_regulatory_requirements"
```

Returns: `phone_number` (string), `phone_number_type` (string), `record_type` (string), `region_information` (array[object]), `regulatory_requirements` (array[object])

## Retrieve regulatory requirements

`GET /regulatory_requirements`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/regulatory_requirements"
```

Returns: `action` (string), `country_code` (string), `phone_number_type` (string), `regulatory_requirements` (array[object])

## List requirement groups

`GET /requirement_groups`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirement_groups"
```

## Create a new requirement group

`POST /requirement_groups` — Required: `country_code`, `phone_number_type`, `action`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "country_code": "US",
  "phone_number_type": "local",
  "action": "ordering",
  "customer_reference": "My Requirement Group"
}' \
  "https://api.telnyx.com/v2/requirement_groups"
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Get a single requirement group by ID

`GET /requirement_groups/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirement_groups/{id}"
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Update requirement values in requirement group

`PATCH /requirement_groups/{id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "customer_reference": "0002"
}' \
  "https://api.telnyx.com/v2/requirement_groups/{id}"
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Delete a requirement group by ID

`DELETE /requirement_groups/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/requirement_groups/{id}"
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Submit a Requirement Group for Approval

`POST /requirement_groups/{id}/submit_for_approval`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/requirement_groups/{id}/submit_for_approval"
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## List all requirement types

List all requirement types ordered by created_at descending

`GET /requirement_types`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirement_types?sort=['name']"
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## Retrieve a requirement types

Retrieve a requirement type by id

`GET /requirement_types/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirement_types/a38c217a-8019-48f8-bff6-0fdd9939075b"
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## List all requirements

List all requirements with filtering, sorting, and pagination

`GET /requirements`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirements?sort=['country_code']"
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Retrieve a document requirement

Retrieve a document requirement record

`GET /requirements/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/requirements/a9dad8d5-fdbd-49d7-aa23-39bb08a5ebaa"
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Update requirement group for a sub number order

`POST /sub_number_orders/{id}/requirement_group` — Required: `requirement_group_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "requirement_group_id": "a4b201f9-8646-4e54-a7d2-b2e403eeaf8c"
}' \
  "https://api.telnyx.com/v2/sub_number_orders/{id}/requirement_group"
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (string), `updated_at` (date-time)

## List all user addresses

Returns a list of your user addresses.

`GET /user_addresses`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/user_addresses?sort=street_address"
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Creates a user address

Creates a user address.

`POST /user_addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `skip_address_verification` (boolean)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "customer_reference": "MY REF 001",
  "first_name": "Alfred",
  "last_name": "Foster",
  "business_name": "Toy-O'Kon",
  "phone_number": "+12125559000",
  "street_address": "600 Congress Avenue",
  "extended_address": "14th Floor",
  "locality": "Austin",
  "administrative_area": "TX",
  "neighborhood": "Ciudad de los deportes",
  "borough": "Guadalajara",
  "postal_code": "78701",
  "country_code": "US"
}' \
  "https://api.telnyx.com/v2/user_addresses"
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Retrieve a user address

Retrieves the details of an existing user address.

`GET /user_addresses/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/user_addresses/{id}"
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## List all Verified Numbers

Gets a paginated list of Verified Numbers.

`GET /verified_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/verified_numbers"
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Request phone number verification

Initiates phone number verification procedure. Supports DTMF extension dialing for voice calls to numbers behind IVR systems.

`POST /verified_numbers` — Required: `phone_number`, `verification_method`

Optional: `extension` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_number": "+15551234567",
  "verification_method": "sms",
  "extension": "ww243w1"
}' \
  "https://api.telnyx.com/v2/verified_numbers"
```

Returns: `phone_number` (string), `verification_method` (string)

## Retrieve a verified number

`GET /verified_numbers/{phone_number}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/verified_numbers/+15551234567"
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Delete a verified number

`DELETE /verified_numbers/{phone_number}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/verified_numbers/+15551234567"
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Submit verification code

`POST /verified_numbers/{phone_number}/actions/verify` — Required: `verification_code`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "verification_code": "123456"
}' \
  "https://api.telnyx.com/v2/verified_numbers/+15551234567/actions/verify"
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)
