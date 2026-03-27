---
name: iot-data-plane
description: "AWS SDK for JavaScript v3 client for AWS IoT Core data-plane APIs, including HTTPS publish and thing shadow operations against your account-specific data endpoint."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,iot,iot-core,thing-shadow,publish,javascript,nodejs"
---

# `@aws-sdk/client-iot-data-plane`

Use this package for AWS IoT Core data-plane calls from JavaScript. The common flows are publishing a message to an MQTT topic over HTTPS and reading, updating, listing, or deleting thing shadows.

This is not the AWS IoT control-plane client. Use `@aws-sdk/client-iot` for registry and account operations such as creating things, creating certificates, or discovering your account-specific IoT data endpoint.

## Install

Install the data-plane client:

```bash
npm install @aws-sdk/client-iot-data-plane
```

If you want to resolve the IoT data endpoint from code instead of configuring it manually, install the control-plane client too:

```bash
npm install @aws-sdk/client-iot
```

If your app needs explicit credential helpers for profiles, IAM Identity Center, assume-role, or Cognito, add the credential provider package:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Configure AWS credentials, a region, and the AWS IoT data endpoint before you send requests:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
export AWS_IOT_DATA_ENDPOINT="https://a1b2c3d4e5f6g7-ats.iot.us-east-1.amazonaws.com"
```

For local development with a shared profile:

```bash
aws configure --profile iot-dev
export AWS_PROFILE="iot-dev"
export AWS_REGION="us-east-1"
export AWS_IOT_DATA_ENDPOINT="https://a1b2c3d4e5f6g7-ats.iot.us-east-1.amazonaws.com"
```

The IoT data endpoint is account-specific and regional. In practice, you usually need both the region and the `iot:Data-ATS` endpoint address for the same AWS account and region.

## Resolve the data endpoint

If you do not already have the endpoint address, look it up with the AWS IoT control-plane client and `DescribeEndpointCommand`.

```javascript
import {
  DescribeEndpointCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { endpointAddress } = await iot.send(
  new DescribeEndpointCommand({
    endpointType: "iot:Data-ATS",
  }),
);

if (!endpointAddress) {
  throw new Error("AWS IoT did not return a data endpoint address");
}

const endpoint = `https://${endpointAddress}`;
console.log(endpoint);
```

Store that value and pass it to `IoTDataPlaneClient` as `endpoint`.

## Client setup

### Minimal Node.js client

```javascript
import { IoTDataPlaneClient } from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});
```

### Explicit credentials

```javascript
import { IoTDataPlaneClient } from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

In Node.js, the default AWS SDK v3 credential provider chain is usually enough if you already configured environment variables, a shared profile, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core usage pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetThingShadowCommand,
  IoTDataPlaneClient,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

const response = await iotData.send(
  new GetThingShadowCommand({
    thingName: "sensor-123",
  }),
);

const shadowJson = new TextDecoder().decode(response.payload);
console.log(JSON.parse(shadowJson));
```

For shadow APIs, the response payload is JSON bytes. Decode it before parsing.

## Common workflows

### Publish a JSON message to a topic

`PublishCommand` sends a single HTTPS publish request to an MQTT topic.

```javascript
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

const payload = {
  deviceId: "sensor-123",
  temperatureC: 21.4,
  recordedAt: new Date().toISOString(),
};

