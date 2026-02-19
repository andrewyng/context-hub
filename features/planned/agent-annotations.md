# Feature: Agent Annotations

## Overview

Agents can annotate docs and skills with gotchas, tips, and experiences learned while building with them. Two workflows:

1. **Private annotations** — stored locally in `~/.chub/annotations/`, automatically included when the agent fetches the same doc/skill again. Personal knowledge base that improves with use.
2. **Suggest to author** (future) — push annotations upstream as structured feedback. Mechanism TBD (author dashboard, GitHub issue, etc.). For now, just ensure the annotation format is structured enough to be submittable later.

## Annotation format

Stored as markdown files at `~/.chub/annotations/<id>.md` (e.g. `~/.chub/annotations/openai/chat.md`):

```markdown
---
doc_id: openai/chat
created: 2026-02-02
updated: 2026-02-02
---

## Gotcha: streaming requires explicit close

When using streaming with function calling, you must explicitly close the stream
after the final function call response. The doc doesn't mention this — if you
don't close it, the connection hangs for 30 seconds before timing out.

## Tip: batch function calls

You can pass multiple function definitions and the model will call them in
parallel. Much faster than sequential calls for independent operations.
```

Each annotation is a `##` section. Agents append new sections. The frontmatter tracks which doc it's for and when it was last updated.

## CLI commands

### `chub annotate <id> <message>`

Add an annotation to a doc or skill.

```bash
# Agent adds a gotcha after encountering an issue
chub annotate openai/chat "streaming requires explicit close when using function calling"

# Add with a type prefix
chub annotate openai/chat --type gotcha "streaming requires explicit close..."
chub annotate openai/chat --type tip "batch function calls for parallel execution"
```

- Creates `~/.chub/annotations/openai/chat.md` if it doesn't exist
- Appends a new `## Gotcha:` or `## Tip:` section
- Updates the `updated` timestamp in frontmatter

### `chub get docs <id>` — automatically includes annotations

When fetching a doc, check if annotations exist for that id. If so, append them after the doc content under a `# Annotations` heading.

```bash
chub get docs openai/chat
# Returns: doc content + "# Annotations\n## Gotcha: streaming requires..."

chub get docs openai/chat --no-annotations
# Returns: doc content only
```

### `chub annotations list`

List all annotated docs/skills.

```bash
chub annotations list
# openai/chat     2 annotations   updated 2026-02-02
# stripe/payments 1 annotation    updated 2026-01-28
```

### `chub annotations show <id>`

Show annotations for a specific doc/skill.

### `chub annotations clear <id>`

Remove annotations for a doc/skill.

## Files to create/modify

### New: `cli/src/lib/annotations.js`
- `getAnnotationPath(id)` — returns `~/.chub/annotations/<id>.md`
- `readAnnotations(id)` — returns parsed annotation content or null
- `addAnnotation(id, message, type)` — appends annotation to file
- `listAnnotations()` — lists all annotated ids with counts
- `clearAnnotations(id)` — removes annotation file

### New: `cli/src/commands/annotate.js`
- `chub annotate <id> <message>` command
- `chub annotations list|show|clear` subcommands

### Modify: `cli/src/commands/get.js`
- After fetching doc/skill content, check for annotations
- Append annotations to output unless `--no-annotations`

### Modify: `cli/src/index.js`
- Register annotate command
- Add `annotate` to SKIP_REGISTRY (annotations are local, don't need registry)

## Verification

1. `chub annotate openai/chat "streaming needs explicit close"` — creates annotation file
2. `chub annotate openai/chat --type tip "batch function calls"` — appends to file
3. `chub annotations list` — shows openai/chat with 2 annotations
4. `chub annotations show openai/chat` — shows both annotations
5. `chub get docs openai/chat` — doc content + annotations appended
6. `chub get docs openai/chat --no-annotations` — doc content only
7. `chub annotations clear openai/chat` — removes annotation file
