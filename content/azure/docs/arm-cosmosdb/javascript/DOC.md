---
name: arm-cosmosdb
description: "Azure Cosmos DB management client for JavaScript with ARM authentication, account inspection, key retrieval, and SQL resource provisioning"
metadata:
  languages: "javascript"
  versions: "16.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,cosmosdb,arm,management,javascript"
---

# Azure Cosmos DB Management Client For JavaScript

## Golden Rule

Use `@azure/arm-cosmosdb` for Azure Resource Manager control-plane work on Cosmos DB resources: listing accounts, reading account properties, retrieving account keys, and creating or updating SQL databases and containers.

Do not use this package for item CRUD, queries, or container data access. Those are data-plane operations and belong in `@azure/cosmos`.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-cosmosdb@16.4.0 @azure/identity
```

The package ships with TypeScript types.

## Authentication And Setup

The client needs a `TokenCredential` and an Azure subscription ID. For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="rg-app-prod"
export COSMOS_ACCOUNT_NAME="example-cosmos-account"
export COSMOS_SQL_DATABASE_NAME="appdb"
export COSMOS_SQL_CONTAINER_NAME="items"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service principal credentials:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Important setup rules:

- The identity must have Azure RBAC permission on the subscription or resource group that owns the Cosmos DB account.
- `DefaultAzureCredential` can authenticate successfully with Azure CLI or other developer credentials while still pointing at the wrong subscription, so keep `AZURE_SUBSCRIPTION_ID` explicit.
- This package manages ARM resources. Resource group names and account names are ARM identifiers, not Cosmos DB endpoint URLs.

## Client Initialization

Create one shared client and reuse it across related operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { CosmosDBManagementClient } from "@azure/arm-cosmosdb";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const accountName = process.env.COSMOS_ACCOUNT_NAME;
const databaseName = process.env.COSMOS_SQL_DATABASE_NAME ?? "appdb";
const containerName = process.env.COSMOS_SQL_CONTAINER_NAME ?? "items";

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

if (!accountName) {
  throw new Error("Set COSMOS_ACCOUNT_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const cosmosClient = new CosmosDBManagementClient(credential, subscriptionId);
export { accountName, containerName, databaseName, resourceGroupName };
```

The main operation groups to expect are:

- `cosmosClient.databaseAccounts`
- `cosmosClient.sqlResources`

The client also exposes API-specific groups such as `mongoDBResources`, `cassandraResources`, `gremlinResources`, and `tableResources` when you manage non-SQL Cosmos DB APIs.

## Core Usage

### List Cosmos DB accounts in the subscription

List operations are paged async iterables, so iterate with `for await`.

```js
import { cosmosClient } from "./client.js";

for await (const account of cosmosClient.databaseAccounts.list()) {
  console.log(account.name, account.location, account.documentEndpoint);
}
```

If you already know the target account, use `get(...)` for the full ARM resource payload.

```js
import {
  accountName,
  cosmosClient,
  resourceGroupName,
} from "./client.js";

const account = await cosmosClient.databaseAccounts.get(
  resourceGroupName,
  accountName,
);

console.log(account.id);
console.log(account.documentEndpoint);
```

### Read account keys

Use the account management operations when an automation task needs the current primary or secondary keys.

```js
import {
  accountName,
  cosmosClient,
  resourceGroupName,
} from "./client.js";

const keys = await cosmosClient.databaseAccounts.listKeys(
  resourceGroupName,
  accountName,
);

console.log(keys.primaryMasterKey);
console.log(keys.secondaryMasterKey);
```

Treat returned keys like secrets. Do not log them in real applications or CI output.

### Create or update a SQL database

SQL API database management lives under `sqlResources`. Create and update operations are long-running ARM operations, so use the `AndWait` helper when later steps depend on the final resource.

```js
import {
  accountName,
  cosmosClient,
  databaseName,
  resourceGroupName,
} from "./client.js";

const database = await cosmosClient.sqlResources.beginCreateUpdateSqlDatabaseAndWait(
  resourceGroupName,
  accountName,
  databaseName,
  {
    resource: {
      id: databaseName,
    },
  },
);

console.log(database.name);
```

### Create or update a SQL container

The container definition needs a partition key. Keep the partition key aligned with the data model the application will use later through `@azure/cosmos`.

```js
import {
  accountName,
  containerName,
  cosmosClient,
  databaseName,
  resourceGroupName,
} from "./client.js";

const container = await cosmosClient.sqlResources.beginCreateUpdateSqlContainerAndWait(
  resourceGroupName,
  accountName,
  databaseName,
  containerName,
  {
    resource: {
      id: containerName,
      partitionKey: {
        paths: ["/tenantId"],
        kind: "Hash",
      },
    },
  },
);

console.log(container.name);
```

### List SQL databases and containers

```js
import {
  accountName,
  cosmosClient,
  databaseName,
  resourceGroupName,
} from "./client.js";

for await (const database of cosmosClient.sqlResources.listSqlDatabases(
  resourceGroupName,
  accountName,
)) {
  console.log(database.name);
}

for await (const container of cosmosClient.sqlResources.listSqlContainers(
  resourceGroupName,
  accountName,
  databaseName,
)) {
  console.log(container.name);
}
```

## Configuration Notes

- Reuse one `CosmosDBManagementClient` instead of constructing a new client for every operation.
- Keep `AZURE_SUBSCRIPTION_ID` explicit even when local Azure CLI login is available.
- Use `databaseAccounts` for account metadata, keys, failover, and account-level settings.
- Use `sqlResources` for SQL databases, containers, throughput, and SQL API role-definition or role-assignment management.
- Choose the operation group that matches the account API type; SQL API resource methods do not live under `databaseAccounts`.

## Common Pitfalls

- Treating `@azure/arm-cosmosdb` as the SDK for document reads and writes. Use `@azure/cosmos` for data-plane work.
- Installing `@azure/arm-cosmosdb` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Forgetting to await `beginCreateUpdateSqlDatabaseAndWait(...)` or `beginCreateUpdateSqlContainerAndWait(...)` before assuming the resource is ready.
- Passing a Cosmos DB endpoint URL where ARM methods expect a resource group name and account name.
- Assuming list operations return plain arrays instead of paged async iterables.
- Designing a SQL container here with the wrong partition key and then discovering the mismatch later in the data-plane client.
- Logging `listKeys(...)` results or writing them into build logs.

## Version Notes For `16.4.0`

- This guide targets `@azure/arm-cosmosdb` `16.4.0`.
- Prefer the current `@azure/identity` credential flow and promise-based client methods when rewriting older Cosmos DB management samples.
- For Cosmos DB item access, continue to use `@azure/cosmos`; this package is the ARM management client.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-cosmosdb/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-cosmosdb-readme?view=azure-node-latest`
- `CosmosDBManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-cosmosdb/cosmosdbmanagementclient?view=azure-node-latest`
- `databaseAccounts` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-cosmosdb/databaseaccounts?view=azure-node-latest`
- `sqlResources` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-cosmosdb/sqlresources?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-cosmosdb`
