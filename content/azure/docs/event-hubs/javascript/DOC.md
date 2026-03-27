---
name: event-hubs
description: "Azure Event Hubs JavaScript client for connection strings or Entra ID auth, producing events, consuming with subscribe, and blob-backed checkpointing"
metadata:
  languages: "javascript"
  versions: "6.0.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,event-hubs,eventhubs,messaging,streaming,amqp,javascript"
---

# Azure Event Hubs JavaScript Client

## Golden Rule

Use `@azure/event-hubs` with `EventHubProducerClient` for publishing and `EventHubConsumerClient` for receiving. Prefer Microsoft Entra ID with `DefaultAzureCredential` for deployed applications, use a connection string for local scripts or narrowly scoped automation, and always set the consumer `startPosition` deliberately so you know whether the process should read backlog or only new events.

This guide targets `@azure/event-hubs` `6.0.3`.

## Install

Pin the package version your app expects:

```bash
npm install @azure/event-hubs@6.0.3
```

If you authenticate with Microsoft Entra ID, install `@azure/identity` too:

```bash
npm install @azure/event-hubs@6.0.3 @azure/identity
```

If you want blob-backed checkpoints for long-running consumers, install the checkpoint store and blob client packages too:

```bash
npm install @azure/event-hubs@6.0.3 @azure/eventhubs-checkpointstore-blob @azure/storage-blob @azure/identity
```

The package ships its own TypeScript types.

## Authentication And Setup

You usually connect in one of two ways:

- connection string
- fully qualified namespace plus a credential such as `DefaultAzureCredential`

Recommended environment variables:

```bash
export EVENTHUB_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>"
export EVENTHUB_FULLY_QUALIFIED_NAMESPACE="<namespace>.servicebus.windows.net"
export EVENTHUB_NAME="<event-hub-name>"
export EVENTHUB_CONSUMER_GROUP='$Default'
export AZURE_STORAGE_ACCOUNT_NAME="<storage-account-name>"
export EVENTHUB_CHECKPOINT_CONTAINER="eventhub-checkpoints"
```

If the Event Hubs connection string already includes `EntityPath=<event-hub-name>`, you can omit `EVENTHUB_NAME` for connection-string-based clients.

### Preferred: `DefaultAzureCredential`

Use passwordless auth in production, CI, and Azure-hosted workloads:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { EventHubProducerClient } from "@azure/event-hubs";

const fullyQualifiedNamespace = process.env.EVENTHUB_FULLY_QUALIFIED_NAMESPACE;
const eventHubName = process.env.EVENTHUB_NAME;

if (!fullyQualifiedNamespace || !eventHubName) {
  throw new Error(
    "EVENTHUB_FULLY_QUALIFIED_NAMESPACE and EVENTHUB_NAME are required",
  );
}

const producer = new EventHubProducerClient(
  fullyQualifiedNamespace,
  eventHubName,
  new DefaultAzureCredential(),
);
```

The identity needs an Event Hubs data-plane role that matches the operation:

- `Azure Event Hubs Data Sender`
- `Azure Event Hubs Data Receiver`
- `Azure Event Hubs Data Owner`

### Connection string fallback

Connection strings are still the simplest option for local development and small automation jobs:

```js
import { EventHubProducerClient } from "@azure/event-hubs";

const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;

if (!connectionString) {
  throw new Error("EVENTHUB_CONNECTION_STRING is required");
}

const producer = connectionString.includes("EntityPath=")
  ? new EventHubProducerClient(connectionString)
  : new EventHubProducerClient(connectionString, eventHubName);
```

## Client Initialization

Create one long-lived producer or consumer client for the part of your app that talks to Event Hubs instead of constructing a new client for every operation.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { EventHubProducerClient } from "@azure/event-hubs";

export function createProducerClient() {
  const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
  const eventHubName = process.env.EVENTHUB_NAME;

  if (connectionString) {
    if (connectionString.includes("EntityPath=")) {
      return new EventHubProducerClient(connectionString);
    }

    if (!eventHubName) {
      throw new Error(
        "EVENTHUB_NAME is required when the connection string does not include EntityPath",
      );
    }

    return new EventHubProducerClient(connectionString, eventHubName);
  }

  const fullyQualifiedNamespace = process.env.EVENTHUB_FULLY_QUALIFIED_NAMESPACE;

  if (!fullyQualifiedNamespace || !eventHubName) {
    throw new Error(
      "Set EVENTHUB_CONNECTION_STRING, or set EVENTHUB_FULLY_QUALIFIED_NAMESPACE and EVENTHUB_NAME",
    );
  }

  return new EventHubProducerClient(
    fullyQualifiedNamespace,
    eventHubName,
    new DefaultAzureCredential(),
  );
}
```

