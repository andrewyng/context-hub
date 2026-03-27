---
name: dialogflow
description: "Google Cloud Dialogflow ES Node.js client for sessions, intents, contexts, entities, and agent operations"
metadata:
  languages: "javascript"
  versions: "7.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,dialogflow,dialogflow-es,gcp,nlp,chatbot,javascript,nodejs"
---

# `@google-cloud/dialogflow` JavaScript Package Guide

Use `@google-cloud/dialogflow` for Dialogflow ES integrations in Node.js: detect intent for a session, inspect contexts, and manage agent resources such as intents and entities.

## Golden Rule

- Use the `v2` namespace for Dialogflow ES examples.
- Use Google Cloud credentials through Application Default Credentials (ADC), not API keys.
- Do not mix Dialogflow CX examples into this package. Dialogflow CX uses a different API surface.
- For regional agents, keep both the `apiEndpoint` and every resource name in the same location.
- Reuse one stable `sessionId` for a single end-user conversation so contexts can carry across turns.

This guide covers `7.5.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/dialogflow@7.5.0
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable Dialogflow in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable dialogflow.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export DIALOGFLOW_LOCATION="global"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export DIALOGFLOW_LOCATION="global"
```

Practical setup notes:

1. The project must have Dialogflow enabled.
2. The resolved credential must have Dialogflow permissions in that project.
3. For regional agents, set `DIALOGFLOW_LOCATION` to the agent region such as `us-central1`.
4. Prefer attached service accounts or impersonation over long-lived JSON key files when you control the runtime environment.

## Initialize The Client

CommonJS:

```javascript
const {v2: dialogflow} = require('@google-cloud/dialogflow');

function getDialogflowEndpoint(location = 'global') {
  return location === 'global'
    ? 'dialogflow.googleapis.com'
    : `${location}-dialogflow.googleapis.com`;
}

function createSessionsClient(location = 'global') {
  if (location === 'global') {
    return new dialogflow.SessionsClient();
  }

  return new dialogflow.SessionsClient({
    apiEndpoint: getDialogflowEndpoint(location),
  });
}
```

ES modules:

```javascript
import {v2 as dialogflow} from '@google-cloud/dialogflow';

function getDialogflowEndpoint(location = 'global') {
  return location === 'global'
    ? 'dialogflow.googleapis.com'
    : `${location}-dialogflow.googleapis.com`;
}

function createSessionsClient(location = 'global') {
  if (location === 'global') {
    return new dialogflow.SessionsClient();
  }

  return new dialogflow.SessionsClient({
    apiEndpoint: getDialogflowEndpoint(location),
  });
}
```

With explicit project ID and key file:

```javascript
const {v2: dialogflow} = require('@google-cloud/dialogflow');

const client = new dialogflow.SessionsClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Resource Name Helpers

Dialogflow ES uses different resource formats for global and regional agents. Build them consistently:

```javascript
function getAgentName(projectId, location = 'global') {
  return location === 'global'
    ? `projects/${projectId}/agent`
    : `projects/${projectId}/locations/${location}/agent`;
}

function getSessionName(projectId, sessionId, location = 'global') {
  return location === 'global'
    ? `projects/${projectId}/agent/sessions/${sessionId}`
    : `projects/${projectId}/locations/${location}/agent/sessions/${sessionId}`;
}
```

Use the same location for all related resources in a request flow.

## Core Workflows

### Detect Intent From Text

This is the main runtime flow for text chat.

```javascript
const {v2: dialogflow} = require('@google-cloud/dialogflow');

function getDialogflowEndpoint(location = 'global') {
  return location === 'global'
    ? 'dialogflow.googleapis.com'
    : `${location}-dialogflow.googleapis.com`;
}

function createSessionsClient(location = 'global') {
  if (location === 'global') {
    return new dialogflow.SessionsClient();
  }

  return new dialogflow.SessionsClient({
    apiEndpoint: getDialogflowEndpoint(location),
  });
}

function getSessionName(projectId, sessionId, location = 'global') {
  return location === 'global'
    ? `projects/${projectId}/agent/sessions/${sessionId}`
    : `projects/${projectId}/locations/${location}/agent/sessions/${sessionId}`;
}

async function detectIntentFromText({
  projectId,
  sessionId,
  text,
  languageCode = 'en-US',
  location = 'global',
}) {
  const client = createSessionsClient(location);
  const session = getSessionName(projectId, sessionId, location);

  const [response] = await client.detectIntent({
    session,
    queryInput: {
      text: {
        text,
        languageCode,
      },
    },
  });

  const result = response.queryResult;

  return {
    intent: result.intent?.displayName ?? null,
    confidence: result.intentDetectionConfidence ?? 0,
    fulfillmentText: result.fulfillmentText ?? '',
    parameters: result.parameters,
  };
}

