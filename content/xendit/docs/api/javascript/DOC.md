---
name: api
description: "Xendit Node.js SDK for Southeast Asia payments — Invoice, PaymentRequest, PaymentMethod, Refund, Transaction, Balance, Customer, Payout"
metadata:
  languages: "javascript"
  versions: "7.0.0"
  revision: 2
  updated-on: "2026-03-19"
  source: community
  tags: "xendit,payment,api,payout,disbursement,SEA,indonesia,philippines,nodejs,typescript"
---

# Xendit Node.js SDK Coding Guide

You are a Xendit API coding expert. Help write code that integrates with Xendit's payment APIs using the official Node.js SDK.

Official SDK: https://github.com/xendit/xendit-node  
API Docs: https://docs.xendit.co/apidocs  
Dashboard: https://dashboard.xendit.co/

## 1. Golden Rule

**Use the official Xendit Node.js SDK v7:**

```bash
npm install xendit-node@latest
```

**Requirements:** Node 18.0+. TypeScript supported out of the box.

```typescript
import { Xendit } from 'xendit-node';

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });

// Destructure modules from client
const { Invoice, PaymentRequest, PaymentMethod, Refund, Transaction, Balance, Customer, Payout } = xenditClient;
```

Or instantiate modules independently:

```typescript
import { Xendit, Invoice as InvoiceClient } from 'xendit-node';
const xenditInvoiceClient = new InvoiceClient({ secretKey: process.env.XENDIT_SECRET_KEY });
```

⚠️ **Do NOT use the old v4 pattern:** `const { Invoice } = new Xendit({...}); Invoice.createInvoice(...)` — this is deprecated.

## 2. Authentication

- Secret API Key as username, empty password, HTTP Basic Auth over HTTPS
- Test keys: `xnd_development_...` | Live keys: `xnd_production_...`
- Same base URL `https://api.xendit.co` for both environments — key type determines environment
- Never expose secret key client-side or commit to version control

## 3. Invoice

Payment link that supports multiple payment methods (VA, e-wallet, retail outlet, cards).

```typescript
// POST /v2/invoices/
const invoice = await xenditInvoiceClient.createInvoice({
  data: {
    externalId: `invoice-${Date.now()}`,   // unique per invoice
    amount: 10000,
    currency: 'IDR',                        // IDR, PHP, MYR, THB, VND
    description: 'Order #123',
    invoiceDuration: 172800,                // seconds (default 48h)
    payerEmail: 'customer@example.com',     // optional
    successRedirectUrl: 'https://yoursite.com/success',
    failureRedirectUrl: 'https://yoursite.com/failure',
    items: [{ name: 'Product A', quantity: 1, price: 10000 }]  // optional
  }
});
// Returns: { id, invoiceUrl, status: 'PENDING', expiryDate, ... }
// Redirect user to invoice.invoiceUrl
```

```typescript
// GET /v2/invoices/{invoice_id}
const inv = await xenditInvoiceClient.getInvoiceById({ invoiceId: 'inv-xxx' });
// status: PENDING | SETTLED | EXPIRED

// GET /v2/invoices (list with filters)
const invoices = await xenditInvoiceClient.getInvoices({
  statuses: ['PENDING'],
  limit: 10,
  createdAfter: new Date('2026-01-01')
});

// POST /invoices/{invoice_id}/expire!
await xenditInvoiceClient.expireInvoice({ invoiceId: 'inv-xxx' });
```

**Invoice Webhook Callback:**
```typescript
// Callback header: x-callback-token
const invoiceCallback = {
  id: '593f4ed1c3d3bb7f39733d83',
  externalId: 'order-123',
  status: 'PAID',           // PAID | EXPIRED
  paymentMethod: 'OVO',
  paidAmount: 10000,
  paidAt: '2026-01-14T02:32:50.912Z'
}
```

## 4. PaymentRequest (Recommended for new integrations)

Unified API for e-wallets, QR codes, virtual accounts, cards, and direct debit.

