---
name: package
description: "Zuora Java SDK (zuora-sdk-java) for subscription billing, invoicing, payments, and product catalog management with auto-authentication and fluent builder API"
metadata:
  languages: "java"
  versions: "3.15.0"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,java,sdk,billing,subscriptions,payments"
---
# Zuora Java SDK Guide

## 1. Golden Rules

**Always use `ZuoraClient` with auto-auth.** The `ZuoraClient` class manages OAuth2 authentication and token refresh automatically. Never manage tokens manually.

**Always call `zuoraClient.initialize()`** after creating the client. This authenticates with Zuora and prepares the client for API calls.

**Use the fluent builder pattern.** All request models support method chaining for readable, type-safe request construction.

**Always catch `ApiException`.** Parse `getResponseBody()` with `CommonResponse.fromJson()` for structured error details.

**Current SDK Version:** 3.15.0 | **API Version:** 2025-08-12 | **Java:** 11+

## 2. Installation

### Maven

```xml
<dependency>
    <groupId>com.zuora.sdk</groupId>
    <artifactId>zuora-sdk-java</artifactId>
    <version>3.15.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.zuora.sdk:zuora-sdk-java:3.15.0'
```

### Key Dependencies

- OkHttp 4.10.0 (HTTP client)
- Gson 2.10.1 (JSON serialization)
- Jackson 2.16.1 (alternative serialization)

### Build Requirements

- Java 11+
- Maven 3.8.3+ (if using Maven)

## 3. Initialization

### Basic Setup

```java
import com.zuora.ZuoraClient;

ZuoraClient zuoraClient = new ZuoraClient(
    System.getenv("ZUORA_CLIENT_ID"),
    System.getenv("ZUORA_CLIENT_SECRET"),
    ZuoraClient.ZuoraEnv.SBX
);
zuoraClient.initialize();
```

### With Debug Mode

```java
ZuoraClient zuoraClient = new ZuoraClient(
    System.getenv("ZUORA_CLIENT_ID"),
    System.getenv("ZUORA_CLIENT_SECRET"),
    ZuoraClient.ZuoraEnv.SBX
);
zuoraClient.setDebugging(true);  // Log full request/response
zuoraClient.initialize();
```

### Available Environments

| Enum | Environment |
|---|---|
| `ZuoraClient.ZuoraEnv.SBX` | US Sandbox (Cloud 2) |
| `ZuoraClient.ZuoraEnv.PROD` | US Production (Cloud 2) |

## 4. API Client Methods

The `ZuoraClient` exposes typed API accessors:

| Method | API Surface |
|---|---|
| `zuoraClient.accountsApi()` | Account CRUD |
| `zuoraClient.ordersApi()` | Order & subscription lifecycle |
| `zuoraClient.invoicesApi()` | Invoice management |
| `zuoraClient.paymentsApi()` | Payment processing |
| `zuoraClient.productsApi()` | Product catalog CRUD |
| `zuoraClient.productRatePlansApi()` | Rate plan management |
| `zuoraClient.productRatePlanChargesApi()` | Charge management |
| `zuoraClient.objectQueriesApi()` | Object Query API |
| `zuoraClient.usageApi()` | Usage records |
| `zuoraClient.billRunApi()` | Bill run operations |

### Execution Pattern

All API methods return a request builder. Call `.execute()` to send the request:

```java
// Standard execution
CreateAccountResponse response = zuoraClient.accountsApi()
    .createAccountApi(request)
    .execute();

// With HTTP info (headers, status code, request ID)
ApiResponse<CreateAccountResponse> response = zuoraClient.accountsApi()
    .createAccountApi(request)
    .executeWithHttpInfo();

String requestId = response.getZuoraRequestId();
```

## 5. Core Usage

### Accounts

```java
import com.zuora.model.*;

// Create account with payment method
CreateAccountContact contact = new CreateAccountContact()
    .firstName("Jane").lastName("Doe")
    .workEmail("jane@acme.com")
    .country("United States").state("CA");

CreateAccountPaymentMethod paymentMethod = new CreateAccountPaymentMethod()
    .type("CreditCard").cardType("Visa")
    .cardNumber("4111111111111111")
    .expirationMonth(10).expirationYear(2030)
    .securityCode("123")
    .cardHolderInfo(new CreatePaymentMethodCardholderInfo()
        .cardHolderName("Jane Doe"));

CreateAccountRequest request = new CreateAccountRequest()
    .name("Acme Corp")
    .billToContact(contact)
    .paymentMethod(paymentMethod)
    .billCycleDay(1)
    .soldToSameAsBillTo(true)
    .autoPay(false)
    .currency("USD");

ApiResponse<CreateAccountResponse> response = zuoraClient.accountsApi()
    .createAccountApi(request)
    .executeWithHttpInfo();

System.out.println("Request ID: " + response.getZuoraRequestId());
System.out.println("Account ID: " + response.getData().getAccountId());
```

