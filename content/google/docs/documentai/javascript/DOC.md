---
name: documentai
description: "Google Cloud Document AI Node.js client for ADC auth, regional processor calls, local document parsing, and GCS batch processing"
metadata:
  languages: "javascript"
  versions: "9.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,documentai,gcp,ocr,forms,javascript,nodejs"
---

# `@google-cloud/documentai` JavaScript Package Guide

Use `@google-cloud/documentai` when your Node.js app needs to send PDFs or image files to a Google Cloud Document AI processor and read OCR or structured extraction results such as entities, form fields, tables, and page text.

## Golden Rule

- Authenticate with Google Cloud Application Default Credentials (ADC), not an API key.
- Set the client `apiEndpoint` to the same region as the processor, usually `us-documentai.googleapis.com` or `eu-documentai.googleapis.com`.
- Pass the full processor or processor-version resource name, not only the processor ID.
- Use `processDocument()` for one document at a time and `batchProcessDocuments()` when the input and output live in Cloud Storage.
- Send a MIME type that matches the real file, such as `application/pdf`, `image/png`, `image/jpeg`, or `image/tiff`.

This guide covers `9.5.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/documentai@9.5.0
```

## Authentication And Project Setup

Before making requests, make sure all of the following are true:

1. You have a Google Cloud project.
2. Billing is enabled for that project.
3. The Document AI API is enabled.
4. You already have a processor in the region your app will call.
5. ADC is configured for the identity your app will run as.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable documentai.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us"
```

If you must use a service account key file outside Google Cloud:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Prefer attached service-account credentials on Google Cloud over distributing JSON key files.

## Initialize The Client

Document AI is regional. Build the endpoint from the processor location and reuse the client instead of constructing a new client for every request.

```javascript
const {v1} = require('@google-cloud/documentai');

function createDocumentAiClient(location = process.env.GOOGLE_CLOUD_LOCATION || 'us') {
  return new v1.DocumentProcessorServiceClient({
    apiEndpoint: `${location}-documentai.googleapis.com`,
  });
}
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/documentai');

const location = process.env.GOOGLE_CLOUD_LOCATION || 'us';

const client = new v1.DocumentProcessorServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  apiEndpoint: `${location}-documentai.googleapis.com`,
});
```

## Process One Local Document

Use `processDocument()` for synchronous processing of one document at a time.

```javascript
const fs = require('node:fs/promises');
const {v1} = require('@google-cloud/documentai');

async function processLocalDocument({
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  location = process.env.GOOGLE_CLOUD_LOCATION || 'us',
  processorId,
  filePath,
  mimeType = 'application/pdf',
}) {
  const client = new v1.DocumentProcessorServiceClient({
    apiEndpoint: `${location}-documentai.googleapis.com`,
  });

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const fileBytes = await fs.readFile(filePath);

  const [result] = await client.processDocument({
    name,
    rawDocument: {
      content: Buffer.from(fileBytes).toString('base64'),
      mimeType,
    },
  });

  const document = result.document;

  console.log(document?.text ?? '');

  for (const entity of document?.entities ?? []) {
    console.log(entity.type, entity.mentionText, entity.confidence);
  }

  return document;
}

processLocalDocument({
  processorId: '1234567890abcdef',
  filePath: 'invoice.pdf',
}).catch(console.error);
```

`document.text` holds the full extracted text. The structured fields you get back depend on the processor type, so inspect `document.entities`, `document.pages`, `document.pages?.[0]?.formFields`, and `document.pages?.[0]?.tables` only when that processor is expected to produce them.

## Call A Specific Processor Version

If your application must pin an explicitly deployed processor version, pass the processor-version resource name instead of the processor resource name.

```javascript
const fs = require('node:fs/promises');
const {v1} = require('@google-cloud/documentai');

