---
name: messaging-hosted
description: "Set up hosted SMS numbers, toll-free verification, and RCS messaging. Use when migrating numbers or enabling rich messaging features."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,messaging,hosted-sms,toll-free,rcs"
---

# Telnyx Messaging Hosted Ruby SDK Coding Guidelines

You are a Telnyx Messaging Hosted API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

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

## Send an RCS message

`POST /messages/rcs` — Required: `agent_id`, `to`, `messaging_profile_id`, `agent_message`

Optional: `mms_fallback` (object), `sms_fallback` (object), `type` (enum: RCS), `webhook_url` (url)

```ruby
response = client.messages.rcs.send_(
  agent_id: "Agent007",
  agent_message: {},
  messaging_profile_id: "messaging_profile_id",
  to: "+13125551234"
)

puts(response)
```

Returns: `body` (object), `direction` (string), `encoding` (string), `from` (object), `id` (string), `messaging_profile_id` (string), `organization_id` (string), `received_at` (date-time), `record_type` (string), `to` (array[object]), `type` (string), `wait_seconds` (float)

## Generate RCS deeplink

Generate a deeplink URL that can be used to start an RCS conversation with a specific agent.

`GET /messages/rcs/deeplinks/{agent_id}`

```ruby
response = client.messages.rcs.generate_deeplink("agent_id")

puts(response)
```

Returns: `url` (string)

## List all RCS agents

`GET /messaging/rcs/agents`

```ruby
page = client.messaging.rcs.agents.list

puts(page)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Retrieve an RCS agent

`GET /messaging/rcs/agents/{id}`

```ruby
rcs_agent_response = client.messaging.rcs.agents.retrieve("id")

puts(rcs_agent_response)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Modify an RCS agent

`PATCH /messaging/rcs/agents/{id}`

Optional: `profile_id` (uuid), `webhook_failover_url` (url), `webhook_url` (url)

```ruby
rcs_agent_response = client.messaging.rcs.agents.update("id")

puts(rcs_agent_response)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Check RCS capabilities (batch)

`POST /messaging/rcs/bulk_capabilities` — Required: `agent_id`, `phone_numbers`

```ruby
response = client.messaging.rcs.list_bulk_capabilities(agent_id: "TestAgent", phone_numbers: ["+13125551234"])

puts(response)
```

Returns: `agent_id` (string), `agent_name` (string), `features` (array[string]), `phone_number` (string), `record_type` (enum: rcs.capabilities)

## Check RCS capabilities

`GET /messaging/rcs/capabilities/{agent_id}/{phone_number}`

```ruby
response = client.messaging.rcs.retrieve_capabilities("phone_number", agent_id: "agent_id")

puts(response)
```

Returns: `agent_id` (string), `agent_name` (string), `features` (array[string]), `phone_number` (string), `record_type` (enum: rcs.capabilities)

## Add RCS test number

Adds a test phone number to an RCS agent for testing purposes.

`PUT /messaging/rcs/test_number_invite/{id}/{phone_number}`

```ruby
response = client.messaging.rcs.invite_test_number("phone_number", id: "id")

puts(response)
```

Returns: `agent_id` (string), `phone_number` (string), `record_type` (enum: rcs.test_number_invite), `status` (string)

## List messaging hosted number orders

`GET /messaging_hosted_number_orders`

```ruby
page = client.messaging_hosted_number_orders.list

puts(page)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Create a messaging hosted number order

`POST /messaging_hosted_number_orders`

Optional: `messaging_profile_id` (string), `phone_numbers` (array[string])

```ruby
messaging_hosted_number_order = client.messaging_hosted_number_orders.create

puts(messaging_hosted_number_order)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Check hosted messaging eligibility

`POST /messaging_hosted_number_orders/eligibility_numbers_check` — Required: `phone_numbers`

```ruby
response = client.messaging_hosted_number_orders.check_eligibility(phone_numbers: ["string"])

puts(response)
```

Returns: `phone_numbers` (array[object])

## Retrieve a messaging hosted number order

`GET /messaging_hosted_number_orders/{id}`

```ruby
messaging_hosted_number_order = client.messaging_hosted_number_orders.retrieve("id")

puts(messaging_hosted_number_order)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Delete a messaging hosted number order

