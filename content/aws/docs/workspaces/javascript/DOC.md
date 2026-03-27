---
name: workspaces
description: "AWS SDK for JavaScript v3 client for Amazon WorkSpaces directories, bundles, workspace lifecycle, and connection-status management"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,workspaces,javascript,nodejs,v3,desktop,virtual-desktop"
---

# `@aws-sdk/client-workspaces`

Use this package to manage Amazon WorkSpaces from JavaScript or TypeScript with AWS SDK v3. It covers the WorkSpaces control plane: listing directories and bundles, creating WorkSpaces, reading state, changing running mode, and starting, stopping, rebooting, or terminating desktops.

This is an infrastructure and admin client. It is not the end-user desktop application and it does not establish an interactive WorkSpaces session.

## Install

```bash
npm install @aws-sdk/client-workspaces
```

If you want to load a named AWS profile in code, also install the credential provider helpers:

```bash
npm install @aws-sdk/credential-providers
```

Prefer `WorkSpacesClient` plus explicit command imports. The package also exposes an aggregated `WorkSpaces` client, but command-based imports are the safer default for smaller bundles and clearer dependencies.

## Prerequisites

WorkSpaces is regional. Configure AWS credentials and a region before creating the client.

Typical local setup:

```bash
export AWS_REGION="us-west-2"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional

export WORKSPACES_DIRECTORY_ID="d-90670a1b1d"
export WORKSPACES_BUNDLE_ID="wsb-abc123xyz"
export WORKSPACES_USER_NAME="alice@example.com"
export WORKSPACE_ID="ws-1234567890"
```

If you use shared AWS config locally, `AWS_PROFILE` also works with the standard AWS SDK for JavaScript v3 credential chain.

## Client Setup

### Minimal client

```javascript
import { WorkSpacesClient } from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Explicit credentials

```javascript
import { WorkSpacesClient } from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

### Named profile with `fromIni`

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { WorkSpacesClient } from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: "us-west-2",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if AWS access already comes from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## What This Client Covers

`@aws-sdk/client-workspaces` is the management client for Amazon WorkSpaces operations such as:

- discovering bundles and registered directories
- listing WorkSpaces and reading their state
- creating WorkSpaces for directory users
- starting, stopping, rebooting, and terminating WorkSpaces
- reading connection status for existing WorkSpaces
- modifying WorkSpace properties such as running mode and auto-stop timeout

Most application code uses a simple pattern: discover bundle and directory IDs, create or find a user WorkSpace, then manage its lifecycle with command calls.

## Core Usage Pattern

AWS SDK v3 uses `client.send(new Command(input))`.

```javascript
import {
  DescribeWorkspacesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const response = await workspaces.send(
  new DescribeWorkspacesCommand({
    DirectoryId: process.env.WORKSPACES_DIRECTORY_ID,
    UserName: process.env.WORKSPACES_USER_NAME,
  }),
);

for (const workspace of response.Workspaces ?? []) {
  console.log({
    workspaceId: workspace.WorkspaceId,
    userName: workspace.UserName,
    state: workspace.State,
    bundleId: workspace.BundleId,
    computerName: workspace.ComputerName,
  });
}
```

`DescribeWorkspaces` accepts only one filter set at a time. `WorkspaceIds` cannot be combined with other filters, `BundleId` cannot be combined with other filters, and `UserName` must be used together with `DirectoryId`.

## Common Workflows

### List available bundles

Use `Owner: "AMAZON"` for AWS-provided bundles, or your own account ID for custom bundles.

```javascript
import {
  DescribeWorkspaceBundlesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Bundles = [] } = await workspaces.send(
  new DescribeWorkspaceBundlesCommand({
    Owner: "AMAZON",
  }),
);

for (const bundle of Bundles) {
  console.log({
    bundleId: bundle.BundleId,
    name: bundle.Name,
    owner: bundle.Owner,
    state: bundle.State,
  });
}
```

