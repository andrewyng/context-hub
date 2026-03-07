---
name: porting-in
description: "Port phone numbers into Telnyx. Check portability, create port orders, upload LOA documents, and track porting status."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,porting,port-in,number-transfer,loa"
---

# Telnyx Porting In Java SDK Coding Guidelines

You are a Telnyx Porting In API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## Run a portability check

Runs a portability check, returning the results immediately.

`POST /portability_checks`

Optional: `phone_numbers` (array[string])

```java
import com.telnyx.sdk.models.portabilitychecks.PortabilityCheckRunParams;
import com.telnyx.sdk.models.portabilitychecks.PortabilityCheckRunResponse;

PortabilityCheckRunResponse response = client.portabilityChecks().run();
```

Returns: `fast_portable` (boolean), `not_portable_reason` (string), `phone_number` (string), `portable` (boolean), `record_type` (string)

## List all porting events

Returns a list of all porting events.

`GET /porting/events`

```java
import com.telnyx.sdk.models.porting.events.EventListPage;
import com.telnyx.sdk.models.porting.events.EventListParams;

EventListPage page = client.porting().events().list();
```

Returns: `data` (array[object]), `meta` (object)

## Show a porting event

Show a specific porting event.

`GET /porting/events/{id}`

```java
import com.telnyx.sdk.models.porting.events.EventRetrieveParams;
import com.telnyx.sdk.models.porting.events.EventRetrieveResponse;

EventRetrieveResponse event = client.porting().events().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `data` (object)

## Republish a porting event

Republish a specific porting event.

`POST /porting/events/{id}/republish`

```java
import com.telnyx.sdk.models.porting.events.EventRepublishParams;

