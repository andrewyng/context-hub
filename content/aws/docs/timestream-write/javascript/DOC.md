---
name: timestream-write
description: "AWS SDK for JavaScript v3 client for Amazon Timestream write operations, including table setup, record ingestion, and batch-load tasks."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,timestream,javascript,nodejs,time-series,metrics"
---

# `@aws-sdk/client-timestream-write`

Use this package for Amazon Timestream for LiveAnalytics write-plane operations in AWS SDK for JavaScript v3. It covers database and table management, ingestion with `WriteRecords`, endpoint inspection with `DescribeEndpoints`, and bulk imports with batch-load tasks.

This package does not run queries. For SQL reads, use `@aws-sdk/client-timestream-query`.

## Install

```bash
npm install @aws-sdk/client-timestream-write
```

If you want to pin a shared AWS profile explicitly in code instead of relying on the default credential provider chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-timestream-write@3.1007.0`.

## Prerequisites And Authentication

Timestream write calls need normal AWS credentials and a region. In Node.js, the AWS SDK v3 can usually resolve credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

export AWS_TIMESTREAM_DATABASE=metrics
export AWS_TIMESTREAM_TABLE=cpu_utilization
export AWS_TIMESTREAM_IMPORT_BUCKET=my-import-bucket
```

Minimal client setup:

