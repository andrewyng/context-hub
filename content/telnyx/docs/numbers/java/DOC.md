---
name: numbers
description: "Search for available phone numbers by location and features, check coverage, and place orders. Use when acquiring new phone numbers."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,phone-numbers,search,order,coverage"
---

# Telnyx Numbers Java SDK Coding Guidelines

You are a Telnyx Numbers API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List Advanced Orders

`GET /advanced_orders`

```java
import com.telnyx.sdk.models.advancedorders.AdvancedOrderListParams;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderListResponse;

AdvancedOrderListResponse advancedOrders = client.advancedOrders().list();
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Create Advanced Order

`POST /advanced_orders`

Optional: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `phone_number_type` (enum: local, mobile, toll_free, shared_cost, national, landline), `quantity` (integer), `requirement_group_id` (uuid)

```java
import com.telnyx.sdk.models.advancedorders.AdvancedOrder;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderCreateParams;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderCreateResponse;

AdvancedOrder params = AdvancedOrder.builder().build();
AdvancedOrderCreateResponse advancedOrder = client.advancedOrders().create(params);
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Update Advanced Order

`PATCH /advanced_orders/{advanced-order-id}/requirement_group`

Optional: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `phone_number_type` (enum: local, mobile, toll_free, shared_cost, national, landline), `quantity` (integer), `requirement_group_id` (uuid)

```java
import com.telnyx.sdk.models.advancedorders.AdvancedOrder;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderUpdateRequirementGroupParams;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderUpdateRequirementGroupResponse;

AdvancedOrderUpdateRequirementGroupParams params = AdvancedOrderUpdateRequirementGroupParams.builder()
    .advancedOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .advancedOrder(AdvancedOrder.builder().build())
    .build();
AdvancedOrderUpdateRequirementGroupResponse response = client.advancedOrders().updateRequirementGroup(params);
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## Get Advanced Order

`GET /advanced_orders/{order_id}`

```java
import com.telnyx.sdk.models.advancedorders.AdvancedOrderRetrieveParams;
import com.telnyx.sdk.models.advancedorders.AdvancedOrderRetrieveResponse;

AdvancedOrderRetrieveResponse advancedOrder = client.advancedOrders().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `area_code` (string), `comments` (string), `country_code` (string), `customer_reference` (string), `features` (array[object]), `id` (uuid), `orders` (array[string]), `phone_number_type` (object), `quantity` (integer), `requirement_group_id` (uuid), `status` (object)

## List available phone number blocks

`GET /available_phone_number_blocks`

```java
import com.telnyx.sdk.models.availablephonenumberblocks.AvailablePhoneNumberBlockListParams;
import com.telnyx.sdk.models.availablephonenumberblocks.AvailablePhoneNumberBlockListResponse;

AvailablePhoneNumberBlockListResponse availablePhoneNumberBlocks = client.availablePhoneNumberBlocks().list();
```

Returns: `cost_information` (object), `features` (array[object]), `phone_number` (string), `range` (integer), `record_type` (enum: available_phone_number_block), `region_information` (array[object])

## List available phone numbers

`GET /available_phone_numbers`

```java
import com.telnyx.sdk.models.availablephonenumbers.AvailablePhoneNumberListParams;
import com.telnyx.sdk.models.availablephonenumbers.AvailablePhoneNumberListResponse;

AvailablePhoneNumberListResponse availablePhoneNumbers = client.availablePhoneNumbers().list();
```

Returns: `best_effort` (boolean), `cost_information` (object), `features` (array[object]), `phone_number` (string), `quickship` (boolean), `record_type` (enum: available_phone_number), `region_information` (array[object]), `reservable` (boolean), `vanity_format` (string)

## Retrieve all comments

`GET /comments`

```java
import com.telnyx.sdk.models.comments.CommentListParams;
import com.telnyx.sdk.models.comments.CommentListResponse;

CommentListResponse comments = client.comments().list();
```

Returns: `body` (string), `comment_record_id` (uuid), `comment_record_type` (enum: sub_number_order, requirement_group), `commenter` (string), `commenter_type` (enum: admin, user), `created_at` (date-time), `id` (uuid), `read_at` (date-time), `updated_at` (date-time)

