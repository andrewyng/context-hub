---
name: network-firewall
description: "AWS SDK for JavaScript v3 client for creating and managing AWS Network Firewall rule groups, firewall policies, firewalls, protections, and logging."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,network-firewall,javascript,nodejs,vpc,security,suricata"
---

# `@aws-sdk/client-network-firewall`

Use this package to create and manage AWS Network Firewall resources from JavaScript. The common workflow is:

1. Create one or more rule groups.
2. Create a firewall policy that references those rule groups.
3. Create a firewall in a VPC with one firewall subnet per Availability Zone.
4. Wait for the firewall endpoints to become ready, then route VPC traffic to the endpoint IDs.
5. Optionally configure logging and update protection settings.

AWS Network Firewall is regional. Rule groups, firewall policies, firewalls, and readiness state are all scoped to the client region.

## Install

```bash
npm install @aws-sdk/client-network-firewall
```

## Prerequisites

You need:

- AWS credentials with permissions for Network Firewall and the related VPC resources.
- A target AWS Region.
- A VPC with firewall subnets prepared for Network Firewall. Each subnet mapping must use a different Availability Zone.
- VPC routing configured to send traffic through the firewall endpoint IDs after the firewall is ready.

Typical local environment:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-profile

# Or set static credentials instead of AWS_PROFILE.
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
```

In Node.js, AWS SDK v3 uses the default credential provider chain, so shared config and environment variables usually work without passing credentials in code.

## Initialize the client

```javascript
import { NetworkFirewallClient } from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

## Create a stateful domain list rule group

For stateful domain filtering, Network Firewall supports `RulesSourceList` with `TLS_SNI` for HTTPS and `HTTP_HOST` for HTTP. Generated rules can be allow, deny, reject, or alert lists.

```javascript
import {
  CreateRuleGroupCommand,
  NetworkFirewallClient,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createDomainDenylistRuleGroup() {
  const response = await networkFirewall.send(
    new CreateRuleGroupCommand({
      RuleGroupName: "blocked-domains",
      Type: "STATEFUL",
      Capacity: 100,
      Description: "Block selected HTTPS hostnames",
      RuleGroup: {
        RulesSource: {
          RulesSourceList: {
            Targets: [".example.com", "bad.example.org"],
            TargetTypes: ["TLS_SNI"],
            GeneratedRulesType: "DENYLIST",
          },
        },
      },
    }),
  );

  const ruleGroupArn = response.RuleGroupResponse?.RuleGroupArn;
  if (!ruleGroupArn) {
    throw new Error("CreateRuleGroup did not return a rule group ARN");
  }

  return ruleGroupArn;
}
```

`Capacity` is fixed when you create the rule group. For stateful rule groups, the minimum required capacity is the number of individual rules you expect to have in the group.

If you use `RulesString` with Suricata-compatible rules instead of `RulesSourceList`, Network Firewall supports Suricata version `7.0.3`. When `StatefulRuleOptions.RuleOrder` is `STRICT_ORDER`, do not use the Suricata `priority` keyword in `RulesString`.

## Create a firewall policy

To send packets that do not match your stateless rules to the stateful engine, set both stateless default action lists to `aws:forward_to_sfe`.

```javascript
import {
  CreateFirewallPolicyCommand,
  NetworkFirewallClient,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createFirewallPolicy(ruleGroupArn) {
  const response = await networkFirewall.send(
    new CreateFirewallPolicyCommand({
      FirewallPolicyName: "egress-filtering-policy",
      Description: "Send unmatched traffic to stateful inspection",
      FirewallPolicy: {
        StatelessDefaultActions: ["aws:forward_to_sfe"],
        StatelessFragmentDefaultActions: ["aws:forward_to_sfe"],
        StatefulRuleGroupReferences: [
          {
            ResourceArn: ruleGroupArn,
          },
        ],
      },
    }),
  );

  const firewallPolicyArn = response.FirewallPolicyResponse?.FirewallPolicyArn;
  if (!firewallPolicyArn) {
    throw new Error("CreateFirewallPolicy did not return a firewall policy ARN");
  }

  return firewallPolicyArn;
}
```

If you use `StatefulEngineOptions.RuleOrder: "STRICT_ORDER"` in the policy, the stateful rule groups attached to the policy must use compatible stateful rule options.

## Create a firewall in a VPC

A firewall uses subnet mappings in the VPC. Network Firewall creates one firewall endpoint in each mapped subnet.

```javascript
import {
  CreateFirewallCommand,
  NetworkFirewallClient,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function createFirewall({ firewallPolicyArn, vpcId, subnetIds }) {
  const response = await networkFirewall.send(
    new CreateFirewallCommand({
      FirewallName: "prod-egress-firewall",
      FirewallPolicyArn: firewallPolicyArn,
      VpcId: vpcId,
      SubnetMappings: subnetIds.map((subnetId) => ({
        SubnetId: subnetId,
        IPAddressType: "IPV4",
      })),
      DeleteProtection: true,
      SubnetChangeProtection: true,
      FirewallPolicyChangeProtection: true,
      Description: "Primary egress inspection firewall",
    }),
  );

  return {
    firewallArn: response.Firewall?.FirewallArn,
    firewallId: response.Firewall?.FirewallId,
    status: response.FirewallStatus?.Status,
  };
}
```

