---
name: s3-request-presigner
description: "Generate presigned Amazon S3 URLs in JavaScript with the AWS SDK v3."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,s3,presigned-url,signing,javascript"
---

# `@aws-sdk/s3-request-presigner`

Use `@aws-sdk/s3-request-presigner` to generate presigned Amazon S3 request URLs from AWS SDK v3 command objects. The usual flow is:

1. Create an `S3Client` with the correct region and credentials.
2. Create a command such as `GetObjectCommand` or `PutObjectCommand`.
3. Call `getSignedUrl(client, command, { expiresIn })`.
4. Return that URL to the caller that should upload or download the object.

This package signs requests. It does not upload or download data itself.

## Install

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Prerequisites

Generate presigned URLs on a trusted server or serverless function that already has permission to access the target bucket.

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token
AWS_S3_BUCKET=your-bucket-name
```

If you use shared AWS config instead of environment variables, the SDK can also resolve credentials from your usual AWS profile and config chain.

## Initialize the S3 client

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION ?? "us-east-1";

export const s3 = new S3Client({
  region,
});
```

Use the bucket's actual region. A region mismatch produces invalid signatures.

## Create a presigned download URL

Use `GetObjectCommand` when another client should download an existing object without holding AWS credentials.

```javascript
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createDownloadUrl(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 3600,
  });
}

const url = await createDownloadUrl(
  process.env.AWS_S3_BUCKET,
  "reports/quarterly.pdf",
);

console.log(url);
```

The caller can then issue a normal `GET` request to that URL.

## Create a presigned upload URL

Use `PutObjectCommand` when you want a browser or other client to upload directly to S3.

```javascript
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createUploadUrl(bucket, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 900,
  });
}
```

Upload with the same method and headers you signed:

```javascript
const uploadUrl = await createUploadUrl(
  process.env.AWS_S3_BUCKET,
  "uploads/report.pdf",
  "application/pdf",
);

const response = await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": "application/pdf",
  },
  body: fileBuffer,
});

if (!response.ok) {
  throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
}
```

If you sign `ContentType`, server-side encryption headers, checksum headers, or other request headers in the command input, the uploader must send matching headers on the actual request.

## Presign other S3 operations

`getSignedUrl()` works with normal S3 command objects, not only `GetObjectCommand`.

```javascript
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const headUrl = await getSignedUrl(
  s3,
  new HeadObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: "uploads/report.pdf",
  }),
  { expiresIn: 300 },
);

const deleteUrl = await getSignedUrl(
  s3,
  new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: "uploads/report.pdf",
  }),
  { expiresIn: 300 },
);

console.log({ headUrl, deleteUrl });
```

## Common pitfalls

- Generate the URL with credentials that already have the intended S3 permissions. The presigned URL cannot do more than the signer can do.
- Keep `expiresIn` short. It is expressed in seconds.
- Use the correct region for the bucket or access point you are signing against.
- Send the same signed headers on the real request, especially for uploads.
- Return presigned URLs from a backend. Do not embed long-lived AWS credentials in a browser app just to create them client-side.
- Use `@aws-sdk/s3-presigned-post` instead when you need a browser form POST policy rather than a signed request URL.

## Version notes

- This guide covers `@aws-sdk/s3-request-presigner` version `3.1007.0`.
- Pair this package with `@aws-sdk/client-s3` in the same AWS SDK v3 dependency set to avoid unnecessary version skew.
