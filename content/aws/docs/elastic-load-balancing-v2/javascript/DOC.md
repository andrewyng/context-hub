---
name: elastic-load-balancing-v2
description: "AWS SDK for JavaScript v3 client for managing Application, Network, and Gateway Load Balancers, listeners, rules, and target groups."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,elastic-load-balancing,elb,alb,nlb,javascript,nodejs"
---

# `@aws-sdk/client-elastic-load-balancing-v2`

Use this package for the low-level Elastic Load Balancing v2 control-plane API in AWS SDK for JavaScript v3. It covers Application Load Balancers (ALB), Network Load Balancers (NLB), Gateway Load Balancers (GWLB), listeners, listener rules, and target groups.

## Install

```bash
npm install @aws-sdk/client-elastic-load-balancing-v2
```

If you want to load a named AWS profile in code instead of relying on the default provider chain:

```bash
npm install @aws-sdk/credential-providers
```

## Credentials and region

The client needs AWS credentials with permissions for the ELBv2 actions you call, plus access to related resources such as VPCs, subnets, security groups, and ACM certificates.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # only for temporary credentials
```

In Node.js, the default credential provider chain is usually enough if your AWS access is already configured.

## Initialize the client

```javascript
import { ElasticLoadBalancingV2Client } from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

Use a named shared-config profile when needed:

```javascript
import { ElasticLoadBalancingV2Client } from "@aws-sdk/client-elastic-load-balancing-v2";
import { fromIni } from "@aws-sdk/credential-providers";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: "us-east-1",
  credentials: fromIni({ profile: "dev" }),
});
```

## Prerequisites for create flows

- Load balancers and target groups are regional.
- `CreateTargetGroup` needs an existing VPC.
- `CreateLoadBalancer` needs existing subnet IDs; for an Application Load Balancer, use subnets in at least two Availability Zones.
- Application Load Balancers also need security group IDs.
- HTTPS listeners need an ACM certificate ARN in the same region as the load balancer.

## Inspect existing load balancers

```javascript
import {
  DescribeLoadBalancersCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await elbv2.send(
  new DescribeLoadBalancersCommand({
    Names: ["web-alb"],
  }),
);

for (const loadBalancer of response.LoadBalancers ?? []) {
  console.log({
    arn: loadBalancer.LoadBalancerArn,
    dnsName: loadBalancer.DNSName,
    scheme: loadBalancer.Scheme,
    type: loadBalancer.Type,
    state: loadBalancer.State?.Code,
  });
}
```

Use `Names` when you know the resource name. For cross-account or more targeted lookups, call the same API with `LoadBalancerArns` instead.

## Create a target group

This example creates an HTTP target group for instance targets.

```javascript
import {
  CreateTargetGroupCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const vpcId = process.env.AWS_VPC_ID;

if (!vpcId) {
  throw new Error("Set AWS_VPC_ID before creating a target group.");
}

const targetGroupResult = await elbv2.send(
  new CreateTargetGroupCommand({
    Name: "web-tg",
    Protocol: "HTTP",
    Port: 80,
    VpcId: vpcId,
    TargetType: "instance",
    HealthCheckPath: "/health",
  }),
);

const targetGroupArn = targetGroupResult.TargetGroups?.[0]?.TargetGroupArn;

if (!targetGroupArn) {
  throw new Error("CreateTargetGroup did not return a target group ARN.");
}

console.log(targetGroupArn);
```

`TargetType` controls what you register later. For example, `instance` expects EC2 instance IDs, while `ip` expects IP addresses.

## Register targets

```javascript
import {
  ElasticLoadBalancingV2Client,
  RegisterTargetsCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

await elbv2.send(
  new RegisterTargetsCommand({
    TargetGroupArn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/web-tg/0123456789abcdef",
    Targets: [
      {
        Id: "i-0123456789abcdef0",
        Port: 80,
      },
    ],
  }),
);
```

The `Targets[].Id` value must match the target group type you created.

## Create an Application Load Balancer and listener

This example creates an internet-facing ALB and forwards HTTP port 80 to the target group.

