---
name: keyvault-certificates
description: "Azure Key Vault certificates JavaScript client for authenticating with DefaultAzureCredential and managing certificate create, get, import, list, delete, and recovery workflows"
metadata:
  languages: "javascript"
  versions: "4.10.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,keyvault,certificates,javascript,security,cloud"
---

# Azure Key Vault Certificates JavaScript Client

## Golden Rule

Use `@azure/keyvault-certificates` with `CertificateClient` for certificate lifecycle operations in Azure Key Vault: create or import certificates, fetch the latest or a specific version, list certificate metadata, and delete or recover certificates. Pair it with `@azure/identity` for authentication, and treat every `begin*` method as a long-running operation that should finish with `await poller.pollUntilDone()` before the next dependent step.

If your workflow crosses Key Vault surfaces, use the adjacent packages for those surfaces instead of overloading the certificates client:

- `@azure/identity` for credentials
- `@azure/keyvault-secrets` for secret operations
- `@azure/keyvault-keys` for key operations

## Install

```bash
npm install @azure/keyvault-certificates@4.10.0 @azure/identity
```

The package includes TypeScript types.

## Authentication And Setup

The normal setup uses `DefaultAzureCredential`, which can use your Azure CLI login locally, managed identity in Azure, or service principal environment variables.

For local development:

```bash
az login
export KEY_VAULT_URL="https://<your-key-vault>.vault.azure.net"
```

If you use a service principal instead of Azure CLI or managed identity:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
export KEY_VAULT_URL="https://<your-key-vault>.vault.azure.net"
```

Authorization notes:

- `@azure/keyvault-certificates` does not authenticate by itself; you must provide a credential.
- Use the full vault URL, not just the vault name.
- If requests fail with `403 Forbidden`, check that the identity has Key Vault data-plane permissions for certificates.
- In Azure RBAC setups, the official quickstart uses the `Key Vault Certificates Officer` role for certificate management.

## Initialize A Client

```js
import { DefaultAzureCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";

const vaultUrl = process.env.KEY_VAULT_URL;

if (!vaultUrl) {
  throw new Error("KEY_VAULT_URL is required");
}

const credential = new DefaultAzureCredential();
const client = new CertificateClient(vaultUrl, credential);
```

Create one shared `CertificateClient` for the part of your app that talks to Key Vault instead of creating a new client per operation.

## Core Usage

### Create A Self-Signed Certificate

Use `beginCreateCertificate(...)` and wait for the poller to complete.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";

const client = new CertificateClient(
  process.env.KEY_VAULT_URL,
  new DefaultAzureCredential(),
);

const createPoller = await client.beginCreateCertificate("app-cert", {
  issuerName: "Self",
  subject: "CN=app-cert",
});

const created = await createPoller.pollUntilDone();

console.log(created.name);
console.log(created.properties.version);
```

For issuer-backed or more customized certificates, pass a fuller certificate policy instead of the minimal self-signed policy above.

### Get The Latest Certificate Or A Specific Version

Use `getCertificate(...)` for the latest version. Use `getCertificateVersion(...)` when you already know the exact version you need.

```js
const latest = await client.getCertificate("app-cert");

console.log(latest.name);
console.log(latest.properties.version);
console.log(latest.policy?.issuerName);

const exactVersion = await client.getCertificateVersion(
  "app-cert",
  "certificate-version-id",
);

console.log(exactVersion.properties.version);
```

### List Certificate Metadata And Versions

List operations return certificate properties, which is what you usually want for inventory and version inspection.

```js
for await (const properties of client.listPropertiesOfCertificates()) {
  console.log(properties.name, properties.enabled);
}

for await (const properties of client.listPropertiesOfCertificateVersions("app-cert")) {
  console.log(properties.version, properties.createdOn);
}
```

If you need the deleted-certificate record after a delete operation, fetch it explicitly:

```js
const deleted = await client.getDeletedCertificate("app-cert");
console.log(deleted.recoveryId);
```

### Import An Existing Certificate

Use `importCertificate(...)` when you already have a certificate file that includes its private key.

```js
import { readFile } from "node:fs/promises";
import { DefaultAzureCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";

const client = new CertificateClient(
  process.env.KEY_VAULT_URL,
  new DefaultAzureCredential(),
);

const pfx = await readFile("./certificate.pfx");

const imported = await client.importCertificate("imported-cert", pfx, {
  password: process.env.CERTIFICATE_PASSWORD,
});

console.log(imported.name);
console.log(imported.properties.version);
```

When import fails, check the file format, the presence of the private key, and whether the password matches the certificate archive.

### Recover Or Permanently Delete A Certificate

Key Vault soft-delete behavior matters for automation. Deleting a certificate and immediately recreating it can fail until the deleted certificate is recovered or purged.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { CertificateClient } from "@azure/keyvault-certificates";

const client = new CertificateClient(
  process.env.KEY_VAULT_URL,
  new DefaultAzureCredential(),
);

const deletePoller = await client.beginDeleteCertificate("app-cert");
const deleted = await deletePoller.pollUntilDone();

console.log(deleted.name);

const recoverPoller = await client.beginRecoverDeletedCertificate("app-cert");
const recovered = await recoverPoller.pollUntilDone();

console.log(recovered.name);
```

`purgeDeletedCertificate(...)` is irreversible and only succeeds when the vault's recovery level allows purging.

To permanently remove a certificate instead of recovering it, delete it again, wait for that poller to finish, and then call `await client.purgeDeletedCertificate("app-cert")`.

## Common Pitfalls

- Installing `@azure/keyvault-certificates` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Passing only the vault name when the client expects the full `https://<name>.vault.azure.net` URL.
- Assuming `beginCreateCertificate(...)`, `beginDeleteCertificate(...)`, or `beginRecoverDeletedCertificate(...)` finish immediately.
- Expecting list operations to return the same payload as `getCertificate(...)`.
- Recreating a deleted certificate name immediately without accounting for soft-delete and purge protection.
- Treating `401` or `403` responses as SDK bugs before checking Azure identity setup and Key Vault permissions.
- Using the certificates client for secret or key workflows that belong in `@azure/keyvault-secrets` or `@azure/keyvault-keys`.

## Version Notes For `4.10.0`

- This guide targets `@azure/keyvault-certificates` `4.10.0`.
- If you find older examples using the legacy `azure-keyvault` package, rewrite them to the current `@azure/keyvault-certificates` and `@azure/identity` APIs.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/keyvault-certificates-readme?view=azure-node-latest`
- `CertificateClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/certificateclient?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/keyvault-certificates`
