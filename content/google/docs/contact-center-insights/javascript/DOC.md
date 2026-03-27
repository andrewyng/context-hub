---
name: contact-center-insights
description: "Google Cloud Contact Center Insights Node.js client for settings, conversation upload, analysis, and issue model workflows"
metadata:
  languages: "javascript"
  versions: "4.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,contact-center-insights,ccai,conversation-analysis,javascript,nodejs"
---

# `@google-cloud/contact-center-insights` JavaScript Package Guide

Use `@google-cloud/contact-center-insights` when your Node.js code needs to manage Contact Center Insights settings, upload or create conversations, run analyses, and work with deployed issue models.

## Golden Rule

- Import the generated client from the `v1` namespace.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Pass full resource names like `projects/PROJECT_ID/locations/LOCATION/...`.
- Use `uploadConversation()` for audio files that need transcription or redaction.
- Use `createConversation()` when you already have a transcript and do not need transcription or redaction.
- Await long-running operations with `operation.promise()` before reading results.

This guide covers `4.1.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/contact-center-insights@4.1.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the Contact Center Insights API in the project your application uses to call the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
gcloud services enable contactcenterinsights.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Before calling the API, make sure:

1. The Contact Center Insights API is enabled.
2. The caller has permission to read and write Contact Center Insights resources in the target project and location.
3. Any Cloud Storage URIs you pass are accessible to the calling identity.
4. Your code consistently uses one location string such as `us-central1` when building resource names.

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/contact-center-insights';

const client = new v1.ContactCenterInsightsClient();
```

With an explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Resource Names You Reuse Constantly

Build these once and pass them through your app:

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const parent = `projects/${projectId}/locations/${location}`;
const settingsName = `${parent}/settings`;
const conversationName = `${parent}/conversations/my-conversation-id`;
const issueModelName = `${parent}/issueModels/my-issue-model-id`;
```

## Core Workflows

### Read Location Settings

Use `getSettings()` to inspect the default language, speech config, redaction config, and automatic analysis behavior for one location.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function getLocationSettings(projectId, location) {
  const [settings] = await client.getSettings({
    name: `projects/${projectId}/locations/${location}/settings`,
  });

  return {
    name: settings.name,
    languageCode: settings.languageCode,
    conversationTtl: settings.conversationTtl,
    analysisConfig: settings.analysisConfig,
  };
}
```

### Update Default Settings With A Field Mask

Use `updateSettings()` with a field mask so you only change the settings you intend to change.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function enableAutomaticUploadAnalysis(projectId, location) {
  const name = `projects/${projectId}/locations/${location}/settings`;

  const [settings] = await client.updateSettings({
    settings: {
      name,
      languageCode: 'en-US',
      analysisConfig: {
        uploadConversationAnalysisPercentage: 100,
      },
    },
    updateMask: {
      paths: [
        'language_code',
        'analysis_config.upload_conversation_analysis_percentage',
      ],
    },
  });

  return settings;
}
```

### Create A Transcript-Only Conversation

Use `createConversation()` when the transcript already exists in Cloud Storage. This path does not perform audio transcription or redaction.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function createTranscriptConversation(projectId, location) {
  const [conversation] = await client.createConversation({
    parent: `projects/${projectId}/locations/${location}`,
    conversationId: 'chat-001',
    conversation: {
      medium: 'CHAT',
      languageCode: 'en-US',
      dataSource: {
        gcsSource: {
          transcriptUri: 'gs://my-contact-center-data/transcripts/chat-001.json',
        },
      },
      labels: {
        channel: 'support',
      },
    },
  });

  return conversation.name;
}
```

### Upload An Audio Conversation

Use `uploadConversation()` when you are starting from audio in Cloud Storage and want Contact Center Insights to process it as a long-running operation.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function uploadPhoneCall(projectId, location) {
  const [operation] = await client.uploadConversation({
    parent: `projects/${projectId}/locations/${location}`,
    conversationId: 'call-001',
    conversation: {
      medium: 'PHONE_CALL',
      languageCode: 'en-US',
      dataSource: {
        gcsSource: {
          audioUri: 'gs://my-contact-center-data/audio/call-001.wav',
        },
      },
      callMetadata: {
        agentChannel: 1,
        customerChannel: 2,
      },
    },
  });

  await operation.promise();
}
```

If you use stereo call recordings, set `agentChannel` and `customerChannel` so the conversation is analyzed against the correct speaker channels.

### List Conversations In One Location

Use `listConversationsAsync()` for inventory-style reads and filter in your own code unless you already have a precise server-side filter.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function listConversationNames(projectId, location) {
  const names = [];

  for await (const conversation of client.listConversationsAsync({
    parent: `projects/${projectId}/locations/${location}`,
    pageSize: 50,
  })) {
    names.push(conversation.name);
  }

  return names;
}
```

### Run An On-Demand Analysis For One Conversation

Use `createAnalysis()` when you want explicit control over which annotators run for a conversation.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function analyzeConversation(projectId, location, conversationId) {
  const [operation] = await client.createAnalysis({
    parent: `projects/${projectId}/locations/${location}/conversations/${conversationId}`,
    analysis: {
      annotatorSelector: {
        runEntityAnnotator: true,
        runIssueModelAnnotator: true,
        runSentimentAnnotator: true,
        runSummarizationAnnotator: true,
      },
    },
  });

  const [analysis] = await operation.promise();
  return analysis.name;
}
```

`runIssueModelAnnotator` only has effect when an issue model is already deployed in that location.

### List Analyses For A Conversation

Use `listAnalysesAsync()` when you need to inspect completed analysis resources for one conversation.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function listAnalysisNames(projectId, location, conversationId) {
  const names = [];

  for await (const analysis of client.listAnalysesAsync({
    parent: `projects/${projectId}/locations/${location}/conversations/${conversationId}`,
  })) {
    names.push(analysis.name);
  }

  return names;
}
```

### Deploy An Existing Issue Model

An issue model must be deployed before issue-model-based analysis can use it.

```javascript
const {v1} = require('@google-cloud/contact-center-insights');

const client = new v1.ContactCenterInsightsClient();

async function deployIssueModel(projectId, location, issueModelId) {
  const [operation] = await client.deployIssueModel({
    name: `projects/${projectId}/locations/${location}/issueModels/${issueModelId}`,
  });

  await operation.promise();
}
```

## Version And Namespace Notes

- Prefer `v1` unless you are intentionally maintaining code against another versioned namespace.
- Request objects use JavaScript `camelCase` field names such as `languageCode` and `conversationTtl`.
- Field masks use proto field paths such as `language_code` and `analysis_config.upload_conversation_analysis_percentage`.

## Important Pitfalls

- Passing a bare project ID where the API expects `projects/.../locations/...` resource names.
- Using `createConversation()` for audio uploads that need transcription or redaction. Use `uploadConversation()` instead.
- Forgetting to await `operation.promise()` on upload, analysis, or issue model deployment.
- Enabling the issue model annotator before a model is deployed.
- Omitting speaker channel metadata for multi-channel phone audio.
- Mixing locations across settings, conversations, issue models, and Cloud Storage inputs in the same workflow.

## Official Sources

- Maintainer package docs: `https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-contactcenterinsights`
- Node.js client reference root: `https://cloud.google.com/nodejs/docs/reference/contact-center-insights/latest`
- Product documentation: `https://cloud.google.com/contact-center/insights/docs`
- Authentication with ADC: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- npm registry: `https://www.npmjs.com/package/@google-cloud/contact-center-insights`
