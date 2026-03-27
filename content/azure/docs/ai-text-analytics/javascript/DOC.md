---
name: ai-text-analytics
description: "Azure AI Text Analytics SDK for JavaScript for Azure AI Language text analysis, language detection, entity extraction, and PII recognition"
metadata:
  languages: "javascript"
  versions: "5.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,language,text-analytics,nlp,sentiment,entities,pii"
---

# @azure/ai-text-analytics JavaScript Package Guide

## Golden Rule

Use `@azure/ai-text-analytics` with `TextAnalyticsClient`, a real Azure AI Language endpoint, and either `AzureKeyCredential` or `DefaultAzureCredential`.

This guide targets package version `5.1.0`.

## Install

```bash
npm install @azure/ai-text-analytics
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
import { AzureKeyCredential, TextAnalyticsClient } from "@azure/ai-text-analytics";

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
const key = process.env.AZURE_LANGUAGE_KEY;

if (!endpoint || !key) {
  throw new Error("Set AZURE_LANGUAGE_ENDPOINT and AZURE_LANGUAGE_KEY before creating the client.");
}

export const textAnalyticsClient = new TextAnalyticsClient(
  endpoint,
  new AzureKeyCredential(key),
);
```

### Microsoft Entra ID with `DefaultAzureCredential`

```js
import { TextAnalyticsClient } from "@azure/ai-text-analytics";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;

if (!endpoint) {
  throw new Error("Set AZURE_LANGUAGE_ENDPOINT before creating the client.");
}

export const textAnalyticsClient = new TextAnalyticsClient(
  endpoint,
  new DefaultAzureCredential(),
);
```

Use a custom subdomain endpoint for token-based authentication. Regional endpoints such as `https://<region>.api.cognitive.microsoft.com/` do not support Microsoft Entra ID.

## Client Configuration

Set defaults once on the client when most requests should share the same language, country hint, or service API version.

```js
import { AzureKeyCredential, TextAnalyticsClient } from "@azure/ai-text-analytics";

const client = new TextAnalyticsClient(
  process.env.AZURE_LANGUAGE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY),
  {
    defaultLanguage: "en",
    defaultCountryHint: "US",
    apiVersion: "2023-04-01",
  },
);
```

## Input Shape

Most client methods accept a batch of documents.

Use an array of strings for the simple case:

```js
const documents = ["The hotel staff were excellent, but check-in was slow."];
```

Use document objects when each item needs its own `id`, `language`, or `countryHint`:

```js
const documents = [
  {
    id: "1",
    language: "en",
    text: "The hotel staff were excellent, but check-in was slow.",
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
import { textAnalyticsClient } from "./client.js";

const documents = [
  { id: "1", text: "Ce document est redige en francais.", countryHint: "FR" },
  { id: "2", text: "Este documento esta escrito en espanol.", countryHint: "ES" },
];

const results = await textAnalyticsClient.detectLanguage(documents);

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
import { textAnalyticsClient } from "./client.js";

const documents = [
  {
    id: "1",
    language: "en",
    text: "The app is fast, but onboarding is still confusing.",
  },
];

const results = await textAnalyticsClient.analyzeSentiment(documents);

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
import { textAnalyticsClient } from "./client.js";

const results = await textAnalyticsClient.extractKeyPhrases([
  {
    id: "1",
    language: "en",
    text: "Azure AI Language helps applications detect sentiment and extract entities.",
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
import { textAnalyticsClient } from "./client.js";

const results = await textAnalyticsClient.recognizeEntities([
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
import { textAnalyticsClient } from "./client.js";

const results = await textAnalyticsClient.recognizePiiEntities([
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

- Reuse one `TextAnalyticsClient` instead of creating a new client per request.
- Pass explicit `language` values when your inputs are not reliably English.
- Use document objects with stable `id` values when you need to match results back to source records.
- Handle per-document failures on every call; a batch can contain both successful results and document errors.
- Keep the endpoint pointed at Azure AI Language, not Azure OpenAI or Translator.

## Common Pitfalls

- Passing a bare string instead of an array. Use `["text"]`, not `"text"`.
- Assuming a successful HTTP call means every document succeeded. Check each result for `error`.
- Using a regional endpoint with `DefaultAzureCredential`.
- Omitting `language` or `countryHint` on multilingual or ambiguous text and then treating the output as deterministic.
- Expecting every workflow to be immediate. Some advanced analyses in this package use `begin...` long-running methods instead of direct request/response calls.

## Version Notes For 5.1.0

- This guide targets `@azure/ai-text-analytics` `5.1.0`.
- The package and client names still use `text-analytics`, even though Azure service documentation refers to Azure AI Language.
- When you authenticate with Microsoft Entra ID, keep `@azure/identity` aligned with the rest of your Azure SDK dependencies.

## Official Sources

- Docs root: `https://learn.microsoft.com/en-us/javascript/api/@azure/ai-text-analytics/`
- Overview and getting started: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-text-analytics-readme?view=azure-node-latest`
- `TextAnalyticsClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/ai-text-analytics/textanalyticsclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/ai-text-analytics`
- Changelog: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/textanalytics/ai-text-analytics/CHANGELOG.md`
