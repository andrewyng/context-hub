# beehiiv Create Post endpoint (beta, Enterprise-only)

`POST https://api.beehiiv.com/v2/publications/{publicationId}/posts`

Beta: the API is subject to change and is available only to Enterprise-plan organizations. On other plans this endpoint is unavailable — post drafts can be created through beehiiv's hosted MCP server (paid plans), and publishing/scheduling is always a manual action in the beehiiv app.

## Content methods

Provide exactly one of `blocks` or `body_content` (not both):

1. **`blocks`** — structured content blocks (paragraph, heading, image, button, table, html, …). Each block has a `type` plus type-specific properties. Supports visual settings, visibility settings, and dynamic content targeting.
2. **`body_content`** — one raw HTML string; internally wrapped in an `htmlSnippet` block. Useful for pre-built HTML or platform migrations.
3. **Hybrid** — `type: "html"` blocks inside the `blocks` array mix raw HTML snippets with structured blocks.

## HTML sanitization rules

All HTML passes through a sanitization pipeline before rendering:

- `<style>` tags are **removed** — embedded stylesheets never survive.
- `<link>` tags are **removed** — no external stylesheets.
- **Inline `style` attributes are preserved** — the only reliable styling mechanism.
- CSS classes are kept in markup but have no effect (no stylesheet is loaded for them).
- Content renders inside beehiiv's email table wrapper, which imposes its own layout and spacing.

Practical rule: style every element inline; assume your HTML is a fragment inside beehiiv's template, not a full document.

## Related endpoints

- `POST /publications/{publicationId}/posts/{postId}/test_send` — send a test email of a post.
- `GET /publications/{publicationId}/posts/{postId}/preview` — generate a shareable preview URL.
- `GET /publications/{publicationId}/post_templates` — list post templates.
- `PATCH`/`DELETE` on `/posts/{postId}` — update or delete (same Enterprise-beta gate as create).

Full walkthrough: beehiiv's "Using the Send API and Create Post Endpoint" support article.
