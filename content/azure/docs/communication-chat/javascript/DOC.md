---
name: communication-chat
description: "Azure Communication Services chat SDK for JavaScript with setup, token auth, threads, messages, participants, and realtime notifications"
metadata:
  languages: "javascript"
  versions: "1.6.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,communication-services,chat,javascript,messaging,realtime"
---

# Azure Communication Services Chat SDK For JavaScript

## Golden Rule

Use `@azure/communication-chat` with an Azure Communication Services user access token, not a resource connection string in client code. Create one long-lived `ChatClient` per signed-in user session, then get a `ChatThreadClient` for thread-specific work such as sending messages, listing participants, and updating thread state.

## Install

```bash
npm install @azure/communication-chat@1.6.0 @azure/communication-common
```

If you mint user identities and access tokens on your Node backend, add `@azure/communication-identity` there. Do not ship your ACS connection string to browsers or other untrusted clients.

## Prerequisites

Before this SDK can do anything useful, Azure must already provide:

1. An Azure Communication Services resource endpoint such as `https://<resource>.communication.azure.com`.
2. A Communication Services user access token for the signed-in user.
3. A chat thread ID if your app is joining an existing thread.

Use environment variables like these for local development:

```bash
export ACS_ENDPOINT="https://<resource>.communication.azure.com"
export ACS_CHAT_TOKEN="<communication-user-access-token>"
export ACS_CHAT_THREAD_ID="<chat-thread-id>"
export ACS_OTHER_USER_ID="<8:acs:... user id>"
```

## Authentication And Client Setup

The JavaScript chat SDK uses a Communication Services user token wrapped in `AzureCommunicationTokenCredential`.

```js
import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const endpoint = process.env.ACS_ENDPOINT;
const token = process.env.ACS_CHAT_TOKEN;

if (!endpoint || !token) {
  throw new Error("Set ACS_ENDPOINT and ACS_CHAT_TOKEN before creating the chat client.");
}

const credential = new AzureCommunicationTokenCredential(token);
const chatClient = new ChatClient(endpoint, credential);
```

If your user tokens expire during longer sessions, use a proactive token refresher instead of recreating the client repeatedly:

```js
import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const credential = new AzureCommunicationTokenCredential({
  token: process.env.ACS_CHAT_TOKEN,
  refreshProactively: true,
  tokenRefresher: async () => {
    const response = await fetch("http://localhost:3000/api/acs/token", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed with ${response.status}`);
    }

    const { token } = await response.json();
    return token;
  },
});

const chatClient = new ChatClient(process.env.ACS_ENDPOINT, credential);
```

## Client Initialization

Keep one shared `ChatClient` for the current user, then derive thread clients as needed.

```js
import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const chatClient = new ChatClient(
  process.env.ACS_ENDPOINT,
  new AzureCommunicationTokenCredential(process.env.ACS_CHAT_TOKEN),
);

export function getThreadClient(threadId) {
  return chatClient.getChatThreadClient(threadId);
}
```

Use `ChatClient` for thread creation, deletion, realtime notifications, and cross-thread operations. Use `ChatThreadClient` for messages, participants, read state, and thread properties.

## Core Usage

### Create a chat thread

Create a thread from the top-level client. Add initial participants in the same call when you already know who should join.

```js
import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const chatClient = new ChatClient(
  process.env.ACS_ENDPOINT,
  new AzureCommunicationTokenCredential(process.env.ACS_CHAT_TOKEN),
);

const result = await chatClient.createChatThread(
  {
    topic: "Order support",
  },
  {
    participants: [
      {
        id: { communicationUserId: process.env.ACS_OTHER_USER_ID },
        displayName: "Support agent",
        shareHistoryTime: new Date(),
      },
    ],
  },
);

const threadId = result.chatThread?.id;

if (!threadId) {
  throw new Error("Thread creation did not return a thread id.");
}

const threadClient = chatClient.getChatThreadClient(threadId);
```

### Connect to an existing thread

```js
import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const chatClient = new ChatClient(
  process.env.ACS_ENDPOINT,
  new AzureCommunicationTokenCredential(process.env.ACS_CHAT_TOKEN),
);

