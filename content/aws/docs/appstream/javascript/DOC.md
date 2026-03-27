---
name: appstream
description: "AWS SDK for JavaScript v3 client for managing Amazon AppStream 2.0 / WorkSpaces Applications stacks, fleets, users, sessions, and streaming URLs"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,appstream,workspaces-applications,streaming,iam"
---

# AWS AppStream SDK for JavaScript (v3)

Use `@aws-sdk/client-appstream` to manage Amazon AppStream 2.0 resources from JavaScript or TypeScript. In current AWS documentation, parts of the service are also branded as WorkSpaces Applications, but the SDK package, client name, and API namespace remain `appstream`.

This is the control-plane client. Typical tasks include listing stacks and fleets, creating temporary streaming URLs, inspecting active sessions, managing user-pool users, and associating users with stacks.

## Golden Rules

- Install `@aws-sdk/client-appstream`, not the legacy `aws-sdk` v2 package.
- Set `region` explicitly or provide it through standard AWS SDK configuration before creating `AppStreamClient`.
- `CreateStreamingURLCommand` returns a short-lived URL for one stack, one fleet, and one user. Set `Validity` explicitly if the default 60-second lifetime is too short.
- User-management APIs such as `CreateUserCommand`, `DescribeUsersCommand`, `EnableUserCommand`, and `DisableUserCommand` require `AuthenticationType: "USERPOOL"`.
- AppStream user email addresses are case-sensitive in user-management and user-stack association APIs.
- `DescribeSessionsCommand` requires both `UserId` and `AuthenticationType` when you filter sessions for a specific user.
- `BatchAssociateUserStackCommand` can return per-association errors in `errors`, so inspect the response even when the request succeeds.

## Install

```bash
npm install @aws-sdk/client-appstream
```

## Prerequisites

AppStream is regional. Configure credentials and a region before making calls.

Typical local setup:

```bash
aws configure
export AWS_REGION="us-west-2"
```

Or set credentials directly:

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional, only for temporary credentials
export AWS_REGION="us-west-2"
```

If you use shared config or named profiles locally, `AWS_PROFILE` also works with the standard AWS SDK credential chain.

## Client Setup

```javascript
import { AppStreamClient } from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

If you need to provide credentials in code:

```javascript
import { AppStreamClient } from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  AppStreamClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await appstream.send(
  new DescribeStacksCommand({
    Names: ["engineering-stack"],
  }),
);

console.log(response.Stacks?.[0]);
```

## Common Workflows

### List fleets

`DescribeFleetsCommand` returns all fleets when you omit `Names`.