client.porting().events().republish("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## Preview the LOA configuration parameters

Preview the LOA template that would be generated without need to create LOA configuration.

`POST /porting/loa_configuration/preview`

```java
import com.telnyx.sdk.core.http.HttpResponse;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationPreview0Params;

LoaConfigurationPreview0Params params = LoaConfigurationPreview0Params.builder()
    .address(LoaConfigurationPreview0Params.Address.builder()
        .city("Austin")
        .countryCode("US")
        .state("TX")
        .streetAddress("600 Congress Avenue")
        .zipCode("78701")
        .build())
    .companyName("Telnyx")
    .contact(LoaConfigurationPreview0Params.Contact.builder()
        .email("testing@telnyx.com")
        .phoneNumber("+12003270001")
        .build())
    .logo(LoaConfigurationPreview0Params.Logo.builder()
        .documentId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
        .build())
    .name("My LOA Configuration")
    .build();
HttpResponse response = client.porting().loaConfigurations().preview0(params);
```

## List LOA configurations

List the LOA configurations.

`GET /porting/loa_configurations`

```java
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationListPage;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationListParams;

LoaConfigurationListPage page = client.porting().loaConfigurations().list();
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Create a LOA configuration

Create a LOA configuration.

`POST /porting/loa_configurations`

```java
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationCreateParams;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationCreateResponse;

LoaConfigurationCreateParams params = LoaConfigurationCreateParams.builder()
    .address(LoaConfigurationCreateParams.Address.builder()
        .city("Austin")
        .countryCode("US")
        .state("TX")
        .streetAddress("600 Congress Avenue")
        .zipCode("78701")
        .build())
    .companyName("Telnyx")
    .contact(LoaConfigurationCreateParams.Contact.builder()
        .email("testing@telnyx.com")
        .phoneNumber("+12003270001")
        .build())
    .logo(LoaConfigurationCreateParams.Logo.builder()
        .documentId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
        .build())
    .name("My LOA Configuration")
    .build();
LoaConfigurationCreateResponse loaConfiguration = client.porting().loaConfigurations().create(params);
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Retrieve a LOA configuration

Retrieve a specific LOA configuration.

`GET /porting/loa_configurations/{id}`

```java
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationRetrieveParams;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationRetrieveResponse;

LoaConfigurationRetrieveResponse loaConfiguration = client.porting().loaConfigurations().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Update a LOA configuration

Update a specific LOA configuration.

`PATCH /porting/loa_configurations/{id}`

```java
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationUpdateParams;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationUpdateResponse;

LoaConfigurationUpdateParams params = LoaConfigurationUpdateParams.builder()
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .address(LoaConfigurationUpdateParams.Address.builder()
        .city("Austin")
        .countryCode("US")
        .state("TX")
        .streetAddress("600 Congress Avenue")
        .zipCode("78701")
        .build())
    .companyName("Telnyx")
    .contact(LoaConfigurationUpdateParams.Contact.builder()
        .email("testing@telnyx.com")
        .phoneNumber("+12003270001")
        .build())
    .logo(LoaConfigurationUpdateParams.Logo.builder()
        .documentId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
        .build())
    .name("My LOA Configuration")
    .build();
LoaConfigurationUpdateResponse loaConfiguration = client.porting().loaConfigurations().update(params);
```

Returns: `address` (object), `company_name` (string), `contact` (object), `created_at` (date-time), `id` (uuid), `logo` (object), `name` (string), `organization_id` (string), `record_type` (string), `updated_at` (date-time)

## Delete a LOA configuration

Delete a specific LOA configuration.

`DELETE /porting/loa_configurations/{id}`

```java
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationDeleteParams;

client.porting().loaConfigurations().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## Preview a LOA configuration

Preview a specific LOA configuration.

`GET /porting/loa_configurations/{id}/preview`

```java
import com.telnyx.sdk.core.http.HttpResponse;
import com.telnyx.sdk.models.porting.loaconfigurations.LoaConfigurationPreview1Params;

HttpResponse response = client.porting().loaConfigurations().preview1("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## List porting related reports

List the reports generated about porting operations.

`GET /porting/reports`

```java
import com.telnyx.sdk.models.porting.reports.ReportListPage;
import com.telnyx.sdk.models.porting.reports.ReportListParams;

ReportListPage page = client.porting().reports().list();
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Create a porting related report

Generate reports about porting operations.

`POST /porting/reports`

```java
import com.telnyx.sdk.models.porting.reports.ExportPortingOrdersCsvReport;
import com.telnyx.sdk.models.porting.reports.ReportCreateParams;
import com.telnyx.sdk.models.porting.reports.ReportCreateResponse;

ReportCreateParams params = ReportCreateParams.builder()
    .params(ExportPortingOrdersCsvReport.builder()
        .filters(ExportPortingOrdersCsvReport.Filters.builder().build())
        .build())
    .reportType(ReportCreateParams.ReportType.EXPORT_PORTING_ORDERS_CSV)
    .build();
ReportCreateResponse report = client.porting().reports().create(params);
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## Retrieve a report

Retrieve a specific report generated.

`GET /porting/reports/{id}`

```java
import com.telnyx.sdk.models.porting.reports.ReportRetrieveParams;
import com.telnyx.sdk.models.porting.reports.ReportRetrieveResponse;

ReportRetrieveResponse report = client.porting().reports().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `document_id` (uuid), `id` (uuid), `params` (object), `record_type` (string), `report_type` (enum: export_porting_orders_csv), `status` (enum: pending, completed), `updated_at` (date-time)

## List available carriers in the UK

List available carriers in the UK.

`GET /porting/uk_carriers`

```java
import com.telnyx.sdk.models.porting.PortingListUkCarriersParams;
import com.telnyx.sdk.models.porting.PortingListUkCarriersResponse;

PortingListUkCarriersResponse response = client.porting().listUkCarriers();
```

Returns: `alternative_cupids` (array[string]), `created_at` (date-time), `cupid` (string), `id` (uuid), `name` (string), `record_type` (string), `updated_at` (date-time)

## List all porting orders

Returns a list of your porting order.

`GET /porting_orders`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderListPage;
import com.telnyx.sdk.models.portingorders.PortingOrderListParams;

PortingOrderListPage page = client.portingOrders().list();
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Create a porting order

Creates a new porting order object.

`POST /porting_orders` — Required: `phone_numbers`

Optional: `customer_group_reference` (string), `customer_reference` (string | null)

```java
import com.telnyx.sdk.models.portingorders.PortingOrderCreateParams;
import com.telnyx.sdk.models.portingorders.PortingOrderCreateResponse;
import java.util.List;

PortingOrderCreateParams params = PortingOrderCreateParams.builder()
    .phoneNumbers(List.of(
      "+13035550000",
      "+13035550001",
      "+13035550002"
    ))
    .build();
PortingOrderCreateResponse portingOrder = client.portingOrders().create(params);
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## List all exception types

Returns a list of all possible exception types for a porting order.

`GET /porting_orders/exception_types`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveExceptionTypesParams;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveExceptionTypesResponse;

PortingOrderRetrieveExceptionTypesResponse response = client.portingOrders().retrieveExceptionTypes();
```

Returns: `code` (enum: ACCOUNT_NUMBER_MISMATCH, AUTH_PERSON_MISMATCH, BTN_ATN_MISMATCH, ENTITY_NAME_MISMATCH, FOC_EXPIRED, FOC_REJECTED, LOCATION_MISMATCH, LSR_PENDING, MAIN_BTN_PORTING, OSP_IRRESPONSIVE, OTHER, PASSCODE_PIN_INVALID, PHONE_NUMBER_HAS_SPECIAL_FEATURE, PHONE_NUMBER_MISMATCH, PHONE_NUMBER_NOT_PORTABLE, PORT_TYPE_INCORRECT, PORTING_ORDER_SPLIT_REQUIRED, POSTAL_CODE_MISMATCH, RATE_CENTER_NOT_PORTABLE, SV_CONFLICT, SV_UNKNOWN_FAILURE), `description` (string)

## List all phone number configurations

Returns a list of phone number configurations paginated.

`GET /porting_orders/phone_number_configurations`

```java
import com.telnyx.sdk.models.portingorders.phonenumberconfigurations.PhoneNumberConfigurationListPage;
import com.telnyx.sdk.models.portingorders.phonenumberconfigurations.PhoneNumberConfigurationListParams;

PhoneNumberConfigurationListPage page = client.portingOrders().phoneNumberConfigurations().list();
```

Returns: `created_at` (date-time), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time), `user_bundle_id` (uuid)

