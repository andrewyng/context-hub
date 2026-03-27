---
name: lightsail
description: "AWS SDK for JavaScript v3 Lightsail client for instances, blueprints, networking, and other Lightsail control-plane operations."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,lightsail,javascript,nodejs,instances,static-ip,networking"
---

# `@aws-sdk/client-lightsail`

Use this package for Amazon Lightsail in AWS SDK for JavaScript v3. It covers instance lifecycle, instance access details, public port rules, static IPs, snapshots, buckets, databases, and other Lightsail control-plane resources.

Prefer `LightsailClient` plus explicit command imports for application code.

## Install

```bash
npm install @aws-sdk/client-lightsail
```

If you want an explicit shared-profile credential loader in code, install the credential helper package too:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Lightsail is regional. Set a region and credentials before you create the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

If you use shared AWS profiles locally, `AWS_PROFILE` also works with the standard AWS SDK credential chain.

```bash
export AWS_PROFILE="dev"
export AWS_REGION="us-east-1"
```

## Client Setup

### Minimal Node.js client

```javascript
import { LightsailClient } from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Shared profile in code

```javascript
import { LightsailClient } from "@aws-sdk/client-lightsail";
import { fromIni } from "@aws-sdk/credential-providers";

const lightsail = new LightsailClient({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

In Node.js, the default credential provider chain is usually enough if your AWS access is already configured with environment variables, shared config files, ECS, EC2 instance metadata, or IAM Identity Center.

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetInstanceCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await lightsail.send(
  new GetInstanceCommand({
    instanceName: "web-1",
  }),
);

console.log(response.instance?.name);
console.log(response.instance?.state?.name);
console.log(response.instance?.publicIpAddress);
```

## Common Workflows

### Discover a region, blueprint, and bundle

Creating an instance needs a region, an availability zone, a `blueprintId`, and a `bundleId`.

```javascript
import {
  GetBlueprintsCommand,
  GetBundlesCommand,
  GetRegionsCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const [regions, blueprints, bundles] = await Promise.all([
  lightsail.send(
    new GetRegionsCommand({
      includeAvailabilityZones: true,
    }),
  ),
  lightsail.send(
    new GetBlueprintsCommand({
      includeInactive: false,
    }),
  ),
  lightsail.send(
    new GetBundlesCommand({
      includeInactive: false,
    }),
  ),
]);

for (const region of regions.regions ?? []) {
  console.log(region.name, region.availabilityZones?.map((zone) => zone.zoneName));
}

for (const blueprint of blueprints.blueprints ?? []) {
  console.log(blueprint.blueprintId, blueprint.name, blueprint.isActive);
}

for (const bundle of bundles.bundles ?? []) {
  console.log(bundle.bundleId, bundle.name, bundle.price);
}
```

Use active blueprints when creating new instances.

### Create an instance

`CreateInstancesCommand` creates one or more instances and returns operation records. It does not return the finished instance object directly.

```javascript
import {
  CreateInstancesCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await lightsail.send(
  new CreateInstancesCommand({
    instanceNames: ["web-1"],
    availabilityZone: "us-east-1a",
    blueprintId: "amazon_linux_2023",
    bundleId: "micro_3_0",
    keyPairName: "default",
    userData: [
      "#!/bin/bash",
      "dnf -y update",
      "dnf -y install nginx",
      "systemctl enable --now nginx",
    ].join("\n"),
    tags: [
      {
        key: "Name",
        value: "web-1",
      },
    ],
  }),
);

const operationId = response.operations?.[0]?.id;
console.log(operationId);
```

### Wait for the operation, then read the instance

Many Lightsail create, update, attach, and delete calls return operation objects. Poll the operation until it becomes terminal, then fetch the resource you care about.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  GetInstanceCommand,
  GetOperationCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function waitForOperation(operationId) {
  while (true) {
    const response = await lightsail.send(
      new GetOperationCommand({
        operationId,
      }),
    );

    if (response.operation?.isTerminal) {
      return response.operation;
    }

    await sleep(5000);
  }
}

await waitForOperation("operation-id-from-create");

const instance = await lightsail.send(
  new GetInstanceCommand({
    instanceName: "web-1",
  }),
);

console.log(instance.instance?.state?.name);
console.log(instance.instance?.publicIpAddress);
```

### Open a public port on an instance

Use `OpenInstancePublicPortsCommand` to allow inbound traffic. `portInfo` can scope access with IPv4 CIDRs, IPv6 CIDRs, or Lightsail alias lists.

```javascript
import {
  LightsailClient,
  OpenInstancePublicPortsCommand,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await lightsail.send(
  new OpenInstancePublicPortsCommand({
    instanceName: "web-1",
    portInfo: {
      fromPort: 80,
      toPort: 80,
      protocol: "tcp",
      cidrs: ["0.0.0.0/0"],
    },
  }),
);
```

For SSH or RDP, narrow the CIDR range whenever possible instead of opening it to the entire internet.

### Allocate and attach a static IP

Static IP assignment is a two-step flow: allocate the static IP resource, then attach it to the instance.

```javascript
import {
  AllocateStaticIpCommand,
  AttachStaticIpCommand,
  GetStaticIpCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await lightsail.send(
  new AllocateStaticIpCommand({
    staticIpName: "web-1-ip",
  }),
);

await lightsail.send(
  new AttachStaticIpCommand({
    staticIpName: "web-1-ip",
    instanceName: "web-1",
  }),
);

const response = await lightsail.send(
  new GetStaticIpCommand({
    staticIpName: "web-1-ip",
  }),
);

console.log(response.staticIp?.ipAddress);
console.log(response.staticIp?.attachedTo);
```

### Get temporary SSH access details

`GetInstanceAccessDetailsCommand` returns temporary access details for the instance. The default protocol is `ssh`; use `rdp` for Windows instances.

```javascript
import {
  GetInstanceAccessDetailsCommand,
  LightsailClient,
} from "@aws-sdk/client-lightsail";

const lightsail = new LightsailClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await lightsail.send(
  new GetInstanceAccessDetailsCommand({
    instanceName: "web-1",
    protocol: "ssh",
  }),
);

console.log(response.accessDetails?.username);
console.log(response.accessDetails?.ipAddress);
console.log(response.accessDetails?.privateKey);
```

Treat `privateKey`, `password`, and related access fields as secrets.

## Pitfalls

- Lightsail resources are regional. Creating an instance in one region and looking it up in another looks like a missing resource.
- `CreateInstancesCommand` requires an `availabilityZone`, not only a region.
- Use active blueprints for new instances. The service still lists inactive blueprints for older resources.
- `customImageName` is discontinued and should not be part of new instance creation flows.
- Many mutating operations return `operations` metadata rather than a fully provisioned resource. Poll the operation before assuming the resource is ready.
- Opening a public port requires the nested `portInfo` object; the CIDR scope is part of that object.
- Static IP allocation and static IP attachment are separate API calls.
- `GetInstanceAccessDetailsCommand` returns temporary access credentials. Do not treat them as long-lived keys.

## Version Notes

- This guide targets `@aws-sdk/client-lightsail` version `3.1007.0`.
- Prefer `LightsailClient` and explicit command imports for predictable dependencies and clearer application code.

## Official Sources

- AWS SDK for JavaScript v3 Lightsail client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/lightsail/`
- AWS CLI Lightsail command reference: `https://docs.aws.amazon.com/cli/latest/reference/lightsail/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-lightsail`
