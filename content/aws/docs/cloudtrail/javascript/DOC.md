---
name: cloudtrail
description: "AWS SDK for JavaScript v3 client for managing CloudTrail trails, logging state, event selectors, and recent event lookup."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cloudtrail,javascript,nodejs,audit,logging,security,aws-sdk-v3"
---

# `@aws-sdk/client-cloudtrail`

Use this package to manage AWS CloudTrail from JavaScript or Node.js with AWS SDK v3. The common flow is: create or inspect a trail, point it at an S3 bucket, start or stop logging, adjust event selectors, and look up recent events when you need to inspect account activity.

This package is the CloudTrail control-plane client. It manages trail configuration and event lookup APIs, but it does not create the S3 bucket, KMS key, or CloudWatch Logs resources that a trail can depend on.

## Install

```bash
npm install @aws-sdk/client-cloudtrail
```

If you want to select a named AWS profile in code, install the credential provider package you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

- AWS credentials that can call CloudTrail APIs in the target account.
- An AWS region.
- An existing S3 bucket for trail log delivery.
- If you enable SSE-KMS or CloudWatch Logs integration, the related KMS key, log group, and IAM permissions must already be in place.

Typical local environment:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
export CLOUDTRAIL_BUCKET="my-cloudtrail-logs-bucket"
```

If you use shared AWS config locally, `AWS_PROFILE` also works with the standard AWS SDK v3 credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { CloudTrailClient } from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Named profile with `fromIni`

```javascript
import { CloudTrailClient } from "@aws-sdk/client-cloudtrail";
import { fromIni } from "@aws-sdk/credential-providers";

const cloudtrail = new CloudTrailClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  CloudTrailClient,
  ListTrailsCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({ region: "us-east-1" });

const response = await cloudtrail.send(new ListTrailsCommand({}));

for (const trail of response.Trails ?? []) {
  console.log(trail.Name, trail.TrailARN, trail.HomeRegion);
}
```

## Common Workflows

### Create a trail and start logging

Create the trail first, then start logging explicitly.

```javascript
import {
  CloudTrailClient,
  CreateTrailCommand,
  StartLoggingCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const trailName = "app-audit-trail";

const created = await cloudtrail.send(
  new CreateTrailCommand({
    Name: trailName,
    S3BucketName: process.env.CLOUDTRAIL_BUCKET,
    IsMultiRegionTrail: true,
    IncludeGlobalServiceEvents: true,
    EnableLogFileValidation: true,
  }),
);

console.log(created.TrailARN);

await cloudtrail.send(
  new StartLoggingCommand({
    Name: trailName,
  }),
);
```

Use `KmsKeyId`, `CloudWatchLogsLogGroupArn`, and `CloudWatchLogsRoleArn` only when those resources and permissions are already configured.

### List trails and inspect one trail

Use `ListTrails` for discovery, `GetTrail` for configuration details, and `GetTrailStatus` for logging and delivery state.

```javascript
import {
  CloudTrailClient,
  GetTrailCommand,
  GetTrailStatusCommand,
  ListTrailsCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Trails = [] } = await cloudtrail.send(new ListTrailsCommand({}));

for (const trail of Trails) {
  console.log(trail.Name, trail.TrailARN, trail.HomeRegion);
}

const trailName = "app-audit-trail";

const detail = await cloudtrail.send(
  new GetTrailCommand({
    Name: trailName,
  }),
);

const status = await cloudtrail.send(
  new GetTrailStatusCommand({
    Name: trailName,
  }),
);

console.log(detail.Trail?.S3BucketName);
console.log(detail.Trail?.IsMultiRegionTrail);
console.log(status.IsLogging);
console.log(status.LatestDeliveryTime);
console.log(status.LatestDeliveryError);
```

### Change what the trail records

`PutEventSelectors` lets you keep management events enabled and add data events for specific resources.

```javascript
import {
  CloudTrailClient,
  PutEventSelectorsCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await cloudtrail.send(
  new PutEventSelectorsCommand({
    TrailName: "app-audit-trail",
    EventSelectors: [
      {
        ReadWriteType: "All",
        IncludeManagementEvents: true,
        DataResources: [
          {
            Type: "AWS::S3::Object",
            Values: ["arn:aws:s3:::example-bucket/"],
          },
        ],
      },
    ],
  }),
);
```

For S3 object data events, the `Values` entry is an S3 bucket ARN prefix with a trailing slash.

### Look up recent events

Use `LookupEvents` when you need recent CloudTrail event history and paginate with `NextToken` when the result set is larger than one page.

```javascript
import {
  CloudTrailClient,
  LookupEventsCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let NextToken;

do {
  const response = await cloudtrail.send(
    new LookupEventsCommand({
      LookupAttributes: [
        {
          AttributeKey: "EventName",
          AttributeValue: "CreateTrail",
        },
      ],
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      EndTime: new Date(),
      MaxResults: 50,
      NextToken,
    }),
  );

  for (const event of response.Events ?? []) {
    console.log(event.EventTime, event.EventName, event.Username);

    if (event.CloudTrailEvent) {
      const detail = JSON.parse(event.CloudTrailEvent);
      console.log(detail.eventSource, detail.sourceIPAddress);
    }
  }

  NextToken = response.NextToken;
} while (NextToken);
```

`CloudTrailEvent` is returned as a JSON string. Parse it before reading nested request or response fields.

### Update, stop, or delete a trail

Use `UpdateTrail` for configuration changes. Use `StopLogging` when you want to keep the trail definition but pause delivery. Delete the trail when you no longer want the configuration to exist.

```javascript
import {
  CloudTrailClient,
  DeleteTrailCommand,
  StopLoggingCommand,
  UpdateTrailCommand,
} from "@aws-sdk/client-cloudtrail";

const cloudtrail = new CloudTrailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await cloudtrail.send(
  new UpdateTrailCommand({
    Name: "app-audit-trail",
    EnableLogFileValidation: true,
  }),
);

await cloudtrail.send(
  new StopLoggingCommand({
    Name: "app-audit-trail",
  }),
);

await cloudtrail.send(
  new DeleteTrailCommand({
    Name: "app-audit-trail",
  }),
);
```

## Pitfalls

- `CreateTrail` does not create the S3 bucket or fix its bucket policy for you.
- Creating a trail and starting log delivery are separate API calls.
- `GetTrailStatus` is the quickest way to confirm whether a trail is actively logging and whether recent delivery attempts are succeeding.
- `LookupEvents` paginates; keep following `NextToken` until it is absent.
- `LookupEvents` returns `CloudTrailEvent` as a stringified JSON document, not a nested object.
- If you enable KMS encryption or CloudWatch Logs delivery, the related resource policies and IAM role permissions must already allow CloudTrail to use them.
- This package is best used from backend or automation code. Do not ship long-lived AWS credentials in browser code.

## Version Notes

- This guide targets `@aws-sdk/client-cloudtrail@3.1007.0`.
- Examples use the AWS SDK for JavaScript v3 command-based client pattern.
