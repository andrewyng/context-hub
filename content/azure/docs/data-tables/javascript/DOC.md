---
name: data-tables
description: "Azure Data Tables client for JavaScript with TableClient, TableServiceClient, authentication, and entity operations"
metadata:
  languages: "javascript"
  versions: "13.3.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,data-tables,azure-storage,cosmosdb,tables,odata,javascript"
---

# Azure Data Tables JavaScript Client

## Golden Rule

Use `@azure/data-tables` for Azure Table Storage and Azure Cosmos DB Table workloads. Reach for `TableServiceClient` when you need account-level operations such as creating or listing tables, and use `TableClient` for entity reads and writes. Every entity must include both `PartitionKey` and `RowKey`; most correctness issues come from partition design, OData filters, or assuming the SDK creates missing tables for you.

## Install

Pin the package version your project expects:

```bash
npm install @azure/data-tables@13.3.2
```

If you want Microsoft Entra ID or explicit named-key credentials, install the matching support packages too:

```bash
npm install @azure/data-tables@13.3.2 @azure/identity @azure/core-auth
```

## Authentication And Setup

The practical auth choices are:

- a connection string
- a named account key via `AzureNamedKeyCredential`
- a `TokenCredential` such as `DefaultAzureCredential`

Use connection strings for quick local setup. Prefer `DefaultAzureCredential` for deployed Azure workloads when you can assign the right data-plane role.

Use environment variables instead of hard-coding secrets:

```bash
export AZURE_TABLES_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
export AZURE_TABLES_ACCOUNT_URL="https://<account>.table.core.windows.net"
export AZURE_STORAGE_ACCOUNT_NAME="<account-name>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
export AZURE_TABLES_TABLE_NAME="products"
```

### Connection String

This is the simplest setup when you already have a storage or Cosmos Table connection string.

```js
import { TableServiceClient } from "@azure/data-tables";

const connectionString =
  process.env.AZURE_TABLES_CONNECTION_STRING ??
  process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error(
    "AZURE_TABLES_CONNECTION_STRING or AZURE_STORAGE_CONNECTION_STRING is required",
  );
}

const serviceClient =
  TableServiceClient.fromConnectionString(connectionString);
```

### Microsoft Entra ID With `DefaultAzureCredential`

Use this for deployed apps in Azure, or for local development after a developer sign-in such as:

```bash
az login
export AZURE_TABLES_ACCOUNT_URL="https://<account>.table.core.windows.net"
```

```js
import { TableServiceClient } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";

const accountUrl = process.env.AZURE_TABLES_ACCOUNT_URL;

if (!accountUrl) {
  throw new Error("AZURE_TABLES_ACCOUNT_URL is required");
}

const serviceClient = new TableServiceClient(
  accountUrl,
  new DefaultAzureCredential(),
);
```

For Azure Table Storage, the calling identity typically needs a table data role such as `Storage Table Data Contributor` or `Storage Table Data Reader`.

### Named Key Credential

Use this when your application explicitly manages storage account keys.

```js
import { TableServiceClient } from "@azure/data-tables";
import { AzureNamedKeyCredential } from "@azure/core-auth";

const accountUrl = process.env.AZURE_TABLES_ACCOUNT_URL;
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!accountUrl || !accountName || !accountKey) {
  throw new Error(
    "AZURE_TABLES_ACCOUNT_URL, AZURE_STORAGE_ACCOUNT_NAME, and AZURE_STORAGE_ACCOUNT_KEY are required",
  );
}

const serviceClient = new TableServiceClient(
  accountUrl,
  new AzureNamedKeyCredential(accountName, accountKey),
);
```

## Client Initialization

Create one long-lived `TableServiceClient`, then derive `TableClient` instances from it.

```js
import { TableServiceClient } from "@azure/data-tables";
import { DefaultAzureCredential } from "@azure/identity";
import { AzureNamedKeyCredential } from "@azure/core-auth";

export function createTableServiceClient() {
  const connectionString =
    process.env.AZURE_TABLES_CONNECTION_STRING ??
    process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (connectionString) {
    return TableServiceClient.fromConnectionString(connectionString);
  }

  const accountUrl = process.env.AZURE_TABLES_ACCOUNT_URL;

  if (!accountUrl) {
    throw new Error(
      "Set AZURE_TABLES_CONNECTION_STRING, AZURE_STORAGE_CONNECTION_STRING, or AZURE_TABLES_ACCOUNT_URL",
    );
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (accountName && accountKey) {
    return new TableServiceClient(
      accountUrl,
      new AzureNamedKeyCredential(accountName, accountKey),
    );
  }

  return new TableServiceClient(accountUrl, new DefaultAzureCredential());
}
```

