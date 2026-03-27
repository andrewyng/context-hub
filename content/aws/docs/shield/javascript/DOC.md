---
name: shield
description: "AWS SDK for JavaScript v3 client for AWS Shield Advanced protections, attack details, protection groups, and proactive engagement settings."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,shield,javascript,nodejs,security,ddos,shield-advanced"
---

# `@aws-sdk/client-shield`

Use this package to manage AWS Shield Advanced from JavaScript with AWS SDK v3. The practical flow is: confirm the account has an active Shield Advanced subscription, create protections for specific resource ARNs, optionally attach Route 53 health checks or proactive engagement contacts, and then use attack and protection APIs to inspect status over time.

This package is for Shield Advanced, not the always-on Shield Standard protection that AWS applies automatically.

## Install

```bash
npm install @aws-sdk/client-shield
```

## Prerequisites

You need AWS credentials that can call Shield Advanced APIs in the target account. Common prerequisites:

- an active Shield Advanced subscription for the account
- permission to manage the target protected resource ARN
- a Route 53 health check ARN if you want health-based detection
- an associated WAF v2 web ACL if you want automatic application layer mitigation on a supported resource

Typical local setup in Node.js:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

If you use shared AWS config, set `AWS_PROFILE` before starting your app.

## Initialize the client

```javascript
import { ShieldClient } from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, AWS SDK v3 uses the default credential provider chain, so you usually do not need to pass credentials explicitly when environment variables, shared config, ECS, EC2, or IAM Identity Center are already configured.

## Confirm the Shield Advanced subscription

Before creating protections, check whether the account subscription is active and inspect the current subscription limits.

```javascript
import {
  DescribeSubscriptionCommand,
  GetSubscriptionStateCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function assertShieldAdvancedIsActive() {
  const state = await shield.send(new GetSubscriptionStateCommand({}));

  if (state.SubscriptionState !== "ACTIVE") {
    throw new Error("Shield Advanced subscription is not active for this account");
  }

  const details = await shield.send(new DescribeSubscriptionCommand({}));

  console.log({
    proactiveEngagementStatus: details.Subscription?.ProactiveEngagementStatus,
    subscriptionArn: details.Subscription?.SubscriptionArn,
    autoRenew: details.Subscription?.AutoRenew,
    protectionLimits: details.Subscription?.SubscriptionLimits?.ProtectionLimits,
  });
}
```

`CreateSubscriptionCommand` exists, but Shield Advanced subscription management is an account-level billing decision and `DeleteSubscription` has a one-year subscription commitment. Most application code should verify subscription state rather than creating or deleting the subscription itself.

## Create a protection for one resource

`CreateProtection` enables Shield Advanced for a single AWS resource ARN per request.

Supported resource types include:

- CloudFront distributions
- Route 53 hosted zones
- Global Accelerator standard accelerators
- Elastic IP allocations
- Classic Load Balancers
- Application Load Balancers

Shield Advanced does not create a protection directly for EC2 instances or Network Load Balancers. AWS documents protecting those through associated Elastic IP addresses.

```javascript
import {
  CreateProtectionCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function protectApplicationLoadBalancer(resourceArn) {
  const response = await shield.send(
    new CreateProtectionCommand({
      Name: "app-prod-alb",
      ResourceArn: resourceArn,
      Tags: [
        { Key: "Environment", Value: "prod" },
        { Key: "Service", Value: "app" },
      ],
    }),
  );

  if (!response.ProtectionId) {
    throw new Error("Shield did not return a protection ID");
  }

  return response.ProtectionId;
}
```

## List protections and inspect one

Use `ListProtections` for discovery, then `DescribeProtection` when you need one full protection record. `DescribeProtection` accepts either `ProtectionId` or `ResourceArn`, but not both.

```javascript
import {
  DescribeProtectionCommand,
  ListProtectionsCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function inspectAlbProtections() {
  const listed = await shield.send(
    new ListProtectionsCommand({
      MaxResults: 20,
      InclusionFilters: {
        ResourceTypes: ["APPLICATION_LOAD_BALANCER"],
      },
    }),
  );

  for (const protection of listed.Protections ?? []) {
    console.log({
      id: protection.Id,
      name: protection.Name,
      resourceArn: protection.ResourceArn,
      healthCheckIds: protection.HealthCheckIds,
      applicationLayerAutomaticResponseConfiguration:
        protection.ApplicationLayerAutomaticResponseConfiguration,
    });
  }

  const firstArn = listed.Protections?.[0]?.ResourceArn;

  if (!firstArn) {
    return null;
  }

  return shield.send(
    new DescribeProtectionCommand({
      ResourceArn: firstArn,
    }),
  );
}
```

If you need every protection, keep following `NextToken` until it is absent.

## Add or remove health-based detection

Health-based detection uses a Route 53 health check to improve Shield Advanced attack detection and response for a protected resource.

```javascript
import {
  AssociateHealthCheckCommand,
  DisassociateHealthCheckCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function setHealthCheck(protectionId, healthCheckArn, enabled) {
  if (enabled) {
    await shield.send(
      new AssociateHealthCheckCommand({
        ProtectionId: protectionId,
        HealthCheckArn: healthCheckArn,
      }),
    );

    return;
  }

  await shield.send(
    new DisassociateHealthCheckCommand({
      ProtectionId: protectionId,
      HealthCheckArn: healthCheckArn,
    }),
  );
}
```

Pass the Route 53 health check ARN, not just a health check ID.

## List recent attacks and inspect one

Use `ListAttacks` to retrieve attack summaries for a time window. Then call `DescribeAttack` with the `AttackId` when you need the detailed counters, properties, mitigations, and sub-resource information.

```javascript
import {
  DescribeAttackCommand,
  ListAttacksCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function getRecentAttacks(resourceArn) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const listed = await shield.send(
    new ListAttacksCommand({
      ResourceArns: [resourceArn],
      StartTime: {
        FromInclusive: sevenDaysAgo,
      },
      MaxResults: 20,
    }),
  );

  const summaries = (listed.AttackSummaries ?? []).map((attack) => ({
    attackId: attack.AttackId,
    resourceArn: attack.ResourceArn,
    startTime: attack.StartTime,
    endTime: attack.EndTime,
    vectors: (attack.AttackVectors ?? []).map((vector) => vector.VectorType),
  }));

  const firstAttackId = listed.AttackSummaries?.[0]?.AttackId;

  if (!firstAttackId) {
    return { summaries, details: null };
  }

  const details = await shield.send(
    new DescribeAttackCommand({
      AttackId: firstAttackId,
    }),
  );

  return { summaries, details: details.Attack };
}
```

`StartTime` and `EndTime` use time-range objects with `FromInclusive` and `ToExclusive` fields.

## Create and inspect a protection group

Protection groups let Shield Advanced treat multiple protected resources as a collective. For explicit membership, use `Pattern: "ARBITRARY"` and pass the protected resource ARNs in `Members`.

```javascript
import {
  CreateProtectionGroupCommand,
  ListResourcesInProtectionGroupCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createProtectionGroup(memberArns) {
  await shield.send(
    new CreateProtectionGroupCommand({
      ProtectionGroupId: "public-edge",
      Aggregation: "SUM",
      Pattern: "ARBITRARY",
      Members: memberArns,
    }),
  );

  const members = await shield.send(
    new ListResourcesInProtectionGroupCommand({
      ProtectionGroupId: "public-edge",
      MaxResults: 50,
    }),
  );

  return members.ResourceArns ?? [];
}
```

If you later change the group definition, use `UpdateProtectionGroupCommand` with the same `ProtectionGroupId`.

## Configure proactive engagement contacts

The Shield Response Team can use proactive engagement contacts for escalations and proactive support. Initialize the contact list first, then enable proactive engagement.

```javascript
import {
  AssociateProactiveEngagementDetailsCommand,
  EnableProactiveEngagementCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function enableProactiveContacts() {
  await shield.send(
    new AssociateProactiveEngagementDetailsCommand({
      EmergencyContactList: [
        {
          EmailAddress: "secops@example.com",
          PhoneNumber: "+1-206-555-0100",
          ContactNotes: "24x7 security on-call rotation",
        },
      ],
    }),
  );

  await shield.send(new EnableProactiveEngagementCommand({}));
}
```

The contact list must include at least one phone number. If you already have contacts configured and want to keep them, read them first with `DescribeEmergencyContactSettingsCommand` and then send the full updated list.

## Enable automatic application layer mitigation

Shield Advanced can manage WAF rules automatically for supported resources. AWS documents this for CloudFront distributions and Application Load Balancers only.

```javascript
import {
  EnableApplicationLayerAutomaticResponseCommand,
  ShieldClient,
  UpdateApplicationLayerAutomaticResponseCommand,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function enableAutomaticMitigation(resourceArn) {
  await shield.send(
    new EnableApplicationLayerAutomaticResponseCommand({
      ResourceArn: resourceArn,
      Action: {
        Block: {},
      },
    }),
  );
}

export async function switchAutomaticMitigationToCount(resourceArn) {
  await shield.send(
    new UpdateApplicationLayerAutomaticResponseCommand({
      ResourceArn: resourceArn,
      Action: {
        Count: {},
      },
    }),
  );
}
```

This requires a WAF v2 web ACL already associated with the protected resource. When automatic mitigation is already enabled, update it with `UpdateApplicationLayerAutomaticResponseCommand` instead of calling the enable operation again.

## Delete a protection

Deleting a protection removes Shield Advanced coverage from that one resource. It does not cancel the account subscription.

```javascript
import {
  DeleteProtectionCommand,
  ShieldClient,
} from "@aws-sdk/client-shield";

const shield = new ShieldClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function deleteProtection(protectionId) {
  await shield.send(
    new DeleteProtectionCommand({
      ProtectionId: protectionId,
    }),
  );
}
```

## Pitfalls

- This package is for Shield Advanced APIs. It does not enable or configure the baseline Shield Standard coverage that AWS applies automatically.
- `CreateProtectionCommand` covers one resource per request.
- `DescribeProtectionCommand` accepts either `ProtectionId` or `ResourceArn`, but not both.
- Shield Advanced protects EC2 instances and Network Load Balancers through associated Elastic IP addresses rather than direct protection creation for those resource types.
- Health-based detection requires a Route 53 health check ARN.
- Automatic application layer mitigation works only for CloudFront distributions and Application Load Balancers, and it requires an associated WAF v2 web ACL.
- List operations such as `ListProtectionsCommand`, `ListAttacksCommand`, `ListProtectionGroupsCommand`, and `ListResourcesInProtectionGroupCommand` can paginate through `NextToken`.
- `DeleteSubscriptionCommand` is separate from deleting an individual protection, and AWS documents a one-year Shield Advanced subscription commitment.

## Version Notes

- This guide targets `@aws-sdk/client-shield` version `3.1007.0`.
- Prefer `ShieldClient` plus explicit command imports in application code.

## Official Sources

- AWS SDK for JavaScript v3 Shield client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/shield/`
- AWS Shield Advanced API Reference: `https://docs.aws.amazon.com/waf/latest/DDOSAPIReference/Welcome.html`
- Shield Advanced getting started: `https://docs.aws.amazon.com/waf/latest/developerguide/getting-started-ddos.html`
- Adding Shield Advanced protection to AWS resources: `https://docs.aws.amazon.com/waf/latest/developerguide/configure-new-protection.html`
- Shield Advanced health-based detection: `https://docs.aws.amazon.com/waf/latest/developerguide/ddos-overview.html#ddos-advanced-health-check-option`
- Shield Advanced automatic application layer DDoS mitigation: `https://docs.aws.amazon.com/waf/latest/developerguide/ddos-advanced-automatic-app-layer-response.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-shield`
