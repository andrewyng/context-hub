---
name: graph-api
description: "Meta Graph API for Instagram Business/Creator account and Facebook Page insights, media, and engagement metrics — token setup, the two families of insight metrics, and the token-type mismatches that cause most errors"
metadata:
  languages: "python"
  versions: "v21.0"
  source: community
  tags: "meta,facebook,instagram,graph-api,insights,social,analytics"
  updated-on: "2026-08-08"
---

# Meta Graph API Coding Guidelines (Python) — Instagram/Facebook Insights

You are a Meta Graph API expert. Help me write code that pulls Instagram Business/Creator
account and Facebook Page insights (reach, engagement, per-post metrics) via the Graph API.

Official docs: https://developers.facebook.com/docs/graph-api and
https://developers.facebook.com/docs/instagram-api/guides/insights

## Golden Rule: There Is No Official Python SDK For This

Meta does not ship a maintained first-party Python SDK for the Graph API. Use plain HTTP
calls with `requests` against `https://graph.facebook.com/{version}/...` — do not invent or
assume a package like `facebook-sdk` is current; it is community-maintained and frequently
lags the API. Pin the API version explicitly in every URL (e.g. `v21.0`); check
https://developers.facebook.com/docs/graph-api/changelog for the current version before
starting new work, since Meta deprecates old versions on a rolling schedule and this doc's
pinned version will go stale.

```python
import requests

BASE = "https://graph.facebook.com/v21.0"
```

## Critical: Two Different "Instagram API" Flows — Do Not Mix Them

Meta has **two separate auth/token systems** for Instagram, and mixing them up is the single
most common source of confusing errors. Before writing any code, confirm which one applies:

1. **Facebook Login for Business (classic, Page-linked)** — the Instagram Business/Creator
   account is linked to a Facebook Page, and you authenticate as a Facebook user with
   Page-related permissions. Tokens are prefixed `EAA...`. This is what "Get User Access
   Token" in Graph API Explorer produces. **This flow is what the rest of this doc covers.**
2. **Instagram API with Instagram Login** — a newer flow where the user logs in directly
   with Instagram credentials (no Page required). Tokens have a different format and are
   exchanged via `graph.instagram.com`'s `ig_exchange_token` grant, not
   `graph.facebook.com`'s `fb_exchange_token`. Requires the separate "Instagram Business
   Login" product to be configured in the Meta App.

Symptom of mixing them up: `"Cannot parse access token"` (error code 190) — this is much
more often a **token-type mismatch** than an expired token. Check the token's prefix
(`EAA...` = classic flow) before assuming expiry.

## Auth Setup (Classic / Page-Linked Flow)

