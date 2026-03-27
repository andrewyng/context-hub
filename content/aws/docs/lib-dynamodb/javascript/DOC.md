---
name: lib-dynamodb
description: "AWS SDK for JavaScript v3 DynamoDB document client for reading and writing plain JavaScript objects."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,dynamodb,javascript,nodejs,nosql,document-client"
---

# `@aws-sdk/lib-dynamodb`

Use `@aws-sdk/lib-dynamodb` when you want to work with plain JavaScript values in DynamoDB instead of low-level `AttributeValue` shapes. It wraps `@aws-sdk/client-dynamodb`, marshals native inputs into DynamoDB attribute values, and unmarshals responses back into plain objects.

## Install

Install both the low-level client and the document wrapper:

```bash
npm install @aws-sdk/client-dynamodb@3.1007.0 @aws-sdk/lib-dynamodb@3.1007.0
```

`@aws-sdk/lib-dynamodb` depends on `@aws-sdk/client-dynamodb`.

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

In Node.js, the SDK can also load credentials and region from the usual AWS shared config files or attached IAM role.

## Initialize the document client

Create a base `DynamoDBClient`, then wrap it with `DynamoDBDocumentClient.from(...)`.

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
```

This is the usual command-based setup. The package also exports `DynamoDBDocument.from(client)` if you want the aggregated client with methods like `put()` and `get()`.

## Common workflows

### Put and get an item

Use plain JavaScript objects for `Item` and `Key`.

```javascript
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_TABLE;

await ddb.send(
  new PutCommand({
    TableName: tableName,
    Item: {
      pk: "user#123",
      sk: "profile",
      email: "ada@example.com",
      active: true,
      loginCount: 0,
    },
    ConditionExpression: "attribute_not_exists(pk)",
  }),
);

const { Item } = await ddb.send(
  new GetCommand({
    TableName: tableName,
    Key: {
      pk: "user#123",
      sk: "profile",
    },
  }),
);

console.log(Item);
```

### Update an item with expressions

Expression syntax is the same as the low-level DynamoDB API, but the values stay as normal JavaScript types.

```javascript
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_TABLE;

const { Attributes } = await ddb.send(
  new UpdateCommand({
    TableName: tableName,
    Key: {
      pk: "user#123",
      sk: "profile",
    },
    UpdateExpression:
      "SET #name = :name, loginCount = if_not_exists(loginCount, :zero) + :one",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": "Ada Lovelace",
      ":zero": 0,
      ":one": 1,
    },
    ReturnValues: "ALL_NEW",
  }),
);

console.log(Attributes);
```

### Query a partition key

Use `QueryCommand` for key-based reads. Prefer this over `ScanCommand` whenever the table design allows it.

```javascript
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_TABLE;

const response = await ddb.send(
  new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
    ExpressionAttributeValues: {
      ":pk": "user#123",
      ":prefix": "order#",
    },
    Limit: 25,
  }),
);

console.log(response.Items);
console.log(response.LastEvaluatedKey);
```

### Paginate query results

Use the built-in paginator for multiple pages.

```javascript
import { paginateQuery } from "@aws-sdk/lib-dynamodb";

const paginator = paginateQuery(
  { client: ddb },
  {
    TableName: process.env.DYNAMODB_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": "user#123",
    },
  },
);

for await (const page of paginator) {
  for (const item of page.Items ?? []) {
    console.log(item);
  }
}
```

If you truly need a full table scan, the package also exports `paginateScan`.

### Run a transaction

Use `TransactWriteCommand` when multiple writes must succeed or fail together.

```javascript
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_TABLE;

await ddb.send(
  new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: {
            pk: "user#456",
            sk: "profile",
            email: "grace@example.com",
          },
          ConditionExpression: "attribute_not_exists(pk)",
        },
      },
      {
        Update: {
          TableName: tableName,
          Key: {
            pk: "stats",
            sk: "users",
          },
          UpdateExpression: "ADD #count :one",
          ExpressionAttributeNames: {
            "#count": "count",
          },
          ExpressionAttributeValues: {
            ":one": 1,
          },
        },
      },
    ],
  }),
);
```

## Large numbers and translation options

The document client can preserve DynamoDB numbers more safely than plain JavaScript `number` values.

Use `NumberValue` when you need an exact numeric representation on writes, and `wrapNumbers: true` when you want large numbers returned as `NumberValue` instances instead of native JavaScript numbers.

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  NumberValue,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const preciseDdb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }),
  {
    unmarshallOptions: {
      wrapNumbers: true,
    },
  },
);

await preciseDdb.send(
  new PutCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      pk: "invoice#1",
      sk: "totals",
      amount: NumberValue.from("1000000000000000000000.000000000001"),
    },
  }),
);

const { Item } = await preciseDdb.send(
  new GetCommand({
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      pk: "invoice#1",
      sk: "totals",
    },
  }),
);

console.log(Item.amount.toString());
```

## Important pitfalls

- Pass plain JavaScript values to this package. If your code already uses raw DynamoDB shapes like `{ S: "value" }`, use `@aws-sdk/client-dynamodb` directly instead.
- If your objects can contain `undefined` values, set `marshallOptions.removeUndefinedValues: true` so they are removed during marshalling.
- `convertEmptyValues: true` changes empty strings, blobs, and sets into `null` while marshalling. Enable it only if you want that translation.
- By default, large JavaScript numbers can throw during marshalling to avoid silent precision loss. Use `NumberValue` for exact values, or enable `marshallOptions.allowImpreciseNumbers` only when loss of precision is acceptable.
- `DynamoDBDocumentClient.destroy()` is a no-op. Destroy the underlying `DynamoDBClient` if your application needs to release client resources.
- Prefer `QueryCommand` or `BatchGetCommand` over `ScanCommand` for large tables. If you do scan, use the exported paginator helpers rather than building your own page loop unless you need custom control.

## Official Sources

- AWS SDK for JavaScript v3 package docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/
- AWS SDK for JavaScript v3 source and package README: https://github.com/aws/aws-sdk-js-v3/tree/main/lib/lib-dynamodb
- npm package page: https://www.npmjs.com/package/@aws-sdk/lib-dynamodb
