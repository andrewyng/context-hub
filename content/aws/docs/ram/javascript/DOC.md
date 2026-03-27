---
name: ram
description: "AWS SDK for JavaScript v3 RAM client for creating, sharing, inspecting, and accepting AWS Resource Access Manager resource shares."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,ram,javascript,nodejs,resource-sharing,organizations"
---

# `@aws-sdk/client-ram`

Use this package to manage AWS Resource Access Manager (RAM) resource shares from JavaScript. Common tasks include creating a resource share, attaching resources and principals, listing shares you own or received from other accounts, accepting invitations, inspecting share permissions, and deleting a share.

Prefer `RAMClient` with explicit command imports.

## Install

```bash
npm install @aws-sdk/client-ram
```

If you want explicit profile or assume-role credential helpers in application code, install the credential providers package too:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Typical local setup:

```bash
export AWS_REGION="us-east-1"
export AWS_PROFILE="dev"
```

Or with direct credentials:

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

In Node.js, the default AWS SDK credential provider chain is usually enough if credentials already come from environment variables, shared AWS config, ECS, EC2 instance metadata, or IAM Identity Center.

If you want to share with an AWS Organization or organizational unit, first enable RAM sharing with Organizations. AWS documents that `EnableSharingWithAwsOrganization` must be called from the organization's management account and that it creates the service-linked role `AWSServiceRoleForResourceAccessManager`.

## Client Setup

### Minimal client

```javascript
import { RAMClient } from "@aws-sdk/client-ram";

const ram = new RAMClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit profile-based credentials

```javascript
import { RAMClient } from "@aws-sdk/client-ram";
import { fromIni } from "@aws-sdk/credential-providers";

const ram = new RAMClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({ profile: process.env.AWS_PROFILE ?? "dev" }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetResourceSharesCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: "us-east-1" });

const response = await ram.send(
  new GetResourceSharesCommand({
    resourceOwner: "SELF",
    maxResults: 25,
  }),
);

