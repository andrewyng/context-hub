---
name: aiplatform
description: "Google Cloud Vertex AI Node.js client for managing Vertex AI resources and calling deployed prediction endpoints"
metadata:
  languages: "javascript"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,vertex-ai,aiplatform,prediction,ml,javascript,nodejs"
---

# `@google-cloud/aiplatform` JavaScript Package Guide

Use `@google-cloud/aiplatform` when your Node.js app needs Vertex AI control-plane clients such as endpoints and models, or when it needs to send online prediction requests to an already deployed Vertex AI endpoint.

This package is a generated Google Cloud client library. Most application code should start with the stable `v1` clients and only use `v1beta1` when the maintainer docs for the feature you need are explicitly beta-only.

## Golden Rule

- Use the `v1` namespace unless the official page for your target method is explicitly beta-only.
- Authenticate with Google Cloud Application Default Credentials (ADC), not API keys.
- Set the client `apiEndpoint` to the same region as your Vertex AI resources, for example `us-central1-aiplatform.googleapis.com`.
- Pass full Vertex AI resource names such as `projects/PROJECT_ID/locations/LOCATION/endpoints/ENDPOINT_ID`.
- Convert prediction payloads with `helpers.toValue(...)` before calling `predict()`.

This guide covers `6.5.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/aiplatform@6.5.0
```

## Authentication And Setup

Typical prerequisites:

1. A Google Cloud project with Vertex AI enabled.
2. Credentials with permission to read Vertex AI resources or call predictions.
3. A regional Vertex AI location such as `us-central1`.
4. An existing endpoint if your app is only sending predictions.

Enable the Vertex AI API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable aiplatform.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

If you must use a service account key file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Prefer attached service-account credentials on Google Cloud over shipping JSON key files.

## Initialize Clients

CommonJS:

```javascript
const {v1, helpers} = require('@google-cloud/aiplatform');

function getVertexApiEndpoint(location = 'us-central1') {
  return `${location}-aiplatform.googleapis.com`;
}

function createVertexClients(location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1') {
  const clientOptions = {
    apiEndpoint: getVertexApiEndpoint(location),
  };

  return {
    endpointClient: new v1.EndpointServiceClient(clientOptions),
    modelClient: new v1.ModelServiceClient(clientOptions),
    predictionClient: new v1.PredictionServiceClient(clientOptions),
    helpers,
  };
}
```

ES modules:

```javascript
import {v1, helpers} from '@google-cloud/aiplatform';

function getVertexApiEndpoint(location = 'us-central1') {
  return `${location}-aiplatform.googleapis.com`;
}

function createVertexClients(location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1') {
  const clientOptions = {
    apiEndpoint: getVertexApiEndpoint(location),
  };

  return {
    endpointClient: new v1.EndpointServiceClient(clientOptions),
    modelClient: new v1.ModelServiceClient(clientOptions),
    predictionClient: new v1.PredictionServiceClient(clientOptions),
    helpers,
  };
}
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/aiplatform');

const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const endpointClient = new v1.EndpointServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
});
```

## Core Workflows

### List Endpoints In A Region

Use the regional parent resource and async iteration so pagination stays simple:

```javascript
const {v1} = require('@google-cloud/aiplatform');

async function listEndpoints(projectId, location = 'us-central1') {
  const client = new v1.EndpointServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  const parent = `projects/${projectId}/locations/${location}`;
  const endpoints = [];

  for await (const endpoint of client.listEndpointsAsync({parent})) {
    endpoints.push({
      name: endpoint.name,
      displayName: endpoint.displayName,
    });
  }

  return endpoints;
}
```

Reuse the returned `name` field from this call instead of rebuilding endpoint resource names later.

### Read One Endpoint

`getEndpoint()` expects the full resource name:

```javascript
const {v1} = require('@google-cloud/aiplatform');

async function getEndpoint(endpointName, location = 'us-central1') {
  const client = new v1.EndpointServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  const [endpoint] = await client.getEndpoint({
    name: endpointName,
  });

  return endpoint;
}
```

Example endpoint name:

```text
projects/my-project/locations/us-central1/endpoints/1234567890123456789
```

### Send An Online Prediction Request

`predict()` sends requests to an existing deployed endpoint. Convert each instance and any parameters with `helpers.toValue(...)` so the request matches the protobuf `Value` fields used by the API.

```javascript
const {v1, helpers} = require('@google-cloud/aiplatform');

async function predictText(endpointName, text, location = 'us-central1') {
  const client = new v1.PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  const instances = [
    helpers.toValue({
      content: text,
    }),
  ];

  const [response] = await client.predict({
    endpoint: endpointName,
    instances,
  });

  return response.predictions;
}

predictText(
  'projects/my-project/locations/us-central1/endpoints/1234567890123456789',
  'This support experience was excellent.'
).then(predictions => {
  console.dir(predictions, {depth: null});
});
```

The instance shape is model-specific. The API will not infer the correct schema from the endpoint name alone.

If your deployed model expects additional prediction parameters, convert those too:

```javascript
const parameters = helpers.toValue({
  confidenceThreshold: 0.5,
  maxPredictions: 5,
});

const [response] = await client.predict({
  endpoint: endpointName,
  instances,
  parameters,
});
```

### List Models In A Region

Use `ModelServiceClient` when you need to inspect available models before choosing one to deploy or reference elsewhere.

```javascript
const {v1} = require('@google-cloud/aiplatform');

async function listModels(projectId, location = 'us-central1') {
  const client = new v1.ModelServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  const parent = `projects/${projectId}/locations/${location}`;
  const models = [];

  for await (const model of client.listModelsAsync({parent})) {
    models.push({
      name: model.name,
      displayName: model.displayName,
    });
  }

  return models;
}
```

## Practical Notes

- Vertex AI is regional. Keep `apiEndpoint`, resource names, storage, and any deployed endpoint IDs in the same region.
- Reuse client instances instead of creating a new gRPC client for every request.
- Reuse the resource `name` returned by the API instead of stitching strings together in multiple places.
- Many mutating Vertex AI methods return long-running operations. Wait for the returned operation before assuming the resource is ready.
- Start with `v1` unless the official method page you need is only documented in `v1beta1`.

## Common Pitfalls

- `gcloud auth login` is not enough for local Node.js code. Use `gcloud auth application-default login` so ADC works.
- Do not use API keys with this package. Use ADC, user credentials, or a service account.
- A bare endpoint ID is not enough for most requests. Pass the full endpoint resource name.
- A client pointed at `us-central1-aiplatform.googleapis.com` will not behave correctly if you pass a resource from another region.
- `predict()` does not take arbitrary plain JavaScript objects for protobuf `Value` fields. Convert request data with `helpers.toValue(...)`.
- Do not mix stable `v1` snippets with `v1beta1` snippets unless the maintainer docs for the exact feature say you should.

## Official Sources

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/aiplatform/latest`
- npm package page: `https://www.npmjs.com/package/@google-cloud/aiplatform`
- ADC setup for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Vertex AI sample index: `https://cloud.google.com/vertex-ai/docs/samples`
- Vertex AI locations: `https://cloud.google.com/vertex-ai/docs/general/locations`
