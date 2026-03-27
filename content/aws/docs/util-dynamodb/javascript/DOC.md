---
name: util-dynamodb
description: "AWS SDK for JavaScript v3 helpers for marshalling JavaScript values to DynamoDB AttributeValue maps and unmarshalling them back."
metadata:
  languages: "javascript"
  versions: "3.996.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,dynamodb,javascript,nodejs,nosql,marshall,unmarshall"
---

# `@aws-sdk/util-dynamodb`

Use `@aws-sdk/util-dynamodb` with the low-level DynamoDB client when your application works with normal JavaScript values but DynamoDB operations still need raw `AttributeValue` maps.

This package only converts data. For requests, credentials, and retries, you still use `@aws-sdk/client-dynamodb`. If you want a higher-level document client that marshals and unmarshals automatically, use `@aws-sdk/lib-dynamodb` instead.

## Install

Install the DynamoDB client and this utility package together:

```bash
npm install @aws-sdk/client-dynamodb@3.996.2 @aws-sdk/util-dynamodb@3.996.2
```

Keep AWS SDK v3 packages on matching versions.

## Prerequisites

You need a DynamoDB table, an AWS region, and AWS credentials available to the SDK.

Typical local environment variables:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...   # optional
export DYNAMODB_TABLE=Users
```

In Node.js, the SDK can also load credentials and region from the default AWS provider chain, including shared config files and attached IAM roles.

## Initialize the client

Create the DynamoDB client first, then use `marshall` and `unmarshall` around low-level command inputs and outputs.

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## Common workflows

### Put and get an item

Use `marshall(...)` for `Item` and `Key`, then `unmarshall(...)` on the returned item.

```javascript
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const tableName = process.env.DYNAMODB_TABLE;

await dynamodb.send(
  new PutItemCommand({
    TableName: tableName,
    Item: marshall(
      {
        pk: "user#123",
        sk: "profile",
        email: "ada@example.com",
        active: true,
        loginCount: 0,
      },
      {
        removeUndefinedValues: true,
      },
    ),
    ConditionExpression: "attribute_not_exists(pk)",
  }),
);

const { Item } = await dynamodb.send(
  new GetItemCommand({
    TableName: tableName,
    Key: marshall({
      pk: "user#123",
      sk: "profile",
    }),
  }),
);

if (Item) {
  const user = unmarshall(Item);
  console.log(user.email);
}
```

### Use `marshall` with expressions

For low-level DynamoDB commands, expression attribute values also need DynamoDB shapes.

```javascript
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

await dynamodb.send(
  new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: marshall({
      pk: "user#123",
      sk: "profile",
    }),
    UpdateExpression: "SET email = :email, updatedAt = :updatedAt",
    ExpressionAttributeValues: marshall({
      ":email": "grace@example.com",
      ":updatedAt": new Date().toISOString(),
    }),
    ReturnValues: "ALL_NEW",
  }),
);
```

### Marshall a top-level map or list as a single attribute value

By default, `marshall({ ... })` returns a plain attribute map, which is what `Item`, `Key`, and `ExpressionAttributeValues` usually need.

If you need one wrapped `AttributeValue` such as `{ M: ... }` or `{ L: ... }`, set `convertTopLevelContainer: true`.

```javascript
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const profileAttr = marshall(
  {
    displayName: "Ada",
    tags: ["admin", "beta"],
  },
  {
    convertTopLevelContainer: true,
  },
);

await dynamodb.send(
  new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: marshall({
      pk: "user#123",
      sk: "profile",
    }),
    UpdateExpression: "SET profile = :profile",
    ExpressionAttributeValues: {
      ":profile": profileAttr,
    },
  }),
);
```

### Unmarshall a single `AttributeValue`

`unmarshall(...)` normally expects an item-shaped map like `response.Item`. If you already have one individual `AttributeValue`, set `convertWithoutMapWrapper: true`.

```javascript
import { unmarshall } from "@aws-sdk/util-dynamodb";

const attributeValue = {
  M: {
    plan: { S: "pro" },
    seats: { N: "5" },
  },
};

const profile = unmarshall(attributeValue, {
  convertWithoutMapWrapper: true,
});

console.log(profile.plan);
```

## Translation options

### Remove `undefined` values during marshalling

Without `removeUndefinedValues: true`, the converter throws if a map, list, or set contains `undefined`.

```javascript
import { marshall } from "@aws-sdk/util-dynamodb";

const item = marshall(
  {
    pk: "user#123",
    sk: "profile",
    nickname: undefined,
  },
  {
    removeUndefinedValues: true,
  },
);
```

### Convert empty values to `NULL`

Set `convertEmptyValues: true` when you want empty strings, empty binary values, and empty sets converted to DynamoDB `NULL` values.

```javascript
import { marshall } from "@aws-sdk/util-dynamodb";

const item = marshall(
  {
    pk: "user#123",
    sk: "profile",
    bio: "",
  },
  {
    convertEmptyValues: true,
  },
);
```

### Convert class instances by enumerable properties

Plain objects are converted automatically. For class instances, enable `convertClassInstanceToMap`.

```javascript
import { marshall } from "@aws-sdk/util-dynamodb";

class AuditInfo {
  constructor(actor, source) {
    this.actor = actor;
    this.source = source;
  }
}

const audit = new AuditInfo("user#123", "admin-panel");

const attributeValue = marshall(audit, {
  convertClassInstanceToMap: true,
  convertTopLevelContainer: true,
});
```

## Large numbers and safe conversion

By default, marshalling throws for JavaScript numbers outside the safe integer range so you do not silently lose precision.

When reading, use `wrapNumbers: true` if you want numbers returned as wrapper objects instead of native JavaScript `number` values.

```javascript
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const { Item } = await dynamodb.send(
  new GetItemCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: marshall({
      pk: "invoice#1",
      sk: "totals",
    }),
  }),
);

if (Item) {
  const invoice = unmarshall(Item, {
    wrapNumbers: true,
  });

  console.log(invoice.amount.toString());
}
```

If you must marshall an imprecise JavaScript number anyway, `allowImpreciseNumbers: true` disables that safeguard. Use it only when loss of precision is acceptable.

## Important pitfalls

- `marshall({ ... })` returns a record map by default, not an `{ M: ... }` wrapper. Use `convertTopLevelContainer: true` when an API field expects one `AttributeValue`.
- `unmarshall(item)` expects an item map like DynamoDB `Item` or `LastEvaluatedKey`. For one attribute value, use `convertWithoutMapWrapper: true`.
- `undefined` values are not ignored unless you opt in with `removeUndefinedValues: true`.
- Empty strings, empty binary values, and empty sets do not become `NULL` automatically. Set `convertEmptyValues: true` if you want that translation.
- Special numeric values like `NaN` and `Infinity` are rejected.
- If you want automatic marshalling and unmarshalling around DynamoDB commands, use `@aws-sdk/lib-dynamodb` instead of wiring these helpers into every low-level call.

## Official Sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-dynamodb/
- AWS SDK for JavaScript v3 source and package README: https://github.com/aws/aws-sdk-js-v3/tree/main/packages/util-dynamodb
- npm package page: https://www.npmjs.com/package/@aws-sdk/util-dynamodb
