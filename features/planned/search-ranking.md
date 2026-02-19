# Feature: Search Ranking

## Overview

Improve search result ranking with a three-layer scoring model inspired by Amazon product search: term matching, description quality scoring, and source authority boosting. Future layer: agent upvote/downvote signals.

## Current state

`searchEntries()` in `cli/src/lib/registry.js` uses a simple scoring model:

- Exact id match: +100
- Id contains query: +50
- Exact name match: +80
- Name contains query: +40
- Per query word: +10 (id), +10 (name), +5 (description), +15 (tag)

All entries are scored equally regardless of source type or description quality.

## Proposed ranking model

### Layer 1: Term relevance (match)

Replace substring matching with BM25-style term frequency scoring across fields. Each field has a weight:

| Field | Weight | Rationale |
|---|---|---|
| `id` | 3.0 | Exact identifier — strongest signal |
| `name` | 2.5 | Short name, high specificity |
| `tags` | 2.0 | Curated keywords, high intent |
| `description` | 1.0 | Longer text, more noise |

Scoring per field:
- Exact match (full field = query): field_weight * 10
- Full query appears as substring: field_weight * 5
- Per query term present: field_weight * 1, with IDF-like boost for rare terms (terms that appear in fewer entries score higher)

This replaces the current flat point system with weighted, field-aware scoring.

### Layer 2: Description quality score

A deterministic rubric computed at **build time** and stored in the registry as `_qualityScore` (0-10):

| Signal | Points | How to detect |
|---|---|---|
| Description length > 20 chars | +2 | `description.length > 20` |
| Description mentions specific features | +2 | Contains terms like "streaming", "auth", "webhook", etc. (not generic filler) |
| Has 3+ tags | +1 | `tags.length >= 3` |
| Has code examples in DOC.md | +2 | Frontmatter or content scan for fenced code blocks |
| Covers multiple sections | +1 | Count of `##` headings in DOC.md |
| Has companion files | +1 | `files.length > 1` |
| Description word count 10-50 | +1 | Not too short, not too long |

The quality score acts as a multiplier on the relevance score: `relevance * (1 + qualityScore / 20)`. A perfect quality score (10) gives a 1.5x boost. A zero score gives no boost.

### Layer 3: Source authority boost

Multiplier based on who wrote the doc:

| Source | Multiplier |
|---|---|
| `maintainer` (library author) | 1.3 |
| `official` | 1.2 |
| `community` | 1.0 |

### Layer 4 (future): Agent votes

Track upvote/downvote signals from agents that fetch and use docs. Store as `_voteScore` in a local file (`~/.chub/votes.json`). Applied as: `score * (1 + voteScore * 0.1)`. Not implemented in v1.

### Final formula

```
final_score = term_relevance * (1 + qualityScore / 20) * source_boost
```

All factors are transparent and documented. No opaque numbers.

## Implementation plan

### 1. Add quality scoring to build (`cli/src/commands/build.js`)

- After discovering each doc/skill entry, compute `_qualityScore` from the rubric
- Store it in the registry entry (alongside `id`, `name`, `description`, etc.)
- For docs: scan DOC.md content for code blocks, headings, companion files
- For skills: scan SKILL.md similarly

### 2. Rewrite `searchEntries()` in `cli/src/lib/registry.js`

- Replace flat point system with weighted field scoring
- Add IDF-like term rarity boost: `Math.log(totalEntries / entriesContainingTerm)`
- Apply quality multiplier: `* (1 + (entry._qualityScore || 0) / 20)`
- Apply source boost: `* SOURCE_BOOST[entry.source] || 1.0`
- Keep exact-id shortcut (score 1000) so exact matches always win

### 3. Show ranking signals in search output (`cli/src/commands/search.js`)

- `--json` output includes `_score`, `_qualityScore`, `source` for transparency
- Human output: no change (ranked order speaks for itself)
- `chub search <exact-id>` detail view: show quality score and source

### 4. Update sample-registry.json

- Add `_qualityScore` to sample entries

### 5. Rebuild test content

- `chub build /tmp/chub-test-local -o /tmp/chub-build-output` — verify quality scores are computed
- Search for various queries and verify ranking order makes sense

## Files to modify

- `cli/src/commands/build.js` — add quality scoring after discovery
- `cli/src/lib/registry.js` — rewrite `searchEntries()`
- `cli/src/commands/search.js` — show quality score in detail view
- `sample-registry.json` — add `_qualityScore` fields

## Verification

1. `chub build /tmp/chub-test-local -o /tmp/chub-build-output` — registry entries have `_qualityScore`
2. `chub search "api"` — results ranked by relevance * quality * source boost
3. `chub search "api" --json` — JSON includes `_score`, `_qualityScore`
4. `chub search "internal-api"` — exact id match still wins
5. A maintainer doc with good description ranks above a community doc with vague description for the same query