Each subnet mapping must belong to a different Availability Zone. Creating the firewall does not automatically route traffic through it. After the firewall is ready, use the endpoint IDs from `DescribeFirewall` in your VPC route tables.

## Wait for the firewall endpoints to be ready

`DescribeFirewall` returns both the overall firewall readiness and per-subnet endpoint state.

```javascript
import {
  DescribeFirewallCommand,
  NetworkFirewallClient,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForFirewallReady(firewallName) {
  for (;;) {
    const response = await networkFirewall.send(
      new DescribeFirewallCommand({ FirewallName: firewallName }),
    );

    const status = response.FirewallStatus?.Status;
    const sync = response.FirewallStatus?.ConfigurationSyncStateSummary;

    if (status === "READY" && sync === "IN_SYNC") {
      const endpointIds = Object.values(response.FirewallStatus?.SyncStates ?? {})
        .map((state) => state.Attachment?.EndpointId)
        .filter(Boolean);

      return {
        firewallArn: response.Firewall?.FirewallArn,
        endpointIds,
      };
    }

    await sleep(5000);
  }
}
```

A firewall is ready only when:

- `FirewallStatus.Status` is `READY`
- `FirewallStatus.ConfigurationSyncStateSummary` is `IN_SYNC`
- each mapped subnet attachment reports `READY`

Use the returned firewall endpoint IDs when you update VPC route tables to steer traffic through the firewall.

## Update protection settings safely

Network Firewall resources expose `UpdateToken` values for optimistic locking. A common pattern is to fetch the current resource, then pass its token into an update command.

```javascript
import {
  DescribeFirewallCommand,
  NetworkFirewallClient,
  UpdateFirewallDeleteProtectionCommand,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function disableDeleteProtection(firewallName) {
  const described = await networkFirewall.send(
    new DescribeFirewallCommand({ FirewallName: firewallName }),
  );

  await networkFirewall.send(
    new UpdateFirewallDeleteProtectionCommand({
      FirewallArn: described.Firewall?.FirewallArn,
      UpdateToken: described.UpdateToken,
      DeleteProtection: false,
    }),
  );
}
```

If you omit `UpdateToken`, the update is unconditional. If you provide it and the resource changed since your last read, the operation fails with `InvalidTokenException`, and you need to fetch the resource again.

## Configure logging

Network Firewall can send stateful engine logs to Amazon S3, CloudWatch Logs, or Kinesis Data Firehose. The supported log types are `ALERT`, `FLOW`, and `TLS`.

```javascript
import {
  NetworkFirewallClient,
  UpdateLoggingConfigurationCommand,
} from "@aws-sdk/client-network-firewall";

const networkFirewall = new NetworkFirewallClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export async function enableS3AlertLogging(firewallName) {
  await networkFirewall.send(
    new UpdateLoggingConfigurationCommand({
      FirewallName: firewallName,
      LoggingConfiguration: {
        LogDestinationConfigs: [
          {
            LogType: "ALERT",
            LogDestinationType: "S3",
            LogDestination: {
              bucketName: "my-network-firewall-logs",
              prefix: "alerts/",
            },
          },
        ],
      },
      EnableMonitoringDashboard: true,
    }),
  );
}
```

For other destinations, use these keys in `LogDestination`:

- CloudWatch Logs: `logGroup`
- Kinesis Data Firehose: `deliveryStream`

If you omit `LoggingConfiguration`, Network Firewall disables logging for the firewall.

## Common pitfalls

- Region mismatch: rule groups, firewall policies, and firewalls must all exist in the same region as the client.
- Missing route updates: creating a firewall endpoint does not change VPC routing by itself.
- Subnet layout mistakes: each subnet mapping must be in a different Availability Zone.
- Protection flags: new firewalls start with delete, subnet-change, and firewall-policy-change protection enabled.
- Capacity planning: rule group capacity is set at creation time; size it for the rules you expect to manage.
- Strict rule ordering: if you choose `STRICT_ORDER`, keep the policy and attached stateful rule groups compatible, and avoid Suricata `priority` in `RulesString`.

## Useful commands in this client

These SDK command classes map directly to the core service operations:

- `CreateRuleGroupCommand`
- `DescribeRuleGroupCommand`
- `UpdateRuleGroupCommand`
- `CreateFirewallPolicyCommand`
- `DescribeFirewallPolicyCommand`
- `UpdateFirewallPolicyCommand`
- `CreateFirewallCommand`
- `DescribeFirewallCommand`
- `ListFirewallsCommand`
- `UpdateFirewallDeleteProtectionCommand`
- `UpdateLoggingConfigurationCommand`
- `CreateTLSInspectionConfigurationCommand`
