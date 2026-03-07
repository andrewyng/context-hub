---
name: iot
description: "Manage IoT SIM cards, eSIMs, data plans, and wireless connectivity. Use when building IoT/M2M solutions."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,iot,sim,esim,m2m,wireless"
---

# Telnyx IoT REST API Coding Guidelines

You are a Telnyx IoT API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## Purchase eSIMs

Purchases and registers the specified amount of eSIMs to the current user's account.  
If `sim_card_group_id` is provided, the eSIMs will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/purchase/esims` — Required: `amount`

Optional: `product` (string), `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string]), `whitelabel_name` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "sim_card_group_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "tags": [
    "personal",
    "customers",
    "active-customers"
  ],
  "product": "whitelabel",
  "whitelabel_name": "Custom SPN",
  "amount": 10,
  "status": "standby"
}' \
  "https://api.telnyx.com/v2/actions/purchase/esims"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Register SIM cards

Register the SIM cards associated with the provided registration codes to the current user's account.  
If `sim_card_group_id` is provided, the SIM cards will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/register/sim_cards` — Required: `registration_codes`

Optional: `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "sim_card_group_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "tags": [
    "personal",
    "customers",
    "active-customers"
  ],
  "registration_codes": [
    "0000000001",
    "0000000002",
    "0000000003"
  ],
  "status": "standby"
}' \
  "https://api.telnyx.com/v2/actions/register/sim_cards"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## List bulk SIM card actions

This API lists a paginated collection of bulk SIM card actions. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bulk_sim_card_actions?filter[action_type]=bulk_set_public_ips"
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## Get bulk SIM card action details

This API fetches information about a bulk SIM card action. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/bulk_sim_card_actions/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## List OTA updates

`GET /ota_updates`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ota_updates"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## Get OTA update

This API returns the details of an Over the Air (OTA) update.

`GET /ota_updates/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ota_updates/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## List SIM card actions

This API lists a paginated collection of SIM card actions. It enables exploring a collection of existing asynchronous operations using specific filters.

`GET /sim_card_actions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_actions"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get SIM card action details

This API fetches detailed information about a SIM card action to follow-up on an existing asynchronous operation.

`GET /sim_card_actions/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_actions/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## List SIM card data usage notifications

Lists a paginated collection of SIM card data usage notifications. It enables exploring the collection using specific filters.

`GET /sim_card_data_usage_notifications`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_data_usage_notifications?filter[sim_card_id]=47a1c2b0-cc7b-4ab1-bb98-b33fb0fc61b9"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Create a new SIM card data usage notification

Creates a new SIM card data usage notification.

`POST /sim_card_data_usage_notifications` — Required: `sim_card_id`, `threshold`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "sim_card_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "threshold": {}
}' \
  "https://api.telnyx.com/v2/sim_card_data_usage_notifications"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Get a single SIM card data usage notification

Get a single SIM Card Data Usage Notification.

`GET /sim_card_data_usage_notifications/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_data_usage_notifications/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Updates information for a SIM Card Data Usage Notification

Updates information for a SIM Card Data Usage Notification.

`PATCH /sim_card_data_usage_notifications/{id}`

Optional: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "id": "79228acc-3f08-4e70-ac68-cb5aae8b537a",
  "sim_card_id": "b34c1683-cd85-4493-b9a5-315eb4bc5e19",
  "record_type": "sim_card_data_usage_notification",
  "created_at": "2018-02-02T22:25:27.521Z",
  "updated_at": "2018-02-02T22:25:27.521Z"
}' \
  "https://api.telnyx.com/v2/sim_card_data_usage_notifications/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Delete SIM card data usage notifications

Delete the SIM Card Data Usage Notification.

`DELETE /sim_card_data_usage_notifications/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/sim_card_data_usage_notifications/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## List SIM card group actions

This API allows listing a paginated collection a SIM card group actions. It allows to explore a collection of existing asynchronous operation using specific filters.

`GET /sim_card_group_actions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_group_actions?filter[sim_card_group_id]=47a1c2b0-cc7b-4ab1-bb98-b33fb0fc61b9&filter[status]=in-progress&filter[type]=set_private_wireless_gateway"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get SIM card group action details

