---
name: s3-presigned-post
description: "AWS SDK for JavaScript v3 helper for generating S3 browser-based presigned POST uploads."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,s3,javascript,nodejs,browser-uploads,presigned-posts"
---

# `@aws-sdk/s3-presigned-post`

Use this package when your backend should generate an S3 HTML form upload for a browser or other multipart client.

It returns a form `url` and signed `fields`. The uploader sends those fields back to S3 in a `multipart/form-data` POST request together with the file.

Use `@aws-sdk/s3-request-presigner` instead when you need a presigned `PUT` URL rather than a browser-style form POST.

## Install

```bash
npm install @aws-sdk/client-s3@3.1007.0 @aws-sdk/s3-presigned-post@3.1007.0
```

## Prerequisites

The code that calls `createPresignedPost()` needs normal AWS SDK v3 S3 configuration:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
AWS_PROFILE=default
S3_BUCKET=my-upload-bucket
```

Use a trusted backend to create the presigned POST. Do not expose long-lived AWS credentials in browser code.

For direct browser uploads, the target bucket also needs a CORS rule that allows your frontend origin to send `POST` requests:

```bash
aws s3api put-bucket-cors \
  --bucket "$S3_BUCKET" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["http://localhost:3000"],
        "AllowedMethods": ["POST"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag"]
      }
    ]
  }'
```

## Create a presigned POST on the server

Initialize an `S3Client`, then call `createPresignedPost()` with the target bucket, object key, and any form constraints you want S3 to enforce.

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createImageUpload({ key, contentType }) {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("Set S3_BUCKET");
  }

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: bucket,
    Key: key,
    Fields: {
      "Content-Type": contentType,
      success_action_status: "201",
    },
    Conditions: [
      { "Content-Type": contentType },
      { success_action_status: "201" },
      ["content-length-range", 0, 5 * 1024 * 1024],
    ],
    Expires: 600,
  });

  return { url, fields, key };
}
```

`Expires` is the presigned POST lifetime in seconds.

If you want S3 to enforce a field value such as `Content-Type`, include it in both `Fields` and `Conditions`.

## Upload the file from the browser

Your app sends the upload intent to your backend, receives the signed form payload, then posts it directly to S3.

```javascript
export async function uploadFile(file) {
  const key = `uploads/${crypto.randomUUID()}-${file.name}`;

  const presignResponse = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      contentType: file.type || "application/octet-stream",
    }),
  });

  if (!presignResponse.ok) {
    throw new Error("Failed to create presigned POST");
  }

  const { url, fields } = await presignResponse.json();

  const formData = new FormData();

  for (const [name, value] of Object.entries(fields)) {
    formData.append(name, value);
  }

  formData.append("file", file);

  const uploadResponse = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed with ${uploadResponse.status}`);
  }

  return { key };
}
```

The uploader must send the returned `fields` back unchanged. Those signed values are part of the POST policy.

## Common policy patterns

Use exact-match object conditions when the backend already knows the value:

```javascript
const post = await createPresignedPost(s3, {
  Bucket: process.env.S3_BUCKET,
  Key: "uploads/avatar.png",
  Fields: {
    "Content-Type": "image/png",
  },
  Conditions: [
    { "Content-Type": "image/png" },
    ["content-length-range", 0, 1 * 1024 * 1024],
  ],
  Expires: 300,
});
```

Use `starts-with` when multiple values should be accepted under one signed policy:

```javascript
const post = await createPresignedPost(s3, {
  Bucket: process.env.S3_BUCKET,
  Key: "uploads/image-upload",
  Conditions: [
    ["starts-with", "$Content-Type", "image/"],
    ["content-length-range", 0, 10 * 1024 * 1024],
  ],
  Expires: 300,
});
```

## Important pitfalls

- Generate the presigned POST on a server you control. The browser should receive only the final `url` and `fields`.
- Submit the request as `multipart/form-data` to the returned `url`. This package does not create a signed `PUT` URL.
- If you need S3 to enforce a form field value, put that value in both `Fields` and `Conditions`.
- Bucket CORS still applies for browser uploads. A valid signature alone does not bypass cross-origin restrictions.
- The IAM credentials used by `S3Client` still need permission for the target bucket and object key.
- Import from the package root: `@aws-sdk/s3-presigned-post`.

## Version notes

- This guide covers `@aws-sdk/s3-presigned-post` version `3.1007.0`.
- Pair it with `@aws-sdk/client-s3` in the same AWS SDK v3 app.

## Official sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-s3-presigned-post/
- Amazon S3 browser-based uploads using POST: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-UsingHTTPPOST.html
- Amazon S3 POST policy construction: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html
- npm package page: https://www.npmjs.com/package/@aws-sdk/s3-presigned-post
