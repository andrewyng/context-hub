---
name: dlp
description: "@google-cloud/dlp Node.js client for Sensitive Data Protection inspection, de-identification, jobs, and image redaction"
metadata:
  languages: "javascript"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,dlp,sensitive-data-protection,pii,redaction,javascript"
---

# Google Cloud Sensitive Data Protection Node.js Client

`@google-cloud/dlp` is the official Node.js client for Google Cloud Sensitive Data Protection, the product formerly called Cloud DLP. The package and API surface still use DLP naming such as `DlpServiceClient`, `inspectContent`, and `createDlpJob`.

## Golden Rule

Use `@google-cloud/dlp` with Application Default Credentials (ADC), enable `dlp.googleapis.com` in the target project, and build requests around a location-qualified `parent` resource: `projects/PROJECT_ID/locations/LOCATION`.

For new Node.js code, use the package's `v2` namespace:

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()
```

```javascript
import {v2} from '@google-cloud/dlp'

const client = new v2.DlpServiceClient()
```

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/dlp@6.5.0
```

## Authentication And Project Setup

Enable the API and configure ADC before making calls:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
export GOOGLE_CLOUD_LOCATION="global"
gcloud services enable dlp.googleapis.com --project="$GOOGLE_CLOUD_PROJECT"
```

If you must use a service account key file outside Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
export GOOGLE_CLOUD_LOCATION="global"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account instead of distributing key files.

Before you write application code, make sure all of the following are true:

- `GOOGLE_CLOUD_PROJECT` points at the project that has the DLP API enabled.
- `GOOGLE_CLOUD_LOCATION` is set to `global` unless you intentionally use a regional location.
- Templates, job triggers, and jobs use the same location as the `parent` resource you pass.
- Inline text goes in `item`, while raw bytes such as images go in `byteItem`.

## Initialize A Client

Basic client construction:

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()
```

With explicit project, key file, or endpoint settings:

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  apiEndpoint: process.env.GOOGLE_CLOUD_DLP_ENDPOINT,
})
```

Create the client once and reuse it across requests instead of constructing a new client for every scan.

## Build The `parent` Resource Once

Most calls require the same `parent` string:

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT
const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global'
const parent = `projects/${projectId}/locations/${location}`
```

If you omit the location segment, the request is not valid.

## Inspect Inline Text

Use `inspectContent()` for text or small payloads that are already in memory.

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()

async function inspectText() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global'
  const parent = `projects/${projectId}/locations/${location}`

  const [response] = await client.inspectContent({
    parent,
    item: {
      value: 'Contact alice@example.com or call 415-555-0100.',
    },
    inspectConfig: {
      infoTypes: [
        {name: 'EMAIL_ADDRESS'},
        {name: 'PHONE_NUMBER'},
      ],
      includeQuote: true,
      minLikelihood: 'POSSIBLE',
    },
  })

  for (const finding of response.result?.findings ?? []) {
    console.log(finding.infoType?.name, finding.quote)
  }
}

inspectText().catch(console.error)
```

Set `includeQuote` only when downstream code actually needs the matched text. If you only need counts or metadata, leave it off so the response carries less sensitive data.

## De-Identify Text

Use `deidentifyContent()` when you want the service to transform sensitive values instead of only reporting them.

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()

async function deidentifyText() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global'
  const parent = `projects/${projectId}/locations/${location}`

  const [response] = await client.deidentifyContent({
    parent,
    item: {
      value: 'Contact alice@example.com or call 415-555-0100.',
    },
    inspectConfig: {
      infoTypes: [
        {name: 'EMAIL_ADDRESS'},
        {name: 'PHONE_NUMBER'},
      ],
    },
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              replaceWithInfoTypeConfig: {},
            },
          },
        ],
      },
    },
  })

  console.log(response.item?.value)
}

deidentifyText().catch(console.error)
```

That sample replaces findings with their info type labels such as `EMAIL_ADDRESS` and `PHONE_NUMBER`. For production masking or tokenization, swap in the transformation you actually need and keep the inspect configuration aligned with it.

## Redact Sensitive Data From Images

Use `redactImage()` when the input is an image file that may contain text or other sensitive content.

```javascript
const fs = require('node:fs')
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()

async function redactImage() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global'
  const parent = `projects/${projectId}/locations/${location}`

  const [response] = await client.redactImage({
    parent,
    byteItem: {
      type: 'IMAGE',
      data: fs.readFileSync('document.png'),
    },
    inspectConfig: {
      infoTypes: [{name: 'EMAIL_ADDRESS'}],
    },
    imageRedactionConfigs: [
      {
        infoType: {name: 'EMAIL_ADDRESS'},
      },
    ],
  })

  fs.writeFileSync('document-redacted.png', response.redactedImage)
}

redactImage().catch(console.error)
```

For image work, `byteItem` holds the raw file bytes and `imageRedactionConfigs` tells the service which findings to cover in the output image.

## Use Jobs For Storage-Backed Scans

Do not send large files through `inspectContent()`. For Cloud Storage and BigQuery workloads, create a DLP job instead.

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()

async function createInspectJob() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global'
  const parent = `projects/${projectId}/locations/${location}`

  const [job] = await client.createDlpJob({
    parent,
    inspectJob: {
      inspectConfig: {
        infoTypes: [{name: 'EMAIL_ADDRESS'}],
        minLikelihood: 'POSSIBLE',
        includeQuote: true,
      },
      storageConfig: {
        cloudStorageOptions: {
          fileSet: {
            url: 'gs://your-bucket/input/*.txt',
          },
        },
      },
    },
  })

  console.log(job.name)
}

createInspectJob().catch(console.error)
```

Poll the created job later:

```javascript
const {v2} = require('@google-cloud/dlp')

const client = new v2.DlpServiceClient()

async function getJob(jobName) {
  const [job] = await client.getDlpJob({name: jobName})
  console.log(job.state)
}

getJob('projects/your-gcp-project/locations/global/dlpJobs/i-1234567890').catch(console.error)
```

Use templates and job triggers when the same inspect or de-identify configuration needs to run repeatedly. Keep the template location, trigger location, and job location aligned.

## Common Pitfalls

- Missing ADC is the most common failure mode. Start with `gcloud auth application-default login` for local development.
- A valid credential is not enough if `dlp.googleapis.com` is disabled in the project tied to those credentials.
- Always pass a full `parent` such as `projects/my-project/locations/global`. `projects/my-project` is not enough.
- In Node.js request objects, use camelCase fields such as `inspectConfig`, `deidentifyConfig`, `includeQuote`, and `imageRedactionConfigs`.
- Use `inspectContent()` for inline data already in memory, and use `createDlpJob()` for storage-backed scans.
- Keep locations consistent across parents, templates, job triggers, and jobs.
- Prefer built-in info types first. Add custom detectors only when the built-in detectors do not cover your data.

## Version-Sensitive Notes

- This guide targets `@google-cloud/dlp` `6.5.0`.
- The maintainer reference lives under a rolling `latest` URL, so re-check the docs before copying examples into a project pinned to a different package version.
- Older examples may show top-level imports or different request object shapes. For new code, keep the `v2.DlpServiceClient` namespace and camelCase request fields consistent.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/dlp/latest`
- Sensitive Data Protection documentation: `https://cloud.google.com/sensitive-data-protection/docs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- npm package page: `https://www.npmjs.com/package/@google-cloud/dlp`
