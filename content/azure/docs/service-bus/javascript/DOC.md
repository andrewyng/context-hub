---
name: service-bus
description: "Azure Service Bus JavaScript client for authenticating to a namespace, publishing messages, receiving from subscriptions, and settling deliveries"
metadata:
  languages: "javascript"
  versions: "7.9.5"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,service-bus,messaging,amqp,javascript,topics,subscriptions,entra-id"
---

# Azure Service Bus JavaScript Client

## Golden Rule

Use `@azure/service-bus` with `ServiceBusClient`, prefer `DefaultAzureCredential` for deployed applications, and build new code around `createSender(...)`, `createReceiver(...)`, and explicit settlement methods instead of older pre-7.x client types.

## Install

Pin the version your project expects:

```bash
npm install @azure/service-bus@7.9.5
```

If you authenticate with Microsoft Entra ID, install `@azure/identity` too:

```bash
npm install @azure/service-bus@7.9.5 @azure/identity
```

## Authentication And Setup

The client supports both connection strings and token credentials.

Recommended environment variables:

```bash
export SERVICEBUS_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=...;SharedAccessKey=..."
export SERVICEBUS_FULLY_QUALIFIED_NAMESPACE="<namespace>.servicebus.windows.net"
export SERVICEBUS_TOPIC_NAME="events"
export SERVICEBUS_SUBSCRIPTION_NAME="worker-a"
```

### Preferred: `DefaultAzureCredential`

Use passwordless auth in production, CI, and Azure-hosted workloads:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ServiceBusClient } from "@azure/service-bus";

const fullyQualifiedNamespace = process.env.SERVICEBUS_FULLY_QUALIFIED_NAMESPACE;

if (!fullyQualifiedNamespace) {
  throw new Error("SERVICEBUS_FULLY_QUALIFIED_NAMESPACE is required");
}

const credential = new DefaultAzureCredential();
const client = new ServiceBusClient(fullyQualifiedNamespace, credential);
```

The identity needs a Service Bus data-plane role such as `Azure Service Bus Data Sender`, `Azure Service Bus Data Receiver`, or `Azure Service Bus Data Owner` depending on what the code does.

### Connection string fallback

Connection strings are still the simplest option for local scripts and tightly scoped automation:

```js
import { ServiceBusClient } from "@azure/service-bus";

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("SERVICEBUS_CONNECTION_STRING is required");
}

const client = new ServiceBusClient(connectionString);
```

## Client Initialization

Create one shared client for the part of your app that talks to Service Bus:

```js
import { DefaultAzureCredential } from "@azure/identity";
import { ServiceBusClient } from "@azure/service-bus";

export function createServiceBusClient() {
  const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;

  if (connectionString) {
    return new ServiceBusClient(connectionString);
  }

  const fullyQualifiedNamespace = process.env.SERVICEBUS_FULLY_QUALIFIED_NAMESPACE;

  if (!fullyQualifiedNamespace) {
    throw new Error(
      "Set SERVICEBUS_CONNECTION_STRING or SERVICEBUS_FULLY_QUALIFIED_NAMESPACE",
    );
  }

  return new ServiceBusClient(
    fullyQualifiedNamespace,
    new DefaultAzureCredential(),
  );
}
```

## Core Usage

### Publish to a topic

Use `createSender(...)` and `sendMessages(...)` for application publishing:

```js
import { ServiceBusClient } from "@azure/service-bus";

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const topicName = process.env.SERVICEBUS_TOPIC_NAME;

if (!connectionString || !topicName) {
  throw new Error("SERVICEBUS_CONNECTION_STRING and SERVICEBUS_TOPIC_NAME are required");
}

const client = new ServiceBusClient(connectionString);
const sender = client.createSender(topicName);

try {
  await sender.sendMessages({
    body: {
      type: "inventory.updated",
      sku: "sku-1001",
      quantity: 4,
    },
    subject: "inventory.updated",
    applicationProperties: {
      source: "catalog-service",
      tenant: "acme",
    },
  });
} finally {
  await sender.close();
  await client.close();
}
```

### Receive from a subscription and settle messages

The default receive mode is `peekLock`, which is the normal choice for worker-style processing because your code explicitly settles each delivery.

```js
import { ServiceBusClient } from "@azure/service-bus";

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const topicName = process.env.SERVICEBUS_TOPIC_NAME;
const subscriptionName = process.env.SERVICEBUS_SUBSCRIPTION_NAME;

if (!connectionString || !topicName || !subscriptionName) {
  throw new Error(
    "SERVICEBUS_CONNECTION_STRING, SERVICEBUS_TOPIC_NAME, and SERVICEBUS_SUBSCRIPTION_NAME are required",
  );
}

