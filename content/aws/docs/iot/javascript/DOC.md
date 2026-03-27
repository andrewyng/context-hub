---
name: iot
description: "AWS SDK for JavaScript v3 client for AWS IoT Core control-plane APIs, including things, certificates, policies, endpoints, and related registry operations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,iot,javascript,nodejs,iot-core,certificates,things,policies"
---

# `@aws-sdk/client-iot`

Use this package for AWS IoT Core control-plane APIs in AWS SDK for JavaScript v3. It covers registry and account management tasks such as creating things, looking up IoT endpoints, issuing certificates, creating policies, and attaching principals to things.

This client does not open MQTT connections or publish device messages. Use it to manage AWS IoT resources; use an AWS IoT data-plane or device SDK when you need runtime messaging.

## Install

```bash
npm install @aws-sdk/client-iot
```

If you need explicit credential helpers such as assume-role, IAM Identity Center, or Cognito in application code, install the matching provider package too:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Configure AWS credentials and a region before you create the client:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

For local development with a shared profile:

```bash
aws configure --profile iot-dev
export AWS_PROFILE="iot-dev"
export AWS_REGION="us-east-1"
```

AWS IoT Core resources are regional. The client region must match the region where your things, certificates, policies, and endpoints live.

## Client setup

### Minimal Node.js client

```javascript
import { IoTClient } from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { IoTClient } from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

In Node.js, the default credential provider chain is usually enough if you already configured environment variables, a shared AWS profile, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core usage pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeThingCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({ region: "us-east-1" });

const response = await iot.send(
  new DescribeThingCommand({
    thingName: "sensor-123",
  }),
);

console.log(response.thingName, response.thingArn, response.attributes);
```

## Common workflows

### Create a thing in the registry

Use `CreateThingCommand` to register a device identity in the thing registry.

```javascript
import {
  CreateThingCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await iot.send(
  new CreateThingCommand({
    thingName: "sensor-123",
    attributePayload: {
      attributes: {
        site: "plant-1",
        model: "motor-monitor",
      },
      merge: false,
    },
  }),
);

console.log(response.thingName, response.thingArn, response.thingId);
```

### List and describe things

List operations return `nextToken` when more results are available.

```javascript
import {
  DescribeThingCommand,
  IoTClient,
  ListThingsCommand,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await iot.send(
    new ListThingsCommand({
      maxResults: 50,
      nextToken,
    }),
  );

  for (const thing of page.things ?? []) {
    console.log(thing.thingName, thing.thingArn);
  }

  nextToken = page.nextToken;
} while (nextToken);

const detail = await iot.send(
  new DescribeThingCommand({
    thingName: "sensor-123",
  }),
);

console.log(detail.thingName, detail.thingTypeName, detail.attributes);
```

### Look up the account endpoint for device or data-plane clients

`DescribeEndpointCommand` returns the account-specific endpoint address for a given endpoint type. `iot:Data-ATS` is the common endpoint type to use for ATS-signed data endpoints.

```javascript
import {
  DescribeEndpointCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await iot.send(
  new DescribeEndpointCommand({
    endpointType: "iot:Data-ATS",
  }),
);

console.log(response.endpointAddress);
```

### Create device keys and a certificate

`CreateKeysAndCertificateCommand` can create an active certificate and return the private key material in the same response.

Store the private key immediately. AWS IoT does not return the private key again later.

```javascript
import { writeFile } from "node:fs/promises";
import {
  CreateKeysAndCertificateCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await iot.send(
  new CreateKeysAndCertificateCommand({
    setAsActive: true,
  }),
);

const certificateArn = response.certificateArn;
const certificatePem = response.certificatePem;
const privateKey = response.keyPair?.PrivateKey;

if (!certificateArn || !certificatePem || !privateKey) {
  throw new Error("AWS IoT did not return the expected certificate materials");
}

await writeFile("./device-certificate.pem", certificatePem, "utf8");
await writeFile("./device-private-key.pem", privateKey, "utf8");

console.log(certificateArn);
```

### Create a policy and attach the certificate to a thing

This is the usual control-plane flow for provisioning a registry thing and linking an X.509 certificate to it.

```javascript
import {
  AttachPolicyCommand,
  AttachThingPrincipalCommand,
  CreatePolicyCommand,
  IoTClient,
} from "@aws-sdk/client-iot";

const iot = new IoTClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const thingName = "sensor-123";
const certificateArn = "arn:aws:iot:us-east-1:123456789012:cert/abc123...";
const policyName = "sensor-123-policy";

const policyDocument = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Action: [
        "iot:Connect",
        "iot:Publish",
        "iot:Receive",
        "iot:Subscribe",
      ],
      Resource: "*",
    },
  ],
});

await iot.send(
  new CreatePolicyCommand({
    policyName,
    policyDocument,
  }),
);

await iot.send(
  new AttachPolicyCommand({
    policyName,
    target: certificateArn,
  }),
);

await iot.send(
  new AttachThingPrincipalCommand({
    thingName,
    principal: certificateArn,
  }),
);
```

Use a least-privilege policy in real deployments. The wildcard example keeps the provisioning flow readable, but it is broader than most production setups should allow.

## Pitfalls

- `@aws-sdk/client-iot` is the AWS IoT Core control-plane client. It does not replace an MQTT client, thing shadow client, or jobs data-plane client.
- `CreateKeysAndCertificateCommand` returns the private key only when the key pair is created. Persist it before your process exits.
- `AttachPolicyCommand` and `AttachThingPrincipalCommand` use the certificate ARN, not just the certificate ID.
- `CreatePolicyCommand` creates a named policy. Re-running the same create flow with the same `policyName` will fail unless you reuse the existing policy or choose a different name.
- `ListThingsCommand` and similar list APIs paginate with `nextToken`. Do not assume a single response contains everything.
- AWS IoT endpoints are account- and region-specific. A lookup in the wrong region usually looks like a missing endpoint, thing, or certificate.

## When to reach for other packages

- `@aws-sdk/client-iot-data-plane`: use the AWS IoT data plane for operations such as thing shadows.
- An AWS IoT device SDK or another MQTT client: use one of these when you need device connections, publish/subscribe messaging, or long-lived MQTT sessions.
- `@aws-sdk/credential-providers`: use this for explicit assume-role, SSO, Cognito, or other non-default credential flows.

## Version notes

- This guide targets `@aws-sdk/client-iot` version `3.1007.0`.
- AWS SDK for JavaScript v3 uses a modular package layout. Prefer `IoTClient` plus explicit command imports in application code.

## Official Sources

- AWS SDK for JavaScript v3 IoT client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/iot/`
- AWS IoT API Reference: `https://docs.aws.amazon.com/iot/latest/apireference/Welcome.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-iot`
