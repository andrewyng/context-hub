# Search Relevance

This note documents the search relevance changes in the CLI and the small benchmark harness that ships with them.

## What changed

Search ranking now combines three signals:

1. **Base retrieval**: BM25 when a search index is available, otherwise keyword fallback.
2. **Lexical rescue**: the existing compact-id and fuzzy lexical pass for queries that need stronger identifier matching.
3. **Coverage boost**: a new additive score that rewards entries covering more of a multi-term query across ids, names, tags, and descriptions.

The coverage boost also adds a light acronym rescue path. For example, a query like `mcp` can now boost entries whose names expand to **Model Context Protocol**.

## New CLI flags

```bash
chub search "stripe payments" --scores
chub search "stripe payments" --explain
```

`--scores` shows the final ranking score for each fuzzy-search result. `--explain` adds the base score, lexical rescue contribution, coverage boost contribution, and a short reason summary.

## Benchmark harness

The repo now includes a small synthetic benchmark harness for regression testing and iteration:

```bash
cd cli
npm run relevance:benchmark
npm run test:relevance
```

Files:

- `scripts/relevance-benchmark.mjs`: prints baseline vs improved top results for a fixed set of scenarios
- `test/fixtures/relevance-benchmark.json`: synthetic catalog and golden queries
- `test/relevance.test.js`: regression tests for the new coverage logic

The fixture is intentionally synthetic so contributors can reason about ranking changes quickly without depending on a live registry or network fetches.

## Why this helps

The baseline keyword pass can overweight a generally authoritative entry that only matches one strong token. The coverage boost helps longer queries prefer entries that match more of the query, especially when the intended result has a stronger phrase or identifier match than a competing generic reference.

## Extending the fixture

Add new entries and scenarios to `test/fixtures/relevance-benchmark.json`. Each scenario should include a query and an `expectedTop` id. Keep fixtures small and focused so they are easy to review in pull requests.
