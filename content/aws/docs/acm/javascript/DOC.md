---
name: acm
description: "AWS SDK for JavaScript v3 ACM client for requesting, importing, listing, and managing TLS certificates."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,acm,javascript,nodejs,tls,certificates,ssl"
---

# `@aws-sdk/client-acm`

Use this package for AWS Certificate Manager in AWS SDK for JavaScript v3. It covers certificate lifecycle tasks such as requesting public certificates, reading validation details, importing existing PEM certificates, listing certificates, tagging, and deleting certificates.

Prefer `ACMClient` plus explicit command imports for new code.

## Install

```bash
npm install @aws-sdk/client-acm
```

If you need explicit profile, SSO, or assume-role credential providers in application code, install the credential helpers you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

ACM is regional. Create the client in the same AWS region where the certificate exists or should be created.

Typical local setup:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev"
```

Or with direct credentials:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

In Node.js, the default AWS SDK credential provider chain is usually enough if credentials already come from environment variables, shared AWS config, ECS, EC2 instance metadata, or IAM Identity Center.

ACM administration belongs on trusted backend or automation code, not untrusted browser clients.

## Client Setup

### Minimal Node.js client

```javascript
import { ACMClient } from "@aws-sdk/client-acm";

const acm = new ACMClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit profile-based credentials

```javascript
import { ACMClient } from "@aws-sdk/client-acm";
import { fromIni } from "@aws-sdk/credential-providers";

const acm = new ACMClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  ACMClient,
  DescribeCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

const response = await acm.send(
  new DescribeCertificateCommand({
    CertificateArn:
      "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012",
  }),
);

console.log(response.Certificate?.Status);
```

## Common Workflows

### Request a public certificate with DNS validation

`RequestCertificateCommand` returns the certificate ARN. Use `DescribeCertificateCommand` to read the DNS validation record that must be published.

```javascript
import {
  ACMClient,
  DescribeCertificateCommand,
  RequestCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

const request = await acm.send(
  new RequestCertificateCommand({
    DomainName: "api.example.com",
    SubjectAlternativeNames: ["www.example.com"],
    ValidationMethod: "DNS",
    IdempotencyToken: "api-example-com",
    Tags: [{ Key: "service", Value: "edge-api" }],
  }),
);

const certificateArn = request.CertificateArn;

if (!certificateArn) {
  throw new Error("RequestCertificate did not return a certificate ARN");
}

const details = await acm.send(
  new DescribeCertificateCommand({
    CertificateArn: certificateArn,
  }),
);

for (const option of details.Certificate?.DomainValidationOptions ?? []) {
  const record = option.ResourceRecord;

  if (record) {
    console.log({
      domain: option.DomainName,
      name: record.Name,
      type: record.Type,
      value: record.Value,
    });
  }
}
```

If you choose email validation instead, ACM also exposes `ResendValidationEmailCommand` for retrying the validation email flow.

### Wait for validation to complete

The generated ACM waiter polls `DescribeCertificate` until every domain validation status becomes `SUCCESS`, or fails if the certificate status becomes `FAILED`.

```javascript
import {
  ACMClient,
  waitUntilCertificateValidated,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

await waitUntilCertificateValidated(
  { client: acm, maxWaitTime: 30 * 60 },
  {
    CertificateArn:
      "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012",
  },
);
```

### List certificates with the paginator

ACM exposes one paginator for `ListCertificates`. Use it when you need to scan more than one page.

```javascript
import {
  ACMClient,
  paginateListCertificates,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

for await (const page of paginateListCertificates(
  { client: acm },
  {
    CertificateStatuses: ["ISSUED", "PENDING_VALIDATION"],
  },
)) {
  for (const cert of page.CertificateSummaryList ?? []) {
    console.log(cert.CertificateArn, cert.DomainName, cert.Status);
  }
}
```

### Read the issued certificate body and chain

`GetCertificateCommand` returns the certificate PEM and certificate chain PEM. It does not return the private key.

```javascript
import {
  ACMClient,
  GetCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

const response = await acm.send(
  new GetCertificateCommand({
    CertificateArn:
      "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012",
  }),
);

console.log(response.Certificate);
console.log(response.CertificateChain);
```

### Import an existing PEM certificate

Use `ImportCertificateCommand` when you already have the certificate PEM and private key PEM. In Node.js, `readFileSync()` returns `Buffer`, which is accepted for ACM blob inputs.

```javascript
import { readFileSync } from "node:fs";
import {
  ACMClient,
  ImportCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

const response = await acm.send(
  new ImportCertificateCommand({
    Certificate: readFileSync("./tls/certificate.pem"),
    PrivateKey: readFileSync("./tls/private-key.pem"),
    CertificateChain: readFileSync("./tls/certificate-chain.pem"),
    Tags: [{ Key: "environment", Value: "production" }],
  }),
);

console.log(response.CertificateArn);
```

Keep the private key on trusted infrastructure only, and never commit it to source control.

### Add and remove tags

```javascript
import {
  ACMClient,
  AddTagsToCertificateCommand,
  RemoveTagsFromCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });
const certificateArn =
  "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012";

await acm.send(
  new AddTagsToCertificateCommand({
    CertificateArn: certificateArn,
    Tags: [
      { Key: "service", Value: "payments" },
      { Key: "owner", Value: "platform" },
    ],
  }),
);

await acm.send(
  new RemoveTagsFromCertificateCommand({
    CertificateArn: certificateArn,
    Tags: [{ Key: "owner" }],
  }),
);
```

### Delete a certificate you no longer use

```javascript
import {
  ACMClient,
  DeleteCertificateCommand,
} from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

await acm.send(
  new DeleteCertificateCommand({
    CertificateArn:
      "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012",
  }),
);
```

If AWS still reports the certificate as in use, detach it from the dependent service first and retry.

## Common Pitfalls

- `RequestCertificateCommand` does not include the DNS validation record in its response. Call `DescribeCertificateCommand` and read `Certificate.DomainValidationOptions[].ResourceRecord`.
- ACM is regional. Listing or describing a certificate in the wrong region will not find the ARN you expect.
- `GetCertificateCommand` returns the certificate body and chain, not the private key.
- `ImportCertificateCommand` requires certificate PEM bytes and private key bytes. In Node.js, pass `Buffer` values such as `readFileSync()` results.
- `DeleteCertificateCommand` can fail with `ResourceInUseException` while the certificate is still attached elsewhere.
- If you use `ExportCertificateCommand`, pass `Passphrase` as bytes and expect it to work only for certificates with export enabled.

## Related Packages

- `@aws-sdk/credential-providers`: explicit profile, SSO, Cognito, and assume-role credential flows.
- `@aws-sdk/client-route-53`: automate DNS validation record creation when you manage DNS in Route 53.
- `@aws-sdk/client-elastic-load-balancing-v2`: attach ACM certificates to Application Load Balancer or Network Load Balancer listeners.
- `@aws-sdk/client-cloudfront`: reference ACM certificates from CloudFront distributions.

## Version Notes

- This guide targets `@aws-sdk/client-acm` version `3.1007.0`.
- The current ACM API model exposes one paginator for `ListCertificates` and one waiter for certificate validation, which maps to `paginateListCertificates` and `waitUntilCertificateValidated` in AWS SDK for JavaScript v3.

## Official Sources

- AWS SDK for JavaScript v3 ACM client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/acm/`
- AWS Certificate Manager API Reference: `https://docs.aws.amazon.com/acm/latest/APIReference/Welcome.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-acm`
