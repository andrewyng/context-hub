---
name: payments
description: "Mercado Pago Payments SDK for PIX, credit card, and boleto payments in Brazil"
metadata:
  languages: "javascript"
  versions: "2.5.0"
  revision: 1
  updated-on: "2026-04-08"
  source: community
  tags: "mercadopago,payments,pix,brazil,fintech,boleto"
---

# Mercado Pago Payments - JavaScript SDK (mercadopago)

## Golden Rule

**ALWAYS** use the `mercadopago` npm package v2.x. The v1.x API is deprecated.

**ALWAYS** use `access_token` from your Mercado Pago dashboard (not client credentials for server-side).

---

## Installation

```bash
npm install mercadopago
```

---

## Configuration

```javascript
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});
```

Environment variables:

```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret
```

---

## PIX Payment (most common in Brazil)

```javascript
const payment = new Payment(client);

const result = await payment.create({
  body: {
    transaction_amount: 100.00,
    description: 'Product description',
    payment_method_id: 'pix',
    payer: {
      email: 'customer@email.com',
      first_name: 'João',
      last_name: 'Silva',
      identification: {
        type: 'CPF',
        number: '12345678909'
      }
    }
  }
});

// PIX QR code data
const qrCode = result.point_of_interaction.transaction_data.qr_code;
const qrCodeBase64 = result.point_of_interaction.transaction_data.qr_code_base64;
const ticketUrl = result.point_of_interaction.transaction_data.ticket_url;
```

## Credit Card Payment

```javascript
const result = await payment.create({
  body: {
    transaction_amount: 150.00,
    token: cardToken, // from MercadoPago.js frontend tokenization
    description: 'Product description',
    installments: 3,
    payment_method_id: 'visa',
    payer: {
      email: 'customer@email.com',
      identification: {
        type: 'CPF',
        number: '12345678909'
      }
    }
  }
});
```

## Boleto Payment

```javascript
const result = await payment.create({
  body: {
    transaction_amount: 200.00,
    description: 'Product description',
    payment_method_id: 'bolbradesco',
    payer: {
      email: 'customer@email.com',
      first_name: 'João',
      last_name: 'Silva',
      identification: {
        type: 'CPF',
        number: '12345678909'
      },
      address: {
        zip_code: '01310-100',
        street_name: 'Avenida Paulista',
        street_number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        federal_unit: 'SP'
      }
    }
  }
});

const boletoUrl = result.transaction_details.external_resource_url;
```

## Check Payment Status

```javascript
const paymentInfo = await payment.get({ id: paymentId });

// Status values: pending, approved, authorized, in_process,
//                in_mediation, rejected, cancelled, refunded, charged_back
console.log(paymentInfo.status);
console.log(paymentInfo.status_detail);
```

## Webhooks

Mercado Pago sends POST notifications to your webhook URL.

```javascript
// Express webhook handler
app.post('/webhooks/mercadopago', (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;
    // Fetch full payment details
    const payment = await new Payment(client).get({ id: paymentId });

    switch (payment.status) {
      case 'approved':
        // Fulfill order
        break;
      case 'rejected':
        // Notify customer
        break;
    }
  }

  res.status(200).send('OK');
});
```

### Webhook signature verification

```javascript
import crypto from 'crypto';

function verifyWebhook(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const dataId = req.query['data.id'];

  // Parse ts and hash from x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map(p => p.trim().split('='))
  );

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`;
  const hmac = crypto
    .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest('hex');

  return hmac === parts.v1;
}
```

## Refunds

```javascript
import { PaymentRefund } from 'mercadopago';

const refund = new PaymentRefund(client);

// Full refund
await refund.create({ payment_id: paymentId, body: {} });

// Partial refund
await refund.create({
  payment_id: paymentId,
  body: { amount: 50.00 }
});
```

## Common Errors

| Status | Detail | Meaning |
|--------|--------|---------|
| rejected | cc_rejected_bad_filled_card_number | Invalid card number |
| rejected | cc_rejected_insufficient_amount | Insufficient funds |
| rejected | cc_rejected_high_risk | Rejected by fraud prevention |
| pending | pending_waiting_transfer | PIX awaiting payment |

## Important Notes

- PIX payments expire in 30 minutes by default. Set `date_of_expiration` to customize.
- CPF (11 digits) is required for all Brazilian payments. CNPJ (14 digits) for businesses.
- Test credentials use `TETE-` prefix. Production uses `APP_USR-`.
- Sandbox emails must end with `@testuser.com`.
