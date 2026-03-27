---
name: kms
description: "Google Cloud KMS Node.js client for key rings, crypto keys, IAM-aware setup, and symmetric encrypt/decrypt workflows"
metadata:
  languages: "javascript"
  versions: "5.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,kms,cloud-kms,encryption,gcp,javascript,nodejs,adc"
---

# `@google-cloud/kms` JavaScript Package Guide

Use `@google-cloud/kms` when your Node.js code needs to create key rings, create crypto keys, inspect key metadata and versions, and encrypt or decrypt application data with Google Cloud KMS.

## Golden Rule

- Import `KeyManagementServiceClient` from `@google-cloud/kms`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass a credential file directly.
- Most methods expect fully qualified resource names, not short IDs.
- `encrypt()` and `decrypt()` are for symmetric keys whose purpose is `ENCRYPT_DECRYPT`.
- Treat ciphertext as bytes. Base64-encode it yourself before storing it in JSON, text columns, or message payloads.

This guide covers `5.4.0`.

## Install

Pin the package version your app or agent should target:

```bash
npm install @google-cloud/kms@5.4.0
```

## Authentication And Setup

This package uses Google Cloud credentials, not API keys.

Enable the Cloud KMS API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable cloudkms.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_CLOUD_KMS_KEY_RING="app-secrets"
export GOOGLE_CLOUD_KMS_KEY="primary"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
export GOOGLE_CLOUD_KMS_KEY_RING="app-secrets"
export GOOGLE_CLOUD_KMS_KEY="primary"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Typical permissions:

- symmetric encrypt/decrypt: `roles/cloudkms.cryptoKeyEncrypterDecrypter`
- metadata reads and listings: `roles/cloudkms.viewer`
- key and key ring administration: `roles/cloudkms.admin` or narrower resource-specific roles

## Initialize The Client

CommonJS:

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();
```

ES modules:

```javascript
import {KeyManagementServiceClient} from '@google-cloud/kms';

const client = new KeyManagementServiceClient();
```

With explicit project ID and credential file:

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Resource Names

Cloud KMS methods expect fully qualified resource names.

Common patterns:

- location parent: `projects/{project}/locations/{location}`
- key ring: `projects/{project}/locations/{location}/keyRings/{keyRing}`
- crypto key: `projects/{project}/locations/{location}/keyRings/{keyRing}/cryptoKeys/{cryptoKey}`
- crypto key version: `projects/{project}/locations/{location}/keyRings/{keyRing}/cryptoKeys/{cryptoKey}/cryptoKeyVersions/{version}`

Prefer the path helpers on the client instead of building deep paths manually:

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

const keyRingName = client.keyRingPath('my-project', 'us-central1', 'app-secrets');
const cryptoKeyName = client.cryptoKeyPath(
  'my-project',
  'us-central1',
  'app-secrets',
  'primary'
);
```

## Core Workflows

### Create A Key Ring

Key rings are location-scoped containers for crypto keys.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function createKeyRing(projectId, locationId, keyRingId) {
  const parent = client.locationPath(projectId, locationId);

  const [keyRing] = await client.createKeyRing({
    parent,
    keyRingId,
    keyRing: {},
  });

  return keyRing;
}

createKeyRing('my-project', 'us-central1', 'app-secrets').catch(console.error);
```

### Create A Symmetric Crypto Key

Use `ENCRYPT_DECRYPT` with `GOOGLE_SYMMETRIC_ENCRYPTION` for standard symmetric encryption workflows.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function createCryptoKey(projectId, locationId, keyRingId, cryptoKeyId) {
  const parent = client.keyRingPath(projectId, locationId, keyRingId);

  const [cryptoKey] = await client.createCryptoKey({
    parent,
    cryptoKeyId,
    cryptoKey: {
      purpose: 'ENCRYPT_DECRYPT',
      versionTemplate: {
        algorithm: 'GOOGLE_SYMMETRIC_ENCRYPTION',
      },
    },
  });

  return cryptoKey;
}

createCryptoKey('my-project', 'us-central1', 'app-secrets', 'primary').catch(
  console.error
);
```

For production keys, add rotation policy, labels, protection level, import settings, or HSM and EKM configuration deliberately instead of copying a minimal example unchanged.

### Encrypt Data With A Symmetric Key

