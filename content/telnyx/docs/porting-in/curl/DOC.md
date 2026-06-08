---
name: porting-in
description: "Port phone numbers into Telnyx. Check portability, create port orders, upload LOA documents, and track porting status."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,porting,port-in,number-transfer,loa"
---

# Telnyx Porting In REST API Coding Guidelines

You are a Telnyx Porting In API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## Run a portability check

Runs a portability check, returning the results immediately.

`POST /portability_checks`

Optional: `phone_numbers` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "+13035550000",
    "+13035550001",
    "+13035550002"
  ]
}' \
  "https://api.telnyx.com/v2/portability_checks"
```

Returns: `fast_portable` (boolean), `not_portable_reason` (string), `phone_number` (string), `portable` (boolean), `record_type` (string)

## List all porting events

Returns a list of all porting events.

`GET /porting/events`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/events"
```

Returns: `data` (array[object]), `meta` (object)

## Show a porting event

Show a specific porting event.

`GET /porting/events/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/events/{id}"
```

Returns: `data` (object)

## Republish a porting event

Republish a specific porting event.

`POST /porting/events/{id}/republish`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting/events/{id}/republish"
```

## Preview the LOA configuration parameters

Preview the LOA template that would be generated without need to create LOA configuration.

`POST /porting/loa_configuration/preview`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting/loa_configuration/preview"
```

## List LOA configurations

List the LOA configurations.

`GET /porting/loa_configurations`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/loa_configurations"
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Create a LOA configuration

Create a LOA configuration.

`POST /porting/loa_configurations`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting/loa_configurations"
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Retrieve a LOA configuration

Retrieve a specific LOA configuration.

`GET /porting/loa_configurations/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/loa_configurations/{id}"
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Update a LOA configuration

Update a specific LOA configuration.

`PATCH /porting/loa_configurations/{id}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting/loa_configurations/{id}"
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Delete a LOA configuration

Delete a specific LOA configuration.

`DELETE /porting/loa_configurations/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting/loa_configurations/{id}"
```

## Preview a LOA configuration

Preview a specific LOA configuration.

`GET /porting/loa_configurations/{id}/preview`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/loa_configurations/{id}/preview"
```

## List porting related reports

List the reports generated about porting operations.

`GET /porting/reports`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/reports"
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Create a porting related report

Generate reports about porting operations.

`POST /porting/reports`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting/reports"
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Retrieve a report

Retrieve a specific report generated.

`GET /porting/reports/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/reports/{id}"
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## List available carriers in the UK

List available carriers in the UK.

`GET /porting/uk_carriers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting/uk_carriers"
```

Returns: `alternative_cupids` (array[string]), `created_at` (date-time), `cupid` (string), `id` (uuid), `name` (string), `record_type` (string), `updated_at` (date-time)

## List all porting orders

Returns a list of your porting order.

`GET /porting_orders`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Create a porting order

Creates a new porting order object.

`POST /porting_orders` — Required: `phone_numbers`

Optional: `customer_group_reference` (string), `customer_reference` (string | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phone_numbers": [
    "+13035550000",
    "+13035550001",
    "+13035550002"
  ],
  "customer_reference": "Acct 123abc",
  "customer_group_reference": "Group-456"
}' \
  "https://api.telnyx.com/v2/porting_orders"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## List all exception types

Returns a list of all possible exception types for a porting order.

`GET /porting_orders/exception_types`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/exception_types"
```

Returns: `code` (enum: ACCOUNT_NUMBER_MISMATCH, AUTH_PERSON_MISMATCH, BTN_ATN_MISMATCH, ENTITY_NAME_MISMATCH, FOC_EXPIRED, FOC_REJECTED, LOCATION_MISMATCH, LSR_PENDING, MAIN_BTN_PORTING, OSP_IRRESPONSIVE, OTHER, PASSCODE_PIN_INVALID, PHONE_NUMBER_HAS_SPECIAL_FEATURE, PHONE_NUMBER_MISMATCH, PHONE_NUMBER_NOT_PORTABLE, PORT_TYPE_INCORRECT, PORTING_ORDER_SPLIT_REQUIRED, POSTAL_CODE_MISMATCH, RATE_CENTER_NOT_PORTABLE, SV_CONFLICT, SV_UNKNOWN_FAILURE), `description` (string)

## List all phone number configurations

Returns a list of phone number configurations paginated.

`GET /porting_orders/phone_number_configurations`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/phone_number_configurations"
```

Returns: `created_at` (date-time), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time), `user_bundle_id` (uuid)

