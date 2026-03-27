---
name: notification-hubs
description: "Azure Notification Hubs JavaScript data-plane client for connection-string auth, installation management, and sending targeted push notifications"
metadata:
  languages: "javascript"
  versions: "2.0.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,notification-hubs,push-notifications,javascript,apns,fcm,installations"
---

# Azure Notification Hubs JavaScript SDK

## Golden Rule

Use `@azure/notification-hubs` for Notification Hubs data-plane work from JavaScript or TypeScript: create a hub client context from a connection string, manage device installations, and send platform-specific notifications to all devices or a targeted tag expression.

Do not use this package to create namespaces, create hubs, or configure APNS/FCM/WNS credentials on the Azure resource. Those are management-plane tasks handled through Azure Resource Manager tools such as the Azure portal, Azure CLI, Bicep, Terraform, or a management SDK.

This guide targets `@azure/notification-hubs` `2.0.2`.

## Install

Pin the SDK version your project expects:

```bash
npm install @azure/notification-hubs@2.0.2
```

The package uses Notification Hubs connection strings for authentication. You do not add `@azure/identity` for the workflows shown here.

## Prerequisites And Setup

Before your code can send or register devices, make sure you already have:

1. an Azure Notification Hubs namespace and hub
2. platform credentials configured on that hub for the push service you will use, such as APNS or FCM
3. a hub connection string with rights that match the work your code performs

Recommended environment variables:

```bash
export AZURE_NOTIFICATION_HUB_CONNECTION_STRING="Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<policy>;SharedAccessKey=<key>"
export AZURE_NOTIFICATION_HUB_NAME="my-notification-hub"

# Example device tokens for app-side registration workflows
export APNS_DEVICE_TOKEN="<ios-device-token>"
export FCM_DEVICE_TOKEN="<android-device-token>"
```

Keep these details straight:

- the connection string authenticates the SDK call
- the hub name tells the SDK which notification hub to use
- the device token or push channel identifies the target device inside APNS, FCM, WNS, or another push platform

## Client Initialization

Create one shared client context and reuse it for related operations:

```js
import { createClientContext } from "@azure/notification-hubs";

const connectionString = process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING;
const hubName = process.env.AZURE_NOTIFICATION_HUB_NAME;

if (!connectionString || !hubName) {
  throw new Error(
    "AZURE_NOTIFICATION_HUB_CONNECTION_STRING and AZURE_NOTIFICATION_HUB_NAME are required",
  );
}

export const context = createClientContext(connectionString, hubName);
```

Use this context for installation, registration, and send operations instead of reconstructing it for every call.

## Core Workflow: Manage Installations

For new code, prefer installations as the device-registration model. An installation ties together your app's installation identifier, the platform push channel, and any tags you want to target later.

### Create or update an installation

Call `createOrUpdateInstallation(...)` whenever a device is first registered or its push token changes:

```js
import {
  createClientContext,
  createOrUpdateInstallation,
} from "@azure/notification-hubs";

const context = createClientContext(
  process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING,
  process.env.AZURE_NOTIFICATION_HUB_NAME,
);

const installation = {
  installationId: "user-42-ios",
  platform: "apns",
  pushChannel: process.env.APNS_DEVICE_TOKEN,
  tags: ["user:42", "tenant:acme", "ios"],
};

await createOrUpdateInstallation(context, installation);
```

The important fields are:

- `installationId`: your stable identifier for the app installation
- `platform`: the push platform for this device
- `pushChannel`: the current device token or channel from that push platform
- `tags`: optional targeting labels you can use later in `tagExpression`

### Read or delete an installation

```js
import {
  createClientContext,
  deleteInstallation,
  getInstallation,
} from "@azure/notification-hubs";

const context = createClientContext(
  process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING,
  process.env.AZURE_NOTIFICATION_HUB_NAME,
);

const installationId = "user-42-ios";

const installation = await getInstallation(context, installationId);
console.log(installation.installationId, installation.tags);

await deleteInstallation(context, installationId);
```

Delete installations when a user signs out permanently, disables notifications, or you know the app installation should no longer receive pushes.

