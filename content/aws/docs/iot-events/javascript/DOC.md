---
name: iot-events
description: "AWS SDK for JavaScript v3 client for AWS IoT Events control-plane APIs, including inputs, detector models, alarm models, logging, and analysis."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,iot-events,javascript,nodejs,iot,detectors,alarms"
---

# `@aws-sdk/client-iot-events`

Use this package for AWS IoT Events control-plane APIs in AWS SDK for JavaScript v3. It covers creating and describing inputs, detector models, and alarm models, plus logging, tagging, and detector model analysis.

This client does not send runtime device messages. Input messages are sent through the separate AWS IoT Events data-plane API, where `BatchPutMessage` lives.

## Install

```bash
npm install @aws-sdk/client-iot-events
```

## Prerequisites

Set AWS credentials and a region before calling the client:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export IOTEVENTS_ROLE_ARN=arn:aws:iam::123456789012:role/IoTEventsRole
```

If you use shared config instead of raw keys, set `AWS_PROFILE` and keep `AWS_REGION`:

```bash
export AWS_PROFILE=my-team-dev
export AWS_REGION=us-east-1
```

`IOTEVENTS_ROLE_ARN` is the service role that AWS IoT Events uses for detector actions and logging. It is separate from the credentials your application uses to call the API.

## Initialize the client

```javascript
import { IoTEventsClient } from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, the default credential provider chain usually works if you already configured environment variables, a shared AWS profile, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## What this client covers

`@aws-sdk/client-iot-events` is the control-plane client for AWS IoT Events APIs such as:

- inputs: `CreateInputCommand`, `DescribeInputCommand`, `ListInputsCommand`, `UpdateInputCommand`
- detector models: `CreateDetectorModelCommand`, `DescribeDetectorModelCommand`, `ListDetectorModelsCommand`, `UpdateDetectorModelCommand`
- alarm models: `CreateAlarmModelCommand`, `DescribeAlarmModelCommand`, `ListAlarmModelsCommand`, `UpdateAlarmModelCommand`
- logging and analysis: `PutLoggingOptionsCommand`, `DescribeLoggingOptionsCommand`, `StartDetectorModelAnalysisCommand`, `GetDetectorModelAnalysisResultsCommand`
- tagging and related lookups: `TagResourceCommand`, `UntagResourceCommand`, `ListTagsForResourceCommand`, `ListInputRoutingsCommand`

If your application needs to send input payloads into AWS IoT Events at runtime, use the AWS IoT Events data-plane API instead of this package.

## Common operations

### Create an input

The input definition exposes JSON payload fields as attributes that detector model expressions can reference later.

```javascript
import {
  CreateInputCommand,
  IoTEventsClient,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new CreateInputCommand({
    inputName: "PressureInput",
    inputDescription: "Pressure readings from a motor",
    inputDefinition: {
      attributes: [
        { jsonPath: "sensorData.pressure" },
        { jsonPath: "motorid" },
      ],
    },
    tags: [
      {
        key: "deviceType",
        value: "motor",
      },
    ],
  }),
);

console.log(response.inputConfiguration?.inputArn);
console.log(response.inputConfiguration?.status);
```

### List and describe inputs

List APIs use `nextToken` for pagination. Loop until AWS stops returning a token.

```javascript
import {
  DescribeInputCommand,
  IoTEventsClient,
  ListInputsCommand,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await client.send(
    new ListInputsCommand({
      maxResults: 50,
      nextToken,
    }),
  );

  for (const summary of page.inputSummaries ?? []) {
    console.log(summary.inputName, summary.status);
  }

  nextToken = page.nextToken;
} while (nextToken);

const detail = await client.send(
  new DescribeInputCommand({
    inputName: "PressureInput",
  }),
);

console.log(detail.input?.inputDefinition?.attributes);
```

### Create a detector model

Detector models are state machines. `key` tells AWS IoT Events which payload field identifies the detector instance that should receive each input.

```javascript
import {
  CreateDetectorModelCommand,
  IoTEventsClient,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const roleArn = process.env.IOTEVENTS_ROLE_ARN;

if (!roleArn) {
  throw new Error("Set IOTEVENTS_ROLE_ARN before creating detector models");
}

const detectorModelDefinition = {
  states: [
    {
      stateName: "Normal",
      onInput: {
        transitionEvents: [
          {
            eventName: "Overpressurized",
            condition: "$input.PressureInput.sensorData.pressure > 70",
            nextState: "Dangerous",
          },
        ],
      },
    },
    {
      stateName: "Dangerous",
      onEnter: {
        events: [
          {
            eventName: "NotifyOperators",
            condition: "true",
            actions: [
              {
                sns: {
                  targetArn: "arn:aws:sns:us-east-1:123456789012:underPressureAction",
                },
              },
            ],
          },
        ],
      },
      onInput: {
        transitionEvents: [
          {
            eventName: "PressureRecovered",
            condition: "$input.PressureInput.sensorData.pressure <= 70",
            nextState: "Normal",
          },
        ],
      },
    },
  ],
  initialStateName: "Normal",
};

const response = await client.send(
  new CreateDetectorModelCommand({
    detectorModelName: "motorDetectorModel",
    detectorModelDescription: "Detect overpressure in a motor.",
    detectorModelDefinition,
    key: "motorid",
    roleArn,
  }),
);

console.log(response.detectorModelConfiguration?.detectorModelArn);
console.log(response.detectorModelConfiguration?.detectorModelVersion);
```

