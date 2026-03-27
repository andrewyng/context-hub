---
name: payment-cryptography
description: "AWS SDK for JavaScript v3 client for Amazon Payment Cryptography control-plane key management, aliases, import and export preparation, and key lifecycle operations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,payment-cryptography,javascript,nodejs,control-plane,keys,aliases,cryptography"
---

# `@aws-sdk/client-payment-cryptography`

Use this package for Amazon Payment Cryptography **control-plane** operations in JavaScript and Node.js. It covers key creation and import, aliases, key metadata, import/export preparation, public-key certificate workflows, and key lifecycle actions such as enabling, disabling, deleting, and restoring keys.

This package does **not** perform data-plane cryptographic calls such as `EncryptData`, `DecryptData`, `GenerateMac`, or `TranslatePinData`. Keep that boundary clear in your app: this client manages keys and related metadata; the data plane uses a separate API.

## Install

```bash
npm install @aws-sdk/client-payment-cryptography
```

If you need explicit credential helpers instead of the default credential chain:

```bash
npm install @aws-sdk/credential-providers
```

## Initialize the client

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
# export AWS_SESSION_TOKEN=...   # if you use temporary credentials
# export AWS_PROFILE=...         # if you use shared AWS config
```

```javascript
import { PaymentCryptographyClient } from "@aws-sdk/client-payment-cryptography";

const paymentCryptography = new PaymentCryptographyClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

These are sensitive key-management APIs. In practice, use them from trusted backend code rather than directly from a browser.

## What this client covers

Use `@aws-sdk/client-payment-cryptography` for control-plane tasks such as:

- creating keys and reading key metadata
- creating, listing, and updating aliases
- fetching import or export parameters for TR-34 or key-cryptogram flows
- getting a certificate signing request or public key certificate for asymmetric keys
- stopping key usage, starting key usage, scheduling deletion, and restoring a key

Most list operations paginate with `NextToken`, so do not assume one response is complete.

## Core usage pattern

The AWS SDK for JavaScript v3 uses explicit command objects:

```javascript
import {
  GetKeyCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const response = await client.send(
  new GetKeyCommand({
    KeyIdentifier: "alias/acquirer/pin-key",
  }),
);

console.log(response.Key?.KeyArn, response.Key?.KeyState);
```

For operations that accept `KeyIdentifier`, you can usually pass either a full key ARN or an alias name that starts with `alias/`.

## Common operations

### Create a key

`CreateKey` requires a valid combination of immutable key attributes: `KeyUsage`, `KeyClass`, `KeyAlgorithm`, and `KeyModesOfUse`. Choose a combination that matches your payment use case.

```javascript
import {
  CreateKeyCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const { Key } = await client.send(
  new CreateKeyCommand({
    Exportable: true,
    Enabled: true,
    KeyCheckValueAlgorithm: "ANSI_X9_24",
    KeyAttributes: {
      KeyClass: "SYMMETRIC_KEY",
      KeyAlgorithm: "TDES_2KEY",
      KeyUsage: "TR31_P0_PIN_ENCRYPTION_KEY",
      KeyModesOfUse: {
        Encrypt: true,
        Decrypt: true,
      },
    },
  }),
);

console.log({
  keyArn: Key?.KeyArn,
  keyState: Key?.KeyState,
  keyCheckValue: Key?.KeyCheckValue,
});
```

The key attributes are immutable after creation. If you need a different key type or algorithm later, create a new key instead of expecting an in-place update.

### Create and inspect an alias

Aliases are region-local friendly names for keys. They must start with `alias/`, must be unique within the account and region, and always point to exactly one key at a time.

```javascript
import {
  CreateAliasCommand,
  GetAliasCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const keyArn = process.env.PAYMENT_KEY_ARN;

if (!keyArn) {
  throw new Error("Set PAYMENT_KEY_ARN before creating an alias");
}

const aliasName = "alias/acquirer/pin-key";

await client.send(
  new CreateAliasCommand({
    AliasName: aliasName,
    KeyArn: keyArn,
  }),
);

const { Alias } = await client.send(
  new GetAliasCommand({
    AliasName: aliasName,
  }),
);

console.log(Alias?.AliasName, Alias?.KeyArn);
```

Deleting or re-pointing an alias does not delete or modify the underlying key.

### List keys with pagination

`ListKeys` uses `NextToken` pagination.

```javascript
import {
  ListKeysCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const keys = [];
let nextToken;

do {
  const page = await client.send(
    new ListKeysCommand({
      KeyState: "CREATE_COMPLETE",
      MaxResults: 50,
      NextToken: nextToken,
    }),
  );

  keys.push(...(page.Keys ?? []));
  nextToken = page.NextToken;
} while (nextToken);

for (const key of keys) {
  console.log(key.KeyArn, key.KeyAttributes?.KeyUsage, key.Enabled);
}
```

### Read key metadata by ARN or alias

`GetKey` returns metadata only. It does not return raw key material.

```javascript
import {
  GetKeyCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const { Key } = await client.send(
  new GetKeyCommand({
    KeyIdentifier: "alias/acquirer/pin-key",
  }),
);

console.log({
  keyArn: Key?.KeyArn,
  keyState: Key?.KeyState,
  enabled: Key?.Enabled,
  exportable: Key?.Exportable,
  keyUsage: Key?.KeyAttributes?.KeyUsage,
  keyAlgorithm: Key?.KeyAttributes?.KeyAlgorithm,
  usageStartTimestamp: Key?.UsageStartTimestamp,
  usageStopTimestamp: Key?.UsageStopTimestamp,
});
```

