---
name: config-service
description: "AWS SDK for JavaScript v3 client for AWS Config recorders, delivery channels, resource queries, config rules, and compliance lookups."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,config,compliance,governance,javascript,nodejs"
---

# `@aws-sdk/client-config-service`

Use this package for AWS Config from JavaScript or TypeScript. Common tasks include enabling a configuration recorder, wiring a delivery channel, listing discovered resources, reading configuration history, querying the resource inventory with SQL, creating Config rules, and checking compliance results.

AWS Config is a regional control-plane service. The npm package is `@aws-sdk/client-config-service`, the client class is `ConfigServiceClient`, and the AWS CLI service name is `configservice`.

## Install

```bash
npm install @aws-sdk/client-config-service
```

If you want shared-profile or assume-role helpers in code, install the credential provider package you actually use:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Configure AWS credentials and a region before creating the client.

Typical local setup:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev"
```

Or with direct credentials:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

To enable recording, you also need:

- an IAM role that AWS Config can assume for the recorder
- an S3 bucket for configuration snapshots and history
- optionally, an SNS topic for notifications

Useful environment variables for the setup flow:

```bash
export AWS_CONFIG_ROLE_ARN="arn:aws:iam::123456789012:role/config-role"
export AWS_CONFIG_BUCKET="config-bucket-123456789012"
export AWS_CONFIG_SNS_TOPIC_ARN="arn:aws:sns:us-east-1:123456789012:config-topic" # optional
```

In Node.js, the default AWS SDK for JavaScript v3 credential provider chain is usually enough if credentials already come from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Client Setup

### Minimal client

```javascript
import { ConfigServiceClient } from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Named profile with `fromIni`

```javascript
import { ConfigServiceClient } from "@aws-sdk/client-config-service";
import { fromIni } from "@aws-sdk/credential-providers";

const config = new ConfigServiceClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  ConfigServiceClient,
  DescribeConfigRulesCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

const response = await config.send(
  new DescribeConfigRulesCommand({
    ConfigRuleNames: ["RequiredTagsForEC2Instances"],
  }),
);

for (const rule of response.ConfigRules ?? []) {
  console.log(rule.ConfigRuleName, rule.ConfigRuleState, rule.Source?.Owner);
}
```

## Common Workflows

### Enable a recorder and delivery channel

You must create a delivery channel before `StartConfigurationRecorderCommand` succeeds.

```javascript
import {
  ConfigServiceClient,
  PutConfigurationRecorderCommand,
  PutDeliveryChannelCommand,
  StartConfigurationRecorderCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

if (!process.env.AWS_CONFIG_ROLE_ARN || !process.env.AWS_CONFIG_BUCKET) {
  throw new Error("Set AWS_CONFIG_ROLE_ARN and AWS_CONFIG_BUCKET first");
}

await config.send(
  new PutConfigurationRecorderCommand({
    ConfigurationRecorder: {
      name: "default",
      roleARN: process.env.AWS_CONFIG_ROLE_ARN,
      recordingGroup: {
        allSupported: true,
        includeGlobalResourceTypes: true,
      },
    },
  }),
);

await config.send(
  new PutDeliveryChannelCommand({
    DeliveryChannel: {
      name: "default",
      s3BucketName: process.env.AWS_CONFIG_BUCKET,
      ...(process.env.AWS_CONFIG_SNS_TOPIC_ARN
        ? { snsTopicARN: process.env.AWS_CONFIG_SNS_TOPIC_ARN }
        : {}),
      configSnapshotDeliveryProperties: {
        deliveryFrequency: "Twelve_Hours",
      },
    },
  }),
);

await config.send(
  new StartConfigurationRecorderCommand({
    ConfigurationRecorderName: "default",
  }),
);
```

AWS Config allows only one customer-managed configuration recorder and one delivery channel per account per region, so these calls usually create the regional defaults on first run and update them on later runs.

### List discovered resources of a specific type

Use this to enumerate resources AWS Config knows about. The result can include resources that AWS Config discovered even if they are not currently being recorded.

