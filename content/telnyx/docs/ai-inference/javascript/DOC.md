---
name: ai-inference
description: "Access Telnyx LLM inference APIs, embeddings, and AI analytics for call insights and summaries."
metadata:
  languages: "javascript"
  versions: "6.4.0"
  updated-on: "2026-03-06"
  source: official
  tags: "telnyx,ai,inference,llm,embeddings,analytics"
---

# Telnyx AI Inference JavaScript SDK Coding Guidelines

You are a Telnyx AI Inference API expert. Help the user write correct, production-ready code using the official Telnyx JavaScript SDK.

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

## Transcribe speech to text

Transcribe speech to text. This endpoint is consistent with the [OpenAI Transcription API](https://platform.openai.com/docs/api-reference/audio/createTranscription) and may be used with the OpenAI JS or Python SDK.

`POST /ai/audio/transcriptions`

```javascript
const response = await client.ai.audio.transcribe({ model: 'distil-whisper/distil-large-v2' });

console.log(response.text);
```

Returns: `duration` (number), `segments` (array[object]), `text` (string)

## Create a chat completion

Chat with a language model. This endpoint is consistent with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) and may be used with the OpenAI JS or Python SDK.

`POST /ai/chat/completions` — Required: `messages`

Optional: `api_key_ref` (string), `best_of` (integer), `early_stopping` (boolean), `frequency_penalty` (number), `guided_choice` (array[string]), `guided_json` (object), `guided_regex` (string), `length_penalty` (number), `logprobs` (boolean), `max_tokens` (integer), `min_p` (number), `model` (string), `n` (number), `presence_penalty` (number), `response_format` (object), `stream` (boolean), `temperature` (number), `tool_choice` (enum: none, auto, required), `tools` (array[object]), `top_logprobs` (integer), `top_p` (number), `use_beam_search` (boolean)

```javascript
const response = await client.ai.chat.createCompletion({
  messages: [
    { role: 'system', content: 'You are a friendly chatbot.' },
    { role: 'user', content: 'Hello, world!' },
  ],
});

console.log(response);
```

## List conversations

