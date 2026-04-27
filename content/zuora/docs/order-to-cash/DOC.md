---
name: order-to-cash
description: "Zuora order-to-cash lifecycle guide: product catalog setup, subscription creation via Orders API, billing runs, invoicing, payments, and revenue recognition"
metadata:
  languages: "javascript"
  versions: "2025-08-12"
  revision: 1
  updated-on: "2026-03-31"
  source: maintainer
  tags: "zuora,subscriptions,billing,orders,invoices,payments,revenue"
---
# Zuora Subscription Billing Guide

## 1. Golden Rules

**Use the Orders API for all subscription operations.** The Orders API is the modern, recommended approach for creating, amending, renewing, and canceling subscriptions. It replaces the legacy Subscribe and Amend calls.

**Always preview before creating.** Use `previewOrder()` to validate your order and see projected billing documents before committing.

**Follow the order-to-cash flow:** Product Catalog -> Account -> Order (Subscription) -> Bill Run -> Invoice -> Payment.

## 2. Order-to-Cash Overview

```
Product Catalog          Account              Order
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│ Product       │    │ Name         │    │ Order Date       │
│  └─ Rate Plan │    │ Bill-To      │    │ Account          │
│     └─ Charge │    │ Currency     │    │ Subscriptions    │
│       └─ Tier │    │ Payment Info │    │  └─ Order Actions│
└──────────────┘    └──────────────┘    └──────────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
              Bill Run / Invoice              Payment
         ┌──────────────────────┐     ┌──────────────────┐
         │ Invoice Number       │     │ Amount           │
         │ Invoice Items        │     │ Payment Method   │
         │ Amount / Balance     │     │ Applied Invoices │
         └──────────────────────┘     └──────────────────┘
```

## 3. Product Catalog Setup

Before creating subscriptions, you need a product catalog: **Product > Rate Plan > Charge > Tier**.

### Create a Product

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    const client = new ZuoraClient({
        clientId: process.env.ZUORA_CLIENT_ID,
        clientSecret: process.env.ZUORA_CLIENT_SECRET,
        env: ZuoraClient.SBX,
    });
    await client.initialize();

    let productReq = new ZuoraAPI.CreateProductRequest();
    productReq.Name = 'Gold Membership';
    productReq.Description = 'Premium subscription tier';
    productReq.EffectiveStartDate = '2024-01-01';
    productReq.EffectiveEndDate = '2034-01-01';

    const product = await client.productsApi.createProduct(productReq);
    console.log('Product ID:', product.Id);
})();
```

### Create a Rate Plan

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
console.log('Rate Plan ID:', ratePlan.Id);
```

### Create a Charge with Pricing Tiers

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
console.log('Charge created:', charge.Id);
```

### Verify Product Catalog

```javascript
const productDetail = await client.productsApi.getProduct(product.Id);
console.log(JSON.stringify(productDetail, (k, v) => v ?? undefined, 2));
```

## 4. Account Management

### Create a Billing Account

```javascript
let accountReq = new ZuoraAPI.CreateAccountRequest();
accountReq.Name = 'Acme Corp';
accountReq.Currency = 'USD';
accountReq.BillCycleDay = 1;
accountReq.AutoPay = false;
accountReq.BillToContact = {
    FirstName: 'Jane',
    LastName: 'Doe',
    State: 'California',
    Country: 'USA'
};

const account = await client.accountsApi.createAccount(accountReq);
const accountNumber = account.AccountNumber;
console.log('Account:', accountNumber);
```

### Create Account with Payment Method

```javascript
let accountReq = new ZuoraAPI.CreateAccountRequest();
accountReq.Name = 'Acme Corp';
accountReq.Currency = 'USD';
accountReq.BillCycleDay = 1;
accountReq.AutoPay = false;
accountReq.SoldToSameAsBillTo = true;
accountReq.BillToContact = {
    FirstName: 'Jane',
    LastName: 'Doe',
    WorkEmail: 'jane@acme.com',
    Country: 'United States',
    State: 'CA'
};
accountReq.PaymentMethod = {
    Type: 'CreditCard',
    CardType: 'Visa',
    CardNumber: '4111111111111111',
    ExpirationMonth: 10,
    ExpirationYear: 2030,
    SecurityCode: '123',
    CardHolderInfo: { CardHolderName: 'Jane Doe' }
};

const account = await client.accountsApi.createAccount(accountReq);
console.log('Account:', JSON.stringify(account, null, 2));
```

### Get and Delete Account

```javascript
// Get account details
const accountDetail = await client.accountsApi.getAccount(account.AccountId);
console.log(accountDetail);

