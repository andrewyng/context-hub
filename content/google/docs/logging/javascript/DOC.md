---
name: logging
description: "Google Cloud Logging Node.js client for writing structured log entries, reading logs back, and configuring project-scoped logging with ADC"
metadata:
  languages: "javascript"
  versions: "11.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,google,gcp,logging,cloud-logging,observability,javascript,nodejs"
---

# `@google-cloud/logging` JavaScript Package Guide

Use `@google-cloud/logging` when your Node.js code needs to write log entries to Google Cloud Logging directly, attach structured metadata, or read recent entries back from a project.

## Golden Rule

- Import `Logging` from `@google-cloud/logging`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass `projectId` or `keyFilename` explicitly.
- Treat `logging.log(name)` as a handle for a named log, then create entries with `log.entry(...)` and send them with `await log.write(...)`.
- Prefer structured JSON payloads for application logs so entries are easier to filter in Logs Explorer.
- Keep log writing asynchronous and await it before process shutdown.

This guide covers `11.2.1`.

## Install

Pin the package version if you want behavior to match this guide exactly:

```bash
npm install @google-cloud/logging@11.2.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Enable the Cloud Logging API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable logging.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud auth application-default login
gcloud config set project "$GOOGLE_CLOUD_PROJECT"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Before you write code, make sure:

1. The Cloud Logging API is enabled in the project.
2. The credential resolves to the principal you expect.
3. That principal has permission for the logging operations you need.

Common IAM roles:

- `roles/logging.logWriter` to write log entries
- `roles/logging.viewer` to read log entries

## Initialize The Client

CommonJS:

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

ES modules:

```javascript
import {Logging} from '@google-cloud/logging';

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

With an explicit key file:

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Write A Simple Text Entry

Create a named log handle, build an entry, then write it.

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function writeStartupLog() {
  const log = logging.log('application');

  const entry = log.entry(
    {
      resource: {type: 'global'},
      severity: 'INFO',
    },
    'service started'
  );

  await log.write(entry);
}

writeStartupLog().catch(console.error);
```

Use a simple log name such as `application` or `worker`. In Cloud Logging, that becomes a project-scoped log such as `projects/PROJECT_ID/logs/application`.

### Write A Structured JSON Entry

Use an object payload when you want queryable fields in Logs Explorer.

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function writeOrderLog(orderId) {
  const log = logging.log('application');

  const entry = log.entry(
    {
      resource: {type: 'global'},
      severity: 'NOTICE',
      labels: {
        service: 'checkout',
        env: process.env.NODE_ENV || 'development',
      },
    },
    {
      event: 'order.created',
      orderId,
      source: 'api',
    }
  );

  await log.write(entry);
}
```

Structured payloads are easier to filter than plain strings because the fields are preserved as JSON.

### Attach Request Metadata To Error Logs

Cloud Logging entries can include request metadata such as method, URL, and status code.

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function writeRequestErrorLog(error, request) {
  const log = logging.log('application');

  const entry = log.entry(
    {
      resource: {type: 'global'},
      severity: 'ERROR',
      httpRequest: {
        requestMethod: request.method,
        requestUrl: request.url,
        status: 500,
        userAgent: request.headers['user-agent'],
        remoteIp: request.ip,
      },
      labels: {
        service: 'checkout',
      },
    },
    {
      message: 'request failed',
      error: error.message,
      path: request.url,
    }
  );

  await log.write(entry);
}
```

If you want stack traces or other fields preserved reliably, serialize them into the payload explicitly instead of relying on JavaScript `Error` object inspection.

### Write Multiple Entries In One Call

`log.write()` accepts either one entry or an array of entries.

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function writeBatch() {
  const log = logging.log('worker');

  const entries = [
    log.entry({resource: {type: 'global'}, severity: 'INFO'}, 'job started'),
    log.entry(
      {resource: {type: 'global'}, severity: 'NOTICE'},
      {event: 'job.finished', rowsProcessed: 128}
    ),
  ];

  await log.write(entries);
}
```

This is useful when your code already has multiple related entries ready to send together.

### Read Recent Entries

Use the top-level `Logging` client for project-scoped reads.

```javascript
const {Logging} = require('@google-cloud/logging');

const logging = new Logging({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function readRecentErrors(projectId) {
  const [entries] = await logging.getEntries({
    filter: [
      `logName="projects/${projectId}/logs/application"`,
      'severity>=ERROR',
    ].join(' AND '),
    orderBy: 'timestamp desc',
    pageSize: 20,
  });

  for (const entry of entries) {
    console.log(entry.metadata.timestamp, entry.metadata.severity, entry.data);
  }
}

readRecentErrors(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

Start with a simple filter first, then add more clauses once you confirm entries are present.

## Configuration Notes

### Pass `projectId` Explicitly When The Target Project Matters

The client can usually discover the project from ADC, but explicit `projectId` is safer when:

- local shells and CI may point at different Google Cloud projects
- the runtime project is not the same project where you want the logs written
- you are building filters that depend on exact project-qualified log names

### Set The Resource Explicitly Outside Managed Google Cloud Runtimes

For local development and generic servers, `resource: {type: 'global'}` is the safest starting point.

```javascript
const entry = logging.log('application').entry(
  {
    resource: {type: 'global'},
    severity: 'INFO',
  },
  {message: 'background job heartbeat'}
);
```

If your application runs on a Google Cloud runtime that supplies richer monitored resource metadata, the platform can associate entries more specifically.

## Common Pitfalls

- Do not use API keys; this client expects Google Cloud credentials.
- Do not forget to `await log.write(...)` in short-lived scripts or request handlers.
- Do not assume `logging.log(name)` sends anything by itself. It only returns a handle for later writes.
- Do not mix up plain-string payloads and structured-object payloads when you intend to query fields later.
- When reading entries, build filters with the full project-qualified log name such as `projects/PROJECT_ID/logs/application`.
- Keep local and CI environments explicit about `GOOGLE_CLOUD_PROJECT` so logs do not land in the wrong project.

## Version-Sensitive Notes

- This guide targets `@google-cloud/logging` version `11.2.1`.
- The Node.js reference site uses the `/latest` selector, so pin the npm version in your app if exact behavior matters.
- Use `Logging` as the main entry point for direct log reads and writes in Node.js code.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/logging/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/logging`
- Cloud Logging setup for Node.js: `https://cloud.google.com/logging/docs/setup/nodejs`
- Application Default Credentials overview: `https://cloud.google.com/docs/authentication/application-default-credentials`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
