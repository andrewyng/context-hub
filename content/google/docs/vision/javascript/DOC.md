---
name: vision
description: "Google Cloud Vision Node.js client for image annotation, OCR, and async batch annotation"
metadata:
  languages: "javascript"
  versions: "5.3.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,vision,gcp,ocr,images,javascript"
---

# Google Cloud Vision Node.js Client

## Golden Rule

Use `@google-cloud/vision` with Application Default Credentials (ADC), enable `vision.googleapis.com` in the same Google Cloud project, and reuse a single `ImageAnnotatorClient` for normal request traffic.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/vision@5.3.4
```

## Authentication And Project Setup

Before making API calls, make sure all of the following are true:

1. You have a Google Cloud project.
2. Billing is enabled for that project.
3. The Cloud Vision API is enabled.
4. ADC is configured for the identity your app will run as.

Enable the API:

```bash
gcloud services enable vision.googleapis.com
```

For local development, the standard ADC flow is:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
```

If you must use a service account key file outside Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account instead of distributing key files.

## Initialize The Client

The package exposes `ImageAnnotatorClient` from the module namespace:

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();
```

If you need to set the project or key file explicitly:

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Create the client once and reuse it across requests instead of constructing a new client per image.

## Detect Labels From A Local File

Use the convenience helper when you have a local image path:

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function detectLabels(fileName) {
  const [result] = await client.labelDetection(fileName);

  if (result.error?.message) {
    throw new Error(result.error.message);
  }

  for (const label of result.labelAnnotations ?? []) {
    console.log(label.description, label.score);
  }
}

detectLabels('image.jpg').catch(console.error);
```

The same helper also accepts a Cloud Storage URI such as `gs://my-bucket/image.jpg`.

## OCR: Short Text vs Document OCR

Use `textDetection` for short or sparse text in images, and `documentTextDetection` for scanned pages, dense text, or structured OCR.

### Short Text

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function detectText(fileName) {
  const [result] = await client.textDetection(fileName);

  if (result.error?.message) {
    throw new Error(result.error.message);
  }

  const primaryText = result.textAnnotations?.[0]?.description ?? '';
  console.log(primaryText);
}

detectText('sign.jpg').catch(console.error);
```

### Dense Document OCR

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function detectDocumentText(fileName) {
  const [result] = await client.documentTextDetection(fileName);

  if (result.error?.message) {
    throw new Error(result.error.message);
  }

  console.log(result.fullTextAnnotation?.text ?? '');
}

detectDocumentText('document.png').catch(console.error);
```

## Combine Multiple Features In One Request

Use `batchAnnotateImages` when you want multiple feature passes over the same image in one request.

```javascript
const fs = require('node:fs');
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function annotateImage(fileName) {
  const [response] = await client.batchAnnotateImages({
    requests: [
      {
        image: {content: fs.readFileSync(fileName)},
        features: [
          {type: 'LABEL_DETECTION'},
          {type: 'IMAGE_PROPERTIES'},
        ],
      },
    ],
  });

  const annotated = response.responses?.[0];

  if (annotated?.error?.message) {
    throw new Error(annotated.error.message);
  }

  for (const label of annotated?.labelAnnotations ?? []) {
    console.log(label.description, label.score);
  }

  const colors = annotated?.imagePropertiesAnnotation?.dominantColors?.colors ?? [];
  console.log('Dominant colors:', colors.length);
}

annotateImage('image.jpg').catch(console.error);
```

Inspect the per-image response entry for errors. A successful transport response does not guarantee every annotation inside the batch succeeded.

## Async Batch Annotation With Cloud Storage Output

For larger image batches or workflows that should write results to Cloud Storage, use `asyncBatchAnnotateImages`.

```javascript
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

async function runAsyncBatch() {
  const [operation] = await client.asyncBatchAnnotateImages({
    requests: [
      {
        image: {
          source: {
            imageUri: 'gs://your-bucket/input/image-1.jpg',
          },
        },
        features: [{type: 'LABEL_DETECTION'}],
      },
    ],
    outputConfig: {
      gcsDestination: {
        uri: 'gs://your-bucket/output/',
      },
      batchSize: 2,
    },
  });

  const [result] = await operation.promise();
  console.log(result.outputConfig.gcsDestination.uri);
}

runAsyncBatch().catch(console.error);
```

The calling identity needs Cloud Storage permissions for both the input and output buckets.

## Common Pitfalls

- Missing ADC is the most common failure mode. Start with `gcloud auth application-default login` for local development.
- A valid credential is not enough if `vision.googleapis.com` is disabled in the project tied to those credentials.
- `textDetection` and `documentTextDetection` are not interchangeable. Prefer the document variant for dense OCR and scanned pages.
- Batch APIs can return per-image failures inside `response.responses`. Check `error.message` on each response entry, not just the top-level promise.
- `gs://...` inputs and outputs require Cloud Storage IAM permissions in addition to Vision API access.
- Reuse one `ImageAnnotatorClient` in hot paths instead of creating a new client for every request.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/vision/latest`
- Vision product documentation: `https://cloud.google.com/vision/docs`
- Label detection guide: `https://cloud.google.com/vision/docs/detect-labels-image-client-libraries`
- OCR guide: `https://cloud.google.com/vision/docs/ocr`
- Dense document OCR guide: `https://cloud.google.com/vision/docs/detecting-fulltext`
- Async batch annotation sample: `https://cloud.google.com/vision/docs/samples/vision-async-batch-annotate-images`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- npm package page: `https://www.npmjs.com/package/@google-cloud/vision`
