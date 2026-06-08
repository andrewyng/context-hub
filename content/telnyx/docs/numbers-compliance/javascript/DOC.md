---
name: numbers-compliance
description: "Manage regulatory requirements, number bundles, supporting documents, and verified numbers for compliance."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,compliance,regulatory,documents"
---

# Telnyx Numbers Compliance JavaScript SDK Coding Guidelines

You are a Telnyx Numbers Compliance API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import Telnyx from 'telnyx'`
- **Incorrect:** unofficial or outdated Telnyx packages

## Installation

```bash
npm install telnyx
```

## Setup

```javascript
import Telnyx from 'telnyx';

const client = new Telnyx({
  apiKey: process.env['TELNYX_API_KEY'], // This is the default and can be omitted
});
```

All examples below assume `client` is already initialized as shown above.

## Retrieve Bundles

Get all allowed bundles.

`GET /bundle_pricing/billing_bundles`

```javascript
// Automatically fetches more pages as needed.
for await (const billingBundleSummary of client.bundlePricing.billingBundles.list()) {
  console.log(billingBundleSummary.id);
}
```

Returns: `cost_code` (string), `created_at` (date), `currency` (string), `id` (uuid), `is_public` (boolean), `mrc_price` (float), `name` (string), `slug` (string), `specs` (array[string])

## Get Bundle By Id

Get a single bundle by ID.

`GET /bundle_pricing/billing_bundles/{bundle_id}`

```javascript
const billingBundle = await client.bundlePricing.billingBundles.retrieve(
  '8661948c-a386-4385-837f-af00f40f111a',
);

console.log(billingBundle.data);
```

Returns: `active` (boolean), `bundle_limits` (array[object]), `cost_code` (string), `created_at` (date), `id` (uuid), `is_public` (boolean), `name` (string), `slug` (string)

## Get User Bundles

Get a paginated list of user bundles.

`GET /bundle_pricing/user_bundles`

```javascript
// Automatically fetches more pages as needed.
for await (const userBundle of client.bundlePricing.userBundles.list()) {
  console.log(userBundle.id);
}
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Create User Bundles

Creates multiple user bundles for the user.

`POST /bundle_pricing/user_bundles/bulk`

Optional: `idempotency_key` (uuid), `items` (array[object])

```javascript
const userBundle = await client.bundlePricing.userBundles.create();

console.log(userBundle.data);
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get Unused User Bundles

Returns all user bundles that aren't in use.

`GET /bundle_pricing/user_bundles/unused`

```javascript
const response = await client.bundlePricing.userBundles.listUnused();

console.log(response.data);
```

Returns: `billing_bundle` (object), `user_bundle_ids` (array[string])

## Get User Bundle by Id

Retrieves a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}`

```javascript
const userBundle = await client.bundlePricing.userBundles.retrieve(
  'ca1d2263-d1f1-43ac-ba53-248e7a4bb26a',
);

console.log(userBundle.data);
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Deactivate User Bundle

Deactivates a user bundle by its ID.

`DELETE /bundle_pricing/user_bundles/{user_bundle_id}`

```javascript
const response = await client.bundlePricing.userBundles.deactivate(
  'ca1d2263-d1f1-43ac-ba53-248e7a4bb26a',
);

console.log(response.data);
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get User Bundle Resources

Retrieves the resources of a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}/resources`

```javascript
const response = await client.bundlePricing.userBundles.listResources(
  'ca1d2263-d1f1-43ac-ba53-248e7a4bb26a',
);

