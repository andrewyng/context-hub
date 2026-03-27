---
name: proton
description: "AWS Proton SDK for JavaScript guide for template discovery, environment and service lifecycle operations, and deployment inspection"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,proton,javascript,nodejs,infrastructure,platform-engineering"
---

# AWS Proton SDK for JavaScript

## Golden Rule

Use `@aws-sdk/client-proton` for Proton control-plane work from JavaScript or Node.js: discover templates, create or update environments and services, manage service instances, and inspect deployment outputs.

Most Proton write APIs take a `spec` field as a YAML string, not a nested JavaScript object. Keep the spec in a file that matches your Proton template bundle and load it as text.

```bash
npm install @aws-sdk/client-proton
```

Before you call create or update APIs, make sure the target Region already has the Proton environment template, service template, and published template versions you plan to use.

## Credentials And Region

Proton is regional. Use the same AWS Region as your Proton templates, environments, services, linked repositories, and CodeStar connection resources.

Typical local setup:

```bash
export AWS_REGION=us-west-2
export AWS_PROFILE=dev

export PROTON_ENV_TEMPLATE_NAME=network-env
export PROTON_SERVICE_TEMPLATE_NAME=orders-service
export PROTON_ENVIRONMENT_NAME=orders-dev
export PROTON_SERVICE_NAME=orders-api
export PROTON_SERVICE_INSTANCE_NAME=orders-api-dev

export PROTON_SERVICE_ROLE_ARN=arn:aws:iam::123456789012:role/AWSProtonServiceRole
export PROTON_COMPONENT_ROLE_ARN=arn:aws:iam::123456789012:role/ProtonEnvironmentComponentRole
export PROTON_ENV_ACCOUNT_CONNECTION_ID=12345678-1234-1234-1234-123456789012

export PROTON_REPOSITORY_CONNECTION_ARN=arn:aws:codestar-connections:us-west-2:123456789012:connection/11111111-2222-3333-4444-555555555555
export PROTON_REPOSITORY_ID=myorg/orders-api
export PROTON_REPOSITORY_BRANCH=main

export PROTON_PROVISIONING_REPO_NAME=infra-live
export PROTON_PROVISIONING_REPO_BRANCH=main
```

The SDK uses the standard AWS credential provider chain in Node.js, including environment variables, shared AWS config files, IAM roles, and other standard AWS credential sources.

For environment provisioning, choose one mode and keep the request shape consistent:

- AWS-managed provisioning: send `protonServiceRoleArn` or `environmentAccountConnectionId`, and omit `provisioningRepository`.
- Self-managed provisioning: send `provisioningRepository`, and omit `protonServiceRoleArn` and `environmentAccountConnectionId`.

## Client Initialization

```javascript
import { ProtonClient } from "@aws-sdk/client-proton";

export const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

## Common Workflows

### Discover templates and published versions

List templates first, then inspect template versions before you hardcode a template name or version.

```javascript
import {
  ListServiceTemplateVersionsCommand,
  ProtonClient,
  paginateListEnvironmentTemplates,
  paginateListServiceTemplates,
} from "@aws-sdk/client-proton";

const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

for await (const page of paginateListEnvironmentTemplates(
  { client: proton },
  {},
)) {
  for (const template of page.templates ?? []) {
    console.log("environment template", template.name, template.recommendedVersion);
  }
}

for await (const page of paginateListServiceTemplates(
  { client: proton },
  {},
)) {
  for (const template of page.templates ?? []) {
    console.log("service template", template.name, template.recommendedVersion);
  }
}

const { templateVersions } = await proton.send(
  new ListServiceTemplateVersionsCommand({
    templateName: process.env.PROTON_SERVICE_TEMPLATE_NAME,
  }),
);

