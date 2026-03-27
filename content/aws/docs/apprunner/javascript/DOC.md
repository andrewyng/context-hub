---
name: apprunner
description: "AWS App Runner SDK for JavaScript guide for creating, updating, and operating App Runner services"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,apprunner,javascript,nodejs,containers,deployment"
---

# AWS App Runner SDK for JavaScript

## Golden Rule

Use `@aws-sdk/client-apprunner` for App Runner control-plane operations from JavaScript or Node.js: creating services, describing them, starting deployments, pausing or resuming traffic, and managing custom domains.

```bash
npm install @aws-sdk/client-apprunner
```

This package manages App Runner resources. Your application code still runs inside App Runner after deployment; this SDK does not replace your service runtime or your container image.

## Credentials And Region

App Runner is regional. Pass `region` explicitly and make sure the service ARN, ECR image, VPC connector, and custom domain workflow all belong to the same AWS Region unless the AWS API explicitly says otherwise.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=dev

export APP_RUNNER_SERVICE_ARN=arn:aws:apprunner:us-east-1:123456789012:service/my-service/0123456789abcdef
export APP_RUNNER_CONNECTION_ARN=arn:aws:apprunner:us-east-1:123456789012:connection/my-github-connection/e7656250f67242d7819feade6800f59e
export APP_RUNNER_ECR_ACCESS_ROLE_ARN=arn:aws:iam::123456789012:role/my-app-runner-ecr-role
export APP_RUNNER_IMAGE_URI=123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
export APP_RUNNER_CUSTOM_DOMAIN=api.example.com
```

The SDK uses the standard AWS credential provider chain in Node.js, including environment variables, shared AWS config files, IAM roles, and other standard AWS sources.

## Client Initialization

```javascript
import { AppRunnerClient } from "@aws-sdk/client-apprunner";

export const apprunner = new AppRunnerClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you need explicit static credentials, pass a `credentials` object to `AppRunnerClient`, but the default provider chain is the normal setup for local development and AWS-hosted workloads.

## Common Workflows

### List services

`ListServices` returns summary objects only. Use `DescribeService` when you need the full source, instance, networking, or health-check configuration.

```javascript
import {
  AppRunnerClient,
  ListServicesCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

let nextToken;

do {
  const page = await client.send(
    new ListServicesCommand({
      MaxResults: 20,
      NextToken: nextToken,
    }),
  );

  for (const service of page.ServiceSummaryList ?? []) {
    console.log({
      serviceName: service.ServiceName,
      serviceArn: service.ServiceArn,
      status: service.Status,
      serviceUrl: service.ServiceUrl,
    });
  }

  nextToken = page.NextToken;
} while (nextToken);
```

### Describe a service

```javascript
import {
  AppRunnerClient,
  DescribeServiceCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const response = await client.send(
  new DescribeServiceCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
  }),
);

console.log({
  serviceName: response.Service?.ServiceName,
  status: response.Service?.Status,
  serviceUrl: response.Service?.ServiceUrl,
  sourceConfiguration: response.Service?.SourceConfiguration,
  instanceConfiguration: response.Service?.InstanceConfiguration,
});
```

### Create a service from a GitHub repository

For source-code services, App Runner needs a connection ARN. If `CodeConfiguration.ConfigurationSource` is `API`, App Runner uses the values you send in `CodeConfigurationValues`. If it is `REPOSITORY`, App Runner reads `apprunner.yaml` from the repository and ignores `CodeConfigurationValues`.

