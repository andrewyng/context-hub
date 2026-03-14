---
name: iot
description: "Manage IoT SIM cards, eSIMs, data plans, and wireless connectivity. Use when building IoT/M2M solutions."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,iot,sim,esim,m2m,wireless"
---

# Telnyx IoT Java SDK Coding Guidelines

You are a Telnyx IoT API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## Purchase eSIMs

Purchases and registers the specified amount of eSIMs to the current user's account.  
If `sim_card_group_id` is provided, the eSIMs will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/purchase/esims` — Required: `amount`

Optional: `product` (string), `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string]), `whitelabel_name` (string)

```java
import com.telnyx.sdk.models.actions.purchase.PurchaseCreateParams;
import com.telnyx.sdk.models.actions.purchase.PurchaseCreateResponse;

PurchaseCreateParams params = PurchaseCreateParams.builder()
    .amount(10L)
    .build();
PurchaseCreateResponse purchase = client.actions().purchase().create(params);
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Register SIM cards

Register the SIM cards associated with the provided registration codes to the current user's account.  
If `sim_card_group_id` is provided, the SIM cards will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/register/sim_cards` — Required: `registration_codes`

Optional: `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string])

```java
import com.telnyx.sdk.models.actions.register.RegisterCreateParams;
import com.telnyx.sdk.models.actions.register.RegisterCreateResponse;
import java.util.List;

RegisterCreateParams params = RegisterCreateParams.builder()
    .registrationCodes(List.of(
      "0000000001",
      "0000000002",
      "0000000003"
    ))
    .build();
RegisterCreateResponse register = client.actions().register().create(params);
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## List bulk SIM card actions

This API lists a paginated collection of bulk SIM card actions. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions`

```java
import com.telnyx.sdk.models.bulksimcardactions.BulkSimCardActionListPage;
import com.telnyx.sdk.models.bulksimcardactions.BulkSimCardActionListParams;

BulkSimCardActionListPage page = client.bulkSimCardActions().list();
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## Get bulk SIM card action details

This API fetches information about a bulk SIM card action. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions/{id}`

```java
import com.telnyx.sdk.models.bulksimcardactions.BulkSimCardActionRetrieveParams;
import com.telnyx.sdk.models.bulksimcardactions.BulkSimCardActionRetrieveResponse;

BulkSimCardActionRetrieveResponse bulkSimCardAction = client.bulkSimCardActions().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## List OTA updates

`GET /ota_updates`

```java
import com.telnyx.sdk.models.otaupdates.OtaUpdateListPage;
import com.telnyx.sdk.models.otaupdates.OtaUpdateListParams;

OtaUpdateListPage page = client.otaUpdates().list();
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## Get OTA update

This API returns the details of an Over the Air (OTA) update.

`GET /ota_updates/{id}`

```java
import com.telnyx.sdk.models.otaupdates.OtaUpdateRetrieveParams;
import com.telnyx.sdk.models.otaupdates.OtaUpdateRetrieveResponse;

OtaUpdateRetrieveResponse otaUpdate = client.otaUpdates().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## List SIM card actions

This API lists a paginated collection of SIM card actions. It enables exploring a collection of existing asynchronous operations using specific filters.

`GET /sim_card_actions`

```java
import com.telnyx.sdk.models.simcards.actions.ActionListPage;
import com.telnyx.sdk.models.simcards.actions.ActionListParams;

ActionListPage page = client.simCards().actions().list();
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get SIM card action details

This API fetches detailed information about a SIM card action to follow-up on an existing asynchronous operation.

`GET /sim_card_actions/{id}`

```java
import com.telnyx.sdk.models.simcards.actions.ActionRetrieveParams;
import com.telnyx.sdk.models.simcards.actions.ActionRetrieveResponse;

ActionRetrieveResponse action = client.simCards().actions().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## List SIM card data usage notifications

Lists a paginated collection of SIM card data usage notifications. It enables exploring the collection using specific filters.

`GET /sim_card_data_usage_notifications`

