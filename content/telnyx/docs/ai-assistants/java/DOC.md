---
name: ai-assistants
description: "Create and manage AI voice assistants with custom personalities, knowledge bases, and tool integrations."
metadata:
  languages: "java"
  versions: "6.26.0"
  updated-on: "2026-03-06"
  source: maintainer
  tags: "telnyx,ai,assistants,voice-ai,knowledge-base"
---

# Telnyx AI Assistants Java SDK Coding Guidelines

You are a Telnyx AI Assistants API expert. Help the user write correct, production-ready code using the official Telnyx Java SDK.

## Golden Rule: Use the Official SDK

Always use the official `com.telnyx.sdk:telnyx` package. Do not fabricate API endpoints or SDK methods.

- **Correct:** `import com.telnyx.sdk.client.TelnyxClient`
- **Incorrect:** unofficial Java clients or raw HTTP calls

## Installation

```text
<!-- Maven -->
<dependency>
    <groupId>com.telnyx.sdk</groupId>
    <artifactId>telnyx-java</artifactId>
    <version>6.26.0</version>
</dependency>

// Gradle
implementation("com.telnyx.sdk:telnyx-java:6.26.0")
```

## Setup

```java
import com.telnyx.sdk.client.TelnyxClient;
import com.telnyx.sdk.client.okhttp.TelnyxOkHttpClient;

TelnyxClient client = TelnyxOkHttpClient.fromEnv();
```

All examples below assume `client` is already initialized as shown above.

## List assistants

Retrieve a list of all AI Assistants configured by the user.

`GET /ai/assistants`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantListParams;
import com.telnyx.sdk.models.ai.assistants.AssistantsList;

AssistantsList assistantsList = client.ai().assistants().list();
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Create an assistant

Create a new AI Assistant.

`POST /ai/assistants` — Required: `name`, `model`, `instructions`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `llm_api_key_ref` (string), `messaging_settings` (object), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```java
import com.telnyx.sdk.models.ai.assistants.AssistantCreateParams;
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;

AssistantCreateParams params = AssistantCreateParams.builder()
    .instructions("instructions")
    .model("model")
    .name("name")
    .build();
InferenceEmbedding assistant = client.ai().assistants().create(params);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Import assistants from external provider

Import assistants from external providers. Any assistant that has already been imported will be overwritten with its latest version from the importing provider.

`POST /ai/assistants/import` — Required: `provider`, `api_key_ref`

Optional: `import_ids` (array[string])

```java
import com.telnyx.sdk.models.ai.assistants.AssistantImportsParams;
import com.telnyx.sdk.models.ai.assistants.AssistantsList;

AssistantImportsParams params = AssistantImportsParams.builder()
    .apiKeyRef("api_key_ref")
    .provider(AssistantImportsParams.Provider.ELEVENLABS)
    .build();
AssistantsList assistantsList = client.ai().assistants().imports(params);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get All Tags

`GET /ai/assistants/tags`

```java
import com.telnyx.sdk.models.ai.assistants.tags.TagListParams;
import com.telnyx.sdk.models.ai.assistants.tags.TagListResponse;

TagListResponse tags = client.ai().assistants().tags().list();
```

Returns: `tags` (array[string])

## List assistant tests with pagination

Retrieves a paginated list of assistant tests with optional filtering capabilities

`GET /ai/assistants/tests`

```java
import com.telnyx.sdk.models.ai.assistants.tests.TestListPage;
import com.telnyx.sdk.models.ai.assistants.tests.TestListParams;

TestListPage page = client.ai().assistants().tests().list();
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Create a new assistant test

Creates a comprehensive test configuration for evaluating AI assistant performance

`POST /ai/assistants/tests` — Required: `name`, `destination`, `instructions`, `rubric`

Optional: `description` (string), `max_duration_seconds` (integer), `telnyx_conversation_channel` (object), `test_suite` (string)

```java
import com.telnyx.sdk.models.ai.assistants.tests.AssistantTest;
import com.telnyx.sdk.models.ai.assistants.tests.TestCreateParams;

