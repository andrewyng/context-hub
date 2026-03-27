---
name: mwaa
description: "AWS SDK for JavaScript v3 MWAA client for listing environments, reading environment details, creating Airflow login tokens, and invoking the Airflow REST API."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,mwaa,airflow,javascript,nodejs,managed-workflows"
---

# `@aws-sdk/client-mwaa`

Use this package for Amazon Managed Workflows for Apache Airflow (Amazon MWAA) operations from JavaScript or Node.js. The MWAA client lets you list environments, inspect environment status and endpoints, create short-lived Airflow login tokens, call the managed Airflow REST API, and manage environment tags.

The service model for this package also exposes `CreateEnvironmentCommand`, `UpdateEnvironmentCommand`, and `DeleteEnvironmentCommand`. `PublishMetricsCommand` exists in the API model, but AWS documents it as internal-only.

## Install

```bash
npm install @aws-sdk/client-mwaa
```

Install the credential provider helpers only if you want to force a named shared-config profile in code:

```bash
npm install @aws-sdk/credential-providers
```

## Prerequisites

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=dev
export MWAA_ENV_NAME=my-airflow-env
```

- Keep the SDK region aligned with the MWAA environment region.
- The default AWS SDK credential provider chain is usually enough in Node.js if credentials already come from environment variables, shared AWS config files, ECS, EC2, or IAM Identity Center.
- If you tag environments, the tag APIs use the environment ARN, not the environment name.

## Client Setup

Use `MWAAClient` plus explicit command imports.

```javascript
import { MWAAClient } from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

If you want to pin a named local AWS profile explicitly:

```javascript
import { fromIni } from "@aws-sdk/credential-providers";
import { MWAAClient } from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: fromIni({
    profile: process.env.AWS_PROFILE ?? "default",
  }),
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  GetEnvironmentCommand,
  MWAAClient,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Environment } = await mwaa.send(
  new GetEnvironmentCommand({
    Name: process.env.MWAA_ENV_NAME,
  }),
);

console.log(Environment?.Name);
console.log(Environment?.Status);
console.log(Environment?.AirflowVersion);
console.log(Environment?.WebserverUrl);
```

`GetEnvironmentCommand` is the best first call when you need to confirm the environment exists, check whether it is available, or retrieve the environment ARN and webserver URL for follow-up work.

## Common Workflows

### List environments

`ListEnvironmentsCommand` returns environment names only. Call `GetEnvironmentCommand` for full details.

```javascript
import {
  ListEnvironmentsCommand,
  MWAAClient,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function listAllEnvironments() {
  const names = [];
  let nextToken;

  do {
    const page = await mwaa.send(
      new ListEnvironmentsCommand({
        MaxResults: 25,
        NextToken: nextToken,
      }),
    );

    names.push(...(page.Environments ?? []));
    nextToken = page.NextToken;
  } while (nextToken);

  return names;
}

console.log(await listAllEnvironments());
```

AWS documents `MaxResults` for this operation as `1` to `25`.

### Create an Airflow CLI token

Use `CreateCliTokenCommand` when you need a short-lived token for the Airflow CLI flow.

```javascript
import {
  CreateCliTokenCommand,
  MWAAClient,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { CliToken, WebServerHostname } = await mwaa.send(
  new CreateCliTokenCommand({
    Name: process.env.MWAA_ENV_NAME,
  }),
);

if (!CliToken || !WebServerHostname) {
  throw new Error("MWAA did not return a CLI token.");
}

console.log(WebServerHostname);
```

Treat `CliToken` as secret material. Do not log or persist it outside the immediate login flow.

### Create a web login token

Use `CreateWebLoginTokenCommand` for the Airflow web UI login flow.

```javascript
import {
  CreateWebLoginTokenCommand,
  MWAAClient,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { WebToken, WebServerHostname, IamIdentity, AirflowIdentity } = await mwaa.send(
  new CreateWebLoginTokenCommand({
    Name: process.env.MWAA_ENV_NAME,
  }),
);

if (!WebToken || !WebServerHostname) {
  throw new Error("MWAA did not return a web login token.");
}

console.log(WebServerHostname);
console.log(IamIdentity);
console.log(AirflowIdentity);
```

This call can fail with `AccessDeniedException` if the caller is not allowed to create a web login token for the target environment.

### Call the Airflow REST API

Use `InvokeRestApiCommand` when you want MWAA to call the managed Airflow REST API on your behalf.

