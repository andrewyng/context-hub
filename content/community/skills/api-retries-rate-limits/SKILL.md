---
name: api-retries-rate-limits
description: "Call external APIs (OpenAI, Anthropic, Stripe, etc.) with retries, exponential backoff with jitter, rate-limit handling, and optional idempotency — so agent code fails less and respects provider limits"
metadata:
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "api,retries,rate-limits,backoff,openai,anthropic,stripe,resilience,idempotency"
---

# API Retries and Rate Limits

When calling external APIs, requests can fail due to rate limits (429), server errors (5xx), or network issues. This skill teaches retries and rate-limit handling so agent-generated code is resilient and respects provider limits instead of failing on the first error.

## When to Use This Skill

- Calling OpenAI, Anthropic, Stripe, or any HTTP API that can return 429 or 5xx
- You want automatic retries with backoff instead of failing on first error
- You need to honor `Retry-After` or rate-limit headers from the server
- Implementing idempotent operations (e.g. payments) and need idempotency keys

## Rule: Never Hardcode API Keys

Always read API keys from environment variables and validate they are set before making requests. Fail fast with a clear error if the key is missing.

**Python:**

```python
import os

def get_required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value or not value.strip():
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value.strip()

# Before any API call:
api_key = get_required_env("OPENAI_API_KEY")
# Then use api_key in headers, etc.
```

**JavaScript / Node:**

```javascript
function getRequiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

// Before any API call:
const apiKey = getRequiredEnv('OPENAI_API_KEY');
// Then use apiKey in headers, etc.
```

## Retryable vs Non-Retryable

Only retry on transient server errors and rate limits; do not retry client errors — fix the request instead.

| Retry | Do not retry |
|-------|----------------|
| 429 Too Many Requests | 400 Bad Request |
| 500, 502, 503, 504 | 401 Unauthorized |
| Network/timeout errors | 404 Not Found |
| 408 Request Timeout | 422 Unprocessable Entity |
| | Other 4xx (fix the request) |

## Exponential Backoff with Jitter

Use exponential backoff to avoid hammering the server, and add jitter so many clients do not retry at the same time.

**Python (stdlib: urllib + time + random):**

```python
import time
import random
import urllib.request
import urllib.error
import json
import os

def get_required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value or not value.strip():
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value.strip()

def backoff_with_jitter(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0) -> float:
    delay = min(base_delay * (2 ** attempt), max_delay) * random.random()
    return delay

def call_api_with_retries(url: str, payload: dict, max_retries: int = 5) -> dict:
    api_key = get_required_env("OPENAI_API_KEY")
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    last_error = None
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            last_error = e
            if e.code == 429:
                retry_after = e.headers.get("Retry-After")
                wait = int(retry_after) if retry_after and retry_after.isdigit() else backoff_with_jitter(attempt)
            elif e.code in (500, 502, 503, 504):
                wait = backoff_with_jitter(attempt)
            else:
                raise
        except (OSError, TimeoutError) as e:
            last_error = e
            wait = backoff_with_jitter(attempt)
        if attempt < max_retries - 1:
            time.sleep(wait)
    raise last_error
```

**JavaScript / Node (fetch + AbortController for timeout):**

```javascript
function getRequiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

function backoffWithJitter(attempt, baseDelayMs = 1000, maxDelayMs = 60000) {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs) * Math.random();
  return delay;
}

async function callApiWithRetries(url, payload, maxRetries = 5) {
  const apiKey = getRequiredEnv('OPENAI_API_KEY');
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        const waitMs = retryAfter && /^\d+$/.test(retryAfter)
          ? parseInt(retryAfter, 10) * 1000
          : backoffWithJitter(attempt);
        lastError = new Error(`Rate limited: ${res.status}`);
        if (attempt < maxRetries - 1) await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      if ([500, 502, 503, 504].includes(res.status)) {
        lastError = new Error(`Server error: ${res.status}`);
        if (attempt < maxRetries - 1) await new Promise((r) => setTimeout(r, backoffWithJitter(attempt)));
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    } catch (err) {
      if (err.message && (err.message.includes('fetch') || err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT'))) {
        lastError = err;
        if (attempt < maxRetries - 1) await new Promise((r) => setTimeout(r, backoffWithJitter(attempt)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
```

## Honor Retry-After

When the server sends `Retry-After`, use it for that request.

- **Integer** = seconds to wait (e.g. `Retry-After: 60` → wait 60 seconds).
- **HTTP-date** = parse and wait until that time, or fall back to backoff if parsing is not available.

Prefer the header when present; otherwise use your exponential backoff with jitter. Both Python and JavaScript examples above already honor numeric `Retry-After` for 429.

## Idempotency for Mutating APIs

For APIs that change state (e.g. Stripe charges), use idempotency keys so retries do not create duplicates.

- One key per logical operation (e.g. one charge).
- Use the **same** key on every retry for that operation.
- Send via header (e.g. `Idempotency-Key`) if the API supports it.
- Never reuse an idempotency key for a different logical operation.

**Python (Stripe-style charge):**

```python
import os
import uuid
import urllib.request
import urllib.parse
import json

def get_required_env(name: str) -> str:
    value = os.environ.get(name)
    if not value or not value.strip():
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value.strip()

def create_charge(amount_cents: int, currency: str = "usd") -> dict:
    api_key = get_required_env("STRIPE_API_KEY")
    idempotency_key = str(uuid.uuid4())  # One key per logical charge; reuse on retries of this same charge
    req = urllib.request.Request(
        "https://api.stripe.com/v1/charges",
        data=urllib.parse.urlencode({"amount": amount_cents, "currency": currency}).encode(),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Idempotency-Key": idempotency_key,
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())
```

**JavaScript (Stripe-style charge):**

```javascript
function getRequiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

async function createCharge(amountCents, currency = 'usd') {
  const apiKey = getRequiredEnv('STRIPE_API_KEY');
  const idempotencyKey = crypto.randomUUID(); // One key per logical charge; reuse on retries of this same charge
  const res = await fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': idempotencyKey,
    },
    body: new URLSearchParams({ amount: String(amountCents), currency }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

## Rate Limiting Without 429

Some APIs document a requests-per-second limit but do not always return 429. Optionally throttle client-side: limit concurrent requests or add a minimum delay between requests (e.g. 100–500 ms) when the provider documents a rate limit.

## Summary

1. **Validate env** — API keys from environment variables; fail fast if missing.
2. **Retry only on 429 and 5xx** (and timeouts); do not retry 4xx except 429.
3. **Exponential backoff + jitter** — e.g. `delay = min(base * 2^attempt, max) * random()`.
4. **Prefer Retry-After** when the server sends it (integer seconds or HTTP-date).
5. **Idempotency keys for mutating calls** — one key per logical operation, same key on retries.
6. **Cap retries** (e.g. 3–5) and surface a clear error to the user.

Applying these patterns makes agent-generated API code more resilient and respectful of provider limits.
