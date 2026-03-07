---
name: numbers-config
description: "Configure phone number settings including caller ID, call forwarding, messaging enablement, and connection assignments."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,configuration,caller-id,forwarding"
---

# Telnyx Numbers Config Java SDK Coding Guidelines

You are a Telnyx Numbers Config API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## Bulk update phone number profiles

`POST /messaging_numbers_bulk_updates` — Required: `messaging_profile_id`, `numbers`

Optional: `assign_only` (boolean)

```java
import com.telnyx.sdk.models.messagingnumbersbulkupdates.MessagingNumbersBulkUpdateCreateParams;
import com.telnyx.sdk.models.messagingnumbersbulkupdates.MessagingNumbersBulkUpdateCreateResponse;
import java.util.List;

MessagingNumbersBulkUpdateCreateParams params = MessagingNumbersBulkUpdateCreateParams.builder()
    .messagingProfileId("00000000-0000-0000-0000-000000000000")
    .numbers(List.of(
      "+18880000000",
      "+18880000001",
      "+18880000002"
    ))
    .build();
MessagingNumbersBulkUpdateCreateResponse messagingNumbersBulkUpdate = client.messagingNumbersBulkUpdates().create(params);
```

Returns: `failed` (array[string]), `order_id` (uuid), `pending` (array[string]), `record_type` (enum: messaging_numbers_bulk_update), `success` (array[string])

## Retrieve bulk update status

`GET /messaging_numbers_bulk_updates/{order_id}`

```java
import com.telnyx.sdk.models.messagingnumbersbulkupdates.MessagingNumbersBulkUpdateRetrieveParams;
import com.telnyx.sdk.models.messagingnumbersbulkupdates.MessagingNumbersBulkUpdateRetrieveResponse;

MessagingNumbersBulkUpdateRetrieveResponse messagingNumbersBulkUpdate = client.messagingNumbersBulkUpdates().retrieve("order_id");
```

Returns: `failed` (array[string]), `order_id` (uuid), `pending` (array[string]), `record_type` (enum: messaging_numbers_bulk_update), `success` (array[string])

## List mobile phone numbers with messaging settings

`GET /mobile_phone_numbers/messaging`

```java
import com.telnyx.sdk.models.mobilephonenumbers.messaging.MessagingListPage;
import com.telnyx.sdk.models.mobilephonenumbers.messaging.MessagingListParams;

MessagingListPage page = client.mobilePhoneNumbers().messaging().list();
```

Returns: `country_code` (string), `created_at` (date-time), `features` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: longcode), `updated_at` (date-time)

## Retrieve a mobile phone number with messaging settings

`GET /mobile_phone_numbers/{id}/messaging`

```java
import com.telnyx.sdk.models.mobilephonenumbers.messaging.MessagingRetrieveParams;
import com.telnyx.sdk.models.mobilephonenumbers.messaging.MessagingRetrieveResponse;

MessagingRetrieveResponse messaging = client.mobilePhoneNumbers().messaging().retrieve("id");
```

Returns: `country_code` (string), `created_at` (date-time), `features` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: longcode), `updated_at` (date-time)

## List phone numbers

`GET /phone_numbers`

```java
import com.telnyx.sdk.models.phonenumbers.PhoneNumberListPage;
import com.telnyx.sdk.models.phonenumbers.PhoneNumberListParams;

PhoneNumberListPage page = client.phoneNumbers().list();
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Verify ownership of phone numbers

Verifies ownership of the provided phone numbers and returns a mapping of numbers to their IDs, plus a list of numbers not found in the account.

`POST /phone_numbers/actions/verify_ownership` — Required: `phone_numbers`

```java
import com.telnyx.sdk.models.phonenumbers.actions.ActionVerifyOwnershipParams;
import com.telnyx.sdk.models.phonenumbers.actions.ActionVerifyOwnershipResponse;

ActionVerifyOwnershipParams params = ActionVerifyOwnershipParams.builder()
    .addPhoneNumber("+15551234567")
    .build();
ActionVerifyOwnershipResponse response = client.phoneNumbers().actions().verifyOwnership(params);
```

Returns: `found` (array[object]), `not_found` (array[string]), `record_type` (string)

## Lists the phone numbers jobs

`GET /phone_numbers/jobs`

```java
import com.telnyx.sdk.models.phonenumbers.jobs.JobListPage;
import com.telnyx.sdk.models.phonenumbers.jobs.JobListParams;