Retrieve a list of all AI conversations configured by the user. Supports [PostgREST-style query parameters](https://postgrest.org/en/stable/api.html#horizontal-filtering-rows) for filtering. Examples are included for the standard metadata fields, but you can filter on any field in the metadata JSON object.

`GET /ai/conversations`

```javascript
const conversations = await client.ai.conversations.list();

console.log(conversations.data);
```

Returns: `created_at` (date-time), `id` (uuid), `last_message_at` (date-time), `metadata` (object), `name` (string)

## Create a conversation

Create a new AI Conversation.

`POST /ai/conversations`

Optional: `metadata` (object), `name` (string)

```javascript
const conversation = await client.ai.conversations.create();

console.log(conversation.id);
```

Returns: `created_at` (date-time), `id` (uuid), `last_message_at` (date-time), `metadata` (object), `name` (string)

## Get Insight Template Groups

Get all insight groups

`GET /ai/conversations/insight-groups`

```javascript
// Automatically fetches more pages as needed.
for await (const insightTemplateGroup of client.ai.conversations.insightGroups.retrieveInsightGroups()) {
  console.log(insightTemplateGroup.id);
}
```

Returns: `created_at` (date-time), `description` (string), `id` (uuid), `insights` (array[object]), `name` (string), `webhook` (string)

## Create Insight Template Group

Create a new insight group

`POST /ai/conversations/insight-groups` — Required: `name`

Optional: `description` (string), `webhook` (string)

```javascript
const insightTemplateGroupDetail = await client.ai.conversations.insightGroups.insightGroups({
  name: 'name',
});

console.log(insightTemplateGroupDetail.data);
```

Returns: `created_at` (date-time), `description` (string), `id` (uuid), `insights` (array[object]), `name` (string), `webhook` (string)

## Get Insight Template Group

Get insight group by ID

`GET /ai/conversations/insight-groups/{group_id}`

```javascript
const insightTemplateGroupDetail = await client.ai.conversations.insightGroups.retrieve(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(insightTemplateGroupDetail.data);
```

Returns: `created_at` (date-time), `description` (string), `id` (uuid), `insights` (array[object]), `name` (string), `webhook` (string)

## Update Insight Template Group

Update an insight template group

`PUT /ai/conversations/insight-groups/{group_id}`

Optional: `description` (string), `name` (string), `webhook` (string)

```javascript
const insightTemplateGroupDetail = await client.ai.conversations.insightGroups.update(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(insightTemplateGroupDetail.data);
```

Returns: `created_at` (date-time), `description` (string), `id` (uuid), `insights` (array[object]), `name` (string), `webhook` (string)

## Delete Insight Template Group

Delete insight group by ID

`DELETE /ai/conversations/insight-groups/{group_id}`

```javascript
await client.ai.conversations.insightGroups.delete('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');
```

## Assign Insight Template To Group

Assign an insight to a group

`POST /ai/conversations/insight-groups/{group_id}/insights/{insight_id}/assign`

```javascript
await client.ai.conversations.insightGroups.insights.assign(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { group_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);
```

## Unassign Insight Template From Group

Remove an insight from a group

`DELETE /ai/conversations/insight-groups/{group_id}/insights/{insight_id}/unassign`

```javascript
await client.ai.conversations.insightGroups.insights.deleteUnassign(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  { group_id: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e' },
);
```

## Get Insight Templates

Get all insights

`GET /ai/conversations/insights`

```javascript
// Automatically fetches more pages as needed.
for await (const insightTemplate of client.ai.conversations.insights.list()) {
  console.log(insightTemplate.id);
}
```

Returns: `created_at` (date-time), `id` (uuid), `insight_type` (enum: custom, default), `instructions` (string), `json_schema` (object), `name` (string), `webhook` (string)

## Create Insight Template

Create a new insight

`POST /ai/conversations/insights` — Required: `instructions`, `name`

Optional: `json_schema` (object), `webhook` (string)

```javascript
const insightTemplateDetail = await client.ai.conversations.insights.create({
  instructions: 'instructions',
  name: 'name',
});

console.log(insightTemplateDetail.data);
```

Returns: `created_at` (date-time), `id` (uuid), `insight_type` (enum: custom, default), `instructions` (string), `json_schema` (object), `name` (string), `webhook` (string)

## Get Insight Template

Get insight by ID

`GET /ai/conversations/insights/{insight_id}`

```javascript
const insightTemplateDetail = await client.ai.conversations.insights.retrieve(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(insightTemplateDetail.data);
```

Returns: `created_at` (date-time), `id` (uuid), `insight_type` (enum: custom, default), `instructions` (string), `json_schema` (object), `name` (string), `webhook` (string)

## Update Insight Template

Update an insight template

`PUT /ai/conversations/insights/{insight_id}`

Optional: `instructions` (string), `json_schema` (object), `name` (string), `webhook` (string)

```javascript
const insightTemplateDetail = await client.ai.conversations.insights.update(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(insightTemplateDetail.data);
```

Returns: `created_at` (date-time), `id` (uuid), `insight_type` (enum: custom, default), `instructions` (string), `json_schema` (object), `name` (string), `webhook` (string)

## Delete Insight Template

Delete insight by ID

`DELETE /ai/conversations/insights/{insight_id}`

```javascript
await client.ai.conversations.insights.delete('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e');
```

## Get a conversation

Retrieve a specific AI conversation by its ID.

`GET /ai/conversations/{conversation_id}`

```javascript
const conversation = await client.ai.conversations.retrieve('conversation_id');

console.log(conversation.data);
```

Returns: `created_at` (date-time), `id` (uuid), `last_message_at` (date-time), `metadata` (object), `name` (string)

## Update conversation metadata

Update metadata for a specific conversation.

`PUT /ai/conversations/{conversation_id}`

Optional: `metadata` (object)

```javascript
const conversation = await client.ai.conversations.update('conversation_id');

console.log(conversation.data);
```

Returns: `created_at` (date-time), `id` (uuid), `last_message_at` (date-time), `metadata` (object), `name` (string)

## Delete a conversation

Delete a specific conversation by its ID.

`DELETE /ai/conversations/{conversation_id}`

```javascript
await client.ai.conversations.delete('conversation_id');
```

## Get insights for a conversation

Retrieve insights for a specific conversation

`GET /ai/conversations/{conversation_id}/conversations-insights`

```javascript
const response = await client.ai.conversations.retrieveConversationsInsights('conversation_id');

console.log(response.data);
```

Returns: `conversation_insights` (array[object]), `created_at` (date-time), `id` (string), `status` (enum: pending, in_progress, completed, failed)

## Create Message

Add a new message to the conversation. Used to insert a new messages to a conversation manually ( without using chat endpoint )

`POST /ai/conversations/{conversation_id}/message` — Required: `role`

Optional: `content` (string), `metadata` (object), `name` (string), `sent_at` (date-time), `tool_call_id` (string), `tool_calls` (array[object]), `tool_choice` (object)

```javascript
await client.ai.conversations.addMessage('182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e', { role: 'role' });
```

## Get conversation messages

Retrieve messages for a specific conversation, including tool calls made by the assistant.

`GET /ai/conversations/{conversation_id}/messages`

```javascript
const messages = await client.ai.conversations.messages.list('conversation_id');

console.log(messages.data);
```

Returns: `created_at` (date-time), `role` (enum: user, assistant, tool), `sent_at` (date-time), `text` (string), `tool_calls` (array[object])

## Get Tasks by Status

Retrieve tasks for the user that are either `queued`, `processing`, `failed`, `success` or `partial_success` based on the query string. Defaults to `queued` and `processing`.

`GET /ai/embeddings`

```javascript
const embeddings = await client.ai.embeddings.list();

console.log(embeddings.data);
```

Returns: `bucket` (string), `created_at` (date-time), `finished_at` (date-time), `status` (enum: queued, processing, success, failure, partial_success), `task_id` (string), `task_name` (string), `user_id` (string)

## Embed documents

Perform embedding on a Telnyx Storage Bucket using an embedding model. The current supported file types are:
- PDF
- HTML
- txt/unstructured text files
- json
- csv
- audio / video (mp3, mp4, mpeg, mpga, m4a, wav, or webm ) - Max of 100mb file size. Any files not matching the above types will be attempted to be embedded as unstructured text.

`POST /ai/embeddings` — Required: `bucket_name`

Optional: `document_chunk_overlap_size` (integer), `document_chunk_size` (integer), `embedding_model` (object), `loader` (object)

```javascript
const embeddingResponse = await client.ai.embeddings.create({ bucket_name: 'bucket_name' });

console.log(embeddingResponse.data);
```

Returns: `created_at` (string), `finished_at` (string | null), `status` (string), `task_id` (uuid), `task_name` (string), `user_id` (uuid)

## List embedded buckets

Get all embedding buckets for a user.

`GET /ai/embeddings/buckets`

```javascript
const buckets = await client.ai.embeddings.buckets.list();

console.log(buckets.data);
```

Returns: `buckets` (array[string])

## Get file-level embedding statuses for a bucket

Get all embedded files for a given user bucket, including their processing status.

`GET /ai/embeddings/buckets/{bucket_name}`

```javascript
const bucket = await client.ai.embeddings.buckets.retrieve('bucket_name');

console.log(bucket.data);
```

Returns: `created_at` (date-time), `error_reason` (string), `filename` (string), `last_embedded_at` (date-time), `status` (string), `updated_at` (date-time)

## Disable AI for an Embedded Bucket

Deletes an entire bucket's embeddings and disables the bucket for AI-use, returning it to normal storage pricing.

`DELETE /ai/embeddings/buckets/{bucket_name}`

```javascript
await client.ai.embeddings.buckets.delete('bucket_name');
```

## Search for documents

Perform a similarity search on a Telnyx Storage Bucket, returning the most similar `num_docs` document chunks to the query. Currently the only available distance metric is cosine similarity which will return a `distance` between 0 and 1. The lower the distance, the more similar the returned document chunks are to the query.

`POST /ai/embeddings/similarity-search` — Required: `bucket_name`, `query`

Optional: `num_of_docs` (integer)

```javascript
const response = await client.ai.embeddings.similaritySearch({
  bucket_name: 'bucket_name',
  query: 'query',
});

console.log(response.data);
```

Returns: `distance` (number), `document_chunk` (string), `metadata` (object)

## Embed URL content

Embed website content from a specified URL, including child pages up to 5 levels deep within the same domain. The process crawls and loads content from the main URL and its linked pages into a Telnyx Cloud Storage bucket.

`POST /ai/embeddings/url` — Required: `url`, `bucket_name`

```javascript
const embeddingResponse = await client.ai.embeddings.url({
  bucket_name: 'bucket_name',
  url: 'url',
});

console.log(embeddingResponse.data);
```

Returns: `created_at` (string), `finished_at` (string | null), `status` (string), `task_id` (uuid), `task_name` (string), `user_id` (uuid)

## Get an embedding task's status

Check the status of a current embedding task. Will be one of the following:
- `queued` - Task is waiting to be picked up by a worker
- `processing` - The embedding task is running
- `success` - Task completed successfully and the bucket is embedded
- `failure` - Task failed and no files were embedded successfully
- `partial_success` - Some files were embedded successfully, but at least one failed

`GET /ai/embeddings/{task_id}`

```javascript
const embedding = await client.ai.embeddings.retrieve('task_id');

console.log(embedding.data);
```

Returns: `created_at` (string), `finished_at` (string), `status` (enum: queued, processing, success, failure, partial_success), `task_id` (uuid), `task_name` (string)

## List fine tuning jobs

Retrieve a list of all fine tuning jobs created by the user.

`GET /ai/fine_tuning/jobs`

```javascript
const jobs = await client.ai.fineTuning.jobs.list();

console.log(jobs.data);
```

Returns: `created_at` (integer), `finished_at` (integer | null), `hyperparameters` (object), `id` (string), `model` (string), `organization_id` (string), `status` (enum: queued, running, succeeded, failed, cancelled), `trained_tokens` (integer | null), `training_file` (string)

## Create a fine tuning job

Create a new fine tuning job.

`POST /ai/fine_tuning/jobs` — Required: `model`, `training_file`

Optional: `hyperparameters` (object), `suffix` (string)

```javascript
const fineTuningJob = await client.ai.fineTuning.jobs.create({
  model: 'model',
  training_file: 'training_file',
});

console.log(fineTuningJob.id);
```

Returns: `created_at` (integer), `finished_at` (integer | null), `hyperparameters` (object), `id` (string), `model` (string), `organization_id` (string), `status` (enum: queued, running, succeeded, failed, cancelled), `trained_tokens` (integer | null), `training_file` (string)

## Get a fine tuning job

Retrieve a fine tuning job by `job_id`.

`GET /ai/fine_tuning/jobs/{job_id}`

```javascript
const fineTuningJob = await client.ai.fineTuning.jobs.retrieve('job_id');

console.log(fineTuningJob.id);
```

Returns: `created_at` (integer), `finished_at` (integer | null), `hyperparameters` (object), `id` (string), `model` (string), `organization_id` (string), `status` (enum: queued, running, succeeded, failed, cancelled), `trained_tokens` (integer | null), `training_file` (string)

## Cancel a fine tuning job

Cancel a fine tuning job.

`POST /ai/fine_tuning/jobs/{job_id}/cancel`

```javascript
const fineTuningJob = await client.ai.fineTuning.jobs.cancel('job_id');

console.log(fineTuningJob.id);
```

Returns: `created_at` (integer), `finished_at` (integer | null), `hyperparameters` (object), `id` (string), `model` (string), `organization_id` (string), `status` (enum: queued, running, succeeded, failed, cancelled), `trained_tokens` (integer | null), `training_file` (string)

## Get available models

This endpoint returns a list of Open Source and OpenAI models that are available for use.    **Note**: Model `id`'s will be in the form `{source}/{model_name}`. For example `openai/gpt-4` or `mistralai/Mistral-7B-Instruct-v0.1` consistent with HuggingFace naming conventions.

`GET /ai/models`

```javascript
const response = await client.ai.retrieveModels();

console.log(response.data);
```

Returns: `created` (integer), `id` (string), `object` (string), `owned_by` (string)

## Create embeddings

Creates an embedding vector representing the input text. This endpoint is compatible with the [OpenAI Embeddings API](https://platform.openai.com/docs/api-reference/embeddings) and may be used with the OpenAI JS or Python SDK by setting the base URL to `https://api.telnyx.com/v2/ai/openai`.

`POST /ai/openai/embeddings` — Required: `input`, `model`

Optional: `dimensions` (integer), `encoding_format` (enum: float, base64), `user` (string)

```javascript
const response = await client.ai.openai.embeddings.createEmbeddings({
  input: 'The quick brown fox jumps over the lazy dog',
  model: 'thenlper/gte-large',
});

console.log(response.data);
```

Returns: `data` (array[object]), `model` (string), `object` (string), `usage` (object)

## List embedding models

Returns a list of available embedding models. This endpoint is compatible with the OpenAI Models API format.

`GET /ai/openai/embeddings/models`

```javascript
const response = await client.ai.openai.embeddings.listEmbeddingModels();

console.log(response.data);
```

Returns: `created` (integer), `id` (string), `object` (string), `owned_by` (string)

## Summarize file content

Generate a summary of a file's contents. Supports the following text formats: 
- PDF, HTML, txt, json, csv

 Supports the following media formats (billed for both the transcription and summary): 
- flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm
- Up to 100 MB

`POST /ai/summarize` — Required: `bucket`, `filename`

Optional: `system_prompt` (string)

```javascript
const response = await client.ai.summarize({ bucket: 'bucket', filename: 'filename' });

console.log(response.data);
```

Returns: `summary` (string)

## Get all Speech to Text batch report requests

Retrieves all Speech to Text batch report requests for the authenticated user

`GET /legacy/reporting/batch_detail_records/speech_to_text`

```javascript
const speechToTexts = await client.legacy.reporting.batchDetailRecords.speechToText.list();

console.log(speechToTexts.data);
```

Returns: `created_at` (date-time), `download_link` (string), `end_date` (date-time), `id` (string), `record_type` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED)

## Create a new Speech to Text batch report request

Creates a new Speech to Text batch report request with the specified filters

`POST /legacy/reporting/batch_detail_records/speech_to_text` — Required: `start_date`, `end_date`

```javascript
const speechToText = await client.legacy.reporting.batchDetailRecords.speechToText.create({
  end_date: '2020-07-01T00:00:00-06:00',
  start_date: '2020-07-01T00:00:00-06:00',
});

console.log(speechToText.data);
```

Returns: `created_at` (date-time), `download_link` (string), `end_date` (date-time), `id` (string), `record_type` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED)