```java
// Custom fields
CreateAccountRequest request = new CreateAccountRequest()
    .name("Acme Corp")
    .billToContact(contact)
    .putAdditionalProperty("salesRegion__c", "West");
```

### Product Catalog

```java
import com.zuora.model.*;
import java.time.LocalDate;
import java.util.List;

// Create product
CreateProductRequest productRequest = new CreateProductRequest()
    .name("Gold Membership")
    .effectiveStartDate(LocalDate.of(2024, 1, 1))
    .effectiveEndDate(LocalDate.of(2034, 1, 1))
    .SKU("SKU-GOLD-001")
    .description("Premium subscription tier");

ProxyCreateOrModifyResponse productResponse = zuoraClient.productsApi()
    .createProductApi(productRequest).execute();

if (productResponse.getSuccess()) {
    String productId = productResponse.getId();

    // Create rate plan
    CreateProductRatePlanRequest planRequest = new CreateProductRatePlanRequest()
        .name("Monthly Plan")
        .productId(productId)
        .effectiveStartDate(LocalDate.of(2024, 1, 1))
        .effectiveEndDate(LocalDate.of(2034, 1, 1))
        .description("Monthly billing plan")
        .activeCurrencies(List.of("USD"));

    ProxyCreateOrModifyResponse planResponse = zuoraClient.productRatePlansApi()
        .createProductRatePlanApi(planRequest).execute();

    if (planResponse.getSuccess()) {
        // Create charge with pricing tier
        CreateProductRatePlanChargeRequest chargeRequest =
            new CreateProductRatePlanChargeRequest()
                .name("Monthly Fee")
                .chargeModel(ChargeModelProductRatePlanChargeRest.FLAT_FEE_PRICING)
                .chargeType(ChargeType.RECURRING)
                .triggerEvent(TriggerEventProductRatePlanChargeRest.CONTRACTEFFECTIVE)
                .productRatePlanId(planResponse.getId())
                .billCycleType(BillCycleType.DEFAULTFROMCUSTOMER)
                .billingPeriod(BillingPeriodProductRatePlanChargeRest.MONTHLY)
                .useDiscountSpecificAccountingCode(false)
                .productRatePlanChargeTierData(new ProductRatePlanChargeTierData()
                    .addProductRatePlanChargeTierItem(
                        new ProductRatePlanChargeTier()
                            .currency("USD")
                            .price(29.99)));

        zuoraClient.productRatePlanChargesApi()
            .createProductRatePlanChargeApi(chargeRequest).execute();
    }
}

// Verify product
GetProductResponse product = zuoraClient.productsApi()
    .getProductApi(productResponse.getId()).execute();
```

### Orders & Subscriptions

```java
import com.zuora.model.*;

// Create subscription via Order API
CreateOrderRequest orderRequest = new CreateOrderRequest()
    .orderDate(LocalDate.now())
    .existingAccountNumber("A00000001")
    .addSubscriptionsItem(new CreateOrderSubscription()
        .addOrderActionsItem(new CreateOrderAction()
            .type(OrderActionType.CREATESUBSCRIPTION)
            .createSubscription(new CreateOrderCreateSubscription()
                .terms(new OrderActionCreateSubscriptionTerms()
                    .initialTerm(new InitialTerm()
                        .termType(TermType.EVERGREEN)))
                .addSubscribeToRatePlansItem(
                    new CreateOrderRatePlanOverride()
                        .productRatePlanNumber("PRP-00000151")))))
    .processingOptions(new ProcessingOptionsWithDelayedCapturePayment()
        .runBilling(true)
        .billingOptions(new BillingOptions()
            .targetDate(LocalDate.now())));

CreateOrderResponse orderResponse = zuoraClient.ordersApi()
    .createOrderApi(orderRequest).execute();
```

### Object Query

