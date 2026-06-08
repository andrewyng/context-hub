---
name: missions
description: "Create and manage Telnyx Missions — automated workflows, tasks, and sub-resources for AI-driven telecom operations."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,missions,workflows,automation,tasks"
---

# Telnyx Missions Go SDK Coding Guidelines

You are a Telnyx Missions API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

## Golden Rule: Use the Official SDK

Always use the official `github.com/team-telnyx/telnyx-go` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import "github.com/team-telnyx/telnyx-go"`
- **Incorrect:** unofficial Go clients or raw HTTP calls

## Installation

```bash
go get github.com/team-telnyx/telnyx-go
```

## Setup

```go
import (
  "context"
  "fmt"
  "os"

  "github.com/team-telnyx/telnyx-go"
  "github.com/team-telnyx/telnyx-go/option"
)

client := telnyx.NewClient(
  option.WithAPIKey(os.Getenv("TELNYX_API_KEY")),
)
```

All examples below assume `client` is already initialized as shown above.

## List missions

List all missions for the organization

`GET /ai/missions`

```go
	page, err := client.AI.Missions.List(context.TODO(), telnyx.AIMissionListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Create mission

Create a new mission definition

`POST /ai/missions` — Required: `name`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string)

```go
	mission, err := client.AI.Missions.New(context.TODO(), telnyx.AIMissionNewParams{
		Name: "name",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mission.Data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## List recent events

List recent events across all missions

`GET /ai/missions/events`

```go
	page, err := client.AI.Missions.ListEvents(context.TODO(), telnyx.AIMissionListEventsParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## List recent runs

List recent runs across all missions

`GET /ai/missions/runs`

```go
	page, err := client.AI.Missions.Runs.ListRuns(context.TODO(), telnyx.AIMissionRunListRunsParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get mission

Get a mission by ID (includes tools, knowledge_bases, mcp_servers)

`GET /ai/missions/{mission_id}`

```go
	mission, err := client.AI.Missions.Get(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mission.Data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Update mission

Update a mission definition

`PUT /ai/missions/{mission_id}`

Optional: `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `model` (string), `name` (string)

```go
	response, err := client.AI.Missions.UpdateMission(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionUpdateMissionParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (date-time), `description` (string), `execution_mode` (enum: external, managed), `instructions` (string), `metadata` (object), `mission_id` (uuid), `model` (string), `name` (string), `updated_at` (date-time)

## Delete mission

Delete a mission

`DELETE /ai/missions/{mission_id}`

```go
	err := client.AI.Missions.DeleteMission(context.TODO(), "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e")
	if err != nil {
		panic(err.Error())
	}
```

## Clone mission

Clone an existing mission

`POST /ai/missions/{mission_id}/clone`

```go
	response, err := client.AI.Missions.CloneMission(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## List knowledge bases

List all knowledge bases for a mission

`GET /ai/missions/{mission_id}/knowledge-bases`

```go
	response, err := client.AI.Missions.KnowledgeBases.ListKnowledgeBases(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Create knowledge base

Create a new knowledge base for a mission

`POST /ai/missions/{mission_id}/knowledge-bases`

```go
	response, err := client.AI.Missions.KnowledgeBases.NewKnowledgeBase(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get knowledge base

Get a specific knowledge base by ID

`GET /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```go
	response, err := client.AI.Missions.KnowledgeBases.GetKnowledgeBase(
		context.TODO(),
		"knowledge_base_id",
		telnyx.AIMissionKnowledgeBaseGetKnowledgeBaseParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Update knowledge base

Update a knowledge base definition

`PUT /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```go
	response, err := client.AI.Missions.KnowledgeBases.UpdateKnowledgeBase(
		context.TODO(),
		"knowledge_base_id",
		telnyx.AIMissionKnowledgeBaseUpdateKnowledgeBaseParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Delete knowledge base

Delete a knowledge base from a mission

`DELETE /ai/missions/{mission_id}/knowledge-bases/{knowledge_base_id}`

```go
	err := client.AI.Missions.KnowledgeBases.DeleteKnowledgeBase(
		context.TODO(),
		"knowledge_base_id",
		telnyx.AIMissionKnowledgeBaseDeleteKnowledgeBaseParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## List MCP servers

List all MCP servers for a mission

`GET /ai/missions/{mission_id}/mcp-servers`

```go
	response, err := client.AI.Missions.McpServers.ListMcpServers(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Create MCP server

Create a new MCP server for a mission

`POST /ai/missions/{mission_id}/mcp-servers`

```go
	response, err := client.AI.Missions.McpServers.NewMcpServer(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get MCP server

Get a specific MCP server by ID

`GET /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```go
	response, err := client.AI.Missions.McpServers.GetMcpServer(
		context.TODO(),
		"mcp_server_id",
		telnyx.AIMissionMcpServerGetMcpServerParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Update MCP server

Update an MCP server definition

`PUT /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```go
	response, err := client.AI.Missions.McpServers.UpdateMcpServer(
		context.TODO(),
		"mcp_server_id",
		telnyx.AIMissionMcpServerUpdateMcpServerParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Delete MCP server

Delete an MCP server from a mission

`DELETE /ai/missions/{mission_id}/mcp-servers/{mcp_server_id}`

```go
	err := client.AI.Missions.McpServers.DeleteMcpServer(
		context.TODO(),
		"mcp_server_id",
		telnyx.AIMissionMcpServerDeleteMcpServerParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## List runs for mission

List all runs for a specific mission

`GET /ai/missions/{mission_id}/runs`

```go
	page, err := client.AI.Missions.Runs.List(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunListParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Start a run

Start a new run for a mission

`POST /ai/missions/{mission_id}/runs`

Optional: `input` (object), `metadata` (object)

```go
	run, err := client.AI.Missions.Runs.New(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunNewParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", run.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get run details

Get details of a specific run

`GET /ai/missions/{mission_id}/runs/{run_id}`

```go
	run, err := client.AI.Missions.Runs.Get(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunGetParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", run.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Update run

Update run status and/or result

`PATCH /ai/missions/{mission_id}/runs/{run_id}`

Optional: `error` (string), `metadata` (object), `result_payload` (object), `result_summary` (string), `status` (enum: pending, running, paused, succeeded, failed, cancelled)

```go
	run, err := client.AI.Missions.Runs.Update(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunUpdateParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", run.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Cancel run

Cancel a running or paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/cancel`

```go
	response, err := client.AI.Missions.Runs.CancelRun(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunCancelRunParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List events

List events for a run (paginated)

`GET /ai/missions/{mission_id}/runs/{run_id}/events`

```go
	page, err := client.AI.Missions.Runs.Events.List(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunEventListParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Log event

Log an event for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/events` — Required: `type`, `summary`

Optional: `agent_id` (string), `idempotency_key` (string), `payload` (object), `step_id` (string)

```go
	response, err := client.AI.Missions.Runs.Events.Log(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunEventLogParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			Summary:   "summary",
			Type:      telnyx.AIMissionRunEventLogParamsTypeStatusChange,
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Get event details

Get details of a specific event

`GET /ai/missions/{mission_id}/runs/{run_id}/events/{event_id}`

```go
	response, err := client.AI.Missions.Runs.Events.GetEventDetails(
		context.TODO(),
		"event_id",
		telnyx.AIMissionRunEventGetEventDetailsParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			RunID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `agent_id` (string), `event_id` (string), `idempotency_key` (string), `payload` (object), `run_id` (string), `step_id` (string), `summary` (string), `timestamp` (date-time), `type` (enum: status_change, step_started, step_completed, step_failed, tool_call, tool_result, message, error, custom)

## Pause run

Pause a running run

`POST /ai/missions/{mission_id}/runs/{run_id}/pause`

```go
	response, err := client.AI.Missions.Runs.PauseRun(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunPauseRunParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## Get plan

Get the plan (all steps) for a run

`GET /ai/missions/{mission_id}/runs/{run_id}/plan`

```go
	plan, err := client.AI.Missions.Runs.Plan.Get(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunPlanGetParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", plan.Data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Create initial plan

Create the initial plan for a run

`POST /ai/missions/{mission_id}/runs/{run_id}/plan` — Required: `steps`

```go
	plan, err := client.AI.Missions.Runs.Plan.New(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunPlanNewParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			Steps: []telnyx.AIMissionRunPlanNewParamsStep{{
				Description: "description",
				Sequence:    0,
				StepID:      "step_id",
			}},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", plan.Data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Add step(s) to plan

Add one or more steps to an existing plan

`POST /ai/missions/{mission_id}/runs/{run_id}/plan/steps` — Required: `steps`

```go
	response, err := client.AI.Missions.Runs.Plan.AddStepsToPlan(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunPlanAddStepsToPlanParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			Steps: []telnyx.AIMissionRunPlanAddStepsToPlanParamsStep{{
				Description: "description",
				Sequence:    0,
				StepID:      "step_id",
			}},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Get step details

Get details of a specific plan step

`GET /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

```go
	response, err := client.AI.Missions.Runs.Plan.GetStepDetails(
		context.TODO(),
		"step_id",
		telnyx.AIMissionRunPlanGetStepDetailsParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			RunID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Update step status

Update the status of a plan step

`PATCH /ai/missions/{mission_id}/runs/{run_id}/plan/steps/{step_id}`

Optional: `metadata` (object), `status` (enum: pending, in_progress, completed, skipped, failed)

```go
	response, err := client.AI.Missions.Runs.Plan.UpdateStep(
		context.TODO(),
		"step_id",
		telnyx.AIMissionRunPlanUpdateStepParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			RunID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `completed_at` (date-time), `description` (string), `metadata` (object), `parent_step_id` (string), `run_id` (uuid), `sequence` (integer), `started_at` (date-time), `status` (enum: pending, in_progress, completed, skipped, failed), `step_id` (string)

## Resume run

Resume a paused run

`POST /ai/missions/{mission_id}/runs/{run_id}/resume`

```go
	response, err := client.AI.Missions.Runs.ResumeRun(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunResumeRunParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `error` (string), `finished_at` (date-time), `input` (object), `metadata` (object), `mission_id` (uuid), `result_payload` (object), `result_summary` (string), `run_id` (uuid), `started_at` (date-time), `status` (enum: pending, running, paused, succeeded, failed, cancelled), `updated_at` (date-time)

## List linked Telnyx agents

List all Telnyx agents linked to a run

`GET /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents`

```go
	telnyxAgents, err := client.AI.Missions.Runs.TelnyxAgents.List(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunTelnyxAgentListParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", telnyxAgents.Data)
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Link Telnyx agent to run

Link a Telnyx AI agent (voice/messaging) to a run

`POST /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents` — Required: `telnyx_agent_id`

```go
	response, err := client.AI.Missions.Runs.TelnyxAgents.Link(
		context.TODO(),
		"182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		telnyx.AIMissionRunTelnyxAgentLinkParams{
			MissionID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			TelnyxAgentID: "telnyx_agent_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `created_at` (date-time), `run_id` (string), `telnyx_agent_id` (string)

## Unlink Telnyx agent

Unlink a Telnyx agent from a run

`DELETE /ai/missions/{mission_id}/runs/{run_id}/telnyx-agents/{telnyx_agent_id}`

```go
	err := client.AI.Missions.Runs.TelnyxAgents.Unlink(
		context.TODO(),
		"telnyx_agent_id",
		telnyx.AIMissionRunTelnyxAgentUnlinkParams{
			MissionID: "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
			RunID:     "182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## List tools

List all tools for a mission

`GET /ai/missions/{mission_id}/tools`

```go
	response, err := client.AI.Missions.Tools.ListTools(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Create tool

Create a new tool for a mission

`POST /ai/missions/{mission_id}/tools`

```go
	response, err := client.AI.Missions.Tools.NewTool(context.TODO(), "mission_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Get tool

Get a specific tool by ID

`GET /ai/missions/{mission_id}/tools/{tool_id}`

```go
	response, err := client.AI.Missions.Tools.GetTool(
		context.TODO(),
		"tool_id",
		telnyx.AIMissionToolGetToolParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Update tool

Update a tool definition

`PUT /ai/missions/{mission_id}/tools/{tool_id}`

```go
	response, err := client.AI.Missions.Tools.UpdateTool(
		context.TODO(),
		"tool_id",
		telnyx.AIMissionToolUpdateToolParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Delete tool

Delete a tool from a mission

`DELETE /ai/missions/{mission_id}/tools/{tool_id}`

```go
	err := client.AI.Missions.Tools.DeleteTool(
		context.TODO(),
		"tool_id",
		telnyx.AIMissionToolDeleteToolParams{
			MissionID: "mission_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```
