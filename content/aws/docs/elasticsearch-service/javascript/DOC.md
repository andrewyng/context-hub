---
name: elasticsearch-service
description: "AWS SDK for JavaScript v3 client for Amazon Elasticsearch Service control-plane domain management."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,elasticsearch-service,opensearch,javascript,nodejs,search,managed-service,control-plane"
---

# `@aws-sdk/client-elasticsearch-service`

Use this package for the AWS control-plane API that manages Amazon Elasticsearch Service domains. It covers domain creation, inspection, updates, upgrades, package associations, VPC endpoint metadata, tagging, and deletion.

This is not the data-plane client for index, document, or query traffic. Use it to manage the service itself, not to call `/_search`, `/_bulk`, or other domain REST endpoints.

The package keeps the legacy `Elasticsearch...` naming because the service API is still `es` / `2015-01-01`. Some operations also refer to Amazon OpenSearch Service resources, so mixed Elasticsearch/OpenSearch naming is expected.

## Install

```bash
npm install @aws-sdk/client-elasticsearch-service
```

## Prerequisites

Set a region and credentials that can manage the target domain.

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-aws-profile

# Or use direct credentials instead of AWS_PROFILE
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=... # only for temporary credentials
```

## Client Setup

```javascript
import { ElasticsearchServiceClient } from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you need to pass credentials explicitly:

```javascript
import { ElasticsearchServiceClient } from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Control Plane Vs Domain Endpoint

Use this package when you need to:

- create or delete domains
- inspect domain status, endpoints, or configuration
- change instance sizing, storage, endpoint, security, or logging settings
- manage tags, packages, upgrades, and service software updates

Do not use this package for:

- indexing documents
- running searches
- calling `/_search`, `/_bulk`, or other Elasticsearch/OpenSearch REST APIs directly

For data-plane traffic, first fetch the domain endpoint with `DescribeElasticsearchDomainCommand`, then send signed HTTP requests to `DomainStatus.Endpoint` or `DomainStatus.Endpoints.vpc`.

## Common Workflows

### List domains in the current account and region

```javascript
import {
  ElasticsearchServiceClient,
  ListDomainNamesCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new ListDomainNamesCommand({
    EngineType: "Elasticsearch",
  }),
);

for (const domain of response.DomainNames ?? []) {
  console.log(domain.DomainName);
}
```

`EngineType` is optional. The API accepts `Elasticsearch` and `OpenSearch` if you want to filter mixed estates.

### Describe a domain and read its endpoint

```javascript
import {
  DescribeElasticsearchDomainCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new DescribeElasticsearchDomainCommand({
    DomainName: "search-prod",
  }),
);

const domain = response.DomainStatus;

console.log(domain?.ARN);
console.log(domain?.Endpoint ?? domain?.Endpoints?.vpc);
console.log(domain?.Created);
console.log(domain?.Processing);
console.log(domain?.DomainProcessingStatus);
```

Use this call when you need the ARN for tagging, the endpoint for data-plane access, or the current domain processing state.

### Inspect the current configuration

```javascript
import {
  DescribeElasticsearchDomainConfigCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new DescribeElasticsearchDomainConfigCommand({
    DomainName: "search-prod",
  }),
);

console.log(response.DomainConfig?.ElasticsearchClusterConfig);
console.log(response.DomainConfig?.EBSOptions);
console.log(response.DomainConfig?.DomainEndpointOptions);
```

This is the best call when you need the managed configuration model instead of the higher-level status summary.

### Create a domain

```javascript
import {
  CreateElasticsearchDomainCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const accessPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: "arn:aws:iam::123456789012:role/search-admin" },
      Action: "es:*",
      Resource: "arn:aws:es:us-east-1:123456789012:domain/search-prod/*",
    },
  ],
};

