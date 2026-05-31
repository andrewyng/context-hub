---
name: api
description: "Subscription billing and revenue management platform with comprehensive REST APIs for accounts, subscriptions, orders, invoicing, payments, product catalog, usage, and Object Query"
metadata:
  languages: "javascript"
  versions: "2025-08-12"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,api,billing,subscriptions,payments,invoicing,revenue"
---
# Zuora API Coding Guide

## 1. Golden Rules

**Always use the official Zuora SDK packages:**
- Python: `zuora-sdk` (PyPI)
- JavaScript: `zuora-sdk-js` (npm)
- Java: `zuora-sdk-java` (Maven Central)
- C#: `ZuoraSDK` (NuGet)

**Never call the REST API directly when an SDK is available.** The SDKs handle authentication, token refresh, retries, and serialization automatically.

**Current API Version:** `2025-08-12` (date-based versioning). Specify via the `Zuora-Version` header or SDK configuration.

**Always use ZuoraClient with auto-auth.** The `ZuoraClient` class manages OAuth2 token lifecycle automatically, including background refresh and thread-safe access.

## 2. Environments

Zuora provides multiple environments across regions:

| Environment | Base URL |
|---|---|
| US Developer & Central Sandbox | `https://rest.test.zuora.com` |
| US API Sandbox (Cloud 1) | `https://rest.sandbox.na.zuora.com` |
| US API Sandbox (Cloud 2) | `https://rest.apisandbox.zuora.com` |
| US Production (Cloud 1) | `https://rest.na.zuora.com` |
| US Production (Cloud 2) | `https://rest.zuora.com` |
| EU Developer & Central Sandbox | `https://rest.test.eu.zuora.com` |
| EU API Sandbox | `https://rest.sandbox.eu.zuora.com` |
| EU Production | `https://rest.eu.zuora.com` |
| APAC Developer & Central Sandbox | `https://rest.test.ap.zuora.com` |
| APAC Production | `https://rest.ap.zuora.com` |

All SDKs support environment selection via enum constants (e.g., `ZuoraClient.SBX`, `ZuoraClient.PROD`).

## 3. Authentication

Zuora uses **OAuth 2.0 Client Credentials** flow exclusively.

### Environment Variables

```bash
# Required
ZUORA_CLIENT_ID=your-client-id        # OAuth client ID from Zuora Admin
ZUORA_CLIENT_SECRET=your-client-secret  # OAuth client secret

# Optional
ZUORA_BASE_URL=https://rest.apisandbox.zuora.com  # Override environment URL
ZUORA_ENTITY_IDS=entity-id-1,entity-id-2          # Multi-entity scoping
ZUORA_ORG_IDS=org-id-1                             # Multi-org scoping
```

**CRITICAL:** Never commit client secrets to version control. Use environment variables or secure secret management.

### Authentication Flow

1. SDK sends `POST /oauth/token` with `client_id`, `client_secret`, and `grant_type=client_credentials`
2. Zuora returns a Bearer token (valid ~60 minutes)
3. SDK auto-refreshes tokens in the background (every 10 minutes by default)
4. All subsequent API calls include `Authorization: Bearer {token}` header

### Initialization

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    const client = new ZuoraClient({
        clientId: process.env.ZUORA_CLIENT_ID,
        clientSecret: process.env.ZUORA_CLIENT_SECRET,
        env: ZuoraClient.SBX,
    });
    client.debug(true);  // Enable request/response logging (disable in production)
    await client.initialize();  // Authenticates and starts background token refresh

    // API calls here...
})();
```

### Available Environment Constants

| Constant | Environment |
|---|---|
| `ZuoraClient.SBX` | US Sandbox (Cloud 2) |
| `ZuoraClient.CSBX` | US Central Sandbox |
| `ZuoraClient.PROD` | US Production (Cloud 2) |

## 4. Core API Surfaces

### 4.1 Accounts

Create and manage customer billing accounts.

**Create Account:**

```javascript
// Create a basic account
let createAccountRequest = new ZuoraAPI.CreateAccountRequest();
createAccountRequest.Name = 'Acme Corp';
createAccountRequest.Currency = 'USD';
createAccountRequest.BillCycleDay = 1;
createAccountRequest.AutoPay = false;
createAccountRequest.BillToContact = {
    FirstName: 'Jane',
    LastName: 'Doe',
    State: 'California',
    Country: 'USA'
};

const account = await client.accountsApi.createAccount(createAccountRequest);
console.log('Account Number:', account.AccountNumber);
```

**Get Account:**

```javascript
const accountDetail = await client.accountsApi.getAccount(account.AccountId);
console.log(JSON.stringify(accountDetail, null, 2));
```

### 4.2 Product Catalog

Build your product catalog with Products, Rate Plans, and Charges.

**Create Product:**

```javascript
let productReq = new ZuoraAPI.CreateProductRequest();
productReq.Name = 'Gold Membership';
productReq.Description = 'Premium subscription tier';
productReq.EffectiveStartDate = '2024-01-01';
productReq.EffectiveEndDate = '2034-01-01';

