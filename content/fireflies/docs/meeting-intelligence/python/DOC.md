---
name: meeting-intelligence
description: "Fireflies.ai GraphQL API for fetching meeting transcripts, summaries, and speaker analytics."
metadata:
  languages: "python"
  versions: "v1"
  updated-on: "2026-05-08"
  source: community
  tags: "fireflies,transcription,meetings,graphql,summaries,ai"
---

# Fireflies.ai GraphQL API — Python Guide

You are a Fireflies.ai API coding expert. Help me write Python code using the Fireflies.ai GraphQL API.

Official API documentation: https://docs.fireflies.ai/getting-started/introduction

## Authentication

All requests use Bearer token auth. Get your API key from the Fireflies dashboard → Integrations → API.

```python
import httpx

API_KEY = "YOUR_API_KEY"
GRAPHQL_URL = "https://api.fireflies.ai/graphql"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}
```

## Making GraphQL Requests

All requests are HTTP POST to `https://api.fireflies.ai/graphql`.

```python
import httpx

async def query(payload: dict) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(GRAPHQL_URL, headers=headers, json=payload)
        r.raise_for_status()
        result = r.json()
        if "errors" in result:
            raise ValueError(f"GraphQL errors: {result['errors']}")
        return result["data"]
```

## Core Queries

### List Users

```python
data = await query({
    "query": "{ users { name user_id } }"
})
users = data["users"]
```

### List Transcripts (Meetings)

```python
data = await query({
    "query": """
    {
      transcripts {
        id
        title
        date
        duration
        participants
        summary {
          keywords
          action_items
          overview
          shorthand_bullet
          gist
          bullet_gist
        }
      }
    }
    """
})
transcripts = data["transcripts"]
```

### Get a Specific Transcript

```python
data = await query({
    "query": """
    query GetTranscript($id: String!) {
      transcript(id: $id) {
        id
        title
        date
        duration
        participants
        sentences {
          index
          text
          start_time
          end_time
          speaker_name
          speaker_id
        }
        summary {
          keywords
          action_items
          overview
          shorthand_bullet
          gist
          bullet_gist
        }
      }
    }
    """,
    "variables": {"id": "TRANSCRIPT_ID"},
})
transcript = data["transcript"]
```

## Key Schema Types

- **Transcript** — a recorded meeting: `id`, `title`, `date`, `duration`, `participants`, `sentences`, `summary`
- **Sentence** — a single utterance: `index`, `text`, `start_time`, `end_time`, `speaker_name`, `speaker_id`
- **Summary** — AI-generated meeting summary: `keywords`, `action_items`, `overview`, `shorthand_bullet`, `gist` (1-sentence), `bullet_gist`
- **User** — a Fireflies workspace user: `name`, `user_id`
- **MeetingAttendee** — attendee details including email and name
- **MeetingInfo** — metadata about the recorded meeting

## Common Pattern: Fetch All Transcripts (Paginated)

For workspaces with many meetings, use `limit` and `skip` to page through results:

```python
async def fetch_all_transcripts() -> list:
    results = []
    skip = 0
    limit = 50
    while True:
        data = await query({
            "query": """
            query GetTranscripts($limit: Int, $skip: Int) {
              transcripts(limit: $limit, skip: $skip) {
                id
                title
                date
                duration
                participants
              }
            }
            """,
            "variables": {"limit": limit, "skip": skip},
        })
        batch = data["transcripts"]
        results.extend(batch)
        if len(batch) < limit:
            break
        skip += limit
    return results
```

## Date Filtering

```python
data = await query({
    "query": """
    query GetTranscripts($fromDate: DateTime, $toDate: DateTime) {
      transcripts(fromDate: $fromDate, toDate: $toDate) {
        id
        title
        date
        duration
        participants
      }
    }
    """,
    "variables": {
        "fromDate": "2025-01-01T00:00:00Z",
        "toDate": "2025-12-31T23:59:59Z",
    },
})
```

## Upload Audio

Upload an external recording URL for Fireflies to transcribe:

```python
data = await query({
    "query": """
    mutation UploadAudio($input: AudioUploadInput) {
      uploadAudio(input: $input) {
        success
        title
        message
      }
    }
    """,
    "variables": {
        "input": {
            "url": "https://your-storage.com/recording.mp3",
            "title": "Sales call - 2025-01-15",
            "meeting_attendees": [
                {"displayName": "Alice", "email": "alice@example.com"},
                {"displayName": "Bob", "email": "bob@example.com"},
            ],
        }
    },
})
```

## Webhooks

Fireflies supports webhooks (v1 and v2) to push transcript-ready events. See: https://docs.fireflies.ai/graphql-api/webhooks

Minimal webhook payload when a transcript is ready:

```json
{
  "meetingId": "abc123",
  "clientReferenceId": null,
  "title": "Team standup",
  "fireflies_user": "user@example.com"
}
```

Fetch the full transcript using `transcript(id: "abc123")` after receiving the webhook.

## Installation

```bash
pip install httpx
```
