---
name: iot
description: "Manage IoT SIM cards, eSIMs, data plans, and wireless connectivity. Use when building IoT/M2M solutions."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,iot,sim,esim,m2m,wireless"
---

# Telnyx IoT Ruby SDK Coding Guidelines

You are a Telnyx IoT API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `require "telnyx"`
- **Incorrect:** unofficial gems or raw HTTP calls

## Installation

```bash
gem install telnyx
```

## Setup

```ruby
require "telnyx"

client = Telnyx::Client.new(
  api_key: ENV["TELNYX_API_KEY"], # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## Purchase eSIMs

Purchases and registers the specified amount of eSIMs to the current user's account.  
If `sim_card_group_id` is provided, the eSIMs will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/purchase/esims` — Required: `amount`

Optional: `product` (string), `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string]), `whitelabel_name` (string)

```ruby
purchase = client.actions.purchase.create(amount: 10)

puts(purchase)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Register SIM cards

Register the SIM cards associated with the provided registration codes to the current user's account.  
If `sim_card_group_id` is provided, the SIM cards will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/register/sim_cards` — Required: `registration_codes`

Optional: `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string])

```ruby
register = client.actions.register.create(registration_codes: ["0000000001", "0000000002", "0000000003"])

puts(register)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## List bulk SIM card actions

This API lists a paginated collection of bulk SIM card actions. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions`

```ruby
page = client.bulk_sim_card_actions.list

puts(page)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## Get bulk SIM card action details

This API fetches information about a bulk SIM card action. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions/{id}`

```ruby
bulk_sim_card_action = client.bulk_sim_card_actions.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(bulk_sim_card_action)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## List OTA updates

`GET /ota_updates`

```ruby
page = client.ota_updates.list

puts(page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## Get OTA update

This API returns the details of an Over the Air (OTA) update.

`GET /ota_updates/{id}`

```ruby
ota_update = client.ota_updates.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(ota_update)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## List SIM card actions

This API lists a paginated collection of SIM card actions. It enables exploring a collection of existing asynchronous operations using specific filters.

`GET /sim_card_actions`

```ruby
page = client.sim_cards.actions.list

puts(page)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get SIM card action details

This API fetches detailed information about a SIM card action to follow-up on an existing asynchronous operation.

`GET /sim_card_actions/{id}`

```ruby
action = client.sim_cards.actions.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(action)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## List SIM card data usage notifications

Lists a paginated collection of SIM card data usage notifications. It enables exploring the collection using specific filters.

`GET /sim_card_data_usage_notifications`

```ruby
page = client.sim_card_data_usage_notifications.list

puts(page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Create a new SIM card data usage notification

Creates a new SIM card data usage notification.

`POST /sim_card_data_usage_notifications` — Required: `sim_card_id`, `threshold`

```ruby
sim_card_data_usage_notification = client.sim_card_data_usage_notifications.create(
  sim_card_id: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  threshold: {}
)

puts(sim_card_data_usage_notification)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Get a single SIM card data usage notification

Get a single SIM Card Data Usage Notification.

`GET /sim_card_data_usage_notifications/{id}`

```ruby
sim_card_data_usage_notification = client.sim_card_data_usage_notifications.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_data_usage_notification)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Updates information for a SIM Card Data Usage Notification

Updates information for a SIM Card Data Usage Notification.

`PATCH /sim_card_data_usage_notifications/{id}`

Optional: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

```ruby
sim_card_data_usage_notification = client.sim_card_data_usage_notifications.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_data_usage_notification)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Delete SIM card data usage notifications

Delete the SIM Card Data Usage Notification.

`DELETE /sim_card_data_usage_notifications/{id}`

```ruby
sim_card_data_usage_notification = client.sim_card_data_usage_notifications.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_data_usage_notification)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## List SIM card group actions

This API allows listing a paginated collection a SIM card group actions. It allows to explore a collection of existing asynchronous operation using specific filters.

`GET /sim_card_group_actions`

```ruby
page = client.sim_card_groups.actions.list

puts(page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get SIM card group action details

This API allows fetching detailed information about a SIM card group action resource to make follow-ups in an existing asynchronous operation.

`GET /sim_card_group_actions/{id}`

```ruby
action = client.sim_card_groups.actions.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(action)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get all SIM card groups

