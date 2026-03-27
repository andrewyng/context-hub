---
name: forecast
description: "AWS SDK for JavaScript v3 client for Amazon Forecast datasets, predictors, forecasts, and related control-plane APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,forecast,javascript,nodejs,time-series,ml"
---

# `@aws-sdk/client-forecast`

Use this package for Amazon Forecast control-plane operations in AWS SDK for JavaScript v3: dataset groups, datasets, dataset import jobs, predictors, forecasts, forecast export jobs, tags, monitors, and related describe/list/delete APIs.

Amazon Forecast is no longer available to new customers. Existing customers can continue using the service, so this package is mainly useful for maintaining or extending existing Forecast deployments.

Prefer trusted server-side code. Forecast operations usually need broad IAM permissions plus access to S3 data locations.

## Install

```bash
npm install @aws-sdk/client-forecast
```

If you want explicit shared-config or profile-based credentials in Node.js instead of the default provider chain:

```bash
npm install @aws-sdk/credential-providers
```

## Credentials and region

Set region explicitly in code or through environment/config. Typical local setup:

```bash
export AWS_REGION=us-west-2
export AWS_PROFILE=forecast-admin
```

In Node.js, the AWS SDK v3 default credential chain usually resolves credentials from environment variables, shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance profiles.

## Initialize the client

Use the default provider chain when the environment is already configured:

```javascript
import { ForecastClient } from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

If you want to force a named profile from shared AWS config files:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { ForecastClient } from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "forecast-admin",
  }),
});
```

## What this client covers

`@aws-sdk/client-forecast` is the resource-management side of Amazon Forecast. Common flows look like this:

1. create or inspect datasets and dataset groups
2. import training data from S3
3. create an auto predictor
4. wait until the predictor becomes `ACTIVE`
5. inspect accuracy metrics
6. create a forecast from the predictor
7. wait until the forecast becomes `ACTIVE`
8. export or query the resulting forecast

Query-time APIs are separate from this package. If you need low-latency retrieval for a specific item and time range, use the Forecast Query service client instead of this control-plane client.

## Core usage pattern

### List dataset groups

Start by discovering the dataset groups already present in the target region.

