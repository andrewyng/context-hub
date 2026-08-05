---
name: api
description: "Broad Stripe API surface for Node.js: Customers, Products/Prices, Invoices, Refunds, search, expansions, idempotency, pagination, and error handling"
metadata:
  languages: "javascript"
  versions: "22.2.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "stripe,api,payments,billing"
---
# Stripe API Coding Guide (Node.js)

## 1. Golden Rule

Use the official Stripe Node SDK on the server and let Stripe.js / Elements / Checkout handle anything sensitive on the client. The same SDK that handles payments also exposes the broader Stripe API surface — Customers, Products, Prices, Invoices, Refunds, search, and more.

- Server-side: `stripe` (Node.js library)
- Client-side: `@stripe/stripe-js` (loader for Stripe.js)
- React: `@stripe/react-stripe-js` (Elements, hooks)

**Current SDK Version:** `stripe` v22.2.0 (Node).

**API Version:** Stripe pins API versions by date. The current released version is `2026-05-27.dahlia`. Your account is pinned to the version of your first request; override per-request via `apiVersion` on the SDK constructor.

## 2. Installation

### Server-Side (Node.js)

```bash
npm install stripe
```

```bash
yarn add stripe
```

```bash
pnpm add stripe
```

**Requirements:** Node.js 18+ (Node 18 LTS is the minimum supported; Node 20 or 22 is recommended for production).

### Client-Side (Browser)

```bash
npm install @stripe/stripe-js
```

```bash
yarn add @stripe/stripe-js
```

### React Applications

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```bash
yarn add @stripe/stripe-js @stripe/react-stripe-js
```

### Environment Variables

```bash
# Required
STRIPE_SECRET_KEY=sk_test_51H...  # Server-side only, NEVER expose in browser
STRIPE_PUBLISHABLE_KEY=pk_test_51H...  # Safe for client-side use

# Optional
STRIPE_WEBHOOK_SECRET=whsec_...  # For webhook signature verification
STRIPE_API_VERSION=2026-05-27.dahlia  # Override default API version
```

**CRITICAL:** Never commit secret keys to version control. Use environment variables or secure secret management systems.

## 3. Initialization

### Server-Side Initialization (Node.js)

```javascript
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
```

**With TypeScript:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});
```

**Advanced Configuration:**

```javascript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-05-27.dahlia',
  maxNetworkRetries: 2,
  timeout: 80000, // 80 seconds
  telemetry: true,
  appInfo: {
    name: 'MyApp',
    version: '1.0.0',
    url: 'https://myapp.com',
  },
});
```

### Client-Side Initialization (Browser)

```javascript
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe.js asynchronously
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

// Later, when you need to use it
const stripe = await stripePromise;
```

**Advanced Loading Options:**

```javascript
const stripePromise = loadStripe(
  process.env.STRIPE_PUBLISHABLE_KEY,
  {
    locale: 'en',
    betas: ['some_beta_feature'],
    apiVersion: '2026-05-27.dahlia',
  }
);
```

### React Initialization

```javascript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your payment components here */}
    </Elements>
  );
}
```

**With Options:**

```javascript
function App() {
  const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
```

## 4. Core API Surfaces

### Payment Intents

Payment Intents are the recommended way to handle payments. They track the entire payment lifecycle and support Strong Customer Authentication (SCA).

**Minimal Server-Side Example:**

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1099, // Amount in cents ($10.99)
  currency: 'usd',
  payment_method_types: ['card'],
});

// Send clientSecret to client
res.json({ clientSecret: paymentIntent.client_secret });
```

**Advanced Server-Side Example:**

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  payment_method_types: ['card', 'us_bank_account'],
  customer: 'cus_123456789',
  description: 'Software subscription',
  metadata: {
    order_id: '6735',
    customer_email: 'customer@example.com',
  },
  statement_descriptor: 'MYCOMPANY SUB',
  receipt_email: 'customer@example.com',
  automatic_payment_methods: {
    enabled: true,
    allow_redirects: 'never',
  },
  capture_method: 'manual', // For later capture
});
```

**Client-Side Confirmation (React):**

```javascript
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://example.com/order/complete',
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
    </form>
  );
}
```

**Vanilla JavaScript Confirmation:**

```javascript
const stripe = await stripePromise;

