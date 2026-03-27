---
name: profiler
description: "Google Cloud Profiler Node.js agent for starting continuous application profiling from a Node process"
metadata:
  languages: "javascript"
  versions: "6.0.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,profiler,performance,observability,javascript,nodejs"
---

# `@google-cloud/profiler` JavaScript Package Guide

Use `@google-cloud/profiler` when you want a Node.js process to publish profiling data to Google Cloud Profiler. This package is a startup hook, not a request-scoped client: you configure it once with `start()`, then let it run for the life of the process.

## Golden Rule

- Start the profiler once, as early as practical in process startup.
- Use Application Default Credentials (ADC) unless you need to pass a project ID or key file explicitly.
- Set a stable `serviceContext.service` value so profiles for the same service stay grouped together.
- Set `serviceContext.version` from your deployment version so you can compare releases.
- Treat profiler startup as optional application infrastructure: log failures, then decide whether the app should continue.

This guide covers `6.0.4`.

## Install

```bash
npm install @google-cloud/profiler@6.0.4
```

## Prerequisites

Before starting the agent, make sure the Google Cloud side is ready:

1. Enable the Cloud Profiler API for the target project.
2. Run the process with credentials that can create profiler profiles.
3. Decide the service name and version you want to appear in Google Cloud.

Enable the API:

```bash
gcloud services enable cloudprofiler.googleapis.com \
  --project "$GOOGLE_CLOUD_PROJECT"
```

## Authentication And Setup

This package uses Google Cloud authentication, not an API key.

For local development with Application Default Credentials:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

In production on Google Cloud, prefer an attached service account or workload identity instead of distributing long-lived JSON keys.

## Initialize The Profiler

The package is typically loaded near the top of your entry file and started before the rest of the app begins serving traffic.

### Minimal Startup Example

```javascript
const profiler = require('@google-cloud/profiler');

async function start() {
  try {
    await profiler.start({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      serviceContext: {
        service: 'orders-api',
        version: process.env.K_REVISION || process.env.APP_VERSION || 'dev',
      },
    });
  } catch (error) {
    console.error('Failed to start Google Cloud Profiler', error);
  }

  require('./server');
}

start();
```

### Start With An Explicit Key File

Use this when you are not relying on ADC discovery.

```javascript
const profiler = require('@google-cloud/profiler');

async function start() {
  await profiler.start({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    serviceContext: {
      service: 'orders-api',
      version: '1.2.3',
    },
  });
}

start().catch(console.error);
```

## Common Workflows

### Start Profiling In An HTTP Server Entry Point

Initialize the profiler before creating the HTTP listener.

```javascript
const profiler = require('@google-cloud/profiler');
const express = require('express');

async function main() {
  try {
    await profiler.start({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      serviceContext: {
        service: 'checkout-api',
        version: process.env.APP_VERSION || 'dev',
      },
    });
  } catch (error) {
    console.error('Profiler startup failed', error);
  }

  const app = express();

  app.get('/healthz', (req, res) => {
    res.send('ok');
  });

  app.listen(8080, () => {
    console.log('Listening on :8080');
  });
}

main().catch(console.error);
```

### Use Stable Service Naming Across Deployments

Keep the service name stable and vary the version by release.

```javascript
const profiler = require('@google-cloud/profiler');

async function startProfiler() {
  await profiler.start({
    serviceContext: {
      service: 'billing-worker',
      version: process.env.GIT_SHA || 'local-dev',
    },
  });
}
```

This keeps profiles for `billing-worker` grouped together while still separating release versions.

### Disable Time Profiling

If your environment or policy requires turning off time profiling, pass `disableTime` in the startup config.

```javascript
const profiler = require('@google-cloud/profiler');

async function startProfiler() {
  await profiler.start({
    serviceContext: {
      service: 'payments-api',
      version: '2026-03-13',
    },
    disableTime: true,
  });
}
```

## Common Pitfalls

- Do not start the profiler late in your app lifecycle if you want startup behavior included in profiles.
- Do not change `serviceContext.service` on every deploy; use `serviceContext.version` for release separation instead.
- Do not commit service account JSON files into your repository.
- Do not assume project detection always works outside Google Cloud; set `GOOGLE_CLOUD_PROJECT` or `projectId` when needed.
- Do not skip Cloud Profiler API enablement or IAM setup when startup fails with permission or API errors.

## Version-Sensitive Notes

- This guide targets `@google-cloud/profiler` version `6.0.4`.
- The Node.js package is configured through the top-level `start()` call rather than by constructing a long-lived client instance.
- The package documentation examples use `serviceContext` to identify the profiled service.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/profiler/latest`
- Cloud Profiler product docs: `https://cloud.google.com/profiler/docs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- npm package page: `https://www.npmjs.com/package/@google-cloud/profiler`
