# Built-in Provider Catalog

hookflare ships with 5 built-in providers. Each provider defines signature verification, event types, presets, and setup instructions.

## Stripe

**Verification**: Stripe-specific signature (`stripe-signature` header, timestamp + HMAC-SHA256)

### Event types

| Category | Events |
|----------|--------|
| Payments | `payment_intent.created`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.succeeded`, `charge.failed`, `charge.refunded` |
| Disputes | `charge.dispute.created`, `charge.dispute.closed` |
| Customers | `customer.created`, `customer.updated`, `customer.deleted` |
| Billing | `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`, `invoice.created`, `invoice.paid`, `invoice.payment_failed`, `invoice.finalized` |
| Checkout | `checkout.session.completed`, `checkout.session.expired` |

### Presets

| Preset | Events included |
|--------|----------------|
| `payments` | payment_intent.* + charge.* |
| `billing` | customer.subscription.* + invoice.* |
| `checkout` | checkout.session.* |
| `customers` | customer.created/updated/deleted |
| `all` | All events |

### Setup

```bash
hookflare connect stripe --secret whsec_xxx --to https://app.com/webhook --events "payment_intent.*"
```

Register the Webhook URL at: https://dashboard.stripe.com/webhooks

Or via Stripe CLI:

```bash
stripe webhook_endpoints create --url <webhook_url>
```

---

## GitHub

**Verification**: HMAC-SHA256 (`x-hub-signature-256` header)

Event type is extracted from the `x-github-event` header, not the payload body.

### Event types

| Category | Events |
|----------|--------|
| Code | `push`, `pull_request`, `pull_request.opened`, `pull_request.closed`, `pull_request.merged`, `create`, `delete` |
| Issues | `issues`, `issues.opened`, `issues.closed`, `issue_comment` |
| Releases | `release`, `release.published` |
| CI | `workflow_run`, `workflow_run.completed` |
| Social | `star`, `fork` |
| System | `ping` |

### Presets

| Preset | Events included |
|--------|----------------|
| `code` | push, pull_request.*, create, delete |
| `ci` | workflow_run.* |
| `issues` | issues.*, issue_comment |
| `releases` | release.* |
| `all` | All events |

### Setup

```bash
hookflare connect github --secret ghsec_xxx --to https://app.com/webhook --events "pull_request.*"
```

Register the Webhook URL at: `https://github.com/{owner}/{repo}/settings/hooks`

Or via GitHub CLI:

```bash
gh api repos/{owner}/{repo}/hooks \
  -f url=<webhook_url> \
  -f content_type=json \
  -f secret=ghsec_xxx
```

---

## Slack

**Verification**: Slack-specific signature (`x-slack-signature` header, HMAC-SHA256 with timestamp)

**Challenge handling**: hookflare automatically responds to Slack's `url_verification` challenge during setup. No action needed from your application.

### Event types

| Category | Events |
|----------|--------|
| Messages | `message`, `app_mention` |
| Reactions | `reaction_added`, `reaction_removed` |
| Channels | `member_joined_channel`, `member_left_channel`, `channel_created`, `channel_archive` |
| Workspace | `team_join` |
| System | `url_verification` |

### Presets

| Preset | Events included |
|--------|----------------|
| `messages` | message, app_mention |
| `channels` | member_joined/left_channel, channel_created/archive |
| `all` | All events |

### Setup

```bash
hookflare connect slack --secret xoxb_xxx --to https://app.com/webhook --events "message,app_mention"
```

Register the Webhook URL at: https://api.slack.com/apps → Event Subscriptions → Request URL

Note: Slack does not support CLI-based webhook setup.

---

## Shopify

**Verification**: HMAC-SHA256 with Base64 encoding (`x-shopify-hmac-sha256` header)

Event type is extracted from the `x-shopify-topic` header. Shopify uses slash-delimited topics (e.g., `orders/create`).

### Event types

| Category | Events |
|----------|--------|
| Orders | `orders/create`, `orders/updated`, `orders/cancelled`, `orders/fulfilled`, `orders/paid`, `refunds/create` |
| Products | `products/create`, `products/update`, `products/delete` |
| Customers | `customers/create`, `customers/update`, `customers/delete` |
| Carts | `carts/create`, `carts/update` |
| Checkouts | `checkouts/create`, `checkouts/update` |
| App | `app/uninstalled` |

### Presets

| Preset | Events included |
|--------|----------------|
| `orders` | orders/* + refunds/* |
| `products` | products/* |
| `customers` | customers/* |
| `all` | All events |

### Setup

```bash
hookflare connect shopify --secret shpss_xxx --to https://app.com/webhook --events "orders/*"
```

Register the Webhook URL at: `https://admin.shopify.com/store/{store}/settings/notifications`

Or via Shopify CLI:

```bash
shopify app webhooks trigger --topic orders/create --address <webhook_url>
```

---

## Vercel

**Verification**: HMAC-SHA1 (`x-vercel-signature` header)

### Event types

| Category | Events |
|----------|--------|
| Deployments | `deployment.created`, `deployment.succeeded`, `deployment.ready`, `deployment.error`, `deployment.canceled` |
| Projects | `project.created`, `project.removed` |
| Domains | `domain.created` |
| Integrations | `integration-configuration.removed` |

### Presets

| Preset | Events included |
|--------|----------------|
| `deployments` | deployment.* |
| `all` | All events |

### Setup

```bash
hookflare connect vercel --secret vsec_xxx --to https://app.com/webhook --events "deployment.*"
```

Register the Webhook URL at: `https://vercel.com/{team}/~/settings/webhooks`

Or via Vercel CLI:

```bash
vercel webhooks add <webhook_url> --events deployment.created
```

---

## Custom Providers

For any webhook service not in the built-in catalog, use generic HMAC verification:

```bash
hookflare connect my-service \
  --secret my_signing_secret \
  --to https://app.com/webhook
```

Community providers can be published as npm packages (`hookflare-provider-<name>`) using the `defineProvider()` API. See the [Provider Design Guide](https://github.com/hookedge/hookflare/blob/main/packages/providers/DESIGN.md).
