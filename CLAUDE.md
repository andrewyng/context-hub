# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

- The repo root is a minimal npm workspace that contains a single package: `cli/`.
- The product is a Node.js CLI plus an MCP server for retrieving curated docs and skills.
- Source content lives in `content/` as markdown with YAML frontmatter; published/bundled output is generated into `cli/dist/` during `prepublish`.

## Common commands

Run commands from the repository root unless noted otherwise.

### Install dependencies

```bash
npm install --prefix cli
```

### Run the CLI locally

```bash
node cli/src/index.js --help
node cli/src/index.js search openai
node cli/src/index.js get openai/chat --lang py
```

### Build content into a registry bundle

```bash
node cli/src/index.js build content -o cli/dist --base-url https://cdn.aichub.org/v1
node cli/src/index.js build content --validate-only
```

### Run tests

```bash
npm test --prefix cli
npm run test:watch --prefix cli
npm run test:coverage --prefix cli
```

### Run a single test file

```bash
npx vitest run cli/test/e2e.test.js
npx vitest run cli/test/lib/bm25.test.js
```

### Run the packaged binaries locally

```bash
./cli/bin/chub --help
./cli/bin/chub-mcp
```

## Architecture overview

### 1. Content-first system

The core asset is markdown content, not a database. `content/` is the source of truth for docs and skills. Each entry is defined by a `DOC.md` or `SKILL.md` file plus YAML frontmatter. The content guide in `docs/content-guide.md` defines the author/type/entry layout, required frontmatter, and how multi-language / multi-version docs are represented.

### 2. Build-time compilation step

`cli/src/commands/build.js` turns raw content into a distributable bundle:

- recursively discovers `DOC.md` and `SKILL.md`
- validates and parses frontmatter
- groups doc variants by entry name, language, and version
- emits `registry.json` and `search-index.json`
- copies the content tree into the output directory

This means runtime code assumes a built registry exists; it does not scan `content/` dynamically during normal CLI usage.

### 3. Runtime query model

The runtime is centered around three library layers:

- `cli/src/lib/config.js`: loads `~/.chub/config.yaml` and defines source configuration, refresh policy, telemetry, and source trust filters
- `cli/src/lib/cache.js`: handles remote registry refresh, bundle download, local cache layout, bundled fallback (`cli/dist`), and raw doc retrieval
- `cli/src/lib/registry.js`: merges entries across configured sources, merges BM25 indexes, applies source/tag/lang filters, resolves exact IDs, and maps docs to a concrete language/version/path

The CLI commands in `cli/src/commands/*.js` are thin wrappers over these libraries.

### 4. Multi-source design

The system supports multiple configured sources from `~/.chub/config.yaml`. A source can be remote (`url`) or local (`path`). At runtime:

- registries from all configured sources are merged
- entries are tagged with internal `_source` / `_sourceObj` metadata
- BM25 indexes are merged into one logical search index when available
- collisions are handled by surfacing namespaced IDs like `source:id`

When investigating search or retrieval behavior, check `cli/src/lib/registry.js` first.

### 5. Fetch model: search first, then resolve, then load content

The main user flow is:

1. `search` or `list` identifies an entry
2. `getEntry()` resolves a logical ID
3. `resolveDocPath()` chooses the language/version variant
4. `resolveEntryFile()` maps to `DOC.md` or `SKILL.md`
5. `fetchDoc()` / `fetchDocFull()` loads content from local source, cache, bundled dist, or remote URL

`cli/src/commands/get.js` is the best end-to-end reference for this path.

### 6. CLI and MCP share the same core logic

The MCP tool handlers in `cli/src/mcp/tools.js` reuse the same registry/cache/annotation logic as the CLI instead of maintaining a separate backend. If you change retrieval behavior, search semantics, or validation rules, check both the CLI command and MCP wrapper.

### 7. State outside the repo matters

A lot of behavior depends on user-local state under `~/.chub/`, especially:

- `config.yaml`
- cached source registries and bundles
- saved annotations

For bugs involving missing results, stale data, or source conflicts, inspect config and cache assumptions before changing code.

## Testing notes

- Test files live under `cli/test/`.
- `cli/test/e2e.test.js` covers end-to-end CLI behavior.
- `cli/test/lib/*.test.js` covers focused library behavior such as BM25, frontmatter parsing, and normalization.
- Recent local runs showed the CLI starts successfully after `npm install --prefix cli`, but `npm test --prefix cli` can currently hit timeouts in some e2e cases. Treat test failures in `cli/test/e2e.test.js` as something to investigate rather than assuming your change caused them.
