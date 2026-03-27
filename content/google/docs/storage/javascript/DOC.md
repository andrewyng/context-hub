---
name: storage
description: "Google Cloud Storage Node.js client for working with buckets, objects, metadata, streams, and signed URLs"
metadata:
  languages: "javascript"
  versions: "7.19.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,cloud-storage,storage,buckets,objects,javascript,nodejs"
---

# `@google-cloud/storage` JavaScript Package Guide

Use `@google-cloud/storage` in Node.js code that needs to create buckets, upload and download objects, list files, manage metadata, stream data, or generate signed URLs for Google Cloud Storage.

## Golden Rule

- Use the official `@google-cloud/storage` client, not raw HTTP calls, for normal application code.
- Prefer Application Default Credentials (ADC) unless you have a clear reason to pass credentials explicitly.
- Think in terms of `Storage` → `Bucket` → `File` objects.
- Use `bucket.upload()` when the source is already on disk, and `file.save()` or streams when the content already lives in memory or arrives incrementally.
- Prefer signed URLs for temporary external access instead of making objects public.
- Keep bucket names globally unique and treat object names as the stable key inside a bucket.

This guide covers `7.19.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/storage@7.19.0
```

## Authentication And Setup

This client uses Google Cloud credentials, not an API key.

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

In production on Google Cloud, prefer an attached service account or workload identity over long-lived key files.

Minimum setup:

1. Authenticate with ADC or a service account.
2. Set `GOOGLE_CLOUD_PROJECT` when the project is not detected automatically.
3. Make sure the credential has the bucket and object permissions your workflow needs.

## Initialize The Client

CommonJS:

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
```

ES modules:

```javascript
import {Storage} from '@google-cloud/storage';

const storage = new Storage();
```

With explicit project ID and key file:

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

Reference a bucket and file once, then reuse those handles:

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const bucket = storage.bucket('my-bucket');
const file = bucket.file('reports/2026-03-13.json');
```

## Core Workflows

### Create A Bucket

Bucket names are globally unique across Cloud Storage.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function createBucket(bucketName) {
  const [bucket] = await storage.createBucket(bucketName, {
    location: 'US',
    storageClass: 'STANDARD',
  });

  console.log(bucket.name);
}

createBucket('my-unique-bucket-name').catch(console.error);
```

### Upload A Local File

Use `bucket.upload()` when the source file already exists on disk.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function uploadLocalFile(bucketName, localPath, destination) {
  await storage.bucket(bucketName).upload(localPath, {
    destination,
  });
}

uploadLocalFile(
  'my-bucket',
  './invoices/march.csv',
  'imports/2026-03/march.csv'
).catch(console.error);
```

### Upload Text Or JSON From Memory

Use `file.save()` when your app already has the content in memory.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function saveJson(bucketName, fileName, payload) {
  await storage
    .bucket(bucketName)
    .file(fileName)
    .save(JSON.stringify(payload), {
      resumable: false,
      metadata: {
        contentType: 'application/json',
      },
    });
}

saveJson('my-bucket', 'exports/run.json', {ok: true}).catch(console.error);
```

### Download An Object To Disk

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function downloadFile(bucketName, fileName, destination) {
  await storage.bucket(bucketName).file(fileName).download({
    destination,
  });
}

downloadFile('my-bucket', 'exports/run.json', './run.json').catch(console.error);
```

### List Objects Under A Prefix

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function listFiles(bucketName, prefix) {
  const [files] = await storage.bucket(bucketName).getFiles({prefix});

  for (const file of files) {
    console.log(file.name);
  }
}

listFiles('my-bucket', 'imports/').catch(console.error);
```

### Stream Uploads And Downloads

Use streams when the payload is large or already arrives as a stream.

```javascript
const fs = require('node:fs');
const {pipeline} = require('node:stream/promises');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function uploadWithStreams(bucketName, localPath, destination) {
  await pipeline(
    fs.createReadStream(localPath),
    storage.bucket(bucketName).file(destination).createWriteStream()
  );
}

async function downloadWithStreams(bucketName, fileName, localPath) {
  await pipeline(
    storage.bucket(bucketName).file(fileName).createReadStream(),
    fs.createWriteStream(localPath)
  );
}
```

### Read And Update Metadata

Use `getMetadata()` to inspect the object and `setMetadata()` to update fields such as cache control or custom metadata.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function updateMetadata(bucketName, fileName) {
  const file = storage.bucket(bucketName).file(fileName);

  const [before] = await file.getMetadata();
  console.log(before.contentType);

  await file.setMetadata({
    cacheControl: 'public, max-age=3600',
    metadata: {
      source: 'api',
      jobId: 'job-1234',
    },
  });
}

updateMetadata('my-bucket', 'assets/logo.png').catch(console.error);
```

### Copy, Rename, And Delete Objects

Use `copy()` to duplicate an object, `move()` to rename it, and `delete()` to remove it.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function reorganizeObject(bucketName) {
  const bucket = storage.bucket(bucketName);
  const source = bucket.file('incoming/report.csv');

  await source.copy(bucket.file('archive/report.csv'));
  await source.move('processed/report.csv');
  await bucket.file('processed/old-report.csv').delete();
}

reorganizeObject('my-bucket').catch(console.error);
```

### Generate A V4 Signed URL

Use signed URLs when another client should read or upload a specific object without using your server credentials directly.

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function generateReadUrl(bucketName, fileName) {
  const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000,
  });

  console.log(url);
}

generateReadUrl('my-bucket', 'exports/run.json').catch(console.error);
```

## Practical Notes

- `new Storage()` usually works when ADC is configured; pass `projectId` explicitly when project detection is ambiguous.
- `bucket.upload()` is the simplest path for local files, but streams are a better fit for request bodies, large files, and background pipelines.
- `file.save()` is convenient for smaller strings and buffers that you already have in memory.
- Signed URL generation depends on credentials that can sign requests; service-account based credentials are the straightforward choice for server-side signing.
- Prefer IAM and signed URLs over object ACL-style sharing patterns in new code.

## Minimal End-To-End Example

```javascript
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();

async function main() {
  const bucket = storage.bucket(process.env.BUCKET_NAME);

  await bucket.file('hello.txt').save('hello world\n', {
    resumable: false,
  });

  const [files] = await bucket.getFiles({prefix: 'hello'});
  for (const file of files) {
    console.log(file.name);
  }

  const [url] = await bucket.file('hello.txt').getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 5 * 60 * 1000,
  });

  console.log(url);
}

main().catch(console.error);
```
