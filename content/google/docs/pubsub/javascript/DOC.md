---
name: pubsub
description: "Google Cloud Pub/Sub Node.js client for creating topics and subscriptions, publishing messages, consuming messages, and using the local emulator"
metadata:
  languages: "javascript"
  versions: "5.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,google,gcp,pubsub,messaging,events,javascript,nodejs"
---

# `@google-cloud/pubsub` JavaScript Package Guide

Use `@google-cloud/pubsub` in Node.js code that needs to create topics and subscriptions, publish messages, and consume them with a streaming subscriber.

## Golden Rule

- Import `PubSub` from `@google-cloud/pubsub`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass credentials explicitly.
- Publish message bodies as `Buffer` data.
- Treat subscriber handlers as idempotent. Pub/Sub delivery is at-least-once by default, so a message can be delivered more than once.
- Acknowledge messages only after durable processing succeeds.

This guide covers `5.3.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/pubsub@5.3.0
```

## Authentication And Setup

This client uses Google Cloud credentials, not API keys.

Enable the Pub/Sub API in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable pubsub.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Minimum setup:

1. Create or choose a Google Cloud project.
2. Enable the Pub/Sub API.
3. Authenticate with ADC.
4. Grant the runtime identity permission to publish to the topic or consume from the subscription it uses.

Common IAM roles:

- `roles/pubsub.publisher` for publishing messages
- `roles/pubsub.subscriber` for consuming and acknowledging messages
- `roles/pubsub.editor` for creating and managing topics and subscriptions

## Initialize The Client

CommonJS:

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

ES modules:

```javascript
import {PubSub} from '@google-cloud/pubsub';

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
```

With an explicit key file:

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Create A Topic And Subscription

Create the topic first, then create a subscription attached to it.

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function ensureTopicAndSubscription(topicName, subscriptionName) {
  const [topic] = await pubsub.createTopic(topicName);
  const [subscription] = await topic.createSubscription(subscriptionName);

  return {
    topicName: topic.name,
    subscriptionName: subscription.name,
  };
}
```

If the topic or subscription may already exist, call `pubsub.topic(topicName)` and `pubsub.subscription(subscriptionName)` to get handles, and handle `AlreadyExists` errors when creating resources.

### Publish A Message

Use `publishMessage()` for new code. Encode structured payloads yourself before publishing.

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

async function publishOrderCreated(topicName, order) {
  const topic = pubsub.topic(topicName);

  const messageId = await topic.publishMessage({
    data: Buffer.from(JSON.stringify(order), 'utf8'),
    attributes: {
      eventType: 'order.created',
      source: 'checkout',
    },
  });

  return messageId;
}
```

Notes:

- `data` should be a `Buffer`.
- Message attributes are string key/value pairs.
- `publishMessage()` resolves to the Pub/Sub message ID.

### Subscribe With A Streaming Message Handler

Use the high-level `Subscription` event interface for the common async worker pattern.

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

function listenForMessages(subscriptionName) {
  const subscription = pubsub.subscription(subscriptionName, {
    flowControl: {
      maxMessages: 10,
    },
  });

  subscription.on('message', message => {
    try {
      const body = message.data.toString('utf8');
      console.log('message id:', message.id);
      console.log('body:', body);
      console.log('attributes:', message.attributes);

      message.ack();
    } catch (error) {
      message.nack();
    }
  });

  subscription.on('error', error => {
    console.error('subscriber error:', error);
  });

  return subscription;
}
```

Notes:

- `message.data` is binary data. Decode it yourself.
- Call `message.ack()` only after your application has finished the work that must not be repeated.
- Call `message.nack()` for retryable failures.
- The streaming subscriber keeps the process alive until you remove listeners or call `subscription.close()`.

### Use The Emulator For Local Development

Start the Pub/Sub emulator with the Google Cloud CLI:

```bash
gcloud beta emulators pubsub start
$(gcloud beta emulators pubsub env-init)
export PUBSUB_PROJECT_ID="local-project"
```

Create the client against the emulator:

```javascript
const {PubSub} = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.PUBSUB_PROJECT_ID || 'local-project',
});

async function seedEmulator() {
  const topicName = 'demo-topic';
  const subscriptionName = 'demo-subscription';

  const [topic] = await pubsub.createTopic(topicName);
  await topic.createSubscription(subscriptionName);

  await topic.publishMessage({
    data: Buffer.from('hello emulator', 'utf8'),
  });
}
```

When `PUBSUB_EMULATOR_HOST` is set, the client connects to the emulator instead of the managed Pub/Sub service.

## Common Pitfalls

- Do not pass a plain string as the message body. Use `Buffer.from(...)`.
- Do not acknowledge a message before your durable side effects complete.
- Do not assume a message will only be delivered once. Keep handlers idempotent.
- Do not confuse handle creation with resource creation. `pubsub.topic(name)` and `pubsub.subscription(name)` return local handles; they do not create server-side resources.
- Do not rely on emulator behavior for production semantics.

## Version-Sensitive Notes

- This guide targets `@google-cloud/pubsub` version `5.3.0`.
- Current Node.js reference material uses `publishMessage()` for publishing. Prefer that method for new code.
- The high-level JavaScript package uses `PubSub` as the main entry point for both publisher and subscriber workflows.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/pubsub/latest`
- `PubSub` class reference: `https://cloud.google.com/nodejs/docs/reference/pubsub/latest/pubsub/pubsub`
- `Topic` class reference: `https://cloud.google.com/nodejs/docs/reference/pubsub/latest/pubsub/topic`
- `Subscription` class reference: `https://cloud.google.com/nodejs/docs/reference/pubsub/latest/pubsub/subscription`
- Authentication guide: `https://cloud.google.com/pubsub/docs/authentication`
- Emulator guide: `https://cloud.google.com/pubsub/docs/emulator`
