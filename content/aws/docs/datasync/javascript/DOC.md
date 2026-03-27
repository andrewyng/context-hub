---
name: datasync
description: "AWS SDK for JavaScript v3 client for AWS DataSync locations, tasks, and task executions."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,datasync,javascript,nodejs,s3,data-transfer,migration"
---

# `@aws-sdk/client-datasync`

Use this package for AWS DataSync control-plane operations in AWS SDK for JavaScript v3: creating locations, creating and updating tasks, starting task executions, checking execution status, and listing existing DataSync resources.

Prefer server-side code. Real DataSync workflows usually need AWS credentials with DataSync permissions, and S3-based transfers also need an IAM role that DataSync itself can assume for bucket access.

## Install

```bash
npm install @aws-sdk/client-datasync
```

If you want to force a named profile from shared AWS config files in Node.js, install the credential helpers too:

```bash
npm install @aws-sdk/credential-providers
```

## Credentials and region

Typical local setup:

```bash
export AWS_REGION=us-west-2
export AWS_PROFILE=storage-migrations
export DATASYNC_S3_ROLE_ARN=arn:aws:iam::123456789012:role/DataSyncS3Access
```

- Set the client region explicitly. DataSync locations, tasks, and task executions are regional.
- `CreateLocationS3Command` requires `S3Config.BucketAccessRoleArn`. This is the IAM role DataSync uses to read from or write to your S3 bucket.
- If your runtime already has AWS credentials available, you can use the normal AWS SDK v3 default credential chain and only set the region in code.

## Initialize the client

Use the default provider chain when the environment is already configured:

```javascript
import { DataSyncClient } from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

If you want to force a named profile from shared AWS config:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { DataSyncClient } from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "storage-migrations",
  }),
});
```

## What this client covers

Common DataSync workflows with this package include:

- discovering existing locations with `ListLocationsCommand`
- creating source and destination locations such as S3 with `CreateLocationS3Command`
- creating transfer tasks with `CreateTaskCommand`
- starting a task execution with `StartTaskExecutionCommand`
- polling execution state with `DescribeTaskExecutionCommand`
- updating schedules or task options with `UpdateTaskCommand`
- listing or canceling executions with `ListTaskExecutionsCommand` and `CancelTaskExecutionCommand`

## Common workflows

### List existing locations

`ListLocationsCommand` returns `LocationArn` and `LocationUri`. Use `NextToken` when you need the full list.

```javascript
import {
  DataSyncClient,
  ListLocationsCommand,
} from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({ region: process.env.AWS_REGION ?? "us-west-2" });

let nextToken;

do {
  const page = await datasync.send(
    new ListLocationsCommand({
      MaxResults: 25,
      NextToken: nextToken,
      Filters: [
        {
          Name: "LocationType",
          Operator: "Equals",
          Values: ["S3"],
        },
      ],
    }),
  );

  for (const location of page.Locations ?? []) {
    console.log(location.LocationArn, location.LocationUri);
  }

  nextToken = page.NextToken;
} while (nextToken);
```

If the location you expect is missing, check the client region first.

### Create an S3 location

Use `CreateLocationS3Command` to register an S3 bucket or a prefix inside a bucket as a DataSync location. You decide later whether that location is a source or destination when creating the task.

```javascript
import {
  CreateLocationS3Command,
  DataSyncClient,
} from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const response = await datasync.send(
  new CreateLocationS3Command({
    S3BucketArn: "arn:aws:s3:::company-transfer-source",
    Subdirectory: "exports/2026-03-13",
    S3Config: {
      BucketAccessRoleArn: process.env.DATASYNC_S3_ROLE_ARN,
    },
    Tags: [
      {
        Key: "Name",
        Value: "company-transfer-source",
      },
    ],
  }),
);

console.log(response.LocationArn);
```

`Subdirectory` is an S3 prefix, not a filesystem path. DataSync documents that this prefix must not start with `/` or contain `//`, `/./`, or `/../`.

### Create a transfer task

At minimum, `CreateTaskCommand` needs a source location ARN and a destination location ARN.

```javascript
import {
  CreateTaskCommand,
  DataSyncClient,
} from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const response = await datasync.send(
  new CreateTaskCommand({
    SourceLocationArn: "arn:aws:datasync:us-west-2:123456789012:location/loc-11111111111111111",
    DestinationLocationArn: "arn:aws:datasync:us-west-2:123456789012:location/loc-22222222222222222",
    Name: "nightly-s3-copy",
    Options: {
      TransferMode: "CHANGED",
      VerifyMode: "ONLY_FILES_TRANSFERRED",
      LogLevel: "BASIC",
      OverwriteMode: "ALWAYS",
    },
    CloudWatchLogGroupArn: "arn:aws:logs:us-west-2:123456789012:log-group:/aws/datasync/nightly-s3-copy",
  }),
);

console.log(response.TaskArn);
```

