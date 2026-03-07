---
name: ai-assistants
description: "Create and manage AI voice assistants with custom personalities, knowledge bases, and tool integrations."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,ai,assistants,voice-ai,knowledge-base"
---

# Telnyx AI Assistants JavaScript SDK Coding Guidelines

You are a Telnyx AI Assistants API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## List assistants

Retrieve a list of all AI Assistants configured by the user.

`GET /ai/assistants`

```javascript
const assistantsList = await client.ai.assistants.list();

console.log(assistantsList.data);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Create an assistant

Create a new AI Assistant.

`POST /ai/assistants` — Required: `name`, `model`, `instructions`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `llm_api_key_ref` (string), `messaging_settings` (object), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```javascript
const assistant = await client.ai.assistants.create({
  instructions: 'instructions',
  model: 'model',
  name: 'name',
});

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Import assistants from external provider

Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.

`POST /ai/assistants/import` — Required: `provider`, `api_key_ref`

Optional: `import_ids` (array[string])

```javascript
const assistantsList = await client.ai.assistants.imports({
  api_key_ref: 'api_key_ref',
  provider: 'elevenlabs',
});

console.log(assistantsList.data);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get All Tags

`GET /ai/assistants/tags`

```javascript
const tags = await client.ai.assistants.tags.list();

console.log(tags.tags);
```

Returns: `tags` (array[string])

## List assistant tests with pagination

Retrieves a paginated list of assistant tests with optional filtering capabilities

`GET /ai/assistants/tests`

```javascript
// Automatically fetches more pages as needed.
for await (const assistantTest of client.ai.assistants.tests.list()) {
  console.log(assistantTest.test_id);
}
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Create a new assistant test

Creates a comprehensive test configuration for evaluating AI assistant performance

`POST /ai/assistants/tests` — Required: `name`, `destination`, `instructions`, `rubric`

Optional: `description` (string), `max_duration_seconds` (integer), `telnyx_conversation_channel` (object), `test_suite` (string)

```javascript
const assistantTest = await client.ai.assistants.tests.create({
  destination: '+15551234567',
  instructions:
    'Act as a frustrated customer who received a damaged product. Ask for a refund and escalate if not satisfied with the initial response.',
  name: 'Customer Support Bot Test',
  rubric: [
    { criteria: 'Assistant responds within 30 seconds', name: 'Response Time' },
    { criteria: 'Provides correct product information', name: 'Accuracy' },
  ],
});

console.log(assistantTest.test_id);
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Get all test suite names

Retrieves a list of all distinct test suite names available to the current user

`GET /ai/assistants/tests/test-suites`

```javascript
const testSuites = await client.ai.assistants.tests.testSuites.list();

console.log(testSuites.data);
```

Returns: `data` (array[string])

## Get test suite run history

Retrieves paginated history of test runs for a specific test suite with filtering options

`GET /ai/assistants/tests/test-suites/{suite_name}/runs`

```javascript
// Automatically fetches more pages as needed.
for await (const testRunResponse of client.ai.assistants.tests.testSuites.runs.list('suite_name')) {
  console.log(testRunResponse.run_id);
}
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger test suite execution

Executes all tests within a specific test suite as a batch operation

`POST /ai/assistants/tests/test-suites/{suite_name}/runs`

Optional: `destination_version_id` (string)

```javascript
const testRunResponses = await client.ai.assistants.tests.testSuites.runs.trigger('suite_name');

console.log(testRunResponses);
```

## Get assistant test by ID

Retrieves detailed information about a specific assistant test

`GET /ai/assistants/tests/{test_id}`

```javascript
const assistantTest = await client.ai.assistants.tests.retrieve('test_id');

console.log(assistantTest.test_id);
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Update an assistant test

Updates an existing assistant test configuration with new settings

`PUT /ai/assistants/tests/{test_id}`

Optional: `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (enum: phone_call, web_call, sms_chat, web_chat), `test_suite` (string)

```javascript
const assistantTest = await client.ai.assistants.tests.update('test_id');

console.log(assistantTest.test_id);
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Delete an assistant test

Permanently removes an assistant test and all associated data

`DELETE /ai/assistants/tests/{test_id}`

```javascript
await client.ai.assistants.tests.delete('test_id');
```

## Get test run history for a specific test

Retrieves paginated execution history for a specific assistant test with filtering options

`GET /ai/assistants/tests/{test_id}/runs`

```javascript
// Automatically fetches more pages as needed.
for await (const testRunResponse of client.ai.assistants.tests.runs.list('test_id')) {
  console.log(testRunResponse.run_id);
}
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger a manual test run

Initiates immediate execution of a specific assistant test

`POST /ai/assistants/tests/{test_id}/runs`

Optional: `destination_version_id` (string)