const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  }
);

if (error) {
  console.error(error.message);
} else if (paymentIntent.status === 'succeeded') {
  console.log('Payment successful!');
}
```

### Checkout Sessions

Stripe Checkout provides a pre-built, hosted payment page.

**Minimal Server-Side Example:**

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
});

// Redirect to Checkout
res.redirect(303, session.url);
```

**Advanced Server-Side Example:**

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: 'price_1234567890', // Existing price ID
      quantity: 2,
    },
  ],
  mode: 'payment',
  customer: 'cus_123456789',
  customer_email: 'customer@example.com',
  client_reference_id: 'order_12345',
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
  automatic_tax: { enabled: true },
  allow_promotion_codes: true,
  billing_address_collection: 'required',
  shipping_address_collection: {
    allowed_countries: ['US', 'CA'],
  },
  payment_method_types: ['card', 'us_bank_account'],
  metadata: {
    order_id: '6735',
  },
  invoice_creation: {
    enabled: true,
  },
});
```

**Client-Side Redirect:**

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(publishableKey);

// Redirect to Checkout
const { error } = await stripe.redirectToCheckout({
  sessionId: session.id,
});

if (error) {
  console.error(error.message);
}
```

### Customers

Customers represent your users in Stripe.

**Minimal Example:**

```javascript
const customer = await stripe.customers.create({
  email: 'customer@example.com',
});
```

**Advanced Example:**


```javascript
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  name: 'John Doe',
  phone: '+15555551234',
  description: 'Premium customer',
  metadata: {
    user_id: 'user_12345',
    plan: 'premium',
  },
  address: {
    line1: '510 Townsend St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94103',
    country: 'US',
  },
  payment_method: 'pm_card_visa',
  invoice_settings: {
    default_payment_method: 'pm_card_visa',
  },
});
```

**Retrieve and Update:**

```javascript
// Retrieve customer
const customer = await stripe.customers.retrieve('cus_123456789');

// Update customer
const updatedCustomer = await stripe.customers.update('cus_123456789', {
  metadata: { vip: 'true' },
  email: 'newemail@example.com',
});

// List customers
const customers = await stripe.customers.list({
  limit: 100,
  email: 'customer@example.com',
});
```

**Attach Payment Method to Customer:**

```javascript
const paymentMethod = await stripe.paymentMethods.attach(
  'pm_card_visa',
  { customer: 'cus_123456789' }
);

// Set as default payment method
await stripe.customers.update('cus_123456789', {
  invoice_settings: {
    default_payment_method: 'pm_card_visa',
  },
});
```

### Subscriptions

Subscriptions bill customers on a recurring basis.

**Minimal Example:**

```javascript
const subscription = await stripe.subscriptions.create({
  customer: 'cus_123456789',
  items: [
    { price: 'price_1234567890' },
  ],
});
```

**Advanced Example:**

```javascript
const subscription = await stripe.subscriptions.create({
  customer: 'cus_123456789',
  items: [
    {
      price: 'price_1234567890',
      quantity: 1,
    },
  ],
  payment_behavior: 'default_incomplete',
  payment_settings: {
    payment_method_types: ['card', 'us_bank_account'],
    save_default_payment_method: 'on_subscription',
  },
  expand: ['latest_invoice.payment_intent'],
  trial_period_days: 14,
  metadata: {
    user_id: 'user_12345',
  },
  proration_behavior: 'create_prorations',
  billing_cycle_anchor_config: {
    day_of_month: 1,
  },
  automatic_tax: {
    enabled: true,
  },
});

// Return client secret for payment confirmation
const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
```

**Update Subscription:**

```javascript
const updatedSubscription = await stripe.subscriptions.update(
  'sub_1234567890',
  {
    items: [
      {
        id: 'si_1234567890',
        price: 'price_new_plan',
      },
    ],
    proration_behavior: 'always_invoice',
  }
);
```

**Cancel Subscription:**

```javascript
// Cancel at period end
const subscription = await stripe.subscriptions.update('sub_1234567890', {
  cancel_at_period_end: true,
});

// Cancel immediately
const canceledSubscription = await stripe.subscriptions.cancel('sub_1234567890');
```

