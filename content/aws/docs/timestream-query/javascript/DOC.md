---
name: timestream-query
description: "AWS SDK for JavaScript v3 client for Amazon Timestream query operations, including SQL execution, pagination, query cancellation, and endpoint inspection."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,timestream,javascript,nodejs,time-series,sql,query"
---

# `@aws-sdk/client-timestream-query`

Use this package for Amazon Timestream for LiveAnalytics query-plane operations in AWS SDK for JavaScript v3. The common workflow is: send SQL with `QueryCommand`, read `Rows` and `ColumnInfo` from the response, follow `NextToken` until the result set is complete, and optionally cancel the query with `CancelQueryCommand` if you no longer need it.

This package does not create databases, tables, or ingest records. For write-plane operations, use `@aws-sdk/client-timestream-write`.

## Install

```bash
npm install @aws-sdk/client-timestream-query
```

If you want to force a named shared AWS profile in code instead of relying on the default credential chain:

```bash
npm install @aws-sdk/credential-providers
```

This guide targets `@aws-sdk/client-timestream-query@3.1007.0`.

## Prerequisites And Authentication

Timestream query calls need AWS credentials and a region. In Node.js, AWS SDK v3 usually resolves credentials from the default provider chain, including environment variables, shared config files, IAM Identity Center, ECS task roles, and EC2 instance profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

export AWS_TIMESTREAM_DATABASE=metrics
export AWS_TIMESTREAM_TABLE=cpu_utilization
```

Minimal client setup:

```javascript
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a shared profile explicitly in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

For browser applications, do not embed long-lived AWS access keys. Call Timestream from trusted backend code or use tightly scoped temporary credentials.

## Run A Query And Read Scalar Rows

`QueryCommand` sends SQL and returns the first page of results directly. For Timestream single-measure tables, a common pattern is to filter by `measure_name` and cast `measure_value` to the type you stored.

```javascript
import {
  QueryCommand,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const database = process.env.AWS_TIMESTREAM_DATABASE ?? "metrics";
const table = process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization";

const result = await timestreamQuery.send(
  new QueryCommand({
    QueryString: `
      SELECT time, host, measure_value::double AS cpu
      FROM "${database}"."${table}"
      WHERE measure_name = 'cpu'
        AND time > ago(1h)
      ORDER BY time DESC
      LIMIT 10
    `,
    MaxRows: 10,
  }),
);

const columnNames = result.ColumnInfo?.map((column) => column.Name ?? "") ?? [];

const rows = (result.Rows ?? []).map((row) => {
  return Object.fromEntries(
    columnNames.map((name, index) => {
      const cell = row.Data?.[index];
      return [name, cell?.NullValue ? null : cell?.ScalarValue ?? null];
    }),
  );
});

console.log(rows);
console.log(result.QueryId);
console.log(result.NextToken);
```

The simple row-mapping example above is only for scalar columns. If your query returns arrays, nested rows, or time-series values, inspect `ArrayValue`, `RowValue`, or `TimeSeriesValue` in each cell instead of reading only `ScalarValue`.

## Read Every Page With `NextToken`

A successful `QueryCommand` can still be only the first page. If the response includes `NextToken`, send another `QueryCommand` with the same SQL and that token until `NextToken` is absent.

```javascript
import {
  QueryCommand,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function queryAllPages(queryString) {
  const pages = [];
  let nextToken;

  do {
    const page = await timestreamQuery.send(
      new QueryCommand({
        QueryString: queryString,
        NextToken: nextToken,
        MaxRows: 100,
      }),
    );

    pages.push(page);
    nextToken = page.NextToken;
  } while (nextToken);

  return pages;
}

const pages = await queryAllPages(`
  SELECT time, host, measure_value::double AS cpu
  FROM "${process.env.AWS_TIMESTREAM_DATABASE ?? "metrics"}"."${process.env.AWS_TIMESTREAM_TABLE ?? "cpu_utilization"}"
  WHERE measure_name = 'cpu'
    AND time > ago(24h)
  ORDER BY time DESC
