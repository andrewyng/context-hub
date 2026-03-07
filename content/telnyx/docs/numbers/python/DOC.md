---
name: numbers
description: "Search for available phone numbers by location and features, check coverage, and place orders. Use when acquiring new phone numbers."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,phone-numbers,search,order,coverage"
---

# Telnyx Numbers Python SDK Coding Guidelines

You are a Telnyx Numbers API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List Advanced Orders

`GET /advanced_orders`

```python
advanced_orders = client.advanced_orders.list()
print(advanced_orders.data)
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Create Advanced Order

`POST /advanced_orders`

Optional: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `phone_number_type` (enum: local, mobile, toll_free, shared_cost, national, landline), `quantity` (integer), `requirement_group_id` (uuid)

```python
advanced_order = client.advanced_orders.create()
print(advanced_order.id)
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Update Advanced Order

`PATCH /advanced_orders/{advanced-order-id}/requirement_group`

Optional: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `phone_number_type` (enum: local, mobile, toll_free, shared_cost, national, landline), `quantity` (integer), `requirement_group_id` (uuid)

```python
response = client.advanced_orders.update_requirement_group(
    advanced_order_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.id)
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Get Advanced Order

`GET /advanced_orders/{order_id}`

```python
advanced_order = client.advanced_orders.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(advanced_order.id)
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## List available phone number blocks

`GET /available_phone_number_blocks`

```python
available_phone_number_blocks = client.available_phone_number_blocks.list()
print(available_phone_number_blocks.data)
```

Returns: `cost_information` (object), `features` (array[object]), `phone_number` (string), `range` (integer), `record_type` (enum: available_phone_number_block), `region_information` (array[object])

## List available phone numbers

`GET /available_phone_numbers`

```python
available_phone_numbers = client.available_phone_numbers.list()
print(available_phone_numbers.data)
```

Returns: `best_effort` (boolean), `cost_information` (object), `features` (array[object]), `phone_number` (string), `quickship` (boolean), `record_type` (enum: available_phone_number), `region_information` (array[object]), `reservable` (boolean), `vanity_format` (string)

## Retrieve all comments

`GET /comments`

```python
comments = client.comments.list()
print(comments.data)
```

Returns: `body` (string), `comment_record_id` (uuid), `comment_record_type` (enum: sub_number_order, requirement_group), `commenter` (string), `commenter_type` (enum: admin, user), `created_at` (date-time), `id` (uuid), `read_at` (date-time), `updated_at` (date-time)

## Create a comment

`POST /comments`

Optional: `body` (string), `comment_record_id` (uuid), `comment_record_type` (enum: sub_number_order, requirement_group), `commenter` (string), `commenter_type` (enum: admin, user), `created_at` (date-time), `id` (uuid), `read_at` (date-time), `updated_at` (date-time)

```python
comment = client.comments.create()
print(comment.data)
```

Returns: `data` (object)

## Retrieve a comment

`GET /comments/{id}`

```python
comment = client.comments.retrieve(
    "id",
)
print(comment.data)
```

Returns: `data` (object)

## Mark a comment as read

`PATCH /comments/{id}/read`

```python
response = client.comments.mark_as_read(
    "id",
)
print(response.data)
```

Returns: `data` (object)

## Get country coverage

`GET /country_coverage`

```python
country_coverage = client.country_coverage.retrieve()
print(country_coverage.data)
```

Returns: `data` (object)

## Get coverage for a specific country

`GET /country_coverage/countries/{country_code}`

```python
response = client.country_coverage.retrieve_country(
    "US",
)
print(response.data)
```

Returns: `code` (string), `features` (array[string]), `international_sms` (boolean), `inventory_coverage` (boolean), `local` (object), `mobile` (object), `national` (object), `numbers` (boolean), `p2p` (boolean), `phone_number_type` (array[string]), `quickship` (boolean), `region` (string | null), `reservable` (boolean), `shared_cost` (object), `toll_free` (object)

## List customer service records

List customer service records.

`GET /customer_service_records`