JobListPage page = client.phoneNumbers().jobs().list();
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Delete a batch of numbers

Creates a new background job to delete a batch of numbers. At most one thousand numbers can be updated per API call.

`POST /phone_numbers/jobs/delete_phone_numbers` — Required: `phone_numbers`

```java
import com.telnyx.sdk.models.phonenumbers.jobs.JobDeleteBatchParams;
import com.telnyx.sdk.models.phonenumbers.jobs.JobDeleteBatchResponse;
import java.util.List;

JobDeleteBatchParams params = JobDeleteBatchParams.builder()
    .phoneNumbers(List.of(
      "+19705555098",
      "+19715555098",
      "32873127836"
    ))
    .build();
JobDeleteBatchResponse response = client.phoneNumbers().jobs().deleteBatch(params);
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Update the emergency settings from a batch of numbers

Creates a background job to update the emergency settings of a collection of phone numbers. At most one thousand numbers can be updated per API call.

`POST /phone_numbers/jobs/update_emergency_settings` — Required: `emergency_enabled`, `phone_numbers`

Optional: `emergency_address_id` (string | null)

```java
import com.telnyx.sdk.models.phonenumbers.jobs.JobUpdateEmergencySettingsBatchParams;
import com.telnyx.sdk.models.phonenumbers.jobs.JobUpdateEmergencySettingsBatchResponse;
import java.util.List;

JobUpdateEmergencySettingsBatchParams params = JobUpdateEmergencySettingsBatchParams.builder()
    .emergencyEnabled(true)
    .phoneNumbers(List.of(
      "+19705555098",
      "+19715555098",
      "32873127836"
    ))
    .build();
JobUpdateEmergencySettingsBatchResponse response = client.phoneNumbers().jobs().updateEmergencySettingsBatch(params);
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Update a batch of numbers

Creates a new background job to update a batch of numbers. At most one thousand numbers can be updated per API call. At least one of the updateable fields must be submitted.

`POST /phone_numbers/jobs/update_phone_numbers` — Required: `phone_numbers`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `deletion_lock_enabled` (boolean), `external_pin` (string), `hd_voice_enabled` (boolean), `tags` (array[string]), `voice` (object)

```java
import com.telnyx.sdk.models.phonenumbers.jobs.JobUpdateBatchParams;
import com.telnyx.sdk.models.phonenumbers.jobs.JobUpdateBatchResponse;

JobUpdateBatchParams params = JobUpdateBatchParams.builder()
    .addPhoneNumber("1583466971586889004")
    .addPhoneNumber("+13127367254")
    .build();
JobUpdateBatchResponse response = client.phoneNumbers().jobs().updateBatch(params);
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## Retrieve a phone numbers job

`GET /phone_numbers/jobs/{id}`

```java
import com.telnyx.sdk.models.phonenumbers.jobs.JobRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.jobs.JobRetrieveResponse;

JobRetrieveResponse job = client.phoneNumbers().jobs().retrieve("id");
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `pending_operations` (array[object]), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, in_progress, completed, failed, expired), `successful_operations` (array[object]), `type` (enum: update_emergency_settings, delete_phone_numbers, update_phone_numbers), `updated_at` (string)

## List phone numbers with messaging settings

`GET /phone_numbers/messaging`

```java
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingListPage;
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingListParams;

MessagingListPage page = client.phoneNumbers().messaging().list();
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Slim List phone numbers

List phone numbers, This endpoint is a lighter version of the /phone_numbers endpoint having higher performance and rate limit.

`GET /phone_numbers/slim`

```java
import com.telnyx.sdk.models.phonenumbers.PhoneNumberSlimListPage;
import com.telnyx.sdk.models.phonenumbers.PhoneNumberSlimListParams;

PhoneNumberSlimListPage page = client.phoneNumbers().slimList();
```

Returns: `billing_group_id` (string), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string), `country_iso_alpha2` (string), `created_at` (string), `customer_reference` (string), `emergency_address_id` (string), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `updated_at` (string)

## List phone numbers with voice settings

`GET /phone_numbers/voice`

```java
import com.telnyx.sdk.models.phonenumbers.voice.VoiceListPage;
import com.telnyx.sdk.models.phonenumbers.voice.VoiceListParams;