const product = await client.productsApi.createProduct(productReq);
console.log('Product ID:', product.Id);
```

**Create Rate Plan:**

```javascript
let planReq = new ZuoraAPI.CreateProductRatePlanRequest();
planReq.Name = 'Monthly Plan';
planReq.ProductId = product.Id;
planReq.Description = 'Monthly billing plan';
planReq.EffectiveStartDate = '2024-01-01';
planReq.EffectiveEndDate = '2034-01-01';
planReq.activeCurrencies = ['USD'];

const ratePlan = await client.productRatePlansApi
    .createProductRatePlan(planReq, {});
```

**Create Charge with Pricing Tier:**

```javascript
let chargeReq = new ZuoraAPI.CreateProductRatePlanChargeRequest();
chargeReq.Name = 'Monthly Fee';
chargeReq.ChargeModel = 'Flat Fee Pricing';
chargeReq.ChargeType = 'Recurring';
chargeReq.TriggerEvent = 'ContractEffective';
chargeReq.ProductRatePlanId = ratePlan.Id;
chargeReq.BillCycleType = 'DefaultFromCustomer';
chargeReq.BillingPeriod = 'Monthly';
chargeReq.UseDiscountSpecificAccountingCode = false;

let tierData = new ZuoraAPI.ProductRatePlanChargeTierData();
tierData.ProductRatePlanChargeTier = [{ Currency: 'USD', price: 29.99 }];
chargeReq.ProductRatePlanChargeTierData = tierData;

const charge = await client.productRatePlanChargesApi
    .createProductRatePlanCharge(chargeReq, {});
```

**Verify Product:**

```javascript
const productDetail = await client.productsApi.getProduct(product.Id);
console.log(JSON.stringify(productDetail, (k, v) => v ?? undefined, 2));
```

### 4.3 Orders & Subscriptions

Use the Orders API to create, amend, renew, and cancel subscriptions.

**Create Subscription via Order:**

```javascript
const orderReq = new ZuoraAPI.CreateOrderRequest();
orderReq.OrderDate = new Date().toISOString().split('T')[0];
orderReq.ExistingAccountNumber = 'A00000001';
orderReq.Subscriptions = [{
    OrderActions: [{
        Type: 'CreateSubscription',
        CreateSubscription: {
            Terms: {
                InitialTerm: { TermType: 'EVERGREEN' }
            },
            SubscribeToRatePlans: [
                { ProductRatePlanNumber: 'PRP-00000151' }
            ]
        }
    }]
}];
orderReq.ProcessingOptions = {
    RunBilling: true,
    BillingOptions: {
        TargetDate: new Date().toISOString().split('T')[0]
    }
};

const order = await client.ordersApi.createOrder(orderReq);
console.log('Order:', order.OrderNumber);
console.log('Subscriptions:', order.SubscriptionNumbers);
```

**Preview Order (dry run):**

```javascript
const previewReq = new ZuoraAPI.PreviewOrderRequest();
previewReq.OrderDate = new Date().toISOString().split('T')[0];
previewReq.ExistingAccountNumber = 'A00000001';
previewReq.Subscriptions = [{
    OrderActions: [{
        Type: 'CreateSubscription',
        CreateSubscription: {
            Terms: {
                InitialTerm: { TermType: 'EVERGREEN' }
            },
            SubscribeToRatePlans: [
                { ProductRatePlanNumber: 'PRP-00000151' }
            ]
        }
    }]
}];
previewReq.PreviewOptions = {
    PreviewThruType: 'NumberOfPeriods',
    PreviewNumberOfPeriods: 1,
    PreviewTypes: ['BillingDocs']
};

const preview = await client.ordersApi.previewOrder(previewReq);
console.log(JSON.stringify(preview, null, 2));
```

### 4.4 Invoicing

**Create Standalone Invoice:**

```javascript
const invoiceReq = new ZuoraAPI.CreateInvoiceRequest();
invoiceReq.AccountNumber = 'A00000001';
invoiceReq.AutoPay = false;
invoiceReq.InvoiceDate = '2024-01-01';
invoiceReq.Status = 'Posted';
invoiceReq.InvoiceItems = [{
    Amount: 100.0,
    ChargeName: 'Set Up Fee',
    Description: 'One-time setup charge',
    Quantity: 1.0,
    ServiceStartDate: '2024-01-01',
    UOM: 'Each'
}];

