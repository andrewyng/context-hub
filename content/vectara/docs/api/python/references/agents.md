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
        "instructions": [
            "Search the knowledge base before answering.",
            "Always cite your sources.",
            "If unsure, say so rather than guessing.",
        ],
        "first_step": {
            "tools": ["web_search", "corpus_search"],
        },
        "model_parameters": {
            "llm_name": "gpt-4o",
            "temperature": 0.3,
            "max_tokens": 2048,
        },
        "retry_settings": {
            "max_retries": 3,
            "initial_backoff_ms": 1000,
            "backoff_factor": 2,
            "max_backoff_ms": 10000,
        },
        "metadata": {"category": "Research", "version": "1.0"},
    },
)
agent = resp.json()
agent_key = agent["agent_key"]
```

## List Agents

```python
resp = requests.get(f"{BASE_URL}/agents", headers=headers)
for agent in resp.json()["agents"]:
    print(f"{agent['agent_key']}: {agent['name']}")
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
        "model_parameters": {"temperature": 0.5},
    },
)
```

## Replace Agent

Full replacement — all fields must be provided:

```python
resp = requests.put(
    f"{BASE_URL}/agents/{agent_key}",
    headers=headers,
    json={
        "name": "Research Assistant v2",
        "description": "Improved research agent",
        "instructions": ["Search thoroughly.", "Cite all sources."],
        "first_step": {"tools": ["web_search", "corpus_search"]},
        "model_parameters": {"llm_name": "gpt-4o", "temperature": 0.2},
    },
)
```

## Delete Agent

```python
resp = requests.delete(f"{BASE_URL}/agents/{agent_key}", headers=headers)
# 204 = success
```

## Tools

Tools extend agent capabilities. Three types exist:
- **Built-in tools** — provided by Vectara (e.g., web search, corpus search)
- **Lambda tools** — custom code executed by the platform
- **Tool servers** — external services the agent can call

### Create a Tool

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/tools",
    headers=headers,
    json={
        "name": "web_search",
        "type": "built_in",
        "description": "Search the web for current information",
        "configuration": {
            "max_results": 10,
        },
    },
)
```

### List Tools

```python
resp = requests.get(f"{BASE_URL}/agents/{agent_key}/tools", headers=headers)
```

## Sessions (Multi-turn Conversations)

Sessions maintain conversation state across multiple interactions.

### Create a Session

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions",
    headers=headers,
    json={},
)
session = resp.json()
session_key = session["session_key"]
```

### Interact with an Agent

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/interact",
    headers=headers,
    json={
        "query": "What were our Q4 revenue numbers?",
    },
)
answer = resp.json()
print(answer["answer"])
# The agent searches corpora, uses tools, and returns a grounded answer
```

### Streaming Interaction

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/sessions/{session_key}/interact",
    headers=headers,
    json={
        "query": "Summarize the latest incident report",
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

## Instructions and Examples

### Set Agent Instructions

```python
resp = requests.put(
    f"{BASE_URL}/agents/{agent_key}/instructions",
    headers=headers,
    json={
        "instructions": [
            "Always search before answering.",
            "Respond in the user's language.",
            "Cite sources with [1], [2] notation.",
        ],
    },
)
```

### Add Few-shot Examples

```python
resp = requests.post(
    f"{BASE_URL}/agents/{agent_key}/examples",
    headers=headers,
    json={
        "user_message": "What is our refund policy?",
        "agent_response": "Based on our documentation [1], refunds are available within 30 days of purchase...",
    },
)
```