```typescript
// POST /payment_requests
// E-Wallet (DANA, OVO, GOPAY, SHOPEEPAY, LINKAJA)
const prEwallet = await xenditPaymentRequestClient.createPaymentRequest({
  idempotencyKey: `pr-${Date.now()}`,
  data: {
    referenceId: 'example-ref-1234',
    country: 'ID',
    currency: 'IDR',
    amount: 15000,
    paymentMethod: {
      type: 'EWALLET',
      reusability: 'ONE_TIME_USE',
      ewallet: {
        channelCode: 'SHOPEEPAY',
        channelProperties: {
          successReturnUrl: 'https://yoursite.com/success'
        }
      }
    }
  }
});
// Actions: prEwallet.actions[0].url → redirect user here

// QR Code (QRIS for Indonesia)
const prQR = await xenditPaymentRequestClient.createPaymentRequest({
  data: {
    referenceId: 'example-ref-1234',
    currency: 'IDR',
    amount: 15000,
    paymentMethod: {
      type: 'QR_CODE',
      reusability: 'ONE_TIME_USE',
      qrCode: { channelCode: 'QRIS' }
    }
  }
});

// Virtual Account
const prVA = await xenditPaymentRequestClient.createPaymentRequest({
  data: {
    referenceId: 'example-ref-1234',
    country: 'ID',
    currency: 'IDR',
    amount: 15000,
    paymentMethod: {
      type: 'VIRTUAL_ACCOUNT',
      reusability: 'ONE_TIME_USE',
      virtualAccount: {
        channelCode: 'BNI',    // BCA, BNI, BRI, MANDIRI, PERMATA, BSI
        channelProperties: {
          customerName: 'Ahmad Gunawan',
          expiresAt: '2026-03-20T17:00:00Z'
        }
      }
    }
  }
});

// Subsequent payment with saved payment method
const prTokenized = await xenditPaymentRequestClient.createPaymentRequest({
  data: {
    referenceId: 'example-ref-1234',
    currency: 'IDR',
    amount: 15000,
    paymentMethodId: 'pm-2b2c6092-2100-4843-a7fc-f5c7edac7efd'  // from PaymentMethod
  }
});
```

```typescript
// GET /payment_requests/{paymentRequestId}
const pr = await xenditPaymentRequestClient.getPaymentRequestByID({
  paymentRequestId: 'pr-1fdaf346-dd2e-4b6c-b938-124c7167a822'
});
// pr.status: PENDING | SUCCEEDED | FAILED | VOIDED | REQUIRES_ACTION

// GET /payment_requests (list)
const allPR = await xenditPaymentRequestClient.getAllPaymentRequests({ limit: 10 });

// Capture (for auth-capture flow)
await xenditPaymentRequestClient.capturePaymentRequest({
  paymentRequestId: 'pr-xxx',
  data: { captureAmount: 15000 }
});

// Simulate payment (test environment only)
await xenditPaymentRequestClient.simulatePaymentRequestPayment({
  paymentRequestId: 'pr-xxx'
});
```

## 5. PaymentMethod

Create and manage reusable payment methods for tokenized/recurring payments.

```typescript
// POST /v2/payment_methods
const pm = await xenditPaymentMethodClient.createPaymentMethod({
  data: {
    type: 'EWALLET',
    reusability: 'MULTIPLE_USE',
    ewallet: {
      channelCode: 'OVO',
      channelProperties: {
        successReturnUrl: 'https://yoursite.com/success',
        failureReturnUrl: 'https://yoursite.com/failure',
        mobileNumber: '+6281234567890'
      }
    },
    customerId: 'customer-id'  // optional, link to customer
  }
});
// pm.status: ACTIVE | PENDING | INACTIVE | EXPIRED
// For PENDING: redirect user to pm.actions[0].url to authorize

// GET /v2/payment_methods/{paymentMethodId}
const pmDetails = await xenditPaymentMethodClient.getPaymentMethodByID({
  paymentMethodId: 'pm-xxx'
});

// GET /v2/payment_methods (list by customer)
const pmList = await xenditPaymentMethodClient.getAllPaymentMethods({
  customerId: 'customer-id',
  type: 'EWALLET'
});

// POST /v2/payment_methods/{paymentMethodId}/expire
await xenditPaymentMethodClient.expirePaymentMethod({
  paymentMethodId: 'pm-xxx'
});
```