VoiceListPage page = client.phoneNumbers().voice().list();
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Retrieve a phone number

`GET /phone_numbers/{id}`

```java
import com.telnyx.sdk.models.phonenumbers.PhoneNumberRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.PhoneNumberRetrieveResponse;

PhoneNumberRetrieveResponse phoneNumber = client.phoneNumbers().retrieve("1293384261075731499");
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Update a phone number

`PATCH /phone_numbers/{id}`

Optional: `address_id` (string), `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `tags` (array[string])

```java
import com.telnyx.sdk.models.phonenumbers.PhoneNumberUpdateParams;
import com.telnyx.sdk.models.phonenumbers.PhoneNumberUpdateResponse;

PhoneNumberUpdateResponse phoneNumber = client.phoneNumbers().update("1293384261075731499");
```

Returns: `billing_group_id` (string | null), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string | null), `connection_name` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `deletion_lock_enabled` (boolean), `emergency_address_id` (string | null), `emergency_enabled` (boolean), `emergency_status` (enum: active, deprovisioning, disabled, provisioning, provisioning-failed), `external_pin` (string | null), `hd_voice_enabled` (boolean), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `messaging_profile_id` (string | null), `messaging_profile_name` (string | null), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline, tollfree, shortcode, longcode), `purchased_at` (string), `record_type` (string), `source_type` (object), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending, requirement-info-pending, requirement-info-under-review, requirement-info-exception, provision-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Delete a phone number

`DELETE /phone_numbers/{id}`

```java
import com.telnyx.sdk.models.phonenumbers.PhoneNumberDeleteParams;
import com.telnyx.sdk.models.phonenumbers.PhoneNumberDeleteResponse;

PhoneNumberDeleteResponse phoneNumber = client.phoneNumbers().delete("1293384261075731499");
```

Returns: `billing_group_id` (string), `call_forwarding_enabled` (boolean), `call_recording_enabled` (boolean), `caller_id_name_enabled` (boolean), `cnam_listing_enabled` (boolean), `connection_id` (string), `connection_name` (string), `created_at` (string), `customer_reference` (string), `deletion_lock_enabled` (boolean), `emergency_address_id` (string), `emergency_enabled` (boolean), `external_pin` (string), `hd_voice_enabled` (boolean), `id` (string), `messaging_profile_id` (string), `messaging_profile_name` (string), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `purchased_at` (string), `record_type` (string), `status` (enum: purchase-pending, purchase-failed, port-pending, port-failed, active, deleted, emergency-only, ported-out, port-out-pending), `t38_fax_gateway_enabled` (boolean), `tags` (array[string]), `updated_at` (string)

## Change the bundle status for a phone number (set to being in a bundle or remove from a bundle)

`PATCH /phone_numbers/{id}/actions/bundle_status_change` — Required: `bundle_id`

```java
import com.telnyx.sdk.models.phonenumbers.actions.ActionChangeBundleStatusParams;
import com.telnyx.sdk.models.phonenumbers.actions.ActionChangeBundleStatusResponse;

ActionChangeBundleStatusParams params = ActionChangeBundleStatusParams.builder()
    .id("1293384261075731499")
    .bundleId("5194d8fc-87e6-4188-baa9-1c434bbe861b")
    .build();
ActionChangeBundleStatusResponse response = client.phoneNumbers().actions().changeBundleStatus(params);
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Enable emergency for a phone number

`POST /phone_numbers/{id}/actions/enable_emergency` — Required: `emergency_enabled`, `emergency_address_id`

```java
import com.telnyx.sdk.models.phonenumbers.actions.ActionEnableEmergencyParams;
import com.telnyx.sdk.models.phonenumbers.actions.ActionEnableEmergencyResponse;

ActionEnableEmergencyParams params = ActionEnableEmergencyParams.builder()
    .id("1293384261075731499")
    .emergencyAddressId("53829456729313")
    .emergencyEnabled(true)
    .build();
ActionEnableEmergencyResponse response = client.phoneNumbers().actions().enableEmergency(params);
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Retrieve a phone number with messaging settings

