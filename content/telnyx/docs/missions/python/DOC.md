---
name: missions
description: "Create and manage Telnyx Missions — automated workflows, tasks, and sub-resources for AI-driven telecom operations."
metadata:
  languages: "python"
  versions: "4.60.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,missions,workflows,automation,tasks"
---

# Telnyx Missions Python SDK Coding Guidelines

You are a Telnyx Missions API expert. Help the user write correct, production-ready code using the official Telnyx Python SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `from telnyx import Telnyx`
- **Incorrect:** `import telnyx` without using the client class

## Installation

```bash
pip install telnyx
```

## Setup

```python
import os
from telnyx import Telnyx

client = Telnyx(
    api_key=os.environ.get("TELNYX_API_KEY"),  # This is the default and can be omitted
)
```

All examples below assume `client` is already initialized as shown above.

## List missions

List all missions for the organization

`GET /ai/missions`

```python
page = client.ai.missions.list()
page = page.data[0]
print(page.mission_id)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Create mission

Create a new mission definition

`POST /ai/missions` — Required: `name`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string)

```python
mission = client.ai.missions.create(
    name="name",
)
print(mission.data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## List recent events

List recent events across all missions

`GET /ai/missions/events`

```python
page = client.ai.missions.list_events()
page = page.data[0]
print(page.event_id)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## List recent runs

List recent runs across all missions

`GET /ai/missions/runs`

```python
page = client.ai.missions.runs.list_runs()
page = page.data[0]
print(page.mission_id)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get mission

Get a mission by ID (includes tools, knowledge_bases, mcp_servers)

`GET /ai/missions/{mission_id}`

```python
mission = client.ai.missions.retrieve(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(mission.data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Update mission

Update a mission definition

`PUT /ai/missions/{mission_id}`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string), `name` (string)

```python
response = client.ai.missions.update_mission(
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Delete mission

Delete a mission

`DELETE /ai/missions/{mission_id}`

```python
client.ai.missions.delete_mission(
    "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
```

## Clone mission

Clone an existing mission

`POST /ai/missions/{mission_id}/clone`

```python
response = client.ai.missions.clone_mission(
    "mission_id",
)
print(response)
```

## List knowledge bases

List all knowledge bases for a mission

`GET /ai/missions/{mission_id}/knowledge-bases`

```python
response = client.ai.missions.knowledge_bases.list_knowledge_bases(
    "mission_id",
)
print(response)
```

## Create knowledge base

Create a new knowledge base for a mission

`POST /ai/missions/{mission_id}/knowledge-bases`

```python
response = client.ai.missions.knowledge_bases.create_knowledge_base(
    "mission_id",
)
print(response)
```

## Get knowledge base

Get a specific knowledge base by ID

`GET /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```python
response = client.ai.missions.knowledge_bases.get_knowledge_base(
    knowledge_base_id="knowledge_base_id",
    mission_id="mission_id",
)
print(response)
```

## Update knowledge base

Update a knowledge base definition

`PUT /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```python
response = client.ai.missions.knowledge_bases.update_knowledge_base(
    knowledge_base_id="knowledge_base_id",
    mission_id="mission_id",
)
print(response)
```

## Delete knowledge base

Delete a knowledge base from a mission

`DELETE /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```python
client.ai.missions.knowledge_bases.delete_knowledge_base(
    knowledge_base_id="knowledge_base_id",
    mission_id="mission_id",
)
```

## List MCP servers

List all MCP servers for a mission

`GET /ai/missions/{mission_id}/mcp-servers`

```python
response = client.ai.missions.mcp_servers.list_mcp_servers(
    "mission_id",
)
print(response)
```

## Create MCP server

Create a new MCP server for a mission

`POST /ai/missions/{mission_id}/mcp-servers`

```python
response = client.ai.missions.mcp_servers.create_mcp_server(
    "mission_id",
)
print(response)
```

## Get MCP server

Get a specific MCP server by ID

`GET /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```python
response = client.ai.missions.mcp_servers.get_mcp_server(
    mcp_server_id="mcp_server_id",
    mission_id="mission_id",
)
print(response)
```

## Update MCP server

Update an MCP server definition

`PUT /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```python
response = client.ai.missions.mcp_servers.update_mcp_server(
    mcp_server_id="mcp_server_id",
    mission_id="mission_id",
)
print(response)
```

## Delete MCP server

Delete an MCP server from a mission

`DELETE /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```python
client.ai.missions.mcp_servers.delete_mcp_server(
    mcp_server_id="mcp_server_id",
    mission_id="mission_id",
)
```

## List runs for mission

List all runs for a specific mission

`GET /ai/missions/{mission_id}/runs`

```python
page = client.ai.missions.runs.list(
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
page = page.data[0]
print(page.mission_id)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Start a run

Start a new run for a mission

`POST /ai/missions/{mission_id}/runs`

Optional: `input` (object), `metadata` (object)

```python
run = client.ai.missions.runs.create(
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(run.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get run details

Get details of a specific run

`GET /ai/missions/{mission_id}/runs/{run_id}`

```python
run = client.ai.missions.runs.retrieve(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(run.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Update run

Update run status and/or result

`PATCH /ai/missions/{mission_id}/runs/{run_id}`

Optional: `error` (string), `metadata` (object), `result_payload` (object), `result_summary` (string), `status` (enum: pending, running, paused, succeeded, failed, cancelled)

```python
run = client.ai.missions.runs.update(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(run.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Cancel run

Cancel a running or paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/cancel`

```python
response = client.ai.missions.runs.cancel_run(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List events

List events for a run (paginated)

`GET /ai/missions/{mission_id}/runs/{run_id}/events`

```python
page = client.ai.missions.runs.events.list(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
page = page.data[0]
print(page.event_id)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Log event

Log an event for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/events` — Required: `type`, `summary`

Optional: `agent_id` (string), `idempotency_key` (string), `payload` (object), `step_id` (string)

```python
response = client.ai.missions.runs.events.log(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    summary="summary",
    type="status_change",
)
print(response.data)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Get event details

Get details of a specific event

`GET /ai/missions/{mission_id}/runs/{run_id}/events/{event_id}`

```python
response = client.ai.missions.runs.events.get_event_details(
    event_id="event_id",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Pause run

Pause a running run

`POST /ai/missions/{mission_id}/runs/{run_id}/pause`

```python
response = client.ai.missions.runs.pause_run(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get plan

Get the plan (all steps) for a run

`GET /ai/missions/{mission_id}/runs/{run_id}/plan`

```python
plan = client.ai.missions.runs.plan.retrieve(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(plan.data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Create initial plan

Create the initial plan for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/plan` — Required: `steps`

```python
plan = client.ai.missions.runs.plan.create(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    steps=[{
        "description": "description",
        "sequence": 0,
        "step_id": "step_id",
    }],
)
print(plan.data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Add step(s) to plan

Add one or more steps to an existing plan

`POST /ai/missions/{mission_id}/runs/{run_id}/plan/steps` — Required: `steps`

```python
response = client.ai.missions.runs.plan.add_steps_to_plan(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    steps=[{
        "description": "description",
        "sequence": 0,
        "step_id": "step_id",
    }],
)
print(response.data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Get step details

Get details of a specific plan step

`GET /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

```python
response = client.ai.missions.runs.plan.get_step_details(
    step_id="step_id",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Update step status

Update the status of a plan step

`PATCH /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

Optional: `metadata` (object), `status` (enum: pending, in_progress, completed, skipped, failed)

```python
response = client.ai.missions.runs.plan.update_step(
    step_id="step_id",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Resume run

Resume a paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/resume`

```python
response = client.ai.missions.runs.resume_run(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(response.data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List linked Telnyx agents

List all Telnyx agents linked to a run

`GET /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents`

```python
telnyx_agents = client.ai.missions.runs.telnyx_agents.list(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
print(telnyx_agents.data)
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Link Telnyx agent to run

Link a Telnyx AI agent (voice/messaging) to a run

`POST /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents` — Required: `telnyx_agent_id`

```python
response = client.ai.missions.runs.telnyx_agents.link(
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    telnyx_agent_id="telnyx_agent_id",
)
print(response.data)
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Unlink Telnyx agent

Unlink a Telnyx agent from a run

`DELETE /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents/{telnyx_agent_id}`

```python
client.ai.missions.runs.telnyx_agents.unlink(
    telnyx_agent_id="telnyx_agent_id",
    mission_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
    run_id="182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
)
```

## List tools

List all tools for a mission

`GET /ai/missions/{mission_id}/tools`

```python
response = client.ai.missions.tools.list_tools(
    "mission_id",
)
print(response)
```

## Create tool

Create a new tool for a mission

`POST /ai/missions/{mission_id}/tools`

```python
response = client.ai.missions.tools.create_tool(
    "mission_id",
)
print(response)
```

## Get tool

Get a specific tool by ID

`GET /ai/missions/{mission_id}/tools/{tool_id}`

```python
response = client.ai.missions.tools.get_tool(
    tool_id="tool_id",
    mission_id="mission_id",
)
print(response)
```

## Update tool

Update a tool definition

`PUT /ai/missions/{mission_id}/tools/{tool_id}`

```python
response = client.ai.missions.tools.update_tool(
    tool_id="tool_id",
    mission_id="mission_id",
)
print(response)
```

## Delete tool

Delete a tool from a mission

`DELETE /ai/missions/{mission_id}/tools/{tool_id}`

```python
client.ai.missions.tools.delete_tool(
    tool_id="tool_id",
    mission_id="mission_id",
)
```