const invoice = await client.invoicesApi.createStandaloneInvoice(invoiceReq);
console.log(`Invoice ${invoice.InvoiceNumber}: $${invoice.Balance}`);
```

### 4.5 Payments

**Create Payment and Apply to Invoice:**

```javascript
const paymentReq = new ZuoraAPI.CreatePaymentRequest();
paymentReq.AccountNumber = 'A00000001';
paymentReq.Amount = 100.0;
paymentReq.Currency = 'USD';
paymentReq.EffectiveDate = '2024-11-30';
paymentReq.Type = 'External';
paymentReq.PaymentMethodType = 'Check';
paymentReq.Invoices = [{
    Amount: 100.0,
    InvoiceId: invoice.Id
}];

const payment = await client.paymentsApi.createPayment(paymentReq);
console.log('Payment:', payment.Number);
```

### 4.6 Bill Runs

**Create Bill Run for Specific Account:**

```javascript
const billRunFilter = new ZuoraAPI.BillRunFilter();
billRunFilter.filterType = 'Account';
billRunFilter.accountId = 'A00000001';

const billRunReq = new ZuoraAPI.CreateBillRunRequest();
billRunReq.billRunFilters = [billRunFilter];
billRunReq.targetDate = '2025-01-31';

const billRun = await client.billRunApi.createBillRun(billRunReq);
console.log('Bill Run Created:', billRun);
```

## 5. Object Query API

The Object Query API provides a powerful, consistent way to query 40+ Zuora object types with filtering, sorting, expansion, and pagination.

### Endpoint Pattern

```
GET /object-query/{objectType}           # List objects
GET /object-query/{objectType}/{key}     # Get by key
```

### Filtering

Use dot-notation operators in the `filter` parameter:

| Operator | Description | Example |
|---|---|---|
| `EQ` | Equal | `currency.EQ:EUR` |
| `NE` | Not equal | `status.NE:Draft` |
| `LT` | Less than | `amount.LT:100` |
| `GT` | Greater than | `amount.GT:0` |
| `LE` | Less than or equal | `balance.LE:500` |
| `GE` | Greater than or equal | `createdDate.GE:2024-01-01` |
| `SW` | Starts with | `name.SW:Test` |
| `IN` | In set | `status.IN:Active,Cancelled` |

```javascript
// Filter accounts by currency (via REST — SDKs wrap this)
// GET /object-query/accounts?filter[]=currency.EQ:USD&filter[]=status.EQ:Active&sort[]=accountNumber.ASC&pageSize=20
const accounts = await client.objectQueriesApi.queryAccounts({
    filter: ['currency.EQ:USD', 'status.EQ:Active'],
    sort: ['accountNumber.ASC'],
    pageSize: 20
});
```

### Expansion (Joins)

Include related objects in a single response using `expand`:

```javascript
// Get account with billing contact and subscriptions
// GET /object-query/accounts/{key}?expand[]=billTo&expand[]=subscriptions
const account = await client.objectQueriesApi.queryAccountByKey('A00000001', {
    expand: ['billTo', 'subscriptions', 'subscriptions.rateplans']
});

// Get invoice with line items
const invoice = await client.objectQueriesApi.queryInvoiceByKey('INV00000315', {
    expand: ['invoiceItems']
});

// Get product catalog with full charge details
const ratePlans = await client.objectQueriesApi.queryProductRatePlans({
    filter: ['productId.EQ:prod-id'],
    expand: ['productrateplancharges',
             'productrateplancharges.productrateplanchargetiers']
});
```

### Pagination

Object Query uses cursor-based pagination:

```javascript
// First page
let response = await client.objectQueriesApi.queryAccounts({ pageSize: 20 });
console.log(`Page 1: ${response.data.length} accounts`);

