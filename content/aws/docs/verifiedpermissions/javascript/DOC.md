---
name: verifiedpermissions
description: "AWS SDK for JavaScript v3 client for Amazon Verified Permissions policy stores, Cedar policies, identity sources, and authorization decisions."
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,verifiedpermissions,authorization,cedar,javascript,nodejs"
---

# `@aws-sdk/client-verifiedpermissions`

Use this package for Amazon Verified Permissions in JavaScript and Node.js. The main workflows are creating a policy store, uploading a Cedar schema, creating policies or policy templates, configuring an identity source, and making authorization decisions with `IsAuthorized` or `IsAuthorizedWithToken`.

## Install

```bash
npm install @aws-sdk/client-verifiedpermissions
```

## Initialize the client

Typical local environment:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
# export AWS_SESSION_TOKEN=...   # if you use temporary credentials
```

```javascript
import { VerifiedPermissionsClient } from "@aws-sdk/client-verifiedpermissions";

const verifiedPermissions = new VerifiedPermissionsClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});
```

Use command imports plus `client.send(...)` for normal SDK v3 usage.

## Core workflow

The usual setup order is:

1. Create a policy store.
2. Put a Cedar schema into that store.
3. Create static or template-linked policies.
4. Call `IsAuthorized` or `IsAuthorizedWithToken` from your application.

Verified Permissions is eventually consistent, so new or updated stores, schemas, policies, templates, and identity sources can take a few seconds to appear in later reads and authorization results.

### Create a policy store

`validationSettings` is required. Use `STRICT` if you want policy submissions validated against your Cedar schema.

```javascript
import {
  CreatePolicyStoreCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const createStoreResponse = await client.send(
  new CreatePolicyStoreCommand({
    validationSettings: {
      mode: "STRICT",
    },
    description: "Application authorization store",
    deletionProtection: "ENABLED",
    tags: {
      project: "docs-app",
      environment: "dev",
    },
  }),
);

const policyStoreId = createStoreResponse.policyStoreId;
console.log(policyStoreId);
```

Verified Permissions currently supports only one Cedar namespace per policy store.

### Put or update the Cedar schema

`PutSchema` accepts the schema as a Cedar JSON string. Keeping the schema in a file is usually easier than embedding it inline.

```javascript
import { readFileSync } from "node:fs";
import {
  PutSchemaCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

await client.send(
  new PutSchemaCommand({
    policyStoreId,
    definition: {
      cedarJson: readFileSync("./cedar-schema.json", "utf8"),
    },
  }),
);
```

Schema changes validate policies and templates submitted after the change. Existing policies and templates are not re-evaluated until you update them later.

### Create a static policy

Static policies carry the Cedar statement directly in the request.

```javascript
import {
  CreatePolicyCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const createPolicyResponse = await client.send(
  new CreatePolicyCommand({
    policyStoreId,
    definition: {
      static: {
        description: "Allow a user to view one document",
        statement:
          'permit(principal == App::User::"user-123", action == App::Action::"view", resource == App::Document::"doc-456");',
      },
    },
  }),
);

console.log(createPolicyResponse.policyId);
```

To create a policy linked to a template instead, use `definition.templateLinked` with a `policyTemplateId` plus the principal and resource that should fill the template placeholders.

### Check an authorization decision

Use `IsAuthorized` when your application already knows the principal and can provide any needed entities and request context directly.

```javascript
import {
  IsAuthorizedCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const decision = await client.send(
  new IsAuthorizedCommand({
    policyStoreId,
    principal: {
      entityType: "App::User",
      entityId: "user-123",
    },
    action: {
      actionType: "App::Action",
      actionId: "view",
    },
    resource: {
      entityType: "App::Document",
      entityId: "doc-456",
    },
    context: {
      contextMap: {
        requestIp: { string: "203.0.113.10" },
        isInternal: { boolean: false },
      },
    },
  }),
);

console.log(decision.decision);
console.log(decision.determiningPolicies);
console.log(decision.errors);
```

The response includes the final `decision`, the `determiningPolicies` list, and any evaluation `errors` such as missing entities or attributes referenced by a policy.

### Pass entities for group membership and attributes

If your policies depend on entity attributes or parent relationships, include an `entities` slice with the request.

```javascript
import {
  IsAuthorizedCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const response = await client.send(
  new IsAuthorizedCommand({
    policyStoreId,
    principal: {
      entityType: "App::User",
      entityId: "user-123",
    },
    action: {
      actionType: "App::Action",
      actionId: "edit",
    },
    resource: {
      entityType: "App::Document",
      entityId: "doc-456",
    },
    entities: {
      entityList: [
        {
          identifier: {
            entityType: "App::User",
            entityId: "user-123",
          },
          attributes: {
            department: { string: "engineering" },
          },
          parents: [
            {
              entityType: "App::Group",
              entityId: "editors",
            },
          ],
        },
        {
          identifier: {
            entityType: "App::Document",
            entityId: "doc-456",
          },
          attributes: {
            owner: {
              entityIdentifier: {
                entityType: "App::User",
                entityId: "user-123",
              },
            },
          },
        },
      ],
    },
  }),
);

console.log(response.decision);
```

`context` and `entities` also accept a raw Cedar JSON string through `cedarJson` if you already build those payloads elsewhere.

## JWT-based authorization with an identity source

Use an identity source when the principal should come from an Amazon Cognito user pool or an OpenID Connect provider and you want the application to authorize requests with tokens.

### Create an OIDC identity source

```javascript
import {
  CreateIdentitySourceCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const identitySource = await client.send(
  new CreateIdentitySourceCommand({
    policyStoreId,
    principalEntityType: "App::User",
    configuration: {
      openIdConnectConfiguration: {
        issuer: "https://issuer.example.com",
        entityIdPrefix: "ExampleOIDC",
        groupConfiguration: {
          groupClaim: "groups",
          groupEntityType: "App::Group",
        },
        tokenSelection: {
          accessTokenOnly: {
            principalIdClaim: "sub",
            audiences: ["api://documents"],
          },
        },
      },
    },
  }),
);

console.log(identitySource.identitySourceId);
```

For OIDC, configure either `accessTokenOnly` or `identityTokenOnly` in `tokenSelection`, depending on which token type your application will send for authorization.

### Authorize with a token

```javascript
import {
  IsAuthorizedWithTokenCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

const result = await client.send(
  new IsAuthorizedWithTokenCommand({
    policyStoreId,
    accessToken: bearerToken,
    action: {
      actionType: "App::Action",
      actionId: "view",
    },
    resource: {
      entityType: "App::Document",
      entityId: "doc-456",
    },
    context: {
      contextMap: {
        requestTime: { datetime: new Date().toISOString() },
      },
    },
  }),
);

console.log(result.principal);
console.log(result.decision);
```

Verified Permissions validates the token signature and expiration on each call. Tokens remain usable until they expire; token revocation and resource deletion do not invalidate a token already accepted by the policy store.

## List policies

List APIs are paginated with `nextToken`.

```javascript
import {
  ListPoliciesCommand,
  VerifiedPermissionsClient,
} from "@aws-sdk/client-verifiedpermissions";

const client = new VerifiedPermissionsClient({ region: "us-east-1" });

let nextToken;

do {
  const page = await client.send(
    new ListPoliciesCommand({
      policyStoreId,
      maxResults: 50,
      nextToken,
    }),
  );

  for (const policy of page.policies ?? []) {
    console.log(policy.policyId, policy.policyType, policy.effect);
  }

  nextToken = page.nextToken;
} while (nextToken);
```

The same `nextToken` pattern applies to `ListIdentitySources`, `ListPolicyStores`, and `ListPolicyTemplates`.

## Important behavior and pitfalls

- A policy store supports only one Cedar namespace.
- Verified Permissions is eventually consistent after creates and updates. If you create a store, schema, policy, template, or identity source and then immediately read or authorize, add retry or short backoff logic.
- `PutSchema` affects validation for new or updated policies and templates only. Existing items are not revalidated until they are updated.
- `UpdatePolicy` can modify only static policies. It cannot convert a static policy to a template-linked one, and it cannot change the effect, principal, or resource of a static policy.
- `BatchIsAuthorized` accepts up to 30 requests per call, and either the principal or the resource must be identical across the whole batch.
- `DeletePolicyStore` is idempotent. Deleting a store that does not exist still returns HTTP 200.

## Minimal command reference

- Store setup: `CreatePolicyStoreCommand`, `PutSchemaCommand`, `GetPolicyStoreCommand`, `UpdatePolicyStoreCommand`
- Policies: `CreatePolicyCommand`, `GetPolicyCommand`, `ListPoliciesCommand`, `UpdatePolicyCommand`, `DeletePolicyCommand`
- Templates: `CreatePolicyTemplateCommand`, `GetPolicyTemplateCommand`, `ListPolicyTemplatesCommand`, `UpdatePolicyTemplateCommand`, `DeletePolicyTemplateCommand`
- Identity sources: `CreateIdentitySourceCommand`, `GetIdentitySourceCommand`, `ListIdentitySourcesCommand`, `UpdateIdentitySourceCommand`, `DeleteIdentitySourceCommand`
- Authorization: `IsAuthorizedCommand`, `IsAuthorizedWithTokenCommand`, `BatchIsAuthorizedCommand`, `BatchIsAuthorizedWithTokenCommand`
