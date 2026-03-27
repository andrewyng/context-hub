---
name: run
description: "Google Cloud Run Node.js client for managing services, jobs, executions, and tasks"
metadata:
  languages: "javascript"
  versions: "3.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,cloud-run,serverless,jobs,javascript,nodejs"
---

# `@google-cloud/run` JavaScript Package Guide

Use `@google-cloud/run` when your Node.js code needs to manage Cloud Run resources through the Cloud Run Admin API.

- Use this package for control-plane automation such as creating services, creating jobs, running jobs, and inspecting executions.
- Do not use this package to send HTTP requests to a deployed Cloud Run service URL. For runtime requests, call the service URL with your normal HTTP client.

## Golden Rule

- Authenticate with Application Default Credentials (ADC), not an API key.
- Use the `v2` clients for normal Cloud Run automation in Node.js.
- Build full resource names as `projects/{project}/locations/{location}/...`.
- Treat create, update, delete, and run calls as long-running operations and wait for `operation.promise()`.
- Use `ServicesClient` and `JobsClient` to mutate resources, then use `ExecutionsClient` and `TasksClient` to inspect what happened.

This guide covers `3.2.0`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/run@3.2.0
```

## Authentication And Setup

This package uses Google Cloud credentials.

For local development with ADC:

```bash
gcloud auth application-default login
gcloud services enable run.googleapis.com

export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

For a service account JSON key file when you explicitly need one:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Typical prerequisites:

1. The target Google Cloud project already exists.
2. The Cloud Run API is enabled for that project.
3. The calling identity can manage Cloud Run resources in the target project and region.
4. Any container image you reference already exists in Artifact Registry or another supported registry.

## Initialize The Clients

CommonJS:

```javascript
const {v2} = require('@google-cloud/run');

const servicesClient = new v2.ServicesClient();
const jobsClient = new v2.JobsClient();
const executionsClient = new v2.ExecutionsClient();
const tasksClient = new v2.TasksClient();
```

ES modules:

```javascript
import {v2} from '@google-cloud/run';

const servicesClient = new v2.ServicesClient();
const jobsClient = new v2.JobsClient();
const executionsClient = new v2.ExecutionsClient();
const tasksClient = new v2.TasksClient();
```

With explicit project ID and key file:

```javascript
const {v2} = require('@google-cloud/run');

const client = new v2.ServicesClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Resource Names

Build resource names explicitly in code:

- parent location: `projects/PROJECT_ID/locations/LOCATION`
- service: `projects/PROJECT_ID/locations/LOCATION/services/SERVICE_ID`
- job: `projects/PROJECT_ID/locations/LOCATION/jobs/JOB_ID`
- execution: `projects/PROJECT_ID/locations/LOCATION/jobs/JOB_ID/executions/EXECUTION_ID`
- task: `projects/PROJECT_ID/locations/LOCATION/jobs/JOB_ID/executions/EXECUTION_ID/tasks/TASK_ID`

Use `parent` when listing or creating resources and full `name` values when getting, updating, deleting, or running a specific resource.

## Client Surface

For most Node.js automation, these are the main clients to reach for:

- `v2.ServicesClient` for service CRUD
- `v2.JobsClient` for job CRUD and `runJob()`
- `v2.ExecutionsClient` for listing and fetching job executions
- `v2.TasksClient` for listing and fetching tasks inside an execution

## Core Workflows

### List And Get Services

Use the location parent for listing and the full service name for lookups.

```javascript
const {v2} = require('@google-cloud/run');

const client = new v2.ServicesClient();

async function listAndGetService(projectId, location, serviceId) {
  const parent = `projects/${projectId}/locations/${location}`;

  for await (const service of client.listServicesAsync({parent})) {
    console.log(service.name);
  }

  const name = `projects/${projectId}/locations/${location}/services/${serviceId}`;
  const [service] = await client.getService({name});
  return service;
}
```

### Create A Service

Send `parent`, `serviceId`, and a `service` object, then wait for the long-running operation to finish.

```javascript
const {v2} = require('@google-cloud/run');

const client = new v2.ServicesClient();

async function createService(projectId, location) {
  const [operation] = await client.createService({
    parent: `projects/${projectId}/locations/${location}`,
    serviceId: 'hello-service',
    service: {
      template: {
        serviceAccount: 'runtime-sa@my-project.iam.gserviceaccount.com',
        containers: [
          {
            image: 'us-docker.pkg.dev/my-project/apps/hello:latest',
            env: [
              {name: 'NODE_ENV', value: 'production'},
            ],
          },
        ],
      },
    },
  });

  const [service] = await operation.promise();
  return service;
}
```

### Create And Run A Job

Cloud Run jobs are separate resources. Create the job first, then call `runJob()` on the created job name.

```javascript
const {v2} = require('@google-cloud/run');

const client = new v2.JobsClient();

async function createAndRunJob(projectId, location) {
  const [createOperation] = await client.createJob({
    parent: `projects/${projectId}/locations/${location}`,
    jobId: 'daily-job',
    job: {
      template: {
        taskCount: 1,
        parallelism: 1,
        template: {
          serviceAccount: 'runtime-sa@my-project.iam.gserviceaccount.com',
          containers: [
            {
              image: 'us-docker.pkg.dev/my-project/batch/worker:latest',
              args: ['--mode', 'daily'],
              env: [
                {name: 'APP_ENV', value: 'prod'},
              ],
            },
          ],
          timeout: {
            seconds: 1800,
          },
        },
      },
    },
  });

  const [job] = await createOperation.promise();

  const [runOperation] = await client.runJob({
    name: job.name,
  });

  const [execution] = await runOperation.promise();
  return execution;
}
```

### Inspect Executions And Tasks

Use the execution and task clients after a job run instead of trying to infer execution state from the job object.

```javascript
const {v2} = require('@google-cloud/run');

const executionsClient = new v2.ExecutionsClient();
const tasksClient = new v2.TasksClient();

async function inspectJobRun(projectId, location, jobId) {
  const jobName = `projects/${projectId}/locations/${location}/jobs/${jobId}`;
  const executionParent = `${jobName}/executions`;

  for await (const execution of executionsClient.listExecutionsAsync({
    parent: executionParent,
  })) {
    console.log('execution:', execution.name);
  }
}

async function listTasksForExecution(executionName) {
  for await (const task of tasksClient.listTasksAsync({
    parent: executionName,
  })) {
    console.log('task:', task.name);
  }
}
```

## Configuration Notes

- Keep project ID and region explicit in your code so you do not mutate the wrong environment.
- Cloud Run resource names are regional. A job or service name for `us-central1` does not resolve in `europe-west1`.
- Mutating calls are asynchronous. Wait for `operation.promise()` before reading the resource again or assuming the change is complete.
- For partial updates, send an `updateMask` that matches the fields you intend to change.
- Use the service client for services and the job client for jobs; executions and tasks are follow-on resources created by a job run.

## Common Pitfalls

- This package manages Cloud Run resources; it does not replace the runtime contract inside your container.
- Do not use API keys. Use ADC for local development, CI, and Google Cloud runtimes.
- Do not pass only a short resource ID to `getService()`, `getJob()`, or similar methods. Use the full resource name.
- Do not assume create, update, delete, or run methods finish synchronously.
- Do not mix service URLs with service resource names. A deployed HTTPS URL is not the same thing as `projects/.../services/...`.
- If you update only part of a resource, do not omit the field mask.

## Official Sources

- Node.js client reference root: `https://cloud.google.com/nodejs/docs/reference/run/latest`
- Application Default Credentials overview: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- ADC search order: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/run`