## Create a comment

`POST /comments`

Optional: `body` (string), `comment_record_id` (uuid), `comment_record_type` (enum: sub_number_order, requirement_group), `commenter` (string), `commenter_type` (enum: admin, user), `created_at` (date-time), `id` (uuid), `read_at` (date-time), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.comments.Comment;
import com.telnyx.sdk.models.comments.CommentCreateParams;
import com.telnyx.sdk.models.comments.CommentCreateResponse;

Comment params = Comment.builder().build();
CommentCreateResponse comment = client.comments().create(params);
```

Returns: `data` (object)

## Retrieve a comment

`GET /comments/{id}`

```java
import com.telnyx.sdk.models.comments.CommentRetrieveParams;
import com.telnyx.sdk.models.comments.CommentRetrieveResponse;

CommentRetrieveResponse comment = client.comments().retrieve("id");
```

Returns: `data` (object)

## Mark a comment as read

`PATCH /comments/{id}/read`

```java
import com.telnyx.sdk.models.comments.CommentMarkAsReadParams;
import com.telnyx.sdk.models.comments.CommentMarkAsReadResponse;

CommentMarkAsReadResponse response = client.comments().markAsRead("id");
```

Returns: `data` (object)

## Get country coverage

`GET /country_coverage`

```java
import com.telnyx.sdk.models.countrycoverage.CountryCoverageRetrieveParams;
import com.telnyx.sdk.models.countrycoverage.CountryCoverageRetrieveResponse;

CountryCoverageRetrieveResponse countryCoverage = client.countryCoverage().retrieve();
```

Returns: `data` (object)

## Get coverage for a specific country

`GET /country_coverage/countries/{country_code}`

```java
import com.telnyx.sdk.models.countrycoverage.CountryCoverageRetrieveCountryParams;
import com.telnyx.sdk.models.countrycoverage.CountryCoverageRetrieveCountryResponse;

CountryCoverageRetrieveCountryResponse response = client.countryCoverage().retrieveCountry("US");
```

Returns: `code` (string), `features` (array[string]), `international_sms` (boolean), `inventory_coverage` (boolean), `local` (object), `mobile` (object), `national` (object), `numbers` (boolean), `p2p` (boolean), `phone_number_type` (array[string]), `quickship` (boolean), `region` (string | null), `reservable` (boolean), `shared_cost` (object), `toll_free` (object)

## List customer service records

List customer service records.

`GET /customer_service_records`

```java
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordListPage;
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordListParams;

CustomerServiceRecordListPage page = client.customerServiceRecords().list();
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## Create a customer service record

Create a new customer service record for the provided phone number.

`POST /customer_service_records`

```java
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordCreateParams;
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordCreateResponse;

CustomerServiceRecordCreateParams params = CustomerServiceRecordCreateParams.builder()
    .phoneNumber("+13035553000")
    .build();
CustomerServiceRecordCreateResponse customerServiceRecord = client.customerServiceRecords().create(params);
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## Verify CSR phone number coverage

Verify the coverage for a list of phone numbers.

`POST /customer_service_records/phone_number_coverages`

```java
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordVerifyPhoneNumberCoverageParams;
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordVerifyPhoneNumberCoverageResponse;

CustomerServiceRecordVerifyPhoneNumberCoverageParams params = CustomerServiceRecordVerifyPhoneNumberCoverageParams.builder()
    .addPhoneNumber("+13035553000")
    .build();
CustomerServiceRecordVerifyPhoneNumberCoverageResponse response = client.customerServiceRecords().verifyPhoneNumberCoverage(params);
```

Returns: `additional_data_required` (array[string]), `has_csr_coverage` (boolean), `phone_number` (string), `reason` (string), `record_type` (string)

## Get a customer service record

Get a specific customer service record.

`GET /customer_service_records/{customer_service_record_id}`

```java
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordRetrieveParams;
import com.telnyx.sdk.models.customerservicerecords.CustomerServiceRecordRetrieveResponse;