// Next page (if available)
if (response.nextPage) {
    response = await client.objectQueriesApi.queryAccounts({
        pageSize: 20,
        cursor: response.nextPage
    });
}
```

### Field Selection

Reduce response payload by selecting specific fields:

```javascript
const accounts = await client.objectQueriesApi.queryAccounts({
    fields: ['id', 'accountNumber', 'name', 'balance']
});
```

## 6. Common Request Headers

| Header | Purpose | Example |
|---|---|---|
| `Authorization` | Bearer token (auto-managed by SDK) | `Bearer eyJ...` |
| `Zuora-Version` | API version override | `2025-08-12` |
| `Zuora-Track-Id` | Custom request tracing ID | `my-trace-123` |
| `Zuora-Entity-Ids` | Multi-entity scoping | `entity-uuid-1` |
| `Zuora-Org-Ids` | Multi-org scoping | `org-uuid-1` |
| `Idempotency-Key` | Idempotent POST/PATCH operations | `uuid-v4` |

## 7. Error Handling

### Error Response Structure

All Zuora API errors return a consistent structure:

```json
{
  "reasons": [
    {
      "code": 53100020,
      "message": "The account number A99999999 is invalid."
    }
  ]
}
```

### Error Handling Pattern

```javascript
try {
    const result = await client.productsApi.createProduct(request);
    if (result.Success) {
        console.log('Created:', result.Id);
    } else {
        console.log('Operation failed:', result);
    }
} catch (error) {
    console.error('HTTP Status:', error.status);

    // Parse structured error response
    if (error.response && error.response.body) {
        const body = error.response.body;
        if (body.reasons) {
            body.reasons.forEach(reason => {
                console.error(`  [${reason.code}] ${reason.message}`);
            });
        }
    }

    // Handle specific HTTP status codes
    if (error.status === 401) {
        // Token expired — re-initialize client
        await client.initialize();
    } else if (error.status === 429) {
        // Rate limited — back off and retry
    }
}
```

## 8. Best Practices

### Idempotency

Use the `Idempotency-Key` header for POST/PATCH requests to prevent duplicate operations. The SDK supports setting custom headers per request.

### Rate Limiting

- Zuora enforces rate limits per tenant
- SDKs include built-in retry with exponential backoff
- Monitor `429 Too Many Requests` responses
- Use bulk/async endpoints for high-volume operations

### Multi-Entity & Multi-Org

For multi-entity tenants, scope API calls using headers:

```javascript
// Set entity/org context — check SDK docs for per-request header options
// Zuora-Entity-Ids: entity-uuid-1
// Zuora-Org-Ids: org-uuid-1
```

### Async Operations

For long-running operations (bill runs, large orders), use async endpoints:

```javascript
// Async order creation
const asyncResponse = await client.ordersApi.createOrderAsync(orderReq);
// Poll for completion using the job ID
```

### Custom Fields

Zuora supports custom fields (suffix `__c`) on most objects:

```javascript
// Include custom fields via additional properties
createAccountRequest.salesRegion__c = 'West';
createAccountRequest.industry__c = 'Technology';
```

## 9. Charge Models

Zuora supports 16 charge models for flexible pricing:

| Category | Models |
|---|---|
| **Recurring** | Flat Fee, Per Unit, Tiered, Volume |
| **One-Time** | Flat Fee, Tiered, Volume |
| **Usage-Based** | Per Unit, Flat Fee, Tiered, Volume, Tiered with Overage, Overage |
| **Discount** | Fixed Amount, Percentage |
| **Custom** | Multi-Attribute Pricing |

### Charge Types

- **Recurring** — Billed on a regular schedule (monthly, annual, etc.)
- **OneTime** — Billed once at subscription start
- **Usage** — Billed based on consumption data

## 10. Production Checklist

### Pre-Launch Verification

- [ ] Switch from Sandbox to Production environment URL
- [ ] Replace sandbox OAuth credentials with production credentials
- [ ] Set `ZUORA_CLIENT_ID` and `ZUORA_CLIENT_SECRET` via secure secret management
- [ ] Verify API version is explicitly set (`Zuora-Version` header)
- [ ] Enable auto-auth with token refresh (use `client.initialize()`)
- [ ] Implement error handling for all API calls with proper logging
- [ ] Use `Idempotency-Key` headers for all mutating POST/PATCH requests
- [ ] Set up `Zuora-Track-Id` headers for request tracing
- [ ] Configure rate limit handling with exponential backoff
- [ ] Test webhook endpoints receive and process events correctly
- [ ] Verify multi-entity/multi-org headers if applicable
- [ ] Review custom field mappings (`__c` fields)
- [ ] Validate product catalog (products, rate plans, charges) exists in production
- [ ] Test full order-to-cash flow: account creation, order, invoice, payment
- [ ] Disable SDK debug mode in production

### Monitoring

- Track API response times and error rates
- Monitor OAuth token refresh cycles
- Alert on consecutive 401/403 errors (credential issues)
- Alert on 429 responses (rate limiting)
- Monitor billing run completion times
- Track payment success/failure rates

### Security

- **NEVER** expose OAuth client secrets in client-side code
- Rotate OAuth credentials periodically
- Use separate OAuth clients for different environments
- Restrict OAuth client permissions to minimum required scopes
- Audit API access logs in Zuora Admin

## 11. Key Resources

- **Developer Portal:** https://developer.zuora.com/
- **API Reference:** https://developer.zuora.com/v1-api-reference/introduction/
- **SDKs:** Python (`zuora-sdk`), JavaScript (`zuora-sdk-js`), Java (`zuora-sdk-java`), C# (`ZuoraSDK`)
- **MCP Server:** `npx zuora-mcp` for AI-assisted Zuora development
- **Knowledge Center:** https://knowledgecenter.zuora.com/
