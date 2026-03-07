---
name: 10dlc
description: "Register brands and campaigns for 10DLC (10-digit long code) A2P messaging compliance in the US. Manage campaign assignments to phone numbers."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,10dlc,a2p,messaging,compliance,brand,campaign"
---

# Telnyx 10DLC Go SDK Coding Guidelines

You are a Telnyx 10DLC API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## List Brands

This endpoint is used to list all brands associated with your organization.

`GET /10dlc/brand`

```go
	page, err := client.Messaging10dlc.Brand.List(context.TODO(), telnyx.Messaging10dlcBrandListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `page` (integer), `records` (array[object]), `totalRecords` (integer)

## Create Brand

This endpoint is used to create a new brand. A brand is an entity created by The Campaign Registry (TCR) that represents an organization or a company. It is this entity that TCR created campaigns will be associated with.

`POST /10dlc/brand` — Required: `entityType`, `displayName`, `country`, `email`, `vertical`

Optional: `businessContactEmail` (string), `city` (string), `companyName` (string), `ein` (string), `firstName` (string), `ipAddress` (string), `isReseller` (boolean), `lastName` (string), `mobilePhone` (string), `mock` (boolean), `phone` (string), `postalCode` (string), `state` (string), `stockExchange` (object), `stockSymbol` (string), `street` (string), `webhookFailoverURL` (string), `webhookURL` (string), `website` (string)

```go
	telnyxBrand, err := client.Messaging10dlc.Brand.New(context.TODO(), telnyx.Messaging10dlcBrandNewParams{
		Country:     "US",
		DisplayName: "ABC Mobile",
		Email:       "email",
		EntityType:  telnyx.EntityTypePrivateProfit,
		Vertical:    telnyx.VerticalTechnology,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxBrand.IdentityStatus)
```

Returns: `altBusinessId` (string), `altBusinessIdType` (enum: NONE, DUNS, GIIN, LEI), `brandId` (string), `brandRelationship` (object), `businessContactEmail` (string), `city` (string), `companyName` (string), `country` (string), `createdAt` (string), `cspId` (string), `displayName` (string), `ein` (string), `email` (string), `entityType` (object), `failureReasons` (string), `firstName` (string), `identityStatus` (enum: VERIFIED, UNVERIFIED, SELF_DECLARED, VETTED_VERIFIED), `ipAddress` (string), `isReseller` (boolean), `lastName` (string), `mobilePhone` (string), `mock` (boolean), `optionalAttributes` (object), `phone` (string), `postalCode` (string), `referenceId` (string), `state` (string), `status` (enum: OK, REGISTRATION_PENDING, REGISTRATION_FAILED), `stockExchange` (object), `stockSymbol` (string), `street` (string), `tcrBrandId` (string), `universalEin` (string), `updatedAt` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string), `website` (string)

## Get Brand Feedback By Id

Get feedback about a brand by ID. This endpoint can be used after creating or revetting
a brand. Possible values for `.category[].id`:

* `TAX_ID` - Data mismatch related to tax id and its associated properties.

`GET /10dlc/brand/feedback/{brandId}`

```go
	response, err := client.Messaging10dlc.Brand.GetFeedback(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.BrandID)
```

Returns: `brandId` (string), `category` (array[object])

## Get Brand SMS OTP Status

Query the status of an SMS OTP (One-Time Password) for Sole Proprietor brand verification. This endpoint allows you to check the delivery and verification status of an OTP sent during the Sole Proprietor brand verification process.

`GET /10dlc/brand/smsOtp/{referenceId}`

```go
	response, err := client.Messaging10dlc.Brand.GetSMSOtpByReference(
		context.TODO(),
		"OTP4B2001",
		telnyx.Messaging10dlcBrandGetSMSOtpByReferenceParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.BrandID)
```

Returns: `brandId` (string), `deliveryStatus` (string), `deliveryStatusDate` (date-time), `deliveryStatusDetails` (string), `mobilePhone` (string), `referenceId` (string), `requestDate` (date-time), `verifyDate` (date-time)

## Get Brand

Retrieve a brand by `brandId`.

`GET /10dlc/brand/{brandId}`

```go
	brand, err := client.Messaging10dlc.Brand.Get(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", brand)
```

## Update Brand

Update a brand's attributes by `brandId`.

`PUT /10dlc/brand/{brandId}` — Required: `entityType`, `displayName`, `country`, `email`, `vertical`

Optional: `altBusinessId` (string), `altBusinessIdType` (enum: NONE, DUNS, GIIN, LEI), `businessContactEmail` (string), `city` (string), `companyName` (string), `ein` (string), `firstName` (string), `identityStatus` (enum: VERIFIED, UNVERIFIED, SELF_DECLARED, VETTED_VERIFIED), `ipAddress` (string), `isReseller` (boolean), `lastName` (string), `phone` (string), `postalCode` (string), `state` (string), `stockExchange` (object), `stockSymbol` (string), `street` (string), `webhookFailoverURL` (string), `webhookURL` (string), `website` (string)

```go
	telnyxBrand, err := client.Messaging10dlc.Brand.Update(
		context.TODO(),
		"brandId",
		telnyx.Messaging10dlcBrandUpdateParams{
			Country:     "US",
			DisplayName: "ABC Mobile",
			Email:       "email",
			EntityType:  telnyx.EntityTypePrivateProfit,
			Vertical:    telnyx.VerticalTechnology,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxBrand.IdentityStatus)
```

Returns: `altBusinessId` (string), `altBusinessIdType` (enum: NONE, DUNS, GIIN, LEI), `brandId` (string), `brandRelationship` (object), `businessContactEmail` (string), `city` (string), `companyName` (string), `country` (string), `createdAt` (string), `cspId` (string), `displayName` (string), `ein` (string), `email` (string), `entityType` (object), `failureReasons` (string), `firstName` (string), `identityStatus` (enum: VERIFIED, UNVERIFIED, SELF_DECLARED, VETTED_VERIFIED), `ipAddress` (string), `isReseller` (boolean), `lastName` (string), `mobilePhone` (string), `mock` (boolean), `optionalAttributes` (object), `phone` (string), `postalCode` (string), `referenceId` (string), `state` (string), `status` (enum: OK, REGISTRATION_PENDING, REGISTRATION_FAILED), `stockExchange` (object), `stockSymbol` (string), `street` (string), `tcrBrandId` (string), `universalEin` (string), `updatedAt` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string), `website` (string)

## Delete Brand

Delete Brand. This endpoint is used to delete a brand. Note the brand cannot be deleted if it contains one or more active campaigns, the campaigns need to be inactive and at least 3 months old due to billing purposes.

`DELETE /10dlc/brand/{brandId}`

```go
	err := client.Messaging10dlc.Brand.Delete(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
```

## Resend brand 2FA email

`POST /10dlc/brand/{brandId}/2faEmail`

```go
	err := client.Messaging10dlc.Brand.Resend2faEmail(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
```

## List External Vettings

Get list of valid external vetting record for a given brand

`GET /10dlc/brand/{brandId}/externalVetting`

```go
	externalVettings, err := client.Messaging10dlc.Brand.ExternalVetting.List(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", externalVettings)
```

## Order Brand External Vetting

Order new external vetting for a brand

`POST /10dlc/brand/{brandId}/externalVetting` — Required: `evpId`, `vettingClass`

```go
	response, err := client.Messaging10dlc.Brand.ExternalVetting.Order(
		context.TODO(),
		"brandId",
		telnyx.Messaging10dlcBrandExternalVettingOrderParams{
			EvpID:        "evpId",
			VettingClass: "vettingClass",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.CreateDate)
```

Returns: `createDate` (string), `evpId` (string), `vettedDate` (string), `vettingClass` (string), `vettingId` (string), `vettingScore` (integer), `vettingToken` (string)

## Import External Vetting Record

This operation can be used to import an external vetting record from a TCR-approved
vetting provider. If the vetting provider confirms validity of the record, it will be
saved with the brand and will be considered for future campaign qualification.

`PUT /10dlc/brand/{brandId}/externalVetting` — Required: `evpId`, `vettingId`

Optional: `vettingToken` (string)

```go
	response, err := client.Messaging10dlc.Brand.ExternalVetting.Imports(
		context.TODO(),
		"brandId",
		telnyx.Messaging10dlcBrandExternalVettingImportsParams{
			EvpID:     "evpId",
			VettingID: "vettingId",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.CreateDate)
```

Returns: `createDate` (string), `evpId` (string), `vettedDate` (string), `vettingClass` (string), `vettingId` (string), `vettingScore` (integer), `vettingToken` (string)

## Revet Brand

This operation allows you to revet the brand. However, revetting is allowed once after the successful brand registration and thereafter limited to once every 3 months.

`PUT /10dlc/brand/{brandId}/revet`

```go
	telnyxBrand, err := client.Messaging10dlc.Brand.Revet(context.TODO(), "brandId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxBrand.IdentityStatus)
```

Returns: `altBusinessId` (string), `altBusinessIdType` (enum: NONE, DUNS, GIIN, LEI), `brandId` (string), `brandRelationship` (object), `businessContactEmail` (string), `city` (string), `companyName` (string), `country` (string), `createdAt` (string), `cspId` (string), `displayName` (string), `ein` (string), `email` (string), `entityType` (object), `failureReasons` (string), `firstName` (string), `identityStatus` (enum: VERIFIED, UNVERIFIED, SELF_DECLARED, VETTED_VERIFIED), `ipAddress` (string), `isReseller` (boolean), `lastName` (string), `mobilePhone` (string), `mock` (boolean), `optionalAttributes` (object), `phone` (string), `postalCode` (string), `referenceId` (string), `state` (string), `status` (enum: OK, REGISTRATION_PENDING, REGISTRATION_FAILED), `stockExchange` (object), `stockSymbol` (string), `street` (string), `tcrBrandId` (string), `universalEin` (string), `updatedAt` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string), `website` (string)

## Get Brand SMS OTP Status by Brand ID

Query the status of an SMS OTP (One-Time Password) for Sole Proprietor brand verification using the Brand ID. This endpoint allows you to check the delivery and verification status of an OTP sent during the Sole Proprietor brand verification process by looking it up with the brand ID. The response includes delivery status, verification dates, and detailed delivery information.

`GET /10dlc/brand/{brandId}/smsOtp`

```go
	response, err := client.Messaging10dlc.Brand.GetSMSOtpStatus(context.TODO(), "4b20019b-043a-78f8-0657-b3be3f4b4002")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.BrandID)
```

Returns: `brandId` (string), `deliveryStatus` (string), `deliveryStatusDate` (date-time), `deliveryStatusDetails` (string), `mobilePhone` (string), `referenceId` (string), `requestDate` (date-time), `verifyDate` (date-time)

## Trigger Brand SMS OTP

Trigger or re-trigger an SMS OTP (One-Time Password) for Sole Proprietor brand verification.

`POST /10dlc/brand/{brandId}/smsOtp` — Required: `pinSms`, `successSms`

```go
	response, err := client.Messaging10dlc.Brand.TriggerSMSOtp(
		context.TODO(),
		"4b20019b-043a-78f8-0657-b3be3f4b4002",
		telnyx.Messaging10dlcBrandTriggerSMSOtpParams{
			PinSMS:     "Your PIN is @OTP_PIN@",
			SuccessSMS: "Verification successful!",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.BrandID)
```

Returns: `brandId` (string), `referenceId` (string)

## Verify Brand SMS OTP

Verify the SMS OTP (One-Time Password) for Sole Proprietor brand verification. **Verification Flow:**

1. User receives OTP via SMS after triggering
2.

`PUT /10dlc/brand/{brandId}/smsOtp` — Required: `otpPin`

```go
	err := client.Messaging10dlc.Brand.VerifySMSOtp(
		context.TODO(),
		"4b20019b-043a-78f8-0657-b3be3f4b4002",
		telnyx.Messaging10dlcBrandVerifySMSOtpParams{
			OtpPin: "123456",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## List Campaigns

Retrieve a list of campaigns associated with a supplied `brandId`.

`GET /10dlc/campaign`

```go
	page, err := client.Messaging10dlc.Campaign.List(context.TODO(), telnyx.Messaging10dlcCampaignListParams{
		BrandID: "brandId",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `page` (integer), `records` (array[object]), `totalRecords` (integer)

## Accept Shared Campaign

Manually accept a campaign shared with Telnyx

`POST /10dlc/campaign/acceptSharing/{campaignId}`

```go
	response, err := client.Messaging10dlc.Campaign.AcceptSharing(context.TODO(), "C26F1KLZN")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get Campaign Cost

`GET /10dlc/campaign/usecase/cost`

```go
	response, err := client.Messaging10dlc.Campaign.Usecase.GetCost(context.TODO(), telnyx.Messaging10dlcCampaignUsecaseGetCostParams{
		Usecase: "usecase",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.CampaignUsecase)
```

Returns: `campaignUsecase` (string), `description` (string), `monthlyCost` (string), `upFrontCost` (string)

## Get campaign

Retrieve campaign details by `campaignId`.

`GET /10dlc/campaign/{campaignId}`

```go
	telnyxCampaignCsp, err := client.Messaging10dlc.Campaign.Get(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxCampaignCsp.BrandID)
```

Returns: `ageGated` (boolean), `autoRenewal` (boolean), `billedDate` (string), `brandDisplayName` (string), `brandId` (string), `campaignId` (string), `campaignStatus` (enum: TCR_PENDING, TCR_SUSPENDED, TCR_EXPIRED, TCR_ACCEPTED, TCR_FAILED, TELNYX_ACCEPTED, TELNYX_FAILED, MNO_PENDING, MNO_ACCEPTED, MNO_REJECTED, MNO_PROVISIONED, MNO_PROVISIONING_FAILED), `createDate` (string), `cspId` (string), `description` (string), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `failureReasons` (string), `helpKeywords` (string), `helpMessage` (string), `isTMobileNumberPoolingEnabled` (boolean), `isTMobileRegistered` (boolean), `isTMobileSuspended` (boolean), `messageFlow` (string), `mock` (boolean), `nextRenewalOrExpirationDate` (string), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `referenceId` (string), `resellerId` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `status` (string), `subUsecases` (array[string]), `submissionStatus` (enum: CREATED, FAILED, PENDING), `subscriberHelp` (boolean), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tcrBrandId` (string), `tcrCampaignId` (string), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `usecase` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string)

## Update campaign

Update a campaign's properties by `campaignId`. **Please note:** only sample messages are editable.

`PUT /10dlc/campaign/{campaignId}`

Optional: `autoRenewal` (boolean), `helpMessage` (string), `messageFlow` (string), `resellerId` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `webhookFailoverURL` (string), `webhookURL` (string)

```go
	telnyxCampaignCsp, err := client.Messaging10dlc.Campaign.Update(
		context.TODO(),
		"campaignId",
		telnyx.Messaging10dlcCampaignUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxCampaignCsp.BrandID)
```

Returns: `ageGated` (boolean), `autoRenewal` (boolean), `billedDate` (string), `brandDisplayName` (string), `brandId` (string), `campaignId` (string), `campaignStatus` (enum: TCR_PENDING, TCR_SUSPENDED, TCR_EXPIRED, TCR_ACCEPTED, TCR_FAILED, TELNYX_ACCEPTED, TELNYX_FAILED, MNO_PENDING, MNO_ACCEPTED, MNO_REJECTED, MNO_PROVISIONED, MNO_PROVISIONING_FAILED), `createDate` (string), `cspId` (string), `description` (string), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `failureReasons` (string), `helpKeywords` (string), `helpMessage` (string), `isTMobileNumberPoolingEnabled` (boolean), `isTMobileRegistered` (boolean), `isTMobileSuspended` (boolean), `messageFlow` (string), `mock` (boolean), `nextRenewalOrExpirationDate` (string), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `referenceId` (string), `resellerId` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `status` (string), `subUsecases` (array[string]), `submissionStatus` (enum: CREATED, FAILED, PENDING), `subscriberHelp` (boolean), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tcrBrandId` (string), `tcrCampaignId` (string), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `usecase` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string)

## Deactivate campaign

Terminate a campaign. Note that once deactivated, a campaign cannot be restored.

`DELETE /10dlc/campaign/{campaignId}`

```go
	response, err := client.Messaging10dlc.Campaign.Deactivate(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Time)
```

Returns: `message` (string), `record_type` (string), `time` (number)

## Submit campaign appeal for manual review

Submits an appeal for rejected native campaigns in TELNYX_FAILED or MNO_REJECTED status. The appeal is recorded for manual compliance team review and the campaign status is reset to TCR_ACCEPTED. Note: Appeal forwarding is handled manually to allow proper review before incurring upstream charges.

`POST /10dlc/campaign/{campaignId}/appeal` — Required: `appeal_reason`

```go
	response, err := client.Messaging10dlc.Campaign.SubmitAppeal(
		context.TODO(),
		"5eb13888-32b7-4cab-95e6-d834dde21d64",
		telnyx.Messaging10dlcCampaignSubmitAppealParams{
			AppealReason: "The website has been updated to include the required privacy policy and terms of service.",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.AppealedAt)
```

Returns: `appealed_at` (date-time)

## Get Campaign Mno Metadata

Get the campaign metadata for each MNO it was submitted to.

`GET /10dlc/campaign/{campaignId}/mnoMetadata`

```go
	response, err := client.Messaging10dlc.Campaign.GetMnoMetadata(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Number10999)
```

Returns: `10999` (object)

## Get campaign operation status

Retrieve campaign's operation status at MNO level.

`GET /10dlc/campaign/{campaignId}/operationStatus`

```go
	response, err := client.Messaging10dlc.Campaign.GetOperationStatus(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get OSR campaign attributes

`GET /10dlc/campaign/{campaignId}/osr/attributes`

```go
	response, err := client.Messaging10dlc.Campaign.Osr.GetAttributes(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get Sharing Status

`GET /10dlc/campaign/{campaignId}/sharing`

```go
	response, err := client.Messaging10dlc.Campaign.GetSharingStatus(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.SharedByMe)
```

Returns: `sharedByMe` (object), `sharedWithMe` (object)

## Submit Campaign

Before creating a campaign, use the [Qualify By Usecase endpoint](https://developers.telnyx.com/api-reference/campaign/qualify-by-usecase) to ensure that the brand you want to assign a new campaign to is qualified for the desired use case of that campaign. **Please note:** After campaign creation, you'll only be able to edit the campaign's sample messages.

`POST /10dlc/campaignBuilder` — Required: `brandId`, `description`, `usecase`

Optional: `ageGated` (boolean), `autoRenewal` (boolean), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `helpKeywords` (string), `helpMessage` (string), `messageFlow` (string), `mnoIds` (array[integer]), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `referenceId` (string), `resellerId` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `subUsecases` (array[string]), `subscriberHelp` (boolean), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tag` (array[string]), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `webhookFailoverURL` (string), `webhookURL` (string)

```go
	telnyxCampaignCsp, err := client.Messaging10dlc.CampaignBuilder.Submit(context.TODO(), telnyx.Messaging10dlcCampaignBuilderSubmitParams{
		BrandID:     "brandId",
		Description: "description",
		Usecase:     "usecase",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxCampaignCsp.BrandID)
```

Returns: `ageGated` (boolean), `autoRenewal` (boolean), `billedDate` (string), `brandDisplayName` (string), `brandId` (string), `campaignId` (string), `campaignStatus` (enum: TCR_PENDING, TCR_SUSPENDED, TCR_EXPIRED, TCR_ACCEPTED, TCR_FAILED, TELNYX_ACCEPTED, TELNYX_FAILED, MNO_PENDING, MNO_ACCEPTED, MNO_REJECTED, MNO_PROVISIONED, MNO_PROVISIONING_FAILED), `createDate` (string), `cspId` (string), `description` (string), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `failureReasons` (string), `helpKeywords` (string), `helpMessage` (string), `isTMobileNumberPoolingEnabled` (boolean), `isTMobileRegistered` (boolean), `isTMobileSuspended` (boolean), `messageFlow` (string), `mock` (boolean), `nextRenewalOrExpirationDate` (string), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `referenceId` (string), `resellerId` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `status` (string), `subUsecases` (array[string]), `submissionStatus` (enum: CREATED, FAILED, PENDING), `subscriberHelp` (boolean), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tcrBrandId` (string), `tcrCampaignId` (string), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `usecase` (string), `vertical` (string), `webhookFailoverURL` (string), `webhookURL` (string)

## Qualify By Usecase

This endpoint allows you to see whether or not the supplied brand is suitable for your desired campaign use case.

`GET /10dlc/campaignBuilder/brand/{brandId}/usecase/{usecase}`

```go
	response, err := client.Messaging10dlc.CampaignBuilder.Brand.QualifyByUsecase(
		context.TODO(),
		"usecase",
		telnyx.Messaging10dlcCampaignBuilderBrandQualifyByUsecaseParams{
			BrandID: "brandId",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.AnnualFee)
```

Returns: `annualFee` (number), `maxSubUsecases` (integer), `minSubUsecases` (integer), `mnoMetadata` (object), `monthlyFee` (number), `quarterlyFee` (number), `usecase` (string)

## List shared partner campaigns

Get all partner campaigns you have shared to Telnyx in a paginated fashion

This endpoint is currently limited to only returning shared campaigns that Telnyx
has accepted. In other words, shared but pending campaigns are currently omitted
from the response from this endpoint.

`GET /10dlc/partnerCampaign/sharedByMe`

```go
	page, err := client.Messaging10dlc.PartnerCampaigns.ListSharedByMe(context.TODO(), telnyx.Messaging10dlcPartnerCampaignListSharedByMeParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `page` (integer), `records` (array[object]), `totalRecords` (integer)

## Get Sharing Status

`GET /10dlc/partnerCampaign/{campaignId}/sharing`

```go
	response, err := client.Messaging10dlc.PartnerCampaigns.GetSharingStatus(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## List Shared Campaigns

Retrieve all partner campaigns you have shared to Telnyx in a paginated fashion. This endpoint is currently limited to only returning shared campaigns that Telnyx has accepted. In other words, shared but pending campaigns are currently omitted from the response from this endpoint.

`GET /10dlc/partner_campaigns`

```go
	page, err := client.Messaging10dlc.PartnerCampaigns.List(context.TODO(), telnyx.Messaging10dlcPartnerCampaignListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `page` (integer), `records` (array[object]), `totalRecords` (integer)

## Get Single Shared Campaign

Retrieve campaign details by `campaignId`.

`GET /10dlc/partner_campaigns/{campaignId}`

```go
	telnyxDownstreamCampaign, err := client.Messaging10dlc.PartnerCampaigns.Get(context.TODO(), "campaignId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxDownstreamCampaign.TcrBrandID)
```

Returns: `ageGated` (boolean), `assignedPhoneNumbersCount` (number), `brandDisplayName` (string), `campaignStatus` (enum: TCR_PENDING, TCR_SUSPENDED, TCR_EXPIRED, TCR_ACCEPTED, TCR_FAILED, TELNYX_ACCEPTED, TELNYX_FAILED, MNO_PENDING, MNO_ACCEPTED, MNO_REJECTED, MNO_PROVISIONED, MNO_PROVISIONING_FAILED), `createdAt` (string), `description` (string), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `failureReasons` (string), `helpKeywords` (string), `helpMessage` (string), `isNumberPoolingEnabled` (boolean), `messageFlow` (string), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `subUsecases` (array[string]), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tcrBrandId` (string), `tcrCampaignId` (string), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `updatedAt` (string), `usecase` (string), `webhookFailoverURL` (string), `webhookURL` (string)

## Update Single Shared Campaign

Update campaign details by `campaignId`. **Please note:** Only webhook urls are editable.

`PATCH /10dlc/partner_campaigns/{campaignId}`

Optional: `webhookFailoverURL` (string), `webhookURL` (string)

```go
	telnyxDownstreamCampaign, err := client.Messaging10dlc.PartnerCampaigns.Update(
		context.TODO(),
		"campaignId",
		telnyx.Messaging10dlcPartnerCampaignUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxDownstreamCampaign.TcrBrandID)
```

Returns: `ageGated` (boolean), `assignedPhoneNumbersCount` (number), `brandDisplayName` (string), `campaignStatus` (enum: TCR_PENDING, TCR_SUSPENDED, TCR_EXPIRED, TCR_ACCEPTED, TCR_FAILED, TELNYX_ACCEPTED, TELNYX_FAILED, MNO_PENDING, MNO_ACCEPTED, MNO_REJECTED, MNO_PROVISIONED, MNO_PROVISIONING_FAILED), `createdAt` (string), `description` (string), `directLending` (boolean), `embeddedLink` (boolean), `embeddedLinkSample` (string), `embeddedPhone` (boolean), `failureReasons` (string), `helpKeywords` (string), `helpMessage` (string), `isNumberPoolingEnabled` (boolean), `messageFlow` (string), `numberPool` (boolean), `optinKeywords` (string), `optinMessage` (string), `optoutKeywords` (string), `optoutMessage` (string), `privacyPolicyLink` (string), `sample1` (string), `sample2` (string), `sample3` (string), `sample4` (string), `sample5` (string), `subUsecases` (array[string]), `subscriberOptin` (boolean), `subscriberOptout` (boolean), `tcrBrandId` (string), `tcrCampaignId` (string), `termsAndConditions` (boolean), `termsAndConditionsLink` (string), `updatedAt` (string), `usecase` (string), `webhookFailoverURL` (string), `webhookURL` (string)

## Assign Messaging Profile To Campaign

This endpoint allows you to link all phone numbers associated with a Messaging Profile to a campaign. **Please note:** if you want to assign phone numbers to a campaign that you did not create with Telnyx 10DLC services, this endpoint allows that provided that you've shared the campaign with Telnyx. In this case, only provide the parameter, `tcrCampaignId`, and not `campaignId`.

`POST /10dlc/phoneNumberAssignmentByProfile` — Required: `messagingProfileId`

Optional: `campaignId` (string), `tcrCampaignId` (string)

```go
	response, err := client.Messaging10dlc.PhoneNumberAssignmentByProfile.Assign(context.TODO(), telnyx.Messaging10dlcPhoneNumberAssignmentByProfileAssignParams{
		MessagingProfileID: "4001767e-ce0f-4cae-9d5f-0d5e636e7809",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.MessagingProfileID)
```

Returns: `campaignId` (string), `messagingProfileId` (string), `taskId` (string), `tcrCampaignId` (string)

## Get Assignment Task Status

Check the status of the task associated with assigning all phone numbers on a messaging profile to a campaign by `taskId`.

`GET /10dlc/phoneNumberAssignmentByProfile/{taskId}`

```go
	response, err := client.Messaging10dlc.PhoneNumberAssignmentByProfile.GetStatus(context.TODO(), "taskId")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Status)
```

Returns: `createdAt` (date-time), `status` (string), `taskId` (string), `updatedAt` (date-time)

## Get Phone Number Status

Check the status of the individual phone number/campaign assignments associated with the supplied `taskId`.

`GET /10dlc/phoneNumberAssignmentByProfile/{taskId}/phoneNumbers`

```go
	response, err := client.Messaging10dlc.PhoneNumberAssignmentByProfile.ListPhoneNumberStatus(
		context.TODO(),
		"taskId",
		telnyx.Messaging10dlcPhoneNumberAssignmentByProfileListPhoneNumberStatusParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Records)
```

Returns: `records` (array[object])

## List phone number campaigns

`GET /10dlc/phone_number_campaigns`

```go
	page, err := client.Messaging10dlc.PhoneNumberCampaigns.List(context.TODO(), telnyx.Messaging10dlcPhoneNumberCampaignListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `page` (integer), `records` (array[object]), `totalRecords` (integer)

## Create New Phone Number Campaign

`POST /10dlc/phone_number_campaigns` — Required: `phoneNumber`, `campaignId`

```go
	phoneNumberCampaign, err := client.Messaging10dlc.PhoneNumberCampaigns.New(context.TODO(), telnyx.Messaging10dlcPhoneNumberCampaignNewParams{
		PhoneNumberCampaignCreate: telnyx.PhoneNumberCampaignCreateParam{
			CampaignID:  "4b300178-131c-d902-d54e-72d90ba1620j",
			PhoneNumber: "+18005550199",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", phoneNumberCampaign.CampaignID)
```

Returns: `assignmentStatus` (enum: FAILED_ASSIGNMENT, PENDING_ASSIGNMENT, ASSIGNED, PENDING_UNASSIGNMENT, FAILED_UNASSIGNMENT), `brandId` (string), `campaignId` (string), `createdAt` (string), `failureReasons` (string), `phoneNumber` (string), `tcrBrandId` (string), `tcrCampaignId` (string), `telnyxCampaignId` (string), `updatedAt` (string)

## Get Single Phone Number Campaign

Retrieve an individual phone number/campaign assignment by `phoneNumber`.

`GET /10dlc/phone_number_campaigns/{phoneNumber}`

```go
	phoneNumberCampaign, err := client.Messaging10dlc.PhoneNumberCampaigns.Get(context.TODO(), "phoneNumber")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", phoneNumberCampaign.CampaignID)
```

Returns: `assignmentStatus` (enum: FAILED_ASSIGNMENT, PENDING_ASSIGNMENT, ASSIGNED, PENDING_UNASSIGNMENT, FAILED_UNASSIGNMENT), `brandId` (string), `campaignId` (string), `createdAt` (string), `failureReasons` (string), `phoneNumber` (string), `tcrBrandId` (string), `tcrCampaignId` (string), `telnyxCampaignId` (string), `updatedAt` (string)

## Create New Phone Number Campaign

`PUT /10dlc/phone_number_campaigns/{phoneNumber}` — Required: `phoneNumber`, `campaignId`

```go
	phoneNumberCampaign, err := client.Messaging10dlc.PhoneNumberCampaigns.Update(
		context.TODO(),
		"phoneNumber",
		telnyx.Messaging10dlcPhoneNumberCampaignUpdateParams{
			PhoneNumberCampaignCreate: telnyx.PhoneNumberCampaignCreateParam{
				CampaignID:  "4b300178-131c-d902-d54e-72d90ba1620j",
				PhoneNumber: "+18005550199",
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", phoneNumberCampaign.CampaignID)
```

Returns: `assignmentStatus` (enum: FAILED_ASSIGNMENT, PENDING_ASSIGNMENT, ASSIGNED, PENDING_UNASSIGNMENT, FAILED_UNASSIGNMENT), `brandId` (string), `campaignId` (string), `createdAt` (string), `failureReasons` (string), `phoneNumber` (string), `tcrBrandId` (string), `tcrCampaignId` (string), `telnyxCampaignId` (string), `updatedAt` (string)

## Delete Phone Number Campaign

This endpoint allows you to remove a campaign assignment from the supplied `phoneNumber`.

`DELETE /10dlc/phone_number_campaigns/{phoneNumber}`

```go
	phoneNumberCampaign, err := client.Messaging10dlc.PhoneNumberCampaigns.Delete(context.TODO(), "phoneNumber")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", phoneNumberCampaign.CampaignID)
```

Returns: `assignmentStatus` (enum: FAILED_ASSIGNMENT, PENDING_ASSIGNMENT, ASSIGNED, PENDING_UNASSIGNMENT, FAILED_UNASSIGNMENT), `brandId` (string), `campaignId` (string), `createdAt` (string), `failureReasons` (string), `phoneNumber` (string), `tcrBrandId` (string), `tcrCampaignId` (string), `telnyxCampaignId` (string), `updatedAt` (string)

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `campaignStatusUpdate` | Campaign Status Update |

### Webhook payload fields

**`campaignStatusUpdate`**

| Field | Type | Description |
|-------|------|-------------|
| `brandId` | string | Brand ID associated with the campaign. |
| `campaignId` | string | The ID of the campaign. |
| `createDate` | string | Unix timestamp when campaign was created. |
| `cspId` | string | Alphanumeric identifier of the CSP associated with this campaign. |
| `isTMobileRegistered` | boolean | Indicates whether the campaign is registered with T-Mobile. |
| `type` | enum: TELNYX_EVENT, REGISTRATION, MNO_REVIEW, TELNYX_REVIEW, NUMBER_POOL_PROVISIONED, NUMBER_POOL_DEPROVISIONED, TCR_EVENT, VERIFIED |  |
| `description` | string | Description of the event. |
| `status` | enum: ACCEPTED, REJECTED, DORMANT, success, failed | The status of the campaign. |
