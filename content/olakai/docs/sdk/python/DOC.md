---
name: sdk
description: "Olakai SDK for measuring AI ROI, governing risk, and controlling costs across agents and AI applications"
metadata:
  languages: "python"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-10"
  source: maintainer
  tags: "olakai,ai-analytics,governance,agents,kpi,roi,monitoring"
---

# Olakai Python SDK

Olakai is a vendor-neutral platform that helps enterprises measure AI ROI, govern risk, and control costs across agents and AI applications. The SDK tracks AI interactions from your code and feeds data into KPIs, governance checks, and ROI dashboards.

> **v1.2.0** | Python 3.7+ | `pip install olakai-sdk`

## Installation

```bash
pip install olakai-sdk
```

The import name is `olakaisdk`:

```python
from olakaisdk import olakai_config, olakai, olakai_report, olakai_monitor
```

## Initialize

```python
import os
from olakaisdk import olakai_config

olakai_config(
    api_key=os.getenv("OLAKAI_API_KEY"),
    endpoint="https://app.olakai.ai",  # default
    debug=False  # True for development logging
)
```

Each agent has its own API key. Create one via CLI: `olakai agents create --name "My Agent" --with-api-key`

## Fire-and-Forget Tracking

Track any AI interaction. The call sends data in the background without blocking your code.

```python
from olakaisdk import olakai, OlakaiEventParams

olakai("event", "ai_activity", OlakaiEventParams(
    prompt="Summarize this quarterly report",
    response="Revenue grew 15% quarter-over-quarter...",
    task="Data Processing & Analysis",
    userEmail="analyst@company.com",
    tokens=1200,
    requestTime=3500,  # ms
    chatId="session-abc123",  # groups conversation turns
    customData={
        "DocumentType": "quarterly-report",
        "PageCount": 12,
        "Success": 1,
    },
))
```

## Direct Reporting

Report events without the decorator pattern. Useful when you need inline tracking:

```python
from olakaisdk import olakai_report

olakai_report(
    prompt="Draft an email to the client about project delays",
    response="Dear Client, I wanted to update you on the current timeline...",
    options={
        "task": "Communication Strategy",
        "userEmail": "pm@company.com",
        "tokens": 450,
    }
)
```

## Function Monitoring (Decorator)

Wrap any function to automatically track its input and output:

```python
from olakaisdk import olakai_config, olakai_monitor

olakai_config(os.getenv("OLAKAI_API_KEY"))

@olakai_monitor(
    task="Content Refinement",
    userEmail="editor@company.com",
)
def summarize(text: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Summarize: {text}"}],
    )
    return response.choices[0].message.content

# Use normally — monitoring happens automatically
summary = summarize(long_article)
```

### Dynamic User Email

Pass a lambda to resolve the user at call time:

```python
@olakai_monitor(
    userEmail=lambda args: get_user_email(args[0]),  # args[0] is the first positional arg
    task="Customer Experience",
)
def handle_query(user_id: str, question: str) -> str:
    # Your AI logic
    return answer
```

### Async Support

The decorator works with both sync and async functions:

```python
@olakai_monitor(task="Research & Intelligence")
async def async_research(topic: str) -> str:
    response = await async_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Research: {topic}"}],
    )
    return response.choices[0].message.content
```

## Parameters Reference

All tracking functions accept these fields via `OlakaiEventParams` or option dicts:

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | `str` | The input sent to the AI model |
| `response` | `str` | The AI model's output |
| `userEmail` | `str?` | User email for per-user analytics |
| `chatId` | `str?` | Groups related interactions into a session |
| `task` | `str?` | Task category (e.g., "Customer Experience") |
| `subTask` | `str?` | Specific sub-task within the category |
| `tokens` | `int?` | Total token count for the interaction |
| `requestTime` | `int?` | Request duration in milliseconds |
| `shouldScore` | `bool?` | Whether to run quality scoring |
| `taskExecutionId` | `str?` | Correlates events across agents in a multi-agent task |
| `customData` | `dict?` | Key-value pairs for KPI formulas (see below) |
| `customDimensions` | `dict?` | String dimensions for categorization (`dim1`–`dim5`) |
| `customMetrics` | `dict?` | Numeric values for analysis (`metric1`–`metric5`) |

## Custom Data Pipeline

Custom data flows through Olakai to power KPIs:

```
SDK customData → CustomDataConfig (schema) → Context Variable → KPI Formula → kpiData
```

### How It Works

1. You send `customData` fields with each event
2. Only fields registered as **CustomDataConfigs** on the platform become usable in KPI formulas
3. KPI formulas reference these fields as variables (e.g., `IF(Success = 1, 1, 0)`)
4. Computed KPI values appear on dashboards and in alerts

### Rules