## Create a list of phone number configurations

Creates a list of phone number configurations.

`POST /porting_orders/phone_number_configurations`

```java
import com.telnyx.sdk.models.portingorders.phonenumberconfigurations.PhoneNumberConfigurationCreateParams;
import com.telnyx.sdk.models.portingorders.phonenumberconfigurations.PhoneNumberConfigurationCreateResponse;

PhoneNumberConfigurationCreateResponse phoneNumberConfiguration = client.portingOrders().phoneNumberConfigurations().create();
```

Returns: `created_at` (date-time), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time), `user_bundle_id` (uuid)

## Retrieve a porting order

Retrieves the details of an existing porting order.

`GET /porting_orders/{id}`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveParams;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveResponse;

PortingOrderRetrieveResponse portingOrder = client.portingOrders().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Edit a porting order

Edits the details of an existing porting order. Any or all of a porting orders attributes may be included in the resource object included in a PATCH request. If a request does not include all of the attributes for a resource, the system will interpret the missing attributes as if they were included with their current values.

`PATCH /porting_orders/{id}`

Optional: `activation_settings` (object), `customer_group_reference` (string), `customer_reference` (string), `documents` (object), `end_user` (object), `messaging` (object), `misc` (object), `phone_number_configuration` (object), `requirement_group_id` (uuid), `requirements` (array[object]), `user_feedback` (object), `webhook_url` (uri)

```java
import com.telnyx.sdk.models.portingorders.PortingOrderUpdateParams;
import com.telnyx.sdk.models.portingorders.PortingOrderUpdateResponse;

PortingOrderUpdateResponse portingOrder = client.portingOrders().update("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Delete a porting order

Deletes an existing porting order. This operation is restrict to porting orders in draft state.

`DELETE /porting_orders/{id}`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderDeleteParams;

client.portingOrders().delete("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## Activate every number in a porting order asynchronously.

Activate each number in a porting order asynchronously. This operation is limited to US FastPort orders only.

`POST /porting_orders/{id}/actions/activate`

```java
import com.telnyx.sdk.models.portingorders.actions.ActionActivateParams;
import com.telnyx.sdk.models.portingorders.actions.ActionActivateResponse;

