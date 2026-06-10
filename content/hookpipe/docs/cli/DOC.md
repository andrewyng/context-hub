---
name: cli
description: "Webhook infrastructure CLI for AI agents — receive webhooks from Stripe, GitHub, Slack, Shopify, Vercel with signature verification, durable queuing, and automatic retries on Cloudflare Workers"
metadata:
  languages: "javascript"
  versions: "0.0.5"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "webhooks,webhook,stripe,github,slack,shopify,vercel,cloudflare-workers,cli,agent"
---
# hookpipe CLI

Receive webhooks from external services, queue them durably on Cloudflare Workers, and deliver them to your application with automatic retries. Built-in signature verification for Stripe, GitHub, Slack, Shopify, and Vercel.

## Installation

```bash
npm install -g hookpipe
```

```bash
brew install hookpipe/hookpipe/hookpipe
```

## Quick Start

### One-shot setup (most common)

```bash
hookpipe connect stripe \
  --secret whsec_xxx \
  --to https://your-app.com/webhook \
  --events "payment_intent.*"
```

This creates a source, destination, and subscription in one command. The output includes a **Webhook URL** — register it in the provider's dashboard.

### Local development

```bash
hookpipe dev --port 3000 --provider stripe --secret whsec_xxx
```

Creates a secure tunnel (Cloudflare Quick Tunnel) to your local machine. Paste the printed URL into Stripe's webhook dashboard. Signatures are verified locally before forwarding.

## Core Concepts

Three resources, one attribute:

| Resource | Description | ID prefix |
|----------|-------------|-----------|
| **Source** | Webhook receiver endpoint, optionally tied to a provider | `src_` |
| **Destination** | Target URL with retry policy | `dst_` |
| **Subscription** | Routes events from source to destination with event type filters | `sub_` |
| **Provider** | Static knowledge about a webhook sender (read-only catalog) | — |

## Provider Discovery

List all built-in providers:

```bash
hookpipe providers ls
hookpipe providers ls --json
```

Inspect a provider's event types, presets, and setup instructions:

```bash
hookpipe providers describe stripe
hookpipe providers describe stripe --json
```

Built-in providers: `stripe`, `github`, `slack`, `shopify`, `vercel`.

For any webhook service not in the catalog, use generic HMAC verification:

```bash
hookpipe connect my-service \
  --secret my_signing_secret \
  --to https://your-app.com/webhook
```

## The `connect` Command

One-shot setup for the 80% use case (one source → one destination):

```bash
hookpipe connect <provider> \
  --secret <signing_secret> \
  --to <destination_url> \
  --events <filter>           # default: "*" (all events)
  --name <source_name>        # default: provider ID
  --retry <strategy>          # exponential | linear | fixed (default: exponential)
  --max-retries <n>           # default: 10
  --json                      # structured output
  --dry-run                   # validate without executing
```

Output includes: source ID, destination ID, subscription ID, and the **Webhook URL** to register with the provider.

## Advanced: Individual Resource Commands

For fan-out (one source → multiple destinations) or custom retry policies:

```bash
# Create source
hookpipe sources create --name stripe-prod \
  -d '{"provider":"stripe","verification":{"type":"stripe-signature","secret":"whsec_xxx"}}'

# Create destinations
hookpipe dest create --name app-primary --url https://app.com/webhook
hookpipe dest create --name analytics --url https://analytics.com/ingest

# Create subscriptions
hookpipe subs create --source src_abc --destination dst_def --events "payment_intent.*"
hookpipe subs create --source src_abc --destination dst_ghi --events "*"
```

### List and inspect resources

```bash
hookpipe sources ls --json
hookpipe sources get src_abc123
hookpipe dest ls --fields id,name,url
hookpipe subs ls --json
```

### Delete resources

```bash
hookpipe sources rm src_abc123 --dry-run   # preview first
hookpipe sources rm src_abc123
hookpipe dest rm dst_def456
hookpipe subs rm sub_ghi789
```

## Event Management

```bash
# List recent events
hookpipe events ls --limit 20 --json

# Filter by source
hookpipe events ls --source src_abc123

# Get event with full payload
hookpipe events get evt_abc123

# View delivery attempts for an event
hookpipe events deliveries evt_abc123

# Replay a failed event
hookpipe events replay evt_abc123
```

### Batch replay failed deliveries

```bash
# View DLQ (dead letter queue) for a destination
hookpipe dest get dst_abc123   # includes circuit breaker state

# Replay all failed deliveries
hookpipe dest replay-failed dst_abc123
```

## Real-time Streaming

```bash
# Stream events as they arrive
hookpipe tail

# NDJSON output (pipe to scripts or other agents)
hookpipe tail --json

# Filter by source
hookpipe tail --source src_abc123

# Auto-stop after N events or duration
hookpipe tail --limit 10
hookpipe tail --timeout 5m

# Pipe to jq or another process
hookpipe tail --json | jq '.event_type'
```

## Schema Introspection

```bash
# List all resource types and their fields
hookpipe schema

# Inspect a specific resource
hookpipe schema sources
hookpipe schema destinations
hookpipe schema subscriptions
```

## Configuration

```bash
hookpipe config set api_url https://your-hookpipe.workers.dev
hookpipe config set token hf_sk_xxx
hookpipe config get
```

## Export / Import / Migrate

```bash
# Export current configuration
hookpipe export -o config.json

# Import into another instance
hookpipe import -f config.json --target https://new-instance.workers.dev --target-key hf_sk_yyy

# Direct migration between instances
hookpipe migrate \
  --from https://old.workers.dev --from-key hf_sk_old \
  --to https://new.workers.dev --to-key hf_sk_new
```

## Global Flags

All commands support:

| Flag | Description |
|------|-------------|
| `--json` | Machine-readable JSON output |
| `--dry-run` | Validate mutations without executing |
| `-d, --data <json>` | Raw JSON input for create commands |

## Agent Usage Guidelines

1. **Always use `--json`** for structured output parsing.
2. **Always `--dry-run` before mutations** to validate first.
3. **Discover before connecting**: run `hookpipe providers describe <name>` to learn available events and presets.
4. **Use `connect` for simple setups**, individual commands for fan-out.
5. **Never delete resources without user confirmation.**

### Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `BAD_REQUEST` | 400 | Invalid input |
| `VALIDATION_ERROR` | 400 | Schema validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `SETUP_REQUIRED` | 401 | Instance not bootstrapped |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |

### Resource ID formats

- Sources: `src_<hex>`
- Destinations: `dst_<hex>`
- Subscriptions: `sub_<hex>`
- Events: `evt_<hex>`
- Deliveries: `dlv_<hex>`
- API keys: `key_<hex>`

## Architecture

hookpipe runs on Cloudflare Workers with zero servers to manage:

```
Provider (Stripe, GitHub, ...) → hookpipe (Cloudflare Workers, always online)
  → Queue (Cloudflare Queues, durable)
    → Delivery Manager (Durable Objects, per-destination)
      → Your application (retries with exponential backoff)
```

- **Ingress latency**: ~300ms P50
- **Retry**: exponential/linear/fixed backoff, up to 24 hours
- **Circuit breaker**: pauses delivery to unhealthy destinations
- **DLQ**: permanently failed deliveries stored for manual replay
- **Idempotency**: built-in deduplication (no duplicate deliveries)
- **Payload archive**: stored in R2, retrievable via `events get`

## See Also

- [Provider catalog and event types](references/providers.md)
- [REST API reference](references/api.md)
- GitHub: https://github.com/hookpipe/hookpipe
