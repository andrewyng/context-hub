---
name: scheduler
description: "Google Cloud Scheduler Node.js client for creating and managing scheduled HTTP, Pub/Sub, and App Engine jobs"
metadata:
  languages: "javascript"
  versions: "5.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,scheduler,gcp,cron,jobs,http,pubsub,app-engine"
---

# Google Cloud Scheduler Node.js Client

## What This Package Is

`@google-cloud/scheduler` is the official Node.js client for Google Cloud Scheduler.

Use it when your application needs to create or manage scheduled jobs that deliver work to exactly one of these target types:

- HTTP endpoints
- Pub/Sub topics
- App Engine HTTP handlers

For most integrations, the main job of this package is control-plane work: create the job, update the schedule, inspect state, and trigger administrative operations such as pause, resume, run, or delete.

This guide targets `@google-cloud/scheduler` version `5.3.1`.

## Install

Pin the version your project expects:

```bash
npm install @google-cloud/scheduler@5.3.1
```

Common alternatives:

```bash
pnpm add @google-cloud/scheduler@5.3.1
yarn add @google-cloud/scheduler@5.3.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key. For local development, the standard setup is Application Default Credentials (ADC):

```bash
gcloud services enable cloudscheduler.googleapis.com
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

If you need to point ADC at a service account key file locally:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

There are two separate auth concerns in a real Scheduler integration:

1. Your Node.js code must authenticate to the Cloud Scheduler API.
2. Cloud Scheduler may need to authenticate from the scheduled job to the target service.

## Initialize The Client

```javascript
const {v1} = require('@google-cloud/scheduler');

const client = new v1.CloudSchedulerClient();

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = 'us-central1';
const parent = `projects/${projectId}/locations/${location}`;
const jobName = `${parent}/jobs/daily-report`;
```

Use explicit resource names unless you already rely on helper methods elsewhere in your codebase.

## Create An HTTP Job

HTTP jobs are the common case for Cloud Run, custom HTTPS services, and internal webhooks.

```javascript
const {v1} = require('@google-cloud/scheduler');

async function createDailyReportJob({
  projectId,
  location,
  jobId,
  url,
  serviceAccountEmail,
}) {
  const client = new v1.CloudSchedulerClient();
  const parent = `projects/${projectId}/locations/${location}`;

  const [job] = await client.createJob({
    parent,
    job: {
      name: `${parent}/jobs/${jobId}`,
      description: 'Call the daily report endpoint every morning',
      schedule: '0 9 * * *',
      timeZone: 'Etc/UTC',
      httpTarget: {
        uri: url,
        httpMethod: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(
          JSON.stringify({reportType: 'daily'})
        ),
        oidcToken: {
          serviceAccountEmail,
          audience: url,
        },
      },
      retryConfig: {
        retryCount: 3,
        minBackoffDuration: {seconds: 30},
        maxBackoffDuration: {seconds: 300},
        maxDoublings: 5,
      },
      attemptDeadline: {seconds: 180},
    },
  });

  return job;
}
```

Use `oidcToken` when the target validates a Google-signed OIDC identity token, including Cloud Run and many custom HTTPS backends.

For protected Cloud Run services, grant the Scheduler job's service account permission to invoke the service before you create the job:

```bash
gcloud run services add-iam-policy-binding SERVICE_NAME \
  --region=us-central1 \
  --member="serviceAccount:SCHEDULER_INVOKER@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

Use `oauthToken` instead of `oidcToken` when the target is a Google API on `*.googleapis.com` that expects an OAuth access token.

## Create A Pub/Sub Job

Use a Pub/Sub target when the scheduled action should publish work for downstream consumers instead of invoking an HTTP service directly.

```javascript
const {v1} = require('@google-cloud/scheduler');

async function createPubSubJob({projectId, location, jobId, topicId}) {
  const client = new v1.CloudSchedulerClient();
  const parent = `projects/${projectId}/locations/${location}`;

  const [job] = await client.createJob({
    parent,
    job: {
      name: `${parent}/jobs/${jobId}`,
      schedule: '0 * * * *',
      timeZone: 'Etc/UTC',
      pubsubTarget: {
        topicName: `projects/${projectId}/topics/${topicId}`,
        data: Buffer.from(JSON.stringify({task: 'refresh-cache'})),
        attributes: {
          source: 'cloud-scheduler',
        },
      },
    },
  });

  return job;
}
```

The Pub/Sub topic must be in the same project as the Cloud Scheduler job.

## Create An App Engine Job

Use an App Engine target only when you actually want App Engine routing behavior.

```javascript
const {v1} = require('@google-cloud/scheduler');

