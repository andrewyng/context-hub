---
name: digital-twins-core
description: "Azure Digital Twins JavaScript client for Microsoft Entra ID auth, DTDL model setup, twin and relationship operations, and ADT query workflows"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,digital-twins,iot,dtdl,javascript,azure-identity"
---

# @azure/digital-twins-core JavaScript Package Guide

## What This Package Is

`@azure/digital-twins-core` is the Azure SDK package for Azure Digital Twins data-plane operations from JavaScript or Node.js.

Use it when your code needs to:

- create and inspect DTDL models
- create, read, update, and delete digital twins
- create and traverse relationships between twins
- run ADT queries against twins and relationships
- update components and publish telemetry to configured downstream routes

This guide is scoped to `@azure/digital-twins-core` `2.0.0`.

## Golden Rules

- Use the Azure Digital Twins instance root as the endpoint: `https://<instance>.api.<region>.digitaltwins.azure.net`
- Authenticate with Microsoft Entra ID through `@azure/identity`; `DefaultAzureCredential` is the normal starting point
- The caller needs Azure Digital Twins data-plane RBAC, typically `Azure Digital Twins Data Reader` for reads or `Azure Digital Twins Data Owner` for writes
- The authenticated identity must belong to the same Microsoft Entra tenant as the target instance or requests can fail with `404 Sub-Domain not found`
- `upsertDigitalTwin(...)` replaces the twin document you send; use `updateDigitalTwin(...)` or `updateComponent(...)` for patch-style changes
- Query results are paged and eventually consistent, so read a known twin by ID when you need the latest state immediately after a write

## Install

Install the SDK and Azure Identity:

```bash
npm install @azure/digital-twins-core@2.0.0 @azure/identity
```

For local development, sign in with Azure CLI or provide service-principal credentials:

```bash
az login
```

## Service Setup And Environment

One practical environment convention is:

```bash
export AZURE_DIGITAL_TWINS_URL="https://<instance>.api.<region>.digitaltwins.azure.net"
```

For service-principal auth, `DefaultAzureCredential` also reads the standard Azure Identity variables:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

## Authentication And Client Initialization

Create one `DigitalTwinsClient` and reuse it across the part of your app that talks to Azure Digital Twins.

```js
import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_DIGITAL_TWINS_URL;

if (!endpoint) {
  throw new Error("Missing AZURE_DIGITAL_TWINS_URL");
}

const credential = new DefaultAzureCredential();
export const digitalTwinsClient = new DigitalTwinsClient(endpoint, credential);
```

## Core Usage

Azure Digital Twins is model-first. Upload the DTDL model before creating twin instances that reference it.

### Create DTDL models

```js
const models = [
  {
    "@id": "dtmi:example:Room;1",
    "@type": "Interface",
    "@context": "dtmi:dtdl:context;2",
    displayName: "Room",
    contents: [
      { "@type": "Property", name: "Temperature", schema: "double" },
      { "@type": "Telemetry", name: "Humidity", schema: "double" },
    ],
  },
];

const createdModels = await digitalTwinsClient.createModels(models);

for (const model of createdModels) {
  console.log(model.id);
}
```

### Upsert and read a twin

Set the model through `$metadata.$model` when creating or replacing a twin.

```js
const twinId = "room-101";

await digitalTwinsClient.upsertDigitalTwin(twinId, {
  $metadata: {
    $model: "dtmi:example:Room;1",
  },
  Temperature: 21.5,
});

const storedTwin = await digitalTwinsClient.getDigitalTwin(twinId);
console.log(storedTwin.$dtId, storedTwin.Temperature);
```

### Patch a twin

Use JSON Patch operations when you only want to change specific properties.

```js
await digitalTwinsClient.updateDigitalTwin("room-101", [
  { op: "replace", path: "/Temperature", value: 22.0 },
]);
```

### Query twins

`queryTwins(...)` returns a paged async iterator.