### Stop and start key usage

If you need to take a key out of service without deleting it, use `StopKeyUsage`. You can later reactivate it with `StartKeyUsage`.

```javascript
import {
  PaymentCryptographyClient,
  StartKeyUsageCommand,
  StopKeyUsageCommand,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });
const keyIdentifier = "alias/acquirer/pin-key";

const stopResponse = await client.send(
  new StopKeyUsageCommand({
    KeyIdentifier: keyIdentifier,
  }),
);

console.log("stopped:", stopResponse.Key?.KeyState, stopResponse.Key?.UsageStopTimestamp);

const startResponse = await client.send(
  new StartKeyUsageCommand({
    KeyIdentifier: keyIdentifier,
  }),
);

console.log("started:", startResponse.Key?.KeyState, startResponse.Key?.UsageStartTimestamp);
```

### Schedule deletion and restore a key

`DeleteKey` does not delete immediately. It disables the key and schedules deletion after a waiting period. The default waiting period is 7 days, and the service model allows `DeleteKeyInDays` values from 3 to 180.

```javascript
import {
  DeleteKeyCommand,
  PaymentCryptographyClient,
  RestoreKeyCommand,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });
const keyIdentifier = "alias/acquirer/pin-key";

const deleteResponse = await client.send(
  new DeleteKeyCommand({
    KeyIdentifier: keyIdentifier,
    DeleteKeyInDays: 30,
  }),
);

console.log(
  deleteResponse.Key?.KeyState,
  deleteResponse.Key?.DeletePendingTimestamp,
);

const restoreResponse = await client.send(
  new RestoreKeyCommand({
    KeyIdentifier: keyIdentifier,
  }),
);

console.log(restoreResponse.Key?.KeyState);
```

If you are not sure whether a key can be retired, prefer `StopKeyUsage` first. Deletion is irreversible after the waiting period expires.

### Fetch import or export parameters

For TR-34 and key-cryptogram workflows, first request the temporary certificates and token that the later import or export step needs.

```javascript
import { writeFileSync } from "node:fs";
import {
  GetParametersForImportCommand,
  GetParametersForExportCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const importParams = await client.send(
  new GetParametersForImportCommand({
    KeyMaterialType: "TR34_KEY_BLOCK",
    WrappingKeyAlgorithm: "RSA_2048",
  }),
);

writeFileSync("./wrapping-key-certificate.pem", importParams.WrappingKeyCertificate ?? "");
writeFileSync("./wrapping-key-chain.pem", importParams.WrappingKeyCertificateChain ?? "");

console.log(importParams.ImportToken, importParams.ParametersValidUntilTimestamp);

const exportParams = await client.send(
  new GetParametersForExportCommand({
    KeyMaterialType: "TR34_KEY_BLOCK",
    SigningKeyAlgorithm: "RSA_2048",
  }),
);

writeFileSync("./signing-key-certificate.pem", exportParams.SigningKeyCertificate ?? "");
writeFileSync("./signing-key-chain.pem", exportParams.SigningKeyCertificateChain ?? "");

console.log(exportParams.ExportToken, exportParams.ParametersValidUntilTimestamp);
```

The import and export tokens expire after 30 days. While valid, the same token can be reused for multiple imports or exports in the same account.

### Generate a CSR for an asymmetric key pair

If you create an asymmetric key pair in Payment Cryptography, you can generate a certificate signing request directly from that key pair.

```javascript
import { writeFileSync } from "node:fs";
import {
  GetCertificateSigningRequestCommand,
  PaymentCryptographyClient,
} from "@aws-sdk/client-payment-cryptography";

const client = new PaymentCryptographyClient({ region: "us-east-1" });

const response = await client.send(
  new GetCertificateSigningRequestCommand({
    KeyIdentifier: "alias/acquirer/ecdh-key",
    SigningAlgorithm: "SHA256",
    CertificateSubject: {
      CommonName: "terminal.example.internal",
      Organization: "Example Payments",
      Country: "US",
    },
  }),
);

writeFileSync("./payment-cryptography-key.csr.pem", response.CertificateSigningRequest ?? "");
```

## Important details and pitfalls

- This client is region-scoped. Keys and aliases are created in one AWS region, and aliases are unique only within the account and region.
- Control-plane operations in this service are documented as same-account operations; do not design around cross-account use for these calls.
- `ListKeys`, `ListAliases`, and `ListTagsForResource` are paginated with `NextToken`.
- `GetKey` returns metadata, not plaintext key material.
- Alias names must start with `alias/`.
- `DeleteKey` schedules deletion instead of removing the key immediately; the service default is 7 days.
- If you download a public-key certificate with `GetPublicKeyCertificate`, the service describes that certificate as valid for 90 days.

## Minimal backend pattern

For a typical backend integration, the safe order is:

1. Create or import the key.
2. Create an alias such as `alias/acquirer/pin-key`.
3. Store the alias or key ARN in your application config.
4. Use key lifecycle APIs here for management tasks.
5. Use the Payment Cryptography data-plane API separately for actual cryptographic operations.