## Get a specific Speech to Text batch report request

Retrieves a specific Speech to Text batch report request by ID

`GET /legacy/reporting/batch_detail_records/speech_to_text/{id}`

```javascript
const speechToText = await client.legacy.reporting.batchDetailRecords.speechToText.retrieve(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(speechToText.data);
```

Returns: `created_at` (date-time), `download_link` (string), `end_date` (date-time), `id` (string), `record_type` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED)

## Delete a Speech to Text batch report request

Deletes a specific Speech to Text batch report request by ID

`DELETE /legacy/reporting/batch_detail_records/speech_to_text/{id}`

```javascript
const speechToText = await client.legacy.reporting.batchDetailRecords.speechToText.delete(
  '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
);

console.log(speechToText.data);
```

Returns: `created_at` (date-time), `download_link` (string), `end_date` (date-time), `id` (string), `record_type` (string), `start_date` (date-time), `status` (enum: PENDING, COMPLETE, FAILED, EXPIRED)

## Get speech to text usage report

Generate and fetch speech to text usage report synchronously. This endpoint will both generate and fetch the speech to text report over a specified time period.

`GET /legacy/reporting/usage_reports/speech_to_text`

```javascript
const response = await client.legacy.reporting.usageReports.retrieveSpeechToText();

console.log(response.data);
```