const threadClient = chatClient.getChatThreadClient(process.env.ACS_CHAT_THREAD_ID);
```

### Send a message

```js
const sendResult = await threadClient.sendMessage(
  {
    content: "Hello from Azure Communication Services chat.",
    type: "text",
  },
  {
    senderDisplayName: "Docs sample",
  },
);

console.log(sendResult.id);
```

### List messages

`listMessages()` is an async iterator. Treat it like a paged stream, not a preloaded array.

```js
for await (const message of threadClient.listMessages()) {
  console.log(message.id, message.type, message.content?.message);
}
```

To page manually:

```js
for await (const page of threadClient.listMessages().byPage({ maxPageSize: 20 })) {
  for (const message of page) {
    console.log(message.id, message.content?.message);
  }
}
```

### Edit or delete a message

```js
const { id: messageId } = await threadClient.sendMessage(
  { content: "Draft message", type: "text" },
  { senderDisplayName: "Docs sample" },
);

await threadClient.updateMessage(messageId, {
  content: "Edited message",
});

await threadClient.deleteMessage(messageId);
```

### Read and update thread properties

```js
const properties = await threadClient.getProperties();
console.log(properties.id, properties.topic);

await threadClient.updateTopic("Escalated order support");
```

### Manage participants

Use `shareHistoryTime` when you need to control how much earlier conversation history a new participant can see.

```js
await threadClient.addParticipants({
  participants: [
    {
      id: { communicationUserId: process.env.ACS_OTHER_USER_ID },
      displayName: "Support agent",
      shareHistoryTime: new Date(),
    },
  ],
});

for await (const participant of threadClient.listParticipants()) {
  console.log(participant.displayName, participant.id);
}

await threadClient.removeParticipant({
  communicationUserId: process.env.ACS_OTHER_USER_ID,
});
```

### Start realtime notifications

Call `startRealtimeNotifications()` once on the shared `ChatClient`, then register listeners for the events your app cares about.

```js
await chatClient.startRealtimeNotifications();

chatClient.on("chatMessageReceived", (event) => {
  console.log("message received", event);
});

chatClient.on("typingIndicatorReceived", (event) => {
  console.log("typing", event);
});

chatClient.on("readReceiptReceived", (event) => {
  console.log("read receipt", event);
});
```

You can also send a typing indicator from a thread client:

```js
await threadClient.sendTypingNotification();
```

### Delete a thread

Delete whole threads from the top-level client, not the thread client.

```js
await chatClient.deleteChatThread(process.env.ACS_CHAT_THREAD_ID);
```

## Configuration Notes

- Use a Communication Services user token in `AzureCommunicationTokenCredential`; do not expose your resource connection string to the browser.
- Reuse one `ChatClient` per signed-in user session and create `ChatThreadClient` instances from it with `getChatThreadClient(threadId)`.
- Treat list operations such as `listChatThreads()`, `listMessages()`, and `listParticipants()` as async iterators.
- Start realtime notifications before expecting chat events to arrive.
- Keep token refresh on the server side and return only short-lived user tokens to clients.
- Create and delete threads on `ChatClient`; send messages and manage participants on `ChatThreadClient`.

## Common Pitfalls

- Trying to authenticate chat clients with only a resource endpoint or connection string. The chat SDK needs a user access token.
- Recreating `ChatClient` for every action instead of reusing one long-lived client.
- Treating iterator-based list methods like arrays.
- Forgetting to call `startRealtimeNotifications()` before registering event-driven chat behavior.
- Sending your ACS connection string or identity-management secrets to frontend code.
- Assuming `shareHistoryTime` is irrelevant when adding participants to existing threads.

## Version Notes For 1.6.0

- This guide targets `@azure/communication-chat` `1.6.0`.
- The examples here use the v1 client split between `ChatClient` and `ChatThreadClient`.
- Token acquisition is intentionally separate from this package. If you need to create Communication Services users or issue tokens, do that in trusted backend code with the identity SDK.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-chat/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/communication-chat-readme?view=azure-node-latest`
- `ChatClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-chat/chatclient?view=azure-node-latest`
- `ChatThreadClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-chat/chatthreadclient?view=azure-node-latest`
- `AzureCommunicationTokenCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-common/azurecommunicationtokencredential?view=azure-node-latest`
- ACS chat quickstart: `https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/chat/get-started?pivots=programming-language-javascript`
- npm package page: `https://www.npmjs.com/package/@azure/communication-chat`