### Products and Prices

Products represent what you sell, Prices define how you charge for products.

**Create Product:**

```javascript
const product = await stripe.products.create({
  name: 'Premium Subscription',
  description: 'Access to all premium features',
  metadata: {
    category: 'subscription',
  },
});
```

**Create Price (One-Time):**

```javascript
const price = await stripe.prices.create({
  product: 'prod_1234567890',
  unit_amount: 2000,
  currency: 'usd',
});
```

**Create Price (Recurring):**

```javascript
const recurringPrice = await stripe.prices.create({
  product: 'prod_1234567890',
  unit_amount: 1500,
  currency: 'usd',
  recurring: {
    interval: 'month',
    interval_count: 1,
    usage_type: 'licensed',
  },
  billing_scheme: 'per_unit',
  tax_behavior: 'exclusive',
});
```

**Advanced Pricing (Tiered):**

```javascript
const tieredPrice = await stripe.prices.create({
  product: 'prod_1234567890',
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
  billing_scheme: 'tiered',
  tiers_mode: 'graduated',
  tiers: [
    {
      up_to: 10,
      unit_amount: 1000,
    },
    {
      up_to: 100,
      unit_amount: 800,
    },
    {
      up_to: 'inf',
      unit_amount: 500,
    },
  ],
});
```

### Payment Methods

Payment Methods represent customer payment details.

**Create Payment Method (Server-Side):**

```javascript
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: {
    token: 'tok_visa',
  },
});
```

**Create Payment Method (Client-Side with Elements):**

```javascript
const stripe = await stripePromise;
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// When form is submitted
const { error, paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
  billing_details: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});

if (error) {
  console.error(error.message);
} else {
  console.log('PaymentMethod created:', paymentMethod.id);
}
```

**List Customer Payment Methods:**

```javascript
const paymentMethods = await stripe.paymentMethods.list({
  customer: 'cus_123456789',
  type: 'card',
});
```

**Detach Payment Method:**

```javascript
const detachedPM = await stripe.paymentMethods.detach('pm_1234567890');
```

### Refunds

**Create Refund:**

```javascript
// Full refund
const refund = await stripe.refunds.create({
  payment_intent: 'pi_1234567890',
});

// Partial refund
const partialRefund = await stripe.refunds.create({
  payment_intent: 'pi_1234567890',
  amount: 500, // Refund $5.00 of original charge
  reason: 'requested_by_customer',
  metadata: {
    reason_detail: 'Customer changed mind',
  },
});
```

**Retrieve Refund:**

```javascript
const refund = await stripe.refunds.retrieve('re_1234567890');
```

### Webhooks

Webhooks notify your application when events occur in your Stripe account.

**Setup Webhook Endpoint (Express.js):**

```javascript
const express = require('express');
const app = express();

// CRITICAL: Use raw body for webhook signature verification
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // Fulfill the order
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Notify customer
        break;
      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        break;
      case 'customer.subscription.updated':
        const updatedSub = event.data.object;
        console.log('Subscription updated:', updatedSub.id);
        break;
      case 'customer.subscription.deleted':
        const canceledSub = event.data.object;
        console.log('Subscription canceled:', canceledSub.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);
```

**Advanced Webhook Handling:**

```javascript
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event asynchronously to respond quickly
  processWebhookEvent(event)
    .then(() => console.log('Event processed successfully'))
    .catch((err) => console.error('Event processing failed:', err));

  // Respond immediately
  res.json({ received: true });
});

async function processWebhookEvent(event) {
  const eventData = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      const session = eventData;
      // Fulfill order based on session
      if (session.mode === 'payment') {
        await fulfillOrder(session);
      } else if (session.mode === 'subscription') {
        await activateSubscription(session);
      }
      break;

    case 'invoice.paid':
      // Handle successful payment of invoice
      await handleInvoicePaid(eventData);
      break;

    case 'invoice.payment_failed':
      // Handle failed payment
      await notifyCustomerPaymentFailed(eventData);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

### Invoices

**Create Invoice:**

```javascript
// Create invoice item
await stripe.invoiceItems.create({
  customer: 'cus_123456789',
  amount: 2500,
  currency: 'usd',
  description: 'One-time setup fee',
});