```javascript
const testRunResponse = await client.ai.assistants.tests.runs.trigger('test_id');

console.log(testRunResponse.run_id);
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get specific test run details

Retrieves detailed information about a specific test run execution

`GET /ai/assistants/tests/{test_id}/runs/{run_id}`

```javascript
const testRunResponse = await client.ai.assistants.tests.runs.retrieve('run_id', {
  test_id: 'test_id',
});

console.log(testRunResponse.run_id);
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get an assistant

Retrieve an AI Assistant configuration by `assistant_id`.

`GET /ai/assistants/{assistant_id}`

```javascript
const assistant = await client.ai.assistants.retrieve('assistant_id');

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update an assistant

Update an AI Assistant's attributes.

`POST /ai/assistants/{assistant_id}`

```javascript
const assistant = await client.ai.assistants.update('assistant_id');

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete an assistant

Delete an AI Assistant by `assistant_id`.

`DELETE /ai/assistants/{assistant_id}`

```javascript
const assistant = await client.ai.assistants.delete('assistant_id');

console.log(assistant.id);
```

Returns: `deleted` (boolean), `id` (string), `object` (string)

## Get Canary Deploy

Endpoint to get a canary deploy configuration for an assistant. Retrieves the current canary deploy configuration with all version IDs and their
traffic percentages for the specified assistant.

`GET /ai/assistants/{assistant_id}/canary-deploys`

```javascript
const canaryDeployResponse = await client.ai.assistants.canaryDeploys.retrieve('assistant_id');

console.log(canaryDeployResponse.assistant_id);
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Create Canary Deploy

Endpoint to create a canary deploy configuration for an assistant. Creates a new canary deploy configuration with multiple version IDs and their traffic
percentages for A/B testing or gradual rollouts of assistant versions.

`POST /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```javascript
const canaryDeployResponse = await client.ai.assistants.canaryDeploys.create('assistant_id', {
  versions: [{ percentage: 1, version_id: 'version_id' }],
});

console.log(canaryDeployResponse.assistant_id);
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Update Canary Deploy

Endpoint to update a canary deploy configuration for an assistant. Updates the existing canary deploy configuration with new version IDs and percentages. All old versions and percentages are replaces by new ones from this request.

`PUT /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```javascript
const canaryDeployResponse = await client.ai.assistants.canaryDeploys.update('assistant_id', {
  versions: [{ percentage: 1, version_id: 'version_id' }],
});

console.log(canaryDeployResponse.assistant_id);
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Delete Canary Deploy

Endpoint to delete a canary deploy configuration for an assistant. Removes all canary deploy configurations for the specified assistant.

`DELETE /ai/assistants/{assistant_id}/canary-deploys`

```javascript
await client.ai.assistants.canaryDeploys.delete('assistant_id');
```

## Assistant Chat (BETA)

This endpoint allows a client to send a chat message to a specific AI Assistant. The assistant processes the message and returns a relevant reply based on the current conversation context.

`POST /ai/assistants/{assistant_id}/chat` — Required: `content`, `conversation_id`

Optional: `name` (string)

```javascript
const response = await client.ai.assistants.chat('assistant_id', {
  content: 'Tell me a joke about cats',
  conversation_id: '42b20469-1215-4a9a-8964-c36f66b406f4',
});

console.log(response.content);
```

Returns: `content` (string)

## Assistant Sms Chat

Send an SMS message for an assistant. This endpoint: 
1. Validates the assistant exists and has messaging profile configured 
2.

`POST /ai/assistants/{assistant_id}/chat/sms` — Required: `from`, `to`

Optional: `conversation_metadata` (object), `should_create_conversation` (boolean), `text` (string)

```javascript
const response = await client.ai.assistants.sendSMS('assistant_id', { from: 'from', to: 'to' });

console.log(response.conversation_id);
```

Returns: `conversation_id` (string)

## Clone Assistant

Clone an existing assistant, excluding telephony and messaging settings.

`POST /ai/assistants/{assistant_id}/clone`

```javascript
const assistant = await client.ai.assistants.clone('assistant_id');

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List scheduled events

Get scheduled events for an assistant with pagination and filtering

`GET /ai/assistants/{assistant_id}/scheduled_events`

```javascript
// Automatically fetches more pages as needed.
for await (const scheduledEventListResponse of client.ai.assistants.scheduledEvents.list(
  'assistant_id',
)) {
  console.log(scheduledEventListResponse);
}
```

Returns: `data` (array[object]), `meta` (object)

## Create a scheduled event

Create a scheduled event for an assistant

`POST /ai/assistants/{assistant_id}/scheduled_events` — Required: `telnyx_conversation_channel`, `telnyx_end_user_target`, `telnyx_agent_target`, `scheduled_at_fixed_datetime`

Optional: `conversation_metadata` (object), `dynamic_variables` (object), `text` (string)

