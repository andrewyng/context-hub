---
name: package
description: "Zuora C# SDK (ZuoraSDK) for subscription billing, invoicing, payments, and product catalog management with auto-authentication and async support on .NET 8+"
metadata:
  languages: "csharp"
  versions: "1.7.0"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,csharp,dotnet,sdk,billing,subscriptions,payments"
---
# Zuora C# SDK Guide

## 1. Golden Rules

**Always use `ZuoraClient` with auto-auth.** The `ZuoraClient` class manages OAuth2 authentication and token refresh automatically. Never manage tokens manually.

**Always call `zuoraClient.Initialize()`** after creating the client.

**Use both sync and async methods.** The SDK provides synchronous methods and `Async` variants for non-blocking operations.

**Current SDK Version:** 1.7.0 | **API Version:** 2024-05-20 | **.NET:** 8.0+

## 2. Installation

### NuGet

```bash
dotnet add package ZuoraSDK
```

```powershell
Install-Package ZuoraSDK
```

### Key Dependencies

- RestSharp 112.0.0 (HTTP client)
- Newtonsoft.Json 13.0.3 (JSON serialization)
- Polly 8.1.0 (resilience/retry policies)
- System.Text.Json 8.0.6

## 3. Initialization

### Basic Setup

```csharp
using ZuoraSDK.Client;

var zuoraClient = new ZuoraClient(
    Environment.GetEnvironmentVariable("ZUORA_CLIENT_ID"),
    Environment.GetEnvironmentVariable("ZUORA_CLIENT_SECRET"),
    ZuoraEnv.SBX
);
zuoraClient.Initialize();
```

### With Debug Mode

```csharp
var zuoraClient = new ZuoraClient(
    Environment.GetEnvironmentVariable("ZUORA_CLIENT_ID"),
    Environment.GetEnvironmentVariable("ZUORA_CLIENT_SECRET"),
    ZuoraEnv.SBX
);
zuoraClient.SetDebugging(true);
// zuoraClient.SetHttpTimeout(110000);  // Optional timeout in ms
zuoraClient.Initialize();
```

### Available Environments

| Enum | Environment |
|---|---|
| `ZuoraEnv.SBX` | US Sandbox (Cloud 2) |
| `ZuoraEnv.PROD` | US Production (Cloud 2) |

## 4. API Client Properties

The `ZuoraClient` exposes typed API accessors:

| Property | API Surface |
|---|---|
| `zuoraClient.AccountsApi` | Account CRUD |
| `zuoraClient.OrdersApi` | Order & subscription lifecycle |
| `zuoraClient.InvoicesApi` | Invoice management |
| `zuoraClient.PaymentsApi` | Payment processing |
| `zuoraClient.ProductsApi` | Product catalog CRUD |
| `zuoraClient.ProductRatePlansApi` | Rate plan management |
| `zuoraClient.ProductRatePlanChargesApi` | Charge management |
| `zuoraClient.ObjectQueriesApi` | Object Query API |

### Sync vs Async

Most API methods have both synchronous and async variants:

```csharp
// Synchronous
CreateAccountResponse response = zuoraClient.AccountsApi.CreateAccount(request);

// Asynchronous
CreateAccountResponse response = await zuoraClient.AccountsApi.CreateAccountAsync(request);
```

## 5. Core Usage

### Accounts

```csharp
using ZuoraSDK.Client;
using ZuoraSDK.Model;

// Create account with payment method
var contact = new CreateAccountContact(
    firstName: "Jane",
    lastName: "Doe",
    country: "United States",
    state: "CA"
);

var paymentMethod = new CreateAccountPaymentMethod(
    type: "CreditCard",
    cardType: "Visa",
    cardNumber: "4111111111111111",
    expirationMonth: 10,
    expirationYear: 2030,
    securityCode: "123",
    cardHolderInfo: new CreatePaymentMethodCardholderInfo(
        cardHolderName: "Jane Doe"
    )
);

var createAccountRequest = new CreateAccountRequest(
    name: "Acme Corp",
    billToContact: contact,
    paymentMethod: paymentMethod,
    billCycleDay: 1,
    soldToSameAsBillTo: true,
    autoPay: false,
    currency: "USD"
);

// Custom fields
createAccountRequest.AdditionalProperties.Add("salesRegion__c", "West");

CreateAccountResponse response = zuoraClient.AccountsApi.CreateAccount(createAccountRequest);
Console.WriteLine(response.ToJson());
```

