---
name: numbers-services
description: "Configure voicemail, voice channels, and emergency (E911) services for your phone numbers."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,voicemail,e911,emergency"
---

# Telnyx Numbers Services Go SDK Coding Guidelines

You are a Telnyx Numbers Services API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## List your voice channels for non-US zones

Returns the non-US voice channels for your account. voice channels allow you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /channel_zones`

```go
	page, err := client.ChannelZones.List(context.TODO(), telnyx.ChannelZoneListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## Update voice channels for non-US Zones

Update the number of Voice Channels for the Non-US Zones. This allows your account to handle multiple simultaneous inbound calls to Non-US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PUT /channel_zones/{channel_zone_id}` — Required: `channels`

```go
	channelZone, err := client.ChannelZones.Update(
		context.TODO(),
		"channel_zone_id",
		telnyx.ChannelZoneUpdateParams{
			Channels: 0,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", channelZone.ID)
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## List dynamic emergency addresses

Returns the dynamic emergency addresses according to filters

`GET /dynamic_emergency_addresses`

```go
	page, err := client.DynamicEmergencyAddresses.List(context.TODO(), telnyx.DynamicEmergencyAddressListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Create a dynamic emergency address.

Creates a dynamic emergency address.

`POST /dynamic_emergency_addresses` — Required: `house_number`, `street_name`, `locality`, `administrative_area`, `postal_code`, `country_code`

Optional: `created_at` (string), `extended_address` (string), `house_suffix` (string), `id` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

```go
	dynamicEmergencyAddress, err := client.DynamicEmergencyAddresses.New(context.TODO(), telnyx.DynamicEmergencyAddressNewParams{
		DynamicEmergencyAddress: telnyx.DynamicEmergencyAddressParam{
			AdministrativeArea: "TX",
			CountryCode:        telnyx.DynamicEmergencyAddressCountryCodeUs,
			HouseNumber:        "600",
			Locality:           "Austin",
			PostalCode:         "78701",
			StreetName:         "Congress",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyAddress.Data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Get a dynamic emergency address

Returns the dynamic emergency address based on the ID provided

`GET /dynamic_emergency_addresses/{id}`

```go
	dynamicEmergencyAddress, err := client.DynamicEmergencyAddresses.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyAddress.Data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Delete a dynamic emergency address

Deletes the dynamic emergency address based on the ID provided

`DELETE /dynamic_emergency_addresses/{id}`

```go
	dynamicEmergencyAddress, err := client.DynamicEmergencyAddresses.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyAddress.Data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## List dynamic emergency endpoints

Returns the dynamic emergency endpoints according to filters

`GET /dynamic_emergency_endpoints`

```go
	page, err := client.DynamicEmergencyEndpoints.List(context.TODO(), telnyx.DynamicEmergencyEndpointListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Create a dynamic emergency endpoint.

Creates a dynamic emergency endpoints.

`POST /dynamic_emergency_endpoints` — Required: `dynamic_emergency_address_id`, `callback_number`, `caller_name`

Optional: `created_at` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

```go
	dynamicEmergencyEndpoint, err := client.DynamicEmergencyEndpoints.New(context.TODO(), telnyx.DynamicEmergencyEndpointNewParams{
		DynamicEmergencyEndpoint: telnyx.DynamicEmergencyEndpointParam{
			CallbackNumber:            "+13125550000",
			CallerName:                "Jane Doe Desk Phone",
			DynamicEmergencyAddressID: "0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyEndpoint.Data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Get a dynamic emergency endpoint

Returns the dynamic emergency endpoint based on the ID provided

`GET /dynamic_emergency_endpoints/{id}`

```go
	dynamicEmergencyEndpoint, err := client.DynamicEmergencyEndpoints.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyEndpoint.Data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Delete a dynamic emergency endpoint

Deletes the dynamic emergency endpoint based on the ID provided

`DELETE /dynamic_emergency_endpoints/{id}`

```go
	dynamicEmergencyEndpoint, err := client.DynamicEmergencyEndpoints.Delete(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", dynamicEmergencyEndpoint.Data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## List your voice channels for US Zone

Returns the US Zone voice channels for your account. voice channels allows you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /inbound_channels`

```go
	inboundChannels, err := client.InboundChannels.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", inboundChannels.Data)
```

Returns: `channels` (integer), `record_type` (string)

## Update voice channels for US Zone

Update the number of Voice Channels for the US Zone. This allows your account to handle multiple simultaneous inbound calls to US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PATCH /inbound_channels` — Required: `channels`

```go
	inboundChannel, err := client.InboundChannels.Update(context.TODO(), telnyx.InboundChannelUpdateParams{
		Channels: 7,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", inboundChannel.Data)
```

Returns: `channels` (integer), `record_type` (string)

## List All Numbers using Channel Billing

Retrieve a list of all phone numbers using Channel Billing, grouped by Zone.

`GET /list`

```go
	response, err := client.List.GetAll(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## List Numbers using Channel Billing for a specific Zone

Retrieve a list of phone numbers using Channel Billing for a specific Zone.

`GET /list/{channel_zone_id}`

```go
	response, err := client.List.GetByZone(context.TODO(), "channel_zone_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## Get voicemail

Returns the voicemail settings for a phone number

`GET /phone_numbers/{phone_number_id}/voicemail`

```go
	voicemail, err := client.PhoneNumbers.Voicemail.Get(context.TODO(), "123455678900")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voicemail.Data)
```

Returns: `enabled` (boolean), `pin` (string)

## Create voicemail

Create voicemail settings for a phone number

`POST /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```go
	voicemail, err := client.PhoneNumbers.Voicemail.New(
		context.TODO(),
		"123455678900",
		telnyx.PhoneNumberVoicemailNewParams{
			VoicemailRequest: telnyx.VoicemailRequestParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voicemail.Data)
```

Returns: `enabled` (boolean), `pin` (string)

## Update voicemail

Update voicemail settings for a phone number

`PATCH /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```go
	voicemail, err := client.PhoneNumbers.Voicemail.Update(
		context.TODO(),
		"123455678900",
		telnyx.PhoneNumberVoicemailUpdateParams{
			VoicemailRequest: telnyx.VoicemailRequestParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", voicemail.Data)
```

Returns: `enabled` (boolean), `pin` (string)
