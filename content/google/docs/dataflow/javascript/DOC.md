---
name: dataflow
description: "Google Cloud Dataflow Node.js client for inspecting jobs and launching classic or Flex templates"
metadata:
  languages: "javascript"
  versions: "4.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,dataflow,templates,apache-beam,javascript,nodejs"
---

# `@google-cloud/dataflow` JavaScript Package Guide

Use `@google-cloud/dataflow` when your Node.js code needs the Dataflow service API: list jobs, inspect a job, read job messages or metrics, or launch classic and Flex templates.

## Golden Rule

- Use the official `@google-cloud/dataflow` package.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Pass `location` on every request instead of relying on defaults.
- Treat this package as a Dataflow control-plane client. Author pipelines or build templates with Beam or other supported tooling first, then use this library to launch or manage them.
- Keep every template path and temp location in Cloud Storage as a `gs://...` URI.

This guide covers `4.1.1`.

## Install

```bash
npm install @google-cloud/dataflow@4.1.1
```

## Authentication And Setup

Enable the API and authenticate with ADC:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export DATAFLOW_REGION="us-central1"
export DATAFLOW_TEMP_LOCATION="gs://my-bucket/dataflow/temp"

gcloud auth application-default login
gcloud config set project "$GOOGLE_CLOUD_PROJECT"
gcloud services enable dataflow.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

If you are using a service account JSON file locally:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export DATAFLOW_REGION="us-central1"
export DATAFLOW_TEMP_LOCATION="gs://my-bucket/dataflow/temp"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Typical prerequisites:

1. The target Google Cloud project already exists.
2. The Dataflow API is enabled in that project.
3. The runtime identity can launch Dataflow jobs and read any `gs://` objects referenced by templates.
4. A Cloud Storage bucket exists for temporary files, staging files, or template specs.

## Initialize The Clients

CommonJS:

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.DATAFLOW_REGION || 'us-central1';

const jobsClient = new v1beta3.JobsV1Beta3Client();
const messagesClient = new v1beta3.MessagesV1Beta3Client();
const metricsClient = new v1beta3.MetricsV1Beta3Client();
const templatesClient = new v1beta3.TemplatesServiceClient();
const flexTemplatesClient = new v1beta3.FlexTemplatesServiceClient();
```

ES modules:

```javascript
import {v1beta3} from '@google-cloud/dataflow';

const jobsClient = new v1beta3.JobsV1Beta3Client();
```

If ADC is already configured, you usually do not need to pass `keyFilename`. When you do want to pin a credentials file explicitly, pass it in the client options:

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const jobsClient = new v1beta3.JobsV1Beta3Client({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

## Core Workflows

### List Jobs In A Region

`listJobsAsync()` is the easiest way to iterate through job summaries.

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const jobsClient = new v1beta3.JobsV1Beta3Client();

async function listJobs(projectId, location) {
  for await (const job of jobsClient.listJobsAsync({projectId, location})) {
    console.log({
      id: job.id,
      name: job.name,
      state: job.currentState,
      type: job.type,
    });
  }
}
```

Use `getJob()` when you need the full job record. `listJobs()` returns summaries.

### Get A Single Job

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const jobsClient = new v1beta3.JobsV1Beta3Client();

async function getJob(projectId, location, jobId) {
  const [job] = await jobsClient.getJob({
    projectId,
    location,
    jobId,
  });

  console.log({
    id: job.id,
    name: job.name,
    currentState: job.currentState,
    createTime: job.createTime,
  });

  return job;
}
```

### Launch A Classic Template

Classic template launches use `TemplatesServiceClient` with a GCS template path such as `gs://dataflow-templates/latest/Word_Count`.

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const templatesClient = new v1beta3.TemplatesServiceClient();