Returns: `data` (object)

## Generate speech from text

Generate synthesized speech audio from text input. Returns audio in the requested format (binary audio stream, base64-encoded JSON, or an audio URL for later retrieval). Authentication is provided via the standard `Authorization: Bearer ` header.

`POST /text-to-speech/speech`

Optional: `aws` (object), `azure` (object), `disable_cache` (boolean), `elevenlabs` (object), `language` (string), `minimax` (object), `output_type` (enum: binary_output, base64_output), `provider` (enum: aws, telnyx, azure, elevenlabs, minimax, rime, resemble), `resemble` (object), `rime` (object), `telnyx` (object), `text` (string), `text_type` (enum: text, ssml), `voice` (string), `voice_settings` (object)

```javascript
const response = await client.textToSpeech.generate();

console.log(response.base64_audio);
```

Returns: `base64_audio` (string)

## List available voices

Retrieve a list of available voices from one or all TTS providers. When `provider` is specified, returns voices for that provider only. Otherwise, returns voices from all providers.

`GET /text-to-speech/voices`

```javascript
const response = await client.textToSpeech.listVoices();

console.log(response.voices);
```

Returns: `voices` (array[object])

## Get all Wireless Detail Records (WDRs) Reports

Returns the WDR Reports that match the given parameters.

