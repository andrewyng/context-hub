---
name: numbers-services
description: "Configure voicemail, voice channels, and emergency (E911) services for your phone numbers."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,voicemail,e911,emergency"
---

# Telnyx Numbers Services Java SDK Coding Guidelines

You are a Telnyx Numbers Services API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

## Golden Rule: Use the Official SDK

Always use the official `com.telnyx.sdk:telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import com.telnyx.sdk.client.TelnyxClient`
- **Incorrect:** unofficial Java clients or raw HTTP calls

## Installation

```text
<!-- Maven -->
<dependency>
    <groupId>com.telnyx.sdk</groupId>
    <artifactId>telnyx-java</artifactId>
    <version>6.26.0</version>
</dependency>

// Gradle
implementation("com.telnyx.sdk:telnyx-java:6.26.0")
```

## Setup

```java
import com.telnyx.sdk.client.TelnyxClient;
import com.telnyx.sdk.client.okhttp.TelnyxOkHttpClient;

TelnyxClient client = TelnyxOkHttpClient.fromEnv();
```

All examples below assume `client` is already initialized as shown above.

## List your voice channels for non-US zones

Returns the non-US voice channels for your account. voice channels allow you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /channel_zones`

```java
import com.telnyx.sdk.models.channelzones.ChannelZoneListPage;
import com.telnyx.sdk.models.channelzones.ChannelZoneListParams;

ChannelZoneListPage page = client.channelZones().list();
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## Update voice channels for non-US Zones

Update the number of Voice Channels for the Non-US Zones. This allows your account to handle multiple simultaneous inbound calls to Non-US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PUT /channel_zones/{channel_zone_id}` — Required: `channels`

```java
import com.telnyx.sdk.models.channelzones.ChannelZoneUpdateParams;
import com.telnyx.sdk.models.channelzones.ChannelZoneUpdateResponse;

ChannelZoneUpdateParams params = ChannelZoneUpdateParams.builder()
    .channelZoneId("channel_zone_id")
    .channels(0L)
    .build();
ChannelZoneUpdateResponse channelZone = client.channelZones().update(params);
```

Returns: `channels` (int64), `countries` (array[string]), `created_at` (string), `id` (string), `name` (string), `record_type` (enum: channel_zone), `updated_at` (string)

## List dynamic emergency addresses

Returns the dynamic emergency addresses according to filters

`GET /dynamic_emergency_addresses`

```java
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressListPage;
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressListParams;

DynamicEmergencyAddressListPage page = client.dynamicEmergencyAddresses().list();
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Create a dynamic emergency address.

Creates a dynamic emergency address.

`POST /dynamic_emergency_addresses` — Required: `house_number`, `street_name`, `locality`, `administrative_area`, `postal_code`, `country_code`

Optional: `created_at` (string), `extended_address` (string), `house_suffix` (string), `id` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

```java
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddress;
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressCreateParams;
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressCreateResponse;

DynamicEmergencyAddress params = DynamicEmergencyAddress.builder()
    .administrativeArea("TX")
    .countryCode(DynamicEmergencyAddress.CountryCode.US)
    .houseNumber("600")
    .locality("Austin")
    .postalCode("78701")
    .streetName("Congress")
    .build();
DynamicEmergencyAddressCreateResponse dynamicEmergencyAddress = client.dynamicEmergencyAddresses().create(params);
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Get a dynamic emergency address

Returns the dynamic emergency address based on the ID provided

`GET /dynamic_emergency_addresses/{id}`

```java
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressRetrieveParams;
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressRetrieveResponse;

DynamicEmergencyAddressRetrieveResponse dynamicEmergencyAddress = client.dynamicEmergencyAddresses().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## Delete a dynamic emergency address

Deletes the dynamic emergency address based on the ID provided

`DELETE /dynamic_emergency_addresses/{id}`

```java
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressDeleteParams;
import com.telnyx.sdk.models.dynamicemergencyaddresses.DynamicEmergencyAddressDeleteResponse;

DynamicEmergencyAddressDeleteResponse dynamicEmergencyAddress = client.dynamicEmergencyAddresses().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `administrative_area` (string), `country_code` (enum: US, CA, PR), `created_at` (string), `extended_address` (string), `house_number` (string), `house_suffix` (string), `id` (string), `locality` (string), `postal_code` (string), `record_type` (string), `sip_geolocation_id` (string), `status` (enum: pending, activated, rejected), `street_name` (string), `street_post_directional` (string), `street_pre_directional` (string), `street_suffix` (string), `updated_at` (string)

## List dynamic emergency endpoints

Returns the dynamic emergency endpoints according to filters

`GET /dynamic_emergency_endpoints`

```java
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointListPage;
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointListParams;

DynamicEmergencyEndpointListPage page = client.dynamicEmergencyEndpoints().list();
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Create a dynamic emergency endpoint.

Creates a dynamic emergency endpoints.

`POST /dynamic_emergency_endpoints` — Required: `dynamic_emergency_address_id`, `callback_number`, `caller_name`

Optional: `created_at` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

