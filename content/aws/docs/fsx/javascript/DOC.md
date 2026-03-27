---
name: fsx
description: "AWS SDK for JavaScript v3 client for Amazon FSx file system, backup, tagging, and volume administration APIs."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,fsx,javascript,nodejs,storage,lustre,windows,ontap,openzfs"
---

# `@aws-sdk/client-fsx`

Use this package for Amazon FSx control-plane APIs from JavaScript or TypeScript: create and describe file systems, manage backups and tags, and work with ONTAP or OpenZFS volumes.

This package manages FSx resources. It is not the client you use to read and write files inside a mounted FSx file system.

## Install

```bash
npm install @aws-sdk/client-fsx
```

Prefer `FSxClient` plus explicit command imports. That keeps examples clear and matches normal AWS SDK v3 usage.

## Initialize the Client

### Minimal Node.js client

```javascript
import { FSxClient } from "@aws-sdk/client-fsx";

const fsx = new FSxClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

### Explicit credentials

```javascript
import { FSxClient } from "@aws-sdk/client-fsx";

const fsx = new FSxClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

Typical local setup:

```bash
aws configure
export AWS_PROFILE=dev
export AWS_REGION=us-west-2
```

Or with direct environment variables:

```bash
export AWS_REGION=us-west-2
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

These are administrative APIs, so browser usage is uncommon. Most applications call FSx from trusted server-side code.

## File System Types and Request Shape

`CreateFileSystemCommand` supports these file system types:

- `WINDOWS`
- `LUSTRE`
- `ONTAP`
- `OPENZFS`

The nested configuration object must match `FileSystemType`:

- `WindowsConfiguration` for `WINDOWS`
- `LustreConfiguration` for `LUSTRE`
- `OntapConfiguration` for `ONTAP`
- `OpenZFSConfiguration` for `OPENZFS`

If those do not line up, FSx rejects the request.

## Common Operations

### List file systems across pages

```javascript
import {
  FSxClient,
  paginateDescribeFileSystems,
} from "@aws-sdk/client-fsx";

const fsx = new FSxClient({ region: process.env.AWS_REGION ?? "us-west-2" });

for await (const page of paginateDescribeFileSystems({ client: fsx }, {})) {
  for (const fileSystem of page.FileSystems ?? []) {
    console.log(
      fileSystem.FileSystemId,
      fileSystem.FileSystemType,
      fileSystem.Lifecycle,
    );
  }
}
```

Use `DescribeFileSystemsCommand` with `FileSystemIds` when you already know the specific file system IDs you want.

### Create a Lustre file system and poll until it becomes usable

```javascript
import { randomUUID } from "node:crypto";
import {
  CreateFileSystemCommand,
  DescribeFileSystemsCommand,
  FSxClient,
} from "@aws-sdk/client-fsx";

const fsx = new FSxClient({ region: "us-west-2" });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createResult = await fsx.send(
  new CreateFileSystemCommand({
    ClientRequestToken: randomUUID(),
    FileSystemType: "LUSTRE",
    StorageCapacity: 1200,
    SubnetIds: ["subnet-0123456789abcdef0"],
    SecurityGroupIds: ["sg-0123456789abcdef0"],
    LustreConfiguration: {
      DeploymentType: "SCRATCH_2",
    },
    Tags: [{ Key: "Name", Value: "analytics-lustre" }],
  }),
);

const fileSystemId = createResult.FileSystem?.FileSystemId;

if (!fileSystemId) {
  throw new Error("FSx did not return a file system id");
}

let lifecycle;

do {
  const describeResult = await fsx.send(
    new DescribeFileSystemsCommand({
      FileSystemIds: [fileSystemId],
    }),
  );

  lifecycle = describeResult.FileSystems?.[0]?.Lifecycle;
  console.log("Current lifecycle:", lifecycle);

  if (["AVAILABLE", "FAILED", "MISCONFIGURED"].includes(lifecycle ?? "")) {
    break;
  }

  await sleep(30_000);
} while (true);

if (lifecycle !== "AVAILABLE") {
  throw new Error(`File system did not become available: ${lifecycle}`);
}
```

FSx create calls are asynchronous. A successful `CreateFileSystemCommand` response only means the request was accepted.

### Create a backup for a file system

```javascript
import { randomUUID } from "node:crypto";
import {
  CreateBackupCommand,
  DescribeBackupsCommand,
  FSxClient,
} from "@aws-sdk/client-fsx";

