---
name: account
description: "Manage account balance, payments, invoices, webhooks, and view audit logs and detail records."
metadata:
  languages: "ruby"
  versions: "5.52.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,billing,balance,invoices,webhooks"
---

# Telnyx Account Ruby SDK Coding Guidelines

You are a Telnyx Account API expert. Help the user write correct, production-ready code using the official Telnyx Ruby SDK.

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

## List Audit Logs

Retrieve a list of audit log entries. Audit logs are a best-effort, eventually consistent record of significant account-related changes.

`GET /audit_events`

```ruby
page = client.audit_events.list

puts(page)
```

Returns: `alternate_resource_id` (string | null), `change_made_by` (enum: telnyx, account_manager, account_owner, organization_member), `change_type` (string), `changes` (array | null), `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (string), `resource_id` (string), `user_id` (uuid)

## Get user balance details

`GET /balance`

```ruby
balance = client.balance.retrieve

puts(balance)
```

Returns: `available_credit` (string), `balance` (string), `credit_limit` (string), `currency` (string), `pending` (string), `record_type` (enum: balance)

## Get monthly charges breakdown

Retrieve a detailed breakdown of monthly charges for phone numbers in a specified date range. The date range cannot exceed 31 days.

`GET /charges_breakdown`

```ruby
charges_breakdown = client.charges_breakdown.retrieve(start_date: "2025-05-01")

puts(charges_breakdown)
```

Returns: `currency` (string), `end_date` (date), `results` (array[object]), `start_date` (date), `user_email` (email), `user_id` (string)

## Get monthly charges summary

Retrieve a summary of monthly charges for a specified date range. The date range cannot exceed 31 days.

`GET /charges_summary`

```ruby
charges_summary = client.charges_summary.retrieve(end_date: "2025-06-01", start_date: "2025-05-01")

puts(charges_summary)
```

Returns: `currency` (string), `end_date` (date), `start_date` (date), `summary` (object), `total` (object), `user_email` (email), `user_id` (string)

## Search detail records

Search for any detail record across the Telnyx Platform

`GET /detail_records`

```ruby
page = client.detail_records.list

puts(page)
```

Returns: `data` (array[object]), `meta` (object)

## List invoices

Retrieve a paginated list of invoices.

`GET /invoices`

```ruby
page = client.invoices.list

puts(page)
```

Returns: `file_id` (uuid), `invoice_id` (uuid), `paid` (boolean), `period_end` (date), `period_start` (date), `url` (uri)

## Get invoice by ID

Retrieve a single invoice by its unique identifier.

`GET /invoices/{id}`

```ruby
invoice = client.invoices.retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")

puts(invoice)
```

Returns: `download_url` (uri), `file_id` (uuid), `invoice_id` (uuid), `paid` (boolean), `period_end` (date), `period_start` (date), `url` (uri)

## List auto recharge preferences

Returns the payment auto recharge preferences.

`GET /payment/auto_recharge_prefs`

```ruby
auto_recharge_prefs = client.payment.auto_recharge_prefs.list

puts(auto_recharge_prefs)
```

Returns: `enabled` (boolean), `id` (string), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `record_type` (string), `threshold_amount` (string)

## Update auto recharge preferences

Update payment auto recharge preferences.

`PATCH /payment/auto_recharge_prefs`

Optional: `enabled` (boolean), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `threshold_amount` (string)

```ruby
auto_recharge_pref = client.payment.auto_recharge_prefs.update

puts(auto_recharge_pref)
```

Returns: `enabled` (boolean), `id` (string), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `record_type` (string), `threshold_amount` (string)

## List User Tags

List all user tags.

`GET /user_tags`

```ruby
user_tags = client.user_tags.list

puts(user_tags)
```

Returns: `number_tags` (array[string]), `outbound_profile_tags` (array[string])

## Create a stored payment transaction

`POST /v2/payment/stored_payment_transactions` — Required: `amount`

```ruby
response = client.payment.create_stored_payment_transaction(amount: "120.00")

puts(response)
```

Returns: `amount_cents` (integer), `amount_currency` (string), `auto_recharge` (boolean), `created_at` (date-time), `id` (string), `processor_status` (string), `record_type` (enum: transaction), `transaction_processing_type` (enum: stored_payment)

## List webhook deliveries

Lists webhook_deliveries for the authenticated user

`GET /webhook_deliveries`

```ruby
page = client.webhook_deliveries.list

puts(page)
```

Returns: `attempts` (array[object]), `finished_at` (date-time), `id` (uuid), `record_type` (string), `started_at` (date-time), `status` (enum: delivered, failed), `user_id` (uuid), `webhook` (object)

## Find webhook_delivery details by ID

Provides webhook_delivery debug data, such as timestamps, delivery status and attempts.

`GET /webhook_deliveries/{id}`

```ruby
webhook_delivery = client.webhook_deliveries.retrieve("C9C0797E-901D-4349-A33C-C2C8F31A92C2")

puts(webhook_delivery)
```

Returns: `attempts` (array[object]), `finished_at` (date-time), `id` (uuid), `record_type` (string), `started_at` (date-time), `status` (enum: delivered, failed), `user_id` (uuid), `webhook` (object)
