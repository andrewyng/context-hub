---
name: ai-form-recognizer
description: "Azure Form Recognizer JavaScript SDK guide for authentication, document analysis, custom models, and version boundaries"
metadata:
  languages: "javascript"
  versions: "5.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,document-intelligence,form-recognizer,ocr,document-analysis,javascript,sdk"
---

# Azure Form Recognizer JavaScript SDK

## What This Package Covers

`@azure/ai-form-recognizer` is the Azure SDK package for JavaScript and TypeScript apps that call Azure Form Recognizer, now branded as Azure Document Intelligence.

Use it when you need to:

- analyze PDFs or images with prebuilt models such as layout, general document, invoice, and receipt
- extract structured fields from your own custom document models
- build, list, and delete custom document models
- use either API-key auth or Microsoft Entra ID auth from Node.js apps

For new code on `5.1.0`, the main clients are:

```js
import {
  DocumentAnalysisClient,
  DocumentModelAdministrationClient,
} from "@azure/ai-form-recognizer";
```

Legacy clients such as `FormRecognizerClient` and `FormTrainingClient` still exist for older integrations, but they are not the client surface to start from for new `5.x` code.

## Install

Install the SDK version your app expects:

```bash
npm install @azure/ai-form-recognizer@5.1.0
```

If you want Microsoft Entra ID authentication, also install `@azure/identity`:

```bash
npm install @azure/ai-form-recognizer@5.1.0 @azure/identity
```

## Required Setup

You need:

1. an Azure Form Recognizer or Cognitive Services resource
2. the resource endpoint
3. either an API key or an Entra ID credential

Typical environment variables:

```bash
export AZURE_FORM_RECOGNIZER_ENDPOINT="https://<resource-name>.cognitiveservices.azure.com/"
export AZURE_FORM_RECOGNIZER_KEY="<api-key>"
export FORM_RECOGNIZER_TRAINING_DATA_SAS_URL="https://<storage-account>.blob.core.windows.net/<container>?<sas>"
```

Endpoint rules that matter:

- API-key auth works with a regional endpoint or a custom subdomain endpoint
- Microsoft Entra ID auth requires a custom subdomain endpoint such as `https://<resource-name>.cognitiveservices.azure.com/`
- do not use a regional endpoint such as `https://<region>.api.cognitive.microsoft.com/` with `DefaultAzureCredential`

## Authentication And Client Initialization

### API key authentication

```js
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;

const analysisClient = new DocumentAnalysisClient(
  endpoint,
  new AzureKeyCredential(apiKey),
);
```

### Microsoft Entra ID authentication

Use this when your app already runs with Azure CLI login, a managed identity, or a service principal.

```js
import { DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import { DefaultAzureCredential } from "@azure/identity";

const analysisClient = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new DefaultAzureCredential(),
);
```

The calling principal needs access to the resource, and the official docs call out the `Cognitive Services User` role for this scenario.

### Administration client

Use a separate long-lived admin client when you need custom model operations:

```js
import {
  AzureKeyCredential,
  DocumentModelAdministrationClient,
} from "@azure/ai-form-recognizer";

const adminClient = new DocumentModelAdministrationClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);
```

## Client Selection

Use this mapping:

- `DocumentAnalysisClient`: analyze documents with prebuilt, custom, or classifier-backed models
- `DocumentModelAdministrationClient`: build, inspect, list, and delete custom document models
- `FormRecognizerClient`: legacy analysis client for older code paths
- `FormTrainingClient`: legacy training client for older code paths

If the codebase already uses methods with names like `beginRecognizeReceipts`, `beginRecognizeBusinessCards`, or `beginTrainCustomModel`, treat that as a migration task instead of swapping names mechanically.

## Common Analysis Workflows

Every `begin*` method is a long-running operation. It returns a poller, and you usually finish with `await poller.pollUntilDone()`.

### Analyze a local file with a prebuilt invoice model

```js
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { createReadStream } from "node:fs";

const client = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);

const poller = await client.beginAnalyzeDocument(
  "prebuilt-invoice",
  createReadStream("./invoice.pdf"),
);

const result = await poller.pollUntilDone();
const invoice = result.documents?.[0];

for (const [name, field] of Object.entries(invoice?.fields ?? {})) {
  console.log(name, field.content);
}
```

Use prebuilt model IDs when you want the service to apply Azure's built-in document understanding instead of your own trained model.

### Extract layout, lines, and tables from a document

Use `prebuilt-layout` when you need OCR text, reading order, page structure, selection marks, or tables rather than business fields.