If you use include or exclude filters, DataSync only supports `FilterType: "SIMPLE_PATTERN"`, and the `Value` is one pipe-delimited string such as `"/folder1|/folder2"`.

For supported transfers, you can create an Enhanced mode task by adding `TaskMode: "ENHANCED"`. AWS documents Enhanced mode for S3-to-S3 transfers and certain non-agent S3 flows, and the caller creating the task needs `iam:CreateServiceLinkedRole`.

### Start a task execution and poll until it finishes

`StartTaskExecutionCommand` returns a task execution ARN. Use `DescribeTaskExecutionCommand` to check progress and final status.

```javascript
import {
  DataSyncClient,
  DescribeTaskExecutionCommand,
  StartTaskExecutionCommand,
} from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const start = await datasync.send(
  new StartTaskExecutionCommand({
    TaskArn: "arn:aws:datasync:us-west-2:123456789012:task/task-0123456789abcdef0",
    OverrideOptions: {
      LogLevel: "BASIC",
    },
  }),
);

const taskExecutionArn = start.TaskExecutionArn;

if (!taskExecutionArn) {
  throw new Error("StartTaskExecution did not return a task execution ARN");
}

while (true) {
  const execution = await datasync.send(
    new DescribeTaskExecutionCommand({
      TaskExecutionArn: taskExecutionArn,
    }),
  );

  console.log({
    status: execution.Status,
    filesTransferred: execution.FilesTransferred,
    bytesWritten: execution.BytesWritten,
    bytesCompressed: execution.BytesCompressed,
  });

  if (execution.Status === "SUCCESS") {
    break;
  }

  if (execution.Status === "ERROR") {
    throw new Error(execution.Result?.ErrorDetail ?? "DataSync task execution failed");
  }

  await new Promise((resolve) => setTimeout(resolve, 15_000));
}
```

The execution status can move through states such as `QUEUED`, `LAUNCHING`, `PREPARING`, `TRANSFERRING`, and `VERIFYING` before reaching `SUCCESS` or `ERROR`.

### Add or update a schedule

Use `UpdateTaskCommand` when you want the task to run automatically.

```javascript
import {
  DataSyncClient,
  UpdateTaskCommand,
} from "@aws-sdk/client-datasync";

const datasync = new DataSyncClient({ region: process.env.AWS_REGION ?? "us-west-2" });

await datasync.send(
  new UpdateTaskCommand({
    TaskArn: "arn:aws:datasync:us-west-2:123456789012:task/task-0123456789abcdef0",
    Schedule: {
      ScheduleExpression: "rate(12 hours)",
      Status: "ENABLED",
    },
  }),
);
```

DataSync documents a minimum schedule interval of one hour.

## Important pitfalls

- Use the same region for your client, locations, and task ARNs. Cross-region confusion is a common cause of empty list results and missing resources.
- `CreateLocationS3Command` needs `S3Config.BucketAccessRoleArn`. Your application credentials are not enough by themselves for DataSync to access the bucket.
- `CreateTaskCommand` and `StartTaskExecutionCommand` are asynchronous control-plane calls. Do not assume data has moved until `DescribeTaskExecutionCommand` reports a terminal status.
- `Subdirectory` on S3 locations is a prefix. Do not start it with `/` or include `//`, `/./`, or `/../`.
- Basic-mode task logging uses `CloudWatchLogGroupArn`. For Enhanced mode tasks, AWS documents that DataSync automatically publishes to the `/aws/datasync` log group.
- If you use include or exclude filters, pass a single `SIMPLE_PATTERN` filter string with pipe delimiters instead of a long array of separate patterns.
- If you create an Enhanced mode task, the caller needs permission to create the DataSync service-linked role.

## Official sources

- AWS SDK for JavaScript v3 DataSync client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/datasync/`
- AWS CLI DataSync reference: `https://docs.aws.amazon.com/cli/latest/reference/datasync/`
- AWS DataSync user guide: `https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html`
- Create an S3 location: `https://docs.aws.amazon.com/datasync/latest/userguide/create-s3-location.html`
- DataSync task mode guide: `https://docs.aws.amazon.com/datasync/latest/userguide/choosing-task-mode.html`
- DataSync filtering guide: `https://docs.aws.amazon.com/datasync/latest/userguide/filtering.html`
- `CreateTask` API reference: `https://docs.aws.amazon.com/datasync/latest/userguide/API_CreateTask.html`
- `StartTaskExecution` API reference: `https://docs.aws.amazon.com/datasync/latest/userguide/API_StartTaskExecution.html`
- `DescribeTaskExecution` API reference: `https://docs.aws.amazon.com/datasync/latest/userguide/API_DescribeTaskExecution.html`
- `UpdateTask` API reference: `https://docs.aws.amazon.com/datasync/latest/userguide/API_UpdateTask.html`
