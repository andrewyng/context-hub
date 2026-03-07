---
name: messaging-hosted
description: "Set up hosted SMS numbers, toll-free verification, and RCS messaging. Use when migrating numbers or enabling rich messaging features."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,messaging,hosted-sms,toll-free,rcs"
---

# Telnyx Messaging Hosted Go SDK Coding Guidelines

You are a Telnyx Messaging Hosted API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## Send an RCS message

`POST /messages/rcs` — Required: `agent_id`, `to`, `messaging_profile_id`, `agent_message`

Optional: `mms_fallback` (object), `sms_fallback` (object), `type` (enum: RCS), `webhook_url` (url)

```go
	response, err := client.Messages.Rcs.Send(context.TODO(), telnyx.MessageRcSendParams{
		AgentID:            "Agent007",
		AgentMessage:       telnyx.RcsAgentMessageParam{},
		MessagingProfileID: "messaging_profile_id",
		To:                 "+13125551234",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `body` (object), `direction` (string), `encoding` (string), `from` (object), `id` (string), `messaging_profile_id` (string), `organization_id` (string), `received_at` (date-time), `record_type` (string), `to` (array[object]), `type` (string), `wait_seconds` (float)

## Generate RCS deeplink

Generate a deeplink URL that can be used to start an RCS conversation with a specific agent.

`GET /messages/rcs/deeplinks/{agent_id}`

```go
	response, err := client.Messages.Rcs.GenerateDeeplink(
		context.TODO(),
		"agent_id",
		telnyx.MessageRcGenerateDeeplinkParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `url` (string)

## List all RCS agents

`GET /messaging/rcs/agents`

```go
	page, err := client.Messaging.Rcs.Agents.List(context.TODO(), telnyx.MessagingRcAgentListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Retrieve an RCS agent

`GET /messaging/rcs/agents/{id}`

```go
	rcsAgentResponse, err := client.Messaging.Rcs.Agents.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", rcsAgentResponse.Data)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Modify an RCS agent

`PATCH /messaging/rcs/agents/{id}`

Optional: `profile_id` (uuid), `webhook_failover_url` (url), `webhook_url` (url)

```go
	rcsAgentResponse, err := client.Messaging.Rcs.Agents.Update(
		context.TODO(),
		"id",
		telnyx.MessagingRcAgentUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", rcsAgentResponse.Data)
```

Returns: `agent_id` (string), `agent_name` (string), `created_at` (date-time), `enabled` (boolean), `profile_id` (uuid), `updated_at` (date-time), `user_id` (string), `webhook_failover_url` (url), `webhook_url` (url)

## Check RCS capabilities (batch)

`POST /messaging/rcs/bulk_capabilities` — Required: `agent_id`, `phone_numbers`

```go
	response, err := client.Messaging.Rcs.ListBulkCapabilities(context.TODO(), telnyx.MessagingRcListBulkCapabilitiesParams{
		AgentID:      "TestAgent",
		PhoneNumbers: []string{"+13125551234"},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `agent_id` (string), `agent_name` (string), `features` (array[string]), `phone_number` (string), `record_type` (enum: rcs.capabilities)

## Check RCS capabilities

`GET /messaging/rcs/capabilities/{agent_id}/{phone_number}`

```go
	response, err := client.Messaging.Rcs.GetCapabilities(
		context.TODO(),
		"phone_number",
		telnyx.MessagingRcGetCapabilitiesParams{
			AgentID: "agent_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `agent_id` (string), `agent_name` (string), `features` (array[string]), `phone_number` (string), `record_type` (enum: rcs.capabilities)

## Add RCS test number

Adds a test phone number to an RCS agent for testing purposes.

`PUT /messaging/rcs/test_number_invite/{id}/{phone_number}`

```go
	response, err := client.Messaging.Rcs.InviteTestNumber(
		context.TODO(),
		"phone_number",
		telnyx.MessagingRcInviteTestNumberParams{
			ID: "id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `agent_id` (string), `phone_number` (string), `record_type` (enum: rcs.test_number_invite), `status` (string)

## List messaging hosted number orders

`GET /messaging_hosted_number_orders`

```go
	page, err := client.MessagingHostedNumberOrders.List(context.TODO(), telnyx.MessagingHostedNumberOrderListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Create a messaging hosted number order

`POST /messaging_hosted_number_orders`

Optional: `messaging_profile_id` (string), `phone_numbers` (array[string])

```go
	messagingHostedNumberOrder, err := client.MessagingHostedNumberOrders.New(context.TODO(), telnyx.MessagingHostedNumberOrderNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messagingHostedNumberOrder.Data)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Check hosted messaging eligibility

`POST /messaging_hosted_number_orders/eligibility_numbers_check` — Required: `phone_numbers`

```go
	response, err := client.MessagingHostedNumberOrders.CheckEligibility(context.TODO(), telnyx.MessagingHostedNumberOrderCheckEligibilityParams{
		PhoneNumbers: []string{"string"},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.PhoneNumbers)
```

Returns: `phone_numbers` (array[object])

## Retrieve a messaging hosted number order

`GET /messaging_hosted_number_orders/{id}`

```go
	messagingHostedNumberOrder, err := client.MessagingHostedNumberOrders.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messagingHostedNumberOrder.Data)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Delete a messaging hosted number order

Delete a messaging hosted number order and all associated phone numbers.

`DELETE /messaging_hosted_number_orders/{id}`

```go
	messagingHostedNumberOrder, err := client.MessagingHostedNumberOrders.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messagingHostedNumberOrder.Data)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Upload hosted number document

`POST /messaging_hosted_number_orders/{id}/actions/file_upload`

```go
	response, err := client.MessagingHostedNumberOrders.Actions.UploadFile(
		context.TODO(),
		"id",
		telnyx.MessagingHostedNumberOrderActionUploadFileParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## Validate hosted number codes

Validate the verification codes sent to the numbers of the hosted order. The verification codes must be created in the verification codes endpoint.

`POST /messaging_hosted_number_orders/{id}/validation_codes` — Required: `verification_codes`

```go
	response, err := client.MessagingHostedNumberOrders.ValidateCodes(
		context.TODO(),
		"id",
		telnyx.MessagingHostedNumberOrderValidateCodesParams{
			VerificationCodes: []telnyx.MessagingHostedNumberOrderValidateCodesParamsVerificationCode{{
				Code:        "code",
				PhoneNumber: "phone_number",
			}},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `order_id` (uuid), `phone_numbers` (array[object])

## Create hosted number verification codes

Create verification codes to validate numbers of the hosted order. The verification codes will be sent to the numbers of the hosted order.

`POST /messaging_hosted_number_orders/{id}/verification_codes` — Required: `phone_numbers`, `verification_method`

```go
	response, err := client.MessagingHostedNumberOrders.NewVerificationCodes(
		context.TODO(),
		"id",
		telnyx.MessagingHostedNumberOrderNewVerificationCodesParams{
			PhoneNumbers:       []string{"string"},
			VerificationMethod: telnyx.MessagingHostedNumberOrderNewVerificationCodesParamsVerificationMethodSMS,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `error` (string), `phone_number` (string), `type` (enum: sms, call, flashcall), `verification_code_id` (uuid)

## Delete a messaging hosted number

`DELETE /messaging_hosted_numbers/{id}`

```go
	messagingHostedNumber, err := client.MessagingHostedNumbers.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", messagingHostedNumber.Data)
```

Returns: `id` (uuid), `messaging_profile_id` (string | null), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: carrier_rejected, compliance_review_failed, deleted, failed, incomplete_documentation, incorrect_billing_information, ineligible_carrier, loa_file_invalid, loa_file_successful, pending, provisioning, successful)

## List Verification Requests

Get a list of previously-submitted tollfree verification requests

`GET /messaging_tollfree/verification/requests`

```go
	page, err := client.MessagingTollfree.Verification.Requests.List(context.TODO(), telnyx.MessagingTollfreeVerificationRequestListParams{
		Page:     1,
		PageSize: 1,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `records` (array[object]), `total_records` (integer)

## Submit Verification Request

Submit a new tollfree verification request

`POST /messaging_tollfree/verification/requests` — Required: `businessName`, `corporateWebsite`, `businessAddr1`, `businessCity`, `businessState`, `businessZip`, `businessContactFirstName`, `businessContactLastName`, `businessContactEmail`, `businessContactPhone`, `messageVolume`, `phoneNumbers`, `useCase`, `useCaseSummary`, `productionMessageContent`, `optInWorkflow`, `optInWorkflowImageURLs`, `additionalInformation`

Optional: `ageGatedContent` (boolean), `businessAddr2` (string), `businessRegistrationCountry` (string | null), `businessRegistrationNumber` (string | null), `businessRegistrationType` (string | null), `campaignVerifyAuthorizationToken` (string | null), `doingBusinessAs` (string | null), `entityType` (object), `helpMessageResponse` (string | null), `isvReseller` (string | null), `optInConfirmationResponse` (string | null), `optInKeywords` (string | null), `privacyPolicyURL` (string | null), `termsAndConditionURL` (string | null), `webhookUrl` (string)

```go
	verificationRequestEgress, err := client.MessagingTollfree.Verification.Requests.New(context.TODO(), telnyx.MessagingTollfreeVerificationRequestNewParams{
		TfVerificationRequest: telnyx.TfVerificationRequestParam{
			AdditionalInformation:    "additionalInformation",
			BusinessAddr1:            "600 Congress Avenue",
			BusinessCity:             "Austin",
			BusinessContactEmail:     "email@example.com",
			BusinessContactFirstName: "John",
			BusinessContactLastName:  "Doe",
			BusinessContactPhone:     "+18005550100",
			BusinessName:             "Telnyx LLC",
			BusinessState:            "Texas",
			BusinessZip:              "78701",
			CorporateWebsite:         "http://example.com",
			MessageVolume:            telnyx.VolumeV100000,
			OptInWorkflow:            "User signs into the Telnyx portal, enters a number and is prompted to select whether they want to use 2FA verification for security purposes. If they've opted in a confirmation message is sent out to the handset",
			OptInWorkflowImageURLs: []telnyx.URLParam{{
				URL: "https://telnyx.com/sign-up",
			}, {
				URL: "https://telnyx.com/company/data-privacy",
			}},
			PhoneNumbers: []telnyx.TfPhoneNumberParam{{
				PhoneNumber: "+18773554398",
			}, {
				PhoneNumber: "+18773554399",
			}},
			ProductionMessageContent: "Your Telnyx OTP is XXXX",
			UseCase:                  telnyx.UseCaseCategoriesTwoFa,
			UseCaseSummary:           "This is a use case where Telnyx sends out 2FA codes to portal users to verify their identity in order to sign into the portal",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verificationRequestEgress.ID)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `termsAndConditionURL` (string), `useCase` (object), `useCaseSummary` (string), `verificationRequestId` (string), `verificationStatus` (object), `webhookUrl` (string)

## Get Verification Request

Get a single verification request by its ID.

`GET /messaging_tollfree/verification/requests/{id}`

```go
	verificationRequestStatus, err := client.MessagingTollfree.Verification.Requests.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verificationRequestStatus.ID)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `createdAt` (date-time), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `reason` (string), `termsAndConditionURL` (string), `updatedAt` (date-time), `useCase` (object), `useCaseSummary` (string), `verificationStatus` (object), `webhookUrl` (string)

## Update Verification Request

Update an existing tollfree verification request. This is particularly useful when there are pending customer actions to be taken.

`PATCH /messaging_tollfree/verification/requests/{id}` — Required: `businessName`, `corporateWebsite`, `businessAddr1`, `businessCity`, `businessState`, `businessZip`, `businessContactFirstName`, `businessContactLastName`, `businessContactEmail`, `businessContactPhone`, `messageVolume`, `phoneNumbers`, `useCase`, `useCaseSummary`, `productionMessageContent`, `optInWorkflow`, `optInWorkflowImageURLs`, `additionalInformation`

Optional: `ageGatedContent` (boolean), `businessAddr2` (string), `businessRegistrationCountry` (string | null), `businessRegistrationNumber` (string | null), `businessRegistrationType` (string | null), `campaignVerifyAuthorizationToken` (string | null), `doingBusinessAs` (string | null), `entityType` (object), `helpMessageResponse` (string | null), `isvReseller` (string | null), `optInConfirmationResponse` (string | null), `optInKeywords` (string | null), `privacyPolicyURL` (string | null), `termsAndConditionURL` (string | null), `webhookUrl` (string)

```go
	verificationRequestEgress, err := client.MessagingTollfree.Verification.Requests.Update(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.MessagingTollfreeVerificationRequestUpdateParams{
			TfVerificationRequest: telnyx.TfVerificationRequestParam{
				AdditionalInformation:    "additionalInformation",
				BusinessAddr1:            "600 Congress Avenue",
				BusinessCity:             "Austin",
				BusinessContactEmail:     "email@example.com",
				BusinessContactFirstName: "John",
				BusinessContactLastName:  "Doe",
				BusinessContactPhone:     "+18005550100",
				BusinessName:             "Telnyx LLC",
				BusinessState:            "Texas",
				BusinessZip:              "78701",
				CorporateWebsite:         "http://example.com",
				MessageVolume:            telnyx.VolumeV100000,
				OptInWorkflow:            "User signs into the Telnyx portal, enters a number and is prompted to select whether they want to use 2FA verification for security purposes. If they've opted in a confirmation message is sent out to the handset",
				OptInWorkflowImageURLs: []telnyx.URLParam{{
					URL: "https://telnyx.com/sign-up",
				}, {
					URL: "https://telnyx.com/company/data-privacy",
				}},
				PhoneNumbers: []telnyx.TfPhoneNumberParam{{
					PhoneNumber: "+18773554398",
				}, {
					PhoneNumber: "+18773554399",
				}},
				ProductionMessageContent: "Your Telnyx OTP is XXXX",
				UseCase:                  telnyx.UseCaseCategoriesTwoFa,
				UseCaseSummary:           "This is a use case where Telnyx sends out 2FA codes to portal users to verify their identity in order to sign into the portal",
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verificationRequestEgress.ID)
```

Returns: `additionalInformation` (string), `ageGatedContent` (boolean), `businessAddr1` (string), `businessAddr2` (string), `businessCity` (string), `businessContactEmail` (string), `businessContactFirstName` (string), `businessContactLastName` (string), `businessContactPhone` (string), `businessName` (string), `businessRegistrationCountry` (string), `businessRegistrationNumber` (string), `businessRegistrationType` (string), `businessState` (string), `businessZip` (string), `campaignVerifyAuthorizationToken` (string | null), `corporateWebsite` (string), `doingBusinessAs` (string), `entityType` (object), `helpMessageResponse` (string), `id` (uuid), `isvReseller` (string), `messageVolume` (object), `optInConfirmationResponse` (string), `optInKeywords` (string), `optInWorkflow` (string), `optInWorkflowImageURLs` (array[object]), `phoneNumbers` (array[object]), `privacyPolicyURL` (string), `productionMessageContent` (string), `termsAndConditionURL` (string), `useCase` (object), `useCaseSummary` (string), `verificationRequestId` (string), `verificationStatus` (object), `webhookUrl` (string)

## Delete Verification Request

Delete a verification request

A request may only be deleted when when the request is in the "rejected" state. * `HTTP 200`: request successfully deleted
* `HTTP 400`: request exists but can't be deleted (i.e. not rejected)
* `HTTP 404`: request unknown or already deleted

`DELETE /messaging_tollfree/verification/requests/{id}`

```go
	err := client.MessagingTollfree.Verification.Requests.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
```

## Get Verification Request Status History

Get the history of status changes for a verification request. Returns a paginated list of historical status changes including the reason for each change and when it occurred.

`GET /messaging_tollfree/verification/requests/{id}/status_history`

```go
	response, err := client.MessagingTollfree.Verification.Requests.GetStatusHistory(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.MessagingTollfreeVerificationRequestGetStatusHistoryParams{
			PageNumber: 1,
			PageSize:   1,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Records)
```

Returns: `records` (array[object]), `total_records` (integer)

## List messaging URL domains

`GET /messaging_url_domains`

```go
	page, err := client.MessagingURLDomains.List(context.TODO(), telnyx.MessagingURLDomainListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `id` (string), `record_type` (string), `url_domain` (string), `use_case` (string)
