---
name: ai-assistants
description: "Create and manage AI voice assistants with custom personalities, knowledge bases, and tool integrations."
metadata:
  languages: "curl"
  versions: "v2"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,ai,assistants,voice-ai,knowledge-base"
---

# Telnyx AI Assistants REST API Coding Guidelines

You are a Telnyx AI Assistants API expert. Help the user write correct, production-ready code using the Telnyx REST API with curl.

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

## List assistants

Retrieve a list of all AI Assistants configured by the user.

`GET /ai/assistants`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Create an assistant

Create a new AI Assistant.

`POST /ai/assistants` — Required: `name`, `model`, `instructions`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `llm_api_key_ref` (string), `messaging_settings` (object), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "string",
  "model": "string",
  "instructions": "string"
}' \
  "https://api.telnyx.com/v2/ai/assistants"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Import assistants from external provider

Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.

`POST /ai/assistants/import` — Required: `provider`, `api_key_ref`

Optional: `import_ids` (array[string])

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "provider": "elevenlabs",
  "api_key_ref": "string"
}' \
  "https://api.telnyx.com/v2/ai/assistants/import"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get All Tags

`GET /ai/assistants/tags`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tags"
```

Returns: `tags` (array[string])

## List assistant tests with pagination

Retrieves a paginated list of assistant tests with optional filtering capabilities

`GET /ai/assistants/tests`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests"
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Create a new assistant test

Creates a comprehensive test configuration for evaluating AI assistant performance

`POST /ai/assistants/tests` — Required: `name`, `destination`, `instructions`, `rubric`

Optional: `description` (string), `max_duration_seconds` (integer), `telnyx_conversation_channel` (object), `test_suite` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Customer Support Bot Test",
  "telnyx_conversation_channel": "web_chat",
  "destination": "+15551234567",
  "instructions": "Act as a frustrated customer who received a damaged product. Ask for a refund and escalate if not satisfied with the initial response.",
  "rubric": [
    {
      "criteria": "Assistant responds within 30 seconds",
      "name": "Response Time"
    },
    {
      "criteria": "Provides correct product information",
      "name": "Accuracy"
    }
  ]
}' \
  "https://api.telnyx.com/v2/ai/assistants/tests"
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Get all test suite names

Retrieves a list of all distinct test suite names available to the current user

`GET /ai/assistants/tests/test-suites`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests/test-suites"
```

Returns: `data` (array[string])

## Get test suite run history

Retrieves paginated history of test runs for a specific test suite with filtering options

`GET /ai/assistants/tests/test-suites/{suite_name}/runs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests/test-suites/{suite_name}/runs"
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger test suite execution

Executes all tests within a specific test suite as a batch operation

`POST /ai/assistants/tests/test-suites/{suite_name}/runs`

Optional: `destination_version_id` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination_version_id": "123e4567-e89b-12d3-a456-426614174000"
}' \
  "https://api.telnyx.com/v2/ai/assistants/tests/test-suites/{suite_name}/runs"
```

## Get assistant test by ID

Retrieves detailed information about a specific assistant test

`GET /ai/assistants/tests/{test_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}"
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Update an assistant test

Updates an existing assistant test configuration with new settings

`PUT /ai/assistants/tests/{test_id}`

Optional: `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (enum: phone_call, web_call, sms_chat, web_chat), `test_suite` (string)

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}"
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Delete an assistant test

Permanently removes an assistant test and all associated data

`DELETE /ai/assistants/tests/{test_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}"
```

## Get test run history for a specific test

Retrieves paginated execution history for a specific assistant test with filtering options

`GET /ai/assistants/tests/{test_id}/runs`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}/runs"
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger a manual test run

Initiates immediate execution of a specific assistant test

`POST /ai/assistants/tests/{test_id}/runs`

Optional: `destination_version_id` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination_version_id": "123e4567-e89b-12d3-a456-426614174000"
}' \
  "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}/runs"
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get specific test run details

Retrieves detailed information about a specific test run execution

