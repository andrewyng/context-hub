---
name: compute-optimizer
description: "AWS SDK for JavaScript v3 client for Compute Optimizer enrollment, recommendation retrieval, projected metrics, preferences, and exports."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,compute-optimizer,javascript,nodejs,ec2,autoscaling,ebs,lambda,recommendations"
---

# `@aws-sdk/client-compute-optimizer`

Use this package for AWS Compute Optimizer operations in JavaScript or Node.js. It lets you check enrollment, retrieve recommendations for EC2 instances, Auto Scaling groups, EBS volumes, and Lambda functions, inspect projected metrics for EC2 recommendation options, manage recommendation preferences, and export recommendations to S3.

## Install

```bash
npm install @aws-sdk/client-compute-optimizer
```

Prefer `ComputeOptimizerClient` with explicit command imports.

## Prerequisites

- AWS credentials with permission to call Compute Optimizer.
- A configured AWS region.
- Compute Optimizer must be enrolled before recommendation APIs are useful.
- Resources must meet the service's supported-resource requirements before recommendations appear.

Typical local environment:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # only if you use temporary credentials
export COMPUTE_OPTIMIZER_EXPORT_BUCKET=my-existing-export-bucket
```

In Node.js, the AWS SDK v3 can also load credentials from shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance roles.

## Initialize the client

```javascript
import { ComputeOptimizerClient } from "@aws-sdk/client-compute-optimizer";

const computeOptimizer = new ComputeOptimizerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

All examples below assume trusted backend code. Do not ship long-lived AWS credentials in browser code.

## Core usage pattern

Start by checking enrollment. If the account is not enrolled, most recommendation calls either return nothing useful or do not reflect the resources you expect.

```javascript
import {
  ComputeOptimizerClient,
  GetEnrollmentStatusCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const enrollment = await client.send(new GetEnrollmentStatusCommand({}));

console.log({
  status: enrollment.status,
  statusReason: enrollment.statusReason,
  memberAccountsEnrolled: enrollment.memberAccountsEnrolled,
  lastUpdatedTimestamp: enrollment.lastUpdatedTimestamp,
});
```

## Common operations

### Opt in the current account

Use `UpdateEnrollmentStatusCommand` to opt in or opt out. When you opt in, Compute Optimizer creates a service-linked role in the account.

```javascript
import {
  ComputeOptimizerClient,
  UpdateEnrollmentStatusCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

await client.send(
  new UpdateEnrollmentStatusCommand({
    status: "Active",
  }),
);
```

If you call this from an AWS Organizations management account, you can also include member accounts:

```javascript
await client.send(
  new UpdateEnrollmentStatusCommand({
    status: "Active",
    includeMemberAccounts: true,
  }),
);
```

### List EC2 instance recommendations

Use `GetEC2InstanceRecommendationsCommand` to retrieve instance findings and ranked recommendation options. This API paginates with `nextToken` and can also return per-resource errors in `errors`.

```javascript
import {
  ComputeOptimizerClient,
  GetEC2InstanceRecommendationsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const recommendations = [];
let nextToken;

do {
  const page = await client.send(
    new GetEC2InstanceRecommendationsCommand({
      filters: [
        {
          name: "Finding",
          values: ["Overprovisioned"],
        },
      ],
      maxResults: 50,
      nextToken,
      recommendationPreferences: {
        cpuVendorArchitectures: ["AWS_ARM64"],
      },
    }),
  );

  recommendations.push(...(page.instanceRecommendations ?? []));
  nextToken = page.nextToken;

  for (const error of page.errors ?? []) {
    console.error(error.identifier, error.code, error.message);
  }
} while (nextToken);

for (const recommendation of recommendations) {
  const bestOption = recommendation.recommendationOptions?.[0];

  console.log({
    instanceArn: recommendation.instanceArn,
    currentInstanceType: recommendation.currentInstanceType,
    finding: recommendation.finding,
    recommendedInstanceType: bestOption?.instanceType,
    performanceRisk: bestOption?.performanceRisk,
    monthlySavings: bestOption?.savingsOpportunity?.estimatedMonthlySavings,
    migrationEffort: bestOption?.migrationEffort,
  });
}
```

Useful EC2 filters include `Finding`, `RecommendationSourceType`, `FindingReasonCodes`, `InferredWorkloadTypes`, `tag:key`, and `tag-key`.

