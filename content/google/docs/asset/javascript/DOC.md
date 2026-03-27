---
name: asset
description: "@google-cloud/asset JavaScript package guide with ADC setup, asset inventory search/list patterns, and export workflows"
metadata:
  languages: "javascript"
  versions: "6.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,cloud-asset-inventory,javascript,nodejs,iam,inventory,search,export"
---

# `@google-cloud/asset` JavaScript Package Guide

Use `@google-cloud/asset` when your Node.js code needs to inventory Google Cloud resources, search resources across a project, folder, or organization, or export Cloud Asset Inventory snapshots for reporting.

## Golden Rule

- Import the generated client from the `v1` namespace.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Pass full resource names like `projects/...`, `folders/...`, and `organizations/...`.
- Use `searchAllResourcesAsync()` for targeted lookups and `listAssetsAsync()` for inventory-style reads.
- Use `exportAssets()` for large or scheduled snapshots instead of trying to dump broad inventories client-side.

This guide covers `6.3.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/asset@6.3.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

Enable the Cloud Asset API in the project your application uses to call the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable cloudasset.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
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

Before calling the API, make sure:

1. The Cloud Asset API is enabled.
2. The caller has access to the project, folder, or organization being queried.
3. The scope string is a full resource name, not a bare ID.

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/asset');

const client = new v1.AssetServiceClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/asset';

const client = new v1.AssetServiceClient();
```

With an explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/asset');

const client = new v1.AssetServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Resource Scopes You Reuse Constantly

Use the fully qualified form expected by the API:

- Project scope: `projects/my-project-id`
- Folder scope: `folders/1234567890`
- Organization scope: `organizations/1234567890`

Use `parent` for snapshot and export methods such as `listAssets()` and `exportAssets()`. Use `scope` for search methods such as `searchAllResources()`.

## Core Workflows

### List Assets For A Snapshot

Use `listAssetsAsync()` when you need a structured inventory for a bounded scope.

```javascript
const {v1} = require('@google-cloud/asset');

const client = new v1.AssetServiceClient();

async function listBucketAssets() {
  const request = {
    parent: 'projects/my-project-id',
    assetTypes: ['storage.googleapis.com/Bucket'],
    contentType: 'RESOURCE',
    pageSize: 100,
  };

  for await (const asset of client.listAssetsAsync(request)) {
    console.log({
      name: asset.name,
      assetType: asset.assetType,
    });
  }
}

listBucketAssets().catch(console.error);
```

Use `readTime` when you need a point-in-time snapshot instead of the latest view.

### Search Resources Across A Scope

Use `searchAllResourcesAsync()` when you know roughly what you want and do not want to walk the entire inventory.

```javascript
const {v1} = require('@google-cloud/asset');

const client = new v1.AssetServiceClient();

async function searchComputeInstances() {
  const request = {
    scope: 'projects/my-project-id',
    query: 'displayName:prod',
    assetTypes: ['compute.googleapis.com/Instance'],
    pageSize: 50,
  };

  for await (const resource of client.searchAllResourcesAsync(request)) {
    console.log({
      name: resource.name,
      assetType: resource.assetType,
    });
  }
}

searchComputeInstances().catch(console.error);
```

Use `searchAllIamPolicies()` when the task is policy-oriented rather than resource-oriented.

### Export Assets To Cloud Storage

Use `exportAssets()` for scheduled reporting or broad inventory snapshots. It is a long-running operation.

```javascript
const {v1} = require('@google-cloud/asset');

const client = new v1.AssetServiceClient();

async function exportBucketAssets() {
  const request = {
    parent: 'projects/my-project-id',
    assetTypes: ['storage.googleapis.com/Bucket'],
    contentType: 'RESOURCE',
    outputConfig: {
      gcsDestination: {
        uri: 'gs://my-bucket/exports/asset-snapshot.json',
      },
    },
  };

  const [operation] = await client.exportAssets(request);
  const [response] = await operation.promise();

  console.log(response.readTime);
}

exportBucketAssets().catch(console.error);
```

Use a BigQuery destination when downstream code will query asset snapshots with SQL instead of reading raw export files.

## Version And Namespace Notes

This package exposes versioned namespaces. For normal application code:

- Prefer `v1` unless you are maintaining code that already depends on a beta namespace.
- Keep request field names in JavaScript `camelCase`, even when the product docs describe proto fields with snake case.

## Important Pitfalls

- Passing a bare project ID where the API expects `projects/PROJECT_ID`.
- Using `parent` and `scope` interchangeably. Snapshot/export methods use `parent`; search methods use `scope`.
- Expecting organization-wide searches to behave like project-scoped reads. Broader scopes need broader IAM and are slower.
- Treating empty results as a request-shape problem before checking API enablement, IAM, and scope.
- Assuming an export finished before awaiting `operation.promise()`.
- Using `listAssets()` for large-scale dumps that are better handled by `exportAssets()`.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/asset/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/asset`
- Cloud Asset Inventory docs: `https://cloud.google.com/asset-inventory/docs`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
