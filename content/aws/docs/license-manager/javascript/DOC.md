---
name: license-manager
description: "AWS License Manager SDK for JavaScript (v3) for creating license configurations, associating them with resources, and tracking consumption"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,license-manager,license-configuration,compliance,operations"
---

# AWS License Manager SDK for JavaScript

Use `@aws-sdk/client-license-manager` to manage AWS License Manager resources from Node.js. The most common infrastructure workflow is to create a license configuration, associate it with a resource such as an AMI, and then inspect associations and license consumption over time.

This guide focuses on license configuration workflows:

- creating a license configuration
- listing and reading configurations
- associating a configuration with a resource
- checking resource associations and consumed licenses

## Installation

```bash
npm install @aws-sdk/client-license-manager
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

Create the client with the AWS region where you want to manage License Manager resources.

```typescript
import { LicenseManagerClient } from "@aws-sdk/client-license-manager";

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you need to pin credentials in code, pass them explicitly:

```typescript
import { LicenseManagerClient } from "@aws-sdk/client-license-manager";

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Create a license configuration

`CreateLicenseConfiguration` defines how License Manager should count and enforce licenses. Supported counting types are `vCPU`, `Instance`, `Core`, and `Socket`.

The `LicenseRules` format is `#name=value`. The valid rule names depend on `LicenseCountingType`.

```typescript
import {
  CreateLicenseConfigurationCommand,
  LicenseManagerClient,
} from "@aws-sdk/client-license-manager";

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await client.send(
  new CreateLicenseConfigurationCommand({
    Name: "sql-server-vcpu-prod",
    Description: "Track SQL Server licenses by vCPU",
    LicenseCountingType: "vCPU",
    LicenseCount: 64,
    LicenseCountHardLimit: true,
    LicenseRules: [
      "#allowedTenancy=EC2-DedicatedHost",
      "#honorVcpuOptimization=True",
      "#minimumVcpus=2",
      "#maximumVcpus=64",
    ],
    DisassociateWhenNotFound: true,
    Tags: [
      { Key: "Environment", Value: "production" },
      { Key: "Application", Value: "sql-server" },
    ],
  }),
);

console.log(response.LicenseConfigurationArn);
```

`LicenseCountHardLimit: true` enables hard enforcement. When the limit is exceeded, AWS blocks new launches that would consume more licenses.

If you use automated discovery, `ProductInformationList` is also available on create and update calls. License Manager documents `SSM_MANAGED` and `RDS` as supported resource types, with different filter names depending on the resource type.

## List and inspect license configurations

Use `ListLicenseConfigurations` to enumerate configurations, then `GetLicenseConfiguration` when you need the full details for one ARN.

```typescript
import {
  GetLicenseConfigurationCommand,
  LicenseManagerClient,
  ListLicenseConfigurationsCommand,
} from "@aws-sdk/client-license-manager";

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken: string | undefined;

do {
  const listResponse = await client.send(
    new ListLicenseConfigurationsCommand({
      NextToken: nextToken,
      MaxResults: 50,
    }),
  );

  for (const config of listResponse.LicenseConfigurations ?? []) {
    console.log({
      arn: config.LicenseConfigurationArn,
      name: config.Name,
      countingType: config.LicenseCountingType,
      consumedLicenses: config.ConsumedLicenses,
      status: config.Status,
    });
  }

  nextToken = listResponse.NextToken;
} while (nextToken);

const licenseConfigurationArn = process.env.AWS_LICENSE_CONFIGURATION_ARN;

if (!licenseConfigurationArn) {
  throw new Error("Set AWS_LICENSE_CONFIGURATION_ARN to inspect one configuration.");
}

const getResponse = await client.send(
  new GetLicenseConfigurationCommand({
    LicenseConfigurationArn: licenseConfigurationArn,
  }),
);

console.dir(
  {
    arn: getResponse.LicenseConfigurationArn,
    name: getResponse.Name,
    description: getResponse.Description,
    rules: getResponse.LicenseRules,
    consumedLicenses: getResponse.ConsumedLicenses,
    summaries: getResponse.ConsumedLicenseSummaryList,
    managedResources: getResponse.ManagedResourceSummaryList,
  },
  { depth: null },
);
```

`ListLicenseConfigurations`, `ListAssociationsForLicenseConfiguration`, `ListLicenseSpecificationsForResource`, and `ListUsageForLicenseConfiguration` are paginated. Always carry `NextToken` forward until it is absent.

## Associate a license configuration with a resource

Use `UpdateLicenseSpecificationsForResource` to add or remove license configuration associations for a resource ARN.

The AWS CLI example for this operation uses an EC2 AMI ARN such as `arn:aws:ec2:us-west-2::image/ami-1234567890abcdef0`.