const client = new ServiceBusClient(connectionString);
const receiver = client.createReceiver(topicName, subscriptionName);

try {
  const messages = await receiver.receiveMessages(10, {
    maxWaitTimeInMs: 5000,
  });

  for (const message of messages) {
    try {
      console.log(message.messageId, message.deliveryCount, message.body);
      await receiver.completeMessage(message);
    } catch (error) {
      await receiver.abandonMessage(message);
      throw error;
    }
  }
} finally {
  await receiver.close();
  await client.close();
}
```

Settlement methods you will use most often:

- `completeMessage(message)`: remove the message after successful processing
- `abandonMessage(message)`: unlock it for another delivery attempt
- `deadLetterMessage(message, options?)`: move it aside for later triage
- `deferMessage(message)`: keep it for later retrieval by sequence number

### Run a long-lived receive loop

Use `subscribe(...)` when you want a push-style handler instead of explicit polling:

```js
import { ServiceBusClient } from "@azure/service-bus";

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const topicName = process.env.SERVICEBUS_TOPIC_NAME;
const subscriptionName = process.env.SERVICEBUS_SUBSCRIPTION_NAME;

if (!connectionString || !topicName || !subscriptionName) {
  throw new Error(
    "SERVICEBUS_CONNECTION_STRING, SERVICEBUS_TOPIC_NAME, and SERVICEBUS_SUBSCRIPTION_NAME are required",
  );
}

const client = new ServiceBusClient(connectionString);
const receiver = client.createReceiver(topicName, subscriptionName);

const subscription = receiver.subscribe(
  {
    async processMessage(message) {
      console.log("received", message.messageId, message.body);
      await receiver.completeMessage(message);
    },
    async processError(args) {
      console.error(args.error);
    },
  },
  {
    autoCompleteMessages: false,
    maxConcurrentCalls: 4,
    maxAutoLockRenewalDurationInMs: 5 * 60 * 1000,
  },
);

process.on("SIGINT", async () => {
  await subscription.close();
  await receiver.close();
  await client.close();
  process.exit(0);
});
```

## Administration

Use `ServiceBusAdministrationClient` when your code needs to inspect or manage entities inside an existing namespace:

```js
import { ServiceBusAdministrationClient } from "@azure/service-bus";

const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const topicName = process.env.SERVICEBUS_TOPIC_NAME;
const subscriptionName = process.env.SERVICEBUS_SUBSCRIPTION_NAME;

if (!connectionString || !topicName || !subscriptionName) {
  throw new Error(
    "SERVICEBUS_CONNECTION_STRING, SERVICEBUS_TOPIC_NAME, and SERVICEBUS_SUBSCRIPTION_NAME are required",
  );
}

const admin = new ServiceBusAdministrationClient(connectionString);

const topic = await admin.getTopic(topicName);
const subscription = await admin.getSubscription(topicName, subscriptionName);

console.log(topic);
console.log(subscription);
```

Use Azure Resource Manager tools such as the Azure CLI, ARM/Bicep/Terraform, or the portal when you need namespace-level provisioning rather than topic or subscription administration inside a namespace.

## Configuration Notes

- The namespace value must be the fully qualified host name, for example `<namespace>.servicebus.windows.net`.
- Reuse long-lived `ServiceBusClient`, sender, and receiver instances instead of creating them per message.
- Close `ServiceBusClient`, senders, and receivers during shutdown so AMQP links are released cleanly.
- Prefer `receiveMessages(...)` for explicit pull loops and `subscribe(...)` for long-running worker processes.
- Keep connection strings and credentials in environment variables or a secret manager, not in source code.

## Common Pitfalls

- Copying older samples that use deprecated client types instead of `ServiceBusClient`.
- Treating `401` or `403` responses as SDK bugs before checking credentials and Service Bus RBAC assignments.
- Passing only the namespace name when the constructor expects the fully qualified host name.
- Forgetting to call `completeMessage(...)`, `abandonMessage(...)`, `deadLetterMessage(...)`, or `deferMessage(...)` when you disable auto-complete.
- Creating a new sender, receiver, or client for every operation instead of reusing them.
- Using `receiveAndDelete` for normal worker code when message loss would be unacceptable.

## Version Notes For `7.9.5`

- This guide targets `@azure/service-bus` `7.9.5`.
- Prefer `ServiceBusClient` and `ServiceBusAdministrationClient` for new code.
- If you find pre-7.x samples using legacy client types, rewrite them to the current constructor and settlement APIs instead of porting them line-for-line.
