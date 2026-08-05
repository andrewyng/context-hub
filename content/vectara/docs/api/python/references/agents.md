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

## Multi-Step Workflows

An agent can define multiple named steps in the `steps` map and route between them with conditional transitions. Use this for classify-then-route patterns, multi-phase workflows, or handing off to specialized sub-prompts.

Each step is executed serially — for parallel work, give the agent other agents as tools (`sub_agent`) instead.

### Define Multiple Steps

```python
resp = requests.post(
    f"{BASE_URL}/agents",
    headers=headers,
    json={
        "name": "Support Router",
        "model": {"name": "gpt-4o", "parameters": {"temperature": 0.2}},
        "first_step_name": "classifier",
        "steps": {
            "classifier": {
                "instructions": [
                    {
                        "type": "inline",
                        "template": (
                            "Classify the user's intent into one of: "
                            "`billing`, `technical`, `general`. Respond with JSON "
                            "matching the output schema."
                        ),
                    }
                ],
                "output_parser": {
                    "type": "structured",
                    "json_schema": {
                        "type": "object",
                        "properties": {"intent": {"type": "string"}},
                        "required": ["intent"],
                    },
                },
                "next_steps": [
                    {"condition": "get('$.output.intent') == 'billing'", "step_name": "billing_handler"},
                    {"condition": "get('$.output.intent') == 'technical'", "step_name": "tech_handler"},
                    {"step_name": "general_handler"},  # Catch-all (no condition)
                ],
                "allowed_tools": [],  # Classifier does no tool calls
            },
            "billing_handler": {
                "instructions": [
                    {"type": "inline", "template": "You are a billing specialist. Search billing docs before answering."}
                ],
                "output_parser": {"type": "default"},
                "allowed_tools": ["billing_search"],
                "reentry_step": "classifier",  # Re-classify on the next user message
            },
            "tech_handler": {
                "instructions": [
                    {"type": "inline", "template": "You are a technical specialist. Search engineering docs."}
                ],
                "output_parser": {"type": "default"},
                "allowed_tools": ["tech_search"],
                "reentry_step": "classifier",
            },
            "general_handler": {
                "instructions": [
                    {"type": "inline", "template": "You handle general questions. Be brief."}
                ],
                "output_parser": {"type": "default"},
                "allowed_tools": [],
                "reentry_step": "classifier",
            },
        },
        "tool_configurations": {
            "billing_search": {"type": "corpora_search", "query_configuration": {"search": {"corpora": [{"corpus_key": "billing-docs"}]}}},
            "tech_search":    {"type": "corpora_search", "query_configuration": {"search": {"corpora": [{"corpus_key": "engineering-docs"}]}}},
        },
    },
)
```

### Transition Conditions

`next_steps` entries are evaluated in order — the **first matching condition** wins. An entry with no `condition` is a catch-all; place it last.