async function createAppEngineJob({projectId, location, jobId}) {
  const client = new v1.CloudSchedulerClient();
  const parent = `projects/${projectId}/locations/${location}`;

  const [job] = await client.createJob({
    parent,
    job: {
      name: `${parent}/jobs/${jobId}`,
      schedule: '0 3 * * *',
      timeZone: 'Etc/UTC',
      appEngineHttpTarget: {
        relativeUri: '/tasks/cleanup',
        httpMethod: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify({action: 'cleanup'})),
      },
    },
  });

  return job;
}
```

## Read, List, And Update Jobs

Use `getJob()` for one job, `listJobs()` for a location, and `updateJob()` with a field mask for partial changes.

```javascript
const {v1} = require('@google-cloud/scheduler');

async function inspectAndReschedule({projectId, location, jobId}) {
  const client = new v1.CloudSchedulerClient();
  const parent = `projects/${projectId}/locations/${location}`;
  const name = `${parent}/jobs/${jobId}`;

  const [job] = await client.getJob({name});
  console.log(job.state, job.schedule);

  const [jobs] = await client.listJobs({
    parent,
    pageSize: 100,
  });

  for (const item of jobs) {
    console.log(item.name, item.state);
  }

  const [updatedJob] = await client.updateJob({
    job: {
      name,
      schedule: '30 9 * * *',
      timeZone: 'America/Los_Angeles',
    },
    updateMask: {
      paths: ['schedule', 'time_zone'],
    },
  });

  return updatedJob;
}
```

Important update behavior:

- `listJobs()` is paginated, and `pageSize` has a documented maximum of `500`.
- `updateJob()` is a partial update. Use `updateMask`; do not rely on omitted fields being preserved by accident.
- If an update fails, the job can enter `UPDATE_FAILED`. Retry `updateJob()` until it succeeds.

## Pause, Resume, Run, And Delete

These operations are direct administrative RPCs on an existing job resource.

```javascript
const {v1} = require('@google-cloud/scheduler');

async function manageJob({projectId, location, jobId}) {
  const client = new v1.CloudSchedulerClient();
  const name = `projects/${projectId}/locations/${location}/jobs/${jobId}`;

  await client.pauseJob({name});
  await client.resumeJob({name});
  await client.runJob({name});
  await client.deleteJob({name});
}
```

Operational behavior to remember:

- `pauseJob()` applies to an enabled job.
- `resumeJob()` applies to a paused job.
- `runJob()` forces an immediate execution and is not a dry run.

## Target Authentication Rules

For HTTP job targets:

- Use `oidcToken` for services that expect an OIDC identity token.
- Use `oauthToken` when the target is a Google API on `*.googleapis.com`.
- The service account configured in `oidcToken` or `oauthToken` must belong to the same project as the job.
- If you set `oidcToken` or `oauthToken`, Cloud Scheduler overrides any `Authorization` header you put in `httpTarget.headers`.

For Cloud Run and other protected backends, grant the configured service account permission on the receiving service before scheduling the job.

## Retry, Deadline, And Scheduling Semantics

Important runtime behavior from the Cloud Scheduler RPC and product docs:

- Cloud Scheduler does not allow two outstanding executions of the same job at the same time.
- If one execution is still running when the next schedule time arrives, the next execution is delayed.
- `retryCount: 0` means failures are not retried before the next scheduled time.
- For HTTP targets, `attemptDeadline` must be between 15 seconds and 30 minutes.
- For Pub/Sub targets, `attemptDeadline` is ignored.

## Common Pitfalls

- HTTP request bodies are valid only for `POST`, `PUT`, or `PATCH`.
- If you send a body and omit `Content-Type`, Cloud Scheduler defaults it to `application/octet-stream`.
- Cloud Scheduler computes or overwrites several HTTP headers, including `Host`, `Content-Length`, `User-Agent`, and `X-CloudScheduler-*`.
- Total HTTP header size must stay under `80 KB`.
- `appEngineHttpTarget.relativeUri` must start with `/`.
- `PATCH` and `OPTIONS` are not allowed for `appEngineHttpTarget`.
- Always set `timeZone` intentionally. Do not rely on local machine timezone assumptions.
- Prefer request objects such as `client.createJob({parent, job})` and `client.updateJob({job, updateMask})` over handwritten wrappers that hide the actual API shape.

## Version-Sensitive Notes

- This guide targets `@google-cloud/scheduler` version `5.3.1`.
- The maintainer reference URL uses `latest`. If you depend on a recently added field or behavior, compare the generated reference with the package version installed in your project.

## Official Sources

- Node.js client reference: https://cloud.google.com/nodejs/docs/reference/scheduler/latest
- Cloud Scheduler setup: https://cloud.google.com/scheduler/docs/setup
- Cloud Scheduler authentication: https://cloud.google.com/scheduler/docs/authentication
- Secure cron jobs with HTTP targets: https://cloud.google.com/scheduler/docs/http-target-auth
- Cloud Scheduler RPC reference: https://cloud.google.com/scheduler/docs/reference/rpc/google.cloud.scheduler.v1
- npm package page: https://www.npmjs.com/package/@google-cloud/scheduler
