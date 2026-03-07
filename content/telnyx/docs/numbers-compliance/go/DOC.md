---
name: numbers-compliance
description: "Manage regulatory requirements, number bundles, supporting documents, and verified numbers for compliance."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,compliance,regulatory,documents"
---

# Telnyx Numbers Compliance Go SDK Coding Guidelines

You are a Telnyx Numbers Compliance API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## Retrieve Bundles

Get all allowed bundles.

`GET /bundle_pricing/billing_bundles`

```go
	page, err := client.BundlePricing.BillingBundles.List(context.TODO(), telnyx.BundlePricingBillingBundleListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `cost_code` (string), `created_at` (date), `currency` (string), `id` (uuid), `is_public` (boolean), `mrc_price` (float), `name` (string), `slug` (string), `specs` (array[string])

## Get Bundle By Id

Get a single bundle by ID.

`GET /bundle_pricing/billing_bundles/{bundle_id}`

```go
	billingBundle, err := client.BundlePricing.BillingBundles.Get(
		context.TODO(),
		"8661948c-a386-4385-837f-af00f40f111a",
		telnyx.BundlePricingBillingBundleGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", billingBundle.Data)
```

Returns: `active` (boolean), `bundle_limits` (array[object]), `cost_code` (string), `created_at` (date), `id` (uuid), `is_public` (boolean), `name` (string), `slug` (string)

## Get User Bundles

Get a paginated list of user bundles.

`GET /bundle_pricing/user_bundles`

```go
	page, err := client.BundlePricing.UserBundles.List(context.TODO(), telnyx.BundlePricingUserBundleListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Create User Bundles

Creates multiple user bundles for the user.

`POST /bundle_pricing/user_bundles/bulk`

Optional: `idempotency_key` (uuid), `items` (array[object])

```go
	userBundle, err := client.BundlePricing.UserBundles.New(context.TODO(), telnyx.BundlePricingUserBundleNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", userBundle.Data)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get Unused User Bundles

Returns all user bundles that aren't in use.

`GET /bundle_pricing/user_bundles/unused`

```go
	response, err := client.BundlePricing.UserBundles.ListUnused(context.TODO(), telnyx.BundlePricingUserBundleListUnusedParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `billing_bundle` (object), `user_bundle_ids` (array[string])

## Get User Bundle by Id

Retrieves a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}`

```go
	userBundle, err := client.BundlePricing.UserBundles.Get(
		context.TODO(),
		"ca1d2263-d1f1-43ac-ba53-248e7a4bb26a",
		telnyx.BundlePricingUserBundleGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", userBundle.Data)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Deactivate User Bundle

Deactivates a user bundle by its ID.

`DELETE /bundle_pricing/user_bundles/{user_bundle_id}`

```go
	response, err := client.BundlePricing.UserBundles.Deactivate(
		context.TODO(),
		"ca1d2263-d1f1-43ac-ba53-248e7a4bb26a",
		telnyx.BundlePricingUserBundleDeactivateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `active` (boolean), `billing_bundle` (object), `created_at` (date), `id` (uuid), `resources` (array[object]), `updated_at` (date), `user_id` (uuid)

## Get User Bundle Resources

Retrieves the resources of a user bundle by its ID.

`GET /bundle_pricing/user_bundles/{user_bundle_id}/resources`

```go
	response, err := client.BundlePricing.UserBundles.ListResources(
		context.TODO(),
		"ca1d2263-d1f1-43ac-ba53-248e7a4bb26a",
		telnyx.BundlePricingUserBundleListResourcesParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (date), `id` (uuid), `resource` (string), `resource_type` (string), `updated_at` (date)

## List all document links

List all documents links ordered by created_at descending.

`GET /document_links`

```go
	page, err := client.DocumentLinks.List(context.TODO(), telnyx.DocumentLinkListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## List all documents

List all documents ordered by created_at descending.

`GET /documents`

```go
	page, err := client.Documents.List(context.TODO(), telnyx.DocumentListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Upload a document

Upload a document.  Uploaded files must be linked to a service within 30 minutes or they will be automatically deleted.

`POST /documents`

Optional: `customer_reference` (string), `file` (byte), `filename` (string), `url` (string)

```go
	response, err := client.Documents.UploadJson(context.TODO(), telnyx.DocumentUploadJsonParams{
		Document: telnyx.DocumentUploadJsonParamsDocument{},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `data` (object)

## Retrieve a document

Retrieve a document.

`GET /documents/{id}`

```go
	document, err := client.Documents.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", document.Data)
```

Returns: `data` (object)

## Update a document

Update a document.

`PATCH /documents/{id}`

```go
	document, err := client.Documents.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.DocumentUpdateParams{
			DocServiceDocument: telnyx.DocServiceDocumentParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", document.Data)
```

Returns: `data` (object)

## Delete a document

Delete a document.  A document can only be deleted if it's not linked to a service. If it is linked to a service, it must be unlinked prior to deleting.

`DELETE /documents/{id}`

```go
	document, err := client.Documents.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", document.Data)
```

Returns: `data` (object)

## Download a document

Download a document.

`GET /documents/{id}/download`

```go
	response, err := client.Documents.Download(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Generate a temporary download link for a document

Generates a temporary pre-signed URL that can be used to download the document directly from the storage backend without authentication.

`GET /documents/{id}/download_link`

```go
	response, err := client.Documents.GenerateDownloadLink(context.TODO(), "550e8400-e29b-41d4-a716-446655440000")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `url` (uri)

## Update requirement group for a phone number order

`POST /number_order_phone_numbers/{id}/requirement_group` — Required: `requirement_group_id`

```go
	response, err := client.NumberOrderPhoneNumbers.UpdateRequirementGroup(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.NumberOrderPhoneNumberUpdateRequirementGroupParams{
			RequirementGroupID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (string), `status` (string), `sub_number_order_id` (uuid)

## Retrieve regulatory requirements for a list of phone numbers

`GET /phone_numbers_regulatory_requirements`

```go
	phoneNumbersRegulatoryRequirement, err := client.PhoneNumbersRegulatoryRequirements.Get(context.TODO(), telnyx.PhoneNumbersRegulatoryRequirementGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", phoneNumbersRegulatoryRequirement.Data)
```

Returns: `phone_number` (string), `phone_number_type` (string), `record_type` (string), `region_information` (array[object]), `regulatory_requirements` (array[object])

## Retrieve regulatory requirements

`GET /regulatory_requirements`

```go
	regulatoryRequirement, err := client.RegulatoryRequirements.Get(context.TODO(), telnyx.RegulatoryRequirementGetParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", regulatoryRequirement.Data)
```

Returns: `action` (string), `country_code` (string), `phone_number_type` (string), `regulatory_requirements` (array[object])

## List requirement groups

`GET /requirement_groups`

```go
	requirementGroups, err := client.RequirementGroups.List(context.TODO(), telnyx.RequirementGroupListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroups)
```

## Create a new requirement group

`POST /requirement_groups` — Required: `country_code`, `phone_number_type`, `action`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```go
	requirementGroup, err := client.RequirementGroups.New(context.TODO(), telnyx.RequirementGroupNewParams{
		Action:          telnyx.RequirementGroupNewParamsActionOrdering,
		CountryCode:     "US",
		PhoneNumberType: telnyx.RequirementGroupNewParamsPhoneNumberTypeLocal,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroup.ID)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Get a single requirement group by ID

`GET /requirement_groups/{id}`

```go
	requirementGroup, err := client.RequirementGroups.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroup.ID)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Update requirement values in requirement group

`PATCH /requirement_groups/{id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```go
	requirementGroup, err := client.RequirementGroups.Update(
		context.TODO(),
		"id",
		telnyx.RequirementGroupUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroup.ID)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Delete a requirement group by ID

`DELETE /requirement_groups/{id}`

```go
	requirementGroup, err := client.RequirementGroups.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroup.ID)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## Submit a Requirement Group for Approval

`POST /requirement_groups/{id}/submit_for_approval`

```go
	requirementGroup, err := client.RequirementGroups.SubmitForApproval(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementGroup.ID)
```

Returns: `action` (string), `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `phone_number_type` (string), `record_type` (string), `regulatory_requirements` (array[object]), `status` (enum: approved, unapproved, pending-approval, declined, expired), `updated_at` (date-time)

## List all requirement types

List all requirement types ordered by created_at descending

`GET /requirement_types`

```go
	requirementTypes, err := client.RequirementTypes.List(context.TODO(), telnyx.RequirementTypeListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementTypes.Data)
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## Retrieve a requirement types

Retrieve a requirement type by id

`GET /requirement_types/{id}`

```go
	requirementType, err := client.RequirementTypes.Get(context.TODO(), "a38c217a-8019-48f8-bff6-0fdd9939075b")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirementType.Data)
```

Returns: `acceptance_criteria` (object), `created_at` (string), `description` (string), `example` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: document, address, textual), `updated_at` (string)

## List all requirements

List all requirements with filtering, sorting, and pagination

`GET /requirements`

```go
	page, err := client.Requirements.List(context.TODO(), telnyx.RequirementListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Retrieve a document requirement

Retrieve a document requirement record

`GET /requirements/{id}`

```go
	requirement, err := client.Requirements.Get(context.TODO(), "a9dad8d5-fdbd-49d7-aa23-39bb08a5ebaa")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", requirement.Data)
```

Returns: `action` (enum: both, branded_calling, ordering, porting), `country_code` (string), `created_at` (string), `id` (uuid), `locality` (string), `phone_number_type` (enum: local, national, toll_free), `record_type` (string), `requirements_types` (array[object]), `updated_at` (string)

## Update requirement group for a sub number order

`POST /sub_number_orders/{id}/requirement_group` — Required: `requirement_group_id`

```go
	response, err := client.SubNumberOrders.UpdateRequirementGroup(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.SubNumberOrderUpdateRequirementGroupParams{
			RequirementGroupID: "a4b201f9-8646-4e54-a7d2-b2e403eeaf8c",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (string), `updated_at` (date-time)

## List all user addresses

Returns a list of your user addresses.

`GET /user_addresses`

```go
	page, err := client.UserAddresses.List(context.TODO(), telnyx.UserAddressListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Creates a user address

Creates a user address.

`POST /user_addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `skip_address_verification` (boolean)

```go
	userAddress, err := client.UserAddresses.New(context.TODO(), telnyx.UserAddressNewParams{
		BusinessName:  "Toy-O'Kon",
		CountryCode:   "US",
		FirstName:     "Alfred",
		LastName:      "Foster",
		Locality:      "Austin",
		StreetAddress: "600 Congress Avenue",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", userAddress.Data)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## Retrieve a user address

Retrieves the details of an existing user address.

`GET /user_addresses/{id}`

```go
	userAddress, err := client.UserAddresses.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", userAddress.Data)
```

Returns: `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (uuid), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string)

## List all Verified Numbers

Gets a paginated list of Verified Numbers.

`GET /verified_numbers`

```go
	page, err := client.VerifiedNumbers.List(context.TODO(), telnyx.VerifiedNumberListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Request phone number verification

Initiates phone number verification procedure. Supports DTMF extension dialing for voice calls to numbers behind IVR systems.

`POST /verified_numbers` — Required: `phone_number`, `verification_method`

Optional: `extension` (string)

```go
	verifiedNumber, err := client.VerifiedNumbers.New(context.TODO(), telnyx.VerifiedNumberNewParams{
		PhoneNumber:        "+15551234567",
		VerificationMethod: telnyx.VerifiedNumberNewParamsVerificationMethodSMS,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifiedNumber.PhoneNumber)
```

Returns: `phone_number` (string), `verification_method` (string)

## Retrieve a verified number

`GET /verified_numbers/{phone_number}`

```go
	verifiedNumberDataWrapper, err := client.VerifiedNumbers.Get(context.TODO(), "+15551234567")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifiedNumberDataWrapper.Data)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Delete a verified number

`DELETE /verified_numbers/{phone_number}`

```go
	verifiedNumberDataWrapper, err := client.VerifiedNumbers.Delete(context.TODO(), "+15551234567")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifiedNumberDataWrapper.Data)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)

## Submit verification code

`POST /verified_numbers/{phone_number}/actions/verify` — Required: `verification_code`

```go
	verifiedNumberDataWrapper, err := client.VerifiedNumbers.Actions.SubmitVerificationCode(
		context.TODO(),
		"+15551234567",
		telnyx.VerifiedNumberActionSubmitVerificationCodeParams{
			VerificationCode: "123456",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", verifiedNumberDataWrapper.Data)
```

Returns: `phone_number` (string), `record_type` (enum: verified_number), `verified_at` (string)
