---
name: qldb
description: "AWS SDK for JavaScript v3 client for Amazon QLDB control-plane operations"
metadata:
  languages: "javascript"
  versions: "3.918.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,qldb,aws-sdk,javascript,nodejs,ledger"
---

# `@aws-sdk/client-qldb` JavaScript Package Guide

## Golden Rule

Use `@aws-sdk/client-qldb` for **Amazon QLDB control-plane operations** in JavaScript: creating, listing, describing, updating, and deleting ledgers.

This package is **not** the session API used for PartiQL document transactions. If you need to work with ledger sessions and transaction execution, use the separate QLDB session client package instead of trying to do it through this client.

## Install

Pin the package version you are using:

```bash
npm install @aws-sdk/client-qldb@3.918.0
```

If you want to load a named AWS profile explicitly in code, install the credential providers package too:

```bash
npm install @aws-sdk/client-qldb@3.918.0 @aws-sdk/credential-providers@3.918.0
```

## Authentication And Region Setup

The client uses the normal AWS SDK for JavaScript v3 credential chain. In practice, the safest setups are:

- local development with `aws configure` and a named profile
- AWS-hosted runtimes with an attached IAM role
- temporary credentials instead of hardcoded long-lived keys

Typical local setup:

```bash
aws configure --profile dev
export AWS_PROFILE=dev
export AWS_REGION=us-east-1
```

If you are using environment-variable credentials directly, the SDK also reads the usual values:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=us-east-1
```

Keep secrets out of source control. Prefer shared AWS config, IAM roles, or other temporary-credential flows when possible.

## Initialize The Client

### Default credential chain

```javascript
import { QLDBClient } from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit named profile

```javascript
import { QLDBClient } from "@aws-sdk/client-qldb";
import { fromIni } from "@aws-sdk/credential-providers";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

Pass `region` explicitly unless your application already centralizes region resolution elsewhere.

## Common Workflows

### List ledgers

```javascript
import { QLDBClient, ListLedgersCommand } from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function listLedgers() {
  const response = await client.send(
    new ListLedgersCommand({
      MaxResults: 10,
    })
  );

  for (const ledger of response.Ledgers ?? []) {
    console.log(ledger.Name, ledger.State);
  }

  return response.NextToken;
}
```

Use `NextToken` to continue paging when you need the full ledger list.

### Create a ledger

`PermissionsMode` is required. The API supports QLDB's permissions modes; the example below uses `STANDARD`.

```javascript
import { QLDBClient, CreateLedgerCommand } from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function createLedger(name) {
  const response = await client.send(
    new CreateLedgerCommand({
      Name: name,
      PermissionsMode: "STANDARD",
      DeletionProtection: true,
    })
  );

  console.log(response.Name, response.State, response.Arn);
  return response;
}

await createLedger("app-ledger");
```

### Describe a ledger

```javascript
import { QLDBClient, DescribeLedgerCommand } from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function describeLedger(name) {
  const response = await client.send(
    new DescribeLedgerCommand({
      Name: name,
    })
  );

  console.log({
    name: response.Name,
    state: response.State,
    permissionsMode: response.PermissionsMode,
    deletionProtection: response.DeletionProtection,
  });

  return response;
}
```

### Update deletion protection

Ledger deletion protection is controlled through `UpdateLedgerCommand`.

```javascript
import { QLDBClient, UpdateLedgerCommand } from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function setDeletionProtection(name, enabled) {
  return client.send(
    new UpdateLedgerCommand({
      Name: name,
      DeletionProtection: enabled,
    })
  );
}

await setDeletionProtection("app-ledger", false);
```

### Delete a ledger

If deletion protection is enabled, disable it first and then call `DeleteLedgerCommand`.

```javascript
import {
  QLDBClient,
  UpdateLedgerCommand,
  DeleteLedgerCommand,
} from "@aws-sdk/client-qldb";

const client = new QLDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function deleteLedger(name) {
  await client.send(
    new UpdateLedgerCommand({
      Name: name,
      DeletionProtection: false,
    })
  );

  await client.send(
    new DeleteLedgerCommand({
      Name: name,
    })
  );
}

await deleteLedger("app-ledger");
```

## What This Package Does Not Cover

- It does not run PartiQL statements or manage QLDB session transactions.
- It does not replace AWS credential or IAM setup.
- It does not give you a higher-level document client; you work with the generated command classes directly.

Treat this package as the QLDB **management** client.

## Common Pitfalls

### Mixing up QLDB and QLDB Session APIs

`@aws-sdk/client-qldb` manages ledgers and related control-plane resources. It is the wrong client for transaction execution against ledger documents.

### Forgetting to set a region

Always provide `region` directly or make sure your runtime exports `AWS_REGION`. Region resolution errors look like credential problems surprisingly often.

### Deletion protection blocks ledger removal

If a ledger was created with `DeletionProtection: true`, `DeleteLedgerCommand` will not succeed until you disable it with `UpdateLedgerCommand`.

### Copying older v2 examples

This package is the modular AWS SDK for JavaScript v3 client. Prefer imports from `@aws-sdk/client-qldb` and `client.send(new SomeCommand(...))` over older `aws-sdk` v2 examples.

## Version-Sensitive Notes

- This guide targets `@aws-sdk/client-qldb` version `3.918.0`.
- The package is part of the modular AWS SDK for JavaScript v3 line.
- Amazon QLDB's developer guide says the service reached end of support on July 31, 2025, so this package is primarily relevant for maintaining existing QLDB integrations.

## Official Sources

- AWS SDK for JavaScript v3 QLDB client docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/qldb/
- npm package page: https://www.npmjs.com/package/@aws-sdk/client-qldb
- AWS SDK for JavaScript v3 credential settings for Node.js: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html
- Amazon QLDB developer guide API reference: https://docs.aws.amazon.com/qldb/latest/developerguide/api-reference.html
- Amazon QLDB overview and end-of-support notice: https://docs.aws.amazon.com/qldb/latest/developerguide/what-is.html
