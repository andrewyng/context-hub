# Context Hub (chub) - Design Document

## What is Context Hub?

Context Hub bridges the gap between rapidly evolving APIs and LLM knowledge cutoffs. It's a repository of curated, LLM-optimized documentation and skills that AI agents (and humans) can search and retrieve via a CLI.

There are two kinds of content, with a fundamental distinction:

- **Docs** ("what to know") — API/SDK reference documentation, factual knowledge that fills knowledge cutoff gaps. Large, detailed, fetched on-demand for a specific task.
- **Skills** ("how to do it") — Behavioral instructions, coding patterns, automation playbooks. Smaller, actionable, can be installed into agent skill directories for persistent availability.

Each entry also has a **source** field (`official` | `maintainer` | `community`) for trust/quality signaling. Users control which sources agents see via `~/.chub/config.yaml`.

## Architecture

```
Content repo (source of truth)
  ↓ chub build → registry.json + content tree
CDN (serves registry + individual files + optional full bundle)   ← remote source
  ↓ CLI fetches from here
~/.chub/ (local cache)                                            ← cached remote data
  ↓ CLI reads from here
Agent/Human (consumes docs via stdout or -o file)
  ↑ CLI also reads directly from
Local folders (private/internal docs)                             ← local source
```

The CLI supports **multiple sources** — both remote CDNs and local folders. Entries from all sources are merged.

## Design Decisions & Rationale

### Why separate "docs" and "skills"?
We initially treated all content uniformly — just tags, no rigid types. But docs and skills have fundamentally different access patterns:

| | Docs | Skills |
|---|---|---|
| Purpose | Reference knowledge ("what to know") | Behavioral instructions ("how to do it") |
| Size | Large (10K-50K+ tokens) | Small (<500 lines entry point) |
| Lifecycle | Ephemeral, fetched per-task | Can be persistent, installed into agent |
| Discovery | Agent explicitly searches and fetches | Agent can auto-discover from filesystem |
| Install target | `.context/` or any file | `.claude/skills/`, `.cursor/skills/`, etc. |
| Language/version | Yes — per-language, per-version variants | No — skills are typically language-agnostic |

This distinction drives the registry format split into `docs[]` and `skills[]`. The CLI uses a single `chub get <id>` command that auto-detects the type.

### Why `docs[]` and `skills[]` in the registry (not `entries[]`)?
The original format had a single `entries[]` array with a `provides` field to indicate doc/skill. We split it because:

1. **Different schemas**: Docs need `languages[].versions[]` nesting. Skills are flat — no language or version, just `name`, `path`, `files`.
2. **Array membership IS the type**: No need for a `provides` field. A doc is in `docs[]`, a skill is in `skills[]`.
3. **Bundled entries**: When a topic has both DOC.md and SKILL.md, they appear as separate items in their respective arrays. Clean separation.
4. **CLI mapping**: `chub get` searches both arrays and auto-detects type. `chub search` searches both.

### Why skills have no language or version?
Skills are behavioral instructions ("how to integrate Stripe", "how to write Playwright login flows"). They're typically language-agnostic or written for a single context. Adding language/version nesting would add complexity without value — a skill author who needs Python and TypeScript variants can create two separate skill entries.

Docs, on the other hand, have fundamentally different content per language (Python SDK vs JavaScript SDK) and evolve with API versions.

