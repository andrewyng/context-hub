---
name: redis
description: "Google Cloud Memorystore for Redis Node.js admin client for listing, creating, updating, exporting, importing, and deleting Redis instances"
metadata:
  languages: "javascript"
  versions: "5.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,memorystore,redis,javascript,nodejs,admin-sdk"
---

# `@google-cloud/redis` JavaScript Package Guide

Use `@google-cloud/redis` when your Node.js code needs the Google Cloud Memorystore for Redis control plane: list instances, inspect configuration, create or update instances, export or import RDB files, retrieve the AUTH string, fail over a standard instance, and delete instances.

This package manages Memorystore resources. It is not the Redis protocol client you use for `GET`, `SET`, pub/sub, pipelines, or Lua commands against the Redis endpoint itself.

## Golden Rule

- Use `@google-cloud/redis` for Memorystore administration, not application data-plane commands.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Build full resource names as `projects/{project}/locations/{region}` and `projects/{project}/locations/{region}/instances/{instance}`.
- Treat create, update, export, import, failover, maintenance, upgrade, and delete calls as long-running operations and wait for `operation.promise()`.
- Use a separate Redis client package for application traffic to the running Redis endpoint.

This guide covers `5.2.1`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/redis@5.2.1
```

If your app also needs to talk Redis protocol to the instance endpoint, install a separate Redis client too:

```bash
npm install @google-cloud/redis@5.2.1 redis
```

## Authentication And Setup

This package uses Google Cloud credentials.

Typical prerequisites:

1. A Google Cloud project.
2. The Memorystore for Redis API enabled in that project.
3. A caller identity with permission to view or manage Redis instances in the target region.
4. A VPC network ready if you are creating private Redis instances.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_REGION="us-central1"

gcloud services enable redis.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
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
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/redis';

const client = new v1.CloudRedisClient();
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Build resource names once and reuse them:

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const region = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
const instanceId = 'cache-dev';

const parent = `projects/${projectId}/locations/${region}`;
const name = `${parent}/instances/${instanceId}`;
```

## Core Workflows

### List Instances In A Region

Use the async iterator for normal listing flows.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function listInstances(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  for await (const instance of client.listInstancesAsync({parent})) {
    console.log({
      name: instance.name,
      tier: instance.tier,
      host: instance.host,
      port: instance.port,
      state: instance.state,
      redisVersion: instance.redisVersion,
      readEndpoint: instance.readEndpoint || null,
      readEndpointPort: instance.readEndpointPort || null,
    });
  }
}
```

To aggregate across every available region, use `projects/PROJECT_ID/locations/-` as `parent`.

### Get One Instance

Use a full resource name, not only the short instance ID.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function getInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;
  const [instance] = await client.getInstance({name});

  console.log({
    name: instance.name,
    displayName: instance.displayName,
    host: instance.host,
    port: instance.port,
    memorySizeGb: instance.memorySizeGb,
    redisVersion: instance.redisVersion,
    authorizedNetwork: instance.authorizedNetwork,
    persistenceIamIdentity: instance.persistenceIamIdentity,
  });

  return instance;
}
```

### Create A Basic Instance

`createInstance()` is a long-running operation. Wait for completion before using the endpoint.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function createBasicInstance(projectId, region) {
  const parent = `projects/${projectId}/locations/${region}`;

  const [operation] = await client.createInstance({
    parent,
    instanceId: 'cache-dev',
    instance: {
      tier: 'BASIC',
      memorySizeGb: 1,
      authorizedNetwork: `projects/${projectId}/global/networks/default`,
      redisVersion: 'REDIS_7_0',
    },
  });

  const [instance] = await operation.promise();
  console.log(instance.name, instance.host, instance.port);
  return instance;
}
```

Common fields to choose deliberately during creation:

- `tier` such as `BASIC` or `STANDARD_HA`
- `memorySizeGb`
- `authorizedNetwork`
- `redisVersion`
- `connectMode`
- `transitEncryptionMode`
- `readReplicasMode`, `replicaCount`, and `secondaryIpRange` when you use read replicas

### Update An Instance With A Field Mask

Use an update mask so you only change the fields you intend to change.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function renameInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.updateInstance({
    updateMask: {
      paths: ['display_name'],
    },
    instance: {
      name,
      displayName: 'cache-dev-updated',
    },
  });

  const [instance] = await operation.promise();
  return instance;
}
```

