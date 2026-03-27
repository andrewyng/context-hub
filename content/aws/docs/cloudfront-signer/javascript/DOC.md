---
name: cloudfront-signer
description: "AWS SDK for JavaScript v3 helpers for creating CloudFront signed URLs and signed cookies for private content."
metadata:
  languages: "javascript"
  versions: "3.1005.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cloudfront,javascript,nodejs,cdn,signed-urls,signed-cookies"
---

# `@aws-sdk/cloudfront-signer`

Use this package to create CloudFront signed URLs and signed cookies in AWS SDK for JavaScript v3.

This package signs locally with your CloudFront private key. It does not create an AWS service client, does not call CloudFront APIs, and does not need `AWS_REGION` or AWS access keys just to generate signatures.

Use `@aws-sdk/client-cloudfront` when you need to manage distributions, invalidations, cache behaviors, or other CloudFront control-plane resources.

## Install

```bash
npm install @aws-sdk/cloudfront-signer@3.1005.0
```

## Prerequisites

Before you can sign anything, CloudFront must already be configured for private content:

- A CloudFront distribution serves the content.
- CloudFront trusts the public key that matches the private key your app will use for signing.
- You know the CloudFront key pair ID for that public key.
- You sign the CloudFront URL or alternate domain name that viewers actually request.

Do the signing on your server or another trusted backend. Do not ship the private key to browser code.

## Load the signing inputs

The package expects a `keyPairId`, a private key, and either an expiration time or a custom policy. A practical Node.js setup is:

```bash
export CLOUDFRONT_KEY_PAIR_ID=K2JCJMDEHXQW5F
export CLOUDFRONT_PRIVATE_KEY_PATH=./cloudfront-private-key.pem
export CLOUDFRONT_URL_BASE=https://d111111abcdef8.cloudfront.net
```

```javascript
import { readFileSync } from "node:fs";

const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const privateKeyPath = process.env.CLOUDFRONT_PRIVATE_KEY_PATH;
const urlBase = process.env.CLOUDFRONT_URL_BASE;

if (!keyPairId || !urlBase) {
  throw new Error("Set CLOUDFRONT_KEY_PAIR_ID and CLOUDFRONT_URL_BASE");
}

const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY
  ? process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, "\n")
  : privateKeyPath
    ? readFileSync(privateKeyPath, "utf8")
    : null;

if (!privateKey) {
  throw new Error(
    "Set CLOUDFRONT_PRIVATE_KEY or CLOUDFRONT_PRIVATE_KEY_PATH",
  );
}
```

If you store the PEM in an environment variable, keep the newline normalization step. Many secret managers flatten multi-line values.

## Create a signed URL

`getSignedUrl()` returns the final viewer URL with the CloudFront signature parameters already attached.

```javascript
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const assetUrl = `${urlBase}/private/reports/quarterly.pdf`;
const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const signedUrl = getSignedUrl({
  url: assetUrl,
  keyPairId,
  dateLessThan: expiresAt,
  privateKey,
});

console.log(signedUrl);
```

Build the full URL before signing it. If you change the path, hostname, or query string after signing, the signature no longer matches.

## Sign a URL that already has query parameters

If the viewer URL needs query parameters, add them first and sign the final string.

```javascript
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const downloadUrl = new URL(`${urlBase}/private/export.csv`);
downloadUrl.searchParams.set("download", "1");
downloadUrl.searchParams.set("filename", "export.csv");

const signedUrl = getSignedUrl({
  url: downloadUrl.toString(),
  keyPairId,
  dateLessThan: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  privateKey,
});
```

## Create signed cookies

Use `getSignedCookies()` when the browser should fetch protected content with cookies instead of a per-link signed URL.

The function returns cookie name/value pairs. Your web framework still needs to send them as `Set-Cookie` headers.

```javascript
import { getSignedCookies } from "@aws-sdk/cloudfront-signer";

const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const cookies = getSignedCookies({
  url: `${urlBase}/private/reports/quarterly.pdf`,
  keyPairId,
  dateLessThan: expiresAt,
  privateKey,
});

console.log(cookies);
```

In Express, map those values into real cookies:

```javascript
for (const [name, value] of Object.entries(cookies)) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
}
```

If you need cookies that cover multiple files, a not-before time, or IP-based restrictions, use a custom CloudFront policy instead of only an expiration timestamp.

## Important pitfalls

- Sign the CloudFront URL, not the underlying S3 URL. Viewers must request the same host and path that you signed.
- Keep the private key on the server. Browser code should only receive the finished signed URL or the final cookies.
- This package does not need `CloudFrontClient`, `AWS_REGION`, or AWS credentials for signing. It only uses the key pair ID and private key you provide.
- `getSignedCookies()` returns a plain object, not complete `Set-Cookie` header strings.
- Read the private key as UTF-8 text and preserve PEM newlines. Flattened or malformed PEM content causes signing failures.
- If you use an alternate domain name such as `https://assets.example.com`, sign that exact host instead of the default `*.cloudfront.net` domain.

## Version notes

- This guide covers `@aws-sdk/cloudfront-signer` version `3.1005.0`.
- Use root imports such as `import { getSignedUrl } from "@aws-sdk/cloudfront-signer"` rather than deep-importing package internals.

## Official sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-cloudfront-signer/
- Amazon CloudFront signed URLs: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html
- Amazon CloudFront signed cookies: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-cookies.html
- npm package page: https://www.npmjs.com/package/@aws-sdk/cloudfront-signer