`GET /ai/assistants/tests/{test_id}/runs/{run_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/tests/{test_id}/runs/{run_id}"
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get an assistant

Retrieve an AI Assistant configuration by `assistant_id`.

`GET /ai/assistants/{assistant_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update an assistant

Update an AI Assistant's attributes.

`POST /ai/assistants/{assistant_id}`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete an assistant

Delete an AI Assistant by `assistant_id`.

`DELETE /ai/assistants/{assistant_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}"
```

Returns: `deleted` (boolean), `id` (string), `object` (string)

## Get Canary Deploy

Endpoint to get a canary deploy configuration for an assistant. Retrieves the current canary deploy configuration with all version IDs and their
traffic percentages for the specified assistant.

`GET /ai/assistants/{assistant_id}/canary-deploys`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/canary-deploys"
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Create Canary Deploy

Endpoint to create a canary deploy configuration for an assistant. Creates a new canary deploy configuration with multiple version IDs and their traffic
percentages for A/B testing or gradual rollouts of assistant versions.

`POST /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "versions": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/canary-deploys"
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Update Canary Deploy

Endpoint to update a canary deploy configuration for an assistant. Updates the existing canary deploy configuration with new version IDs and percentages. All old versions and percentages are replaces by new ones from this request.

`PUT /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "versions": [
    "string"
  ]
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/canary-deploys"
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Delete Canary Deploy

Endpoint to delete a canary deploy configuration for an assistant. Removes all canary deploy configurations for the specified assistant.

`DELETE /ai/assistants/{assistant_id}/canary-deploys`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/canary-deploys"
```

## Assistant Chat (BETA)

This endpoint allows a client to send a chat message to a specific AI Assistant. The assistant processes the message and returns a relevant reply based on the current conversation context.

`POST /ai/assistants/{assistant_id}/chat` — Required: `content`, `conversation_id`

Optional: `name` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "content": "Tell me a joke about cats",
  "name": "Charlie",
  "conversation_id": "42b20469-1215-4a9a-8964-c36f66b406f4"
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/chat"
```

Returns: `content` (string)

## Assistant Sms Chat

Send an SMS message for an assistant. This endpoint: 
1. Validates the assistant exists and has messaging profile configured 
2.

`POST /ai/assistants/{assistant_id}/chat/sms` — Required: `from`, `to`

Optional: `conversation_metadata` (object), `should_create_conversation` (boolean), `text` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "from": "string",
  "to": "string"
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/chat/sms"
```

Returns: `conversation_id` (string)

## Clone Assistant

Clone an existing assistant, excluding telephony and messaging settings.

`POST /ai/assistants/{assistant_id}/clone`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/clone"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List scheduled events

Get scheduled events for an assistant with pagination and filtering

`GET /ai/assistants/{assistant_id}/scheduled_events`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/scheduled_events"
```

Returns: `data` (array[object]), `meta` (object)

## Create a scheduled event

Create a scheduled event for an assistant

`POST /ai/assistants/{assistant_id}/scheduled_events` — Required: `telnyx_conversation_channel`, `telnyx_end_user_target`, `telnyx_agent_target`, `scheduled_at_fixed_datetime`

Optional: `conversation_metadata` (object), `dynamic_variables` (object), `text` (string)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "telnyx_conversation_channel": "phone_call",
  "telnyx_end_user_target": "string",
  "telnyx_agent_target": "string",
  "scheduled_at_fixed_datetime": "2025-04-15T13:07:28.764Z"
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/scheduled_events"
```

## Get a scheduled event

Retrieve a scheduled event by event ID

`GET /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/scheduled_events/{event_id}"
```

## Delete a scheduled event

If the event is pending, this will cancel the event. Otherwise, this will simply remove the record of the event.

`DELETE /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/scheduled_events/{event_id}"
```

## Add Assistant Tag

`POST /ai/assistants/{assistant_id}/tags` — Required: `tag`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "tag": "string"
}' \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/tags"
```

Returns: `tags` (array[string])

## Remove Assistant Tag

`DELETE /ai/assistants/{assistant_id}/tags/{tag}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/tags/{tag}"
```

Returns: `tags` (array[string])

## Get assistant texml

Get an assistant texml by `assistant_id`.

`GET /ai/assistants/{assistant_id}/texml`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/texml"
```

## Test Assistant Tool

Test a webhook tool for an assistant

`POST /ai/assistants/{assistant_id}/tools/{tool_id}/test`

Optional: `arguments` (object), `dynamic_variables` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/tools/{tool_id}/test"
```

Returns: `content_type` (string), `request` (object), `response` (string), `status_code` (integer), `success` (boolean)

## Get all versions of an assistant

Retrieves all versions of a specific assistant with complete configuration and metadata

`GET /ai/assistants/{assistant_id}/versions`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/versions"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get a specific assistant version

Retrieves a specific version of an assistant by assistant_id and version_id

`GET /ai/assistants/{assistant_id}/versions/{version_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/versions/{version_id}"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update a specific assistant version

Updates the configuration of a specific assistant version. Can not update main version

`POST /ai/assistants/{assistant_id}/versions/{version_id}`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/versions/{version_id}"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete a specific assistant version

Permanently removes a specific version of an assistant. Can not delete main version

`DELETE /ai/assistants/{assistant_id}/versions/{version_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/versions/{version_id}"
```

## Promote an assistant version to main

Promotes a specific version to be the main/current version of the assistant. This will delete any existing canary deploy configuration and send all live production traffic to this version.

`POST /ai/assistants/{assistant_id}/versions/{version_id}/promote`

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/assistants/{assistant_id}/versions/{version_id}/promote"
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List MCP Servers

Retrieve a list of MCP servers.

`GET /ai/mcp_servers`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/mcp_servers"
```

## Create MCP Server

Create a new MCP server.

`POST /ai/mcp_servers` — Required: `name`, `type`, `url`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null)

```bash
curl \
  -X POST \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "string",
  "type": "string",
  "url": "string"
}' \
  "https://api.telnyx.com/v2/ai/mcp_servers"
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Get MCP Server

Retrieve details for a specific MCP server.

`GET /ai/mcp_servers/{mcp_server_id}`

```bash
curl -H "Authorization: Bearer $TELNYX_API_KEY" "https://api.telnyx.com/v2/ai/mcp_servers/{mcp_server_id}"
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Update MCP Server

Update an existing MCP server.

`PUT /ai/mcp_servers/{mcp_server_id}`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  "https://api.telnyx.com/v2/ai/mcp_servers/{mcp_server_id}"
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Delete MCP Server

Delete a specific MCP server.

`DELETE /ai/mcp_servers/{mcp_server_id}`

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  "https://api.telnyx.com/v2/ai/mcp_servers/{mcp_server_id}"
```
