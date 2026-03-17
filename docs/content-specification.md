# Content Specification

This document defines the **formal specification** and **validation rules** for content submission to Context Hub. All new content must conform to these requirements to pass the build validation.

> **Related**: See [content-guide.md](./content-guide.md) for authoring guidelines and best practices.

## 1. Directory Structure Rules

### 1.1 Path Pattern

Content must follow the three-level hierarchy:

```
content/
└── {author}/                    # Top-level: vendor/org name (lowercase, hyphens allowed)
    ├── docs/                    # Type: documentation
    │   └── {entry-name}/        # Entry: specific topic/API
    │       ├── DOC.md           # Single-language doc
    │       └── references/      # Optional: additional reference files
    │           └── *.md
    └── skills/                  # Type: skills
        └── {entry-name}/
            ├── SKILL.md
            └── references/
                └── *.md
```

### 1.2 Multi-language Layout

When providing multiple language variants, use language subdirectories:

```
{author}/docs/{entry-name}/
├── javascript/
│   └── DOC.md      # metadata.languages: "javascript"
├── python/
│   └── DOC.md      # metadata.languages: "python"
└── go/
    └── DOC.md      # metadata.languages: "go"
```

**Constraint**: All language variants must share the same `name` in frontmatter.

### 1.3 Multi-version Layout

When providing multiple API versions:

```
{author}/docs/{entry-name}/
├── v1/
│   └── DOC.md      # metadata.versions: "1.x.x"
└── v2/
    └── DOC.md      # metadata.versions: "2.x.x"
```

**Constraint**: All version variants must share the same `name` in frontmatter. The highest version becomes `recommendedVersion`.

### 1.4 Combined Multi-language + Multi-version

```
{author}/docs/{entry-name}/
├── v1/
│   ├── javascript/DOC.md
│   └── python/DOC.md
└── v2/
    ├── javascript/DOC.md
    └── python/DOC.md
```

### 1.5 Skills Layout

Skills are **always flat** — no language or version subdirectories:

```
{author}/skills/{entry-name}/
├── SKILL.md
└── references/
    └── *.md       # Optional reference files
```

---

## 2. File Naming Rules

| File Type | Required Name | Location |
|-----------|---------------|----------|
| Documentation entry | `DOC.md` | Entry root or language/version subdirectory |
| Skill entry | `SKILL.md` | Entry root only |
| Reference files | `*.md` | `references/` subdirectory |

**Note**: Only files named `DOC.md` or `SKILL.md` are discovered by the build. All other markdown files are treated as reference content.

---

## 3. Frontmatter Specification

### 3.1 DOC.md Frontmatter

```yaml
---
name: {entry-name}
description: "{short description}"
metadata:
  languages: "{language}"
  versions: "{package-version}"
  revision: {number}
  updated-on: "{YYYY-MM-DD}"
  source: {official|maintainer|community}
  tags: "{comma,separated,tags}"
---
```

#### Field Requirements

