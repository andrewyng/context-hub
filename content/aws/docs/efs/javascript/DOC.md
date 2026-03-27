---
name: efs
description: "AWS SDK for JavaScript v3 EFS client for managing file systems, mount targets, access points, tags, and throughput settings."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,efs,filesystem,nfs,storage,javascript,nodejs"
---

# `@aws-sdk/client-efs`

Use this package for Amazon EFS control-plane operations from JavaScript or TypeScript: create file systems, inspect state, create mount targets and access points, manage tags, and update throughput settings. It does not mount the file system itself; mounting still happens from your compute environment over NFS by using an EFS mount target or DNS name.

## Install

```bash
npm install @aws-sdk/client-efs
```

## Credentials and region

The EFS client uses the normal AWS SDK for JavaScript v3 credential chain. In Node.js, that usually means environment variables, shared AWS config files, ECS task roles, EC2 instance roles, or IAM Identity Center-backed profiles.

Typical local setup:

```bash
export AWS_PROFILE=dev
export AWS_REGION=us-east-1

# Or set static credentials when needed.
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

Region is required somewhere. Set it in code or through `AWS_REGION`.

## Initialize the client

```javascript
import { EFSClient } from "@aws-sdk/client-efs";

const efs = new EFSClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## List and inspect file systems

`DescribeFileSystems` accepts either a `FileSystemId`, a `CreationToken`, or no identifier at all.

Fetch one file system by ID:

```javascript
import {
  DescribeFileSystemsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const response = await efs.send(
  new DescribeFileSystemsCommand({
    FileSystemId: "fs-0123456789abcdef0",
  }),
);

const fileSystem = response.FileSystems?.[0];

console.log(fileSystem?.FileSystemId);
console.log(fileSystem?.LifeCycleState);
console.log(fileSystem?.PerformanceMode);
console.log(fileSystem?.ThroughputMode);
console.log(fileSystem?.AvailabilityZoneName);
```

List every file system in the current region with manual pagination:

```javascript
import {
  DescribeFileSystemsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function listAllFileSystems() {
  const fileSystems = [];
  let marker;

  do {
    const page = await efs.send(
      new DescribeFileSystemsCommand({
        Marker: marker,
        MaxItems: 100,
      }),
    );

    fileSystems.push(...(page.FileSystems ?? []));
    marker = page.NextMarker;
  } while (marker);

  return fileSystems;
}

const fileSystems = await listAllFileSystems();
for (const fileSystem of fileSystems) {
  console.log(fileSystem.FileSystemId, fileSystem.LifeCycleState);
}
```

## Create a file system

Provide your own `CreationToken` so retries stay idempotent. The file system is returned immediately in the `creating` state, so poll until it becomes `available` before creating mount targets.

```javascript
import {
  CreateFileSystemCommand,
  DescribeFileSystemsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createFileSystem() {
  const created = await efs.send(
    new CreateFileSystemCommand({
      CreationToken: `shared-${Date.now()}`,
      PerformanceMode: "generalPurpose",
      ThroughputMode: "bursting",
      Encrypted: true,
      Tags: [{ Key: "Name", Value: "shared-app-files" }],
    }),
  );

  return created.FileSystemId;
}

async function waitForFileSystemAvailable(fileSystemId) {
  while (true) {
    const response = await efs.send(
      new DescribeFileSystemsCommand({ FileSystemId: fileSystemId }),
    );

    const fileSystem = response.FileSystems?.[0];

    if (!fileSystem) {
      throw new Error(`File system not found: ${fileSystemId}`);
    }

    if (fileSystem.LifeCycleState === "available") {
      return fileSystem;
    }

    if (fileSystem.LifeCycleState === "error" || fileSystem.LifeCycleState === "deleted") {
      throw new Error(`Unexpected file system state: ${fileSystem.LifeCycleState}`);
    }

    await sleep(5000);
  }
}

const fileSystemId = await createFileSystem();
const fileSystem = await waitForFileSystemAvailable(fileSystemId);

console.log(fileSystem.FileSystemId, fileSystem.LifeCycleState);
```

