---
name: pinpoint
description: "AWS SDK for JavaScript v3 client for Amazon Pinpoint applications, endpoints, and direct message sending"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,pinpoint,messaging,sms,endpoints,analytics,javascript"
---

# AWS Pinpoint SDK for JavaScript (v3)

Use `@aws-sdk/client-pinpoint` to manage Pinpoint applications, upsert endpoints, validate phone numbers, record events, and send direct messages from JavaScript or TypeScript.

## Golden Rule

- Install `@aws-sdk/client-pinpoint`, not the legacy `aws-sdk` v2 package.
- The package version covered here is `3.1007.0`.
- Import from the package root only. Do not deep-import from `dist-*` paths.
- Prefer `PinpointClient` plus explicit commands for application code.
- Treat `ApplicationId` as required configuration; most Pinpoint operations need it.

## Install

```bash
npm install @aws-sdk/client-pinpoint
```

Common companion package:

```bash
npm install @aws-sdk/credential-providers
```

## Client Setup

### Minimal Node.js client

```javascript
import { PinpointClient } from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const applicationId = process.env.PINPOINT_APPLICATION_ID;

if (!applicationId) {
  throw new Error("Set PINPOINT_APPLICATION_ID before calling Pinpoint APIs.");
}
```

### Explicit credentials

```javascript
import { PinpointClient } from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

## Credentials and Region

In Node.js, the default AWS credential provider chain is usually enough if you already authenticate with environment variables, shared config files, ECS, EC2 instance metadata, or IAM Identity Center.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export PINPOINT_APPLICATION_ID=your-pinpoint-application-id
```

If you rely on shared AWS config instead of environment variables, keep the client initialization simple and set only the region in code.

## Core Usage Pattern

The v3 SDK uses client-plus-command calls:

```javascript
import {
  GetAppCommand,
  PinpointClient,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await pinpoint.send(
  new GetAppCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
  }),
);

console.log(response.ApplicationResponse?.Name);
```

## Common Operations

### Create a Pinpoint application

Use this once when provisioning a new project. Save the returned application ID and reuse it in later calls.

```javascript
import {
  CreateAppCommand,
  PinpointClient,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

const response = await pinpoint.send(
  new CreateAppCommand({
    CreateApplicationRequest: {
      Name: "orders-prod",
    },
  }),
);

console.log(response.ApplicationResponse?.Id);
```

### Read application details

```javascript
import {
  GetAppCommand,
  PinpointClient,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

const { ApplicationResponse } = await pinpoint.send(
  new GetAppCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
  }),
);

console.log(ApplicationResponse?.Name);
console.log(ApplicationResponse?.Id);
```

### Create or update an endpoint

Pinpoint endpoints represent an addressable destination such as an SMS number, email address, or device token. Reuse the same `EndpointId` when you want to update an existing profile.

```javascript
import {
  PinpointClient,
  UpdateEndpointCommand,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

await pinpoint.send(
  new UpdateEndpointCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
    EndpointId: "user-123-sms",
    EndpointRequest: {
      Address: "+12065550100",
      ChannelType: "SMS",
      OptOut: "NONE",
      Attributes: {
        interests: ["product-updates", "receipts"],
      },
      User: {
        UserId: "user-123",
        UserAttributes: {
          tier: ["pro"],
        },
      },
    },
  }),
);
```

### Delete an endpoint

```javascript
import {
  DeleteEndpointCommand,
  PinpointClient,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

await pinpoint.send(
  new DeleteEndpointCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
    EndpointId: "user-123-sms",
  }),
);
```

### Send a direct SMS message

Use `SendMessagesCommand` when you already know the destination address. For SMS, supply the address in E.164 format.

```javascript
import {
  PinpointClient,
  SendMessagesCommand,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

const response = await pinpoint.send(
  new SendMessagesCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
    MessageRequest: {
      Addresses: {
        "+12065550100": {
          ChannelType: "SMS",
        },
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: "Your verification code is 123456",
          MessageType: "TRANSACTIONAL",
        },
      },
    },
  }),
);

console.log(response.MessageResponse?.Result);
```

Add `OriginationNumber` or `SenderId` to `SMSMessage` when your Pinpoint configuration requires them.

### Send a message to known Pinpoint users

Use `SendUsersMessagesCommand` when your application already maps users to Pinpoint endpoints and you want Pinpoint to resolve the target endpoints for each user.

```javascript
import {
  PinpointClient,
  SendUsersMessagesCommand,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

const response = await pinpoint.send(
  new SendUsersMessagesCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
    SendUsersMessageRequest: {
      Users: {
        "user-123": {},
      },
      MessageConfiguration: {
        SMSMessage: {
          Body: "Your order has shipped.",
          MessageType: "TRANSACTIONAL",
        },
      },
    },
  }),
);

console.log(response.SendUsersMessageResponse?.Result);
```

### Record an event for an endpoint

Use `PutEventsCommand` to send custom analytics or lifecycle events tied to a specific endpoint.

```javascript
import {
  PinpointClient,
  PutEventsCommand,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

await pinpoint.send(
  new PutEventsCommand({
    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
    EventsRequest: {
      BatchItem: {
        "user-123-sms": {
          Endpoint: {
            Address: "+12065550100",
            ChannelType: "SMS",
            OptOut: "NONE",
          },
          Events: {
            [`order-created-${Date.now()}`]: {
              EventType: "order.created",
              Timestamp: new Date().toISOString(),
              Metrics: {
                value: 1,
              },
            },
          },
        },
      },
    },
  }),
);
```

### Validate a phone number before sending

```javascript
import {
  PhoneNumberValidateCommand,
  PinpointClient,
} from "@aws-sdk/client-pinpoint";

const pinpoint = new PinpointClient({ region: "us-east-1" });

const response = await pinpoint.send(
  new PhoneNumberValidateCommand({
    NumberValidateRequest: {
      PhoneNumber: "+12065550100",
    },
  }),
);

console.log(response.NumberValidateResponse);
```

## Pinpoint-Specific Gotchas

- Most commands require `ApplicationId`; store it alongside your other service configuration.
- Use E.164 phone numbers for SMS destinations, such as `+12065550100`.
- Reuse stable `EndpointId` values to update the same endpoint instead of creating disconnected profiles.
- Endpoint `Attributes` and `UserAttributes` are maps of string arrays, not plain strings.
- `SendMessagesCommand` targets explicit addresses or endpoints; `SendUsersMessagesCommand` targets user IDs that Pinpoint resolves to endpoints.
- `SMSMessage.MessageType` is typically `TRANSACTIONAL` or `PROMOTIONAL`; choose the value that matches your use case and account configuration.
- If your SMS setup depends on a dedicated origination number or sender ID, include it in the message configuration before sending.
- Do not deep-import package internals from build directories.

## When To Reach For Other Packages

- `@aws-sdk/credential-providers`: shared config, IAM Identity Center, STS assume-role flows, and other credential helpers.

## Useful Links

- AWS SDK for JavaScript v3 Pinpoint client docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/pinpoint/
- `@aws-sdk/client-pinpoint` on npm: https://www.npmjs.com/package/@aws-sdk/client-pinpoint
