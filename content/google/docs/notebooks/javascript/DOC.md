---
name: notebooks
description: "Google Cloud Notebooks Node.js client for classic notebook instances, managed runtimes, and Workbench instances"
metadata:
  languages: "javascript"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,notebooks,vertex-ai-workbench,jupyter,javascript,nodejs"
---

# `@google-cloud/notebooks` JavaScript Package Guide

Use `@google-cloud/notebooks` when your Node.js code needs to manage Google Cloud notebook resources instead of opening the notebook UI manually.

This package exposes multiple client surfaces under one npm package:

- `v1.NotebookServiceClient` for classic notebook instances and related execution and schedule resources
- `v1.ManagedNotebookServiceClient` for managed notebook runtimes
- `v2.NotebookServiceClient` for Workbench notebook instances

## Golden Rule

- Authenticate with Application Default Credentials (ADC), not an API key.
- Pick the client that matches the resource model you are managing.
- Build resource names explicitly as `projects/{project}/locations/{location}/...`.
- Treat create, start, stop, and delete calls as long-running operations and wait for `operation.promise()`.
- Keep classic `v1`, managed-runtime `v1`, and Workbench `v2` flows separate in your code.

This guide covers `4.2.1`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/notebooks@4.2.1
```

## Authentication And Setup

This package uses Google Cloud credentials.

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Typical prerequisites:

1. The target Google Cloud project already exists.
2. Billing and the relevant Notebooks or Workbench APIs are enabled for that project.
3. The calling identity can view or manage notebook resources in the target location.

## Initialize The Clients

CommonJS:

```javascript
const {v1, v2} = require('@google-cloud/notebooks');

const classicClient = new v1.NotebookServiceClient();
const runtimeClient = new v1.ManagedNotebookServiceClient();
const workbenchClient = new v2.NotebookServiceClient();
```

ES modules:

```javascript
import {v1, v2} from '@google-cloud/notebooks';

const classicClient = new v1.NotebookServiceClient();
const runtimeClient = new v1.ManagedNotebookServiceClient();
const workbenchClient = new v2.NotebookServiceClient();
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.NotebookServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Resource Names

Build names directly in code so you do not mix resource types:

- parent location: `projects/PROJECT_ID/locations/LOCATION`
- classic instance: `projects/PROJECT_ID/locations/LOCATION/instances/INSTANCE_ID`
- managed runtime: `projects/PROJECT_ID/locations/LOCATION/runtimes/RUNTIME_ID`
- Workbench instance: `projects/PROJECT_ID/locations/LOCATION/instances/INSTANCE_ID`

Use `parent` when listing or creating resources and full `name` values when getting, starting, stopping, or deleting them.

## Choose The Right Client

### `v1.NotebookServiceClient`

Use this for classic notebook instances and related execution or schedule workflows.

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.NotebookServiceClient();

async function listClassicInstances(projectId, location) {
  const parent = `projects/${projectId}/locations/${location}`;

  for await (const instance of client.listInstancesAsync({parent})) {
    console.log(instance.name, instance.state);
  }
}
```

Common operations on this surface include `listInstancesAsync()`, `getInstance()`, `createInstance()`, `deleteInstance()`, `startInstance()`, `stopInstance()`, plus execution and schedule management methods.

### `v1.ManagedNotebookServiceClient`

Use this for managed notebook runtimes.

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.ManagedNotebookServiceClient();

async function listRuntimes(projectId, location) {
  const parent = `projects/${projectId}/locations/${location}`;

  for await (const runtime of client.listRuntimesAsync({parent})) {
    console.log(runtime.name, runtime.healthState);
  }
}
```

Common operations on this surface include `listRuntimesAsync()`, `getRuntime()`, `createRuntime()`, `deleteRuntime()`, `startRuntime()`, and `stopRuntime()`.

### `v2.NotebookServiceClient`

Use this for Workbench notebook instances.

