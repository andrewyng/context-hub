---
name: aws-lambda
description: "TypeScript declarations for AWS Lambda handlers, event payloads, context objects, and common integrations such as API Gateway, SQS, and EventBridge."
metadata:
  languages: "typescript"
  versions: "8.10.161"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,aws,lambda,serverless,types,definitelytyped"
---

# AWS Lambda TypeScript Guide

## Golden Rule

Install `@types/aws-lambda` for type checking only, then import types from `aws-lambda` in your code.

This package does not deploy functions, invoke Lambda, or provide a runtime client. It supplies declaration files for handler signatures such as `Handler`, `APIGatewayProxyHandlerV2`, `SQSHandler`, `EventBridgeEvent`, `Context`, and the event payload shapes used by AWS Lambda integrations.

## Install

Add the Lambda declarations and Node.js declarations to your TypeScript project:

```bash
npm install -D typescript @types/aws-lambda @types/node
```

If your project already has TypeScript and Node.js types, add only the Lambda declarations:

```bash
npm install -D @types/aws-lambda
```

Your application code imports from `aws-lambda`, not from `@types/aws-lambda`:

```typescript
import type { Handler, Context } from "aws-lambda";
```

## Initialization

There is no client object, credential setup, or package-specific environment variable.

The practical setup is your TypeScript compiler configuration and your handler type imports.

### Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "types": ["node", "aws-lambda"],
    "skipLibCheck": false
  }
}
```

If you do not use `compilerOptions.types`, TypeScript can usually discover the package automatically. If you do restrict `types`, include both `node` and `aws-lambda` in the project that compiles your Lambda code.

### Type Lambda environment variables

Lambda environment variables are normal `process.env` values. Type them with declaration merging in a `.d.ts` file that is included in your project.

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    RECEIPT_BUCKET: string;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error";
  }
}
```

Then use them in your handler code:

```typescript
const receiptBucket = process.env.RECEIPT_BUCKET;
```

## Common Workflows

### Type a custom Lambda handler with `Handler`

Use the generic `Handler<TEvent, TResult>` type when your function is invoked by a custom payload or a wrapper framework.

```typescript
import type { Handler } from "aws-lambda";

type HealthEvent = {
  name?: string;
};

type HealthResponse = {
  ok: true;
  message: string;
};

export const handler: Handler<HealthEvent, HealthResponse> = async (event, context) => {
  const name = event.name ?? "world";

  return {
    ok: true,
    message: `hello ${name} from ${context.awsRequestId}`,
  };
};
```

### Type an API Gateway HTTP API handler

For HTTP API v2 events and Lambda Function URLs, use the v2 API Gateway types.

```typescript
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const name = event.queryStringParameters?.name ?? "world";

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: `hello ${name}`,
      path: event.requestContext.http.path,
      requestId: event.requestContext.requestId,
    }),
  };
};
```

If your integration is the older API Gateway REST API event shape, use `APIGatewayProxyHandler` and `APIGatewayProxyResult` instead of the v2 types.

### Type an SQS consumer with partial batch failures

Use `SQSHandler` for the function signature and return `SQSBatchResponse` when you want Lambda to retry only failed records.

```typescript
import type { SQSBatchResponse, SQSHandler } from "aws-lambda";

type OrderMessage = {
  orderId: string;
};

async function processOrder(message: OrderMessage): Promise<void> {
  console.log(`processing ${message.orderId}`);
}

export const handler: SQSHandler = async (event) => {
  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body) as OrderMessage;
      await processOrder(message);
    } catch {
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
```

### Type an EventBridge event handler

Use `EventBridgeEvent<TDetailType, TDetail>` when your function consumes custom EventBridge events and you want a typed `event.detail` payload.

```typescript
import type { EventBridgeEvent } from "aws-lambda";

type OrderPlacedDetail = {
  orderId: string;
  customerId: string;
  total: number;
};

export async function handler(
  event: EventBridgeEvent<"OrderPlaced", OrderPlacedDetail>
): Promise<void> {
  console.log(`received ${event["detail-type"]} for ${event.detail.orderId}`);

  if (process.env.LOG_LEVEL === "debug") {
    console.log(JSON.stringify(event.detail));
  }
}
```

## Common Pitfalls

- Install `@types/aws-lambda` in addition to your runtime dependencies; it does not provide any Lambda runtime code.
- Import from `aws-lambda`, not from `@types/aws-lambda`.
- Prefer `import type` so your compiled JavaScript does not contain a runtime import for a types-only package.
- If `compilerOptions.types` is set, include `aws-lambda` there or the handler and event declarations will appear to be missing.
- Match the handler type to the actual integration. API Gateway REST API (`APIGatewayProxyHandler`) and HTTP API v2 (`APIGatewayProxyHandlerV2`) are different event shapes.
- Use `SQSBatchResponse` only when your Lambda is configured for partial batch failure handling; otherwise return nothing and let the whole batch fail together.

## Official Sources

- https://www.npmjs.com/package/@types/aws-lambda
- https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda
- https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
- https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
- https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html
