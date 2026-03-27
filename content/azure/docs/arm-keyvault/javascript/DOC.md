---
name: arm-keyvault
description: "Azure Key Vault management client for JavaScript with practical guidance for provisioning vaults, checking name availability, and updating ARM control-plane settings"
metadata:
  languages: "javascript"
  versions: "4.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,key-vault,arm,management,vaults,javascript"
---

# Azure Key Vault Management Client For JavaScript

## Golden Rule

Use `@azure/arm-keyvault` for Azure Resource Manager control-plane work on Key Vault resources: checking vault name availability, creating or updating vaults, listing vaults in a subscription or resource group, and changing ARM-managed settings such as tags or public network access.

Do not use this package to create secrets, read secret values, create keys, or manage certificates inside a vault. Those are data-plane operations and belong to `@azure/keyvault-secrets`, `@azure/keyvault-keys`, and `@azure/keyvault-certificates`.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-keyvault@4.0.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs a `TokenCredential` and your Azure subscription ID. For local development, the simplest path is usually Azure CLI login:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export KEY_VAULT_NAME="example-kv-1234"
export AZURE_LOCATION="eastus"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Set `AZURE_TENANT_ID` even if authentication itself comes from Azure CLI or managed identity. Creating a vault needs the tenant ID in the request payload; it is not inferred from the client constructor.

This package manages Key Vault resources that already live inside Azure Resource Manager. Your Azure subscription and target resource group should already exist before you create a vault.

## Client Initialization

Create one shared client and reuse it for related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { KeyVaultManagementClient } from "@azure/arm-keyvault";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const tenantId = process.env.AZURE_TENANT_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const vaultName = process.env.KEY_VAULT_NAME ?? "example-kv-1234";
const location = process.env.AZURE_LOCATION ?? "eastus";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!tenantId) {
  throw new Error("Set AZURE_TENANT_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const keyVaultClient = new KeyVaultManagementClient(
  credential,
  subscriptionId,
);

export { location, resourceGroupName, tenantId, vaultName };
```

Most control-plane work starts on `keyVaultClient.vaults`.

## Core Usage

### Check name availability before create

Key Vault names must be unique, so check availability before provisioning.

```js
import { keyVaultClient, vaultName } from "./client.js";

const availability = await keyVaultClient.vaults.checkNameAvailability({
  name: vaultName,
  type: "Microsoft.KeyVault/vaults",
});

if (!availability.nameAvailable) {
  throw new Error(
    availability.message ?? `Key Vault name ${vaultName} is unavailable.`,
  );
}
```

### Create or update a vault

Provisioning is a long-running ARM operation, so use `beginCreateOrUpdateAndWait(...)` when you need the final resource before moving on.

```js
import {
  keyVaultClient,
  location,
  resourceGroupName,
  tenantId,
  vaultName,
} from "./client.js";

const vault = await keyVaultClient.vaults.beginCreateOrUpdateAndWait(
  resourceGroupName,
  vaultName,
  {
    location,
    tags: {
      env: "dev",
      owner: "context-hub",
    },
    properties: {
      tenantId,
      sku: {
        family: "A",
        name: "standard",
      },
      accessPolicies: [],
      enableRbacAuthorization: true,
      enableSoftDelete: true,
      softDeleteRetentionInDays: 90,
      publicNetworkAccess: "Enabled",
    },
  },
);

console.log(vault.id);
console.log(vault.properties?.vaultUri);
```

Important details for create requests:

- `tenantId` is required.
- `accessPolicies` are required unless the create mode is recovery; when RBAC is enabled, an empty array is the usual shape.
- `softDeleteRetentionInDays` must be between `7` and `90`.

### Get one existing vault

Use `get(...)` when you already know the resource group and vault name.

```js
import { keyVaultClient, resourceGroupName, vaultName } from "./client.js";

const vault = await keyVaultClient.vaults.get(resourceGroupName, vaultName);

console.log(vault.id);
console.log(vault.properties?.vaultUri);
console.log(vault.properties?.enableRbacAuthorization);
```

### List vaults in a resource group

List results are paged async iterables, so iterate with `for await`.

```js
import { keyVaultClient, resourceGroupName } from "./client.js";

for await (const vault of keyVaultClient.vaults.listByResourceGroup(resourceGroupName)) {
  console.log(vault.name, vault.location, vault.properties?.vaultUri);
}
```

If you need a subscription-wide inventory, use `keyVaultClient.vaults.listBySubscription()` instead.

### Update vault tags or network settings

Use `update(...)` for partial changes instead of recreating the whole vault.

```js
import { keyVaultClient, resourceGroupName, vaultName } from "./client.js";

const updated = await keyVaultClient.vaults.update(
  resourceGroupName,
  vaultName,
  {
    tags: {
      env: "prod",
      owner: "platform",
    },
    properties: {
      publicNetworkAccess: "Disabled",
    },
  },
);

console.log(updated.tags);
console.log(updated.properties?.publicNetworkAccess);
```

## Configuration Notes

- Reuse one `KeyVaultManagementClient` instead of constructing a new client per operation.
- `AZURE_SUBSCRIPTION_ID` is required separately from your credential configuration.
- `AZURE_TENANT_ID` is part of the vault create payload, so set it explicitly even when `DefaultAzureCredential` can authenticate without it.
- Treat `listByResourceGroup(...)` and `listBySubscription()` results as async iterables, not plain arrays.
- Treat `beginCreateOrUpdateAndWait(...)` as the normal pattern when a later step depends on the created vault.
- `enableRbacAuthorization` changes data-action authorization inside the vault, but Azure Resource Manager management operations still use ARM RBAC.
- This package is control plane only; switch to the Key Vault data-plane SDKs after the vault exists.

## Common Pitfalls

- Using `@azure/arm-keyvault` for secrets, keys, or certificates instead of the `@azure/keyvault-*` data-plane packages.
- Authenticating successfully but forgetting to set `AZURE_SUBSCRIPTION_ID` when constructing `KeyVaultManagementClient`.
- Omitting `AZURE_TENANT_ID` or `properties.tenantId` when creating a vault.
- Leaving out `accessPolicies` on create requests even though the service still expects the field outside recovery scenarios.
- Assuming `enableRbacAuthorization: true` changes ARM control-plane authorization.
- Treating paged list results as arrays instead of async iterables.
- Reusing a deleted vault name too quickly without accounting for soft-delete and purge behavior.

## Version Notes For 4.0.0

- This guide targets `@azure/arm-keyvault` `4.0.0`.
- The examples use `KeyVaultManagementClient` from `@azure/arm-keyvault` and `DefaultAzureCredential` from `@azure/identity`.
- If you are adapting older Azure management samples, re-check the current `Vaults` reference for operation names and request property casing before copying them forward.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-keyvault/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-keyvault-readme?view=azure-node-latest`
- `KeyVaultManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-keyvault/keyvaultmanagementclient?view=azure-node-latest`
- `Vaults` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-keyvault/vaults?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-keyvault`
