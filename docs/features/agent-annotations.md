# Feature: Agent Annotations

## Overview

Agents can attach one local note to a doc or skill with `chub annotate`. The note is stored on the current machine, persists across sessions, and is appended automatically on future `chub get` calls for the same entry.

## Storage format

Annotations are stored as JSON files under `~/.chub/annotations/*.json`. The filename is derived from the entry id with `/` replaced by `--`.

Example for `openai/chat`:

```json
{
  "id": "openai/chat",
  "note": "Streaming requires explicit close when using function calling.",
  "updatedAt": "2026-03-15T10:00:00.000Z"
}
```

Saving a new note for the same entry replaces the previous note.

## CLI commands

### `chub annotate <id> <note>`

Create or replace the saved note for a doc or skill.

```bash
chub annotate openai/chat "Streaming requires explicit close when using function calling"
chub annotate stripe/api "Webhook verification requires the raw request body"
```

### `chub annotate <id>`

Show the current saved note for an entry.

```bash
chub annotate openai/chat
```

### `chub annotate <id> --clear`

Remove the saved note for an entry.

```bash
chub annotate openai/chat --clear
```

### `chub annotate --list`

List all saved notes.

```bash
chub annotate --list
```

## Interaction with `chub get`

When a saved note exists, `chub get` appends it after the fetched content.

```bash
chub get openai/chat --lang py
```

Example footer:

```text
---
[Agent note — 2026-03-15T10:00:00.000Z]
Streaming requires explicit close when using function calling.
```

- Doc fetches still require `--lang`, even when the doc has one language.
- Skill fetches remain language-agnostic.
- Saved notes are shown automatically when present.
- In `--json` mode for a single-entry fetch, the response includes an `annotation` field when one exists.

## Verification

1. `chub annotate openai/chat "Streaming requires explicit close"` — saves a note
2. `chub annotate openai/chat` — shows the saved note
3. `chub annotate --list` — lists saved notes
4. `chub get openai/chat --lang py` — shows doc content plus the saved note
5. `chub annotate openai/chat --clear` — removes the note
6. `chub annotate openai/chat` — reports that no annotation exists