```python
page = client.customer_service_records.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## Create a customer service record

Create a new customer service record for the provided phone number.

`POST /customer_service_records`

```python
customer_service_record = client.customer_service_records.create(
    phone_number="+13035553000",
)
print(customer_service_record.data)
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## Verify CSR phone number coverage

Verify the coverage for a list of phone numbers.

`POST /customer_service_records/phone_number_coverages`

```python
response = client.customer_service_records.verify_phone_number_coverage(
    phone_numbers=["+13035553000"],
)
print(response.data)
```

Returns: `additional_data_required` (array[string]), `has_csr_coverage` (boolean), `phone_number` (string), `reason` (string), `record_type` (string)

## Get a customer service record

Get a specific customer service record.

`GET /customer_service_records/{customer_service_record_id}`

```python
customer_service_record = client.customer_service_records.retrieve(
    "customer_service_record_id",
)
print(customer_service_record.data)
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## List inexplicit number orders

Get a paginated list of inexplicit number orders.

`GET /inexplicit_number_orders`

```python
page = client.inexplicit_number_orders.list()
page = page.data[0]
print(page.id)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Create an inexplicit number order

Create an inexplicit number order to programmatically purchase phone numbers without specifying exact numbers.

`POST /inexplicit_number_orders` — Required: `ordering_groups`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `messaging_profile_id` (string)

```python
inexplicit_number_order = client.inexplicit_number_orders.create(
    ordering_groups=[{
        "count_requested": "count_requested",
        "country_iso": "US",
        "phone_number_type": "phone_number_type",
    }],
)
print(inexplicit_number_order.data)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Retrieve an inexplicit number order

Get an existing inexplicit number order by ID.

`GET /inexplicit_number_orders/{id}`

```python
inexplicit_number_order = client.inexplicit_number_orders.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(inexplicit_number_order.data)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Create an inventory coverage request

Creates an inventory coverage request. If locality, npa or national_destination_code is used in groupBy, and no region or locality filters are used, the whole paginated set is returned.

`GET /inventory_coverage`

```python
inventory_coverages = client.inventory_coverage.list()
print(inventory_coverages.data)
```

Returns: `administrative_area` (string), `advance_requirements` (boolean), `count` (integer), `coverage_type` (enum: number, block), `group` (string), `group_type` (string), `number_range` (integer), `number_type` (enum: did, toll-free), `phone_number_type` (enum: local, toll_free, national, landline, shared_cost, mobile), `record_type` (string)

## List mobile network operators

Telnyx has a set of GSM mobile operators partners that are available through our mobile network roaming. This resource is entirely managed by Telnyx and may change over time. That means that this resource won't allow any write operations for it.

`GET /mobile_network_operators`

```python
page = client.mobile_network_operators.list()
page = page.data[0]
print(page.id)
```

Returns: `country_code` (string), `id` (uuid), `mcc` (string), `mnc` (string), `name` (string), `network_preferences_enabled` (boolean), `record_type` (string), `tadig` (string)

## List network coverage locations

List all locations and the interfaces that region supports

`GET /network_coverage`

```python
page = client.network_coverage.list()
page = page.data[0]
print(page.available_services)
```

Returns: `available_services` (array[object]), `location` (object), `record_type` (string)

## List number block orders

Get a paginated list of number block orders.

`GET /number_block_orders`

```python
page = client.number_block_orders.list()
page = page.data[0]
print(page.id)
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Create a number block order

Creates a phone number block order.

`POST /number_block_orders` — Required: `starting_number`, `range`

Optional: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time)

```python
number_block_order = client.number_block_orders.create(
    range=10,
    starting_number="+19705555000",
)
print(number_block_order.data)
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a number block order

Get an existing phone number block order.

`GET /number_block_orders/{number_block_order_id}`

