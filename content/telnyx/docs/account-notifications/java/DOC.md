---
name: account-notifications
description: "Configure notification channels and settings for account alerts and events."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,account,notifications,alerts,channels"
---

# Telnyx Account Notifications Java SDK Coding Guidelines

You are a Telnyx Account Notifications API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List notification channels

List notification channels.

`GET /notification_channels`

```java
import com.telnyx.sdk.models.notificationchannels.NotificationChannelListPage;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelListParams;

NotificationChannelListPage page = client.notificationChannels().list();
```

Returns: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

## Create a notification channel

Create a notification channel.

`POST /notification_channels`

Optional: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.notificationchannels.NotificationChannelCreateParams;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelCreateResponse;

NotificationChannelCreateResponse notificationChannel = client.notificationChannels().create();
```

Returns: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

## Get a notification channel

Get a notification channel.

`GET /notification_channels/{id}`

```java
import com.telnyx.sdk.models.notificationchannels.NotificationChannelRetrieveParams;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelRetrieveResponse;

NotificationChannelRetrieveResponse notificationChannel = client.notificationChannels().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

## Update a notification channel

Update a notification channel.

`PATCH /notification_channels/{id}`

Optional: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.notificationchannels.NotificationChannel;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelUpdateParams;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelUpdateResponse;

NotificationChannelUpdateParams params = NotificationChannelUpdateParams.builder()
    .notificationChannelId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .notificationChannel(NotificationChannel.builder().build())
    .build();
NotificationChannelUpdateResponse notificationChannel = client.notificationChannels().update(params);
```

Returns: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

## Delete a notification channel

Delete a notification channel.

`DELETE /notification_channels/{id}`

```java
import com.telnyx.sdk.models.notificationchannels.NotificationChannelDeleteParams;
import com.telnyx.sdk.models.notificationchannels.NotificationChannelDeleteResponse;

NotificationChannelDeleteResponse notificationChannel = client.notificationChannels().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `channel_destination` (string), `channel_type_id` (enum: sms, voice, email, webhook), `created_at` (date-time), `id` (string), `notification_profile_id` (string), `updated_at` (date-time)

## List all Notifications Events Conditions

Returns a list of your notifications events conditions.

`GET /notification_event_conditions`

```java
import com.telnyx.sdk.models.notificationeventconditions.NotificationEventConditionListPage;
import com.telnyx.sdk.models.notificationeventconditions.NotificationEventConditionListParams;

NotificationEventConditionListPage page = client.notificationEventConditions().list();
```

Returns: `allow_multiple_channels` (boolean), `associated_record_type` (enum: account, phone_number), `asynchronous` (boolean), `created_at` (date-time), `description` (string), `enabled` (boolean), `id` (string), `name` (string), `notification_event_id` (string), `parameters` (array[object]), `supported_channels` (array[string]), `updated_at` (date-time)

## List all Notifications Events

Returns a list of your notifications events.

`GET /notification_events`

```java
import com.telnyx.sdk.models.notificationevents.NotificationEventListPage;
import com.telnyx.sdk.models.notificationevents.NotificationEventListParams;

NotificationEventListPage page = client.notificationEvents().list();
```

Returns: `created_at` (date-time), `enabled` (boolean), `id` (string), `name` (string), `notification_category` (string), `updated_at` (date-time)

## List all Notifications Profiles

Returns a list of your notifications profiles.

`GET /notification_profiles`

```java
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileListPage;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileListParams;

NotificationProfileListPage page = client.notificationProfiles().list();
```

Returns: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

## Create a notification profile

Create a notification profile.

`POST /notification_profiles`

Optional: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileCreateParams;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileCreateResponse;

NotificationProfileCreateResponse notificationProfile = client.notificationProfiles().create();
```

Returns: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

## Get a notification profile

Get a notification profile.

`GET /notification_profiles/{id}`

```java
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileRetrieveParams;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileRetrieveResponse;

NotificationProfileRetrieveResponse notificationProfile = client.notificationProfiles().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

## Update a notification profile

Update a notification profile.