CustomerServiceRecordRetrieveResponse customerServiceRecord = client.customerServiceRecords().retrieve("customer_service_record_id");
```

Returns: `created_at` (date-time), `error_message` (string | null), `id` (uuid), `phone_number` (string), `record_type` (string), `result` (object | null), `status` (enum: pending, completed, failed), `updated_at` (date-time), `webhook_url` (string)

## List inexplicit number orders

Get a paginated list of inexplicit number orders.

`GET /inexplicit_number_orders`

```java
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderListPage;
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderListParams;

InexplicitNumberOrderListPage page = client.inexplicitNumberOrders().list();
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Create an inexplicit number order

Create an inexplicit number order to programmatically purchase phone numbers without specifying exact numbers.

`POST /inexplicit_number_orders` — Required: `ordering_groups`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `messaging_profile_id` (string)

```java
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderCreateParams;
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderCreateResponse;

InexplicitNumberOrderCreateParams params = InexplicitNumberOrderCreateParams.builder()
    .addOrderingGroup(InexplicitNumberOrderCreateParams.OrderingGroup.builder()
        .countRequested("count_requested")
        .countryIso(InexplicitNumberOrderCreateParams.OrderingGroup.CountryIso.US)
        .phoneNumberType("phone_number_type")
        .build())
    .build();
InexplicitNumberOrderCreateResponse inexplicitNumberOrder = client.inexplicitNumberOrders().create(params);
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Retrieve an inexplicit number order

Get an existing inexplicit number order by ID.

`GET /inexplicit_number_orders/{id}`

```java
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderRetrieveParams;
import com.telnyx.sdk.models.inexplicitnumberorders.InexplicitNumberOrderRetrieveResponse;

InexplicitNumberOrderRetrieveResponse inexplicitNumberOrder = client.inexplicitNumberOrders().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (string), `messaging_profile_id` (string), `ordering_groups` (array[object]), `updated_at` (date-time)

## Create an inventory coverage request

Creates an inventory coverage request. If locality, npa or national_destination_code is used in groupBy, and no region or locality filters are used, the whole paginated set is returned.

`GET /inventory_coverage`

```java
import com.telnyx.sdk.models.inventorycoverage.InventoryCoverageListParams;
import com.telnyx.sdk.models.inventorycoverage.InventoryCoverageListResponse;

InventoryCoverageListResponse inventoryCoverages = client.inventoryCoverage().list();
```

Returns: `administrative_area` (string), `advance_requirements` (boolean), `count` (integer), `coverage_type` (enum: number, block), `group` (string), `group_type` (string), `number_range` (integer), `number_type` (enum: did, toll-free), `phone_number_type` (enum: local, toll_free, national, landline, shared_cost, mobile), `record_type` (string)

## List mobile network operators

Telnyx has a set of GSM mobile operators partners that are available through our mobile network roaming. This resource is entirely managed by Telnyx and may change over time. That means that this resource won't allow any write operations for it.

`GET /mobile_network_operators`

```java
import com.telnyx.sdk.models.mobilenetworkoperators.MobileNetworkOperatorListPage;
import com.telnyx.sdk.models.mobilenetworkoperators.MobileNetworkOperatorListParams;

MobileNetworkOperatorListPage page = client.mobileNetworkOperators().list();
```

Returns: `country_code` (string), `id` (uuid), `mcc` (string), `mnc` (string), `name` (string), `network_preferences_enabled` (boolean), `record_type` (string), `tadig` (string)

## List network coverage locations

List all locations and the interfaces that region supports

`GET /network_coverage`

```java
import com.telnyx.sdk.models.networkcoverage.NetworkCoverageListPage;
import com.telnyx.sdk.models.networkcoverage.NetworkCoverageListParams;

NetworkCoverageListPage page = client.networkCoverage().list();
```

Returns: `available_services` (array[object]), `location` (object), `record_type` (string)

## List number block orders

Get a paginated list of number block orders.

`GET /number_block_orders`

