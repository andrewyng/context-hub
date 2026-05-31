---
name: package
description: "Zuora JavaScript/Node.js SDK (zuora-sdk-js) for subscription billing, invoicing, payments, and product catalog management with auto-authentication"
metadata:
  languages: "javascript"
  versions: "3.15.0"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,javascript,nodejs,sdk,billing,subscriptions,payments"
---
# Zuora JavaScript SDK Guide

## 1. Golden Rules

**Always use `ZuoraClient` with auto-auth.** The `ZuoraClient` class manages OAuth2 tokens automatically, including authentication and refresh. Never manage tokens manually.

**Always call `await client.initialize()`** after creating the client. This authenticates with Zuora and prepares the client for API calls.

**Always use async/await.** All SDK methods return Promises.

**Current SDK Version:** 3.15.0 | **API Version:** 2025-08-12 | **Node.js:** 16+

## 2. Installation

```bash
npm install zuora-sdk-js
```

```bash
yarn add zuora-sdk-js
```

```bash
pnpm add zuora-sdk-js
```

### Dependencies

Core dependency: `superagent` 5.3.0+ (HTTP client)

### Environment Variables

```bash
# Required
ZUORA_CLIENT_ID=your-client-id
ZUORA_CLIENT_SECRET=your-client-secret

# Optional
ZUORA_ENV=SBX  # SBX, PROD, etc.
```

**CRITICAL:** Never commit credentials to version control or expose them in client-side code.

## 3. Initialization

### Basic Setup

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    const client = new ZuoraClient({
        clientId: process.env.ZUORA_CLIENT_ID,
        clientSecret: process.env.ZUORA_CLIENT_SECRET,
        env: ZuoraClient.SBX,
    });
    await client.initialize();

    // API calls here...
})();
```

### With Debug Mode

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    const client = new ZuoraClient({
        clientId: process.env.ZUORA_CLIENT_ID,
        clientSecret: process.env.ZUORA_CLIENT_SECRET,
        env: ZuoraClient.SBX,
    });
    client.debug(true);  // Log request/response details
    await client.initialize();

    // API calls here...
})();
```

### Available Environments

| Constant | Environment |
|---|---|
| `ZuoraClient.SBX` | US Sandbox (Cloud 2) |
| `ZuoraClient.CSBX` | US Central Sandbox |
| `ZuoraClient.PROD` | US Production (Cloud 2) |

## 4. API Client Properties

The `ZuoraClient` exposes typed API accessors as properties:

| Property | API Surface |
|---|---|
| `client.accountsApi` | Account CRUD operations |
| `client.ordersApi` | Order & subscription lifecycle |
| `client.invoicesApi` | Invoice creation & management |
| `client.paymentsApi` | Payment processing |
| `client.productsApi` | Product catalog CRUD |
| `client.productRatePlansApi` | Rate plan management |
| `client.productRatePlanChargesApi` | Charge management |
| `client.objectQueriesApi` | Object Query (search/filter/expand) |
| `client.billRunApi` | Bill run operations |

## 5. Core Usage

### Products

```javascript
// Create product
let createProductRequest = new ZuoraAPI.CreateProductRequest();
createProductRequest.Name = 'Gold Membership';
createProductRequest.Description = 'Premium subscription tier';
createProductRequest.EffectiveStartDate = '2024-01-01';
createProductRequest.EffectiveEndDate = '2034-01-01';

let product = await client.productsApi.createProduct(createProductRequest);
console.log('Product:', JSON.stringify(product, null, 2));
```

```javascript
// Get product by ID
let productDetail = await client.productsApi.getProduct(product.Id);
console.log('Product:', JSON.stringify(productDetail, (k, v) => v ?? undefined, 2));
```

### Rate Plans & Charges

```javascript
// Create rate plan
let ratePlanRequest = new ZuoraAPI.CreateProductRatePlanRequest();
ratePlanRequest.Name = 'Monthly Plan';
ratePlanRequest.ProductId = product.Id;
ratePlanRequest.Description = 'Monthly billing plan';
ratePlanRequest.EffectiveStartDate = '2024-01-01';
ratePlanRequest.EffectiveEndDate = '2034-01-01';
ratePlanRequest.activeCurrencies = ['USD'];

let ratePlan = await client.productRatePlansApi
    .createProductRatePlan(ratePlanRequest, {});
```

```javascript
// Create charge with pricing tier
let chargeRequest = new ZuoraAPI.CreateProductRatePlanChargeRequest();
chargeRequest.Name = 'Monthly Fee';
chargeRequest.ChargeModel = 'Flat Fee Pricing';
chargeRequest.ChargeType = 'Recurring';
chargeRequest.TriggerEvent = 'ContractEffective';
chargeRequest.ProductRatePlanId = ratePlan.Id;
chargeRequest.BillCycleType = 'DefaultFromCustomer';
chargeRequest.BillingPeriod = 'Monthly';
chargeRequest.UseDiscountSpecificAccountingCode = false;

let tierData = new ZuoraAPI.ProductRatePlanChargeTierData();
tierData.ProductRatePlanChargeTier = [{ Currency: 'USD', price: 29.99 }];
chargeRequest.ProductRatePlanChargeTierData = tierData;

let charge = await client.productRatePlanChargesApi
    .createProductRatePlanCharge(chargeRequest, {});
```

