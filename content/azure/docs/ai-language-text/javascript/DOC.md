---
name: ai-language-text
description: "Azure AI Language Text SDK for JavaScript for client setup, authentication, and common text analysis workflows"
metadata:
  languages: "javascript"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,language,text,nlp,sentiment,entities,pii,javascript"
---

# @azure/ai-language-text JavaScript Package Guide

## Golden Rule

Use `@azure/ai-language-text` when the codebase already uses this package or `TextAnalysisClient`.

- If the repo already imports `@azure/ai-text-analytics` with `TextAnalyticsClient`, treat that as a separate package choice and migrate deliberately instead of swapping names mechanically.
- Keep one shared client per process and send documents in batches.
- Use a real Azure AI Language endpoint, not an Azure OpenAI or Translator endpoint.

This guide targets package version `1.1.0`.

## Install

```bash
npm install @azure/ai-language-text@1.1.0 @azure/core-auth
```

Install Azure Identity only if you want Microsoft Entra ID authentication:

```bash
npm install @azure/identity
```

## Required Setup

You need:

- an Azure AI Language or Cognitive Services resource
- the resource endpoint
- either an API key or a Microsoft Entra ID credential

Typical environment variables:

```bash
export AZURE_LANGUAGE_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com/"
export AZURE_LANGUAGE_KEY="<api-key>"
```

## Authenticate And Create A Client

### API key

```js
import { AzureKeyCredential } from "@azure/core-auth";
import { TextAnalysisClient } from "@azure/ai-language-text";

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
const key = process.env.AZURE_LANGUAGE_KEY;

if (!endpoint || !key) {
  throw new Error("Set AZURE_LANGUAGE_ENDPOINT and AZURE_LANGUAGE_KEY before creating the client.");
}

export const textClient = new TextAnalysisClient(
  endpoint,
  new AzureKeyCredential(key),
);
```

### Microsoft Entra ID with `DefaultAzureCredential`

```js
import { DefaultAzureCredential } from "@azure/identity";
import { TextAnalysisClient } from "@azure/ai-language-text";

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;

if (!endpoint) {
  throw new Error("Set AZURE_LANGUAGE_ENDPOINT before creating the client.");
}

export const textClient = new TextAnalysisClient(
  endpoint,
  new DefaultAzureCredential(),
);
```

Use a custom subdomain endpoint for token-based authentication. Regional endpoints such as `https://<region>.api.cognitive.microsoft.com/` do not support Microsoft Entra ID.

## Input Shape

Pass documents as an array. Use document objects when you need stable IDs, explicit language, or a country hint.

```js
const documents = [
  {
    id: "1",
    language: "en",
    text: "The app is fast, but the onboarding flow is still confusing.",
  },
  {
    id: "2",
    text: "Ce document est redige en francais.",
    countryHint: "FR",
  },
];
```

## Common Workflows

### Detect language

```js
import { textClient } from "./client.js";

const results = await textClient.analyze("LanguageDetection", [
  { id: "1", text: "Ce document est redige en francais.", countryHint: "FR" },
  { id: "2", text: "Este documento esta escrito en espanol.", countryHint: "ES" },
]);

for (const result of results) {
  if (result.error) {
    console.error(result.error.code, result.error.message);
    continue;
  }

  console.log(result.primaryLanguage.name, result.primaryLanguage.confidenceScore);
}
```

### Analyze sentiment

```js
import { textClient } from "./client.js";

const results = await textClient.analyze("SentimentAnalysis", [
  {
    id: "1",
    language: "en",
    text: "The release process is much smoother now, but the dashboard still feels slow.",
  },
]);

for (const result of results) {
  if (result.error) {
    console.error(result.error.code, result.error.message);
    continue;
  }

  console.log(result.sentiment);
  console.log(result.confidenceScores);
}
```

### Extract key phrases

```js
import { textClient } from "./client.js";

const results = await textClient.analyze("KeyPhraseExtraction", [
  {
    id: "1",
    language: "en",
    text: "Azure AI Language can detect sentiment, key phrases, and named entities.",
  },
]);

for (const result of results) {
  if (result.error) {
    console.error(result.error.code, result.error.message);
    continue;
  }

  console.log(result.keyPhrases);
}
```

### Recognize named entities

```js
import { textClient } from "./client.js";

const results = await textClient.analyze("EntityRecognition", [
  {
    id: "1",
    language: "en",
    text: "Satya Nadella spoke at Microsoft Build in Seattle.",
  },
]);

for (const result of results) {
  if (result.error) {
    console.error(result.error.code, result.error.message);
    continue;
  }

  for (const entity of result.entities) {
    console.log(entity.text, entity.category, entity.confidenceScore);
  }
}
```

### Recognize PII entities

```js
import { textClient } from "./client.js";

const results = await textClient.analyze("PiiEntityRecognition", [
  {
    id: "1",
    language: "en",
    text: "Call me at 555-123-4567 or email ada@example.com.",
  },
]);

for (const result of results) {
  if (result.error) {
    console.error(result.error.code, result.error.message);
    continue;
  }

  console.log(result.redactedText);

  for (const entity of result.entities) {
    console.log(entity.text, entity.category, entity.confidenceScore);
  }
}
```

## Practical Notes

- Reuse one `TextAnalysisClient` instead of creating a new client for every request.
- Pass explicit `language` values when your inputs are multilingual or not reliably English.
- Use document objects with stable `id` values when you need to map results back to source records.
- Check each result for `error`; a successful request can still contain document-level failures.
- Keep the endpoint pointed at Azure AI Language, and use a custom subdomain when authenticating with Entra ID.

## Common Pitfalls

- Mixing `@azure/ai-language-text` and `@azure/ai-text-analytics` in the same module and assuming the client/method names are interchangeable.
- Passing a bare string instead of a document array.
- Treating an HTTP success as proof that every document succeeded.
- Using a regional endpoint with `DefaultAzureCredential`.
- Omitting `language` or `countryHint` for ambiguous text and then treating the result as deterministic.

## Version Notes For 1.1.0

- This guide targets `@azure/ai-language-text` `1.1.0`.
- If the project is already pinned to `@azure/ai-text-analytics`, keep that package unless you are doing an explicit migration to the newer `ai-language-text` client surface.
- Keep `@azure/identity` aligned with the rest of your Azure SDK dependencies when you use Entra ID authentication.

## Official Sources

- Docs root: `https://learn.microsoft.com/en-us/javascript/api/@azure/ai-language-text/`
- Overview and getting started: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-language-text-readme?view=azure-node-latest`
- `TextAnalysisClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/ai-language-text/textanalysisclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/ai-language-text`
