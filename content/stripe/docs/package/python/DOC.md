---
name: package
description: "Stripe Python package guide for authenticating, calling the Stripe API, handling webhooks, and working with StripeClient"
metadata:
  languages: "python"
  versions: "15.2.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "stripe,payments,billing,api,webhooks,checkout"
---

# Stripe Python Package Guide

## Golden Rule

Use the official `stripe` PyPI package, initialize it with a secret key from the Stripe Dashboard, and prefer `StripeClient` over the older global `stripe.api_key` pattern. For webhook verification, always use the raw request body. For testing, keep integrations on test keys or Stripe sandboxes until the full payment and webhook flow is verified.

## Install

Pin the version your project expects:

```bash
python -m pip install "stripe==15.2.0"
```

Common alternatives:

```bash
uv add "stripe==15.2.0"
poetry add "stripe==15.2.0"
```

If you plan to use the async client helpers, install the async extra:

```bash
python -m pip install "stripe[async]==15.2.0"
```

## Authentication And Setup

Stripe authenticates with API keys. Secret keys start with `sk_test_` or `sk_live_`. Keep them in environment variables or a secrets manager, never in client-side code or committed files.

```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

Recommended setup with `StripeClient`:

```python
import os
from stripe import StripeClient

client = StripeClient(
    api_key=os.environ["STRIPE_SECRET_KEY"],
    max_network_retries=2,
)
```

Notes:

- `max_network_retries=2` is a sensible default for transient network failures.
- Stripe automatically adds idempotency keys for safe retries when it needs to retry requests.
- If you need a proxy, pass `proxy="https://user:pass@example.com:1234"` to `StripeClient(...)`.

Legacy global configuration still works, but it is not the preferred pattern for new code:

```python
import os
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
customer = stripe.Customer.retrieve("cus_123")
```

## Core Usage

### Create or retrieve customers

```python
from stripe import StripeClient

client = StripeClient("sk_test_...")

customer = client.v1.customers.create(
    {
        "email": "customer@example.com",
        "name": "Jenny Rosen",
        "metadata": {"internal_user_id": "user_123"},
    }
)

same_customer = client.v1.customers.retrieve(customer.id)
print(same_customer.email)
```

Use `client.v1...` for standard Stripe API resources. Older examples on blogs or Stack Overflow often show only the legacy global pattern.

### Create a PaymentIntent

Use one PaymentIntent per order or checkout attempt.

```python
from stripe import StripeClient

client = StripeClient("sk_test_...")

payment_intent = client.v1.payment_intents.create(
    {
        "amount": 2000,
        "currency": "usd",
        "customer": "cus_123",
        "automatic_payment_methods": {"enabled": True},
        "metadata": {"order_id": "order_6735"},
    }
)

print(payment_intent.id)
print(payment_intent.client_secret)
```

Practical notes:

- Amounts are usually in the currency's smallest unit, such as cents for USD.
- `automatic_payment_methods={"enabled": True}` is the simplest starting point for many server-side integrations.
- For client confirmation flows, return the `client_secret` to trusted frontend code only.

### List resources with auto-pagination

Stripe list calls return a page object. Use `auto_paging_iter()` when you need all results:

```python
from stripe import StripeClient

client = StripeClient("sk_test_...")
customers = client.v1.customers.list({"limit": 3})

for customer in customers.auto_paging_iter():
    print(customer.id, customer.email)
```

### Per-request options

Use the `options` argument when you need a connected account, a different API key, or a per-request Stripe version:

```python
from stripe import StripeClient

client = StripeClient("sk_test_platform_...")

charges = client.v1.charges.list(
    options={
        "stripe_account": "acct_123",
        "stripe_version": "2026-05-27.dahlia",
    }
)
```

This is common in Connect integrations and during controlled API-version rollouts.

### Access response metadata for debugging

```python
from stripe import StripeClient

client = StripeClient("sk_test_...")
customer = client.v1.customers.retrieve("cus_123")

print(customer.last_response.code)
print(customer.last_response.headers.get("Request-Id"))
```

Stripe request IDs are useful when checking Dashboard logs or contacting Stripe support.

## Async Usage

Async methods use the `_async` suffix.

```python
import stripe
from stripe import StripeClient