async function main() {
  const response = await detectIntentFromText({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    sessionId: 'web-demo-session',
    text: 'Book a table for two tonight',
    languageCode: 'en-US',
    location: process.env.DIALOGFLOW_LOCATION || 'global',
  });

  console.log(response);
}

main().catch(console.error);
```

Use one stable `sessionId` per conversation. If every turn uses a new session ID, Dialogflow cannot reuse context from earlier turns.

### Trigger An Intent With An Event

Use an event input when your application needs to start a flow explicitly instead of matching end-user text.

```javascript
const {v2: dialogflow} = require('@google-cloud/dialogflow');

function getDialogflowEndpoint(location = 'global') {
  return location === 'global'
    ? 'dialogflow.googleapis.com'
    : `${location}-dialogflow.googleapis.com`;
}

function createSessionsClient(location = 'global') {
  if (location === 'global') {
    return new dialogflow.SessionsClient();
  }

  return new dialogflow.SessionsClient({
    apiEndpoint: getDialogflowEndpoint(location),
  });
}

function getSessionName(projectId, sessionId, location = 'global') {
  return location === 'global'
    ? `projects/${projectId}/agent/sessions/${sessionId}`
    : `projects/${projectId}/locations/${location}/agent/sessions/${sessionId}`;
}

async function detectIntentFromEvent({
  projectId,
  sessionId,
  eventName,
  languageCode = 'en-US',
  location = 'global',
}) {
  const client = createSessionsClient(location);
  const session = getSessionName(projectId, sessionId, location);

  const [response] = await client.detectIntent({
    session,
    queryInput: {
      event: {
        name: eventName,
        languageCode,
      },
    },
  });

  return response.queryResult;
}
```

### List Active Contexts For A Session

Contexts show what Dialogflow is carrying forward between turns.

```javascript
const {v2: dialogflow} = require('@google-cloud/dialogflow');

function getDialogflowEndpoint(location = 'global') {
  return location === 'global'
    ? 'dialogflow.googleapis.com'
    : `${location}-dialogflow.googleapis.com`;
}

function createContextsClient(location = 'global') {
  if (location === 'global') {
    return new dialogflow.ContextsClient();
  }

  return new dialogflow.ContextsClient({
    apiEndpoint: getDialogflowEndpoint(location),
  });
}

function getSessionName(projectId, sessionId, location = 'global') {
  return location === 'global'
    ? `projects/${projectId}/agent/sessions/${sessionId}`
    : `projects/${projectId}/locations/${location}/agent/sessions/${sessionId}`;
}

async function listActiveContexts({projectId, sessionId, location = 'global'}) {
  const client = createContextsClient(location);
  const parent = getSessionName(projectId, sessionId, location);
  const [contexts] = await client.listContexts({parent});

  return contexts.map(context => ({
    name: context.name,
    lifespanCount: context.lifespanCount,
    parameters: context.parameters,
  }));
}
```

## Other Common Operations

Use these clients when you move beyond runtime session handling:

- `IntentsClient` for listing, creating, updating, and deleting intents
- `EntityTypesClient` for custom entities and synonyms
- `AgentsClient` for agent metadata and supported languages
- `KnowledgeBasesClient` and `DocumentsClient` for knowledge connectors
- `SessionEntityTypesClient` for per-session entity overrides

Keep the endpoint and resource-name location aligned for those clients too.

## Important Pitfalls

- Dialogflow ES vs CX: this package targets Dialogflow ES. Do not copy Dialogflow CX code into an ES integration.
- Global vs regional mismatch: for a regional agent, changing only the endpoint or only the resource name is a common cause of `NOT_FOUND` and routing failures.
- Credentials: use ADC or service-account credentials. Dialogflow requests are not authenticated with a simple API key.
- Session scoping: reuse a session within one conversation, but do not share one session ID across unrelated users.
- Language code: pass a `languageCode` that matches the agent's default language or an enabled language.
- Response handling: `fulfillmentText` can be empty. If the reply seems incomplete, inspect other `queryResult` fields such as contexts, parameters, and rich response messages.

## Version-Sensitive Notes

- This guide targets `@google-cloud/dialogflow` version `7.5.0`.
- The maintainer reference URL for this package is a rolling `latest` docs tree. If your project pins a materially older or newer package version, verify request fields and helper names against the installed package and the matching reference pages.

## Official Sources

- `https://cloud.google.com/nodejs/docs/reference/dialogflow/latest`
- `https://cloud.google.com/dialogflow/es/docs/how/detect-intent-text`
- `https://cloud.google.com/dialogflow/es/docs/how/region`
- `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- `https://www.npmjs.com/package/@google-cloud/dialogflow`