### Export An Instance To Cloud Storage

Export uses a long-running operation and writes an RDB snapshot to Cloud Storage.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function exportInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.exportInstance({
    name,
    outputConfig: {
      gcsDestination: {
        uri: 'gs://my-backups/redis/cache-dev.rdb',
      },
    },
  });

  await operation.promise();
}
```

### Import An RDB Snapshot From Cloud Storage

Import replaces the instance contents with the imported snapshot.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function importInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.importInstance({
    name,
    inputConfig: {
      gcsSource: {
        uri: 'gs://my-backups/redis/cache-dev.rdb',
      },
    },
  });

  await operation.promise();
}
```

### Retrieve The AUTH String

If AUTH is enabled, fetch the current AUTH string from the admin API instead of assuming it is stored elsewhere.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function getAuthString(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;
  const [response] = await client.getInstanceAuthString({name});
  return response.authString;
}
```

### Delete An Instance

Delete is also a long-running operation.

```javascript
const {v1} = require('@google-cloud/redis');

const client = new v1.CloudRedisClient();

async function deleteInstance(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;

  const [operation] = await client.deleteInstance({name});
  await operation.promise();
}
```

## Using A Redis Data Client

Use the admin SDK to discover the endpoint and configuration. Use a separate Redis client package for actual Redis commands.

```javascript
const {createClient} = require('redis');
const {v1} = require('@google-cloud/redis');

const admin = new v1.CloudRedisClient();

async function connectForCommands(projectId, region, instanceId) {
  const name = `projects/${projectId}/locations/${region}/instances/${instanceId}`;
  const [instance] = await admin.getInstance({name});

  const redis = createClient({
    socket: {
      host: instance.host,
      port: instance.port,
    },
  });

  await redis.connect();
  console.log(await redis.ping());
  return redis;
}
```

If you enable AUTH or TLS on the Memorystore instance, configure the Redis protocol client to match that instance before connecting.

## Operations And Request Patterns

- List methods expose async iterators such as `listInstancesAsync()` so the client can handle pagination for you.
- Unary reads like `getInstance()` return a tuple where the first element is the resource.
- Mutating methods such as `createInstance()`, `updateInstance()`, `exportInstance()`, `importInstance()`, and `deleteInstance()` return long-running operations.
- Reuse client instances in long-lived processes instead of creating a new client for every request.
- Use request objects with `parent`, `name`, `instanceId`, `instance`, and `updateMask` rather than assembling partially flattened arguments.

Other important instance admin methods on this client include `failoverInstance()`, `rescheduleMaintenance()`, and `upgradeInstance()`. Treat them the same way: send a request object and wait for `operation.promise()`.

## Common Pitfalls

- The package is an admin SDK. It does not expose Redis commands like `get`, `set`, or pipelines.
- `parent` is always `projects/{project}/locations/{region}`. Instance operations usually need a full `name` ending in `/instances/{instance}`.
- Do not assume an operation finished just because the initial method returned. Wait for `await operation.promise()`.
- Use an explicit field mask for `updateInstance()` or you risk sending an incomplete update.
- `authorizedNetwork` must be a full VPC resource path such as `projects/PROJECT_ID/global/networks/default`.
- Export and import require Cloud Storage access in addition to Memorystore permissions. Check `instance.persistenceIamIdentity` when troubleshooting bucket permissions.
- `readEndpoint` is a read-only endpoint for eligible standard-tier topologies. Writes still go to the primary `host` and `port`.
- If you aggregate listings with `projects/PROJECT_ID/locations/-`, the response can include unreachable regions. Handle that in operational tooling.

## Version-Sensitive Notes

- This guide targets `@google-cloud/redis` `5.2.1`.
- The package is the Node.js admin client for the Memorystore control plane. Keep application Redis traffic in a separate Redis client package.
- Current Memorystore instance fields include Redis 7.x-compatible values such as `REDIS_7_0` and `REDIS_7_2`; choose the version explicitly when you provision new instances.

## Official Sources

- Node.js client reference root: `https://cloud.google.com/nodejs/docs/reference/redis/latest`
- Memorystore for Redis product docs: `https://cloud.google.com/memorystore/docs/redis`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- ADC search order and overview: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/redis`
