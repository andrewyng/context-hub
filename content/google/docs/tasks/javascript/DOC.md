---
name: tasks
description: "Google Cloud Tasks Node.js client library for creating and managing HTTP and App Engine tasks"
metadata:
  languages: "javascript"
  versions: "6.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,cloud-tasks,queues,jobs,http"
---

# Google Cloud Tasks Node.js Client

## Golden Rule

Use `@google-cloud/tasks` with Application Default Credentials (ADC) unless you have a strong reason to construct credentials manually. For real integrations, treat queue location, IAM, and request authentication as part of the API contract, not as afterthoughts.

This guide targets `@google-cloud/tasks` version `6.2.1`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/tasks@6.2.1
```

Common alternatives:

```bash
pnpm add @google-cloud/tasks@6.2.1
yarn add @google-cloud/tasks@6.2.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key. For local development, the standard path is:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

If the queue does not exist yet, create it before you enqueue work:

```bash
gcloud tasks queues create default --location=us-central1
```

If you must use a service account key file locally, point ADC at it:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

Minimal IAM to enqueue authenticated HTTP tasks is usually:

- `roles/cloudtasks.enqueuer` on the queue or project for the caller creating tasks
- `roles/iam.serviceAccountUser` on the service account attached to the task when you use `oidcToken` or `oauthToken`
- A target-service role on the receiving service, such as Cloud Run invocation permission, for the service account that will sign the outbound token

Queue administration uses broader roles such as `roles/cloudtasks.queueAdmin` or `roles/cloudtasks.admin`.

## Initialize The Client

Most code only needs a default client:

```javascript
const {v2} = require('@google-cloud/tasks');

const client = new v2.CloudTasksClient();
const queueName = client.queuePath('my-project', 'us-central1', 'default');
```

With an explicit key file:

```javascript
const {v2} = require('@google-cloud/tasks');

const client = new v2.CloudTasksClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`. The generated client also accepts options such as `apiEndpoint` when you need a non-default endpoint or explicit transport behavior.

## Create A Basic HTTP Task

This is the common pattern for pushing JSON work to an HTTP handler:

```javascript
const {v2} = require('@google-cloud/tasks');

async function enqueueHttpJsonTask({
  projectId,
  location,
  queueId,
  url,
  payload,
  delaySeconds = 0,
}) {
  const client = new v2.CloudTasksClient();
  const parent = client.queuePath(projectId, location, queueId);

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
  };

  if (delaySeconds > 0) {
    task.scheduleTime = {
      seconds: Math.floor(Date.now() / 1000) + delaySeconds,
    };
  }

  const [response] = await client.createTask({parent, task});
  return response.name;
}

enqueueHttpJsonTask({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
  queueId: 'default',
  url: 'https://example.com/tasks/process',
  payload: {jobId: 'job-123', action: 'sync'},
  delaySeconds: 30,
}).catch(console.error);
```

`httpRequest.body` is a bytes field, so encode JSON or text payloads before sending them. Use an explicit `task.name` only when you need deduplication or idempotency:

```javascript
task.name = client.taskPath(projectId, location, queueId, 'job-123');
```

Explicit task IDs add an extra lookup and should not use sequential prefixes such as timestamps or incrementing integers.

## Create An Authenticated HTTP Task

For Cloud Run, Cloud Functions, or your own HTTPS handler protected by IAM, attach an OIDC token:

```javascript
const {v2} = require('@google-cloud/tasks');

async function enqueueOidcTask({
  projectId,
  location,
  queueId,
  url,
  serviceAccountEmail,
  payload,
}) {
  const client = new v2.CloudTasksClient();
  const parent = client.queuePath(projectId, location, queueId);

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      oidcToken: {
        serviceAccountEmail,
        audience: url,
      },
    },
  };

  const [response] = await client.createTask({parent, task});
  return response.name;
}
```

Use `oidcToken` for handlers that validate Google-signed ID tokens. Use `oauthToken` only when the target expects an OAuth access token for Google APIs such as `*.googleapis.com`.

## App Engine Tasks

Use `appEngineHttpRequest` only when the target really is an App Engine service. For Cloud Run or arbitrary HTTPS endpoints, use `httpRequest`.

```javascript
const {v2} = require('@google-cloud/tasks');

async function enqueueAppEngineTask() {
  const client = new v2.CloudTasksClient();
  const parent = client.queuePath('my-project', 'us-central1', 'default');

  const task = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUri: '/tasks/process',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(JSON.stringify({job: 'sync'})).toString('base64'),
    },
  };

  const [response] = await client.createTask({parent, task});
  return response.name;
}
```

## Inspect And Manage Queues

Queue operations you will use most often:

```javascript
const {v2} = require('@google-cloud/tasks');

async function inspectQueue() {
  const client = new v2.CloudTasksClient();
  const queueName = client.queuePath('my-project', 'us-central1', 'default');

  const [queue] = await client.getQueue({name: queueName});
  console.log(queue.rateLimits);

  const [tasks] = await client.listTasks({
    parent: queueName,
    responseView: 'FULL',
  });

  for (const task of tasks) {
    console.log(task.name, task.scheduleTime);
  }

  await client.pauseQueue({name: queueName});
  await client.resumeQueue({name: queueName});
}
```

Useful methods on `CloudTasksClient` include:

- `createQueue`, `getQueue`, `listQueues`, `updateQueue`
- `pauseQueue`, `resumeQueue`, `purgeQueue`, `deleteQueue`
- `createTask`, `getTask`, `listTasks`, `deleteTask`, `runTask`

`runTask` is for manual execution or debugging of a task now. It is not a replacement for normal dispatch configuration.

## Configuration Notes

- Queue names are regional. The path is always `projects/{project}/locations/{location}/queues/{queue}`.
- Create the queue before enqueuing work. `createTask()` does not auto-create missing queues.
- Queue-level throttling and retry behavior live on the queue, not on the individual `createTask()` call.
- Task payload size is capped at `100KB`.
- If you need to inspect task payloads or headers, request `responseView: 'FULL'`; the default view is lighter.
- For JSON or text bodies, base64-encode the payload before assigning `httpRequest.body` or `appEngineHttpRequest.body`.

## Common Pitfalls

- Do not confuse Cloud Tasks with Pub/Sub. Cloud Tasks is for controlled dispatch to a specific handler with per-queue retry and rate settings.
- Do not omit the location when building queue paths. Region mismatch is a common cause of `NOT_FOUND`.
- If you use `oidcToken` or `oauthToken`, the caller creating the task needs permission to act as the signing service account, and the target service must also trust that account.
- Do not use `appEngineHttpRequest` for Cloud Run or arbitrary HTTPS endpoints.
- `purgeQueue()` is destructive and can take time to propagate. Use it only on an isolated queue.
- Avoid sequential explicit task IDs. Cloud Tasks expects IDs to be distributed well enough to avoid hot spots.

## Version-Sensitive Notes

- This guide targets `@google-cloud/tasks` version `6.2.1`.
- Keep the `v2.CloudTasksClient` namespace and JavaScript `camelCase` request fields shown here for current code.
- If your project pins a materially different package version, verify helper names and request shapes against the installed package and the matching reference pages.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/tasks/latest`
- Cloud Tasks product docs: `https://cloud.google.com/tasks/docs`
- Create HTTP target tasks guide: `https://cloud.google.com/tasks/docs/creating-http-target-tasks`
- Application Default Credentials setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- IAM roles for Cloud Tasks: `https://cloud.google.com/iam/docs/roles-permissions/cloudtasks`
- npm package page: `https://www.npmjs.com/package/@google-cloud/tasks`
