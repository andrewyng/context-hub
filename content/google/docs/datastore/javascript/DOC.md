---
name: datastore
description: "Google Cloud Datastore Node.js client for entities, keys, queries, transactions, and emulator-based local development"
metadata:
  languages: "javascript"
  versions: "10.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,datastore,firestore-datastore-mode,nosql,query,transaction"
---

# Google Cloud Datastore Node.js Client

## Golden Rule

Use the official `@google-cloud/datastore` package and import it as:

```javascript
const {Datastore, PropertyFilter} = require('@google-cloud/datastore');
```

or:

```javascript
import {Datastore, PropertyFilter} from '@google-cloud/datastore';
```

Authenticate with Application Default Credentials (ADC), not API keys. This guide targets `@google-cloud/datastore` `10.1.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/datastore@10.1.0
```

If this is a fresh Google Cloud project, make sure Datastore mode is enabled for the project before debugging client code.

## Authentication And Project Setup

For local development, sign in with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
```

For service-account-based environments, point `GOOGLE_APPLICATION_CREDENTIALS` at the JSON key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

## Initialize A Client

Basic client:

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

With an explicit key file:

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore({
  projectId: 'your-gcp-project',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If `projectId` is omitted, the client usually discovers it from ADC or the environment.

## Create And Save Entities

Use `datastore.key()` to build a key, then call `save()` with `{key, data}`:

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

async function createTask() {
  const taskKey = datastore.key(['Task', 'sample-task']);

  const entity = {
    key: taskKey,
    data: {
      title: 'Ship docs',
      done: false,
      createdAt: new Date(),
      description: 'Write the public package guide',
    },
    excludeFromIndexes: ['description'],
  };

  await datastore.save(entity);
}

createTask().catch(console.error);
```

`save()` is the simplest create-or-update path. If you need stricter semantics, use `insert()` when the entity must not already exist or `update()` when it must already exist.

## Fetch, Update, And Delete Entities

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

async function updateTask() {
  const taskKey = datastore.key(['Task', 'sample-task']);
  const [task] = await datastore.get(taskKey);

  if (!task) {
    return;
  }

  task.done = true;
  await datastore.save(task);
}

async function deleteTask() {
  const taskKey = datastore.key(['Task', 'sample-task']);
  await datastore.delete(taskKey);
}
```

For bulk reads and writes, pass arrays to `get()`, `save()`, or `delete()` instead of looping one network call at a time.

## Query Entities

Use `createQuery()` and `PropertyFilter` for property predicates:

```javascript
const {Datastore, PropertyFilter} = require('@google-cloud/datastore');

const datastore = new Datastore();

async function listOpenTasks() {
  const query = datastore
    .createQuery('Task')
    .filter(new PropertyFilter('done', '=', false))
    .order('createdAt')
    .limit(20);

  const [tasks] = await datastore.runQuery(query);

  for (const task of tasks) {
    console.log(task.title, task.done);
  }
}
```

If you need strong consistency for a query, use an ancestor query with `hasAncestor(parentKey)` instead of a global query.

## Bulk Operations

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

async function saveManyTasks() {
  const entities = [
    {
      key: datastore.key(['Task', 'task-1']),
      data: {title: 'One', done: false},
    },
    {
      key: datastore.key(['Task', 'task-2']),
      data: {title: 'Two', done: false},
    },
  ];

  await datastore.save(entities);

  const [tasks] = await datastore.get(entities.map(entity => entity.key));
  console.log(tasks.length);
}
```

This is simpler than a transaction when you do not need read-modify-write logic between operations.

## Transactions

Use a transaction for read-modify-write workflows that must commit atomically:

```javascript
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();

async function completeTask(taskId) {
  const transaction = datastore.transaction();
  const taskKey = datastore.key(['Task', taskId]);

  await transaction.run();

  try {
    const [task] = await transaction.get(taskKey);

    if (!task) {
      throw new Error('Task not found');
    }

    task.done = true;
    transaction.save(task);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
```

## Local Emulator

Start the Datastore emulator with `gcloud`, then export the environment variables it prints:

```bash
gcloud beta emulators datastore start --project=demo-project
eval "$(gcloud beta emulators datastore env-init)"
```

The important environment variables are `DATASTORE_EMULATOR_HOST` and `DATASTORE_PROJECT_ID`. Once they are set, `new Datastore()` talks to the emulator instead of production.

## Common Pitfalls

- Do not use API keys. Use ADC, user credentials, or a service account.
- `save()` upserts. Use `insert()` or `update()` when you need create-only or update-only behavior.
- Large strings and blobs should usually be excluded from indexes with `excludeFromIndexes`, or writes can fail and indexing cost increases.
- If a query returns a missing-index error, create the composite index in `index.yaml` and deploy it with `gcloud datastore indexes create index.yaml`.
- Ancestor queries are strongly consistent; global non-ancestor queries are not.
- If you rebuild a fetched entity into a plain object, keep its key when you call `save()` again.
- If emulator variables are still exported in your shell, the client keeps talking to the local emulator until you unset them.

## Version-Sensitive Notes

- This guide targets `@google-cloud/datastore` `10.1.0`.
- Prefer the current `PropertyFilter` query pattern from the maintained Node.js reference instead of older examples that rely on overloaded string filter signatures.

## Official URLs

- Docs root: `https://cloud.google.com/nodejs/docs/reference/datastore/latest`
- Auth setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Datastore emulator: `https://cloud.google.com/datastore/docs/tools/datastore-emulator`
- Datastore indexes: `https://cloud.google.com/datastore/docs/tools/indexconfig`
- npm package: `https://www.npmjs.com/package/@google-cloud/datastore`
