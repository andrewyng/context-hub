---
name: youtube-api
description: "Extract YouTube video details, comments, subtitles, channel videos, and search results"
metadata:
  languages: "python"
  versions: "0.0.1"
  revision: 1
  updated-on: "2026-03-16"
  source: community
  tags: "video,transcript,captions,channel,streaming,scraping"
---

# Anysite YouTube API Coding Guidelines (Python)

You are an Anysite YouTube API coding expert. Help me write Python code using the Anysite REST API for YouTube data extraction.

API documentation: https://api.anysite.io/docs

## Golden Rule: All Endpoints Use POST with JSON Body

- **Base URL:** `https://api.anysite.io`
- **Method:** All endpoints use `POST`
- **Auth:** Pass your API key in the `access-token` header
- **Content-Type:** `application/json`
- **Identifiers:** YouTube entities use video IDs, channel handles/IDs, or full URLs

## Authentication

```python
import requests

BASE_URL = "https://api.anysite.io"
API_KEY = "your-api-key"  # Use env vars in production

HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}


def anysite_post(endpoint: str, payload: dict) -> dict:
    """Make a POST request to the Anysite YouTube API."""
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        json=payload
    )
    response.raise_for_status()
    return response.json()
```

Store your API key in an environment variable:

```python
import os
API_KEY = os.environ["ANYSITE_API_KEY"]
```

## Endpoints

### Get Video Details

Retrieve details for a YouTube video by ID or URL. Costs 1 credit.

**POST** `/api/youtube/video`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `video` | string | Yes | Video ID (e.g. `"dQw4w9WgXcQ"`) or full YouTube URL |

```python
result = anysite_post("/api/youtube/video", {
    "video": "dQw4w9WgXcQ"
})

video = result[0]
print(video["title"])
print(video["description"])
print(video["author"])
print(video["view_count"], "views")
print(video["like_count"], "likes")
print(video["duration"])
print(video["publish_date"])
```

**Key response fields (`YoutubeVideo`):**

| Field | Type | Description |
|---|---|---|
| `title` | string | Video title |
| `description` | string | Video description |
| `author` | string | Channel name |
| `channel_id` | string | YouTube channel ID |
| `view_count` | integer | Number of views |
| `like_count` | integer | Number of likes |
| `comment_count` | integer | Number of comments |
| `duration` | string | Video duration |
| `publish_date` | string | Publication date |
| `thumbnail_url` | string | Thumbnail image URL |
| `tags` | array | Video tags |
| `category` | string | Video category |
| `id` | string | Video ID |

### Get Video Comments

Retrieve comments on a YouTube video. Costs 1 credit per batch.

**POST** `/api/youtube/video/comments`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `video` | string | Yes | Video ID or full URL |
| `count` | integer | Yes | Number of comments to return |

```python
comments = anysite_post("/api/youtube/video/comments", {
    "video": "dQw4w9WgXcQ",
    "count": 20
})

for comment in comments:
    print(comment["author"]["name"], ":", comment["text"])
    print(comment["like_count"], "likes")
    print(comment["published_at"])
    print(comment["reply_count"], "replies")
    print("---")
```

**Key response fields (`YoutubeComment`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | Comment ID |
| `text` | string | Comment text |
| `author` | object | Author object with `id`, `name`, `url`, `avatar`, `is_verified`, `is_creator` |
| `like_count` | integer | Number of likes on the comment |
| `published_at` | string | Comment publication timestamp |
| `reply_count` | integer | Number of replies |
| `reply_level` | integer | Nesting level of the reply |

### Get Video Subtitles

Retrieve subtitles/captions for a YouTube video in a specified language. Costs 1 credit.

**POST** `/api/youtube/video/subtitles`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `video` | string | Yes | - | Video ID or full URL |
| `lang` | string | No | `"en"` | Language code (e.g. `"en"`, `"es"`, `"fr"`) |

```python
subtitles = anysite_post("/api/youtube/video/subtitles", {
    "video": "dQw4w9WgXcQ",
    "lang": "en"
})

for segment in subtitles:
    print(f"[{segment['start']}] {segment['text']}")
```

**Key response fields (`YoutubeSubtitle`):**

| Field | Type | Description |
|---|---|---|
| `text` | string | Subtitle text segment |
| `start` | number | Start time in seconds |
| `duration` | number | Duration of the segment in seconds |

### Get Channel Videos

Retrieve videos from a YouTube channel. Costs 1 credit per batch.

**POST** `/api/youtube/channel/videos`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `channel` | string | Yes | - | Channel handle (e.g. `"@MrBeast"`), channel ID, or URL |
| `count` | integer | No | 30 | Number of videos to return |

```python
videos = anysite_post("/api/youtube/channel/videos", {
    "channel": "@MrBeast",
    "count": 20
})

for video in videos:
    print(video["title"])
    print(video["view_count"], "views")
    print(video["published_at"])
    print("---")
```

**Key response fields (`YoutubeChannelVideo`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | YouTube video ID |
| `title` | string | Video title |
| `url` | string | Full YouTube video URL |
| `author` | object | Author object with `id`, `name`, `alias`, `url` |
| `duration_seconds` | integer | Video duration in seconds |
| `view_count` | integer | Number of views |
| `published_at` | integer | Publication timestamp (unix) |
| `image` | string | Thumbnail image URL |

### Search Videos

Search YouTube videos by query. Costs 1 credit per batch.

**POST** `/api/youtube/search/videos`

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | Yes | - | Search query keywords |
| `count` | integer | No | 10 | Number of results to return |

```python
results = anysite_post("/api/youtube/search/videos", {
    "query": "machine learning tutorial",
    "count": 10
})

for video in results:
    print(video["title"])
    print(video["author"]["alias"])
    print(video["view_count"], "views")
    print(video["url"])
    print("---")
```

**Key response fields (`YoutubeSearchVideo`):**

| Field | Type | Description |
|---|---|---|
| `id` | string | YouTube video ID |
| `title` | string | Video title |
| `url` | string | Full YouTube video URL |
| `author` | object | Author object with `id`, `name`, `alias`, `url` |
| `duration_seconds` | integer | Video duration in seconds |
| `view_count` | integer | Number of views |
| `published_at` | integer | Publication timestamp (unix) |
| `image` | string | Thumbnail image URL |

## Error Handling

```python
import requests


def anysite_post_safe(endpoint: str, payload: dict) -> dict | None:
    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code
        if status == 401:
            print("Invalid or missing access-token")
        elif status == 422:
            print("Validation error:", e.response.json())
        elif status == 429:
            print("Rate limit exceeded - wait and retry")
        elif status >= 500:
            print("Server error - retry later")
        else:
            print(f"HTTP {status}:", e.response.text)
        return None
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
```

### Common Error Codes

| Status Code | Meaning | Action |
|---|---|---|
| 401 | Invalid or missing `access-token` header | Check your API key |
| 422 | Validation error (bad parameters) | Check parameter names and types |
| 429 | Rate limit exceeded | Back off and retry |
| 500 | Server error | Retry after a delay |

## Optional Request Header

All endpoints accept an optional `x-request-id` header (UUID format) for request tracing and deduplication.