```javascript
import {
  AppRunnerClient,
  CreateServiceCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const response = await client.send(
  new CreateServiceCommand({
    ServiceName: "nodejs-web-app",
    SourceConfiguration: {
      AuthenticationConfiguration: {
        ConnectionArn: process.env.APP_RUNNER_CONNECTION_ARN,
      },
      AutoDeploymentsEnabled: true,
      CodeRepository: {
        RepositoryUrl: "https://github.com/your-org/your-repo",
        SourceCodeVersion: {
          Type: "BRANCH",
          Value: "main",
        },
        SourceDirectory: "/",
        CodeConfiguration: {
          ConfigurationSource: "API",
          CodeConfigurationValues: {
            Runtime: "NODEJS_22",
            BuildCommand: "npm ci",
            StartCommand: "npm start",
            Port: "3000",
            RuntimeEnvironmentVariables: {
              NODE_ENV: "production",
            },
          },
        },
      },
    },
    InstanceConfiguration: {
      Cpu: "1 vCPU",
      Memory: "2 GB",
    },
    HealthCheckConfiguration: {
      Protocol: "HTTP",
      Path: "/health",
    },
  }),
);

console.log(response.Service?.ServiceArn);
console.log(response.OperationId);
```

### Create a service from an ECR image

For private ECR repositories, send `AuthenticationConfiguration.AccessRoleArn`. The App Runner API documents that this role is required for ECR, but not for ECR Public.

```javascript
import {
  AppRunnerClient,
  CreateServiceCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const response = await client.send(
  new CreateServiceCommand({
    ServiceName: "container-web-app",
    SourceConfiguration: {
      AuthenticationConfiguration: {
        AccessRoleArn: process.env.APP_RUNNER_ECR_ACCESS_ROLE_ARN,
      },
      AutoDeploymentsEnabled: true,
      ImageRepository: {
        ImageIdentifier: process.env.APP_RUNNER_IMAGE_URI,
        ImageRepositoryType: "ECR",
        ImageConfiguration: {
          Port: "8080",
          RuntimeEnvironmentVariables: {
            NODE_ENV: "production",
          },
        },
      },
    },
    InstanceConfiguration: {
      Cpu: "1 vCPU",
      Memory: "2 GB",
    },
    HealthCheckConfiguration: {
      Protocol: "HTTP",
      Path: "/health",
    },
  }),
);

console.log(response.Service?.ServiceArn);
console.log(response.OperationId);
```

### Start a deployment and wait for the async operation

`CreateService`, `UpdateService`, `PauseService`, `ResumeService`, `DeleteService`, and `StartDeployment` are asynchronous. Track the returned `OperationId` with `ListOperations`.

```javascript
import { setTimeout as sleep } from "node:timers/promises";
import {
  AppRunnerClient,
  ListOperationsCommand,
  StartDeploymentCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

async function waitForOperation(serviceArn, operationId) {
  for (;;) {
    const response = await client.send(
      new ListOperationsCommand({
        ServiceArn: serviceArn,
        MaxResults: 20,
      }),
    );

    const operation = (response.OperationSummaryList ?? []).find(
      (item) => item.Id === operationId,
    );

    if (!operation) {
      await sleep(5000);
      continue;
    }

    if (operation.Status === "SUCCEEDED") {
      return operation;
    }

    if (
      operation.Status === "FAILED" ||
      operation.Status === "ROLLBACK_FAILED"
    ) {
      throw new Error(
        `App Runner operation ${operation.Id} failed with status ${operation.Status}`,
      );
    }

    await sleep(5000);
  }
}

const deployment = await client.send(
  new StartDeploymentCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
  }),
);

await waitForOperation(
  process.env.APP_RUNNER_SERVICE_ARN,
  deployment.OperationId,
);
```

### Update service settings

`UpdateService` lets you change the source configuration, instance size, health checks, scaling configuration association, networking, and observability settings.

```javascript
import {
  AppRunnerClient,
  UpdateServiceCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const response = await client.send(
  new UpdateServiceCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
    InstanceConfiguration: {
      Cpu: "2 vCPU",
      Memory: "4 GB",
    },
    HealthCheckConfiguration: {
      Protocol: "HTTP",
      Path: "/readyz",
      Interval: 10,
      Timeout: 5,
      HealthyThreshold: 1,
      UnhealthyThreshold: 5,
    },
  }),
);

console.log(response.OperationId);
console.log(response.Service?.Status);
```