TestCreateParams params = TestCreateParams.builder()
    .destination("+15551234567")
    .instructions("Act as a frustrated customer who received a damaged product. Ask for a refund and escalate if not satisfied with the initial response.")
    .name("Customer Support Bot Test")
    .addRubric(TestCreateParams.Rubric.builder()
        .criteria("Assistant responds within 30 seconds")
        .name("Response Time")
        .build())
    .addRubric(TestCreateParams.Rubric.builder()
        .criteria("Provides correct product information")
        .name("Accuracy")
        .build())
    .build();
AssistantTest assistantTest = client.ai().assistants().tests().create(params);
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Get all test suite names

Retrieves a list of all distinct test suite names available to the current user

`GET /ai/assistants/tests/test-suites`

```java
import com.telnyx.sdk.models.ai.assistants.tests.testsuites.TestSuiteListParams;
import com.telnyx.sdk.models.ai.assistants.tests.testsuites.TestSuiteListResponse;

TestSuiteListResponse testSuites = client.ai().assistants().tests().testSuites().list();
```

Returns: `data` (array[string])

## Get test suite run history

Retrieves paginated history of test runs for a specific test suite with filtering options

`GET /ai/assistants/tests/test-suites/{suite_name}/runs`

```java
import com.telnyx.sdk.models.ai.assistants.tests.testsuites.runs.RunListPage;
import com.telnyx.sdk.models.ai.assistants.tests.testsuites.runs.RunListParams;

RunListPage page = client.ai().assistants().tests().testSuites().runs().list("suite_name");
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger test suite execution

Executes all tests within a specific test suite as a batch operation

`POST /ai/assistants/tests/test-suites/{suite_name}/runs`

Optional: `destination_version_id` (string)

```java
import com.telnyx.sdk.models.ai.assistants.tests.runs.TestRunResponse;
import com.telnyx.sdk.models.ai.assistants.tests.testsuites.runs.RunTriggerParams;

List<TestRunResponse> testRunResponses = client.ai().assistants().tests().testSuites().runs().trigger("suite_name");
```

## Get assistant test by ID

Retrieves detailed information about a specific assistant test

`GET /ai/assistants/tests/{test_id}`

```java
import com.telnyx.sdk.models.ai.assistants.tests.AssistantTest;
import com.telnyx.sdk.models.ai.assistants.tests.TestRetrieveParams;

AssistantTest assistantTest = client.ai().assistants().tests().retrieve("test_id");
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Update an assistant test

Updates an existing assistant test configuration with new settings

`PUT /ai/assistants/tests/{test_id}`

Optional: `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (enum: phone_call, web_call, sms_chat, web_chat), `test_suite` (string)

```java
import com.telnyx.sdk.models.ai.assistants.tests.AssistantTest;
import com.telnyx.sdk.models.ai.assistants.tests.TestUpdateParams;

AssistantTest assistantTest = client.ai().assistants().tests().update("test_id");
```

Returns: `created_at` (date-time), `description` (string), `destination` (string), `instructions` (string), `max_duration_seconds` (integer), `name` (string), `rubric` (array[object]), `telnyx_conversation_channel` (object), `test_id` (uuid), `test_suite` (string)

## Delete an assistant test

Permanently removes an assistant test and all associated data

`DELETE /ai/assistants/tests/{test_id}`

```java
import com.telnyx.sdk.models.ai.assistants.tests.TestDeleteParams;

client.ai().assistants().tests().delete("test_id");
```

## Get test run history for a specific test

Retrieves paginated execution history for a specific assistant test with filtering options

`GET /ai/assistants/tests/{test_id}/runs`

```java
import com.telnyx.sdk.models.ai.assistants.tests.runs.RunListPage;
import com.telnyx.sdk.models.ai.assistants.tests.runs.RunListParams;

RunListPage page = client.ai().assistants().tests().runs().list("test_id");
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Trigger a manual test run

Initiates immediate execution of a specific assistant test

`POST /ai/assistants/tests/{test_id}/runs`

