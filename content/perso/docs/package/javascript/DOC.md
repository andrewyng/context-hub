---
name: perso-api-dubbing
description: "Perso AI video/audio dubbing and translation REST API — JavaScript/TypeScript guide with fetch"
metadata:
  languages: "javascript"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-18"
  source: maintainer
  tags: "perso,dubbing,translation,video,audio,lip-sync,ai,javascript,typescript"
---

# Perso API — JavaScript / TypeScript

Perso is an AI-powered video and audio dubbing/translation platform. The API lets you upload media, request translations into multiple languages, edit translated sentences, generate lip-synced video, and download results.

## Configuration

```javascript
const API_BASE = "https://api.perso.ai";       // All API requests
const SERVICE_DOMAIN = "https://perso.ai";      // File path access (e.g. /perso-storage/...)
const headers = {
  "XP-API-KEY": "pk-live-xxxxxxxxxxxxxxxx",
  "Content-Type": "application/json"
};
```

- **API Base URL** (`https://api.perso.ai`): all API requests go here.
- **Service Domain** (`https://perso.ai`): used only for accessing file paths (e.g. `/perso-storage/...`).

## Authentication

All endpoints require an API key in the `XP-API-KEY` header. Keys are prefixed `pk-live-` (production) or `pk-test-` (sandbox).

## Common Response Format

```javascript
// Success
{ "result": { /* response data */ } }

// Error
{ "code": "VT4041", "status": "NOT_FOUND", "message": "Error description" }
```

## File Paths

Response fields like `videoFilePath`, `audioFilePath`, `thumbnailFilePath` are **relative paths**. Prepend the **Service Domain** (`https://perso.ai`), NOT the API Base URL:

```javascript
const videoPath = upload.videoFilePath; // e.g. "/perso-storage/.../video.mp4"
const fullUrl = `${SERVICE_DOMAIN}${videoPath}`;
// https://perso.ai/perso-storage/.../video.mp4
```

## Prerequisites — Resolve Your Space

The Perso API is **space-based**. Most endpoints require a `{spaceSeq}` path parameter. First retrieve your spaces and find your default space:

```javascript
const spaces = await fetch(`${API_BASE}/portal/api/v1/spaces`, { headers }).then(r => r.json());
const defaultSpace = spaces.result.find(s => s.isDefaultSpaceOwned);
const spaceSeq = defaultSpace.spaceSeq;
```

Use `spaceSeq` for all subsequent requests that require `{spaceSeq}`.

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

```javascript
// 1. Get SAS token from File API
const sas = await fetch(
  `${API_BASE}/file/api/upload/sas-token?fileName=video.mp4`,
  { headers }
).then(r => r.json());

// 2. Client uploads file directly to Azure Blob Storage
const file = await fs.promises.readFile("video.mp4"); // or File from <input>
await fetch(sas.blobSasUrl, {
  method: "PUT",
  body: file,
  headers: {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": "application/octet-stream"
  }
});

// 3. Register uploaded video with File API (returns mediaSeq)
const upload = await fetch(`${API_BASE}/file/api/upload/video`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    spaceSeq,
    fileUrl: sas.blobSasUrl.split("?")[0],
    fileName: "video.mp4"
  })
}).then(r => r.json());
const mediaSeq = upload.seq;

// 4. Initialize queue (required once per space)
await fetch(`${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/queue`, {
  method: "PUT",
  headers
});

// 5. Request translation
const result = await fetch(`${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/translate`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    mediaSeq,
    isVideoProject: true,
    sourceLanguageCode: "en",
    targetLanguageCodes: ["ko"],
    numberOfSpeakers: 1,
    preferredSpeedType: "GREEN"
  })
}).then(r => r.json());
const projectSeq = result.result.startGenerateProjectIdList[0];

// 6. Poll progress until complete
while (true) {
  const progress = await fetch(
    `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/space/${spaceSeq}/progress`,
    { headers }
  ).then(r => r.json());
  const p = progress.result;
  console.log(`Progress: ${p.progress}% — ${p.progressReason}`);
  if (p.progress >= 100 || p.hasFailed) break;
  await new Promise(r => setTimeout(r, 10000));
}

// 7. Download translated files
const downloads = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download?target=all`,
  { headers }
).then(r => r.json());
console.log(downloads.result);
```

---

## File API

### Get SAS Token

```javascript
const sas = await fetch(
  `${API_BASE}/file/api/upload/sas-token?fileName=video.mp4`,
  { headers }
).then(r => r.json());
// {"blobSasUrl": "https://{account}.blob.core.windows.net/...?sv=...&sig=...", "expirationDatetime": "..."}
```

Token expires in 30 minutes. Upload your file to `blobSasUrl` via PUT before expiration.

### Upload Video

```javascript
const upload = await fetch(`${API_BASE}/file/api/upload/video`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ spaceSeq, fileUrl: blobUrl, fileName: "video.mp4" })
}).then(r => r.json());
const mediaSeq = upload.seq; // use as mediaSeq for translation
// Also returns: originalName, videoFilePath, thumbnailFilePath, size, durationMs
```

### Upload Audio

```javascript
const upload = await fetch(`${API_BASE}/file/api/upload/audio`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ spaceSeq, fileUrl: blobUrl, fileName: "audio.mp3" })
}).then(r => r.json());
const mediaSeq = upload.seq;
```

### Upload External Video

Upload from YouTube, TikTok, or Google Drive. Synchronous — may take up to 10 minutes.

**IMPORTANT:** This endpoint uses **snake_case** request body.

```javascript
const upload = await fetch(`${API_BASE}/file/api/upload/video/external`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    space_seq: spaceSeq,
    url: "https://www.youtube.com/watch?v=xxxxx",
    lang: "en"
  })
}).then(r => r.json());
const mediaSeq = upload.seq;
```

### Validate Media

Pre-validate media metadata before upload.

```javascript
const validation = await fetch(`${API_BASE}/file/api/v1/media/validate`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    spaceSeq,
    durationMs: 30000,
    originalName: "video.mp4",
    mediaType: "video",
    extension: ".mp4",
    size: 52428800,
    width: 1920,
    height: 1080
  })
}).then(r => r.json());
// {"status": true} on success, error response on failure
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