const response = await es.send(
  new CreateElasticsearchDomainCommand({
    DomainName: "search-prod",
    ElasticsearchVersion: "7.10",
    ElasticsearchClusterConfig: {
      InstanceType: "m5.large.elasticsearch",
      InstanceCount: 2,
      DedicatedMasterEnabled: true,
      DedicatedMasterType: "m5.large.elasticsearch",
      DedicatedMasterCount: 3,
      ZoneAwarenessEnabled: true,
      ZoneAwarenessConfig: {
        AvailabilityZoneCount: 2,
      },
    },
    EBSOptions: {
      EBSEnabled: true,
      VolumeType: "gp3",
      VolumeSize: 100,
    },
    VPCOptions: {
      SubnetIds: ["subnet-0123456789abcdef0", "subnet-0fedcba9876543210"],
      SecurityGroupIds: ["sg-0123456789abcdef0"],
    },
    EncryptionAtRestOptions: {
      Enabled: true,
    },
    NodeToNodeEncryptionOptions: {
      Enabled: true,
    },
    DomainEndpointOptions: {
      EnforceHTTPS: true,
      TLSSecurityPolicy: "Policy-Min-TLS-1-2-2019-07",
    },
    AccessPolicies: JSON.stringify(accessPolicy),
    TagList: [
      { Key: "Environment", Value: "prod" },
      { Key: "Service", Value: "search" },
    ],
  }),
);

console.log(response.DomainStatus?.ARN);
console.log(response.DomainStatus?.Created);
console.log(response.DomainStatus?.Processing);
```

Create, update, upgrade, and delete operations are asynchronous. After submitting a change, poll `DescribeElasticsearchDomain` or `DescribeDomainChangeProgress` until the domain is stable.

### Preview a config change with `DryRun`

```javascript
import {
  ElasticsearchServiceClient,
  UpdateElasticsearchDomainConfigCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const dryRun = await es.send(
  new UpdateElasticsearchDomainConfigCommand({
    DomainName: "search-prod",
    DryRun: true,
    ElasticsearchClusterConfig: {
      InstanceType: "m5.xlarge.elasticsearch",
      InstanceCount: 3,
    },
    EBSOptions: {
      EBSEnabled: true,
      VolumeType: "gp3",
      VolumeSize: 200,
    },
  }),
);

console.log(dryRun.DryRunResults?.DeploymentType);
console.log(dryRun.DryRunResults?.Message);
```

`DryRun` lets you see whether the update will use a dynamic update path or a blue/green style deployment before applying it.

### Apply a config update

```javascript
import {
  ElasticsearchServiceClient,
  UpdateElasticsearchDomainConfigCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new UpdateElasticsearchDomainConfigCommand({
    DomainName: "search-prod",
    ElasticsearchClusterConfig: {
      InstanceType: "m5.xlarge.elasticsearch",
      InstanceCount: 3,
    },
    EBSOptions: {
      EBSEnabled: true,
      VolumeType: "gp3",
      VolumeSize: 200,
    },
    DomainEndpointOptions: {
      EnforceHTTPS: true,
      TLSSecurityPolicy: "Policy-Min-TLS-1-2-2019-07",
    },
  }),
);

console.log(response.DomainConfig?.ElasticsearchClusterConfig?.Options);
console.log(response.DomainConfig?.EBSOptions?.Options);
```

### Track a change after create or update

```javascript
import {
  DescribeDomainChangeProgressCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new DescribeDomainChangeProgressCommand({
    DomainName: "search-prod",
  }),
);

console.log(response.ChangeProgressStatus?.ChangeId);
console.log(response.ChangeProgressStatus?.Status);
console.log(response.ChangeProgressStatus?.ConfigChangeStatus);
console.log(response.ChangeProgressStatus?.PendingProperties);
```

This is the most useful progress API when a change stays in `Processing` for a long time.

### Tag and untag a domain

`AddTags` and `RemoveTags` use the domain ARN, not the domain name.

```javascript
import {
  AddTagsCommand,
  ElasticsearchServiceClient,
  ListTagsCommand,
  RemoveTagsCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });
const arn = "arn:aws:es:us-east-1:123456789012:domain/search-prod";

await es.send(
  new AddTagsCommand({
    ARN: arn,
    TagList: [
      { Key: "Team", Value: "platform" },
      { Key: "Environment", Value: "prod" },
    ],
  }),
);

const listed = await es.send(new ListTagsCommand({ ARN: arn }));
console.log(listed.TagList);

