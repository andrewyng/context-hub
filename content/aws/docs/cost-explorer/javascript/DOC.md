---
name: cost-explorer
description: "AWS SDK for JavaScript v3 client for Cost Explorer historical cost, dimension discovery, forecasts, and resource-level cost queries."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,cost-explorer,billing,cost-management,javascript,nodejs"
---

# `@aws-sdk/client-cost-explorer`

Use this package to query AWS Cost Explorer from JavaScript or Node.js. The main workflows are: retrieve historical cost and usage with `GetCostAndUsage`, discover valid filter values with `GetDimensionValues`, request forecasts with `GetCostForecast`, and read resource-level EC2 cost data with `GetCostAndUsageWithResources` when that feature is enabled.

Cost Explorer is a billing service. In the standard AWS partition, its endpoint resolves to `ce.us-east-1.amazonaws.com`, so it is practical to set `us-east-1` explicitly in client configuration.

## Install

```bash
npm install @aws-sdk/client-cost-explorer
```

Common companion package:

```bash
npm install @aws-sdk/credential-providers
```

Typical local environment variables:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=billing

# Or use direct credentials instead of AWS_PROFILE
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # only for temporary credentials
```

## Client setup

```javascript
import { CostExplorerClient } from "@aws-sdk/client-cost-explorer";

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, the default AWS SDK v3 credential provider chain is usually enough when credentials already come from environment variables, shared AWS config files, IAM Identity Center, ECS, or EC2 instance metadata.

If you need a specific shared config profile in code:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { CostExplorerClient } from "@aws-sdk/client-cost-explorer";

const costExplorer = new CostExplorerClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "billing" }),
});
```

## Common workflows

### Get historical cost grouped by service

`GetCostAndUsage` is the main reporting API for historical spend and usage. The request requires `TimePeriod`, `Granularity`, and `Metrics`.

```javascript
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextPageToken;
const pages = [];

do {
  const page = await costExplorer.send(
    new GetCostAndUsageCommand({
      TimePeriod: {
        Start: "2026-02-01",
        End: "2026-03-01",
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
      NextPageToken: nextPageToken,
    }),
  );

  pages.push(page);
  nextPageToken = page.NextPageToken;
} while (nextPageToken);

const rows = pages.flatMap(
  (page) =>
    page.ResultsByTime?.flatMap((result) => {
      return (result.Groups ?? []).map((group) => ({
        start: result.TimePeriod?.Start,
        end: result.TimePeriod?.End,
        service: group.Keys?.[0],
        amount: group.Metrics?.UnblendedCost?.Amount,
        unit: group.Metrics?.UnblendedCost?.Unit,
        estimated: result.Estimated,
      }));
    }) ?? [],
);

console.table(rows);
```

The `TimePeriod.Start` date is inclusive and `TimePeriod.End` is exclusive. For a full calendar month, use the first day of the month as `Start` and the first day of the next month as `End`.

### Filter by linked account or service

Filters use the `Expression` shape. For `GetCostAndUsage`, dimension filters support `EQUALS` and `CASE_SENSITIVE` match options.

```javascript
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await costExplorer.send(
  new GetCostAndUsageCommand({
    TimePeriod: {
      Start: "2026-02-01",
      End: "2026-03-01",
    },
    Granularity: "DAILY",
    Metrics: ["UnblendedCost", "UsageQuantity"],
    Filter: {
      And: [
        {
          Dimensions: {
            Key: "LINKED_ACCOUNT",
            Values: ["123456789012"],
          },
        },
        {
          Dimensions: {
            Key: "SERVICE",
            Values: ["Amazon Elastic Compute Cloud - Compute"],
          },
        },
      ],
    },
  }),
);

console.dir(response.ResultsByTime, { depth: null });
```

Be careful with `UsageQuantity`: Cost Explorer can aggregate different units together unless you also narrow the query by `USAGE_TYPE` or `USAGE_TYPE_GROUP`.

### Discover valid dimension values before building filters

Do not guess service names, linked account IDs, or usage types. Use `GetDimensionValues` to retrieve values that Cost Explorer accepts for the time period and context you care about.

```javascript
import {
  CostExplorerClient,
  GetDimensionValuesCommand,
} from "@aws-sdk/client-cost-explorer";

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextPageToken;
const values = [];

do {
  const page = await costExplorer.send(
    new GetDimensionValuesCommand({
      TimePeriod: {
        Start: "2026-02-01",
        End: "2026-03-01",
      },
      Context: "COST_AND_USAGE",
      Dimension: "SERVICE",
      SearchString: "Amazon",
      NextPageToken: nextPageToken,
    }),
  );

  values.push(...(page.DimensionValues ?? []));
  nextPageToken = page.NextPageToken;
} while (nextPageToken);

console.table(
  values.map((entry) => ({
    value: entry.Value,
    attributes: entry.Attributes,
  })),
);
```

For cost-and-usage queries, `GetDimensionValues` can return dimensions such as `SERVICE`, `LINKED_ACCOUNT`, `REGION`, `USAGE_TYPE`, `USAGE_TYPE_GROUP`, and `RESOURCE_ID`.

### Forecast future cost

Use `GetCostForecast` for forward-looking spend estimates. Forecast metric names use uppercase enum values such as `UNBLENDED_COST`, not the camel-case metric names used by `GetCostAndUsage`.

```javascript
import {
  CostExplorerClient,
  GetCostForecastCommand,
} from "@aws-sdk/client-cost-explorer";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

const now = new Date();
const forecastStart = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
);
const forecastEnd = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 3, 1),
);

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await costExplorer.send(
  new GetCostForecastCommand({
    TimePeriod: {
      Start: formatDate(forecastStart),
      End: formatDate(forecastEnd),
    },
    Metric: "UNBLENDED_COST",
    Granularity: "MONTHLY",
    Filter: {
      Dimensions: {
        Key: "SERVICE",
        Values: ["Amazon Simple Storage Service"],
      },
    },
    PredictionIntervalLevel: 80,
  }),
);