for (const version of templateVersions ?? []) {
  if (version.status === "PUBLISHED") {
    console.log(
      `${version.templateName} ${version.majorVersion}.${version.minorVersion}`,
      "recommended minor:",
      version.recommendedMinorVersion,
    );
  }
}
```

Use the published versions from these APIs when you set `templateMajorVersion` and `templateMinorVersion` on create or update calls.

### Create an environment and wait for deployment

`CreateEnvironmentCommand` requires `name`, `spec`, `templateMajorVersion`, and `templateName`. The `spec` must match the schema in your environment template bundle.

```javascript
import { readFileSync } from "node:fs";
import {
  CreateEnvironmentCommand,
  GetEnvironmentCommand,
  ProtonClient,
  waitUntilEnvironmentDeployed,
} from "@aws-sdk/client-proton";

const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const environmentSpec = readFileSync("./proton/environment-spec.yaml", "utf8");

await proton.send(
  new CreateEnvironmentCommand({
    name: process.env.PROTON_ENVIRONMENT_NAME,
    templateName: process.env.PROTON_ENV_TEMPLATE_NAME,
    templateMajorVersion: "1",
    spec: environmentSpec,
    protonServiceRoleArn: process.env.PROTON_SERVICE_ROLE_ARN,
    componentRoleArn: process.env.PROTON_COMPONENT_ROLE_ARN,
  }),
);

await waitUntilEnvironmentDeployed(
  { client: proton, maxWaitTime: 30 * 60 },
  { name: process.env.PROTON_ENVIRONMENT_NAME },
);

const { environment } = await proton.send(
  new GetEnvironmentCommand({
    name: process.env.PROTON_ENVIRONMENT_NAME,
  }),
);

console.log(environment?.deploymentStatus, environment?.templateName);
```

If your environment uses self-managed provisioning, replace `protonServiceRoleArn` with `provisioningRepository: { name, branch, provider }` and omit both `protonServiceRoleArn` and `environmentAccountConnectionId`.

### Create a service and inspect pipeline status

Repository-backed service creation commonly includes `branchName`, `repositoryConnectionArn`, and `repositoryId`, but the API model does not require those fields for every service template. Send them only when your service template or provisioning model needs them.

```javascript
import { readFileSync } from "node:fs";
import {
  CreateServiceCommand,
  GetServiceCommand,
  ProtonClient,
  waitUntilServiceCreated,
} from "@aws-sdk/client-proton";

const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const serviceSpec = readFileSync("./proton/service-spec.yaml", "utf8");

await proton.send(
  new CreateServiceCommand({
    name: process.env.PROTON_SERVICE_NAME,
    templateName: process.env.PROTON_SERVICE_TEMPLATE_NAME,
    templateMajorVersion: "1",
    spec: serviceSpec,
    branchName: process.env.PROTON_REPOSITORY_BRANCH,
    repositoryConnectionArn: process.env.PROTON_REPOSITORY_CONNECTION_ARN,
    repositoryId: process.env.PROTON_REPOSITORY_ID,
  }),
);

await waitUntilServiceCreated(
  { client: proton, maxWaitTime: 30 * 60 },
  { name: process.env.PROTON_SERVICE_NAME },
);

const { service } = await proton.send(
  new GetServiceCommand({
    name: process.env.PROTON_SERVICE_NAME,
  }),
);

console.log(service?.status, service?.pipeline?.deploymentStatus);
```

For service templates with pipelines, the service `spec` is still a YAML string. AWS CLI examples show a `proton: ServiceSpec` document with `pipeline` and `instances` sections, so keep the YAML in source control instead of embedding a large multiline string in your application code.

### Update a service instance

`UpdateServiceInstanceCommand` always requires `deploymentType`, `name`, and `serviceName`. Use `CURRENT_VERSION` when you are changing only the instance spec on the current template version.

```javascript
import { readFileSync } from "node:fs";
import {
  ProtonClient,
  UpdateServiceInstanceCommand,
  waitUntilServiceInstanceDeployed,
} from "@aws-sdk/client-proton";

const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const serviceInstanceSpec = readFileSync(
  "./proton/service-instance-spec.yaml",
  "utf8",
);

await proton.send(
  new UpdateServiceInstanceCommand({
    name: process.env.PROTON_SERVICE_INSTANCE_NAME,
    serviceName: process.env.PROTON_SERVICE_NAME,
    deploymentType: "CURRENT_VERSION",
    spec: serviceInstanceSpec,
  }),
);

