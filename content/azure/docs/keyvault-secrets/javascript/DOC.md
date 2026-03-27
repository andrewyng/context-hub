---
name: keyvault-secrets
description: "Azure Key Vault Secrets client library for JavaScript with SecretClient, DefaultAzureCredential, secret versioning, and soft-delete workflows"
metadata:
  languages: "javascript"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,key-vault,secrets,azure-keyvault-secrets,azure-identity,javascript"
---

# Azure Key Vault Secrets JavaScript Client

## Golden Rule

Use `@azure/keyvault-secrets` for data-plane secret work inside an existing Azure Key Vault, pair it with `@azure/identity` for credentials, pass the full vault URL such as `https://my-vault.vault.azure.net`, and treat delete and recover flows as long-running operations. `setSecret(...)` creates a secret or a new version, while list operations return secret metadata rather than secret values.

## Install

Install the secrets client and an Azure credential provider together:

```bash
npm install @azure/keyvault-secrets@4.10.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The standard setup uses `DefaultAzureCredential`, which can authenticate with Azure CLI locally, managed identity in Azure, or service principal environment variables.

For local development:

```bash
az login
export KEY_VAULT_URL="https://<your-vault-name>.vault.azure.net"
```

For service principal authentication:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export KEY_VAULT_URL="https://<your-vault-name>.vault.azure.net"
```

Minimal client setup:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const vaultUrl = process.env.KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("KEY_VAULT_URL is required");
}

const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);
```

Authorization notes:

- `@azure/keyvault-secrets` does not authenticate by itself; you need a credential such as `DefaultAzureCredential`.
- The caller needs Key Vault data-plane permissions for secret operations such as get, set, list, delete, recover, and purge.
- If requests fail with `401` or `403`, check the Azure identity in use and the vault permissions before assuming the secret name is wrong.
- Use the full vault URL, not just the vault name.

## Core Usage

### Read The Latest Secret Value

`getSecret(name)` returns the latest version when you do not specify a version.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const client = new SecretClient(
  process.env.KEY_VAULT_URL,
  new DefaultAzureCredential(),
);

const secret = await client.getSecret("db-password");

console.log(secret.value);
console.log(secret.properties.version);
```

### Create Or Rotate A Secret

`setSecret(...)` creates the secret if it does not exist. If the name already exists, the call creates a new version.

```js
const expiresOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const created = await client.setSecret("db-password", "s3cr3t-value", {
  contentType: "text/plain",
  tags: {
    env: "prod",
    owner: "payments",
  },
  expiresOn,
});

console.log(created.name);
console.log(created.properties.version);
```

### Get A Specific Secret Version

Fetch the latest version first if you need to capture the current version identifier, then request that exact version explicitly.

```js
const latest = await client.getSecret("db-password");
const version = latest.properties.version;

const exactVersion = await client.getSecret("db-password", {
  version,
});

console.log(exactVersion.value);
console.log(exactVersion.properties.version);
```

### Update Secret Metadata Only

`updateSecretProperties(...)` changes metadata on one existing secret version. It does not change the secret value.

```js
const current = await client.getSecret("db-password");

const updated = await client.updateSecretProperties(
  "db-password",
  current.properties.version,
  {
    enabled: true,
    tags: {
      env: "prod",
      rotatedBy: "deploy-job",
    },
    expiresOn: new Date("2026-04-30T00:00:00Z"),
  },
);

console.log(updated.version);
console.log(updated.tags);
```

If you need a new value, call `setSecret(...)` again.

### List Secrets And Versions

List operations return secret properties, not secret values:

```js
for await (const properties of client.listPropertiesOfSecrets()) {
  console.log(properties.name, properties.version, properties.updatedOn);
}
```

```js
for await (const properties of client.listPropertiesOfSecretVersions("db-password")) {
  console.log(properties.version, properties.enabled, properties.expiresOn);
}
```

If you need the value for one listed secret, call `getSecret(...)` after listing.

### Delete, Recover, And Purge

Delete and recover return pollers. Wait for them to finish if later steps depend on the final state.

```js
const deletePoller = await client.beginDeleteSecret("db-password");
const deleted = await deletePoller.pollUntilDone();

console.log(deleted.name);
console.log(deleted.recoveryId);
```

Recover a soft-deleted secret:

```js
const recoverPoller = await client.beginRecoverDeletedSecret("db-password");
const recovered = await recoverPoller.pollUntilDone();

console.log(recovered.name);
```

Purge permanently:

```js
await client.purgeDeletedSecret("db-password");
```

With soft-delete enabled, a deleted secret name can remain unavailable for immediate reuse until the secret is recovered or purged.

### Backup And Restore

```js
const backup = await client.backupSecret("db-password");
const restored = await client.restoreSecretBackup(backup);

console.log(restored.id);
```

The backup payload is an Azure Key Vault backup blob intended for restore back into Key Vault.

## Common Pitfalls

- Installing `@azure/keyvault-secrets` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Passing only the vault name when `SecretClient` expects the full `https://<name>.vault.azure.net` URL.
- Assuming `listPropertiesOfSecrets()` or `listPropertiesOfSecretVersions()` include secret values.
- Using `updateSecretProperties(...)` when you actually need a new secret value.
- Assuming `beginDeleteSecret(...)` or `beginRecoverDeletedSecret(...)` finish immediately.
- Recreating a deleted secret name too quickly without accounting for soft-delete and purge behavior.
- Treating `401` or `403` responses as SDK bugs before checking Azure identity setup and Key Vault permissions.

## Version Notes For `4.10.0`

- This guide targets `@azure/keyvault-secrets` `4.10.0`.
- If you are adapting much older Key Vault samples, re-check the current `@azure/identity` and `@azure/keyvault-secrets` initialization pattern before copying them forward.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-secrets/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/keyvault-secrets-readme?view=azure-node-latest`
- `SecretClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-secrets/secretclient?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/keyvault-secrets`