async function processWithProcessorVersion({
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  location = process.env.GOOGLE_CLOUD_LOCATION || 'us',
  processorId,
  processorVersionId,
  filePath,
  mimeType = 'application/pdf',
}) {
  const client = new v1.DocumentProcessorServiceClient({
    apiEndpoint: `${location}-documentai.googleapis.com`,
  });

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}/processorVersions/${processorVersionId}`;
  const fileBytes = await fs.readFile(filePath);

  const [result] = await client.processDocument({
    name,
    rawDocument: {
      content: Buffer.from(fileBytes).toString('base64'),
      mimeType,
    },
  });

  return result.document;
}
```

Use this pattern when the processor has multiple deployed versions and your code must stay pinned to one of them.

## Batch Process Documents From Cloud Storage

Use `batchProcessDocuments()` for larger jobs or when your input and output are already in Cloud Storage. This is a long-running operation.

```javascript
const {v1} = require('@google-cloud/documentai');

async function batchProcessDocuments({
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  location = process.env.GOOGLE_CLOUD_LOCATION || 'us',
  processorId,
  inputUri,
  outputUri,
  mimeType = 'application/pdf',
}) {
  const client = new v1.DocumentProcessorServiceClient({
    apiEndpoint: `${location}-documentai.googleapis.com`,
  });

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const [operation] = await client.batchProcessDocuments({
    name,
    inputDocuments: {
      gcsDocuments: {
        documents: [
          {
            gcsUri: inputUri,
            mimeType,
          },
        ],
      },
    },
    documentOutputConfig: {
      gcsOutputConfig: {
        gcsUri: outputUri,
      },
    },
  });

  await operation.promise();
  console.log('Batch processing complete');
}

batchProcessDocuments({
  processorId: '1234567890abcdef',
  inputUri: 'gs://my-input-bucket/forms/form-001.pdf',
  outputUri: 'gs://my-output-bucket/documentai-results/',
}).catch(console.error);
```

Important behavior:

- The long-running operation completes when processing is done, but the parsed documents are written to the GCS output prefix you provide.
- Your calling identity needs Cloud Storage access for both the input and output buckets.
- Do not expect the parsed JSON results to come back inline in the API response.

## List Processors In A Region

Use `listProcessors()` when the app needs to discover existing processors instead of hardcoding one.

```javascript
const {v1} = require('@google-cloud/documentai');

async function listProcessors(
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  location = process.env.GOOGLE_CLOUD_LOCATION || 'us'
) {
  const client = new v1.DocumentProcessorServiceClient({
    apiEndpoint: `${location}-documentai.googleapis.com`,
  });

  const parent = `projects/${projectId}/locations/${location}`;
  const [processors] = await client.listProcessors({parent});

  return processors.map(processor => ({
    name: processor.name,
    displayName: processor.displayName,
    type: processor.type,
  }));
}
```

Reuse the returned `name` values from list calls if you want to avoid rebuilding resource names manually later.

## Common Pitfalls

- Region mismatch: a processor in `us` will not work if the client endpoint points at `eu-documentai.googleapis.com`.
- Wrong `name` field: `processDocument()` expects the full processor or processor-version resource name, not only `processorId`.
- Wrong MIME type: keep the request `mimeType` aligned with the real file format.
- Batch output assumptions: `batchProcessDocuments()` writes results to Cloud Storage; it does not return parsed documents inline.
- Missing Storage permissions: GCS-backed workflows need bucket access in addition to Document AI permissions.
- Per-request client creation: create the client once and reuse it in hot paths.

## Version-Sensitive Notes

- This guide targets `@google-cloud/documentai` version `9.5.0`.
- The maintainer reference URL is a rolling `latest` docs tree. If your project pins a materially older or newer package version, verify request fields and helper names against the installed package and the matching reference pages.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/documentai/latest`
- Document processing client-library guide: `https://cloud.google.com/document-ai/docs/process-documents-client-libraries`
- Process document sample: `https://cloud.google.com/document-ai/docs/samples/documentai-process-document`
- Batch process sample: `https://cloud.google.com/document-ai/docs/samples/documentai-batch-process-document`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- npm package page: `https://www.npmjs.com/package/@google-cloud/documentai`
