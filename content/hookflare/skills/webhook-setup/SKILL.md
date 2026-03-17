---
name: webhook-setup
description: "Set up durable webhook infrastructure for receiving events from Stripe, GitHub, Slack, Shopify, Vercel, or any HTTP webhook sender using hookflare CLI"
metadata:
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "webhooks,webhook,infrastructure,stripe,github,slack,shopify,vercel,agent"
---
# Webhook Infrastructure Setup

Set up durable webhook receiving with hookflare. Webhooks are queued on Cloudflare Workers (always online) and delivered to your application with automatic retries.

## Prerequisites

```bash
# Install hookflare CLI
npm install -g hookflare
# or: brew install hookedge/hookflare/hookflare
```

Requires a running hookflare instance. Deploy one to Cloudflare Workers or use an existing instance.

## When to Use This Skill

Use hookflare when:
- Your application needs to receive webhooks from Stripe, GitHub, Slack, Shopify, Vercel, or any HTTP webhook sender
- Webhooks are being lost during application restarts or downtime
- You need durable event buffering with guaranteed delivery
- You need signature verification for incoming webhooks

Do NOT use hookflare for:
- Sending outgoing webhooks to your customers (use Svix instead)
- Direct API polling or cron-based scheduled checks
- Internal service-to-service communication

## Step-by-Step

### 1. Discover the provider

```bash
hookflare providers describe stripe --json
```

This shows available event types, presets, and setup instructions. If your service isn't in the built-in catalog, skip to step 2 — hookflare supports generic HMAC verification.

### 2. Connect the provider

For built-in providers:

```bash
hookflare connect stripe \
  --secret whsec_xxx \
  --to https://your-app.com/webhook \
  --events "payment_intent.*" \
  --json
```

For any other webhook sender:

```bash
hookflare connect my-service \
  --secret my_signing_secret \
  --to https://your-app.com/webhook \
  --json
```

The output includes a **Webhook URL**. Register this URL in the provider's dashboard or API.

### 3. Verify events are flowing

```bash
hookflare tail --json --timeout 60s
```

Trigger a test event from the provider. You should see it appear in the tail output.

### 4. Handle failures

```bash
# Check circuit breaker state
hookflare dest ls --json

# View failed deliveries
hookflare events ls --source src_abc123 --json

# Replay a specific event
hookflare events replay evt_abc123
```

## Local Development

For developing locally without exposing your machine to the internet:

```bash
hookflare dev --port 3000 --provider stripe --secret whsec_xxx
```

This creates a secure Cloudflare Quick Tunnel. Paste the printed URL into the provider's webhook dashboard.

## Common Patterns

### Multi-provider monitoring

```bash
hookflare connect stripe --secret whsec_xxx --to https://app.com/webhook --name stripe-prod
hookflare connect github --secret ghsec_xxx --to https://app.com/webhook --name github-prod
```

### Fan-out to multiple destinations

```bash
hookflare sources create --name stripe-prod \
  -d '{"provider":"stripe","verification":{"type":"stripe-signature","secret":"whsec_xxx"}}'

hookflare dest create --name app-primary --url https://app.com/webhook
hookflare dest create --name analytics --url https://analytics.com/ingest

hookflare subs create --source src_abc --destination dst_def --events "payment_intent.*"
hookflare subs create --source src_abc --destination dst_ghi --events "*"
```

### Pipe events to a script

```bash
hookflare tail --json | while read -r event; do
  echo "$event" | jq -r '.event_type'
done
```
