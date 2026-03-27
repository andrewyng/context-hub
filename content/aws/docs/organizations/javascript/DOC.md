---
name: organizations
description: "AWS SDK for JavaScript v3 client for AWS Organizations account, root, OU, and policy APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,organizations,javascript,nodejs,accounts,ou,scp,governance"
---

# `@aws-sdk/client-organizations`

Use this package for AWS Organizations APIs in AWS SDK for JavaScript v3. The most common automation flows are:

- inspect the current organization
- enumerate roots, organizational units, and accounts
- list organization policies such as service control policies
- create organizational units
- move accounts between roots and OUs

This client is usually used from backend or admin automation. `DescribeOrganization` can be called from any account in an organization, but many `List*` APIs require the management account or a delegated administrator. Mutating APIs such as `CreateOrganizationalUnit` and `MoveAccount` require the management account.

## Install

```bash
npm install @aws-sdk/client-organizations
```

## Prerequisites and environment

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-org-admin

export ORG_PARENT_ID=r-example
export ORG_ACCOUNT_ID=123456789012
export ORG_DESTINATION_PARENT_ID=ou-abcd-12345678
export ORG_POLICY_TYPE=SERVICE_CONTROL_POLICY
```

Create the client with the standard AWS SDK v3 credential chain:

```javascript
import { OrganizationsClient } from "@aws-sdk/client-organizations";

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

In Node.js, the default credential provider chain is usually enough if credentials already come from environment variables, shared AWS config files, IAM Identity Center, ECS task roles, or EC2 instance metadata.

For the standard `aws` partition, the Organizations endpoint rules resolve requests to the `us-east-1` endpoint. Setting `AWS_REGION=us-east-1` is the simplest default.

## Common workflows

### Inspect the current organization

Use `DescribeOrganization` to get the organization ID, ARN, feature set, and management account identifiers.

```javascript
import {
  DescribeOrganizationCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await organizations.send(
  new DescribeOrganizationCommand({}),
);

const organization = result.Organization;

if (!organization?.Id) {
  throw new Error("No organization returned");
}

console.log({
  orgId: organization.Id,
  arn: organization.Arn,
  featureSet: organization.FeatureSet,
  managementAccountId: organization.MasterAccountId,
  managementAccountEmail: organization.MasterAccountEmail,
});
```

Do not build new logic around `Organization.AvailablePolicyTypes`. That field is deprecated. Use `ListRoots` to inspect enabled policy types on each root.

### List roots and their enabled policy types

Organizations `List*` APIs use `NextToken` pagination. Keep following `NextToken` until it is `null`, even if a page returns zero results.

```javascript
import {
  ListRootsCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const roots = [];
let nextToken;

do {
  const page = await organizations.send(
    new ListRootsCommand({
      NextToken: nextToken,
      MaxResults: 20,
    }),
  );

  roots.push(...(page.Roots ?? []));
  nextToken = page.NextToken;
} while (nextToken);

for (const root of roots) {
  console.log({
    id: root.Id,
    arn: root.Arn,
    name: root.Name,
    policyTypes: root.PolicyTypes?.map((policyType) => ({
      type: policyType.Type,
      status: policyType.Status,
    })),
  });
}
```

### List all accounts in the organization

Use `ListAccounts` when you need every account in the organization. Prefer `account.State` in new code. AWS states that `account.Status` will be retired on 2026-09-09.

```javascript
import {
  ListAccountsCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const accounts = [];
let nextToken;

do {
  const page = await organizations.send(
    new ListAccountsCommand({
      NextToken: nextToken,
      MaxResults: 20,
    }),
  );

  accounts.push(...(page.Accounts ?? []));
  nextToken = page.NextToken;
} while (nextToken);

for (const account of accounts) {
  console.log({
    id: account.Id,
    name: account.Name,
    email: account.Email,
    state: account.State,
    joinedMethod: account.JoinedMethod,
  });
}
```

### List accounts directly under one root or OU

`ListAccountsForParent` is not recursive. If you pass a root, you only get accounts directly under that root. If you pass an OU, you only get accounts directly inside that OU.

```javascript
import {
  ListAccountsForParentCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const parentId = process.env.ORG_PARENT_ID;

if (!parentId) {
  throw new Error("Missing ORG_PARENT_ID");
}

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const accounts = [];
let nextToken;

do {
  const page = await organizations.send(
    new ListAccountsForParentCommand({
      ParentId: parentId,
      NextToken: nextToken,
      MaxResults: 20,
    }),
  );

  accounts.push(...(page.Accounts ?? []));
  nextToken = page.NextToken;
} while (nextToken);

console.log(accounts.map((account) => ({
  id: account.Id,
  name: account.Name,
  state: account.State,
})));
```

## Create and reorganize OUs

### List child OUs under a root or parent OU