`PATCH /notification_profiles/{id}`

Optional: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.notificationprofiles.NotificationProfile;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileUpdateParams;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileUpdateResponse;

NotificationProfileUpdateParams params = NotificationProfileUpdateParams.builder()
    .notificationProfileId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .notificationProfile(NotificationProfile.builder().build())
    .build();
NotificationProfileUpdateResponse notificationProfile = client.notificationProfiles().update(params);
```

Returns: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

## Delete a notification profile

Delete a notification profile.

`DELETE /notification_profiles/{id}`

```java
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileDeleteParams;
import com.telnyx.sdk.models.notificationprofiles.NotificationProfileDeleteResponse;

NotificationProfileDeleteResponse notificationProfile = client.notificationProfiles().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `id` (string), `name` (string), `updated_at` (date-time)

## List notification settings

List notification settings.

`GET /notification_settings`

```java
import com.telnyx.sdk.models.notificationsettings.NotificationSettingListPage;
import com.telnyx.sdk.models.notificationsettings.NotificationSettingListParams;

NotificationSettingListPage page = client.notificationSettings().list();
```

Returns: `associated_record_type` (string), `associated_record_type_value` (string), `created_at` (date-time), `id` (string), `notification_channel_id` (string), `notification_event_condition_id` (string), `notification_profile_id` (string), `parameters` (array[object]), `status` (enum: enabled, enable-received, enable-pending, enable-submitted, delete-received, delete-pending, delete-submitted, deleted), `updated_at` (date-time)

## Add a Notification Setting

Add a notification setting.

`POST /notification_settings`

Optional: `associated_record_type` (string), `associated_record_type_value` (string), `created_at` (date-time), `id` (string), `notification_channel_id` (string), `notification_event_condition_id` (string), `notification_profile_id` (string), `parameters` (array[object]), `status` (enum: enabled, enable-received, enable-pending, enable-submitted, delete-received, delete-pending, delete-submitted, deleted), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.notificationsettings.NotificationSettingCreateParams;
import com.telnyx.sdk.models.notificationsettings.NotificationSettingCreateResponse;

NotificationSettingCreateResponse notificationSetting = client.notificationSettings().create();
```

Returns: `associated_record_type` (string), `associated_record_type_value` (string), `created_at` (date-time), `id` (string), `notification_channel_id` (string), `notification_event_condition_id` (string), `notification_profile_id` (string), `parameters` (array[object]), `status` (enum: enabled, enable-received, enable-pending, enable-submitted, delete-received, delete-pending, delete-submitted, deleted), `updated_at` (date-time)

## Get a notification setting

Get a notification setting.

`GET /notification_settings/{id}`

```java
import com.telnyx.sdk.models.notificationsettings.NotificationSettingRetrieveParams;
import com.telnyx.sdk.models.notificationsettings.NotificationSettingRetrieveResponse;

NotificationSettingRetrieveResponse notificationSetting = client.notificationSettings().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `associated_record_type` (string), `associated_record_type_value` (string), `created_at` (date-time), `id` (string), `notification_channel_id` (string), `notification_event_condition_id` (string), `notification_profile_id` (string), `parameters` (array[object]), `status` (enum: enabled, enable-received, enable-pending, enable-submitted, delete-received, delete-pending, delete-submitted, deleted), `updated_at` (date-time)

## Delete a notification setting

Delete a notification setting.

`DELETE /notification_settings/{id}`

```java
import com.telnyx.sdk.models.notificationsettings.NotificationSettingDeleteParams;
import com.telnyx.sdk.models.notificationsettings.NotificationSettingDeleteResponse;

NotificationSettingDeleteResponse notificationSetting = client.notificationSettings().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `associated_record_type` (string), `associated_record_type_value` (string), `created_at` (date-time), `id` (string), `notification_channel_id` (string), `notification_event_condition_id` (string), `notification_profile_id` (string), `parameters` (array[object]), `status` (enum: enabled, enable-received, enable-pending, enable-submitted, delete-received, delete-pending, delete-submitted, deleted), `updated_at` (date-time)