This API allows fetching detailed information about a SIM card group action resource to make follow-ups in an existing asynchronous operation.

`GET /sim_card_group_actions/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_group_actions/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get all SIM card groups

Get all SIM card groups belonging to the user that match the given filters.

`GET /sim_card_groups`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_groups?filter[name]=My Test Group&filter[private_wireless_gateway_id]=7606c6d3-ff7c-49c1-943d-68879e9d584d&filter[wireless_blocklist_id]=0f3f490e-c4d3-4cf5-838a-9970f10ee259"
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `sim_card_count` (integer), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Create a SIM card group

Creates a new SIM card group object

`POST /sim_card_groups` — Required: `name`

Optional: `data_limit` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "My Test Group"
}' \
  "https://api.telnyx.com/v2/sim_card_groups"
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Get SIM card group

Returns the details regarding a specific SIM card group

`GET /sim_card_groups/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58?include_iccids=True"
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Update a SIM card group

Updates a SIM card group

`PATCH /sim_card_groups/{id}`

Optional: `data_limit` (object), `name` (string)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "My Test Group"
}' \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Delete a SIM card group

Permanently deletes a SIM card group

`DELETE /sim_card_groups/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Request Private Wireless Gateway removal from SIM card group

This action will asynchronously remove an existing Private Wireless Gateway definition from a SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic handled by Telnyx's default mobile network configuration.

`POST /sim_card_groups/{id}/actions/remove_private_wireless_gateway`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/remove_private_wireless_gateway"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist removal from SIM card group

This action will asynchronously remove an existing Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/remove_wireless_blocklist`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/remove_wireless_blocklist"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Private Wireless Gateway assignment for SIM card group

This action will asynchronously assign a provisioned Private Wireless Gateway to the SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic controlled by the associated Private Wireless Gateway. This operation will also imply that new SIM cards assigned to a group will inherit its network definitions.

`POST /sim_card_groups/{id}/actions/set_private_wireless_gateway` — Required: `private_wireless_gateway_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "private_wireless_gateway_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58"
}' \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/set_private_wireless_gateway"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist assignment for SIM card group

This action will asynchronously assign a Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/set_wireless_blocklist` — Required: `wireless_blocklist_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "wireless_blocklist_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58"
}' \
  "https://api.telnyx.com/v2/sim_card_groups/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/set_wireless_blocklist"
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Preview SIM card orders

Preview SIM card order purchases.

`POST /sim_card_order_preview` — Required: `quantity`, `address_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "quantity": 21,
  "address_id": "1293384261075731499"
}' \
  "https://api.telnyx.com/v2/sim_card_order_preview"
```

Returns: `quantity` (integer), `record_type` (string), `shipping_cost` (object), `sim_cards_cost` (object), `total_cost` (object)

## Get all SIM card orders

Get all SIM card orders according to filters.

`GET /sim_card_orders`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_orders"
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Create a SIM card order

Creates a new order for SIM cards.

`POST /sim_card_orders` — Required: `address_id`, `quantity`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "address_id": "1293384261075731499",
  "quantity": 23
}' \
  "https://api.telnyx.com/v2/sim_card_orders"
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get a single SIM card order

Get a single SIM card order by its ID.

`GET /sim_card_orders/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_card_orders/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get all SIM cards

Get all SIM cards belonging to the user that match the given filters.

`GET /sim_cards`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards?include_sim_card_group=True&filter[sim_card_group_id]=47a1c2b0-cc7b-4ab1-bb98-b33fb0fc61b9&sort=-current_billing_period_consumed_data.amount"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request bulk setting SIM card public IPs.

This API triggers an asynchronous operation to set a public IP for each of the specified SIM cards. 
For each SIM Card a SIM Card Action will be generated. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/actions/bulk_set_public_ips` — Required: `sim_card_ids`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "sim_card_ids": [
    "6b14e151-8493-4fa1-8664-1cc4e6d14158"
  ]
}' \
  "https://api.telnyx.com/v2/sim_cards/actions/bulk_set_public_ips"
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `updated_at` (string)

## Validate SIM cards registration codes

It validates whether SIM card registration codes are valid or not.

`POST /sim_cards/actions/validate_registration_codes`

Optional: `registration_codes` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/actions/validate_registration_codes"
```

