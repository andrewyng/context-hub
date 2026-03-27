---
name: wafv2
description: "AWS SDK for JavaScript v3 WAFV2 client for managing Web ACLs, IP sets, and WAF associations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,wafv2,waf,javascript,nodejs,web-acl,ip-set,cloudfront"
---

# `@aws-sdk/client-wafv2`

Use this package for AWS WAF v2 operations in AWS SDK for JavaScript v3. It is the client for listing and inspecting Web ACLs, creating and updating WAF resources, managing IP sets, and associating a regional Web ACL with supported resources.

Prefer `WAFV2Client` plus explicit command imports for new code.

## Install

```bash
npm install @aws-sdk/client-wafv2
```

If you want explicit shared-profile or assume-role helpers instead of the default credential chain:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Configure AWS credentials before creating the client.

```bash
export AWS_REGION="us-west-2"
export AWS_PROFILE="dev"

# or use environment credentials directly
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

WAFv2 has two scopes, and the scope affects the region you must call:

- `REGIONAL`: use the region where the protected resource lives
- `CLOUDFRONT`: use `us-east-1` for all WAF API and SDK calls

If you use the wrong region for `Scope: "CLOUDFRONT"`, calls usually fail or look like the resource does not exist.

## Client Setup

### Minimal Node.js client

```javascript
import { WAFV2Client } from "@aws-sdk/client-wafv2";

function makeWafClient(scope = "REGIONAL") {
  return new WAFV2Client({
    region:
      scope === "CLOUDFRONT"
        ? "us-east-1"
        : (process.env.AWS_REGION ?? "us-west-2"),
  });
}

const regionalWaf = makeWafClient("REGIONAL");
const cloudFrontWaf = makeWafClient("CLOUDFRONT");
```

In Node.js, the default AWS SDK credential provider chain is usually enough if credentials already come from environment variables, shared AWS config files, ECS, EC2 instance metadata, or IAM Identity Center.

### Explicit shared profile

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { WAFV2Client } from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "dev",
  }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetWebACLCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await waf.send(
  new GetWebACLCommand({
    Name: "app-web-acl",
    Scope: "REGIONAL",
    Id: "11111111-2222-3333-4444-555555555555",
  }),
);

console.log(response.WebACL?.ARN);
console.log(response.LockToken);
```

Read operations often return a `LockToken`. Keep that token for the next `update_*` or `delete_*` call on the same object.

## Common Workflows

### List Web ACLs

`ListWebACLsCommand` returns summaries and paginates with `NextMarker`.

```javascript
import {
  ListWebACLsCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

let nextMarker;

do {
  const page = await waf.send(
    new ListWebACLsCommand({
      Scope: "REGIONAL",
      Limit: 100,
      NextMarker: nextMarker,
    }),
  );

  for (const acl of page.WebACLs ?? []) {
    console.log(acl.Name, acl.ARN, acl.Id);
  }

  nextMarker = page.NextMarker;
} while (nextMarker);
```

For CloudFront-scoped ACLs, switch `Scope` to `"CLOUDFRONT"` and create the client in `us-east-1`.

### Create a minimal Web ACL

The smallest useful Web ACL needs a name, scope, default action, and visibility config.

```javascript
import {
  CreateWebACLCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const created = await waf.send(
  new CreateWebACLCommand({
    Name: "app-web-acl",
    Scope: "REGIONAL",
    Description: "Base Web ACL for the app",
    DefaultAction: {
      Allow: {},
    },
    VisibilityConfig: {
      SampledRequestsEnabled: true,
      CloudWatchMetricsEnabled: true,
      MetricName: "appWebAcl",
    },
    Rules: [],
  }),
);

console.log(created.Summary?.ARN);
console.log(created.Summary?.Id);
```

When you later update this Web ACL, retrieve the current definition first and submit the full desired mutable configuration back to WAF, not just the field you want to change.

### Add an address to an existing IP set

WAFv2 updates are optimistic-lock based. Read the current object, keep its `LockToken`, then send the full updated address list.

