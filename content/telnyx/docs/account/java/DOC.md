---
name: account
description: "Manage account balance, payments, invoices, webhooks, and view audit logs and detail records."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,account,billing,balance,invoices,webhooks"
---

# Telnyx Account Java SDK Coding Guidelines

You are a Telnyx Account API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

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

## List Audit Logs

Retrieve a list of audit log entries. Audit logs are a best-effort, eventually consistent record of significant account-related changes.

`GET /audit_events`

```java
import com.telnyx.sdk.models.auditevents.AuditEventListPage;
import com.telnyx.sdk.models.auditevents.AuditEventListParams;

AuditEventListPage page = client.auditEvents().list();
```

Returns: `alternate_resource_id` (string | null), `change_made_by` (enum: telnyx, account_manager, account_owner, organization_member), `change_type` (string), `changes` (array | null), `created_at` (date-time), `id` (uuid), `organization_id` (uuid), `record_type` (string), `resource_id` (string), `user_id` (uuid)

## Get user balance details

`GET /balance`

```java
import com.telnyx.sdk.models.balance.BalanceRetrieveParams;
import com.telnyx.sdk.models.balance.BalanceRetrieveResponse;

BalanceRetrieveResponse balance = client.balance().retrieve();
```

Returns: `available_credit` (string), `balance` (string), `credit_limit` (string), `currency` (string), `pending` (string), `record_type` (enum: balance)

## Get monthly charges breakdown

Retrieve a detailed breakdown of monthly charges for phone numbers in a specified date range. The date range cannot exceed 31 days.

`GET /charges_breakdown`

```java
import com.telnyx.sdk.models.chargesbreakdown.ChargesBreakdownRetrieveParams;
import com.telnyx.sdk.models.chargesbreakdown.ChargesBreakdownRetrieveResponse;
import java.time.LocalDate;

ChargesBreakdownRetrieveParams params = ChargesBreakdownRetrieveParams.builder()
    .startDate(LocalDate.parse("2025-05-01"))
    .build();
ChargesBreakdownRetrieveResponse chargesBreakdown = client.chargesBreakdown().retrieve(params);
```

Returns: `currency` (string), `end_date` (date), `results` (array[object]), `start_date` (date), `user_email` (email), `user_id` (string)

## Get monthly charges summary

Retrieve a summary of monthly charges for a specified date range. The date range cannot exceed 31 days.

`GET /charges_summary`

```java
import com.telnyx.sdk.models.chargessummary.ChargesSummaryRetrieveParams;
import com.telnyx.sdk.models.chargessummary.ChargesSummaryRetrieveResponse;
import java.time.LocalDate;

ChargesSummaryRetrieveParams params = ChargesSummaryRetrieveParams.builder()
    .endDate(LocalDate.parse("2025-06-01"))
    .startDate(LocalDate.parse("2025-05-01"))
    .build();
ChargesSummaryRetrieveResponse chargesSummary = client.chargesSummary().retrieve(params);
```

Returns: `currency` (string), `end_date` (date), `start_date` (date), `summary` (object), `total` (object), `user_email` (email), `user_id` (string)

## Search detail records

Search for any detail record across the Telnyx Platform

`GET /detail_records`

```java
import com.telnyx.sdk.models.detailrecords.DetailRecordListPage;
import com.telnyx.sdk.models.detailrecords.DetailRecordListParams;

DetailRecordListPage page = client.detailRecords().list();
```

Returns: `data` (array[object]), `meta` (object)

## List invoices

Retrieve a paginated list of invoices.

`GET /invoices`

```java
import com.telnyx.sdk.models.invoices.InvoiceListPage;
import com.telnyx.sdk.models.invoices.InvoiceListParams;

InvoiceListPage page = client.invoices().list();
```

Returns: `file_id` (uuid), `invoice_id` (uuid), `paid` (boolean), `period_end` (date), `period_start` (date), `url` (uri)

## Get invoice by ID

Retrieve a single invoice by its unique identifier.

`GET /invoices/{id}`

