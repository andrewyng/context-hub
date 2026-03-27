---
name: bigtable
description: "Google Cloud Bigtable Node.js client for ADC auth, table admin, row reads and writes, and emulator-backed local development"
metadata:
  languages: "javascript"
  versions: "6.5.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,bigtable,google-cloud,gcp,nosql,database,javascript,nodejs"
---

# Google Cloud Bigtable Node.js Client

## Golden Rule

Use `@google-cloud/bigtable` with Google Cloud authentication, and open an existing instance before you debug row logic.

In most applications, the Cloud Bigtable instance already exists and your Node.js code works with tables and rows inside that instance. Keep `projectId`, `instanceId`, and `tableId` explicit in local development so you do not accidentally point at the wrong project.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/bigtable@6.5.0
```

If you use `pnpm` or `yarn`, install the same package version there.

Before running code, make sure all of the following are true:

- the target Google Cloud project exists
- the Cloud Bigtable API is enabled
- the caller has IAM access to the instance and tables
- the Bigtable instance already exists
- the table and column families already exist unless your code is creating them

## Authentication And Project Setup

For local development, use Application Default Credentials (ADC):

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-gcp-project"
export BIGTABLE_INSTANCE_ID="my-instance"
export BIGTABLE_TABLE_ID="my-table"
```

If you must use a service account key file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="my-gcp-project"
export BIGTABLE_INSTANCE_ID="my-instance"
export BIGTABLE_TABLE_ID="my-table"
```

`GOOGLE_APPLICATION_CREDENTIALS` and ADC are standard Google auth inputs. `BIGTABLE_INSTANCE_ID` and `BIGTABLE_TABLE_ID` are app-level environment variables used by the examples in this guide.

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account and let ADC resolve credentials automatically.

## Initialize A Client

Import the package as:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');
```

Basic setup with an explicit project:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const instance = bigtable.instance(process.env.BIGTABLE_INSTANCE_ID);
const table = instance.table(process.env.BIGTABLE_TABLE_ID);
```

If your runtime already resolves the correct project and credentials, `new Bigtable()` is usually enough:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();
const instance = bigtable.instance('my-instance');
const table = instance.table('my-table');
```

With an explicit key file:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
  projectId: 'my-gcp-project',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

## Create A Table

If the instance exists but the table does not, create the table and its column families from the instance handle:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const instance = bigtable.instance(process.env.BIGTABLE_INSTANCE_ID);
const tableId = process.env.BIGTABLE_TABLE_ID;

async function ensureTable() {
  const table = instance.table(tableId);
  const [exists] = await table.exists();

  if (!exists) {
    await instance.createTable(tableId, {
      families: ['profile', 'stats'],
    });
  }
}

ensureTable().catch(console.error);
```

This creates the table inside an existing instance. Instance and cluster provisioning are separate infrastructure steps.

## Write Rows

Insert rows with a row key and `data` grouped by column family:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();
const table = bigtable
  .instance(process.env.BIGTABLE_INSTANCE_ID)
  .table(process.env.BIGTABLE_TABLE_ID);

async function writeUsers() {
  await table.insert([
    {
      key: 'user#1001',
      data: {
        profile: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
        },
        stats: {
          visits: '1',
        },
      },
    },
    {
      key: 'user#1002',
      data: {
        profile: {
          name: 'Grace Hopper',
          email: 'grace@example.com',
        },
        stats: {
          visits: '5',
        },
      },
    },
  ]);
}

writeUsers().catch(console.error);
```

Bigtable stores cell values as bytes. If you need typed numbers, JSON, or timestamps, serialize and deserialize them consistently in your application.

## Read Rows

Read a single row by key:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();
const table = bigtable
  .instance(process.env.BIGTABLE_INSTANCE_ID)
  .table(process.env.BIGTABLE_TABLE_ID);

async function readUser() {
  const [row] = await table.row('user#1001').get();

  if (!row) {
    console.log('Row not found');
    return;
  }

  const name = row.data.profile.name[0].value.toString();
  const email = row.data.profile.email[0].value.toString();

  console.log({
    id: row.id,
    name,
    email,
  });
}

readUser().catch(console.error);
```

Stream rows when you want to scan a table without loading everything into memory at once:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();
const table = bigtable
  .instance(process.env.BIGTABLE_INSTANCE_ID)
  .table(process.env.BIGTABLE_TABLE_ID);

async function listRows() {
  await new Promise((resolve, reject) => {
    table
      .createReadStream()
      .on('error', reject)
      .on('data', row => {
        console.log(row.id);
      })
      .on('end', resolve);
  });
}

listRows().catch(console.error);
```

The returned row shape matters:

- `row.id` is the row key
- `row.data[family][qualifier]` is an array of cells
- `row.data[family][qualifier][0].value` is a `Buffer`, so decode it before logging or parsing

## Delete Data

Delete a single row:

```javascript
const {Bigtable} = require('@google-cloud/bigtable');

const bigtable = new Bigtable();
const table = bigtable
  .instance(process.env.BIGTABLE_INSTANCE_ID)
  .table(process.env.BIGTABLE_TABLE_ID);

async function deleteUser() {
  await table.row('user#1002').delete();
}

deleteUser().catch(console.error);
```

Delete the whole table only when you really intend to remove schema and data together:

```javascript
async function deleteTable() {
  await table.delete();
}
```

## Emulator

For local integration tests, use the official Bigtable emulator:

```bash
gcloud beta emulators bigtable start --host-port=localhost:8086
export BIGTABLE_EMULATOR_HOST=localhost:8086
```

Important emulator behavior from the official docs:

- it is in-memory only and does not persist data across runs
- it does not support a secure connection
- it does not provide admin APIs for creating or managing instances and clusters
- once `BIGTABLE_EMULATOR_HOST` is set, the client library connects to the emulator automatically

Unset `BIGTABLE_EMULATOR_HOST` after tests so production code does not accidentally point at the emulator.

## Common Pitfalls

- The package is a server-side Node.js client. Do not mix it with browser-only Firebase or web SDK setup.
- `instance.table('name')` only gives you a handle. It does not prove the table already exists.
- Bigtable stores rows in sorted row-key order. Avoid production row-key schemes that send sequential traffic to the same tablet range.
- Row data comes back as cell-version arrays with `Buffer` values. Decode the `Buffer` and choose which version you want.
- Missing column families are a common cause of first-run write failures.
- If `BIGTABLE_EMULATOR_HOST` is still set in your shell or CI job, the client talks to the emulator instead of the real service.

## Version Notes For 6.5.0

- This guide targets `@google-cloud/bigtable` `6.5.0`.
- Use the current Google Cloud Node.js reference when copying admin or row APIs into new code, especially if you are adapting older blog posts or answers.

## Official Sources

- Bigtable Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/bigtable/latest`
- Google Cloud ADC guide: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Bigtable emulator guide: `https://cloud.google.com/bigtable/docs/emulator`
- npm package page: `https://www.npmjs.com/package/@google-cloud/bigtable`