### List registered directories

```javascript
import {
  DescribeWorkspaceDirectoriesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { Directories = [] } = await workspaces.send(
  new DescribeWorkspaceDirectoriesCommand({}),
);

for (const directory of Directories) {
  console.log({
    directoryId: directory.DirectoryId,
    directoryName: directory.DirectoryName,
    workspaceDirectoryName: directory.WorkspaceDirectoryName,
    registrationCode: directory.RegistrationCode,
    state: directory.State,
  });
}
```

### Create a WorkSpace for one user

`CreateWorkspaces` is asynchronous. Check `FailedRequests` immediately, then query the WorkSpace again to watch it move through `PENDING` toward a usable state.

```javascript
import {
  CreateWorkspacesCommand,
  DescribeWorkspacesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const createResponse = await workspaces.send(
  new CreateWorkspacesCommand({
    Workspaces: [
      {
        DirectoryId: process.env.WORKSPACES_DIRECTORY_ID,
        UserName: process.env.WORKSPACES_USER_NAME,
        BundleId: process.env.WORKSPACES_BUNDLE_ID,
        WorkspaceProperties: {
          RunningMode: "AUTO_STOP",
          RunningModeAutoStopTimeoutInMinutes: 60,
        },
        Tags: [
          { Key: "env", Value: "dev" },
          { Key: "owner", Value: "platform-team" },
        ],
      },
    ],
  }),
);

if ((createResponse.FailedRequests ?? []).length > 0) {
  throw new Error(JSON.stringify(createResponse.FailedRequests, null, 2));
}

const describeResponse = await workspaces.send(
  new DescribeWorkspacesCommand({
    DirectoryId: process.env.WORKSPACES_DIRECTORY_ID,
    UserName: process.env.WORKSPACES_USER_NAME,
  }),
);

const workspace = describeResponse.Workspaces?.[0];

console.log({
  workspaceId: workspace?.WorkspaceId,
  state: workspace?.State,
});
```

### Start or stop a WorkSpace

These operations accept up to 25 WorkSpaces per call and return per-item failures in `FailedRequests`.

```javascript
import {
  StartWorkspacesCommand,
  StopWorkspacesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const stopResponse = await workspaces.send(
  new StopWorkspacesCommand({
    StopWorkspaceRequests: [
      {
        WorkspaceId: process.env.WORKSPACE_ID,
      },
    ],
  }),
);

if ((stopResponse.FailedRequests ?? []).length > 0) {
  console.error(stopResponse.FailedRequests);
}

const startResponse = await workspaces.send(
  new StartWorkspacesCommand({
    StartWorkspaceRequests: [
      {
        WorkspaceId: process.env.WORKSPACE_ID,
      },
    ],
  }),
);

if ((startResponse.FailedRequests ?? []).length > 0) {
  console.error(startResponse.FailedRequests);
}
```

Use `StartWorkspaces` only when the WorkSpace is `STOPPED` and its running mode is `AUTO_STOP` or `MANUAL`. Use `StopWorkspaces` only when the WorkSpace is `AVAILABLE`, `IMPAIRED`, `UNHEALTHY`, or `ERROR`, and its running mode is `AUTO_STOP` or `MANUAL`.

### Reboot or terminate a WorkSpace

```javascript
import {
  RebootWorkspacesCommand,
  TerminateWorkspacesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const rebootResponse = await workspaces.send(
  new RebootWorkspacesCommand({
    RebootWorkspaceRequests: [
      {
        WorkspaceId: process.env.WORKSPACE_ID,
      },
    ],
  }),
);

if ((rebootResponse.FailedRequests ?? []).length > 0) {
  console.error(rebootResponse.FailedRequests);
}

await workspaces.send(
  new TerminateWorkspacesCommand({
    TerminateWorkspaceRequests: [
      {
        WorkspaceId: process.env.WORKSPACE_ID,
      },
    ],
  }),
);
```