Common create-time settings:

- `PerformanceMode`: `generalPurpose` or `maxIO`. AWS recommends `generalPurpose` for most file systems, and you cannot change performance mode after creation.
- `ThroughputMode`: `bursting`, `provisioned`, or `elastic`.
- `ProvisionedThroughputInMibps`: required when `ThroughputMode` is `provisioned`.
- `Encrypted` and `KmsKeyId`: use `KmsKeyId` only when you want a non-default KMS key.
- `AvailabilityZoneName`: creates a One Zone file system; mount targets for One Zone must be created in that same Availability Zone.

If you include `Tags` during creation, the caller also needs `elasticfilesystem:TagResource` in addition to `elasticfilesystem:CreateFileSystem`.

## Create a mount target

Create mount targets only after the file system is `available`. You can create one mount target per Availability Zone in a VPC. For One Zone file systems, create exactly one mount target in the file system's Availability Zone.

```javascript
import {
  CreateMountTargetCommand,
  DescribeMountTargetsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createMountTarget(fileSystemId) {
  const created = await efs.send(
    new CreateMountTargetCommand({
      FileSystemId: fileSystemId,
      SubnetId: "subnet-0123456789abcdef0",
      SecurityGroups: ["sg-0123456789abcdef0"],
    }),
  );

  return created.MountTargetId;
}

async function waitForMountTargetAvailable(mountTargetId) {
  while (true) {
    const response = await efs.send(
      new DescribeMountTargetsCommand({ MountTargetId: mountTargetId }),
    );

    const mountTarget = response.MountTargets?.[0];

    if (!mountTarget) {
      throw new Error(`Mount target not found: ${mountTargetId}`);
    }

    if (mountTarget.LifeCycleState === "available") {
      return mountTarget;
    }

    if (mountTarget.LifeCycleState === "error" || mountTarget.LifeCycleState === "deleted") {
      throw new Error(`Unexpected mount target state: ${mountTarget.LifeCycleState}`);
    }

    await sleep(5000);
  }
}

const mountTargetId = await createMountTarget("fs-0123456789abcdef0");
const mountTarget = await waitForMountTargetAvailable(mountTargetId);

console.log(mountTarget.MountTargetId);
console.log(mountTarget.IpAddress);
console.log(mountTarget.AvailabilityZoneName);
```

Important details:

- `SubnetId` determines the VPC and Availability Zone for the mount target.
- `SecurityGroups` must belong to the same VPC as the subnet.
- `IpAddressType` can be `IPV4_ONLY`, `IPV6_ONLY`, or `DUAL_STACK` if you need to control address family explicitly.
- Creating a mount target also needs EC2 permissions such as `ec2:DescribeSubnets`, `ec2:DescribeNetworkInterfaces`, and `ec2:CreateNetworkInterface`.

## Create an access point

Access points let you expose a specific directory and force a specific POSIX identity for requests that use that access point.

```javascript
import {
  CreateAccessPointCommand,
  DescribeAccessPointsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

async function createAccessPoint(fileSystemId) {
  return efs.send(
    new CreateAccessPointCommand({
      ClientToken: `web-${Date.now()}`,
      FileSystemId: fileSystemId,
      PosixUser: {
        Uid: 1000,
        Gid: 1000,
      },
      RootDirectory: {
        Path: "/apps/web",
        CreationInfo: {
          OwnerUid: 1000,
          OwnerGid: 1000,
          Permissions: "0755",
        },
      },
      Tags: [{ Key: "Name", Value: "web-access" }],
    }),
  );
}

const accessPoint = await createAccessPoint("fs-0123456789abcdef0");

const accessPointDetails = await efs.send(
  new DescribeAccessPointsCommand({
    AccessPointId: accessPoint.AccessPointId,
  }),
);

console.log(accessPointDetails.AccessPoints?.[0]?.AccessPointId);
console.log(accessPointDetails.AccessPoints?.[0]?.LifeCycleState);
```

