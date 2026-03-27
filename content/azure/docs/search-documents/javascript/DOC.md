---
name: search-documents
description: "Azure AI Search JavaScript SDK for index schema, document indexing, querying, authentication, and stable 12.2.0 usage notes"
metadata:
  languages: "javascript"
  versions: "12.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-ai-search,search,indexing,rbac,javascript"
---

# @azure/search-documents JavaScript Package Guide

## What This Package Is

`@azure/search-documents` is the official Azure AI Search JavaScript SDK for data-plane work.

Use it when your code needs to:

- create and manage search indexes
- upload, merge, delete, and fetch indexed documents
- run keyword, filtered, semantic, vector, and hybrid searches against an existing index
- manage data source connections, indexers, skillsets, and synonym maps

Primary client types:

- `SearchClient`: query and mutate documents in one existing index
- `SearchIndexClient`: create, update, list, and delete indexes and related schema objects
- `SearchIndexerClient`: manage pull-based indexing resources such as data sources, skillsets, and indexers

This guide is scoped to `@azure/search-documents` `12.2.0`.

## Golden Rules

- Use the service endpoint root, not an index URL: `https://<service-name>.search.windows.net`
- Use a query key only for read-only queries; use an admin key or RBAC for writes and schema changes
- `uploadDocuments()` inserts a new document or replaces the stored document with the same key
- `mergeDocuments()` updates only named fields and fails if the document does not already exist
- `mergeOrUploadDocuments()` is the safest default for idempotent sync jobs
- Search document keys are case-sensitive, must be unique, and must be a top-level string field in the index

## Install

Install the SDK:

```bash
npm install @azure/search-documents
```

If you want Microsoft Entra ID authentication:

```bash
npm install @azure/search-documents @azure/identity
```

## Service Setup And Environment

Typical environment variables:

```bash
export AZURE_SEARCH_SERVICE_ENDPOINT="https://<service-name>.search.windows.net"
export AZURE_SEARCH_INDEX_NAME="hotels"
export AZURE_SEARCH_API_KEY="<admin-or-query-key>"
```

For service principal authentication, `DefaultAzureCredential` also uses the standard Azure Identity variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

Keep one naming convention in your app. Azure samples commonly use both `SEARCH_*` and `AZURE_SEARCH_*` variables.

## Authentication And Client Initialization

### API key authentication

Use API keys for the simplest bootstrap path.

- query key: read-only queries from client apps
- admin key: index creation, document writes, indexer management, and other mutations

```js
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const client = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
);
```

### Microsoft Entra ID authentication

Use `DefaultAzureCredential` for local development with `az login`, managed identity, or a service principal.

```js
import { SearchClient } from "@azure/search-documents";
import { DefaultAzureCredential } from "@azure/identity";

const client = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new DefaultAzureCredential(),
);
```

Role mapping that matters in practice:

- query only: `Search Index Data Reader`
- document uploads and updates: `Search Index Data Contributor`
- schema and index management: `Search Service Contributor`
- end-to-end quickstart flows that create, load, and query often need all three roles on the same principal

## Core Index Setup

This is the minimum useful schema flow for most apps: define fields, create or update the index, then reuse `SearchClient` for writes and queries.

```js
import {
  AzureKeyCredential,
  SearchIndexClient,
} from "@azure/search-documents";

const indexClient = new SearchIndexClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
);

const index = {
  name: process.env.AZURE_SEARCH_INDEX_NAME,
  fields: [
    {
      name: "hotelId",
      type: "Edm.String",
      key: true,
      filterable: true,
    },
    {
      name: "hotelName",
      type: "Edm.String",
      searchable: true,
    },
    {
      name: "description",
      type: "Edm.String",
      searchable: true,
    },
    {
      name: "rating",
      type: "Edm.Double",
      filterable: true,
      sortable: true,
    },
  ],
};

await indexClient.createOrUpdateIndex(index);
```

Use `SearchIndexClient` for index lifecycle and schema work. Use `SearchClient` for document writes and queries against an existing index.

## Upload, Merge, And Delete Documents

