---
name: anki-study-workflows
description: "Use Anki through anki-mcp-server for safe study sessions, deck inspection, note creation, field-aware updates, and media-backed flashcard generation"
metadata:
  revision: 1
  updated-on: "2026-03-12"
  source: community
  tags: "anki,mcp,flashcards,spaced-repetition,study,notes,decks,review"
---

# Anki Study Workflows

Use this skill when an MCP client has access to **anki-mcp-server** and the goal is to review due cards, inspect decks, create flashcards, or update existing notes safely.

Official docs:
- https://ankimcp.ai
- https://github.com/ankimcp/anki-mcp-server

## Prerequisites

- Anki desktop is running
- The AnkiConnect plugin is installed and reachable, usually at `http://localhost:8765`
- The MCP client is connected to `@ankimcp/anki-mcp-server`

If the environment is uncertain, prefer read-only exploration first.

## Safety Rules

1. Discover before writing. Check decks, note types, and fields before calling `addNote`, `addNotes`, or `updateNoteFields`.
2. Prefer read-only mode for inspection-heavy tasks or when the user did not explicitly ask to modify their collection.
3. Never invent note fields. Use `modelNames` and `modelFieldNames` first.
4. Before editing an existing note, inspect it with `notesInfo` so field names, tags, and HTML structure are preserved.
5. Use batches for imports, but keep them small enough to diagnose partial failures. `addNotes` supports up to 100 notes.
6. Prefer file paths or URLs over base64 when attaching images or audio through `mediaActions`.
7. Confirm deck targets before moving or creating content. `createDeck` supports up to two levels such as `Language::HSK1`.

## Choose the Right Tool

| Goal | Tool(s) |
|------|---------|
| Sync before or after a session | `sync` |
| Review due cards | `get_due_cards`, `present_card`, `rate_card` |
| List or inspect decks | `deckActions` with `listDecks` or `deckStats` |
| Find existing notes | `findNotes`, then `notesInfo` |
| Create one note | `addNote` |
| Import many notes | `addNotes` |
| Update note fields | `notesInfo`, then `updateNoteFields` |
| Move cards between decks | `deckActions` with `changeDeck` |
| Check note types and fields | `modelNames`, `modelFieldNames`, `modelStyling` |
| Add media assets | `mediaActions` with `storeMediaFile` |

## Recommended Workflows

### 1. Review due cards

Use this when the user wants a study session, not card authoring.

1. Call `sync` if the user mentions AnkiWeb or cross-device changes.
2. Call `get_due_cards` to fetch the review queue.
3. For each card, call `present_card`.
4. After the learner answers, call `rate_card`.

Do not update note content during review unless the user explicitly asks.

### 2. Create cards from source material

Use this when the user provides text, notes, or a document and wants flashcards.

1. Identify the target deck with `deckActions:listDecks`.
2. Identify the note type with `modelNames`.
3. Fetch fields with `modelFieldNames`.
4. Map the generated content into the exact field schema.
5. If media is needed, upload it first with `mediaActions:storeMediaFile`.
6. Create cards with `addNote` or `addNotes`.

Good defaults:
- Keep cards atomic: one fact, one contrast, or one prompt per note.
- Prefer cloze cards only if the user already uses a cloze note type.
- Avoid duplicating existing cards; search first with `findNotes` if duplication risk is high.

### 3. Update or enrich existing notes

Use this when the user wants better wording, examples, mnemonics, or media.

1. Find candidate notes with `findNotes`.
2. Inspect them with `notesInfo`.
3. Preserve the existing field contract and styling.
4. Apply narrow edits with `updateNoteFields`.

Do not overwrite the full note blindly when only one field needs improvement.

### 4. Inspect a collection safely

Use this before migrations, cleanup, or planning an import.

1. `deckActions:listDecks`
2. `deckActions:deckStats`
3. `modelNames`
4. `findNotes`
5. `notesInfo`

This is the right path when the user asks for analysis, not modifications.

## Prompting Patterns

### Generate new cards

Ask for:
- target deck
- target note type
- desired card style: basic, reversed, cloze, mnemonic-heavy, example-heavy
- source material

Then:
- inspect deck and fields
- generate notes that fit the discovered schema
- write with `addNote` or `addNotes`

### Improve existing cards

Ask for:
- deck or search query
- which fields may be edited
- whether to preserve existing wording where possible

Then:
- search
- inspect
- update only the requested fields

### Study session

Ask for:
- deck scope if relevant
- whether to sync first
- whether the session is review-only or may include card fixes afterward

## Common Failure Avoidance

- If note creation fails, re-check the exact field names from `modelFieldNames`.
- If updates render poorly, inspect the note with `notesInfo` and the note type with `modelStyling` before changing HTML-heavy fields.
- If media uploads are slow, switch from base64 to file paths or URLs.
- If a task is risky, re-run in read-only mode until the plan is confirmed.
