---
name: missions
description: "Create and manage Telnyx Missions — automated workflows, tasks, and sub-resources for AI-driven telecom operations."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,missions,workflows,automation,tasks"
---

# Telnyx Missions JavaScript SDK Coding Guidelines

You are a Telnyx Missions API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

## Golden Rule: Use the Official SDK

Always use the official `telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import Telnyx from 'telnyx'`
- **Incorrect:** unofficial or outdated Telnyx packages

## Installation

```bash
npm install telnyx
```

## Setup

```javascript
import Telnyx from 'telnyx';

const client = new Telnyx({
  apiKey: process.env['TELNYX_API_KEY'], // This is the default and can be omitted
});
```

All examples below assume `client` is already initialized as shown above.

## List missions

List all missions for the organization

`GET /ai/missions`

```javascript
// Automatically fetches more pages as needed.
for await (const missionData of client.ai.missions.list()) {
  console.log(missionData.mission_id);
}
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Create mission

Create a new mission definition

`POST /ai/missions` — Required: `name`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string)

```javascript
const mission = await client.ai.missions.create({ name: 'name' });

console.log(mission.data);
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## List recent events

List recent events across all missions

`GET /ai/missions/events`

```javascript
// Automatically fetches more pages as needed.
for await (const eventData of client.ai.missions.listEvents()) {
  console.log(eventData.event_id);
}
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## List recent runs

List recent runs across all missions

`GET /ai/missions/runs`

```javascript
// Automatically fetches more pages as needed.
for await (const missionRunData of client.ai.missions.runs.listRuns()) {
  console.log(missionRunData.mission_id);
}
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get mission

Get a mission by ID (includes tools, knowledge_bases, mcp_servers)

`GET /ai/missions/{mission_id}`