```java
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderListPage;
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderListParams;

NumberBlockOrderListPage page = client.numberBlockOrders().list();
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Create a number block order

Creates a phone number block order.

`POST /number_block_orders` — Required: `starting_number`, `range`

Optional: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderCreateParams;
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderCreateResponse;

NumberBlockOrderCreateParams params = NumberBlockOrderCreateParams.builder()
    .range(10L)
    .startingNumber("+19705555000")
    .build();
NumberBlockOrderCreateResponse numberBlockOrder = client.numberBlockOrders().create(params);
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a number block order

Get an existing phone number block order.

`GET /number_block_orders/{number_block_order_id}`

```java
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderRetrieveParams;
import com.telnyx.sdk.models.numberblockorders.NumberBlockOrderRetrieveResponse;

NumberBlockOrderRetrieveResponse numberBlockOrder = client.numberBlockOrders().retrieve("number_block_order_id");
```

Returns: `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers_count` (integer), `range` (integer), `record_type` (string), `requirements_met` (boolean), `starting_number` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a list of phone numbers associated to orders

Get a list of phone numbers associated to orders.

`GET /number_order_phone_numbers`

```java
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberListParams;
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberListResponse;

NumberOrderPhoneNumberListResponse numberOrderPhoneNumbers = client.numberOrderPhoneNumbers().list();
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## Retrieve a single phone number within a number order.

Get an existing phone number in number order.

`GET /number_order_phone_numbers/{number_order_phone_number_id}`

```java
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberRetrieveParams;
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberRetrieveResponse;

NumberOrderPhoneNumberRetrieveResponse numberOrderPhoneNumber = client.numberOrderPhoneNumbers().retrieve("number_order_phone_number_id");
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## Update requirements for a single phone number within a number order.

Updates requirements for a single phone number within a number order.

`PATCH /number_order_phone_numbers/{number_order_phone_number_id}`

Optional: `regulatory_requirements` (array[object])

```java
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberUpdateRequirementsParams;
import com.telnyx.sdk.models.numberorderphonenumbers.NumberOrderPhoneNumberUpdateRequirementsResponse;

NumberOrderPhoneNumberUpdateRequirementsResponse response = client.numberOrderPhoneNumbers().updateRequirements("number_order_phone_number_id");
```

Returns: `bundle_id` (uuid), `country_code` (string), `deadline` (date-time), `id` (uuid), `is_block_number` (boolean), `locality` (string), `order_request_id` (uuid), `phone_number` (string), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `requirements_status` (enum: pending, approved, cancelled, deleted, requirement-info-exception, requirement-info-pending, requirement-info-under-review), `status` (enum: pending, success, failure), `sub_number_order_id` (uuid)

## List number orders

Get a paginated list of number orders.

`GET /number_orders`

```java
import com.telnyx.sdk.models.numberorders.NumberOrderListPage;
import com.telnyx.sdk.models.numberorders.NumberOrderListParams;

NumberOrderListPage page = client.numberOrders().list();
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Create a number order

Creates a phone number order.

`POST /number_orders`

Optional: `billing_group_id` (string), `connection_id` (string), `customer_reference` (string), `messaging_profile_id` (string), `phone_numbers` (array[object])

```java
import com.telnyx.sdk.models.numberorders.NumberOrderCreateParams;
import com.telnyx.sdk.models.numberorders.NumberOrderCreateResponse;

NumberOrderCreateResponse numberOrder = client.numberOrders().create();
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Retrieve a number order

Get an existing phone number order.

`GET /number_orders/{number_order_id}`

```java
import com.telnyx.sdk.models.numberorders.NumberOrderRetrieveParams;
import com.telnyx.sdk.models.numberorders.NumberOrderRetrieveResponse;

NumberOrderRetrieveResponse numberOrder = client.numberOrders().retrieve("number_order_id");
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## Update a number order

Updates a phone number order.

`PATCH /number_orders/{number_order_id}`

Optional: `customer_reference` (string), `regulatory_requirements` (array[object])

```java
import com.telnyx.sdk.models.numberorders.NumberOrderUpdateParams;
import com.telnyx.sdk.models.numberorders.NumberOrderUpdateResponse;

NumberOrderUpdateResponse numberOrder = client.numberOrders().update("number_order_id");
```

