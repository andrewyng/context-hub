---
name: verify
description: "Look up phone number information (carrier, type, caller name) and verify users via SMS/voice OTP. Use for phone verification and data enrichment."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,verify,otp,2fa,phone-verification,lookup"
---

# Telnyx Verify Go SDK Coding Guidelines

You are a Telnyx Verify API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## Lookup phone number data

Returns information about the provided phone number.

`GET /number_lookup/{phone_number}`

```go
	numberLookup, err := client.NumberLookup.Get(
		context.TODO(),
		"+18665552368",
		telnyx.NumberLookupGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", numberLookup.Data)
```

Returns: `caller_name` (object), `carrier` (object), `country_code` (string), `fraud` (string | null), `national_format` (string), `phone_number` (string), `portability` (object), `record_type` (string)

## List verifications by phone number

`GET /verifications/by_phone_number/{phone_number}`

```go
	byPhoneNumbers, err := client.Verifications.ByPhoneNumber.List(context.TODO(), "+13035551234")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", byPhoneNumbers.Data)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Verify verification code by phone number

`POST /verifications/by_phone_number/{phone_number}/actions/verify` — Required: `code`, `verify_profile_id`

```go
	verifyVerificationCodeResponse, err := client.Verifications.ByPhoneNumber.Actions.Verify(
		context.TODO(),
		"+13035551234",
		telnyx.VerificationByPhoneNumberActionVerifyParams{
			Code:            "17686",
			VerifyProfileID: "12ade33a-21c0-473b-b055-b3c836e1c292",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyVerificationCodeResponse.Data)
```

Returns: `phone_number` (string), `response_code` (enum: accepted, rejected)

## Trigger Call verification

`POST /verifications/call` — Required: `phone_number`, `verify_profile_id`

Optional: `custom_code` (string | null), `extension` (string | null), `timeout_secs` (integer)

```go
	createVerificationResponse, err := client.Verifications.TriggerCall(context.TODO(), telnyx.VerificationTriggerCallParams{
		PhoneNumber:     "+13035551234",
		VerifyProfileID: "12ade33a-21c0-473b-b055-b3c836e1c292",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", createVerificationResponse.Data)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Trigger Flash call verification

`POST /verifications/flashcall` — Required: `phone_number`, `verify_profile_id`

Optional: `timeout_secs` (integer)

```go
	createVerificationResponse, err := client.Verifications.TriggerFlashcall(context.TODO(), telnyx.VerificationTriggerFlashcallParams{
		PhoneNumber:     "+13035551234",
		VerifyProfileID: "12ade33a-21c0-473b-b055-b3c836e1c292",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", createVerificationResponse.Data)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Trigger SMS verification

`POST /verifications/sms` — Required: `phone_number`, `verify_profile_id`

Optional: `custom_code` (string | null), `timeout_secs` (integer)

```go
	createVerificationResponse, err := client.Verifications.TriggerSMS(context.TODO(), telnyx.VerificationTriggerSMSParams{
		PhoneNumber:     "+13035551234",
		VerifyProfileID: "12ade33a-21c0-473b-b055-b3c836e1c292",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", createVerificationResponse.Data)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Retrieve verification

`GET /verifications/{verification_id}`

```go
	verification, err := client.Verifications.Get(context.TODO(), "12ade33a-21c0-473b-b055-b3c836e1c292")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verification.Data)
```

Returns: `created_at` (string), `custom_code` (string | null), `id` (uuid), `phone_number` (string), `record_type` (enum: verification), `status` (enum: pending, accepted, invalid, expired, error), `timeout_secs` (integer), `type` (enum: sms, call, flashcall), `updated_at` (string), `verify_profile_id` (uuid)

## Verify verification code by ID

`POST /verifications/{verification_id}/actions/verify`

Optional: `code` (string), `status` (enum: accepted, rejected)

```go
	verifyVerificationCodeResponse, err := client.Verifications.Actions.Verify(
		context.TODO(),
		"12ade33a-21c0-473b-b055-b3c836e1c292",
		telnyx.VerificationActionVerifyParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyVerificationCodeResponse.Data)
```

Returns: `phone_number` (string), `response_code` (enum: accepted, rejected)

## List all Verify profiles

Gets a paginated list of Verify profiles.

`GET /verify_profiles`

```go
	page, err := client.VerifyProfiles.List(context.TODO(), telnyx.VerifyProfileListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Create a Verify profile

Creates a new Verify profile to associate verifications with.

`POST /verify_profiles` — Required: `name`

Optional: `call` (object), `flashcall` (object), `language` (string), `rcs` (object), `sms` (object), `webhook_failover_url` (string), `webhook_url` (string)

```go
	verifyProfileData, err := client.VerifyProfiles.New(context.TODO(), telnyx.VerifyProfileNewParams{
		Name: "Test Profile",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyProfileData.Data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Retrieve Verify profile message templates

List all Verify profile message templates.

`GET /verify_profiles/templates`

```go
	response, err := client.VerifyProfiles.GetTemplates(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `id` (uuid), `text` (string)

## Create message template

Create a new Verify profile message template.

`POST /verify_profiles/templates` — Required: `text`

```go
	messageTemplate, err := client.VerifyProfiles.NewTemplate(context.TODO(), telnyx.VerifyProfileNewTemplateParams{
		Text: "Your {{app_name}} verification code is: {{code}}.",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messageTemplate.Data)
```

Returns: `id` (uuid), `text` (string)

## Update message template

Update an existing Verify profile message template.

`PATCH /verify_profiles/templates/{template_id}` — Required: `text`

```go
	messageTemplate, err := client.VerifyProfiles.UpdateTemplate(
		context.TODO(),
		"12ade33a-21c0-473b-b055-b3c836e1c292",
		telnyx.VerifyProfileUpdateTemplateParams{
			Text: "Your {{app_name}} verification code is: {{code}}.",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messageTemplate.Data)
```

Returns: `id` (uuid), `text` (string)

## Retrieve Verify profile

Gets a single Verify profile.

`GET /verify_profiles/{verify_profile_id}`

```go
	verifyProfileData, err := client.VerifyProfiles.Get(context.TODO(), "12ade33a-21c0-473b-b055-b3c836e1c292")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyProfileData.Data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Update Verify profile

`PATCH /verify_profiles/{verify_profile_id}`

Optional: `call` (object), `flashcall` (object), `language` (string), `name` (string), `rcs` (object), `sms` (object), `webhook_failover_url` (string), `webhook_url` (string)

```go
	verifyProfileData, err := client.VerifyProfiles.Update(
		context.TODO(),
		"12ade33a-21c0-473b-b055-b3c836e1c292",
		telnyx.VerifyProfileUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyProfileData.Data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)

## Delete Verify profile

`DELETE /verify_profiles/{verify_profile_id}`

```go
	verifyProfileData, err := client.VerifyProfiles.Delete(context.TODO(), "12ade33a-21c0-473b-b055-b3c836e1c292")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifyProfileData.Data)
```

Returns: `call` (object), `created_at` (string), `flashcall` (object), `id` (uuid), `language` (string), `name` (string), `rcs` (object), `record_type` (enum: verification_profile), `sms` (object), `updated_at` (string), `webhook_failover_url` (string), `webhook_url` (string)
