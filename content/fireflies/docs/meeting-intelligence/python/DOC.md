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
        return r.json()["data"]
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
- **Summary** — AI-generated meeting summary: `keywords`, `action_items`, `overview`, `shorthand_bullet`
- **User** — a Fireflies workspace user: `name`, `user_id`
- **MeetingAttendee** — attendee details including email and name
- **MeetingInfo** — metadata about the recorded meeting

## Webhooks

Fireflies supports webhooks (v1 and v2) to push transcript-ready events. See: https://docs.fireflies.ai/graphql-api/webhooks

## Installation

```bash
pip install httpx
```