console.log(response.data);
```

Returns: `created_at` (date), `id` (uuid), `resource` (string), `resource_type` (string), `updated_at` (date)

## List all document links

List all documents links ordered by created_at descending.

`GET /document_links`

```javascript
// Automatically fetches more pages as needed.
for await (const documentLinkListResponse of client.documentLinks.list()) {
  console.log(documentLinkListResponse.id);
}
```

Returns: `data` (array[object]), `meta` (object)

## List all documents

List all documents ordered by created_at descending.

`GET /documents`

```javascript
// Automatically fetches more pages as needed.
for await (const docServiceDocument of client.documents.list()) {
  console.log(docServiceDocument.id);
}
```

Returns: `data` (array[object]), `meta` (object)

## Upload a document

Upload a document.  Uploaded files must be linked to a service within 30 minutes or they will be automatically deleted.

`POST /documents`

Optional: `customer_reference` (string), `file` (byte), `filename` (string), `url` (string)

```javascript
const response = await client.documents.uploadJson({ document: {} });

console.log(response.data);
```

Returns: `data` (object)

## Retrieve a document

Retrieve a document.

`GET /documents/{id}`

```javascript
const document = await client.documents.retrieve('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(document.data);
```

Returns: `data` (object)

## Update a document

Update a document.

`PATCH /documents/{id}`

```javascript
const document = await client.documents.update('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(document.data);
```

Returns: `data` (object)

## Delete a document

Delete a document.  A document can only be deleted if it's not linked to a service. If it is linked to a service, it must be unlinked prior to deleting.

`DELETE /documents/{id}`

```javascript
const document = await client.documents.delete('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(document.data);
```

Returns: `data` (object)

## Download a document

Download a document.

`GET /documents/{id}/download`

```javascript
const response = await client.documents.download('6a09cdc3-8948-47f0-aa62-74ac943d6c58');

console.log(response);

const content = await response.blob();
console.log(content);
```

## Generate a temporary download link for a document

Generates a temporary pre-signed URL that can be used to download the document directly from the storage backend without authentication.

`GET /documents/{id}/download_link`

```javascript
const response = await client.documents.generateDownloadLink(
  '550e8400-e29b-41d4-a716-446655440000',
);

console.log(response.data);
```

Returns: `url` (uri)

## Update requirement group for a phone number order

`POST /number_order_phone_numbers/{id}/requirement_group` — Required: `requirement_group_id`

```javascript
const response = await client.numberOrderPhoneNumbers.updateRequirementGroup(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { requirement_group_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);

console.log(response.data);
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (string), `status` (string), `sub_number_order_id` (uuid)

## Retrieve regulatory requirements for a list of phone numbers

`GET /phone_numbers_regulatory_requirements`

```javascript
const phoneNumbersRegulatoryRequirement =
  await client.phoneNumbersRegulatoryRequirements.retrieve();

console.log(phoneNumbersRegulatoryRequirement.data);
```

Returns: `phone_number` (string), `phone_number_type` (string), `record_type` (string), `region_information` (array[object]), `regulatory_requirements` (array[object])

## Retrieve regulatory requirements

`GET /regulatory_requirements`

```javascript
const regulatoryRequirement = await client.regulatoryRequirements.retrieve();

console.log(regulatoryRequirement.data);
```

Returns: `action` (string), `country_code` (string), `phone_number_type` (string), `regulatory_requirements` (array[object])

## List requirement groups

`GET /requirement_groups`

```javascript
const requirementGroups = await client.requirementGroups.list();

console.log(requirementGroups);
```

## Create a new requirement group

`POST /requirement_groups` — Required: `country_code`, `phone_number_type`, `action`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```javascript
const requirementGroup = await client.requirementGroups.create({
  action: 'ordering',
  country_code: 'US',
  phone_number_type: 'local',
});

console.log(requirementGroup.id);
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Get a single requirement group by ID

`GET /requirement_groups/{id}`

```javascript
const requirementGroup = await client.requirementGroups.retrieve('id');

console.log(requirementGroup.id);
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Update requirement values in requirement group

`PATCH /requirement_groups/{id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```javascript
const requirementGroup = await client.requirementGroups.update('id');

console.log(requirementGroup.id);
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Delete a requirement group by ID

`DELETE /requirement_groups/{id}`

```javascript
const requirementGroup = await client.requirementGroups.delete('id');

console.log(requirementGroup.id);
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Submit a Requirement Group for Approval

`POST /requirement_groups/{id}/submit_for_approval`

```javascript
const requirementGroup = await client.requirementGroups.submitForApproval('id');

console.log(requirementGroup.id);
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## List all requirement types

List all requirement types ordered by created_at descending

`GET /requirement_types`

```javascript
const requirementTypes = await client.requirementTypes.list();

console.log(requirementTypes.data);
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## Retrieve a requirement types

Retrieve a requirement type by id

`GET /requirement_types/{id}`

```javascript
const requirementType = await client.requirementTypes.retrieve(
  'a38c217a-8019-48f8-bff6-0fdd9939075b',
);

console.log(requirementType.data);
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## List all requirements

List all requirements with filtering, sorting, and pagination

`GET /requirements`

```javascript
// Automatically fetches more pages as needed.
for await (const requirementListResponse of client.requirements.list()) {
  console.log(requirementListResponse.id);
}
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Retrieve a document requirement

Retrieve a document requirement record

`GET /requirements/{id}`

```javascript
const requirement = await client.requirements.retrieve('a9dad8d5-fdbd-49d7-aa23-39bb08a5ebaa');

console.log(requirement.data);
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Update requirement group for a sub number order

`POST /sub_number_orders/{id}/requirement_group` — Required: `requirement_group_id`

```javascript
const response = await client.subNumberOrders.updateRequirementGroup(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { requirement_group_id: 'a4b201f9-8646-4e54-a7d2-b2e403eeaf8c' },
);

console.log(response.data);
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (string), `updated_at` (date-time)

## List all user addresses

Returns a list of your user addresses.

`GET /user_addresses`

```javascript
// Automatically fetches more pages as needed.
for await (const userAddress of client.userAddresses.list()) {
  console.log(userAddress.id);
}
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Creates a user address

Creates a user address.

`POST /user_addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `skip_address_verification` (boolean)

```javascript
const userAddress = await client.userAddresses.create({
  business_name: "Toy-O'Kon",
  country_code: 'US',
  first_name: 'Alfred',
  last_name: 'Foster',
  locality: 'Austin',
  street_address: '600 Congress Avenue',
});

console.log(userAddress.data);
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Retrieve a user address

Retrieves the details of an existing user address.

`GET /user_addresses/{id}`

```javascript
const userAddress = await client.userAddresses.retrieve('id');

console.log(userAddress.data);
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## List all Verified Numbers

Gets a paginated list of Verified Numbers.

`GET /verified_numbers`

```javascript
// Automatically fetches more pages as needed.
for await (const verifiedNumber of client.verifiedNumbers.list()) {
  console.log(verifiedNumber.phone_number);
}
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Request phone number verification

Initiates phone number verification procedure. Supports DTMF extension dialing for voice calls to numbers behind IVR systems.

`POST /verified_numbers` — Required: `phone_number`, `verification_method`

Optional: `extension` (string)

```javascript
const verifiedNumber = await client.verifiedNumbers.create({
  phone_number: '+15551234567',
  verification_method: 'sms',
});

console.log(verifiedNumber.phone_number);
```

Returns: `phone_number` (string), `verification_method` (string)

## Retrieve a verified number

`GET /verified_numbers/{phone_number}`

```javascript
const verifiedNumberDataWrapper = await client.verifiedNumbers.retrieve('+15551234567');

console.log(verifiedNumberDataWrapper.data);
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Delete a verified number

`DELETE /verified_numbers/{phone_number}`

```javascript
const verifiedNumberDataWrapper = await client.verifiedNumbers.delete('+15551234567');

console.log(verifiedNumberDataWrapper.data);
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Submit verification code

`POST /verified_numbers/{phone_number}/actions/verify` — Required: `verification_code`

```javascript
const verifiedNumberDataWrapper = await client.verifiedNumbers.actions.submitVerificationCode(
  '+15551234567',
  { verification_code: '123456' },
);

console.log(verifiedNumberDataWrapper.data);
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)
