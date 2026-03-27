---
name: budgets
description: "AWS SDK for JavaScript v3 client for listing, creating, updating, and automating AWS Budgets."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,budgets,javascript,nodejs,billing,cost-management,cost-control"
---

# `@aws-sdk/client-budgets`

Use this package to manage AWS Budgets from JavaScript with AWS SDK v3. The client covers budget creation and updates, budget notifications and subscribers, performance history, budget actions, and resource tagging.

AWS Budgets is a billing service with a global endpoint (`https://budgets.amazonaws.com`). The SDK still expects normal client configuration, so set a region explicitly in your client config.

## Install

```bash
npm install @aws-sdk/client-budgets
```

Typical environment variables for local development:

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # only for temporary credentials
```

Most Budgets operations require the 12-digit AWS account ID in the request body, so it is practical to keep `AWS_ACCOUNT_ID` next to your normal AWS credentials.

## Client Setup

```javascript
import { BudgetsClient } from "@aws-sdk/client-budgets";

const accountId = process.env.AWS_ACCOUNT_ID;

if (!accountId) {
  throw new Error("Set AWS_ACCOUNT_ID to your 12-digit AWS account ID.");
}

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, the default credential provider chain is usually enough when credentials already come from environment variables, shared AWS config files, IAM Identity Center, ECS, or EC2 instance metadata.

## Common Workflows

### List budgets for an account

`DescribeBudgets` is the main discovery call. It supports `MaxResults` and `NextToken` pagination.

```javascript
import {
  BudgetsClient,
  DescribeBudgetsCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const accountId = process.env.AWS_ACCOUNT_ID;

let nextToken;

do {
  const page = await budgets.send(
    new DescribeBudgetsCommand({
      AccountId: accountId,
      MaxResults: 20,
      NextToken: nextToken,
      ShowFilterExpression: true,
    }),
  );

  for (const budget of page.Budgets ?? []) {
    console.log({
      name: budget.BudgetName,
      type: budget.BudgetType,
      timeUnit: budget.TimeUnit,
      limit: budget.BudgetLimit,
      actual: budget.CalculatedSpend?.ActualSpend,
      forecasted: budget.CalculatedSpend?.ForecastedSpend,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

Set `ShowFilterExpression: true` when you want the response to include the newer `FilterExpression` form for budgets that use expression-based filters.

### Read a single budget

Use `DescribeBudget` when you already know the budget name.

```javascript
import {
  BudgetsClient,
  DescribeBudgetCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await budgets.send(
  new DescribeBudgetCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    BudgetName: "monthly-cost",
    ShowFilterExpression: true,
  }),
);

console.log(response.Budget?.BudgetName);
console.log(response.Budget?.BudgetLimit);
console.log(response.Budget?.CalculatedSpend?.ActualSpend);
console.log(response.Budget?.CalculatedSpend?.ForecastedSpend);
```

### Create a monthly cost budget with an email alert

`CreateBudget` can create the budget and its initial notifications/subscribers in one request.

```javascript
import {
  BudgetsClient,
  CreateBudgetCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const now = new Date();
const startOfMonth = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
);

await budgets.send(
  new CreateBudgetCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    Budget: {
      BudgetName: "monthly-cost",
      BudgetType: "COST",
      TimeUnit: "MONTHLY",
      BudgetLimit: {
        Amount: "200",
        Unit: "USD",
      },
      TimePeriod: {
        Start: startOfMonth,
      },
    },
    NotificationsWithSubscribers: [
      {
        Notification: {
          NotificationType: "FORECASTED",
          ComparisonOperator: "GREATER_THAN",
          Threshold: 80,
          ThresholdType: "PERCENTAGE",
        },
        Subscribers: [
          {
            SubscriptionType: "EMAIL",
            Address: "finops@example.com",
          },
        ],
      },
    ],
  }),
);
```

For cost and usage budgets, supply `BudgetLimit`. If you use `PlannedBudgetLimits`, omit `BudgetLimit` from the same request.

### Add or update notifications later

If you did not create notifications during `CreateBudget`, or you need to add another alert later, use `CreateNotification`. To add another subscriber to an existing notification, use `CreateSubscriber`.

```javascript
import {
  BudgetsClient,
  CreateNotificationCommand,
  CreateSubscriberCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const notification = {
  NotificationType: "ACTUAL",
  ComparisonOperator: "GREATER_THAN",
  Threshold: 90,
  ThresholdType: "PERCENTAGE",
};

await budgets.send(
  new CreateNotificationCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    BudgetName: "monthly-cost",
    Notification: notification,
    Subscribers: [
      {
        SubscriptionType: "EMAIL",
        Address: "owner@example.com",
      },
    ],
  }),
);

await budgets.send(
  new CreateSubscriberCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    BudgetName: "monthly-cost",
    Notification: notification,
    Subscriber: {
      SubscriptionType: "EMAIL",
      Address: "backup-owner@example.com",
    },
  }),
);
```

### Update a budget amount

Use `UpdateBudget` to replace the mutable parts of a budget. `BudgetName` stays the same, and `CalculatedSpend` is not something you set yourself.

```javascript
import {
  BudgetsClient,
  UpdateBudgetCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const now = new Date();
const startOfMonth = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
);

