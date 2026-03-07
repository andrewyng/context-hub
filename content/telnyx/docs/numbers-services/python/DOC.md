---
name: numbers-services
description: "Configure voicemail, voice channels, and emergency (E911) services for your phone numbers."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,voicemail,e911,emergency"
---

# Telnyx Numbers Services Python SDK Coding Guidelines

You are a Telnyx Numbers Services API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List your voice channels for non-US zones

Returns the non-US voice channels for your account. voice channels allow you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /channel_zones`

```python
page = client.channel_zones.list()
page = page.data[0]
print(page.id)
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## Update voice channels for non-US Zones

Update the number of Voice Channels for the Non-US Zones. This allows your account to handle multiple simultaneous inbound calls to Non-US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PUT /channel_zones/{channel_zone_id}` — Required: `channels`

```python
channel_zone = client.channel_zones.update(
    channel_zone_id="channel_zone_id",
    channels=0,
)
print(channel_zone.id)
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## List dynamic emergency addresses

Returns the dynamic emergency addresses according to filters

`GET /dynamic_emergency_addresses`

```python
page = client.dynamic_emergency_addresses.list()
page = page.data[0]
print(page.id)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Create a dynamic emergency address.

Creates a dynamic emergency address.

`POST /dynamic_emergency_addresses` — Required: `house_number`, `street_name`, `locality`, `administrative_area`, `postal_code`, `country_code`

Optional: `created_at` (string), `extended_address` (string), `house_suffix` (string), `id` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

```python
dynamic_emergency_address = client.dynamic_emergency_addresses.create(
    administrative_area="TX",
    country_code="US",
    house_number="600",
    locality="Austin",
    postal_code="78701",
    street_name="Congress",
)
print(dynamic_emergency_address.data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Get a dynamic emergency address

Returns the dynamic emergency address based on the ID provided

`GET /dynamic_emergency_addresses/{id}`

```python
dynamic_emergency_address = client.dynamic_emergency_addresses.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(dynamic_emergency_address.data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Delete a dynamic emergency address

Deletes the dynamic emergency address based on the ID provided

`DELETE /dynamic_emergency_addresses/{id}`

```python
dynamic_emergency_address = client.dynamic_emergency_addresses.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(dynamic_emergency_address.data)
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## List dynamic emergency endpoints

Returns the dynamic emergency endpoints according to filters

`GET /dynamic_emergency_endpoints`

```python
page = client.dynamic_emergency_endpoints.list()
page = page.data[0]
print(page.dynamic_emergency_address_id)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Create a dynamic emergency endpoint.

Creates a dynamic emergency endpoints.

`POST /dynamic_emergency_endpoints` — Required: `dynamic_emergency_address_id`, `callback_number`, `caller_name`

Optional: `created_at` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

```python
dynamic_emergency_endpoint = client.dynamic_emergency_endpoints.create(
    callback_number="+13125550000",
    caller_name="Jane Doe Desk Phone",
    dynamic_emergency_address_id="0ccc7b54-4df3-4bca-a65a-3da1ecc777f0",
)
print(dynamic_emergency_endpoint.data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Get a dynamic emergency endpoint

Returns the dynamic emergency endpoint based on the ID provided

`GET /dynamic_emergency_endpoints/{id}`

```python
dynamic_emergency_endpoint = client.dynamic_emergency_endpoints.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(dynamic_emergency_endpoint.data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Delete a dynamic emergency endpoint

Deletes the dynamic emergency endpoint based on the ID provided

`DELETE /dynamic_emergency_endpoints/{id}`

```python
dynamic_emergency_endpoint = client.dynamic_emergency_endpoints.delete(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(dynamic_emergency_endpoint.data)
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## List your voice channels for US Zone

Returns the US Zone voice channels for your account. voice channels allows you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /inbound_channels`

```python
inbound_channels = client.inbound_channels.list()
print(inbound_channels.data)
```

Returns: `channels` (integer), `record_type` (string)

## Update voice channels for US Zone

Update the number of Voice Channels for the US Zone. This allows your account to handle multiple simultaneous inbound calls to US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PATCH /inbound_channels` — Required: `channels`

```python
inbound_channel = client.inbound_channels.update(
    channels=7,
)
print(inbound_channel.data)
```

Returns: `channels` (integer), `record_type` (string)

## List All Numbers using Channel Billing

Retrieve a list of all phone numbers using Channel Billing, grouped by Zone.

`GET /list`

```python
response = client.list.retrieve_all()
print(response.data)
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## List Numbers using Channel Billing for a specific Zone

Retrieve a list of phone numbers using Channel Billing for a specific Zone.

`GET /list/{channel_zone_id}`

```python
response = client.list.retrieve_by_zone(
    "channel_zone_id",
)
print(response.data)
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## Get voicemail

Returns the voicemail settings for a phone number

`GET /phone_numbers/{phone_number_id}/voicemail`

```python
voicemail = client.phone_numbers.voicemail.retrieve(
    "123455678900",
)
print(voicemail.data)
```

Returns: `enabled` (boolean), `pin` (string)

## Create voicemail

Create voicemail settings for a phone number

`POST /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```python
voicemail = client.phone_numbers.voicemail.create(
    phone_number_id="123455678900",
)
print(voicemail.data)
```

Returns: `enabled` (boolean), `pin` (string)

## Update voicemail

Update voicemail settings for a phone number

`PATCH /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```python
voicemail = client.phone_numbers.voicemail.update(
    phone_number_id="123455678900",
)
print(voicemail.data)
```

Returns: `enabled` (boolean), `pin` (string)
