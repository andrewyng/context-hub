---
name: service-quotas
description: "AWS Service Quotas SDK for JavaScript (v3) for inspecting quota values, comparing defaults, and requesting increases"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,service-quotas,limits,quota-management,operations"
---

# AWS Service Quotas SDK for JavaScript

Use `@aws-sdk/client-service-quotas` to discover service and quota codes, read the quota currently applied to your account, compare it with the AWS default, submit increase requests for adjustable quotas, and track request history.

The client exposes the AWS Service Quotas API directly, so you work with AWS identifiers such as `serviceCode` and `quotaCode` instead of display names.

## Installation

```bash
npm install @aws-sdk/client-service-quotas
```

These examples assume Node.js 18+ and the standard AWS SDK for JavaScript v3 credential provider chain.

## Credentials and client initialization

Set credentials with environment variables or an AWS profile:

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
export AWS_REGION=us-east-1
export AWS_PROFILE=your-profile
```

Create the client with an explicit region so quota reads and requests are sent to the region you intend to manage.

```typescript
import { ServiceQuotasClient } from "@aws-sdk/client-service-quotas";

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you need to pin credentials in code, pass them explicitly:

```typescript
import { ServiceQuotasClient } from "@aws-sdk/client-service-quotas";

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Discover service codes

Start with `ListServices` when you do not already know the `serviceCode` you need.

```typescript
import {
  ListServicesCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken: string | undefined;

do {
  const response = await client.send(
    new ListServicesCommand({
      NextToken: nextToken,
    }),
  );

  for (const service of response.Services ?? []) {
    console.log(`${service.ServiceCode}\t${service.ServiceName}`);
  }

  nextToken = response.NextToken;
} while (nextToken);
```

Persist the returned `ServiceCode` values in your app configuration. Do not rely on display names.

## List quotas for one AWS service

Use `ListServiceQuotas` to enumerate the applied quota values for a service in the current account and region.

```bash
export AWS_SERVICE_CODE=ec2
```

```typescript
import {
  ListServiceQuotasCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";

const serviceCode = process.env.AWS_SERVICE_CODE;

if (!serviceCode) {
  throw new Error("Set AWS_SERVICE_CODE before running this example.");
}

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken: string | undefined;

do {
  const response = await client.send(
    new ListServiceQuotasCommand({
      ServiceCode: serviceCode,
      NextToken: nextToken,
    }),
  );

  for (const quota of response.Quotas ?? []) {
    console.log({
      quotaCode: quota.QuotaCode,
      quotaName: quota.QuotaName,
      value: quota.Value,
      unit: quota.Unit,
      adjustable: quota.Adjustable,
      globalQuota: quota.GlobalQuota,
    });
  }

  nextToken = response.NextToken;
} while (nextToken);
```

The response tells you whether the quota is adjustable and whether AWS marks it as a global quota. Keep the returned `QuotaCode`; you need it for reads and increase requests.

## Compare your applied quota with the AWS default

Use `GetServiceQuota` for the value currently applied to your account and `GetAWSDefaultServiceQuota` for the AWS default.

```bash
export AWS_SERVICE_CODE=ec2
export AWS_QUOTA_CODE=YOUR_QUOTA_CODE
```

```typescript
import {
  GetAWSDefaultServiceQuotaCommand,
  GetServiceQuotaCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";

const serviceCode = process.env.AWS_SERVICE_CODE;
const quotaCode = process.env.AWS_QUOTA_CODE;

if (!serviceCode || !quotaCode) {
  throw new Error("Set AWS_SERVICE_CODE and AWS_QUOTA_CODE.");
}

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const [appliedResponse, defaultResponse] = await Promise.all([
  client.send(
    new GetServiceQuotaCommand({
      ServiceCode: serviceCode,
      QuotaCode: quotaCode,
    }),
  ),
  client.send(
    new GetAWSDefaultServiceQuotaCommand({
      ServiceCode: serviceCode,
      QuotaCode: quotaCode,
    }),
  ),
]);

console.log({
  applied: appliedResponse.Quota?.Value,
  awsDefault: defaultResponse.Quota?.Value,
  unit: appliedResponse.Quota?.Unit ?? defaultResponse.Quota?.Unit,
  adjustable: appliedResponse.Quota?.Adjustable,
  globalQuota: appliedResponse.Quota?.GlobalQuota,
});
```

Use this comparison before opening an increase request so you can show operators the current limit and the baseline AWS default side by side.

## Request a quota increase

Only call `RequestServiceQuotaIncrease` for quotas that report `Adjustable: true`.

```bash
export AWS_SERVICE_CODE=ec2
export AWS_QUOTA_CODE=YOUR_QUOTA_CODE
export AWS_DESIRED_VALUE=200
```

```typescript
import {
  GetServiceQuotaCommand,
  RequestServiceQuotaIncreaseCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";

const serviceCode = process.env.AWS_SERVICE_CODE;
const quotaCode = process.env.AWS_QUOTA_CODE;
const desiredValue = Number(process.env.AWS_DESIRED_VALUE);

if (!serviceCode || !quotaCode || Number.isNaN(desiredValue)) {
  throw new Error(
    "Set AWS_SERVICE_CODE, AWS_QUOTA_CODE, and AWS_DESIRED_VALUE.",
  );
}

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const current = await client.send(
  new GetServiceQuotaCommand({
    ServiceCode: serviceCode,
    QuotaCode: quotaCode,
  }),
);

if (!current.Quota?.Adjustable) {
  throw new Error("This quota is not adjustable through Service Quotas.");
}

const response = await client.send(
  new RequestServiceQuotaIncreaseCommand({
    ServiceCode: serviceCode,
    QuotaCode: quotaCode,
    DesiredValue: desiredValue,
  }),
);

console.log({
  requestId: response.RequestedQuota?.Id,
  status: response.RequestedQuota?.Status,
  desiredValue: response.RequestedQuota?.DesiredValue,
  created: response.RequestedQuota?.Created,
});
```

Store the returned request ID if you want to fetch that request later with `GetRequestedServiceQuotaChange`.

## Track request status and history

Use `ListRequestedServiceQuotaChangeHistoryByQuota` to list requests for one quota, or `GetRequestedServiceQuotaChange` when you already have a request ID.

```bash
export AWS_SERVICE_CODE=ec2
export AWS_QUOTA_CODE=YOUR_QUOTA_CODE
export AWS_REQUEST_ID=YOUR_REQUEST_ID
```

```typescript
import {
  GetRequestedServiceQuotaChangeCommand,
  ListRequestedServiceQuotaChangeHistoryByQuotaCommand,
  ServiceQuotasClient,
} from "@aws-sdk/client-service-quotas";

const serviceCode = process.env.AWS_SERVICE_CODE;
const quotaCode = process.env.AWS_QUOTA_CODE;
const requestId = process.env.AWS_REQUEST_ID;

if (!serviceCode || !quotaCode) {
  throw new Error("Set AWS_SERVICE_CODE and AWS_QUOTA_CODE.");
}

const client = new ServiceQuotasClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const history = await client.send(
  new ListRequestedServiceQuotaChangeHistoryByQuotaCommand({
    ServiceCode: serviceCode,
    QuotaCode: quotaCode,
  }),
);

console.table(
  (history.RequestedQuotas ?? []).map((request) => ({
    id: request.Id,
    desiredValue: request.DesiredValue,
    status: request.Status,
    created: request.Created,
    lastUpdated: request.LastUpdated,
    caseId: request.CaseId,
  })),
);

if (requestId) {
  const detail = await client.send(
    new GetRequestedServiceQuotaChangeCommand({
      RequestId: requestId,
    }),
  );

  console.dir(detail.RequestedQuota, { depth: null });
}
```

Use the request history endpoint when you need to surface pending versus approved increases in internal tooling without requiring users to open the AWS console.

## Common pitfalls

- Use `serviceCode` and `quotaCode` from the API responses, not copied display names.
- Use `ListServiceQuotas` or `GetServiceQuota` for your account's applied value, and `ListAWSDefaultServiceQuotas` or `GetAWSDefaultServiceQuota` for the AWS default.
- Check `Adjustable` before calling `RequestServiceQuotaIncrease`; not every quota can be changed through this API.
- Handle pagination with `NextToken` for list operations.
- Read `GlobalQuota` from the response instead of assuming every quota is regional.

## Minimal end-to-end flow

If you are wiring this into an app or automation, the normal sequence is:

1. Call `ListServices` once and store the `ServiceCode` you need.
2. Call `ListServiceQuotas` for that service and store the `QuotaCode` values your workflow cares about.
3. Call `GetServiceQuota` and `GetAWSDefaultServiceQuota` when you need to show current versus default limits.
4. Call `RequestServiceQuotaIncrease` only for quotas where `Adjustable` is `true`.
5. Poll `GetRequestedServiceQuotaChange` or list with `ListRequestedServiceQuotaChangeHistoryByQuota` until the request reaches a terminal status.