```js
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { createReadStream } from "node:fs";

const client = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);

const poller = await client.beginAnalyzeDocument(
  "prebuilt-layout",
  createReadStream("./document.pdf"),
);

const result = await poller.pollUntilDone();

for (const page of result.pages ?? []) {
  console.log(`Page ${page.pageNumber}`);

  for (const line of page.lines ?? []) {
    console.log(line.content);
  }
}

for (const table of result.tables ?? []) {
  console.log(`Table with ${table.rowCount} rows and ${table.columnCount} columns`);
}
```

### Analyze a document from a URL

Use the URL-based overload only when Azure can fetch the document directly.

```js
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

const client = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);

const poller = await client.beginAnalyzeDocumentFromUrl(
  "prebuilt-document",
  "https://example.com/sample.pdf",
);

const result = await poller.pollUntilDone();
console.log(result.documents?.length ?? 0);
```

If the file lives in private Azure Blob Storage, pass a SAS URL or download the bytes yourself and call `beginAnalyzeDocument(...)` with a stream or buffer instead.

### Run a custom model by model ID

After you build a custom model, pass its model ID into the same analysis client.

```js
import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";
import { createReadStream } from "node:fs";

const client = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);

const poller = await client.beginAnalyzeDocument(
  "invoice-model-v1",
  createReadStream("./sample-invoice.pdf"),
);

const result = await poller.pollUntilDone();
const document = result.documents?.[0];

console.log(document?.docType);
for (const [name, field] of Object.entries(document?.fields ?? {})) {
  console.log(name, field.content);
}
```

## Custom Model Administration

Use `DocumentModelAdministrationClient` when you need to train or inventory custom models.

### Build a custom document model from Azure Blob Storage

Training data lives in Azure Blob Storage and is typically passed as a container SAS URL.

```js
import {
  AzureKeyCredential,
  DocumentModelAdministrationClient,
} from "@azure/ai-form-recognizer";

const adminClient = new DocumentModelAdministrationClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY),
);

const poller = await adminClient.beginBuildDocumentModel(
  "template",
  process.env.FORM_RECOGNIZER_TRAINING_DATA_SAS_URL,
  {
    modelId: "invoice-model-v1",
    description: "Custom invoice extractor",
  },
);

const model = await poller.pollUntilDone();

console.log(model.modelId);
console.log(model.description);
```

Use `"template"` or `"neural"` build modes according to the training and accuracy tradeoffs described in the official docs.

### List existing custom models

```js
for await (const model of adminClient.listDocumentModels()) {
  console.log(model.modelId, model.createdOn);
}
```

### Delete a custom model

```js
await adminClient.deleteDocumentModel("invoice-model-v1");
```

## Configuration And Compatibility Notes

### Service version boundary

`@azure/ai-form-recognizer@5.1.0` is the stable JavaScript package line for the modern Form Recognizer client surface. The official docs for this package line document the `DocumentAnalysisClient` and `DocumentModelAdministrationClient` APIs against the service capabilities available on this SDK generation.

If you need newer Azure Document Intelligence preview features, check the current official package overview and API reference before assuming they exist in `5.1.0`.

### Pollers are part of the normal control flow

Analysis, model build, copy, and classification calls are not single-request APIs. They start long-running operations, so your application code should await the poller result before using the output.

### URL analysis is reachability-sensitive

`beginAnalyzeDocumentFromUrl()` works only when Azure can fetch the file from the URL you provide. Private storage URLs need a SAS token or another access path that the service can reach.

### Legacy examples need migration work

Older blog posts and samples for this package family use different clients and response shapes. When you migrate from `beginRecognize*` or `beginTrainCustomModel` methods, update the parsing code too, not just the method names.

## Common Pitfalls

- Do not start new `5.1.0` code on `FormRecognizerClient` or `FormTrainingClient`.
- Do not forget `await poller.pollUntilDone()` after `begin*` calls.
- Do not use `DefaultAzureCredential` with a regional endpoint.
- Do not assume `beginAnalyzeDocumentFromUrl()` can read a private blob URL without a SAS token.
- Do not hard-code secrets in source files; keep endpoint and key values in environment variables or a secret manager.
- Do not assume old `beginRecognize*` examples map one-to-one to the current API surface.

## Official Sources Used

- Microsoft Learn package overview: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-form-recognizer-readme?view=azure-node-latest`
- Microsoft Learn API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/ai-form-recognizer/`
- `DocumentAnalysisClient` reference: `https://learn.microsoft.com/en-us/javascript/api/%40azure/ai-form-recognizer/documentanalysisclient?view=azure-node-latest`
- `DocumentModelAdministrationClient` reference: `https://learn.microsoft.com/en-us/javascript/api/%40azure/ai-form-recognizer/documentmodeladministrationclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/ai-form-recognizer`
- Azure SDK for JavaScript migration guide: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/formrecognizer/ai-form-recognizer/MIGRATION_GUIDE.md`
