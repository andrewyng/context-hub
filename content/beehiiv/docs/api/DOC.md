---
name: api
description: "beehiiv newsletter platform REST API v2 — subscriptions, tags, custom fields, automations, posts, publications"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-07-19"
  source: community
  tags: "beehiiv,newsletter,email,subscriptions,api,rest"
---
# beehiiv API v2

REST API for the beehiiv newsletter platform. Manage subscriptions, tags, custom fields, automations, and posts programmatically. There is no official SDK — call the REST API directly.

Base URL: `https://api.beehiiv.com/v2`

## Authentication

Bearer token in the `Authorization` header. Create API keys in the beehiiv dashboard under Settings → API. Nearly every endpoint is scoped to a publication via a path parameter — the publication ID is prefixed `pub_` (find it in the dashboard or via `GET /publications`).

```javascript
const BEEHIIV_API = "https://api.beehiiv.com/v2";
const headers = {
  Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
  "Content-Type": "application/json",
};
```

OAuth2 (authorization-code flow) is also available for multi-account integrations; endpoints then enforce per-scope permissions like `subscriptions:write` and `posts:read`. For single-publication automation, a plain API key is the common path.

## Create a subscription (the most common call)

`POST /publications/{publicationId}/subscriptions`

```javascript
const res = await fetch(`${BEEHIIV_API}/publications/pub_00000000-0000-0000-0000-000000000000/subscriptions`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    email: "reader@example.com",
    reactivate_existing: true,      // re-subscribe a previously unsubscribed email (only if knowingly resubscribing)
    send_welcome_email: false,      // default false — set true to trigger the welcome email
    utm_source: "website",
    utm_medium: "signup-form",
    utm_campaign: "spring-launch",
    referring_site: "https://example.com",
    custom_fields: [{ name: "Plan", value: "free" }],
  }),
});
const { data } = await res.json();  // data.id is the subscription ID (sub_...)
```

Key behaviors:

- **Creating a subscription for an email that already exists is not an error** — the existing subscription is returned. Safe to call idempotently from signup forms.
- **`custom_fields` must already exist on the publication.** Unknown field names are silently discarded, not created. Create them first via `POST /publications/{publicationId}/custom_fields` or in the dashboard.
- **`double_opt_override`** (`"on"` | `"off"` | `"not_set"`) overrides the publication's double-opt-in default for this one subscription.
- **`automation_ids`** enrolls the subscriber into automations on creation — but only automations that have an active *Add by API* trigger. Without that trigger, enrollment silently does nothing.
- Premium/paid assignment: `tier`, `premium_tiers` (names), `premium_tier_ids`, and `stripe_customer_id` link the subscription to paid tiers.

Response is `{ "data": { ...subscription } }` — the object is wrapped in `data`, as with all v2 endpoints.

## Tag a subscription

`POST /publications/{publicationId}/subscriptions/{subscriptionId}/tags`

```javascript
await fetch(`${BEEHIIV_API}/publications/${pubId}/subscriptions/${subId}/tags`, {
  method: "POST",
  headers,
  body: JSON.stringify({ tags: ["customer", "beta"] }),
});
```

Tags that don't exist on the publication are **created automatically** (opposite behavior from custom fields). Tags accumulate on the subscriber profile; re-applying the same tag set is harmless, so tag application is safe to retry.

## Look up subscriptions

- `GET /publications/{publicationId}/subscriptions/by_email/{email}` — fetch by email.
- `GET /publications/{publicationId}/subscriptions/{subscriptionId}` — fetch by `sub_` ID.
- `GET /publications/{publicationId}/subscriptions` — list, with filters and pagination.

Add `expand[]=custom_fields` (and other expand values) to include nested data that is omitted by default.

## Pagination

Two schemes exist; **cursor-based is current, offset-based (`page`/`per_page`) is deprecated** — don't write new code against offsets.

```
GET /publications/{pubId}/subscriptions?limit=100
GET /publications/{pubId}/subscriptions?limit=100&cursor={next_cursor}
```

- `limit`: 1–100, default 10.
- Response envelope: `{ "data": [...], "pagination": { "limit", "has_more", "next_cursor" } }`.
- Loop while `has_more` is true, passing `next_cursor` back as `cursor`.

## Rate limiting

**180 requests per minute per organization.** Exceeding it returns `429`. Every response carries `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` (epoch seconds) headers — throttle proactively (~3 req/s sustained) and use exponential backoff on 429s. Bulk endpoints (`POST /publications/{pubId}/subscriptions/bulk`, bulk status updates) exist for large imports; prefer them over looping single creates.

## Posts

- `GET /publications/{publicationId}/posts` — list posts (filter by `status`, `audience`, etc.).
- `GET /publications/{publicationId}/posts/{postId}` — single post; `expand[]=stats` for performance data, `expand[]=free_web_content` / `premium_web_content` for rendered HTML.
- `GET /publications/{publicationId}/posts/aggregate_stats` — aggregate stats across posts.
- **`POST /publications/{publicationId}/posts` (Create post) exists but is beta and Enterprise-plan only.** On standard plans, posts cannot be created or published via the REST API — draft creation is available through beehiiv's hosted MCP server (paid plans), and publishing/scheduling always happens in the beehiiv app.

See [references/posts.md](references/posts.md) for the Create Post endpoint's content model (blocks vs raw HTML) and its HTML sanitization rules.

## Webhooks

Configure per-publication webhooks in the dashboard or via `POST /publications/{publicationId}/webhooks`. Event types cover subscription lifecycle (`subscription.created`, `.confirmed`, `.deleted`, `.upgraded`, `.downgraded`, `.paused`, `.resumed`, tier events), post lifecycle (`post.sent`, `post.updated`, `post.scheduled`), newsletter-list subscription events, and `survey.response_submitted`.

## Error handling

Standard HTTP status codes: `400` (validation), `401` (bad/missing key), `404` (wrong publication/resource ID — also returned when the API key doesn't own the publication), `429` (rate limit), `500`. Error bodies are JSON. Treat newsletter side-effects as best-effort in critical flows (e.g., a checkout webhook that also subscribes the buyer): log and continue on beehiiv errors rather than failing the parent operation.

## Gotchas summary

1. `custom_fields` on subscription-create must pre-exist; unknown names are silently dropped. Tags, by contrast, auto-create.
2. All responses wrap payloads in `data`; lists add a `pagination` object.
3. Offset pagination is deprecated — use `cursor`/`limit`/`has_more`.
4. `automation_ids` enrollment requires the automation to have an active *Add by API* trigger.
5. Post creation via REST is Enterprise-beta only; standard plans read posts but cannot create or publish them via API.
6. `send_welcome_email` defaults to false — forgetting it means silent no-welcome, setting it in transactional contexts means double-messaging if you have another onboarding automation.
7. Rate limit is per-organization (180/min), not per-key — parallel jobs share the same budget.