## Core Workflow: Send Notifications

`sendNotification(...)` sends a platform payload through Notification Hubs. If you omit targeting options, the send is broadcast to all matching platform registrations in the hub. If you provide a `tagExpression`, the send is targeted.

### Send an APNS notification to a tag expression

```js
import {
  createAppleNotification,
  createClientContext,
  sendNotification,
} from "@azure/notification-hubs";

const context = createClientContext(
  process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING,
  process.env.AZURE_NOTIFICATION_HUB_NAME,
);

const notification = createAppleNotification({
  body: JSON.stringify({
    aps: {
      alert: {
        title: "Order shipped",
        body: "Tap to track package 12345",
      },
      sound: "default",
    },
    orderId: "12345",
  }),
});

await sendNotification(context, notification, {
  tagExpression: "user:42",
});
```

The payload inside `body` must match the push platform you are sending to. Notification Hubs routes the payload, but APNS still expects APNS JSON and FCM still expects FCM JSON.

### Send an FCM v1 notification

```js
import {
  createClientContext,
  createFcmV1Notification,
  sendNotification,
} from "@azure/notification-hubs";

const context = createClientContext(
  process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING,
  process.env.AZURE_NOTIFICATION_HUB_NAME,
);

const notification = createFcmV1Notification({
  body: JSON.stringify({
    message: {
      notification: {
        title: "Order shipped",
        body: "Tap to track package 12345",
      },
      data: {
        orderId: "12345",
      },
    },
  }),
});

await sendNotification(context, notification, {
  tagExpression: "tenant:acme && android",
});
```

## Tags And Targeting

Tags are the main way to target subsets of devices without tracking raw push tokens in your application logic.

Typical patterns:

- per-user tags such as `user:42`
- per-tenant tags such as `tenant:acme`
- per-platform tags such as `ios` or `android`
- feature or preference tags such as `marketing-opt-in`

Keep tags stable and meaningful. If a device token rotates, update the installation in place instead of creating a new installation with a different `installationId` unless the app installation itself has changed.

## Registrations vs Installations

Notification Hubs supports both legacy registrations and the newer installation model. For new JavaScript integrations, use installations unless you are maintaining an older registration-based flow that already exists.

That choice keeps device identity, tags, and template metadata tied to a single installation record you can upsert when the push channel changes.

## Practical Notes

- Keep hub connection strings in a server-side secret store or environment variable, not in browser code or mobile app bundles.
- Configure APNS, FCM, WNS, or other platform credentials on the hub before trying to send. The SDK cannot compensate for missing hub-side platform setup.
- Reuse the same `createClientContext(...)` result across related operations.
- Update the installation whenever the underlying device token changes.
- Use narrowly scoped SAS policies instead of broad management credentials when possible.

## Common Pitfalls

- Treating this package as an Azure Resource Manager SDK for provisioning namespaces or hubs
- Sending an APNS payload to Android devices or an FCM payload to Apple devices
- Forgetting to configure platform credentials on the notification hub before calling `sendNotification(...)`
- Exposing Notification Hubs connection strings in public frontend code
- Creating a new installation ID every time the device token changes instead of updating the existing installation

## Version Notes For `2.0.2`

- This guide targets `@azure/notification-hubs` `2.0.2`.
- New application code should center on `createClientContext(...)`, installation management, and platform-specific notification builders.
- If you are maintaining older registration-based samples, map them carefully to the current top-level operations before copying them into new code.

## Official Sources

- Microsoft Learn API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/notification-hubs/?view=azure-node-latest`
- Microsoft Learn package overview: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/notification-hubs-readme?view=azure-node-latest`
- Azure Notification Hubs installation management concepts: `https://learn.microsoft.com/en-us/azure/notification-hubs/notification-hubs-push-notification-registration-management`
- Azure Notification Hubs templates overview: `https://learn.microsoft.com/en-us/azure/notification-hubs/notification-hubs-templates-cross-platform-push-messages`
- npm package page: `https://www.npmjs.com/package/@azure/notification-hubs`