Get all SIM card groups belonging to the user that match the given filters.

`GET /sim_card_groups`

```ruby
page = client.sim_card_groups.list

puts(page)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `sim_card_count` (integer), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Create a SIM card group

Creates a new SIM card group object

`POST /sim_card_groups` — Required: `name`

Optional: `data_limit` (object)

```ruby
sim_card_group = client.sim_card_groups.create(name: "My Test Group")

puts(sim_card_group)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Get SIM card group

Returns the details regarding a specific SIM card group

`GET /sim_card_groups/{id}`

```ruby
sim_card_group = client.sim_card_groups.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_group)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Update a SIM card group

Updates a SIM card group

`PATCH /sim_card_groups/{id}`

Optional: `data_limit` (object), `name` (string)

```ruby
sim_card_group = client.sim_card_groups.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_group)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Delete a SIM card group

Permanently deletes a SIM card group

`DELETE /sim_card_groups/{id}`

```ruby
sim_card_group = client.sim_card_groups.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_group)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Request Private Wireless Gateway removal from SIM card group

This action will asynchronously remove an existing Private Wireless Gateway definition from a SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic handled by Telnyx's default mobile network configuration.

`POST /sim_card_groups/{id}/actions/remove_private_wireless_gateway`

```ruby
response = client.sim_card_groups.actions.remove_private_wireless_gateway("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist removal from SIM card group

This action will asynchronously remove an existing Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/remove_wireless_blocklist`

```ruby
response = client.sim_card_groups.actions.remove_wireless_blocklist("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Private Wireless Gateway assignment for SIM card group

This action will asynchronously assign a provisioned Private Wireless Gateway to the SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic controlled by the associated Private Wireless Gateway. This operation will also imply that new SIM cards assigned to a group will inherit its network definitions.

`POST /sim_card_groups/{id}/actions/set_private_wireless_gateway` — Required: `private_wireless_gateway_id`

```ruby
response = client.sim_card_groups.actions.set_private_wireless_gateway(
  "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  private_wireless_gateway_id: "6a09cdc3-8948-47f0-aa62-74ac943d6c58"
)

puts(response)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist assignment for SIM card group

This action will asynchronously assign a Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/set_wireless_blocklist` — Required: `wireless_blocklist_id`

```ruby
response = client.sim_card_groups.actions.set_wireless_blocklist(
  "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
  wireless_blocklist_id: "6a09cdc3-8948-47f0-aa62-74ac943d6c58"
)

puts(response)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Preview SIM card orders

Preview SIM card order purchases.

`POST /sim_card_order_preview` — Required: `quantity`, `address_id`

```ruby
response = client.sim_card_order_preview.preview(address_id: "1293384261075731499", quantity: 21)

puts(response)
```

Returns: `quantity` (integer), `record_type` (string), `shipping_cost` (object), `sim_cards_cost` (object), `total_cost` (object)

## Get all SIM card orders

Get all SIM card orders according to filters.

`GET /sim_card_orders`

```ruby
page = client.sim_card_orders.list

puts(page)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Create a SIM card order

Creates a new order for SIM cards.

`POST /sim_card_orders` — Required: `address_id`, `quantity`

```ruby
sim_card_order = client.sim_card_orders.create(address_id: "1293384261075731499", quantity: 23)

puts(sim_card_order)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get a single SIM card order

Get a single SIM card order by its ID.

`GET /sim_card_orders/{id}`

```ruby
sim_card_order = client.sim_card_orders.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card_order)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get all SIM cards

Get all SIM cards belonging to the user that match the given filters.

`GET /sim_cards`

```ruby
page = client.sim_cards.list

puts(page)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request bulk setting SIM card public IPs.

This API triggers an asynchronous operation to set a public IP for each of the specified SIM cards. 
For each SIM Card a SIM Card Action will be generated. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/actions/bulk_set_public_ips` — Required: `sim_card_ids`

```ruby
response = client.sim_cards.actions.bulk_set_public_ips(sim_card_ids: ["6b14e151-8493-4fa1-8664-1cc4e6d14158"])

puts(response)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `updated_at` (string)

## Validate SIM cards registration codes

It validates whether SIM card registration codes are valid or not.

`POST /sim_cards/actions/validate_registration_codes`

Optional: `registration_codes` (array[string])

```ruby
response = client.sim_cards.actions.validate_registration_codes

puts(response)
```

Returns: `invalid_detail` (string | null), `record_type` (string), `registration_code` (string), `valid` (boolean)

## Get SIM card

Returns the details regarding a specific SIM card.

`GET /sim_cards/{id}`

```ruby
sim_card = client.sim_cards.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Update a SIM card

Updates SIM card data

`PATCH /sim_cards/{id}`

Optional: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

```ruby
sim_card = client.sim_cards.update("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Deletes a SIM card

The SIM card will be decommissioned, removed from your account and you will stop being charged. The SIM card won't be able to connect to the network after the deletion is completed, thus making it impossible to consume data. 
Transitioning to the disabled state may take a period of time.

`DELETE /sim_cards/{id}`

```ruby
sim_card = client.sim_cards.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(sim_card)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request a SIM card disable

This API disables a SIM card, disconnecting it from the network and making it impossible to consume data. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the disabled state may take a period of time.

`POST /sim_cards/{id}/actions/disable`

```ruby
response = client.sim_cards.actions.disable("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request a SIM card enable

This API enables a SIM card, connecting it to the network and making it possible to consume data. 
To enable a SIM card, it must be associated with a SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the enabled state may take a period of time.

`POST /sim_cards/{id}/actions/enable`

```ruby
response = client.sim_cards.actions.enable("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request removing a SIM card public IP

This API removes an existing public IP from a SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/remove_public_ip`

```ruby
response = client.sim_cards.actions.remove_public_ip("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card public IP

This API makes a SIM card reachable on the public internet by mapping a random public IP to the SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/set_public_ip`

```ruby
response = client.sim_cards.actions.set_public_ip("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card to standby

The SIM card will be able to connect to the network once the process to set it to standby has been completed, thus making it possible to consume data. 
To set a SIM card to standby, it must be associated with SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the standby state may take a period of time.

`POST /sim_cards/{id}/actions/set_standby`

```ruby
response = client.sim_cards.actions.set_standby("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get activation code for an eSIM

It returns the activation code for an eSIM.  
 This API is only available for eSIMs. If the given SIM is a physical SIM card, or has already been installed, an error will be returned.

`GET /sim_cards/{id}/activation_code`

```ruby
response = client.sim_cards.get_activation_code("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `activation_code` (string), `record_type` (string)

## Get SIM card device details

It returns the device details where a SIM card is currently being used.

`GET /sim_cards/{id}/device_details`

```ruby
response = client.sim_cards.get_device_details("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `brand_name` (string), `device_type` (string), `imei` (string), `model_name` (string), `operating_system` (string), `record_type` (string)

## Get SIM card public IP definition

It returns the public IP requested for a SIM card.

`GET /sim_cards/{id}/public_ip`

```ruby
response = client.sim_cards.get_public_ip("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(response)
```

Returns: `created_at` (string), `ip` (string), `record_type` (string), `region_code` (string), `sim_card_id` (uuid), `type` (enum: ipv4), `updated_at` (string)

## List wireless connectivity logs

This API allows listing a paginated collection of Wireless Connectivity Logs associated with a SIM Card, for troubleshooting purposes.

`GET /sim_cards/{id}/wireless_connectivity_logs`

```ruby
page = client.sim_cards.list_wireless_connectivity_logs("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(page)
```

Returns: `apn` (string), `cell_id` (string), `created_at` (string), `id` (integer), `imei` (string), `imsi` (string), `ipv4` (string), `ipv6` (string), `last_seen` (string), `log_type` (enum: registration, data), `mobile_country_code` (string), `mobile_network_code` (string), `radio_access_technology` (string), `record_type` (string), `sim_card_id` (uuid), `start_time` (string), `state` (string), `stop_time` (string)

## List Migration Source coverage

`GET /storage/migration_source_coverage`

```ruby
response = client.storage.list_migration_source_coverage

puts(response)
```

Returns: `provider` (enum: aws), `source_region` (string)

## List all Migration Sources

`GET /storage/migration_sources`

```ruby
migration_sources = client.storage.migration_sources.list

puts(migration_sources)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Create a Migration Source

Create a source from which data can be migrated from.

`POST /storage/migration_sources` — Required: `provider`, `provider_auth`, `bucket_name`

Optional: `id` (string), `source_region` (string)

```ruby
migration_source = client.storage.migration_sources.create(bucket_name: "bucket_name", provider: :aws, provider_auth: {})

puts(migration_source)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Get a Migration Source

`GET /storage/migration_sources/{id}`

```ruby
migration_source = client.storage.migration_sources.retrieve("")

puts(migration_source)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Delete a Migration Source

`DELETE /storage/migration_sources/{id}`

```ruby
migration_source = client.storage.migration_sources.delete("")

puts(migration_source)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## List all Migrations

`GET /storage/migrations`

```ruby
migrations = client.storage.migrations.list

puts(migrations)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Create a Migration

Initiate a migration of data from an external provider into Telnyx Cloud Storage. Currently, only S3 is supported.

`POST /storage/migrations` — Required: `source_id`, `target_bucket_name`, `target_region`

Optional: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped)

```ruby
migration = client.storage.migrations.create(
  source_id: "source_id",
  target_bucket_name: "target_bucket_name",
  target_region: "target_region"
)

puts(migration)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Get a Migration

`GET /storage/migrations/{id}`

```ruby
migration = client.storage.migrations.retrieve("")

puts(migration)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Stop a Migration

`POST /storage/migrations/{id}/actions/stop`

```ruby
response = client.storage.migrations.actions.stop("")

puts(response)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## List Mobile Voice Connections

`GET /v2/mobile_voice_connections`

```ruby
page = client.mobile_voice_connections.list

puts(page)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Create a Mobile Voice Connection

`POST /v2/mobile_voice_connections`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

```ruby
mobile_voice_connection = client.mobile_voice_connections.create

puts(mobile_voice_connection)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Retrieve a Mobile Voice Connection

`GET /v2/mobile_voice_connections/{id}`

```ruby
mobile_voice_connection = client.mobile_voice_connections.retrieve("id")

puts(mobile_voice_connection)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Update a Mobile Voice Connection

`PATCH /v2/mobile_voice_connections/{id}`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer)

```ruby
mobile_voice_connection = client.mobile_voice_connections.update("id")

puts(mobile_voice_connection)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Delete a Mobile Voice Connection

`DELETE /v2/mobile_voice_connections/{id}`

```ruby
mobile_voice_connection = client.mobile_voice_connections.delete("id")

puts(mobile_voice_connection)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Get all wireless regions

Retrieve all wireless regions for the given product.

`GET /wireless/regions`

```ruby
response = client.wireless.retrieve_regions(product: "public_ips")

puts(response)
```

Returns: `code` (string), `inserted_at` (date-time), `name` (string), `updated_at` (date-time)

## Get all possible wireless blocklist values

Retrieve all wireless blocklist values for a given blocklist type.

`GET /wireless_blocklist_values`

```ruby
wireless_blocklist_values = client.wireless_blocklist_values.list(type: :country)

puts(wireless_blocklist_values)
```

Returns: `data` (object), `meta` (object)

## Get all Wireless Blocklists

Get all Wireless Blocklists belonging to the user.

`GET /wireless_blocklists`

```ruby
page = client.wireless_blocklists.list

puts(page)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Create a Wireless Blocklist

Create a Wireless Blocklist to prevent SIMs from connecting to certain networks.

`POST /wireless_blocklists` — Required: `name`, `type`, `values`

```ruby
wireless_blocklist = client.wireless_blocklists.create(name: "My Wireless Blocklist", type: :country, values: ["CA", "US"])

puts(wireless_blocklist)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Update a Wireless Blocklist

Update a Wireless Blocklist.

`PATCH /wireless_blocklists`

Optional: `name` (string), `type` (enum: country, mcc, plmn), `values` (array[object])

```ruby
wireless_blocklist = client.wireless_blocklists.update

puts(wireless_blocklist)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Get a Wireless Blocklist

Retrieve information about a Wireless Blocklist.

`GET /wireless_blocklists/{id}`

```ruby
wireless_blocklist = client.wireless_blocklists.retrieve("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireless_blocklist)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Delete a Wireless Blocklist

Deletes the Wireless Blocklist.

`DELETE /wireless_blocklists/{id}`

```ruby
wireless_blocklist = client.wireless_blocklists.delete("6a09cdc3-8948-47f0-aa62-74ac943d6c58")

puts(wireless_blocklist)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])
