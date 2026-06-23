---
name: get-api-docs
description: >
  Use this skill when you need documentation for a third-party library, SDK, or API
  before writing code that uses it — for example, "use the OpenAI API", "call the
  Stripe API", "use the Anthropic SDK", "query Pinecone", or any time the user asks
  you to write code against an external service and you need current API reference.
  Fetch the docs with chub_get before answering, rather than relying on training knowledge.
---

# Get API Docs via chub

When you need documentation for a library or API, fetch it with the `chub_get` MCP tool
rather than guessing from training data. This gives you the current, correct API.

## Step 1 — Find the right doc ID

Call `chub_search` with the library name as the `query` parameter (e.g. `"stripe"`, `"openai"`).

Pick the best-matching `id` from the results (e.g. `openai/chat`, `anthropic/sdk`,
`stripe/api`). If nothing matches, try a broader term.

## Step 2 — Fetch the docs

Call `chub_get` with the `id` and a `lang` parameter (`"python"`, `"js"`, `"ts"`).

Omit `lang` if the doc has only one language variant — it will be auto-selected.

## Step 3 — Use the docs

Read the fetched content and use it to write accurate code or answer the question.
Do not rely on memorized API shapes — use what the docs say.

## Step 4 — Annotate what you learned

After completing the task, if you discovered something not in the doc — a gotcha,
workaround, version quirk, or project-specific detail — save it so future sessions
start smarter:

Call `chub_annotate` with the `id` and a `note` (e.g. `"Webhook verification requires raw body — do not parse before verifying"`).

Annotations are local, persist across sessions, and appear automatically on future
`chub_get` calls. Keep notes concise and actionable. Don't repeat what's already in
the doc.

## Step 5 — Give feedback

Rate the doc so authors can improve it. Ask the user before sending.

Call `chub_feedback` with the `id`, a `rating` (`"up"` or `"down"`), and optional `labels`.

Available labels: `outdated`, `inaccurate`, `incomplete`, `wrong-examples`,
`wrong-version`, `poorly-structured`, `accurate`, `well-structured`, `helpful`,
`good-examples`.

## Quick reference

| Goal | Tool | Key parameters |
|------|------|----------------|
| List everything | `chub_search` | _(no query)_ |
| Find a doc | `chub_search` | `query="stripe"` |
| Exact ID detail | `chub_search` | `query="stripe/api"` |
| Fetch Python docs | `chub_get` | `id="stripe/api"`, `lang="python"` |
| Fetch JS docs | `chub_get` | `id="openai/chat"`, `lang="js"` |
| Fetch multiple | `chub_get` | call once per ID |
| Save a note | `chub_annotate` | `id="stripe/api"`, `note="needs raw body"` |
| List notes | `chub_annotate` | `list=true` |
| Rate a doc | `chub_feedback` | `id="stripe/api"`, `rating="up"` |

## Notes

- `chub_search` with no `query` lists everything available
- IDs are `<author>/<name>` — confirm the ID from search before fetching
- If `chub_get` returns "multiple languages available", add the `lang` parameter

