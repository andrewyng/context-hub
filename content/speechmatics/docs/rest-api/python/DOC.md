---
name: rest-api
description: "Speechmatics Batch Transcription REST API for accurate speech-to-text"
metadata:
  languages: "python"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "speechmatics,speech-to-text,transcription,accessibility,captioning,api"
---

# Speechmatics REST API

> **Golden Rule:** Speechmatics has a Python SDK but the REST API can be used directly with `httpx` (async). The Batch API submits audio files as jobs and retrieves transcripts. Authentication uses Bearer token with API key from the Speechmatics Portal. Base URL is `https://asr.api.speechmatics.com/v2`. Free tier allows 2 hours/month of audio processing.

## Installation

```bash
pip install httpx
```

## Base URL

`https://asr.api.speechmatics.com/v2`

Portal (manage API keys): https://portal.speechmatics.com

## Authentication

**Type:** API Key as Bearer Token

Generate API keys at: Portal > Settings > API Keys

```python
import httpx

API_KEY = "your-speechmatics-api-key"
BASE_URL = "https://asr.api.speechmatics.com/v2"

client = httpx.AsyncClient(
    headers={"Authorization": f"Bearer {API_KEY}"},
    timeout=60.0,
)
```

## Rate Limiting

| Metric | Limit |
|---|---|
| New jobs (POST) | 10 per second |
| Status checks (GET) | 50 per second |
| Concurrent jobs | 20,000 max |
| File size (body) | 1 GB max |
| Audio via URL | No size limit |

Monthly audio processing limits:

| Tier | Limit |
|---|---|
| Free | 2 hours/month |
| Paid | 6,000 hours/month |
| Enterprise | Custom |

Data retention: audio, transcripts, and config are retained for 7 days, then deleted.

## Methods

### Create Transcription Job

**Endpoint:** `POST /jobs`

Submit an audio file for transcription. Uses `multipart/form-data` with a `data_file` and a `config` JSON field.

| Config Field | Type | Default |
|---|---|---|
| `type` | `str` | **required** (`transcription`) |
| `transcription_config.language` | `str` | **required** (e.g., `en`) |
| `transcription_config.operating_point` | `str` | `standard` (`standard` or `enhanced`) |
| `transcription_config.diarization` | `str` | `none` (`none`, `speaker`) |
| `transcription_config.enable_entities` | `bool` | `false` |
| `transcription_config.punctuation_overrides.permitted_marks` | `list` | all marks |

```python
import json

config = {
    "type": "transcription",
    "transcription_config": {
        "language": "en",
        "operating_point": "enhanced",
        "diarization": "speaker",
        "enable_entities": True,
    }
}

with open("audio.wav", "rb") as audio_file:
    response = await client.post(
        f"{BASE_URL}/jobs",
        files={"data_file": ("audio.wav", audio_file, "audio/wav")},
        data={"config": json.dumps(config)},
    )
response.raise_for_status()
job = response.json()
job_id = job["id"]
print(f"Job created: {job_id}")
```

### Create Job from URL

```python
config = {
    "type": "transcription",
    "transcription_config": {
        "language": "en",
        "operating_point": "enhanced",
    },
    "fetch_data": {
        "url": "https://example.com/audio.mp3",
    }
}

response = await client.post(
    f"{BASE_URL}/jobs",
    data={"config": json.dumps(config)},
)
response.raise_for_status()
job_id = response.json()["id"]
```

### Check Job Status

**Endpoint:** `GET /jobs/{job_id}`

```python
response = await client.get(f"{BASE_URL}/jobs/{job_id}")
response.raise_for_status()
job = response.json()
status = job["job"]["status"]
print(f"Status: {status}")
# Statuses: running, done, rejected, deleted, expired
```

### Get Transcript

**Endpoint:** `GET /jobs/{job_id}/transcript`