Returns: `invalid_detail` (string | null), `record_type` (string), `registration_code` (string), `valid` (boolean)

## Get SIM card

Returns the details regarding a specific SIM card.

`GET /sim_cards/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58?include_sim_card_group=True"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Update a SIM card

Updates SIM card data

`PATCH /sim_cards/{id}`

Optional: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "record_type": "sim_card",
  "type": "physical",
  "iccid": "89310410106543789301",
  "imsi": "081932214823362973",
  "msisdn": "+13109976224",
  "sim_card_group_id": "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  "tags": [
    "personal",
    "customers",
    "active-customers"
  ],
  "authorized_imeis": [
    "106516771852751",
    "534051870479563",
    "508821468377961"
  ],
  "current_imei": "457032284023794",
  "actions_in_progress": true,
  "created_at": "2018-02-02T22:25:27.521Z",
  "updated_at": "2018-02-02T22:25:27.521Z",
  "ipv4": "192.168.0.0",
  "ipv6": "2001:cdba:0000:0000:0000:0000:3257:9652",
  "current_mnc": "260",
  "current_mcc": "410",
  "live_data_session": "connected",
  "esim_installation_status": "released",
  "version": "4.3",
  "resources_with_in_progress_actions": [],
  "eid": null
}' \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Deletes a SIM card

The SIM card will be decommissioned, removed from your account and you will stop being charged. The SIM card won't be able to connect to the network after the deletion is completed, thus making it impossible to consume data. 
Transitioning to the disabled state may take a period of time.

`DELETE /sim_cards/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request a SIM card disable

This API disables a SIM card, disconnecting it from the network and making it impossible to consume data. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the disabled state may take a period of time.

`POST /sim_cards/{id}/actions/disable`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/disable"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request a SIM card enable

This API enables a SIM card, connecting it to the network and making it possible to consume data. 
To enable a SIM card, it must be associated with a SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the enabled state may take a period of time.

`POST /sim_cards/{id}/actions/enable`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/enable"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request removing a SIM card public IP

This API removes an existing public IP from a SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/remove_public_ip`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/remove_public_ip"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card public IP

This API makes a SIM card reachable on the public internet by mapping a random public IP to the SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/set_public_ip`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/set_public_ip"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card to standby

The SIM card will be able to connect to the network once the process to set it to standby has been completed, thus making it possible to consume data. 
To set a SIM card to standby, it must be associated with SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the standby state may take a period of time.

`POST /sim_cards/{id}/actions/set_standby`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/actions/set_standby"
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get activation code for an eSIM

It returns the activation code for an eSIM.  
 This API is only available for eSIMs. If the given SIM is a physical SIM card, or has already been installed, an error will be returned.

`GET /sim_cards/{id}/activation_code`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/activation_code"
```

Returns: `activation_code` (string), `record_type` (string)

## Get SIM card device details

It returns the device details where a SIM card is currently being used.

`GET /sim_cards/{id}/device_details`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/device_details"
```

Returns: `brand_name` (string), `device_type` (string), `imei` (string), `model_name` (string), `operating_system` (string), `record_type` (string)

## Get SIM card public IP definition

It returns the public IP requested for a SIM card.

`GET /sim_cards/{id}/public_ip`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/public_ip"
```

Returns: `created_at` (string), `ip` (string), `record_type` (string), `region_code` (string), `sim_card_id` (uuid), `type` (enum: ipv4), `updated_at` (string)

## List wireless connectivity logs

This API allows listing a paginated collection of Wireless Connectivity Logs associated with a SIM Card, for troubleshooting purposes.

`GET /sim_cards/{id}/wireless_connectivity_logs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/sim_cards/6a09cdc3-8948-47f0-aa62-74ac943d6c58/wireless_connectivity_logs"
```

Returns: `apn` (string), `cell_id` (string), `created_at` (string), `id` (integer), `imei` (string), `imsi` (string), `ipv4` (string), `ipv6` (string), `last_seen` (string), `log_type` (enum: registration, data), `mobile_country_code` (string), `mobile_network_code` (string), `radio_access_technology` (string), `record_type` (string), `sim_card_id` (uuid), `start_time` (string), `state` (string), `stop_time` (string)

## List Migration Source coverage

`GET /storage/migration_source_coverage`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/storage/migration_source_coverage"
```

