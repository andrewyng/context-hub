---
name: language
description: "Google Cloud Natural Language Node.js client for sentiment, entity, moderation, and text classification workflows"
metadata:
  languages: "javascript"
  versions: "7.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,natural-language,nlp,sentiment,entities,moderation,text-classification"
---

# Google Cloud Natural Language Node.js Client

## Golden Rule

Use the official `@google-cloud/language` package with Application Default Credentials (ADC), and choose one API namespace per code path. For new code, prefer the `v2` namespace for sentiment, entities, moderation, classification, and combined `annotateText` requests.

Use one of these import patterns:

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();
```

```javascript
import {v2} from '@google-cloud/language';

const client = new v2.LanguageServiceClient();
```

Older examples often use the package's top-level `LanguageServiceClient`, which typically targets older API shapes. Keep the client namespace and the request fields consistent throughout the file.

## Install

Pin the version your app expects:

```bash
npm install @google-cloud/language@7.2.1
```

## Authentication And Project Setup

For local development, authenticate ADC with the Google Cloud CLI:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
gcloud services enable language.googleapis.com --project="$GOOGLE_CLOUD_PROJECT"
```

If you must use a service account key locally or outside Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

## Initialize A Client

Basic client construction:

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();
```

With explicit project and key file settings:

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC already resolves both credentials and project ID in your runtime, you can usually omit constructor options.

## Core Request Shape

Most requests start with a `document` object. Supply either inline `content` or a Cloud Storage URI with `gcsContentUri`.

```javascript
const document = {
  content: 'Google Cloud Natural Language can score sentiment and extract entities.',
  type: 'PLAIN_TEXT',
  languageCode: 'en',
};
```

For large inputs already stored in Cloud Storage:

```javascript
const document = {
  gcsContentUri: 'gs://your-bucket/input/article.txt',
  type: 'PLAIN_TEXT',
  languageCode: 'en',
};
```

Use `encodingType: 'UTF8'` when you need stable offsets for mentions or syntax-related data.

## Analyze Sentiment

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();

async function analyzeSentiment() {
  const document = {
    content: 'The launch went well and customers were happy with the result.',
    type: 'PLAIN_TEXT',
    languageCode: 'en',
  };

  const [response] = await client.analyzeSentiment({
    document,
    encodingType: 'UTF8',
  });

  console.log(response.documentSentiment?.score);
  console.log(response.documentSentiment?.magnitude);
}

analyzeSentiment().catch(console.error);
```

## Analyze Entities

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();

async function analyzeEntities() {
  const document = {
    content: 'Google Cloud opened a new office in Seattle.',
    type: 'PLAIN_TEXT',
    languageCode: 'en',
  };

  const [response] = await client.analyzeEntities({
    document,
    encodingType: 'UTF8',
  });

  for (const entity of response.entities ?? []) {
    console.log(entity.name, entity.salience);
  }
}

analyzeEntities().catch(console.error);
```

## Combine Features With `annotateText`

Use `annotateText` when you want one request that bundles the supported `v2` features.

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();

async function annotateText() {
  const document = {
    content: 'Google Cloud\'s update improved moderation and sentiment reporting for long-form content.',
    type: 'PLAIN_TEXT',
    languageCode: 'en',
  };

  const [response] = await client.annotateText({
    document,
    features: {
      extractEntities: true,
      extractDocumentSentiment: true,
      classifyText: true,
      moderateText: true,
    },
    encodingType: 'UTF8',
  });

  console.log(response.documentSentiment?.score);
  console.log((response.entities ?? []).map((entity) => entity.name));
  console.log((response.categories ?? []).map((category) => category.name));
  console.log((response.moderationCategories ?? []).map((category) => category.name));
}

annotateText().catch(console.error);
```

## Classify Text

Text classification is for longer document-style content. The product docs require at least 20 words.

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();

async function classifyText() {
  const document = {
    content: 'This article explains how machine learning models are trained, evaluated, deployed, monitored, and improved across business analytics and product engineering workflows.',
    type: 'PLAIN_TEXT',
    languageCode: 'en',
  };

  const [response] = await client.classifyText({document});

  for (const category of response.categories ?? []) {
    console.log(category.name, category.confidence);
  }
}

classifyText().catch(console.error);
```

For large documents already in Cloud Storage, switch the `document` source to `gcsContentUri` instead of reading the whole body into memory.

## Moderate Text

Use `moderateText` when you want the Natural Language API to score text against moderation categories.

```javascript
const language = require('@google-cloud/language').v2;

const client = new language.LanguageServiceClient();

async function moderateText() {
  const document = {
    content: 'Example text to score against moderation categories.',
    type: 'PLAIN_TEXT',
    languageCode: 'en',
  };

  const [response] = await client.moderateText({document});

  for (const category of response.moderationCategories ?? []) {
    console.log(category.name, category.confidence);
  }
}

moderateText().catch(console.error);
```

## Namespace Choice: `v2` vs Older Samples

The maintained `v2` guide surface centers on these methods:

- `analyzeEntities`
- `analyzeSentiment`
- `annotateText`
- `classifyText`
- `moderateText`

If you are reviving an older integration that depends on syntax analysis or other older request shapes, verify those calls against the older reference before copying top-level `LanguageServiceClient` examples into new code.

## Common Pitfalls

- Do not use API keys with this client. Use ADC, user credentials, or a service account.
- Set exactly one document source: inline `content` or `gcsContentUri`.
- Keep the namespace consistent. Do not mix `require('@google-cloud/language').v2` examples with older top-level client samples in the same file.
- In Node.js request objects, use camelCase fields such as `languageCode`, `gcsContentUri`, and `encodingType`.
- `classifyText` is for longer document-style content, not short snippets.
- If `language.googleapis.com` is not enabled in the target project, authentication can succeed while API calls still fail.

## Version-Sensitive Notes

- This guide targets `@google-cloud/language` `7.2.1`.
- The maintainer Node.js reference uses a `latest` URL rather than a version-pinned `7.2.1` page.
- Older search results often land on pre-`v2` examples. Match your import path and method names to the API namespace you intentionally chose.

## Official Sources

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/language/latest`
- Natural Language product docs: `https://cloud.google.com/natural-language/docs`
- Sentiment guide: `https://cloud.google.com/natural-language/docs/analyzing-sentiment`
- Entity analysis guide: `https://cloud.google.com/natural-language/docs/analyzing-entities`
- Text classification guide: `https://cloud.google.com/natural-language/docs/classifying-text`
- Text moderation guide: `https://cloud.google.com/natural-language/docs/moderating-text`
- ADC setup for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- ADC for production workloads: `https://cloud.google.com/docs/authentication/set-up-adc-attached-service-account`
- npm package page: `https://www.npmjs.com/package/@google-cloud/language`
