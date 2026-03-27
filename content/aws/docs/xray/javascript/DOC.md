---
name: xray
description: "AWS SDK for JavaScript v3 client for querying traces, service graphs, groups, sampling rules, encryption settings, and raw trace ingestion in AWS X-Ray"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,xray,tracing,observability,javascript,nodejs,sdk"
---

# AWS X-Ray SDK for JavaScript (v3)

Use `@aws-sdk/client-xray` when your code needs direct access to the AWS X-Ray API from JavaScript or TypeScript. Common uses are querying traces for a time window, loading full trace documents, building service graphs, managing groups and sampling rules, checking encryption settings, and sending raw segment or telemetry data.

This package is usually used from trusted backend code, admin tools, or custom tracing infrastructure.

## Install

```bash
npm install @aws-sdk/client-xray
```

If you want to select a shared AWS profile explicitly in code, also install the credential helpers:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

X-Ray is regional. Use the same AWS region where your traces, groups, and sampling rules live.

Typical local environment setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```

If you use shared AWS config instead of raw keys:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=your-profile
```

`AWS_SESSION_TOKEN` is only required for temporary credentials.

## Initialize the client

Use the default AWS SDK v3 credential chain when your environment is already configured:

```javascript
import { XRayClient } from "@aws-sdk/client-xray";

const xray = new XRayClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to force a named shared profile in Node.js:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { XRayClient } from "@aws-sdk/client-xray";

const xray = new XRayClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "default",
  }),
});
```

## Query trace summaries

`GetTraceSummaries` is the normal starting point when you want traces from a specific time window. `StartTime` and `EndTime` are required.

```javascript
import {
  GetTraceSummariesCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function getRecentTraceSummaries() {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 15 * 60 * 1000);

  const response = await xray.send(
    new GetTraceSummariesCommand({
      StartTime: startTime,
      EndTime: endTime,
    }),
  );

  for (const summary of response.TraceSummaries ?? []) {
    console.log({
      id: summary.Id,
      startTime: summary.StartTime,
      duration: summary.Duration,
      hasError: summary.HasError,
      hasFault: summary.HasFault,
      hasThrottle: summary.HasThrottle,
    });
  }

  return response.TraceSummaries ?? [];
}
```

If a query spans multiple pages, call the same command again with `NextToken`.

```javascript
import {
  GetTraceSummariesCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function listAllTraceSummaries(startTime, endTime) {
  const traceSummaries = [];
  let nextToken;

  do {
    const response = await xray.send(
      new GetTraceSummariesCommand({
        StartTime: startTime,
        EndTime: endTime,
        NextToken: nextToken,
      }),
    );

    traceSummaries.push(...(response.TraceSummaries ?? []));
    nextToken = response.NextToken;
  } while (nextToken);

  return traceSummaries;
}
```

## Load full traces by ID

`BatchGetTraces` loads the trace documents for one or more trace IDs. Each returned segment document is a JSON string, so parse it before you inspect fields.

```javascript
import {
  BatchGetTracesCommand,
  GetTraceSummariesCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function getFullTracesForLast15Minutes() {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 15 * 60 * 1000);

  const summaries = await xray.send(
    new GetTraceSummariesCommand({
      StartTime: startTime,
      EndTime: endTime,
    }),
  );

  const traceIds = (summaries.TraceSummaries ?? [])
    .map((summary) => summary.Id)
    .filter(Boolean);

  if (traceIds.length === 0) {
    return [];
  }

  const traces = await xray.send(
    new BatchGetTracesCommand({
      TraceIds: traceIds,
    }),
  );

  return (traces.Traces ?? []).map((trace) => ({
    id: trace.Id,
    duration: trace.Duration,
    segments: (trace.Segments ?? [])
      .filter((segment) => typeof segment.Document === "string")
      .map((segment) => JSON.parse(segment.Document)),
  }));
}
```

## Build a service graph

`GetServiceGraph` returns the services involved in the selected time window. You can scope the graph to a group with `GroupName` or `GroupARN`.

```javascript
import {
  GetServiceGraphCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function getServiceGraph() {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 15 * 60 * 1000);

  const response = await xray.send(
    new GetServiceGraphCommand({
      StartTime: startTime,
      EndTime: endTime,
      GroupName: "AdminGroup",
    }),
  );

  for (const service of response.Services ?? []) {
    console.log({
      name: service.Name,
      type: service.Type,
      state: service.State,
    });
  }

  return response.Services ?? [];
}
```

## Create and update groups

Groups let you save a filter expression and reuse it in X-Ray queries. `CreateGroup` requires `GroupName`. `UpdateGroup` can target a group by name or ARN.

```javascript
import {
  CreateGroupCommand,
  GetGroupsCommand,
  UpdateGroupCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function manageGroups() {
  await xray.send(
    new CreateGroupCommand({
      GroupName: "AdminGroup",
      FilterExpression: 'service("mydomain.com") {fault OR error}',
      InsightsConfiguration: {
        InsightsEnabled: true,
        NotificationsEnabled: true,
      },
    }),
  );

  await xray.send(
    new UpdateGroupCommand({
      GroupName: "AdminGroup",
      FilterExpression: 'service("mydomain.com") {fault}',
    }),
  );

  const response = await xray.send(new GetGroupsCommand({}));
  return response.Groups ?? [];
}
```

## Inspect and update sampling rules

Use `GetSamplingRules` to inspect current rules. `CreateSamplingRule` requires the full rule shape. `UpdateSamplingRule` only needs the fields you want to change.