Returns: `provider` (enum: aws), `source_region` (string)

## List all Migration Sources

`GET /storage/migration_sources`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/storage/migration_sources"
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Create a Migration Source

Create a source from which data can be migrated from.

`POST /storage/migration_sources` — Required: `provider`, `provider_auth`, `bucket_name`

Optional: `id` (string), `source_region` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "provider": "aws",
  "provider_auth": {},
  "bucket_name": "string"
}' \
  "https://api.telnyx.com/v2/storage/migration_sources"
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Get a Migration Source

`GET /storage/migration_sources/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/storage/migration_sources/{id}"
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Delete a Migration Source

`DELETE /storage/migration_sources/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/storage/migration_sources/{id}"
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## List all Migrations

`GET /storage/migrations`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/storage/migrations"
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Create a Migration

Initiate a migration of data from an external provider into Telnyx Cloud Storage. Currently, only S3 is supported.

`POST /storage/migrations` — Required: `source_id`, `target_bucket_name`, `target_region`

Optional: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "source_id": "string",
  "target_bucket_name": "string",
  "target_region": "string",
  "last_copy": "2020-01-01T00:00:00Z",
  "eta": "2020-01-01T00:00:00Z",
  "created_at": "2020-01-01T00:00:00Z"
}' \
  "https://api.telnyx.com/v2/storage/migrations"
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Get a Migration

`GET /storage/migrations/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/storage/migrations/{id}"
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Stop a Migration

`POST /storage/migrations/{id}/actions/stop`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/storage/migrations/{id}/actions/stop"
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## List Mobile Voice Connections

`GET /v2/mobile_voice_connections`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/v2/mobile_voice_connections"
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Create a Mobile Voice Connection

`POST /v2/mobile_voice_connections`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/v2/mobile_voice_connections"
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Retrieve a Mobile Voice Connection

`GET /v2/mobile_voice_connections/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/v2/mobile_voice_connections/{id}"
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Update a Mobile Voice Connection

`PATCH /v2/mobile_voice_connections/{id}`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/v2/mobile_voice_connections/{id}"
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Delete a Mobile Voice Connection

`DELETE /v2/mobile_voice_connections/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/v2/mobile_voice_connections/{id}"
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Get all wireless regions

Retrieve all wireless regions for the given product.

`GET /wireless/regions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireless/regions?product=public_ips"
```

Returns: `code` (string), `inserted_at` (date-time), `name` (string), `updated_at` (date-time)

## Get all possible wireless blocklist values

Retrieve all wireless blocklist values for a given blocklist type.

`GET /wireless_blocklist_values`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireless_blocklist_values?type=country"
```

Returns: `data` (object), `meta` (object)

## Get all Wireless Blocklists

Get all Wireless Blocklists belonging to the user.

`GET /wireless_blocklists`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireless_blocklists?filter[name]=my private gateway&filter[type]=country&filter[values]=US,CA"
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Create a Wireless Blocklist

Create a Wireless Blocklist to prevent SIMs from connecting to certain networks.

`POST /wireless_blocklists` — Required: `name`, `type`, `values`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "My Wireless Blocklist",
  "type": "country",
  "values": [
    "CA",
    "US"
  ]
}' \
  "https://api.telnyx.com/v2/wireless_blocklists"
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Update a Wireless Blocklist

Update a Wireless Blocklist.

`PATCH /wireless_blocklists`

Optional: `name` (string), `type` (enum: country, mcc, plmn), `values` (array[object])

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "My Wireless Blocklist",
  "type": "country",
  "values": [
    "CA",
    "US"
  ]
}' \
  "https://api.telnyx.com/v2/wireless_blocklists"
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Get a Wireless Blocklist

Retrieve information about a Wireless Blocklist.

`GET /wireless_blocklists/{id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/wireless_blocklists/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Delete a Wireless Blocklist

Deletes the Wireless Blocklist.

`DELETE /wireless_blocklists/{id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/wireless_blocklists/6a09cdc3-8948-47f0-aa62-74ac943d6c58"
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])