// Create and finalize invoice
const invoice = await stripe.invoices.create({
  customer: 'cus_123456789',
  auto_advance: true, // Auto-finalize
  collection_method: 'charge_automatically',
});

// Finalize invoice (if not auto-advance)
const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

// Pay invoice
const paidInvoice = await stripe.invoices.pay(invoice.id);
```

### Customer Portal

The Customer Portal allows customers to manage their subscription and billing information.

**Create Portal Session:**

```javascript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: 'cus_123456789',
  return_url: 'https://example.com/account',
});

// Redirect customer to portal
res.redirect(303, portalSession.url);
```

**Advanced Portal Configuration:**

```javascript
// Create a portal configuration
const configuration = await stripe.billingPortal.configurations.create({
  business_profile: {
    headline: 'Manage your subscription',
  },
  features: {
    customer_update: {
      enabled: true,
      allowed_updates: ['email', 'address', 'shipping', 'phone', 'tax_id'],
    },
    invoice_history: {
      enabled: true,
    },
    payment_method_update: {
      enabled: true,
    },
    subscription_cancel: {
      enabled: true,
      mode: 'at_period_end',
      cancellation_reason: {
        enabled: true,
        options: [
          'too_expensive',
          'missing_features',
          'switched_service',
          'unused',
          'other',
        ],
      },
    },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ['price', 'quantity', 'promotion_code'],
      proration_behavior: 'always_invoice',
      products: [
        {
          product: 'prod_basic',
          prices: ['price_basic_monthly', 'price_basic_yearly'],
        },
        {
          product: 'prod_premium',
          prices: ['price_premium_monthly', 'price_premium_yearly'],
        },
      ],
    },
  },
});

// Use custom configuration
const portalSession = await stripe.billingPortal.sessions.create({
  customer: 'cus_123456789',
  return_url: 'https://example.com/account',
  configuration: configuration.id,
});
```

### Charges (Legacy - Use Payment Intents Instead)

**Note:** Charges API is legacy. Use Payment Intents for new integrations.

```javascript
// Only use if you have a specific reason not to use Payment Intents
const charge = await stripe.charges.create({
  amount: 2000,
  currency: 'usd',
  source: 'tok_visa',
  description: 'Legacy charge',
});
```

## 5. Best Practices

### Idempotency

Stripe supports idempotency to safely retry requests without performing the same operation twice.

```javascript
// Generate unique idempotency key
const { v4: uuidv4 } = require('uuid');

