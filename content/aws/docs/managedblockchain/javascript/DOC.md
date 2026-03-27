---
name: managedblockchain
description: "AWS SDK for JavaScript v3 client for Amazon Managed Blockchain networks, members, nodes, proposals, and accessors."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,managedblockchain,javascript,nodejs,ethereum,hyperledger-fabric"
---

# `@aws-sdk/client-managedblockchain`

Use this package for Amazon Managed Blockchain control-plane APIs from AWS SDK for JavaScript v3. It covers network, member, node, proposal, tag, and accessor management for Hyperledger Fabric and Ethereum where those APIs apply.

Framework support is operation-specific. The service model marks `ListMembers`, `GetMember`, `CreateMember`, `ListProposals`, and `VoteOnProposal` as Hyperledger Fabric only, while `ListNetworks`, `GetNetwork`, `ListNodes`, `GetNode`, and `CreateNode` apply to both Hyperledger Fabric and Ethereum.

## Install

```bash
npm install @aws-sdk/client-managedblockchain
```

## Credentials and region

Managed Blockchain requests are SigV4-signed AWS API calls, so the client needs AWS credentials and a region.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

In Node.js, the default AWS SDK credential provider chain also supports shared config files and IAM roles.

## Initialize the client

```javascript
import { ManagedBlockchainClient } from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## List networks

`ListNetworks` returns the Managed Blockchain networks that the current AWS account participates in.

```javascript
import {
  ListNetworksCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Networks } = await client.send(
  new ListNetworksCommand({
    Framework: "ETHEREUM",
    MaxResults: 25,
  }),
);

for (const network of Networks ?? []) {
  console.log(network.Id, network.Name, network.Framework, network.Status);
}
```

Valid `Framework` values are `"HYPERLEDGER_FABRIC"` and `"ETHEREUM"`.

## Get network details

`GetNetwork` returns framework-specific attributes in addition to the general network metadata.

```javascript
import {
  GetNetworkCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Network } = await client.send(
  new GetNetworkCommand({
    NetworkId: process.env.MB_NETWORK_ID,
  }),
);

console.log("network", Network?.Id, Network?.Name, Network?.Framework);
console.log("vpc endpoint service", Network?.VpcEndpointServiceName);
console.log("fabric ordering endpoint", Network?.FrameworkAttributes?.Fabric?.OrderingServiceEndpoint);
console.log("ethereum chain id", Network?.FrameworkAttributes?.Ethereum?.ChainId);
```

Use the framework-specific fields conditionally. A Fabric network exposes Fabric attributes, and an Ethereum network exposes Ethereum attributes.

## Work with Hyperledger Fabric members

Member APIs apply only to Hyperledger Fabric.

### List members

```javascript
import {
  ListMembersCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Members } = await client.send(
  new ListMembersCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    IsOwned: true,
    MaxResults: 25,
  }),
);

for (const member of Members ?? []) {
  console.log(member.Id, member.Name, member.Status, member.IsOwned);
}
```

### Get a member

```javascript
import {
  GetMemberCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Member } = await client.send(
  new GetMemberCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    MemberId: process.env.MB_MEMBER_ID,
  }),
);

console.log(Member?.Name, Member?.Status);
console.log("fabric admin", Member?.FrameworkAttributes?.Fabric?.AdminUsername);
console.log("fabric CA endpoint", Member?.FrameworkAttributes?.Fabric?.CaEndpoint);
```

### Create a member from an invitation

`CreateMember` requires an invitation ID and Hyperledger Fabric admin credentials.

```javascript
import {
  CreateMemberCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { MemberId } = await client.send(
  new CreateMemberCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    InvitationId: process.env.MB_INVITATION_ID,
    MemberConfiguration: {
      Name: "operations-member",
      FrameworkConfiguration: {
        Fabric: {
          AdminUsername: "mbadmin",
          AdminPassword: process.env.MB_ADMIN_PASSWORD,
        },
      },
      LogPublishingConfiguration: {
        Fabric: {
          CaLogs: {
            Cloudwatch: {
              Enabled: true,
            },
          },
        },
      },
    },
  }),
);

console.log(MemberId);
```

The member admin password must be 8 to 32 characters and include at least one uppercase letter, one lowercase letter, and one digit. It cannot include spaces, `@`, quotes, or slashes.

## List nodes and read node endpoints

Node APIs apply to both Hyperledger Fabric and Ethereum.

### List nodes

```javascript
import {
  ListNodesCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Nodes } = await client.send(
  new ListNodesCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    MemberId: process.env.MB_MEMBER_ID,
    MaxResults: 25,
  }),
);

for (const node of Nodes ?? []) {
  console.log(node.Id, node.InstanceType, node.AvailabilityZone, node.Status);
}
```

For Ethereum networks, omit `MemberId`. For Hyperledger Fabric, include `MemberId` when you want to scope the list to a member.

### Get a node and inspect framework-specific endpoints

```javascript
import {
  GetNodeCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Node } = await client.send(
  new GetNodeCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    NodeId: process.env.MB_NODE_ID,
    MemberId: process.env.MB_MEMBER_ID,
  }),
);