```javascript
const metadata = await fetch(`${API_BASE}/file/api/v1/video-translator/external/metadata`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    space_seq: spaceSeq,
    url: "https://www.youtube.com/watch?v=xxxxx",
    lang: "en"
  })
}).then(r => r.json());
// Returns: durationMs, originalName, thumbnailFilePath, mediaType, size, extension, width, height
```

---

## Space API

### List Spaces

```javascript
const spaces = await fetch(`${API_BASE}/portal/api/v1/spaces`, { headers }).then(r => r.json());
```

### Get Space

```javascript
const space = await fetch(`${API_BASE}/portal/api/v1/spaces/${spaceSeq}`, { headers }).then(r => r.json());
```

---

## Dubbing API (Translation)

### Initialize Queue (required before first translation)

```javascript
await fetch(`${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/queue`, {
  method: "PUT",
  headers
});
```

### Request Translation

```javascript
const result = await fetch(`${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/translate`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    mediaSeq,
    isVideoProject: true,
    sourceLanguageCode: "en",
    targetLanguageCodes: ["ko", "ja"],
    numberOfSpeakers: 2,
    withLipSync: false,
    preferredSpeedType: "GREEN"
  })
}).then(r => r.json());
const projectSeq = result.result.startGenerateProjectIdList[0];
```

- `mediaSeq`: the `seq` from Upload Video/Audio response
- `numberOfSpeakers`: **required** — number of speakers for multi-speaker detection
- `preferredSpeedType`: `"GREEN"` (standard) or `"RED"` (priority)
- Optional: `customDictionaryBlobPath`, `srtBlobPath`

### Poll Progress

```javascript
const progress = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/space/${spaceSeq}/progress`,
  { headers }
).then(r => r.json());
// Returns: projectSeq, progress (0-100), progressReason, hasFailed, expectedRemainingTimeMinutes, isCancelable
```

### Get Project

```javascript
const project = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}`,
  { headers }
).then(r => r.json());
```

### List Projects

```javascript
const projects = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}?memberRole=developer&size=10&offset=0&sortDirection=desc`,
  { headers }
).then(r => r.json());
```

### Download Files

```javascript
const downloads = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/download?target=all`,
  { headers }
).then(r => r.json());
// Returns download links for: videoFile, audioFile, srtFile, zippedFileDownloadLink
```

### Get Script

```javascript
const script = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/script?size=10000`,
  { headers }
).then(r => r.json());
// Returns sentences with translations, matching rates, speaker info. Cursor pagination via cursorId.
```

### Cancel Project

```javascript
await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/cancel`,
  { method: "POST", headers }
);
// Only for GREEN zone projects in PENDING state
```

### Update Title / Delete / Update Access / Toggle Share