const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: 1000,
    currency: 'usd',
  },
  {
    idempotencyKey: uuidv4(), // Unique key per request
  }
);
```

**Automatic Retries with Idempotency:**

```javascript
async function createPaymentWithRetry(paymentData, maxRetries = 3) {
  const idempotencyKey = uuidv4();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const paymentIntent = await stripe.paymentIntents.create(
        paymentData,
        { idempotencyKey }
      );
      return paymentIntent;
    } catch (err) {
      if (attempt === maxRetries) throw err;

      // Only retry on network errors or rate limits
      if (err.type === 'StripeConnectionError' || err.statusCode === 429) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err; // Don't retry on other errors
      }
    }
  }
}
```

### Error Handling

Stripe errors include specific types for targeted handling.

```javascript
async function handleStripeOperation() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
    });
    return paymentIntent;
  } catch (err) {
    switch (err.type) {
      case 'StripeCardError':
        // Card was declined
        console.error('Card declined:', err.message);
        return { error: 'Your card was declined.' };

      case 'StripeRateLimitError':
        // Too many requests
        console.error('Rate limit hit');
        return { error: 'Too many requests. Please try again later.' };

      case 'StripeInvalidRequestError':
        // Invalid parameters
        console.error('Invalid request:', err.message);
        return { error: 'Invalid payment information.' };

      case 'StripeAPIError':
        // Stripe API error
        console.error('API error:', err.message);
        return { error: 'Payment processing error. Please try again.' };

      case 'StripeConnectionError':
        // Network error
        console.error('Network error:', err.message);
        return { error: 'Network error. Please check your connection.' };

      case 'StripeAuthenticationError':
        // Authentication error
        console.error('Authentication failed:', err.message);
        return { error: 'Payment system error.' };

      default:
        console.error('Unknown error:', err);
        return { error: 'An unexpected error occurred.' };
    }
  }
}
```

**Comprehensive Error Handler:**

```javascript
class StripeErrorHandler {
  static async execute(operation, options = {}) {
    const { maxRetries = 3, retryDelay = 1000 } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        const shouldRetry = this.shouldRetry(err, attempt, maxRetries);

        if (!shouldRetry) {
          throw this.formatError(err);
        }

        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  static shouldRetry(err, attempt, maxRetries) {
    if (attempt >= maxRetries) return false;

    return (
      err.type === 'StripeConnectionError' ||
      err.type === 'StripeAPIError' ||
      err.statusCode === 429 ||
      err.statusCode === 503
    );
  }

  static formatError(err) {
    return {
      type: err.type,
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
      decline_code: err.decline_code,
      param: err.param,
    };
  }
}

// Usage
const paymentIntent = await StripeErrorHandler.execute(
  () => stripe.paymentIntents.create({ amount: 1000, currency: 'usd' }),
  { maxRetries: 3, retryDelay: 1000 }
);
```

### Rate Limit Handling

Stripe enforces rate limits to ensure API stability.

```javascript
async function rateLimitedRequest(requestFn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (err) {
      if (err.statusCode === 429) {
        // Rate limited - use exponential backoff
        const delay = Math.min(1000 * Math.pow(2, i), 32000);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded for rate limit');
}

// Usage
const customer = await rateLimitedRequest(() =>
  stripe.customers.create({ email: 'customer@example.com' })
);
```

**Advanced Rate Limit Strategy:**

```javascript
class RateLimiter {
  constructor(requestsPerSecond = 100) {
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      if (err.statusCode === 429) {
        // Re-queue with higher priority
        this.queue.unshift({ fn, resolve, reject });
        await new Promise(r => setTimeout(r, 2000));
      } else {
        reject(err);
      }
    } finally {
      this.processing = false;
      const delay = 1000 / this.requestsPerSecond;
      setTimeout(() => this.processQueue(), delay);
    }
  }
}

const limiter = new RateLimiter(100); // 100 requests per second

// Usage
const customer = await limiter.execute(() =>
  stripe.customers.create({ email: 'customer@example.com' })
);
```

### Pagination

Many Stripe API methods return paginated results.

```javascript
// Manual pagination
const customers = await stripe.customers.list({
  limit: 100,
});

// Iterate through pages
let hasMore = customers.has_more;
let startingAfter = customers.data[customers.data.length - 1].id;

while (hasMore) {
  const nextPage = await stripe.customers.list({
    limit: 100,
    starting_after: startingAfter,
  });

  customers.data.push(...nextPage.data);
  hasMore = nextPage.has_more;

  if (hasMore) {
    startingAfter = nextPage.data[nextPage.data.length - 1].id;
  }
}
```

**Auto-Pagination:**

```javascript
// Stripe SDK provides auto-pagination
const allCustomers = [];

for await (const customer of stripe.customers.list({ limit: 100 })) {
  allCustomers.push(customer);

  // Process customer
  console.log(customer.email);

  // Optional: Stop after certain condition
  if (allCustomers.length >= 500) break;
}
```

### Testing

Stripe provides test mode with test API keys and test card numbers.

**Test Card Numbers:**

```javascript
// Use these in test mode
const testCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  discover: '6011111111111117',
  dinersClub: '3056930009020004',
  jcb: '3566002020360505',
  unionPay: '6200000000000005',

  // Cards that trigger specific scenarios
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  lostCard: '4000000000009987',
  stolenCard: '4000000000009979',
  expiredCard: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',

  // 3D Secure authentication required
  authRequired: '4000002500003155',
  authRequiredDeclined: '4000008400001629',
};
```

**Test Mode Detection:**

```javascript
const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

if (isTestMode) {
  console.log('Running in TEST mode');
} else {
  console.log('Running in LIVE mode');
}
```

**Mock Stripe for Unit Tests:**

```javascript
// Using jest
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        status: 'requires_payment_method',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@example.com',
      }),
    },
  }));
});

