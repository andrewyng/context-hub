---
name: translate
description: "Official Google Cloud Translation Node.js client library with Basic v2 and Advanced v3 setup, auth, and translation patterns"
metadata:
  languages: "javascript"
  versions: "9.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-translate,gcp,translation,i18n,javascript,nodejs,google-cloud"
---

# google-cloud-translate JavaScript Package Guide

Use `@google-cloud/translate` for the official Google Cloud Translation client library in Node.js. The package includes two distinct surfaces:

- `require('@google-cloud/translate').v2` for Basic edition
- `require('@google-cloud/translate').v3` for Advanced edition

Use Basic v2 for simple text translation, language detection, and supported-language lookup. Use Advanced v3 when you need the current Translation API feature set such as regional resources or glossaries.

## Install

Install the package directly:

```bash
npm install @google-cloud/translate@9.3.0
```

With Yarn:

```bash
yarn add @google-cloud/translate@9.3.0
```

With pnpm:

```bash
pnpm add @google-cloud/translate@9.3.0
```

## Choose The Right Client

### Use Basic edition v2 when you need:

- simple text translation
- language detection
- supported-language lookup
- compatibility with older Basic edition code

Import it as:

```js
const {v2} = require('@google-cloud/translate')
const {Translate} = v2
```

### Use Advanced edition v3 when you need:

- glossaries
- document translation
- batch translation jobs
- regional resources and custom models

Import it as:

```js
const {v3} = require('@google-cloud/translate')
const {TranslationServiceClient} = v3
```

## Setup And Authentication

Before making requests:

1. Create or select a Google Cloud project.
2. Enable billing on that project.
3. Enable the Cloud Translation API.
4. Authenticate with Application Default Credentials (ADC) or a service account key.

Local ADC flow:

```bash
gcloud auth application-default login
```

Service account credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

If you are provisioning the API in setup scripts, the service name is:

```bash
gcloud services enable translate.googleapis.com
```

Default to ADC unless you have a reason to pass credentials explicitly.

## Basic v2 Quick Start

Translate a plain string:

```js
const {v2} = require('@google-cloud/translate')

const {Translate} = v2
const translate = new Translate()

async function main() {
  const [translation] = await translate.translate('Hello, world!', 'es')
  console.log(translation)
}

main().catch(console.error)
```

Detect language:

```js
const {v2} = require('@google-cloud/translate')

const {Translate} = v2
const translate = new Translate()

async function main() {
  let [detections] = await translate.detect('Bonjour tout le monde')
  detections = Array.isArray(detections) ? detections : [detections]

  for (const detection of detections) {
    console.log(detection.language, detection.confidence)
  }
}

main().catch(console.error)
```

List supported languages:

```js
const {v2} = require('@google-cloud/translate')

const {Translate} = v2
const translate = new Translate()

async function main() {
  const [languages] = await translate.getLanguages()

  for (const language of languages.slice(0, 5)) {
    console.log(language.code, language.name)
  }
}

main().catch(console.error)
```

## Advanced v3 Quick Start

Every v3 request needs a `parent` resource:

```js
const projectId = process.env.GOOGLE_CLOUD_PROJECT
const parent = `projects/${projectId}/locations/global`
```

Translate text:

```js
const {v3} = require('@google-cloud/translate')

const {TranslationServiceClient} = v3
const client = new TranslationServiceClient()

async function main() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const parent = `projects/${projectId}/locations/global`

  const [response] = await client.translateText({
    parent,
    contents: ['Hello, world!'],
    mimeType: 'text/plain',
    targetLanguageCode: 'es',
  })

  for (const translation of response.translations) {
    console.log(translation.translatedText)
  }
}

main().catch(console.error)
```

Detect language:

```js
const {v3} = require('@google-cloud/translate')

const {TranslationServiceClient} = v3
const client = new TranslationServiceClient()

async function main() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const parent = `projects/${projectId}/locations/global`

  const [response] = await client.detectLanguage({
    parent,
    content: 'Hallo Welt',
    mimeType: 'text/plain',
  })

  for (const language of response.languages) {
    console.log(language.languageCode, language.confidence)
  }
}

main().catch(console.error)
```

Get supported languages:

```js
const {v3} = require('@google-cloud/translate')

const {TranslationServiceClient} = v3
const client = new TranslationServiceClient()

async function main() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const parent = `projects/${projectId}/locations/global`

  const [response] = await client.getSupportedLanguages({
    parent,
    displayLanguageCode: 'en',
  })

  for (const language of response.languages.slice(0, 5)) {
    console.log(language.languageCode, language.displayName)
  }
}

main().catch(console.error)
```

## Regional Resources And Endpoints

Start with `locations/global` unless you are using a regional resource such as a glossary or custom model.

Glossary example:

```js
const {v3} = require('@google-cloud/translate')

const {TranslationServiceClient} = v3

async function main() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const location = 'us-central1'
  const parent = `projects/${projectId}/locations/${location}`
  const glossary = `projects/${projectId}/locations/${location}/glossaries/my-glossary`

  const client = new TranslationServiceClient({
    apiEndpoint: 'us-central1-translate.googleapis.com',
  })

  const [response] = await client.translateText({
    parent,
    contents: ['Product name: Example Cloud'],
    mimeType: 'text/plain',
    targetLanguageCode: 'fr',
    glossaryConfig: {glossary},
  })

  console.log(response.glossaryTranslations[0].translatedText)
}

main().catch(console.error)
```

Keep the endpoint, `parent`, glossary path, and any model path in the same location.

## Credentials Configuration

If you need to pass options explicitly, both clients accept constructor options:

```js
const {v2, v3} = require('@google-cloud/translate')

const basicClient = new v2.Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

const advancedClient = new v3.TranslationServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})
```

Use constructor options only when ADC is not enough for your runtime.

## Common Pitfalls

- Do not mix `v2` and `v3` imports. They expose different classes and different request and response shapes.
- For v3, always provide `parent` in the form `projects/PROJECT_ID/locations/LOCATION`.
- In Node.js v3 requests, use camelCase field names such as `mimeType` and `targetLanguageCode`.
- `translateText()` takes `contents` as an array, even when you are translating a single string.
- Use `mimeType: 'text/plain'` for plain strings and `mimeType: 'text/html'` only when you are sending HTML content.
- Do not mix `locations/global` with regional glossaries or custom models. The request location and resource location must match.
- The maintainer reference URL uses `latest`, so it is not a frozen `9.3.0` snapshot.

## Version-Sensitive Notes For 9.3.0

- This guide targets `@google-cloud/translate` version `9.3.0`.
- The maintainer Node.js reference is still the right entry point, but it is a `latest` URL rather than a version-pinned `9.3.0` page.
- If you need release-specific behavior, verify it against the npm package page or the package changelog before depending on it.

## Official Sources

- Node.js package reference: `https://cloud.google.com/nodejs/docs/reference/translate/latest`
- Translation Basic edition Node.js guide: `https://cloud.google.com/translate/docs/reference/libraries/v2/nodejs`
- Translation Advanced text translation guide: `https://cloud.google.com/translate/docs/advanced/translating-text-v3`
- npm package page: `https://www.npmjs.com/package/@google-cloud/translate`