console.log(response.resourceShares ?? []);
```

## Common Workflows

### Enable sharing with AWS Organizations

Use this once before sharing with organization or OU principals.

```javascript
import {
  EnableSharingWithAwsOrganizationCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await ram.send(new EnableSharingWithAwsOrganizationCommand({}));
```

### Create a resource share

This example shares an existing resource ARN with one AWS account. If you omit `permissionArns`, RAM attaches the default permission version for each resource type in the share.

```javascript
import { randomUUID } from "node:crypto";
import {
  CreateResourceShareCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const createResponse = await ram.send(
  new CreateResourceShareCommand({
    name: "network-core-share",
    resourceArns: [
      "arn:aws:ec2:us-east-1:123456789012:transit-gateway/tgw-0123456789abcdef0",
    ],
    principals: ["210987654321"],
    allowExternalPrincipals: false,
    tags: [
      { key: "environment", value: "prod" },
      { key: "owner", value: "networking" },
    ],
    clientToken: randomUUID(),
  }),
);

const resourceShareArn = createResponse.resourceShare?.resourceShareArn;
console.log(resourceShareArn);
```

Principals can be AWS account IDs, organization ARNs, OU ARNs, IAM role/user ARNs, or service principal names. AWS notes that not all resource types can be shared with IAM roles and users.

### Add or remove principals and resources on an existing share

Use `AssociateResourceShareCommand` to add resources or principals after creation, and `DisassociateResourceShareCommand` to remove them later.

```javascript
import { randomUUID } from "node:crypto";
import {
  AssociateResourceShareCommand,
  DisassociateResourceShareCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const resourceShareArn = "arn:aws:ram:us-east-1:123456789012:resource-share/rs-12345678";

await ram.send(
  new AssociateResourceShareCommand({
    resourceShareArn,
    principals: ["210987654321"],
    resourceArns: [
      "arn:aws:ec2:us-east-1:123456789012:subnet/subnet-0123456789abcdef0",
    ],
    clientToken: randomUUID(),
  }),
);

await ram.send(
  new DisassociateResourceShareCommand({
    resourceShareArn,
    principals: ["210987654321"],
    clientToken: randomUUID(),
  }),
);
```

### List shares you own or shares other accounts shared with you

`resourceOwner` is required and must be either `SELF` or `OTHER-ACCOUNTS`.

AWS documents an important pagination detail for RAM: paginated operations can return an empty page even when more results still exist. Keep requesting pages until `nextToken` is `null` or absent.

```javascript
import {
  GetResourceSharesCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function listAllResourceShares(resourceOwner) {
  const shares = [];
  let nextToken;

  do {
    const page = await ram.send(
      new GetResourceSharesCommand({
        resourceOwner,
        maxResults: 50,
        nextToken,
      }),
    );

    shares.push(...(page.resourceShares ?? []));
    nextToken = page.nextToken;
  } while (nextToken);

  return shares;
}

const ownedShares = await listAllResourceShares("SELF");
const receivedShares = await listAllResourceShares("OTHER-ACCOUNTS");

console.log({ ownedShares, receivedShares });
```

### Accept or reject a resource share invitation

If another account shares a resource with you through an invitation flow, list invitations first and then accept or reject the one you want.

```javascript
import { randomUUID } from "node:crypto";
import {
  AcceptResourceShareInvitationCommand,
  GetResourceShareInvitationsCommand,
  RAMClient,
  RejectResourceShareInvitationCommand,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const invitationsResponse = await ram.send(
  new GetResourceShareInvitationsCommand({
    maxResults: 50,
  }),
);

const invitation = (invitationsResponse.resourceShareInvitations ?? []).find(
  (item) => item.status === "PENDING",
);

if (!invitation?.resourceShareInvitationArn) {
  throw new Error("No pending RAM invitation found.");
}

const action = "accept";

if (action === "accept") {
  await ram.send(
    new AcceptResourceShareInvitationCommand({
      resourceShareInvitationArn: invitation.resourceShareInvitationArn,
      clientToken: randomUUID(),
    }),
  );
} else {
  await ram.send(
    new RejectResourceShareInvitationCommand({
      resourceShareInvitationArn: invitation.resourceShareInvitationArn,
      clientToken: randomUUID(),
    }),
  );
}
```

Choose the branch that matches your application flow.

### Inspect resources, principals, and permissions for a share

Use these calls when you need to audit what is attached to a share.

```javascript
import {
  ListPrincipalsCommand,
  ListResourceSharePermissionsCommand,
  ListResourcesCommand,
  RAMClient,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const resourceShareArn = "arn:aws:ram:us-east-1:123456789012:resource-share/rs-12345678";

const [resourcesPage, principalsPage, permissionsPage] = await Promise.all([
  ram.send(
    new ListResourcesCommand({
      resourceOwner: "SELF",
      resourceShareArns: [resourceShareArn],
      maxResults: 50,
    }),
  ),
  ram.send(
    new ListPrincipalsCommand({
      resourceOwner: "SELF",
      resourceShareArns: [resourceShareArn],
      maxResults: 50,
    }),
  ),
  ram.send(
    new ListResourceSharePermissionsCommand({
      resourceShareArn,
      maxResults: 50,
    }),
  ),
]);

console.log(resourcesPage.resources ?? []);
console.log(principalsPage.principals ?? []);
console.log(permissionsPage.permissions ?? []);
```

For `ListResourcesCommand`, you can also filter by `resourceType`, `resourceArns`, `principal`, or `resourceRegionScope` (`REGIONAL` or `GLOBAL`).

### Update or delete a share

Use `UpdateResourceShareCommand` to rename a share or change whether external principals are allowed. Use `DeleteResourceShareCommand` to stop sharing through that share. AWS notes that deleting a resource share does not delete the underlying resources.

```javascript
import { randomUUID } from "node:crypto";
import {
  DeleteResourceShareCommand,
  RAMClient,
  UpdateResourceShareCommand,
} from "@aws-sdk/client-ram";

const ram = new RAMClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const resourceShareArn = "arn:aws:ram:us-east-1:123456789012:resource-share/rs-12345678";

await ram.send(
  new UpdateResourceShareCommand({
    resourceShareArn,
    name: "network-core-share-prod",
    allowExternalPrincipals: false,
    clientToken: randomUUID(),
  }),
);

await ram.send(
  new DeleteResourceShareCommand({
    resourceShareArn,
    clientToken: randomUUID(),
  }),
);
```

## RAM-Specific Gotchas

- Continue paginating until `nextToken` is empty or `null`, even if a page returns zero items. AWS RAM explicitly documents this behavior for paginated operations.
- Set `allowExternalPrincipals` explicitly when creating or updating a share. AWS documents that the default is `true`.
- `allowExternalPrincipals: false` only has meaning when your account is part of an AWS Organization.
- If you share with organization or OU principals, call `EnableSharingWithAwsOrganization` first from the organization's management account.
- Reuse a `clientToken` only when retrying the same request with the same parameters. Changing parameters while reusing the token can cause `IdempotentParameterMismatch`.
- If you omit `permissionArns` on `CreateResourceShare`, RAM applies the default permission version for each included resource type.
- Not every resource type supports every principal type. AWS documents that IAM roles and IAM users are not supported for all RAM-shareable resources.
- `DeleteResourceShare` stops the share; it does not delete the underlying resources.

## Related Packages

- `@aws-sdk/credential-providers` for `fromIni`, SSO, and assume-role credential loading.
