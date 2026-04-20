# Vectara Agents API

Agents are AI entities that use tools and corpora to handle multi-step queries autonomously.

## Create an Agent

```python
resp = requests.post(
    f"{BASE_URL}/agents",
    headers=headers,
    json={
        "name": "Research Assistant",
        "description": "Answers research questions using internal docs",
        "model": {
            "name": "gpt-4o",
            "parameters": {"temperature": 0.3, "max_tokens": 2048},
        },
        "first_step_name": "main",
        "steps": {
            "main": {
                "instructions": [
                    {
                        "type": "inline",
                        "name": "system_prompt",
                        "template": (
                            "You are a research assistant. Search the knowledge base "
                            "before answering. Always cite your sources. If unsure, say so."
                        ),
                    }
                ],
                "output_parser": {"type": "default"},
            },
        },
        "tool_configurations": {
            "corpus_search": {
                "type": "corpora_search",
                "query_configuration": {
                    "search": {
                        "corpora": [{"corpus_key": "my-corpus"}],
                        "limit": 100,
                        "context_configuration": {
                            "sentences_before": 2,
                            "sentences_after": 2,
                        },
                        "reranker": {
                            "type": "customer_reranker",
                            "reranker_name": "Rerank_Multilingual_v1",
                            "limit": 30,
                        },
                    },
                    "generation": {
                        "generation_preset_name": "vectara-summary-ext-24-05-med-omni",
                    },
                    "save_history": True,
                },
            },
        },
    },
)
agent = resp.json()
agent_key = agent["key"]
```

## List Agents

```python
resp = requests.get(f"{BASE_URL}/agents", headers=headers)
for agent in resp.json()["agents"]:
    print(f"{agent['key']}: {agent['name']}")
```

## Get Agent Details

```python
resp = requests.get(f"{BASE_URL}/agents/{agent_key}", headers=headers)
agent = resp.json()
```

## Update Agent

Partial update — only specified fields change:

```python
resp = requests.patch(
    f"{BASE_URL}/agents/{agent_key}",
    headers=headers,
    json={
        "description": "Updated description",
        "model": {
            "name": "gpt-4o",
            "parameters": {"temperature": 0.5},
        },
    },
)
```

## Replace Agent

Full replacement — uses the same schema as create. All fields must be provided:

```python
resp = requests.put(
    f"{BASE_URL}/agents/{agent_key}",
    headers=headers,
    json={
        "name": "Research Assistant v2",
        "description": "Improved research agent",
        "model": {
            "name": "gpt-4o",
            "parameters": {"temperature": 0.2},
        },
        "first_step_name": "main",
        "steps": {
            "main": {
                "instructions": [
                    {
                        "type": "inline",
                        "name": "system_prompt",
                        "template": "You are a thorough research assistant. Always cite sources.",
                    }
                ],
                "output_parser": {"type": "default"},
            },
        },
        "tool_configurations": {
            "corpus_search": {
                "type": "corpora_search",
                "query_configuration": {
                    "search": {
                        "corpora": [{"corpus_key": "my-corpus"}],
                        "limit": 100,
                    },
                    "generation": {
                        "generation_preset_name": "vectara-summary-ext-24-05-med-omni",
                    },
                    "save_history": True,
                },
            },
        },
    },
)
```

## Delete Agent

```python
resp = requests.delete(f"{BASE_URL}/agents/{agent_key}", headers=headers)
# 204 = success
```

## Tool Configurations

Tools are defined in the `tool_configurations` dict when creating or updating an agent. Each key is a tool name, and the value specifies the tool type and config.

### Tool Types

**Corpus search** — search one or more corpora:

```python
"corpus_search": {
    "type": "corpora_search",
    "query_configuration": {
        "search": {
            "corpora": [{"corpus_key": "my-corpus"}],
            "limit": 100,
            "reranker": {"type": "customer_reranker", "reranker_name": "Rerank_Multilingual_v1", "limit": 30},
        },
        "generation": {"generation_preset_name": "vectara-summary-ext-24-05-med-omni"},
        "save_history": True,
    },
}
```

