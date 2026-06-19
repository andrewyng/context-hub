---
name: firework-api
description: "Firework platform API for video upload/management, livestream product control, and product-video associations via OAuth 2.0"
metadata:
  languages: "http"
  versions: "1"
  revision: 2
  updated-on: "2026-04-08"
  source: community
  tags: "firework,video,livestream,product,oauth,upload"
---

# Firework Platform API

You are a Firework platform API integration expert. Help with writing integrations using the Firework REST API for video management, livestream commerce, and product discovery.

Official SDK documentation: https://docs.firework.com/firework-for-developers

## Golden Rule: Base URL and Authentication

Always use `https://api.firework.com` as the base URL. Every request requires an OAuth 2.0 Bearer token.

- **Auth method:** OAuth 2.0 Client Credentials (server-to-server only — no browser/user flows)
- **Header:** `Authorization: Bearer {ACCESS_TOKEN}` on every request
- **App registration:** OAuth apps and scope assignments are provisioned manually by Firework's Integration Solutions team

**Required scopes by operation:**

| Scope | Grants |
|---|---|
| `channels:read` | List channels belonging to a business |
| `videos:write` | Upload, create, update videos (includes read access) |
| `videos:read` | Read video details |
| `products:read` | List product-associated videos |
| `livestreams:read` | Get livestream details |
| `livestreams:write` | Pin/unpin products, end streams (includes read access) |


## Authentication

Tokens expire after **3600 seconds**. There is no refresh token — re-request proactively before expiry.

```bash
# Obtain an access token
curl -X POST https://api.firework.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&scope=videos:write"
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "expires_in": 3600
}
```

```bash
# Use the token in all subsequent requests
curl https://api.firework.com/api/v1/videos/VIDEO_ID \
  -H "Authorization: Bearer eyJ..."
```

## Channels

A **channel** is the primary content container in Firework — it has its own video library and branding. A business can own multiple channels. The `channel_id` is required when creating videos and querying product-associated videos.

### Paginate Channels

Use this endpoint to discover the `channel_id` values for your business before making video or product API calls.

```bash
# scope: channels:read
curl "https://api.firework.com/api/v1/channels?business_id=BUSINESS_ID" \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "channels": [
    {
      "id": "z1xg8N",
      "name": "My Brand Channel",
      "username": "mybrand",
      "avatar_url": "https://cdn.example.com/avatar.jpg",
      "bio": "Official channel for My Brand",
      "business_id": "BUSINESS_ID",
      "country": "US",
      "locale": "en"
    }
  ],
  "paging": { "next": null }
}
```

**Query parameters:**

| Parameter | Required | Default | Notes |
|---|---|---|---|
| `business_id` | Yes | — | Encoded business identifier |
| `before_id` | No | — | Cursor: return entries older than this channel ID |
| `since_id` | No | — | Cursor: return entries newer than this channel ID |
| `page_size` | No | 10 | Max 100 |

The `id` field from each channel object is the `channel_id` used in all video and product API calls.

## Videos

### Choose Your Upload Method

```
Have a publicly accessible URL?  →  URL Import       (simplest — 1 request)
File ≤100MB?                     →  Single-file upload (3 steps)
File >100MB?                     →  Multipart upload   (4 steps, see references/upload-advanced.md)
```

### URL Import

The simplest path. Firework fetches the video from the URL.

```bash
# Synchronous — returns the video object immediately (201 Created)
curl -X POST https://api.firework.com/api/v1/videos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "CHANNEL_ID",
    "caption": "My Video",
    "source_url": "https://example.com/video.mp4"
  }'
```

```bash
# Asynchronous — use when the URL may be slow or the file is large
# Returns 202 Accepted with an import_id (NOT a video_id — see Common Mistakes #1)
curl -X POST https://api.firework.com/api/v1/videos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "CHANNEL_ID",
    "caption": "My Video",
    "source_url": "https://example.com/video.mp4",
    "async": true
  }'
```

**Async response (202):**
```json
{ "import_id": "abc123" }
```

**Poll for completion** (scope: `videos:read`):
```bash
curl https://api.firework.com/api/v1/videos/imports/IMPORT_ID \
  -H "Authorization: Bearer TOKEN"
```
```json
{
  "id": "abc123",
  "status": "completed",
  "video_id": "vid_xyz"
}
```
`status` values: `running` | `completed` | `errored`