Delete a messaging hosted number order and all associated phone numbers.

`DELETE /messaging_hosted_number_orders/{id}`

```ruby
messaging_hosted_number_order = client.messaging_hosted_number_orders.delete("id")

puts(messaging_hosted_number_order)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Upload hosted number document

`POST /messaging_hosted_number_orders/{id}/actions/file_upload`

```ruby
response = client.messaging_hosted_number_orders.actions.upload_file("id")

puts(response)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Validate hosted number codes

Validate the verification codes sent to the numbers of the hosted order. The verification codes must be created in the verification codes endpoint.

`POST /messaging_hosted_number_orders/{id}/validation_codes` — Required: `verification_codes`

```ruby
response = client.messaging_hosted_number_orders.validate_codes(
  "id",
  verification_codes: [{code: "code", phone_number: "phone_number"}]
)

puts(response)
```

Returns: `order_id` (uuid), `phone_numbers` (array[object])

## Create hosted number verification codes

Create verification codes to validate numbers of the hosted order. The verification codes will be sent to the numbers of the hosted order.

`POST /messaging_hosted_number_orders/{id}/verification_codes` — Required: `phone_numbers`, `verification_method`

```ruby
response = client.messaging_hosted_number_orders.create_verification_codes(
  "id",
  phone_numbers: ["string"],
  verification_method: :sms
)

puts(response)
```

Returns: `error` (string), `phone_number` (string), `type` (enum: sms, call, flashcall), `verification_code_id` (uuid)

## Delete a messaging hosted number

`DELETE /messaging_hosted_numbers/{id}`

```ruby
messaging_hosted_number = client.messaging_hosted_numbers.delete("id")

puts(messaging_hosted_number)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## List Verification Requests

Get a list of previously-submitted tollfree verification requests

`GET /messaging_tollfree/verification/requests`

```ruby
page = client.messaging_tollfree.verification.requests.list(page: 1, page_size: 1)

puts(page)
```

Returns: `records` (array[object]), `total_records` (integer)

## Submit Verification Request

Submit a new tollfree verification request

`POST /messaging_tollfree/verification/requests` — Required: `businessName`, `corporateWebsite`, `businessAddr1`, `businessCity`, `businessState`, `businessZip`, `businessContactFirstName`, `businessContactLastName`, `businessContactEmail`, `businessContactPhone`, `messageVolume`, `phoneNumbers`, `useCase`, `useCaseSummary`, `productionMessageContent`, `optInWorkflow`, `optInWorkflowImageURLs`, `additionalInformation`

Optional: `ageGatedContent` (boolean), `businessAddr2` (string), `businessRegistrationCountry` (string | null), `businessRegistrationNumber` (string | null), `businessRegistrationType` (string | null), `campaignVerifyAuthorizationToken` (string | null), `doingBusinessAs` (string | null), `entityType` (object), `helpMessageResponse` (string | null), `isvReseller` (string | null), `optInConfirmationResponse` (string | null), `optInKeywords` (string | null), `privacyPolicyURL` (string | null), `termsAndConditionURL` (string | null), `webhookUrl` (string)

```ruby
verification_request_egress = client.messaging_tollfree.verification.requests.create(
  additional_information: "additionalInformation",
  business_addr1: "600 Congress Avenue",
  business_city: "Austin",
  business_contact_email: "email@example.com",
  business_contact_first_name: "John",
  business_contact_last_name: "Doe",
  business_contact_phone: "+18005550100",
  business_name: "Telnyx LLC",
  business_state: "Texas",
  business_zip: "78701",
  corporate_website: "http://example.com",
  message_volume: :"100,000",
  opt_in_workflow: "User signs into the Telnyx portal, enters a number and is prompted to select whether they want to use 2FA verification for security purposes. If they've opted in a confirmation message is sent out to the handset",
  opt_in_workflow_image_urls: [{url: "https://client.com/sign-up"}, {url: "https://client.com/company/data-privacy"}],
  phone_numbers: [{phoneNumber: "+18773554398"}, {phoneNumber: "+18773554399"}],
  production_message_content: "Your Telnyx OTP is XXXX",
  use_case: :"2FA",
  use_case_summary: "This is a use case where Telnyx sends out 2FA codes to portal users to verify their identity in order to sign into the portal"
)

