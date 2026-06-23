# Streaming Agent (Voice & Video)

Build a real-time bidirectional streaming agent using ADK and the Gemini Live API.

## Supported Models

Only Gemini models that support the Live API work for voice/video streaming:
- Check current model IDs at: `https://ai.google.dev/gemini-api/docs/models#live-api`
- Vertex AI Live API: `https://cloud.google.com/vertex-ai/generative-ai/docs/live-api`

## Project Structure
```
adk-streaming/
└── app/
    ├── .env
    └── google_search_agent/
        ├── __init__.py
        └── agent.py
```

## agent.py
```python
from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    name="basic_search_agent",
    model="gemini-2.0-flash-live-001",  # Must support Live API
    description="Agent to answer questions using Google Search.",
    instruction="You are an expert researcher. You always stick to the facts.",
    tools=[google_search],
)
```
```python
# __init__.py
from . import agent
```

## Environment Setup

Google AI Studio:
```bash
# app/.env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=YOUR_API_KEY
```

Vertex AI:
```bash
# app/.env
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=us-central1
```

## Run with adk web
```bash
cd app

# Required for voice/video SSL (macOS/Linux)
export SSL_CERT_FILE=$(python -m certifi)
# Windows PowerShell:
# $env:SSL_CERT_FILE = (python -m certifi)

adk web
# Open http://localhost:8000
```

- Click microphone button for voice input
- Click camera button for video input
- Ask questions — agent responds in real-time voice

## Important Notes

- Native-audio models do NOT support text chat in `adk web` — use microphone only.
- `adk web` is for development/debugging only — not production.
- Callbacks, LongRunningTool, ExampleTool, and SequentialAgent are not yet supported in streaming mode.
- For production streaming apps, use the Bidi-streaming dev guide with FastAPI: `https://google.github.io/adk-docs/streaming/dev-guide/part1/`

## Official Source URLs

- `https://google.github.io/adk-docs/get-started/streaming/quickstart-streaming/`
- `https://ai.google.dev/gemini-api/docs/models#live-api`