`encrypt()` expects the crypto key resource name, not a crypto key version name.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function encryptText(projectId, locationId, keyRingId, cryptoKeyId, text) {
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  const [response] = await client.encrypt({
    name,
    plaintext: Buffer.from(text, 'utf8'),
  });

  return response.ciphertext.toString('base64');
}

encryptText('my-project', 'us-central1', 'app-secrets', 'primary', 'secret payload')
  .then(console.log)
  .catch(console.error);
```

### Decrypt Data

If you serialized ciphertext to text, convert it back to bytes before calling `decrypt()`.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function decryptText(
  projectId,
  locationId,
  keyRingId,
  cryptoKeyId,
  ciphertextBase64
) {
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  const [response] = await client.decrypt({
    name,
    ciphertext: Buffer.from(ciphertextBase64, 'base64'),
  });

  return response.plaintext.toString('utf8');
}

decryptText(
  'my-project',
  'us-central1',
  'app-secrets',
  'primary',
  process.env.CIPHERTEXT_BASE64
)
  .then(console.log)
  .catch(console.error);
```

### Inspect One Crypto Key

Use this to confirm the key name, purpose, and current primary version.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function getCryptoKey(projectId, locationId, keyRingId, cryptoKeyId) {
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  const [cryptoKey] = await client.getCryptoKey({name});

  return {
    name: cryptoKey.name,
    purpose: cryptoKey.purpose,
    primaryVersion: cryptoKey.primary?.name,
  };
}

getCryptoKey('my-project', 'us-central1', 'app-secrets', 'primary')
  .then(console.log)
  .catch(console.error);
```

### List Crypto Key Versions

Use this when troubleshooting disabled, pending-destruction, or destroyed versions.

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function listCryptoKeyVersions(projectId, locationId, keyRingId, cryptoKeyId) {
  const parent = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  const [versions] = await client.listCryptoKeyVersions({parent});

  return versions.map((version) => ({
    name: version.name,
    state: version.state,
  }));
}

listCryptoKeyVersions('my-project', 'us-central1', 'app-secrets', 'primary')
  .then(console.log)
  .catch(console.error);
```

### List Key Rings In A Location

```javascript
const {KeyManagementServiceClient} = require('@google-cloud/kms');

const client = new KeyManagementServiceClient();

async function listKeyRings(projectId, locationId) {
  const parent = client.locationPath(projectId, locationId);
  const [keyRings] = await client.listKeyRings({parent});

  return keyRings.map((keyRing) => keyRing.name);
}

listKeyRings('my-project', 'us-central1').then(console.log).catch(console.error);
```

## Configuration Notes

- Prefer ADC from the runtime environment over distributing service account JSON files.
- Prefer path helpers such as `locationPath()`, `keyRingPath()`, and `cryptoKeyPath()` over hand-built strings.
- Add rotation, HSM, EKM, labels, and import settings intentionally. The minimal examples here create software-backed defaults unless you specify otherwise.
- The API also supports CRC32C integrity fields on encrypt and decrypt requests and responses. Use them when request or response integrity matters.

## Common Pitfalls

- The package name is `@google-cloud/kms`, and the main client for common workflows is `KeyManagementServiceClient`.
- `encrypt()` and `decrypt()` are for symmetric keys. Asymmetric workflows use different operations such as signing, asymmetric decrypt, and public-key retrieval.
- Most methods require full resource names, not just the key ring ID or crypto key ID.
- `PermissionDenied`, `NotFound`, and `FailedPrecondition` often mean IAM, API enablement, key state, or location mismatches rather than a bad client call.
- Disabled or destroyed key versions cannot be used for new cryptographic operations.
- The maintainer reference URL uses `latest`, so confirm release-specific behavior against the installed package when you depend on something very recent.

## Version-Sensitive Notes For `5.4.0`

- This guide targets `@google-cloud/kms` version `5.4.0`.
- The maintainer Node.js reference is a rolling `latest` URL rather than a frozen `5.4.0` snapshot.
- If you need release-specific behavior, verify it against the installed package and the package release history before depending on it.

## Official Sources

- Node.js package reference: `https://cloud.google.com/nodejs/docs/reference/kms/latest`
- Cloud KMS product docs: `https://cloud.google.com/kms/docs`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- npm package page: `https://www.npmjs.com/package/@google-cloud/kms`
- Package source: `https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-kms`
