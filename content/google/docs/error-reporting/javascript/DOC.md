---
name: error-reporting
description: "Google Cloud Error Reporting Node.js client for reporting handled exceptions and request failures from JavaScript services"
metadata:
  languages: "javascript"
  versions: "3.0.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,error-reporting,observability,exceptions,javascript,nodejs"
---

# `@google-cloud/error-reporting` JavaScript Package Guide

Use `@google-cloud/error-reporting` when a Node.js service needs to send handled exceptions or request-scoped failures to Google Cloud Error Reporting.

If your runtime already forwards uncaught exceptions into Google Cloud automatically, use this package for handled errors or custom service grouping instead of reporting the same crash path twice.

## Golden Rule

- Create one process-wide `ErrorReporting` client.
- Set `serviceContext.service` to a stable service name.
- Set `serviceContext.version` from a deploy identifier such as a release tag or git SHA.
- Use Application Default Credentials (ADC) or `GOOGLE_APPLICATION_CREDENTIALS`.
- Report real `Error` objects so the event includes a JavaScript stack trace.
- Pass the HTTP request when reporting request failures so Error Reporting can attach request context.

This guide covers `3.0.5`.

## Install

```bash
npm install @google-cloud/error-reporting@3.0.5
```

## Authentication And Setup

Before sending events:

1. Enable the Error Reporting API in the target project.
2. Run with credentials that can write error events.
3. Decide the `service` and `version` values you want to appear in Google Cloud.

Enable the API in the project that will receive the events:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable clouderrorreporting.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

If you must use a service account key file explicitly:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

In production on Google Cloud, prefer an attached service account or workload identity over distributing long-lived JSON keys.

## Initialize The Client

CommonJS:

```javascript
const {ErrorReporting} = require('@google-cloud/error-reporting');

const errors = new ErrorReporting({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  serviceContext: {
    service: 'checkout-api',
    version: process.env.K_REVISION || process.env.APP_VERSION || 'dev',
  },
});
```

ES modules:

```javascript
import {ErrorReporting} from '@google-cloud/error-reporting';

const errors = new ErrorReporting({
  serviceContext: {
    service: 'checkout-api',
    version: process.env.K_REVISION || process.env.APP_VERSION || 'dev',
  },
});
```

If project detection is wrong outside Google Cloud, pass `projectId` explicitly or set `GOOGLE_CLOUD_PROJECT`.

## Core Workflows

### Report A Caught Exception

Report the original `Error` and then decide whether your code should rethrow it:

```javascript
const {ErrorReporting} = require('@google-cloud/error-reporting');

const errors = new ErrorReporting({
  serviceContext: {
    service: 'billing-worker',
    version: process.env.APP_VERSION || 'dev',
  },
});

async function chargeCustomer(customer) {
  try {
    await billingClient.charge(customer);
  } catch (error) {
    errors.report(error);
    throw error;
  }
}
```

### Report A Handled Background Error

If you want an Error Reporting event for a failure your code handles locally, create an `Error` so the event includes a stack trace:

```javascript
const {ErrorReporting} = require('@google-cloud/error-reporting');

const errors = new ErrorReporting({
  serviceContext: {
    service: 'job-runner',
    version: process.env.APP_VERSION || 'dev',
  },
});

async function processJob(job) {
  try {
    await runJob(job);
  } catch (cause) {
    const error = cause instanceof Error
      ? cause
      : new Error(`job ${job.id} failed: ${String(cause)}`);

    errors.report(error);
    return {ok: false};
  }
}
```

### Report An Express Request Failure With HTTP Context

Pass the current `req` object so Error Reporting can associate the event with the request URL, method, referrer, and user agent.

```javascript
const express = require('express');
const {ErrorReporting} = require('@google-cloud/error-reporting');

const app = express();
const errors = new ErrorReporting({
  serviceContext: {
    service: 'frontend',
    version: process.env.K_REVISION || 'dev',
  },
});

app.get('/checkout', async (req, res, next) => {
  try {
    await runCheckout(req.query.cartId);
    res.json({ok: true});
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  errors.report(error, req);
  res.status(500).json({error: 'internal'});
});
```

Put the error-handling middleware after your routes so it only runs for actual request failures.

## Common Pitfalls

- Do not rotate `serviceContext.service` on every deploy; keep the service name stable and move release information into `serviceContext.version`.
- Do not rely on implicit project detection everywhere; set `GOOGLE_CLOUD_PROJECT` or `projectId` when running outside Google Cloud.
- Do not report arbitrary plain objects when you can report an `Error`; Error Reporting groups JavaScript events best when the stack trace comes from `error.stack`.
- Do not double-report the same uncaught exception path if your Google Cloud runtime already surfaces it automatically.
- Do not place Express error middleware before routes; the request context example only works when the handler runs after routing.

## Version-Sensitive Notes

- This guide targets `@google-cloud/error-reporting` version `3.0.5`.
- Error Reporting groups events using service context, so `serviceContext.service` and `serviceContext.version` are part of the setup, not optional polish.
- The underlying Error Reporting API expects a stack trace or an explicit report location. In JavaScript, reporting real `Error` instances is the safest path.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/error-reporting/latest`
- Google Cloud Error Reporting product docs: `https://cloud.google.com/error-reporting/`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- npm package page: `https://www.npmjs.com/package/@google-cloud/error-reporting`