```javascript
import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to force a named shared profile in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

For browser applications, do not embed long-lived AWS access keys. Call Timestream from trusted backend code or use tightly scoped temporary credentials.

## Create A Database And Table

Create the database once, then create a table with explicit retention settings.

```javascript
import {
  CreateDatabaseCommand,
  CreateTableCommand,
  TimestreamWriteClient,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await timestreamWrite.send(
  new CreateDatabaseCommand({
    DatabaseName: process.env.AWS_TIMESTREAM_DATABASE ?? "metrics",
  })
);

await timestreamWrite.send(
  new CreateTableCommand({
    DatabaseName: process.env.AWS_TIMESTREAM_DATABASE ?? "metrics",
    TableName: process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization",
    RetentionProperties: {
      MemoryStoreRetentionPeriodInHours: 24,
      MagneticStoreRetentionPeriodInDays: 365,
    },
  })
);
```

Use the same AWS region for the client and the target Timestream resources.

## Write Single-Measure Records

`WriteRecordsCommand` is the core ingestion API. A practical pattern is to put repeated dimensions and measure metadata in `CommonAttributes`, then send the time-stamped values in `Records`.

Timestream measure values are strings on the wire even when the logical type is numeric.

```javascript
import {
  TimestreamWriteClient,
  WriteRecordsCommand,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await timestreamWrite.send(
  new WriteRecordsCommand({
    DatabaseName: process.env.AWS_TIMESTREAM_DATABASE ?? "metrics",
    TableName: process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization",
    CommonAttributes: {
      Dimensions: [
        { Name: "host", Value: "web-1" },
        { Name: "region", Value: "us-east-1" },
      ],
      MeasureName: "cpu",
      MeasureValueType: "DOUBLE",
      TimeUnit: "SECONDS",
    },
    Records: [
      { Time: "1731456000", MeasureValue: "18.25" },
      { Time: "1731456060", MeasureValue: "19.75" },
    ],
  })
);

console.log(response.RecordsIngested?.Total);
```

Important write rules from the AWS API docs:

- `CommonAttributes.Dimensions` must not overlap with dimensions on individual records.
- If you update an existing record, you must send a higher `Version`.

## Write A Multi-Measure Record

Use `MeasureValueType: "MULTI"` when a single timestamp should carry multiple named metrics.

```javascript
import {
  TimestreamWriteClient,
  WriteRecordsCommand,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await timestreamWrite.send(
  new WriteRecordsCommand({
    DatabaseName: process.env.AWS_TIMESTREAM_DATABASE ?? "metrics",
    TableName: process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization",
    CommonAttributes: {
      Dimensions: [{ Name: "host", Value: "web-1" }],
      TimeUnit: "MILLISECONDS",
    },
    Records: [
      {
        Time: `${Date.now()}`,
        MeasureName: "server_metrics",
        MeasureValueType: "MULTI",
        MeasureValues: [
          { Name: "cpu", Value: "18.25", Type: "DOUBLE" },
          { Name: "memory", Value: "61.4", Type: "DOUBLE" },
          { Name: "healthy", Value: "true", Type: "BOOLEAN" },
        ],
      },
    ],
  })
);
```

## Update An Existing Record With `Version`

When you rewrite the same logical record, increase `Version`. If you send the same record without a higher version, Timestream can reject it with `RejectedRecordsException`.

```javascript
import {
  TimestreamWriteClient,
  WriteRecordsCommand,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await timestreamWrite.send(
  new WriteRecordsCommand({
    DatabaseName: "metrics",
    TableName: "cpu_utilization",
    Records: [
      {
        Dimensions: [{ Name: "host", Value: "web-1" }],
        Time: "1731456000",
        TimeUnit: "SECONDS",
        MeasureName: "cpu",
        MeasureValue: "21.5",
        MeasureValueType: "DOUBLE",
        Version: 2,
      },
    ],
  })
);
```

## Start A Batch-Load Task From S3

Use batch load for larger backfills instead of pushing many individual `WriteRecords` calls. The batch-load API needs both an S3 source location and an S3 report location.

```javascript
import {
  CreateBatchLoadTaskCommand,
  DescribeBatchLoadTaskCommand,
  TimestreamWriteClient,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { TaskId } = await timestreamWrite.send(
  new CreateBatchLoadTaskCommand({
    DataModelConfiguration: {
      DataModel: {
        TimeColumn: "time",
        TimeUnit: "MILLISECONDS",
        DimensionMappings: [
          {
            SourceColumn: "host",
            DestinationColumn: "host",
          },
        ],
        MultiMeasureMappings: {
          TargetMultiMeasureName: "metrics",
          MultiMeasureAttributeMappings: [
            {
              SourceColumn: "cpu",
              TargetMultiMeasureAttributeName: "cpu",
              MeasureValueType: "DOUBLE",
            },
            {
              SourceColumn: "memory",
              TargetMultiMeasureAttributeName: "memory",
              MeasureValueType: "DOUBLE",
            },
          ],
        },
      },
    },
    DataSourceConfiguration: {
      DataSourceS3Configuration: {
        BucketName: process.env.AWS_TIMESTREAM_IMPORT_BUCKET ?? "my-import-bucket",
        ObjectKeyPrefix: "timestream/cpu/",
      },
      CsvConfiguration: {
        ColumnSeparator: ",",
      },
      DataFormat: "CSV",
    },
    ReportConfiguration: {
      ReportS3Configuration: {
        BucketName: process.env.AWS_TIMESTREAM_IMPORT_BUCKET ?? "my-import-bucket",
        ObjectKeyPrefix: "timestream/reports/",
      },
    },
    TargetDatabaseName: process.env.AWS_TIMESTREAM_DATABASE ?? "metrics",
    TargetTableName: process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization",
  })
);

const status = await timestreamWrite.send(
  new DescribeBatchLoadTaskCommand({ TaskId })
);

console.log(status.BatchLoadTaskDescription?.TaskStatus);
```

Batch-load tasks are asynchronous. Poll `DescribeBatchLoadTaskCommand` or list tasks separately; do not assume the import finishes before `CreateBatchLoadTaskCommand` returns.

## Inspect The Resolved Ingestion Endpoint

AWS documents endpoint discovery for Timestream. In normal SDK usage you usually do not need to call `DescribeEndpointsCommand` yourself, but it is useful for debugging or custom endpoint caching.

```javascript
import {
  DescribeEndpointsCommand,
  TimestreamWriteClient,
} from "@aws-sdk/client-timestream-write";

const timestreamWrite = new TimestreamWriteClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Endpoints } = await timestreamWrite.send(
  new DescribeEndpointsCommand({})
);

const endpoint = Endpoints?.[0];

console.log(endpoint?.Address);
console.log(endpoint?.CachePeriodInMinutes);
```

If you cache endpoints or override the service endpoint manually, respect the returned cache period and keep the region aligned with the destination database and table.

## Common Pitfalls

- Using this client for queries. Query operations are in `@aws-sdk/client-timestream-query`.
- Sending numeric or boolean measure values without converting them to strings.
- Repeating the same dimension name in both `CommonAttributes` and an individual record.
- Rewriting an existing record without increasing `Version`.
- Treating batch load as synchronous instead of monitoring task status and the S3 report output.
- Hardcoding long-lived AWS keys in frontend code.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-timestream-write@3.1007.0`.
- The AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Pin the npm package version in your app when exact patch-level parity matters.

## Official Sources

- AWS SDK for JavaScript v3 Timestream Write client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/timestream-write/`
- Amazon Timestream `WriteRecords` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_WriteRecords.html`
- Amazon Timestream `CreateTable` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_CreateTable.html`
- Amazon Timestream `CreateBatchLoadTask` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_CreateBatchLoadTask.html`
- Amazon Timestream `DescribeBatchLoadTask` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_DescribeBatchLoadTask.html`
- Amazon Timestream `DescribeEndpoints` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_DescribeEndpoints.html`
- Amazon Timestream endpoint-discovery guide: `https://docs.aws.amazon.com/timestream/latest/developerguide/Using-API.endpoint-discovery.describe-endpoints.implementation.html`