await es.send(
  new RemoveTagsCommand({
    ARN: arn,
    TagKeys: ["Team"],
  }),
);
```

### List and associate custom packages

The package APIs are for Amazon ES packages such as `TXT-DICTIONARY` packages.

```javascript
import {
  AssociatePackageCommand,
  DescribePackagesCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const packages = await es.send(
  new DescribePackagesCommand({
    Filters: [
      {
        Name: "PackageStatus",
        Value: ["AVAILABLE"],
      },
    ],
    MaxResults: 25,
  }),
);

const packageId = packages.PackageDetailsList?.[0]?.PackageID;

if (packageId) {
  await es.send(
    new AssociatePackageCommand({
      DomainName: "search-prod",
      PackageID: packageId,
    }),
  );
}
```

The filter member is named `Value`, not `Values`.

### List VPC endpoints attached to a domain

```javascript
import {
  ElasticsearchServiceClient,
  ListVpcEndpointsForDomainCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new ListVpcEndpointsForDomainCommand({
    DomainName: "search-prod",
  }),
);

for (const endpoint of response.VpcEndpointSummaryList ?? []) {
  console.log(endpoint.VpcEndpointId, endpoint.Status, endpoint.DomainArn);
}
```

Although this package is named for Elasticsearch Service, this operation describes OpenSearch Service-managed VPC endpoints.

### Check upgrade targets and supported instance types

```javascript
import {
  ElasticsearchServiceClient,
  ListElasticsearchInstanceTypesCommand,
  ListElasticsearchVersionsCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

let nextToken;
do {
  const versions = await es.send(
    new ListElasticsearchVersionsCommand({
      MaxResults: 100,
      NextToken: nextToken,
    }),
  );

  console.log(versions.ElasticsearchVersions ?? []);
  nextToken = versions.NextToken;
} while (nextToken);

const instanceTypes = await es.send(
  new ListElasticsearchInstanceTypesCommand({
    ElasticsearchVersion: "7.10",
    DomainName: "search-prod",
    MaxResults: 100,
  }),
);

console.log(instanceTypes.ElasticsearchInstanceTypes ?? []);
```

Use `DomainName` when you want instance types that are valid for modifying an existing domain, not just the generic version-wide list.

### Run an eligibility check before upgrading

```javascript
import {
  ElasticsearchServiceClient,
  UpgradeElasticsearchDomainCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const check = await es.send(
  new UpgradeElasticsearchDomainCommand({
    DomainName: "search-prod",
    TargetVersion: "7.10",
    PerformCheckOnly: true,
  }),
);

console.log(check.PerformCheckOnly);
console.log(check.ChangeProgressDetails?.ConfigChangeStatus);
```

After the eligibility check passes, submit the same command again without `PerformCheckOnly` to start the upgrade.

### Start a service software update

```javascript
import {
  ElasticsearchServiceClient,
  StartElasticsearchServiceSoftwareUpdateCommand,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new StartElasticsearchServiceSoftwareUpdateCommand({
    DomainName: "search-prod",
  }),
);

console.log(response.ServiceSoftwareOptions?.CurrentVersion);
console.log(response.ServiceSoftwareOptions?.NewVersion);
console.log(response.ServiceSoftwareOptions?.UpdateStatus);
```

### Delete a domain

```javascript
import {
  DeleteElasticsearchDomainCommand,
  ElasticsearchServiceClient,
} from "@aws-sdk/client-elasticsearch-service";

const es = new ElasticsearchServiceClient({ region: "us-east-1" });

const response = await es.send(
  new DeleteElasticsearchDomainCommand({
    DomainName: "search-prod",
  }),
);

console.log(response.DomainStatus?.Deleted);
console.log(response.DomainStatus?.Processing);
```

Deletion is permanent. Once the domain is deleted, its data cannot be recovered.

## Practical Pitfalls

- Use this package only for service management. It does not replace a signed HTTP client for search and indexing requests.
- Keep the client region aligned with the domain region. Domain listing and management are region-scoped.
- Expect asynchronous operations. Poll `DescribeElasticsearchDomain` and `DescribeDomainChangeProgress` after create, update, upgrade, software-update, and delete calls.
- Pass the domain ARN to `AddTags`, `ListTags`, and `RemoveTags`; those operations do not accept `DomainName`.
- Treat mixed naming as normal. This package still uses `Elasticsearch...` commands, but some operations expose OpenSearch-oriented fields such as `EngineType: "OpenSearch"` and OpenSearch-managed VPC endpoints.
- Keep package examples small and explicit. The control-plane API has many optional nested settings, so it is safer to start from a minimal request and add only the options you actually need.