```javascript
// Update title
await fetch(`${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/title`, {
  method: "PATCH", headers, body: JSON.stringify({ newTitle: "New Name" })
});

// Delete project
await fetch(`${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}`, {
  method: "DELETE", headers
});

// Update access
await fetch(`${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/access?permission=all`, {
  method: "PATCH", headers
});

// Toggle share
await fetch(`${API_BASE}/video-translator/api/v1/projects/${projectSeq}/share?sharedStatus=true`, {
  method: "PATCH", headers
});
```

---

## Editing API

Edit individual sentences within a completed translation project.

### Translate Sentence

```javascript
const updated = await fetch(
  `${API_BASE}/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}`,
  { method: "PATCH", headers, body: JSON.stringify({ targetText: "Updated translation text" }) }
).then(r => r.json());
// Returns: scriptSeq, translatedText, matchingRate, rewrite
```

### Generate Audio

```javascript
const audio = await fetch(
  `${API_BASE}/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}/generate-audio`,
  { method: "PATCH", headers, body: JSON.stringify({ targetText: "Text to generate audio for" }) }
).then(r => r.json());
```

### Reset Translation

```javascript
await fetch(
  `${API_BASE}/video-translator/api/v1/project/${projectSeq}/audio-sentence/${sentenceSeq}/reset`,
  { method: "PUT", headers }
);
```

### Request Proofread

```javascript
await fetch(
  `${API_BASE}/video-translator/api/v1/project/${projectSeq}/space/${spaceSeq}/proofread`,
  { method: "POST", headers, body: JSON.stringify({ isLipSync: false, preferredSpeedType: "GREEN" }) }
);
```

---

## Lip Sync API

### Request Lip Sync

```javascript
const lipSync = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/lip-sync`,
  { method: "POST", headers, body: JSON.stringify({ preferredSpeedType: "GREEN" }) }
).then(r => r.json());
```

### Get Generation History

```javascript
const history = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/${projectSeq}/spaces/${spaceSeq}/lip-sync/generated?page=1&pageSize=10`,
  { headers }
).then(r => r.json());
```

---

## Usage API

### Get User Quota

```javascript
const quota = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/plan/status`,
  { headers }
).then(r => r.json());
console.log(`Remaining: ${quota.result.remainingQuota.remainingQuota}`);
```

### Estimate Quota Usage

```javascript
const estimate = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/spaces/${spaceSeq}/media/quota?mediaType=VIDEO&lipSync=false&durationMs=30000&width=1920&height=1080`,
  { headers }
).then(r => r.json());
```

---

## Language API

### List Languages

```javascript
const languages = await fetch(
  `${API_BASE}/video-translator/api/v1/languages`,
  { headers }
).then(r => r.json());
languages.result.languages.forEach(lang => {
  console.log(`${lang.code}: ${lang.name}${lang.experiment ? " (experimental)" : ""}`);
});
```

---

## Feedback API

### Submit Feedback

```javascript
await fetch(`${API_BASE}/video-translator/api/v1/projects/feedbacks`, {
  method: "POST", headers, body: JSON.stringify({ projectSeq: 101, rating: 4 })
});
```

### Get Feedback

```javascript
const feedback = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/feedbacks?projectSeq=101`,
  { headers }
).then(r => r.json());
```

---

## Community Spotlight API

### List Featured Projects

```javascript
const featured = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/recommended?page=0&size=10&languageCode=ko`,
  { headers }
).then(r => r.json());
```

### Get Featured / Shared Project

```javascript
const project = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/recommended/${projectSeq}`,
  { headers }
).then(r => r.json());

const shared = await fetch(
  `${API_BASE}/video-translator/api/v1/projects/shared/${sharedQuery}`,
  { headers }
).then(r => r.json());
```

---

## Browser: Upload from File Input

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// 1. Get SAS token
const sas = await fetch(
  `${API_BASE}/file/api/upload/sas-token?fileName=${encodeURIComponent(file.name)}`,
  { headers }
).then(r => r.json());

// 2. Upload directly to Azure Blob Storage from browser
await fetch(sas.blobSasUrl, {
  method: "PUT",
  body: file,
  headers: {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": "application/octet-stream"
  }
});

// 3. Register with File API
const upload = await fetch(`${API_BASE}/file/api/upload/video`, {
  method: "PUT",
  headers,
  body: JSON.stringify({
    spaceSeq,
    fileUrl: sas.blobSasUrl.split("?")[0],
    fileName: file.name
  })
}).then(r => r.json());
```
