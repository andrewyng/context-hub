---
name: iam
description: "Google Cloud IAM Node.js client for service account admin, short-lived credentials, and deny policies"
metadata:
  languages: "javascript"
  versions: "2.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,iam,gcp,service-accounts,credentials,deny-policies,javascript,nodejs"
---

# `@google-cloud/iam` JavaScript Package Guide

Use `@google-cloud/iam` when your Node.js code needs to manage service accounts, mint short-lived credentials for service account impersonation, sign blobs or JWTs, or manage IAM deny policies.

## Golden Rule

- Import the generated clients from `@google-cloud/iam` version namespaces: `v1.IAMClient`, `v1.IAMCredentialsClient`, and `v2.PoliciesClient`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass a credential file directly.
- Prefer `IAMCredentialsClient` for access tokens, ID tokens, and signing flows instead of creating long-lived service account keys.
- Use the wildcard resource form `projects/-/serviceAccounts/<email-or-unique-id>` for IAM Credentials requests.
- For deny policies, URL-encode the attachment point and wait for the long-running operation to finish before assuming the policy exists.

This guide covers `2.3.1`.

## Install

Pin the package version your app or agent should target:

```bash
npm install @google-cloud/iam@2.3.1
```

## Authentication And Setup

This package uses Google Cloud credentials, not API keys.

Enable the APIs you plan to call:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com \
  --project "$GOOGLE_CLOUD_PROJECT"
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

Common role requirements depend on the workflow:

- `roles/iam.serviceAccountAdmin` for creating and managing service accounts
- `roles/iam.serviceAccountTokenCreator` on the target service account for `generateAccessToken`, `generateIdToken`, `signBlob`, and `signJwt`

## Initialize The Clients

CommonJS:

```javascript
const {v1, v2} = require('@google-cloud/iam');

const iamAdminClient = new v1.IAMClient();
const iamCredentialsClient = new v1.IAMCredentialsClient();
const policiesClient = new v2.PoliciesClient();
```

ES modules:

```javascript
import {v1, v2} from '@google-cloud/iam';

const iamAdminClient = new v1.IAMClient();
const iamCredentialsClient = new v1.IAMCredentialsClient();
const policiesClient = new v2.PoliciesClient();
```

With explicit project ID and credential file:

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Create A Service Account

Use `v1.IAMClient` for service account admin operations.

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMClient();

async function createServiceAccount(projectId, accountId) {
  const [serviceAccount] = await client.createServiceAccount({
    name: `projects/${projectId}`,
    accountId,
    serviceAccount: {
      displayName: 'Automation runner',
      description: 'Service account used by deployment jobs',
    },
  });

  return serviceAccount;
}
```

### List Service Accounts In A Project

Use the async iterator when you want the client to handle pagination for you.

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMClient();

async function listServiceAccounts(projectId) {
  const serviceAccounts = [];

  for await (const serviceAccount of client.listServiceAccountsAsync({
    name: `projects/${projectId}`,
  })) {
    serviceAccounts.push({
      name: serviceAccount.name,
      email: serviceAccount.email,
      disabled: serviceAccount.disabled,
    });
  }

  return serviceAccounts;
}
```

### Generate A Short-Lived Access Token

Use `IAMCredentialsClient` for impersonation flows. At least one OAuth scope is required.

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMCredentialsClient();

async function generateAccessToken(serviceAccountEmail) {
  const [response] = await client.generateAccessToken({
    name: `projects/-/serviceAccounts/${serviceAccountEmail}`,
    scope: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  return {
    accessToken: response.accessToken,
    expireTime: response.expireTime,
  };
}
```

### Generate An ID Token

Use this when a downstream service expects an OpenID Connect token for a specific audience.

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMCredentialsClient();

async function generateIdToken(serviceAccountEmail, audience) {
  const [response] = await client.generateIdToken({
    name: `projects/-/serviceAccounts/${serviceAccountEmail}`,
    audience,
    includeEmail: true,
  });

  return response.token;
}
```

### Sign A JWT

Use `signJwt` when you need the service account to sign a JWT payload without exporting a private key.

```javascript
const {v1} = require('@google-cloud/iam');

const client = new v1.IAMCredentialsClient();

async function signJwt(serviceAccountEmail) {
  const payload = JSON.stringify({
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    aud: 'https://example.com',
  });

  const [response] = await client.signJwt({
    name: `projects/-/serviceAccounts/${serviceAccountEmail}`,
    payload,
  });

  return response.signedJwt;
}
```

### Create A Deny Policy On A Project

Deny policies use the IAM v2 client and a URL-encoded attachment point.

```javascript
const {v2} = require('@google-cloud/iam');

const client = new v2.PoliciesClient();

async function createProjectDenyPolicy(projectId) {
  const attachmentPoint = encodeURIComponent(
    `cloudresourcemanager.googleapis.com/projects/${projectId}`
  );

  const [operation] = await client.createPolicy({
    parent: `policies/${attachmentPoint}/denypolicies`,
    policyId: 'deny-project-delete',
    policy: {
      displayName: 'Restrict project deletion',
      rules: [
        {
          denyRule: {
            deniedPrincipals: ['principalSet://goog/public:all'],
            deniedPermissions: [
              'cloudresourcemanager.googleapis.com/projects.delete',
            ],
            exceptionPrincipals: [
              `principal://iam.googleapis.com/projects/-/serviceAccounts/admin@${projectId}.iam.gserviceaccount.com`,
            ],
          },
        },
      ],
    },
  });

  const [policy] = await operation.promise();
  return policy.name;
}
```

### List Deny Policies Attached To A Project

```javascript
const {v2} = require('@google-cloud/iam');

const client = new v2.PoliciesClient();

async function listProjectDenyPolicies(projectId) {
  const attachmentPoint = encodeURIComponent(
    `cloudresourcemanager.googleapis.com/projects/${projectId}`
  );

  const policies = [];

  for await (const policy of client.listPoliciesAsync({
    parent: `policies/${attachmentPoint}/denypolicies`,
  })) {
    policies.push({
      name: policy.name,
      displayName: policy.displayName,
    });
  }

  return policies;
}
```

## Common Pitfalls

- `IAMClient` and `IAMCredentialsClient` solve different problems. Use `IAMClient` for service account admin, and `IAMCredentialsClient` for impersonation and signing.
- `generateAccessToken` requires at least one OAuth scope. An empty `scope` list fails.
- IAM Credentials resource names commonly use `projects/-/serviceAccounts/...`; do not replace `-` with a project ID unless the specific method documentation says to.
- Long-lived service account keys are not the default path. Prefer short-lived access tokens, ID tokens, or signing APIs when possible.
- Deny policy parents must use the encoded attachment-point format `policies/{attachment_point}/denypolicies`.
- Create, update, and delete deny policy operations are long-running operations. Wait for `operation.promise()` before using the result.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/iam/latest`
- IAM Admin client reference: `https://cloud.google.com/nodejs/docs/reference/iam/latest/iam-admin/v1.iamclient`
- IAM Credentials client reference: `https://cloud.google.com/nodejs/docs/reference/iam/latest/iam-credentials/v1.iamcredentialsclient`
- IAM v2 Policies client reference: `https://cloud.google.com/nodejs/docs/reference/iam/latest/iam-v2/policiesclient`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Create short-lived credentials: `https://cloud.google.com/iam/docs/create-short-lived-credentials-direct`
- Create deny policy sample: `https://cloud.google.com/iam/docs/samples/iam-create-deny-policy`
- npm package page: `https://www.npmjs.com/package/@google-cloud/iam`
