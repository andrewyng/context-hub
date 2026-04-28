---
name: perso-api-dubbing
description: "Perso AI video/audio dubbing and translation REST API — Python guide with requests"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-18"
  source: maintainer
  tags: "perso,dubbing,translation,video,audio,lip-sync,ai,python"
---

# Perso API — Python

```bash
pip install requests
```

## Configuration

```python
import requests
import time

API_BASE = "https://api.perso.ai"       # All API requests
SERVICE_DOMAIN = "https://perso.ai"      # File path access (e.g. /perso-storage/...)
HEADERS = {"XP-API-KEY": "pk-live-xxxxxxxxxxxxxxxx"}
```

- **API Base URL** (`https://api.perso.ai`): all API requests go here.
- **Service Domain** (`https://perso.ai`): used only for accessing file paths (e.g. `/perso-storage/...`).

## Authentication

All endpoints require an API key in the `XP-API-KEY` header. Keys are prefixed `pk-live-` (production) or `pk-test-` (sandbox).

## Common Response Format

```python
# Success
{"result": { ... }}

# Error
{"code": "VT4041", "status": "NOT_FOUND", "message": "Error description"}
```

## File Paths

Response fields like `videoFilePath`, `audioFilePath`, `thumbnailFilePath` are **relative paths**. Prepend the **Service Domain** (`https://perso.ai`), NOT the API Base URL:

```python
video_path = upload["videoFilePath"]  # e.g. "/perso-storage/.../video.mp4"
full_url = f"{SERVICE_DOMAIN}{video_path}"
# https://perso.ai/perso-storage/.../video.mp4
```

## Prerequisites — Resolve Your Space

The Perso API is **space-based**. Most endpoints require a `{spaceSeq}` path parameter. First retrieve your spaces and find your default space:

```python
spaces = requests.get(f"{API_BASE}/portal/api/v1/spaces", headers=HEADERS).json()
default_space = next(s for s in spaces["result"] if s["isDefaultSpaceOwned"])
space_seq = default_space["spaceSeq"]
```

Use `space_seq` for all subsequent requests that require `{spaceSeq}`.

---

## Core Workflow

### Option A — Direct file upload

```
1. GET  /file/api/upload/sas-token          → Get SAS token from File API
2. PUT  {blobSasUrl}                        → Client uploads file directly to Azure Blob Storage
3. PUT  /file/api/upload/video (or /audio)  → Register the uploaded blob URL with File API (returns mediaSeq)
4. PUT  /video-translator/.../queue         → Initialize queue (required once per space)
5. POST /video-translator/.../translate     → Request translation (returns projectSeq)
6. GET  /video-translator/.../progress      → Poll until progress reaches 100
7. GET  /video-translator/.../download      → Download translated video/audio/subtitles
```

**Step 1–2 detail:** The SAS token endpoint returns a `blobSasUrl` — a pre-signed Azure Blob Storage URL with write permission. The **client uploads the file directly** to Azure Blob Storage via a `PUT` request to this URL. The Perso API server is not involved in the actual file transfer. After upload, pass the blob URL (without query params) as `fileUrl` to the Upload Video/Audio endpoint.

### Option B — External platform upload

```
1. POST /file/api/v1/video-translator/external/metadata  → Preview video info (optional)
2. POST /file/api/v1/media/validate                      → Validate media constraints (optional)
3. PUT  /file/api/upload/video/external                   → Upload from YouTube/TikTok/Google Drive (returns mediaSeq)
4–7. Same as Option A steps 4–7
```

**Step 3 detail:** The server downloads the video from the external platform on your behalf. This is synchronous and may take **up to 10 minutes** depending on video size.

---

## Full Translation Workflow (Direct Upload)

