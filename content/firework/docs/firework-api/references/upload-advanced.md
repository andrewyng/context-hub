# Upload Advanced Reference

Advanced details for video uploads. For the common cases, see the main `DOC.md`.

## Multipart Upload (Files >100MB)

Use when files exceed ~100MB. Supports parallel uploads and is resumable.

**Constraints:**
- 1–100 parts total
- Every part except the last must be ≥5 MB
- S3 silently rejects parts smaller than 5MB — no error is returned from Firework

### Step 1: Initiate Multipart Upload

```bash
curl -X POST https://api.firework.com/api/v1/upload_multipart/signatures \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "CHANNEL_ID",
    "part_count": 3
  }'
```

**Response:**
```json
{
  "upload_id": "multipart-upload-id",
  "s3_video_key": "uploads/abc/video.mp4",
  "parts": [
    { "part_number": 1, "upload_url": "https://s3.amazonaws.com/...?partNumber=1&uploadId=..." },
    { "part_number": 2, "upload_url": "https://s3.amazonaws.com/...?partNumber=2&uploadId=..." },
    { "part_number": 3, "upload_url": "https://s3.amazonaws.com/...?partNumber=3&uploadId=..." }
  ]
}
```

### Step 2: Upload Each Part to S3

Upload parts in any order (can be parallelized). Capture the `ETag` from each response header.

```bash
# Part 1 — do NOT include Authorization header
curl -X PUT "PART_1_UPLOAD_URL" \
  --data-binary @/tmp/video_part1.bin \
  -D - | grep -i etag
# Save: ETag: "abc123def456"

# Part 2
curl -X PUT "PART_2_UPLOAD_URL" \
  --data-binary @/tmp/video_part2.bin \
  -D - | grep -i etag
# Save: ETag: "789xyz..."

# Part 3 (can be <5MB since it's the last part)
curl -X PUT "PART_3_UPLOAD_URL" \
  --data-binary @/tmp/video_part3.bin \
  -D - | grep -i etag
```

### Step 3: Complete the Multipart Upload

```bash
curl -X POST https://api.firework.com/api/v1/upload_multipart/complete \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "upload_id": "multipart-upload-id",
    "s3_video_key": "uploads/abc/video.mp4",
    "parts": [
      { "part_number": 1, "etag": "abc123def456" },
      { "part_number": 2, "etag": "789xyz..." },
      { "part_number": 3, "etag": "..." }
    ]
  }'
```

Returns `204 No Content` on success.

### Step 4: Create the Video Record

```bash
curl -X POST https://api.firework.com/api/v1/videos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "CHANNEL_ID",
    "caption": "My Large Video",
    "s3_video_key": "uploads/abc/video.mp4"
  }'
```

## Async Import Webhooks

Instead of polling `GET /api/v1/videos/imports/{id}`, configure webhooks to receive push notifications.

| Event | Trigger |
|---|---|
| `video_created` | Async import completed successfully; `video_id` available |
| `video_updated` | Video metadata was updated |
| `video_import_failed` | Async import failed; includes error details |

Webhook configuration is managed through the Firework business dashboard or by contacting Firework's Integration Solutions team.

## Product Identifier Resolution Order

When passing `product_ids` to video create/update or to the products API path parameter, Firework resolves identifiers in this priority order:

1. Firework product ID (encoded ID like `GeEk8y`)
2. External product ID (your system's product identifier)
3. External product unit ID (your system's variant/SKU identifier)
4. GTIN (Global Trade Item Number)
5. SKU (Stock Keeping Unit)
6. MPN (Manufacturer Part Number)

The system deduplicates entries automatically. Identifiers that cannot be resolved to a known product are silently skipped — no error is returned for unresolvable IDs.

## Full Video Constraints

| Constraint | Value |
|---|---|
| Minimum file size | 25 KB |
| Maximum file size | 5 GB |
| Minimum duration | 3 seconds |
| Maximum duration | 1 hour |
| Accepted formats | MP4, MOV (QuickTime) |
| Rate limit | 20 videos per 5 minutes per channel |
| Multipart part count | 1–100 parts |
| Multipart part size | ≥5 MB per part (except the final part) |
