---
name: iot
description: "Manage IoT SIM cards, eSIMs, data plans, and wireless connectivity. Use when building IoT/M2M solutions."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,iot,sim,esim,m2m,wireless"
---

# Telnyx IoT Go SDK Coding Guidelines

You are a Telnyx IoT API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## Purchase eSIMs

Purchases and registers the specified amount of eSIMs to the current user's account.  
If `sim_card_group_id` is provided, the eSIMs will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/purchase/esims` — Required: `amount`

Optional: `product` (string), `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string]), `whitelabel_name` (string)

```go
	purchase, err := client.Actions.Purchase.New(context.TODO(), telnyx.ActionPurchaseNewParams{
		Amount: 10,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", purchase.Data)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Register SIM cards

Register the SIM cards associated with the provided registration codes to the current user's account.  
If `sim_card_group_id` is provided, the SIM cards will be associated with that group. Otherwise, the default group for the current user will be used.  

`POST /actions/register/sim_cards` — Required: `registration_codes`

Optional: `sim_card_group_id` (uuid), `status` (enum: enabled, disabled, standby), `tags` (array[string])

```go
	register, err := client.Actions.Register.New(context.TODO(), telnyx.ActionRegisterNewParams{
		RegistrationCodes: []string{"0000000001", "0000000002", "0000000003"},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", register.Data)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## List bulk SIM card actions

This API lists a paginated collection of bulk SIM card actions. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions`

```go
	page, err := client.BulkSimCardActions.List(context.TODO(), telnyx.BulkSimCardActionListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## Get bulk SIM card action details

This API fetches information about a bulk SIM card action. A bulk SIM card action contains details about a collection of individual SIM card actions.

`GET /bulk_sim_card_actions/{id}`

```go
	bulkSimCardAction, err := client.BulkSimCardActions.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", bulkSimCardAction.Data)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_actions_summary` (array[object]), `updated_at` (string)

## List OTA updates

`GET /ota_updates`

```go
	page, err := client.OtaUpdates.List(context.TODO(), telnyx.OtaUpdateListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## Get OTA update

This API returns the details of an Over the Air (OTA) update.

`GET /ota_updates/{id}`

```go
	otaUpdate, err := client.OtaUpdates.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", otaUpdate.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: sim_card_network_preferences), `updated_at` (string)

## List SIM card actions

This API lists a paginated collection of SIM card actions. It enables exploring a collection of existing asynchronous operations using specific filters.

`GET /sim_card_actions`

```go
	page, err := client.SimCards.Actions.List(context.TODO(), telnyx.SimCardActionListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get SIM card action details

This API fetches detailed information about a SIM card action to follow-up on an existing asynchronous operation.

`GET /sim_card_actions/{id}`

```go
	action, err := client.SimCards.Actions.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", action.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## List SIM card data usage notifications

Lists a paginated collection of SIM card data usage notifications. It enables exploring the collection using specific filters.

`GET /sim_card_data_usage_notifications`

```go
	page, err := client.SimCardDataUsageNotifications.List(context.TODO(), telnyx.SimCardDataUsageNotificationListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Create a new SIM card data usage notification

Creates a new SIM card data usage notification.

`POST /sim_card_data_usage_notifications` — Required: `sim_card_id`, `threshold`

```go
	simCardDataUsageNotification, err := client.SimCardDataUsageNotifications.New(context.TODO(), telnyx.SimCardDataUsageNotificationNewParams{
		SimCardID: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		Threshold: telnyx.SimCardDataUsageNotificationNewParamsThreshold{},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardDataUsageNotification.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Get a single SIM card data usage notification

Get a single SIM Card Data Usage Notification.

`GET /sim_card_data_usage_notifications/{id}`

```go
	simCardDataUsageNotification, err := client.SimCardDataUsageNotifications.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardDataUsageNotification.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Updates information for a SIM Card Data Usage Notification

Updates information for a SIM Card Data Usage Notification.

`PATCH /sim_card_data_usage_notifications/{id}`

Optional: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

```go
	simCardDataUsageNotification, err := client.SimCardDataUsageNotifications.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardDataUsageNotificationUpdateParams{
			SimCardDataUsageNotification: telnyx.SimCardDataUsageNotificationParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardDataUsageNotification.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## Delete SIM card data usage notifications

Delete the SIM Card Data Usage Notification.

`DELETE /sim_card_data_usage_notifications/{id}`

```go
	simCardDataUsageNotification, err := client.SimCardDataUsageNotifications.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardDataUsageNotification.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `sim_card_id` (uuid), `threshold` (object), `updated_at` (string)

## List SIM card group actions

This API allows listing a paginated collection a SIM card group actions. It allows to explore a collection of existing asynchronous operation using specific filters.

`GET /sim_card_group_actions`

```go
	page, err := client.SimCardGroups.Actions.List(context.TODO(), telnyx.SimCardGroupActionListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get SIM card group action details

This API allows fetching detailed information about a SIM card group action resource to make follow-ups in an existing asynchronous operation.

`GET /sim_card_group_actions/{id}`

```go
	action, err := client.SimCardGroups.Actions.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", action.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Get all SIM card groups

Get all SIM card groups belonging to the user that match the given filters.

`GET /sim_card_groups`

```go
	page, err := client.SimCardGroups.List(context.TODO(), telnyx.SimCardGroupListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `sim_card_count` (integer), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Create a SIM card group

Creates a new SIM card group object

`POST /sim_card_groups` — Required: `name`

Optional: `data_limit` (object)

```go
	simCardGroup, err := client.SimCardGroups.New(context.TODO(), telnyx.SimCardGroupNewParams{
		Name: "My Test Group",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardGroup.Data)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Get SIM card group

Returns the details regarding a specific SIM card group

`GET /sim_card_groups/{id}`

```go
	simCardGroup, err := client.SimCardGroups.Get(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardGroupGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardGroup.Data)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Update a SIM card group

Updates a SIM card group

`PATCH /sim_card_groups/{id}`

Optional: `data_limit` (object), `name` (string)

```go
	simCardGroup, err := client.SimCardGroups.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardGroupUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardGroup.Data)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Delete a SIM card group

Permanently deletes a SIM card group

`DELETE /sim_card_groups/{id}`

```go
	simCardGroup, err := client.SimCardGroups.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardGroup.Data)
```

Returns: `consumed_data` (object), `created_at` (string), `data_limit` (object), `default` (boolean), `id` (uuid), `name` (string), `private_wireless_gateway_id` (uuid), `record_type` (string), `updated_at` (string), `wireless_blocklist_id` (uuid)

## Request Private Wireless Gateway removal from SIM card group

This action will asynchronously remove an existing Private Wireless Gateway definition from a SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic handled by Telnyx's default mobile network configuration.

`POST /sim_card_groups/{id}/actions/remove_private_wireless_gateway`

```go
	response, err := client.SimCardGroups.Actions.RemovePrivateWirelessGateway(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist removal from SIM card group

This action will asynchronously remove an existing Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/remove_wireless_blocklist`

```go
	response, err := client.SimCardGroups.Actions.RemoveWirelessBlocklist(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Private Wireless Gateway assignment for SIM card group

This action will asynchronously assign a provisioned Private Wireless Gateway to the SIM card group. Completing this operation defines that all SIM cards in the SIM card group will get their traffic controlled by the associated Private Wireless Gateway. This operation will also imply that new SIM cards assigned to a group will inherit its network definitions.

`POST /sim_card_groups/{id}/actions/set_private_wireless_gateway` — Required: `private_wireless_gateway_id`

```go
	response, err := client.SimCardGroups.Actions.SetPrivateWirelessGateway(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardGroupActionSetPrivateWirelessGatewayParams{
			PrivateWirelessGatewayID: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Request Wireless Blocklist assignment for SIM card group

This action will asynchronously assign a Wireless Blocklist to all the SIMs in the SIM card group.

`POST /sim_card_groups/{id}/actions/set_wireless_blocklist` — Required: `wireless_blocklist_id`

```go
	response, err := client.SimCardGroups.Actions.SetWirelessBlocklist(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardGroupActionSetWirelessBlocklistParams{
			WirelessBlocklistID: "6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `sim_card_group_id` (uuid), `status` (enum: in-progress, completed, failed), `type` (enum: set_private_wireless_gateway, remove_private_wireless_gateway, set_wireless_blocklist, remove_wireless_blocklist), `updated_at` (string)

## Preview SIM card orders

Preview SIM card order purchases.

`POST /sim_card_order_preview` — Required: `quantity`, `address_id`

```go
	response, err := client.SimCardOrderPreview.Preview(context.TODO(), telnyx.SimCardOrderPreviewPreviewParams{
		AddressID: "1293384261075731499",
		Quantity:  21,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `quantity` (integer), `record_type` (string), `shipping_cost` (object), `sim_cards_cost` (object), `total_cost` (object)

## Get all SIM card orders

Get all SIM card orders according to filters.

`GET /sim_card_orders`

```go
	page, err := client.SimCardOrders.List(context.TODO(), telnyx.SimCardOrderListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Create a SIM card order

Creates a new order for SIM cards.

`POST /sim_card_orders` — Required: `address_id`, `quantity`

```go
	simCardOrder, err := client.SimCardOrders.New(context.TODO(), telnyx.SimCardOrderNewParams{
		AddressID: "1293384261075731499",
		Quantity:  23,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardOrder.Data)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get a single SIM card order

Get a single SIM card order by its ID.

`GET /sim_card_orders/{id}`

```go
	simCardOrder, err := client.SimCardOrders.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCardOrder.Data)
```

Returns: `cost` (object), `created_at` (string), `id` (uuid), `order_address` (object), `quantity` (integer), `record_type` (string), `status` (enum: pending, processing, ready_to_ship, shipped, delivered, canceled), `tracking_url` (uri), `updated_at` (string)

## Get all SIM cards

Get all SIM cards belonging to the user that match the given filters.

`GET /sim_cards`

```go
	page, err := client.SimCards.List(context.TODO(), telnyx.SimCardListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `msisdn` (string), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request bulk setting SIM card public IPs.

This API triggers an asynchronous operation to set a public IP for each of the specified SIM cards. 
For each SIM Card a SIM Card Action will be generated. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/actions/bulk_set_public_ips` — Required: `sim_card_ids`

```go
	response, err := client.SimCards.Actions.BulkSetPublicIPs(context.TODO(), telnyx.SimCardActionBulkSetPublicIPsParams{
		SimCardIDs: []string{"6b14e151-8493-4fa1-8664-1cc4e6d14158"},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: bulk_set_public_ips), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object), `updated_at` (string)

## Validate SIM cards registration codes

It validates whether SIM card registration codes are valid or not.

`POST /sim_cards/actions/validate_registration_codes`

Optional: `registration_codes` (array[string])

```go
	response, err := client.SimCards.Actions.ValidateRegistrationCodes(context.TODO(), telnyx.SimCardActionValidateRegistrationCodesParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `invalid_detail` (string | null), `record_type` (string), `registration_code` (string), `valid` (boolean)

## Get SIM card

Returns the details regarding a specific SIM card.

`GET /sim_cards/{id}`

```go
	simCard, err := client.SimCards.Get(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCard.Data)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Update a SIM card

Updates SIM card data

`PATCH /sim_cards/{id}`

Optional: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

```go
	simCard, err := client.SimCards.Update(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardUpdateParams{
			SimCard: telnyx.SimCardParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCard.Data)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Deletes a SIM card

The SIM card will be decommissioned, removed from your account and you will stop being charged. The SIM card won't be able to connect to the network after the deletion is completed, thus making it impossible to consume data. 
Transitioning to the disabled state may take a period of time.

`DELETE /sim_cards/{id}`

```go
	simCard, err := client.SimCards.Delete(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardDeleteParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", simCard.Data)
```

Returns: `actions_in_progress` (boolean), `authorized_imeis` (array | null), `created_at` (string), `current_billing_period_consumed_data` (object), `current_device_location` (object), `current_imei` (string), `current_mcc` (string), `current_mnc` (string), `data_limit` (object), `eid` (string | null), `esim_installation_status` (enum: released, disabled), `iccid` (string), `id` (uuid), `imsi` (string), `ipv4` (string), `ipv6` (string), `live_data_session` (enum: connected, disconnected, unknown), `msisdn` (string), `pin_puk_codes` (object), `record_type` (string), `resources_with_in_progress_actions` (array[object]), `sim_card_group_id` (uuid), `status` (object), `tags` (array[string]), `type` (enum: physical, esim), `updated_at` (string), `version` (string)

## Request a SIM card disable

This API disables a SIM card, disconnecting it from the network and making it impossible to consume data. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the disabled state may take a period of time.

`POST /sim_cards/{id}/actions/disable`

```go
	response, err := client.SimCards.Actions.Disable(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request a SIM card enable

This API enables a SIM card, connecting it to the network and making it possible to consume data. 
To enable a SIM card, it must be associated with a SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the enabled state may take a period of time.

`POST /sim_cards/{id}/actions/enable`

```go
	response, err := client.SimCards.Actions.Enable(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request removing a SIM card public IP

This API removes an existing public IP from a SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/remove_public_ip`

```go
	response, err := client.SimCards.Actions.RemovePublicIP(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card public IP

This API makes a SIM card reachable on the public internet by mapping a random public IP to the SIM card.   
 The API will trigger an asynchronous operation called a SIM Card Action. The status of the SIM Card Action can be followed through the [List SIM Card Action](https://developers.telnyx.com/api-reference/sim-card-actions/list-sim-card-actions) API.

`POST /sim_cards/{id}/actions/set_public_ip`

```go
	response, err := client.SimCards.Actions.SetPublicIP(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardActionSetPublicIPParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Request setting a SIM card to standby

The SIM card will be able to connect to the network once the process to set it to standby has been completed, thus making it possible to consume data. 
To set a SIM card to standby, it must be associated with SIM card group. 
The API will trigger an asynchronous operation called a SIM Card Action. Transitioning to the standby state may take a period of time.

`POST /sim_cards/{id}/actions/set_standby`

```go
	response, err := client.SimCards.Actions.SetStandby(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `action_type` (enum: enable, enable_standby_sim_card, disable, set_standby), `created_at` (string), `id` (uuid), `record_type` (string), `settings` (object | null), `sim_card_id` (uuid), `status` (object), `updated_at` (string)

## Get activation code for an eSIM

It returns the activation code for an eSIM.  
 This API is only available for eSIMs. If the given SIM is a physical SIM card, or has already been installed, an error will be returned.

`GET /sim_cards/{id}/activation_code`

```go
	response, err := client.SimCards.GetActivationCode(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `activation_code` (string), `record_type` (string)

## Get SIM card device details

It returns the device details where a SIM card is currently being used.

`GET /sim_cards/{id}/device_details`

```go
	response, err := client.SimCards.GetDeviceDetails(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `brand_name` (string), `device_type` (string), `imei` (string), `model_name` (string), `operating_system` (string), `record_type` (string)

## Get SIM card public IP definition

It returns the public IP requested for a SIM card.

`GET /sim_cards/{id}/public_ip`

```go
	response, err := client.SimCards.GetPublicIP(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (string), `ip` (string), `record_type` (string), `region_code` (string), `sim_card_id` (uuid), `type` (enum: ipv4), `updated_at` (string)

## List wireless connectivity logs

This API allows listing a paginated collection of Wireless Connectivity Logs associated with a SIM Card, for troubleshooting purposes.

`GET /sim_cards/{id}/wireless_connectivity_logs`

```go
	page, err := client.SimCards.ListWirelessConnectivityLogs(
		context.TODO(),
		"6a09cdc3-8948-47f0-aa62-74ac943d6c58",
		telnyx.SimCardListWirelessConnectivityLogsParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `apn` (string), `cell_id` (string), `created_at` (string), `id` (integer), `imei` (string), `imsi` (string), `ipv4` (string), `ipv6` (string), `last_seen` (string), `log_type` (enum: registration, data), `mobile_country_code` (string), `mobile_network_code` (string), `radio_access_technology` (string), `record_type` (string), `sim_card_id` (uuid), `start_time` (string), `state` (string), `stop_time` (string)

## List Migration Source coverage

`GET /storage/migration_source_coverage`

```go
	response, err := client.Storage.ListMigrationSourceCoverage(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `provider` (enum: aws), `source_region` (string)

## List all Migration Sources

`GET /storage/migration_sources`

```go
	migrationSources, err := client.Storage.MigrationSources.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migrationSources.Data)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Create a Migration Source

Create a source from which data can be migrated from.

`POST /storage/migration_sources` — Required: `provider`, `provider_auth`, `bucket_name`

Optional: `id` (string), `source_region` (string)

```go
	migrationSource, err := client.Storage.MigrationSources.New(context.TODO(), telnyx.StorageMigrationSourceNewParams{
		MigrationSourceParams: telnyx.MigrationSourceParams{
			BucketName:   "bucket_name",
			Provider:     telnyx.MigrationSourceParamsProviderAws,
			ProviderAuth: telnyx.MigrationSourceParamsProviderAuth{},
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migrationSource.Data)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Get a Migration Source

`GET /storage/migration_sources/{id}`

```go
	migrationSource, err := client.Storage.MigrationSources.Get(context.TODO(), "")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migrationSource.Data)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## Delete a Migration Source

`DELETE /storage/migration_sources/{id}`

```go
	migrationSource, err := client.Storage.MigrationSources.Delete(context.TODO(), "")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migrationSource.Data)
```

Returns: `bucket_name` (string), `id` (string), `provider` (enum: aws, telnyx), `provider_auth` (object), `source_region` (string)

## List all Migrations

`GET /storage/migrations`

```go
	migrations, err := client.Storage.Migrations.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migrations.Data)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Create a Migration

Initiate a migration of data from an external provider into Telnyx Cloud Storage. Currently, only S3 is supported.

`POST /storage/migrations` — Required: `source_id`, `target_bucket_name`, `target_region`

Optional: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped)

```go
	migration, err := client.Storage.Migrations.New(context.TODO(), telnyx.StorageMigrationNewParams{
		MigrationParams: telnyx.MigrationParams{
			SourceID:         "source_id",
			TargetBucketName: "target_bucket_name",
			TargetRegion:     "target_region",
		},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migration.Data)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Get a Migration

`GET /storage/migrations/{id}`

```go
	migration, err := client.Storage.Migrations.Get(context.TODO(), "")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", migration.Data)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## Stop a Migration

`POST /storage/migrations/{id}/actions/stop`

```go
	response, err := client.Storage.Migrations.Actions.Stop(context.TODO(), "")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `bytes_migrated` (integer), `bytes_to_migrate` (integer), `created_at` (date-time), `eta` (date-time), `id` (string), `last_copy` (date-time), `refresh` (boolean), `source_id` (string), `speed` (integer), `status` (enum: pending, checking, migrating, complete, error, stopped), `target_bucket_name` (string), `target_region` (string)

## List Mobile Voice Connections

`GET /v2/mobile_voice_connections`

```go
	page, err := client.MobileVoiceConnections.List(context.TODO(), telnyx.MobileVoiceConnectionListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Create a Mobile Voice Connection

`POST /v2/mobile_voice_connections`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

```go
	mobileVoiceConnection, err := client.MobileVoiceConnections.New(context.TODO(), telnyx.MobileVoiceConnectionNewParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mobileVoiceConnection.Data)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Retrieve a Mobile Voice Connection

`GET /v2/mobile_voice_connections/{id}`

```go
	mobileVoiceConnection, err := client.MobileVoiceConnections.Get(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mobileVoiceConnection.Data)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Update a Mobile Voice Connection

`PATCH /v2/mobile_voice_connections/{id}`

Optional: `active` (boolean), `connection_name` (string), `inbound` (object), `outbound` (object), `tags` (array[string]), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer)

```go
	mobileVoiceConnection, err := client.MobileVoiceConnections.Update(
		context.TODO(),
		"id",
		telnyx.MobileVoiceConnectionUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mobileVoiceConnection.Data)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Delete a Mobile Voice Connection

`DELETE /v2/mobile_voice_connections/{id}`

```go
	mobileVoiceConnection, err := client.MobileVoiceConnections.Delete(context.TODO(), "id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mobileVoiceConnection.Data)
```

Returns: `active` (boolean), `connection_name` (string), `created_at` (date-time), `id` (string), `inbound` (object), `outbound` (object), `record_type` (enum: mobile_voice_connection), `tags` (array[string]), `updated_at` (date-time), `webhook_api_version` (enum: 1, 2), `webhook_event_failover_url` (string | null), `webhook_event_url` (string | null), `webhook_timeout_secs` (integer | null)

## Get all wireless regions

Retrieve all wireless regions for the given product.

`GET /wireless/regions`

```go
	response, err := client.Wireless.GetRegions(context.TODO(), telnyx.WirelessGetRegionsParams{
		Product: "public_ips",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `code` (string), `inserted_at` (date-time), `name` (string), `updated_at` (date-time)

## Get all possible wireless blocklist values

Retrieve all wireless blocklist values for a given blocklist type.

`GET /wireless_blocklist_values`

```go
	wirelessBlocklistValues, err := client.WirelessBlocklistValues.List(context.TODO(), telnyx.WirelessBlocklistValueListParams{
		Type: telnyx.WirelessBlocklistValueListParamsTypeCountry,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wirelessBlocklistValues.Data)
```

Returns: `data` (object), `meta` (object)

## Get all Wireless Blocklists

Get all Wireless Blocklists belonging to the user.

`GET /wireless_blocklists`

```go
	page, err := client.WirelessBlocklists.List(context.TODO(), telnyx.WirelessBlocklistListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Create a Wireless Blocklist

Create a Wireless Blocklist to prevent SIMs from connecting to certain networks.

`POST /wireless_blocklists` — Required: `name`, `type`, `values`

```go
	wirelessBlocklist, err := client.WirelessBlocklists.New(context.TODO(), telnyx.WirelessBlocklistNewParams{
		Name:   "My Wireless Blocklist",
		Type:   telnyx.WirelessBlocklistNewParamsTypeCountry,
		Values: []string{"CA", "US"},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wirelessBlocklist.Data)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Update a Wireless Blocklist

Update a Wireless Blocklist.

`PATCH /wireless_blocklists`

Optional: `name` (string), `type` (enum: country, mcc, plmn), `values` (array[object])

```go
	wirelessBlocklist, err := client.WirelessBlocklists.Update(context.TODO(), telnyx.WirelessBlocklistUpdateParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wirelessBlocklist.Data)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Get a Wireless Blocklist

Retrieve information about a Wireless Blocklist.

`GET /wireless_blocklists/{id}`

```go
	wirelessBlocklist, err := client.WirelessBlocklists.Get(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wirelessBlocklist.Data)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])

## Delete a Wireless Blocklist

Deletes the Wireless Blocklist.

`DELETE /wireless_blocklists/{id}`

```go
	wirelessBlocklist, err := client.WirelessBlocklists.Delete(context.TODO(), "6a09cdc3-8948-47f0-aa62-74ac943d6c58")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", wirelessBlocklist.Data)
```

Returns: `created_at` (string), `id` (uuid), `name` (string), `record_type` (string), `type` (enum: country, mcc, plmn), `updated_at` (string), `values` (array[object])
