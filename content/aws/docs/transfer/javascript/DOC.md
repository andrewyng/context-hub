---
name: transfer
description: "AWS SDK for JavaScript v3 client for AWS Transfer Family servers, users, connectors, and managed file transfers"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,transfer,transfer-family,sftp,ftps,as2,javascript,nodejs"
---

# AWS Transfer Family SDK for JavaScript (v3)

Use `@aws-sdk/client-transfer` to manage AWS Transfer Family resources from JavaScript or TypeScript. This client covers control-plane operations such as creating servers and users, managing connectors, testing identity providers, starting managed file transfers, and reading transfer results.

This package is for AWS Transfer Family administration and managed transfer workflows. It is not a general SFTP client library.

## Golden Rules

- Install `@aws-sdk/client-transfer` for new JavaScript work instead of the legacy `aws-sdk` v2 package.
- Create the client with a `region` and valid AWS credentials before sending commands.
- `CreateUserCommand` only works for servers that use `IdentityProviderType: "SERVICE_MANAGED"`.
- If you enable `FTPS` on a server, you must provide an ACM certificate ARN with `Certificate`.
- Use `TestConnectionCommand` before relying on an SFTP connector for production transfers.
- `ListServersCommand`, `ListUsersCommand`, `ListFileTransferResultsCommand`, and other `List*` operations use `NextToken` / `MaxResults` pagination.
- `StartFileTransferCommand` uses different fields for inbound vs outbound SFTP transfers: `RetrieveFilePaths` + `LocalDirectoryPath` for inbound, `SendFilePaths` + `RemoteDirectoryPath` for outbound.

## Install

```bash
npm install @aws-sdk/client-transfer
```

If you want to load named AWS profiles explicitly in code, also install the credential helpers:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Set AWS credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional

export TRANSFER_LOGGING_ROLE_ARN="arn:aws:iam::123456789012:role/TransferLoggingRole"
export TRANSFER_USER_ROLE_ARN="arn:aws:iam::123456789012:role/TransferUserAccessRole"
export TRANSFER_CONNECTOR_ROLE_ARN="arn:aws:iam::123456789012:role/TransferConnectorAccessRole"
export TRANSFER_SECRET_ARN="arn:aws:secretsmanager:us-east-1:123456789012:secret:partner-sftp"
```

If you use shared AWS profiles locally, `AWS_PROFILE` works with the default AWS SDK for JavaScript v3 credential chain.

## Client Setup

### Minimal client

```javascript
import { TransferClient } from "@aws-sdk/client-transfer";

const transfer = new TransferClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { TransferClient } from "@aws-sdk/client-transfer";

const transfer = new TransferClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

### Named profile with `fromIni`

```javascript
import { TransferClient } from "@aws-sdk/client-transfer";
import { fromIni } from "@aws-sdk/credential-providers";

const transfer = new TransferClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if credentials already come from environment variables, shared config files, ECS task credentials, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  DescribeServerCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

const { Server } = await transfer.send(
  new DescribeServerCommand({
    ServerId: "s-0123456789abcdef0",
  }),
);

console.log({
  serverId: Server?.ServerId,
  arn: Server?.Arn,
  state: Server?.State,
  endpointType: Server?.EndpointType,
  identityProviderType: Server?.IdentityProviderType,
});
```

## Common Workflows

### Create an SFTP server backed by Amazon S3

```javascript
import {
  CreateServerCommand,
  DescribeServerCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { ServerId } = await transfer.send(
  new CreateServerCommand({
    Domain: "S3",
    EndpointType: "PUBLIC",
    IdentityProviderType: "SERVICE_MANAGED",
    Protocols: ["SFTP"],
    LoggingRole: process.env.TRANSFER_LOGGING_ROLE_ARN,
    Tags: [
      { Key: "Name", Value: "partner-sftp" },
      { Key: "Environment", Value: "dev" },
    ],
  }),
);

const { Server } = await transfer.send(
  new DescribeServerCommand({ ServerId }),
);

console.log({
  serverId: Server?.ServerId,
  state: Server?.State,
  domain: Server?.Domain,
  protocols: Server?.Protocols,
});
```