Optional: `destination_version_id` (string)

```java
import com.telnyx.sdk.models.ai.assistants.tests.runs.RunTriggerParams;
import com.telnyx.sdk.models.ai.assistants.tests.runs.TestRunResponse;

TestRunResponse testRunResponse = client.ai().assistants().tests().runs().trigger("test_id");
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get specific test run details

Retrieves detailed information about a specific test run execution

`GET /ai/assistants/tests/{test_id}/runs/{run_id}`

```java
import com.telnyx.sdk.models.ai.assistants.tests.runs.RunRetrieveParams;
import com.telnyx.sdk.models.ai.assistants.tests.runs.TestRunResponse;

RunRetrieveParams params = RunRetrieveParams.builder()
    .testId("test_id")
    .runId("run_id")
    .build();
TestRunResponse testRunResponse = client.ai().assistants().tests().runs().retrieve(params);
```

Returns: `completed_at` (date-time), `conversation_id` (string), `conversation_insights_id` (string), `created_at` (date-time), `detail_status` (array[object]), `logs` (string), `run_id` (uuid), `status` (enum: pending, starting, running, passed, failed, error), `test_id` (uuid), `test_suite_run_id` (uuid), `triggered_by` (string), `updated_at` (date-time)

## Get an assistant

Retrieve an AI Assistant configuration by `assistant_id`.

`GET /ai/assistants/{assistant_id}`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantRetrieveParams;
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;

InferenceEmbedding assistant = client.ai().assistants().retrieve("assistant_id");
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update an assistant

Update an AI Assistant's attributes.

`POST /ai/assistants/{assistant_id}`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantUpdateParams;
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;

InferenceEmbedding assistant = client.ai().assistants().update("assistant_id");
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete an assistant

Delete an AI Assistant by `assistant_id`.

`DELETE /ai/assistants/{assistant_id}`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantDeleteParams;
import com.telnyx.sdk.models.ai.assistants.AssistantDeleteResponse;

AssistantDeleteResponse assistant = client.ai().assistants().delete("assistant_id");
```

Returns: `deleted` (boolean), `id` (string), `object` (string)

## Get Canary Deploy

Endpoint to get a canary deploy configuration for an assistant. Retrieves the current canary deploy configuration with all version IDs and their
traffic percentages for the specified assistant.

`GET /ai/assistants/{assistant_id}/canary-deploys`

```java
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployResponse;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployRetrieveParams;

CanaryDeployResponse canaryDeployResponse = client.ai().assistants().canaryDeploys().retrieve("assistant_id");
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Create Canary Deploy

Endpoint to create a canary deploy configuration for an assistant. Creates a new canary deploy configuration with multiple version IDs and their traffic
percentages for A/B testing or gradual rollouts of assistant versions.

`POST /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```java
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeploy;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployCreateParams;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployResponse;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.VersionConfig;

CanaryDeployCreateParams params = CanaryDeployCreateParams.builder()
    .assistantId("assistant_id")
    .canaryDeploy(CanaryDeploy.builder()
        .addVersion(VersionConfig.builder()
            .percentage(1.0)
            .versionId("version_id")
            .build())
        .build())
    .build();
CanaryDeployResponse canaryDeployResponse = client.ai().assistants().canaryDeploys().create(params);
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Update Canary Deploy

Endpoint to update a canary deploy configuration for an assistant. Updates the existing canary deploy configuration with new version IDs and percentages. All old versions and percentages are replaces by new ones from this request.

`PUT /ai/assistants/{assistant_id}/canary-deploys` — Required: `versions`

```java
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeploy;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployResponse;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployUpdateParams;
import com.telnyx.sdk.models.ai.assistants.canarydeploys.VersionConfig;

CanaryDeployUpdateParams params = CanaryDeployUpdateParams.builder()
    .assistantId("assistant_id")
    .canaryDeploy(CanaryDeploy.builder()
        .addVersion(VersionConfig.builder()
            .percentage(1.0)
            .versionId("version_id")
            .build())
        .build())
    .build();
