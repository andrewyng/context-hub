---
name: appsync
description: "AWS SDK for JavaScript v3 client for managing AWS AppSync GraphQL APIs and related AppSync resources"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,appsync,graphql,realtime,serverless"
---

# AWS AppSync SDK for JavaScript (v3)

Use `@aws-sdk/client-appsync` to manage AppSync resources from JavaScript or TypeScript. This package is the AppSync control-plane client: it creates and updates APIs, schemas, auth settings, API keys, data sources, resolvers, and related resources. It does not execute GraphQL operations against your deployed endpoint.

## Golden Rules

- Install `@aws-sdk/client-appsync`, not the legacy `aws-sdk` v2 package.
- Prefer `AppSyncClient` plus individual commands over the aggregated service client.
- Set `region` explicitly or provide it through standard AWS configuration.
- Creating a GraphQL API and creating an API key are separate steps.
- `StartSchemaCreationCommand` is asynchronous; poll `GetSchemaCreationStatusCommand` until it succeeds or fails.
- `PutGraphqlApiEnvironmentVariablesCommand` replaces the full environment-variable map for the API, so read the current values first if you need to merge.
- Current AppSync package versions expose both classic GraphQL API commands such as `CreateGraphqlApiCommand` and newer AppSync Events commands such as `CreateApiCommand` and `CreateChannelNamespaceCommand`.

## Install

```bash
npm install @aws-sdk/client-appsync
```

If you want to supply non-default credentials in code, install the AWS credential helpers you actually use. For many Node.js apps, the built-in default credential chain is enough.

## Prerequisites

AppSync is regional. Set AWS credentials and a region before creating the client.

```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..." # optional
```

If you use named profiles locally, `AWS_PROFILE` also works with the standard AWS SDK credential chain.

## Client Setup

### Minimal Node.js client

```javascript
import { AppSyncClient } from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

### Explicit credentials

```javascript
import { AppSyncClient } from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});
```

## Core Usage Pattern

AWS SDK v3 clients use `client.send(new Command(input))`.

```javascript
import {
  AppSyncClient,
  GetGraphqlApiCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });

const response = await appsync.send(
  new GetGraphqlApiCommand({
    apiId: "abc123def456",
  }),
);

console.log(response.graphqlApi);
```

## Common Workflows

### List GraphQL APIs with pagination

```javascript
import {
  AppSyncClient,
  ListGraphqlApisCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });

let nextToken;

do {
  const response = await appsync.send(
    new ListGraphqlApisCommand({
      maxResults: 25,
      nextToken,
    }),
  );

  for (const api of response.graphqlApis ?? []) {
    console.log(api.apiId, api.name, api.authenticationType);
  }

  nextToken = response.nextToken;
} while (nextToken);
```

### Get one API by ID

```javascript
import {
  AppSyncClient,
  GetGraphqlApiCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });

const { graphqlApi } = await appsync.send(
  new GetGraphqlApiCommand({
    apiId: "abc123def456",
  }),
);

console.log({
  apiId: graphqlApi?.apiId,
  name: graphqlApi?.name,
  authenticationType: graphqlApi?.authenticationType,
  uris: graphqlApi?.uris,
});
```

The returned `graphqlApi` object includes the API ID, auth settings, ARN, and endpoint URI map.

### Create a GraphQL API

```javascript
import {
  AppSyncClient,
  CreateGraphqlApiCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });

const { graphqlApi } = await appsync.send(
  new CreateGraphqlApiCommand({
    name: "orders-api",
    authenticationType: "API_KEY",
    xrayEnabled: true,
  }),
);

console.log(graphqlApi?.apiId);
```

`name` and `authenticationType` are required. Valid auth modes in the current service model are `API_KEY`, `AWS_IAM`, `AMAZON_COGNITO_USER_POOLS`, `OPENID_CONNECT`, and `AWS_LAMBDA`.

### Upload a schema and wait for completion

`StartSchemaCreationCommand` accepts the GraphQL schema as bytes and starts an asynchronous job.

```javascript
import {
  AppSyncClient,
  GetSchemaCreationStatusCommand,
  StartSchemaCreationCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });

const apiId = "abc123def456";

const schema = /* GraphQL */ `
  type Query {
    hello: String
  }

  schema {
    query: Query
  }
`;

await appsync.send(
  new StartSchemaCreationCommand({
    apiId,
    definition: Buffer.from(schema, "utf8"),
  }),
);