1. **Get a short-lived User Access Token** via Graph API Explorer (developers.facebook.com
   → your app → Graph API Explorer → "User or Page" dropdown → **"Get User Access Token"**,
   not the native blue "Generate Instagram Access Token" button — that button triggers the
   Instagram Login flow described above, which requires additional product setup.

   Required permissions: `pages_show_list`, `pages_read_engagement`, `instagram_basic`,
   `instagram_manage_insights`, `read_insights`, `business_management`.

2. **Exchange for a long-lived token** (~60 days):

   ```python
   resp = requests.get(f"{BASE}/oauth/access_token", params={
       "grant_type": "fb_exchange_token",
       "client_id": APP_ID,
       "client_secret": APP_SECRET,
       "fb_exchange_token": short_lived_token,
   })
   long_lived_token = resp.json()["access_token"]
   ```

   Use `graph.facebook.com`'s `fb_exchange_token` grant — not `graph.instagram.com`'s
   `ig_exchange_token`, which only accepts tokens issued by the Instagram Login flow.

3. **List Pages the user manages** (also returns a Page Access Token per Page, which
   inherits the long-lived token's ~60-day validity):

   ```python
   resp = requests.get(f"{BASE}/me/accounts", params={"access_token": long_lived_token})
   pages = resp.json()["data"]
   ```

   If this returns an empty `data: []`, the token was generated without
   `pages_show_list` in the permission set — regenerate the token with that scope included,
   don't try to add scopes after the fact.

4. **Get the linked Instagram Business Account ID** from the Page:

   ```python
   resp = requests.get(f"{BASE}/{page_id}", params={
       "fields": "instagram_business_account",
       "access_token": page_token,
   })
   ig_id = resp.json()["instagram_business_account"]["id"]
   ```

   The response also contains a top-level `id` field — that's just the Page ID again, not
   the IG account ID. Grab the nested `instagram_business_account.id`, not the top-level one.

5. **For production**, upgrade from a Page Access Token (derived from a user's long-lived
   token, ~60-day expiry) to a **System User token** (Business Settings → Users → System
   Users), which does not expire on the same cycle. Don't build a scheduled/automated report
   on a user-derived token — it will silently start failing every ~60 days.

## Fetching Insights

All insights calls go through `graph.facebook.com` (not `graph.instagram.com`) for this
token type.

### Account-level insights — two metric families, do not mix them in one call

Metrics split into two families as of the current API version, and mixing them in a single
request throws `(#100) Invalid parameter`:

- **Time-series metrics** (e.g. `reach`, `follower_count`) take `period=day`:

  ```python
  resp = requests.get(f"{BASE}/{ig_id}/insights", params={
      "metric": "reach,follower_count",
      "period": "day",
      "access_token": page_token,
  })
  ```

- **Total-value metrics** (e.g. `views`) require `metric_type=total_value` instead of
  `period`:

  ```python
  resp = requests.get(f"{BASE}/{ig_id}/insights", params={
      "metric": "views",
      "metric_type": "total_value",
      "access_token": page_token,
  })
  ```

`impressions` is deprecated — use `views` instead.

Full valid account-level metric list (confirmed via the API's own validation error, which is
the most reliable way to check since docs lag): `reach`, `follower_count`, `website_clicks`,
`profile_views`, `online_followers`, `accounts_engaged`, `total_interactions`, `likes`,
`comments`, `shares`, `saves`, `replies`, `engaged_audience_demographics`,
`reached_audience_demographics`, `follower_demographics`, `follows_and_unfollows`,
`profile_links_taps`, `views`, `content_views` (plus several `threads_*` metrics for
Threads-specific data).

### Media list and per-post insights

```python
resp = requests.get(f"{BASE}/{ig_id}/media", params={
    "fields": "id,caption,timestamp",
    "access_token": page_token,
})
media_items = resp.json()["data"]
```

Per-post insights — unlike account-level, all of these metrics work together in a single
call with **no `metric_type=total_value` split needed**:

```python
resp = requests.get(f"{BASE}/{media_id}/insights", params={
    "metric": "reach,likes,comments,shares,saved,views",
    "access_token": page_token,
})
```

This is the reliable pattern for building per-post/content-performance reports — pull the
media list, then loop per-`media_id` with this single combined-metric call.

## Common Errors

- **`(#190) Cannot parse access token`** — almost always a token-type mismatch (see the
  two-flows section above), not expiry. Check the token prefix first.
- **`(#100) Invalid parameter`** on an insights call — usually mixing time-series and
  total-value metrics in one request. Split them into two calls.
- **`"The access token does not belong to application X"` / `"Error validating client
  secret"`** — the App ID/Secret being used doesn't match the app that issued the token
  (e.g. copied from a different Meta App). Verify against the exact app shown in Graph API
  Explorer's app dropdown before re-checking credentials.
- **Empty `data: []` from `/me/accounts`** — the token was generated without
  `pages_show_list` scope. Regenerate; scopes can't be added to an existing token.

## Practical Notes

- Windows PowerShell's `Invoke-RestMethod -Body <hashtable> -Method Get` does not reliably
  serialize to query-string params — if scripting outside Python, build the full URL
  manually and percent-encode each value rather than relying on `-Body`.
- Always check the actual field name in the response before assuming shape — Graph API
  responses commonly include same-named fields at different nesting levels (see the
  `instagram_business_account.id` vs top-level `id` gotcha above).