```js
const query = `
  SELECT twin
  FROM digitaltwins twin
  WHERE IS_OF_MODEL(twin, 'dtmi:example:Room;1')
`;

for await (const twin of digitalTwinsClient.queryTwins(query)) {
  console.log(twin.$dtId);
}
```

If you just wrote `room-101` and need its latest state immediately, call `getDigitalTwin("room-101")` instead of waiting for the query index to reflect the write.

### Create and traverse relationships

```js
const relationship = {
  $relationshipId: "building-1-contains-room-101",
  $sourceId: "building-1",
  $relationshipName: "contains",
  $targetId: "room-101",
};

await digitalTwinsClient.upsertRelationship(
  "building-1",
  relationship.$relationshipId,
  relationship,
);

for await (const rel of digitalTwinsClient.listRelationships("building-1")) {
  console.log(rel.$relationshipName, rel.$targetId);
}

for await (const rel of digitalTwinsClient.listIncomingRelationships("room-101")) {
  console.log(rel.relationshipName, rel.sourceId);
}
```

Relationship IDs are scoped to the source twin. Reusing the same relationship ID for the same source twin overwrites that relationship.

### Update a component

Use component patches when the model defines a component rather than a top-level property.

```js
await digitalTwinsClient.updateComponent("room-101", "thermostat", [
  { op: "replace", path: "/Temperature", value: 23.0 },
]);
```

## Minimal Script

This is a complete script that authenticates, ensures a twin exists, and reads it back:

```js
import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.AZURE_DIGITAL_TWINS_URL;

if (!endpoint) {
  throw new Error("Missing AZURE_DIGITAL_TWINS_URL");
}

const client = new DigitalTwinsClient(endpoint, new DefaultAzureCredential());

await client.upsertDigitalTwin("room-101", {
  $metadata: {
    $model: "dtmi:example:Room;1",
  },
  Temperature: 21.5,
});

const twin = await client.getDigitalTwin("room-101");
console.log(JSON.stringify(twin, null, 2));
```

## Common Pitfalls

- Passing a portal URL or a resource ID instead of the Azure Digital Twins instance endpoint root
- Using a principal from a different Microsoft Entra tenant than the instance tenant
- Treating `upsertDigitalTwin(...)` like a patch helper instead of a full twin replacement
- Forgetting that `queryTwins(...)`, `listRelationships(...)`, and `listIncomingRelationships(...)` are async iterators
- Expecting query results to reflect writes immediately instead of reading the twin by ID
- Reusing a `DefaultAzureCredential` setup with an unexpected cached local login or stale environment variables

## Version Notes For 2.0.0

- This guide targets `@azure/digital-twins-core` `2.0.0`
- Keep the endpoint, authentication, DTDL model, twin, relationship, and query patterns the same when moving between nearby `2.x` releases unless the maintainer reference calls out a breaking change
- Prefer the current Microsoft Learn package index and overview README over older blog posts or pre-GA samples when checking signatures

## Official Sources

- Microsoft Learn package index: `https://learn.microsoft.com/en-us/javascript/api/@azure/digital-twins-core/`
- Microsoft Learn overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/digital-twins-core-readme?view=azure-node-latest`
- Microsoft Learn `DigitalTwinsClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/digital-twins-core/digitaltwinsclient?view=azure-node-latest`
- Microsoft Learn Azure Digital Twins API and SDK overview: `https://learn.microsoft.com/en-us/azure/digital-twins/concepts-apis-sdks`
- Microsoft Learn Azure Digital Twins authentication guidance: `https://learn.microsoft.com/en-us/azure/digital-twins/how-to-authenticate-client`
- Microsoft Learn Azure Digital Twins query language guidance: `https://learn.microsoft.com/en-us/azure/digital-twins/concepts-query-language`
- Maintainer README: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/digitaltwins/digital-twins-core/README.md`
- npm package page: `https://www.npmjs.com/package/@azure/digital-twins-core`
