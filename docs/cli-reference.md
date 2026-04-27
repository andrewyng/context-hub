# CLI Reference

Full command reference for Context Hub (`chub`).

## Global Flags

| Flag | Purpose |
|------|---------|
| `--json` | Structured JSON output for command results |
| `--version` | Print CLI version |
| `--help` | Show versioned bootstrap guidance |

## Install as an Agent Skill

Install `@aisuite/chub`, then copy the packaged `get-api-docs` skill into your
agent's skill or rule directory:

```bash
cp $(npm root -g)/@aisuite/chub/skills/get-api-docs/SKILL.md <agent-skill-dir>/get-api-docs.md
```

The source skill lives in this repo at `cli/skills/get-api-docs/SKILL.md`.

## chub / chub --help / chub -h / chub help

Show bootstrap guidance for coding agents.

- Bare `chub`, root `chub --help`, `chub -h`, and `chub help` print the same bootstrap guidance.
- Root help stays human-readable even when `--json` is present.
- All root help forms first try to fetch the same remote help document for the exact installed CLI version.
- The remote document for a given CLI version can be revised over time to tune prompting for that same binary.
- If the exact remote help document is unavailable or mismatched, it prints the bundled local help text shipped with the installed CLI.
- Subcommand flags print command syntax help, e.g. `chub search --help`.
- `chub help <command>` is not supported; use `chub <command> --help` instead.

## chub search [query]

Search docs and skills. No query lists all entries.

| Flag | Purpose |
|------|---------|
| `--tags <csv>` | Filter by comma-separated tags |
| `--lang <language>` | Filter by language |
| `--limit <n>` | Max results (default: 20) |

```bash
chub search                          # list everything
chub search "stripe"                 # fuzzy search by name/description
chub search stripe/payments          # exact id — shows full detail
chub search --tags automation        # filter by tag
```

**Exact ID match** returns the full entry detail (versions, languages, files). **Fuzzy search** returns a list of matches ranked by relevance.

## chub get \<ids...\>

Fetch one or more docs or skills by ID. Auto-detects type (doc vs skill). Auto-infers language when only one variant exists.

| Flag | Purpose |
|------|---------|
| `--lang <language>` | Language variant (js, py, ts, etc.) |
| `--version <version>` | Specific doc version |
| `--full` | Fetch all files, not just the entry point |
| `--file <paths>` | Fetch specific file(s) by path (comma-separated) |
| `-o, --output <path>` | Write to file or directory |

```bash
chub get stripe/api                  # single doc (auto-infers lang)
chub get openai/chat-api --lang py   # specific language
chub get pw-community/login-flows    # fetch a skill
chub get stripe/api openai/chat-api  # multiple entries
chub get stripe/api -o .context/     # save to file
```

### Incremental Fetch

When a doc has reference files beyond the main entry point, the output includes a footer:

```
---
Additional files available (use --file to fetch):
  references/advanced.md
  references/errors.md
Example: chub get acme/widgets --file references/advanced.md
```

Fetch only what you need:

```bash
chub get acme/widgets --file references/advanced.md       # one file
chub get acme/widgets --file advanced.md,errors.md         # multiple
chub get acme/widgets --full                               # everything
```

With `--json`, the response includes an `additionalFiles` array listing available reference files.

### Multi-Language Docs

If a doc is available in multiple languages and `--lang` is not specified, the CLI lists available languages and asks you to choose.

If a doc has only one language, `--lang` is not required — it's auto-inferred.

## chub annotate [id] [note]

Attach persistent notes to a doc or skill. See [Feedback and Annotations](feedback-and-annotations.md) for the full guide.

| Flag | Purpose |
|------|---------|
| `--clear` | Remove annotation for this entry |
| `--list` | List all annotations |

```bash
chub annotate stripe/api "Use idempotency keys for POST requests"
chub annotate stripe/api                   # view current note
chub annotate stripe/api "new note"        # replaces previous
chub annotate stripe/api --clear           # remove
chub annotate --list                       # list all
```

## chub feedback [id] [rating] [comment]

Rate a doc or skill. Feedback is sent to the registry for maintainers. See [Feedback and Annotations](feedback-and-annotations.md) for details.

| Flag | Purpose |
|------|---------|
| `--label <label>` | Feedback label (repeatable) |
| `--lang <language>` | Language variant |
| `--file <file>` | Specific file within the entry |
| `--agent <name>` | AI tool name |
| `--model <model>` | LLM model name |
| `--status` | Show feedback and telemetry status |

Valid labels: `accurate`, `well-structured`, `helpful`, `good-examples`, `outdated`, `inaccurate`, `incomplete`, `wrong-examples`, `wrong-version`, `poorly-structured`.

```bash
chub feedback stripe/api up "Clear examples, well structured"
chub feedback openai/chat down --label outdated --label wrong-examples
```

## chub update

Download or refresh the cached registry from remote sources.

| Flag | Purpose |
|------|---------|
| `--force` | Re-download even if cache is fresh |
| `--full` | Download full bundle for offline use |

## chub cache status\|clear

Manage the local cache.

- `cache status` — shows cache info (sources, registries, sizes, last updated)
- `cache clear` — removes cached content (`--force` to skip confirmation)

## chub build \<content-dir\>

Build a registry from a local content directory. See the [Content Guide](content-guide.md) for how to structure your content.

| Flag | Purpose |
|------|---------|
| `-o, --output <path>` | Output directory (default: `<content-dir>/dist`) |
| `--base-url <url>` | Base URL for remote serving |
| `--validate-only` | Validate content without building |

```bash
chub build my-content/                           # build to my-content/dist/
chub build my-content/ -o dist/                  # custom output dir
chub build my-content/ --validate-only           # validate only
```

## Piping Patterns

```bash
# Search, pick first result, fetch
ID=$(chub search "stripe" --json | jq -r '.results[0].id')
chub get "$ID" -o .context/stripe.md

# Fetch multiple docs at once
chub get openai/chat stripe/api -o .context/

# Check what additional files are available
chub get acme/widgets --json | jq '.additionalFiles'

# Fetch a specific reference file
chub get acme/widgets --file references/advanced.md

# List all annotations as JSON
chub annotate --list --json
```

## Configuration

Config lives at `~/.chub/config.yaml`:

```yaml
sources:
  - name: community
    url: https://cdn.aichub.org/v1
  - name: internal
    path: /path/to/local/docs

source: "official,maintainer,community"   # trust policy
refresh_interval: 86400                   # cache TTL in seconds (24h)
telemetry: true                           # anonymous usage analytics (passive)
feedback: true                            # allow chub feedback to send ratings (explicit)
help_url: https://cdn.aichub.org/v1/help/{version}.json   # optional versioned help override
help_timeout_ms: 2000                     # exact-version remote help fetch timeout in milliseconds
```

### Telemetry

Anonymous usage analytics help improve the registry. No personally identifiable information is collected.

Opt out:
```yaml
telemetry: false
```
Or via environment variable: `CHUB_TELEMETRY=0`

### Feedback

The `chub feedback` command sends doc/skill ratings to maintainers. This is separate from telemetry — you can disable passive analytics while still being able to rate docs.

Opt out:
```yaml
feedback: false
```
Or via environment variable: `CHUB_FEEDBACK=0`

### Multi-Source

When multiple sources define the same entry ID, prefix with the source name to disambiguate:

```bash
chub get internal:openai/chat
```
