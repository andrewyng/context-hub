---
name: terminal-api
description: "Xendit Terminal API (H2H) for EDC payment processing — payment sessions, commands, callbacks, and error handling"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "xendit,terminal,edc,payment,h2h,pos"
---

# Xendit Terminal API (H2H) Guidelines

You are a Xendit Terminal API coding expert. Help write code that integrates with Xendit's EDC terminal payment system via the Host-to-Host (H2H) API.

Official docs: https://terminal-docs.xendit.co

## Key Concepts

### Payment Session vs Payment Object

- **Payment Session** (`payment_session_id`) — temporary context managing the preparation phase. Created when you initiate a payment. States: `ACTIVE` → `COMPLETED` / `FAILED` / `CANCELED`
- **Payment Object** (`payment_id`) — permanent immutable record created only after a transaction is successfully processed through the payment network. Only exists if session reaches `COMPLETED`.

Never confuse these two. A `COMPLETED` session means a `payment_id` exists. A `FAILED` or `CANCELED` session has no associated payment.

## Authentication

All API calls use **API Key via HTTP Basic Auth over TLS**:
- API Key = username
- Password = empty string
- Encode as Base64: `base64("your-api-key:")`

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.xendit.co',
  auth: {
    username: process.env.XENDIT_API_KEY,
    password: ''
  },
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Create Payment Session

```javascript
// POST /v1/terminal/sessions
async function createPaymentSession({ amount, currency, terminalId, referenceId }) {
  const response = await client.post('/v1/terminal/sessions', {
    amount,
    currency,           // e.g. "IDR", "PHP", "MYR"
    terminal_id: terminalId,
    reference_id: referenceId,
    payment_method_types: ["CARD"]  // or ["QRIS"], ["CARD", "QRIS"]
  }, {
    headers: {
      'Idempotency-key': referenceId  // REQUIRED — prevents duplicate charges on retry
    }
  });

  return response.data; // { payment_session_id, status: "ACTIVE", ... }
}
```

⚠️ **Always include `Idempotency-key` header.** Use a unique value per payment attempt. Reuse the same key when retrying the same payment to prevent double charges.

## Query Payment Session Status

```javascript
// GET /v1/terminal/sessions/{id}
async function getSessionStatus(paymentSessionId) {
  const response = await client.get(`/v1/terminal/sessions/${paymentSessionId}`);
  return response.data;
  // { payment_session_id, status, payment_id (if COMPLETED), ... }
}
```

## Retry Failed Session

```javascript
// POST /v1/terminal/sessions/{id}/retry
async function retrySession(paymentSessionId) {
  const response = await client.post(`/v1/terminal/sessions/${paymentSessionId}/retry`);
  return response.data;
}
```

## Get Payment Details

```javascript
// GET /v1/terminal/payments/{id}
async function getPayment(paymentId) {
  const response = await client.get(`/v1/terminal/payments/${paymentId}`);
  return response.data;
}
```

## Void a Payment

```javascript
// POST /v1/terminal/payments/{id}/void
async function voidPayment(paymentId) {
  const response = await client.post(`/v1/terminal/payments/${paymentId}/void`);
  return response.data;
}
```

## Send Terminal Command

```javascript
// POST /v1/terminal/commands
async function sendCommand({ terminalId, commandType }) {
  const response = await client.post('/v1/terminal/commands', {
    terminal_id: terminalId,
    command: commandType  // e.g. "PRINT_RECEIPT", "SETTLEMENT"
  });
  return response.data;
}
```

## Error Handling

### Critical Rules

1. **Timeout ≠ Failure.** Always query session status before retrying or cancelling.
2. **UNKNOWN status → Do NOT retry.** Transaction may have succeeded at bank level. Flag for manual reconciliation.
3. **Webhooks = notifications only.** Always implement API polling fallback — never rely solely on webhooks.
4. **4xx errors** = fix request params, create new session. **5xx errors** = retry with same `Idempotency-key`.

### Status Decision Tree