**Web search** — internet search:

```python
"web": {"type": "web_search"}
```

**Sub-agent** — delegate to another agent:

```python
"research_agent": {
    "type": "sub_agent",
    "description_template": "Handles deep research questions",
    "sub_agent_configuration": {
        "agent_key": "agt_...",
        "session_mode": "ephemeral",  # No memory between calls
    },
}
```

**Lambda tool** — custom Python code:

```python
"analyzer": {"type": "lambda", "tool_id": "tol_1234"}
```

**Artifact tools** — for file handling in sessions:

```python
"read_file": {"type": "artifact_read"}
"read_image": {"type": "image_read"}
"convert_doc": {"type": "document_conversion"}
"search_file": {"type": "artifact_grep"}
```

## Lambda Tools

Create reusable custom tools with Python code. The code must define a `process()` function.

### Create a Lambda Tool

```python
resp = requests.post(
    f"{BASE_URL}/tools",
    headers=headers,
    json={
        "type": "lambda",
        "language": "python",
        "name": "calculate_stats",
        "title": "Statistics Calculator",
        "description": "Calculates summary statistics for a list of numbers",
        "code": """
def process(numbers: list[float]) -> dict:
    import numpy as np
    arr = np.array(numbers)
    return {"mean": float(arr.mean()), "std": float(arr.std()), "median": float(np.median(arr))}
""",
    },
)
tool_id = resp.json()["id"]  # e.g., "tol_..."
```

Available libraries in Lambda: `json`, `pandas` (as `pd`), `numpy` (as `np`).

### List Tools

```python
resp = requests.get(f"{BASE_URL}/tools", headers=headers)
```

### Delete a Tool

```python
resp = requests.delete(f"{BASE_URL}/tools/{tool_id}", headers=headers)
# 204 = success
```

## Tool Servers

Tool servers are external services that agents can call as tools.

### Create a Tool Server

```python
resp = requests.post(
    f"{BASE_URL}/tool_servers",
    headers=headers,
    json={
        "name": "my-tool-server",
        "description": "Custom tool server for data lookups",
        "url": "https://my-tools.example.com/api",
        "authentication": {
            "type": "api_key",
            "api_key": "server-api-key",
        },
    },
)
tool_server = resp.json()
tool_server_key = tool_server["tool_server_key"]
```

### List Tool Servers

```python
resp = requests.get(f"{BASE_URL}/tool_servers", headers=headers)
```

### Get a Tool Server

```python
resp = requests.get(f"{BASE_URL}/tool_servers/{tool_server_key}", headers=headers)
```

### Update a Tool Server

```python
resp = requests.patch(
    f"{BASE_URL}/tool_servers/{tool_server_key}",
    headers=headers,
    json={"description": "Updated description"},
)
```

### Delete a Tool Server

```python
resp = requests.delete(f"{BASE_URL}/tool_servers/{tool_server_key}", headers=headers)
# 204 = success
```

## Sessions (Multi-turn Conversations)

Sessions maintain conversation state across multiple interactions.

### Create a Session

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions",
    headers=headers,
    json={
        "name": "Research session",
        "metadata": {"user_type": "developer", "purpose": "Q4 analysis"},
    },
)
session = resp.json()
session_key = session["key"]
```

### Send a Message to an Agent

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events",
    headers=headers,
    json={
        "type": "input_message",
        "messages": [
            {"type": "text", "content": "What were our Q4 revenue numbers?"}
        ],
        "stream_response": False,
    },
)
data = resp.json()
for event in data["events"]:
    if event["type"] == "agent_output":
        print(event["content"])
    elif event["type"] == "tool_input":
        print(f"Tool used: {event['tool_configuration_name']}")
```

Response event types:
- `input_message` — echoes the user's message
- `agent_output` — the agent's answer (field: `content`)
- `tool_input` — tool invocation details
- `tool_output` — tool results