```python
number_block_order = client.number_block_orders.retrieve(
    "number_block_order_id",
)
print(number_block_order.data)
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a list of phone numbers associated to orders

Get a list of phone numbers associated to orders.

`GET /number_order_phone_numbers`

```python
number_order_phone_numbers = client.number_order_phone_numbers.list()
print(number_order_phone_numbers.data)
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## Retrieve a single phone number within a number order.

Get an existing phone number in number order.

`GET /number_order_phone_numbers/{number_order_phone_number_id}`

```python
number_order_phone_number = client.number_order_phone_numbers.retrieve(
    "number_order_phone_number_id",
)
print(number_order_phone_number.data)
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## Update requirements for a single phone number within a number order.

Updates requirements for a single phone number within a number order.

`PATCH /number_order_phone_numbers/{number_order_phone_number_id}`

Optional: `regulatory_requirements` (array[object])

```python
response = client.number_order_phone_numbers.update_requirements(
    number_order_phone_number_id="number_order_phone_number_id",
)
print(response.data)
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## List number orders

Get a paginated list of number orders.

`GET /number_orders`

```python
page = client.number_orders.list()
page = page.data[0]
print(page.id)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Create a number order

Creates a phone number order.

`POST /number_orders`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `messaging_profile_id` (string), `phone_numbers` (array[object])

```python
number_order = client.number_orders.create()
print(number_order.data)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Retrieve a number order

Get an existing phone number order.

`GET /number_orders/{number_order_id}`

