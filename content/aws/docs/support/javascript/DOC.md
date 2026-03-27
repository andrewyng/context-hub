---
name: support
description: "AWS Support SDK for JavaScript (v3) for creating and managing AWS Support cases from Node.js"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,support,case-management,troubleshooting,operations"
---

# AWS Support SDK for JavaScript

Use `@aws-sdk/client-support` to create and manage AWS Support cases from JavaScript or Node.js. The same client also exposes the discovery APIs you need before creating a case, including service codes, category codes, severity levels, supported languages, attachments, and case communications.

The AWS Support API requires a Business, Enterprise On-Ramp, or Enterprise Support plan. Accounts without one receive `SubscriptionRequiredException`.

## Installation

```bash
npm install @aws-sdk/client-support
```

These examples assume Node.js 18+ and the standard AWS SDK for JavaScript v3 credential chain.

## Credentials and client initialization

Set credentials with environment variables or an AWS profile:

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
export AWS_REGION=us-east-1
export AWS_PROFILE=your-profile
```

For the standard AWS partition, the Support endpoint resolves to `support.us-east-1.amazonaws.com`, so using `us-east-1` keeps the configuration explicit.

```typescript
import { SupportClient } from "@aws-sdk/client-support";

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## Discover valid service, category, and severity codes

Do not guess `serviceCode`, `categoryCode`, or `severityCode`. Fetch them from the Support API and use the returned codes in `CreateCase`.

```typescript
import {
  DescribeServicesCommand,
  DescribeSeverityLevelsCommand,
  SupportClient,
} from "@aws-sdk/client-support";

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const servicesResponse = await client.send(
  new DescribeServicesCommand({ language: "en" }),
);

const severityResponse = await client.send(
  new DescribeSeverityLevelsCommand({ language: "en" }),
);

console.dir(
  servicesResponse.services?.map((service) => ({
    code: service.code,
    name: service.name,
    categories: service.categories?.map((category) => ({
      code: category.code,
      name: category.name,
    })),
  })),
  { depth: null },
);

console.dir(
  severityResponse.severityLevels?.map((level) => ({
    code: level.code,
    name: level.name,
  })),
  { depth: null },
);
```

The severity codes are `low`, `normal`, `high`, `urgent`, and `critical`, but the levels available to your account depend on your support plan.

## Check supported languages and case options

Use `DescribeSupportedLanguagesCommand` to confirm the languages available for a specific service and category. Use `DescribeCreateCaseOptionsCommand` if you need language availability and communication type options for that exact combination.

```bash
export AWS_SUPPORT_SERVICE_CODE=YOUR_SERVICE_CODE
export AWS_SUPPORT_CATEGORY_CODE=YOUR_CATEGORY_CODE
```

```typescript
import {
  DescribeCreateCaseOptionsCommand,
  DescribeSupportedLanguagesCommand,
  SupportClient,
} from "@aws-sdk/client-support";

const serviceCode = process.env.AWS_SUPPORT_SERVICE_CODE;
const categoryCode = process.env.AWS_SUPPORT_CATEGORY_CODE;

if (!serviceCode || !categoryCode) {
  throw new Error("Set AWS_SUPPORT_SERVICE_CODE and AWS_SUPPORT_CATEGORY_CODE.");
}

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const supportedLanguages = await client.send(
  new DescribeSupportedLanguagesCommand({
    issueType: "technical",
    serviceCode,
    categoryCode,
  }),
);

const createCaseOptions = await client.send(
  new DescribeCreateCaseOptionsCommand({
    issueType: "technical",
    serviceCode,
    categoryCode,
    language: "en",
  }),
);

console.dir(supportedLanguages.supportedLanguages, { depth: null });
console.log(createCaseOptions.languageAvailability);
console.dir(createCaseOptions.communicationTypes, { depth: null });
```

Supported case languages are ISO 639-1 codes. AWS Support documents `en`, `zh`, `ja`, and `ko`.

## Create a support case

First discover the codes you want to use, then pass those exact values into `CreateCaseCommand`.

```bash
export AWS_SUPPORT_SERVICE_CODE=YOUR_SERVICE_CODE
export AWS_SUPPORT_CATEGORY_CODE=YOUR_CATEGORY_CODE
export AWS_SUPPORT_SEVERITY_CODE=YOUR_SEVERITY_CODE
```

```typescript
import { CreateCaseCommand, SupportClient } from "@aws-sdk/client-support";

const serviceCode = process.env.AWS_SUPPORT_SERVICE_CODE;
const categoryCode = process.env.AWS_SUPPORT_CATEGORY_CODE;
const severityCode = process.env.AWS_SUPPORT_SEVERITY_CODE;

if (!serviceCode || !categoryCode || !severityCode) {
  throw new Error(
    "Set AWS_SUPPORT_SERVICE_CODE, AWS_SUPPORT_CATEGORY_CODE, and AWS_SUPPORT_SEVERITY_CODE.",
  );
}

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new CreateCaseCommand({
    subject: "Production API returns intermittent 5xx",
    serviceCode,
    categoryCode,
    severityCode,
    communicationBody: [
      "Impact: 12% of requests fail.",
      "Start time: 2026-03-13T14:10:00Z.",
      "Primary region: us-east-1.",
      "Recent change: deployed build 2026.03.13.1.",
    ].join("\n"),
    issueType: "technical",
    language: "en",
    ccEmailAddresses: ["oncall@example.com"],
  }),
);

console.log(response.caseId);
```