http_client = stripe.HTTPXClient()
client = StripeClient("sk_test_...", http_client=http_client)

customer = await client.v1.customers.retrieve_async("cus_123")
print(customer.email)
```

Notes:

- The default async transport uses `httpx`.
- `stripe.AIOHTTPClient()` is also available.
- `HTTPXClient()` will reject sync calls unless you set `allow_sync_methods=True`.
- There is no `.save_async`; use the explicit create, modify, delete, and retrieve methods instead.

## Webhooks

Verify signatures with the raw body and the webhook signing secret. Do not parse or mutate the body before verification.

```python
import os
import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

endpoint_secret = os.environ["STRIPE_WEBHOOK_SECRET"]

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            endpoint_secret,
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    if event.type == "payment_intent.succeeded":
        payment_intent = event.data.object
        print(payment_intent.id)

    return HttpResponse(status=200)
```

Webhook rules that matter in practice:

- Keep the raw request body intact or signature verification fails.
- Return a `2xx` response quickly before slow business logic.
- Use the endpoint secret from the Dashboard or `stripe listen`, not your API secret key.
- For local testing, Stripe recommends the Stripe CLI to forward events to your machine.

## Configuration Notes

- Enable SDK logging with `STRIPE_LOG=info` or `STRIPE_LOG=debug` when you need wire-level troubleshooting.
- The package sends telemetry by default; disable it with `stripe.enable_telemetry = False` if your environment requires that.
- You can swap the HTTP client with `stripe.RequestsClient()`, `stripe.PycurlClient()`, `stripe.UrllibClient()`, `stripe.HTTPXClient()`, or `stripe.AIOHTTPClient()` depending on sync or async needs.
- Use `stripe.set_app_info(...)` if you are building a reusable plugin or integration layer on top of Stripe.

## Common Pitfalls

- Do not send secret keys to browsers, mobile apps, or public repos.
- Do not use parsed JSON instead of the raw body for webhook signature verification.
- Do not assume old `stripe.Customer.create(...)` examples represent the preferred modern style; `StripeClient` is the forward path.
- Do not rely on a single list page if you need all records; use pagination or `auto_paging_iter()`.
- Do not mix account-level API version assumptions with SDK defaults. Webhook payload shapes and typed objects can differ if your endpoint or request overrides the Stripe version.
- Do not treat test mode and live mode objects as interchangeable; IDs and data are isolated by environment.

## Version-Sensitive Notes For `15.2.0`

- PyPI lists `15.2.0` as the current release as of May 29, 2026.
- `15.x` ships a pinned default Stripe API version aligned with the current `2026-05-27.dahlia` release. `15.2.0` code examples should assume that API surface unless you explicitly override `stripe_version`.
- The `v1` namespace on `StripeClient` arrived in major version `13`, so pre-v13 upgrade guides and older blog posts can have materially different call shapes (`client.customers.create(...)` vs. `client.v1.customers.create(...)`).
- Stripe's type annotations can change in minor releases even when runtime behavior remains semver-compatible. If strict type checking matters, pin to a minor line such as `~=15.2`.

## Official Sources

- Stripe API reference: `https://docs.stripe.com/api?lang=python`
- Stripe authentication docs: `https://docs.stripe.com/api/authentication?lang=python`
- Stripe auto-pagination docs: `https://docs.stripe.com/api/pagination/auto?lang=python`
- Stripe webhook docs: `https://docs.stripe.com/webhooks?lang=python`
- Stripe server-side SDK docs: `https://docs.stripe.com/sdks/server-side`
- Stripe SDK versioning policy: `https://docs.stripe.com/sdks/versioning?lang=python`
- Stripe testing docs: `https://docs.stripe.com/testing-use-cases`
- Stripe Python package on PyPI: `https://pypi.org/project/stripe/`
- Stripe Python changelog: `https://raw.githubusercontent.com/stripe/stripe-python/master/CHANGELOG.md`
- Stripe Python README: `https://raw.githubusercontent.com/stripe/stripe-python/master/README.md`
