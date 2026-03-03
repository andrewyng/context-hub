# Feedback and Annotations

Context Hub has two mechanisms for agents to improve over time: **annotations** (local, for your agent) and **feedback** (sent to authors, for everyone).

## Annotations

Annotations are local notes that agents attach to docs or skills. They persist across sessions and appear automatically on future `chub get` calls.

### Why annotate?

When an agent uses a doc to complete a task, it sometimes discovers things that aren't in the doc itself — environment-specific gotchas, version quirks, project-specific context. Without annotations, that knowledge is lost when the session ends. The agent makes the same discovery again next time.

Annotations close this gap. The agent saves what it learned, and next time it fetches the same doc, the note is right there.

### Usage

```bash
# Set an annotation
chub annotate stripe/api "Webhook verification requires raw body — do not parse JSON before verifying"

# View current annotation
chub annotate stripe/api

# Replace with a new note
chub annotate stripe/api "Updated: use the v2 webhook endpoint for new integrations"

# Remove an annotation
chub annotate stripe/api --clear

# List all annotations
chub annotate --list
```

### How annotations appear

When an annotation exists, `chub get` appends it after the doc content:

```
# Stripe API
...doc content...

---
[Agent note — 2025-01-15T10:30:00Z]
Webhook verification requires raw body — do not parse JSON before verifying
```

With `--json`, the annotation is included in the response:

```json
{
  "id": "stripe/api",
  "type": "doc",
  "content": "...",
  "annotation": {
    "id": "stripe/api",
    "note": "Webhook verification requires raw body...",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### What to annotate

Good annotations capture knowledge that isn't obvious from the doc:

- **Environment-specific gotchas** — "Requires raw body for webhook verification"
- **Version-specific notes** — "v3 API requires different auth header format"
- **Project-specific context** — "We use the batch endpoint, not individual calls"
- **Error resolutions** — "Rate limit errors need exponential backoff with jitter"

Don't annotate information that's already clearly stated in the doc.

### Storage

Annotations are stored locally at `~/.chub/annotations/` as JSON files. They are specific to your machine and are not shared or synced. Each entry gets one annotation — setting a new note replaces the previous one.

## Feedback

Feedback is sent to doc authors via the registry. It helps maintainers understand what's working and what needs improvement.

### Usage

```bash
# Simple up/down rating
chub feedback stripe/api up
chub feedback stripe/api down

# With a comment
chub feedback stripe/api up "Clear examples, well structured"

# With labels for specific issues
chub feedback openai/chat down --label outdated --label wrong-examples

# Target a specific file within a doc
chub feedback acme/widgets down --file references/advanced.md --label incomplete

# Include agent context
chub feedback stripe/api up --agent "claude-code" --model "claude-sonnet-4"
```

### Labels

Labels help authors pinpoint specific issues:

**Positive:** `accurate`, `well-structured`, `helpful`, `good-examples`

**Negative:** `outdated`, `inaccurate`, `incomplete`, `wrong-examples`, `wrong-version`, `poorly-structured`

### Telemetry

Feedback is sent via the telemetry system. If telemetry is disabled, feedback is silently skipped. Check status with:

```bash
chub feedback --status
```

## Annotations vs Feedback

| | Annotations | Feedback |
|---|---|---|
| **For whom** | Your agent, locally | Doc authors, via registry |
| **Persists** | On your machine | In the registry |
| **Purpose** | Don't repeat mistakes | Improve the content |
| **Visible to** | You only | Maintainers |
| **Effect** | Shows on future fetches | Authors update the doc |

Both matter. Annotations help your agent today. Feedback helps everyone tomorrow.
