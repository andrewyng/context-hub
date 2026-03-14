---
name: account-management
description: "Manage sub-accounts for reseller and enterprise scenarios."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,sub-accounts,reseller,enterprise"
---

# Telnyx Account Management REST API Coding Guidelines

You are a Telnyx Account Management API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## Lists accounts managed by the current user.

Lists the accounts managed by the current user. Users need to be explictly approved by Telnyx in order to become manager accounts.

`GET /managed_accounts`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/managed_accounts?filter={'email': {'contains': 'john'}, 'organization_name': {'eq': 'Example Company LLC'}}&sort=email&include_cancelled_accounts=True"
```

Returns: `api_user` (string), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Create a new managed account.

Create a new managed account owned by the authenticated user. You need to be explictly approved by Telnyx in order to become a manager account.

`POST /managed_accounts` — Required: `business_name`

Optional: `email` (string), `managed_account_allow_custom_pricing` (boolean), `password` (string), `rollup_billing` (boolean)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "email": "new_managed_account@customer.org",
  "password": "3jVjLq!tMuWKyWx4NN*CvhnB",
  "business_name": "Larry's Cat Food Inc",
  "managed_account_allow_custom_pricing": false,
  "rollup_billing": false
}' \
  "https://api.telnyx.com/v2/managed_accounts"
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Display information about allocatable global outbound channels for the current user.

Display information about allocatable global outbound channels for the current user. Only usable by account managers.

`GET /managed_accounts/allocatable_global_outbound_channels`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/managed_accounts/allocatable_global_outbound_channels"
```

Returns: `allocatable_global_outbound_channels` (integer), `managed_account_allow_custom_pricing` (boolean), `record_type` (string), `total_global_channels_allocated` (integer)

## Retrieve a managed account

Retrieves the details of a single managed account.

`GET /managed_accounts/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/managed_accounts/{id}"
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Update a managed account

Update a single managed account.

`PATCH /managed_accounts/{id}`

Optional: `managed_account_allow_custom_pricing` (boolean)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "managed_account_allow_custom_pricing": false
}' \
  "https://api.telnyx.com/v2/managed_accounts/{id}"
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Disables a managed account

Disables a managed account, forbidding it to use Telnyx services, including sending or receiving phone calls and SMS messages. Ongoing phone calls will not be affected. The managed account and its sub-users will no longer be able to log in via the mission control portal.

`POST /managed_accounts/{id}/actions/disable`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/managed_accounts/{id}/actions/disable"
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Enables a managed account

Enables a managed account and its sub-users to use Telnyx services.

`POST /managed_accounts/{id}/actions/enable`

Optional: `reenable_all_connections` (boolean)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "reenable_all_connections": true
}' \
  "https://api.telnyx.com/v2/managed_accounts/{id}/actions/enable"
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Update the amount of allocatable global outbound channels allocated to a specific managed account.

`PATCH /managed_accounts/{id}/update_global_channel_limit`

Optional: `channel_limit` (integer)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "channel_limit": 30
}' \
  "https://api.telnyx.com/v2/managed_accounts/{id}/update_global_channel_limit"
```

Returns: `channel_limit` (integer), `email` (string), `id` (string), `manager_account_id` (string), `record_type` (string)

## List organization users

Returns a list of the users in your organization.

`GET /organizations/users`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/organizations/users"
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Get organization users groups report

Returns a report of all users in your organization with their group memberships. This endpoint returns all users without pagination and always includes group information. The report can be retrieved in JSON or CSV format by sending specific content-type headers.

`GET /organizations/users/users_groups_report`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/organizations/users/users_groups_report"
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Get organization user

Returns a user in your organization.

`GET /organizations/users/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/organizations/users/{id}"
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Delete organization user

Deletes a user in your organization.

`POST /organizations/users/{id}/actions/remove`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/organizations/users/{id}/actions/remove"
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)