If you need FTPS, include `Protocols: ["FTPS"]` or a mixed protocol set and pass an ACM certificate ARN in `Certificate`.

If you want to pin a security policy, first inspect the available names with `ListSecurityPoliciesCommand` and then pass the selected name with `SecurityPolicyName`.

### List servers with pagination

```javascript
import {
  ListServersCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await transfer.send(
    new ListServersCommand({
      MaxResults: 25,
      NextToken: nextToken,
    }),
  );

  for (const server of response.Servers ?? []) {
    console.log({
      serverId: server.ServerId,
      state: server.State,
      endpointType: server.EndpointType,
      identityProviderType: server.IdentityProviderType,
      userCount: server.UserCount,
    });
  }

  nextToken = response.NextToken;
} while (nextToken);
```

### Start or stop a server

```javascript
import {
  DescribeServerCommand,
  StartServerCommand,
  StopServerCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });
const serverId = "s-0123456789abcdef0";

await transfer.send(new StartServerCommand({ ServerId: serverId }));

const started = await transfer.send(
  new DescribeServerCommand({ ServerId: serverId }),
);

console.log(started.Server?.State);

await transfer.send(new StopServerCommand({ ServerId: serverId }));
```

Transfer Family server state changes are asynchronous. `DescribeServerCommand` returns states such as `OFFLINE`, `ONLINE`, `STARTING`, `STOPPING`, `START_FAILED`, and `STOP_FAILED`.

### Create a service-managed user and assign an SSH key

```javascript
import {
  CreateUserCommand,
  DescribeUserCommand,
  ImportSshPublicKeyCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });
const serverId = "s-0123456789abcdef0";
const userName = "partner-a";

await transfer.send(
  new CreateUserCommand({
    ServerId: serverId,
    UserName: userName,
    Role: process.env.TRANSFER_USER_ROLE_ARN,
    HomeDirectoryType: "LOGICAL",
    HomeDirectoryMappings: [
      {
        Entry: "/",
        Target: "/my-transfer-bucket/partners/partner-a",
      },
    ],
  }),
);

await transfer.send(
  new ImportSshPublicKeyCommand({
    ServerId: serverId,
    UserName: userName,
    SshPublicKeyBody: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample user@example",
  }),
);

const { User } = await transfer.send(
  new DescribeUserCommand({
    ServerId: serverId,
    UserName: userName,
  }),
);

console.log({
  userName: User?.UserName,
  role: User?.Role,
  homeDirectoryType: User?.HomeDirectoryType,
  sshKeyCount: User?.SshPublicKeys?.length,
});
```

Use `HomeDirectoryType: "PATH"` when you want the user to land directly in a real S3 bucket or EFS path. Use `HomeDirectoryType: "LOGICAL"` with `HomeDirectoryMappings` when you want Transfer Family to present logical paths such as `/` to the user.

If your server uses Amazon EFS, populate `PosixProfile` when you create or update users.

### Test an external identity provider

Use this only for servers that use `IdentityProviderType: "AWS_DIRECTORY_SERVICE"` or `"API_GATEWAY"`.

```javascript
import {
  TestIdentityProviderCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

const response = await transfer.send(
  new TestIdentityProviderCommand({
    ServerId: "s-0123456789abcdef0",
    UserName: "alice",
    UserPassword: "super-secret-password",
    ServerProtocol: "SFTP",
    SourceIp: "203.0.113.10",
  }),
);

console.log({
  statusCode: response.StatusCode,
  message: response.Message,
  url: response.Url,
});
```

`TestIdentityProviderCommand` does not work for `SERVICE_MANAGED` servers, and it only tests password-based auth, not SSH key auth.

### Create and test an SFTP connector

Use a connector when Transfer Family needs to connect to a partner's SFTP server.

