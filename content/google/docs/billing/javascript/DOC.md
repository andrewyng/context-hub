---
name: billing
description: "Google Cloud Billing Node.js client for billing accounts, project billing links, and Cloud Catalog SKU metadata"
metadata:
  languages: "javascript"
  versions: "5.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-billing,google-cloud,gcp,billing,cloud-catalog,pricing,javascript,nodejs"
---

# `@google-cloud/billing` JavaScript Package Guide

Use `@google-cloud/billing` when your Node.js code needs to discover billing accounts, read or change the billing account linked to a project, or query published Cloud Catalog service and SKU metadata.

## Golden Rule

Use this package for Cloud Billing control-plane operations and catalog metadata, not for invoice analysis, budget enforcement, or BigQuery billing export queries.

- Import the generated clients from the `v1` namespace.
- Use `v1.CloudBillingClient` for billing accounts and project billing links.
- Use `v1.CloudCatalogClient` for services, SKUs, and published price metadata.
- Authenticate with Application Default Credentials (ADC), not API keys.
- Pass full resource names like `projects/PROJECT_ID`, `billingAccounts/...`, and `services/...`.

This guide covers `5.1.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/billing@5.1.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the Cloud Billing API in the project that will call the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable cloudbilling.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
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

Typical prerequisites:

1. The target project already exists.
2. The Cloud Billing API is enabled for the caller project.
3. The caller has permission to view billing accounts or change project billing links.

## Initialize The Clients

CommonJS:

```javascript
const {v1} = require('@google-cloud/billing');

const billingClient = new v1.CloudBillingClient();
const catalogClient = new v1.CloudCatalogClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/billing';

const billingClient = new v1.CloudBillingClient();
const catalogClient = new v1.CloudCatalogClient();
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/billing');

const billingClient = new v1.CloudBillingClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### List Billing Accounts

Use this to discover billing account resource names for later requests.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function listBillingAccounts() {
  const accounts = [];

  for await (const account of client.listBillingAccountsAsync({})) {
    accounts.push({
      name: account.name,
      displayName: account.displayName,
      open: account.open,
    });
  }

  return accounts;
}
```

Billing account resource names look like `billingAccounts/000000-000000-000000`.

### Read A Project's Billing State

`getProjectBillingInfo()` expects a project resource name, not a bare project ID.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function getProjectBillingState(projectId) {
  const [info] = await client.getProjectBillingInfo({
    name: `projects/${projectId}`,
  });

  return {
    projectId: info.projectId,
    billingEnabled: info.billingEnabled,
    billingAccountName: info.billingAccountName || null,
  };
}
```

### Link A Project To A Billing Account

Use `updateProjectBillingInfo()` to attach a project to a billing account.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function linkProjectBilling(projectId, billingAccountName) {
  const [info] = await client.updateProjectBillingInfo({
    name: `projects/${projectId}`,
    projectBillingInfo: {
      billingAccountName,
    },
  });

  return info;
}

linkProjectBilling(
  'my-project-id',
  'billingAccounts/000000-000000-000000'
).catch(console.error);
```

### Disable Billing For A Project

To unlink a billing account from a project, send an empty billing account name.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function disableProjectBilling(projectId) {
  const [info] = await client.updateProjectBillingInfo({
    name: `projects/${projectId}`,
    projectBillingInfo: {
      billingAccountName: '',
    },
  });

  return info;
}
```

### List Projects Linked To A Billing Account

Use this when you need billing inventory for one billing account.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function listProjectsOnBillingAccount(billingAccountName) {
  const projects = [];

  for await (const info of client.listProjectBillingInfoAsync({
    name: billingAccountName,
  })) {
    projects.push({
      projectId: info.projectId,
      billingEnabled: info.billingEnabled,
      billingAccountName: info.billingAccountName,
    });
  }

  return projects;
}
```

### List Billable Services

`CloudCatalogClient` exposes published Cloud Catalog metadata.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudCatalogClient();

async function listServices() {
  const services = [];

  for await (const service of client.listServicesAsync({})) {
    services.push({
      name: service.name,
      displayName: service.displayName,
    });
  }

  return services;
}
```

Service resource names look like `services/6F81-5844-456A`.

### List SKUs For A Service

Use this when you need published SKU metadata for one Google Cloud service.

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudCatalogClient();

async function listSkusForService(serviceName) {
  const skus = [];

  for await (const sku of client.listSkusAsync({
    parent: serviceName,
  })) {
    skus.push({
      name: sku.name,
      description: sku.description,
      resourceFamily: sku.category?.resourceFamily,
      usageType: sku.category?.usageType,
    });
  }

  return skus;
}

listSkusForService('services/6F81-5844-456A').catch(console.error);
```

Treat catalog results as published SKU metadata, not as live usage or invoice data.

## Request Configuration

Generated Google Cloud Node.js clients follow the usual GAPIC request pattern:

- Unary methods take a request object and optional call options.
- List methods expose async iterators like `listBillingAccountsAsync()` and `listSkusAsync()`.
- Resource names are strings like `projects/my-project-id`, `billingAccounts/...`, and `services/...`.

Example with an explicit timeout:

```javascript
const {v1} = require('@google-cloud/billing');

const client = new v1.CloudBillingClient();

async function getProjectBillingState(projectId) {
  const [info] = await client.getProjectBillingInfo(
    {name: `projects/${projectId}`},
    {timeout: 30000}
  );

  return info;
}
```

## Configuration And Debugging Notes

- ADC is the default credential flow. Avoid hard-coding credentials into application code.
- Set `GOOGLE_APPLICATION_CREDENTIALS` only when you intentionally want file-based service account credentials.
- Reuse long-lived clients in app code instead of constructing a new client for every request.
- Cache catalog lookups when you repeatedly read services or SKUs. Catalog responses can be large.

## Common Pitfalls

- The package is `@google-cloud/billing`, but the generated clients live under the `v1` namespace.
- `CloudBillingClient` and `CloudCatalogClient` are separate surfaces. Project billing methods are not on the catalog client, and SKU methods are not on the billing client.
- `getProjectBillingInfo()` and `updateProjectBillingInfo()` require `projects/PROJECT_ID`, not just `PROJECT_ID`.
- `listProjectBillingInfoAsync()` takes a billing account resource like `billingAccounts/...`, not a project resource.
- Disabling billing uses `updateProjectBillingInfo()` with an empty `billingAccountName`; there is no separate delete method.
- Cloud Catalog metadata is useful for published pricing context, but it is not a substitute for usage export, invoice reconciliation, or budget enforcement.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/billing/latest`
- Cloud Billing product docs: `https://cloud.google.com/billing/docs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Local ADC setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- npm package page: `https://www.npmjs.com/package/@google-cloud/billing`