```csharp
// Update account
var updateRequest = new UpdateAccountRequest(name: "Acme Corporation", billCycleDay: 15);
CommonResponse updateResponse = zuoraClient.AccountsApi.UpdateAccount(
    response.AccountId, updateRequest);

// Get account
AccountDetailResponse account = zuoraClient.AccountsApi.GetAccount(response.AccountId);

// Delete account
DeleteAccountResponse deleteResponse = zuoraClient.AccountsApi.DeleteAccount(
    response.AccountId);
```

### Orders & Subscriptions

```csharp
using ZuoraSDK.Model;

// Preview order (async)
PreviewOrderResponse preview = await zuoraClient.OrdersApi.PreviewOrderAsync(
    new PreviewOrderRequest(
        orderDate: DateOnly.FromDateTime(DateTime.Today),
        existingAccountNumber: "A00000001",
        subscriptions: [
            new PreviewOrderSubscriptions(
                orderActions: [
                    new PreviewOrderOrderAction(
                        type: OrderActionType.CreateSubscription,
                        createSubscription: new PreviewOrderCreateSubscription(
                            terms: new PreviewOrderCreateSubscriptionTerms(
                                initialTerm: new InitialTerm(
                                    termType: TermType.EVERGREEN)),
                            subscribeToRatePlans: [
                                new PreviewOrderRatePlanOverride(
                                    productRatePlanId: "rate-plan-id")]))])],
        previewOptions: new PreviewOptions(
            previewThruType: PreviewOptionsPreviewThruType.NumberOfPeriods,
            previewNumberOfPeriods: 1,
            previewTypes: [PreviewOptions.PreviewTypesEnum.BillingDocs])));
Console.WriteLine(preview.ToJson());
```

```csharp
// Create order (subscription)
CreateOrderResponse order = zuoraClient.OrdersApi.CreateOrder(
    new CreateOrderRequest(
        orderDate: DateOnly.FromDateTime(DateTime.Today),
        existingAccountNumber: "A00000001",
        subscriptions: [
            new CreateOrderSubscription(
                orderActions: [
                    new CreateOrderAction(
                        type: OrderActionType.CreateSubscription,
                        createSubscription: new CreateOrderCreateSubscription(
                            terms: new OrderActionCreateSubscriptionTerms(
                                initialTerm: new InitialTerm(
                                    termType: TermType.EVERGREEN)),
                            subscribeToRatePlans: [
                                new CreateOrderRatePlanOverride(
                                    productRatePlanNumber: "PRP-00000774")]))])],
        processingOptions: new ProcessingOptionsWithDelayedCapturePayment(
            runBilling: true,
            billingOptions: new BillingOptions(
                targetDate: DateOnly.FromDateTime(DateTime.Today)))));
Console.WriteLine(order.ToJson());
```

### Invoices

```csharp
// Create standalone invoice
InvoiceResponse invoice = zuoraClient.InvoicesApi.CreateStandaloneInvoice(
    new CreateInvoiceRequest(
        accountNumber: "A00000001",
        autoPay: false,
        invoiceDate: DateOnly.Parse("2024-01-01"),
        status: BillingDocumentStatus.Posted,
        invoiceItems: [
            new CreateInvoiceItem(
                amount: 100,
                chargeName: "Set Up Fee",
                description: "One-time setup charge",
                quantity: 1.0m,
                serviceStartDate: DateOnly.Parse("2024-01-01"),
                uom: "Each")]));
Console.WriteLine(invoice.ToJson());
```

