# Content Guide

How to create docs and skills for Context Hub.

## Directory Structure

Content is organized by author (vendor/org), then by type (`docs` or `skills`), then by entry name:

```
my-content/
  acme/
    docs/
      widgets/
        DOC.md                    # single-language doc
        references/
          advanced.md             # additional reference file
      client/
        javascript/
          DOC.md                  # multi-language: JS variant
        python/
          DOC.md                  # multi-language: Python variant
    skills/
      deploy/
        SKILL.md                  # a skill
```

### Single-language docs

Place `DOC.md` directly in the entry directory:

```
author/docs/entry-name/DOC.md
```

### Multi-language docs

Create a subdirectory per language:

```
author/docs/entry-name/javascript/DOC.md
author/docs/entry-name/python/DOC.md
```

### Skills

Place `SKILL.md` in the entry directory:

```
author/skills/entry-name/SKILL.md
```

### Reference files

Additional files (examples, advanced topics, error references) go alongside the entry file:

```
author/docs/widgets/
  DOC.md
  references/
    advanced.md
    errors.md
```

These are discoverable via `chub get` (shown in the footer) and fetchable with `--file` or `--full`.

## Frontmatter

Every `DOC.md` and `SKILL.md` starts with YAML frontmatter.

### DOC.md frontmatter

```yaml
---
name: widgets
description: "Acme widget API for creating and managing widgets"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  updated-on: "2026-01-01"
  source: maintainer
  tags: "acme,widgets,api"
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Entry name (used in the ID: `author/name`) |
| `description` | Yes | Short description for search results |
| `metadata.languages` | Yes | Language of this doc variant |
| `metadata.versions` | Yes | Version(s) covered |
| `metadata.updated-on` | Yes | Last update date |
| `metadata.source` | Yes | Trust level: `official`, `maintainer`, or `community` |
| `metadata.tags` | No | Comma-separated tags for filtering |

### SKILL.md frontmatter

```yaml
---
name: deploy
description: "Deployment automation skill for CI/CD pipelines"
metadata:
  updated-on: "2026-01-01"
  source: community
  tags: "deploy,ci,automation"
---
```

Skills have the same fields as docs except `languages` and `versions` are not required (skills are language-agnostic).

## Writing Content

Content is markdown, written for LLM consumption. Keep these in mind:

- **Be direct.** Agents don't need introductions or marketing. Start with what the API does and how to use it.
- **Show code first.** A working example is worth more than a paragraph of explanation.
- **Cover the common case.** Don't exhaustively document every option. Cover what agents will actually need 90% of the time.
- **Use reference files for depth.** Put advanced topics, error handling, and edge cases in separate reference files rather than making the main doc too long.

## Building

Use `chub build` to compile your content directory into a registry:

```bash
chub build my-content/                           # build to my-content/dist/
chub build my-content/ -o dist/                  # custom output directory
chub build my-content/ --validate-only           # validate without building
```

The build process:
1. Discovers all `DOC.md` and `SKILL.md` files
2. Validates frontmatter (checks required fields)
3. Generates `registry.json` with entry metadata
4. Copies content files to the output directory

### Validation

Run `--validate-only` to check your content without building:

```bash
chub build my-content/ --validate-only
```

This reports the number of docs and skills found, and flags any frontmatter errors.

### Using built content locally

Point your config at the build output to use it alongside the public registry:

```yaml
# ~/.chub/config.yaml
sources:
  - name: community
    url: https://cdn.aichub.org/v1
  - name: my-team
    path: /path/to/my-content/dist
```

Now `chub search` and `chub get` cover both public and your local content.
