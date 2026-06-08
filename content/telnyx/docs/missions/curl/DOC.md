---
name: missions
description: "Create and manage Telnyx Missions — automated workflows, tasks, and sub-resources for AI-driven telecom operations."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,missions,workflows,automation,tasks"
---

# Telnyx Missions REST API Coding Guidelines

You are a Telnyx Missions API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

## Golden Rule: Use the Correct API Endpoints

Always use the documented Telnyx API v2 endpoints at `https://api.telnyx.com/v2/`. Do not fabricate API endpoints or request parameters.

- **Correct:** `curl` with `Authorization: Bearer $TELNYX_API_KEY` header
- **Incorrect:** fabricated endpoints or incorrect authentication headers

## Installation

```text
# curl is pre-installed on macOS, Linux, and Windows 10+
```

## Setup

```bash
export TELNYX_API_KEY="YOUR_API_KEY_HERE"
```

All examples below use `$TELNYX_API_KEY` for authentication.

## List missions

List all missions for the organization

`GET /ai/missions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions"
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Create mission

Create a new mission definition

`POST /ai/missions` — Required: `name`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "string"
}' \
  "https://api.telnyx.com/v2/ai/missions"
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## List recent events

List recent events across all missions

`GET /ai/missions/events`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/events"
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## List recent runs

List recent runs across all missions

`GET /ai/missions/runs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/runs"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get mission

Get a mission by ID (includes tools, knowledge_bases, mcp_servers)

`GET /ai/missions/{mission_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}"
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Update mission

Update a mission definition

`PUT /ai/missions/{mission_id}`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string), `name` (string)

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}"
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Delete mission

Delete a mission

`DELETE /ai/missions/{mission_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}"
```

## Clone mission

Clone an existing mission

`POST /ai/missions/{mission_id}/clone`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/clone"
```

## List knowledge bases

List all knowledge bases for a mission

`GET /ai/missions/{mission_id}/knowledge-bases`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/knowledge-bases"
```

## Create knowledge base

Create a new knowledge base for a mission

`POST /ai/missions/{mission_id}/knowledge-bases`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/knowledge-bases"
```

## Get knowledge base

Get a specific knowledge base by ID

`GET /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}"
```

## Update knowledge base

Update a knowledge base definition

`PUT /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}"
```

## Delete knowledge base

Delete a knowledge base from a mission

`DELETE /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}"
```

## List MCP servers

List all MCP servers for a mission

`GET /ai/missions/{mission_id}/mcp-servers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/mcp-servers"
```

## Create MCP server

Create a new MCP server for a mission

`POST /ai/missions/{mission_id}/mcp-servers`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/mcp-servers"
```

## Get MCP server

Get a specific MCP server by ID

`GET /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/mcp-servers/{mcp_server_id}"
```

## Update MCP server

Update an MCP server definition

`PUT /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/mcp-servers/{mcp_server_id}"
```

## Delete MCP server

Delete an MCP server from a mission

`DELETE /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/mcp-servers/{mcp_server_id}"
```

## List runs for mission

List all runs for a specific mission

`GET /ai/missions/{mission_id}/runs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Start a run

Start a new run for a mission

`POST /ai/missions/{mission_id}/runs`

Optional: `input` (object), `metadata` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get run details

Get details of a specific run

`GET /ai/missions/{mission_id}/runs/{run_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Update run

Update run status and/or result

`PATCH /ai/missions/{mission_id}/runs/{run_id}`

Optional: `error` (string), `metadata` (object), `result_payload` (object), `result_summary` (string), `status` (enum: pending, running, paused, succeeded, failed, cancelled)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Cancel run

Cancel a running or paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/cancel`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/cancel"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List events

List events for a run (paginated)

`GET /ai/missions/{mission_id}/runs/{run_id}/events`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/events"
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Log event

Log an event for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/events` — Required: `type`, `summary`

Optional: `agent_id` (string), `idempotency_key` (string), `payload` (object), `step_id` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "type": "status_change",
  "summary": "string"
}' \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/events"
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Get event details

Get details of a specific event

`GET /ai/missions/{mission_id}/runs/{run_id}/events/{event_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/events/{event_id}"
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Pause run

Pause a running run

`POST /ai/missions/{mission_id}/runs/{run_id}/pause`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/pause"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get plan

Get the plan (all steps) for a run

`GET /ai/missions/{mission_id}/runs/{run_id}/plan`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/plan"
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Create initial plan

Create the initial plan for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/plan` — Required: `steps`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "steps": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/plan"
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Add step(s) to plan

Add one or more steps to an existing plan

`POST /ai/missions/{mission_id}/runs/{run_id}/plan/steps` — Required: `steps`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "steps": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/plan/steps"
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Get step details

Get details of a specific plan step

`GET /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}"
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Update step status

Update the status of a plan step

`PATCH /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

Optional: `metadata` (object), `status` (enum: pending, in_progress, completed, skipped, failed)

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}"
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Resume run

Resume a paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/resume`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/resume"
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List linked Telnyx agents

List all Telnyx agents linked to a run

`GET /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/telnyx-agents"
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Link Telnyx agent to run

Link a Telnyx AI agent (voice/messaging) to a run

`POST /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents` — Required: `telnyx_agent_id`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "telnyx_agent_id": "string"
}' \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/telnyx-agents"
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Unlink Telnyx agent

Unlink a Telnyx agent from a run

`DELETE /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents/{telnyx_agent_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/runs/{run_id}/telnyx-agents/{telnyx_agent_id}"
```

## List tools

List all tools for a mission

`GET /ai/missions/{mission_id}/tools`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/tools"
```

## Create tool

Create a new tool for a mission

`POST /ai/missions/{mission_id}/tools`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/tools"
```

## Get tool

Get a specific tool by ID

`GET /ai/missions/{mission_id}/tools/{tool_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/missions/{mission_id}/tools/{tool_id}"
```

## Update tool

Update a tool definition

`PUT /ai/missions/{mission_id}/tools/{tool_id}`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/tools/{tool_id}"
```

## Delete tool

Delete a tool from a mission

`DELETE /ai/missions/{mission_id}/tools/{tool_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/missions/{mission_id}/tools/{tool_id}"
```