CanaryDeployResponse canaryDeployResponse = client.ai().assistants().canaryDeploys().update(params);
```

Returns: `assistant_id` (string), `created_at` (date-time), `updated_at` (date-time), `versions` (array[object])

## Delete Canary Deploy

Endpoint to delete a canary deploy configuration for an assistant. Removes all canary deploy configurations for the specified assistant.

`DELETE /ai/assistants/{assistant_id}/canary-deploys`

```java
import com.telnyx.sdk.models.ai.assistants.canarydeploys.CanaryDeployDeleteParams;

client.ai().assistants().canaryDeploys().delete("assistant_id");
```

## Assistant Chat (BETA)

This endpoint allows a client to send a chat message to a specific AI Assistant. The assistant processes the message and returns a relevant reply based on the current conversation context.

`POST /ai/assistants/{assistant_id}/chat` — Required: `content`, `conversation_id`

Optional: `name` (string)

```java
import com.telnyx.sdk.models.ai.assistants.AssistantChatParams;
import com.telnyx.sdk.models.ai.assistants.AssistantChatResponse;

AssistantChatParams params = AssistantChatParams.builder()
    .assistantId("assistant_id")
    .content("Tell me a joke about cats")
    .conversationId("42b20469-1215-4a9a-8964-c36f66b406f4")
    .build();
AssistantChatResponse response = client.ai().assistants().chat(params);
```

Returns: `content` (string)

## Assistant Sms Chat

Send an SMS message for an assistant. This endpoint: 
1. Validates the assistant exists and has messaging profile configured 
2.

`POST /ai/assistants/{assistant_id}/chat/sms` — Required: `from`, `to`

Optional: `conversation_metadata` (object), `should_create_conversation` (boolean), `text` (string)

```java
import com.telnyx.sdk.models.ai.assistants.AssistantSendSmsParams;
import com.telnyx.sdk.models.ai.assistants.AssistantSendSmsResponse;

AssistantSendSmsParams params = AssistantSendSmsParams.builder()
    .assistantId("assistant_id")
    .from("from")
    .to("to")
    .build();
AssistantSendSmsResponse response = client.ai().assistants().sendSms(params);
```

Returns: `conversation_id` (string)

## Clone Assistant

Clone an existing assistant, excluding telephony and messaging settings.

`POST /ai/assistants/{assistant_id}/clone`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantCloneParams;
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;

InferenceEmbedding assistant = client.ai().assistants().clone("assistant_id");
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List scheduled events

Get scheduled events for an assistant with pagination and filtering

`GET /ai/assistants/{assistant_id}/scheduled_events`

```java
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventListPage;
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventListParams;

ScheduledEventListPage page = client.ai().assistants().scheduledEvents().list("assistant_id");
```

Returns: `data` (array[object]), `meta` (object)

## Create a scheduled event

Create a scheduled event for an assistant

`POST /ai/assistants/{assistant_id}/scheduled_events` — Required: `telnyx_conversation_channel`, `telnyx_end_user_target`, `telnyx_agent_target`, `scheduled_at_fixed_datetime`

Optional: `conversation_metadata` (object), `dynamic_variables` (object), `text` (string)

```java
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ConversationChannelType;
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventCreateParams;
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventResponse;
import java.time.OffsetDateTime;

ScheduledEventCreateParams params = ScheduledEventCreateParams.builder()
    .assistantId("assistant_id")
    .scheduledAtFixedDatetime(OffsetDateTime.parse("2025-04-15T13:07:28.764Z"))
    .telnyxAgentTarget("telnyx_agent_target")
    .telnyxConversationChannel(ConversationChannelType.PHONE_CALL)
    .telnyxEndUserTarget("telnyx_end_user_target")
    .build();
