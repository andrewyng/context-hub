---
name: webrtc
description: "Manage WebRTC credentials and mobile push notification settings. Use when building browser-based or mobile softphone applications."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,webrtc,browser,softphone,push-notifications"
---

# Telnyx WebRTC Java SDK Coding Guidelines

You are a Telnyx WebRTC API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List mobile push credentials

`GET /mobile_push_credentials`

```java
import com.telnyx.sdk.models.mobilepushcredentials.MobilePushCredentialListPage;
import com.telnyx.sdk.models.mobilepushcredentials.MobilePushCredentialListParams;

MobilePushCredentialListPage page = client.mobilePushCredentials().list();
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Creates a new mobile push credential

`POST /mobile_push_credentials`

```java
import com.telnyx.sdk.models.mobilepushcredentials.MobilePushCredentialCreateParams;
import com.telnyx.sdk.models.mobilepushcredentials.PushCredentialResponse;

MobilePushCredentialCreateParams.CreateMobilePushCredentialRequest.Ios params = MobilePushCredentialCreateParams.CreateMobilePushCredentialRequest.Ios.builder()
    .alias("LucyIosCredential")
    .certificate("-----BEGIN CERTIFICATE----- MIIGVDCCBTKCAQEAsNlRJVZn9ZvXcECQm65czs... -----END CERTIFICATE-----")
    .privateKey("-----BEGIN RSA PRIVATE KEY----- MIIEpQIBAAKCAQEAsNlRJVZn9ZvXcECQm65czs... -----END RSA PRIVATE KEY-----")
    .build();
PushCredentialResponse pushCredentialResponse = client.mobilePushCredentials().create(params);
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Retrieves a mobile push credential

Retrieves mobile push credential based on the given `push_credential_id`

`GET /mobile_push_credentials/{push_credential_id}`

```java
import com.telnyx.sdk.models.mobilepushcredentials.MobilePushCredentialRetrieveParams;
import com.telnyx.sdk.models.mobilepushcredentials.PushCredentialResponse;

PushCredentialResponse pushCredentialResponse = client.mobilePushCredentials().retrieve("0ccc7b76-4df3-4bca-a05a-3da1ecc389f0");
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Deletes a mobile push credential

Deletes a mobile push credential based on the given `push_credential_id`

`DELETE /mobile_push_credentials/{push_credential_id}`

```java
import com.telnyx.sdk.models.mobilepushcredentials.MobilePushCredentialDeleteParams;

client.mobilePushCredentials().delete("0ccc7b76-4df3-4bca-a05a-3da1ecc389f0");
```

## List all credentials

List all On-demand Credentials.

`GET /telephony_credentials`

```java
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialListPage;
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialListParams;

TelephonyCredentialListPage page = client.telephonyCredentials().list();
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Create a credential

Create a credential.

`POST /telephony_credentials` — Required: `connection_id`

Optional: `expires_at` (string), `name` (string), `tag` (string)

```java
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialCreateParams;
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialCreateResponse;

TelephonyCredentialCreateParams params = TelephonyCredentialCreateParams.builder()
    .connectionId("1234567890")
    .build();
TelephonyCredentialCreateResponse telephonyCredential = client.telephonyCredentials().create(params);
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Get a credential

Get the details of an existing On-demand Credential.

`GET /telephony_credentials/{id}`

```java
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialRetrieveParams;
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialRetrieveResponse;

TelephonyCredentialRetrieveResponse telephonyCredential = client.telephonyCredentials().retrieve("id");
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Update a credential

Update an existing credential.

`PATCH /telephony_credentials/{id}`

Optional: `connection_id` (string), `expires_at` (string), `name` (string), `tag` (string)

```java
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialUpdateParams;
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialUpdateResponse;

TelephonyCredentialUpdateResponse telephonyCredential = client.telephonyCredentials().update("id");
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Delete a credential

Delete an existing credential.

`DELETE /telephony_credentials/{id}`

```java
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialDeleteParams;
import com.telnyx.sdk.models.telephonycredentials.TelephonyCredentialDeleteResponse;

TelephonyCredentialDeleteResponse telephonyCredential = client.telephonyCredentials().delete("id");
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)