await iotData.send(
  new PublishCommand({
    topic: "devices/sensor-123/telemetry",
    qos: 1,
    payload: Buffer.from(JSON.stringify(payload)),
  }),
);
```

Use `qos: 0` or `qos: 1` depending on your delivery requirements.

### Read the classic thing shadow

Use the unnamed shadow when you do not pass `shadowName`.

```javascript
import {
  GetThingShadowCommand,
  IoTDataPlaneClient,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

const { payload } = await iotData.send(
  new GetThingShadowCommand({
    thingName: "sensor-123",
  }),
);

const shadow = JSON.parse(new TextDecoder().decode(payload));

console.log(shadow.state?.desired);
console.log(shadow.state?.reported);
```

### Update a thing shadow

Send the shadow document as JSON bytes.

```javascript
import {
  IoTDataPlaneClient,
  UpdateThingShadowCommand,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

const update = {
  state: {
    desired: {
      samplingIntervalSeconds: 60,
      ledEnabled: true,
    },
  },
};

const { payload } = await iotData.send(
  new UpdateThingShadowCommand({
    thingName: "sensor-123",
    payload: Buffer.from(JSON.stringify(update)),
  }),
);

const updatedShadow = JSON.parse(new TextDecoder().decode(payload));
console.log(updatedShadow.state?.desired);
```

### Work with a named shadow

Pass `shadowName` when the thing uses multiple independent shadow documents.

```javascript
import {
  GetThingShadowCommand,
  IoTDataPlaneClient,
  UpdateThingShadowCommand,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

await iotData.send(
  new UpdateThingShadowCommand({
    thingName: "sensor-123",
    shadowName: "config",
    payload: Buffer.from(
      JSON.stringify({
        state: {
          desired: {
            firmwareChannel: "stable",
          },
        },
      }),
    ),
  }),
);

const { payload } = await iotData.send(
  new GetThingShadowCommand({
    thingName: "sensor-123",
    shadowName: "config",
  }),
);

console.log(JSON.parse(new TextDecoder().decode(payload)));
```

### List named shadows for a thing

Use `ListNamedShadowsForThingCommand` when you need to discover existing named shadows.

```javascript
import {
  IoTDataPlaneClient,
  ListNamedShadowsForThingCommand,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

const response = await iotData.send(
  new ListNamedShadowsForThingCommand({
    thingName: "sensor-123",
    pageSize: 25,
  }),
);

for (const shadowName of response.results ?? []) {
  console.log(shadowName);
}
```

### Delete a thing shadow

Delete the classic shadow or pass `shadowName` to delete a named shadow.

```javascript
import {
  DeleteThingShadowCommand,
  IoTDataPlaneClient,
} from "@aws-sdk/client-iot-data-plane";

const iotData = new IoTDataPlaneClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_IOT_DATA_ENDPOINT,
});

await iotData.send(
  new DeleteThingShadowCommand({
    thingName: "sensor-123",
  }),
);
```

## Pitfalls

- `IoTDataPlaneClient` needs your account-specific AWS IoT data endpoint. Region-only configuration is not enough for most IoT data-plane flows.
- Use the ATS data endpoint from `DescribeEndpointCommand({ endpointType: "iot:Data-ATS" })`, not the control-plane endpoint.
- This client sends HTTPS API requests. It does not open a long-lived MQTT connection or subscribe to topics.
- Thing shadow responses come back as bytes in `payload`. Decode them before calling `JSON.parse`.
- If you omit `shadowName`, the API reads or updates the classic unnamed shadow.
- The caller still needs IAM permissions for the data-plane actions it uses, such as `iot:Publish`, `iot:GetThingShadow`, `iot:UpdateThingShadow`, and `iot:DeleteThingShadow`.

## When to reach for other packages

- `@aws-sdk/client-iot`: use the AWS IoT Core control plane for things, certificates, policies, and endpoint discovery.
- An AWS IoT device SDK or another MQTT client: use one of these when you need persistent device connections, subscriptions, or long-lived MQTT sessions.
- `@aws-sdk/credential-providers`: use this for explicit assume-role, IAM Identity Center, Cognito, or shared-config credential flows in application code.

## Version notes

- This guide targets `@aws-sdk/client-iot-data-plane` version `3.1007.0`.
- AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Pin the npm package version in your application when exact patch-level parity matters.

## Official Sources

- AWS SDK for JavaScript v3 IoT Data Plane client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/iot-data-plane/`
- AWS IoT API Reference: `https://docs.aws.amazon.com/iot/latest/apireference/Welcome.html`
- AWS IoT `DescribeEndpoint` API reference: `https://docs.aws.amazon.com/iot/latest/apireference/API_DescribeEndpoint.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-iot-data-plane`
