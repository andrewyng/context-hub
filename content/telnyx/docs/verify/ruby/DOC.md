---
name: verify
description: "Look up phone number information (carrier, type, caller name) and verify users via SMS/voice OTP. Use for phone verification and data enrichment."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,verify,otp,2fa,phone-verification,lookup"
---

# Telnyx Verify Ruby SDK Coding Guidelines

You are a Telnyx Verify API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

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

## Lookup phone number data

Returns information about the provided phone number.

`GET /number_lookup/{phone_number}`

```ruby
number_lookup = client.number_lookup.retrieve("+18665552368")

puts(number_lookup)
```

Returns: `caller_name` (object), `carrier` (object), `country_code` (string), `fraud` (string | null), `national_format` (string), `phone_number` (string), `portability` (object), `record_type` (string)

## List verifications by phone number

`GET /verifications/by_phone_number/{phone_number}`

```ruby
by_phone_numbers = client.verifications.by_phone_number.list("+13035551234")

puts(by_phone_numbers)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Verify verification code by phone number

`POST /verifications/by_phone_number/{phone_number}/actions/verify` — Required: `code`, `verify_profile_id`

```ruby
verify_verification_code_response = client.verifications.by_phone_number.actions.verify(
  "+13035551234",
  code: "17686",
  verify_profile_id: "12ade33a-21c0-473b-b055-b3c836e1c292"
)

puts(verify_verification_code_response)
```

Returns: `phone_number` (string), `response_code` (enum: accepted, rejected)

## Trigger Call verification

`POST /verifications/call` — Required: `phone_number`, `verify_profile_id`

Optional: `custom_code` (string | null), `extension` (string | null), `timeout_secs` (integer)

```ruby
create_verification_response = client.verifications.trigger_call(
  phone_number: "+13035551234",
  verify_profile_id: "12ade33a-21c0-473b-b055-b3c836e1c292"
)

puts(create_verification_response)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Trigger Flash call verification

`POST /verifications/flashcall` — Required: `phone_number`, `verify_profile_id`

Optional: `timeout_secs` (integer)

```ruby
create_verification_response = client.verifications.trigger_flashcall(
  phone_number: "+13035551234",
  verify_profile_id: "12ade33a-21c0-473b-b055-b3c836e1c292"
)

puts(create_verification_response)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Trigger SMS verification

`POST /verifications/sms` — Required: `phone_number`, `verify_profile_id`

Optional: `custom_code` (string | null), `timeout_secs` (integer)

```ruby
create_verification_response = client.verifications.trigger_sms(
  phone_number: "+13035551234",
  verify_profile_id: "12ade33a-21c0-473b-b055-b3c836e1c292"
)

puts(create_verification_response)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Retrieve verification

`GET /verifications/{verification_id}`

```ruby
verification = client.verifications.retrieve("12ade33a-21c0-473b-b055-b3c836e1c292")

puts(verification)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Verify verification code by ID

`POST /verifications/{verification_id}/actions/verify`

Optional: `code` (string), `status` (enum: accepted, rejected)

```ruby
verify_verification_code_response = client.verifications.actions.verify("12ade33a-21c0-473b-b055-b3c836e1c292")

puts(verify_verification_code_response)
```

Returns: `phone_number` (string), `response_code` (enum: accepted, rejected)

## List all Verify profiles

Gets a paginated list of Verify profiles.

`GET /verify_profiles`

```ruby
page = client.verify_profiles.list

puts(page)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Create a Verify profile

Creates a new Verify profile to associate verifications with.

`POST /verify_profiles` — Required: `name`

Optional: `call` (object), `flashcall` (object), `language` (string), `rcs` (object), `sms` (object), `webhook_failover_url` (string), `webhook_url` (string)

```ruby
verify_profile_data = client.verify_profiles.create(name: "Test Profile")

puts(verify_profile_data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Retrieve Verify profile message templates

List all Verify profile message templates.

`GET /verify_profiles/templates`

```ruby
response = client.verify_profiles.retrieve_templates

puts(response)
```

Returns: `id` (uuid), `text` (string)

## Create message template

Create a new Verify profile message template.

`POST /verify_profiles/templates` — Required: `text`

```ruby
message_template = client.verify_profiles.create_template(text: "Your {{app_name}} verification code is: {{code}}.")

puts(message_template)
```

Returns: `id` (uuid), `text` (string)

## Update message template

Update an existing Verify profile message template.

`PATCH /verify_profiles/templates/{template_id}` — Required: `text`

```ruby
message_template = client.verify_profiles.update_template(
  "12ade33a-21c0-473b-b055-b3c836e1c292",
  text: "Your {{app_name}} verification code is: {{code}}."
)

puts(message_template)
```

Returns: `id` (uuid), `text` (string)

## Retrieve Verify profile

Gets a single Verify profile.

`GET /verify_profiles/{verify_profile_id}`

```ruby
verify_profile_data = client.verify_profiles.retrieve("12ade33a-21c0-473b-b055-b3c836e1c292")

puts(verify_profile_data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Update Verify profile

`PATCH /verify_profiles/{verify_profile_id}`

Optional: `call` (object), `flashcall` (object), `language` (string), `name` (string), `rcs` (object), `sms` (object), `webhook_failover_url` (string), `webhook_url` (string)

```ruby
verify_profile_data = client.verify_profiles.update("12ade33a-21c0-473b-b055-b3c836e1c292")

puts(verify_profile_data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Delete Verify profile

`DELETE /verify_profiles/{verify_profile_id}`

```ruby
verify_profile_data = client.verify_profiles.delete("12ade33a-21c0-473b-b055-b3c836e1c292")

puts(verify_profile_data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)
