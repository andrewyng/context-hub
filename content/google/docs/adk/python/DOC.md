---
name: adk
description: "Google Agent Development Kit (ADK) Python package for building, running, and deploying LLM-powered agents"
metadata:
  languages: "python"
  versions: "1.26.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,adk,agents,llm,gemini,ai-agents,multi-agent,python"
---

# google-adk Python Package Guide

## Golden Rule

Use `from google.adk.agents import Agent` and define a `root_agent` — this is the only required element. Authenticate via `GOOGLE_API_KEY` for Gemini (local dev) or Application Default Credentials (ADC) for Vertex AI deployments. Always pass an explicit `model=` string; do not rely on defaults.

## Install

Pin the version you want to reason about:
```bash
python -m pip install "google-adk==1.26.0"
```

Other package managers:
```bash
uv add "google-adk==1.26.0"
poetry add "google-adk==1.26.0"
```

Recommended: use a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate       # macOS/Linux
.venv\Scripts\activate.bat      # Windows CMD
```

## Authentication And Setup

For Gemini API (local development):
```bash
export GOOGLE_API_KEY="your-api-key"
```

Get a key at https://aistudio.google.com/app/apikey.

For Vertex AI (production/GCP):
```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_GENAI_USE_VERTEXAI=true
```

Store credentials in a `.env` file at the project root — ADK loads it automatically via `python-dotenv`.

## Create An Agent Project

Use the CLI to scaffold a new project:
```bash
adk create my_agent
```

This generates:
```
my_agent/
    agent.py      # root_agent definition
    .env          # API keys / project config
    __init__.py
```

## Common Workflows

### Define A Basic Agent With A Tool

`root_agent` is the required entry point. Tools are plain Python functions with type hints and a docstring — ADK uses both for the LLM.
```python
from google.adk.agents import Agent

def get_weather(city: str) -> dict:
    """Returns current weather for a city."""
    return {"status": "success", "city": city, "condition": "sunny", "temp_c": 28}

root_agent = Agent(
    model="gemini-2.5-flash",
    name="root_agent",
    description="Answers questions about weather.",
    instruction="Use get_weather to answer weather questions. Always include the city name.",
    tools=[get_weather],
)
```

### Run The Agent
```bash
# Interactive CLI
adk run my_agent

# Web UI (run from the parent directory of my_agent/)
adk web --port 8000
# Open http://localhost:8000 — select agent at top-left
```

`adk web` is for development and debugging only — not production.

### Use Google Search As A Built-in Tool
```python
from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    name="search_agent",
    model="gemini-2.5-flash",
    instruction="Answer questions using Google Search when needed.",
    description="A web-search powered assistant.",
    tools=[google_search],
)
```

### Define A Multi-Agent System

Use `sub_agents` to delegate tasks from a coordinator agent to specialized child agents.
```python
from google.adk.agents import LlmAgent

greeter = LlmAgent(
    name="greeter",
    model="gemini-2.5-flash",
    instruction="Greet the user warmly.",
    description="Handles greetings.",
)

task_executor = LlmAgent(
    name="task_executor",
    model="gemini-2.5-flash",
    instruction="Execute the requested task precisely.",
    description="Handles task execution.",
)

coordinator = LlmAgent(
    name="coordinator",
    model="gemini-2.5-flash",
    description="Coordinates greetings and tasks.",
    instruction="Delegate greetings to greeter and tasks to task_executor.",
    sub_agents=[greeter, task_executor],
)
```

### Serve The Agent As An API
```bash
adk api_server my_agent --port 8080
```

This starts a FastAPI server. The agent is reachable at `POST /run`.

### Evaluate An Agent
```bash
adk eval my_agent my_agent/eval_set.evalset.json
```

## Important Notes

### root_agent Is Required

Every ADK project must export a `root_agent` from `agent.py`. The `adk run` and `adk web` commands look for this symbol specifically — any other name will fail to load.

### Tool Docstrings Are Used By The LLM

ADK passes the function name, type hints, and docstring directly to the model as the tool description. Write clear, specific docstrings — they directly affect tool-calling accuracy.

### .env Is Loaded Automatically

ADK uses `python-dotenv` and reads `.env` from the agent project directory at startup. Do not hardcode credentials in `agent.py`.

### adk web Is Not For Production

The web UI is a development and debugging interface. For production, use `adk api_server` or deploy to Vertex AI Agent Engine / Cloud Run.

### model= Must Be Explicit

Do not rely on a default model being set. Always pass `model=` explicitly to avoid unexpected behavior across ADK versions.

### Sub-agents Are Discovered By description=

The coordinator agent uses each sub-agent's `description` field to decide when to delegate. Write precise, distinct descriptions for each sub-agent.

## Version Notes

- This guide targets `google-adk==1.26.0`.
- ADK releases roughly bi-weekly. Check PyPI for the latest stable release before pinning.
- For unreleased fixes, install from source: `pip install git+https://github.com/google/adk-python.git@main`

## Official Source URLs

- `https://google.github.io/adk-docs/`
- `https://google.github.io/adk-docs/get-started/python/`
- `https://github.com/google/adk-python`
- `https://pypi.org/project/google-adk/`
- `https://google.github.io/agents/llm-agents/`
- `https://google.github.io/tools-custom/function-tools/`
- `https://google.github.io/deploy/agent-engine/deploy/`