```java
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpoint;
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointCreateParams;
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointCreateResponse;

DynamicEmergencyEndpoint params = DynamicEmergencyEndpoint.builder()
    .callbackNumber("+13125550000")
    .callerName("Jane Doe Desk Phone")
    .dynamicEmergencyAddressId("0ccc7b54-4df3-4bca-a65a-3da1ecc777f0")
    .build();
DynamicEmergencyEndpointCreateResponse dynamicEmergencyEndpoint = client.dynamicEmergencyEndpoints().create(params);
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Get a dynamic emergency endpoint

Returns the dynamic emergency endpoint based on the ID provided

`GET /dynamic_emergency_endpoints/{id}`

```java
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointRetrieveParams;
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointRetrieveResponse;

DynamicEmergencyEndpointRetrieveResponse dynamicEmergencyEndpoint = client.dynamicEmergencyEndpoints().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## Delete a dynamic emergency endpoint

Deletes the dynamic emergency endpoint based on the ID provided

`DELETE /dynamic_emergency_endpoints/{id}`

```java
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointDeleteParams;
import com.telnyx.sdk.models.dynamicemergencyendpoints.DynamicEmergencyEndpointDeleteResponse;

DynamicEmergencyEndpointDeleteResponse dynamicEmergencyEndpoint = client.dynamicEmergencyEndpoints().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `callback_number` (string), `caller_name` (string), `created_at` (string), `dynamic_emergency_address_id` (string), `id` (string), `record_type` (string), `sip_from_id` (string), `status` (enum: pending, activated, rejected), `updated_at` (string)

## List your voice channels for US Zone

Returns the US Zone voice channels for your account. voice channels allows you to use Channel Billing for calls to your Telnyx phone numbers. Please check the Telnyx Support Articles section for full information and examples of how to utilize Channel Billing.

`GET /inbound_channels`

```java
import com.telnyx.sdk.models.inboundchannels.InboundChannelListParams;
import com.telnyx.sdk.models.inboundchannels.InboundChannelListResponse;

InboundChannelListResponse inboundChannels = client.inboundChannels().list();
```

Returns: `channels` (integer), `record_type` (string)

## Update voice channels for US Zone

Update the number of Voice Channels for the US Zone. This allows your account to handle multiple simultaneous inbound calls to US numbers. Use this endpoint to increase or decrease your capacity based on expected call volume.

`PATCH /inbound_channels` — Required: `channels`

```java
import com.telnyx.sdk.models.inboundchannels.InboundChannelUpdateParams;
import com.telnyx.sdk.models.inboundchannels.InboundChannelUpdateResponse;

InboundChannelUpdateParams params = InboundChannelUpdateParams.builder()
    .channels(7L)
    .build();
InboundChannelUpdateResponse inboundChannel = client.inboundChannels().update(params);
```

Returns: `channels` (integer), `record_type` (string)

## List All Numbers using Channel Billing

Retrieve a list of all phone numbers using Channel Billing, grouped by Zone.

`GET /list`

```java
import com.telnyx.sdk.models.list.ListRetrieveAllParams;
import com.telnyx.sdk.models.list.ListRetrieveAllResponse;

ListRetrieveAllResponse response = client.list().retrieveAll();
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## List Numbers using Channel Billing for a specific Zone

Retrieve a list of phone numbers using Channel Billing for a specific Zone.

`GET /list/{channel_zone_id}`

```java
import com.telnyx.sdk.models.list.ListRetrieveByZoneParams;
import com.telnyx.sdk.models.list.ListRetrieveByZoneResponse;

ListRetrieveByZoneResponse response = client.list().retrieveByZone("channel_zone_id");
```

Returns: `number_of_channels` (integer), `numbers` (array[object]), `zone_id` (string), `zone_name` (string)

## Get voicemail

Returns the voicemail settings for a phone number

`GET /phone_numbers/{phone_number_id}/voicemail`

```java
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailRetrieveResponse;

VoicemailRetrieveResponse voicemail = client.phoneNumbers().voicemail().retrieve("123455678900");
```

Returns: `enabled` (boolean), `pin` (string)

## Create voicemail

Create voicemail settings for a phone number

`POST /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```java
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailCreateParams;
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailCreateResponse;
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailRequest;

VoicemailCreateParams params = VoicemailCreateParams.builder()
    .phoneNumberId("123455678900")
    .voicemailRequest(VoicemailRequest.builder().build())
    .build();
VoicemailCreateResponse voicemail = client.phoneNumbers().voicemail().create(params);
```

Returns: `enabled` (boolean), `pin` (string)

## Update voicemail

Update voicemail settings for a phone number

`PATCH /phone_numbers/{phone_number_id}/voicemail`

Optional: `enabled` (boolean), `pin` (string)

```java
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailRequest;
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailUpdateParams;
import com.telnyx.sdk.models.phonenumbers.voicemail.VoicemailUpdateResponse;

VoicemailUpdateParams params = VoicemailUpdateParams.builder()
    .phoneNumberId("123455678900")
    .voicemailRequest(VoicemailRequest.builder().build())
    .build();
VoicemailUpdateResponse voicemail = client.phoneNumbers().voicemail().update(params);
```

Returns: `enabled` (boolean), `pin` (string)