await waitUntilServiceInstanceDeployed(
  { client: proton, maxWaitTime: 30 * 60 },
  {
    name: process.env.PROTON_SERVICE_INSTANCE_NAME,
    serviceName: process.env.PROTON_SERVICE_NAME,
  },
);
```

Use `MINOR_VERSION` or `MAJOR_VERSION` only when you are intentionally moving the service instance to a newer published template version. Use `NONE` for metadata-only updates that should not trigger a deployment.

If you are adding a brand-new instance to an existing service, use `CreateServiceInstanceCommand` with `name`, `serviceName`, and an instance `spec`, then wait with `waitUntilServiceInstanceDeployed`.

### Read environment outputs and provisioned resources

After deployment, the outputs and provisioned-resource list APIs are the practical way to discover IDs, ARNs, stack outputs, and downstream resource names.

```javascript
import {
  ListEnvironmentOutputsCommand,
  ListServiceInstanceProvisionedResourcesCommand,
  ProtonClient,
} from "@aws-sdk/client-proton";

const proton = new ProtonClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const { outputs } = await proton.send(
  new ListEnvironmentOutputsCommand({
    environmentName: process.env.PROTON_ENVIRONMENT_NAME,
  }),
);

for (const output of outputs ?? []) {
  console.log("environment output", output.key, output.valueString);
}

const { provisionedResources } = await proton.send(
  new ListServiceInstanceProvisionedResourcesCommand({
    serviceInstanceName: process.env.PROTON_SERVICE_INSTANCE_NAME,
    serviceName: process.env.PROTON_SERVICE_NAME,
  }),
);

for (const resource of provisionedResources ?? []) {
  console.log(
    "provisioned resource",
    resource.name,
    resource.identifier,
    resource.provisioningEngine,
  );
}
```

If you need outputs or resources for a specific deployment attempt, the output-list APIs also accept `deploymentId`.

## Common Pitfalls

- Sending the Proton `spec` as a JavaScript object. The current API expects a YAML string.
- Treating `templateMajorVersion` and `templateMinorVersion` as numbers. The API model defines them as strings.
- Creating or updating resources before checking that the target template version is `PUBLISHED`.
- Mixing environment provisioning modes. Self-managed provisioning uses `provisioningRepository`; AWS-managed provisioning uses `protonServiceRoleArn` or `environmentAccountConnectionId`.
- Forgetting `deploymentType` on `UpdateEnvironmentCommand` or `UpdateServiceInstanceCommand`.
- Assuming the initial create or update call means the deployment already finished. Use Proton waiters or poll `GetEnvironment`, `GetService`, or `GetServiceInstance`.
- Expecting list APIs to return every result in one call. Proton exposes paginators for templates, environments, services, service instances, outputs, provisioned resources, repositories, and deployments.
- Sending repository fields for a service template that does not use repository-backed pipeline provisioning.

## Version Notes

- This guide targets `@aws-sdk/client-proton` version `3.1007.0`.
- The underlying Proton service model reports API version `2020-07-20`.
- The current Proton API model exposes paginators for 21 list-style operations, including `paginateListEnvironmentTemplates`, `paginateListServices`, `paginateListServiceInstances`, and the output and provisioned-resource list APIs.
- The current waiter set includes service and environment helpers that map to `waitUntilEnvironmentDeployed`, `waitUntilServiceCreated`, `waitUntilServiceUpdated`, `waitUntilServiceInstanceDeployed`, and `waitUntilServicePipelineDeployed` in AWS SDK for JavaScript v3.

## Official Sources

- AWS SDK for JavaScript v3 Proton client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/proton/`
- AWS Proton API Reference: `https://docs.aws.amazon.com/proton/latest/APIReference/Welcome.html`
- AWS Proton Administrator Guide: `https://docs.aws.amazon.com/proton/latest/adminguide/`
- AWS Proton User Guide: `https://docs.aws.amazon.com/proton/latest/userguide/`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
- AWS CLI Proton reference: `https://docs.aws.amazon.com/cli/latest/reference/proton/`
- npm package: `https://www.npmjs.com/package/@aws-sdk/client-proton`