```java
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationListPage;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationListParams;

SimCardDataUsageNotificationListPage page = client.simCardDataUsageNotifications().list();
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Create a new SIM card data usage notification

Creates a new SIM card data usage notification.

`POST /sim_card_data_usage_notifications` — Required: `sim_card_id`, `threshold`

```java
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationCreateParams;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationCreateResponse;

SimCardDataUsageNotificationCreateParams params = SimCardDataUsageNotificationCreateParams.builder()
    .simCardId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .threshold(SimCardDataUsageNotificationCreateParams.Threshold.builder().build())
    .build();
SimCardDataUsageNotificationCreateResponse simCardDataUsageNotification = client.simCardDataUsageNotifications().create(params);
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Get a single SIM card data usage notification

Get a single SIM Card Data Usage Notification.

`GET /sim_card_data_usage_notifications/{id}`

```java
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationRetrieveParams;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationRetrieveResponse;

SimCardDataUsageNotificationRetrieveResponse simCardDataUsageNotification = client.simCardDataUsageNotifications().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Updates information for a SIM Card Data Usage Notification

Updates information for a SIM Card Data Usage Notification.

`PATCH /sim_card_data_usage_notifications/{id}`

Optional: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

```java
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotification;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationUpdateParams;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationUpdateResponse;

SimCardDataUsageNotificationUpdateParams params = SimCardDataUsageNotificationUpdateParams.builder()
    .simCardDataUsageNotificationId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .simCardDataUsageNotification(SimCardDataUsageNotification.builder().build())
    .build();
SimCardDataUsageNotificationUpdateResponse simCardDataUsageNotification = client.simCardDataUsageNotifications().update(params);
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Delete SIM card data usage notifications

Delete the SIM Card Data Usage Notification.

`DELETE /sim_card_data_usage_notifications/{id}`

```java
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationDeleteParams;
import com.telnyx.sdk.models.simcarddatausagenotifications.SimCardDataUsageNotificationDeleteResponse;

SimCardDataUsageNotificationDeleteResponse simCardDataUsageNotification = client.simCardDataUsageNotifications().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## List SIM card group actions

This API allows listing a paginated collection a SIM card group actions. It allows to explore a collection of existing asynchronous operation using specific filters.

`GET /sim_card_group_actions`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionListPage;
import com.telnyx.sdk.models.simcardgroups.actions.ActionListParams;

ActionListPage page = client.simCardGroups().actions().list();
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get SIM card group action details

This API allows fetching detailed information about a SIM card group action resource to make follow-ups in an existing asynchronous operation.

`GET /sim_card_group_actions/{id}`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionRetrieveParams;
import com.telnyx.sdk.models.simcardgroups.actions.ActionRetrieveResponse;

ActionRetrieveResponse action = client.simCardGroups().actions().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get all SIM card groups

Get all SIM card groups belonging to the user that match the given filters.

`GET /sim_card_groups`

```java
import com.telnyx.sdk.models.simcardgroups.SimCardGroupListPage;
import com.telnyx.sdk.models.simcardgroups.SimCardGroupListParams;

SimCardGroupListPage page = client.simCardGroups().list();
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `sim_card_count` (integer), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Create a SIM card group

Creates a new SIM card group object

`POST /sim_card_groups` — Required: `name`

Optional: `data_limit` (object)

```java
import com.telnyx.sdk.models.simcardgroups.SimCardGroupCreateParams;
import com.telnyx.sdk.models.simcardgroups.SimCardGroupCreateResponse;

SimCardGroupCreateParams params = SimCardGroupCreateParams.builder()
    .name("My Test Group")
    .build();
SimCardGroupCreateResponse simCardGroup = client.simCardGroups().create(params);
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Get SIM card group

Returns the details regarding a specific SIM card group

`GET /sim_card_groups/{id}`

```java
import com.telnyx.sdk.models.simcardgroups.SimCardGroupRetrieveParams;
import com.telnyx.sdk.models.simcardgroups.SimCardGroupRetrieveResponse;

SimCardGroupRetrieveResponse simCardGroup = client.simCardGroups().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Update a SIM card group

Updates a SIM card group

`PATCH /sim_card_groups/{id}`

Optional: `data_limit` (object), `name` (string)