console.log({
  totalAmount: response.Total?.Amount,
  totalUnit: response.Total?.Unit,
});

console.table(
  (response.ForecastResultsByTime ?? []).map((entry) => ({
    start: entry.TimePeriod?.Start,
    end: entry.TimePeriod?.End,
    meanValue: entry.MeanValue,
    lowerBound: entry.PredictionIntervalLowerBound,
    upperBound: entry.PredictionIntervalUpperBound,
  })),
);
```

`GetCostForecast` supports only `DAILY` and `MONTHLY` granularity.

### Query resource-level EC2 cost data

Use `GetCostAndUsageWithResources` only when you need resource-level cost data. This feature is opt-in, limited to the last 14 days, and requires a `RESOURCE_ID` filter or group plus the EC2 compute service filter.

```javascript
import {
  CostExplorerClient,
  GetCostAndUsageWithResourcesCommand,
} from "@aws-sdk/client-cost-explorer";

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

const end = new Date();
const start = new Date();
start.setUTCDate(start.getUTCDate() - 7);

const costExplorer = new CostExplorerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await costExplorer.send(
  new GetCostAndUsageWithResourcesCommand({
    TimePeriod: {
      Start: formatDate(start),
      End: formatDate(end),
    },
    Granularity: "DAILY",
    Filter: {
      And: [
        {
          Dimensions: {
            Key: "SERVICE",
            Values: ["Amazon Elastic Compute Cloud - Compute"],
          },
        },
        {
          Dimensions: {
            Key: "RESOURCE_ID",
            Values: ["i-0123456789abcdef0"],
          },
        },
      ],
    },
    Metrics: ["UnblendedCost"],
  }),
);

console.table(
  (response.ResultsByTime ?? []).map((entry) => ({
    start: entry.TimePeriod?.Start,
    end: entry.TimePeriod?.End,
    amount: entry.Total?.UnblendedCost?.Amount,
    unit: entry.Total?.UnblendedCost?.Unit,
    estimated: entry.Estimated,
  })),
);
```

Hourly granularity is only available for EC2 instance resource-level data. Other resource-level data is available only at daily granularity.

## Important pitfalls

- `TimePeriod.Start` is inclusive and `TimePeriod.End` is exclusive across Cost Explorer reporting and dimension lookups.
- Historical reporting APIs such as `GetCostAndUsage` use metric names like `UnblendedCost`, while forecast APIs use enum names like `UNBLENDED_COST`.
- These APIs use `NextPageToken`, not `NextToken`. Handle pagination manually for `GetCostAndUsage`, `GetDimensionValues`, and `GetCostAndUsageWithResources`.
- Each `Expression` can have only one root operator. Nest `And`, `Or`, and `Not` instead of combining multiple root fields in the same object.
- `UsageQuantity` is not meaningful across mixed units unless you also filter by `USAGE_TYPE` or `USAGE_TYPE_GROUP`.
- `GetCostAndUsageWithResources` is opt-in, limited to the last 14 days, and requires EC2 compute service plus `RESOURCE_ID` filtering or grouping.
- A management account in AWS Organizations can query member-account cost data.

## Related packages

- `@aws-sdk/credential-providers`: explicit profile, SSO, Cognito, and assume-role credential flows.
- `@aws-sdk/client-budgets`: budgets, notifications, and budget actions when you need enforcement or alerts in addition to reporting.

## Version notes

- This guide targets `@aws-sdk/client-cost-explorer` version `3.1007.0`.
- Current endpoint rules resolve the standard AWS partition to `ce.us-east-1.amazonaws.com` and the China partition to `ce.cn-northwest-1.amazonaws.com.cn`.
- The current Cost Explorer API model does not advertise SDK paginators for `GetCostAndUsage`, `GetDimensionValues`, or `GetCostAndUsageWithResources`, so explicit `NextPageToken` loops are the safe default.

## Official sources

- AWS SDK for JavaScript v3 Cost Explorer client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cost-explorer/`
- AWS Cost Explorer API Reference: `https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/Welcome.html`
- `GetCostAndUsage` API reference: `https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetCostAndUsage.html`
- `GetDimensionValues` API reference: `https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetDimensionValues.html`
- `GetCostForecast` API reference: `https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetCostForecast.html`
- `GetCostAndUsageWithResources` API reference: `https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetCostAndUsageWithResources.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-cost-explorer`
