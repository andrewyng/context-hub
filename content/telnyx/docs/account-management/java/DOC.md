---
name: account-management
description: "Manage sub-accounts for reseller and enterprise scenarios."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,sub-accounts,reseller,enterprise"
---

# Telnyx Account Management Java SDK Coding Guidelines

You are a Telnyx Account Management API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## Lists accounts managed by the current user.

Lists the accounts managed by the current user. Users need to be explictly approved by Telnyx in order to become manager accounts.

`GET /managed_accounts`

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountListPage;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountListParams;

ManagedAccountListPage page = client.managedAccounts().list();
```

Returns: `api_user` (string), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Create a new managed account.

Create a new managed account owned by the authenticated user. You need to be explictly approved by Telnyx in order to become a manager account.

`POST /managed_accounts` — Required: `business_name`

Optional: `email` (string), `managed_account_allow_custom_pricing` (boolean), `password` (string), `rollup_billing` (boolean)

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountCreateParams;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountCreateResponse;

ManagedAccountCreateParams params = ManagedAccountCreateParams.builder()
    .businessName("Larry's Cat Food Inc")
    .build();
ManagedAccountCreateResponse managedAccount = client.managedAccounts().create(params);
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Display information about allocatable global outbound channels for the current user.

Display information about allocatable global outbound channels for the current user. Only usable by account managers.

`GET /managed_accounts/allocatable_global_outbound_channels`

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountGetAllocatableGlobalOutboundChannelsParams;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountGetAllocatableGlobalOutboundChannelsResponse;

ManagedAccountGetAllocatableGlobalOutboundChannelsResponse response = client.managedAccounts().getAllocatableGlobalOutboundChannels();
```

Returns: `allocatable_global_outbound_channels` (integer), `managed_account_allow_custom_pricing` (boolean), `record_type` (string), `total_global_channels_allocated` (integer)

## Retrieve a managed account

Retrieves the details of a single managed account.

`GET /managed_accounts/{id}`

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountRetrieveParams;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountRetrieveResponse;

ManagedAccountRetrieveResponse managedAccount = client.managedAccounts().retrieve("id");
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Update a managed account

Update a single managed account.

`PATCH /managed_accounts/{id}`

Optional: `managed_account_allow_custom_pricing` (boolean)

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountUpdateParams;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountUpdateResponse;

ManagedAccountUpdateResponse managedAccount = client.managedAccounts().update("id");
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Disables a managed account

Disables a managed account, forbidding it to use Telnyx services, including sending or receiving phone calls and SMS messages. Ongoing phone calls will not be affected. The managed account and its sub-users will no longer be able to log in via the mission control portal.

`POST /managed_accounts/{id}/actions/disable`

```java
import com.telnyx.sdk.models.managedaccounts.actions.ActionDisableParams;
import com.telnyx.sdk.models.managedaccounts.actions.ActionDisableResponse;

ActionDisableResponse response = client.managedAccounts().actions().disable("id");
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Enables a managed account

Enables a managed account and its sub-users to use Telnyx services.

`POST /managed_accounts/{id}/actions/enable`

Optional: `reenable_all_connections` (boolean)

```java
import com.telnyx.sdk.models.managedaccounts.actions.ActionEnableParams;
import com.telnyx.sdk.models.managedaccounts.actions.ActionEnableResponse;

ActionEnableResponse response = client.managedAccounts().actions().enable("id");
```

Returns: `api_key` (string), `api_token` (string), `api_user` (string), `balance` (object), `created_at` (string), `email` (email), `id` (uuid), `managed_account_allow_custom_pricing` (boolean), `manager_account_id` (string), `organization_name` (string), `record_type` (enum: managed_account), `rollup_billing` (boolean), `updated_at` (string)

## Update the amount of allocatable global outbound channels allocated to a specific managed account.

`PATCH /managed_accounts/{id}/update_global_channel_limit`

Optional: `channel_limit` (integer)

```java
import com.telnyx.sdk.models.managedaccounts.ManagedAccountUpdateGlobalChannelLimitParams;
import com.telnyx.sdk.models.managedaccounts.ManagedAccountUpdateGlobalChannelLimitResponse;

ManagedAccountUpdateGlobalChannelLimitResponse response = client.managedAccounts().updateGlobalChannelLimit("id");
```

Returns: `channel_limit` (integer), `email` (string), `id` (string), `manager_account_id` (string), `record_type` (string)

## List organization users

Returns a list of the users in your organization.

`GET /organizations/users`

```java
import com.telnyx.sdk.models.organizations.users.UserListPage;
import com.telnyx.sdk.models.organizations.users.UserListParams;

UserListPage page = client.organizations().users().list();
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Get organization users groups report

Returns a report of all users in your organization with their group memberships. This endpoint returns all users without pagination and always includes group information. The report can be retrieved in JSON or CSV format by sending specific content-type headers.

`GET /organizations/users/users_groups_report`

```java
import com.telnyx.sdk.models.organizations.users.UserGetGroupsReportParams;
import com.telnyx.sdk.models.organizations.users.UserGetGroupsReportResponse;

UserGetGroupsReportResponse response = client.organizations().users().getGroupsReport();
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Get organization user

Returns a user in your organization.

`GET /organizations/users/{id}`

```java
import com.telnyx.sdk.models.organizations.users.UserRetrieveParams;
import com.telnyx.sdk.models.organizations.users.UserRetrieveResponse;

UserRetrieveResponse user = client.organizations().users().retrieve("id");
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)

## Delete organization user

Deletes a user in your organization.

`POST /organizations/users/{id}/actions/remove`

```java
import com.telnyx.sdk.models.organizations.users.actions.ActionRemoveParams;
import com.telnyx.sdk.models.organizations.users.actions.ActionRemoveResponse;

ActionRemoveResponse action = client.organizations().users().actions().remove("id");
```

Returns: `created_at` (string), `email` (email), `groups` (array[object]), `id` (string), `last_sign_in_at` (string | null), `organization_user_bypasses_sso` (boolean), `record_type` (string), `user_status` (enum: enabled, disabled, blocked)