`GET /wireless/detail_records_reports`

```javascript
const detailRecordsReports = await client.wireless.detailRecordsReports.list();

console.log(detailRecordsReports.data);
```

Returns: `created_at` (string), `end_time` (string), `id` (uuid), `record_type` (string), `report_url` (string), `start_time` (string), `status` (enum: pending, complete, failed, deleted), `updated_at` (string)

## Create a Wireless Detail Records (WDRs) Report

Asynchronously create a report containing Wireless Detail Records (WDRs) for the SIM cards that consumed wireless data in the given time period.

`POST /wireless/detail_records_reports`

Optional: `end_time` (string), `start_time` (string)

```javascript
const detailRecordsReport = await client.wireless.detailRecordsReports.create();

console.log(detailRecordsReport.data);
```

Returns: `created_at` (string), `end_time` (string), `id` (uuid), `record_type` (string), `report_url` (string), `start_time` (string), `status` (enum: pending, complete, failed, deleted), `updated_at` (string)

## Get a Wireless Detail Record (WDR) Report

Returns one specific WDR report

`GET /wireless/detail_records_reports/{id}`

```javascript
const detailRecordsReport = await client.wireless.detailRecordsReports.retrieve(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(detailRecordsReport.data);
```

Returns: `created_at` (string), `end_time` (string), `id` (uuid), `record_type` (string), `report_url` (string), `start_time` (string), `status` (enum: pending, complete, failed, deleted), `updated_at` (string)

## Delete a Wireless Detail Record (WDR) Report

Deletes one specific WDR report.

`DELETE /wireless/detail_records_reports/{id}`

```javascript
const detailRecordsReport = await client.wireless.detailRecordsReports.delete(
  '6a09cdc3-8948-47f0-aa62-74ac943d6c58',
);

console.log(detailRecordsReport.data);
```

Returns: `created_at` (string), `end_time` (string), `id` (uuid), `record_type` (string), `report_url` (string), `start_time` (string), `status` (enum: pending, complete, failed, deleted), `updated_at` (string)
