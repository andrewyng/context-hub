---
name: dataproc
description: "Google Cloud Dataproc Node.js client for regional cluster management and job submission"
metadata:
  languages: "javascript"
  versions: "6.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,dataproc,spark,hadoop,javascript,nodejs"
---

# `@google-cloud/dataproc` JavaScript Package Guide

Use `@google-cloud/dataproc` when your Node.js code needs to create or inspect Dataproc clusters and submit jobs to an existing cluster.

## Golden Rule

- Use the official `@google-cloud/dataproc` package.
- Authenticate with Application Default Credentials (ADC), not an API key.
- Treat Dataproc as a regional API. Set `apiEndpoint` to the same region you pass in requests, for example `us-central1-dataproc.googleapis.com`.
- Put your Spark or PySpark entrypoint in Cloud Storage before submission. The client library does not upload local files for you.
- Wait for `operation.promise()` on mutating methods before assuming the resource is ready.

This guide covers `6.3.0`.

## Install

Pin the package version your project expects:

```bash
npm install @google-cloud/dataproc@6.3.0
```

## Authentication And Setup

This package uses Google Cloud credentials.

For local development with ADC:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable dataproc.googleapis.com

export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATAPROC_REGION="us-central1"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export DATAPROC_REGION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Typical prerequisites:

1. The target Google Cloud project already exists.
2. The Dataproc API is enabled in that project.
3. The calling identity can manage Dataproc resources and read any `gs://` paths referenced by jobs.

## Initialize The Clients

The package exposes multiple service clients under `v1`. The most common ones for cluster-backed workflows are `ClusterControllerClient` and `JobControllerClient`.

CommonJS:

```javascript
const {v1} = require('@google-cloud/dataproc');

function getDataprocEndpoint(region) {
  return `${region}-dataproc.googleapis.com`;
}

function createDataprocClients(region) {
  const clientOptions = {
    apiEndpoint: getDataprocEndpoint(region),
  };

  return {
    clusterClient: new v1.ClusterControllerClient(clientOptions),
    jobClient: new v1.JobControllerClient(clientOptions),
  };
}
```

ES modules:

```javascript
import {v1} from '@google-cloud/dataproc';

const clusterClient = new v1.ClusterControllerClient({
  apiEndpoint: 'us-central1-dataproc.googleapis.com',
});
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/dataproc');

const client = new v1.JobControllerClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  apiEndpoint: 'us-central1-dataproc.googleapis.com',
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Request Shape Notes

- Cluster and job methods commonly take `projectId` and `region` as top-level request fields.
- Cluster names such as `analytics-dev` are short IDs, not full resource names.
- Job payloads usually point at code or dependencies stored in Cloud Storage, for example `gs://your-bucket/jobs/main.py`.
- For resource names that are fully qualified, Dataproc uses the `projects/{project}/regions/{region}/...` pattern.

## Core Workflows

### List Existing Clusters

Use the regional endpoint that matches the `region` request field.

```javascript
const {v1} = require('@google-cloud/dataproc');

async function listClusters(projectId, region) {
  const client = new v1.ClusterControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
  });

  for await (const cluster of client.listClustersAsync({projectId, region})) {
    console.log(cluster.clusterName, cluster.status?.state);
  }
}
```

### Create A Cluster

Cluster creation is a long-running operation.

```javascript
const {v1} = require('@google-cloud/dataproc');

async function createCluster(projectId, region) {
  const client = new v1.ClusterControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
  });

  const cluster = {
    clusterName: 'analytics-dev',
    config: {
      gceClusterConfig: {
        zoneUri: 'us-central1-a',
      },
      masterConfig: {
        numInstances: 1,
        machineTypeUri: 'e2-standard-4',
      },
      workerConfig: {
        numInstances: 2,
        machineTypeUri: 'e2-standard-4',
      },
    },
  };

  const [operation] = await client.createCluster({
    projectId,
    region,
    cluster,
  });

  const [createdCluster] = await operation.promise();
  console.log(createdCluster.clusterUuid);
  return createdCluster;
}
```

### Submit A PySpark Job To An Existing Cluster

Use `JobControllerClient` after the target cluster is ready.

```javascript
const {v1} = require('@google-cloud/dataproc');

async function submitPySparkJob(projectId, region, clusterName) {
  const client = new v1.JobControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
  });

  const job = {
    placement: {
      clusterName,
    },
    pysparkJob: {
      mainPythonFileUri: 'gs://your-bucket/jobs/main.py',
      args: ['--date', '2026-03-13'],
    },
  };

  const [operation] = await client.submitJobAsOperation({
    projectId,
    region,
    job,
  });

  const [submittedJob] = await operation.promise();
  console.log(submittedJob.reference?.jobId);
  console.log(submittedJob.driverOutputResourceUri);
  return submittedJob;
}
```

Use `submitJob()` instead when you want the `Job` resource back immediately and plan to poll status yourself.

### Read Job Status

Fetch the job again with its `jobId` if you need to inspect state after submission.

```javascript
const {v1} = require('@google-cloud/dataproc');

async function getJob(projectId, region, jobId) {
  const client = new v1.JobControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
  });

  const [job] = await client.getJob({
    projectId,
    region,
    jobId,
  });

  console.log(job.status?.state);
  return job;
}
```

## Common Pitfalls

- Install and import are not the same shape. Install `@google-cloud/dataproc`, then import `{v1}` from the package.
- Do not mix regions. Keep `apiEndpoint`, `region`, cluster placement, and any zonal settings aligned.
- Do not pass local file paths such as `./main.py` in job definitions. Upload code to Cloud Storage first and use `gs://...` URIs.
- Create, update, and delete cluster calls are long-running operations. Wait for `operation.promise()` before using the resource.
- Job submission requires an existing cluster. Create the cluster and wait for completion before submitting work to it.
- Some configuration fields depend on the Dataproc image version, machine family, and region. If a field is accepted by the client but rejected by the API, re-check the Dataproc product docs for that runtime and region.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/dataproc/latest`
- Dataproc product documentation: `https://cloud.google.com/dataproc/docs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/application-default-credentials`
- npm package page: `https://www.npmjs.com/package/@google-cloud/dataproc`