```javascript
import {
  GetIPSetCommand,
  UpdateIPSetCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const current = await waf.send(
  new GetIPSetCommand({
    Name: "office-allowlist",
    Scope: "REGIONAL",
    Id: "11111111-2222-3333-4444-555555555555",
  }),
);

if (!current.IPSet || !current.LockToken) {
  throw new Error("IP set lookup did not return an IPSet and LockToken.");
}

const updated = await waf.send(
  new UpdateIPSetCommand({
    Name: current.IPSet.Name,
    Scope: "REGIONAL",
    Id: current.IPSet.Id,
    Addresses: [
      ...(current.IPSet.Addresses ?? []),
      "203.0.113.18/32",
    ],
    LockToken: current.LockToken,
  }),
);

console.log(updated.NextLockToken);
```

All IP set addresses must use CIDR notation. WAF supports IPv4 and IPv6 ranges, but not `/0`.

### Associate a Web ACL with a regional resource

Use `AssociateWebACLCommand` for supported regional resources such as an Application Load Balancer or API Gateway stage.

```javascript
import {
  AssociateWebACLCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await waf.send(
  new AssociateWebACLCommand({
    WebACLArn:
      "arn:aws:wafv2:us-west-2:123456789012:regional/webacl/app-web-acl/a1b2c3d4-1111-2222-3333-abcdefabcdef",
    ResourceArn:
      "arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/my-alb/50dc6c495c0c9188",
  }),
);
```

To inspect the current regional association, use `GetWebACLForResourceCommand` with the same `ResourceArn`.

```javascript
import {
  GetWebACLForResourceCommand,
  WAFV2Client,
} from "@aws-sdk/client-wafv2";

const waf = new WAFV2Client({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const current = await waf.send(
  new GetWebACLForResourceCommand({
    ResourceArn:
      "arn:aws:elasticloadbalancing:us-west-2:123456789012:loadbalancer/app/my-alb/50dc6c495c0c9188",
  }),
);

console.log(current.WebACL?.ARN);
```

Do not use `AssociateWebACL` or `GetWebACLForResource` for CloudFront distributions. For CloudFront, AWS directs you to CloudFront `UpdateDistribution` and `GetDistributionConfig`.

## Pitfalls

- `Scope: "CLOUDFRONT"` always uses the `us-east-1` endpoint, even when your distribution serves traffic globally.
- `AssociateWebACLCommand` is for regional resources. CloudFront distributions use the CloudFront API instead.
- `UpdateWebACLCommand` and `UpdateIPSetCommand` replace mutable configuration rather than applying partial patches. Read the current object first.
- Keep `LockToken` values short-lived. If another deployment or console change updates the same object, your old token fails with `WAFOptimisticLockException`.
- After create, update, or association changes, allow for propagation delay. AWS documents temporary inconsistencies and `WAFUnavailableEntityException` during rollout.
- If you query the wrong region or use the wrong scope, the failure often looks like a missing item rather than a configuration mistake.

## When To Reach For Other Packages

- `@aws-sdk/client-cloudfront`: attach or inspect a WAF Web ACL on CloudFront distributions.
- `@aws-sdk/credential-providers`: use `fromIni`, assume-role helpers, IAM Identity Center, or other explicit credential flows.

## Version Notes

- This guide targets `@aws-sdk/client-wafv2` version `3.1007.0`.
- The package exposes the low-level `WAFV2Client` and individual commands; this is the import style to prefer in application code.

## Official Sources

- AWS SDK for JavaScript v3 WAFV2 client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/wafv2/`
- AWS WAF API Reference: `https://docs.aws.amazon.com/waf/latest/APIReference/Welcome.html`
- AWS WAF `ListWebACLs`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_ListWebACLs.html`
- AWS WAF `GetWebACL`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_GetWebACL.html`
- AWS WAF `CreateWebACL`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_CreateWebACL.html`
- AWS WAF `GetIPSet`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_GetIPSet.html`
- AWS WAF `UpdateIPSet`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_UpdateIPSet.html`
- AWS WAF `AssociateWebACL`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_AssociateWebACL.html`
- AWS WAF `GetWebACLForResource`: `https://docs.aws.amazon.com/waf/latest/APIReference/API_GetWebACLForResource.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-wafv2`
