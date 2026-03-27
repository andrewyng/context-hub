---
name: arm-storage
description: "Azure Storage management client for JavaScript for provisioning storage accounts, updating account settings, and handling ARM control-plane operations"
metadata:
  languages: "javascript"
  versions: "19.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,storage,arm,management,storage-accounts,javascript"
---

# Azure Storage Management Client For JavaScript

## Golden Rule

Use `@azure/arm-storage` for Azure Resource Manager control-plane work on storage resources: checking storage account name availability, creating or deleting storage accounts, reading account properties, updating account settings, and listing or regenerating account keys.

Do not use this package to upload blobs, read files, send queue messages, or access table data. Those are data-plane operations and belong in packages such as `@azure/storage-blob`, `@azure/storage-file-share`, and `@azure/storage-queue`.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-storage@19.1.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs a `TokenCredential` and an Azure subscription ID. For local development, the quickest path is usually Azure CLI login:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export STORAGE_ACCOUNT_NAME="ctxhubstorageacct01"
export AZURE_LOCATION="westus2"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

This package manages storage resources that already live inside Azure Resource Manager. Your subscription and target resource group should already exist before you create a storage account.

## Client Initialization

Create one shared client and reuse it for related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { StorageManagementClient } from "@azure/arm-storage";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const accountName = process.env.STORAGE_ACCOUNT_NAME ?? "ctxhubstorageacct01";
const location = process.env.AZURE_LOCATION ?? "westus2";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const storageClient = new StorageManagementClient(
  credential,
  subscriptionId,
);

export { accountName, location, resourceGroupName };
```

Most day-to-day control-plane work starts on `storageClient.storageAccounts`.

## Core Usage

### Check name availability before create

Storage account names are globally unique, so check availability before you provision one.

```js
import { storageClient, accountName } from "./client.js";

const availability = await storageClient.storageAccounts.checkNameAvailability({
  name: accountName,
});

if (!availability.nameAvailable) {
  throw new Error(
    availability.message ?? `Storage account name ${accountName} is unavailable.`,
  );
}
```

### Create a storage account

Provisioning is a long-running ARM operation, so use the `AndWait` helper when you need the final resource before moving on.

```js
import {
  accountName,
  location,
  resourceGroupName,
  storageClient,
} from "./client.js";

const account = await storageClient.storageAccounts.beginCreateAndWait(
  resourceGroupName,
  accountName,
  {
    location,
    kind: "StorageV2",
    sku: {
      name: "Standard_LRS",
    },
    tags: {
      env: "dev",
      owner: "context-hub",
    },
    enableHttpsTrafficOnly: true,
    minimumTlsVersion: "TLS1_2",
    allowBlobPublicAccess: false,
  },
);

console.log(account.id);
console.log(account.primaryEndpoints?.blob);
```

### List accounts in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { resourceGroupName, storageClient } from "./client.js";

for await (const account of storageClient.storageAccounts.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(account.name, account.location, account.kind);
}
```

### Get one account's properties

Use `getProperties` when you already know the storage account name.

```js
import { accountName, resourceGroupName, storageClient } from "./client.js";

const account = await storageClient.storageAccounts.getProperties(
  resourceGroupName,
  accountName,
);

console.log(account.id);
console.log(account.primaryEndpoints?.blob);
console.log(account.sku?.name);
```

### Update account settings and tags

Use `update()` for patch-style account changes.

```js
import { accountName, resourceGroupName, storageClient } from "./client.js";

const updated = await storageClient.storageAccounts.update(
  resourceGroupName,
  accountName,
  {
    tags: {
      env: "prod",
      owner: "platform",
    },
    allowSharedKeyAccess: false,
    publicNetworkAccess: "Enabled",
  },
);

console.log(updated.tags);
```

### List account keys only when you need shared-key workflows

Management APIs can return storage account keys, but application code should usually prefer Microsoft Entra ID plus the relevant data-plane SDK.

```js
import { accountName, resourceGroupName, storageClient } from "./client.js";

const result = await storageClient.storageAccounts.listKeys(
  resourceGroupName,
  accountName,
);

for (const key of result.keys ?? []) {
  console.log(key.keyName);
}
```

### Regenerate one account key

Regenerate only the key you intend to rotate.

```js
import { accountName, resourceGroupName, storageClient } from "./client.js";

const rotated = await storageClient.storageAccounts.regenerateKey(
  resourceGroupName,
  accountName,
  {
    keyName: "key1",
  },
);

console.log(rotated.keys?.find((key) => key.keyName === "key1")?.keyName);
```

### Delete a storage account

Delete is also a long-running ARM operation.

```js
import { accountName, resourceGroupName, storageClient } from "./client.js";

await storageClient.storageAccounts.beginDeleteAndWait(
  resourceGroupName,
  accountName,
);
```

## Configuration Notes

- Reuse one `StorageManagementClient` instead of constructing a new client per request.
- `AZURE_SUBSCRIPTION_ID` is required separately from your credential configuration.
- Use `DefaultAzureCredential` for both local development and deployed workloads so your auth flow stays consistent.
- Treat `list(...)` and `listByResourceGroup(...)` results as async iterables, not plain arrays.
- Use `beginCreateAndWait(...)` and `beginDeleteAndWait(...)` when you need the ARM operation to be complete before the next step.
- Storage account management is control plane only; switch to data-plane SDKs after the account exists.

## Common Pitfalls

- Confusing `@azure/arm-storage` with `@azure/storage-blob` or other data-plane packages.
- Authenticating successfully but forgetting to set `AZURE_SUBSCRIPTION_ID` when constructing `StorageManagementClient`.
- Skipping the name-availability check even though storage account names are globally unique.
- Calling a long-running `begin...` method without waiting for the poller to finish.
- Treating paged results as materialized arrays instead of async iterables.
- Pulling account keys from ARM for application traffic when Entra ID plus RBAC would be safer.

## Version Notes For 19.1.0

- This guide targets `@azure/arm-storage` `19.1.0`.
- The examples use `StorageManagementClient` from `@azure/arm-storage` and `DefaultAzureCredential` from `@azure/identity`.
- If you are adapting older Azure management examples, re-check operation names and model fields against the `19.1.0` Learn reference before copying them into a project.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-storage/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-storage-readme?view=azure-node-latest`
- `StorageManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-storage/storagemanagementclient?view=azure-node-latest`
- `StorageAccounts` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-storage/storageaccounts?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-storage`