```js
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
);

const uploadResult = await searchClient.uploadDocuments([
  {
    hotelId: "1",
    hotelName: "Stay Kay City Hotel",
    description: "Modern hotel with rooftop lounge",
    rating: 4.6,
  },
  {
    hotelId: "2",
    hotelName: "Blue River Resort",
    description: "Waterfront rooms near downtown",
    rating: 4.2,
  },
]);

console.log(uploadResult.results.map((item) => ({
  key: item.key,
  succeeded: item.succeeded,
})));

await searchClient.mergeDocuments([
  {
    hotelId: "1",
    rating: 4.8,
  },
]);

await searchClient.mergeOrUploadDocuments([
  {
    hotelId: "3",
    hotelName: "Northwind Suites",
    description: "Walkable downtown location",
    rating: 4.4,
  },
]);

await searchClient.deleteDocuments("hotelId", ["2"]);
```

Behavior to remember:

- `uploadDocuments()` inserts or fully replaces the document with that key
- `mergeDocuments()` updates only named fields, but requires the document to exist
- `mergeOrUploadDocuments()` acts like merge if the key exists and upload if it does not
- `deleteDocuments()` is keyed by the document key; other fields do not matter to the delete action
- bulk indexing responses are per-document, so inspect the returned results instead of assuming the whole batch succeeded

## Query Documents

```js
import { AzureKeyCredential, SearchClient } from "@azure/search-documents";

const client = new SearchClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
);

const searchResults = await client.search("restaurant", {
  filter: "rating ge 4",
  select: ["hotelId", "hotelName", "rating"],
  top: 5,
});

for await (const result of searchResults.results) {
  console.log(
    result.document.hotelId,
    result.document.hotelName,
    result.document.rating,
  );
}

const document = await client.getDocument("1");
console.log(document.hotelName);
```

Useful search patterns:

- `client.search("*", options)` returns a match-all result set
- `filter` uses OData filter syntax on fields marked `filterable`
- `select` reduces payload size and latency
- `searchFields` limits which searchable fields are queried
- `getDocument(key)` is the direct lookup path when you already know the key
- `suggest()` and `autocomplete()` require suggester-aware index configuration

The current JavaScript client surface also includes semantic and vector query options. Those only work when the target service and index are configured for those features.

## SearchIndexerClient When You Need Pull-Based Ingestion

Use `SearchIndexerClient` when Azure AI Search should pull from a data source instead of your app pushing JSON documents directly.

```js
import {
  AzureKeyCredential,
  SearchIndexerClient,
} from "@azure/search-documents";

const indexerClient = new SearchIndexerClient(
  process.env.AZURE_SEARCH_SERVICE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY),
);
```

This client is the right surface for:

- data source connections
- indexers
- skillsets
- synonym maps

If your task is "load app-owned JSON records into an existing index", start with `SearchClient` instead. If your task is "crawl blob storage, SQL, or Cosmos and enrich content", use `SearchIndexerClient`.

## Configuration And Compatibility Notes

- Reuse long-lived `SearchClient`, `SearchIndexClient`, and `SearchIndexerClient` instances instead of creating them for every request.
- Keep the endpoint, keys, and credentials in environment variables or a secret manager, not in source code.
- Prefer `DefaultAzureCredential` for Azure-hosted workloads instead of client secrets when possible.
- Pass the service root endpoint, not a portal URL and not an `/indexes/<name>` path.
- Features like semantic ranking, vector search, and hybrid queries depend on both SDK support and service-side configuration.

## Common Pitfalls

- Using a query key for uploads or index creation.
- Passing the wrong endpoint; the client expects `https://<service-name>.search.windows.net`.
- Assuming `uploadDocuments()` is a partial update; it replaces an existing document with the same key.
- Forgetting to inspect per-document indexing results in bulk operations.
- Expecting `mergeDocuments()` to create a missing document.
- Calling `suggest()` or `autocomplete()` without defining a suggester in the index.

## Version Notes For `12.2.0`

- This guide targets `@azure/search-documents` `12.2.0`.
- When you copy older JavaScript samples, rewrite them to the current `@azure/search-documents` client surface instead of legacy package families.
- Client methods can expose features that still depend on your Azure AI Search service tier, API support, and index configuration.

## Official Sources Used

- Microsoft Learn package overview: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/search-documents-readme?view=azure-node-latest`
- Microsoft Learn API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/search-documents/`
- `SearchClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/search-documents/searchclient?view=azure-node-latest`
- `SearchIndexClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/search-documents/searchindexclient?view=azure-node-latest`
- `SearchIndexerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/search-documents/searchindexerclient?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- Azure AI Search product docs: `https://learn.microsoft.com/en-us/azure/search/`
- npm package page: `https://www.npmjs.com/package/@azure/search-documents`