```javascript
import {
  CreateSamplingRuleCommand,
  GetSamplingRulesCommand,
  UpdateSamplingRuleCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function manageSamplingRules() {
  const currentRules = await xray.send(new GetSamplingRulesCommand({}));

  await xray.send(
    new CreateSamplingRuleCommand({
      SamplingRule: {
        RuleName: "base-scorekeep",
        ResourceARN: "*",
        Priority: 9000,
        FixedRate: 0.1,
        ReservoirSize: 5,
        ServiceName: "Scorekeep",
        ServiceType: "*",
        Host: "*",
        HTTPMethod: "*",
        URLPath: "*",
        Version: 1,
      },
    }),
  );

  await xray.send(
    new UpdateSamplingRuleCommand({
      SamplingRuleUpdate: {
        RuleName: "Default",
        FixedRate: 0.01,
        ReservoirSize: 0,
      },
    }),
  );

  return currentRules.SamplingRuleRecords ?? [];
}
```

If you are implementing your own sampler, `GetSamplingTargets` requires one or more `SamplingStatisticsDocuments` entries that report rule usage.

```javascript
import {
  GetSamplingTargetsCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function getSamplingTargets() {
  const response = await xray.send(
    new GetSamplingTargetsCommand({
      SamplingStatisticsDocuments: [
        {
          RuleName: "base-scorekeep",
          ClientID: "ABCDEF1234567890ABCDEF10",
          Timestamp: new Date(),
          RequestCount: 110,
          SampledCount: 20,
          BorrowCount: 10,
        },
      ],
    }),
  );

  return response.SamplingTargetDocuments ?? [];
}
```

## Upload raw trace segments

`PutTraceSegments` is the low-level ingestion API. Pass one or more JSON strings in `TraceSegmentDocuments`.

```javascript
import {
  PutTraceSegmentsCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function putTraceSegment() {
  const segmentDocument = {
    id: "20312a0e2b8809f4",
    name: "DynamoDB",
    trace_id: "1-5832862d-a43aafded3334a971fe312db",
    start_time: 1479706157.195,
    end_time: 1479706157.202,
    parent_id: "79736b962fe3239e",
    inferred: true,
    http: {
      response: {
        content_length: 60,
        status: 200,
      },
    },
    aws: {
      consistent_read: false,
      table_name: "scorekeep-session-xray",
      operation: "GetItem",
      request_id: "SCAU23OM6M8FO38UASGC7785ARVV4KQNSO5AEMVJF66Q9ASUAAJG",
      resource_names: ["scorekeep-session-xray"],
    },
    origin: "AWS::DynamoDB::Table",
  };

  const response = await xray.send(
    new PutTraceSegmentsCommand({
      TraceSegmentDocuments: [JSON.stringify(segmentDocument)],
    }),
  );

  return response.UnprocessedTraceSegments ?? [];
}
```

If X-Ray rejects a segment, inspect `UnprocessedTraceSegments` for the error code and message.

## Send telemetry records

`PutTelemetryRecords` is the companion low-level API for reporting segment delivery counts and backend connection errors.

```javascript
import {
  PutTelemetryRecordsCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function putTelemetry() {
  await xray.send(
    new PutTelemetryRecordsCommand({
      Hostname: "checkout-api-1",
      TelemetryRecords: [
        {
          Timestamp: new Date(),
          SegmentsReceivedCount: 100,
          SegmentsSentCount: 100,
          SegmentsRejectedCount: 0,
          BackendConnectionErrors: {
            TimeoutCount: 0,
            ConnectionRefusedCount: 0,
            HTTPCode4XXCount: 0,
            HTTPCode5XXCount: 0,
          },
        },
      ],
    }),
  );
}
```

## Check or change encryption settings

Use `GetEncryptionConfig` to inspect the current mode. Use `PutEncryptionConfig` to switch to KMS-backed encryption or back to the default service-managed mode.

```javascript
import {
  GetEncryptionConfigCommand,
  PutEncryptionConfigCommand,
  XRayClient,
} from "@aws-sdk/client-xray";

const xray = new XRayClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function configureEncryption() {
  const current = await xray.send(new GetEncryptionConfigCommand({}));
  console.log(current.EncryptionConfig);

  const updated = await xray.send(
    new PutEncryptionConfigCommand({
      Type: "KMS",
      KeyId: "alias/aws/xray",
    }),
  );

  return updated.EncryptionConfig;
}
```

## Common pitfalls

- `PutTraceSegmentsCommand` expects JSON strings in `TraceSegmentDocuments`, not plain JavaScript objects.
- `BatchGetTracesCommand` returns each segment `Document` as a JSON string; parse it with `JSON.parse` before reading fields.
- `GetTraceSummariesCommand` and `GetServiceGraphCommand` both require `StartTime` and `EndTime`.
- `CreateSamplingRuleCommand` requires the full sampling rule shape, including `ResourceARN`, `Priority`, `FixedRate`, `ReservoirSize`, `ServiceName`, `ServiceType`, `Host`, `HTTPMethod`, `URLPath`, and `Version`.
- Many X-Ray read APIs paginate with `NextToken`, including `GetTraceSummaries`, `BatchGetTraces`, `GetServiceGraph`, `GetGroups`, and `GetSamplingRules`.
- X-Ray resources are regional. If a query unexpectedly returns nothing, confirm that the client region matches the region where the traces or groups were created.

## Useful links

- AWS SDK for JavaScript v3 X-Ray client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/xray/`
- AWS X-Ray API tutorial: `https://docs.aws.amazon.com/xray/latest/devguide/xray-api-tutorial.html`
- AWS X-Ray sampling rules guide: `https://docs.aws.amazon.com/xray/latest/devguide/xray-api-sampling.html`
- AWS X-Ray configuration guide: `https://docs.aws.amazon.com/xray/latest/devguide/xray-api-configuration.html`
- Sending trace data to AWS X-Ray: `https://docs.aws.amazon.com/xray/latest/devguide/xray-api-sendingdata.html#xray-api-segments`
