---
name: account-access
description: "Configure account addresses, authentication providers, IP access controls, billing groups, and integration secrets."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,addresses,ip-access,authentication"
---

# Telnyx Account Access Go SDK Coding Guidelines

You are a Telnyx Account Access API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## List all Access IP Addresses

`GET /access_ip_address`

```go
	page, err := client.AccessIPAddress.List(context.TODO(), telnyx.AccessIPAddressListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Create new Access IP Address

`POST /access_ip_address` — Required: `ip_address`

Optional: `description` (string)

```go
	accessIPAddressResponse, err := client.AccessIPAddress.New(context.TODO(), telnyx.AccessIPAddressNewParams{
		IPAddress: "ip_address",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", accessIPAddressResponse.ID)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Retrieve an access IP address

`GET /access_ip_address/{access_ip_address_id}`

```go
	accessIPAddressResponse, err := client.AccessIPAddress.Get(context.TODO(), "access_ip_address_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", accessIPAddressResponse.ID)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## Delete access IP address

`DELETE /access_ip_address/{access_ip_address_id}`

```go
	accessIPAddressResponse, err := client.AccessIPAddress.Delete(context.TODO(), "access_ip_address_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", accessIPAddressResponse.ID)
```

Returns: `created_at` (date-time), `description` (string), `id` (string), `ip_address` (string), `source` (string), `status` (enum: pending, added), `updated_at` (date-time), `user_id` (string)

## List all addresses

Returns a list of your addresses.

`GET /addresses`

```go
	page, err := client.Addresses.List(context.TODO(), telnyx.AddressListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Creates an address

Creates an address.

`POST /addresses` — Required: `first_name`, `last_name`, `business_name`, `street_address`, `locality`, `country_code`

Optional: `address_book` (boolean), `administrative_area` (string), `borough` (string), `customer_reference` (string), `extended_address` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `validate_address` (boolean)

```go
	address, err := client.Addresses.New(context.TODO(), telnyx.AddressNewParams{
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
	fmt.Printf("%+v\n", address.Data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Validate an address

Validates an address for emergency services.

`POST /addresses/actions/validate` — Required: `country_code`, `street_address`, `postal_code`

Optional: `administrative_area` (string), `extended_address` (string), `locality` (string)

```go
	response, err := client.Addresses.Actions.Validate(context.TODO(), telnyx.AddressActionValidateParams{
		CountryCode:   "US",
		PostalCode:    "78701",
		StreetAddress: "600 Congress Avenue",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `errors` (array[object]), `record_type` (string), `result` (enum: valid, invalid), `suggested` (object)

## Retrieve an address

Retrieves the details of an existing address.

`GET /addresses/{id}`

```go
	address, err := client.Addresses.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", address.Data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Deletes an address

Deletes an existing address.

`DELETE /addresses/{id}`

```go
	address, err := client.Addresses.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", address.Data)
```

Returns: `address_book` (boolean), `administrative_area` (string), `borough` (string), `business_name` (string), `country_code` (string), `created_at` (string), `customer_reference` (string), `extended_address` (string), `first_name` (string), `id` (string), `last_name` (string), `locality` (string), `neighborhood` (string), `phone_number` (string), `postal_code` (string), `record_type` (string), `street_address` (string), `updated_at` (string), `validate_address` (boolean)

## Accepts this address suggestion as a new emergency address for Operator Connect and finishes the uploads of the numbers associated with it to Microsoft.

`POST /addresses/{id}/actions/accept_suggestions`

Optional: `id` (string)

```go
	response, err := client.Addresses.Actions.AcceptSuggestions(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AddressActionAcceptSuggestionsParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `accepted` (boolean), `id` (uuid), `record_type` (enum: address_suggestion)

## List all SSO authentication providers

Returns a list of your SSO authentication providers.

`GET /authentication_providers`

```go
	page, err := client.AuthenticationProviders.List(context.TODO(), telnyx.AuthenticationProviderListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Creates an authentication provider

Creates an authentication provider.

`POST /authentication_providers` — Required: `name`, `short_name`, `settings`

Optional: `active` (boolean), `settings_url` (uri)

```go
	authenticationProvider, err := client.AuthenticationProviders.New(context.TODO(), telnyx.AuthenticationProviderNewParams{
		Name: "Okta",
		Settings: telnyx.SettingsParam{
			IdpCertFingerprint: "13:38:C7:BB:C9:FF:4A:70:38:3A:E3:D9:5C:CD:DB:2E:50:1E:80:A7",
			IdpEntityID:        "https://myorg.myidp.com/saml/metadata",
			IdpSSOTargetURL:    "https://myorg.myidp.com/trust/saml2/http-post/sso",
		},
		ShortName: "myorg",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", authenticationProvider.Data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Retrieve an authentication provider

Retrieves the details of an existing authentication provider.

`GET /authentication_providers/{id}`

```go
	authenticationProvider, err := client.AuthenticationProviders.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", authenticationProvider.Data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Update an authentication provider

Updates settings of an existing authentication provider.

`PATCH /authentication_providers/{id}`

Optional: `active` (boolean), `name` (string), `settings` (object), `settings_url` (uri), `short_name` (string)

```go
	authenticationProvider, err := client.AuthenticationProviders.Update(
		context.TODO(),
		"id",
		telnyx.AuthenticationProviderUpdateParams{
			Active: telnyx.Bool(true),
			Name:   telnyx.String("Okta"),
			Settings: telnyx.SettingsParam{
				IdpEntityID:                 "https://myorg.myidp.com/saml/metadata",
				IdpSSOTargetURL:             "https://myorg.myidp.com/trust/saml2/http-post/sso",
				IdpCertFingerprint:          "13:38:C7:BB:C9:FF:4A:70:38:3A:E3:D9:5C:CD:DB:2E:50:1E:80:A7",
				IdpCertFingerprintAlgorithm: telnyx.SettingsIdpCertFingerprintAlgorithmSha1,
			},
			ShortName: telnyx.String("myorg"),
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", authenticationProvider.Data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## Deletes an authentication provider

Deletes an existing authentication provider.

`DELETE /authentication_providers/{id}`

```go
	authenticationProvider, err := client.AuthenticationProviders.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", authenticationProvider.Data)
```

Returns: `activated_at` (date-time), `active` (boolean), `created_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (string), `settings` (object), `short_name` (string), `updated_at` (date-time)

## List all billing groups

`GET /billing_groups`

```go
	page, err := client.BillingGroups.List(context.TODO(), telnyx.BillingGroupListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Create a billing group

`POST /billing_groups`

Optional: `name` (string)

```go
	billingGroup, err := client.BillingGroups.New(context.TODO(), telnyx.BillingGroupNewParams{
		Name: telnyx.String("string"),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", billingGroup.Data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Get a billing group

`GET /billing_groups/{id}`

```go
	billingGroup, err := client.BillingGroups.Get(context.TODO(), "f5586561-8ff0-4291-a0ac-84fe544797bd")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", billingGroup.Data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Update a billing group

`PATCH /billing_groups/{id}`

Optional: `name` (string)

```go
	billingGroup, err := client.BillingGroups.Update(
		context.TODO(),
		"f5586561-8ff0-4291-a0ac-84fe544797bd",
		telnyx.BillingGroupUpdateParams{
			Name: telnyx.String("string"),
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", billingGroup.Data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## Delete a billing group

`DELETE /billing_groups/{id}`

```go
	billingGroup, err := client.BillingGroups.Delete(context.TODO(), "f5586561-8ff0-4291-a0ac-84fe544797bd")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", billingGroup.Data)
```

Returns: `created_at` (date-time), `deleted_at` (date-time), `id` (uuid), `name` (string), `organization_id` (uuid), `record_type` (enum: billing_group), `updated_at` (date-time)

## List integration secrets

Retrieve a list of all integration secrets configured by the user.

`GET /integration_secrets`

```go
	page, err := client.IntegrationSecrets.List(context.TODO(), telnyx.IntegrationSecretListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `id` (string), `identifier` (string), `record_type` (string), `updated_at` (date-time)

## Create a secret

Create a new secret with an associated identifier that can be used to securely integrate with other services.

`POST /integration_secrets` — Required: `identifier`, `type`

Optional: `password` (string), `token` (string), `username` (string)

```go
	integrationSecret, err := client.IntegrationSecrets.New(context.TODO(), telnyx.IntegrationSecretNewParams{
		Identifier: "my_secret",
		Type:       telnyx.IntegrationSecretNewParamsTypeBearer,
		Token:      telnyx.String("my_secret_value"),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", integrationSecret.Data)
```

Returns: `created_at` (date-time), `id` (string), `identifier` (string), `record_type` (string), `updated_at` (date-time)

## Delete an integration secret

Delete an integration secret given its ID.

`DELETE /integration_secrets/{id}`

```go
	err := client.IntegrationSecrets.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
```

## Create an Access Token.

Create an Access Token (JWT) for the credential.

`POST /telephony_credentials/{id}/token`

```go
	response, err := client.TelephonyCredentials.NewToken(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```