console.log("fabric peer", Node?.FrameworkAttributes?.Fabric?.PeerEndpoint);
console.log("fabric peer events", Node?.FrameworkAttributes?.Fabric?.PeerEventEndpoint);
console.log("ethereum http", Node?.FrameworkAttributes?.Ethereum?.HttpEndpoint);
console.log("ethereum websocket", Node?.FrameworkAttributes?.Ethereum?.WebSocketEndpoint);
```

Ethereum node endpoints returned by `GetNode` are for Ethereum API or JSON-RPC access and the service model notes that those connections use SigV4 authentication.

## Create or update a node

### Create a node

`CreateNode` works for Hyperledger Fabric and Ethereum. `InstanceType` is required. `AvailabilityZone` is required for Ethereum nodes. For Hyperledger Fabric, `StateDB` can be `"LevelDB"` or `"CouchDB"`.

```javascript
import {
  CreateNodeCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { NodeId } = await client.send(
  new CreateNodeCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    MemberId: process.env.MB_MEMBER_ID,
    NodeConfiguration: {
      InstanceType: process.env.MB_INSTANCE_TYPE,
      StateDB: "CouchDB",
      LogPublishingConfiguration: {
        Fabric: {
          ChaincodeLogs: {
            Cloudwatch: {
              Enabled: true,
            },
          },
          PeerLogs: {
            Cloudwatch: {
              Enabled: true,
            },
          },
        },
      },
    },
    Tags: {
      environment: "dev",
    },
  }),
);

console.log(NodeId);
```

For an Ethereum node, pass the public network ID and an availability zone instead of Fabric-only fields:

```javascript
import {
  CreateNodeCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { NodeId } = await client.send(
  new CreateNodeCommand({
    NetworkId: "n-ethereum-mainnet",
    NodeConfiguration: {
      InstanceType: process.env.MB_INSTANCE_TYPE,
      AvailabilityZone: process.env.MB_AVAILABILITY_ZONE,
    },
  }),
);

console.log(NodeId);
```

### Update Fabric node logging

`UpdateNode` applies only to Hyperledger Fabric and updates log publishing configuration.

```javascript
import {
  ManagedBlockchainClient,
  UpdateNodeCommand,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await client.send(
  new UpdateNodeCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    MemberId: process.env.MB_MEMBER_ID,
    NodeId: process.env.MB_NODE_ID,
    LogPublishingConfiguration: {
      Fabric: {
        ChaincodeLogs: {
          Cloudwatch: {
            Enabled: true,
          },
        },
        PeerLogs: {
          Cloudwatch: {
            Enabled: true,
          },
        },
      },
    },
  }),
);
```

## Ethereum accessors

Accessors are for token-based access. The service returns an accessor ID and a billing token when you create one.

```javascript
import {
  CreateAccessorCommand,
  ListAccessorsCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const created = await client.send(
  new CreateAccessorCommand({
    AccessorType: "BILLING_TOKEN",
    NetworkType: "ETHEREUM_MAINNET",
    Tags: {
      environment: "dev",
    },
  }),
);

console.log(created.AccessorId, created.BillingToken, created.NetworkType);

const listed = await client.send(
  new ListAccessorsCommand({
    NetworkType: "ETHEREUM_MAINNET",
    MaxResults: 25,
  }),
);

for (const accessor of listed.Accessors ?? []) {
  console.log(accessor.Id, accessor.Type, accessor.NetworkType, accessor.Status);
}
```

The accessor type is currently restricted to `"BILLING_TOKEN"`.

## Vote on a Hyperledger Fabric proposal

Proposal APIs apply only to Hyperledger Fabric.

```javascript
import {
  ListProposalsCommand,
  ManagedBlockchainClient,
  VoteOnProposalCommand,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Proposals } = await client.send(
  new ListProposalsCommand({
    NetworkId: process.env.MB_NETWORK_ID,
    MaxResults: 25,
  }),
);

const proposalId = Proposals?.[0]?.ProposalId;

if (proposalId) {
  await client.send(
    new VoteOnProposalCommand({
      NetworkId: process.env.MB_NETWORK_ID,
      ProposalId: proposalId,
      VoterMemberId: process.env.MB_MEMBER_ID,
      Vote: "YES",
    }),
  );
}
```

Valid `Vote` values are `"YES"` and `"NO"`.

## Manual pagination

List operations use `MaxResults` and `NextToken`.

```javascript
import {
  ListNetworksCommand,
  ManagedBlockchainClient,
} from "@aws-sdk/client-managedblockchain";

const client = new ManagedBlockchainClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

let nextToken;

do {
  const page = await client.send(
    new ListNetworksCommand({
      Framework: "HYPERLEDGER_FABRIC",
      MaxResults: 25,
      NextToken: nextToken,
    }),
  );

  for (const network of page.Networks ?? []) {
    console.log(network.Id, network.Name);
  }

  nextToken = page.NextToken;
} while (nextToken);
```

## Important notes

- Check the framework before choosing an API. Several member and proposal operations are Fabric-only.
- `GetNode` returns different endpoint fields by framework: Fabric uses peer endpoints, while Ethereum uses HTTP and WebSocket endpoints.
- Ethereum node endpoints use SigV4 authentication.
- `CreateNode` requires `AvailabilityZone` for Ethereum nodes.
- `StateDB` applies only to Hyperledger Fabric and can be `"LevelDB"` or `"CouchDB"`.
- The service model notes that `CreateAccessor` `NetworkType` still includes legacy values such as `"ETHEREUM_GOERLI"` and `"POLYGON_MUMBAI"`, but those values are no longer available for new selection after those networks shut down.
