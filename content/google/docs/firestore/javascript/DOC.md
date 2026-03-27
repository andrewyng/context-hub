---
name: firestore
description: "Google Cloud Firestore Node.js client for document reads, queries, transactions, batched writes, and emulator-backed local development"
metadata:
  languages: "javascript"
  versions: "8.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,firestore,gcp,nosql,database,javascript,nodejs"
---

# Google Cloud Firestore Node.js Client

## Golden Rule

Use the official `@google-cloud/firestore` server SDK with Google Cloud authentication.

Prefer Application Default Credentials (ADC) for local development and deployed workloads. Use a service account key file only when ADC or workload identity is not available.

Use this package for server-side Node.js code. Do not copy Firebase Web SDK setup into backend code that uses `@google-cloud/firestore`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/firestore@8.3.0
```

If your project does not already have Firestore enabled, create the Firestore database for the target Google Cloud project before debugging client code.

## Authentication And Project Setup

For local development, sign in with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

For service-account-based environments, point `GOOGLE_APPLICATION_CREDENTIALS` at the JSON key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

## Initialize A Client

Import the package as:

```javascript
const {Firestore, FieldValue} = require('@google-cloud/firestore');
```

Basic client:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

If the environment already provides project and credentials, `new Firestore()` is usually enough:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();
```

With an explicit key file:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: 'your-project-id',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Pass `projectId` explicitly when your shell, local tooling, or CI environment makes project discovery ambiguous.

## Create And Update Documents

Create or replace a document with `set()`:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();
const cityRef = db.collection('cities').doc('SF');

async function createCity() {
  await cityRef.set({
    name: 'San Francisco',
    state: 'CA',
    country: 'USA',
    capital: false,
    population: 860000,
  });
}

createCity().catch(console.error);
```

Merge a partial update into an existing document with `set(..., {merge: true})`:

```javascript
async function mergeCityFields() {
  await cityRef.set(
    {
      nickname: 'SF',
      regions: ['west_coast', 'norcal'],
    },
    {merge: true}
  );
}
```

Add a document with an auto-generated ID:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();

async function addCity() {
  const docRef = await db.collection('cities').add({
    name: 'Los Angeles',
    state: 'CA',
    country: 'USA',
  });

  console.log(docRef.id);
}

addCity().catch(console.error);
```

Use sentinel values such as `increment()`, `serverTimestamp()`, and `arrayUnion()` in updates:

```javascript
const {Firestore, FieldValue} = require('@google-cloud/firestore');

const db = new Firestore();
const cityRef = db.collection('cities').doc('SF');

async function updateCity() {
  await cityRef.update({
    population: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
    tags: FieldValue.arrayUnion('coastal'),
  });
}

updateCity().catch(console.error);
```

## Read Documents And Run Queries

Fetch a single document:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();

async function readCity() {
  const snapshot = await db.collection('cities').doc('SF').get();

  if (!snapshot.exists) {
    console.log('Document not found');
    return;
  }

  console.log(snapshot.id, snapshot.data());
}

readCity().catch(console.error);
```

Run a simple query and iterate the results:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();

async function listCaliforniaCities() {
  const snapshot = await db
    .collection('cities')
    .where('state', '==', 'CA')
    .orderBy('population', 'desc')
    .limit(10)
    .get();

  for (const doc of snapshot.docs) {
    console.log(doc.id, doc.data());
  }
}

listCaliforniaCities().catch(console.error);
```

Query a collection group when the same subcollection exists under many parents:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();

async function listMuseums() {
  const snapshot = await db
    .collectionGroup('landmarks')
    .where('type', '==', 'museum')
    .get();

  for (const doc of snapshot.docs) {
    console.log(doc.ref.path, doc.data());
  }
}