// Test
const stripe = require('stripe')();
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
});
expect(paymentIntent.id).toBe('pi_test_123');
```

### Security Best Practices

**1. Never Expose Secret Keys:**

```javascript
// NEVER do this
const stripe = require('stripe')('sk_live_actual_secret_key_hardcoded');

// ALWAYS do this
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

**2. Validate Webhook Signatures:**

```javascript
// ALWAYS verify webhook signatures
try {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
} catch (err) {
  // Signature verification failed - reject the request
  return res.status(400).send(`Webhook Error: ${err.message}`);
}
```

**3. Use HTTPS in Production:**

```javascript
// Ensure your server uses HTTPS
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect('https://' + req.headers.host + req.url);
}
```

**4. Server-Side Validation:**

```javascript
// NEVER trust client-side data
app.post('/create-payment-intent', async (req, res) => {
  // Don't use amount from client
  // const { amount } = req.body; // UNSAFE

  // Calculate amount server-side based on cart/order
  const order = await getOrderFromDatabase(req.body.orderId);
  const amount = calculateOrderTotal(order);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

**5. PCI Compliance:**

```javascript
// NEVER handle raw card data on your server
// ALWAYS use Stripe.js or Elements to collect card information

// DON'T do this:
app.post('/charge', async (req, res) => {
  const { cardNumber, cvc, expMonth, expYear } = req.body; // NEVER
  // ...
});

// DO this instead:
// Use Stripe.js on client to create PaymentMethod
// Only send PaymentMethod ID to server
app.post('/charge', async (req, res) => {
  const { paymentMethodId } = req.body; // Safe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd',
    payment_method: paymentMethodId,
  });
});
```

### Metadata Best Practices

Metadata helps you store additional information on Stripe objects.

```javascript
// Use metadata to link Stripe objects to your system
const customer = await stripe.customers.create({
  email: 'customer@example.com',
  metadata: {
    user_id: '12345',
    account_type: 'premium',
    signup_date: new Date().toISOString(),
  },
});

const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  metadata: {
    order_id: 'order_789',
    customer_id: '12345',
    product_ids: 'prod_1,prod_2,prod_3',
    campaign: 'summer_sale',
  },
});

// Search using metadata
const orders = await stripe.paymentIntents.search({
  query: 'metadata["order_id"]:"order_789"',
});
```

### Logging and Monitoring

```javascript
// Create a logging wrapper
class StripeClient {
  constructor(apiKey) {
    this.stripe = require('stripe')(apiKey);
    this.logger = console; // Replace with your logger
  }

  async createPaymentIntent(params) {
    const startTime = Date.now();

    try {
      this.logger.info('Creating payment intent', { params });

      const paymentIntent = await this.stripe.paymentIntents.create(params);

      const duration = Date.now() - startTime;
      this.logger.info('Payment intent created', {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        duration,
      });

      return paymentIntent;
    } catch (err) {
      const duration = Date.now() - startTime;
      this.logger.error('Payment intent creation failed', {
        error: err.message,
        type: err.type,
        code: err.code,
        duration,
      });

      throw err;
    }
  }
}

const stripeClient = new StripeClient(process.env.STRIPE_SECRET_KEY);
```

### Production Deployment Checklist

**Environment Configuration:**

```javascript
// config.js
module.exports = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    apiVersion: '2026-05-27.dahlia',
  },

  // Validate required environment variables
  validate: () => {
    const required = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    // Ensure production uses live keys
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
        throw new Error('Production must use live Stripe keys');
      }
    }
  },
};
```

**Webhook Endpoint Security:**

```javascript
// Dedicated webhook handler with security
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  rateLimitMiddleware({ max: 100, windowMs: 60000 }), // Rate limiting
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // Verify signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
        ip: req.ip,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log webhook received
    logger.info('Webhook received', {
      type: event.type,
      id: event.id,
    });

    // Process asynchronously
    processWebhook(event).catch(err => {
      logger.error('Webhook processing failed', {
        type: event.type,
        id: event.id,
        error: err.message,
      });
    });

    // Respond immediately
    res.json({ received: true });
  }
);
```

### Performance Optimization

**Parallel Requests:**

```javascript
// Execute multiple independent requests in parallel
const [customer, product, price] = await Promise.all([
  stripe.customers.retrieve('cus_123'),
  stripe.products.retrieve('prod_123'),
  stripe.prices.retrieve('price_123'),
]);
```

**Expand Related Objects:**

```javascript
// Instead of multiple requests
const subscription = await stripe.subscriptions.retrieve('sub_123');
const customer = await stripe.customers.retrieve(subscription.customer);
const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