Conditions are [UserFn](https://docs.vectara.com/docs/search-and-retrieval/rerankers/user-defined-function-reranker) boolean expressions using `get()` with JSONPath over this context:

| Path | Contents |
|------|----------|
| `$.output.text` | LLM text output (when `output_parser.type == "default"`) |
| `$.output.<field>` | Structured output fields (when `output_parser.type == "structured"`) |
| `$.session.metadata.<key>` | Session metadata |
| `$.agent.metadata.<key>` | Agent metadata |
| `$.tools.<tool_name>.outputs.latest.<field>` | Latest tool output |
| `$.currentDate` | ISO timestamp |

Examples:
```python
{"condition": "get('$.output.intent') == 'sales'", "step_name": "sales_handler"}
{"condition": "get('$.tools.corpus_search.outputs.latest.score') < 0.3", "step_name": "fallback"}
```

If no condition matches, the agent stops on the current step and emits output.

### Per-Step Controls

- `allowed_tools` — list of tool-configuration names this step may call. `null` (omitted) = all; `[]` = text-only.
- `allowed_skills` — same pattern for skills (see below).
- `reentry_step` — which step to resume at when the user sends the next message. Omit to stay on the current step; set to `first_step_name` to always restart the flow.
- `reminders` — messages injected into conversation context when specific events occur, to keep long conversations on-task.

## Skills

Skills are progressively-disclosed instructions. The agent sees only the **skill name + description** in its system message; the full `content` is loaded on demand when the LLM decides to invoke the skill via the built-in `invoke_skill` tool. This keeps the base prompt small while giving the agent access to large, specialized instruction sets.

Skills are defined at the agent level and can be filtered per step via `allowed_skills`.

### Define Skills on an Agent

```python
resp = requests.post(
    f"{BASE_URL}/agents",
    headers=headers,
    json={
        "name": "Engineering Assistant",
        "model": {"name": "gpt-4o", "parameters": {"temperature": 0.2}},
        "first_step_name": "main",
        "steps": {
            "main": {
                "instructions": [
                    {"type": "inline", "template": "You help engineers. Invoke skills when they match the task."}
                ],
                "output_parser": {"type": "default"},
                "allowed_skills": ["code_review", "incident_response"],  # This step may invoke these
            },
        },
        "skills": {
            "code_review": {
                "description": "Reviews code for best practices, bugs, and security issues.",
                "content": (
                    "When reviewing code, check for security vulnerabilities (injection, "
                    "auth bypass, unsafe deserialization), performance issues (N+1 queries, "
                    "unnecessary allocations), and adherence to our style guide. Cite line "
                    "numbers. End with a prioritized list of suggested changes."
                ),
            },
            "incident_response": {
                "description": "Guides on-call engineers through an incident triage workflow.",
                "content": (
                    "1. Establish severity (SEV1/2/3). 2. Open a war-room channel. "
                    "3. Identify the blast radius. 4. Mitigate before diagnosing root cause. "
                    "5. Page the service owner if user-facing. ..."
                ),
            },
        },
        "tool_configurations": {},
    },
)
```

Each skill entry requires `description` (≤500 chars) and `content` (≤50 000 chars).

### Per-Step Skill Filtering

`allowed_skills` on a step restricts which skills the LLM can invoke at that point:
- Omit (null) → all agent skills available
- `[]` → no skills; `invoke_skill` tool is not shown to the LLM
- `["code_review"]` → only `code_review` is invocable in this step

### Skills vs Instructions vs Tools

- **Instructions** (`steps[x].instructions`) — always included in the system prompt. Use for core behavior that must always apply.
- **Skills** — name + description always shown; full content loaded only when invoked. Use for large, specialized instruction sets that only apply to specific tasks.
- **Tools** (`tool_configurations`) — executed actions that return data (search, web, lambda). Use when the agent needs to **do** something, not just **know** something.

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

## Pipelines

Pipelines continuously ingest data from a source system (e.g., S3) and send each record to an agent for processing. Each record creates a new agent session — this is how pipelines differ from **schedules** (recurring single execution of one agent) and **connectors** (bidirectional chat like Slack).

### Create a Pipeline

```python
resp = requests.post(
    f"{BASE_URL}/pipelines",
    headers=headers,
    json={
        "key": "s3-legal-ingest",  # Optional; auto-generated if omitted
        "name": "Legal Docs S3 Ingest",
        "description": "Ingests contracts from S3 and routes them to the legal review agent",
        "source": {
            "type": "s3",
            "bucket": "my-legal-docs",
            "region": "us-east-1",
            "prefix": "contracts/2026/",          # Optional — scope to a subfolder
            "access_key_id": "AKIA...",           # Encrypted at rest, not returned in responses
            "secret_access_key": "...",
            # "endpoint_url": "https://minio.example.com:9000",  # Optional — for S3-compatible stores
        },
        "trigger": {
            "type": "cron",
            "expression": "0 */6 * * *",         # Every 6 hours, UTC
        },
        "transform": {
            "type": "agent",
            "agent_key": agent_key,
            # Optional output verification:
            # "verification": {"type": "condition", "expression": "get('$.output.status') == 'success'"},
            # or a judge agent:
            # "verification": {"type": "agent", "agent_key": "agt_judge_..."},
        },
        "sync_mode": "incremental",              # or "full_refresh" — default: "incremental"
        "enabled": True,
    },
)
pipeline = resp.json()
pipeline_key = pipeline["key"]
```

Trigger types:
- `cron` — 5-field UTC cron expression
- `interval` — ISO-8601 duration (e.g., `"duration": "PT1H"` for hourly)
- `manual` — only runs via the trigger endpoint

Source types currently include `s3` (S3-compatible storage). Additional source types (e.g., `sharepoint`) are available; check `GET /v2/pipelines?source_type=...` for what's live in your account.

### List Pipelines

```python
resp = requests.get(
    f"{BASE_URL}/pipelines",
    headers=headers,
    params={"enabled": True, "limit": 50},
)
for p in resp.json()["pipelines"]:
    print(f"{p['key']}: {p['name']} — {p.get('status')}")
```

### Get / Update / Delete

```python
# Get
resp = requests.get(f"{BASE_URL}/pipelines/{pipeline_key}", headers=headers)

# Partial update
resp = requests.patch(
    f"{BASE_URL}/pipelines/{pipeline_key}",
    headers=headers,
    json={"enabled": False, "description": "Paused for Q2 audit"},
)

# Replace (full schema required — same as create)
resp = requests.put(f"{BASE_URL}/pipelines/{pipeline_key}", headers=headers, json={...})

# Delete (cancels in-progress runs; does not delete sessions the pipeline created)
resp = requests.delete(f"{BASE_URL}/pipelines/{pipeline_key}", headers=headers)
```

### Trigger a Run Manually

```python
resp = requests.post(
    f"{BASE_URL}/pipelines/{pipeline_key}/trigger",
    headers=headers,
)
run = resp.json()
print(f"Run {run['id']}: {run['status']} (fetched {run['records_fetched']} records)")
# 409 = a run is already in progress for this pipeline
```

### Pipeline Runs

Inspect past executions:

```python
resp = requests.get(f"{BASE_URL}/pipelines/{pipeline_key}/runs", headers=headers)
for run in resp.json()["runs"]:
    print(f"{run['id']}: {run['status']} — fetched {run['records_fetched']}, processed {run['records_processed']}")
```

### Dead Letters

Records that failed processing are captured in a dead-letter queue for reprocessing:

```python
# List dead letters
resp = requests.get(f"{BASE_URL}/pipelines/{pipeline_key}/dead_letters", headers=headers)

# Retry all dead letters
resp = requests.post(f"{BASE_URL}/pipelines/{pipeline_key}/dead_letters/process", headers=headers)
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