| Field | Level | Rule |
|-------|-------|------|
| `name` | **REQUIRED** | Entry identifier. Used to generate ID: `{author}/{name}`. Must match across language/version variants. |
| `description` | RECOMMENDED | Short description for search. Missing = warning only. |
| `metadata.languages` | **REQUIRED** | Language of this doc variant. See [Language Values](#35-language-values). |
| `metadata.versions` | **REQUIRED** | Package/SDK version on npm or pypi (e.g., `"2.26.0"`). |
| `metadata.revision` | RECOMMENDED | Content revision number. Monotonically increasing, starts at `1`. |
| `metadata.updated-on` | RECOMMENDED | Date of last content revision (`YYYY-MM-DD`). |
| `metadata.source` | RECOMMENDED | Trust level. Defaults to `community` if missing. |
| `metadata.tags` | OPTIONAL | Comma-separated tags for filtering. |

### 3.2 SKILL.md Frontmatter

```yaml
---
name: {entry-name}
description: "{short description}"
metadata:
  revision: {number}
  updated-on: "{YYYY-MM-DD}"
  source: {official|maintainer|community}
  tags: "{comma,separated,tags}"
---
```

#### Field Requirements

| Field | Level | Rule |
|-------|-------|------|
| `name` | **REQUIRED** | Skill identifier. Must be unique within author. |
| `description` | RECOMMENDED | Short description for search. |
| `metadata.revision` | RECOMMENDED | Content revision number. |
| `metadata.updated-on` | RECOMMENDED | Date of last revision. |
| `metadata.source` | RECOMMENDED | Trust level. Defaults to `community`. |
| `metadata.tags` | OPTIONAL | Comma-separated tags. |

**Note**: Skills do NOT have `languages` or `versions` fields (language-agnostic by design).

### 3.3 Source Values

| Value | Definition |
|-------|------------|
| `official` | Authored by the original vendor/creator of the library |
| `maintainer` | Authored by a designated maintainer with access to official sources |
| `community` | Authored by community contributor (default) |

### 3.4 Language Values

Standard language identifiers (normalized at build time):

| Value | Aliases |
|-------|---------|
| `javascript` | `js` |
| `typescript` | `ts` |
| `python` | `py` |
| `ruby` | `rb` |
| `csharp` | `cs` |
| `go` | — |
| `java` | — |
| `cpp` | — |
| `rust` | — |

Other values pass through as lowercase.

---

## 4. Build Validation Rules

The build command (`chub build` or `node cli/src/index.js build`) enforces these rules:

### 4.1 Hard Errors (Build Fails)

| Rule | Code Location |
|------|---------------|
| Missing `name` in frontmatter | `build.js:71-73` |
| Missing `metadata.languages` in DOC.md | `build.js:120-123` |
| Missing `metadata.versions` in DOC.md | `build.js:124-127` |
| Duplicate skill `name` within same author | `build.js:96-98` |
| Duplicate doc ID across all authors | `build.js:253-257` |
| Duplicate skill ID across all authors | `build.js:259-264` |
| Invalid `registry.json` in author directory | `build.js:238-239` |

### 4.2 Soft Warnings (Build Continues)

| Rule | Default Behavior |
|------|------------------|
| Missing `description` | Warning printed |
| Missing `metadata.source` | Defaults to `community` |

### 4.3 Not Validated

The following fields are **not validated** at build time:

- `metadata.revision` format or monotonicity
- `metadata.updated-on` date format
- `metadata.tags` format or values
- `metadata.languages` against a whitelist
- `metadata.versions` semver format
- Markdown body content structure

---

## 5. Content Writing Standards

Content is markdown written for LLM consumption. Follow these patterns:

### 5.1 Recommended Structure

```markdown
---
name: example-api
description: "Example API documentation"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: maintainer
  tags: "example,api"
---

You are an expert in Example API. Help developers integrate Example API effectively.

## Golden Rule

{Most important guidance in 1-2 sentences}

## Installation

```python
pip install example-sdk
```

## Quick Start

```python
from example import Client

client = Client(api_key="...")
result = client.do_something()
```

## Common Patterns

### Correct: {Pattern Name}

```python
# Good example
```

### Incorrect: {Anti-pattern}

```python
# Bad example - explain why
```

## Reference

- [Advanced usage](references/advanced.md)
- [Error handling](references/errors.md)
```

### 5.2 Writing Principles

1. **System prompt style**: Start with "You are an expert in..." to set LLM context
2. **Golden Rule**: Lead with the most important guidance
3. **Code first**: Working examples before prose explanations
4. **Correct/Incorrect patterns**: Show both good and bad examples explicitly
5. **Reference links**: Link to `references/*.md` for deep-dive topics

---

## 6. Validation Checklist

Before submitting new content, verify:

- [ ] Directory follows `author/docs/entry/` or `author/skills/entry/` pattern
- [ ] Entry file is named `DOC.md` or `SKILL.md` (case-sensitive)
- [ ] Frontmatter has required `name` field
- [ ] DOC.md has `metadata.languages` and `metadata.versions`
- [ ] Multi-language variants share the same `name`
- [ ] Multi-version variants share the same `name`
- [ ] No duplicate entry names within author (for skills)
- [ ] Run validation: `chub build content/ --validate-only`

---

## 7. Examples

### Minimal Valid DOC.md

```yaml
---
name: my-api
description: "My API documentation"
metadata:
  languages: "python"
  versions: "1.0.0"
---

# My API

You are an expert in My API...

{content}
```

### Minimal Valid SKILL.md

```yaml
---
name: deploy
description: "Deployment skill"
---

# Deploy Skill

You are an expert in deployment...

{content}
```

### Multi-language Entry

```
content/
└── openai/
    └── docs/
        └── chat/
            ├── python/
            │   └── DOC.md    # name: chat, languages: python
            ├── javascript/
            │   └── DOC.md    # name: chat, languages: javascript
            └── go/
                └── DOC.md    # name: chat, languages: go
```