```javascript
const {v2} = require('@google-cloud/notebooks');

const client = new v2.NotebookServiceClient();

async function listWorkbenchInstances(projectId, location) {
  const parent = `projects/${projectId}/locations/${location}`;

  for await (const instance of client.listInstancesAsync({parent})) {
    console.log(instance.name, instance.state);
  }
}
```

Use this surface when you are managing Workbench instances instead of classic v1 notebook instances.

## Core Workflows

### Get One Instance By Resource Name

Use the full resource name, not only the short instance ID.

```javascript
const {v2} = require('@google-cloud/notebooks');

const client = new v2.NotebookServiceClient();

async function getWorkbenchInstance(projectId, location, instanceId) {
  const name = `projects/${projectId}/locations/${location}/instances/${instanceId}`;
  const [instance] = await client.getInstance({name});
  return instance;
}
```

### Start And Stop A Classic Instance

Mutating methods return a long-running operation. Wait for it before reading the resource again.

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.NotebookServiceClient();

async function restartClassicInstance(projectId, location, instanceId) {
  const name = `projects/${projectId}/locations/${location}/instances/${instanceId}`;

  const [stopOperation] = await client.stopInstance({name});
  await stopOperation.promise();

  const [startOperation] = await client.startInstance({name});
  await startOperation.promise();
}
```

### Create A Classic Instance

For classic `v1`, send `parent`, `instanceId`, and an `instance` object, then wait for the operation to finish.

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.NotebookServiceClient();

async function createClassicInstance(projectId, location) {
  const [operation] = await client.createInstance({
    parent: `projects/${projectId}/locations/${location}`,
    instanceId: 'my-notebook',
    instance: {
      vmImage: {
        imageName: 'tf-latest-cpu',
        project: 'deeplearning-platform-release',
      },
      machineType: 'e2-standard-4',
    },
  });

  const [instance] = await operation.promise();
  return instance;
}
```

If you are creating Workbench resources with `v2`, use the `v2.Instance` schema instead of reusing the classic `v1` instance shape.

### Read One Managed Runtime

Managed runtimes are a different resource type, so use `ManagedNotebookServiceClient` and a `/runtimes/` name.

```javascript
const {v1} = require('@google-cloud/notebooks');

const client = new v1.ManagedNotebookServiceClient();

async function getRuntime(projectId, location, runtimeId) {
  const name = `projects/${projectId}/locations/${location}/runtimes/${runtimeId}`;
  const [runtime] = await client.getRuntime({name});
  return runtime;
}
```

## Operations And Pagination

- Prefer async iterators such as `listInstancesAsync()` and `listRuntimesAsync()` so the client handles pagination for you.
- Create, delete, start, and stop calls are long-running operations. Call `await operation.promise()` before assuming the change completed.
- Use request objects for create and update flows. They are clearer than relying on positional or partially flattened arguments.
- Reuse client instances in long-lived processes instead of creating a new client for every request.

## Common Pitfalls

- The npm package is `@google-cloud/notebooks`, but the main clients live under versioned namespaces like `v1` and `v2`.
- Do not mix classic notebook instances, managed runtimes, and Workbench instances in the same request flow.
- `parent` is always `projects/{project}/locations/{location}`. Individual operations usually want a full `name`.
- Managed runtime resource names end in `/runtimes/{runtime}`; notebook instance resource names end in `/instances/{instance}`.
- Local Google Cloud auth for client libraries uses `gcloud auth application-default login`, not only `gcloud auth login`.
- Creation and lifecycle methods are asynchronous. If you skip `operation.promise()`, follow-up reads can race with the control plane.

## Version-Sensitive Notes

- This guide targets `@google-cloud/notebooks` `4.2.1`.
- The package includes multiple service surfaces under one npm package. Choose the namespace and client class first, then write resource-specific code around that surface.
- Workbench `v2` instance creation uses a different schema than classic `v1` instance creation, so do not copy a classic `instance` payload into `v2` code.

## Official Sources

- Node.js client reference root: `https://cloud.google.com/nodejs/docs/reference/notebooks/latest`
- Application Default Credentials overview: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- ADC search order: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/notebooks`
