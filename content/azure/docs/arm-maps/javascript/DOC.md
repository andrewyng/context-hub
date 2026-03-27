---
name: arm-maps
description: "Azure Maps management client for JavaScript with practical guidance for provisioning Maps accounts, rotating keys, generating SAS tokens, and managing ARM resources"
metadata:
  languages: "javascript"
  versions: "3.1.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,arm,maps,management,sas,keys,javascript"
---

# Azure Maps Management Client For JavaScript

## Golden Rule

Use `@azure/arm-maps` for Azure Resource Manager work on Azure Maps resources: creating and updating Maps accounts, listing or regenerating account keys, generating SAS tokens, and inspecting management-plane resources. Do not use it for search, routing, or rendering requests. Those data-plane calls belong in Azure Maps client packages instead.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-maps@3.1.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs Azure credentials and a subscription ID. For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
```

For CI or deployed applications, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Most operations also need an existing Azure resource group. This package manages Azure Maps resources inside Azure Resource Manager; it does not create the subscription itself.

## Client Initialization

Create one shared client and reuse it for related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { MapsManagementClient } from "@azure/arm-maps";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const mapsClient = new MapsManagementClient(credential, subscriptionId);
export { resourceGroupName };
```

The main operation groups to expect are:

- `mapsClient.accounts`
- `mapsClient.creators`
- `mapsClient.maps`

## Core Usage

### Create or update a Maps account

Creating a Maps account is an ARM resource operation. Use the long-running helper when you need the final resource before moving on.

```js
import { mapsClient, resourceGroupName } from "./client.js";

const account = await mapsClient.accounts.beginCreateOrUpdateAndWait(
  resourceGroupName,
  "example-maps-account",
  {
    location: "global",
    kind: "Gen2",
    sku: { name: "G2" },
    tags: {
      env: "dev",
      owner: "context-hub",
    },
  },
);

console.log(account.id);
console.log(account.properties?.uniqueId);
```

For partial updates, use `update(...)` with only the fields you want to change:

```js
import { mapsClient, resourceGroupName } from "./client.js";

const updated = await mapsClient.accounts.update(
  resourceGroupName,
  "example-maps-account",
  {
    tags: {
      env: "prod",
      owner: "platform",
    },
    publicNetworkAccess: "Enabled",
  },
);

console.log(updated.tags);
```

Important account settings in the current ARM schema include:

- `disableLocalAuth`: disables shared-key and SAS authentication
- `publicNetworkAccess`: enables or blocks public endpoint access
- `cors`: configures CORS rules for the account
- `linkedResources`: links supporting resources such as storage

If you plan to use account keys or SAS tokens, do not enable `disableLocalAuth`.

### List accounts in a resource group

List operations are paged async iterables, so iterate with `for await`.

```js
import { mapsClient, resourceGroupName } from "./client.js";

for await (const account of mapsClient.accounts.listByResourceGroup(resourceGroupName)) {
  console.log(account.name, account.location, account.kind);
}
```

### Get one account

```js
import { mapsClient, resourceGroupName } from "./client.js";

const account = await mapsClient.accounts.get(
  resourceGroupName,
  "example-maps-account",
);

console.log(account.id);
console.log(account.location);
console.log(account.properties?.uniqueId);
```

## Shared Keys And SAS Tokens

### List account keys

Use the management client to retrieve the shared keys that data-plane Azure Maps clients can use with `AzureKeyCredential`.

```js
import { mapsClient, resourceGroupName } from "./client.js";

const keys = await mapsClient.accounts.listKeys(
  resourceGroupName,
  "example-maps-account",
);

console.log(keys.primaryKey);
console.log(keys.secondaryKey);
```

### Regenerate one key

```js
import { mapsClient, resourceGroupName } from "./client.js";

const newKeys = await mapsClient.accounts.regenerateKeys(
  resourceGroupName,
  "example-maps-account",
  {
    keyType: "primary",
  },
);

console.log(newKeys.primaryKey);
```

Use a staged rotation flow in production:

1. move clients to the secondary key
2. regenerate the primary key
3. move clients back if needed
4. regenerate the secondary key

