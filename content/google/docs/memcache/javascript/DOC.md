---
name: memcache
description: "Google Cloud Memorystore for Memcached Node.js admin client for listing, creating, updating, and deleting Memcached instances"
metadata:
  languages: "javascript"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,memorystore,memcached,javascript,nodejs,admin-sdk"
---

# `@google-cloud/memcache` JavaScript Package Guide

Use `@google-cloud/memcache` when your Node.js code needs the Google Cloud Memorystore for Memcached control plane: list instances, inspect configuration, create an instance, update metadata, stage and apply Memcached parameter changes, reschedule maintenance, and delete an instance.

This package manages Memorystore resources. It is not the Memcached protocol client you use for key/value commands such as `get`, `set`, `delete`, `incr`, or CAS operations against the cache itself.

## Golden Rule

- Use `@google-cloud/memcache` for Memorystore administration, not Memcached data-plane traffic.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Build full resource names as `projects/{project}/locations/{region}` and `projects/{project}/locations/{region}/instances/{instance}`.
- Treat create, update, parameter, maintenance, and delete calls as long-running operations and wait for `operation.promise()`.
- Use a separate Memcached client package for application traffic after the instance exists.

This guide covers `4.2.1`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/memcache@4.2.1
```

If your app also needs to talk Memcached protocol to the running cache, install a separate Memcached client package too.

## Authentication And Setup

This package uses Google Cloud credentials.

Typical prerequisites:

1. A Google Cloud project.
2. The Memorystore for Memcached API enabled in that project.
3. A caller identity with permission to view or manage Memcached instances.
4. A VPC network ready for the instance.
5. Private services access configured for that network before you create the instance.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"

gcloud services enable memcache.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"
```

If you must use a service account key file explicitly:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

For production on Google Cloud, prefer an attached service account instead of shipping key files.

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/memcache';

const client = new v1.CloudMemcacheClient();
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Reuse client instances in long-lived processes instead of constructing a new client for every request.

## Resource Names

Use these resource formats consistently:

- Region parent: `projects/PROJECT_ID/locations/REGION`
- Instance name: `projects/PROJECT_ID/locations/REGION/instances/INSTANCE_ID`
- Network path for creation: `projects/PROJECT_ID/global/networks/NETWORK_NAME`

For listing across all available regions, Google documents `projects/PROJECT_ID/locations/-` as the `parent`.

## Core Workflows

### List Instances In A Region

Use the async iterator form so pagination stays automatic.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function listInstances(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  for await (const instance of client.listInstancesAsync({parent})) {
    console.log({
      name: instance.name,
      displayName: instance.displayName,
      state: instance.state,
      nodeCount: instance.nodeCount,
      discoveryEndpoint: instance.discoveryEndpoint,
    });
  }
}
```

To aggregate across every available region, use `projects/PROJECT_ID/locations/-` as `parent`.

### Get One Instance

Use the full resource name, not only the short instance ID.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function getInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;
  const [instance] = await client.getInstance({name});

  console.log({
    name: instance.name,
    displayName: instance.displayName,
    authorizedNetwork: instance.authorizedNetwork,
    discoveryEndpoint: instance.discoveryEndpoint,
    labels: instance.labels,
    maintenancePolicy: instance.maintenancePolicy,
    maintenanceSchedule: instance.maintenanceSchedule,
    memcacheNodes: instance.memcacheNodes,
    memcacheVersion: instance.memcacheVersion,
    nodeConfig: instance.nodeConfig,
    nodeCount: instance.nodeCount,
    state: instance.state,
  });

  return instance;
}
```

### Create A Basic Instance

`createInstance()` is a long-running operation. Wait for completion before using the instance.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function createInstance(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  const [operation] = await client.createInstance({
    parent,
    instanceId: 'cache-prod',
    instance: {
      displayName: 'Primary cache',
      authorizedNetwork: `projects/${projectId}/global/networks/default`,
      nodeCount: 3,
      nodeConfig: {
        cpuCount: 2,
        memorySizeMb: 4096,
      },
      labels: {
        env: 'prod',
      },
    },
  });

  const [instance] = await operation.promise();
  console.log(instance.name, instance.discoveryEndpoint);
  return instance;
}
```

Choose these fields deliberately during creation:

- `instanceId` must be 1 to 40 characters, use lowercase letters, numbers, and hyphens, start with a letter, and end with a letter or number.
- `authorizedNetwork` should point at the VPC network that will reach the cache.
- `nodeCount` and `nodeConfig` are required for provisioning.
- `labels` are useful for environment and ownership metadata.

### Update Instance Metadata

Use a field mask so you only change the fields you intend to change.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function renameInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.updateInstance({
    updateMask: {
      paths: ['display_name'],
    },
    instance: {
      name,
      displayName: 'Cache production',
    },
  });

  const [instance] = await operation.promise();
  return instance;
}
```

