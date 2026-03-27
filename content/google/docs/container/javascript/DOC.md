---
name: container
description: "Google Kubernetes Engine Node.js client guide with ADC setup, ClusterManagerClient usage, operation polling, and resource-name pitfalls"
metadata:
  languages: "javascript"
  versions: "6.7.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gke,kubernetes,container,gcp,adc,javascript,nodejs"
---

# `@google-cloud/container` JavaScript Package Guide

Use `@google-cloud/container` when your Node.js code needs to call the Google Kubernetes Engine control-plane API to list, inspect, create, update, or delete clusters and related resources such as node pools.

Do not use this package for normal Kubernetes object access inside a cluster. For Pods, Deployments, Services, and other Kubernetes resources, get cluster credentials first and then use `kubectl` or a Kubernetes client library.

## Golden Rule

- Import the generated client from the `v1` namespace for stable automation.
- Authenticate with Application Default Credentials (ADC), not API keys.
- Pass fully qualified resource names like `projects/PROJECT_ID/locations/LOCATION`.
- Treat cluster create, update, and delete calls as asynchronous operations and poll `getOperation`.
- Use a separate Kubernetes client after you need to manage workload objects inside the cluster.

This guide covers `6.7.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/container@6.7.0
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Enable the Kubernetes Engine API in the project that will call the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable container.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

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
2. The Kubernetes Engine API is enabled.
3. The caller has permission to manage GKE clusters in the target project.

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/container';

const client = new v1.ClusterManagerClient();
```

With explicit project ID and service account file:

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Resource Names

Build resource names explicitly in new code:

- parent location: `projects/PROJECT_ID/locations/LOCATION`
- cluster name: `projects/PROJECT_ID/locations/LOCATION/clusters/CLUSTER_ID`
- operation name: `projects/PROJECT_ID/locations/LOCATION/operations/OPERATION_ID`

`LOCATION` can be a region such as `us-central1` or a zone such as `us-central1-a`, depending on whether the cluster is regional or zonal.

Prefer `parent` and `name` request fields over older request shapes that pass `projectId`, `zone`, or `clusterId` separately.

## Core Workflows

### List Clusters In A Location

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function listClusters(projectId, location) {
  const parent = `projects/${projectId}/locations/${location}`;
  const [response] = await client.listClusters({parent});
  return response.clusters ?? [];
}

async function main() {
  const clusters = await listClusters('my-project', 'us-central1');

  for (const cluster of clusters) {
    console.log(cluster.name, cluster.endpoint);
  }
}

main().catch(console.error);
```

### Get One Cluster

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function getCluster(projectId, location, clusterId) {
  const name = `projects/${projectId}/locations/${location}/clusters/${clusterId}`;
  const [cluster] = await client.getCluster({name});
  return cluster;
}

async function main() {
  const cluster = await getCluster('my-project', 'us-central1', 'primary');
  console.log(cluster.name);
  console.log(cluster.endpoint);
  console.log(cluster.currentMasterVersion);
}

main().catch(console.error);
```

### Inspect Available Control-Plane Versions

Use `getServerConfig` before hard-coding a Kubernetes version into automation:

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function getServerConfig(projectId, location) {
  const [config] = await client.getServerConfig({
    name: `projects/${projectId}/locations/${location}`,
  });

  return config;
}

async function main() {
  const config = await getServerConfig('my-project', 'us-central1');
  console.log(config.defaultClusterVersion);
  console.log((config.validMasterVersions ?? []).slice(0, 5));
}

main().catch(console.error);
```

### Create A Cluster

`createCluster` returns a GKE operation resource. It does not block until the cluster is ready.

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function createCluster(projectId, location, clusterId) {
  const parent = `projects/${projectId}/locations/${location}`;

  const [operation] = await client.createCluster({
    parent,
    cluster: {
      name: clusterId,
      initialNodeCount: 1,
      nodeConfig: {
        machineType: 'e2-standard-4',
      },
    },
  });

  return operation.name;
}
```

Real production clusters usually need more configuration than this minimal request, such as networking, release channels, workload identity, autoscaling, or private-cluster settings.

### Poll A Returned Operation

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function waitForOperation(operationName, pollMs = 10000) {
  while (true) {
    const [operation] = await client.getOperation({name: operationName});
    const done = operation.status === 'DONE' || operation.status === 3;

    if (done) {
      return operation;
    }

    await new Promise(resolve => setTimeout(resolve, pollMs));
  }
}
```

Store the `operation.name` returned by `createCluster`, `updateCluster`, `deleteCluster`, or node-pool methods, then poll it until the status is done.

### Delete A Cluster

```javascript
const {v1} = require('@google-cloud/container');

const client = new v1.ClusterManagerClient();

async function deleteCluster(projectId, location, clusterId) {
  const name = `projects/${projectId}/locations/${location}/clusters/${clusterId}`;
  const [operation] = await client.deleteCluster({name});
  return operation.name;
}
```

## Access The Kubernetes API After Control-Plane Calls

After the cluster exists, use `gcloud` to fetch credentials for `kubectl` or a Kubernetes client:

```bash
gcloud container clusters get-credentials my-cluster \
  --location us-central1 \
  --project my-project-id
```

This package manages GKE resources through Google Cloud APIs. It does not replace a Kubernetes client for in-cluster workload resources.

## Common Pitfalls

- Confusing GKE control-plane calls with Kubernetes API calls for workload objects.
- Mixing regional and zonal locations when building resource names.
- Assuming `createCluster` or `deleteCluster` completes before the returned operation finishes.
- Copying older examples that use deprecated `projectId`, `zone`, or `clusterId` request fields.
- Hard-coding cluster versions instead of checking `getServerConfig` first.
- Reaching for beta namespaces before confirming that the GA `v1` client is missing a required field.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/container/latest`
- Authentication with ADC: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- GKE REST reference: `https://cloud.google.com/kubernetes-engine/docs/reference/rest`
- Cluster access with `kubectl`: `https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl`
- npm package page: `https://www.npmjs.com/package/@google-cloud/container`