## Create a list of phone number configurations

Creates a list of phone number configurations.

`POST /porting_orders/phone_number_configurations`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/phone_number_configurations"
```

Returns: `created_at` (date-time), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time), `user_bundle_id` (uuid)

## Retrieve a porting order

Retrieves the details of an existing porting order.

`GET /porting_orders/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Edit a porting order

Edits the details of an existing porting order. Any or all of a porting orders attributes may be included in the resource object included in a PATCH request. If a request does not include all of the attributes for a resource, the system will interpret the missing attributes as if they were included with their current values.

`PATCH /porting_orders/{id}`

Optional: `activation_settings` (object), `customer_group_reference` (string), `customer_reference` (string), `documents` (object), `end_user` (object), `messaging` (object), `misc` (object), `phone_number_configuration` (object), `requirement_group_id` (uuid), `requirements` (array[object]), `user_feedback` (object), `webhook_url` (uri)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "requirement_group_id": "DE748D99-06FA-4D90-9F9A-F4B62696BADA"
}' \
  "https://api.telnyx.com/v2/porting_orders/{id}"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Delete a porting order

Deletes an existing porting order. This operation is restrict to porting orders in draft state.

`DELETE /porting_orders/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting_orders/{id}"
```

## Activate every number in a porting order asynchronously.

Activate each number in a porting order asynchronously. This operation is limited to US FastPort orders only.

`POST /porting_orders/{id}/actions/activate`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/actions/activate"
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Cancel a porting order

`POST /porting_orders/{id}/actions/cancel`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/actions/cancel"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Submit a porting order.

Confirm and submit your porting order.

`POST /porting_orders/{id}/actions/confirm`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/actions/confirm"
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Share a porting order

Creates a sharing token for a porting order. The token can be used to share the porting order with non-Telnyx users.

`POST /porting_orders/{id}/actions/share`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/actions/share"
```

Returns: `created_at` (date-time), `expires_at` (date-time), `expires_in_seconds` (integer), `id` (uuid), `permissions` (array[string]), `porting_order_id` (uuid), `record_type` (string), `token` (string)

## List all porting activation jobs

Returns a list of your porting activation jobs.

`GET /porting_orders/{id}/activation_jobs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/activation_jobs"
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Retrieve a porting activation job

Returns a porting activation job.

`GET /porting_orders/{id}/activation_jobs/{activationJobId}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/activation_jobs/{activationJobId}"
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Update a porting activation job

Updates the activation time of a porting activation job.

`PATCH /porting_orders/{id}/activation_jobs/{activationJobId}`

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/activation_jobs/{activationJobId}"
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## List additional documents

Returns a list of additional documents for a porting order.

`GET /porting_orders/{id}/additional_documents`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/additional_documents"
```

Returns: `content_type` (string), `created_at` (date-time), `document_id` (uuid), `document_type` (enum: loa, invoice, csr, other), `filename` (string), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create a list of additional documents

Creates a list of additional documents for a porting order.

`POST /porting_orders/{id}/additional_documents`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/additional_documents"
```

Returns: `content_type` (string), `created_at` (date-time), `document_id` (uuid), `document_type` (enum: loa, invoice, csr, other), `filename` (string), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete an additional document

Deletes an additional document for a porting order.

`DELETE /porting_orders/{id}/additional_documents/{additional_document_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting_orders/{id}/additional_documents/{additional_document_id}"
```

## List allowed FOC dates

Returns a list of allowed FOC dates for a porting order.

`GET /porting_orders/{id}/allowed_foc_windows`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/allowed_foc_windows"
```

Returns: `ended_at` (date-time), `record_type` (string), `started_at` (date-time)

## List all comments of a porting order

Returns a list of all comments of a porting order.

`GET /porting_orders/{id}/comments`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/comments"
```

Returns: `body` (string), `created_at` (date-time), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `user_type` (enum: admin, user, system)

## Create a comment for a porting order

Creates a new comment for a porting order.

`POST /porting_orders/{id}/comments`

Optional: `body` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "body": "Please, let me know when the port completes"
}' \
  "https://api.telnyx.com/v2/porting_orders/{id}/comments"
```

Returns: `body` (string), `created_at` (date-time), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `user_type` (enum: admin, user, system)

## Download a porting order loa template

`GET /porting_orders/{id}/loa_template`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/loa_template?loa_configuration_id=a36c2277-446b-4d11-b4ea-322e02a5c08d"
```

## List porting order requirements

Returns a list of all requirements based on country/number type for this porting order.

`GET /porting_orders/{id}/requirements`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/requirements"
```

Returns: `field_type` (enum: document, textual), `field_value` (string), `record_type` (string), `requirement_status` (string), `requirement_type` (object)

## Retrieve the associated V1 sub_request_id and port_request_id

`GET /porting_orders/{id}/sub_request`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/sub_request"
```

Returns: `port_request_id` (string), `sub_request_id` (string)

## List verification codes

Returns a list of verification codes for a porting order.

`GET /porting_orders/{id}/verification_codes`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{id}/verification_codes"
```

Returns: `created_at` (date-time), `id` (uuid), `phone_number` (string), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time), `verified` (boolean)