const fsx = new FSxClient({ region: "us-west-2" });
const fileSystemId = "fs-0123456789abcdef0";

const createBackupResult = await fsx.send(
  new CreateBackupCommand({
    FileSystemId: fileSystemId,
    ClientRequestToken: randomUUID(),
    Tags: [{ Key: "environment", Value: "prod" }],
  }),
);

const backupId = createBackupResult.Backup?.BackupId;

if (!backupId) {
  throw new Error("FSx did not return a backup id");
}

const describeBackupResult = await fsx.send(
  new DescribeBackupsCommand({
    BackupIds: [backupId],
  }),
);

console.log(describeBackupResult.Backups?.[0]?.Lifecycle);
```

`CreateBackupCommand` accepts either `FileSystemId` or `VolumeId`. Volume backups apply to FSx for ONTAP and FSx for OpenZFS volumes.

### Tag a resource and read its tags back

```javascript
import {
  DescribeFileSystemsCommand,
  FSxClient,
  ListTagsForResourceCommand,
  TagResourceCommand,
} from "@aws-sdk/client-fsx";

const fsx = new FSxClient({ region: "us-west-2" });
const fileSystemId = "fs-0123456789abcdef0";

const describeResult = await fsx.send(
  new DescribeFileSystemsCommand({
    FileSystemIds: [fileSystemId],
  }),
);

const resourceArn = describeResult.FileSystems?.[0]?.ResourceARN;

if (!resourceArn) {
  throw new Error("Missing file system ARN");
}

await fsx.send(
  new TagResourceCommand({
    ResourceARN: resourceArn,
    Tags: [
      { Key: "environment", Value: "prod" },
      { Key: "owner", Value: "platform" },
    ],
  }),
);

const tagsResult = await fsx.send(
  new ListTagsForResourceCommand({
    ResourceARN: resourceArn,
  }),
);

console.log(tagsResult.Tags);
```

The property name is `ResourceARN`, not `ResourceArn`.

### List volumes for ONTAP or OpenZFS

```javascript
import {
  DescribeVolumesCommand,
  FSxClient,
} from "@aws-sdk/client-fsx";

const fsx = new FSxClient({ region: "us-west-2" });
const fileSystemId = "fs-0123456789abcdef0";

const result = await fsx.send(
  new DescribeVolumesCommand({
    Filters: [
      {
        Name: "file-system-id",
        Values: [fileSystemId],
      },
    ],
  }),
);

for (const volume of result.Volumes ?? []) {
  console.log(volume.VolumeId, volume.Lifecycle);
}
```

`DescribeVolumesCommand` is for Amazon FSx for NetApp ONTAP and Amazon FSx for OpenZFS volumes.

## FSx-Specific Gotchas

- `CreateFileSystemCommand` is type-specific. Keep `FileSystemType` aligned with the matching nested configuration object.
- File system creation, backup creation, updates, and deletion are asynchronous. Check `Lifecycle` and, when relevant, `AdministrativeActions` before treating the resource as ready.
- Tag APIs use `ResourceARN` in request shapes.
- `DescribeVolumesCommand` only applies to ONTAP and OpenZFS volume resources.
- `DeleteFileSystemCommand` also uses a type-specific nested configuration block such as `LustreConfiguration`, `WindowsConfiguration`, or `OpenZFSConfiguration` to control final-backup behavior.
- Deleting OpenZFS file systems can require `OpenZFSConfiguration.Options`, such as `DELETE_CHILD_VOLUMES_AND_SNAPSHOTS`, when child resources still exist.
- Network placement still matters. Subnets, security groups, route tables, Active Directory settings, and file-system-type-specific throughput or deployment options are validated by the service at runtime.

## Official Source URLs

- `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/fsx/`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_CreateFileSystem.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_DescribeFileSystems.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_CreateBackup.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_DescribeBackups.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_DescribeVolumes.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_TagResource.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_ListTagsForResource.html`
- `https://docs.aws.amazon.com/fsx/latest/APIReference/API_DeleteFileSystem.html`