for (;;) {
  const { status, details } = await appsync.send(
    new GetSchemaCreationStatusCommand({ apiId }),
  );

  if (status === "SUCCESS") {
    break;
  }

  if (status === "FAILED") {
    throw new Error(details ?? "Schema creation failed");
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
}
```

### Create and list API keys

If your GraphQL API uses `API_KEY` auth, create a key after the API exists.

```javascript
import {
  AppSyncClient,
  CreateApiKeyCommand,
  ListApiKeysCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });
const apiId = "abc123def456";

const { apiKey } = await appsync.send(
  new CreateApiKeyCommand({
    apiId,
    description: "web-client-dev",
  }),
);

console.log(apiKey?.id, apiKey?.expires);

const { apiKeys } = await appsync.send(
  new ListApiKeysCommand({
    apiId,
    maxResults: 25,
  }),
);

for (const key of apiKeys ?? []) {
  console.log(key.id, key.description, key.expires, key.deletes);
}
```

If you omit `expires`, AppSync uses the service default. When you provide `expires`, pass seconds since the Unix epoch; AppSync rounds that value down to the nearest hour.

### Read and update GraphQL API environment variables safely

`PutGraphqlApiEnvironmentVariablesCommand` overwrites the full map, so read the current values first when you want to add or update one key.

```javascript
import {
  AppSyncClient,
  GetGraphqlApiEnvironmentVariablesCommand,
  PutGraphqlApiEnvironmentVariablesCommand,
} from "@aws-sdk/client-appsync";

const appsync = new AppSyncClient({ region: "us-east-1" });
const apiId = "abc123def456";

const current = await appsync.send(
  new GetGraphqlApiEnvironmentVariablesCommand({ apiId }),
);

await appsync.send(
  new PutGraphqlApiEnvironmentVariablesCommand({
    apiId,
    environmentVariables: {
      ...(current.environmentVariables ?? {}),
      ORDERS_TABLE: "orders-dev",
      STAGE: "dev",
    },
  }),
);
```

Environment-variable keys must start with a letter, be at least two characters long, use only letters, numbers, and underscores, and AppSync allows up to 50 key-value pairs per GraphQL API.

## Related Control-Plane Commands

The same package also includes commands for other AppSync resources. Common examples in the current model include:

- `CreateDataSourceCommand`, `ListDataSourcesCommand`, `GetDataSourceCommand`
- `CreateResolverCommand`, `ListResolversCommand`, `GetResolverCommand`
- `CreateFunctionCommand`, `ListFunctionsCommand`
- `EvaluateMappingTemplateCommand` and `EvaluateCodeCommand`
- `CreateApiCommand`, `ListApisCommand`, and `CreateChannelNamespaceCommand` for newer AppSync Events resources

When you create resolvers with inline code, the service model requires a `runtime` object and the runtime name must be `APPSYNC_JS`. When you use mapping templates instead, pass `requestMappingTemplate` and `responseMappingTemplate` strings.

## Pitfalls

- This package manages AppSync resources. Use your GraphQL HTTP client against the deployed endpoint for runtime queries and mutations.
- `StartSchemaCreationCommand` is not synchronous. Always poll `GetSchemaCreationStatusCommand` before assuming the schema is ready.
- API keys are separate resources. Setting `authenticationType: "API_KEY"` on the API does not create a key for clients automatically.
- `PutGraphqlApiEnvironmentVariablesCommand` replaces the entire environment-variable map, not a single key.
- API key `expires` and `deletes` values are epoch seconds, and AppSync documents expiration handling at hour granularity.
- Data sources that access AWS services typically require `serviceRoleArn`; AppSync assumes that IAM role when accessing the backing service.
- `visibility` defaults to `GLOBAL` when you do not provide it, and the service model documents that this setting cannot be changed after API creation.

## Version Notes

- This guide targets `@aws-sdk/client-appsync` version `3.1007.0`.
- The current AppSync service model includes both legacy GraphQL API operations such as `CreateGraphqlApi` and newer API or channel-namespace operations such as `CreateApi` and `CreateChannelNamespace`.

## Official Sources

- AWS SDK for JavaScript v3 AppSync client docs: `https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/appsync/`
- AWS AppSync API Reference: `https://docs.aws.amazon.com/appsync/latest/APIReference/Welcome.html`
- AWS SDK for JavaScript v3 credential configuration for Node.js: `https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html`