## 6. Refund

```typescript
// POST /refunds
const refund = await xenditRefundClient.createRefund({
  idempotencyKey: `refund-${Date.now()}`,
  data: {
    paymentRequestId: 'pr-xxx',    // use paymentRequestId OR invoiceId
    // invoiceId: 'inv-xxx',
    referenceId: `refund-ref-${Date.now()}`,
    amount: 5000,                   // partial; omit for full refund
    reason: 'REQUESTED_BY_CUSTOMER'  // DUPLICATE | FRAUDULENT | REQUESTED_BY_CUSTOMER
  }
});

// GET /refunds/{refundID}
const r = await xenditRefundClient.getRefund({ refundID: 'rfd-xxx' });

// GET /refunds (list)
const refunds = await xenditRefundClient.getAllRefunds({
  paymentRequestId: 'pr-xxx',
  limit: 10
});

// POST /refunds/{refundID}/cancel
await xenditRefundClient.cancelRefund({ refundID: 'rfd-xxx' });
```

## 7. Transaction

Query transaction history.

```typescript
// GET /transactions (list)
const txns = await xenditTransactionClient.getAllTransactions({
  types: ['PAYMENT', 'REFUND'],    // filter by type
  statuses: ['SUCCESS'],
  currency: 'IDR',
  limit: 10,
  afterId: 'txn-xxx'              // pagination cursor
});

// GET /transactions/{id}
const txn = await xenditTransactionClient.getTransactionByID({
  id: 'txn-xxx'
});
```

## 8. Balance

```typescript
// GET /balance
const balance = await xenditBalanceClient.getBalance({
  accountType: 'CASH'   // CASH | HOLDING | TAX (default: CASH)
});
// balance.balance → number
```

## 9. Customer

```typescript
// POST /customers
const customer = await xenditCustomerClient.createCustomer({
  data: {
    referenceId: `customer-${userId}`,   // your internal user ID
    type: 'INDIVIDUAL',                   // INDIVIDUAL | BUSINESS
    givenNames: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    mobileNumber: '+6281234567890',
    addresses: [{ country: 'ID', city: 'Jakarta' }]
  }
});

// GET /customers/{id}
const c = await xenditCustomerClient.getCustomer({ id: 'customer-id' });

// GET /customers?reference_id=xxx
const cByRef = await xenditCustomerClient.getCustomerByReferenceID({
  referenceId: 'your-internal-user-id'
});

// PATCH /customers/{id}
const updated = await xenditCustomerClient.updateCustomer({
  id: 'customer-id',
  data: { email: 'newemail@example.com' }
});
```

## 10. Payout

Send money to bank accounts or e-wallets.

```typescript
// GET /payouts_channels — list all supported channels
const channels = await xenditPayoutClient.getPayoutChannels({
  currency: 'IDR',
  channelCategory: ['BANK']   // BANK | EWALLET
});

// POST /v2/payouts
const payout = await xenditPayoutClient.createPayout({
  idempotencyKey: `payout-${Date.now()}`,  // REQUIRED — prevents duplicate disbursement
  data: {
    referenceId: 'DISB-001',
    currency: 'IDR',              // IDR, PHP, MYR, THB, VND
    channelCode: 'ID_BCA',        // see channel codes below
    channelProperties: {
      accountHolderName: 'John Doe',
      accountNumber: '1234567890'
    },
    amount: 90000,
    description: 'Refund for order #123',
    type: 'DIRECT_DISBURSEMENT'
  }
});
// payout.status: ACCEPTED | SUCCEEDED | FAILED | CANCELLED

// GET /v2/payouts/{id}
const p = await xenditPayoutClient.getPayoutById({ id: 'disb-xxx' });

// GET /v2/payouts?reference_id=xxx
const payouts = await xenditPayoutClient.getPayouts({ referenceId: 'DISB-001' });

// POST /v2/payouts/{id}/cancel (only when status = ACCEPTED)
await xenditPayoutClient.cancelPayout({ id: 'disb-xxx' });
```

