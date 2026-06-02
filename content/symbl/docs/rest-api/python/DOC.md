---
name: rest-api
description: "Symbl.ai Conversation Intelligence REST API for transcription, sentiment, and topic extraction"
metadata:
  languages: "python"
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "symbl,conversation-intelligence,transcription,sentiment,topics,accessibility,api"
---

# Symbl.ai REST API

> **Golden Rule:** Symbl.ai has SDKs but the REST API can be used directly with `httpx` (async). Authentication uses OAuth2 (appId/appSecret exchanged for a Bearer access token). The Async API processes audio/video/text, and the Conversation API retrieves insights (transcripts, topics, sentiment, action items). Base URL is `https://api.symbl.ai/v1`.

## Installation

```bash
pip install httpx
```

## Base URL

`https://api.symbl.ai/v1`

Labs endpoint: `https://api-labs.symbl.ai/v1`

Sign up at: https://platform.symbl.ai

## Authentication

**Type:** OAuth 2.0 Client Credentials (appId + appSecret)

```python
import httpx

APP_ID = "your-app-id"
APP_SECRET = "your-app-secret"
BASE_URL = "https://api.symbl.ai/v1"

async def get_access_token() -> str:
    async with httpx.AsyncClient() as c:
        response = await c.post(
            "https://api.symbl.ai/oauth2/token:generate",
            json={
                "type": "application",
                "appId": APP_ID,
                "appSecret": APP_SECRET,
            },
        )
        response.raise_for_status()
        return response.json()["accessToken"]

access_token = await get_access_token()
client = httpx.AsyncClient(
    headers={"Authorization": f"Bearer {access_token}"},
    timeout=60.0,
)
```

**Important:** Access tokens expire. Re-generate when you receive a 401.

## Rate Limiting

| Constraint | Limit |
|---|---|
| Audio/video file duration | 4 hours max |
| Text input | 15,000 words per request |
| Concurrent async jobs | Varies by plan |

Symbl.ai does not publish fixed rate limits; they vary by plan. Monitor for 429 responses.

## Methods

### Async Audio (URL)

**Endpoint:** `POST /process/audio/url`

Submit audio from a URL for processing.

| Parameter | Type | Default |
|---|---|---|
| `url` | `str` | **required** |
| `name` | `str` | `None` (conversation name) |
| `confidenceThreshold` | `float` | `0.5` |
| `languageCode` | `str` | `en-US` |
| `enableSpeakerDiarization` | `bool` | `true` |
| `diarizationSpeakerCount` | `int` | `None` |

```python
payload = {
    "url": "https://example.com/meeting-recording.mp3",
    "name": "Team standup",
    "confidenceThreshold": 0.6,
    "languageCode": "en-US",
    "enableSpeakerDiarization": True,
    "diarizationSpeakerCount": 4,
}
response = await client.post(f"{BASE_URL}/process/audio/url", json=payload)
response.raise_for_status()
data = response.json()
conversation_id = data["conversationId"]
job_id = data["jobId"]
print(f"Conversation: {conversation_id}, Job: {job_id}")
```

### Async Audio (File Upload)

**Endpoint:** `POST /process/audio`

```python
with open("meeting.mp3", "rb") as audio_file:
    response = await client.post(
        f"{BASE_URL}/process/audio",
        content=audio_file.read(),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "audio/mpeg",
        },
    )
response.raise_for_status()
data = response.json()
conversation_id = data["conversationId"]
job_id = data["jobId"]
```

### Async Video (URL)

**Endpoint:** `POST /process/video/url`

```python
payload = {
    "url": "https://example.com/meeting.mp4",
    "name": "Video meeting",
}
response = await client.post(f"{BASE_URL}/process/video/url", json=payload)
response.raise_for_status()
data = response.json()
conversation_id = data["conversationId"]
```

### Async Text

**Endpoint:** `POST /process/text`

Process text conversations (chat logs, emails, etc.).

```python
payload = {
    "name": "Support chat",
    "messages": [
        {
            "payload": {"content": "Hi, I need help with my account."},
            "from": {"name": "Customer", "userId": "customer@example.com"},
        },
        {
            "payload": {"content": "Sure, I'd be happy to help. What seems to be the issue?"},
            "from": {"name": "Agent", "userId": "agent@example.com"},
        },
    ],
}
response = await client.post(f"{BASE_URL}/process/text", json=payload)
response.raise_for_status()
data = response.json()
conversation_id = data["conversationId"]
```

### Check Job Status

**Endpoint:** `GET /job/{job_id}`

```python
response = await client.get(f"{BASE_URL}/job/{job_id}")
response.raise_for_status()
job = response.json()
print(f"Status: {job['status']}")
# Statuses: scheduled, in_progress, completed, failed
```

### Poll Until Complete (Helper)

```python
import asyncio

async def wait_for_job(job_id: str, poll_interval: float = 5.0) -> str:
    while True:
        response = await client.get(f"{BASE_URL}/job/{job_id}")
        response.raise_for_status()
        job = response.json()
        if job["status"] == "completed":
            return job["status"]
        elif job["status"] == "failed":
            raise Exception(f"Job failed: {job}")
        await asyncio.sleep(poll_interval)
```