puts(verification_request_egress)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `termsAndConditionURL` (string), `useCase` (object), `useCaseSummary` (string), `verificationRequestId` (string), `verificationStatus` (object), `webhookUrl` (string)

## Get Verification Request

Get a single verification request by its ID.

`GET /messaging_tollfree/verification/requests/{id}`

```ruby
verification_request_status = client.messaging_tollfree.verification.requests.retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(verification_request_status)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `createdAt` (date-time), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `reason` (string), `termsAndConditionURL` (string), `updatedAt` (date-time), `useCase` (object), `useCaseSummary` (string), `verificationStatus` (object), `webhookUrl` (string)

## Update Verification Request

Update an existing tollfree verification request. This is particularly useful when there are pending customer actions to be taken.

`PATCH /messaging_tollfree/verification/requests/{id}` — Required: `businessName`, `corporateWebsite`, `businessAddr1`, `businessCity`, `businessState`, `businessZip`, `businessContactFirstName`, `businessContactLastName`, `businessContactEmail`, `businessContactPhone`, `messageVolume`, `phoneNumbers`, `useCase`, `useCaseSummary`, `productionMessageContent`, `optInWorkflow`, `optInWorkflowImageURLs`, `additionalInformation`

Optional: `ageGatedContent` (boolean), `businessAddr2` (string), `businessRegistrationCountry` (string | null), `businessRegistrationNumber` (string | null), `businessRegistrationType` (string | null), `campaignVerifyAuthorizationToken` (string | null), `doingBusinessAs` (string | null), `entityType` (object), `helpMessageResponse` (string | null), `isvReseller` (string | null), `optInConfirmationResponse` (string | null), `optInKeywords` (string | null), `privacyPolicyURL` (string | null), `termsAndConditionURL` (string | null), `webhookUrl` (string)

```ruby
verification_request_egress = client.messaging_tollfree.verification.requests.update(
  "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  additional_information: "additionalInformation",
  business_addr1: "600 Congress Avenue",
  business_city: "Austin",
  business_contact_email: "email@example.com",
  business_contact_first_name: "John",
  business_contact_last_name: "Doe",
  business_contact_phone: "+18005550100",
  business_name: "Telnyx LLC",
  business_state: "Texas",
  business_zip: "78701",
  corporate_website: "http://example.com",
  message_volume: :"100,000",
  opt_in_workflow: "User signs into the Telnyx portal, enters a number and is prompted to select whether they want to use 2FA verification for security purposes. If they've opted in a confirmation message is sent out to the handset",
  opt_in_workflow_image_urls: [{url: "https://client.com/sign-up"}, {url: "https://client.com/company/data-privacy"}],
  phone_numbers: [{phoneNumber: "+18773554398"}, {phoneNumber: "+18773554399"}],
  production_message_content: "Your Telnyx OTP is XXXX",
  use_case: :"2FA",
  use_case_summary: "This is a use case where Telnyx sends out 2FA codes to portal users to verify their identity in order to sign into the portal"
)

puts(verification_request_egress)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `termsAndConditionURL` (string), `useCase` (object), `useCaseSummary` (string), `verificationRequestId` (string), `verificationStatus` (object), `webhookUrl` (string)

## Delete Verification Request

Delete a verification request

A request may only be deleted when when the request is in the "rejected" state. * `HTTP 200`: request successfully deleted
* `HTTP 400`: request exists but can't be deleted (i.e. not rejected)
* `HTTP 404`: request unknown or already deleted

`DELETE /messaging_tollfree/verification/requests/{id}`

```ruby
result = client.messaging_tollfree.verification.requests.delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(result)
```

## Get Verification Request Status History

Get the history of status changes for a verification request. Returns a paginated list of historical status changes including the reason for each change and when it occurred.

`GET /messaging_tollfree/verification/requests/{id}/status_history`

```ruby
response = client.messaging_tollfree.verification.requests.retrieve_status_history(
  "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
  page_number: 1,
  page_size: 1
)

puts(response)
```

Returns: `records` (array[object]), `total_records` (integer)

## List messaging URL domains

`GET /messaging_url_domains`

```ruby
page = client.messaging_url_domains.list

puts(page)
```

Returns: `id` (string), `record_type` (string), `url_domain` (string), `use_case` (string)