```bash
export AWS_LICENSE_CONFIGURATION_ARN=arn:aws:license-manager:us-east-1:123456789012:license-configuration:lic-0123456789abcdef0
export AWS_LICENSED_RESOURCE_ARN=arn:aws:ec2:us-east-1::image/ami-0123456789abcdef0
```

```typescript
import {
  LicenseManagerClient,
  ListLicenseSpecificationsForResourceCommand,
  UpdateLicenseSpecificationsForResourceCommand,
} from "@aws-sdk/client-license-manager";

const licenseConfigurationArn = process.env.AWS_LICENSE_CONFIGURATION_ARN;
const resourceArn = process.env.AWS_LICENSED_RESOURCE_ARN;

if (!licenseConfigurationArn || !resourceArn) {
  throw new Error(
    "Set AWS_LICENSE_CONFIGURATION_ARN and AWS_LICENSED_RESOURCE_ARN before running this example.",
  );
}

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new UpdateLicenseSpecificationsForResourceCommand({
    ResourceArn: resourceArn,
    AddLicenseSpecifications: [
      {
        LicenseConfigurationArn: licenseConfigurationArn,
      },
    ],
  }),
);

const verifyResponse = await client.send(
  new ListLicenseSpecificationsForResourceCommand({
    ResourceArn: resourceArn,
  }),
);

console.dir(verifyResponse.LicenseSpecifications, { depth: null });
```

To replace an association, pass the old ARN in `RemoveLicenseSpecifications` and the new ARN in `AddLicenseSpecifications` in the same call.

## Inspect associations and license consumption

Use `ListAssociationsForLicenseConfiguration` to find the resources attached to one configuration, and `ListUsageForLicenseConfiguration` to see the license consumption reported for those resources.

```bash
export AWS_LICENSE_CONFIGURATION_ARN=arn:aws:license-manager:us-east-1:123456789012:license-configuration:lic-0123456789abcdef0
```

```typescript
import {
  LicenseManagerClient,
  ListAssociationsForLicenseConfigurationCommand,
  ListUsageForLicenseConfigurationCommand,
} from "@aws-sdk/client-license-manager";

const licenseConfigurationArn = process.env.AWS_LICENSE_CONFIGURATION_ARN;

if (!licenseConfigurationArn) {
  throw new Error("Set AWS_LICENSE_CONFIGURATION_ARN before running this example.");
}

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const associationsResponse = await client.send(
  new ListAssociationsForLicenseConfigurationCommand({
    LicenseConfigurationArn: licenseConfigurationArn,
    MaxResults: 50,
  }),
);

console.dir(associationsResponse.LicenseConfigurationAssociations, {
  depth: null,
});

const usageResponse = await client.send(
  new ListUsageForLicenseConfigurationCommand({
    LicenseConfigurationArn: licenseConfigurationArn,
    MaxResults: 50,
  }),
);

console.dir(usageResponse.LicenseConfigurationUsageList, {
  depth: null,
});
```

The usage response includes resource ARN, resource type, resource status, association time, owner account ID, and consumed license count for each tracked resource.

## Update or delete a configuration

Use `UpdateLicenseConfiguration` to change the name, description, license rules, count, hard-limit behavior, or automated discovery settings. Use `DeleteLicenseConfiguration` to remove a configuration you no longer need.

```typescript
import {
  DeleteLicenseConfigurationCommand,
  LicenseManagerClient,
  UpdateLicenseConfigurationCommand,
} from "@aws-sdk/client-license-manager";

const licenseConfigurationArn = process.env.AWS_LICENSE_CONFIGURATION_ARN;

if (!licenseConfigurationArn) {
  throw new Error("Set AWS_LICENSE_CONFIGURATION_ARN before running this example.");
}

const client = new LicenseManagerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new UpdateLicenseConfigurationCommand({
    LicenseConfigurationArn: licenseConfigurationArn,
    Description: "Updated description from deployment automation",
    LicenseCount: 96,
    LicenseCountHardLimit: false,
  }),
);

// Later, when you want to remove the configuration entirely:
await client.send(
  new DeleteLicenseConfigurationCommand({
    LicenseConfigurationArn: licenseConfigurationArn,
  }),
);
```

Both operations return no response body on success.

## Important details

- `LicenseRules` must use the `#name=value` format, and the allowed rule names depend on `LicenseCountingType`.
- `licenseAffinityToHost` is expressed in days and accepts values from 1 to 180.
- `allowedTenancy` accepts `EC2-Default`, `EC2-DedicatedHost`, and `EC2-DedicatedInstance`.
- `DisassociateWhenNotFound` causes License Manager to disassociate a resource when the software is no longer found.
- Resource association calls use full ARNs such as a license configuration ARN and resource ARN.
- List operations are paginated; keep following `NextToken` until it is absent.