### Pause and resume a service

```javascript
import {
  AppRunnerClient,
  PauseServiceCommand,
  ResumeServiceCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const paused = await client.send(
  new PauseServiceCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
  }),
);

console.log(paused.OperationId);
console.log(paused.Service?.Status);

const resumed = await client.send(
  new ResumeServiceCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
  }),
);

console.log(resumed.OperationId);
console.log(resumed.Service?.Status);
```

### Associate a custom domain and inspect DNS validation

The association response gives you the App Runner DNS target and certificate validation records. Publish the returned CNAME records in DNS, then call `DescribeCustomDomains` until the domain status becomes `ACTIVE`.

```javascript
import {
  AppRunnerClient,
  AssociateCustomDomainCommand,
  DescribeCustomDomainsCommand,
} from "@aws-sdk/client-apprunner";

const client = new AppRunnerClient({ region: process.env.AWS_REGION });

const association = await client.send(
  new AssociateCustomDomainCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
    DomainName: process.env.APP_RUNNER_CUSTOM_DOMAIN,
    EnableWWWSubdomain: true,
  }),
);

console.log("service target", association.DNSTarget);

for (const record of association.CustomDomain?.CertificateValidationRecords ?? []) {
  console.log(record.Name, record.Type, record.Value, record.Status);
}

const domains = await client.send(
  new DescribeCustomDomainsCommand({
    ServiceArn: process.env.APP_RUNNER_SERVICE_ARN,
  }),
);

for (const domain of domains.CustomDomains ?? []) {
  console.log(domain.DomainName, domain.Status);
}
```

## App Runner-Specific Notes

- `CreateService` requires `ServiceName` and `SourceConfiguration`.
- `SourceConfiguration` must include exactly one of `CodeRepository` or `ImageRepository`.
- For GitHub source repositories, send `AuthenticationConfiguration.ConnectionArn`.
- For private ECR images, send `AuthenticationConfiguration.AccessRoleArn`; ECR Public does not require it.
- `AutoDeploymentsEnabled` defaults depend on the source. The App Runner API documents `false` for ECR Public and cross-account ECR, and `true` for code repositories and same-account ECR.
- Code-repository services can use `ConfigurationSource: "REPOSITORY"` to read `apprunner.yaml`, or `"API"` to use `CodeConfigurationValues` from your SDK request.
- `ImageConfiguration.Port` and `CodeConfigurationValues.Port` default to `8080` when omitted.
- `NetworkConfiguration.EgressConfiguration.EgressType` is `DEFAULT` for public outbound access and `VPC` when you attach a VPC connector.
- `IngressConfiguration.IsPubliclyAccessible: false` makes the service private to an Amazon VPC.
- `IpAddressType` defaults to `IPV4`; the current API also supports `DUAL_STACK`.
- The current App Runner runtime enum includes `NODEJS_18` and `NODEJS_22` for code-repository services.

## Common Pitfalls

- Assuming async operations finish when the initial API call returns. Use `OperationId` plus `ListOperations`.
- Sending both `CodeRepository` and `ImageRepository` in one request.
- Sending `CodeConfigurationValues` while expecting `apprunner.yaml` to apply. `ConfigurationSource` decides which source wins.
- Using a service ARN from one Region with a client configured for another Region.
- Forgetting the ECR access role for private images.
- Expecting `ListServices` to return the full service configuration. Use `DescribeService` for the full shape.
- Treating environment variables and secrets as arrays. In the current API model, `RuntimeEnvironmentVariables` and `RuntimeEnvironmentSecrets` are key-value maps.

## Official Sources

- Maintainer package source: `https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-apprunner`
- npm package page: `https://www.npmjs.com/package/@aws-sdk/client-apprunner`
- AWS App Runner API reference: `https://docs.aws.amazon.com/apprunner/latest/api/`
- AWS CLI App Runner reference: `https://docs.aws.amazon.com/cli/latest/reference/apprunner/`