`);

const allRows = pages.flatMap((page) => page.Rows ?? []);
console.log(allRows.length);
```

Keep the SQL text stable while following a pagination token. Treat `NextToken` as part of the same query execution rather than as a fresh request.

## Cancel A Query

If you keep the `QueryId` from a prior response and later decide the work is no longer needed, call `CancelQueryCommand`.

```javascript
import {
  CancelQueryCommand,
  QueryCommand,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const firstPage = await timestreamQuery.send(
  new QueryCommand({
    QueryString: `
      SELECT time, host, measure_value::double AS cpu
      FROM "metrics"."cpu_utilization"
      WHERE measure_name = 'cpu'
      ORDER BY time DESC
    `,
    MaxRows: 100,
  }),
);

if (firstPage.QueryId) {
  await timestreamQuery.send(
    new CancelQueryCommand({
      QueryId: firstPage.QueryId,
    }),
  );
}
```

Cancellation is most useful when the first response gave you a `QueryId` but the application no longer wants the remaining work or pages.

## Prepare A Query Before Saving Or Running It

Use `PrepareQueryCommand` when you want the service to validate a SQL statement before you persist it or run it in a broader workflow.

```javascript
import {
  PrepareQueryCommand,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const prepared = await timestreamQuery.send(
  new PrepareQueryCommand({
    QueryString: `
      SELECT time, host, measure_value::double AS cpu
      FROM "metrics"."cpu_utilization"
      WHERE measure_name = 'cpu'
        AND time > ago(15m)
      ORDER BY time DESC
      LIMIT 20
    `,
  }),
);

console.dir(prepared, { depth: null });
```

## Inspect The Resolved Query Endpoint

AWS documents endpoint discovery for Timestream. In normal SDK usage you usually do not need to call `DescribeEndpointsCommand` yourself, but it is useful for debugging or custom endpoint caching.

```javascript
import {
  DescribeEndpointsCommand,
  TimestreamQueryClient,
} from "@aws-sdk/client-timestream-query";

const timestreamQuery = new TimestreamQueryClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Endpoints } = await timestreamQuery.send(
  new DescribeEndpointsCommand({})
);

const endpoint = Endpoints?.[0];

console.log(endpoint?.Address);
console.log(endpoint?.CachePeriodInMinutes);
```

If you cache endpoints or override the service endpoint manually, respect the returned cache period and keep the region aligned with the target Timestream resources.

## Common Pitfalls

- Using this client for ingestion. Record writes and table management are in `@aws-sdk/client-timestream-write`.
- Assuming one `QueryCommand` response contains the entire result set. Follow `NextToken` until it disappears.
- Treating `Rows` as plain objects. Timestream returns cells under `Rows[].Data[]`, with type information in `ColumnInfo`.
- Reading only `ScalarValue` when the query returns arrays, nested rows, or time-series values.
- Hardcoding long-lived AWS keys in frontend code.
- Overriding endpoints without respecting the endpoint-discovery cache period.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-timestream-query@3.1007.0`.
- The AWS SDK for JavaScript v3 service docs are published under a rolling `latest` URL. Pin the npm package version in your app when exact patch-level parity matters.

## Official Sources

- AWS SDK for JavaScript v3 Timestream Query client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/timestream-query/`
- Amazon Timestream `Query` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_query_Query.html`
- Amazon Timestream `CancelQuery` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_query_CancelQuery.html`
- Amazon Timestream `PrepareQuery` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_query_PrepareQuery.html`
- Amazon Timestream `DescribeEndpoints` API reference: `https://docs.aws.amazon.com/timestream/latest/developerguide/API_DescribeEndpoints.html`
- Amazon Timestream endpoint-discovery guide: `https://docs.aws.amazon.com/timestream/latest/developerguide/Using-API.endpoint-discovery.describe-endpoints.implementation.html`
