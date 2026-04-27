# Context Hub

Coding agents hallucinate APIs and forget what they learn in a session. Context Hub gives them curated, versioned docs, plus the ability to get smarter with every task. All content is open and maintained as markdown in this repo — you can inspect exactly what your agent reads, and contribute back. 

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@aisuite/chub)](https://www.npmjs.com/package/@aisuite/chub)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

## Quick Start

```bash
npm install -g @aisuite/chub
chub search openai                 # find what's available
chub get openai/chat --lang py     # fetch current docs (Python version) 
```

## Agent Setup

Install `@aisuite/chub`, then copy the packaged `get-api-docs` skill into your
agent's skill or rule directory:

```bash
cp $(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md <agent-skill-dir>/get-api-docs.md
```

The source for that packaged skill lives in this repo at
[cli/skills/get-api-docs/SKILL.md](cli/skills/get-api-docs/SKILL.md). The CLI
also exposes versioned runtime instructions through `chub --help` and
`chub help`.

## How It Works

Chub is designed for your coding agent to use (not for you to use!). The
recommended pattern is: install the packaged `get-api-docs` skill, then have
the agent run `chub --help` or `chub help` to get the matching remote
instructions for its installed CLI version before it searches or fetches
anything. That remote help can be revised over time for the same CLI version,
and the CLI falls back to bundled local help if the exact remote document is
unavailable.

**Most of the time, it's simple — search, fetch, use:**

```bash
chub search "stripe payments"        # find relevant docs
chub get stripe/api --lang js        # fetch the doc
# Agent reads the doc, writes correct code. Done.
```

**When the agent discovers a gap**, it can annotate locally for next time:

```bash
chub annotate stripe/api "Needs raw body for webhook verification"

# Next session, the annotation appears automatically on chub get.
```

**Feedback flows back to authors** — `chub feedback stripe/api up` or `down` — vote the docs up or down so they can get better for everyone over time.

## Content Types

Versioned, language-specific. "What to know."

```bash
chub get openai/chat --lang py       # Python variant
chub get openai/chat --lang js       # JavaScript variant
```

More content types than API documentation (such as agent skills) are on the roadmap. 

## Commands

| Command | Purpose |
|---------|---------|
| `chub search [query]` | Search docs and skills (no query = list all) |
| `chub get <id> [--lang py\|js]` | Fetch docs or skills by ID |
| `chub annotate <id> <note>` | Attach a note to a doc or skill |
| `chub annotate <id> --clear` | Remove annotations |
| `chub annotate --list` | List all annotations |
| `chub feedback <id> <up\|down>` | Upvote or downvote a doc (sent to maintainers) |

For the full list of commands, flags, and piping patterns, see the [CLI Reference](docs/cli-reference.md).

## Self-Improving Agents

Context Hub is designed for a loop where agents get better over time.

**Annotations** are local notes that agents attach to docs. They persist across sessions and appear automatically on future fetches — so agents learn from past experience. See [Feedback and Annotations](docs/feedback-and-annotations.md).

**Feedback** (up/down ratings with optional labels) goes to doc authors, who update the content based on what's working and what isn't. The docs get better for everyone — not just your local annotations.

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

## Key Features

### Incremental Fetch

Docs can have multiple reference files beyond the main entry point. Fetch only what you need — no wasted tokens. Use `--file` to grab specific references, or `--full` for everything. See the [CLI Reference](docs/cli-reference.md).

### Annotations & Feedback

Annotations are local notes that agents attach to docs — they persist across sessions and appear automatically on future fetches. Feedback (up/down ratings) goes to doc authors to improve the content for everyone. See [Feedback and Annotations](docs/feedback-and-annotations.md).

## Contributing

Anyone can contribute docs and skills — API providers, framework authors, and the community. Content is plain markdown with YAML frontmatter, submitted as pull requests. See the [Content Guide](docs/content-guide.md) for the format and structure.

Agent feedback (up/down ratings from real usage) flows back to authors, helping surface what needs fixing and improving overall quality over time.

## License

[MIT](LICENSE)