```javascript
import {
  InvokeRestApiCommand,
  MWAAClient,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const response = await mwaa.send(
  new InvokeRestApiCommand({
    Name: process.env.MWAA_ENV_NAME,
    Path: "/dags",
    Method: "GET",
    QueryParameters: {
      limit: 10,
    },
  }),
);

console.log(response.RestApiStatusCode);
console.log(response.RestApiResponse);
```

Important details:

- Pass only the Airflow path such as `/dags` or `/dags/example_dag/dagRuns`, not the full webserver URL.
- `Method` must be one of `GET`, `PUT`, `POST`, `PATCH`, or `DELETE`.
- `QueryParameters` and `Body` are JSON objects, not pre-encoded query strings.
- AWS documents this operation with dedicated REST API guidance for MWAA because the available paths and payloads come from Apache Airflow rather than the AWS SDK itself.

### Manage environment tags

The tag APIs work with the environment ARN. Fetch that ARN first if you only have the environment name.

```javascript
import {
  GetEnvironmentCommand,
  ListTagsForResourceCommand,
  MWAAClient,
  TagResourceCommand,
  UntagResourceCommand,
} from "@aws-sdk/client-mwaa";

const mwaa = new MWAAClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const { Environment } = await mwaa.send(
  new GetEnvironmentCommand({
    Name: process.env.MWAA_ENV_NAME,
  }),
);

if (!Environment?.Arn) {
  throw new Error("Environment ARN was not returned.");
}

await mwaa.send(
  new TagResourceCommand({
    ResourceArn: Environment.Arn,
    Tags: {
      Environment: "staging",
      Team: "data-platform",
    },
  }),
);

const { Tags } = await mwaa.send(
  new ListTagsForResourceCommand({
    ResourceArn: Environment.Arn,
  }),
);

console.log(Tags);

await mwaa.send(
  new UntagResourceCommand({
    ResourceArn: Environment.Arn,
    tagKeys: ["Team"],
  }),
);
```

## Errors and Operational Notes

The most common service errors documented for MWAA operations are `ResourceNotFoundException`, `ValidationException`, and `InternalServerException`. `InvokeRestApiCommand` also documents `RestApiClientException` and `RestApiServerException`.

```javascript
try {
  await mwaa.send(
    new GetEnvironmentCommand({
      Name: process.env.MWAA_ENV_NAME,
    }),
  );
} catch (error) {
  if (error?.name === "ResourceNotFoundException") {
    console.error("MWAA environment was not found in this region/account.");
  } else if (error?.name === "ValidationException") {
    console.error("The MWAA request shape or parameter values were invalid.");
  } else {
    throw error;
  }
}
```

## Pitfalls

- `PublishMetricsCommand` is in the API model, but AWS marks it as internal-only. Do not build application code around it.
- `ListEnvironmentsCommand` does not return full environment objects.
- MWAA is regional. A valid environment name in one region is not visible from another region.
- Tag operations require `ResourceArn`; they do not accept the environment name.
- For `CreateEnvironmentCommand`, the minimum request includes `Name`, `ExecutionRoleArn`, `SourceBucketArn`, `DagS3Path`, and `NetworkConfiguration`.
- `NetworkConfiguration.SubnetIds` must contain exactly two subnet IDs, and `SecurityGroupIds` must contain between one and five security group IDs.
- `UpdateEnvironmentCommand` still requires `Name`, and its network update shape accepts only `SecurityGroupIds`, not subnets.

## Useful Links

- AWS SDK for JavaScript v3 MWAA client: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/mwaa/
- MWAA API reference: https://docs.aws.amazon.com/mwaa/latest/APIReference/Welcome.html
- `CreateCliToken`: https://docs.aws.amazon.com/mwaa/latest/APIReference/API_CreateCliToken.html
- `CreateWebLoginToken`: https://docs.aws.amazon.com/mwaa/latest/APIReference/API_CreateWebLoginToken.html
- `GetEnvironment`: https://docs.aws.amazon.com/mwaa/latest/APIReference/API_GetEnvironment.html
- `ListEnvironments`: https://docs.aws.amazon.com/mwaa/latest/APIReference/API_ListEnvironments.html
- `InvokeRestApi`: https://docs.aws.amazon.com/mwaa/latest/APIReference/API_InvokeRestApi.html
- Airflow CLI token flow: https://docs.aws.amazon.com/mwaa/latest/userguide/call-mwaa-apis-cli.html
- Airflow web login token flow: https://docs.aws.amazon.com/mwaa/latest/userguide/call-mwaa-apis-web.html
- MWAA Airflow REST API guide: https://docs.aws.amazon.com/mwaa/latest/userguide/access-mwaa-apache-airflow-rest-api.html