```python
# 1. Get SAS token from File API
sas = requests.get(
    f"{API_BASE}/file/api/upload/sas-token",
    headers=HEADERS,
    params={"fileName": "video.mp4"}
).json()

# 2. Client uploads file directly to Azure Blob Storage
with open("video.mp4", "rb") as f:
    requests.put(
        sas["blobSasUrl"],
        data=f,
        headers={
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": "application/octet-stream"
        }
    )

# 3. Register uploaded video with File API (returns mediaSeq)
upload = requests.put(
    f"{API_BASE}/file/api/upload/video",
    headers=HEADERS,
    json={
        "spaceSeq": space_seq,
        "fileUrl": sas["blobSasUrl"].split("?")[0],
        "fileName": "video.mp4"
    }
).json()
media_seq = upload["seq"]

# 4. Initialize queue (required once per space)
requests.put(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/queue",
    headers=HEADERS
)

# 5. Request translation
result = requests.post(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/translate",
    headers=HEADERS,
    json={
        "mediaSeq": media_seq,
        "isVideoProject": True,
        "sourceLanguageCode": "en",
        "targetLanguageCodes": ["ko"],
        "numberOfSpeakers": 1,
        "preferredSpeedType": "GREEN"
    }
).json()
project_seq = result["result"]["startGenerateProjectIdList"][0]

# 6. Poll progress until complete
while True:
    progress = requests.get(
        f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/space/{space_seq}/progress",
        headers=HEADERS
    ).json()
    p = progress["result"]
    print(f"Progress: {p['progress']}% — {p['progressReason']}")
    if p["progress"] >= 100 or p["hasFailed"]:
        break
    time.sleep(10)

# 7. Download translated files
downloads = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/download",
    headers=HEADERS,
    params={"target": "all"}
).json()
print(downloads["result"])
```

---

## File API

### Get SAS Token

```python
sas = requests.get(
    f"{API_BASE}/file/api/upload/sas-token",
    headers=HEADERS,
    params={"fileName": "video.mp4"}
).json()
# {"blobSasUrl": "https://{account}.blob.core.windows.net/...?sv=...&sig=...", "expirationDatetime": "..."}
```

Token expires in 30 minutes. Upload your file to `blobSasUrl` via PUT before expiration.

### Upload Video

```python
upload = requests.put(
    f"{API_BASE}/file/api/upload/video",
    headers=HEADERS,
    json={"spaceSeq": space_seq, "fileUrl": blob_url, "fileName": "video.mp4"}
).json()
media_seq = upload["seq"]  # use as mediaSeq for translation
# Also returns: originalName, videoFilePath, thumbnailFilePath, size, durationMs
```

### Upload Audio

```python
upload = requests.put(
    f"{API_BASE}/file/api/upload/audio",
    headers=HEADERS,
    json={"spaceSeq": space_seq, "fileUrl": blob_url, "fileName": "audio.mp3"}
).json()
media_seq = upload["seq"]
```

### Upload External Video

Upload from YouTube, TikTok, or Google Drive. Synchronous — may take up to 10 minutes.

**IMPORTANT:** This endpoint uses **snake_case** request body.

```python
upload = requests.put(
    f"{API_BASE}/file/api/upload/video/external",
    headers=HEADERS,
    json={
        "space_seq": space_seq,
        "url": "https://www.youtube.com/watch?v=xxxxx",
        "lang": "en"
    }
).json()
media_seq = upload["seq"]
```

### Validate Media

Pre-validate media metadata before upload.

```python
validation = requests.post(
    f"{API_BASE}/file/api/v1/media/validate",
    headers=HEADERS,
    json={
        "spaceSeq": space_seq,
        "durationMs": 30000,
        "originalName": "video.mp4",
        "mediaType": "video",
        "extension": ".mp4",
        "size": 52428800,
        "width": 1920,
        "height": 1080
    }
).json()
# {"status": true} on success, error response on failure
```

**Constraints:**
| | Video | Audio |
|---|---|---|
| Extensions | .mp4, .webm, .mov | .mp3, .wav |
| Max size | 2GB | 2GB |
| Duration | 5s – plan limit | 5s – plan limit |
| Resolution | 201×201 – 7999×7999 | N/A |

### Get External Metadata

Preview external video info without downloading. Uses **snake_case** body.

```python
metadata = requests.post(
    f"{API_BASE}/file/api/v1/video-translator/external/metadata",
    headers=HEADERS,
    json={
        "space_seq": space_seq,
        "url": "https://www.youtube.com/watch?v=xxxxx",
        "lang": "en"
    }
).json()
# Returns: durationMs, originalName, thumbnailFilePath, mediaType, size, extension, width, height
```

---

## Space API

### List Spaces

```python
spaces = requests.get(f"{API_BASE}/portal/api/v1/spaces", headers=HEADERS).json()
```

### Get Space

```python
space = requests.get(f"{API_BASE}/portal/api/v1/spaces/{space_seq}", headers=HEADERS).json()
```

---

## Dubbing API (Translation)

### Initialize Queue (required before first translation)

```python
requests.put(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/queue",
    headers=HEADERS
)
```

### Request Translation

