---
name: eventhubs-checkpointstore-blob
description: "Azure Blob Storage checkpoint store for Event Hubs consumers with durable checkpoints and partition ownership coordination"
metadata:
  languages: "javascript"
  versions: "2.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,event-hubs,eventhubs,checkpoint-store,blob-storage,javascript,nodejs"
---

# Azure Event Hubs Blob Checkpoint Store For JavaScript

## Golden Rule

Use `@azure/eventhubs-checkpointstore-blob` as the blob-backed checkpoint store for `@azure/event-hubs` consumers. Create a `ContainerClient`, pass it to `new BlobCheckpointStore(containerClient)`, and then pass that checkpoint store to `EventHubConsumerClient`. Durable progress is only written when your event handler calls `context.updateCheckpoint(...)`.

This guide targets `@azure/eventhubs-checkpointstore-blob` `2.0.0`.

## Install

Install the checkpoint store with the Event Hubs and Blob Storage clients it plugs into:

```bash
npm install @azure/eventhubs-checkpointstore-blob@2.0.0 @azure/event-hubs@6.0.3 @azure/storage-blob
```

If you want Microsoft Entra ID authentication, install `@azure/identity` too:

```bash
npm install @azure/eventhubs-checkpointstore-blob@2.0.0 @azure/event-hubs@6.0.3 @azure/storage-blob @azure/identity
```

## Prerequisites

- an Azure Event Hubs namespace and event hub
- a consumer group such as `$Default`
- an Azure Storage account and blob container for checkpoint records
- if you use `DefaultAzureCredential`, a local `az login`, supported environment-based credentials, or a managed identity in Azure
- Event Hubs data-plane RBAC for the consumer identity
- `Storage Blob Data Contributor` on the checkpoint container or storage account when the storage account also uses Microsoft Entra ID

Recommended environment variables:

```bash
export EVENTHUB_FULLY_QUALIFIED_NAMESPACE="<namespace>.servicebus.windows.net"
export EVENTHUB_NAME="<event-hub-name>"
export EVENTHUB_CONSUMER_GROUP='$Default'
export AZURE_STORAGE_ACCOUNT_NAME="<storage-account-name>"
export EVENTHUB_CHECKPOINT_CONTAINER="eventhub-checkpoints"
export AZURE_STORAGE_CONNECTION_STRING="<storage-connection-string>"
```

## Preferred Setup: `DefaultAzureCredential`

Use one credential for both Event Hubs and Blob Storage when your app already uses Microsoft Entra ID:

```js
import { DefaultAzureCredential } from "@azure/identity";
import {
  EventHubConsumerClient,
  earliestEventPosition,
} from "@azure/event-hubs";
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob";
import { BlobServiceClient } from "@azure/storage-blob";

const fullyQualifiedNamespace = process.env.EVENTHUB_FULLY_QUALIFIED_NAMESPACE;
const eventHubName = process.env.EVENTHUB_NAME;
const consumerGroup = process.env.EVENTHUB_CONSUMER_GROUP ?? "$Default";
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName =
  process.env.EVENTHUB_CHECKPOINT_CONTAINER ?? "eventhub-checkpoints";

if (!fullyQualifiedNamespace || !eventHubName || !storageAccountName) {
  throw new Error(
    "EVENTHUB_FULLY_QUALIFIED_NAMESPACE, EVENTHUB_NAME, and AZURE_STORAGE_ACCOUNT_NAME are required",
  );
}

const credential = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net`,
  credential,
);

const containerClient = blobServiceClient.getContainerClient(containerName);
await containerClient.createIfNotExists();

const checkpointStore = new BlobCheckpointStore(containerClient);

const consumer = new EventHubConsumerClient(
  consumerGroup,
  fullyQualifiedNamespace,
  eventHubName,
  credential,
  checkpointStore,
);

const subscription = consumer.subscribe(
  {
    async processEvents(events, context) {
      if (events.length === 0) {
        return;
      }

      for (const event of events) {
        console.log(context.partitionId, event.sequenceNumber, event.body);
      }

      await context.updateCheckpoint(events[events.length - 1]);
    },
    async processError(error, context) {
      console.error(`Consumer error on ${context.partitionId}:`, error);
    },
  },
  {
    startPosition: earliestEventPosition,
  },
);

process.on("SIGINT", async () => {
  await subscription.close();
  await consumer.close();
  process.exit(0);
});
```

Use `earliestEventPosition` when a new consumer should read existing backlog first. If you only want new events after startup, switch to `latestEventPosition` from `@azure/event-hubs`.

## Create The Checkpoint Store From A Blob Connection String

If Blob Storage auth is managed separately from Event Hubs auth, build the checkpoint store from a storage connection string:

```js
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob";
import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName =
  process.env.EVENTHUB_CHECKPOINT_CONTAINER ?? "eventhub-checkpoints";

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is required");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

await containerClient.createIfNotExists();

const checkpointStore = new BlobCheckpointStore(containerClient);
```

You can then pass `checkpointStore` into your `EventHubConsumerClient` setup.

## Common Workflow

The normal sequence is:

1. create or get a blob container with `BlobServiceClient`
2. create `new BlobCheckpointStore(containerClient)`
3. construct `EventHubConsumerClient` with that checkpoint store
4. call `consumer.subscribe(...)`
5. call `context.updateCheckpoint(event)` after processing the event you want to commit

The checkpoint store is what lets long-running consumers resume from stored progress and coordinate partition ownership through Blob Storage.

## Practical Notes

- Reuse long-lived `BlobServiceClient`, `ContainerClient`, and `EventHubConsumerClient` instances instead of recreating them for every receive loop.
- Create the checkpoint container during startup with `createIfNotExists()` so the consumer does not fail on the first ownership or checkpoint write.
- Keep connection strings and other secrets in environment variables or a secret manager, not in source code.
- With Microsoft Entra ID, make sure the same identity can read Event Hubs and write blobs before debugging the SDK surface.

## Common Pitfalls

- Forgetting `context.updateCheckpoint(...)` and then expecting the next process restart to resume from the last processed event.
- Leaving `startPosition` implicit and then wondering why existing backlog was skipped.
- Creating the `BlobCheckpointStore` but not passing it to `EventHubConsumerClient`.
- Using a storage identity that can list containers but cannot write checkpoint blobs.
- Hard-coding the blob endpoint incorrectly instead of using `https://<account>.blob.core.windows.net`.

## Version Notes For `2.0.0`

- This guide targets `@azure/eventhubs-checkpointstore-blob` `2.0.0`.
- The documented package surface is `BlobCheckpointStore`, constructed with a `ContainerClient` from `@azure/storage-blob`.
- The consumer examples use the current `EventHubConsumerClient.subscribe(...)` handler shape from `@azure/event-hubs`.

## Official Sources Used

- Microsoft Learn package API root: `https://learn.microsoft.com/en-us/javascript/api/@azure/eventhubs-checkpointstore-blob/`
- `BlobCheckpointStore` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/eventhubs-checkpointstore-blob/blobcheckpointstore?view=azure-node-latest`
- Event Hubs overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/event-hubs-readme?view=azure-node-latest`
- `EventHubConsumerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/event-hubs/eventhubconsumerclient?view=azure-node-latest`
- Storage Blob overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-blob-readme?view=azure-node-latest`
- `ContainerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-blob/containerclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/eventhubs-checkpointstore-blob`