## Send the verification codes

Send the verification code for all porting phone numbers.

`POST /porting_orders/{id}/verification_codes/send`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/verification_codes/send"
```

## Verify the verification code for a list of phone numbers

Verifies the verification code for a list of phone numbers.

`POST /porting_orders/{id}/verification_codes/verify`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{id}/verification_codes/verify"
```

Returns: `created_at` (date-time), `id` (uuid), `phone_number` (string), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time), `verified` (boolean)

## List action requirements for a porting order

Returns a list of action requirements for a specific porting order.

`GET /porting_orders/{porting_order_id}/action_requirements`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/action_requirements"
```

Returns: `action_type` (string), `action_url` (string | null), `cancel_reason` (string | null), `created_at` (date-time), `id` (string), `porting_order_id` (string), `record_type` (enum: porting_action_requirement), `requirement_type_id` (string), `status` (enum: created, pending, completed, cancelled, failed), `updated_at` (date-time)

## Initiate an action requirement

Initiates a specific action requirement for a porting order.

`POST /porting_orders/{porting_order_id}/action_requirements/{id}/initiate`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/action_requirements/{id}/initiate"
```

Returns: `action_type` (string), `action_url` (string | null), `cancel_reason` (string | null), `created_at` (date-time), `id` (string), `porting_order_id` (string), `record_type` (enum: porting_action_requirement), `requirement_type_id` (string), `status` (enum: created, pending, completed, cancelled, failed), `updated_at` (date-time)

## List all associated phone numbers

Returns a list of all associated phone numbers for a porting order. Associated phone numbers are used for partial porting in GB to specify which phone numbers should be kept or disconnected.

`GET /porting_orders/{porting_order_id}/associated_phone_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/associated_phone_numbers"
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create an associated phone number

Creates a new associated phone number for a porting order. This is used for partial porting in GB to specify which phone numbers should be kept or disconnected.

`POST /porting_orders/{porting_order_id}/associated_phone_numbers`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/associated_phone_numbers"
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete an associated phone number

Deletes an associated phone number from a porting order.

`DELETE /porting_orders/{porting_order_id}/associated_phone_numbers/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/associated_phone_numbers/{id}"
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## List all phone number blocks

Returns a list of all phone number blocks of a porting order.

`GET /porting_orders/{porting_order_id}/phone_number_blocks`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_blocks"
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## Create a phone number block

Creates a new phone number block.

`POST /porting_orders/{porting_order_id}/phone_number_blocks`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_blocks"
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## Delete a phone number block

Deletes a phone number block.

`DELETE /porting_orders/{porting_order_id}/phone_number_blocks/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_blocks/{id}"
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## List all phone number extensions

Returns a list of all phone number extensions of a porting order.

`GET /porting_orders/{porting_order_id}/phone_number_extensions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_extensions"
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create a phone number extension

Creates a new phone number extension.

`POST /porting_orders/{porting_order_id}/phone_number_extensions`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_extensions"
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete a phone number extension

Deletes a phone number extension.

`DELETE /porting_orders/{porting_order_id}/phone_number_extensions/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/porting_orders/{porting_order_id}/phone_number_extensions/{id}"
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## List all porting phone numbers

Returns a list of your porting phone numbers.

`GET /porting_phone_numbers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/porting_phone_numbers"
```

Returns: `activation_status` (enum: New, Pending, Conflict, Cancel Pending, Failed, Concurred, Activate RDY, Disconnect Pending, Concurrence Sent, Old, Sending, Active, Cancelled), `phone_number` (string), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `portability_status` (enum: pending, confirmed, provisional), `porting_order_id` (uuid), `porting_order_status` (enum: draft, in-process, submitted, exception, foc-date-confirmed, cancel-pending, ported, cancelled), `record_type` (string), `requirements_status` (enum: requirement-info-pending, requirement-info-under-review, requirement-info-exception, approved), `support_key` (string)