```java
import com.telnyx.sdk.models.simcardgroups.SimCardGroupUpdateParams;
import com.telnyx.sdk.models.simcardgroups.SimCardGroupUpdateResponse;

SimCardGroupUpdateResponse simCardGroup = client.simCardGroups().update("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Delete a SIM card group

Permanently deletes a SIM card group

`DELETE /sim_card_groups/{id}`

```java
import com.telnyx.sdk.models.simcardgroups.SimCardGroupDeleteParams;
import com.telnyx.sdk.models.simcardgroups.SimCardGroupDeleteResponse;

SimCardGroupDeleteResponse simCardGroup = client.simCardGroups().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Request Private Wireless Gateway removal from SIM card group

This action will asynchronously remove an existing Private Wireless Gateway definition from a SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic handled by Telnyx's default mobile network configuration.

`POST /sim_card_groups/{id}/actions/remove_private_wireless_gateway`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionRemovePrivateWirelessGatewayParams;
import com.telnyx.sdk.models.simcardgroups.actions.ActionRemovePrivateWirelessGatewayResponse;

ActionRemovePrivateWirelessGatewayResponse response = client.simCardGroups().actions().removePrivateWirelessGateway("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist removal from SIM card group

This action will asynchronously remove an existing Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/remove_wireless_blocklist`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionRemoveWirelessBlocklistParams;
import com.telnyx.sdk.models.simcardgroups.actions.ActionRemoveWirelessBlocklistResponse;

ActionRemoveWirelessBlocklistResponse response = client.simCardGroups().actions().removeWirelessBlocklist("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Private Wireless Gateway assignment for SIM card group

This action will asynchronously assign a provisioned Private Wireless Gateway to the SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic controlled by the associated Private Wireless Gateway. This operation will also imply that new SIM cards assigned to a group will inherit its network definitions.

`POST /sim_card_groups/{id}/actions/set_private_wireless_gateway` — Required: `private_wireless_gateway_id`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionSetPrivateWirelessGatewayParams;
import com.telnyx.sdk.models.simcardgroups.actions.ActionSetPrivateWirelessGatewayResponse;

ActionSetPrivateWirelessGatewayParams params = ActionSetPrivateWirelessGatewayParams.builder()
    .id("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .privateWirelessGatewayId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .build();
ActionSetPrivateWirelessGatewayResponse response = client.simCardGroups().actions().setPrivateWirelessGateway(params);
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist assignment for SIM card group

This action will asynchronously assign a Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/set_wireless_blocklist` — Required: `wireless_blocklist_id`

```java
import com.telnyx.sdk.models.simcardgroups.actions.ActionSetWirelessBlocklistParams;
import com.telnyx.sdk.models.simcardgroups.actions.ActionSetWirelessBlocklistResponse;

ActionSetWirelessBlocklistParams params = ActionSetWirelessBlocklistParams.builder()
    .id("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .wirelessBlocklistId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .build();
ActionSetWirelessBlocklistResponse response = client.simCardGroups().actions().setWirelessBlocklist(params);
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Preview SIM card orders

Preview SIM card order purchases.

`POST /sim_card_order_preview` — Required: `quantity`, `address_id`

```java
import com.telnyx.sdk.models.simcardorderpreview.SimCardOrderPreviewPreviewParams;
import com.telnyx.sdk.models.simcardorderpreview.SimCardOrderPreviewPreviewResponse;

SimCardOrderPreviewPreviewParams params = SimCardOrderPreviewPreviewParams.builder()
    .addressId("1293384261075731499")
    .quantity(21L)
    .build();
SimCardOrderPreviewPreviewResponse response = client.simCardOrderPreview().preview(params);
```

Returns: `quantity` (integer), `record_type` (string), `shipping_cost` (object), `sim_cards_cost` (object), `total_cost` (object)

## Get all SIM card orders

Get all SIM card orders according to filters.

`GET /sim_card_orders`

```java
import com.telnyx.sdk.models.simcardorders.SimCardOrderListPage;
import com.telnyx.sdk.models.simcardorders.SimCardOrderListParams;

SimCardOrderListPage page = client.simCardOrders().list();
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Create a SIM card order

Creates a new order for SIM cards.

`POST /sim_card_orders` — Required: `address_id`, `quantity`

```java
import com.telnyx.sdk.models.simcardorders.SimCardOrderCreateParams;
import com.telnyx.sdk.models.simcardorders.SimCardOrderCreateResponse;

SimCardOrderCreateParams params = SimCardOrderCreateParams.builder()
    .addressId("1293384261075731499")
    .quantity(23L)
    .build();
SimCardOrderCreateResponse simCardOrder = client.simCardOrders().create(params);
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get a single SIM card order

Get a single SIM card order by its ID.

`GET /sim_card_orders/{id}`

```java
import com.telnyx.sdk.models.simcardorders.SimCardOrderRetrieveParams;
import com.telnyx.sdk.models.simcardorders.SimCardOrderRetrieveResponse;

SimCardOrderRetrieveResponse simCardOrder = client.simCardOrders().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get all SIM cards

Get all SIM cards belonging to the user that match the given filters.

`GET /sim_cards`

```java
import com.telnyx.sdk.models.simcards.SimCardListPage;
import com.telnyx.sdk.models.simcards.SimCardListParams;

SimCardListPage page = client.simCards().list();
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request bulk setting SIM card public IPs.

This API triggers an asynchronous operation to set a public IP for each of the specified SIM cards. 
For each SIM Card a SIM Card Action will be generated. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/actions/bulk_set_public_ips` — Required: `sim_card_ids`

```java
import com.telnyx.sdk.models.simcards.actions.ActionBulkSetPublicIpsParams;
import com.telnyx.sdk.models.simcards.actions.ActionBulkSetPublicIpsResponse;

ActionBulkSetPublicIpsParams params = ActionBulkSetPublicIpsParams.builder()
    .addSimCardId("6b14e151-8493-4fa1-8664-1cc4e6d14158")
    .build();
ActionBulkSetPublicIpsResponse response = client.simCards().actions().bulkSetPublicIps(params);
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `updated_at` (string)

## Validate SIM cards registration codes

It validates whether SIM card registration codes are valid or not.

`POST /sim_cards/actions/validate_registration_codes`

Optional: `registration_codes` (array[string])

```java
import com.telnyx.sdk.models.simcards.actions.ActionValidateRegistrationCodesParams;
import com.telnyx.sdk.models.simcards.actions.ActionValidateRegistrationCodesResponse;

ActionValidateRegistrationCodesResponse response = client.simCards().actions().validateRegistrationCodes();
```

Returns: `invalid_detail` (string | null), `record_type` (string), `registration_code` (string), `valid` (boolean)

## Get SIM card

Returns the details regarding a specific SIM card.

`GET /sim_cards/{id}`

```java
import com.telnyx.sdk.models.simcards.SimCardRetrieveParams;
import com.telnyx.sdk.models.simcards.SimCardRetrieveResponse;

SimCardRetrieveResponse simCard = client.simCards().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Update a SIM card

Updates SIM card data

`PATCH /sim_cards/{id}`

Optional: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

```java
import com.telnyx.sdk.models.simcards.SimCard;
import com.telnyx.sdk.models.simcards.SimCardUpdateParams;
import com.telnyx.sdk.models.simcards.SimCardUpdateResponse;

SimCardUpdateParams params = SimCardUpdateParams.builder()
    .simCardId("6a09cdc3-8948-47f0-aa62-74ac943d6c58")
    .simCard(SimCard.builder().build())
    .build();
SimCardUpdateResponse simCard = client.simCards().update(params);
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Deletes a SIM card

The SIM card will be decommissioned, removed from your account and you will stop being charged. The SIM card won't be able to connect to the network after the deletion is completed, thus making it impossible to consume data. 
Transitioning to the disabled state may take a period of time.

`DELETE /sim_cards/{id}`

```java
import com.telnyx.sdk.models.simcards.SimCardDeleteParams;
import com.telnyx.sdk.models.simcards.SimCardDeleteResponse;

SimCardDeleteResponse simCard = client.simCards().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request a SIM card disable

This API disables a SIM card, disconnecting it from the network and making it impossible to consume data. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the disabled state may take a period of time.

`POST /sim_cards/{id}/actions/disable`

```java
import com.telnyx.sdk.models.simcards.actions.ActionDisableParams;
import com.telnyx.sdk.models.simcards.actions.ActionDisableResponse;

ActionDisableResponse response = client.simCards().actions().disable("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request a SIM card enable

This API enables a SIM card, connecting it to the network and making it possible to consume data. 
To enable a SIM card, it must be associated with a SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the enabled state may take a period of time.

`POST /sim_cards/{id}/actions/enable`

```java
import com.telnyx.sdk.models.simcards.actions.ActionEnableParams;
import com.telnyx.sdk.models.simcards.actions.ActionEnableResponse;

ActionEnableResponse response = client.simCards().actions().enable("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request removing a SIM card public IP

This API removes an existing public IP from a SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/remove_public_ip`

```java
import com.telnyx.sdk.models.simcards.actions.ActionRemovePublicIpParams;
import com.telnyx.sdk.models.simcards.actions.ActionRemovePublicIpResponse;

ActionRemovePublicIpResponse response = client.simCards().actions().removePublicIp("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card public IP

This API makes a SIM card reachable on the public internet by mapping a random public IP to the SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/set_public_ip`

```java
import com.telnyx.sdk.models.simcards.actions.ActionSetPublicIpParams;
import com.telnyx.sdk.models.simcards.actions.ActionSetPublicIpResponse;

ActionSetPublicIpResponse response = client.simCards().actions().setPublicIp("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card to standby

The SIM card will be able to connect to the network once the process to set it to standby has been completed, thus making it possible to consume data. 
To set a SIM card to standby, it must be associated with SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the standby state may take a period of time.

`POST /sim_cards/{id}/actions/set_standby`

```java
import com.telnyx.sdk.models.simcards.actions.ActionSetStandbyParams;
import com.telnyx.sdk.models.simcards.actions.ActionSetStandbyResponse;

ActionSetStandbyResponse response = client.simCards().actions().setStandby("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get activation code for an eSIM

It returns the activation code for an eSIM.  
 This API is only available for eSIMs. If the given SIM is a physical SIM card, or has already been installed, an error will be returned.

`GET /sim_cards/{id}/activation_code`

```java
import com.telnyx.sdk.models.simcards.SimCardGetActivationCodeParams;
import com.telnyx.sdk.models.simcards.SimCardGetActivationCodeResponse;

SimCardGetActivationCodeResponse response = client.simCards().getActivationCode("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `activation_code` (string), `record_type` (string)

## Get SIM card device details

It returns the device details where a SIM card is currently being used.

`GET /sim_cards/{id}/device_details`

```java
import com.telnyx.sdk.models.simcards.SimCardGetDeviceDetailsParams;
import com.telnyx.sdk.models.simcards.SimCardGetDeviceDetailsResponse;

SimCardGetDeviceDetailsResponse response = client.simCards().getDeviceDetails("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `brand_name` (string), `device_type` (string), `imei` (string), `model_name` (string), `operating_system` (string), `record_type` (string)

## Get SIM card public IP definition

It returns the public IP requested for a SIM card.

`GET /sim_cards/{id}/public_ip`

```java
import com.telnyx.sdk.models.simcards.SimCardGetPublicIpParams;
import com.telnyx.sdk.models.simcards.SimCardGetPublicIpResponse;

SimCardGetPublicIpResponse response = client.simCards().getPublicIp("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `ip` (string), `record_type` (string), `region_code` (string), `sim_card_id` (uuid), `type` (enum: ipv4), `updated_at` (string)

## List wireless connectivity logs

This API allows listing a paginated collection of Wireless Connectivity Logs associated with a SIM Card, for troubleshooting purposes.

`GET /sim_cards/{id}/wireless_connectivity_logs`

```java
import com.telnyx.sdk.models.simcards.SimCardListWirelessConnectivityLogsPage;
import com.telnyx.sdk.models.simcards.SimCardListWirelessConnectivityLogsParams;

SimCardListWirelessConnectivityLogsPage page = client.simCards().listWirelessConnectivityLogs("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `apn` (string), `cell_id` (string), `created_at` (string), `id` (integer), `imei` (string), `imsi` (string), `ipv4` (string), `ipv6` (string), `last_seen` (string), `log_type` (enum: registration, data), `mobile_country_code` (string), `mobile_network_code` (string), `radio_access_technology` (string), `record_type` (string), `sim_card_id` (uuid), `start_time` (string), `state` (string), `stop_time` (string)

## List Migration Source coverage

`GET /storage/migration_source_coverage`

```java
import com.telnyx.sdk.models.storage.StorageListMigrationSourceCoverageParams;
import com.telnyx.sdk.models.storage.StorageListMigrationSourceCoverageResponse;

StorageListMigrationSourceCoverageResponse response = client.storage().listMigrationSourceCoverage();
```

Returns: `provider` (enum: aws), `source_region` (string)

## List all Migration Sources

`GET /storage/migration_sources`

```java
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceListParams;
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceListResponse;

MigrationSourceListResponse migrationSources = client.storage().migrationSources().list();
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Create a Migration Source

Create a source from which data can be migrated from.

`POST /storage/migration_sources` — Required: `provider`, `provider_auth`, `bucket_name`

Optional: `id` (string), `source_region` (string)

```java
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceCreateParams;
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceCreateResponse;
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceParams;

MigrationSourceParams params = MigrationSourceParams.builder()
    .bucketName("bucket_name")
    .provider(MigrationSourceParams.Provider.AWS)
    .providerAuth(MigrationSourceParams.ProviderAuth.builder().build())
    .build();
MigrationSourceCreateResponse migrationSource = client.storage().migrationSources().create(params);
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Get a Migration Source

`GET /storage/migration_sources/{id}`

```java
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceRetrieveParams;
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceRetrieveResponse;

MigrationSourceRetrieveResponse migrationSource = client.storage().migrationSources().retrieve("");
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Delete a Migration Source

`DELETE /storage/migration_sources/{id}`

```java
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceDeleteParams;
import com.telnyx.sdk.models.storage.migrationsources.MigrationSourceDeleteResponse;

MigrationSourceDeleteResponse migrationSource = client.storage().migrationSources().delete("");
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## List all Migrations

`GET /storage/migrations`

```java
import com.telnyx.sdk.models.storage.migrations.MigrationListParams;
import com.telnyx.sdk.models.storage.migrations.MigrationListResponse;

MigrationListResponse migrations = client.storage().migrations().list();
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Create a Migration

Initiate a migration of data from an external provider into Telnyx Cloud Storage. Currently, only S3 is supported.

`POST /storage/migrations` — Required: `source_id`, `target_bucket_name`, `target_region`

Optional: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped)

```java
import com.telnyx.sdk.models.storage.migrations.MigrationCreateParams;
import com.telnyx.sdk.models.storage.migrations.MigrationCreateResponse;
import com.telnyx.sdk.models.storage.migrations.MigrationParams;

MigrationParams params = MigrationParams.builder()
    .sourceId("source_id")
    .targetBucketName("target_bucket_name")
    .targetRegion("target_region")
    .build();
MigrationCreateResponse migration = client.storage().migrations().create(params);
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Get a Migration

`GET /storage/migrations/{id}`

```java
import com.telnyx.sdk.models.storage.migrations.MigrationRetrieveParams;
import com.telnyx.sdk.models.storage.migrations.MigrationRetrieveResponse;

MigrationRetrieveResponse migration = client.storage().migrations().retrieve("");
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Stop a Migration

`POST /storage/migrations/{id}/actions/stop`

```java
import com.telnyx.sdk.models.storage.migrations.actions.ActionStopParams;
import com.telnyx.sdk.models.storage.migrations.actions.ActionStopResponse;

ActionStopResponse response = client.storage().migrations().actions().stop("");
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## List Mobile Voice Connections

`GET /v2/mobile_voice_connections`

```java
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionListPage;
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionListParams;

MobileVoiceConnectionListPage page = client.mobileVoiceConnections().list();
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Create a Mobile Voice Connection

`POST /v2/mobile_voice_connections`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

```java
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionCreateParams;
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionCreateResponse;

MobileVoiceConnectionCreateResponse mobileVoiceConnection = client.mobileVoiceConnections().create();
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Retrieve a Mobile Voice Connection

`GET /v2/mobile_voice_connections/{id}`

```java
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionRetrieveParams;
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionRetrieveResponse;

MobileVoiceConnectionRetrieveResponse mobileVoiceConnection = client.mobileVoiceConnections().retrieve("id");
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Update a Mobile Voice Connection

`PATCH /v2/mobile_voice_connections/{id}`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer)

```java
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionUpdateParams;
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionUpdateResponse;

MobileVoiceConnectionUpdateResponse mobileVoiceConnection = client.mobileVoiceConnections().update("id");
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Delete a Mobile Voice Connection

`DELETE /v2/mobile_voice_connections/{id}`

```java
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionDeleteParams;
import com.telnyx.sdk.models.mobilevoiceconnections.MobileVoiceConnectionDeleteResponse;

MobileVoiceConnectionDeleteResponse mobileVoiceConnection = client.mobileVoiceConnections().delete("id");
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Get all wireless regions

Retrieve all wireless regions for the given product.

`GET /wireless/regions`

```java
import com.telnyx.sdk.models.wireless.WirelessRetrieveRegionsParams;
import com.telnyx.sdk.models.wireless.WirelessRetrieveRegionsResponse;

WirelessRetrieveRegionsParams params = WirelessRetrieveRegionsParams.builder()
    .product("public_ips")
    .build();
WirelessRetrieveRegionsResponse response = client.wireless().retrieveRegions(params);
```

Returns: `code` (string), `inserted_at` (date-time), `name` (string), `updated_at` (date-time)

## Get all possible wireless blocklist values

Retrieve all wireless blocklist values for a given blocklist type.

`GET /wireless_blocklist_values`

```java
import com.telnyx.sdk.models.wirelessblocklistvalues.WirelessBlocklistValueListParams;
import com.telnyx.sdk.models.wirelessblocklistvalues.WirelessBlocklistValueListResponse;

WirelessBlocklistValueListParams params = WirelessBlocklistValueListParams.builder()
    .type(WirelessBlocklistValueListParams.Type.COUNTRY)
    .build();
WirelessBlocklistValueListResponse wirelessBlocklistValues = client.wirelessBlocklistValues().list(params);
```

Returns: `data` (object), `meta` (object)

## Get all Wireless Blocklists

Get all Wireless Blocklists belonging to the user.

`GET /wireless_blocklists`

```java
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistListPage;
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistListParams;

WirelessBlocklistListPage page = client.wirelessBlocklists().list();
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Create a Wireless Blocklist

Create a Wireless Blocklist to prevent SIMs from connecting to certain networks.

`POST /wireless_blocklists` — Required: `name`, `type`, `values`

```java
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistCreateParams;
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistCreateResponse;

WirelessBlocklistCreateParams params = WirelessBlocklistCreateParams.builder()
    .name("My Wireless Blocklist")
    .type(WirelessBlocklistCreateParams.Type.COUNTRY)
    .addValue("CA")
    .addValue("US")
    .build();
WirelessBlocklistCreateResponse wirelessBlocklist = client.wirelessBlocklists().create(params);
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Update a Wireless Blocklist

Update a Wireless Blocklist.

`PATCH /wireless_blocklists`

Optional: `name` (string), `type` (enum: country, mcc, plmn), `values` (array[object])

```java
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistUpdateParams;
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistUpdateResponse;

WirelessBlocklistUpdateResponse wirelessBlocklist = client.wirelessBlocklists().update();
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Get a Wireless Blocklist

Retrieve information about a Wireless Blocklist.

`GET /wireless_blocklists/{id}`

```java
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistRetrieveParams;
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistRetrieveResponse;

WirelessBlocklistRetrieveResponse wirelessBlocklist = client.wirelessBlocklists().retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Delete a Wireless Blocklist

Deletes the Wireless Blocklist.

`DELETE /wireless_blocklists/{id}`

```java
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistDeleteParams;
import com.telnyx.sdk.models.wirelessblocklists.WirelessBlocklistDeleteResponse;

WirelessBlocklistDeleteResponse wirelessBlocklist = client.wirelessBlocklists().delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58");
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])