```java
// Query accounts with subscriptions
ExpandedAccount account = zuoraClient.objectQueriesApi()
    .queryAccountByKeyApi("A00000001")
    .expand(List.of("billTo", "subscriptions"))
    .execute();

// Query with filters
QueryAccountsResponse accounts = zuoraClient.objectQueriesApi()
    .queryAccountsApi()
    .filter(List.of("currency.EQ:USD", "status.EQ:Active"))
    .sort(List.of("accountNumber.ASC"))
    .pageSize(20)
    .execute();
```

## 6. Error Handling

```java
import com.zuora.ApiException;
import com.zuora.model.CommonResponse;

try {
    CreateAccountResponse response = zuoraClient.accountsApi()
        .createAccountApi(request).execute();
} catch (ApiException e) {
    System.err.println("HTTP Status: " + e.getCode());

    CommonResponse errorResponse = CommonResponse.fromJson(e.getResponseBody());
    if (errorResponse.getReasons() != null) {
        errorResponse.getReasons().forEach(reason ->
            System.err.printf("Code: %s, Message: %s%n",
                reason.getCode(), reason.getMessage()));
    }
}
```

### Common Patterns

```java
// Check for 401 (unauthorized) — re-initialize client
try {
    zuoraClient.accountsApi().createAccountApi(request).execute();
} catch (ApiException e) {
    if (e.getCode() == 401) {
        zuoraClient.initialize();  // Re-authenticate
        // Retry the operation
    }
}
```

## 7. Charge Models (Enum Reference)

| Enum | Description |
|---|---|
| `ChargeModelProductRatePlanChargeRest.FLAT_FEE_PRICING` | Fixed price per period |
| `ChargeModelProductRatePlanChargeRest.PER_UNIT_PRICING` | Price per unit |
| `ChargeModelProductRatePlanChargeRest.TIERED_PRICING` | Volume tiers (each tier priced separately) |
| `ChargeModelProductRatePlanChargeRest.VOLUME_PRICING` | Total volume determines single price |
| `ChargeModelProductRatePlanChargeRest.OVERAGE_PRICING` | Charges for usage over included units |
| `ChargeModelProductRatePlanChargeRest.DISCOUNT_FIXED_AMOUNT` | Fixed discount |
| `ChargeModelProductRatePlanChargeRest.DISCOUNT_PERCENTAGE` | Percentage discount |

| Enum | Description |
|---|---|
| `ChargeType.RECURRING` | Billed on regular schedule |
| `ChargeType.ONETIME` | Billed once |
| `ChargeType.USAGE` | Billed based on consumption |

| Enum | Description |
|---|---|
| `BillingPeriodProductRatePlanChargeRest.MONTHLY` | Monthly billing |
| `BillingPeriodProductRatePlanChargeRest.ANNUAL` | Annual billing |
| `BillingPeriodProductRatePlanChargeRest.QUARTERLY` | Quarterly billing |

## 8. Advanced Features

### HTTP Response Details

```java
ApiResponse<CreateAccountResponse> response = zuoraClient.accountsApi()
    .createAccountApi(request)
    .executeWithHttpInfo();

int statusCode = response.getStatusCode();
String requestId = response.getZuoraRequestId();
Map<String, List<String>> headers = response.getHeaders();
CreateAccountResponse data = response.getData();
```

### JSON Serialization

```java
// Serialize any model to JSON
String json = response.toJson();

// Deserialize from JSON
CommonResponse errorResponse = CommonResponse.fromJson(jsonString);
```

### Custom Fields

```java
// Add custom fields via putAdditionalProperty
CreateAccountRequest request = new CreateAccountRequest()
    .name("Acme Corp")
    .putAdditionalProperty("salesRegion__c", "West")
    .putAdditionalProperty("industry__c", "Technology");
```

## 9. Production Checklist

- [ ] Switch `ZuoraClient.ZuoraEnv.SBX` to `ZuoraClient.ZuoraEnv.PROD`
- [ ] Use environment variables or secure vault for credentials
- [ ] Call `zuoraClient.initialize()` at application startup
- [ ] Wrap all API calls in try/catch for `ApiException`
- [ ] Parse `CommonResponse.fromJson()` for structured error handling
- [ ] Check `response.getSuccess()` for create/update operations
- [ ] Disable debugging in production (`setDebugging(false)`)
- [ ] Use `executeWithHttpInfo()` for operations needing request tracing
- [ ] Handle rate limiting (429) with exponential backoff
- [ ] Test full order-to-cash flow in Sandbox before Production
- [ ] Configure appropriate JVM connection pool settings for OkHttp