**Channel codes by country:**

| Country | Banks | E-Wallets |
|---|---|---|
| 🇮🇩 Indonesia | `ID_BCA`, `ID_BNI`, `ID_BRI`, `ID_MANDIRI`, `ID_CIMB`, `ID_PERMATA` | `ID_OVO`, `ID_DANA`, `ID_GOPAY`, `ID_SHOPEEPAY` |
| 🇵🇭 Philippines | `PH_BDO`, `PH_BPI`, `PH_LANDBANK`, `PH_METROBANK` | `PH_GCASH`, `PH_PAYMAYA` |
| 🇲🇾 Malaysia | `MY_MAYBANK`, `MY_CIMB`, `MY_PUBLIC_BANK`, `MY_RHB` | `MY_TOUCHNGO` |
| 🇻🇳 Vietnam | `VN_VIETCOMBANK`, `VN_TECHCOMBANK`, `VN_MB`, `VN_BIDV` | — |
| 🇹🇭 Thailand | `TH_KBANK`, `TH_SCB`, `TH_BBL` | `TH_TRUEMONEY` |

## 11. Webhook Handling

```typescript
import express from 'express';
const app = express();

app.use('/webhooks/xendit', express.json());

app.post('/webhooks/xendit', (req, res) => {
  // Verify callback token
  const token = req.headers['x-callback-token'];
  if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const event = req.body;

  // Handle by event type
  switch (event.event) {
    case 'payment.succeeded':
    case 'payment.failed':
      // PaymentRequest webhook
      break;
    case 'invoice.paid':
    case 'invoice.expired':
      // Invoice webhook — field: event.id (invoice id)
      break;
    case 'payout.succeeded':
    case 'payout.failed':
      // Payout/Disbursement webhook
      break;
  }

  res.status(200).json({ received: true });
  // ⚠️ Process async if heavy — respond 200 immediately
});
```

## 12. Error Handling

```typescript
import { XenditSdkError } from 'xendit-node';

try {
  const invoice = await xenditInvoiceClient.createInvoice({ data: { ... } });
} catch (err) {
  if (err instanceof XenditSdkError) {
    console.error({
      status: err.status,       // HTTP status code
      errorCode: err.rawResponse?.errorCode,
      message: err.message
    });
  }
}
```

**Common error codes:**

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `INVALID_OR_MISSING_FIELD` | Bad request params |
| 409 | `DUPLICATE_ERROR` | Same `externalId`/`referenceId` already used |
| 400 | `INVALID_PAYMENT_METHOD` | Channel not available for country/amount |
| 402 | `INSUFFICIENT_BALANCE` | Xendit balance too low for payout |
| 404 | `DATA_NOT_FOUND` | Resource ID doesn't exist |
| 503 | `CHANNEL_UNAVAILABLE` | Payment channel temporarily down |
| 429 | — | Rate limit exceeded — retry after `Retry-After` header |

## 13. Common Mistakes

❌ **Reusing `externalId`/`referenceId`** → `DUPLICATE_ERROR`. Always generate unique IDs.  
❌ **Missing `idempotencyKey` on Payout** → risk of double disbursement on retry.  
❌ **Using test keys in production** → `xnd_development_*` = no real money.  
❌ **Not handling webhook duplicates** → Xendit retries on non-200; make handlers idempotent.  
❌ **Treating timeout as failure** → query status before retry, especially for payouts.  
❌ **Retrying ACCEPTED payout status** → it's already processing; use `cancelPayout` if needed.