### Streaming Messages

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events",
    headers={**headers, "Accept": "text/event-stream"},
    json={
        "type": "input_message",
        "messages": [
            {"type": "text", "content": "Summarize the latest incident report"}
        ],
        "stream_response": True,
    },
    stream=True,
)
for line in resp.iter_lines():
    if line:
        print(line.decode())
```

### List Sessions

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions",
    headers=headers,
)
```

### Get a Specific Session

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}",
    headers=headers,
)
session = resp.json()
```

### Update a Session

```python
resp = requests.patch(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}",
    headers=headers,
    json={
        "name": "Renamed session",
        "metadata": {"topic": "Q4 analysis"},
    },
)
```

### Delete a Session

```python
resp = requests.delete(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}",
    headers=headers,
)
# 204 = success
```

## Session Events

Events are the individual messages and actions within a session (user messages, agent outputs, tool calls).

### List Events

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events",
    headers=headers,
)
for event in resp.json()["events"]:
    if event["type"] == "agent_output":
        print(f"Agent: {event['content']}")
    elif event["type"] == "input_message":
        print(f"User: {event['content']}")
    elif event["type"] == "tool_input":
        print(f"Tool call: {event['tool_configuration_name']}")
```

### Get a Specific Event

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events/{event_id}",
    headers=headers,
)
```

### Delete an Event

```python
resp = requests.delete(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events/{event_id}",
    headers=headers,
)
# 204 = success
```

### Hide / Unhide Events

Hide events from the conversation context without deleting them:

```python
# Hide an event
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events/{event_id}/hide",
    headers=headers,
)

# Unhide an event
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events/{event_id}/unhide",
    headers=headers,
)
```

## Session Artifacts

Artifacts are files uploaded to or produced by an agent during a session. Default TTL: 30 days.

### Upload an Artifact

Upload files via the events endpoint using multipart form data:

```python
with open("data.csv", "rb") as f:
    resp = requests.post(
        f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/events",
        headers={"x-api-key": API_KEY, "Accept": "application/json"},
        files={"files": ("data.csv", f, "text/csv")},
        data={"stream_response": "false"},
    )
# Response includes artifact_upload events with artifact_id, filename, mime_type, size_bytes
```

### List Artifacts

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/artifacts",
    headers=headers,
)
for artifact in resp.json()["artifacts"]:
    print(f"{artifact['artifact_id']}: {artifact['filename']} ({artifact['mime_type']})")
```

### Get a Specific Artifact

```python
resp = requests.get(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/artifacts/{artifact_id}",
    headers=headers,
)
artifact = resp.json()
```

## Schedules

Automate agent execution on a recurring basis:

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/schedules",
    headers=headers,
    json={
        "name": "daily-summary",
        "cron_expression": "0 9 * * *",  # 9 AM daily
        "query": "Summarize new documents added in the last 24 hours",
    },
)
```

## Instructions

Instructions are a top-level resource that can be shared across agents. They define how an agent should behave, reason, and respond. Instructions support Velocity templating.

### Create an Instruction

```python
resp = requests.post(
    f"{BASE_URL}/instructions",
    headers=headers,
    json={
        "name": "Customer Support Guide",
        "description": "Defines tone and behavior for support interactions",
        "template": (
            "You are a customer support agent for the "
            "${session.metadata.department} department. "
            "Always search before answering. Cite sources with [1], [2] notation."
        ),
        "enabled": True,
        "metadata": {"owner": "support-team", "version": "1.0.0"},
    },
)
instruction = resp.json()
instruction_id = instruction["id"]
```

### Use an Instruction by Reference in an Agent

Instead of inlining instructions, reference a shared instruction by ID:

```python
"steps": {
    "main": {
        "instructions": [
            {
                "type": "reference",
                "id": instruction_id,
                "version": 1,  # Optional; omit for latest
            }
        ],
        "output_parser": {"type": "default"},
    },
}
```

### List Instructions

```python
resp = requests.get(f"{BASE_URL}/instructions", headers=headers)
```

### Delete an Instruction

```python
resp = requests.delete(f"{BASE_URL}/instructions/{instruction_id}", headers=headers)
# 204 = success
```