### Object Query

```csharp
// Query invoice by key
var inv = zuoraClient.ObjectQueriesApi.QueryInvoiceByKey(invoice.InvoiceNumber);
Console.WriteLine(inv.ToJson());

// Query invoices by account
var invoices = zuoraClient.ObjectQueriesApi.QueryInvoices(
    filter: [$"accountId.EQ:{invoice.AccountId}"]);
Console.WriteLine(invoices.Data[0].ToJson());

// Query rate plan by key
ExpandedProductRatePlan ratePlan = zuoraClient.ObjectQueriesApi
    .QueryProductRatePlanByKey("rate-plan-id");
```

### Payments

```csharp
// Create payment and apply to invoice
var payment = zuoraClient.PaymentsApi.CreatePayment(
    new CreatePaymentRequest(
        accountNumber: "A00000001",
        amount: 100.0,
        currency: "USD",
        effectiveDate: "2024-11-30",
        type: PaymentType.External,
        paymentMethodType: "Check",
        invoices: [
            new CreatePaymentInvoiceApplication(
                amount: 100.0,
                invoiceId: invoice.Id)]));
Console.WriteLine(payment.ToJson());
```

## 6. Error Handling

```csharp
using ZuoraSDK.Client;

try
{
    var response = zuoraClient.AccountsApi.CreateAccount(request);
    Console.WriteLine(response.ToJson());
}
catch (ApiException e)
{
    Console.Error.WriteLine($"HTTP Status: {e.ErrorCode}");
    Console.Error.WriteLine($"Error: {e.Message}");
    Console.Error.WriteLine($"Response Body: {e.ErrorContent}");
}
```

## 7. Enum Reference

### Order Action Types

| Enum | Description |
|---|---|
| `OrderActionType.CreateSubscription` | Create new subscription |
| `OrderActionType.CancelSubscription` | Cancel subscription |
| `OrderActionType.RenewSubscription` | Renew subscription |
| `OrderActionType.AddProduct` | Add rate plan |
| `OrderActionType.RemoveProduct` | Remove rate plan |
| `OrderActionType.UpdateProduct` | Modify charges |

### Term Types

| Enum | Description |
|---|---|
| `TermType.EVERGREEN` | No end date, renews indefinitely |
| `TermType.TERMED` | Fixed duration |

### Billing Document Status

| Enum | Description |
|---|---|
| `BillingDocumentStatus.Draft` | Draft status |
| `BillingDocumentStatus.Posted` | Posted/finalized |

### Payment Types

| Enum | Description |
|---|---|
| `PaymentType.External` | External payment (check, wire, etc.) |
| `PaymentType.Electronic` | Gateway-processed payment |

## 8. Advanced Features

### JSON Serialization

All model objects support:

```csharp
string json = response.ToJson();  // Serialize to JSON string
```

### Custom Fields

```csharp
// Add custom fields via AdditionalProperties dictionary
var request = new CreateAccountRequest(name: "Acme Corp", ...);
request.AdditionalProperties.Add("salesRegion__c", "West");
request.AdditionalProperties.Add("industry__c", "Technology");
```

### HTTP Timeout

```csharp
zuoraClient.SetHttpTimeout(110000);  // 110 seconds
```

### Resilience (Polly)

The C# SDK includes Polly for retry policies. The SDK handles retries automatically for transient failures.

### Collection Initializer Syntax

C# 12+ supports collection expressions for cleaner request construction:

```csharp
// Clean array syntax with []
subscribeToRatePlans: [
    new CreateOrderRatePlanOverride(productRatePlanNumber: "PRP-00000774")
]

invoiceItems: [
    new CreateInvoiceItem(amount: 100, chargeName: "Fee", ...)
]
```

## 9. Complete Example: Order-to-Cash