| Rule | Detail |
|------|--------|
| Register fields first | Unregistered `customData` fields are stored but cannot power KPIs |
| NUMBER configs need numeric values | Send `5` (int/float), not `"5"` (str) |
| Formula variables are case-insensitive | `stepCount`, `STEPCOUNT`, `StepCount` all resolve the same |
| KPIs are per-agent | Each agent needs its own KPI definitions |

### Example

```python
# 1. Register via CLI:
#    olakai custom-data create --agent-id $ID --name "StepCount" --type NUMBER
#    olakai custom-data create --agent-id $ID --name "Success" --type NUMBER
#    olakai kpis create --agent-id $ID --name "Steps" --formula "StepCount" --aggregation SUM

# 2. Send matching fields in SDK:
olakai("event", "ai_activity", OlakaiEventParams(
    prompt=task_input,
    response=task_output,
    customData={
        "StepCount": 3,   # int — matches registered config
        "Success": 1,     # int — 1/0 for boolean values
    },
))
```

## Agentic Workflows

For agents that make multiple LLM calls per task, aggregate them into one event:

```python
import time
import uuid
from olakaisdk import olakai, OlakaiEventParams

def process_document(doc: dict) -> str:
    start_time = time.time()
    total_tokens = 0

    # Step 1: Extract
    extraction = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Extract from: {doc['content']}"}],
    )
    total_tokens += extraction.usage.total_tokens

    # Step 2: Analyze
    analysis = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Analyze: {extraction.choices[0].message.content}"}],
    )
    total_tokens += analysis.usage.total_tokens

    result = analysis.choices[0].message.content

    # Track the complete workflow as ONE event
    olakai("event", "ai_activity", OlakaiEventParams(
        prompt=f"Process: {doc['title']}",
        response=result,
        tokens=total_tokens,
        requestTime=int((time.time() - start_time) * 1000),
        taskExecutionId=str(uuid.uuid4()),  # share across agents for correlation
        task="Data Processing & Analysis",
        customData={
            "DocumentType": doc["type"],
            "StepCount": 2,
            "Success": 1,
        },
    ))

    return result
```

### Cross-Agent Task Correlation

When multiple agents collaborate on one task, generate a single `taskExecutionId` in the orchestrator and pass it to every agent. This links their events into one logical task for analytics.

```python
task_id = str(uuid.uuid4())

await classifier_agent.run(input_data, task_execution_id=task_id)
await writer_agent.run(classified, task_execution_id=task_id)
await reviewer_agent.run(draft, task_execution_id=task_id)
```

## Framework Examples

### FastAPI

```python
from fastapi import FastAPI, Depends
from olakaisdk import olakai_config, olakai, OlakaiEventParams

app = FastAPI()

@app.on_event("startup")
async def startup():
    olakai_config(os.getenv("OLAKAI_API_KEY"))

@app.post("/chat")
async def chat(message: str, user: User = Depends(get_current_user)):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": message}],
    )
    reply = response.choices[0].message.content

    olakai("event", "ai_activity", OlakaiEventParams(
        prompt=message,
        response=reply,
        userEmail=user.email,
        task="Customer Experience",
        tokens=response.usage.total_tokens,
    ))

    return {"reply": reply}
```

### Flask

```python
from flask import Flask, request, jsonify
from olakaisdk import olakai_config, olakai, OlakaiEventParams

app = Flask(__name__)
olakai_config(os.getenv("OLAKAI_API_KEY"))

@app.route("/chat", methods=["POST"])
def chat():
    message = request.json["message"]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": message}],
    )
    reply = response.choices[0].message.content

    olakai("event", "ai_activity", OlakaiEventParams(
        prompt=message,
        response=reply,
        task="Customer Experience",
    ))

    return jsonify({"reply": reply})
```

## Content Governance (Blocking)

When governance policies detect sensitive content, the SDK raises `OlakaiBlockedError`:

```python
from olakaisdk import OlakaiBlockedError

try:
    result = monitored_function(user_input)
except OlakaiBlockedError as e:
    # e.details["detectedSensitivity"]: ["PII", "PHI", "CODE", "SECRET"]
    # e.details["isAllowedPersona"]: bool
    if "PII" in e.details.get("detectedSensitivity", []):
        return "This request contains personal information and was blocked by policy."
    raise
```

## Troubleshooting

**Events not appearing:** Verify `olakai_config()` was called before any tracking calls. Enable `debug=True` to see request/response logs.

**Import errors:** The package installs as `olakai-sdk` but imports as `olakaisdk`. Run `pip install --upgrade olakai-sdk` to get the latest version.

**KPIs showing null:** Ensure the field name in `customData` exactly matches the CustomDataConfig name (case-sensitive), and that NUMBER configs receive numeric values (int/float, not str).

## Links

- Full documentation: https://app.olakai.ai/llms.txt
- Dashboard: https://app.olakai.ai
- GitHub: https://github.com/ailocalnode/olakai-sdk-python
