---
name: cosmos
description: "Azure Cosmos DB for NoSQL JavaScript client with practical guidance for setup, partition keys, CRUD, queries, and patch operations"
metadata:
  languages: "javascript"
  versions: "4.9.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,cosmos,cosmos-db,nosql,javascript,database"
---

# Azure Cosmos DB JavaScript Client

## Golden Rule

Use `@azure/cosmos` for Azure Cosmos DB for NoSQL from JavaScript or TypeScript, and choose your partition key before you start writing data. Reuse a long-lived `CosmosClient`, prefer point reads when you know `id` and partition key, and use SQL queries only when you actually need them. This package is not the client for Cosmos DB MongoDB, Cassandra, Gremlin, or Table workloads.

## Install

Pin the version your project expects:

```bash
npm install @azure/cosmos@4.9.1
```

If you use TypeScript, the package ships its own types.

## Authentication And Setup

You need an Azure Cosmos DB for NoSQL account endpoint such as `https://<account>.documents.azure.com:443/` and an account key.

```bash
export COSMOS_ENDPOINT="https://<account>.documents.azure.com:443/"
export COSMOS_KEY="<account-key>"
export COSMOS_DATABASE_ID="appdb"
export COSMOS_CONTAINER_ID="items"
```

```js
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
```

Keep the endpoint and key in environment variables or your secret manager, not in source code.

## Client Initialization

Create one shared `CosmosClient` for your app or service component instead of creating a new client per request.

```js
import { CosmosClient } from "@azure/cosmos";

export const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
```

## Core Usage

### Create or get a database and container

Use `createIfNotExists` during setup, migrations, or local bootstrap paths. These are control-plane calls, so do not put them on every hot request path.

```js
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const { database } = await client.databases.createIfNotExists({
  id: process.env.COSMOS_DATABASE_ID,
});

const { container } = await database.containers.createIfNotExists({
  id: process.env.COSMOS_CONTAINER_ID,
  partitionKey: {
    paths: ["/tenantId"],
  },
});
```

### Create or upsert an item

Every item needs an `id`. If your container partition key is `/tenantId`, the document also needs `tenantId`.

```js
const item = {
  id: "item-1",
  tenantId: "acme",
  status: "open",
  title: "Initial document",
};

const { resource: saved } = await container.items.upsert(item);

console.log(saved.id);
```

Use `upsert` when replacing an existing document is acceptable. If you need create-only behavior, use `container.items.create(...)` instead.

### Read one item by `id` and partition key

When you know both values, use a point read instead of a query.

```js
const { resource: item } = await container.item("item-1", "acme").read();

console.log(item.status);
```

### Replace or delete an item

```js
const { resource: current } = await container.item("item-1", "acme").read();

const { resource: replaced } = await container.item("item-1", "acme").replace({
  ...current,
  status: "done",
});

console.log(replaced.status);

await container.item("item-1", "acme").delete();
```

### Patch part of a document

Use patch when you only need to change a few paths.

```js
const { resource: patched } = await container.item("item-1", "acme").patch([
  {
    op: "replace",
    path: "/status",
    value: "done",
  },
]);

console.log(patched.status);
```

### Run a parameterized query

Use query parameters instead of string interpolation.

```js
const querySpec = {
  query: "SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status",
  parameters: [
    { name: "@tenantId", value: "acme" },
    { name: "@status", value: "open" },
  ],
};

const { resources: openItems } = await container.items.query(querySpec).fetchAll();

for (const item of openItems) {
  console.log(item.id, item.status);
}
```

## Configuration Notes

- Reuse a single `CosmosClient`; client creation is not a lightweight health check.
- Treat the partition key as required application context. Point reads, replaces, patches, and deletes usually need it.
- Prefer `container.item(id, partitionKey).read()` over queries when you know both values.
- Use `createIfNotExists` for bootstrap code, not the hot path of every request.
- Keep secrets out of source control.
- Parameterize queries instead of building SQL strings manually.

## Common Pitfalls

- Using `@azure/cosmos` for the wrong Cosmos API surface. This guide is for Cosmos DB for NoSQL.
- Designing documents first and the partition key later.
- Creating a new `CosmosClient` for every operation.
- Forgetting the partition key on point reads, patches, replaces, and deletes.
- Using `upsert` where create-only semantics were required.
- Querying by `id` when a cheaper point read would work.

## Version Notes For 4.9.1

- This guide targets `@azure/cosmos` `4.9.1`.
- If you find older examples using `DocumentClient`, treat them as legacy and rewrite them to the current `CosmosClient` API.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/cosmos-readme?view=azure-node-latest`
- `CosmosClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/cosmosclient?view=azure-node-latest`
- `Container` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/cosmos/container?view=azure-node-latest`
- Azure Cosmos DB for NoSQL Node.js quickstart: `https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-nodejs`
- npm package page: `https://www.npmjs.com/package/@azure/cosmos`