```javascript
import {
  ConfigServiceClient,
  ListDiscoveredResourcesCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await config.send(
    new ListDiscoveredResourcesCommand({
      resourceType: "AWS::EC2::Instance",
      limit: 100,
      nextToken,
    }),
  );

  for (const resource of response.resourceIdentifiers ?? []) {
    console.log(resource.resourceType, resource.resourceId, resource.resourceName);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

`ListDiscoveredResourcesCommand` uses lower-camel input keys such as `resourceType`, `resourceId`, `limit`, and `nextToken`.

### Read a resource's configuration history

`GetResourceConfigHistoryCommand` returns configuration items across time. The `configuration` field in each item is a JSON-encoded string, so parse it before reading nested properties.

```javascript
import {
  ConfigServiceClient,
  GetResourceConfigHistoryCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

const response = await config.send(
  new GetResourceConfigHistoryCommand({
    resourceType: "AWS::S3::Bucket",
    resourceId: "example-bucket",
    chronologicalOrder: "Reverse",
    limit: 10,
  }),
);

for (const item of response.configurationItems ?? []) {
  const configuration = item.configuration
    ? JSON.parse(item.configuration)
    : undefined;

  console.log({
    resourceType: item.resourceType,
    resourceId: item.resourceId,
    captureTime: item.configurationItemCaptureTime,
    status: item.configurationItemStatus,
    versioning: configuration?.versioning,
  });
}
```

Each `GetResourceConfigHistory` call can span at most seven days and the response is paginated, so longer lookbacks need repeated calls with time windows or `nextToken`.

### Query the Config inventory with SQL

`SelectResourceConfigCommand` accepts a SQL `SELECT` expression. The `Results` array contains JSON strings, not already-parsed objects.

```javascript
import {
  ConfigServiceClient,
  SelectResourceConfigCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

const response = await config.send(
  new SelectResourceConfigCommand({
    Expression:
      "SELECT resourceId, resourceType, awsRegion WHERE resourceType = 'AWS::S3::Bucket'",
    Limit: 100,
  }),
);

const rows = (response.Results ?? []).map((row) => JSON.parse(row));

for (const row of rows) {
  console.log(row.resourceId, row.resourceType, row.awsRegion);
}
```

This is the most practical API when you want a filtered inventory view without manually listing every resource type and then joining details yourself.

### Create or update an AWS-managed Config rule

For managed rules, set `Source.Owner` to `AWS` and pass the managed rule identifier as `Source.SourceIdentifier`.

```javascript
import {
  ConfigServiceClient,
  PutConfigRuleCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

await config.send(
  new PutConfigRuleCommand({
    ConfigRule: {
      ConfigRuleName: "RequiredTagsForEC2Instances",
      Description:
        "Checks whether the CostCenter and Owner tags are applied to EC2 instances.",
      Scope: {
        ComplianceResourceTypes: ["AWS::EC2::Instance"],
      },
      Source: {
        Owner: "AWS",
        SourceIdentifier: "REQUIRED_TAGS",
      },
      InputParameters: JSON.stringify({
        tag1Key: "CostCenter",
        tag2Key: "Owner",
      }),
    },
    Tags: [{ Key: "environment", Value: "prod" }],
  }),
);
```

For new rules, set `ConfigRuleName` and the `Source` block, but do not send generated identifiers such as `ConfigRuleArn` or `ConfigRuleId`.

### Read non-compliant resources for a rule

Use `GetComplianceDetailsByConfigRuleCommand` when you already know the rule and want the resources that failed it.

```javascript
import {
  ConfigServiceClient,
  GetComplianceDetailsByConfigRuleCommand,
} from "@aws-sdk/client-config-service";

const config = new ConfigServiceClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await config.send(
    new GetComplianceDetailsByConfigRuleCommand({
      ConfigRuleName: "RequiredTagsForEC2Instances",
      ComplianceTypes: ["NON_COMPLIANT"],
      Limit: 100,
      NextToken: nextToken,
    }),
  );

  for (const result of response.EvaluationResults ?? []) {
    const qualifier = result.EvaluationResultIdentifier?.EvaluationResultQualifier;

    console.log({
      rule: qualifier?.ConfigRuleName,
      resourceType: qualifier?.ResourceType,
      resourceId: qualifier?.ResourceId,
      complianceType: result.ComplianceType,
      recordedAt: result.ResultRecordedTime,
    });
  }

  nextToken = response.NextToken;
} while (nextToken);
```

If you already know the resource and want all rule evaluations for it, use `GetComplianceDetailsByResourceCommand` instead.

## Important Notes

- AWS Config is regional. Use the client in the same region where the recorder, delivery channel, rules, and recorded resources live.
- `PutConfigurationRecorderCommand` and `PutDeliveryChannelCommand` are upsert-style APIs, but each account and region can have only one customer-managed recorder and one delivery channel.
- `StartConfigurationRecorderCommand` requires a delivery channel to exist first.
- `PutConfigRuleCommand` can create AWS-managed rules, custom Lambda rules, and custom policy rules. For AWS-managed rules, the critical fields are `Owner: "AWS"` and the correct managed rule identifier.
- `PutConfigRuleCommand` and `PutConfigurationRecorderCommand` treat tags as create-time metadata. To change tags later, use the tagging APIs rather than re-sending different tag values in the same put call.
- `SelectResourceConfigCommand` returns `Results` as JSON strings.
- `GetResourceConfigHistoryCommand` returns `configuration` and some supplementary fields as JSON-encoded strings.

## Common Pitfalls

- Mixing the service names. In JavaScript you import `@aws-sdk/client-config-service`, in code you create `ConfigServiceClient`, and in AWS CLI commands the namespace is `configservice`.
- Sending the wrong field casing. Some AWS Config operations use `ConfigRuleName` and `ConfigurationRecorderName`, while others use lower-camel keys such as `resourceType`, `resourceId`, `limit`, and `nextToken`.
- Assuming `ListDiscoveredResourcesCommand` only returns currently recorded resources. It can include resources AWS Config discovered even if they are not actively recorded now.
- Forgetting to parse `SelectResourceConfigCommand` results and `GetResourceConfigHistoryCommand` configuration payloads from JSON strings.
- Expecting `GetResourceConfigHistoryCommand` to return an unlimited time range in one call. The API is paginated and each call is limited to a seven-day span.

## Version Notes

- This guide targets `@aws-sdk/client-config-service` version `3.1007.0`.
- The AWS Config service model uses mixed member casing. The command examples above keep the exact request member names exposed by the current SDK surface.

## Official Sources

- AWS SDK for JavaScript v3 Config client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/config-service/`
- AWS Config API reference: `https://docs.aws.amazon.com/config/latest/APIReference/Welcome.html`
- AWS Config Developer Guide: `https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-config-service`
