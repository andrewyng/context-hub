---
name: webrtc
description: "Manage WebRTC credentials and mobile push notification settings. Use when building browser-based or mobile softphone applications."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,webrtc,browser,softphone,push-notifications"
---

# Telnyx WebRTC JavaScript SDK Coding Guidelines

You are a Telnyx WebRTC API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import Telnyx from 'telnyx'`
- **Incorrect:** unofficial or outdated Telnyx packages

## Installation

```bash
npm install telnyx
```

## Setup

```javascript
import Telnyx from 'telnyx';

const client = new Telnyx({
  apiKey: process.env['TELNYX_API_KEY'], // This is the default and can be omitted
});
```

All examples below assume `client` is already initialized as shown above.

## List mobile push credentials

`GET /mobile_push_credentials`

```javascript
// Automatically fetches more pages as needed.
for await (const pushCredential of client.mobilePushCredentials.list()) {
  console.log(pushCredential.id);
}
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Creates a new mobile push credential

`POST /mobile_push_credentials`

```javascript
const pushCredentialResponse = await client.mobilePushCredentials.create({
  createMobilePushCredentialRequest: {
    alias: 'LucyIosCredential',
    certificate:
      '-----BEGIN CERTIFICATE----- MIIGVDCCBTKCAQEAsNlRJVZn9ZvXcECQm65czs... -----END CERTIFICATE-----',
    private_key:
      '-----BEGIN RSA PRIVATE KEY----- MIIEpQIBAAKCAQEAsNlRJVZn9ZvXcECQm65czs... -----END RSA PRIVATE KEY-----',
    type: 'ios',
  },
});

console.log(pushCredentialResponse.data);
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Retrieves a mobile push credential

Retrieves mobile push credential based on the given `push_credential_id`

`GET /mobile_push_credentials/{push_credential_id}`

```javascript
const pushCredentialResponse = await client.mobilePushCredentials.retrieve(
  '0ccc7b76-4df3-4bca-a05a-3da1ecc389f0',
);

console.log(pushCredentialResponse.data);
```

Returns: `alias` (string), `certificate` (string), `created_at` (date-time), `id` (string), `private_key` (string), `project_account_json_file` (object), `record_type` (string), `type` (string), `updated_at` (date-time)

## Deletes a mobile push credential

Deletes a mobile push credential based on the given `push_credential_id`

`DELETE /mobile_push_credentials/{push_credential_id}`

```javascript
await client.mobilePushCredentials.delete('0ccc7b76-4df3-4bca-a05a-3da1ecc389f0');
```

## List all credentials

List all On-demand Credentials.

`GET /telephony_credentials`

```javascript
// Automatically fetches more pages as needed.
for await (const telephonyCredential of client.telephonyCredentials.list()) {
  console.log(telephonyCredential.id);
}
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Create a credential

Create a credential.

`POST /telephony_credentials` — Required: `connection_id`

Optional: `expires_at` (string), `name` (string), `tag` (string)

```javascript
const telephonyCredential = await client.telephonyCredentials.create({
  connection_id: '1234567890',
});

console.log(telephonyCredential.data);
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Get a credential

Get the details of an existing On-demand Credential.

`GET /telephony_credentials/{id}`

```javascript
const telephonyCredential = await client.telephonyCredentials.retrieve('id');

console.log(telephonyCredential.data);
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Update a credential

Update an existing credential.

`PATCH /telephony_credentials/{id}`

Optional: `connection_id` (string), `expires_at` (string), `name` (string), `tag` (string)

```javascript
const telephonyCredential = await client.telephonyCredentials.update('id');

console.log(telephonyCredential.data);
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)

## Delete a credential

Delete an existing credential.

`DELETE /telephony_credentials/{id}`

```javascript
const telephonyCredential = await client.telephonyCredentials.delete('id');

console.log(telephonyCredential.data);
```

Returns: `created_at` (string), `expired` (boolean), `expires_at` (string), `id` (string), `name` (string), `record_type` (string), `resource_id` (string), `sip_password` (string), `sip_username` (string), `updated_at` (string), `user_id` (string)