```javascript
import {
  AppStreamClient,
  DescribeFleetsCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

let nextToken;

do {
  const page = await appstream.send(
    new DescribeFleetsCommand({
      NextToken: nextToken,
    }),
  );

  for (const fleet of page.Fleets ?? []) {
    console.log({
      name: fleet.Name,
      state: fleet.State,
      fleetType: fleet.FleetType,
      instanceType: fleet.InstanceType,
      maxConcurrentSessions: fleet.MaxConcurrentSessions,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

### List stacks

`DescribeStacksCommand` also paginates with `NextToken`.

```javascript
import {
  AppStreamClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

let nextToken;

do {
  const page = await appstream.send(
    new DescribeStacksCommand({
      NextToken: nextToken,
    }),
  );

  for (const stack of page.Stacks ?? []) {
    console.log({
      name: stack.Name,
      displayName: stack.DisplayName,
      redirectUrl: stack.RedirectURL,
      feedbackUrl: stack.FeedbackURL,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

### Create a temporary streaming URL

Use `CreateStreamingURLCommand` when you need a temporary session URL for a specific user. AWS documents `Validity` as 1 to 604800 seconds, with a default of 60 seconds.

```javascript
import {
  AppStreamClient,
  CreateStreamingURLCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

const response = await appstream.send(
  new CreateStreamingURLCommand({
    StackName: "engineering-stack",
    FleetName: "engineering-fleet",
    UserId: "developer@example.com",
    ApplicationId: "Visual Studio Code",
    Validity: 300,
    SessionContext: JSON.stringify({
      ticketId: "INC-1234",
      launchedBy: "admin-console",
    }),
  }),
);

console.log(response.StreamingURL);
console.log(response.Expires);
```

`StreamingURL` is the one-time launch URL. `Expires` tells you when the URL becomes invalid.

### Inspect sessions and expire one

Use `DescribeSessionsCommand` to inspect active or pending sessions for a stack and fleet. Stack and fleet names are case-sensitive here.

```javascript
import {
  AppStreamClient,
  DescribeSessionsCommand,
  ExpireSessionCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

const listed = await appstream.send(
  new DescribeSessionsCommand({
    StackName: "engineering-stack",
    FleetName: "engineering-fleet",
    UserId: "developer@example.com",
    AuthenticationType: "API",
    Limit: 20,
  }),
);

for (const session of listed.Sessions ?? []) {
  console.log({
    id: session.Id,
    userId: session.UserId,
    state: session.State,
    connectionState: session.ConnectionState,
    instanceId: session.InstanceId,
  });
}

const activeSession = listed.Sessions?.find((session) => session.State === "ACTIVE");

if (activeSession?.Id) {
  await appstream.send(
    new ExpireSessionCommand({
      SessionId: activeSession.Id,
    }),
  );
}
```

If you omit `AuthenticationType`, AWS defaults session lookup to streaming-URL users (`API`). If you send `UserId`, also send `AuthenticationType`.

### Create and list user-pool users

Use `CreateUserCommand` and `DescribeUsersCommand` only with `AuthenticationType: "USERPOOL"`.

```javascript
import {
  AppStreamClient,
  CreateUserCommand,
  DescribeUsersCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

await appstream.send(
  new CreateUserCommand({
    UserName: "alex@example.com",
    AuthenticationType: "USERPOOL",
    FirstName: "Alex",
    LastName: "Rivera",
    MessageAction: "SUPPRESS",
  }),
);

let nextToken;

do {
  const page = await appstream.send(
    new DescribeUsersCommand({
      AuthenticationType: "USERPOOL",
      MaxResults: 25,
      NextToken: nextToken,
    }),
  );

  for (const user of page.Users ?? []) {
    console.log({
      userName: user.UserName,
      enabled: user.Enabled,
      status: user.Status,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

AWS documents user email addresses as case-sensitive. Use the same capitalization consistently when you create users, enable or disable them, and associate them with stacks.

### Associate a user with a stack

Use `BatchAssociateUserStackCommand` to map one or more users to one or more stacks. AWS documents that users in a user pool cannot be assigned to stacks with fleets that are joined to an Active Directory domain.

```javascript
import {
  AppStreamClient,
  BatchAssociateUserStackCommand,
  DescribeUserStackAssociationsCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

const associated = await appstream.send(
  new BatchAssociateUserStackCommand({
    UserStackAssociations: [
      {
        StackName: "engineering-stack",
        UserName: "alex@example.com",
        AuthenticationType: "USERPOOL",
        SendEmailNotification: false,
      },
    ],
  }),
);

if ((associated.errors ?? []).length > 0) {
  console.error(associated.errors);
}

const result = await appstream.send(
  new DescribeUserStackAssociationsCommand({
    UserName: "alex@example.com",
    AuthenticationType: "USERPOOL",
    MaxResults: 25,
  }),
);

for (const association of result.UserStackAssociations ?? []) {
  console.log(association.StackName, association.UserName);
}
```

### Temporarily disable and re-enable a user

`DisableUserCommand` blocks sign-in without deleting the user. `EnableUserCommand` restores access.

```javascript
import {
  AppStreamClient,
  DisableUserCommand,
  EnableUserCommand,
} from "@aws-sdk/client-appstream";

const appstream = new AppStreamClient({ region: "us-west-2" });

await appstream.send(
  new DisableUserCommand({
    UserName: "alex@example.com",
    AuthenticationType: "USERPOOL",
  }),
);

await appstream.send(
  new EnableUserCommand({
    UserName: "alex@example.com",
    AuthenticationType: "USERPOOL",
  }),
);
```

## Common Pitfalls

- AWS documentation now mixes AppStream and WorkSpaces Applications terminology. The JavaScript package name and client are still `@aws-sdk/client-appstream` and `AppStreamClient`.
- AppStream pagination is not fully uniform. `DescribeSessionsCommand` uses `Limit`, while `DescribeUsersCommand` and `DescribeUserStackAssociationsCommand` use `MaxResults`.
- `DescribeFleetsCommand` and `DescribeStacksCommand` page with `NextToken` but do not expose a page-size parameter in the service model.
- `CreateStreamingURLCommand` defaults to a 60-second URL lifetime. Set `Validity` explicitly if another service or person will open the link.
- `BatchAssociateUserStackCommand` may return item-level failures in `errors` such as `STACK_NOT_FOUND` or `USER_NAME_NOT_FOUND`.
- User email addresses are case-sensitive. A mismatched email casing can break create, lookup, enable, disable, and association flows.
- Do not hardcode credentials in code. Prefer environment variables, shared AWS config, IAM Identity Center, or runtime IAM roles.

## Version Notes For `3.1007.0`

- This guide targets the modular AWS SDK for JavaScript v3 package `@aws-sdk/client-appstream`.
- The current AWS documentation for this client still points to the AppStream namespace even where the service documentation uses WorkSpaces Applications branding.
- The examples here use command-based imports and `client.send(...)`, which is the standard v3 usage pattern.

## Official Sources

- AWS SDK for JavaScript v3 AppStream client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/appstream/`
- Amazon AppStream 2.0 API Reference: `https://docs.aws.amazon.com/appstream2/latest/APIReference/Welcome.html`
- `CreateStreamingURL` API: `https://docs.aws.amazon.com/appstream2/latest/APIReference/API_CreateStreamingURL.html`
- `DescribeSessions` API: `https://docs.aws.amazon.com/appstream2/latest/APIReference/API_DescribeSessions.html`
- `CreateUser` API: `https://docs.aws.amazon.com/appstream2/latest/APIReference/API_CreateUser.html`
- `BatchAssociateUserStack` API: `https://docs.aws.amazon.com/appstream2/latest/APIReference/API_BatchAssociateUserStack.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS SDK for JavaScript v3 region configuration: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html`