// Delete account
const deleteResponse = await client.accountsApi.deleteAccount(account.AccountId);
console.log(deleteResponse);
```

## 5. Subscription Operations

### Create Subscription (Evergreen)

An evergreen subscription has no end date and continues until explicitly canceled.

```javascript
const today = new Date().toISOString().split('T')[0];

const orderReq = new ZuoraAPI.CreateOrderRequest();
orderReq.OrderDate = today;
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
    BillingOptions: { TargetDate: today }
};

const order = await client.ordersApi.createOrder(orderReq);
console.log('Order:', order.OrderNumber);
console.log('Subscriptions:', order.SubscriptionNumbers);
```

### Create Subscription (Termed)

A termed subscription has a fixed duration.

```javascript
const orderReq = new ZuoraAPI.CreateOrderRequest();
orderReq.OrderDate = today;
orderReq.ExistingAccountNumber = 'A00000001';
orderReq.Subscriptions = [{
    OrderActions: [{
        Type: 'CreateSubscription',
        CreateSubscription: {
            Terms: {
                InitialTerm: {
                    TermType: 'TERMED',
                    Period: 12,
                    PeriodType: 'Month'
                },
                RenewalTerms: [{
                    Period: 12,
                    PeriodType: 'Month'
                }],
                AutoRenew: true
            },
            SubscribeToRatePlans: [
                { ProductRatePlanNumber: 'PRP-00000151' }
            ]
        }
    }]
}];

const order = await client.ordersApi.createOrder(orderReq);
```

### Preview Order

**ALWAYS preview before creating** to validate and see projected billing:

```javascript
const previewReq = new ZuoraAPI.PreviewOrderRequest();
previewReq.OrderDate = today;
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
    PreviewNumberOfPeriods: 3,
    PreviewTypes: ['BillingDocs', 'ChargeMetrics']
};

const preview = await client.ordersApi.previewOrder(previewReq);
// Inspect projected invoices before committing
console.log(JSON.stringify(preview, null, 2));
```

### Cancel Subscription

```javascript
const cancelReq = new ZuoraAPI.CreateOrderRequest();
cancelReq.OrderDate = today;
cancelReq.ExistingAccountNumber = 'A00000001';
cancelReq.Subscriptions = [{
    SubscriptionNumber: 'A-S00000001',
    OrderActions: [{
        Type: 'CancelSubscription',
        CancelSubscription: {
            CancelDate: today,
            CancelPolicy: 'SpecificDate'
        }
    }]
}];

const cancelOrder = await client.ordersApi.createOrder(cancelReq);
```

### Renew Subscription

```javascript
const renewReq = new ZuoraAPI.CreateOrderRequest();
renewReq.OrderDate = today;
renewReq.ExistingAccountNumber = 'A00000001';
renewReq.Subscriptions = [{
    SubscriptionNumber: 'A-S00000001',
    OrderActions: [{
        Type: 'RenewSubscription',
        RenewSubscription: {
            Terms: {
                RenewalTerms: [{
                    Period: 12,
                    PeriodType: 'Month'
                }]
            }
        }
    }]
}];

const renewOrder = await client.ordersApi.createOrder(renewReq);
```

## 6. Invoicing

### Standalone Invoices

Create invoices directly without a subscription:

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

### Bill Runs

Generate invoices for subscriptions in bulk:

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

## 7. Payments

### Create Payment and Apply to Invoice

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

### Payment Types

| Type | Description |
|---|---|
| **External** | Payment processed outside Zuora (check, wire, etc.) |
| **Electronic** | Payment processed through Zuora payment gateway |

### Payment Method Types

Common payment methods: `CreditCard`, `DebitCard`, `ACH`, `PayPal`, `Check`, `WireTransfer`, `Other`

## 8. Credit & Debit Memos

### Credit Memo

Apply credits to customer accounts for refunds, adjustments, or corrections.

### Debit Memo

Create additional charges outside the normal billing cycle.

Both support async operations for large volumes:
- `POST /v1/creditmemos` — Create credit memo
- `POST /v1/debitmemos` — Create debit memo
- Async variants available for bulk operations

## 9. Usage-Based Billing

Submit usage records for consumption-based charges:

```javascript
const usageData = [{
    Quantity: 150,
    StartDateTime: '2024-01-01T00:00:00',
    UOM: 'GB',
    SubscriptionNumber: 'A-S00000001',
    ChargeNumber: 'C-00000001'
}];