```csharp
using ZuoraSDK.Client;
using ZuoraSDK.Model;

class Program
{
    static async Task Main(string[] args)
    {
        // 1. Initialize client
        var zuoraClient = new ZuoraClient(
            Environment.GetEnvironmentVariable("ZUORA_CLIENT_ID"),
            Environment.GetEnvironmentVariable("ZUORA_CLIENT_SECRET"),
            ZuoraEnv.SBX);
        zuoraClient.Initialize();

        // 2. Create account
        var accountResponse = zuoraClient.AccountsApi.CreateAccount(
            new CreateAccountRequest(
                name: "Acme Corp",
                billToContact: new CreateAccountContact(
                    firstName: "Jane", lastName: "Doe",
                    country: "United States", state: "CA"),
                billCycleDay: 1,
                soldToSameAsBillTo: true,
                autoPay: false,
                currency: "USD"));
        Console.WriteLine($"Account: {accountResponse.AccountNumber}");

        // 3. Create subscription via order
        var orderResponse = zuoraClient.OrdersApi.CreateOrder(
            new CreateOrderRequest(
                orderDate: DateOnly.FromDateTime(DateTime.Today),
                existingAccountNumber: accountResponse.AccountNumber,
                subscriptions: [
                    new CreateOrderSubscription(
                        orderActions: [
                            new CreateOrderAction(
                                type: OrderActionType.CreateSubscription,
                                createSubscription: new CreateOrderCreateSubscription(
                                    terms: new OrderActionCreateSubscriptionTerms(
                                        initialTerm: new InitialTerm(
                                            termType: TermType.EVERGREEN)),
                                    subscribeToRatePlans: [
                                        new CreateOrderRatePlanOverride(
                                            productRatePlanNumber: "PRP-00000774")]))])]));
        Console.WriteLine($"Order: {orderResponse.OrderNumber}");

        // 4. Create standalone invoice
        var invoiceResponse = zuoraClient.InvoicesApi.CreateStandaloneInvoice(
            new CreateInvoiceRequest(
                accountNumber: accountResponse.AccountNumber,
                autoPay: false,
                invoiceDate: DateOnly.FromDateTime(DateTime.Today),
                status: BillingDocumentStatus.Posted,
                invoiceItems: [
                    new CreateInvoiceItem(
                        amount: 100, chargeName: "Set Up Fee",
                        quantity: 1.0m,
                        serviceStartDate: DateOnly.FromDateTime(DateTime.Today),
                        uom: "Each")]));
        Console.WriteLine($"Invoice: {invoiceResponse.InvoiceNumber}");

        // 5. Apply payment
        var paymentResponse = zuoraClient.PaymentsApi.CreatePayment(
            new CreatePaymentRequest(
                accountNumber: accountResponse.AccountNumber,
                amount: 100.0, currency: "USD",
                effectiveDate: DateTime.Today.ToString("yyyy-MM-dd"),
                type: PaymentType.External,
                paymentMethodType: "Check",
                invoices: [
                    new CreatePaymentInvoiceApplication(
                        amount: 100.0,
                        invoiceId: invoiceResponse.Id)]));
        Console.WriteLine($"Payment: {paymentResponse.Number}");
    }
}
```

## 10. Production Checklist

- [ ] Switch `ZuoraEnv.SBX` to `ZuoraEnv.PROD`
- [ ] Use environment variables or secure vault for credentials
- [ ] Call `zuoraClient.Initialize()` at application startup
- [ ] Wrap all API calls in try/catch for `ApiException`
- [ ] Disable debugging in production (`SetDebugging(false)`)
- [ ] Use async methods (`*Async`) for non-blocking operations
- [ ] Configure appropriate HTTP timeout for your use case
- [ ] Test full order-to-cash flow in Sandbox before Production
- [ ] Monitor error rates and handle 429 rate limiting
- [ ] Ensure .NET 8.0+ runtime is available in production