### Generate a SAS token

Use `listSas(...)` when you need a SAS token for Azure Maps clients that support `AzureSASCredential`.

```js
import { mapsClient, resourceGroupName } from "./client.js";

const principalId = process.env.AZURE_MAPS_UAMI_OBJECT_ID;

if (!principalId) {
  throw new Error("Set AZURE_MAPS_UAMI_OBJECT_ID before generating a SAS token.");
}

const start = new Date();
const expiry = new Date(start.getTime() + 60 * 60 * 1000);

const token = await mapsClient.accounts.listSas(
  resourceGroupName,
  "example-maps-account",
  {
    signingKey: "primaryKey",
    principalId,
    maxRatePerSecond: 500,
    start: start.toISOString(),
    expiry: expiry.toISOString(),
    regions: ["eastus"],
  },
);

console.log(token.accountSasToken);
```

Before this works:

- the Maps account must already have a user-assigned managed identity attached
- the identity must be in the same region as the Maps account
- local auth must still be enabled on the account

## Delete An Account

Deleting the ARM resource is also a long-running operation.

```js
import { mapsClient, resourceGroupName } from "./client.js";

await mapsClient.accounts.beginDeleteAndWait(
  resourceGroupName,
  "example-maps-account",
);
```

## Creator Resources

The package still exposes Creator operations, and the Azure resource model still documents `Microsoft.Maps/accounts/creators`. Treat this as a compatibility surface, not a default new build target: Microsoft announced Azure Maps Creator retirement effective September 30, 2025.

If you inherit code that already uses Creator resources, verify service availability and retirement impact before writing new automation around `mapsClient.creators`.

## Configuration Notes

- Reuse one `MapsManagementClient` instead of creating a new client for every call.
- Keep `AZURE_SUBSCRIPTION_ID` in application configuration; credentials do not replace it.
- Treat list results as async iterables, not arrays.
- Use `beginCreateOrUpdateAndWait` and `beginDeleteAndWait` when you need ARM changes to finish before the next step.
- Leave local auth enabled if your applications still depend on shared keys or SAS tokens.
- Use `location: "global"`, `kind: "Gen2"`, and `sku.name: "G2"` for current Gen2 account provisioning.

## Common Pitfalls

- Using `@azure/arm-maps` for search, routing, or rendering calls instead of a data-plane Azure Maps package.
- Forgetting to install and configure `@azure/identity` alongside `@azure/arm-maps`.
- Passing credentials correctly but omitting the subscription ID when constructing `MapsManagementClient`.
- Expecting `listByResourceGroup(...)` to return a plain array instead of a paged async iterator.
- Disabling local auth and then expecting `listKeys(...)` or SAS-based application auth to keep working.
- Treating SAS generation as self-contained when the account identity prerequisites are not already configured.
- Building new Creator automation without checking the post-September 30, 2025 retirement status first.

## Version Notes For 3.1.0

- This guide targets `@azure/arm-maps` `3.1.0`.
- The examples use `MapsManagementClient` from `@azure/arm-maps` and `DefaultAzureCredential` from `@azure/identity`.
- Azure Maps account management and Azure Maps data-plane usage are separate concerns; keep `@azure/arm-maps` for ARM provisioning and account auth flows.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-maps/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-maps-readme?view=azure-node-latest`
- `MapsManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-maps/mapsmanagementclient?view=azure-node-latest`
- `Accounts` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-maps/accounts?view=azure-node-latest`
- `Creators` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-maps/creators?view=azure-node-latest`
- Azure Maps authentication overview: `https://learn.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication`
- Manage Azure Maps authentication: `https://learn.microsoft.com/en-us/azure/azure-maps/how-to-manage-authentication`
- ARM template reference for Maps accounts: `https://learn.microsoft.com/en-us/azure/templates/microsoft.maps/accounts`
- ARM template reference for Maps creators: `https://learn.microsoft.com/en-us/azure/templates/microsoft.maps/accounts/creators`
- Azure Maps Creator retirement notice: `https://azure.microsoft.com/en-us/updates?id=azure-maps-creator-services-retirement-on-30-september-2025`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-maps`
