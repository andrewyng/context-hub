# SERPdive errors and credits

Every failure returns JSON with two fields: `error`, a stable machine-readable
code, and `message`, a human sentence that says what to do about it. A failed
search is never billed.

```json
{
  "error": "invalid_api_key",
  "message": "..."
}
```

## Codes

| Status | Code | Meaning | Agent should |
|---|---|---|---|
| 400 | `invalid_json` | The body is not valid JSON | Fix the request, do not retry |
| 400 | `missing_query` | No `query` in the body | Fix the request, do not retry |
| 401 | `missing_api_key` / `invalid_api_key` | No usable key in the `Authorization` header | Stop and surface it; retrying never helps |
| 429 | `rate_limit_exceeded` | Over 5 requests per second or 200 per minute | Honor `retry-after`, back off, retry |
| 429 | `monthly_quota_exceeded` | Monthly credits used up, or the pay-as-you-go spend limit set in Billing was reached. Resets when the monthly cycle renews | Stop; surface to the human |
| 429 | `key_limit_exceeded` | This key hit the monthly credit limit it was created with. Other keys keep working | Stop, or fall back to another key |
| 502 | `search_failed` | The search could not complete | Safe to retry |
| 503 | `server_busy` | Momentarily at full capacity, carries `retry-after` | Wait the advertised delay, retry |

## Retry policy that works

Retry only `rate_limit_exceeded`, `search_failed` and `server_busy`. Honor the
`retry-after` header when present, otherwise use exponential backoff with
jitter and a small cap, for example three attempts.

Never retry `invalid_api_key`, `missing_query`, `invalid_json`,
`monthly_quota_exceeded` or `key_limit_exceeded`: the outcome cannot change,
and retrying only burns wall-clock time in the agent loop.

Both official SDKs already implement this policy, so calling them directly is
usually better than hand-rolling it.

## Credits

| Model | Credits per search |
|---|---|
| `mako` | 1 |
| `moby` | 1.5 |

The written answer (`answer: true`) is included in the price and never costs
extra credits.

Every account gets 1,000 free credits per month with no card. Pay as you go is
$5 per 1,000 credits at the launch rate. An agent doing roughly 30 searches a
day stays inside the free tier indefinitely.

## Timeouts

Mako answers in a few seconds. Moby reads whole pages and can take
substantially longer on heavy sources. Set a generous client timeout; 80
seconds is what the official playground uses. A timeout set too low is the
most common cause of a "failed" moby search that actually succeeded server
side.