```
Send payment request
        │
        ├─ Got response?
        │       ├─ 4xx → Fix params, new session
        │       └─ 5xx → Retry same idempotency_key (max 3x)
        │
        └─ Timeout? → Query GET /v1/terminal/sessions/{id}
                            │
                            ├─ COMPLETED → Get payment_id, proceed
                            ├─ ACTIVE    → Poll again in 5-10s (max 120s)
                            ├─ FAILED    → Safe to retry with new session
                            └─ CANCELED  → Session expired, create new session
```

### Polling Implementation

```javascript
async function waitForPayment(paymentSessionId, { maxWaitMs = 120000, pollIntervalMs = 5000 } = {}) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const session = await getSessionStatus(paymentSessionId);

    if (session.status === 'COMPLETED') {
      return { success: true, paymentId: session.payment_id };
    }

    if (session.status === 'FAILED') {
      return { success: false, reason: 'FAILED', session };
    }

    if (session.status === 'CANCELED') {
      return { success: false, reason: 'CANCELED', session };
    }

    // Still ACTIVE — wait and poll again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  // Timed out — UNKNOWN state, do NOT retry
  return { success: false, reason: 'UNKNOWN', paymentSessionId };
}
```

### Full Payment Flow with Error Handling

```javascript
async function processPayment({ amount, currency, terminalId }) {
  const referenceId = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let session;
  try {
    session = await createPaymentSession({ amount, currency, terminalId, referenceId });
  } catch (err) {
    if (err.response?.status >= 400 && err.response?.status < 500) {
      // Client error — do not retry
      throw new Error(`Payment request invalid: ${err.response.data?.message}`);
    }
    // Server error or timeout — query status first
    if (err.response?.data?.payment_session_id) {
      session = { payment_session_id: err.response.data.payment_session_id };
    } else {
      throw err; // Can't recover without a session ID
    }
  }

  // Wait for terminal to process payment
  const result = await waitForPayment(session.payment_session_id);

  if (result.success) {
    const payment = await getPayment(result.paymentId);
    return { status: 'SUCCESS', payment };
  }

  if (result.reason === 'UNKNOWN') {
    // Log for manual reconciliation — DO NOT retry
    console.error('Payment status UNKNOWN — manual reconciliation required', {
      paymentSessionId: result.paymentSessionId,
      terminalId,
      referenceId,
      amount
    });
    return { status: 'UNKNOWN', requiresReconciliation: true };
  }

  return { status: result.reason };
}
```

## Webhook Handling

Xendit sends callbacks to your configured webhook URL when payment status changes.

```javascript
// Verify webhook authenticity
function verifyWebhook(req) {
  const callbackToken = req.headers['x-callback-token'];
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

  if (callbackToken !== expectedToken) {
    throw new Error('Invalid webhook signature');
  }
  return req.body;
}

// Idempotent webhook handler
const processedPayments = new Set(); // Use Redis/DB in production

app.post('/webhooks/xendit', (req, res) => {
  const event = verifyWebhook(req);

  if (event.payment_id && processedPayments.has(event.payment_id)) {
    return res.status(200).json({ received: true }); // Already processed
  }

  if (event.status === 'SUCCEEDED') {
    processedPayments.add(event.payment_id);
    // Handle successful payment
  }

  res.status(200).json({ received: true });
});
```

## Common Mistakes

❌ **Treating timeout as failure** — always query status first  
❌ **Retrying UNKNOWN status** — risk of double charge  
❌ **Relying solely on webhooks** — implement polling fallback  
❌ **Missing idempotency key** — risk of duplicate charges on network retry  
❌ **Confusing payment_session_id with payment_id** — session is temporary, payment is permanent  

## Integration Types

| Type | Use Case | Auth |
|---|---|---|
| H2H (this doc) | Backend-to-Xendit API | API Key Basic Auth over TLS |
| C2C | Terminal Gateway App ↔ POS app on local network | X-API-KEY header, HTTP only |

For C2C (Client-to-Client) integration via the local Gateway App, the POS communicates with the terminal over HTTP on the local network (not HTTPS natively — use reverse proxy for TLS if required).