### Single-File Upload (≤100MB)

Three steps: get a pre-signed S3 URL → upload to S3 → create the video record.

```bash
# Step 1: Get pre-signed S3 credentials (scope: videos:write)
curl -X POST https://api.firework.com/api/v1/upload_signatures \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel_id": "CHANNEL_ID"}'
```
```json
{
  "upload_url": "https://s3.amazonaws.com/...",
  "s3_video_key": "uploads/abc/video.mp4"
}
```

```bash
# Step 2: Upload file directly to S3 — do NOT include Authorization header
curl -X PUT "UPLOAD_URL_FROM_STEP_1" \
  -H "Content-Type: video/mp4" \
  --data-binary @/path/to/video.mp4
```

```bash
# Step 3: Create the video record using the S3 key
curl -X POST https://api.firework.com/api/v1/videos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "CHANNEL_ID",
    "caption": "My Video",
    "s3_video_key": "uploads/abc/video.mp4"
  }'
```

**File constraints:** 25 KB – 5 GB · 3 seconds – 1 hour duration · MP4 or MOV/QuickTime
**Rate limit:** 20 videos per 5 minutes per channel

### Create Video — Key Parameters

Required: `channel_id`, `caption`

| Parameter | Type | Description |
|---|---|---|
| `caption` | string | Video title |
| `description` | string | Video description |
| `hashtags` | string[] | Hashtag array |
| `access` | string | `"public"` (default) or `"private"` |
| `audio_disabled` | boolean | Mute audio track |
| `product_ids` | string[] | Associate products (see Product IDs below) |
| `custom_fields` | object | Key-value metadata |
| `poster_url` | string | Custom thumbnail URL |
| `source_url` | string | URL to import from |
| `s3_video_key` | string | Key from upload signature step |
| `async` | boolean | Use async import (returns 202 + `import_id`) |

**Product ID types** — `product_ids` accepts any of these, resolved in order:
Firework product ID → external product ID → external unit ID → GTIN → SKU → MPN

Duplicates are automatically removed. Unresolvable IDs are silently skipped.

### Get Video

```bash
# scope: videos:read
curl https://api.firework.com/api/v1/videos/VIDEO_ID \
  -H "Authorization: Bearer TOKEN"
```

**Response fields:** `id`, `caption`, `description`, `hashtags`, `access`, `audio_disabled`, `archived_at`, `product_ids`, `custom_fields`, `hidden`

### Update Video

```bash
# scope: videos:write — partial update, only send fields to change
curl -X PATCH https://api.firework.com/api/v1/videos/VIDEO_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Updated Title",
    "product_ids": ["prod_abc", "prod_def"]
  }'
```

**`product_ids` replaces all existing associations — it does not append.** To clear all product tags, send `"product_ids": []`.

## Livestreams

### Livestream Status Lifecycle

```
idle → active ↔ paused → replay → completed
                                 ↘ expired (if stream never started)
```

Pin/unpin operations are only available in `active` or `paused` states.

### Get Livestream Details

> ⚠️ Legacy endpoint — a replacement is planned but not yet available.

```bash
# scope: livestreams:read
curl https://api.firework.com/api/v1/live_streams/STREAM_ID/detail \
  -H "Authorization: Bearer TOKEN"
```

```json
{
  "status": "active",
  "event_name": "Product Launch",
  "event_description": "Join us live!",
  "scheduled_at": "2026-04-07T10:00:00.000000Z",
  "products": [
    {
      "id": "GeEk8y",
      "product_name": "Wireless Headphones",
      "product_currency": "USD",
      "product_images": [{ "id": "img1", "image_src": "https://...", "image_position": 1 }],
      "product_units": [{ "id": "unit1", "unit_name": "Black / Standard", "unit_price": 149.99, "unit_price_string": "$149.99", "unit_ext_id": "sku-abc" }]
    }
  ]
}
```

### Pin Products

Highlighted products appear to all viewers immediately (no delay).

```bash
# scope: livestreams:write — max 3 product IDs per request
# Accepts Firework product IDs or product unit IDs (variant/SKU level)
curl -X POST https://api.firework.com/api/v1/live_streams/STREAM_ID/pin_product \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_ids": ["GeEk8y", "ABC123"]}'
```

