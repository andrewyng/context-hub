---
name: secret-manager
description: "Google Cloud Secret Manager Node.js client for creating secrets, adding versions, accessing payloads, and managing secret version state"
metadata:
  languages: "javascript"
  versions: "6.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,secret-manager,gcp,secrets,iam,javascript,nodejs"
---

# `@google-cloud/secret-manager` JavaScript Package Guide

Use `@google-cloud/secret-manager` in Node.js code that needs to create secrets, add immutable secret versions, read secret payloads, list secrets, and manage secret version state in Google Cloud Secret Manager.

## Golden Rule

- Import `SecretManagerServiceClient` from `@google-cloud/secret-manager`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass credentials explicitly.
- Secret values live in **secret versions**. Rotation means adding a new version, not editing an existing one.
- Use an explicit version number when rollout control matters. `latest` always resolves to the newest created version.
- Treat secret payloads as bytes and avoid logging plaintext secrets.
- For regional secrets, keep the resource name and `apiEndpoint` in the same region.

This guide covers `6.1.1`.

## Install

Pin the package version you want your app or agent to target:

```bash
npm install @google-cloud/secret-manager@6.1.1
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Enable the API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable secretmanager.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
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

Minimum setup:

1. Enable Secret Manager API in the target project.
2. Make sure the credential resolves to the principal you expect.
3. Grant the narrowest IAM role that matches the operation.

Common IAM roles:

- `roles/secretmanager.secretAccessor` for reading secret payloads
- `roles/secretmanager.secretVersionAdder` for adding versions to an existing secret
- `roles/secretmanager.secretVersionManager` for enabling, disabling, listing, and destroying versions
- `roles/secretmanager.admin` for creating and fully managing secrets

## Initialize The Client

CommonJS:

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();
```

ES modules:

```javascript
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
```

With explicit project ID and key file:

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Create A Secret

Create the secret container first. The secret value itself is stored in a secret version.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function createSecret(projectId, secretId) {
  const [secret] = await client.createSecret({
    parent: `projects/${projectId}`,
    secretId,
    secret: {
      replication: {
        automatic: {},
      },
    },
  });

  return secret.name;
}
```

Choose the replication policy deliberately when you create the secret.

### Add A Secret Version

Adding a version is the normal way to rotate a secret value.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function addSecretVersion(projectId, secretId, value) {
  const [version] = await client.addSecretVersion({
    parent: `projects/${projectId}/secrets/${secretId}`,
    payload: {
      data: Buffer.from(value, 'utf8'),
    },
  });

  return version.name;
}
```

### Access A Secret Version

Use a fixed version number when you need stable, reviewable configuration.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function accessSecretValue(projectId, secretId, versionId = 'latest') {
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/${versionId}`,
  });

  const data = version.payload && version.payload.data;
  if (!data) {
    throw new Error('Secret payload is empty');
  }

  return data.toString('utf8');
}
```

### Read Metadata Without Reading The Secret Value

Use metadata methods when you do not need the plaintext payload.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function getSecretMetadata(projectId, secretId) {
  const [secret] = await client.getSecret({
    name: `projects/${projectId}/secrets/${secretId}`,
  });

  return secret;
}

async function getSecretVersionMetadata(projectId, secretId, versionId) {
  const [version] = await client.getSecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/${versionId}`,
  });

  return version;
}
```

### List Secrets

Use the async iterator form when you want straightforward pagination.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function listSecretNames(projectId) {
  const names = [];

  for await (const secret of client.listSecretsAsync({
    parent: `projects/${projectId}`,
  })) {
    names.push(secret.name);
  }

  return names;
}
```

### Disable, Enable, Or Destroy A Secret Version

Disable a version to block reads without permanently deleting it.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function disableSecretVersion(projectId, secretId, versionId) {
  const [version] = await client.disableSecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/${versionId}`,
  });

  return version.name;
}

async function enableSecretVersion(projectId, secretId, versionId) {
  const [version] = await client.enableSecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/${versionId}`,
  });

  return version.name;
}

async function destroySecretVersion(projectId, secretId, versionId) {
  const [version] = await client.destroySecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/${versionId}`,
  });

  return version.name;
}
```

Use `destroySecretVersion` only when you intend permanent destruction.

## Regional Secrets And Endpoints

Regional secrets use location-qualified resource names and a regional API endpoint.

```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const location = 'us-east1';

const client = new SecretManagerServiceClient({
  apiEndpoint: `secretmanager.${location}.rep.googleapis.com`,
});

const secretName = `projects/my-project/locations/${location}/secrets/my-secret`;
const versionName = `${secretName}/versions/latest`;
```

Keep the resource-name format and the endpoint in sync. Mixing a regional endpoint with global resource names is a common cause of `NotFound` and routing errors.

## Common Pitfalls

- A valid credential is not enough if the principal lacks Secret Manager IAM permissions on the project or secret.
- `latest` points to the newest created version, not necessarily the exact version you intended to roll out.
- Secret payloads are bytes. Convert outbound values with `Buffer.from(...)` and decode reads with `toString('utf8')`.
- `accessSecretVersion` returns sensitive material. Prefer `getSecret` or `getSecretVersion` when you only need metadata.
- Rotation means `addSecretVersion`, not mutation of an existing version.
- Regional secrets require both regional resource names and the matching regional endpoint.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/secret-manager/latest`
- Secret Manager product docs: `https://cloud.google.com/secret-manager/docs`
- Secret Manager authentication docs: `https://cloud.google.com/secret-manager/docs/authentication`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Create secret sample: `https://cloud.google.com/secret-manager/docs/samples/secretmanager-create-secret`
- Add secret version sample: `https://cloud.google.com/secret-manager/docs/samples/secretmanager-add-secret-version`
- Access secret version sample: `https://cloud.google.com/secret-manager/docs/samples/secretmanager-access-secret-version`
- Regional secret sample: `https://cloud.google.com/secret-manager/docs/samples/secretmanager-create-regional-secret`
- npm package page: `https://www.npmjs.com/package/@google-cloud/secret-manager`