```python
result = requests.post(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/translate",
    headers=HEADERS,
    json={
        "mediaSeq": media_seq,
        "isVideoProject": True,
        "sourceLanguageCode": "en",
        "targetLanguageCodes": ["ko", "ja"],
        "numberOfSpeakers": 2,
        "withLipSync": False,
        "preferredSpeedType": "GREEN"
    }
).json()
project_seq = result["result"]["startGenerateProjectIdList"][0]
```

- `mediaSeq`: the `seq` from Upload Video/Audio response
- `numberOfSpeakers`: **required** — number of speakers for multi-speaker detection
- `preferredSpeedType`: `"GREEN"` (standard) or `"RED"` (priority)
- Optional: `customDictionaryBlobPath`, `srtBlobPath`

### Poll Progress

```python
progress = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/space/{space_seq}/progress",
    headers=HEADERS
).json()
# Returns: projectSeq, progress (0-100), progressReason, hasFailed, expectedRemainingTimeMinutes, isCancelable
```

### Get Project

```python
project = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}",
    headers=HEADERS
).json()
```

### List Projects

```python
projects = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}",
    headers=HEADERS,
    params={"memberRole": "developer", "size": 10, "offset": 0, "sortDirection": "desc"}
).json()
```

### Download Files

```python
downloads = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/download",
    headers=HEADERS,
    params={"target": "all"}
).json()
# Returns download links for: videoFile, audioFile, srtFile, zippedFileDownloadLink
```

### Get Script

```python
script = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/script",
    headers=HEADERS,
    params={"size": 10000}
).json()
# Returns sentences with translations, matching rates, speaker info. Cursor pagination via cursorId.
```

### Cancel Project

```python
requests.post(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/cancel",
    headers=HEADERS
)
# Only for GREEN zone projects in PENDING state
```

### Update Title / Delete / Update Access / Toggle Share

```python
# Update title
requests.patch(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/title",
    headers=HEADERS, json={"newTitle": "New Name"}
)

# Delete project
requests.delete(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}",
    headers=HEADERS
)

# Update access
requests.patch(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/access",
    headers=HEADERS, params={"permission": "all"}
)

# Toggle share
requests.patch(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/share",
    headers=HEADERS, params={"sharedStatus": "true"}
)
```

---

## Editing API

Edit individual sentences within a completed translation project.

### Translate Sentence

```python
updated = requests.patch(
    f"{API_BASE}/video-translator/api/v1/project/{project_seq}/audio-sentence/{sentence_seq}",
    headers=HEADERS,
    json={"targetText": "Updated translation text"}
).json()
# Returns: scriptSeq, translatedText, matchingRate, rewrite
```

### Generate Audio

```python
audio = requests.patch(
    f"{API_BASE}/video-translator/api/v1/project/{project_seq}/audio-sentence/{sentence_seq}/generate-audio",
    headers=HEADERS,
    json={"targetText": "Text to generate audio for"}
).json()
```

### Reset Translation

```python
requests.put(
    f"{API_BASE}/video-translator/api/v1/project/{project_seq}/audio-sentence/{sentence_seq}/reset",
    headers=HEADERS
)
```

### Request Proofread

```python
requests.post(
    f"{API_BASE}/video-translator/api/v1/project/{project_seq}/space/{space_seq}/proofread",
    headers=HEADERS,
    json={"isLipSync": False, "preferredSpeedType": "GREEN"}
)
```

---

## Lip Sync API

### Request Lip Sync

```python
lip_sync = requests.post(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/lip-sync",
    headers=HEADERS,
    json={"preferredSpeedType": "GREEN"}
).json()
```

### Get Generation History

```python
history = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/{project_seq}/spaces/{space_seq}/lip-sync/generated",
    headers=HEADERS,
    params={"page": 1, "pageSize": 10}
).json()
```

---

## Usage API

### Get User Quota

```python
quota = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/plan/status",
    headers=HEADERS
).json()
print(f"Remaining: {quota['result']['remainingQuota']['remainingQuota']}")
```

### Estimate Quota Usage

```python
estimate = requests.get(
    f"{API_BASE}/video-translator/api/v1/projects/spaces/{space_seq}/media/quota",
    headers=HEADERS,
    params={"mediaType": "VIDEO", "lipSync": False, "durationMs": 30000, "width": 1920, "height": 1080}
).json()
```

---

## Language API

### List Languages

```python
languages = requests.get(
    f"{API_BASE}/video-translator/api/v1/languages",
    headers=HEADERS
).json()
for lang in languages["result"]["languages"]:
    print(f"{lang['code']}: {lang['name']} {'(experimental)' if lang['experiment'] else ''}")
```

