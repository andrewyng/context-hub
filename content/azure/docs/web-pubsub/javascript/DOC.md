---
name: web-pubsub
description: "Azure Web PubSub JavaScript service SDK for issuing client access URLs, sending server-side messages, and managing users and groups in a hub"
metadata:
  languages: "javascript"
  versions: "1.2.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,web-pubsub,realtime,websocket,javascript"
---

# Azure Web PubSub JavaScript Service SDK

## Golden Rule

Use `@azure/web-pubsub` in trusted backend code only. Create one `WebPubSubServiceClient` per hub, use it to issue short-lived client access URLs with `getClientAccessToken(...)`, and reuse that same client for server-side messaging and group management. Do not ship the Azure Web PubSub connection string to browsers, mobile apps, or other untrusted clients.

## Install

Pin the package version your app expects:

```bash
npm install @azure/web-pubsub@1.2.0
```

## Prerequisites

Before you initialize the SDK, have these values ready:

- an Azure Web PubSub resource connection string
- a hub name such as `chat` or `notifications`
- a backend endpoint that can return a negotiated client URL to your app

Use environment variables instead of hard-coding credentials:

```bash
export AZURE_WEB_PUBSUB_CONNECTION_STRING="Endpoint=https://<resource-name>.webpubsub.azure.com;AccessKey=<access-key>;Version=1.0;"
export AZURE_WEB_PUBSUB_HUB="chat"
```

## Authentication And Setup

This package is the server-side management SDK. The common setup is a hub-scoped service client constructed from a connection string.

```js
import { WebPubSubServiceClient } from "@azure/web-pubsub";

const connectionString = process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING;
const hub = process.env.AZURE_WEB_PUBSUB_HUB ?? "chat";

if (!connectionString) {
  throw new Error("AZURE_WEB_PUBSUB_CONNECTION_STRING is required");
}

export const webPubSub = new WebPubSubServiceClient(connectionString, hub);
```

Create a separate client for each hub your application manages. The hub is part of the server-side client configuration, so a client created for one hub does not operate on another.

## Negotiate Client Connections

The normal browser or device flow is:

1. your app calls a trusted backend route
2. the backend calls `getClientAccessToken(...)`
3. the backend returns the generated URL to the client
4. the client connects to Azure Web PubSub with that URL

```js
import express from "express";
import { webPubSub } from "./web-pubsub.js";

const app = express();

app.get("/negotiate", async (req, res) => {
  const userId = String(req.query.userId ?? "anonymous");

  const token = await webPubSub.getClientAccessToken({
    userId,
  });

  res.json({
    url: token.url,
  });
});
```

If you need to bind a client identity to group or user-based operations, set `userId` when you create the access token. Keep negotiation on the server so the connection string stays private.

## Send Messages From The Server

Use the hub-scoped client to broadcast to every connection, target one user, or target one group.

```js
import { webPubSub } from "./web-pubsub.js";

await webPubSub.sendToAll("service online");

await webPubSub.sendToUser("user-123", "your export is ready");

await webPubSub.sendToGroup("room-1", "welcome to room-1");
```

These operations are server-side pushes through Azure Web PubSub. They do not require your backend to hold open WebSocket connections itself.

## Manage Group Membership

Use group operations when your application models rooms, channels, or topic-based fan-out.

```js
import { webPubSub } from "./web-pubsub.js";

await webPubSub.group("room-1").addUser("user-123");

await webPubSub.group("room-1").removeUser("user-123");
```

This is useful when you issue client URLs with stable user IDs and later want the server to attach or detach that user from a group.

## Practical Notes

- Treat `WebPubSubServiceClient` as a long-lived backend object; do not recreate it for every request.
- Keep one hub name per client instance so your code does not accidentally mix chat, notification, or tenant-specific traffic.
- Use `getClientAccessToken(...)` as the server-side handshake step for frontend or device connections.
- Use `sendToUser(...)` when one logical user may have multiple active connections and all of them should receive the event.
- Use `sendToGroup(...)` plus server-managed group membership when you need room-style broadcast behavior.

## Common Pitfalls

- Treating `@azure/web-pubsub` as a browser client SDK. This package is the server-side service SDK.
- Exposing `AZURE_WEB_PUBSUB_CONNECTION_STRING` to frontend code instead of returning only the negotiated client URL.
- Creating a new `WebPubSubServiceClient` inside every route handler rather than reusing a shared instance.
- Using the wrong hub name and then wondering why user targeting or group membership appears to do nothing.
- Assuming users or groups are shared across hubs. Hub boundaries matter for negotiation, user targeting, and group operations.

## Version Notes For `1.2.0`

- This guide targets `@azure/web-pubsub` `1.2.0`.
- The examples here use the package's server-side `WebPubSubServiceClient` API.
- Client connection code belongs in your frontend or device app, but the access URL generation shown here stays on the server.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/web-pubsub/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/web-pubsub-readme?view=azure-node-latest`
- `WebPubSubServiceClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/web-pubsub/webpubsubserviceclient?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/web-pubsub`