ActionActivateResponse response = client.portingOrders().actions().activate("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Cancel a porting order

`POST /porting_orders/{id}/actions/cancel`

```java
import com.telnyx.sdk.models.portingorders.actions.ActionCancelParams;
import com.telnyx.sdk.models.portingorders.actions.ActionCancelResponse;

ActionCancelResponse response = client.portingOrders().actions().cancel("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Submit a porting order.

Confirm and submit your porting order.

`POST /porting_orders/{id}/actions/confirm`

```java
import com.telnyx.sdk.models.portingorders.actions.ActionConfirmParams;
import com.telnyx.sdk.models.portingorders.actions.ActionConfirmResponse;

ActionConfirmResponse response = client.portingOrders().actions().confirm("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_settings` (object), `additional_steps` (array[string]), `created_at` (date-time), `customer_group_reference` (string | null), `customer_reference` (string | null), `description` (string), `documents` (object), `end_user` (object), `id` (uuid), `messaging` (object), `misc` (object), `old_service_provider_ocn` (string), `parent_support_key` (string | null), `phone_number_configuration` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `phone_numbers` (array[object]), `porting_phone_numbers_count` (integer), `record_type` (string), `requirements` (array[object]), `requirements_met` (boolean), `status` (object), `support_key` (string | null), `updated_at` (date-time), `user_feedback` (object), `user_id` (uuid), `webhook_url` (uri)

## Share a porting order

Creates a sharing token for a porting order. The token can be used to share the porting order with non-Telnyx users.

`POST /porting_orders/{id}/actions/share`

```java
import com.telnyx.sdk.models.portingorders.actions.ActionShareParams;
import com.telnyx.sdk.models.portingorders.actions.ActionShareResponse;

ActionShareResponse response = client.portingOrders().actions().share("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `expires_at` (date-time), `expires_in_seconds` (integer), `id` (uuid), `permissions` (array[string]), `porting_order_id` (uuid), `record_type` (string), `token` (string)

## List all porting activation jobs

Returns a list of your porting activation jobs.

`GET /porting_orders/{id}/activation_jobs`

```java
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobListPage;
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobListParams;

ActivationJobListPage page = client.portingOrders().activationJobs().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Retrieve a porting activation job

Returns a porting activation job.

`GET /porting_orders/{id}/activation_jobs/{activationJobId}`

```java
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobRetrieveParams;
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobRetrieveResponse;

ActivationJobRetrieveParams params = ActivationJobRetrieveParams.builder()
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .activationJobId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
ActivationJobRetrieveResponse activationJob = client.portingOrders().activationJobs().retrieve(params);
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## Update a porting activation job

Updates the activation time of a porting activation job.

`PATCH /porting_orders/{id}/activation_jobs/{activationJobId}`

```java
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobUpdateParams;
import com.telnyx.sdk.models.portingorders.activationjobs.ActivationJobUpdateResponse;

ActivationJobUpdateParams params = ActivationJobUpdateParams.builder()
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .activationJobId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
ActivationJobUpdateResponse activationJob = client.portingOrders().activationJobs().update(params);
```

Returns: `activate_at` (date-time), `activation_type` (enum: scheduled, on-demand), `activation_windows` (array[object]), `created_at` (date-time), `id` (uuid), `record_type` (string), `status` (enum: created, in-process, completed, failed), `updated_at` (date-time)

## List additional documents

Returns a list of additional documents for a porting order.

`GET /porting_orders/{id}/additional_documents`

```java
import com.telnyx.sdk.models.portingorders.additionaldocuments.AdditionalDocumentListPage;
import com.telnyx.sdk.models.portingorders.additionaldocuments.AdditionalDocumentListParams;

AdditionalDocumentListPage page = client.portingOrders().additionalDocuments().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `content_type` (string), `created_at` (date-time), `document_id` (uuid), `document_type` (enum: loa, invoice, csr, other), `filename` (string), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create a list of additional documents

Creates a list of additional documents for a porting order.

`POST /porting_orders/{id}/additional_documents`

```java
import com.telnyx.sdk.models.portingorders.additionaldocuments.AdditionalDocumentCreateParams;
import com.telnyx.sdk.models.portingorders.additionaldocuments.AdditionalDocumentCreateResponse;

AdditionalDocumentCreateResponse additionalDocument = client.portingOrders().additionalDocuments().create("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `content_type` (string), `created_at` (date-time), `document_id` (uuid), `document_type` (enum: loa, invoice, csr, other), `filename` (string), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete an additional document

Deletes an additional document for a porting order.

`DELETE /porting_orders/{id}/additional_documents/{additional_document_id}`

```java
import com.telnyx.sdk.models.portingorders.additionaldocuments.AdditionalDocumentDeleteParams;

AdditionalDocumentDeleteParams params = AdditionalDocumentDeleteParams.builder()
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .additionalDocumentId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
client.portingOrders().additionalDocuments().delete(params);
```

## List allowed FOC dates

Returns a list of allowed FOC dates for a porting order.

`GET /porting_orders/{id}/allowed_foc_windows`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveAllowedFocWindowsParams;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveAllowedFocWindowsResponse;

PortingOrderRetrieveAllowedFocWindowsResponse response = client.portingOrders().retrieveAllowedFocWindows("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `ended_at` (date-time), `record_type` (string), `started_at` (date-time)

## List all comments of a porting order

Returns a list of all comments of a porting order.

`GET /porting_orders/{id}/comments`

```java
import com.telnyx.sdk.models.portingorders.comments.CommentListPage;
import com.telnyx.sdk.models.portingorders.comments.CommentListParams;

CommentListPage page = client.portingOrders().comments().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `body` (string), `created_at` (date-time), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `user_type` (enum: admin, user, system)

## Create a comment for a porting order

Creates a new comment for a porting order.

`POST /porting_orders/{id}/comments`

Optional: `body` (string)

```java
import com.telnyx.sdk.models.portingorders.comments.CommentCreateParams;
import com.telnyx.sdk.models.portingorders.comments.CommentCreateResponse;

CommentCreateResponse comment = client.portingOrders().comments().create("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `body` (string), `created_at` (date-time), `id` (uuid), `porting_order_id` (uuid), `record_type` (string), `user_type` (enum: admin, user, system)

## Download a porting order loa template

`GET /porting_orders/{id}/loa_template`

```java
import com.telnyx.sdk.core.http.HttpResponse;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveLoaTemplateParams;

HttpResponse response = client.portingOrders().retrieveLoaTemplate("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## List porting order requirements

Returns a list of all requirements based on country/number type for this porting order.

`GET /porting_orders/{id}/requirements`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveRequirementsPage;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveRequirementsParams;

PortingOrderRetrieveRequirementsPage page = client.portingOrders().retrieveRequirements("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `field_type` (enum: document, textual), `field_value` (string), `record_type` (string), `requirement_status` (string), `requirement_type` (object)

## Retrieve the associated V1 sub_request_id and port_request_id

`GET /porting_orders/{id}/sub_request`

```java
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveSubRequestParams;
import com.telnyx.sdk.models.portingorders.PortingOrderRetrieveSubRequestResponse;

PortingOrderRetrieveSubRequestResponse response = client.portingOrders().retrieveSubRequest("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `port_request_id` (string), `sub_request_id` (string)

## List verification codes

Returns a list of verification codes for a porting order.

`GET /porting_orders/{id}/verification_codes`

```java
import com.telnyx.sdk.models.portingorders.verificationcodes.VerificationCodeListPage;
import com.telnyx.sdk.models.portingorders.verificationcodes.VerificationCodeListParams;

VerificationCodeListPage page = client.portingOrders().verificationCodes().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `id` (uuid), `phone_number` (string), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time), `verified` (boolean)

## Send the verification codes

Send the verification code for all porting phone numbers.

`POST /porting_orders/{id}/verification_codes/send`

```java
import com.telnyx.sdk.models.portingorders.verificationcodes.VerificationCodeSendParams;

client.portingOrders().verificationCodes().send("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

## Verify the verification code for a list of phone numbers

Verifies the verification code for a list of phone numbers.

`POST /porting_orders/{id}/verification_codes/verify`

```java
import com.telnyx.sdk.models.portingorders.verificationcodes.VerificationCodeVerifyParams;
import com.telnyx.sdk.models.portingorders.verificationcodes.VerificationCodeVerifyResponse;

VerificationCodeVerifyResponse response = client.portingOrders().verificationCodes().verify("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `created_at` (date-time), `id` (uuid), `phone_number` (string), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time), `verified` (boolean)

## List action requirements for a porting order

Returns a list of action requirements for a specific porting order.

`GET /porting_orders/{porting_order_id}/action_requirements`

```java
import com.telnyx.sdk.models.portingorders.actionrequirements.ActionRequirementListPage;
import com.telnyx.sdk.models.portingorders.actionrequirements.ActionRequirementListParams;

ActionRequirementListPage page = client.portingOrders().actionRequirements().list("porting_order_id");
```

Returns: `action_type` (string), `action_url` (string | null), `cancel_reason` (string | null), `created_at` (date-time), `id` (string), `porting_order_id` (string), `record_type` (enum: porting_action_requirement), `requirement_type_id` (string), `status` (enum: created, pending, completed, cancelled, failed), `updated_at` (date-time)

## Initiate an action requirement

Initiates a specific action requirement for a porting order.

`POST /porting_orders/{porting_order_id}/action_requirements/{id}/initiate`

```java
import com.telnyx.sdk.models.portingorders.actionrequirements.ActionRequirementInitiateParams;
import com.telnyx.sdk.models.portingorders.actionrequirements.ActionRequirementInitiateResponse;

ActionRequirementInitiateParams params = ActionRequirementInitiateParams.builder()
    .portingOrderId("porting_order_id")
    .id("id")
    .params(ActionRequirementInitiateParams.Params.builder()
        .firstName("John")
        .lastName("Doe")
        .build())
    .build();
ActionRequirementInitiateResponse response = client.portingOrders().actionRequirements().initiate(params);
```

Returns: `action_type` (string), `action_url` (string | null), `cancel_reason` (string | null), `created_at` (date-time), `id` (string), `porting_order_id` (string), `record_type` (enum: porting_action_requirement), `requirement_type_id` (string), `status` (enum: created, pending, completed, cancelled, failed), `updated_at` (date-time)

## List all associated phone numbers

Returns a list of all associated phone numbers for a porting order. Associated phone numbers are used for partial porting in GB to specify which phone numbers should be kept or disconnected.

`GET /porting_orders/{porting_order_id}/associated_phone_numbers`

```java
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberListPage;
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberListParams;

AssociatedPhoneNumberListPage page = client.portingOrders().associatedPhoneNumbers().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create an associated phone number

Creates a new associated phone number for a porting order. This is used for partial porting in GB to specify which phone numbers should be kept or disconnected.

`POST /porting_orders/{porting_order_id}/associated_phone_numbers`

```java
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberCreateParams;
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberCreateResponse;

AssociatedPhoneNumberCreateParams params = AssociatedPhoneNumberCreateParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .action(AssociatedPhoneNumberCreateParams.Action.KEEP)
    .phoneNumberRange(AssociatedPhoneNumberCreateParams.PhoneNumberRange.builder().build())
    .build();
AssociatedPhoneNumberCreateResponse associatedPhoneNumber = client.portingOrders().associatedPhoneNumbers().create(params);
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete an associated phone number

Deletes an associated phone number from a porting order.

`DELETE /porting_orders/{porting_order_id}/associated_phone_numbers/{id}`

```java
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberDeleteParams;
import com.telnyx.sdk.models.portingorders.associatedphonenumbers.AssociatedPhoneNumberDeleteResponse;

AssociatedPhoneNumberDeleteParams params = AssociatedPhoneNumberDeleteParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
AssociatedPhoneNumberDeleteResponse associatedPhoneNumber = client.portingOrders().associatedPhoneNumbers().delete(params);
```

Returns: `action` (enum: keep, disconnect), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `porting_order_id` (uuid), `record_type` (string), `updated_at` (date-time)

## List all phone number blocks

Returns a list of all phone number blocks of a porting order.

`GET /porting_orders/{porting_order_id}/phone_number_blocks`

```java
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockListPage;
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockListParams;

PhoneNumberBlockListPage page = client.portingOrders().phoneNumberBlocks().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## Create a phone number block

Creates a new phone number block.

`POST /porting_orders/{porting_order_id}/phone_number_blocks`

```java
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockCreateParams;
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockCreateResponse;

PhoneNumberBlockCreateParams params = PhoneNumberBlockCreateParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .addActivationRange(PhoneNumberBlockCreateParams.ActivationRange.builder()
        .endAt("+4930244999910")
        .startAt("+4930244999901")
        .build())
    .phoneNumberRange(PhoneNumberBlockCreateParams.PhoneNumberRange.builder()
        .endAt("+4930244999910")
        .startAt("+4930244999901")
        .build())
    .build();
PhoneNumberBlockCreateResponse phoneNumberBlock = client.portingOrders().phoneNumberBlocks().create(params);
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## Delete a phone number block

Deletes a phone number block.

`DELETE /porting_orders/{porting_order_id}/phone_number_blocks/{id}`

```java
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockDeleteParams;
import com.telnyx.sdk.models.portingorders.phonenumberblocks.PhoneNumberBlockDeleteResponse;

PhoneNumberBlockDeleteParams params = PhoneNumberBlockDeleteParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
PhoneNumberBlockDeleteResponse phoneNumberBlock = client.portingOrders().phoneNumberBlocks().delete(params);
```

Returns: `activation_ranges` (array[object]), `country_code` (string), `created_at` (date-time), `id` (uuid), `phone_number_range` (object), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `record_type` (string), `updated_at` (date-time)

## List all phone number extensions

Returns a list of all phone number extensions of a porting order.

`GET /porting_orders/{porting_order_id}/phone_number_extensions`

```java
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionListPage;
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionListParams;

PhoneNumberExtensionListPage page = client.portingOrders().phoneNumberExtensions().list("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Create a phone number extension

Creates a new phone number extension.

`POST /porting_orders/{porting_order_id}/phone_number_extensions`

```java
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionCreateParams;
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionCreateResponse;

PhoneNumberExtensionCreateParams params = PhoneNumberExtensionCreateParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .addActivationRange(PhoneNumberExtensionCreateParams.ActivationRange.builder()
        .endAt(10L)
        .startAt(1L)
        .build())
    .extensionRange(PhoneNumberExtensionCreateParams.ExtensionRange.builder()
        .endAt(10L)
        .startAt(1L)
        .build())
    .portingPhoneNumberId("f24151b6-3389-41d3-8747-7dd8c681e5e2")
    .build();
PhoneNumberExtensionCreateResponse phoneNumberExtension = client.portingOrders().phoneNumberExtensions().create(params);
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## Delete a phone number extension

Deletes a phone number extension.

`DELETE /porting_orders/{porting_order_id}/phone_number_extensions/{id}`

```java
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionDeleteParams;
import com.telnyx.sdk.models.portingorders.phonenumberextensions.PhoneNumberExtensionDeleteResponse;

PhoneNumberExtensionDeleteParams params = PhoneNumberExtensionDeleteParams.builder()
    .portingOrderId("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .id("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
    .build();
PhoneNumberExtensionDeleteResponse phoneNumberExtension = client.portingOrders().phoneNumberExtensions().delete(params);
```

Returns: `activation_ranges` (array[object]), `created_at` (date-time), `extension_range` (object), `id` (uuid), `porting_phone_number_id` (uuid), `record_type` (string), `updated_at` (date-time)

## List all porting phone numbers

Returns a list of your porting phone numbers.

`GET /porting_phone_numbers`

```java
import com.telnyx.sdk.models.portingphonenumbers.PortingPhoneNumberListPage;
import com.telnyx.sdk.models.portingphonenumbers.PortingPhoneNumberListParams;

PortingPhoneNumberListPage page = client.portingPhoneNumbers().list();
```

Returns: `activation_status` (enum: New, Pending, Conflict, Cancel Pending, Failed, Concurred, Activate RDY, Disconnect Pending, Concurrence Sent, Old, Sending, Active, Cancelled), `phone_number` (string), `phone_number_type` (enum: landline, local, mobile, national, shared_cost, toll_free), `portability_status` (enum: pending, confirmed, provisional), `porting_order_id` (uuid), `porting_order_status` (enum: draft, in-process, submitted, exception, foc-date-confirmed, cancel-pending, ported, cancelled), `record_type` (string), `requirements_status` (enum: requirement-info-pending, requirement-info-under-review, requirement-info-exception, approved), `support_key` (string)