The fully qualified namespace must be the host name, for example `<namespace>.servicebus.windows.net`.

## Send Events

Use `createBatch()` and `tryAdd(...)` instead of guessing the maximum message size yourself:

```js
import { EventHubProducerClient } from "@azure/event-hubs";

const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;

if (!connectionString) {
  throw new Error("EVENTHUB_CONNECTION_STRING is required");
}

const producer = connectionString.includes("EntityPath=")
  ? new EventHubProducerClient(connectionString)
  : new EventHubProducerClient(connectionString, eventHubName);

try {
  const batch = await producer.createBatch();

  if (
    !batch.tryAdd({
      body: { type: "user.created", userId: "123" },
      contentType: "application/json",
    })
  ) {
    throw new Error("The first event is too large to fit in an empty batch");
  }

  if (
    !batch.tryAdd({
      body: { type: "user.updated", userId: "123" },
      contentType: "application/json",
    })
  ) {
    throw new Error("The second event is too large to fit in the current batch");
  }

  await producer.sendBatch(batch);
} finally {
  await producer.close();
}
```

If `tryAdd(...)` fails on an empty batch, the individual event is too large for Event Hubs and must be reduced or split before sending.

## Receive Events

Use `subscribe(...)` for long-running consumers. The handler receives an array of events for a partition, not just one event at a time.

```js
import {
  EventHubConsumerClient,
  earliestEventPosition,
} from "@azure/event-hubs";

const consumerGroup = process.env.EVENTHUB_CONSUMER_GROUP ?? "$Default";
const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;

if (!connectionString) {
  throw new Error("EVENTHUB_CONNECTION_STRING is required");
}

const consumer = connectionString.includes("EntityPath=")
  ? new EventHubConsumerClient(consumerGroup, connectionString)
  : new EventHubConsumerClient(consumerGroup, connectionString, eventHubName);

const subscription = consumer.subscribe(
  {
    async processEvents(events, context) {
      for (const event of events) {
        console.log(
          context.partitionId,
          event.sequenceNumber,
          event.enqueuedTimeUtc,
          event.body,
        );
      }
    },
    async processError(error, context) {
      console.error(`Receive error on partition ${context.partitionId}:`, error);
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

Set `startPosition` explicitly:

- `earliestEventPosition` to read existing backlog first
- `latestEventPosition` to receive only new events that arrive after the consumer starts

## Durable Checkpointing With Blob Storage

Use blob-backed checkpointing when you need durable progress tracking and partition load balancing across long-running consumers.

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
      console.error(`Checkpointed consumer error on ${context.partitionId}:`, error);
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

If you use Microsoft Entra ID for the storage account too, the identity needs `Storage Blob Data Contributor` on the checkpoint container or storage account.

## Practical Notes

- Reuse long-lived producer and consumer clients instead of creating a new client for every send or receive.
- Keep connection strings, SAS keys, and other secrets in environment variables or a secret manager, not in source code.
- When you use a namespace-scoped connection string, pass `EVENTHUB_NAME` unless the connection string already contains `EntityPath`.
- Use a checkpoint store for distributed or restartable consumers; otherwise each restart must decide its own starting position again.
- Close clients and subscriptions during shutdown so AMQP links are released cleanly.

## Common Pitfalls

- Forgetting `EVENTHUB_NAME` when the connection string is namespace-scoped and has no `EntityPath`.
- Leaving the consumer start position implicit and then wondering why old events were skipped.
- Treating `subscribe(...)` as a single-event callback when `processEvents(...)` actually receives an array.
- Creating a new `EventHubProducerClient` or `EventHubConsumerClient` for every operation instead of reusing them.
- Running multiple consumers in the same consumer group without checkpointing and then being surprised by duplicate or restarted reads.
- Treating `401` or `403` responses as SDK bugs before checking Event Hubs RBAC assignments and credential configuration.

## Version Notes For `6.0.3`

- This guide targets `@azure/event-hubs` `6.0.3`.
- Keep new code on `EventHubProducerClient` and `EventHubConsumerClient` from the current package line.
- When you copy older samples, update them to the current client constructors and `subscribe(...)` handler shape before using them in a new app.

## Official Sources Used

- Microsoft Learn package overview: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/event-hubs-readme?view=azure-node-latest`
- Microsoft Learn API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/event-hubs/?view=azure-node-latest`
- `EventHubProducerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/event-hubs/eventhubproducerclient?view=azure-node-latest`
- `EventHubConsumerClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/event-hubs/eventhubconsumerclient?view=azure-node-latest`
- Blob checkpoint store reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/eventhubs-checkpointstore-blob/blobcheckpointstore?view=azure-node-latest`
- Azure Event Hubs quickstart for Node.js: `https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-node-get-started-send`
- npm package page: `https://www.npmjs.com/package/@azure/event-hubs`
