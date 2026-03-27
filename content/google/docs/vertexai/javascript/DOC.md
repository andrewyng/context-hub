---
name: vertexai
description: "Google Cloud Vertex AI Node.js client for Gemini text generation, streaming, chat, multimodal prompts, and tool calling"
metadata:
  languages: "javascript"
  versions: "1.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,vertex-ai,vertexai,gemini,generative-ai,javascript,nodejs"
---

# `@google-cloud/vertexai` JavaScript Package Guide

Use `@google-cloud/vertexai` when your Node.js app needs to call Gemini models through Vertex AI on Google Cloud.

This package is for Vertex AI generative model requests. It uses Google Cloud authentication and regional Vertex AI setup, not API-key-only Gemini API flows.

## Golden Rule

- Authenticate with Google Cloud Application Default Credentials (ADC) or a service account.
- Create the client with the correct `project` and `location`.
- Use `vertexAI.getGenerativeModel(...)` for normal model access.
- Use `vertexAI.preview.getGenerativeModel(...)` only when the feature or model is documented as preview.
- Build prompts with `contents`, `role`, and `parts` objects instead of ad hoc request shapes.

This guide covers `1.10.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/vertexai@1.10.0
```

## Authentication And Setup

Typical prerequisites:

1. A Google Cloud project with Vertex AI enabled.
2. Credentials that can call Vertex AI.
3. A supported Vertex AI region such as `us-central1`.
4. A model name that is available in that region.

Enable the Vertex AI API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable aiplatform.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

If you must use a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Prefer attached service-account credentials on Google Cloud over shipping JSON key files.

## Initialize The Client

ES modules:

```javascript
import {VertexAI, HarmCategory, HarmBlockThreshold} from '@google-cloud/vertexai';

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

if (!project) {
  throw new Error('Set GOOGLE_CLOUD_PROJECT before creating VertexAI');
}

const vertexAI = new VertexAI({project, location});

const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 512,
    temperature: 0.2,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  systemInstruction: {
    role: 'system',
    parts: [{text: 'You write concise, production-ready summaries.'}],
  },
});
```

CommonJS:

```javascript
const {VertexAI, HarmCategory, HarmBlockThreshold} = require('@google-cloud/vertexai');

const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const vertexAI = new VertexAI({project, location});

const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 512,
    temperature: 0.2,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});
```

Small helper for extracting generated text:

```javascript
function getText(response) {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || ''
  );
}
```

## Core Workflows

### Generate Text

Use a `contents` array with a `user` message.

```javascript
import {VertexAI} from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const model = vertexAI.getGenerativeModel({model: 'gemini-1.5-flash'});

function getText(response) {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || ''
  );
}

async function generateSummary() {
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{text: 'Summarize the causes of HTTP 429 errors in three bullets.'}],
      },
    ],
  });

  return getText(result.response);
}
```

### Stream Output

Use `generateContentStream()` when you want tokens as they arrive.

```javascript
import {VertexAI} from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const model = vertexAI.getGenerativeModel({model: 'gemini-1.5-flash'});

async function streamAnswer() {
  const streamingResult = await model.generateContentStream({
    contents: [
      {
        role: 'user',
        parts: [{text: 'Write a short incident update for a database failover.'}],
      },
    ],
  });

  for await (const item of streamingResult.stream) {
    const chunk = item.candidates?.[0]?.content?.parts?.[0]?.text || '';
    process.stdout.write(chunk);
  }

  const aggregatedResponse = await streamingResult.response;
  return aggregatedResponse;
}
```

### Start A Multi-Turn Chat

Use `startChat()` when the same conversation needs multiple turns.

```javascript
import {VertexAI} from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const model = vertexAI.getGenerativeModel({model: 'gemini-1.5-flash'});

function getText(response) {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || ''
  );
}

async function runChat() {
  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{text: 'My app is a task tracker for small teams.'}],
      },
      {
        role: 'model',
        parts: [{text: 'Got it. I will keep suggestions focused on task tracking.'}],
      },
    ],
  });

  const result = await chat.sendMessage('Suggest three onboarding emails.');
  return getText(result.response);
}
```

### Send A Multimodal Prompt

For image inputs, pass a text part plus a file reference. Include the correct MIME type.

```javascript
import {VertexAI} from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const model = vertexAI.getGenerativeModel({model: 'gemini-1.5-flash'});

async function describeImage() {
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {text: 'Describe this image for an accessibility alt tag.'},
          {
            fileData: {
              fileUri: 'gs://cloud-samples-data/generative-ai/image/scones.jpg',
              mimeType: 'image/jpeg',
            },
          },
        ],
      },
    ],
  });

  return result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
```

### Define Tool Calls

When a model feature is only documented as preview, create the model from `vertexAI.preview`.

```javascript
import {VertexAI, FunctionDeclarationSchemaType} from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
});

const weatherTools = [
  {
    functionDeclarations: [
      {
        name: 'get_current_weather',
        description: 'Get the current weather in a given city',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            location: {
              type: FunctionDeclarationSchemaType.STRING,
              description: 'City and region, for example Boston, MA',
            },
            unit: {
              type: FunctionDeclarationSchemaType.STRING,
              enum: ['celsius', 'fahrenheit'],
            },
          },
          required: ['location'],
        },
      },
    ],
  },
];

const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: weatherTools,
});

async function requestWeatherToolCall() {
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{text: 'What is the weather in Boston right now?'}],
      },
    ],
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];
  const toolCall = parts.find(part => part.functionCall)?.functionCall;

  return toolCall;
}
```

The SDK surfaces the requested function call. Your application still needs to execute the tool and decide how to continue the conversation.

## Practical Notes

- Vertex AI is regional. Keep the client `location`, model availability, and any related Cloud resources in the same region.
- Reuse `VertexAI` and model instances instead of creating a new client for every request.
- Keep prompts in the documented `contents` format so text-only and multimodal requests stay consistent.
- Use `generateContentStream()` for interactive output and `generateContent()` for single-response workflows.
- Keep `systemInstruction`, `generationConfig`, and `safetySettings` on the model definition when they should apply to every request.

## Common Pitfalls

- `gcloud auth login` is not enough for local Node.js code. Use `gcloud auth application-default login` so ADC works.
- Do not expect `GEMINI_API_KEY` or `GOOGLE_API_KEY` to authenticate this package. Use Google Cloud credentials.
- Do not omit `location` when your project uses regional Vertex AI resources.
- Do not assume every model or feature is GA. If the official docs show a preview-only path, use `vertexAI.preview` for that integration.
- Multimodal requests need correctly typed parts such as `fileData` with a matching `mimeType`.
- Generated text is nested under `response.candidates[0].content.parts`; extract it deliberately instead of assuming a flat `text` field.

## Official Sources

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/vertexai/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/vertexai`
- ADC setup for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Vertex AI locations: `https://cloud.google.com/vertex-ai/docs/general/locations`