```python
number_order = client.number_orders.retrieve(
    "number_order_id",
)
print(number_order.data)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Update a number order

Updates a phone number order.

`PATCH /number_orders/{number_order_id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```python
number_order = client.number_orders.update(
    number_order_id="number_order_id",
)
print(number_order.data)
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## List number reservations

Gets a paginated list of phone number reservations.

`GET /number_reservations`

```python
page = client.number_reservations.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Create a number reservation

Creates a Phone Number Reservation for multiple numbers.

`POST /number_reservations`

Optional: `created_at` (date-time), `customer_reference` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

```python
number_reservation = client.number_reservations.create()
print(number_reservation.data)
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a number reservation

Gets a single phone number reservation.

`GET /number_reservations/{number_reservation_id}`

```python
number_reservation = client.number_reservations.retrieve(
    "number_reservation_id",
)
print(number_reservation.data)
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Extend a number reservation

Extends reservation expiry time on all phone numbers.

`POST /number_reservations/{number_reservation_id}/actions/extend`

```python
response = client.number_reservations.actions.extend(
    "number_reservation_id",
)
print(response.data)
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve the features for a list of numbers

`POST /numbers_features` — Required: `phone_numbers`

```python
numbers_feature = client.numbers_features.create(
    phone_numbers=["string"],
)
print(numbers_feature.data)
```

Returns: `features` (array[string]), `phone_number` (string)

## Lists the phone number blocks jobs

`GET /phone_number_blocks/jobs`

```python
page = client.phone_number_blocks.jobs.list()
page = page.data[0]
print(page.id)
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## Deletes all numbers associated with a phone number block

Creates a new background job to delete all the phone numbers associated with the given block. We will only consider the phone number block as deleted after all phone numbers associated with it are removed, so multiple executions of this job may be necessary in case some of the phone numbers present errors during the deletion process.

`POST /phone_number_blocks/jobs/delete_phone_number_block` — Required: `phone_number_block_id`

```python
response = client.phone_number_blocks.jobs.delete_phone_number_block(
    phone_number_block_id="f3946371-7199-4261-9c3d-81a0d7935146",
)
print(response.data)
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## Retrieves a phone number blocks job

`GET /phone_number_blocks/jobs/{id}`

```python
job = client.phone_number_blocks.jobs.retrieve(
    "id",
)
print(job.data)
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## List sub number orders

Get a paginated list of sub number orders.

`GET /sub_number_orders`

```python
sub_number_orders = client.sub_number_orders.list()
print(sub_number_orders.data)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Retrieve a sub number order

Get an existing sub number order.

`GET /sub_number_orders/{sub_number_order_id}`

```python
sub_number_order = client.sub_number_orders.retrieve(
    sub_number_order_id="sub_number_order_id",
)
print(sub_number_order.data)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Update a sub number order's requirements

Updates a sub number order.

`PATCH /sub_number_orders/{sub_number_order_id}`

Optional: `regulatory_requirements` (array[object])

```python
sub_number_order = client.sub_number_orders.update(
    sub_number_order_id="sub_number_order_id",
)
print(sub_number_order.data)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Cancel a sub number order

Allows you to cancel a sub number order in 'pending' status.

`PATCH /sub_number_orders/{sub_number_order_id}/cancel`

```python
response = client.sub_number_orders.cancel(
    "sub_number_order_id",
)
print(response.data)
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Create a sub number orders report

Create a CSV report for sub number orders. The report will be generated asynchronously and can be downloaded once complete.

`POST /sub_number_orders_report`

Optional: `country_code` (string), `created_at_gt` (date-time), `created_at_lt` (date-time), `customer_reference` (string), `order_request_id` (uuid), `status` (enum: pending, success, failure)

```python
sub_number_orders_report = client.sub_number_orders_report.create()
print(sub_number_orders_report.data)
```

Returns: `created_at` (date-time), `filters` (object), `id` (uuid), `order_type` (string), `status` (enum: pending, success, failed, expired), `updated_at` (date-time), `user_id` (uuid)

## Retrieve a sub number orders report

Get the status and details of a sub number orders report.

`GET /sub_number_orders_report/{report_id}`

```python
sub_number_orders_report = client.sub_number_orders_report.retrieve(
    "12ade33a-21c0-473b-b055-b3c836e1c293",
)
print(sub_number_orders_report.data)
```

Returns: `created_at` (date-time), `filters` (object), `id` (uuid), `order_type` (string), `status` (enum: pending, success, failed, expired), `updated_at` (date-time), `user_id` (uuid)

## Download a sub number orders report

Download the CSV file for a completed sub number orders report. The report status must be 'success' before the file can be downloaded.

`GET /sub_number_orders_report/{report_id}/download`

```python
response = client.sub_number_orders_report.download(
    "12ade33a-21c0-473b-b055-b3c836e1c293",
)
print(response)
```

---

## Webhooks

The following webhook events are sent to your configured webhook URL.
All webhooks include `telnyx-timestamp` and `telnyx-signature-ed25519` headers for verification (Standard Webhooks compatible).

| Event | Description |
|-------|-------------|
| `numberOrderStatusUpdate` | Number Order Status Update |

### Webhook payload fields

**`numberOrderStatusUpdate`**

| Field | Type | Description |
|-------|------|-------------|
| `data.event_type` | string | The type of event being sent |
| `data.id` | uuid | Unique identifier for the event |
| `data.occurred_at` | date-time | ISO 8601 timestamp of when the event occurred |
| `data.payload.id` | uuid |  |
| `data.payload.record_type` | string |  |
| `data.payload.phone_numbers_count` | integer | The count of phone numbers in the number order. |
| `data.payload.connection_id` | string | Identifies the connection associated with this phone number. |
| `data.payload.messaging_profile_id` | string | Identifies the messaging profile associated with the phone number. |
| `data.payload.billing_group_id` | string | Identifies the messaging profile associated with the phone number. |
| `data.payload.phone_numbers` | array[object] |  |
| `data.payload.sub_number_orders_ids` | array[string] |  |
| `data.payload.status` | enum: pending, success, failure | The status of the order. |
| `data.payload.customer_reference` | string | A customer reference string for customer look ups. |
| `data.payload.created_at` | date-time | An ISO 8901 datetime string denoting when the number order was created. |
| `data.payload.updated_at` | date-time | An ISO 8901 datetime string for when the number order was updated. |
| `data.payload.requirements_met` | boolean | True if all requirements are met for every phone number, false otherwise. |
| `data.record_type` | string | Type of record |
| `meta.attempt` | integer | Webhook delivery attempt number |
| `meta.delivered_to` | uri | URL where the webhook was delivered |
