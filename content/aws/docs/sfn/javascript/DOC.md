---
name: sfn
description: "AWS SDK for JavaScript v3 client for Step Functions state machines, executions, execution history, and workflow definitions"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,step-functions,sfn,javascript,nodejs,workflows,state-machines"
---

# AWS Step Functions SDK for JavaScript (v3)

Use `@aws-sdk/client-sfn` to start executions, inspect workflow state, read execution history, and create or update Step Functions state machines from JavaScript or TypeScript.

This is the Step Functions control-plane client. It manages state machines and executions in AWS; it does not run a workflow engine locally.

## Golden Rules

- Install `@aws-sdk/client-sfn`, not the legacy `aws-sdk` v2 package.
- Use `SFNClient` with specific command imports such as `StartExecutionCommand` and `DescribeExecutionCommand`.
- Configure AWS credentials and `region` before creating the client.
- `StartExecutionCommand` returns immediately after the execution is accepted. Poll `DescribeExecutionCommand` if you need the final result.
- Step Functions request and response payloads such as `input`, `output`, `cause`, and state machine `definition` are JSON text fields. Serialize with `JSON.stringify(...)` and parse with `JSON.parse(...)` when needed.
- `StartSyncExecutionCommand` is for Express Workflows. Standard workflows use `StartExecutionCommand` and a follow-up status check.
- When creating a state machine, your caller needs permission to invoke Step Functions APIs, and Step Functions also needs a `roleArn` it can assume for the workflow itself.

## Install

```bash
npm install @aws-sdk/client-sfn
```

If you want to select a named shared AWS profile in code, also install the credential provider helpers:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Step Functions is regional. Configure AWS credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional

export STEP_FUNCTIONS_STATE_MACHINE_ARN="arn:aws:states:us-east-1:123456789012:stateMachine:OrderWorkflow"
export STEP_FUNCTIONS_EXPRESS_ARN="arn:aws:states:us-east-1:123456789012:stateMachine:OrderWorkflowExpress"
export STEP_FUNCTIONS_ROLE_ARN="arn:aws:iam::123456789012:role/service-role/StepFunctionsExecutionRole"
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { SFNClient } from "@aws-sdk/client-sfn";

const sfn = new SFNClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { SFNClient } from "@aws-sdk/client-sfn";

const sfn = new SFNClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

### Named profile with `fromIni`

```javascript
import { SFNClient } from "@aws-sdk/client-sfn";
import { fromIni } from "@aws-sdk/credential-providers";

const sfn = new SFNClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "dev",
  }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access already comes from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  SFNClient,
  DescribeStateMachineCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

const response = await sfn.send(
  new DescribeStateMachineCommand({
    stateMachineArn: process.env.STEP_FUNCTIONS_STATE_MACHINE_ARN,
  }),
);

console.log(response.name, response.status, response.type);
```

## Common Workflows

### Start an execution

Step Functions expects `input` as a JSON string.

```javascript
import {
  SFNClient,
  StartExecutionCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

const { executionArn, startDate } = await sfn.send(
  new StartExecutionCommand({
    stateMachineArn: process.env.STEP_FUNCTIONS_STATE_MACHINE_ARN,
    name: `order-${Date.now()}`,
    input: JSON.stringify({
      orderId: "order-123",
      retryable: false,
      items: [{ sku: "sku-1", quantity: 2 }],
    }),
  }),
);

console.log(executionArn, startDate);
```

### Poll an execution until it finishes

`StartExecutionCommand` does not wait for the workflow to finish. Poll `DescribeExecutionCommand` until the execution reaches a terminal state.

```javascript
import {
  SFNClient,
  DescribeExecutionCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForExecution(executionArn) {
  for (;;) {
    const execution = await sfn.send(
      new DescribeExecutionCommand({
        executionArn,
      }),
    );

    console.log(execution.status, execution.startDate, execution.stopDate);

    if (execution.status === "SUCCEEDED") {
      return execution.output ? JSON.parse(execution.output) : undefined;
    }

    if (
      execution.status === "FAILED"
      || execution.status === "TIMED_OUT"
      || execution.status === "ABORTED"
    ) {
      throw new Error(
        [execution.error, execution.cause]
          .filter(Boolean)
          .join(": ") || `Execution finished with status ${execution.status}`,
      );
    }

    await sleep(2000);
  }
}
```

### Read execution history

Use `GetExecutionHistoryCommand` when you need event-by-event details for debugging or audit tooling.