### Describe the latest detector model version

If you omit `detectorModelVersion`, AWS IoT Events returns the latest version.

```javascript
import {
  DescribeDetectorModelCommand,
  IoTEventsClient,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new DescribeDetectorModelCommand({
    detectorModelName: "motorDetectorModel",
  }),
);

console.log(response.detectorModel?.detectorModelConfiguration?.detectorModelVersion);
console.log(response.detectorModel?.detectorModelConfiguration?.status);
```

### Analyze a detector model definition before create or update

`StartDetectorModelAnalysisCommand` takes a detector model definition directly. `GetDetectorModelAnalysisResultsCommand` returns findings such as unsupported actions, expression issues, or missing references.

```javascript
import {
  GetDetectorModelAnalysisResultsCommand,
  IoTEventsClient,
  StartDetectorModelAnalysisCommand,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const detectorModelDefinition = {
  states: [
    {
      stateName: "Normal",
      onInput: {
        transitionEvents: [
          {
            eventName: "Overpressurized",
            condition: "$input.PressureInput.sensorData.pressure > 70",
            nextState: "Dangerous",
          },
        ],
      },
    },
    {
      stateName: "Dangerous",
      onInput: {
        transitionEvents: [
          {
            eventName: "Recovered",
            condition: "$input.PressureInput.sensorData.pressure <= 70",
            nextState: "Normal",
          },
        ],
      },
    },
  ],
  initialStateName: "Normal",
};

const start = await client.send(
  new StartDetectorModelAnalysisCommand({
    detectorModelDefinition,
  }),
);

const analysisId = start.analysisId;

if (!analysisId) {
  throw new Error("AWS IoT Events did not return an analysisId");
}

let nextToken;

do {
  const page = await client.send(
    new GetDetectorModelAnalysisResultsCommand({
      analysisId,
      maxResults: 50,
      nextToken,
    }),
  );

  for (const result of page.analysisResults ?? []) {
    console.log(result.level, result.type, result.message);

    for (const location of result.locations ?? []) {
      console.log("  at", location.path);
    }
  }

  nextToken = page.nextToken;
} while (nextToken);
```

### Configure service logging

```javascript
import {
  DescribeLoggingOptionsCommand,
  IoTEventsClient,
  PutLoggingOptionsCommand,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const roleArn = process.env.IOTEVENTS_ROLE_ARN;

if (!roleArn) {
  throw new Error("Set IOTEVENTS_ROLE_ARN before configuring logging");
}

await client.send(
  new PutLoggingOptionsCommand({
    loggingOptions: {
      roleArn,
      level: "ERROR",
      enabled: true,
      detectorDebugOptions: [
        {
          detectorModelName: "motorDetectorModel",
          keyValue: "motor-123",
        },
      ],
    },
  }),
);

const response = await client.send(new DescribeLoggingOptionsCommand({}));

console.log(response.loggingOptions);
```

### List input routings

Use `ListInputRoutingsCommand` when you need to see how an input is routed. For an AWS IoT Events input, identify it by input name.

```javascript
import {
  IoTEventsClient,
  ListInputRoutingsCommand,
} from "@aws-sdk/client-iot-events";

const client = new IoTEventsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ListInputRoutingsCommand({
    inputIdentifier: {
      iotEventsInputIdentifier: {
        inputName: "PressureInput",
      },
    },
    maxResults: 50,
  }),
);

for (const resource of response.routedResources ?? []) {
  console.log(resource.name, resource.arn);
}
```

## Important gotchas

- This is the control-plane client. Do not expect it to send device payloads into AWS IoT Events.
- `inputDefinition.attributes[].jsonPath` must match fields in the JSON payload that your data-plane messages send. Detector expressions reference those values through `$input.<inputName>...`.
- `key` on a detector model controls detector-instance routing. Set it deliberately if the model tracks state per device or per system.
- `roleArn` is required for detector models and logging. That role needs the permissions required by the actions or logging targets your model uses.
- `DescribeDetectorModelCommand` returns the latest detector model version when you omit `detectorModelVersion`. `DescribeAlarmModelCommand` behaves the same way for alarm model versions.
- `PutLoggingOptionsCommand` changes can take up to one minute to apply. If you changed the IAM policy attached to the logging role, that can take up to five minutes to take effect.
- `GetDetectorModelAnalysisResultsCommand` results are only retrievable for up to 24 hours after AWS IoT Events starts the analysis.
- List-style APIs use `nextToken`; do not assume a single response contains everything.
- If event evaluation order matters in your detector model, set `evaluationMethod` explicitly to either `"BATCH"` or `"SERIAL"` instead of relying on defaults.

## When to reach for other packages

- `@aws-sdk/credential-providers` for explicit credential loading such as shared config, IAM Identity Center, assume-role, or Cognito flows.
- The separate AWS IoT Events data-plane client for runtime message ingestion APIs such as `BatchPutMessage`.