async function launchClassicTemplate(projectId, location) {
  const [response] = await templatesClient.launchTemplate({
    projectId,
    location,
    gcsPath: 'gs://dataflow-templates/latest/Word_Count',
    launchParameters: {
      jobName: `wordcount-${Date.now()}`,
      parameters: {
        inputFile: 'gs://dataflow-samples/shakespeare/kinglear.txt',
        output: 'gs://my-bucket/output/wordcount',
      },
      environment: {
        tempLocation: process.env.DATAFLOW_TEMP_LOCATION,
      },
    },
    validateOnly: true,
  });

  return response;
}
```

Start with `validateOnly: true` to validate the launch request without creating a job. Set it to `false` after the parameters and environment are correct.

### Launch A Flex Template

Flex template launches use `FlexTemplatesServiceClient` and a template spec stored in Cloud Storage.

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const flexTemplatesClient = new v1beta3.FlexTemplatesServiceClient();

async function launchFlexTemplate(projectId, location) {
  const [response] = await flexTemplatesClient.launchFlexTemplate({
    projectId,
    location,
    launchParameter: {
      jobName: `orders-etl-${Date.now()}`,
      containerSpecGcsPath: 'gs://my-bucket/dataflow/flex/orders-spec.json',
      parameters: {
        inputSubscription: 'projects/my-project-id/subscriptions/orders-sub',
        outputTableSpec: 'my-project-id:analytics.orders',
      },
      environment: {
        tempLocation: process.env.DATAFLOW_TEMP_LOCATION,
      },
    },
    validateOnly: false,
  });

  return response;
}
```

Use a real template spec path generated for your Flex Template. Local files are not valid for `containerSpecGcsPath`.

### Read Job Messages And Metrics

Use `MessagesV1Beta3Client` for logs and `MetricsV1Beta3Client` for metrics snapshots.

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const messagesClient = new v1beta3.MessagesV1Beta3Client();
const metricsClient = new v1beta3.MetricsV1Beta3Client();

async function inspectJob(projectId, location, jobId) {
  for await (const message of messagesClient.listJobMessagesAsync({
    projectId,
    location,
    jobId,
  })) {
    console.log(message.messageText);
  }

  const [metrics] = await metricsClient.getJobMetrics({
    projectId,
    location,
    jobId,
  });

  for (const metric of metrics.metrics || []) {
    console.log(metric.name?.name, metric.scalar);
  }
}
```

### Drain Or Cancel A Job

`updateJob()` is for job state changes, not general job edits.

```javascript
const {v1beta3} = require('@google-cloud/dataflow');

const jobsClient = new v1beta3.JobsV1Beta3Client();

async function drainJob(projectId, location, jobId) {
  const [job] = await jobsClient.updateJob({
    projectId,
    location,
    jobId,
    job: {
      requestedState: 'JOB_STATE_DRAINED',
    },
  });

  return job;
}
```

Use `JOB_STATE_CANCELLED` when you want cancellation instead of a drain request.

## Common Pitfalls

- Do not omit `location`. Explicit regional requests are safer than relying on defaults.
- Do not pass local filesystem paths where the API expects `gs://` URIs.
- Do not treat `listJobs()` output as the full job record; call `getJob()` for complete details.
- Do not expect `updateJob()` to patch arbitrary fields. It is used for job state transitions.
- Do not use this package as a replacement for Apache Beam or a template build process.
- Do not use API keys. Use ADC or service account credentials.

## Official Sources Used

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/dataflow/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/dataflow`
- Dataflow authentication with ADC: `https://cloud.google.com/docs/authentication/application-default-credentials`
- Dataflow template launch REST docs: `https://cloud.google.com/dataflow/docs/reference/rest/v1b3/projects.locations.templates/launch`
- Dataflow Flex Template launch REST docs: `https://cloud.google.com/dataflow/docs/reference/rest/v1b3/projects.locations.flexTemplates/launch`
- Dataflow jobs REST docs: `https://cloud.google.com/dataflow/docs/reference/rest/v1b3/projects.locations.jobs`
- Dataflow metrics REST docs: `https://cloud.google.com/dataflow/docs/reference/rest/v1b3/projects.locations.jobs/getMetrics`
- Dataflow messages REST docs: `https://cloud.google.com/dataflow/docs/reference/rest/v1b3/projects.locations.jobs.messages/list`
