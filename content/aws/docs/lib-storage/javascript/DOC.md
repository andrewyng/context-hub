---
name: lib-storage
description: "AWS SDK for JavaScript v3 multipart upload helper for uploading large files to Amazon S3"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,s3,multipart-upload,storage,javascript"
---

# `@aws-sdk/lib-storage` for JavaScript

`@aws-sdk/lib-storage` provides the `Upload` helper for managed multipart uploads to Amazon S3. Use it with `@aws-sdk/client-s3` when you need a higher-level upload flow than calling `PutObjectCommand` yourself, especially for large files, streams, progress reporting, or abortable uploads.

## Install

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

## Prerequisites

Set AWS credentials and a region in the environment, or rely on another supported AWS SDK credential source in your runtime.

```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

If you already use shared AWS config files, IAM roles, ECS task roles, or Lambda execution roles, you can still initialize `S3Client` without embedding credentials in code.

## Initialize the S3 client

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});
```

Use explicit credentials only when you cannot rely on the default AWS SDK credential provider chain:

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Basic multipart upload from a file

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadFile({ filePath, key }) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
    },
  });

  await upload.done();
}
```

`Upload` manages the multipart workflow and resolves when the full upload has completed.

## Upload with metadata and content type

Pass the same S3 object parameters you would normally send for an upload in `params`:

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadImage({ filePath, key }) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: "image/png",
      Metadata: {
        source: "app",
      },
    },
  });

  const result = await upload.done();
  return result;
}
```

## Track upload progress

Attach the progress listener before awaiting `done()`:

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream, statSync } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadFileWithProgress({ filePath, key }) {
  const totalBytes = statSync(filePath).size;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    if (typeof progress.loaded !== "number") {
      return;
    }

    const percent = Math.round((progress.loaded / totalBytes) * 100);
    console.log(`${percent}% uploaded`);
  });

  return upload.done();
}
```

## Tune concurrency and part size

`Upload` accepts multipart configuration options for throughput and failure behavior:

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadLargeFile({ filePath, key }) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
    leavePartsOnError: false,
  });

  return upload.done();
}
```

Use these options deliberately:

- `queueSize`: number of concurrent part uploads.
- `partSize`: size of each uploaded part. AWS S3 multipart uploads require parts of at least 5 MiB except the final part.
- `leavePartsOnError`: when set to `false`, the helper cleans up multipart state on failure instead of leaving uploaded parts behind.

## Abort an in-flight upload

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadWithTimeout({ filePath, key, timeoutMs = 5000 }) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
    },
  });

  const timer = setTimeout(() => {
    upload.abort();
  }, timeoutMs);

  try {
    return await upload.done();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Upload aborted");
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
```

## Common workflow: upload an Express file to S3

If middleware gives you a local temp file path, pass its read stream directly into `Upload`.

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function saveUploadedFile(file) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${file.originalname}`,
      Body: createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });

  return upload.done();
}
```

## When to use `Upload` instead of `PutObjectCommand`

Use `Upload` when you need any of the following:

- multipart uploads for large objects
- uploads from Node.js streams
- progress events during upload
- concurrency control with `queueSize`
- explicit abort support

For a simple small-object upload where you do not need multipart behavior or progress reporting, `@aws-sdk/client-s3` with `PutObjectCommand` is usually simpler.

## Pitfalls

- Install both packages. `Upload` comes from `@aws-sdk/lib-storage`, but it still needs an `S3Client` from `@aws-sdk/client-s3`.
- Set `region` on the client. Leaving it undefined can cause credential or endpoint resolution failures before the upload starts.
- Keep `partSize` at or above `5 * 1024 * 1024` for multipart uploads.
- Register `httpUploadProgress` listeners before calling `await upload.done()`.
- Call `upload.abort()` only while the upload is still active; after `done()` resolves there is nothing left to cancel.
- If you disable cleanup behavior, you are responsible for any incomplete multipart upload state left in S3.

## Version notes

This guide targets `@aws-sdk/lib-storage` version `3.1007.0`. The package is part of AWS SDK for JavaScript v3 and is documented under the AWS maintainer documentation for the package.
