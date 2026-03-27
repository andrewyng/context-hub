---
name: spanner
description: "Google Cloud Spanner Node.js client for SQL queries, mutations, read-write transactions, schema updates, and emulator-based local development"
metadata:
  languages: "javascript"
  versions: "8.6.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,spanner,database,sql,gcp,transactions,nodejs"
---

# `@google-cloud/spanner` JavaScript Package Guide

Use `@google-cloud/spanner` when you need to query Cloud Spanner with SQL, apply mutations, run read-write transactions, and manage schema from Node.js.

## Golden Rule

- Import `Spanner` from `@google-cloud/spanner` and create one long-lived client per process.
- Authenticate with Application Default Credentials (ADC), not API keys.
- Reuse `Instance` and `Database` handles instead of recreating them for every query.
- Use parameterized SQL for dynamic values.
- Close `Database` handles when your app shuts down or a short-lived script finishes so sessions are released cleanly.

This guide covers `8.6.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/spanner@8.6.0
```

## Authentication And Environment

Enable the API in the Google Cloud project you want to use:

```bash
gcloud services enable spanner.googleapis.com
```

For local development with your user credentials:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

For deployed workloads, prefer attached service accounts. If you need to point ADC at a key file locally or in CI:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Useful app-level variables:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export SPANNER_INSTANCE_ID="your-instance-id"
export SPANNER_DATABASE_ID="your-database-id"
```

This guide assumes the instance and database already exist.

## Initialize The Client

CommonJS:

```javascript
const {Spanner} = require('@google-cloud/spanner');

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const instanceId = process.env.SPANNER_INSTANCE_ID;
const databaseId = process.env.SPANNER_DATABASE_ID;

const spanner = new Spanner({projectId});
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);
```

ES modules:

```javascript
import {Spanner} from '@google-cloud/spanner';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const instanceId = process.env.SPANNER_INSTANCE_ID;
const databaseId = process.env.SPANNER_DATABASE_ID;

const spanner = new Spanner({projectId});
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);
```

If you use the handle in a short-lived script, release sessions when you are done:

```javascript
try {
  const [rows] = await database.run({sql: 'SELECT 1'});
  console.log(rows.length);
} finally {
  await database.close();
}
```

## Common Workflows

### Run A SQL Query

Use `database.run()` for straightforward query execution:

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);

async function listSingers() {
  const [rows] = await database.run({
    sql: `
      SELECT SingerId, FirstName, LastName
      FROM Singers
      ORDER BY SingerId
    `,
  });

  return rows.map(row => row.toJSON());
}

try {
  const singers = await listSingers();
  console.log(singers);
} finally {
  await database.close();
}
```

### Use Parameters Instead Of String Interpolation

Pass dynamic values in `params`. For integer values, use `Spanner.int(...)` when you need an exact Spanner `INT64` value.

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);

async function getAlbumsForSinger(singerId) {
  const [rows] = await database.run({
    sql: `
      SELECT SingerId, AlbumId, AlbumTitle
      FROM Albums
      WHERE SingerId = @singerId
      ORDER BY AlbumId
    `,
    params: {
      singerId: Spanner.int(singerId),
    },
  });

  return rows.map(row => row.toJSON());
}
```

### Insert Rows With Mutations

Use table mutations when you want to write whole rows without DML:

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);

async function insertSingers() {
  await database.table('Singers').insert([
    {
      SingerId: Spanner.int(1),
      FirstName: 'Ada',
      LastName: 'Lovelace',
    },
    {
      SingerId: Spanner.int(2),
      FirstName: 'Grace',
      LastName: 'Hopper',
    },
  ]);
}
```

For idempotent writes, use `upsert()` instead of `insert()`.

### Run DML In A Read-Write Transaction

Use a transaction when multiple statements must commit atomically:

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);

async function increaseBudget(singerId, delta) {
  const [transaction] = await database.getTransaction();

  try {
    const [rowCount] = await transaction.runUpdate({
      sql: `
        UPDATE Albums
        SET MarketingBudget = MarketingBudget + @delta
        WHERE SingerId = @singerId
      `,
      params: {
        delta: Spanner.int(delta),
        singerId: Spanner.int(singerId),
      },
    });

    await transaction.commit();
    return rowCount;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

Use transactions for read-write units of work. For simple row inserts, updates, or deletes that already map cleanly to mutations, table mutation helpers are often simpler.

### Update Schema

Schema changes return a long-running operation. Wait for it to finish before issuing dependent queries or writes.

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);

async function createSingersTable() {
  const [operation] = await database.updateSchema([
    `CREATE TABLE Singers (
      SingerId INT64 NOT NULL,
      FirstName STRING(1024),
      LastName STRING(1024)
    ) PRIMARY KEY (SingerId)`,
  ]);

  await operation.promise();
}
```

## Emulator Setup

For local development or tests, start the Spanner emulator and point the client at it:

```bash
gcloud emulators spanner start
export SPANNER_EMULATOR_HOST="localhost:9010"
export GOOGLE_CLOUD_PROJECT="test-project"
export SPANNER_INSTANCE_ID="test-instance"
export SPANNER_DATABASE_ID="test-database"
```

Create the instance and database your app expects:

```bash
gcloud spanner instances create test-instance \
  --config=emulator-config \
  --description="Spanner emulator" \
  --nodes=1

gcloud spanner databases create test-database --instance=test-instance
```

Then initialize the client the same way as production code:

```javascript
const {Spanner} = require('@google-cloud/spanner');

const spanner = new Spanner({projectId: process.env.GOOGLE_CLOUD_PROJECT});
const database = spanner
  .instance(process.env.SPANNER_INSTANCE_ID)
  .database(process.env.SPANNER_DATABASE_ID);
```

When `SPANNER_EMULATOR_HOST` is set, the client connects to the emulator instead of the production service.

## Common Pitfalls

- Do not use API keys. Cloud Spanner client libraries use ADC and IAM credentials.
- Reuse `Spanner`, `Instance`, and `Database` handles instead of constructing new ones for every request.
- Close `database` handles in scripts, workers, and tests so session resources are released.
- Do not build SQL with string interpolation for user input. Use `params`.
- JavaScript numbers do not safely represent every `INT64` value. Use `Spanner.int(...)` for exact integer parameters and mutation values when precision matters.
- Schema updates are asynchronous. Wait for `operation.promise()` before assuming the new schema is ready.
- The emulator is useful for local development, but it does not replace validation against a real Cloud Spanner instance for IAM, quotas, and production behavior.

## Version-Sensitive Notes

- This guide targets `@google-cloud/spanner` `8.6.0`.
- Pin the npm dependency if your application depends on behavior from this exact release while the online reference stays on the `latest` docs root.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/spanner/latest`
- Cloud Spanner product docs: `https://cloud.google.com/spanner/docs`
- Cloud Spanner Node.js quickstart: `https://cloud.google.com/spanner/docs/getting-started/nodejs`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Local ADC setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Spanner emulator: `https://cloud.google.com/spanner/docs/emulator`
- npm package page: `https://www.npmjs.com/package/@google-cloud/spanner`
