# Production Notes for Agent Completions

These notes summarize sanitized observed behavior from a successful production-style request to Langdock's Agents Completions API. Treat them as implementation guidance, not stronger contract guarantees than the official docs.

## Observed Structured Output Caveat

A request that asked for valid JSON only and set:

```json
{
  "stream": false,
  "output": {
    "type": "object"
  }
}
```

still returned assistant text wrapped in Markdown code fences. For production parsing:

1. read the assistant text as text first,
2. strip surrounding triple-backtick fences if present,
3. parse JSON,
4. validate the parsed object against your expected schema.

Do not assume `output.type = "object"` guarantees directly parseable JSON text.

## Observed Useful Headers

Successful requests returned headers including:

- `ld-model-id`
- `x-usage-input-tokens`
- `x-usage-output-tokens`
- `x-ratelimit-limit-requests`
- `x-ratelimit-remaining-requests`

Capture these for:

- cost and token accounting,
- identifying the routed model actually used,
- adaptive throttling in batch jobs.

## Batch Workflow Guidance

For batch analysis pipelines, make the response path defensive:

- keep raw assistant text for debugging,
- normalize fenced JSON before parsing,
- validate required fields before writing results,
- log request latency and token headers,
- retry transient failures separately from schema-validation failures.

This matters because a single formatting surprise can otherwise break a large batch run.
