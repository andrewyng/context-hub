---
name: functions
description: "Google Cloud Functions Node.js client for listing, inspecting, deploying, updating, and deleting Cloud Functions resources"
metadata:
  languages: "javascript"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,cloud-functions,gcp,functions,serverless,javascript,nodejs"
---

# `@google-cloud/functions` JavaScript Package Guide

Use `@google-cloud/functions` when your Node.js code needs the Cloud Functions control-plane API: list deployed functions, inspect configuration, discover runtimes, deploy changes, generate source upload URLs, and delete functions. Prefer the `v2` client for current 2nd gen workflows. Use `v1` only when you are intentionally working with legacy 1st gen functions or the v1-only `callFunction()` API.

This package manages Cloud Functions resources. It is not the package you use inside a function handler.

This guide covers `4.2.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/functions@4.2.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Typical prerequisites:

1. A Google Cloud project.
2. Cloud Functions API enabled in that project.
3. Credentials with permission to manage functions in the target project and region.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable cloudfunctions.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with Application Default Credentials (ADC):

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"
```

If you must use a service account key file explicitly:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

For production on Google Cloud, prefer an attached service account instead of shipping key files.

## Initialize The Clients

Use `v2.FunctionServiceClient` for current deployments and admin workflows:

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();
```

With explicit project ID and key file:

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Use `v1.CloudFunctionsServiceClient` only for legacy 1st gen-specific workflows:

```javascript
const {v1} = require('@google-cloud/functions');

const legacyClient = new v1.CloudFunctionsServiceClient();
```

For the examples below, build resource names explicitly:

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const region = process.env.GOOGLE_CLOUD_REGION || 'us-central1';

const parent = `projects/${projectId}/locations/${region}`;
const functionName = `${parent}/functions/hello-function`;
```

## Core Workflows

### List Functions In A Region

Use the async iterator to avoid manual page handling.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function listFunctions(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  for await (const fn of client.listFunctionsAsync({parent})) {
    console.log({
      name: fn.name,
      state: fn.state,
      environment: fn.environment,
      url: fn.serviceConfig?.uri || fn.url || null,
    });
  }
}
```

### Read One Function

`getFunction()` expects the full resource name, not just the function ID.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function getFunction(projectId, region, functionId) {
  const name = `projects/${projectId}/locations/${region}/functions/${functionId}`;
  const [fn] = await client.getFunction({name});
  return fn;
}
```

### List Supported Runtimes

Use this instead of hard-coding runtime strings when you generate deployment config.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function listRuntimes(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  for await (const runtime of client.listRuntimesAsync({parent})) {
    console.log({
      name: runtime.name,
      displayName: runtime.displayName,
      environment: runtime.environment,
      stage: runtime.stage,
    });
  }
}
```

### Update A Function With A Field Mask

`updateFunction()` is a long-running operation. Wait for `operation.promise()`. Use an update mask so you only change the fields you intend to change.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function updateFunctionEnv(projectId, region, functionId) {
  const name = `projects/${projectId}/locations/${region}/functions/${functionId}`;
  const [fn] = await client.getFunction({name});

  fn.serviceConfig = {
    ...fn.serviceConfig,
    environmentVariables: {
      ...(fn.serviceConfig?.environmentVariables ?? {}),
      APP_ENV: 'prod',
    },
    maxInstanceCount: 5,
  };

  const [operation] = await client.updateFunction({
    function: fn,
    updateMask: {
      paths: [
        'service_config.environment_variables',
        'service_config.max_instance_count',
      ],
    },
  });

  const [updated] = await operation.promise();
  return updated;
}
```

### Create A Function From Source Already In Cloud Storage

For `storageSource`, the object must be a gzipped archive (`.tar.gz`) in Cloud Storage.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function createFunctionFromGcs(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  const [operation] = await client.createFunction({
    parent,
    functionId: 'hello-function',
    function: {
      buildConfig: {
        runtime: 'nodejs22',
        entryPoint: 'helloHttp',
        source: {
          storageSource: {
            bucket: 'my-source-bucket',
            object: 'hello-function.tar.gz',
          },
        },
      },
      serviceConfig: {
        availableMemory: '512M',
        timeoutSeconds: 60,
        environmentVariables: {
          APP_ENV: 'prod',
        },
      },
    },
  });

  const [created] = await operation.promise();
  console.log(created.name);
  console.log(created.serviceConfig?.uri || created.url || null);
  return created;
}
```

### Generate A Signed Upload URL For Local Source

Use `generateUploadUrl()` when your source bundle is local. The upload target expects a zip archive, not a `.tar.gz` file. After upload, use the returned `storageSource` when you call `createFunction()` or `updateFunction()`.

```javascript
const fs = require('node:fs/promises');
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function uploadLocalSource(projectId, region, zipPath) {
  const parent = `projects/${projectId}/locations/${region}`;
  const [upload] = await client.generateUploadUrl({parent});

  const body = await fs.readFile(zipPath);
  const response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/zip',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return upload.storageSource;
}
```

Use the returned storage source in a later create request:

```javascript
const storageSource = await uploadLocalSource(
  process.env.GOOGLE_CLOUD_PROJECT,
  process.env.GOOGLE_CLOUD_REGION || 'us-central1',
  './function-source.zip'
);