`GET /phone_numbers/{id}/messaging`

```java
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingRetrieveResponse;

MessagingRetrieveResponse messaging = client.phoneNumbers().messaging().retrieve("id");
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Update the messaging profile and/or messaging product of a phone number

`PATCH /phone_numbers/{id}/messaging`

Optional: `messaging_product` (string), `messaging_profile_id` (string), `tags` (array[string])

```java
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingUpdateParams;
import com.telnyx.sdk.models.phonenumbers.messaging.MessagingUpdateResponse;

MessagingUpdateResponse messaging = client.phoneNumbers().messaging().update("id");
```

Returns: `country_code` (string), `created_at` (date-time), `eligible_messaging_products` (array[string]), `features` (object), `health` (object), `id` (string), `messaging_product` (string), `messaging_profile_id` (string | null), `organization_id` (string), `phone_number` (string), `record_type` (enum: messaging_phone_number, messaging_settings), `tags` (array[string]), `traffic_type` (string), `type` (enum: long-code, toll-free, short-code, longcode, tollfree, shortcode), `updated_at` (date-time)

## Retrieve a phone number with voice settings

`GET /phone_numbers/{id}/voice`

```java
import com.telnyx.sdk.models.phonenumbers.voice.VoiceRetrieveParams;
import com.telnyx.sdk.models.phonenumbers.voice.VoiceRetrieveResponse;

VoiceRetrieveResponse voice = client.phoneNumbers().voice().retrieve("1293384261075731499");
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## Update a phone number with voice settings

`PATCH /phone_numbers/{id}/voice`

Optional: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

```java
import com.telnyx.sdk.models.phonenumbers.voice.UpdateVoiceSettings;
import com.telnyx.sdk.models.phonenumbers.voice.VoiceUpdateParams;
import com.telnyx.sdk.models.phonenumbers.voice.VoiceUpdateResponse;

VoiceUpdateParams params = VoiceUpdateParams.builder()
    .id("1293384261075731499")
    .updateVoiceSettings(UpdateVoiceSettings.builder().build())
    .build();
VoiceUpdateResponse voice = client.phoneNumbers().voice().update(params);
```

Returns: `call_forwarding` (object), `call_recording` (object), `cnam_listing` (object), `connection_id` (string), `customer_reference` (string), `emergency` (object), `id` (string), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `media_features` (object), `phone_number` (string), `record_type` (string), `tech_prefix_enabled` (boolean), `translated_number` (string), `usage_payment_method` (enum: pay-per-minute, channel)

## List Mobile Phone Numbers

`GET /v2/mobile_phone_numbers`

```java
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberListPage;
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberListParams;

MobilePhoneNumberListPage page = client.mobilePhoneNumbers().list();
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)

## Retrieve a Mobile Phone Number

`GET /v2/mobile_phone_numbers/{id}`

```java
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberRetrieveParams;
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberRetrieveResponse;

MobilePhoneNumberRetrieveResponse mobilePhoneNumber = client.mobilePhoneNumbers().retrieve("id");
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)

## Update a Mobile Phone Number

`PATCH /v2/mobile_phone_numbers/{id}`

Optional: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `customer_reference` (string | null), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `noise_suppression` (boolean), `outbound` (object), `tags` (array[string])

```java
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberUpdateParams;
import com.telnyx.sdk.models.mobilephonenumbers.MobilePhoneNumberUpdateResponse;

MobilePhoneNumberUpdateResponse mobilePhoneNumber = client.mobilePhoneNumbers().update("id");
```

Returns: `call_forwarding` (object), `call_recording` (object), `caller_id_name_enabled` (boolean), `cnam_listing` (object), `connection_id` (string | null), `connection_name` (string | null), `connection_type` (string | null), `country_iso_alpha2` (string), `created_at` (date-time), `customer_reference` (string | null), `id` (string), `inbound` (object), `inbound_call_screening` (enum: disabled, reject_calls, flag_calls), `mobile_voice_enabled` (boolean), `noise_suppression` (enum: inbound, outbound, both, disabled), `outbound` (object), `phone_number` (string), `record_type` (string), `sim_card_id` (uuid), `status` (string), `tags` (array[string]), `updated_at` (date-time)
