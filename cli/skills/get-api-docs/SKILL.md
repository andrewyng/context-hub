---
name: get-api-docs
description: >
  Use this skill when you need documentation for a third-party library, SDK, or API
  before writing code that uses it — for example, "use the OpenAI API", "call the
  Stripe API", "use the Anthropic SDK", "query Pinecone", or any time the user asks
  you to write code against an external service and you need current API reference.
  Fetch the docs with chub before answering, rather than relying on training knowledge.
---

# Get API Docs via chub

When you need documentation for a library or API, fetch it with the `chub` CLI
rather than guessing from training data. This gives you the current, correct API.

## Step 0 — Scan the project (recommended at session start)

Before writing any code, scan the project to see which dependencies have docs:

```bash
chub scan --json
```

This reads `package.json`, `requirements.txt`, `pyproject.toml`, and other
manifest files, then cross-references against the chub registry. The output
lists which dependencies have docs and suggests `chub get` commands. Use this
to proactively load relevant docs before you start coding.

## Step 1 — Find the right doc ID

```bash
chub search "<library name>" --json
```

Pick the best-matching `id` from the results (e.g. `openai/chat`, `anthropic/sdk`,
`stripe/api`). If nothing matches, try a broader term.

## Step 2 — Fetch the docs

```bash
chub get <id> --lang py    # or --lang js, --lang ts
```

Omit `--lang` if the doc has only one language variant — it will be auto-selected.

## Step 3 — Use the docs

Read the fetched content and use it to write accurate code or answer the question.
Do not rely on memorized API shapes — use what the docs say.

## Step 4 — Annotate what you learned

After completing the task, if you discovered something not in the doc — a gotcha,
workaround, version quirk, or project-specific detail — save it so future sessions
start smarter:

```bash
chub annotate <id> "Webhook verification requires raw body — do not parse before verifying"
```

Annotations are local, persist across sessions, and appear automatically on future
`chub get` calls. Keep notes concise and actionable. Don't repeat what's already in
the doc.

## Step 5 — Give feedback

Rate the doc so authors can improve it. Ask the user before sending.

```bash
chub feedback <id> up                        # doc worked well
chub feedback <id> down --label outdated     # doc needs updating
```

Available labels: `outdated`, `inaccurate`, `incomplete`, `wrong-examples`,
`wrong-version`, `poorly-structured`, `accurate`, `well-structured`, `helpful`,
`good-examples`.

## Quick reference

| Goal | Command |
|------|---------|
| Scan project deps | `chub scan --json` |
| List everything | `chub search` |
| Find a doc | `chub search "stripe"` |
| Exact id detail | `chub search stripe/api` |
| Fetch Python docs | `chub get stripe/api --lang py` |
| Fetch JS docs | `chub get openai/chat --lang js` |
| Save to file | `chub get anthropic/sdk --lang py -o docs.md` |
| Fetch multiple | `chub get openai/chat stripe/api --lang py` |
| Save a note | `chub annotate stripe/api "needs raw body"` |
| List notes | `chub annotate --list` |
| Rate a doc | `chub feedback stripe/api up` |

## Notes

- `chub search` with no query lists everything available
- IDs are `<author>/<name>` — confirm the ID from search before fetching
- If multiple languages exist and you don't pass `--lang`, chub will tell you which are available
