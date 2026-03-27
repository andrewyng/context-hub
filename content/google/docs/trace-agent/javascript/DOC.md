---
name: trace-agent
description: "Google Cloud Trace Node.js agent for starting automatic tracing early in process startup and adding manual spans when needed"
metadata:
  languages: "javascript"
  versions: "8.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,trace,distributed-tracing,observability,javascript,nodejs"
---

# `@google-cloud/trace-agent` JavaScript Package Guide

Use `@google-cloud/trace-agent` when you want a Node.js service to send trace data to Google Cloud Trace. This package is a startup agent, not a request-scoped client: you initialize it once at process startup, before loading the rest of the app, and then let automatic instrumentation collect traces for supported modules.

## Golden Rule

- Start the agent exactly once, as early as possible in the process.
- Load it before `express`, database drivers, HTTP clients, or other modules you want auto-instrumented.
- Use Application Default Credentials (ADC) unless you need to pass `projectId` or `keyFilename` explicitly.
- Keep project selection explicit in local development so traces do not go to the wrong project.
- Use manual spans only for work the agent will not capture automatically.

This guide covers `8.0.0`.

## Install

```bash
npm install @google-cloud/trace-agent@8.0.0
```

## Prerequisites

Before starting the agent:

1. Enable the Cloud Trace API in the target project.
2. Run the process with credentials that can write trace data.
3. Decide which Google Cloud project should receive traces.

Enable the API:

```bash
gcloud services enable cloudtrace.googleapis.com \
  --project "$GOOGLE_CLOUD_PROJECT"
```

## Authentication And Setup

This package uses Google Cloud credentials, not an API key.

For local development with Application Default Credentials:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GCLOUD_PROJECT="$GOOGLE_CLOUD_PROJECT"
```

For a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GCLOUD_PROJECT="$GOOGLE_CLOUD_PROJECT"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

In production on Google Cloud, prefer an attached service account or workload identity instead of distributing JSON key files.

## Initialize The Agent

The agent must start before the rest of the app is loaded so it can patch supported modules during `require()`.

### Minimal Startup Example

```javascript
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
});

require('./server');
```

### Start With An Explicit Key File

Use this when you are not relying on ADC discovery.

```javascript
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

require('./server');
```

### Use A Dedicated Bootstrap File

Keeping tracing in its own startup module makes it easier to guarantee load order.

```javascript
// tracing.js
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
});
```

```javascript
// index.js
require('./tracing');
require('./server');
```

## Common Workflows

### Start Tracing Before An Express App

Initialize the agent before `express` is loaded.

```javascript
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
});

const express = require('express');

const app = express();

app.get('/healthz', (req, res) => {
  res.send('ok');
});

app.listen(8080, () => {
  console.log('Listening on :8080');
});
```

### Add A Manual Root Span For Background Work

Use manual spans for work that does not already sit inside an incoming traced request.

```javascript
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
});

const tracer = traceAgent.get();

function rebuildSearchIndex(doWork) {
  return tracer.runInRootSpan({name: 'rebuild-search-index'}, rootSpan => {
    try {
      rootSpan.addLabel('job.name', 'rebuild-search-index');
      return doWork();
    } finally {
      rootSpan.endSpan();
    }
  });
}
```

### Add Child Spans Inside A Traced Operation

Use child spans to break a larger operation into smaller timed sections.

```javascript
const traceAgent = require('@google-cloud/trace-agent');

traceAgent.start({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
});

const tracer = traceAgent.get();

function handleOrder(validateCart, chargeCustomer) {
  return tracer.runInRootSpan({name: 'handle-order'}, rootSpan => {
    try {
      const validationSpan = tracer.createChildSpan({name: 'validate-cart'});
      try {
        validateCart();
      } finally {
        validationSpan.endSpan();
      }

      const chargeSpan = tracer.createChildSpan({name: 'charge-customer'});
      try {
        chargeCustomer();
      } finally {
        chargeSpan.endSpan();
      }
    } finally {
      rootSpan.endSpan();
    }
  });
}
```

## Common Pitfalls

- Do not call `start()` after loading `express`, database drivers, or HTTP client libraries you expect the agent to patch.
- Do not initialize the agent more than once in the same process.
- Do not rely on implicit project detection in local development if you have access to multiple Google Cloud projects.
- Do not commit service account JSON files into the repository.
- Do not treat this package like a normal instantiated client; the primary entry point is the top-level `start()` call.

## Version-Sensitive Notes

- This guide targets `@google-cloud/trace-agent` version `8.0.0`.
- The package is configured through `start(...)` at process startup rather than by constructing a long-lived client instance.
- Manual instrumentation in this package uses the singleton tracer obtained from `require('@google-cloud/trace-agent').get()`.

## Official Sources

- Maintainer README: `https://github.com/googleapis/cloud-trace-nodejs#readme`
- Google Cloud authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- npm package page: `https://www.npmjs.com/package/@google-cloud/trace-agent`
