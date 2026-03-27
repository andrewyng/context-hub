---
name: compute
description: "Google Cloud Compute Engine Node.js client for listing, inspecting, and managing VM resources"
metadata:
  languages: "javascript"
  versions: "6.8.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-compute,gcp,google-cloud,compute-engine,vm,javascript,nodejs"
---

# `@google-cloud/compute` JavaScript Package Guide

Use `@google-cloud/compute` when your Node.js app needs to inspect or manage Compute Engine resources such as VM instances, images, networks, disks, and the operations returned by mutating calls.

This package is organized as resource-specific generated clients. For most instance workflows, use `v1.InstancesClient`, `v1.ImagesClient`, and the matching operations client for the resource scope.

This guide covers `6.8.0`.

## Install

```bash
npm install @google-cloud/compute@6.8.0
```

## Authentication And Setup

Typical prerequisites:

1. A Google Cloud project ID.
2. The Compute Engine API enabled for that project.
3. Credentials with permission to read or mutate the target Compute Engine resources.
4. The correct zone, region, or global scope for the API you are calling.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable compute.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with Application Default Credentials (ADC):

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ZONE="us-central1-a"
```

If you must use a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ZONE="us-central1-a"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## Initialize Clients

CommonJS:

```javascript
const {v1} = require('@google-cloud/compute');

const instancesClient = new v1.InstancesClient();
const imagesClient = new v1.ImagesClient();
const zoneOperationsClient = new v1.ZoneOperationsClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/compute';

const instancesClient = new v1.InstancesClient();
const imagesClient = new v1.ImagesClient();
const zoneOperationsClient = new v1.ZoneOperationsClient();
```

With explicit project ID and credential file:

```javascript
const {v1} = require('@google-cloud/compute');

const instancesClient = new v1.InstancesClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Use the client that matches the resource scope:

- `v1.InstancesClient` for zonal VM instance operations.
- `v1.ImagesClient` for image and image-family lookups.
- `v1.ZoneOperationsClient` for zonal operations returned by instance mutations.
- `v1.RegionOperationsClient` or `v1.GlobalOperationsClient` when the API you called returns a regional or global operation instead.

## Core Workflows

### List Instances In A Zone

Use the async iterator so the client handles pagination.

```javascript
const {v1} = require('@google-cloud/compute');

const client = new v1.InstancesClient();

async function listInstances(projectId, zone) {
  const instances = [];

  for await (const instance of client.listAsync({
    project: projectId,
    zone,
  })) {
    instances.push({
      name: instance.name,
      status: instance.status,
      machineType: instance.machineType,
    });
  }

  return instances;
}
```

### Get One Instance

```javascript
const {v1} = require('@google-cloud/compute');

const client = new v1.InstancesClient();

async function getInstance(projectId, zone, instanceName) {
  const [instance] = await client.get({
    project: projectId,
    zone,
    instance: instanceName,
  });

  return instance;
}
```

### Resolve An Image Family Before Creating A VM

Use an image family lookup instead of hard-coding a specific image self link.

```javascript
const {v1} = require('@google-cloud/compute');

const client = new v1.ImagesClient();

async function getDebianImage() {
  const [image] = await client.getFromFamily({
    project: 'debian-cloud',
    family: 'debian-12',
  });

  return image.selfLink;
}
```

### Wait For A Zonal Operation

Compute Engine mutation methods usually return an operation resource. Wait for it before assuming the change completed.

```javascript
const {v1} = require('@google-cloud/compute');

const operationsClient = new v1.ZoneOperationsClient();

async function waitForZonalOperation(projectId, zone, operationName) {
  while (true) {
    const [operation] = await operationsClient.wait({
      project: projectId,
      zone,
      operation: operationName,
    });

    const errors = operation.error?.errors ?? [];
    if (errors.length > 0) {
      throw new Error(
        errors.map(entry => entry.message || entry.code).join('; ')
      );
    }

    if (operation.status === 'DONE') {
      return operation;
    }

    operationName = operation.name;
  }
}
```

### Start Or Stop An Instance

```javascript
const {v1} = require('@google-cloud/compute');

const client = new v1.InstancesClient();

async function startInstance(projectId, zone, instanceName) {
  const [operation] = await client.start({
    project: projectId,
    zone,
    instance: instanceName,
  });

  return waitForZonalOperation(projectId, zone, operation.name);
}

async function stopInstance(projectId, zone, instanceName) {
  const [operation] = await client.stop({
    project: projectId,
    zone,
    instance: instanceName,
  });

  return waitForZonalOperation(projectId, zone, operation.name);
}
```

### Create A Small Debian VM

This is the minimal pattern for creating a VM from an image family lookup.

```javascript
const {v1} = require('@google-cloud/compute');

const imagesClient = new v1.ImagesClient();
const instancesClient = new v1.InstancesClient();

async function createInstance(projectId, zone, instanceName) {
  const [image] = await imagesClient.getFromFamily({
    project: 'debian-cloud',
    family: 'debian-12',
  });

  const [operation] = await instancesClient.insert({
    project: projectId,
    zone,
    instanceResource: {
      name: instanceName,
      machineType: `zones/${zone}/machineTypes/e2-micro`,
      disks: [
        {
          boot: true,
          autoDelete: true,
          initializeParams: {
            sourceImage: image.selfLink,
          },
        },
      ],
      networkInterfaces: [
        {
          name: 'global/networks/default',
        },
      ],
    },
  });

  return waitForZonalOperation(projectId, zone, operation.name);
}
```

### Delete An Instance

```javascript
const {v1} = require('@google-cloud/compute');

const client = new v1.InstancesClient();

async function deleteInstance(projectId, zone, instanceName) {
  const [operation] = await client.delete({
    project: projectId,
    zone,
    instance: instanceName,
  });

  return waitForZonalOperation(projectId, zone, operation.name);
}
```

## Practical Notes

- Prefer environment variables or app configuration for `project`, `zone`, and `region` instead of hard-coding them inside helpers.
- Use full Compute Engine resource paths where the API expects them, such as `zones/us-central1-a/machineTypes/e2-micro` and `global/networks/default`.
- Keep the operations client aligned with the resource scope. Instance methods return zonal operations, but other APIs may return regional or global operations.
- Create clients after `fork()` if your app uses child processes.

## Common Pitfalls

- `@google-cloud/compute` is the package name, but the code uses resource-specific clients from the `v1` namespace.
- Mutating methods such as `insert`, `delete`, `start`, and `stop` do not mean the resource is ready when the first promise resolves. Wait for the returned operation.
- A zone like `us-central1-a` is not interchangeable with a region like `us-central1`. Use the scope required by the method you are calling.
- Many request fields expect Compute Engine resource names, not shorthand values.
- If your code runs on Google Cloud, prefer attached service-account credentials through ADC instead of shipping JSON key files.

## Official Sources

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/compute/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/compute`
- ADC setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Compute Engine sample index: `https://cloud.google.com/compute/docs/samples`