```javascript
import {
  ListOrganizationalUnitsForParentCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const parentId = process.env.ORG_PARENT_ID;

if (!parentId) {
  throw new Error("Missing ORG_PARENT_ID");
}

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const ous = [];
let nextToken;

do {
  const page = await organizations.send(
    new ListOrganizationalUnitsForParentCommand({
      ParentId: parentId,
      NextToken: nextToken,
      MaxResults: 20,
    }),
  );

  ous.push(...(page.OrganizationalUnits ?? []));
  nextToken = page.NextToken;
} while (nextToken);

console.log(ous.map((ou) => ({
  id: ou.Id,
  arn: ou.Arn,
  name: ou.Name,
})));
```

### Create an organizational unit

```javascript
import {
  CreateOrganizationalUnitCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const parentId = process.env.ORG_PARENT_ID;

if (!parentId) {
  throw new Error("Missing ORG_PARENT_ID");
}

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const result = await organizations.send(
  new CreateOrganizationalUnitCommand({
    ParentId: parentId,
    Name: "Sandbox",
  }),
);

console.log({
  ouId: result.OrganizationalUnit?.Id,
  arn: result.OrganizationalUnit?.Arn,
  name: result.OrganizationalUnit?.Name,
});
```

### Move an account to another OU

Use `ListParents` first if you do not already know the source parent ID. In the current Organizations release, a child has only one immediate parent.

```javascript
import {
  ListParentsCommand,
  MoveAccountCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const accountId = process.env.ORG_ACCOUNT_ID;
const destinationParentId = process.env.ORG_DESTINATION_PARENT_ID;

if (!accountId) {
  throw new Error("Missing ORG_ACCOUNT_ID");
}

if (!destinationParentId) {
  throw new Error("Missing ORG_DESTINATION_PARENT_ID");
}

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const parentsResult = await organizations.send(
  new ListParentsCommand({
    ChildId: accountId,
  }),
);

const sourceParentId = parentsResult.Parents?.[0]?.Id;

if (!sourceParentId) {
  throw new Error("Could not determine the current parent for the account");
}

await organizations.send(
  new MoveAccountCommand({
    AccountId: accountId,
    SourceParentId: sourceParentId,
    DestinationParentId: destinationParentId,
  }),
);

console.log({
  accountId,
  sourceParentId,
  destinationParentId,
});
```

## Work with organization policies

Use `ListPolicies` with a required `Filter`. The most common value is `SERVICE_CONTROL_POLICY`.

```javascript
import {
  ListPoliciesCommand,
  OrganizationsClient,
} from "@aws-sdk/client-organizations";

const filter = process.env.ORG_POLICY_TYPE ?? "SERVICE_CONTROL_POLICY";

const organizations = new OrganizationsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const policies = [];
let nextToken;

do {
  const page = await organizations.send(
    new ListPoliciesCommand({
      Filter: filter,
      NextToken: nextToken,
      MaxResults: 20,
    }),
  );

  policies.push(...(page.Policies ?? []));
  nextToken = page.NextToken;
} while (nextToken);

for (const policy of policies) {
  console.log({
    id: policy.Id,
    name: policy.Name,
    type: policy.Type,
    awsManaged: policy.AwsManaged,
    description: policy.Description,
  });
}
```

Verified `Filter` values include `SERVICE_CONTROL_POLICY`, `RESOURCE_CONTROL_POLICY`, `TAG_POLICY`, `BACKUP_POLICY`, `AISERVICES_OPT_OUT_POLICY`, `CHATBOT_POLICY`, `DECLARATIVE_POLICY_EC2`, `SECURITYHUB_POLICY`, `INSPECTOR_POLICY`, `UPGRADE_ROLLOUT_POLICY`, `BEDROCK_POLICY`, `S3_POLICY`, and `NETWORK_SECURITY_DIRECTOR_POLICY`.

## Practical notes

- Keep following `NextToken` until it is `null`. Organizations `List*` APIs can return an empty page and still provide another token.
- Prefer `account.State` over `account.Status`. AWS marks `Status` for retirement on 2026-09-09 in `DescribeAccount`, `ListAccounts`, and `ListAccountsForParent` responses.
- Treat `Organization.AvailablePolicyTypes` as deprecated. Use `ListRoots` to inspect which policy types are enabled on a root.
- ID formats matter: account IDs are 12 digits, root IDs look like `r-...`, and OU IDs look like `ou-...-...`.
- `DescribeOrganization` works from any account in an organization. `ListRoots`, `ListAccounts`, `ListAccountsForParent`, `ListChildren`, `ListParents`, and `ListPolicies` require the management account or a delegated administrator. `MoveAccount` and `CreateOrganizationalUnit` require the management account.
- Expect service errors such as `AWSOrganizationsNotInUseException`, `AccessDeniedException`, `TooManyRequestsException`, `ConcurrentModificationException`, `ParentNotFoundException`, `SourceParentNotFoundException`, `DestinationParentNotFoundException`, and `ConstraintViolationException`.
- If you add tags while creating an OU, the caller also needs `organizations:TagResource` permission.