await budgets.send(
  new UpdateBudgetCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    NewBudget: {
      BudgetName: "monthly-cost",
      BudgetType: "COST",
      TimeUnit: "MONTHLY",
      BudgetLimit: {
        Amount: "250",
        Unit: "USD",
      },
      TimePeriod: {
        Start: startOfMonth,
      },
    },
  }),
);
```

If your existing budget uses filters, metrics, auto-adjust, planned limits, or a custom time period, include the fields you want the updated budget to keep.

### Read budget performance history

Use `DescribeBudgetPerformanceHistory` to compare historical budgeted amounts versus actual amounts over time.

```javascript
import {
  BudgetsClient,
  DescribeBudgetPerformanceHistoryCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await budgets.send(
    new DescribeBudgetPerformanceHistoryCommand({
      AccountId: process.env.AWS_ACCOUNT_ID,
      BudgetName: "monthly-cost",
      MaxResults: 12,
      NextToken: nextToken,
    }),
  );

  for (
    const point of page.BudgetPerformanceHistory?.BudgetedAndActualAmountsList ?? []
  ) {
    console.log({
      start: point.TimePeriod?.Start,
      end: point.TimePeriod?.End,
      budgeted: point.BudgetedAmount,
      actual: point.ActualAmount,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

Budget performance history is available for `DAILY`, `MONTHLY`, and `QUARTERLY` budgets. It is not available for `ANNUALLY` budgets.

### Delete a budget

```javascript
import {
  BudgetsClient,
  DeleteBudgetCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await budgets.send(
  new DeleteBudgetCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    BudgetName: "monthly-cost",
  }),
);
```

Deleting a budget also deletes the notifications and subscribers attached to that budget.

## Budget Actions

The Budgets client also supports automated actions through `CreateBudgetAction`, `UpdateBudgetAction`, `DescribeBudgetActionsForBudget`, `DescribeBudgetActionsForAccount`, `DescribeBudgetActionHistories`, and `ExecuteBudgetAction`.

Available action types are:

- `APPLY_IAM_POLICY`
- `APPLY_SCP_POLICY`
- `RUN_SSM_DOCUMENTS`

Available approval models are `AUTOMATIC` and `MANUAL`.

Example: create a manual budget action that can stop EC2 instances through SSM when the forecast reaches 95% of the budget.

```javascript
import {
  BudgetsClient,
  CreateBudgetActionCommand,
  ExecuteBudgetActionCommand,
} from "@aws-sdk/client-budgets";

const budgets = new BudgetsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const createActionResponse = await budgets.send(
  new CreateBudgetActionCommand({
    AccountId: process.env.AWS_ACCOUNT_ID,
    BudgetName: "monthly-cost",
    NotificationType: "FORECASTED",
    ActionType: "RUN_SSM_DOCUMENTS",
    ActionThreshold: {
      ActionThresholdValue: 95,
      ActionThresholdType: "PERCENTAGE",
    },
    Definition: {
      SsmActionDefinition: {
        ActionSubType: "STOP_EC2_INSTANCES",
        Region: process.env.AWS_REGION ?? "us-east-1",
        InstanceIds: ["i-0123456789abcdef0"],
      },
    },
    ExecutionRoleArn:
      "arn:aws:iam::123456789012:role/BudgetsActionExecutionRole",
    ApprovalModel: "MANUAL",
    Subscribers: [
      {
        SubscriptionType: "EMAIL",
        Address: "finops@example.com",
      },
    ],
  }),
);

if (createActionResponse.ActionId) {
  await budgets.send(
    new ExecuteBudgetActionCommand({
      AccountId: process.env.AWS_ACCOUNT_ID,
      BudgetName: "monthly-cost",
      ActionId: createActionResponse.ActionId,
      ExecutionType: "APPROVE_BUDGET_ACTION",
    }),
  );
}
```

## Important Notes

- Set `AccountId` on nearly every request. The API expects the 12-digit AWS account ID, not just credentials on the client.
- Budget names must be unique within the account and cannot contain `:` or `\`, and cannot include the `/action/` substring.
- In `CreateBudget` and `UpdateBudget`, use either `BudgetLimit` or `PlannedBudgetLimits`, not both.
- For modern filtering, prefer `FilterExpression` with `Metrics`. Do not combine `FilterExpression`/`Metrics` with `CostFilters`/`CostTypes` in the same budget definition.
- `DescribeBudgets`, `DescribeNotificationsForBudget`, `DescribeSubscribersForNotification`, `DescribeBudgetPerformanceHistory`, `DescribeBudgetActionHistories`, `DescribeBudgetActionsForAccount`, `DescribeBudgetActionsForBudget`, and `DescribeBudgetNotificationsForAccount` are paginated via `NextToken`.
- If you rely on newer filter expression fields in responses, request them with `ShowFilterExpression: true` on `DescribeBudget` and `DescribeBudgets`.

## Useful Enums and Fields

Common values you will use in budget requests:

- `BudgetType`: `COST`, `USAGE`, `RI_UTILIZATION`, `RI_COVERAGE`, `SAVINGS_PLANS_UTILIZATION`, `SAVINGS_PLANS_COVERAGE`
- `TimeUnit`: `DAILY`, `MONTHLY`, `QUARTERLY`, `ANNUALLY`, `CUSTOM`
- `NotificationType`: `ACTUAL`, `FORECASTED`
- `ThresholdType`: `PERCENTAGE`, `ABSOLUTE_VALUE`
- `SubscriptionType`: `EMAIL`, `SNS`
- `Metrics`: `BlendedCost`, `UnblendedCost`, `AmortizedCost`, `NetUnblendedCost`, `NetAmortizedCost`, `UsageQuantity`, `NormalizedUsageAmount`, `Hours`

When you build `FilterExpression`, supported dimension keys include `LINKED_ACCOUNT`, `LINKED_ACCOUNT_NAME`, `SERVICE`, `SERVICE_CODE`, `REGION`, `USAGE_TYPE`, `RESOURCE_ID`, `TAG_KEY`, and `COST_CATEGORY_NAME`.