listMuseums().catch(console.error);
```

## Transactions

Use a transaction for read-modify-write logic that must commit atomically:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore();
const cityRef = db.collection('cities').doc('SF');

async function incrementPopulation() {
  const nextPopulation = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(cityRef);

    if (!snapshot.exists) {
      throw new Error('City document does not exist');
    }

    const current = snapshot.get('population') || 0;
    const updated = current + 1;

    transaction.update(cityRef, {population: updated});
    return updated;
  });

  console.log(nextPopulation);
}

incrementPopulation().catch(console.error);
```

## Batched Writes

Use a batch when you need multiple writes committed together and the write set does not depend on reading documents inside the same operation:

```javascript
const {Firestore, FieldValue} = require('@google-cloud/firestore');

const db = new Firestore();

async function commitBatch() {
  const batch = db.batch();
  const sfRef = db.collection('cities').doc('SF');
  const nycRef = db.collection('cities').doc('NYC');
  const laRef = db.collection('cities').doc('LA');

  batch.set(sfRef, {name: 'San Francisco'}, {merge: true});
  batch.update(nycRef, {population: FieldValue.increment(1)});
  batch.delete(laRef);

  await batch.commit();
}

commitBatch().catch(console.error);
```

## BulkWriter For High-Volume Non-Transactional Writes

Use `bulkWriter()` when throughput matters more than atomic multi-document behavior:

```javascript
const {Firestore, FieldValue} = require('@google-cloud/firestore');

const db = new Firestore();

async function writeManyDocuments() {
  const bulkWriter = db.bulkWriter();
  const sfRef = db.collection('cities').doc('SF');
  const nycRef = db.collection('cities').doc('NYC');

  bulkWriter.set(sfRef, {name: 'San Francisco'}, {merge: true});
  bulkWriter.update(nycRef, {population: FieldValue.increment(1)});

  await bulkWriter.close();
}

writeManyDocuments().catch(console.error);
```

## Emulator Setup

Start the Firestore emulator with the Google Cloud CLI:

```bash
gcloud emulators firestore start --host-port=127.0.0.1:8080
```

In the shell where you run your app or tests, point the client at the emulator:

```bash
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
export GOOGLE_CLOUD_PROJECT="demo-project"
```

Then initialize the client normally:

```javascript
const {Firestore} = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'demo-project',
});
```

The emulator is useful for local integration tests, but it does not replace production checks for indexes, quotas, IAM, or other managed-service behavior.

## Configuration Notes

- Pass `projectId` explicitly when your environment is ambiguous.
- Use `set(..., {merge: true})` for partial upserts. Use `update()` only when the document must already exist.
- Use a transaction for read-modify-write logic.
- Use a batch for grouped writes that do not depend on reads.
- Use `bulkWriter()` for high-throughput writes when atomicity is not required.
- Keep emulator environment variables out of production shells and CI jobs.

## Common Pitfalls

- Do not use API keys or custom auth headers. Use ADC, user credentials, or a service account.
- Do not confuse `collection()` and `doc()` handles with network reads. Firestore only fetches data when you call methods like `get()`.
- Do not call `update()` on a document that may not exist.
- Do not treat a write batch as a transaction.
- Do not treat `BulkWriter` as atomic.
- Compound and ordered queries can require composite indexes. Follow the index creation link in the Firestore error message when a query fails.
- Keep emulator-only configuration out of production environments.

## Version-Sensitive Notes

- This guide targets `@google-cloud/firestore` `8.3.0`.
- Prefer the current Node.js client reference and Firestore sample code when older articles show legacy client patterns or Firebase-specific setup.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest`
- `Firestore` class reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/firestore`
- `Query` class reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/query`
- `DocumentReference` class reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/documentreference`
- `WriteBatch` class reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/writebatch`
- `BulkWriter` class reference: `https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/bulkwriter`
- Firestore code samples index: `https://cloud.google.com/firestore/docs/samples`
- Authentication guide: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Firestore emulator guide: `https://cloud.google.com/firestore/native/docs/emulator`
- npm package: `https://www.npmjs.com/package/@google-cloud/firestore`
