---
name: communication-sms
description: "Azure Communication Services SMS SDK for JavaScript with connection string or Azure Identity auth, message sending, delivery reports, and per-recipient results"
metadata:
  languages: "javascript"
  versions: "1.2.0-beta.4"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,communication-services,sms,javascript,messaging"
---

# Azure Communication Services SMS SDK For JavaScript

## Golden Rule

Use `@azure/communication-sms` from trusted server-side code, create one shared `SmsClient` for your Azure Communication Services resource, send SMS with E.164 phone numbers, and inspect every returned `SmsSendResult` because one recipient can fail even when others succeed.

## Install

```bash
npm install @azure/communication-sms@1.2.0-beta.4
```

If you want Microsoft Entra ID authentication instead of a connection string, install `@azure/identity` too:

```bash
npm install @azure/communication-sms@1.2.0-beta.4 @azure/identity
```

## Prerequisites

Before you send SMS, make sure you already have:

1. An Azure Communication Services resource.
2. A configured SMS-capable sender for that resource.
3. At least one destination phone number for testing.
4. Either the ACS connection string or the ACS endpoint plus an Azure credential flow.

Use E.164 formatting for phone numbers, for example `+14255550123`.

## Configuration

The SDK does not require specific environment variable names. These examples use:

```bash
export ACS_CONNECTION_STRING="endpoint=https://<resource>.communication.azure.com/;accesskey=<key>"
export ACS_ENDPOINT="https://<resource>.communication.azure.com"
export ACS_SMS_FROM="+14255550123"
export ACS_SMS_TO="+14255550124"
```

If you use `DefaultAzureCredential`, provide the usual Azure Identity environment variables or run in an environment with managed identity:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

## Authentication And Client Setup

### Connection String

For backend scripts and services, the connection string constructor is the shortest path:

```js
import { SmsClient } from "@azure/communication-sms";

const connectionString = process.env.ACS_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("Set ACS_CONNECTION_STRING before creating the SMS client.");
}

const smsClient = new SmsClient(connectionString);
```

### Azure Identity

Use the endpoint constructor when your app already uses service principals, workload identity, or managed identity:

```js
import { SmsClient } from "@azure/communication-sms";
import { DefaultAzureCredential } from "@azure/identity";

const endpoint = process.env.ACS_ENDPOINT;

if (!endpoint) {
  throw new Error("Set ACS_ENDPOINT before creating the SMS client.");
}

const smsClient = new SmsClient(endpoint, new DefaultAzureCredential());
```

## Client Initialization

Create one shared client and reuse it for SMS operations instead of constructing a new client for every send:

```js
import { SmsClient } from "@azure/communication-sms";
import { DefaultAzureCredential } from "@azure/identity";

export function createSmsClient() {
  if (process.env.ACS_CONNECTION_STRING) {
    return new SmsClient(process.env.ACS_CONNECTION_STRING);
  }

  if (process.env.ACS_ENDPOINT) {
    return new SmsClient(process.env.ACS_ENDPOINT, new DefaultAzureCredential());
  }

  throw new Error(
    "Set ACS_CONNECTION_STRING or ACS_ENDPOINT before creating the SMS client.",
  );
}
```

## Core Usage

### Send One Message

`send(...)` returns an array with one `SmsSendResult` per recipient, even if you send to only one number.

```js
import { SmsClient } from "@azure/communication-sms";

const smsClient = new SmsClient(process.env.ACS_CONNECTION_STRING);

const results = await smsClient.send({
  from: process.env.ACS_SMS_FROM,
  to: [process.env.ACS_SMS_TO],
  message: "Hello from Azure Communication Services",
  enableDeliveryReport: true,
  tag: "chub-sample",
});

const result = results[0];

console.log(result.to);
console.log(result.successful);
console.log(result.messageId);
console.log(result.httpStatusCode);
console.log(result.errorMessage);
```

### Send To Multiple Recipients

```js
const results = await smsClient.send({
  from: process.env.ACS_SMS_FROM,
  to: ["+14255550124", "+14255550125"],
  message: "Deployment finished successfully.",
  enableDeliveryReport: true,
  tag: "deploy-status",
});

for (const item of results) {
  console.log(item.to, item.successful, item.httpStatusCode, item.errorMessage);
}
```

### Fail Fast When Any Recipient Fails

```js
const failed = results.filter((item) => !item.successful);

if (failed.length > 0) {
  throw new Error(
    `SMS send failed for: ${failed.map((item) => item.to).join(", ")}`,
  );
}
```

## Delivery Reports And Tags

The maintainer quickstart documents two useful optional send fields:

- `enableDeliveryReport: true` requests delivery reporting.
- `tag: "..."` attaches metadata that comes back with the delivery report.

If you need downstream status tracking, persist the returned `messageId` values and use a stable `tag` for correlation.

## Minimal Script

This is a complete script you can drop into a Node app to verify configuration and send one SMS:

```js
import { SmsClient } from "@azure/communication-sms";

const connectionString = process.env.ACS_CONNECTION_STRING;
const from = process.env.ACS_SMS_FROM;
const to = process.env.ACS_SMS_TO;

if (!connectionString || !from || !to) {
  throw new Error(
    "Set ACS_CONNECTION_STRING, ACS_SMS_FROM, and ACS_SMS_TO before sending SMS.",
  );
}

const client = new SmsClient(connectionString);
const results = await client.send({
  from,
  to: [to],
  message: "Hello from Azure Communication Services SMS",
  enableDeliveryReport: true,
  tag: "quickstart",
});

for (const result of results) {
  if (result.successful) {
    console.log(`Sent to ${result.to}: ${result.messageId}`);
  } else {
    console.error(
      `Failed for ${result.to}: ${result.httpStatusCode} ${result.errorMessage}`,
    );
  }
}
```

## Common Pitfalls

### Keep Numbers In E.164 Format

Normalize both sender and recipient numbers before calling `send(...)`.

### Handle Results Per Recipient

The promise resolving does not mean every recipient succeeded. Always inspect every returned `SmsSendResult`.

### Do Not Mix Authentication Flows

- `new SmsClient(connectionString)` expects the full ACS connection string.
- `new SmsClient(endpoint, credential)` expects the ACS endpoint plus a credential object.

Do not pass a connection string where the endpoint constructor expects a URL.

### `@azure/identity` Is Separate

`DefaultAzureCredential` is not bundled into `@azure/communication-sms`. Install `@azure/identity` explicitly when you use Microsoft Entra ID auth.

### Keep Secrets Out Of Client Apps

If you use a connection string, keep it on a trusted backend or worker process rather than shipping it to browsers or other untrusted clients.

## Version Notes For `1.2.0-beta.4`

- This guide targets `@azure/communication-sms` `1.2.0-beta.4`.
- If you upgrade to a newer release, confirm constructor overloads, send options, and result fields against the current maintainer README and API reference.

## Official Sources

- Microsoft Learn JavaScript package namespace: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-sms/`
- Microsoft Learn JavaScript package overview: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/communication-sms-readme?view=azure-node-latest`
- Microsoft Learn `SmsClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/communication-sms/smsclient?view=azure-node-latest`
- Microsoft Learn SMS quickstart: `https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/sms/send`
- npm package page: `https://www.npmjs.com/package/@azure/communication-sms`