`TerminateWorkspaces` is permanent. The WorkSpace data is destroyed and the operation is asynchronous, so read the current state before and after termination if your workflow needs a clean teardown sequence.

### Change running mode or auto-stop timeout

Use `ModifyWorkspaceProperties` when you need to switch between `AUTO_STOP` and `ALWAYS_ON`, or when you need to update the auto-stop timeout. The timeout is configured in 60-minute intervals.

```javascript
import {
  ModifyWorkspacePropertiesCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await workspaces.send(
  new ModifyWorkspacePropertiesCommand({
    WorkspaceId: process.env.WORKSPACE_ID,
    WorkspaceProperties: {
      RunningMode: "AUTO_STOP",
      RunningModeAutoStopTimeoutInMinutes: 120,
    },
  }),
);
```

The `MANUAL` running mode is only supported for Amazon WorkSpaces Core accounts that are allow-listed for it. Do not assume `MANUAL` is available in a general WorkSpaces deployment.

### Check connection status

Use this when you need to know whether users are currently connected, disconnected, or unknown from the service perspective.

```javascript
import {
  DescribeWorkspacesConnectionStatusCommand,
  WorkSpacesClient,
} from "@aws-sdk/client-workspaces";

const workspaces = new WorkSpacesClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { WorkspacesConnectionStatus = [] } = await workspaces.send(
  new DescribeWorkspacesConnectionStatusCommand({
    WorkspaceIds: [process.env.WORKSPACE_ID],
  }),
);

for (const item of WorkspacesConnectionStatus) {
  console.log({
    workspaceId: item.WorkspaceId,
    connectionState: item.ConnectionState,
    lastKnownUserConnectionTimestamp: item.LastKnownUserConnectionTimestamp,
  });
}
```

This API accepts up to 25 WorkSpace IDs per call.

## Common Pitfalls

- `CreateWorkspaces`, `StartWorkspaces`, `StopWorkspaces`, `RebootWorkspaces`, and `TerminateWorkspaces` can succeed at the HTTP level while still returning per-WorkSpace failures in `FailedRequests`. Always inspect that field.
- `CreateWorkspaces`, `RebootWorkspaces`, and `TerminateWorkspaces` are asynchronous. A returned response does not mean the desktop is already in its final state.
- `DescribeWorkspaces` filter rules are strict: `WorkspaceIds` cannot be combined with other filters, `BundleId` cannot be combined with other filters, and `UserName` must be paired with `DirectoryId`.
- `StartWorkspaces` and `StopWorkspaces` only work for `AUTO_STOP` or `MANUAL` running modes, and only in the documented states for each operation.
- `RunningModeAutoStopTimeoutInMinutes` uses 60-minute increments. Do not assume arbitrary minute values are accepted.
- `TerminateWorkspaces` permanently destroys user data. Archive what you need before sending that request.
- `MANUAL` running mode is not generally available; it is documented as a WorkSpaces Core feature that requires allow-list access.

## Version Notes For `3.1007.0`

- This guide targets `@aws-sdk/client-workspaces@3.1007.0`.
- The AWS SDK for JavaScript v3 documentation is published under a rolling `latest` URL. Pin the npm package version in your application if you need stable dependency resolution.
- The current WorkSpaces API surface includes paginated describe operations for bundles, directories, WorkSpaces, and connection status, plus batch lifecycle operations that accept up to 25 request items per call.

## Official Sources

- AWS SDK for JavaScript v3 WorkSpaces client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/workspaces/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- Amazon WorkSpaces running mode guide: `https://docs.aws.amazon.com/workspaces/latest/adminguide/running-mode.html`
- Amazon WorkSpaces modify WorkSpaces guide: `https://docs.aws.amazon.com/workspaces/latest/adminguide/modify-workspaces.html`
- Amazon WorkSpaces protocols guide: `https://docs.aws.amazon.com/workspaces/latest/adminguide/amazon-workspaces-protocols.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-workspaces`
