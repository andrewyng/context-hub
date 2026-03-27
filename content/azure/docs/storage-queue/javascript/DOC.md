---
name: storage-queue
description: "Azure Queue Storage client library for JavaScript with QueueServiceClient, QueueClient, authentication, and message processing"
metadata:
  languages: "javascript"
  versions: "12.29.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,storage,queue,azure-storage,javascript,entra-id"
---

# Azure Storage Queue JavaScript Client

## Golden Rule

Use `@azure/storage-queue` for Azure Queue Storage and stay on the current 12.x client surface:

- `QueueServiceClient` for account-level operations
- `QueueClient` for one queue
- `@azure/identity` when you authenticate with Microsoft Entra ID

Do not copy legacy examples that use the old `azure-storage` package or `QueueService` API surface.

## Install

Pin the package version your project expects:

```bash
npm install @azure/storage-queue@12.29.0
```

If you want Microsoft Entra ID authentication, install `@azure/identity` too:

```bash
npm install @azure/storage-queue@12.29.0 @azure/identity
```

## Authentication And Setup

The practical auth choices are:

- Microsoft Entra ID with `DefaultAzureCredential`
- a storage account connection string
- a shared account key when you explicitly manage storage keys

Use environment variables instead of hard-coding credentials:

```bash
export AZURE_STORAGE_QUEUE_ACCOUNT_URL="https://<account>.queue.core.windows.net"
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
export AZURE_STORAGE_QUEUE_NAME="jobs"
```

### Microsoft Entra ID With `DefaultAzureCredential`

Use this for deployed apps in Azure, or for local development after a developer sign-in such as:

```bash
az login
export AZURE_STORAGE_QUEUE_ACCOUNT_URL="https://<account>.queue.core.windows.net"
```

```js
import { DefaultAzureCredential } from "@azure/identity";
import { QueueServiceClient } from "@azure/storage-queue";

const accountUrl = process.env.AZURE_STORAGE_QUEUE_ACCOUNT_URL;

if (!accountUrl) {
  throw new Error("AZURE_STORAGE_QUEUE_ACCOUNT_URL is required");
}

const serviceClient = new QueueServiceClient(
  accountUrl,
  new DefaultAzureCredential(),
);
```

For data access, the identity needs an Azure Storage Queue data-plane role such as `Storage Queue Data Contributor`.

### Connection String

Use this for local tools, simple scripts, or environments that already provide a storage connection string.

```js
import { QueueClient } from "@azure/storage-queue";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const queueName = process.env.AZURE_STORAGE_QUEUE_NAME;

if (!connectionString || !queueName) {
  throw new Error(
    "AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_QUEUE_NAME are required",
  );
}

const queueClient = QueueClient.fromConnectionString(
  connectionString,
  queueName,
);
```

For local Azurite development, use the documented storage shortcut connection string:

```bash
export AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"
export AZURE_STORAGE_QUEUE_NAME="jobs"
```

### Shared Key

Use this only when your application explicitly manages storage account keys.

```bash
export AZURE_STORAGE_ACCOUNT_NAME="<account-name>"
export AZURE_STORAGE_ACCOUNT_KEY="<account-key>"
```

```js
import {
  QueueServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-queue";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!accountName || !accountKey) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY are required",
  );
}

const credential = new StorageSharedKeyCredential(accountName, accountKey);
const serviceClient = new QueueServiceClient(
  `https://${accountName}.queue.core.windows.net`,
  credential,
);
```

## Client Initialization

Use `QueueServiceClient` once, then derive queue clients from it.

```js
import { QueueServiceClient } from "@azure/storage-queue";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is required");
}

const serviceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClient = serviceClient.getQueueClient("jobs");
```

This is the cleanest pattern when one process touches more than one queue. If your code only needs one queue, constructing `QueueClient` directly is fine.

## Core Usage

### Create A Queue If Needed

```js
import { QueueClient } from "@azure/storage-queue";

const queueClient = QueueClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
  process.env.AZURE_STORAGE_QUEUE_NAME,
);

await queueClient.createIfNotExists();
```

### Send Messages

```js
await queueClient.sendMessage("rebuild-search-index");

await queueClient.sendMessage(
  JSON.stringify({
    job: "sync-users",
    tenant: "acme",
  }),
);
```

Serialize structured payloads explicitly with `JSON.stringify(...)`.

### Receive, Process, And Delete Messages

```js
const received = await queueClient.receiveMessages({
  numberOfMessages: 10,
});

for (const message of received.receivedMessageItems) {
  const payload = message.messageText;
  console.log(payload);

  // Delete only after work succeeds.
  await queueClient.deleteMessage(message.messageId, message.popReceipt);
}
```

Operationally important:

- Receiving a message does not remove it permanently.
- The service hides the message for its visibility timeout.
- If you do not delete it, the message can become visible again and be processed again.

### Peek Without Taking A Processing Lease

```js
const peeked = await queueClient.peekMessages({
  numberOfMessages: 5,
});

for (const message of peeked.peekedMessageItems) {
  console.log(message.messageText);
}
```

Use `peekMessages(...)` for inspection or diagnostics when you do not want to change normal consumer flow.

### Update Message Content Or Visibility

```js
const received = await queueClient.receiveMessages();
const message = received.receivedMessageItems[0];

if (message) {
  const updated = await queueClient.updateMessage(
    message.messageId,
    message.popReceipt,
    JSON.stringify({ status: "retrying" }),
    {
      visibilityTimeout: 30,
    },
  );

  console.log(updated.popReceipt);
}
```

If you update a message and then need to delete or update it again, use the latest `popReceipt` returned by the service.

### List Queues From The Account

```js
for await (const queue of serviceClient.listQueues()) {
  console.log(queue.name);
}
```

Use this from `QueueServiceClient` when you need inventory or lightweight administration code.

## Practical Notes

- Reuse long-lived clients instead of constructing a new client for every operation.
- Use the queue endpoint form `https://<account>.queue.core.windows.net` for Entra ID or shared-key clients.
- Prefer Microsoft Entra ID for deployed services when you can assign the right data-plane role.
- Keep connection strings and account keys in environment variables or a secret manager, not in source code.
- Treat message bodies as application text payloads; serialize and parse JSON yourself.

## Common Pitfalls

- Copying old examples built for the legacy `azure-storage` package or `QueueService` API.
- Installing only `@azure/storage-queue` and then trying to use `DefaultAzureCredential` without `@azure/identity`.
- Receiving messages and forgetting to delete them after successful processing.
- Using the wrong endpoint; queue clients need the `queue.core.windows.net` endpoint.
- Reusing an old `popReceipt` after `updateMessage(...)` changed it.

## Version Notes For `12.29.0`

- This guide targets `@azure/storage-queue` `12.29.0`.
- Keep new code on `QueueServiceClient` and `QueueClient` from the 12.x package line.
- If you find older samples that import `azure-storage` or call `QueueService`, rewrite them to the current package before copying code into an app.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-queue/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-queue-readme?view=azure-node-latest`
- `QueueServiceClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-queue/queueserviceclient?view=azure-node-latest`
- `QueueClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/storage-queue/queueclient?view=azure-node-latest`
- Azure Queue Storage quickstart for Node.js: `https://learn.microsoft.com/en-us/azure/storage/queues/storage-quickstart-queues-nodejs`
- npm package page: `https://www.npmjs.com/package/@azure/storage-queue`