Important access-point behavior:

- The access point exposes only `RootDirectory.Path` and its subdirectories to clients using that access point.
- If `RootDirectory.Path` does not already exist, include `CreationInfo`. Without it, mounts that use the access point fail.
- `PosixUser` overrides identity information from the NFS client for requests through the access point.
- Tagging on access-point creation also requires `elasticfilesystem:TagResource`.

## Tag resources

EFS supports tagging file systems and access points.

```javascript
import {
  EFSClient,
  ListTagsForResourceCommand,
  TagResourceCommand,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await efs.send(
  new TagResourceCommand({
    ResourceId: "fs-0123456789abcdef0",
    Tags: [
      { Key: "Environment", Value: "production" },
      { Key: "Team", Value: "platform" },
    ],
  }),
);

const tags = await efs.send(
  new ListTagsForResourceCommand({
    ResourceId: "fs-0123456789abcdef0",
  }),
);

console.log(tags.Tags ?? []);
```

## Update throughput mode

You cannot change `PerformanceMode` after creation, but you can update throughput settings.

```javascript
import {
  EFSClient,
  UpdateFileSystemCommand,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

await efs.send(
  new UpdateFileSystemCommand({
    FileSystemId: "fs-0123456789abcdef0",
    ThroughputMode: "provisioned",
    ProvisionedThroughputInMibps: 128,
  }),
);
```

When switching to `ThroughputMode: "provisioned"`, `ProvisionedThroughputInMibps` is required.

## Delete resources safely

Delete access points and mount targets before deleting the file system. `DeleteMountTarget` is disruptive: it forcibly breaks active mounts and returns before the mount target is fully gone.

```javascript
import {
  DeleteAccessPointCommand,
  DeleteFileSystemCommand,
  DeleteMountTargetCommand,
  DescribeMountTargetsCommand,
  EFSClient,
} from "@aws-sdk/client-efs";

const efs = new EFSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function deleteFileSystem(fileSystemId, accessPointIds = []) {
  for (const accessPointId of accessPointIds) {
    await efs.send(new DeleteAccessPointCommand({ AccessPointId: accessPointId }));
  }

  const response = await efs.send(
    new DescribeMountTargetsCommand({ FileSystemId: fileSystemId }),
  );

  for (const mountTarget of response.MountTargets ?? []) {
    if (mountTarget.MountTargetId) {
      await efs.send(
        new DeleteMountTargetCommand({
          MountTargetId: mountTarget.MountTargetId,
        }),
      );
    }
  }

  while (true) {
    const poll = await efs.send(
      new DescribeMountTargetsCommand({ FileSystemId: fileSystemId }),
    );

    if ((poll.MountTargets ?? []).length === 0) {
      break;
    }

    await sleep(5000);
  }

  await efs.send(
    new DeleteFileSystemCommand({ FileSystemId: fileSystemId }),
  );
}
```

If the file system still has mount targets, `DeleteFileSystem` fails. EFS also does not let you delete a file system that is part of a replication configuration.

## Common pitfalls

- This package manages EFS resources; it does not perform the OS-level NFS mount.
- Create the file system first, wait for `LifeCycleState === "available"`, then create mount targets.
- Keep mount targets aligned with Availability Zones. You can create only one mount target per Availability Zone in a VPC.
- For One Zone file systems, use the file system's `AvailabilityZoneName` or `AvailabilityZoneId` when choosing the subnet for the mount target.
- Use your own `CreationToken` for file systems and `ClientToken` for access points when you want safe retries.
- If an access point path might not exist yet, include `RootDirectory.CreationInfo`; otherwise the access point can be created but mounts through it fail.
- If you tag during creation, include IAM permission for `elasticfilesystem:TagResource` as well as the create action.
- `PerformanceMode` is fixed at create time. Only throughput settings are updatable later.