ScheduledEventResponse scheduledEventResponse = client.ai().assistants().scheduledEvents().create(params);
```

## Get a scheduled event

Retrieve a scheduled event by event ID

`GET /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```java
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventResponse;
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventRetrieveParams;

ScheduledEventRetrieveParams params = ScheduledEventRetrieveParams.builder()
    .assistantId("assistant_id")
    .eventId("event_id")
    .build();
ScheduledEventResponse scheduledEventResponse = client.ai().assistants().scheduledEvents().retrieve(params);
```

## Delete a scheduled event

If the event is pending, this will cancel the event. Otherwise, this will simply remove the record of the event.

`DELETE /ai/assistants/{assistant_id}/scheduled_events/{event_id}`

```java
import com.telnyx.sdk.models.ai.assistants.scheduledevents.ScheduledEventDeleteParams;

ScheduledEventDeleteParams params = ScheduledEventDeleteParams.builder()
    .assistantId("assistant_id")
    .eventId("event_id")
    .build();
client.ai().assistants().scheduledEvents().delete(params);
```

## Add Assistant Tag

`POST /ai/assistants/{assistant_id}/tags` — Required: `tag`

```java
import com.telnyx.sdk.models.ai.assistants.tags.TagAddParams;
import com.telnyx.sdk.models.ai.assistants.tags.TagAddResponse;

TagAddParams params = TagAddParams.builder()
    .assistantId("assistant_id")
    .tag("tag")
    .build();
TagAddResponse response = client.ai().assistants().tags().add(params);
```

Returns: `tags` (array[string])

## Remove Assistant Tag

`DELETE /ai/assistants/{assistant_id}/tags/{tag}`

```java
import com.telnyx.sdk.models.ai.assistants.tags.TagRemoveParams;
import com.telnyx.sdk.models.ai.assistants.tags.TagRemoveResponse;

TagRemoveParams params = TagRemoveParams.builder()
    .assistantId("assistant_id")
    .tag("tag")
    .build();
TagRemoveResponse tag = client.ai().assistants().tags().remove(params);
```

Returns: `tags` (array[string])

## Get assistant texml

Get an assistant texml by `assistant_id`.

`GET /ai/assistants/{assistant_id}/texml`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantGetTexmlParams;

String response = client.ai().assistants().getTexml("assistant_id");
```

## Test Assistant Tool

Test a webhook tool for an assistant

`POST /ai/assistants/{assistant_id}/tools/{tool_id}/test`

Optional: `arguments` (object), `dynamic_variables` (object)

```java
import com.telnyx.sdk.models.ai.assistants.tools.ToolTestParams;
import com.telnyx.sdk.models.ai.assistants.tools.ToolTestResponse;

ToolTestParams params = ToolTestParams.builder()
    .assistantId("assistant_id")
    .toolId("tool_id")
    .build();
ToolTestResponse response = client.ai().assistants().tools().test(params);
```

Returns: `content_type` (string), `request` (object), `response` (string), `status_code` (integer), `success` (boolean)

## Get all versions of an assistant

Retrieves all versions of a specific assistant with complete configuration and metadata

`GET /ai/assistants/{assistant_id}/versions`

```java
import com.telnyx.sdk.models.ai.assistants.AssistantsList;
import com.telnyx.sdk.models.ai.assistants.versions.VersionListParams;

AssistantsList assistantsList = client.ai().assistants().versions().list("assistant_id");
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Get a specific assistant version

Retrieves a specific version of an assistant by assistant_id and version_id

`GET /ai/assistants/{assistant_id}/versions/{version_id}`

```java
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;
import com.telnyx.sdk.models.ai.assistants.versions.VersionRetrieveParams;

VersionRetrieveParams params = VersionRetrieveParams.builder()
    .assistantId("assistant_id")
    .versionId("version_id")
    .build();
InferenceEmbedding assistant = client.ai().assistants().versions().retrieve(params);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Update a specific assistant version

Updates the configuration of a specific assistant version. Can not update main version

`POST /ai/assistants/{assistant_id}/versions/{version_id}`

Optional: `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