// Do this - single request with expand
const subscription = await stripe.subscriptions.retrieve('sub_123', {
  expand: [
    'customer',
    'latest_invoice',
    'latest_invoice.payment_intent',
    'default_payment_method',
  ],
});

// Access expanded objects
console.log(subscription.customer.email);
console.log(subscription.latest_invoice.amount_paid);
```

**Batch Operations:**

```javascript
// Create multiple objects efficiently
async function createMultipleCustomers(customerData) {
  const BATCH_SIZE = 10;
  const results = [];

  for (let i = 0; i < customerData.length; i += BATCH_SIZE) {
    const batch = customerData.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(data =>
      stripe.customers.create(data)
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < customerData.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
```

### TypeScript Usage

**Complete Type Safety:**

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

// Full type inference
async function createSubscription(
  customerId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

// Type-safe event handling
async function handleWebhook(
  body: string | Buffer,
  signature: string
): Promise<void> {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription ${subscription.id} updated`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Custom types for your domain
interface CreatePaymentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

async function createPayment(
  params: CreatePaymentParams
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    customer: params.customerId,
    metadata: params.metadata,
  });
}
```

## 6. Production Checklist

### Pre-Launch Verification

- [ ] Switched from test keys to live keys
- [ ] Environment variables properly configured in production
- [ ] Webhook endpoints registered and verified in Stripe Dashboard
- [ ] Webhook signature verification implemented
- [ ] HTTPS enabled on all endpoints
- [ ] Error handling and logging configured
- [ ] Rate limiting implemented
- [ ] Idempotency keys used for critical operations
- [ ] Payment confirmation flow tested end-to-end
- [ ] Refund process tested
- [ ] Subscription lifecycle tested (create, update, cancel)
- [ ] Tax calculation configured (if applicable)
- [ ] Email receipts enabled
- [ ] Monitoring and alerting set up
- [ ] PCI compliance requirements met
- [ ] Terms of service and privacy policy updated
- [ ] Customer support process for payment issues established

### Monitoring

```javascript
// Monitor key metrics
const metrics = {
  paymentIntentsCreated: 0,
  paymentIntentsSucceeded: 0,
  paymentIntentsFailed: 0,
  webhooksProcessed: 0,
  webhooksFailed: 0,
  apiErrors: 0,
};

// Increment metrics in your code
app.post('/create-payment', async (req, res) => {
  metrics.paymentIntentsCreated++;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
    });

    return res.json(paymentIntent);
  } catch (err) {
    metrics.apiErrors++;
    logger.error('Payment creation failed', { error: err });
    return res.status(500).json({ error: 'Payment failed' });
  }
});

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics);
});
```

### Disaster Recovery

```javascript
// Implement graceful degradation
async function createPaymentWithFallback(params) {
  try {
    return await stripe.paymentIntents.create(params);
  } catch (err) {
    // Log error
    logger.error('Stripe API error', { error: err });

    // If Stripe is down, queue for later processing
    if (err.type === 'StripeAPIError' || err.type === 'StripeConnectionError') {
      await queuePaymentForLater(params);
      return { status: 'queued', message: 'Payment will be processed shortly' };
    }

    throw err;
  }
}
```

---

**Notes**

The Stripe API provides a comprehensive platform for payment processing, subscription management, and billing. The Node.js library (`stripe`) offers server-side functionality, while `@stripe/stripe-js` and `@stripe/react-stripe-js` provide client-side integration capabilities. Stripe uses date-based API versioning to ensure long-term compatibility while continuously adding new features. All payment data must be transmitted securely using HTTPS, and sensitive card information should only be handled by Stripe.js on the client side to maintain PCI compliance. Webhooks are essential for production deployments as they provide reliable event notifications independent of user sessions. The platform supports multiple payment methods, currencies, and billing models, making it suitable for businesses of all sizes. Always use test mode during development and thoroughly test your integration before switching to live mode.