### Get projected metrics for a recommended EC2 option

Use `GetEC2RecommendationProjectedMetricsCommand` when you need the projected utilization metrics behind a recommendation. This API requires an instance ARN, a metric statistic, a period, and a time window.

```javascript
import {
  ComputeOptimizerClient,
  GetEC2RecommendationProjectedMetricsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const projected = await client.send(
  new GetEC2RecommendationProjectedMetricsCommand({
    instanceArn: "arn:aws:ec2:us-east-1:111122223333:instance/i-1234567890abcdef0",
    stat: "Maximum",
    period: 3600,
    startTime: new Date("2026-03-01T00:00:00Z"),
    endTime: new Date("2026-03-08T00:00:00Z"),
    recommendationPreferences: {
      cpuVendorArchitectures: ["CURRENT"],
    },
  }),
);

for (const option of projected.recommendedOptionProjectedMetrics ?? []) {
  console.log(option.recommendedInstanceType, option.rank);

  for (const metric of option.projectedMetrics ?? []) {
    console.log(metric.name, metric.timestamps?.length, metric.values?.length);
  }
}
```

This operation returns projected `Cpu` and `Memory` metrics only. The `Memory` metric is returned only when the unified CloudWatch agent is installed on the instance.

### List Auto Scaling group recommendations

Use `GetAutoScalingGroupRecommendationsCommand` to compare the current group configuration with ranked alternatives.

```javascript
import {
  ComputeOptimizerClient,
  GetAutoScalingGroupRecommendationsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const { autoScalingGroupRecommendations = [], errors = [] } = await client.send(
  new GetAutoScalingGroupRecommendationsCommand({
    filters: [
      {
        name: "Finding",
        values: ["NotOptimized"],
      },
    ],
    maxResults: 20,
  }),
);

for (const error of errors) {
  console.error(error.identifier, error.code, error.message);
}

for (const recommendation of autoScalingGroupRecommendations) {
  const bestOption = recommendation.recommendationOptions?.[0];

  console.log({
    autoScalingGroupName: recommendation.autoScalingGroupName,
    finding: recommendation.finding,
    currentConfiguration: recommendation.currentConfiguration,
    recommendedConfiguration: bestOption?.configuration,
    performanceRisk: bestOption?.performanceRisk,
    monthlySavings: bestOption?.savingsOpportunity?.estimatedMonthlySavings,
  });
}
```

### List EBS volume recommendations

Use `GetEBSVolumeRecommendationsCommand` to inspect volume-type, size, IOPS, and throughput recommendations.

```javascript
import {
  ComputeOptimizerClient,
  GetEBSVolumeRecommendationsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const { volumeRecommendations = [], errors = [] } = await client.send(
  new GetEBSVolumeRecommendationsCommand({
    filters: [
      {
        name: "Finding",
        values: ["NotOptimized"],
      },
    ],
    maxResults: 20,
  }),
);

for (const error of errors) {
  console.error(error.identifier, error.code, error.message);
}

for (const recommendation of volumeRecommendations) {
  const bestOption = recommendation.volumeRecommendationOptions?.[0];

  console.log({
    volumeArn: recommendation.volumeArn,
    currentConfiguration: recommendation.currentConfiguration,
    recommendedConfiguration: bestOption?.configuration,
    performanceRisk: bestOption?.performanceRisk,
    monthlySavings: bestOption?.savingsOpportunity?.estimatedMonthlySavings,
  });
}
```

For EBS recommendations, `Finding` supports `Optimized` and `NotOptimized`. You can also filter by `tag:key` and `tag-key`.

### List Lambda function recommendations

Use `GetLambdaFunctionRecommendationsCommand` when you want recommended memory sizes for Lambda functions.

```javascript
import {
  ComputeOptimizerClient,
  GetLambdaFunctionRecommendationsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const { lambdaFunctionRecommendations = [] } = await client.send(
  new GetLambdaFunctionRecommendationsCommand({
    filters: [
      {
        name: "Finding",
        values: ["NotOptimized"],
      },
    ],
    maxResults: 20,
  }),
);

for (const recommendation of lambdaFunctionRecommendations) {
  const bestOption = recommendation.memorySizeRecommendationOptions?.[0];

  console.log({
    functionArn: recommendation.functionArn,
    currentMemorySize: recommendation.currentMemorySize,
    finding: recommendation.finding,
    recommendedMemorySize: bestOption?.memorySize,
    monthlySavings: bestOption?.savingsOpportunity?.estimatedMonthlySavings,
  });
}
```