Returns: `billing_group_id` (string), `connection_id` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `messaging_profile_id` (string), `phone_numbers` (array[object]), `phone_numbers_count` (integer), `record_type` (string), `requirements_met` (boolean), `status` (enum: pending, success, failure), `sub_number_orders_ids` (array[string]), `updated_at` (date-time)

## List number reservations

Gets a paginated list of phone number reservations.

`GET /number_reservations`

```java
import com.telnyx.sdk.models.numberreservations.NumberReservationListPage;
import com.telnyx.sdk.models.numberreservations.NumberReservationListParams;

NumberReservationListPage page = client.numberReservations().list();
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Create a number reservation

Creates a Phone Number Reservation for multiple numbers.

`POST /number_reservations`

Optional: `created_at` (date-time), `customer_reference` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

```java
import com.telnyx.sdk.models.numberreservations.NumberReservationCreateParams;
import com.telnyx.sdk.models.numberreservations.NumberReservationCreateResponse;

NumberReservationCreateResponse numberReservation = client.numberReservations().create();
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve a number reservation

Gets a single phone number reservation.

`GET /number_reservations/{number_reservation_id}`

```java
import com.telnyx.sdk.models.numberreservations.NumberReservationRetrieveParams;
import com.telnyx.sdk.models.numberreservations.NumberReservationRetrieveResponse;

NumberReservationRetrieveResponse numberReservation = client.numberReservations().retrieve("number_reservation_id");
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Extend a number reservation

Extends reservation expiry time on all phone numbers.

`POST /number_reservations/{number_reservation_id}/actions/extend`

```java
import com.telnyx.sdk.models.numberreservations.actions.ActionExtendParams;
import com.telnyx.sdk.models.numberreservations.actions.ActionExtendResponse;

ActionExtendResponse response = client.numberReservations().actions().extend("number_reservation_id");
```

Returns: `created_at` (date-time), `customer_reference` (string), `errors` (string), `id` (uuid), `phone_numbers` (array[object]), `record_type` (string), `status` (enum: pending, success, failure), `updated_at` (date-time)

## Retrieve the features for a list of numbers

`POST /numbers_features` — Required: `phone_numbers`

```java
import com.telnyx.sdk.models.numbersfeatures.NumbersFeatureCreateParams;
import com.telnyx.sdk.models.numbersfeatures.NumbersFeatureCreateResponse;

NumbersFeatureCreateParams params = NumbersFeatureCreateParams.builder()
    .addPhoneNumber("string")
    .build();
NumbersFeatureCreateResponse numbersFeature = client.numbersFeatures().create(params);
```

Returns: `features` (array[string]), `phone_number` (string)

## Lists the phone number blocks jobs

`GET /phone_number_blocks/jobs`

```java
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobListPage;
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobListParams;

JobListPage page = client.phoneNumberBlocks().jobs().list();
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## Deletes all numbers associated with a phone number block

Creates a new background job to delete all the phone numbers associated with the given block. We will only consider the phone number block as deleted after all phone numbers associated with it are removed, so multiple executions of this job may be necessary in case some of the phone numbers present errors during the deletion process.

`POST /phone_number_blocks/jobs/delete_phone_number_block` — Required: `phone_number_block_id`

```java
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobDeletePhoneNumberBlockParams;
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobDeletePhoneNumberBlockResponse;

JobDeletePhoneNumberBlockParams params = JobDeletePhoneNumberBlockParams.builder()
    .phoneNumberBlockId("f3946371-7199-4261-9c3d-81a0d7935146")
    .build();
JobDeletePhoneNumberBlockResponse response = client.phoneNumberBlocks().jobs().deletePhoneNumberBlock(params);
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## Retrieves a phone number blocks job

`GET /phone_number_blocks/jobs/{id}`

```java
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobRetrieveParams;
import com.telnyx.sdk.models.phonenumberblocks.jobs.JobRetrieveResponse;