```javascript
import {
  CreateConnectorCommand,
  TestConnectionCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

const { ConnectorId } = await transfer.send(
  new CreateConnectorCommand({
    Url: "partner-sftp.example.com",
    AccessRole: process.env.TRANSFER_CONNECTOR_ROLE_ARN,
    SftpConfig: {
      UserSecretId: process.env.TRANSFER_SECRET_ARN,
      TrustedHostKeys: [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExample hostkey",
      ],
      MaxConcurrentConnections: 1,
    },
    Tags: [{ Key: "Name", Value: "partner-a" }],
  }),
);

const test = await transfer.send(
  new TestConnectionCommand({ ConnectorId }),
);

console.log({
  connectorId: test.ConnectorId,
  status: test.Status,
  statusMessage: test.StatusMessage,
});
```

For SFTP connectors, `SftpConfig.UserSecretId` must be the ARN of an AWS Secrets Manager secret that contains the partner credentials, key material, or both. `TrustedHostKeys` is the partner server host key list used to verify the remote server.

### List a remote directory before pulling files

```javascript
import {
  StartDirectoryListingCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

const listing = await transfer.send(
  new StartDirectoryListingCommand({
    ConnectorId: "c-0123456789abcdef0",
    RemoteDirectoryPath: "/exports",
    OutputDirectoryPath: "my-transfer-bucket/listings",
    MaxItems: 500,
  }),
);

console.log({
  listingId: listing.ListingId,
  outputFileName: listing.OutputFileName,
});
```

The generated listing file is stored in your AWS storage and gives you the remote file paths to pass to `RetrieveFilePaths` in a later `StartFileTransferCommand` call.

### Send files to a partner SFTP server and inspect results

```javascript
import {
  ListFileTransferResultsCommand,
  StartFileTransferCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });
const connectorId = "c-0123456789abcdef0";

const { TransferId } = await transfer.send(
  new StartFileTransferCommand({
    ConnectorId: connectorId,
    SendFilePaths: [
      "my-transfer-bucket/outbound/invoice-123.csv",
      "my-transfer-bucket/outbound/invoice-124.csv",
    ],
    RemoteDirectoryPath: "/incoming",
  }),
);

let nextToken;

do {
  const page = await transfer.send(
    new ListFileTransferResultsCommand({
      ConnectorId: connectorId,
      TransferId,
      MaxResults: 100,
      NextToken: nextToken,
    }),
  );

  for (const result of page.FileTransferResults ?? []) {
    console.log({
      filePath: result.FilePath,
      status: result.StatusCode,
      failureCode: result.FailureCode,
      failureMessage: result.FailureMessage,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

Per-file transfer results currently report statuses such as `QUEUED`, `IN_PROGRESS`, `COMPLETED`, and `FAILED`.

### Retrieve files from a partner SFTP server into AWS storage

```javascript
import {
  StartFileTransferCommand,
  TransferClient,
} from "@aws-sdk/client-transfer";

const transfer = new TransferClient({ region: "us-east-1" });

const response = await transfer.send(
  new StartFileTransferCommand({
    ConnectorId: "c-0123456789abcdef0",
    RetrieveFilePaths: [
      "/exports/daily-report.csv",
      "/exports/daily-report.sig",
    ],
    LocalDirectoryPath: "my-transfer-bucket/inbound",
  }),
);

console.log(response.TransferId);
```

For inbound SFTP transfers, pass the remote file paths in `RetrieveFilePaths` and the destination directory in `LocalDirectoryPath`.

## Important Notes

- `CreateUserCommand` is for server-side Transfer Family users, not IAM users.
- `CreateUserCommand` applies only to servers with `IdentityProviderType: "SERVICE_MANAGED"`.
- If you use `HomeDirectoryMappings`, set `HomeDirectoryType: "LOGICAL"` so the mapping is applied.
- If you use `FTPS`, include a valid ACM certificate ARN in `Certificate`.
- `StartServerCommand` and `StopServerCommand` change control-plane state; follow up with `DescribeServerCommand` before assuming the server is ready.
- `StartDirectoryListingCommand` lists only one directory level at a time and stores the results in your AWS storage.
- `TestIdentityProviderCommand` only tests password auth, not SSH keys.
- `TestConnectionCommand` is specific to SFTP connectors.

## Official Sources

- AWS SDK for JavaScript v3 Transfer client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/transfer/`
- AWS Transfer Family API reference: `https://docs.aws.amazon.com/transfer/latest/APIReference/Welcome.html`
- AWS Transfer Family user guide: `https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-transfer`
