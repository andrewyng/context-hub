---
name: cortex-agents-rest-api
description: "Snowflake Cortex Agents REST API — create, manage, and run agentic AI workflows with built-in tools (Cortex Analyst, Cortex Search, web search, SQL exec) and custom UDF/SP tools"
metadata:
  languages: "sql,python,curl"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "snowflake,cortex,agents,rest-api,agentic-ai,tools,orchestration,llm"
---

# Cortex Agents REST API

Cortex Agents are Snowflake-native agentic AI objects. You define tools, instructions, and an orchestration model — the agent reasons over user queries and invokes the right tools autonomously. Manage them via the REST API at `/api/v2/databases/{db}/schemas/{schema}/agents`.

Requests time out after 15 minutes.

## Authentication

All requests require a `Authorization` header with a Snowflake bearer token (OAuth, key-pair JWT, or PAT). Set `Content-Type: application/json`.

## Create an Agent

```
POST /api/v2/databases/{database}/schemas/{schema}/agents?createMode=errorIfExists
```

`createMode` options: `errorIfExists` (default), `orReplace`, `ifNotExists`.

### Request Body

```json
{
  "name": "MY_AGENT",
  "comment": "An agent to answer questions about all my data",
  "profile": {
    "display_name": "My Agent"
  },
  "models": {
    "orchestration": "claude-4-sonnet"
  },
  "instructions": {
    "response": "You will respond in a friendly but concise manner",
    "orchestration": "For revenue questions use Analyst; for policy use Search",
    "system": "You are a friendly data assistant.",
    "sample_questions": [
      {"question": "What was Q1 revenue?"},
      {"question": "Show me our return policy"}
    ]
  },
  "orchestration": {
    "budget": {
      "seconds": 30,
      "tokens": 16000
    }
  },
  "tools": [
    {
      "tool_spec": {
        "type": "cortex_analyst_text_to_sql",
        "name": "Analyst1",
        "description": "Revenue data via semantic view"
      }
    },
    {
      "tool_spec": {
        "type": "cortex_search",
        "name": "Search1"
      }
    }
  ],
  "tool_resources": {
    "Analyst1": {
      "semantic_view": "DB.SCHEMA.REVENUE_SV"
    },
    "Search1": {
      "name": "DB.SCHEMA.POLICY_SEARCH",
      "max_results": "5"
    }
  }
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `models.orchestration` | LLM for reasoning (e.g. `claude-4-sonnet`, `llama3.1-70b`) |
| `instructions.response` | Controls tone of final answers |
| `instructions.orchestration` | Routing hints — which tool for which query type |
| `instructions.system` | System prompt for the agent |
| `orchestration.budget` | Limits on seconds and tokens per request |
| `tools[].tool_spec.type` | One of: `cortex_analyst_text_to_sql`, `cortex_analyst_sql_exec`, `cortex_search`, `web_search`, `generic` |
| `tool_resources` | Config per tool — keys must match tool names |

## Built-in Tool Types

### Cortex Analyst (text-to-SQL)

```json
{
  "tool_spec": {"type": "cortex_analyst_text_to_sql", "name": "analyst", "description": "Revenue queries"},
  "tool_resources": {"analyst": {"semantic_view": "DB.SCHEMA.MY_VIEW"}}
}
```

Resource can also use `"semantic_model_file": "@STAGE/model.yaml"` instead of `semantic_view`.

### Cortex Analyst (SQL execution)

```json
{
  "tool_spec": {"type": "cortex_analyst_sql_exec", "name": "sql_exec"},
  "tool_resources": {"sql_exec": {"name": "MY_WAREHOUSE", "timeout": "30", "auto_execute": "true"}}
}
```

### Cortex Search

```json
{
  "tool_spec": {"type": "cortex_search", "name": "search"},
  "tool_resources": {
    "search": {
      "name": "DB.SCHEMA.SEARCH_SERVICE",
      "max_results": "5",
      "filter": {"@eq": {"region": "North America"}},
      "title_column": "TITLE",
      "id_column": "DOC_ID"
    }
  }
}
```

### Web Search

```json
{
  "tool_spec": {"type": "web_search", "name": "web"},
  "tool_resources": {"web": {"name": "web_search_1", "function": "DB.SCHEMA.SEARCH_WEB"}}
}
```

### Generic (UDF / Stored Procedure)

```json
{
  "tool_spec": {
    "type": "generic",
    "name": "get_weather",
    "description": "Get weather for a city",
    "input_schema": {
      "type": "object",
      "properties": {
        "location": {"type": "string", "description": "City and state"}
      }
    },
    "required": ["location"]
  },
  "tool_resources": {
    "get_weather": {
      "type": "function",
      "execution_environment": {"type": "warehouse", "warehouse": "MY_WH"},
      "identifier": "DB.SCHEMA.GET_WEATHER_UDF"
    }
  }
}
```

## Run an Agent (Chat)

```
POST /api/v2/databases/{database}/schemas/{schema}/agents/{name}:run
```

### Request Body

```json
{
  "model": "claude-4-sonnet",
  "messages": [
    {"role": "user", "content": [{"type": "text", "text": "What was Q1 revenue by region?"}]}
  ],
  "tools": [],
  "tool_resources": {},
  "stream": true
}
```

Set `stream: true` for server-sent events (SSE). The response streams `event: message.delta` with incremental content, tool invocations, and citations. Final event is `event: message.stop`.

### Streamed Response Events

```
event: message.delta
data: {"delta": {"content": [{"type": "text", "text": "Based on the data..."}]}}

event: message.delta
data: {"delta": {"content": [{"type": "tool_use", "name": "analyst", ...}]}}

event: message.delta
data: {"delta": {"content": [{"type": "tool_results", ...}]}}

event: message.stop
data: {}
```

## Other Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `.../agents` | List agents in schema |
| `GET` | `.../agents/{name}` | Describe an agent |
| `PUT` | `.../agents/{name}` | Update agent (full replace of spec) |
| `DELETE` | `.../agents/{name}` | Drop an agent |

## Python Example (snowflake-connector)

```python
import json, requests
from snowflake.connector import connect

conn = connect(
    account=os.environ["SNOWFLAKE_ACCOUNT"],
    user=os.environ["SNOWFLAKE_USER"],
    authenticator="externalbrowser",
)
token = conn.rest.token

url = f"https://{os.environ['SNOWFLAKE_ACCOUNT']}.snowflakecomputing.com"
resp = requests.post(
    f"{url}/api/v2/databases/MYDB/schemas/PUBLIC/agents/MY_AGENT:run",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={
        "messages": [{"role": "user", "content": [{"type": "text", "text": "Q1 revenue?"}]}],
        "stream": True,
    },
    stream=True,
)

for line in resp.iter_lines():
    if line:
        print(line.decode())
```

## SQL Management

You can also manage agents via SQL:

```sql
-- Create
CREATE OR REPLACE CORTEX AGENT my_agent ...;

-- Describe
DESCRIBE CORTEX AGENT my_agent;

-- List
SHOW CORTEX AGENTS;

-- Drop
DROP CORTEX AGENT my_agent;
```

## Limits

- Request timeout: 15 minutes
- Budget constraints via `orchestration.budget` (seconds and tokens)
- `tool_resources` keys must exactly match tool `name` values