```javascript
import {
  SFNClient,
  GetExecutionHistoryCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

async function printExecutionHistory(executionArn) {
  let nextToken;

  do {
    const page = await sfn.send(
      new GetExecutionHistoryCommand({
        executionArn,
        maxResults: 100,
        nextToken,
      }),
    );

    for (const event of page.events ?? []) {
      console.log(event.id, event.type, event.timestamp);
    }

    nextToken = page.nextToken;
  } while (nextToken);
}
```

### Start an Express Workflow synchronously

Use `StartSyncExecutionCommand` only with Express Workflows when you need the workflow result in the same API call.

```javascript
import {
  SFNClient,
  StartSyncExecutionCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

const result = await sfn.send(
  new StartSyncExecutionCommand({
    stateMachineArn: process.env.STEP_FUNCTIONS_EXPRESS_ARN,
    input: JSON.stringify({
      orderId: "order-123",
      dryRun: true,
    }),
  }),
);

if (result.status !== "SUCCEEDED") {
  throw new Error(
    [result.error, result.cause]
      .filter(Boolean)
      .join(": ") || `Sync execution finished with status ${result.status}`,
  );
}

console.log(result.output ? JSON.parse(result.output) : undefined);
```

### Create a state machine from an Amazon States Language definition

State machine definitions are JSON strings. Build the object in JavaScript, then serialize it.

```javascript
import {
  CreateStateMachineCommand,
  SFNClient,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

const definition = JSON.stringify({
  Comment: "Minimal order workflow",
  StartAt: "ApproveOrder",
  States: {
    ApproveOrder: {
      Type: "Pass",
      Result: { approved: true },
      End: true,
    },
  },
});

const created = await sfn.send(
  new CreateStateMachineCommand({
    name: "OrderWorkflow",
    type: "STANDARD",
    definition,
    roleArn: process.env.STEP_FUNCTIONS_ROLE_ARN,
  }),
);

console.log(created.stateMachineArn);
```

### Validate and update a state machine definition

`ValidateStateMachineDefinitionCommand` is useful before a create or update, especially when you generate Amazon States Language dynamically.

```javascript
import {
  SFNClient,
  UpdateStateMachineCommand,
  ValidateStateMachineDefinitionCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "us-east-1" });

const definition = JSON.stringify({
  Comment: "Updated order workflow",
  StartAt: "PrepareResult",
  States: {
    PrepareResult: {
      Type: "Pass",
      Result: { version: 2 },
      End: true,
    },
  },
});

const validation = await sfn.send(
  new ValidateStateMachineDefinitionCommand({
    definition,
    type: "STANDARD",
  }),
);

if (validation.result !== "OK") {
  throw new Error(JSON.stringify(validation.diagnostics ?? []));
}

await sfn.send(
  new UpdateStateMachineCommand({
    stateMachineArn: process.env.STEP_FUNCTIONS_STATE_MACHINE_ARN,
    definition,
  }),
);
```

## Common Pitfalls

- Passing a plain object to `input`, `output`, `cause`, or `definition`. These fields are JSON strings in the API.
- Expecting `StartExecutionCommand` to return the workflow result. It returns an execution ARN; use `DescribeExecutionCommand` or `StartSyncExecutionCommand` for result handling.
- Using `StartSyncExecutionCommand` with a Standard Workflow. Sync execution is for Express Workflows.
- Forgetting that state machine creation needs both caller permissions and a workflow `roleArn` that Step Functions can assume.
- Omitting `region`. Step Functions is regional, and the client needs the correct region to find the target state machine ARN.
- Treating `cause` as structured JSON automatically. It is returned as text and may need `JSON.parse(...)` only if your workflow or downstream service encoded JSON into the string.

## Official Sources

- Maintainer package docs: https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-sfn
- AWS SDK for JavaScript v3 Step Functions reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sfn/
- Step Functions API reference: https://docs.aws.amazon.com/step-functions/latest/apireference/Welcome.html
- `StartExecution`: https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartExecution.html
- `StartSyncExecution`: https://docs.aws.amazon.com/step-functions/latest/apireference/API_StartSyncExecution.html
- `CreateStateMachine`: https://docs.aws.amazon.com/step-functions/latest/apireference/API_CreateStateMachine.html
- `ValidateStateMachineDefinition`: https://docs.aws.amazon.com/step-functions/latest/apireference/API_ValidateStateMachineDefinition.html
