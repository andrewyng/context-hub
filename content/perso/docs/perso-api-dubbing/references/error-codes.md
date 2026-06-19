# Perso API Error Codes

## File API Errors

| HTTP | Code | Status | Description |
|:----:|------|--------|-------------|
| 400 | F4003 | MISSING_REQUEST_PART | Required parameter missing |
| 400 | F4004 | FILE_SIZE_LIMIT_EXCEEDED | File exceeds 2GB limit |
| 400 | F4006 | NOT_VALID_EXTERNAL_LINK | Unsupported external URL |
| 400 | F4007 | INVALID_VIDEO_TYPE | Unsupported video/audio format |
| 400 | F4008 | VIDEO_DURATION_LIMIT_EXCEEDED | Duration exceeds plan limit |
| 400 | F4009 | VIDEO_DURATION_TOO_SHORT | Duration under 5 seconds |
| 400 | F40010 | VIDEO_RESOLUTION_LIMIT_EXCEEDED | Resolution exceeds 7999×7999 |
| 400 | F40011 | VIDEO_RESOLUTION_TOO_LOW | Resolution under 201×201 |
| 400 | F40012 | EXTERNAL_VIDEO_REGION_UNAVAILABLE | Region-restricted video |
| 400 | F40013 | EXTERNAL_VIDEO_LIVE_STREAM_OFFLINE | Live stream not supported |
| 400 | F40014 | EXTERNAL_VIDEO_MEMBERS_ONLY | Membership-only content |
| 400 | F40015 | EXTERNAL_VIDEO_PAYMENT_REQUIRED | Paid content |
| 400 | F40016 | INVALID_YOUTUBE_URL | Malformed YouTube URL |
| 400 | F40017 | INVALID_MEDIA_URL | Malformed media URL |
| 400 | F40018 | INVALID_MEDIA_DATA | Corrupted or unreadable media |
| 400 | F4019 | NO_AUDIO_CHANNEL | Media has no audio track |
| 401 | F4001 | UNAUTHORIZED | Invalid or missing API key |
| 403 | F4005 | FILE_PLAN_USAGE_LIMIT_EXCEEDED | Plan quota exceeded |
| 403 | F4031 | UNACCESSIBLE_GOOGLE_DRIVE_LINK | Google Drive sharing not enabled |
| 403 | F4032 | GEO_RESTRICTED_YOUTUBE_VIDEO | Geo-restricted YouTube video |
| 403 | F4033 | AGE_RESTRICTED_YOUTUBE_VIDEO | Age-restricted YouTube video |
| 403 | F4035 | UNACCESSIBLE_EXTERNAL_MEDIA_LINK | External media access denied |
| 404 | F4040 | JOB_NOT_FOUND | Processing job not found |
| 422 | F4220 | VALIDATION_FAILED | Media validation failed |
| 500 | F5001 | INTERNAL_SERVER_ERROR | Server error |
| 500 | F5002 | DURATION_LIMIT_EXCEEDED | Credit exhaustion duration limit |

## Video Translator API Errors

| HTTP | Code | Status | Description |
|:----:|------|--------|-------------|
| 400 | VT4004 | BAD_REQUEST | Cancellation not allowed |
| 402 | VT4021 | PAYMENT_REQUIRED | Insufficient credits |
| 403 | VT4031 | FORBIDDEN | Access denied to project |
| 403 | VT4033 | FORBIDDEN | No access to the space |
| 404 | VT4041 | NOT_FOUND | Project not found |
| 404 | VT4042 | NOT_FOUND | Video not found |
| 404 | VT4043 | NOT_FOUND | Source language not found |
| 404 | VT4044 | NOT_FOUND | Target language not found |
| 404 | VT4045 | NOT_FOUND | Project deleted |
| 404 | VT4046 | NOT_FOUND | Project space not found |
| 409 | VT4091 | CONFLICT | Video generation failed |
| 503 | VT5034 | SERVICE_UNAVAILABLE | Translation queue full |

## Portal API Errors

| HTTP | Code | Status | Description |
|:----:|------|--------|-------------|
| 401 | PT0027 | UNAUTHORIZED | Not an approved space member |
| 404 | PT0026 | NOT_FOUND | Space subscription info not found |