const usage = await client.usageApi.postUsage('A00000001', usageData);
```

## 10. Order Actions Summary

| Action Type | Description |
|---|---|
| `CreateSubscription` | Create a new subscription |
| `AddProduct` | Add a rate plan to existing subscription |
| `RemoveProduct` | Remove a rate plan |
| `UpdateProduct` | Modify charge quantities/pricing |
| `RenewSubscription` | Renew a termed subscription |
| `CancelSubscription` | Cancel a subscription |
| `TermsAndConditions` | Update subscription terms |
| `OwnerTransfer` | Transfer subscription ownership |
| `Suspend` | Temporarily suspend a subscription |
| `Resume` | Resume a suspended subscription |

## 11. Complete Order-to-Cash Example

```javascript
const { ZuoraClient, ZuoraAPI } = require('zuora-sdk-js');

(async () => {
    try {
        // 1. Initialize client
        const client = new ZuoraClient({
            clientId: process.env.ZUORA_CLIENT_ID,
            clientSecret: process.env.ZUORA_CLIENT_SECRET,
            env: ZuoraClient.SBX,
        });
        await client.initialize();

        const today = new Date().toISOString().split('T')[0];

        // 2. Create account
        let accountReq = new ZuoraAPI.CreateAccountRequest();
        accountReq.Name = 'Acme Corp';
        accountReq.Currency = 'USD';
        accountReq.BillCycleDay = 1;
        accountReq.AutoPay = false;
        accountReq.BillToContact = {
            FirstName: 'Jane', LastName: 'Doe',
            State: 'California', Country: 'USA'
        };
        const account = await client.accountsApi.createAccount(accountReq);
        console.log('Account:', account.AccountNumber);

        // 3. Create subscription via order
        const orderReq = new ZuoraAPI.CreateOrderRequest();
        orderReq.OrderDate = today;
        orderReq.ExistingAccountNumber = account.AccountNumber;
        orderReq.Subscriptions = [{
            OrderActions: [{
                Type: 'CreateSubscription',
                CreateSubscription: {
                    Terms: { InitialTerm: { TermType: 'EVERGREEN' } },
                    SubscribeToRatePlans: [
                        { ProductRatePlanNumber: 'PRP-00000151' }
                    ]
                }
            }]
        }];
        orderReq.ProcessingOptions = {
            RunBilling: true,
            BillingOptions: { TargetDate: today }
        };
        const order = await client.ordersApi.createOrder(orderReq);
        console.log('Order:', order.OrderNumber);

        // 4. Create standalone invoice
        const invoiceReq = new ZuoraAPI.CreateInvoiceRequest();
        invoiceReq.AccountNumber = account.AccountNumber;
        invoiceReq.AutoPay = false;
        invoiceReq.InvoiceDate = today;
        invoiceReq.Status = 'Posted';
        invoiceReq.InvoiceItems = [{
            Amount: 100.0,
            ChargeName: 'Set Up Fee',
            Quantity: 1.0,
            ServiceStartDate: today,
            UOM: 'Each'
        }];
        const invoice = await client.invoicesApi
            .createStandaloneInvoice(invoiceReq);
        console.log(`Invoice: ${invoice.InvoiceNumber}, Balance: $${invoice.Balance}`);

        // 5. Apply payment
        const paymentReq = new ZuoraAPI.CreatePaymentRequest();
        paymentReq.AccountNumber = account.AccountNumber;
        paymentReq.Amount = 100.0;
        paymentReq.Currency = 'USD';
        paymentReq.EffectiveDate = today;
        paymentReq.Type = 'External';
        paymentReq.PaymentMethodType = 'Check';
        paymentReq.Invoices = [{ Amount: 100.0, InvoiceId: invoice.Id }];
        const payment = await client.paymentsApi.createPayment(paymentReq);
        console.log('Payment:', payment.Number);

    } catch (error) {
        console.error(error);
    }
})();
```

## 12. Best Practices

- **Always preview orders** before creating to catch validation errors early
- **Use ProcessingOptions** to control whether billing runs immediately or is deferred
- **Prefer account numbers** over account IDs for readability in order requests
- **Use ProductRatePlanNumber** (not ID) for portability across environments
- **Handle partial failures** — some order actions may succeed while others fail
- **Use async endpoints** for bulk bill runs and large order batches
- **Set up webhooks** for billing events (invoice posted, payment received, etc.)
- **Test the full flow** in Sandbox before Production: catalog -> account -> order -> bill -> pay