### Get Transcript (Messages)

**Endpoint:** `GET /conversations/{conversationId}/messages`

```python
response = await client.get(f"{BASE_URL}/conversations/{conversation_id}/messages")
response.raise_for_status()
data = response.json()
for msg in data.get("messages", []):
    speaker = msg.get("from", {}).get("name", "Unknown")
    text = msg.get("text", "")
    print(f"[{speaker}]: {text}")
```

### Get Topics

**Endpoint:** `GET /conversations/{conversationId}/topics`

```python
response = await client.get(f"{BASE_URL}/conversations/{conversation_id}/topics")
response.raise_for_status()
data = response.json()
for topic in data.get("topics", []):
    print(f"Topic: {topic['text']} (score: {topic.get('score', 'N/A')})")
```

### Get Sentiment (Messages with Sentiment)

**Endpoint:** `GET /conversations/{conversationId}/messages?sentiment=true`

```python
response = await client.get(
    f"{BASE_URL}/conversations/{conversation_id}/messages",
    params={"sentiment": "true"},
)
response.raise_for_status()
data = response.json()
for msg in data.get("messages", []):
    sentiment = msg.get("sentiment", {})
    polarity = sentiment.get("polarity", {}).get("score", 0)
    label = sentiment.get("suggested", "neutral")
    print(f"[{label} ({polarity:.2f})]: {msg.get('text', '')[:80]}")
```

### Get Action Items

**Endpoint:** `GET /conversations/{conversationId}/action-items`

```python
response = await client.get(f"{BASE_URL}/conversations/{conversation_id}/action-items")
response.raise_for_status()
data = response.json()
for item in data.get("actionItems", []):
    assignee = item.get("assignee", {}).get("name", "Unassigned")
    print(f"[{assignee}]: {item.get('text', '')}")
```

### Get Follow-Ups

**Endpoint:** `GET /conversations/{conversationId}/follow-ups`

```python
response = await client.get(f"{BASE_URL}/conversations/{conversation_id}/follow-ups")
response.raise_for_status()
data = response.json()
for fu in data.get("followUps", []):
    print(f"Follow-up: {fu.get('text', '')}")
```

### Get Questions

**Endpoint:** `GET /conversations/{conversationId}/questions`

```python
response = await client.get(f"{BASE_URL}/conversations/{conversation_id}/questions")
response.raise_for_status()
data = response.json()
for q in data.get("questions", []):
    print(f"Q: {q.get('text', '')}")
```

### Get Summary (Labs)

**Endpoint:** `GET /conversations/{conversationId}/summary` (labs endpoint)

```python
response = await client.get(
    f"https://api-labs.symbl.ai/v1/conversations/{conversation_id}/summary",
    headers={"Authorization": f"Bearer {access_token}"},
)
response.raise_for_status()
data = response.json()
for item in data.get("summary", []):
    print(item.get("text", ""))
```

### Delete Conversation

**Endpoint:** `DELETE /conversations/{conversationId}`

```python
response = await client.delete(f"{BASE_URL}/conversations/{conversation_id}")
response.raise_for_status()
print("Conversation deleted")
```

## Error Handling

```python
import httpx

try:
    response = await client.post(f"{BASE_URL}/process/audio/url", json=payload)
    response.raise_for_status()
    data = response.json()
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        print("Access token expired or invalid -- regenerate token")
    elif e.response.status_code == 429:
        print("Rate limited -- reduce request frequency")
    elif e.response.status_code == 400:
        print(f"Bad request (invalid payload): {e.response.text}")
    elif e.response.status_code == 404:
        print("Conversation or job not found")
    elif e.response.status_code == 413:
        print("File too large -- max 4 hours audio/video")
    else:
        print(f"Symbl.ai error {e.response.status_code}: {e.response.text}")
except httpx.RequestError as e:
    print(f"Network error: {e}")
```

## Common Pitfalls

- Token generation endpoint uses a colon in the path: `/oauth2/token:generate`
- The Async API returns a `conversationId` and `jobId` -- you need both: job for polling status, conversation for retrieving insights
- Audio file uploads use raw body with `Content-Type` header (e.g., `audio/mpeg`), not multipart form
- Audio/video URL submissions use **JSON body** with POST
- Text processing expects a `messages` array with `payload.content` and `from` fields
- Sentiment is not returned by default -- add `?sentiment=true` query param to messages endpoint
- The Summary endpoint is on the **labs** base URL (`api-labs.symbl.ai`), not the main URL
- Supported audio formats: mp3, wav, amr, aac, ac3, aiff, flac, ogg, opus, wma, m4a
- Maximum audio/video duration is **4 hours** per request
- Maximum text is **15,000 words** per request
- Access tokens expire -- implement token refresh logic
- Set a longer timeout for file uploads: `httpx.AsyncClient(timeout=60.0)`