const [operation] = await client.createFunction({
  parent,
  functionId: 'hello-function',
  function: {
    buildConfig: {
      runtime: 'nodejs22',
      entryPoint: 'helloHttp',
      source: {
        storageSource,
      },
    },
    serviceConfig: {
      timeoutSeconds: 60,
    },
  },
});

await operation.promise();
```

### Delete A Function

Delete is also a long-running operation.

```javascript
const {v2} = require('@google-cloud/functions');

const client = new v2.FunctionServiceClient();

async function deleteFunction(projectId, region, functionId) {
  const name = `projects/${projectId}/locations/${region}/functions/${functionId}`;
  const [operation] = await client.deleteFunction({name});
  await operation.promise();
}
```

## Legacy `v1` Surface

Use `v1` only when you are working with 1st gen functions or the legacy synchronous invoke API.

### Call A 1st Gen Function Directly

`callFunction()` is part of the v1 surface. Do not use this for normal HTTP-triggered 2nd gen functions. For deployed HTTP endpoints, send a normal HTTP request to the function URL instead.

```javascript
const {v1} = require('@google-cloud/functions');

const client = new v1.CloudFunctionsServiceClient();

async function callFirstGenFunction(projectId, region, functionId, payload) {
  const name = `projects/${projectId}/locations/${region}/functions/${functionId}`;

  const [response] = await client.callFunction({
    name,
    data: JSON.stringify(payload),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.result;
}
```

## Configuration Notes

- Keep `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_REGION` in configuration instead of scattering literal strings through deployment code.
- `buildConfig` controls build-time settings such as runtime, entry point, worker pool, and source location.
- `serviceConfig` controls execution-side settings such as memory, timeout, instance counts, service account, ingress, and secrets.
- Mutating methods like `createFunction()`, `updateFunction()`, and `deleteFunction()` return long-running operations. Wait for `operation.promise()` before assuming the change is complete.
- The signed upload URL flow and the Cloud Storage archive flow use different archive formats: signed upload uses a zip file, while `storageSource.object` in Cloud Storage must be a `.tar.gz` archive.

## Common Pitfalls

- The package name is `@google-cloud/functions`, but the main clients live under versioned namespaces: `v2.FunctionServiceClient` and `v1.CloudFunctionsServiceClient`.
- This is an admin SDK. It manages Cloud Functions resources; it does not replace plain HTTP requests to a deployed function URL.
- For `getFunction()`, `updateFunction()`, and `deleteFunction()`, use a full resource name like `projects/.../locations/.../functions/...`.
- `updateFunction()` without an explicit field mask can update more than you intended.
- `generateUploadUrl()` returns a signed URL for a zip upload. That upload request should not include an `Authorization` header.
- `listFunctionsAsync()` and `listRuntimesAsync()` are usually the simplest way to iterate through pages.
- `callFunction()` is a v1-only workflow for legacy 1st gen usage, not a general-purpose invoke method for 2nd gen HTTP functions.

## Version-Sensitive Notes

- This guide targets `@google-cloud/functions` `4.2.1`.
- The package exposes both `v1` and `v2` clients under one npm package. Prefer `v2` for current 2nd gen management code and keep `v1` only for intentional 1st gen compatibility.
- Cloud Functions runtime names change over time. Use `listRuntimesAsync()` when you need a current supported runtime list instead of hard-coding old runtime values.

## Official Sources

- Node.js client reference root: `https://cloud.google.com/nodejs/docs/reference/functions/latest`
- Cloud Functions v2 REST reference: `https://cloud.google.com/functions/docs/reference/rest/v2/projects.locations.functions`
- Cloud Functions v1 REST reference: `https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions`
- Application Default Credentials overview: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- ADC search order: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/functions`