The normal hierarchy is:

- `TableServiceClient`: account scope
- `TableClient`: one table

If your code only touches one known table, `TableClient.fromConnectionString(...)` is also fine.

## Core Usage

### Create A Table And Get A Table Client

Constructing a client does not create the table. Create it explicitly during setup.

```js
import { createTableServiceClient } from "./tablesClient.js";

const serviceClient = createTableServiceClient();
const tableName = process.env.AZURE_TABLES_TABLE_NAME ?? "products";

try {
  await serviceClient.createTable(tableName);
} catch (error) {
  if (error.statusCode !== 409) {
    throw error;
  }
}

const tableClient = serviceClient.getTableClient(tableName);
```

If the table is provisioned elsewhere, skip the `createTable(...)` call and just get the client.

### Insert Or Upsert An Entity

Every entity must include `PartitionKey` and `RowKey`.

```js
import { TableClient } from "@azure/data-tables";

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_TABLES_CONNECTION_STRING,
  process.env.AZURE_TABLES_TABLE_NAME ?? "products",
);

const entity = {
  PartitionKey: "inventory",
  RowKey: "sku-1001",
  name: "Widget",
  price: 9.99,
  inStock: true,
};

await tableClient.upsertEntity(entity, "Merge");
```

`upsertEntity(..., "Merge")` is the safest default when you want create-or-update behavior without replacing the whole stored entity.

### Read One Entity

```js
const entity = await tableClient.getEntity("inventory", "sku-1001");

console.log(entity.name, entity.price);
```

### Query Entities With OData Filters

Use the `odata` tagged template instead of building filter strings by hand.

```js
import { odata } from "@azure/data-tables";

const entities = tableClient.listEntities({
  queryOptions: {
    filter: odata`PartitionKey eq ${"inventory"} and price gt ${5}`,
    select: ["RowKey", "name", "price"],
  },
});

for await (const entity of entities) {
  console.log(entity.RowKey, entity.name, entity.price);
}
```

### Merge Vs Replace Updates

`Merge` updates only the properties you send. `Replace` overwrites the stored entity with the payload you provide.

```js
const entity = await tableClient.getEntity("inventory", "sku-1001");
entity.price = 8.99;

await tableClient.updateEntity(entity, "Merge");
```

Use `Replace` only when you intentionally want omitted properties removed.

### Delete An Entity

```js
await tableClient.deleteEntity("inventory", "sku-1001");
```

## Practical Notes

- Reuse clients instead of creating a new service or table client for every request.
- Use the table endpoint form `https://<account>.table.core.windows.net` for Entra ID or named-key clients.
- Keep connection strings and account keys in environment variables or a secret manager, not in source code.
- Azure Tables is keyed storage. Good `PartitionKey` and `RowKey` design matters more than ad hoc querying.
- The same package also works with Azure Cosmos DB Table endpoints; use the endpoint or connection string for that account instead of guessing the hostname.

## Common Pitfalls

- `getTableClient(...)` gives you a client object; it does not create the table.
- Every entity must include both `PartitionKey` and `RowKey`, and the pair must be unique.
- Query filters use OData, not SQL. Prefer the `odata` helper over manual string interpolation.
- `Merge` and `Replace` have very different behavior; `Replace` can drop fields you omitted.
- Optimistic concurrency still matters for updates. Pay attention to `etag` values when multiple writers can touch the same entity.
- Transaction batches are limited to a single partition in Azure Tables, so model related writes around partition boundaries.
- `DefaultAzureCredential` failures are often local environment problems: no `az login`, missing environment variables, or missing role assignments.

## Version Notes For `13.3.2`

- This guide targets `@azure/data-tables` `13.3.2`.
- Keep new code on the current `TableServiceClient` and `TableClient` surface from the 13.x package line.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/data-tables/`
- npm package page: `https://www.npmjs.com/package/@azure/data-tables`
