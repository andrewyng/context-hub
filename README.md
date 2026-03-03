# Context Hub

Context Hub gives AI agents the right documentation — and agents that use it get smarter with every task.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@aisuite/chub)](https://www.npmjs.com/package/@aisuite/chub)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

## The Problem

Your LLM agent was trained months — or years — ago. You need to use an API which was not present in the training set. The agent doesn't know. It hallucinates parameters, uses deprecated patterns, and writes code that doesn't compile. Web search can solve this but is more error prone, and causes token burn.

Debugging existing projects come with their own challenges. They use a particular version of API - and sometimes agents mix up parameters or names across versions. Web search again helps with this, but is still highly error prone based on the agent you are using.

Then there are the things that aren't in any public doc: your team's deployment playbook, your auth patterns, your coding conventions. Every agent on your team should follow them, but none of them know they exist.

You can paste docs into chat, but it doesn't scale. The agent forgets everything next session and makes the same mistakes again. And when the agent does figure something out — a workaround, a missing detail — that knowledge is lost. There's no way to capture it for next time.

```
  Without Context Hub                          With Context Hub
  ───────────────────                          ─────────────────
  Search the web                               Fetch curated docs
  Noisy results                                Higher chance of code working
  Code breaks                                  Agent notes any gaps/workarounds
  Effort in fixing                             ↗ Even smarter next session
  Knowledge forgotten
  ↻ Repeat next session
```

## The Agent Workflow

Context Hub is designed for a loop where agents get better over time.

**Most of the time, it's simple — search, fetch, use:**

```bash
chub search "stripe payments"        # find relevant docs
chub get stripe/api                  # fetch the doc
# Agent reads the doc, writes correct code. Done.
```

**When the agent discovers a gap**, it can annotate locally for next time:

```bash
# Agent figured out that webhook verification needs the raw request body.
# That wasn't obvious from the doc. Save it:
chub annotate stripe/api "Webhook verification requires raw body — do not parse JSON before verifying"

# Next session, the annotation appears automatically:
chub get stripe/api
# ---
# [Agent note]
# Webhook verification requires raw body — do not parse JSON before verifying
```

The annotation persists across sessions. The agent doesn't repeat the same mistake.

**The content itself improves over time too.** Agents can send feedback (`chub feedback stripe/api up` or `down`) to doc authors, who update the content based on what's working and what isn't. So the docs get better for everyone — not just your local annotations.

## Quick Start

```bash
npm install -g @aisuite/chub
chub search "stripe"                 # find what's available
chub get stripe/api                  # fetch current docs
```

## Content Types

**Docs** — API and SDK references. Versioned, language-specific. "What to know."
```bash
chub get openai/chat-api --lang py   # Python variant
chub get stripe/api --lang js        # JavaScript variant
```

**Skills** — Task recipes, automation patterns, coding playbooks. Shareable across teams so every agent follows the same proven approach. "How to do it."
```bash
chub get pw-community/login-flows    # fetch a skill
```

Both are markdown with YAML frontmatter, following the [Agent Skills](https://agentskills.io) open standard — compatible with Claude Code, Cursor, Codex, and other AI tools.

## Commands

| Command | Purpose |
|---------|---------|
| `chub search [query]` | Search docs and skills (no query = list all) |
| `chub get <ids...>` | Fetch docs or skills by ID |
| `chub annotate <id> <note>` | Attach a note to a doc or skill |
| `chub annotate <id> --clear` | Remove an annotation |
| `chub annotate --list` | List all annotations |
| `chub feedback <id> <up\|down>` | Rate a doc or skill (sent to maintainers) |

For the full list of commands, flags, and piping patterns, see the [CLI Reference](docs/cli-reference.md).

## Key Features

### Incremental Fetch

Docs can have multiple reference files beyond the main entry point. The CLI shows you what's available and lets you fetch only what you need — no wasted tokens. Use `--file` to grab specific references, or `--full` for everything. See the [CLI Reference](docs/cli-reference.md) for details.

### Agent Annotations & Feedback

Annotations are local notes that agents attach to docs. They persist across sessions and appear automatically on future fetches — so agents learn from past experience. Feedback (up/down ratings) goes to doc authors to improve the content for everyone. See [Feedback and Annotations](docs/feedback-and-annotations.md).

### Private Content Repo — *Coming Soon*

Teams need their own internal docs alongside the public registry: deployment playbooks, coding conventions, internal API references. Agents should be able to search both seamlessly. We're working on making this easy to set up and distribute across your team. See [Private Content Repo](docs/private-content.md) for more.

### JSON Output

Every command supports `--json` for structured output, making it easy to pipe into agents and automation. See the [CLI Reference](docs/cli-reference.md) for piping patterns.

## License

[MIT](LICENSE)