### Stage Memcached Parameter Changes

`updateParameters()` stages parameter changes. It does not apply them to the running nodes by itself.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function stageParameters(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.updateParameters({
    name,
    updateMask: {
      paths: ['params'],
    },
    parameters: {
      params: {
        'max-item-size': '1048576',
        lru_crawler: 'yes',
      },
    },
  });

  await operation.promise();
}
```

### Apply Staged Parameters

Apply the current staged parameter set when you are ready for the operational change.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function applyParameters(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.applyParameters({name});
  await operation.promise();
}
```

Applying updated parameters can flush cache data on affected nodes. Treat this as an operational change, not a harmless metadata edit.

### Reschedule Maintenance

Use `rescheduleMaintenance()` when you need to move a scheduled maintenance event.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function rescheduleMaintenance(projectId, region, instanceId) {
  const instance = `projects/${projectId}/locations/${region}/instances/${instanceId}`;
  const scheduleTime = new Date('2026-03-20T03:00:00Z');

  const [operation] = await client.rescheduleMaintenance({
    instance,
    rescheduleType: 'SPECIFIC_TIME',
    scheduleTime: {
      seconds: Math.floor(scheduleTime.getTime() / 1000),
    },
  });

  await operation.promise();
}
```

### Delete An Instance

Delete is also a long-running operation.

```javascript
const {v1} = require('@google-cloud/memcache');

const client = new v1.CloudMemcacheClient();

async function deleteInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.deleteInstance({name});
  await operation.promise();
}
```

## Using A Memcached Data Client

Use the admin SDK to provision the Memorystore instance and inspect connection details. Use a separate Memcached protocol client for actual cache operations.

Typical flow:

1. Create or inspect the instance with `@google-cloud/memcache`.
2. Read `instance.discoveryEndpoint` or the node addresses from `instance.memcacheNodes`.
3. Configure your Memcached client to connect to those endpoints.

If generated code starts calling `client.get()` or `client.set()` on `CloudMemcacheClient`, it is using the wrong API surface.

## Operations And Request Patterns

- List methods use async iterators such as `listInstancesAsync()` so the client can handle pagination.
- Unary reads like `getInstance()` return a tuple where the first element is the resource.
- Mutating methods such as `createInstance()`, `updateInstance()`, `updateParameters()`, `applyParameters()`, `rescheduleMaintenance()`, and `deleteInstance()` return long-running operations.
- Reuse client instances in long-lived processes instead of creating a new client for every request.
- Prefer explicit request objects with `parent`, `name`, `instanceId`, `instance`, `parameters`, `updateMask`, and maintenance fields rather than partially flattened arguments.

## Common Pitfalls

- The package is an admin SDK. It does not expose Memcached commands such as `get`, `set`, `delete`, or CAS operations.
- `parent` is `projects/{project}/locations/{region}`. Instance operations usually need a full `name` ending in `/instances/{instance}`.
- Do not assume an operation finished just because the initial method returned. Wait for `await operation.promise()`.
- `updateParameters()` stages config only; `applyParameters()` is the step that restarts affected nodes to pick up staged values.
- Applying parameter updates can flush cache contents on affected nodes.
- Instance creation can fail even with correct IAM if private services access is not configured on the selected VPC network.
- `authorizedNetwork` should be a full VPC resource path such as `projects/PROJECT_ID/global/networks/default`.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/memcache/latest`
- Memorystore for Memcached product docs: `https://cloud.google.com/memorystore/docs/memcached`
- Configure Memcached parameters: `https://cloud.google.com/memorystore/docs/memcached/configure-memcached`
- Connect to a Memcached instance: `https://cloud.google.com/memorystore/docs/memcached/establish-connection`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- ADC overview and search order: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/memcache`
