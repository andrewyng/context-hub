# Lark Content in This Fork

This fork adds a self-updating Lark content pipeline on top of the original Context Hub repository.

## What It Uses

- Upstream source: `https://lf3-static.bytednsdoc.com/obj/eden-cn/oaleh7nupthpqbe/larkopenapidoc.json`
- Format: a large JSON export with `data[]` records
- Each record already includes:
  - a directory taxonomy
  - a source URL
  - rendered page content
  - an upstream update timestamp

This means we do not store the raw 32 MB JSON in Context Hub. Instead, we convert it into multiple Context Hub entries under `content/lark/`.

## How It Is Mapped

The generator currently selects a curated set of high-value Lark sections and maps them to stable Context Hub entries:

- `server-api-docs`
- `server-api-directory`
- `server-api-approval`
- `client-api-h5`
- `dev-guide-platform`
- `dev-guide-cards`
- `dev-guide-mcp`

Each entry gets:

- one `DOC.md` file with frontmatter and a compact overview
- many `references/*.md` files, one per upstream page

This keeps the entry point small enough for agent use while preserving deeper source material for on-demand loading.

## Local Regeneration

Install dependencies once:

```bash
npm install
```

Regenerate Lark content:

```bash
npm run update:lark-content
```

Validate the generated content:

```bash
node cli/bin/chub build content --validate-only
```

## Scheduled Updates

This fork also includes a GitHub Actions workflow that:

- runs on a weekly schedule
- can be started manually with `workflow_dispatch`
- fetches the upstream Lark JSON
- regenerates `content/lark/`
- validates the content tree
- commits the changes back to `main` when there is a real diff

If your fork protects `main`, adjust the workflow to push to a branch and open a pull request instead.

## Notes

- The generated content is deterministic so scheduled updates only commit when upstream content actually changes.
- The current mapping is intentionally curated, not exhaustive. Expanding the supported sections is a matter of adding new directory mappings in [cli/src/lib/lark-content.js](/Users/bytedance/Documents/Context-Hub/repo/cli/src/lib/lark-content.js).
