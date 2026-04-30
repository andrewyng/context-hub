---
name: claude-api-behavioral
description: "Undocumented behavioral observations and protocol nuances for the Claude Messages API, based on extensive real-world usage in multi-agent systems"
metadata:
  languages: "python"
  versions: "0.84.0"
  updated-on: "2026-03-19"
  source: community
  tags: "anthropic,sdk,llm,ai,claude,behavioral,undocumented,protocol"
---

# Claude API Behavioral Guide — Real-World Protocol Observations

> **Source:** [Ruach Tov](https://ruachtov.ai) — An open research collective for human-AI collaboration.
> These observations come from building and operating `dibbur`, a multi-agent conversation engine that has processed 95,000+ messages through the Claude API.

This guide documents **undocumented behaviors, edge cases, and protocol nuances** discovered through extensive real-world usage of the Claude Messages API. These complement the official SDK documentation with practical knowledge that prevents subtle bugs.

---

## 1. Message Structure Constraints

### Never Append Text After Tool Results

**Severity:** Critical — causes empty responses

When sending messages with `tool_result` content blocks, do NOT add additional `text` blocks after the tool results in the same message. The API will return an empty response (no content blocks).

```python
# ❌ WRONG — causes empty response
messages = [
    {"role": "user", "content": "What time is it?"},
    {"role": "assistant", "content": [
        {"type": "tool_use", "id": "call_1", "name": "get_time", "input": {}}
    ]},
    {"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "call_1", "content": "3:45 PM"},
        {"type": "text", "text": "Also, the weather is sunny."}  # ← This kills the response
    ]}
]

# ✅ CORRECT — tool results only, additional context in a separate message
messages = [
    {"role": "user", "content": "What time is it?"},
    {"role": "assistant", "content": [
        {"type": "tool_use", "id": "call_1", "name": "get_time", "input": {}}
    ]},
    {"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "call_1", "content": "3:45 PM"}
    ]},
    # If you need to add context, use a separate user message turn
]
```

**Why this matters:** Systems that inject interjections, notifications, or system updates between tool calls may accidentally append text after `tool_result` blocks. This is especially common in multi-agent architectures or systems with background event queues.

### Tool Error Reporting with `is_error`

When a tool execution fails, set `is_error: true` on the `tool_result` block. This tells the model the tool failed, so it can retry, try a different approach, or report the error gracefully:

```python
# ✅ Report tool errors properly
{"type": "tool_result", "tool_use_id": "call_1",
 "content": "FileNotFoundError: /tmp/data.csv does not exist",
 "is_error": True}
```

Without `is_error`, the model treats error messages as successful output and may try to parse stack traces as data. With `is_error`, it understands the tool failed and adjusts its strategy.

### Role Alternation Must Be Strict

The API enforces strict `user` → `assistant` → `user` alternation. Adjacent messages with the same role will be rejected with a 400 error. If your system needs to inject multiple user messages (e.g., tool results + system events), consolidate them into a single message with multiple content blocks.

```python
# ❌ WRONG — two consecutive user messages
messages = [
    {"role": "user", "content": "Hello"},
    {"role": "user", "content": "Also, check the weather"}  # 400 error
]

# ✅ CORRECT — single user message with multiple content blocks
messages = [
    {"role": "user", "content": [
        {"type": "text", "text": "Hello"},
        {"type": "text", "text": "Also, check the weather"}
    ]}
]
```

### First Message Must Be `user` Role

The messages array must always start with a `user` message. System instructions go in the `system` parameter, not as the first message.

---

## 2. Streaming Event Sequence

### Required Event Order

When streaming responses (`stream=True`), events arrive in a strict sequence:

```
message_start          → Contains the message object (id, model, role, usage)
content_block_start    → For each content block (text, tool_use, thinking)
content_block_delta    → Incremental content (may be many per block)
content_block_stop     → Marks end of a content block
message_delta          → Final usage stats (output_tokens) and stop_reason
message_stop           → Stream complete
```

**Important:** There may be multiple `content_block_start`/`stop` cycles per message (e.g., a thinking block followed by a text block, or text followed by tool_use).

### Ping Events

The stream periodically sends `ping` events (typically every 10-15 seconds) during long-running operations. Your SSE client should handle these gracefully — they are keep-alive signals, not content.

```python
for event in stream:
    if event.type == "ping":
        continue  # Keep-alive, ignore
    elif event.type == "content_block_delta":
        # Process actual content
        ...
```

---

## 3. Stop Reasons and Their Implications

The `stop_reason` field in the response (or `message_delta` event in streaming) indicates WHY the model stopped generating:

| Stop Reason | Meaning | Action Required |
|-------------|---------|-----------------|
| `end_turn` | Model finished its response naturally | None — response is complete |
| `tool_use` | Model wants to call a tool | Execute the tool, send results back |
| `max_tokens` | Hit the `max_tokens` limit | Response is truncated — increase limit or continue |
| `stop_sequence` | Hit a custom stop sequence | Check if response is complete |

**Critical:** When `stop_reason` is `tool_use`, you MUST send tool results back before the next assistant turn. The model expects the conversation to continue with tool results.

**Common bug:** Treating `tool_use` as a complete response and presenting the raw JSON to users. Always check `stop_reason` before deciding how to handle the response.

---

## 4. Error Handling — Rate Limits and Overload

### 429 Rate Limit Errors

The API returns 429 when you exceed rate limits. The response includes a `retry-after` header with the recommended wait time in seconds.

```python
import time
import anthropic

def call_with_retry(client, **kwargs):
    max_retries = 5
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError as e:
            retry_after = int(e.response.headers.get("retry-after", 30))
            if attempt < max_retries - 1:
                time.sleep(retry_after)
            else:
                raise
```

### 529 Overloaded Errors

During high-traffic periods, the API may return 529 (API Overloaded). This is different from 429 (rate limit) — it means the service itself is under strain, not that your account is rate-limited.

**Backoff strategy for 529:**
- Use exponential backoff: [5, 15, 30, 60, 120, 300, 600] seconds
- 529s often resolve within 30-60 seconds
- If sustained, wait longer — the service may be experiencing an incident

```python
BACKOFF_SCHEDULE = [5, 15, 30, 60, 120, 300, 600]

def call_with_overload_retry(client, **kwargs):
    for delay in BACKOFF_SCHEDULE:
        try:
            return client.messages.create(**kwargs)
        except anthropic.APIStatusError as e:
            if e.status_code == 529:
                time.sleep(delay)
                continue
            raise
    raise RuntimeError("API overloaded — all retries exhausted")
```

### 400 Errors — Check Your Message Structure

The most common cause of 400 errors is malformed message structure:
- Missing `tool_result` for a `tool_use` in the previous assistant message
- Role alternation violation (consecutive same-role messages)
- Empty content blocks
- Invalid `tool_use_id` references (must match exactly)

### 400 Errors — OAuth Authentication: Required Headers

**Severity:** Critical — generic `"Error"` message makes diagnosis extremely difficult

Beginning around March 16, 2026 00:00 UTC, OAuth-authenticated API clients began receiving 400 errors with a nearly empty error message:

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Error"
  }
}
```

This affects **only OAuth authentication** (not API key auth). Two additional elements are required:

**1. Billing header in the system prompt** — The first block in your `system` parameter must be a billing identification string:

```python
system_param = [
    {
        "type": "text",
        "text": "x-anthropic-billing-header: cc_version=your-app-name; cc_entrypoint=cli"
    },
    {
        "type": "text",
        "text": your_actual_system_prompt,
        "cache_control": {"type": "ephemeral"}
    }
]
```

**2. HTTP header** — Include `anthropic-dangerous-direct-browser-access: true` in your default headers:

```python
client = anthropic.AsyncAnthropic(
    auth_token=oauth_token,
    default_headers={
        "anthropic-beta": ",".join(your_betas),
        "anthropic-dangerous-direct-browser-access": "true",
    },
)
```

**Why this is hard to diagnose:** The error message is just `"Error"` — it does not indicate which header is missing or what the expected format is. If you are using OAuth and receiving 400 `invalid_request_error` with message `"Error"` (and nothing else), these missing headers are the likely cause.

**Discovery method:** We diagnosed this by capturing HTTP request headers through a proxy and comparing a working client (claude-code, TypeScript SDK) against our failing client (custom Python SDK). The header differences revealed the missing fields.

---

## 5. Token Counting Edge Cases

### Thinking Tokens Are Separate

When using `thinking` mode, the model's internal reasoning tokens are counted separately from output tokens. The `usage` object includes:
- `input_tokens` — your prompt tokens
- `output_tokens` — the model's visible response tokens
- `cache_creation_input_tokens` — tokens cached for prompt caching
- `cache_read_input_tokens` — tokens read from cache

**Note:** Thinking tokens have their own budget separate from `max_tokens`. If you set `max_tokens=1024` with a thinking budget of 10000, the thinking tokens do NOT count against your 1024 limit. However, verify current behavior regarding whether thinking tokens appear in `output_tokens` in the usage report — this has varied across API versions and may change.

### Prompt Caching

Cache tokens are tracked in the usage response:
```python
usage = message.usage
print(f"Fresh input: {usage.input_tokens}")
print(f"Cached read: {usage.cache_read_input_tokens}")
print(f"Cache created: {usage.cache_creation_input_tokens}")
```

Cache creation has a minimum size threshold. Very short system prompts may not be cached.

---

## 6. Multi-Turn Conversation Patterns

### Tool Use Across Multiple Turns

When the model calls multiple tools, the conversation structure requires careful management:

```python
messages = [
    {"role": "user", "content": "Compare the weather in NYC and LA"},
    {"role": "assistant", "content": [
        {"type": "tool_use", "id": "call_1", "name": "weather", "input": {"city": "NYC"}},
        {"type": "tool_use", "id": "call_2", "name": "weather", "input": {"city": "LA"}}
    ]},
    {"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": "call_1", "content": "NYC: 45°F, cloudy"},
        {"type": "tool_result", "tool_use_id": "call_2", "content": "LA: 72°F, sunny"}
    ]}
    # Model will now synthesize both results
]
```

**Important:** All `tool_result` blocks for a given assistant turn must be in the SAME user message. You cannot split them across multiple user messages.

### Long Conversations and Context Window

As conversations grow, you'll approach the context window limit. The API returns a 400 error when the total tokens (input + max_tokens) exceed the model's context window. Strategies:
1. **Summarize early turns** — Replace detailed early messages with summaries
2. **Drop old tool results** — Tool results from many turns ago can often be removed
3. **Use prompt caching** — Cache the system prompt and early context to reduce costs

---

## 7. Practical Tips

### Model Selection for Tool Use

Models handle tool calling differently (model names below are shorthand — check [Anthropic docs](https://docs.anthropic.com/en/docs/about-claude/models) for current canonical model IDs):
- **Opus-class** — Most reliable for complex multi-tool workflows, better at maintaining conversation state across many tool calls
- **Sonnet-class** — Good balance of speed and tool-calling accuracy
- **Haiku-class** — Fast but may struggle with complex tool orchestration

### Streaming with Tool Use

When streaming, tool_use blocks arrive as:
1. `content_block_start` with `type: "tool_use"` and the tool name
2. `content_block_delta` with `type: "input_json_delta"` — partial JSON for tool input
3. `content_block_stop` — tool call complete

You must accumulate the `input_json_delta` fragments and parse the complete JSON after `content_block_stop`:

```python
tool_input_json = ""
for event in stream:
    if event.type == "content_block_delta":
        if hasattr(event.delta, "partial_json"):
            tool_input_json += event.delta.partial_json
    elif event.type == "content_block_stop":
        if tool_input_json:
            tool_input = json.loads(tool_input_json)
            # Execute the tool with tool_input
            tool_input_json = ""
```

### Testing Without API Costs

Use `client.messages.count_tokens()` to estimate costs before sending expensive requests. This endpoint is free and returns the token count for your messages.

---

## Contributing

These observations are maintained by the [Ruach Tov](https://ruachtov.ai) collective. If you've discovered undocumented API behaviors, please contribute to our [GitHub](https://github.com/ruach-tov) or reach out at ruachtov.ai.

*"Courage across boundaries"* — רוח טוב