### Why a single `get` command (not `get docs` / `get skills`)?
We originally had `chub get docs <id>` and `chub get skills <id>` as separate subcommands. We simplified to `chub get <id>` because the CLI can auto-detect the type from the registry (docs have `languages[]`, skills don't). The user shouldn't need to know internal taxonomy to fetch content. `--lang` and `--version` flags apply when the entry is a doc and are silently ignored for skills.

### Why DOC.md and SKILL.md (not just SKILL.md)?
We considered using SKILL.md for everything since the Agent Skills spec is the format standard. But calling a 50K API reference "SKILL.md" is semantically misleading — agents that scan for skills would load doc descriptions into their system prompt (wasting ~100 tokens per doc entry), and might "activate" a doc when the user just wants to write code.

### Why `--lang` flag instead of positional argument?
Originally: `chub get openai-chat python`. Changed to: `chub get openai/chat-api --lang python`.

Reasons:
1. Multi-id support (`chub get openai/chat-api stripe/payments`) would make a positional language argument ambiguous
2. Language can be auto-inferred when an entry has only one — the flag is only needed for disambiguation
3. Flags are self-documenting; a bare `python` after an id is ambiguous to readers

### Why multi-id support?
Agents often need multiple entries in one operation. Rather than looping, `chub get openai/chat-api stripe/payments` fetches both. Output is concatenated with `---` separators for stdout, or written as separate files when `-o` points to a directory.

### Why one CLI, not two?
We considered separate tools for docs and skills. Rejected because they share the same registry, config, sources, search, and cache infrastructure.

### Why 5+1 commands?
We started with 8 commands and trimmed to 5 core + 1 build: `search`, `get`, `update`, `cache`, `feedback`, and `build`. `list` and `info` were merged into `search`. `get docs` and `get skills` were merged into `get` with auto-detection.

### Why `source` field + config-level filtering?
Each entry has `source: "official" | "maintainer" | "community"`. The human controls trust policy via `~/.chub/config.yaml`. An enterprise can restrict agents to `source: official,maintainer` without the agent needing to know about quality tiers.

### Why tags instead of rigid categories?
Rather than rigid sub-types, entries use free-form tags. This is flexible — new categories emerge without schema changes.

### Why progressive disclosure?
A monolithic 50K-token doc file wastes context. Each entry is a directory with a small entry point (DOC.md or SKILL.md, ~500 lines max) that links to detailed reference files. The agent reads the overview first, then selectively loads only what it needs.

The `--full` flag exists for when you want everything. With `-o <dir>`, `--full` writes individual files preserving directory structure so relative links resolve on disk. Without `-o`, it concatenates to stdout with `# FILE:` headers.

### Why hybrid data strategy?
Three approaches were considered:
1. **Full bundle** (download everything) — simple but doesn't scale
2. **Index + on-demand** (fetch individual docs) — lightweight but needs network per doc
3. **Hybrid** (chosen) — registry-only by default, on-demand doc fetching, optional full bundle

### Why author-prefixed IDs?
IDs are always `author/name` — e.g., `openai/chat-api`, `stripe/payments`, `playwright-community/login-flows`. The author is the top-level directory name in the content repo; the name comes from frontmatter. This eliminates name collisions by construction — two authors can both have a `chat` entry, but their ids differ (`openai/chat-api` vs `mycompany/chat`). This is the same pattern as npm scopes, Docker images, and GitHub repos.

### Why `source:` prefix (not `source/`) for multi-source?
When multiple sources define the same id, the user disambiguates with a `source:` prefix: `internal:openai/chat-api` vs `community:openai/chat-api`. We use colon instead of slash because ids already contain slashes (`author/name`). Using `source/author/name` would be ambiguous — is `internal` the source or the author?

### Why multi-source?
Teams often have internal/proprietary docs alongside the public community registry. The CLI supports multiple sources — remote CDNs and local folders. Entries are merged, and IDs are namespaced with `source:` only when there's a collision across sources.

---

## Content Repository & Build Pipeline

### Content repo structure

Content is organized by **author directories**. Each author gets a top-level directory and organizes their docs and skills inside it:

```
content-repo/
├── stripe/                              # author directory
│   ├── registry.json                    # OPTIONAL: author manages own index
│   ├── docs/
│   │   └── payments/                    # entry directory
│   │       ├── DOC.md                   # frontmatter: name, description, languages, versions
│   │       ├── references/
│   │       │   └── webhooks.md
│   │       └── examples/
│   │           └── checkout.py
│   └── skills/
│       └── integration/                 # entry directory
│           ├── SKILL.md
│           └── scripts/
│               └── setup.sh
├── openai/                              # no registry.json → auto-discover
│   └── docs/
│       └── chat/
│           ├── DOC.md                   # languages: "python,javascript", versions: "1.52.0"
│           └── references/
│               └── streaming.md
└── playwright-community/
    └── skills/
        └── login-flows/
            ├── SKILL.md
            └── helpers/
                └── login-util.ts
```

**Convention**: `<author>/{docs,skills}/<entry-name>/` with DOC.md or SKILL.md at root.

### The entry directory is the unit of content

Following the convention established by Anthropic and OpenAI skill repos:
- SKILL.md (or DOC.md) lives in a directory
- All other files in that directory are companions — installed together with `--full`
- References use **relative paths** (e.g., `[Auth](references/auth.md)`)
- `--full -o <dir>` writes individual files preserving directory structure, so relative links resolve on disk
- Without `--full`, only the entry point (DOC.md or SKILL.md) is fetched

### Two discovery modes per author

#### 1. Author provides `registry.json`
If an author directory contains `registry.json`, the build uses it directly. Same schema as the top-level registry (with `docs[]` and `skills[]`). Paths are prefixed with the author directory name during merge.

This is for authors with complex organization who want full control over their index.

#### 2. Auto-discovery (no `registry.json`)
The build walks the author directory, finds all DOC.md and SKILL.md files, and parses frontmatter to generate registry entries.

**DOC.md frontmatter:**
```yaml
---
name: chat-api
description: OpenAI Chat API - completions, streaming, function calling
metadata:
  languages: "python,javascript,typescript"    # comma-separated, multi-lang
  versions: "1.52.0"                           # comma-separated, multi-version
  updated-on: "2026-01-15"
  source: maintainer
  tags: "openai,chat,llm"
---
```

**SKILL.md frontmatter** (no language/version needed):
```yaml
---
name: login-flows
description: Login flow automation patterns for Playwright
metadata:
  updated-on: "2026-01-15"
  source: community
  tags: "browser,playwright,automation"
---
```

### Multi-language and multi-version in frontmatter

A single DOC.md can declare multiple languages and versions (comma-separated strings). The build expands this into the registry schema — multiple `languages[]` entries, each with multiple `versions[]`, all pointing to the same directory path.

This means one doc file can serve Python, JavaScript, and TypeScript users if the content is language-agnostic enough. When content differs per language, authors create separate DOC.md files in separate directories — the build groups them by matching `name`.

### Version-specific docs

When an API has breaking changes across versions, the author creates separate DOC.md files:

```
openai/
└── docs/
    └── chat/
        ├── v1/
        │   ├── DOC.md              # versions: "1.52.0,1.51.0", languages: "python,javascript"
        │   └── references/
        │       └── streaming.md
        └── v2/
            ├── DOC.md              # versions: "2.0.0", languages: "python,javascript"
            └── references/
                ├── streaming.md
                └── structured-outputs.md
```

Both DOC.md files have `name: chat-api` (under the `openai/` author directory) — they get grouped into `id: openai/chat-api`, into one `docs[]` entry with multiple versions pointing to different paths. `recommendedVersion` is the highest semver. `chub get openai/chat-api` gets the latest; `--version 1.52.0` gets the older docs.

### Language-specific docs

For different content per language:
```
stripe/
└── docs/
    └── payments/
        ├── python/
        │   └── DOC.md          # languages: "python", versions: "14.0.0"
        └── javascript/
            └── DOC.md          # languages: "javascript", versions: "14.0.0"
```

Same `name: payments` under `stripe/` → both contribute to `id: stripe/payments`. Different languages, different paths, different content.

### The `chub build` command

```bash
chub build <content-dir> [options]
```

Options:
- `-o, --output <dir>` — output directory (default: `<content-dir>/dist`)
- `--base-url <url>` — set `base_url` in registry (for CDN deployment)
- `--validate-only` — check frontmatter and structure without writing output
- `--json` — output build summary as JSON

Build steps:
1. List top-level directories in `<content-dir>` (author directories)
2. For each author directory:
   - If `registry.json` exists → use it directly, prefix paths
   - Else → auto-discover DOC.md/SKILL.md, parse frontmatter, group by `name`
3. Merge all author entries into one registry (ids are `author/name`, so collisions are rare)
4. Write `registry.json` to output dir
5. Copy content tree to output dir (preserving structure)
6. Print summary: N docs, N skills, N warnings

### Validation rules

- DOC.md must have `name`, `description`, `metadata.languages`, `metadata.versions`
- SKILL.md must have `name`, `description` (no language/version required)
- Warn on missing `metadata.source` (default: "community")
- Warn on missing `metadata.tags`
- Error on duplicate id (rare since ids are `author/name`)
- If both DOC.md and SKILL.md exist in the same directory, `name` must match

### Publishing to CDN

The build output is a static directory ready to serve:
```
dist/
├── registry.json                              # Generated index
├── stripe/docs/payments/DOC.md               # Content files (copied)
├── stripe/docs/payments/references/...
├── openai/docs/chat-api/DOC.md
└── playwright-community/skills/login-flows/SKILL.md
```

Upload `dist/` to any static file host (S3, CloudFlare R2, GitHub Pages). The CLI fetches `registry.json` first, then individual files on demand.

---

## CLI Interface

### Commands

| Command | Purpose | Key Options |
|---|---|---|
| `chub search [query]` | Search (no query = list all, exact id = detail) | `--tags`, `--lang`, `--limit`, `--json` |
| `chub get <ids...>` | Fetch docs or skills (auto-detects type) | `--lang`, `--version`, `--full`, `-o <path>`, `--json` |
| `chub update` | Refresh cached registry | `--force`, `--full` |
| `chub cache status\|clear` | Manage local cache | |
| `chub build <content-dir>` | Build registry from content | `-o`, `--base-url`, `--validate-only`, `--json` |

### How `search` works
- `chub search` — lists all entries (replaces `list`)
- `chub search openai/chat-api` — exact id match shows full detail (replaces `info`)
- `chub search "stripe"` — fuzzy search across id, name, description, tags
- `chub search --tags browser` — filtered listing
- Results show `[doc]` or `[skill]` type labels

### How `get` works
- `chub get openai/chat-api --lang python` — auto-detects doc, fetches DOC.md
- `chub get openai/chat-api --full` — fetch all files in the entry
- `chub get openai/chat-api --full -o .context/openai/` — write individual files preserving structure
- `chub get openai/chat-api stripe/payments --lang js` — fetch multiple entries at once
- `chub get pw-community/login-flows` — auto-detects skill, fetches SKILL.md
- `chub get nonexistent/thing` → error: `Entry "nonexistent/thing" not found.`

### Language inference
- Entry has one language → auto-selected, no `--lang` needed
- Entry has multiple languages, no `--lang` → error with suggestion
- `--lang` applies to all ids in a multi-id command
- `--lang` and `--version` apply to doc entries, silently ignored for skills

### Output modes
- **Default**: Human-friendly, colored terminal output
- **`--json`**: Structured JSON to stdout (no color escapes)
- **`-o <path>`**: Write content to file, print short confirmation to stderr
- **`-o <dir>/`**: Write each entry as separate file when fetching multiple
- **`--full -o <dir>`**: Write individual files preserving directory structure

### Agent piping patterns
```bash
# Get the top search result's id
chub search "stripe payments" --json | jq -r '.results[0].id'

# Full pipeline: search → pick best → fetch → write to file
ID=$(chub search "stripe payments" --json | jq -r '.results[0].id')
chub get "$ID" --lang js -o .context/stripe.md

# Fetch top 3 results
chub search "stripe" --json | jq -r '.results[:3][].id' | xargs chub get -o .context/

# Fetch multiple at once
chub get openai/chat-api stripe/payments -o .context/

# Install a skill into Claude Code's skill directory
chub get pw-community/login-flows -o .claude/skills/login-flows/SKILL.md

# Install a skill with all companion files
chub get pw-community/login-flows --full -o .claude/skills/login-flows/

# Multi-source: disambiguate with source: prefix
chub get internal:openai/chat-api
```

---

## Data Strategy

### Content format: Agent Skills compatible

All content follows the [Agent Skills spec](https://agentskills.io/specification). Both DOC.md and SKILL.md use the standard's frontmatter format (`name`, `description`, optional `metadata`). This makes chub content interoperable with Claude Code, Cursor, Codex, OpenCode, and 30+ agents.

### What the CDN serves
```
cdn.aichub.org/v1/
├── registry.json                                        # Index (~100KB)
├── bundle.tar.gz                                        # Full bundle (optional)
├── stripe/docs/payments/DOC.md                         # Entry point
├── stripe/docs/payments/references/webhooks.md         # Supporting file
└── playwright-community/skills/login-flows/SKILL.md    # Skill
```

### How the CLI uses it
1. `chub update` → fetches `registry.json` only (~100KB), caches locally
2. `chub search` → searches local registry (no network)
3. `chub get <id>` → auto-detects type, fetches entry point (DOC.md or SKILL.md), checks cache first
4. `chub get <id> --full` → fetches all files listed in registry
6. `chub update --full` → downloads entire `bundle.tar.gz` for offline use

### Local cache layout
```
~/.chub/
├── config.yaml              # User config (optional, created manually)
└── sources/                 # Per-source cache (remote sources only)
    ├── community/
    │   ├── registry.json    # Cached index for this source
    │   ├── meta.json        # { lastUpdated, registryHash }
    │   └── data/            # Cached content (on-demand or full bundle)
    └── another-remote/
        └── ...
```

Local path sources are **not cached** — the CLI reads directly from the configured `path`.

---

## Schemas

### Registry (`registry.json`)
```json
{
  "version": "1.0.0",
  "base_url": "https://cdn.aichub.org/v1",
  "generated": "2026-02-02T00:00:00.000Z",
  "docs": [
    {
      "id": "openai/chat-api",
      "name": "chat-api",
      "description": "Chat completions with GPT models",
      "source": "maintainer",
      "tags": ["openai", "chat", "llm"],
      "languages": [
        {
          "language": "python",
          "versions": [
            {
              "version": "1.52.0",
              "path": "openai/docs/chat-api/v1",
              "files": ["DOC.md", "references/streaming.md"],
              "size": 42000,
              "lastUpdated": "2026-01-15"
            }
          ],
          "recommendedVersion": "1.52.0"
        }
      ]
    }
  ],
  "skills": [
    {
      "id": "playwright-community/login-flows",
      "name": "login-flows",
      "description": "Login flow automation patterns for Playwright",
      "source": "community",
      "tags": ["browser", "playwright"],
      "path": "playwright-community/skills/login-flows",
      "files": ["SKILL.md", "helpers/login-util.ts"],
      "size": 12000,
      "lastUpdated": "2026-01-15"
    }
  ]
}
```

**Doc entry fields:**
- `id` — unique identifier in `author/name` format, used by `chub get <id>`
- `name` — short name from frontmatter (the part after the author prefix)
- `description` — short description for search results
- `source` — `official` (library author), `maintainer` (context-hub team), `community`
- `tags` — free-form tags for filtering
- `languages[]` — per-language grouping
  - `versions[]` — per-version, each with `path`, `files`, `size`, `lastUpdated`
  - `recommendedVersion` — default version to fetch

**Skill entry fields:**
- `name`, `description`, `source`, `tags` — same as docs
- `path` — directory path (relative to `base_url` or source root)
- `files` — all files in the entry directory
- `size`, `lastUpdated` — flat, no language/version nesting

### Config (`~/.chub/config.yaml`)
```yaml
# Multi-source (recommended)
sources:
  - name: community
    url: https://cdn.aichub.org/v1       # Remote CDN
  - name: internal
    path: /path/to/local/docs                # Local folder (build output)

# Trust policy: which entry sources to show
source: "official,maintainer,community"

# Optional
refresh_interval: 86400                       # Cache TTL in seconds (24h)
```

**Backward compat:** If no `sources` array, falls back to single `cdn_url` field (or `CHUB_BUNDLE_URL` env var) as a source named "default".

**Local source:** Can be either a raw content repo or a `chub build` output directory — both must contain `registry.json` at root with the standard schema.

---

## Agent Skills Compatibility

Content follows the [Agent Skills open standard](https://agentskills.io/specification), supported by Claude Code, Cursor, Codex, OpenCode, and 30+ agents.

### How chub relates to the Agent Skills ecosystem

| Layer | Agent Skills spec | npx skills (Vercel) | chub |
|---|---|---|---|
| Format | SKILL.md with frontmatter | SKILL.md | SKILL.md + DOC.md |
| Discovery | Local filesystem scan | `npx skills search` (git repos) | `chub search` (registry index) |
| Distribution | None (copy files) | Git repos | CDN + local folders |
| Versioning | None | None | Per-entry, per-language (docs) |
| Multi-language | None | None | Yes (docs) |
| Trust/quality | None | None | `source` field + config filtering |
| Build pipeline | None | None | `chub build` |

### Why adopt the standard?
Makes chub content interoperable with the broader agent ecosystem. A skill fetched via `chub get` can be piped directly into any agent's skill directory and discovered natively.

### How chub extends it
- Registry-based search and discovery over network
- Multi-source aggregation (CDN + local folders)
- Trust/quality filtering via `source` field
- Progressive disclosure with `--full` flag
- DOC.md for reference knowledge (uses same frontmatter format)
- Build pipeline to generate registry from content directories

---

## Project Structure

```
chub-first-draft/
├── cli/
│   ├── package.json              # npm package with bin entry
│   ├── bin/chub                  # #!/usr/bin/env node entry point
│   ├── src/
│   │   ├── index.js              # Commander setup, global --json, preAction cache hook
│   │   ├── commands/
│   │   │   ├── search.js         # search / list / info (all in one)
│   │   │   ├── get.js            # get command (auto-detects doc/skill)
│   │   │   ├── build.js          # build registry from content directory
│   │   │   ├── update.js         # refresh registry / full bundle
│   │   │   └── cache.js          # cache status / clear
│   │   └── lib/
│   │       ├── config.js         # Load config.yaml, merge env vars, defaults
│   │       ├── cache.js          # Registry fetch, on-demand doc fetch, bundle extract
│   │       ├── registry.js       # Load registry, search/filter/query, resolve paths
│   │       ├── frontmatter.js    # YAML frontmatter parser
│   │       ├── output.js         # Dual-mode output (human with chalk / JSON)
│   │       └── normalize.js      # Language aliases (js→javascript, py→python)
├── plans-for-reference/          # Archived design plans
├── NARRATIVE.md                  # Product pitch
├── DESIGN.md                     # This file
├── .gitignore
└── package.json                  # Root workspace
```

## Dependencies

- `commander` ^12 — CLI framework
- `chalk` ^5 — Terminal colors
- `yaml` ^2 — Config + frontmatter parsing
- `tar` ^7 — Bundle extraction (for `--full` mode)
- Node.js >= 18 (built-in `fetch`, no `node-fetch` needed)

## Future considerations

- **`skills_dir` / `docs_dir` config** — default output directories for skills and docs
- ~~**Agent detection**~~ — implemented: `chub --install-skills` with 3-tier auto-detection
- ~~**`chub install`**~~ — implemented: `chub --install-skills [--runtime <agent>]`
- **Usage telemetry** — agents report which docs/skills they used, enabling quality signals
- **CI/CD integration** — GitHub Action that runs `chub build` and publishes to CDN on push

## Reference

- Agent Skills specification: https://agentskills.io/specification
- Vercel Skills CLI: https://github.com/vercel-labs/skills