```java
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;
import com.telnyx.sdk.models.ai.assistants.versions.UpdateAssistant;
import com.telnyx.sdk.models.ai.assistants.versions.VersionUpdateParams;

VersionUpdateParams params = VersionUpdateParams.builder()
    .assistantId("assistant_id")
    .versionId("version_id")
    .updateAssistant(UpdateAssistant.builder().build())
    .build();
InferenceEmbedding assistant = client.ai().assistants().versions().update(params);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## Delete a specific assistant version

Permanently removes a specific version of an assistant. Can not delete main version

`DELETE /ai/assistants/{assistant_id}/versions/{version_id}`

```java
import com.telnyx.sdk.models.ai.assistants.versions.VersionDeleteParams;

VersionDeleteParams params = VersionDeleteParams.builder()
    .assistantId("assistant_id")
    .versionId("version_id")
    .build();
client.ai().assistants().versions().delete(params);
```

## Promote an assistant version to main

Promotes a specific version to be the main/current version of the assistant. This will delete any existing canary deploy configuration and send all live production traffic to this version.

`POST /ai/assistants/{assistant_id}/versions/{version_id}/promote`

```java
import com.telnyx.sdk.models.ai.assistants.InferenceEmbedding;
import com.telnyx.sdk.models.ai.assistants.versions.VersionPromoteParams;

VersionPromoteParams params = VersionPromoteParams.builder()
    .assistantId("assistant_id")
    .versionId("version_id")
    .build();
InferenceEmbedding assistant = client.ai().assistants().versions().promote(params);
```

Returns: `created_at` (date-time), `description` (string), `dynamic_variables` (object), `dynamic_variables_webhook_url` (string), `enabled_features` (array[object]), `greeting` (string), `id` (string), `import_metadata` (object), `insight_settings` (object), `instructions` (string), `llm_api_key_ref` (string), `messaging_settings` (object), `model` (string), `name` (string), `privacy_settings` (object), `telephony_settings` (object), `tools` (array[object]), `transcription` (object), `voice_settings` (object), `widget_settings` (object)

## List MCP Servers

Retrieve a list of MCP servers.

`GET /ai/mcp_servers`

```java
import com.telnyx.sdk.models.ai.mcpservers.McpServerListPage;
import com.telnyx.sdk.models.ai.mcpservers.McpServerListParams;

McpServerListPage page = client.ai().mcpServers().list();
```

## Create MCP Server

Create a new MCP server.

`POST /ai/mcp_servers` — Required: `name`, `type`, `url`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null)

```java
import com.telnyx.sdk.models.ai.mcpservers.McpServerCreateParams;
import com.telnyx.sdk.models.ai.mcpservers.McpServerCreateResponse;

McpServerCreateParams params = McpServerCreateParams.builder()
    .name("name")
    .type("type")
    .url("url")
    .build();
McpServerCreateResponse mcpServer = client.ai().mcpServers().create(params);
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Get MCP Server

Retrieve details for a specific MCP server.

`GET /ai/mcp_servers/{mcp_server_id}`

```java
import com.telnyx.sdk.models.ai.mcpservers.McpServerRetrieveParams;
import com.telnyx.sdk.models.ai.mcpservers.McpServerRetrieveResponse;

McpServerRetrieveResponse mcpServer = client.ai().mcpServers().retrieve("mcp_server_id");
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Update MCP Server

Update an existing MCP server.

`PUT /ai/mcp_servers/{mcp_server_id}`

Optional: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

```java
import com.telnyx.sdk.models.ai.mcpservers.McpServerUpdateParams;
import com.telnyx.sdk.models.ai.mcpservers.McpServerUpdateResponse;

McpServerUpdateResponse mcpServer = client.ai().mcpServers().update("mcp_server_id");
```

Returns: `allowed_tools` (array | null), `api_key_ref` (string | null), `created_at` (date-time), `id` (string), `name` (string), `type` (string), `url` (string)

## Delete MCP Server

Delete a specific MCP server.

`DELETE /ai/mcp_servers/{mcp_server_id}`

```java
import com.telnyx.sdk.models.ai.mcpservers.McpServerDeleteParams;

client.ai().mcpServers().delete("mcp_server_id");
```