```javascript
import {
  ForecastClient,
  ListDatasetGroupsCommand,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

let nextToken;

do {
  const page = await forecast.send(
    new ListDatasetGroupsCommand({
      MaxResults: 20,
      NextToken: nextToken,
    }),
  );

  for (const group of page.DatasetGroups ?? []) {
    console.log({
      arn: group.DatasetGroupArn,
      name: group.DatasetGroupName,
      status: group.Status,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

Forecast resources are regional. If you do not see the dataset group you expect, check the client region first.

### Inspect one dataset group

`DescribeDatasetGroupCommand` gives you the domain and the dataset ARNs attached to the group.

```javascript
import {
  DescribeDatasetGroupCommand,
  ForecastClient,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const response = await forecast.send(
  new DescribeDatasetGroupCommand({
    DatasetGroupArn: "arn:aws:forecast:us-west-2:123456789012:dataset-group/retail-demo",
  }),
);

console.log({
  name: response.DatasetGroupName,
  arn: response.DatasetGroupArn,
  domain: response.Domain,
  status: response.Status,
  datasets: response.DatasetArns,
});
```

Wait for the dataset group to become `ACTIVE` before using it to train predictors.

### Start a dataset import job from S3

Use this when you already have a Forecast dataset and need to load or refresh its training data from S3.

```javascript
import {
  CreateDatasetImportJobCommand,
  ForecastClient,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const { DatasetImportJobArn } = await forecast.send(
  new CreateDatasetImportJobCommand({
    DatasetImportJobName: "retail-target-import-20260313",
    DatasetArn: "arn:aws:forecast:us-west-2:123456789012:dataset/retail-target",
    DataSource: {
      S3Config: {
        Path: "s3://my-forecast-input/retail/target-time-series.csv",
        RoleArn: "arn:aws:iam::123456789012:role/AmazonForecastS3Access",
      },
    },
    TimestampFormat: "yyyy-MM-dd",
  }),
);

console.log(DatasetImportJobArn);
```

Practical rules:

- dataset import data must come from S3
- the IAM role in `DataSource.S3Config.RoleArn` must be in your account
- if you use KMS encryption for the dataset, the import job must use matching key access
- if you omit `TimestampFormat`, Forecast expects `yyyy-MM-dd HH:mm:ss`

### Create an auto predictor

For new work, prefer `CreateAutoPredictorCommand`. Current service docs describe AutoPredictor as the normal predictor-creation path.

```javascript
import {
  CreateAutoPredictorCommand,
  ForecastClient,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const { PredictorArn } = await forecast.send(
  new CreateAutoPredictorCommand({
    PredictorName: "retail-demand-v1",
    ForecastHorizon: 14,
    ForecastFrequency: "D",
    ForecastTypes: ["0.1", "0.5", "0.9"],
    DataConfig: {
      DatasetGroupArn:
        "arn:aws:forecast:us-west-2:123456789012:dataset-group/retail-demo",
    },
  }),
);

console.log(PredictorArn);
```

The required fields for a new auto predictor are the predictor name, dataset group ARN, forecast frequency, and forecast horizon.

### Wait for predictor training and inspect metrics

Forecast creation APIs are asynchronous. Submit the job, then poll the matching `Describe*` operation until the resource becomes `ACTIVE` or fails.

```javascript
import {
  DescribePredictorCommand,
  ForecastClient,
  GetAccuracyMetricsCommand,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPredictor(predictorArn) {
  for (;;) {
    const response = await forecast.send(
      new DescribePredictorCommand({
        PredictorArn: predictorArn,
      }),
    );

    const status = response.Status ?? "UNKNOWN";
    console.log({ status, message: response.Message });

    if (status === "ACTIVE") {
      return response;
    }

    if (status.endsWith("_FAILED") || status.endsWith("_STOPPED")) {
      throw new Error(response.Message ?? `Predictor ended in state ${status}`);
    }

    await sleep(30_000);
  }
}

const predictorArn = "arn:aws:forecast:us-west-2:123456789012:predictor/retail-demand-v1";

await waitForPredictor(predictorArn);

const metrics = await forecast.send(
  new GetAccuracyMetricsCommand({
    PredictorArn: predictorArn,
  }),
);

for (const result of metrics.PredictorEvaluationResults ?? []) {
  console.log({
    algorithmArn: result.AlgorithmArn,
    windows: result.TestWindows?.length ?? 0,
  });
}
```

Use `DescribePredictorCommand` for lifecycle state and `GetAccuracyMetricsCommand` for model quality details after training finishes.

### Create a forecast from a predictor

`CreateForecastCommand` runs inference for the predictor. The forecast horizon comes from the predictor configuration.

```javascript
import {
  CreateForecastCommand,
  ForecastClient,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

const { ForecastArn } = await forecast.send(
  new CreateForecastCommand({
    ForecastName: "retail-demand-v1-20260313",
    PredictorArn: "arn:aws:forecast:us-west-2:123456789012:predictor/retail-demand-v1",
    ForecastTypes: ["0.1", "0.5", "0.9"],
  }),
);

console.log(ForecastArn);
```

If you omit `ForecastTypes`, Forecast uses the predictor's configured quantiles. If the predictor did not specify quantiles, the service default is `0.1`, `0.5`, and `0.9`.

### Wait for a forecast to become active

Forecasts must be `ACTIVE` before you query or export them.

```javascript
import {
  DescribeForecastCommand,
  ForecastClient,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForForecast(forecastArn) {
  for (;;) {
    const response = await forecast.send(
      new DescribeForecastCommand({
        ForecastArn: forecastArn,
      }),
    );

    const status = response.Status ?? "UNKNOWN";
    console.log({ status, message: response.Message });

    if (status === "ACTIVE") {
      return response;
    }

    if (status.endsWith("_FAILED") || status.endsWith("_STOPPED")) {
      throw new Error(response.Message ?? `Forecast ended in state ${status}`);
    }

    await sleep(30_000);
  }
}

const forecastArn = "arn:aws:forecast:us-west-2:123456789012:forecast/retail-demand-v1-20260313";
const description = await waitForForecast(forecastArn);

console.log({
  predictorArn: description.PredictorArn,
  datasetGroupArn: description.DatasetGroupArn,
  forecastTypes: description.ForecastTypes,
});
```

Forecast outputs use the same time zone as the dataset that trained the predictor.

### List or delete forecasts

`ListForecastsCommand` supports filtering by `DatasetGroupArn`, `PredictorArn`, and `Status`.

```javascript
import {
  DeleteForecastCommand,
  ForecastClient,
  ListForecastsCommand,
} from "@aws-sdk/client-forecast";

const forecast = new ForecastClient({ region: process.env.AWS_REGION ?? "us-west-2" });

let nextToken;

do {
  const page = await forecast.send(
    new ListForecastsCommand({
      MaxResults: 25,
      NextToken: nextToken,
      Filters: [
        {
          Key: "PredictorArn",
          Condition: "IS",
          Value: "arn:aws:forecast:us-west-2:123456789012:predictor/retail-demand-v1",
        },
      ],
    }),
  );

  for (const item of page.Forecasts ?? []) {
    console.log({
      arn: item.ForecastArn,
      name: item.ForecastName,
      status: item.Status,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);

await forecast.send(
  new DeleteForecastCommand({
    ForecastArn: "arn:aws:forecast:us-west-2:123456789012:forecast/retail-demand-v1-20260313",
  }),
);
```

Delete only after downstream exports or queries are done. Forecast resources are not reusable after deletion.

## Common pitfalls

- `@aws-sdk/client-forecast` is the management client, not the query client. Use the Forecast Query service for low-latency per-item reads.
- Forecast resources are regional. A valid ARN in one region will not show up in another region's client.
- Most create operations are asynchronous. Always poll `DescribeDatasetGroup`, `DescribeDatasetImportJob`, `DescribePredictor`, or `DescribeForecast` before starting the next dependent step.
- `CreateForecastCommand` requires a predictor ARN. The forecast cannot become usable until its status is `ACTIVE`.
- Dataset import jobs read from S3 and require an IAM role that Forecast can assume. Cross-account role passing is not allowed.
- If you use KMS-encrypted data, make sure the Forecast service role can use the same key.
- For existing installations, prefer `CreateAutoPredictorCommand` over older predictor-creation flows unless you have a specific legacy reason.

## Official sources

- AWS SDK for JavaScript v3 Forecast client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/forecast/`
- Amazon Forecast API operations reference: `https://docs.aws.amazon.com/forecast/latest/dg/API_Operations_Amazon_Forecast_Service.html`
- AWS CLI `forecast` reference: `https://docs.aws.amazon.com/cli/latest/reference/forecast/`
- Amazon Forecast developer guide: `https://docs.aws.amazon.com/forecast/latest/dg/what-is-forecast.html`