Lambda filters support `Finding`, `FindingReasonCode`, `tag:key`, and `tag-key`.

### Get recommendation summaries for an account

Use `GetRecommendationSummariesCommand` for a compact view of findings and savings opportunities by resource type.

```javascript
import {
  ComputeOptimizerClient,
  GetRecommendationSummariesCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const { recommendationSummaries = [] } = await client.send(
  new GetRecommendationSummariesCommand({
    maxResults: 20,
  }),
);

for (const summary of recommendationSummaries) {
  console.log({
    resourceType: summary.recommendationResourceType,
    savings: summary.savingsOpportunity?.estimatedMonthlySavings,
    aggregatedSavings: summary.aggregatedSavingsOpportunity?.estimatedMonthlySavings,
    performanceRiskRatings: summary.currentPerformanceRiskRatings,
  });
}
```

This is a good starting point for dashboards or scheduled reporting before you fetch detailed per-resource recommendations.

### Set and inspect recommendation preferences

Use `PutRecommendationPreferencesCommand` to set saved preferences, then `GetEffectiveRecommendationPreferencesCommand` to see which active preferences actually apply to a specific resource.

```javascript
import {
  ComputeOptimizerClient,
  PutRecommendationPreferencesCommand,
  GetEffectiveRecommendationPreferencesCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

await client.send(
  new PutRecommendationPreferencesCommand({
    resourceType: "Ec2Instance",
    scope: {
      name: "AccountId",
      value: "111122223333",
    },
    enhancedInfrastructureMetrics: "Active",
    lookBackPeriod: "DAYS_32",
  }),
);

const effective = await client.send(
  new GetEffectiveRecommendationPreferencesCommand({
    resourceArn: "arn:aws:ec2:us-east-1:111122223333:instance/i-1234567890abcdef0",
  }),
);

console.log({
  enhancedInfrastructureMetrics: effective.enhancedInfrastructureMetrics,
  lookBackPeriod: effective.lookBackPeriod,
  preferredResources: effective.preferredResources,
});
```

Saved preference scopes can target an `Organization`, an `AccountId`, or a specific `ResourceArn`.

### Export EC2 recommendations to S3

Use `ExportEC2InstanceRecommendationsCommand` to create a CSV export in an existing S3 bucket, then poll `DescribeRecommendationExportJobsCommand` for job status.

```javascript
import {
  ComputeOptimizerClient,
  ExportEC2InstanceRecommendationsCommand,
  DescribeRecommendationExportJobsCommand,
} from "@aws-sdk/client-compute-optimizer";

const client = new ComputeOptimizerClient({ region: "us-east-1" });

const exportResponse = await client.send(
  new ExportEC2InstanceRecommendationsCommand({
    s3DestinationConfig: {
      bucket: process.env.COMPUTE_OPTIMIZER_EXPORT_BUCKET,
      keyPrefix: "compute-optimizer/ec2",
    },
    fileFormat: "Csv",
    filters: [
      {
        name: "Finding",
        values: ["Overprovisioned"],
      },
    ],
  }),
);

console.log(exportResponse.jobId, exportResponse.s3Destination);

const jobs = await client.send(
  new DescribeRecommendationExportJobsCommand({
    jobIds: [exportResponse.jobId],
  }),
);

console.log(jobs.recommendationExportJobs?.[0]);
```

The export writes a CSV data file and a JSON metadata file to S3. For EC2 instance recommendation exports, only one export job can be in progress per AWS Region.

## Pitfalls and notes

- Empty recommendation lists usually mean the account is not enrolled yet, the resource type is not supported, or Compute Optimizer has not collected enough data.
- Recommendation APIs commonly paginate with `nextToken`; keep fetching until it is absent.
- Some list responses include an `errors` array even when the overall request succeeds.
- Organization-scoped inputs such as `accountIds` and `includeMemberAccounts` are for organization-aware setups, not a normal single-account workflow.
- `GetEC2InstanceRecommendationsCommand` and `GetAutoScalingGroupRecommendationsCommand` accept request-scoped `recommendationPreferences`, which are separate from the saved preferences managed by `PutRecommendationPreferencesCommand`.
- Keep the client region explicit and consistent with the resources and export destination you are querying.
