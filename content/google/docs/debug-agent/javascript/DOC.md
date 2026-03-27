---
name: debug-agent
description: "Google Cloud Debugger Node.js agent for bootstrapping snapshot and logpoint debugging with a single start() call"
metadata:
  languages: "javascript"
  versions: "9.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,cloud-debugger,debug-agent,gcp,javascript,nodejs,observability"
---

# `@google-cloud/debug-agent` JavaScript Package Guide

Use `@google-cloud/debug-agent` when a Node.js service should register itself with Google Cloud Debugger so you can set snapshot or logpoints from Google Cloud without attaching a local debugger to the process.

## Golden Rule

- Call `require('@google-cloud/debug-agent').start()` at the very top of the process entrypoint.
- Start the agent before loading Express, Koa, Fastify, or your own application modules.
- Use Google Cloud credentials through Application Default Credentials (ADC) or `GOOGLE_APPLICATION_CREDENTIALS`.
- Set `GOOGLE_CLOUD_PROJECT` when the runtime does not already provide the project ID.
- Enable `allowExpressions: true` only when you need evaluated watch expressions.

This guide covers `9.0.1`.

## Install

Pin the package version you want your app to target:

```bash
npm install @google-cloud/debug-agent@9.0.1
```

## Authentication And Setup

This package uses Google Cloud credentials, not an API key.

Enable the Cloud Debugger API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable clouddebugger.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Minimum setup:

1. Enable the Cloud Debugger API in the target project.
2. Grant the runtime identity the Cloud Debugger Agent role: `roles/clouddebugger.agent`.
3. Make sure the process can resolve the same project you intend to debug.

If you run on Google Cloud managed compute, the default service account can be used as long as it has the required IAM role.

## Initialize The Agent

This package is a process-wide bootstrap agent. You initialize it once with `start()` and then load the rest of your app.

CommonJS bootstrap:

```javascript
require('@google-cloud/debug-agent').start();

require('./server');
```

If you need evaluated watch expressions:

```javascript
require('@google-cloud/debug-agent').start({
  allowExpressions: true,
});

require('./server');
```

## Common Workflows

### Bootstrap An Express Service

Put the debugger agent on the first line of the entrypoint:

```javascript
require('@google-cloud/debug-agent').start();

const express = require('express');

const app = express();

app.get('/healthz', (_req, res) => {
  res.json({ok: true});
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
```

### Start With Explicit Environment Variables

Use environment variables when you want the startup command itself to make the project and credential source obvious:

```bash
GOOGLE_CLOUD_PROJECT="my-project-id" \
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json" \
node index.js
```

### Enable Expression Evaluation Deliberately

Expression evaluation is opt-in:

```javascript
require('@google-cloud/debug-agent').start({
  allowExpressions: true,
});
```

If you do not need evaluated expressions, leave this off and use plain snapshot breakpoints or logpoints.

## Important Pitfalls

### Loading The Agent Too Late

Do not load the agent after your framework or app modules are already required.

Bad:

```javascript
const express = require('express');

require('@google-cloud/debug-agent').start();
```

Good:

```javascript
require('@google-cloud/debug-agent').start();

const express = require('express');
```

### Expecting A Request Client

`@google-cloud/debug-agent` does not expose a normal per-request client object. The public integration point is the startup call:

```javascript
require('@google-cloud/debug-agent').start();
```

After that, breakpoint management happens in Google Cloud Debugger rather than through application code.

### Missing Project Or IAM Configuration

If the debug target does not show up, check these first:

- `GOOGLE_CLOUD_PROJECT` points at the correct project when you are not on a managed Google Cloud runtime.
- The Cloud Debugger API is enabled.
- The running identity has `roles/clouddebugger.agent`.
- The process can authenticate with ADC or `GOOGLE_APPLICATION_CREDENTIALS`.

## Practical Notes

- Keep the debugger initialization in a tiny bootstrap file if your main application entrypoint is already crowded.
- Call `start()` once per process.
- If you deploy transpiled output, place breakpoints against the files that actually ship with the running service.