```javascript
const scheduledEventResponse = await client.ai.assistants.scheduledEvents.create('assistant_id', {
  scheduled_at_fixed_datetime: '2025-04-15T13:07:28.764Z',
  telnyx_agent_target: 'telnyx_agent_target',
  telnyx_conversation_channel: 'phone_call',
  telnyx_end_user_target: 'telnyx_end_user_target',
});

console.log(scheduledEventResponse);
```

## Get a scheduled event

Retrieve a scheduled event by event ID

`GET /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```javascript
const scheduledEventResponse = await client.ai.assistants.scheduledEvents.retrieve('event_id', {
  assistant_id: 'assistant_id',
});

console.log(scheduledEventResponse);
```

## Delete a scheduled event

If the event is pending, this will cancel the event. Otherwise, this will simply remove the record of the event.

`DELETE /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```javascript
await client.ai.assistants.scheduledEvents.delete('event_id', { assistant_id: 'assistant_id' });
```

## Add Assistant Tag

`POST /ai/assistants/{assistant_id}/tags` — Required: `tag`

```javascript
const response = await client.ai.assistants.tags.add('assistant_id', { tag: 'tag' });

console.log(response.tags);
```

Returns: `tags` (array[string])

## Remove Assistant Tag

`DELETE /ai/assistants/{assistant_id}/tags/{tag}`

```javascript
const tag = await client.ai.assistants.tags.remove('tag', { assistant_id: 'assistant_id' });

console.log(tag.tags);
```

Returns: `tags` (array[string])

## Get assistant texml

Get an assistant texml by `assistant_id`.

`GET /ai/assistants/{assistant_id}/texml`

```javascript
const response = await client.ai.assistants.getTexml('assistant_id');

console.log(response);
```

## Test Assistant Tool

Test a webhook tool for an assistant

`POST /ai/assistants/{assistant_id}/tools/{tool_id}/test`

Optional: `arguments` (object), `dynamic_variables` (object)

```javascript
const response = await client.ai.assistants.tools.test('tool_id', { assistant_id: 'assistant_id' });

console.log(response.data);
```

Returns: `content_type` (string), `request` (object), `response` (string), `status_code` (integer), `success` (boolean)

## Get all versions of an assistant

Retrieves all versions of a specific assistant with complete configuration and metadata

`GET /ai/assistants/{assistant_id}/versions`

```javascript
const assistantsList = await client.ai.assistants.versions.list('assistant_id');

console.log(assistantsList.data);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get a specific assistant version

Retrieves a specific version of an assistant by assistant_id and version_id

`GET /ai/assistants/{assistant_id}/versions/{version_id}`

```javascript
const assistant = await client.ai.assistants.versions.retrieve('version_id', {
  assistant_id: 'assistant_id',
});

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update a specific assistant version

Updates the configuration of a specific assistant version. Can not update main version

`POST /ai/assistants/{assistant_id}/versions/{version_id}`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```javascript
const assistant = await client.ai.assistants.versions.update('version_id', {
  assistant_id: 'assistant_id',
});

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete a specific assistant version

Permanently removes a specific version of an assistant. Can not delete main version

`DELETE /ai/assistants/{assistant_id}/versions/{version_id}`

```javascript
await client.ai.assistants.versions.delete('version_id', { assistant_id: 'assistant_id' });
```

## Promote an assistant version to main

Promotes a specific version to be the main/current version of the assistant. This will delete any existing canary deploy configuration and send all live production traffic to this version.

`POST /ai/assistants/{assistant_id}/versions/{version_id}/promote`

```javascript
const assistant = await client.ai.assistants.versions.promote('version_id', {
  assistant_id: 'assistant_id',
});

console.log(assistant.id);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List MCP Servers

Retrieve a list of MCP servers.

`GET /ai/mcp_servers`

```javascript
// Automatically fetches more pages as needed.
for await (const mcpServerListResponse of client.ai.mcpServers.list()) {
  console.log(mcpServerListResponse.id);
}
```

## Create MCP Server

Create a new MCP server.

`POST /ai/mcp_servers` — Required: `name`, `type`, `url`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null)

```javascript
const mcpServer = await client.ai.mcpServers.create({
  name: 'name',
  type: 'type',
  url: 'url',
});

console.log(mcpServer.id);
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Get MCP Server

Retrieve details for a specific MCP server.

`GET /ai/mcp_servers/{mcp_server_id}`

```javascript
const mcpServer = await client.ai.mcpServers.retrieve('mcp_server_id');

console.log(mcpServer.id);
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Update MCP Server

Update an existing MCP server.

`PUT /ai/mcp_servers/{mcp_server_id}`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

```javascript
const mcpServer = await client.ai.mcpServers.update('mcp_server_id');

console.log(mcpServer.id);
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Delete MCP Server

Delete a specific MCP server.

`DELETE /ai/mcp_servers/{mcp_server_id}`

```javascript
await client.ai.mcpServers.delete('mcp_server_id');
```