JobRetrieveResponse job = client.phoneNumberBlocks().jobs().retrieve("id");
```

Returns: `created_at` (string), `etc` (date-time), `failed_operations` (array[object]), `id` (uuid), `record_type` (string), `status` (enum: pending, in_progress, completed, failed), `successful_operations` (array[object]), `type` (enum: delete_phone_number_block), `updated_at` (string)

## List sub number orders

Get a paginated list of sub number orders.

`GET /sub_number_orders`

```java
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderListParams;
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderListResponse;

SubNumberOrderListResponse subNumberOrders = client.subNumberOrders().list();
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Retrieve a sub number order

Get an existing sub number order.

`GET /sub_number_orders/{sub_number_order_id}`

```java
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderRetrieveParams;
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderRetrieveResponse;

SubNumberOrderRetrieveResponse subNumberOrder = client.subNumberOrders().retrieve("sub_number_order_id");
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Update a sub number order's requirements

Updates a sub number order.

`PATCH /sub_number_orders/{sub_number_order_id}`

Optional: `regulatory_requirements` (array[object])

```java
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderUpdateParams;
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderUpdateResponse;

SubNumberOrderUpdateResponse subNumberOrder = client.subNumberOrders().update("sub_number_order_id");
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Cancel a sub number order

Allows you to cancel a sub number order in 'pending' status.

`PATCH /sub_number_orders/{sub_number_order_id}/cancel`

```java
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderCancelParams;
import com.telnyx.sdk.models.subnumberorders.SubNumberOrderCancelResponse;

SubNumberOrderCancelResponse response = client.subNumberOrders().cancel("sub_number_order_id");
```

Returns: `country_code` (string), `created_at` (date-time), `customer_reference` (string), `id` (uuid), `is_block_sub_number_order` (boolean), `order_request_id` (uuid), `phone_number_type` (enum: local, toll_free, mobile, national, shared_cost, landline), `phone_numbers_count` (integer), `record_type` (string), `regulatory_requirements` (array[object]), `requirements_met` (boolean), `status` (enum: pending, success, failure), `updated_at` (date-time), `user_id` (uuid)

## Create a sub number orders report

Create a CSV report for sub number orders. The report will be generated asynchronously and can be downloaded once complete.

`POST /sub_number_orders_report`

Optional: `country_code` (string), `created_at_gt` (date-time), `created_at_lt` (date-time), `customer_reference` (string), `order_request_id` (uuid), `status` (enum: pending, success, failure)

```java
import com.telnyx.sdk.models.subnumberordersreport.SubNumberOrdersReportCreateParams;
import com.telnyx.sdk.models.subnumberordersreport.SubNumberOrdersReportCreateResponse;

SubNumberOrdersReportCreateResponse subNumberOrdersReport = client.subNumberOrdersReport().create();
```

Returns: `created_at` (date-time), `filters` (object), `id` (uuid), `order_type` (string), `status` (enum: pending, success, failed, expired), `updated_at` (date-time), `user_id` (uuid)

## Retrieve a sub number orders report

Get the status and details of a sub number orders report.

`GET /sub_number_orders_report/{report_id}`

```java
import com.telnyx.sdk.models.subnumberordersreport.SubNumberOrdersReportRetrieveParams;
import com.telnyx.sdk.models.subnumberordersreport.SubNumberOrdersReportRetrieveResponse;

SubNumberOrdersReportRetrieveResponse subNumberOrdersReport = client.subNumberOrdersReport().retrieve("12ade33a-21c0-473b-b055-b3c836e1c293");
```

Returns: `created_at` (date-time), `filters` (object), `id` (uuid), `order_type` (string), `status` (enum: pending, success, failed, expired), `updated_at` (date-time), `user_id` (uuid)

## Download a sub number orders report

Download the CSV file for a completed sub number orders report. The report status must be 'success' before the file can be downloaded.

`GET /sub_number_orders_report/{report_id}/download`

```java
import com.telnyx.sdk.models.subnumberordersreport.SubNumberOrdersReportDownloadParams;

String response = client.subNumberOrdersReport().download("12ade33a-21c0-473b-b055-b3c836e1c293");
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
