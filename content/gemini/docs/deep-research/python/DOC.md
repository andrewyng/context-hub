---
name: deep-research
description: "Gemini Deep Research API via the Interactions endpoint for autonomous multi-step research with structured reports"
metadata:
  languages: "python"
  versions: "2.7.0"
  revision: 3
  updated-on: "2026-05-29"
  source: community
  tags: "gemini,google,deep-research,research,interactions,agent"
---

# Gemini Deep Research API (Python)

The Deep Research API lets you run Google's autonomous research agent
programmatically. It performs multi-step web research and returns structured
markdown reports. This uses the **Interactions API** — the recommended way to
interact with Gemini models and agents.

## Official References

- [Interactions API Guide](https://ai.google.dev/gemini-api/docs/interactions)
- [Deep Research Agent Guide](https://ai.google.dev/gemini-api/docs/deep-research)

## Key Concepts

- **Interactions API**: Unified interface for Gemini models and agents, with server-side state management
- **Asynchronous**: Create a background interaction, then poll for completion (typically 5–15 minutes)
- **Agent models** (as of May 2026):
    - `deep-research-preview-04-2026` — default, balanced quality and speed
    - `deep-research-max-preview-04-2026` — maximum comprehensiveness (slower, higher cost)
- **SDK**: `google-genai` >= 2.7.0 wraps the Interactions API natively
- **Output**: Markdown report with citations and structured sections

## Installation

```bash
pip install -U google-genai
```

**Important**: The package is `google-genai`, NOT the deprecated `google-generativeai`.

## Authentication

Set `GEMINI_API_KEY` environment variable — the SDK picks it up automatically.

```python
import os
os.environ["GEMINI_API_KEY"] = "your-api-key"
```

## Quick Start

```python
import time
from google import genai

client = genai.Client()

# Start background research
interaction = client.interactions.create(
    agent="deep-research-preview-04-2026",
    input="Research the current state of AI in disaster relief operations.",
    background=True,
)

# Poll for results
while True:
    interaction = client.interactions.get(interaction.id)
    if interaction.status == "completed":
        print(interaction.outputs[-1].text)
        break
    elif interaction.status == "failed":
        print(f"Failed: {interaction.error}")
        break
    time.sleep(10)
```

## Complete Example with Error Handling

```python
import time
from pathlib import Path
from google import genai

client = genai.Client()


def deep_research(query: str, timeout_minutes: int = 60) -> str:
    """Run Gemini Deep Research and return the markdown report."""
    # Start background research
    interaction = client.interactions.create(
        agent="deep-research-preview-04-2026",
        input=query,
        background=True,
    )
    print(f"Research started: {interaction.id}")

    # Poll for completion
    deadline = time.time() + timeout_minutes * 60

    while time.time() < deadline:
        time.sleep(10)

        try:
            interaction = client.interactions.get(interaction.id)
        except Exception as e:
            print(f"Poll error (retrying): {e}")
            continue

        if interaction.status == "completed":
            if interaction.outputs:
                return interaction.outputs[-1].text
            return "No content in response"

        if interaction.status in ("failed", "cancelled"):
            raise RuntimeError(f"Research {interaction.status}: {interaction.error}")

    raise TimeoutError(f"Research timed out after {timeout_minutes} minutes")


# Usage
report = deep_research("Current state of AI in disaster relief operations")
Path("report.md").write_text(report)
print("Report saved.")
```

## Optional: Generate a Research Plan First

For higher quality results, generate a structured research plan before
sending to Deep Research:

```python
from google import genai

client = genai.Client()

# Generate plan using a standard model
plan_interaction = client.interactions.create(
    model="gemini-3.1-pro-preview",
    input=f'Create a detailed research plan for: "{topic}". '
          "Break it into key areas and questions. Be concise but comprehensive.",
)
plan = plan_interaction.outputs[-1].text

# Pass the refined plan to Deep Research
report = deep_research(f"Execute the following research plan:\n\n{plan}")
```

## Stateful Conversations with Deep Research

The Interactions API supports server-side conversation state. You can
chain interactions using `previous_interaction_id`:

```python
# First research task
interaction1 = client.interactions.create(
    agent="deep-research-preview-04-2026",
    input="Research quantum computing breakthroughs in 2026.",
    background=True,
)
# ... poll until complete ...

# Follow-up referencing previous context
interaction2 = client.interactions.create(
    agent="deep-research-preview-04-2026",
    input="Now compare these breakthroughs with classical computing limitations.",
    background=True,
    previous_interaction_id=interaction1.id,
)
```

## Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input` | string | Yes | The research query or topic |
| `agent` | string | Yes | One of `deep-research-preview-04-2026` (default) or `deep-research-max-preview-04-2026` (highest depth) |
| `background` | boolean | Yes | Set to `True` for async execution |
| `previous_interaction_id` | string | No | Chain to a previous interaction for context |

## Status Values

| Status | Meaning |
|--------|---------|
| `in_progress` | Agent is still researching |
| `completed` | Report is ready in `outputs[-1].text` |
| `failed` | Research failed — check `error` field |
| `cancelled` | Research was cancelled |

## Tips and Gotchas

- **Long-running**: Expect 5–15 minutes per research task. Max research time is 60 minutes.
- **No streaming**: Deep Research does not support streaming. You must poll via `client.interactions.get()`.
- **Rate limits**: The Interactions API has separate rate limits from `generateContent`. Expect lower throughput.
- **Report quality**: The agent performs real web searches. More specific queries produce better reports.
- **Plan first**: For best results, generate a research plan with a standard model first, then pass it to Deep Research.
- **Agent name**: As of May 2026, use `deep-research-preview-04-2026` for typical research, or `deep-research-max-preview-04-2026` for maximum-depth reports (longer wall time and higher cost).
- **Audio inputs not supported**: The Deep Research agent does not accept audio inputs.
- **Output is markdown**: Reports come back as structured markdown with headers, bullet points, and citations.
- **Google Search is built-in**: The agent uses Google Search by default. Grounding restrictions apply to results.

## Migration from Raw REST

If you previously used raw REST calls to `https://generativelanguage.googleapis.com/v1beta/interactions`,
the SDK is now the recommended approach. The `client.interactions.create()` and
`client.interactions.get()` methods handle authentication, serialization, and
error handling automatically.
