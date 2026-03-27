---
name: keyvault-keys
description: "Azure Key Vault Keys client library for creating, managing, and using cryptographic keys from JavaScript and TypeScript"
metadata:
  languages: "javascript"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,key-vault,keys,kms,cryptography,javascript"
---

# Azure Key Vault Keys JavaScript Client

## Golden Rule

Use `@azure/keyvault-keys` for key lifecycle operations, pair it with `@azure/identity` for credentials, and use `CryptographyClient` when you need encrypt, decrypt, sign, verify, wrap, or unwrap operations against a specific key. Treat delete and recover flows as long-running operations and wait for their pollers to finish before assuming the key state changed.

## Install

Install the key client and an Azure credential provider together:

```bash
npm install @azure/keyvault-keys@4.10.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The standard setup uses `DefaultAzureCredential`, which can use Azure CLI login locally, managed identity in Azure, or service principal environment variables.

For local development:

```bash
az login
export KEY_VAULT_URL="https://<your-vault-name>.vault.azure.net"
```

If you use a service principal instead of Azure CLI or managed identity, configure the usual Azure Identity environment variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export KEY_VAULT_URL="https://<your-vault-name>.vault.azure.net"
```

Basic client setup:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { KeyClient } from "@azure/keyvault-keys";

const vaultUrl = process.env.KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("KEY_VAULT_URL is required");
}

const credential = new DefaultAzureCredential();
const client = new KeyClient(vaultUrl, credential);
```

Authorization notes:

- `@azure/keyvault-keys` does not authenticate by itself; you need a credential such as `DefaultAzureCredential`.
- If requests fail with `403 Forbidden`, check that the identity has Key Vault data-plane permissions for keys.
- Use the full vault URL, not just the vault name.

## Core Usage

### Create And Fetch Keys

Create an RSA key and fetch its current version:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { KeyClient } from "@azure/keyvault-keys";

const vaultUrl = process.env.KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("KEY_VAULT_URL is required");
}

const credential = new DefaultAzureCredential();
const client = new KeyClient(vaultUrl, credential);

const createdKey = await client.createRsaKey("app-signing-key", {
  size: 2048,
});

const currentKey = await client.getKey("app-signing-key");

console.log(createdKey.name);
console.log(currentKey.properties.version);
```

Create an elliptic curve key:

```js
const ecKey = await client.createEcKey("webhook-signing-key");
console.log(ecKey.name);
```

### List Key Metadata And Versions

List operations return key properties, which is usually what you want for inventory and version inspection:

```js
for await (const properties of client.listPropertiesOfKeys()) {
  console.log(properties.name, properties.enabled);
}

for await (const properties of client.listPropertiesOfKeyVersions("app-signing-key")) {
  console.log(properties.version, properties.createdOn);
}
```

If you need the deleted-key record, fetch it explicitly:

```js
const deletedKey = await client.getDeletedKey("app-signing-key");
console.log(deletedKey.recoveryId);
```

### Update Key Properties

Update metadata on a specific key version:

```js
const key = await client.getKey("app-signing-key");

const updated = await client.updateKeyProperties(
  "app-signing-key",
  key.properties.version,
  {
    enabled: true,
    tags: {
      service: "api",
      owner: "platform",
    },
  },
);

console.log(updated.properties.updatedOn);
```

### Delete, Recover, And Purge Keys

Delete and recover are long-running operations. Wait for the pollers before moving on to dependent work:

```js
const deletePoller = await client.beginDeleteKey("app-signing-key");
const deletedKey = await deletePoller.pollUntilDone();

console.log(deletedKey.name);

const recoverPoller = await client.beginRecoverDeletedKey("app-signing-key");
const recoveredKey = await recoverPoller.pollUntilDone();

console.log(recoveredKey.name);

// If you need to permanently remove a deleted key instead of recovering it:
// await client.purgeDeletedKey("app-signing-key");
```

### Use `CryptographyClient` For Crypto Operations

`KeyClient` manages keys. `CryptographyClient` performs cryptographic operations with a specific key:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { KeyClient, CryptographyClient } from "@azure/keyvault-keys";

const vaultUrl = process.env.KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("KEY_VAULT_URL is required");
}

const credential = new DefaultAzureCredential();
const keyClient = new KeyClient(vaultUrl, credential);
const key = await keyClient.getKey("app-signing-key");

const cryptoClient = new CryptographyClient(key.id, credential);

const plaintext = new TextEncoder().encode("secret payload");
const encryptResult = await cryptoClient.encrypt("RSA-OAEP", plaintext);
const decryptResult = await cryptoClient.decrypt("RSA-OAEP", encryptResult.result);

console.log(new TextDecoder().decode(decryptResult.result));
```

The same client also exposes signing, verification, key wrapping, and key unwrapping operations.

## Configuration Notes

- Reuse long-lived `KeyClient` and `CryptographyClient` instances instead of creating them for every request.
- Keep `KEY_VAULT_URL` and credentials in environment variables or a secret manager, not in source code.
- Prefer managed identity for Azure-hosted workloads instead of client secrets.
- Use `KeyClient` for create, get, list, update, delete, recover, backup, and restore operations.
- Use `CryptographyClient` when the application needs data-plane crypto operations against an existing key.

## Common Pitfalls

- Installing only `@azure/keyvault-keys` and forgetting `@azure/identity`.
- Passing only the vault name when the client expects the full `https://<name>.vault.azure.net` URL.
- Treating `401` and `403` responses as SDK bugs before checking credentials and Key Vault permissions.
- Expecting list operations to return the same payload as `getKey(...)`.
- Forgetting that delete and recover operations are poller-based.
- Recreating a deleted key name immediately without considering soft-delete and purge protection settings.
- Mixing up `KeyClient` and `CryptographyClient`; they are related but solve different problems.

## Version Notes For `4.10.0`

- This guide targets `@azure/keyvault-keys` `4.10.0`.
- If you find older examples using the legacy `azure-keyvault` package, rewrite them to the current `@azure/keyvault-keys` and `@azure/identity` APIs.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-keys/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/keyvault-keys-readme?view=azure-node-latest`
- `KeyClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-keys/keyclient?view=azure-node-latest`
- `CryptographyClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-keys/cryptographyclient?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/keyvault-keys`