```python
# Get JSON transcript
response = await client.get(
    f"{BASE_URL}/jobs/{job_id}/transcript",
    params={"format": "json-v2"},
)
response.raise_for_status()
transcript = response.json()

for result in transcript.get("results", []):
    if result["type"] == "word":
        print(f"{result['start_time']:.2f}s: {result['content']}", end=" ")
```

```python
# Get plain text transcript
response = await client.get(
    f"{BASE_URL}/jobs/{job_id}/transcript",
    params={"format": "txt"},
)
response.raise_for_status()
print(response.text)
```

```python
# Get SRT subtitles (for accessibility captioning)
response = await client.get(
    f"{BASE_URL}/jobs/{job_id}/transcript",
    params={"format": "srt"},
)
response.raise_for_status()
print(response.text)
```

### List All Jobs

**Endpoint:** `GET /jobs`

```python
response = await client.get(f"{BASE_URL}/jobs")
response.raise_for_status()
data = response.json()
for job in data.get("jobs", []):
    print(f"{job['id']}: {job['status']} - {job.get('duration', 'N/A')}s")
```

### Delete Job

**Endpoint:** `DELETE /jobs/{job_id}`

```python
response = await client.delete(f"{BASE_URL}/jobs/{job_id}")
response.raise_for_status()
print("Job deleted")
```

### Poll Until Complete (Helper)

```python
import asyncio

async def wait_for_transcript(job_id: str, poll_interval: float = 5.0) -> dict:
    while True:
        response = await client.get(f"{BASE_URL}/jobs/{job_id}")
        response.raise_for_status()
        job = response.json()["job"]

        if job["status"] == "done":
            # Fetch the transcript
            resp = await client.get(
                f"{BASE_URL}/jobs/{job_id}/transcript",
                params={"format": "json-v2"},
            )
            resp.raise_for_status()
            return resp.json()
        elif job["status"] in ("rejected", "deleted", "expired"):
            raise Exception(f"Job failed with status: {job['status']}")

        await asyncio.sleep(poll_interval)

# Usage
transcript = await wait_for_transcript(job_id)
full_text = " ".join(
    r["content"] for r in transcript.get("results", []) if r["type"] == "word"
)
print(full_text)
```

### Supported Languages

Common language codes: `en` (English), `es` (Spanish), `fr` (French), `de` (German), `it` (Italian), `pt` (Portuguese), `nl` (Dutch), `ja` (Japanese), `ko` (Korean), `zh` (Mandarin), `ar` (Arabic), `hi` (Hindi).

Full list at: https://docs.speechmatics.com/speech-to-text/languages

### Supported Audio Formats

`wav`, `mp3`, `mp4`, `m4a`, `ogg`, `flac`, `aac`, `amr`, `webm`

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/jobs", files=files, data=data)
    response.raise_for_status()
    job = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Invalid or missing API key -- check Bearer token")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency")
    elif e.response.status_code == 400:
        print(f"Bad request (invalid config or audio): {e.response.text}")
    elif e.response.status_code == 404:
        print("Job not found or expired (data retained for 7 days only)")
    elif e.response.status_code == 413:
        print("File too large -- max 1 GB via body, use URL for larger files")
    elif e.response.status_code == 409:
        print("Max concurrent jobs exceeded (20,000)")
    else:
        print(f"Speechmatics error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Job submission uses **multipart/form-data** with `data_file` and `config` fields
- The `config` field must be a **JSON string**, not a raw dict
- Transcripts expire after **7 days** -- download results promptly
- The `enhanced` operating point is more accurate but costs more and takes longer
- For accessibility captioning, use `format=srt` or `format=vtt` for subtitle output
- Speaker diarization (`"diarization": "speaker"`) adds speaker labels but increases processing time
- Free tier is limited to **2 hours/month** of audio -- monitor usage
- Use `fetch_data.url` for files larger than 1 GB instead of uploading in the body
- Set a longer timeout for file uploads: `httpx.AsyncClient(timeout=60.0)`
- Job status must be polled -- there is no webhook/callback for batch jobs in the basic API
- The `json-v2` transcript format includes word-level timestamps for precise captioning