```javascript
const mission = await client.ai.missions.retrieve('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(mission.data);
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Update mission

Update a mission definition

`PUT /ai/missions/{mission_id}`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string), `name` (string)

```javascript
const response = await client.ai.missions.updateMission('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(response.data);
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Delete mission

Delete a mission

`DELETE /ai/missions/{mission_id}`

```javascript
await client.ai.missions.deleteMission('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');
```

## Clone mission

Clone an existing mission

`POST /ai/missions/{mission_id}/clone`

```javascript
const response = await client.ai.missions.cloneMission('mission_id');

console.log(response);
```

## List knowledge bases

List all knowledge bases for a mission

`GET /ai/missions/{mission_id}/knowledge-bases`

```javascript
const response = await client.ai.missions.knowledgeBases.listKnowledgeBases('mission_id');

console.log(response);
```

## Create knowledge base

Create a new knowledge base for a mission

`POST /ai/missions/{mission_id}/knowledge-bases`

```javascript
const response = await client.ai.missions.knowledgeBases.createKnowledgeBase('mission_id');

console.log(response);
```

## Get knowledge base

Get a specific knowledge base by ID

`GET /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```javascript
const response = await client.ai.missions.knowledgeBases.getKnowledgeBase('knowledge_base_id', {
  mission_id: 'mission_id',
});

console.log(response);
```

## Update knowledge base

Update a knowledge base definition

`PUT /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```javascript
const response = await client.ai.missions.knowledgeBases.updateKnowledgeBase('knowledge_base_id', {
  mission_id: 'mission_id',
});

console.log(response);
```

## Delete knowledge base

Delete a knowledge base from a mission

`DELETE /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```javascript
await client.ai.missions.knowledgeBases.deleteKnowledgeBase('knowledge_base_id', {
  mission_id: 'mission_id',
});
```

## List MCP servers

List all MCP servers for a mission

`GET /ai/missions/{mission_id}/mcp-servers`

```javascript
const response = await client.ai.missions.mcpServers.listMcpServers('mission_id');

console.log(response);
```

## Create MCP server

Create a new MCP server for a mission

`POST /ai/missions/{mission_id}/mcp-servers`

```javascript
const response = await client.ai.missions.mcpServers.createMcpServer('mission_id');

console.log(response);
```

## Get MCP server

Get a specific MCP server by ID

`GET /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```javascript
const response = await client.ai.missions.mcpServers.getMcpServer('mcp_server_id', {
  mission_id: 'mission_id',
});

console.log(response);
```

## Update MCP server

Update an MCP server definition

`PUT /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```javascript
const response = await client.ai.missions.mcpServers.updateMcpServer('mcp_server_id', {
  mission_id: 'mission_id',
});

console.log(response);
```

## Delete MCP server

Delete an MCP server from a mission

`DELETE /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```javascript
await client.ai.missions.mcpServers.deleteMcpServer('mcp_server_id', { mission_id: 'mission_id' });
```

## List runs for mission

List all runs for a specific mission

`GET /ai/missions/{mission_id}/runs`

```javascript
// Automatically fetches more pages as needed.
for await (const missionRunData of client.ai.missions.runs.list(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
)) {
  console.log(missionRunData.mission_id);
}
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Start a run

Start a new run for a mission

`POST /ai/missions/{mission_id}/runs`

Optional: `input` (object), `metadata` (object)

```javascript
const run = await client.ai.missions.runs.create('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');

console.log(run.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get run details

Get details of a specific run

`GET /ai/missions/{mission_id}/runs/{run_id}`

```javascript
const run = await client.ai.missions.runs.retrieve('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(run.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Update run

Update run status and/or result

`PATCH /ai/missions/{mission_id}/runs/{run_id}`

Optional: `error` (string), `metadata` (object), `result_payload` (object), `result_summary` (string), `status` (enum: pending, running, paused, succeeded, failed, cancelled)

```javascript
const run = await client.ai.missions.runs.update('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(run.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Cancel run

Cancel a running or paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/cancel`

```javascript
const response = await client.ai.missions.runs.cancelRun('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List events

List events for a run (paginated)

`GET /ai/missions/{mission_id}/runs/{run_id}/events`

```javascript
// Automatically fetches more pages as needed.
for await (const eventData of client.ai.missions.runs.events.list(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
)) {
  console.log(eventData.event_id);
}
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Log event

Log an event for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/events` — Required: `type`, `summary`

Optional: `agent_id` (string), `idempotency_key` (string), `payload` (object), `step_id` (string)

```javascript
const response = await client.ai.missions.runs.events.log('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  summary: 'summary',
  type: 'status_change',
});

console.log(response.data);
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Get event details

Get details of a specific event

`GET /ai/missions/{mission_id}/runs/{run_id}/events/{event_id}`

```javascript
const response = await client.ai.missions.runs.events.getEventDetails('event_id', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  run_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Pause run

Pause a running run

`POST /ai/missions/{mission_id}/runs/{run_id}/pause`

```javascript
const response = await client.ai.missions.runs.pauseRun('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get plan

Get the plan (all steps) for a run

`GET /ai/missions/{mission_id}/runs/{run_id}/plan`

```javascript
const plan = await client.ai.missions.runs.plan.retrieve('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(plan.data);
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Create initial plan

Create the initial plan for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/plan` — Required: `steps`

```javascript
const plan = await client.ai.missions.runs.plan.create('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  steps: [
    {
      description: 'description',
      sequence: 0,
      step_id: 'step_id',
    },
  ],
});

console.log(plan.data);
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Add step(s) to plan

Add one or more steps to an existing plan

`POST /ai/missions/{mission_id}/runs/{run_id}/plan/steps` — Required: `steps`

```javascript
const response = await client.ai.missions.runs.plan.addStepsToPlan(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  {
    mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
    steps: [
      {
        description: 'description',
        sequence: 0,
        step_id: 'step_id',
      },
    ],
  },
);

console.log(response.data);
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Get step details

Get details of a specific plan step

`GET /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

```javascript
const response = await client.ai.missions.runs.plan.getStepDetails('step_id', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  run_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Update step status

Update the status of a plan step

`PATCH /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

Optional: `metadata` (object), `status` (enum: pending, in_progress, completed, skipped, failed)

```javascript
const response = await client.ai.missions.runs.plan.updateStep('step_id', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  run_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Resume run

Resume a paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/resume`

```javascript
const response = await client.ai.missions.runs.resumeRun('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});

console.log(response.data);
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List linked Telnyx agents

List all Telnyx agents linked to a run

`GET /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents`

```javascript
const telnyxAgents = await client.ai.missions.runs.telnyxAgents.list(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);

console.log(telnyxAgents.data);
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Link Telnyx agent to run

Link a Telnyx AI agent (voice/messaging) to a run

`POST /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents` — Required: `telnyx_agent_id`

```javascript
const response = await client.ai.missions.runs.telnyxAgents.link(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', telnyx_agent_id: 'telnyx_agent_id' },
);

console.log(response.data);
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Unlink Telnyx agent

Unlink a Telnyx agent from a run

`DELETE /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents/{telnyx_agent_id}`

```javascript
await client.ai.missions.runs.telnyxAgents.unlink('telnyx_agent_id', {
  mission_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  run_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
});
```

## List tools

List all tools for a mission

`GET /ai/missions/{mission_id}/tools`

```javascript
const response = await client.ai.missions.tools.listTools('mission_id');

console.log(response);
```

## Create tool

Create a new tool for a mission

`POST /ai/missions/{mission_id}/tools`

```javascript
const response = await client.ai.missions.tools.createTool('mission_id');

console.log(response);
```

## Get tool

Get a specific tool by ID

`GET /ai/missions/{mission_id}/tools/{tool_id}`

```javascript
const response = await client.ai.missions.tools.getTool('tool_id', { mission_id: 'mission_id' });

console.log(response);
```

## Update tool

Update a tool definition

`PUT /ai/missions/{mission_id}/tools/{tool_id}`

```javascript
const response = await client.ai.missions.tools.updateTool('tool_id', { mission_id: 'mission_id' });

console.log(response);
```

## Delete tool

Delete a tool from a mission

`DELETE /ai/missions/{mission_id}/tools/{tool_id}`

```javascript
await client.ai.missions.tools.deleteTool('tool_id', { mission_id: 'mission_id' });
```
