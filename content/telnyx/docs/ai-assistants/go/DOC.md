---
name: ai-assistants
description: "Create and manage AI voice assistants with custom personalities, knowledge bases, and tool integrations."
metadata:
  languages: "go"
  versions: "4.43.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,ai,assistants,voice-ai,knowledge-base"
---

# Telnyx AI Assistants Go SDK Coding Guidelines

You are a Telnyx AI Assistants API expert. Help the user write correct, production-ready code using the official Telnyx Go SDK.

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

## List assistants

Retrieve a list of all AI Assistants configured by the user.

`GET /ai/assistants`

```go
	assistantsList, err := client.AI.Assistants.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantsList.Data)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Create an assistant

Create a new AI Assistant.

`POST /ai/assistants` — Required: `name`, `model`, `instructions`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `llm_api_key_ref` (string), `messaging_settings` (object), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```go
	assistant, err := client.AI.Assistants.New(context.TODO(), telnyx.AIAssistantNewParams{
		Instructions: "instructions",
		Model:        "model",
		Name:         "name",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Import assistants from external provider

Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.

`POST /ai/assistants/import` — Required: `provider`, `api_key_ref`

Optional: `import_ids` (array[string])

```go
	assistantsList, err := client.AI.Assistants.Imports(context.TODO(), telnyx.AIAssistantImportsParams{
		APIKeyRef: "api_key_ref",
		Provider:  telnyx.AIAssistantImportsParamsProviderElevenlabs,
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantsList.Data)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get All Tags

`GET /ai/assistants/tags`

```go
	tags, err := client.AI.Assistants.Tags.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", tags.Tags)
```

Returns: `tags` (array[string])

## List assistant tests with pagination

Retrieves a paginated list of assistant tests with optional filtering capabilities

`GET /ai/assistants/tests`

```go
	page, err := client.AI.Assistants.Tests.List(context.TODO(), telnyx.AIAssistantTestListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Create a new assistant test

Creates a comprehensive test configuration for evaluating AI assistant performance

`POST /ai/assistants/tests` — Required: `name`, `destination`, `instructions`, `rubric`

Optional: `description` (string), `max_duration_seconds` (integer), `telnyx_conversation_channel` (object), `test_suite` (string)

```go
	assistantTest, err := client.AI.Assistants.Tests.New(context.TODO(), telnyx.AIAssistantTestNewParams{
		Destination:  "+15551234567",
		Instructions: "Act as a frustrated customer who received a damaged product. Ask for a refund and escalate if not satisfied with the initial response.",
		Name:         "Customer Support Bot Test",
		Rubric: []telnyx.AIAssistantTestNewParamsRubric{{
			Criteria: "Assistant responds within 30 seconds",
			Name:     "Response Time",
		}, {
			Criteria: "Provides correct product information",
			Name:     "Accuracy",
		}},
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantTest.TestID)
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Get all test suite names

Retrieves a list of all distinct test suite names available to the current user

`GET /ai/assistants/tests/test-suites`

```go
	testSuites, err := client.AI.Assistants.Tests.TestSuites.List(context.TODO())
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", testSuites.Data)
```

Returns: `data` (array[string])

## Get test suite run history

Retrieves paginated history of test runs for a specific test suite with filtering options

`GET /ai/assistants/tests/test-suites/{suite_name}/runs`

```go
	page, err := client.AI.Assistants.Tests.TestSuites.Runs.List(
		context.TODO(),
		"suite_name",
		telnyx.AIAssistantTestTestSuiteRunListParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger test suite execution

Executes all tests within a specific test suite as a batch operation

`POST /ai/assistants/tests/test-suites/{suite_name}/runs`

Optional: `destination_version_id` (string)

```go
	testRunResponses, err := client.AI.Assistants.Tests.TestSuites.Runs.Trigger(
		context.TODO(),
		"suite_name",
		telnyx.AIAssistantTestTestSuiteRunTriggerParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", testRunResponses)
```

## Get assistant test by ID

Retrieves detailed information about a specific assistant test

`GET /ai/assistants/tests/{test_id}`

```go
	assistantTest, err := client.AI.Assistants.Tests.Get(context.TODO(), "test_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantTest.TestID)
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Update an assistant test

Updates an existing assistant test configuration with new settings

`PUT /ai/assistants/tests/{test_id}`

Optional: `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (enum: phone_call, web_call, sms_chat, web_chat), `test_suite` (string)

```go
	assistantTest, err := client.AI.Assistants.Tests.Update(
		context.TODO(),
		"test_id",
		telnyx.AIAssistantTestUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantTest.TestID)
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Delete an assistant test

Permanently removes an assistant test and all associated data

`DELETE /ai/assistants/tests/{test_id}`

```go
	err := client.AI.Assistants.Tests.Delete(context.TODO(), "test_id")
	if err != nil {
		panic(err.Error())
	}
```

## Get test run history for a specific test

Retrieves paginated execution history for a specific assistant test with filtering options

`GET /ai/assistants/tests/{test_id}/runs`

```go
	page, err := client.AI.Assistants.Tests.Runs.List(
		context.TODO(),
		"test_id",
		telnyx.AIAssistantTestRunListParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger a manual test run

Initiates immediate execution of a specific assistant test

`POST /ai/assistants/tests/{test_id}/runs`

Optional: `destination_version_id` (string)

```go
	testRunResponse, err := client.AI.Assistants.Tests.Runs.Trigger(
		context.TODO(),
		"test_id",
		telnyx.AIAssistantTestRunTriggerParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", testRunResponse.RunID)
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get specific test run details

Retrieves detailed information about a specific test run execution

`GET /ai/assistants/tests/{test_id}/runs/{run_id}`

```go
	testRunResponse, err := client.AI.Assistants.Tests.Runs.Get(
		context.TODO(),
		"run_id",
		telnyx.AIAssistantTestRunGetParams{
			TestID: "test_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", testRunResponse.RunID)
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get an assistant

Retrieve an AI Assistant configuration by `assistant_id`.

`GET /ai/assistants/{assistant_id}`

```go
	assistant, err := client.AI.Assistants.Get(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantGetParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update an assistant

Update an AI Assistant's attributes.

`POST /ai/assistants/{assistant_id}`

```go
	assistant, err := client.AI.Assistants.Update(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete an assistant

Delete an AI Assistant by `assistant_id`.

`DELETE /ai/assistants/{assistant_id}`

```go
	assistant, err := client.AI.Assistants.Delete(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `deleted` (boolean), `id` (string), `object` (string)

## Get Canary Deploy

Endpoint to get a canary deploy configuration for an assistant. Retrieves the current canary deploy configuration with all version IDs and their
traffic percentages for the specified assistant.

`GET /ai/assistants/{assistant_id}/canary-deploys`

```go
	canaryDeployResponse, err := client.AI.Assistants.CanaryDeploys.Get(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", canaryDeployResponse.AssistantID)
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Create Canary Deploy

Endpoint to create a canary deploy configuration for an assistant. Creates a new canary deploy configuration with multiple version IDs and their traffic
percentages for A/B testing or gradual rollouts of assistant versions.

`POST /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```go
	canaryDeployResponse, err := client.AI.Assistants.CanaryDeploys.New(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantCanaryDeployNewParams{
			CanaryDeploy: telnyx.CanaryDeployParam{
				Versions: []telnyx.VersionConfigParam{{
					Percentage: 1,
					VersionID:  "version_id",
				}},
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", canaryDeployResponse.AssistantID)
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Update Canary Deploy

Endpoint to update a canary deploy configuration for an assistant. Updates the existing canary deploy configuration with new version IDs and percentages. All old versions and percentages are replaces by new ones from this request.

`PUT /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```go
	canaryDeployResponse, err := client.AI.Assistants.CanaryDeploys.Update(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantCanaryDeployUpdateParams{
			CanaryDeploy: telnyx.CanaryDeployParam{
				Versions: []telnyx.VersionConfigParam{{
					Percentage: 1,
					VersionID:  "version_id",
				}},
			},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", canaryDeployResponse.AssistantID)
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Delete Canary Deploy

Endpoint to delete a canary deploy configuration for an assistant. Removes all canary deploy configurations for the specified assistant.

`DELETE /ai/assistants/{assistant_id}/canary-deploys`

```go
	err := client.AI.Assistants.CanaryDeploys.Delete(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
```

## Assistant Chat (BETA)

This endpoint allows a client to send a chat message to a specific AI Assistant. The assistant processes the message and returns a relevant reply based on the current conversation context.

`POST /ai/assistants/{assistant_id}/chat` — Required: `content`, `conversation_id`

Optional: `name` (string)

```go
	response, err := client.AI.Assistants.Chat(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantChatParams{
			Content:        "Tell me a joke about cats",
			ConversationID: "42b20469-1215-4a9a-8964-c36f66b406f4",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Content)
```

Returns: `content` (string)

## Assistant Sms Chat

Send an SMS message for an assistant. This endpoint: 
1. Validates the assistant exists and has messaging profile configured 
2.

`POST /ai/assistants/{assistant_id}/chat/sms` — Required: `from`, `to`

Optional: `conversation_metadata` (object), `should_create_conversation` (boolean), `text` (string)

```go
	response, err := client.AI.Assistants.SendSMS(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantSendSMSParams{
			From: "from",
			To:   "to",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.ConversationID)
```

Returns: `conversation_id` (string)

## Clone Assistant

Clone an existing assistant, excluding telephony and messaging settings.

`POST /ai/assistants/{assistant_id}/clone`

```go
	assistant, err := client.AI.Assistants.Clone(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List scheduled events

Get scheduled events for an assistant with pagination and filtering

`GET /ai/assistants/{assistant_id}/scheduled_events`

```go
	page, err := client.AI.Assistants.ScheduledEvents.List(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantScheduledEventListParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

Returns: `data` (array[object]), `meta` (object)

## Create a scheduled event

Create a scheduled event for an assistant

`POST /ai/assistants/{assistant_id}/scheduled_events` — Required: `telnyx_conversation_channel`, `telnyx_end_user_target`, `telnyx_agent_target`, `scheduled_at_fixed_datetime`

Optional: `conversation_metadata` (object), `dynamic_variables` (object), `text` (string)

```go
	scheduledEventResponse, err := client.AI.Assistants.ScheduledEvents.New(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantScheduledEventNewParams{
			ScheduledAtFixedDatetime:  time.Now(),
			TelnyxAgentTarget:         "telnyx_agent_target",
			TelnyxConversationChannel: telnyx.ConversationChannelTypePhoneCall,
			TelnyxEndUserTarget:       "telnyx_end_user_target",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", scheduledEventResponse)
```

## Get a scheduled event

Retrieve a scheduled event by event ID

`GET /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```go
	scheduledEventResponse, err := client.AI.Assistants.ScheduledEvents.Get(
		context.TODO(),
		"event_id",
		telnyx.AIAssistantScheduledEventGetParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", scheduledEventResponse)
```

## Delete a scheduled event

If the event is pending, this will cancel the event. Otherwise, this will simply remove the record of the event.

`DELETE /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```go
	err := client.AI.Assistants.ScheduledEvents.Delete(
		context.TODO(),
		"event_id",
		telnyx.AIAssistantScheduledEventDeleteParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## Add Assistant Tag

`POST /ai/assistants/{assistant_id}/tags` — Required: `tag`

```go
	response, err := client.AI.Assistants.Tags.Add(
		context.TODO(),
		"assistant_id",
		telnyx.AIAssistantTagAddParams{
			Tag: "tag",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Tags)
```

Returns: `tags` (array[string])

## Remove Assistant Tag

`DELETE /ai/assistants/{assistant_id}/tags/{tag}`

```go
	tag, err := client.AI.Assistants.Tags.Remove(
		context.TODO(),
		"tag",
		telnyx.AIAssistantTagRemoveParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", tag.Tags)
```

Returns: `tags` (array[string])

## Get assistant texml

Get an assistant texml by `assistant_id`.

`GET /ai/assistants/{assistant_id}/texml`

```go
	response, err := client.AI.Assistants.GetTexml(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response)
```

## Test Assistant Tool

Test a webhook tool for an assistant

`POST /ai/assistants/{assistant_id}/tools/{tool_id}/test`

Optional: `arguments` (object), `dynamic_variables` (object)

```go
	response, err := client.AI.Assistants.Tools.Test(
		context.TODO(),
		"tool_id",
		telnyx.AIAssistantToolTestParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", response.Data)
```

Returns: `content_type` (string), `request` (object), `response` (string), `status_code` (integer), `success` (boolean)

## Get all versions of an assistant

Retrieves all versions of a specific assistant with complete configuration and metadata

`GET /ai/assistants/{assistant_id}/versions`

```go
	assistantsList, err := client.AI.Assistants.Versions.List(context.TODO(), "assistant_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistantsList.Data)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get a specific assistant version

Retrieves a specific version of an assistant by assistant_id and version_id

`GET /ai/assistants/{assistant_id}/versions/{version_id}`

```go
	assistant, err := client.AI.Assistants.Versions.Get(
		context.TODO(),
		"version_id",
		telnyx.AIAssistantVersionGetParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update a specific assistant version

Updates the configuration of a specific assistant version. Can not update main version

`POST /ai/assistants/{assistant_id}/versions/{version_id}`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```go
	assistant, err := client.AI.Assistants.Versions.Update(
		context.TODO(),
		"version_id",
		telnyx.AIAssistantVersionUpdateParams{
			AssistantID:     "assistant_id",
			UpdateAssistant: telnyx.UpdateAssistantParam{},
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete a specific assistant version

Permanently removes a specific version of an assistant. Can not delete main version

`DELETE /ai/assistants/{assistant_id}/versions/{version_id}`

```go
	err := client.AI.Assistants.Versions.Delete(
		context.TODO(),
		"version_id",
		telnyx.AIAssistantVersionDeleteParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
```

## Promote an assistant version to main

Promotes a specific version to be the main/current version of the assistant. This will delete any existing canary deploy configuration and send all live production traffic to this version.

`POST /ai/assistants/{assistant_id}/versions/{version_id}/promote`

```go
	assistant, err := client.AI.Assistants.Versions.Promote(
		context.TODO(),
		"version_id",
		telnyx.AIAssistantVersionPromoteParams{
			AssistantID: "assistant_id",
		},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", assistant.ID)
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List MCP Servers

Retrieve a list of MCP servers.

`GET /ai/mcp_servers`

```go
	page, err := client.AI.McpServers.List(context.TODO(), telnyx.AIMcpServerListParams{})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", page)
```

## Create MCP Server

Create a new MCP server.

`POST /ai/mcp_servers` — Required: `name`, `type`, `url`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null)

```go
	mcpServer, err := client.AI.McpServers.New(context.TODO(), telnyx.AIMcpServerNewParams{
		Name: "name",
		Type: "type",
		URL:  "url",
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mcpServer.ID)
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Get MCP Server

Retrieve details for a specific MCP server.

`GET /ai/mcp_servers/{mcp_server_id}`

```go
	mcpServer, err := client.AI.McpServers.Get(context.TODO(), "mcp_server_id")
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mcpServer.ID)
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Update MCP Server

Update an existing MCP server.

`PUT /ai/mcp_servers/{mcp_server_id}`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

```go
	mcpServer, err := client.AI.McpServers.Update(
		context.TODO(),
		"mcp_server_id",
		telnyx.AIMcpServerUpdateParams{},
	)
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", mcpServer.ID)
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Delete MCP Server

Delete a specific MCP server.

`DELETE /ai/mcp_servers/{mcp_server_id}`

```go
	err := client.AI.McpServers.Delete(context.TODO(), "mcp_server_id")
	if err != nil {
		panic(err.Error())
	}
```