```java
import com.telnyx.sdk.models.invoices.InvoiceRetrieveParams;
import com.telnyx.sdk.models.invoices.InvoiceRetrieveResponse;

InvoiceRetrieveResponse invoice = client.invoices().retrieve("182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e");
```

Returns: `download_url` (uri), `file_id` (uuid), `invoice_id` (uuid), `paid` (boolean), `period_end` (date), `period_start` (date), `url` (uri)

## List auto recharge preferences

Returns the payment auto recharge preferences.

`GET /payment/auto_recharge_prefs`

```java
import com.telnyx.sdk.models.payment.autorechargeprefs.AutoRechargePrefListParams;
import com.telnyx.sdk.models.payment.autorechargeprefs.AutoRechargePrefListResponse;

AutoRechargePrefListResponse autoRechargePrefs = client.payment().autoRechargePrefs().list();
```

Returns: `enabled` (boolean), `id` (string), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `record_type` (string), `threshold_amount` (string)

## Update auto recharge preferences

Update payment auto recharge preferences.

`PATCH /payment/auto_recharge_prefs`

Optional: `enabled` (boolean), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `threshold_amount` (string)

```java
import com.telnyx.sdk.models.payment.autorechargeprefs.AutoRechargePrefUpdateParams;
import com.telnyx.sdk.models.payment.autorechargeprefs.AutoRechargePrefUpdateResponse;

AutoRechargePrefUpdateResponse autoRechargePref = client.payment().autoRechargePrefs().update();
```

Returns: `enabled` (boolean), `id` (string), `invoice_enabled` (boolean), `preference` (enum: credit_paypal, ach), `recharge_amount` (string), `record_type` (string), `threshold_amount` (string)

## List User Tags

List all user tags.

`GET /user_tags`

```java
import com.telnyx.sdk.models.usertags.UserTagListParams;
import com.telnyx.sdk.models.usertags.UserTagListResponse;

UserTagListResponse userTags = client.userTags().list();
```

Returns: `number_tags` (array[string]), `outbound_profile_tags` (array[string])

## Create a stored payment transaction

`POST /v2/payment/stored_payment_transactions` — Required: `amount`

```java
import com.telnyx.sdk.models.payment.PaymentCreateStoredPaymentTransactionParams;
import com.telnyx.sdk.models.payment.PaymentCreateStoredPaymentTransactionResponse;

PaymentCreateStoredPaymentTransactionParams params = PaymentCreateStoredPaymentTransactionParams.builder()
    .amount("120.00")
    .build();
PaymentCreateStoredPaymentTransactionResponse response = client.payment().createStoredPaymentTransaction(params);
```

Returns: `amount_cents` (integer), `amount_currency` (string), `auto_recharge` (boolean), `created_at` (date-time), `id` (string), `processor_status` (string), `record_type` (enum: transaction), `transaction_processing_type` (enum: stored_payment)

## List webhook deliveries

Lists webhook_deliveries for the authenticated user

`GET /webhook_deliveries`

```java
import com.telnyx.sdk.models.webhookdeliveries.WebhookDeliveryListPage;
import com.telnyx.sdk.models.webhookdeliveries.WebhookDeliveryListParams;

WebhookDeliveryListPage page = client.webhookDeliveries().list();
```

Returns: `attempts` (array[object]), `finished_at` (date-time), `id` (uuid), `record_type` (string), `started_at` (date-time), `status` (enum: delivered, failed), `user_id` (uuid), `webhook` (object)

## Find webhook_delivery details by ID

Provides webhook_delivery debug data, such as timestamps, delivery status and attempts.

`GET /webhook_deliveries/{id}`

```java
import com.telnyx.sdk.models.webhookdeliveries.WebhookDeliveryRetrieveParams;
import com.telnyx.sdk.models.webhookdeliveries.WebhookDeliveryRetrieveResponse;

WebhookDeliveryRetrieveResponse webhookDelivery = client.webhookDeliveries().retrieve("C9C0797E-901D-4349-A33C-C2C8F31A92C2");
```

Returns: `attempts` (array[object]), `finished_at` (date-time), `id` (uuid), `record_type` (string), `started_at` (date-time), `status` (enum: delivered, failed), `user_id` (uuid), `webhook` (object)