`CreateCase` does not support service limit increase requests. Use the Support Center UI or Service Quotas for those workflows.

## Add attachments

Attachments are uploaded to a temporary attachment set, then attached to a new case or a follow-up communication. Attachment sets expire after 1 hour. You can add up to three attachments per set, and each attachment is limited to 5 MB.

```typescript
import {
  AddAttachmentsToSetCommand,
  CreateCaseCommand,
  SupportClient,
} from "@aws-sdk/client-support";
import { readFile } from "node:fs/promises";

const serviceCode = process.env.AWS_SUPPORT_SERVICE_CODE;
const categoryCode = process.env.AWS_SUPPORT_CATEGORY_CODE;
const severityCode = process.env.AWS_SUPPORT_SEVERITY_CODE;

if (!serviceCode || !categoryCode || !severityCode) {
  throw new Error(
    "Set AWS_SUPPORT_SERVICE_CODE, AWS_SUPPORT_CATEGORY_CODE, and AWS_SUPPORT_SEVERITY_CODE.",
  );
}

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const screenshot = await readFile("./support-screenshot.png");

const attachmentSet = await client.send(
  new AddAttachmentsToSetCommand({
    attachments: [
      {
        fileName: "support-screenshot.png",
        data: screenshot,
      },
    ],
  }),
);

const createdCase = await client.send(
  new CreateCaseCommand({
    subject: "Production API returns intermittent 5xx",
    serviceCode,
    categoryCode,
    severityCode,
    communicationBody: "Attached a screenshot and example request IDs.",
    issueType: "technical",
    language: "en",
    attachmentSetId: attachmentSet.attachmentSetId,
  }),
);

console.log({
  caseId: createdCase.caseId,
  attachmentSetId: attachmentSet.attachmentSetId,
  expiryTime: attachmentSet.expiryTime,
});
```

## Add a follow-up communication to an existing case

```bash
export AWS_SUPPORT_CASE_ID=YOUR_CASE_ID
```

```typescript
import {
  AddCommunicationToCaseCommand,
  SupportClient,
} from "@aws-sdk/client-support";

const caseId = process.env.AWS_SUPPORT_CASE_ID;

if (!caseId) {
  throw new Error("Set AWS_SUPPORT_CASE_ID.");
}

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new AddCommunicationToCaseCommand({
    caseId,
    communicationBody: [
      "New details:",
      "- Example request ID: 1234567890abcdef",
      "- Issue still reproduces after rollback",
      "- Attached logs in the previous update",
    ].join("\n"),
    ccEmailAddresses: ["oncall@example.com"],
  }),
);

console.log(response.result);
```

If you want to attach files to the follow-up message, call `AddAttachmentsToSetCommand` first and pass the returned `attachmentSetId` into `AddCommunicationToCaseCommand`.

## List cases and read case communications

`DescribeCasesCommand` returns case details and paginates with `nextToken`. Case data is available for 12 months after creation.

```typescript
import {
  DescribeCasesCommand,
  DescribeCommunicationsCommand,
  SupportClient,
} from "@aws-sdk/client-support";

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const casesResponse = await client.send(
  new DescribeCasesCommand({
    includeResolvedCases: false,
    includeCommunications: true,
    language: "en",
    maxResults: 20,
  }),
);

for (const supportCase of casesResponse.cases ?? []) {
  console.log({
    caseId: supportCase.caseId,
    displayId: supportCase.displayId,
    status: supportCase.status,
    subject: supportCase.subject,
    serviceCode: supportCase.serviceCode,
    recentCommunicationCount:
      supportCase.recentCommunications?.communications?.length ?? 0,
  });
}

const caseId = process.env.AWS_SUPPORT_CASE_ID;

if (caseId) {
  const communicationsResponse = await client.send(
    new DescribeCommunicationsCommand({
      caseId,
      maxResults: 20,
    }),
  );

  console.dir(communicationsResponse.communications, { depth: null });
}
```

## Resolve a case

```typescript
import { ResolveCaseCommand, SupportClient } from "@aws-sdk/client-support";

const caseId = process.env.AWS_SUPPORT_CASE_ID;

if (!caseId) {
  throw new Error("Set AWS_SUPPORT_CASE_ID.");
}

const client = new SupportClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new ResolveCaseCommand({
    caseId,
  }),
);

console.log({
  initialCaseStatus: response.initialCaseStatus,
  finalCaseStatus: response.finalCaseStatus,
});
```

## Important details

- The Support API is only available for Business, Enterprise On-Ramp, and Enterprise Support plans.
- Use `DescribeServices` and `DescribeSeverityLevels` to get the exact codes for `CreateCase`; console labels and API codes do not always match.
- `CreateCase` does not support service limit increase requests.
- Attachment sets expire after 1 hour, allow up to three attachments, and each attachment is limited to 5 MB.
- `DescribeCases` and `DescribeCommunications` return paginated results with `nextToken`.
- Case data and communications are only available for 12 months after creation.