### Bill Runs

```javascript
// Create bill run for specific account
const billRunFilter = new ZuoraAPI.BillRunFilter();
billRunFilter.filterType = 'Account';
billRunFilter.accountId = 'A00000001';

const billRunRequest = new ZuoraAPI.CreateBillRunRequest();
billRunRequest.billRunFilters = [billRunFilter];
billRunRequest.targetDate = '2025-01-31';

try {
    const billRun = await client.billRunApi.createBillRun(billRunRequest);
    console.log('Bill Run Created:', billRun);
} catch (error) {
    console.error('Error creating bill run:', error);
}
```

### Contacts

```javascript
// Contact management is available through the accounts API
// Contacts are typically created as part of account creation
// via billToContact and soldToContact fields
```

## 6. Error Handling

```javascript
try {
    const result = await client.productsApi.createProduct(request);
    if (result.Success) {
        console.log('Created:', result.Id);
    } else {
        console.log('Failed:', result);
    }
} catch (error) {
    console.error('API Error:', error);
    // error.status - HTTP status code
    // error.response.body - Error response body with reasons array
}
```

### Pattern: Wrap in Async IIFE

```javascript
(async () => {
    try {
        const client = new ZuoraClient({
            clientId: process.env.ZUORA_CLIENT_ID,
            clientSecret: process.env.ZUORA_CLIENT_SECRET,
            env: ZuoraClient.SBX,
        });
        await client.initialize();

        // API calls here...
        const products = await client.productsApi.getProducts();
        console.log('Products:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error(error);
    }
})();
```

## 7. Request/Response Notes

### Property Naming

The JavaScript SDK uses **PascalCase** for request model properties (matching the Zuora API):

```javascript
// Correct: PascalCase
request.Name = 'Gold';
request.EffectiveStartDate = '2024-01-01';
request.ProductRatePlanId = 'id';

// Response properties may also be PascalCase
if (response.Success) {
    console.log(response.Id);
}
```

### JSON Serialization

```javascript
// Pretty-print response
console.log(JSON.stringify(response, null, 2));

// Remove null values from output
console.log(JSON.stringify(response, (k, v) => v ?? undefined, 2));
```

## 8. Complete Example: Product Catalog Setup

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    try {
        const client = new ZuoraClient({
            clientId: process.env.ZUORA_CLIENT_ID,
            clientSecret: process.env.ZUORA_CLIENT_SECRET,
            env: ZuoraClient.SBX,
        });
        client.debug(true);
        await client.initialize();

        // 1. Create product
        let productReq = new ZuoraAPI.CreateProductRequest();
        productReq.Name = 'Gold Membership';
        productReq.Description = 'Premium subscription tier';
        productReq.EffectiveStartDate = '2024-01-01';
        productReq.EffectiveEndDate = '2034-01-01';
        let product = await client.productsApi.createProduct(productReq);

        if (product.Success) {
            // 2. Create rate plan
            let planReq = new ZuoraAPI.CreateProductRatePlanRequest();
            planReq.Name = 'Monthly Plan';
            planReq.ProductId = product.Id;
            planReq.Description = 'Monthly billing';
            planReq.EffectiveStartDate = '2024-01-01';
            planReq.EffectiveEndDate = '2034-01-01';
            planReq.activeCurrencies = ['USD'];
            let plan = await client.productRatePlansApi.createProductRatePlan(planReq, {});

            if (plan.Success) {
                // 3. Create charge
                let chargeReq = new ZuoraAPI.CreateProductRatePlanChargeRequest();
                chargeReq.Name = 'Monthly Fee';
                chargeReq.ChargeModel = 'Flat Fee Pricing';
                chargeReq.ChargeType = 'Recurring';
                chargeReq.TriggerEvent = 'ContractEffective';
                chargeReq.ProductRatePlanId = plan.Id;
                chargeReq.BillCycleType = 'DefaultFromCustomer';
                chargeReq.BillingPeriod = 'Monthly';
                chargeReq.UseDiscountSpecificAccountingCode = false;

                let tierData = new ZuoraAPI.ProductRatePlanChargeTierData();
                tierData.ProductRatePlanChargeTier = [
                    { Currency: 'USD', price: 29.99 }
                ];
                chargeReq.ProductRatePlanChargeTierData = tierData;

                let charge = await client.productRatePlanChargesApi
                    .createProductRatePlanCharge(chargeReq, {});
                console.log('Catalog created successfully');

                // 4. Verify
                let result = await client.productsApi.getProduct(product.Id);
                console.log(JSON.stringify(result, (k, v) => v ?? undefined, 2));
            }
        }
    } catch (error) {
        console.error(error);
    }
})();
```

## 9. Production Checklist

- [ ] Switch `ZuoraClient.SBX` to `ZuoraClient.PROD`
- [ ] Use environment variables for credentials
- [ ] Call `await client.initialize()` at application startup
- [ ] Wrap all API calls in try/catch
- [ ] Check `response.Success` for create/update operations
- [ ] Disable debug mode in production
- [ ] Handle rate limiting (429 responses) with backoff
- [ ] Use `Zuora-Track-Id` headers for request tracing
- [ ] Test full flow in Sandbox before Production