```json
{ "pinned_product_ids": ["GeEk8y", "ABC123"] }
```

Returns `422` if the livestream is not in `active` or `paused` status.

### Unpin Products

```bash
# scope: livestreams:write
curl -X POST https://api.firework.com/api/v1/live_streams/STREAM_ID/unpin_product \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_ids": ["GeEk8y"]}'
```

```json
{ "unpinned_product_ids": ["GeEk8y"] }
```

### End Livestream

**This action is irreversible.** The stream transitions to `replay` status and cannot return to `active`.

```bash
# scope: livestreams:write — no request body required
curl -X PATCH https://api.firework.com/api/v1/live_streams/STREAM_ID/end \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

```json
{ "live_stream_id": "STREAM_ID", "status": "ended" }
```

## Products

### Paginate Videos by Product

```bash
# scope: products:read
curl "https://api.firework.com/api/v1/products/PRODUCT_ID/videos?channel_id=CHANNEL_ID" \
  -H "Authorization: Bearer TOKEN"
```

`PRODUCT_ID` accepts: Firework product ID, external product ID, external unit ID, GTIN, SKU, or MPN (resolved in that order).

**Query parameters:**

| Parameter | Required | Default | Notes |
|---|---|---|---|
| `channel_id` | Yes | — | Firework encoded channel ID |
| `business_store_id` | No | First store | Scope lookup to a specific store |
| `before_id` | No | — | Cursor: return entries older than this video ID |
| `since_id` | No | — | Cursor: return entries newer than this video ID |
| `page_size` | No | 10 | Max 100 |

```bash
# Paginated example
curl "https://api.firework.com/api/v1/products/PRODUCT_ID/videos?channel_id=CHANNEL_ID&before_id=LAST_VIDEO_ID&page_size=20" \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "videos": [
    {
      "id": "vid_abc",
      "caption": "Product Demo",
      "description": "Watch the demo",
      "hashtags": ["demo"],
      "access": "public",
      "audio_disabled": false,
      "archived_at": null,
      "product_ids": ["GeEk8y"],
      "custom_fields": {},
      "hidden": false
    }
  ],
  "paging": { "next": "https://api.firework.com/...?before_id=vid_abc" }
}
```

`paging.next` is `null` when no more results exist.

## Error Handling

All error responses use the format: `{"error": "message"}`

| Code | Meaning | Common Cause |
|---|---|---|
| 201 | Created | Sync video creation succeeded |
| 202 | Accepted | Async import initiated — use `import_id` to track |
| 204 | No Content | Multipart completion succeeded |
| 400 | Bad Request | Missing required field, constraint violation (file too small/large, empty array) |
| 401 | Unauthorized | Missing or expired token |
| 403 | Forbidden | Token lacks required scope (`insufficient_scope`) |
| 404 | Not Found | Invalid ID for video, livestream, import, or product |
| 422 | Unprocessable | Livestream is not in a valid state for the operation |
| 429 | Too Many Requests | Rate limit exceeded (20 videos/5 min/channel) |

## Common Mistakes

1. **Async import returns `import_id`, not `video_id`** — `202 Accepted` gives `{"import_id":"..."}`. Poll `GET /api/v1/videos/imports/{import_id}` to get the `video_id` once status is `completed`.

2. **`PATCH product_ids` replaces, not appends** — sending `product_ids` in an update overwrites all existing product associations. Fetch first if you need to preserve existing tags.

3. **Multipart parts must be ≥5MB (except the final part)** — S3 will reject smaller intermediate parts. See `references/upload-advanced.md` for the full multipart walkthrough.

4. **Pin/unpin requires `active` or `paused` stream** — attempting to pin on an `idle`, `replay`, or `completed` stream returns `422`.

5. **Ending a livestream is irreversible** — `PATCH .../end` transitions the stream to `replay` permanently.

6. **Token expires in 1 hour with no refresh token** — cache the token and re-request before expiry. Re-request using the same client credentials flow.

## Useful Links

- Authentication: https://docs.firework.com/firework-for-developers/api/authentication
- Videos API: https://docs.firework.com/firework-for-developers/api/videos
- Livestreams API: https://docs.firework.com/firework-for-developers/api/livestreams
- Channel API: https://docs.firework.com/firework-for-developers/api/channel
- Products API: https://docs.firework.com/firework-for-developers/api/products