```javascript
import {
  CreateListenerCommand,
  CreateLoadBalancerCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const targetGroupArn = process.env.TARGET_GROUP_ARN;
const securityGroupIds = (process.env.AWS_SECURITY_GROUP_IDS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const subnetIds = (process.env.AWS_SUBNET_IDS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (!targetGroupArn) {
  throw new Error("Set TARGET_GROUP_ARN before creating a listener.");
}

if (securityGroupIds.length === 0) {
  throw new Error("Set AWS_SECURITY_GROUP_IDS to one or more ALB security groups.");
}

if (subnetIds.length < 2) {
  throw new Error("Set AWS_SUBNET_IDS to at least two subnets for an ALB.");
}

const loadBalancerResult = await elbv2.send(
  new CreateLoadBalancerCommand({
    Name: "web-alb",
    Type: "application",
    Scheme: "internet-facing",
    IpAddressType: "ipv4",
    SecurityGroups: securityGroupIds,
    Subnets: subnetIds,
  }),
);

const loadBalancerArn = loadBalancerResult.LoadBalancers?.[0]?.LoadBalancerArn;
const dnsName = loadBalancerResult.LoadBalancers?.[0]?.DNSName;

if (!loadBalancerArn) {
  throw new Error("CreateLoadBalancer did not return a load balancer ARN.");
}

const listenerResult = await elbv2.send(
  new CreateListenerCommand({
    LoadBalancerArn: loadBalancerArn,
    Port: 80,
    Protocol: "HTTP",
    DefaultActions: [
      {
        Type: "forward",
        TargetGroupArn: targetGroupArn,
      },
    ],
  }),
);

console.log({
  loadBalancerArn,
  dnsName,
  listenerArn: listenerResult.Listeners?.[0]?.ListenerArn,
});
```

`CreateLoadBalancer` is asynchronous from an infrastructure perspective. After creation, poll `DescribeLoadBalancers` until `State.Code` is `active` before depending on the DNS name in automation.

## Create an HTTPS listener

Use an ACM certificate ARN from the same AWS region as the load balancer.

```javascript
import {
  CreateListenerCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const loadBalancerArn = process.env.LOAD_BALANCER_ARN;
const targetGroupArn = process.env.TARGET_GROUP_ARN;
const certificateArn = process.env.ACM_CERTIFICATE_ARN;

if (!loadBalancerArn || !targetGroupArn || !certificateArn) {
  throw new Error(
    "Set LOAD_BALANCER_ARN, TARGET_GROUP_ARN, and ACM_CERTIFICATE_ARN before creating an HTTPS listener.",
  );
}

await elbv2.send(
  new CreateListenerCommand({
    LoadBalancerArn: loadBalancerArn,
    Port: 443,
    Protocol: "HTTPS",
    Certificates: [
      {
        CertificateArn: certificateArn,
      },
    ],
    DefaultActions: [
      {
        Type: "forward",
        TargetGroupArn: targetGroupArn,
      },
    ],
  }),
);
```

## Check target health

```javascript
import {
  DescribeTargetHealthCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await elbv2.send(
  new DescribeTargetHealthCommand({
    TargetGroupArn: process.env.TARGET_GROUP_ARN,
  }),
);

for (const description of response.TargetHealthDescriptions ?? []) {
  console.log({
    target: description.Target?.Id,
    port: description.Target?.Port,
    state: description.TargetHealth?.State,
    reason: description.TargetHealth?.Reason,
    description: description.TargetHealth?.Description,
  });
}
```

This is the quickest way to confirm whether a registered target is passing health checks and why it is failing if it is not.

## Delete resources

When cleaning up, remove listeners before deleting a target group they reference.

```javascript
import {
  DeleteListenerCommand,
  DeleteLoadBalancerCommand,
  DeleteTargetGroupCommand,
  ElasticLoadBalancingV2Client,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const elbv2 = new ElasticLoadBalancingV2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

if (process.env.LISTENER_ARN) {
  await elbv2.send(
    new DeleteListenerCommand({
      ListenerArn: process.env.LISTENER_ARN,
    }),
  );
}

if (process.env.LOAD_BALANCER_ARN) {
  await elbv2.send(
    new DeleteLoadBalancerCommand({
      LoadBalancerArn: process.env.LOAD_BALANCER_ARN,
    }),
  );
}

if (process.env.TARGET_GROUP_ARN) {
  await elbv2.send(
    new DeleteTargetGroupCommand({
      TargetGroupArn: process.env.TARGET_GROUP_ARN,
    }),
  );
}
```

If `DeleteTargetGroup` reports that the target group is still in use, wait for the load balancer or listener deletion to finish and retry.

## Common pitfalls

- Use the same region for the client, the load balancer, the target group, and any ACM certificate attached to an HTTPS listener.
- For ALBs, pass security groups to `CreateLoadBalancer`; load balancer networking options differ by load balancer type.
- Health check failures usually come from the wrong port, the wrong `HealthCheckPath`, missing security-group ingress, or targets that are not serving traffic yet.
- `RegisterTargets` does not make a target healthy immediately; check `DescribeTargetHealth` until the target reaches a healthy state.
- Target groups are attached by ARN in listener actions. Create the target group first, then create or update listeners that forward to it.
