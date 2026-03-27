---
name: marketplace-catalog
description: "AWS SDK for JavaScript v3 client for AWS Marketplace Catalog entity lookups, change sets, tagging, and resource policies"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,marketplace,marketplace-catalog,javascript,nodejs"
---

# `@aws-sdk/client-marketplace-catalog`

Use this package for AWS Marketplace Catalog API operations from JavaScript or TypeScript. The common flow is:

1. list or describe catalog entities
2. submit a change set
3. poll the change set until it reaches a terminal status

For the operations in this client, `Catalog` is the fixed string `AWSMarketplace`.

## Install

```bash
npm install @aws-sdk/client-marketplace-catalog
```

## Credentials and region

This client uses the normal AWS SDK for JavaScript v3 credential resolution flow. In Node.js, that usually means environment variables, shared AWS config, IAM Identity Center, or an attached IAM role.

Typical local setup:

```bash
export AWS_REGION=us-east-1
export AWS_PROFILE=my-marketplace-profile
```

If you use static credentials instead:

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

## Initialize the client

```javascript
import { MarketplaceCatalogClient } from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";
```

## List entities

`ListEntities` returns summaries for one entity type at a time. Valid `EntityType` values documented in the service model include `AmiProduct`, `ContainerProduct`, `DataProduct`, `SaaSProduct`, `Offer`, `OfferSet`, `ResaleAuthorization`, and `Solution`.

```javascript
import {
  MarketplaceCatalogClient,
  ListEntitiesCommand,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function listOffers() {
  let nextToken;

  do {
    const page = await marketplaceCatalog.send(
      new ListEntitiesCommand({
        Catalog: CATALOG,
        EntityType: "Offer",
        MaxResults: 20,
        OwnershipType: "SELF",
        Sort: {
          SortBy: "LastModifiedDate",
          SortOrder: "DESCENDING",
        },
        NextToken: nextToken,
      }),
    );

    for (const entity of page.EntitySummaryList ?? []) {
      console.log(entity.EntityId, entity.Name, entity.Visibility);
    }

    nextToken = page.NextToken;
  } while (nextToken);
}
```

Notes:

- `MaxResults` for `ListEntities` is 1-50.
- Generic `FilterList` on `ListEntities` is for `EntityId` filtering. For richer filtering, use `EntityTypeFilters` with the specific entity family.
- `OwnershipType` defaults to `SELF`. Use `SHARED` for entities shared through AWS RAM.

## Describe one entity

`DescribeEntity` returns full details for a single entity ID.

```javascript
import {
  DescribeEntityCommand,
  MarketplaceCatalogClient,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function describeEntity(entityId) {
  const response = await marketplaceCatalog.send(
    new DescribeEntityCommand({
      Catalog: CATALOG,
      EntityId: entityId,
    }),
  );

  const details = response.DetailsDocument ?? JSON.parse(response.Details ?? "{}");

  console.log(response.EntityType);
  console.log(response.EntityIdentifier);
  console.log(response.LastModifiedDate);
  console.dir(details, { depth: null });
}
```

Important response fields:

- `EntityType` is returned as `EntityType@Version`.
- `EntityIdentifier` is returned as `EntityId@RevisionId`.
- `DetailsDocument` is already structured JSON. `Details` is the stringified JSON form.

## Describe multiple entities in one request

Use `BatchDescribeEntities` when you already know the entity IDs.

```javascript
import {
  BatchDescribeEntitiesCommand,
  MarketplaceCatalogClient,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function batchDescribe(entityIds) {
  const response = await marketplaceCatalog.send(
    new BatchDescribeEntitiesCommand({
      EntityRequestList: entityIds.map((entityId) => ({
        Catalog: CATALOG,
        EntityId: entityId,
      })),
    }),
  );

  for (const [entityId, entity] of Object.entries(response.EntityDetails ?? {})) {
    console.log(entityId, entity.EntityType, entity.EntityIdentifier);
  }

  for (const [entityId, error] of Object.entries(response.Errors ?? {})) {
    console.error(entityId, error.ErrorCode, error.ErrorMessage);
  }
}
```

## Start a change set

`StartChangeSet` is the write path for Marketplace Catalog updates. The outer request shape is stable, but the contents of each change's `DetailsDocument` depend on the entity type and change type you are using.

The service supports both `Intent: "VALIDATE"` and `Intent: "APPLY"`. If you omit `Intent`, the service treats it as `APPLY`.

```javascript
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import {
  MarketplaceCatalogClient,
  StartChangeSetCommand,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function startChangeSet() {
  const detailsDocument = JSON.parse(
    await readFile("./changeset-details.json", "utf8"),
  );

  const response = await marketplaceCatalog.send(
    new StartChangeSetCommand({
      Catalog: CATALOG,
      Intent: "VALIDATE",
      ChangeSetName: "example-change-set",
      ClientRequestToken: randomUUID(),
      ChangeSet: [
        {
          ChangeType: process.env.MARKETPLACE_CHANGE_TYPE,
          Entity: {
            Type: process.env.MARKETPLACE_ENTITY_TYPE,
            Identifier: process.env.MARKETPLACE_ENTITY_IDENTIFIER,
          },
          DetailsDocument: detailsDocument,
          ChangeName: "primary-change",
        },
      ],
    }),
  );

  console.log(response.ChangeSetId);
  console.log(response.ChangeSetArn);
}
```

Use this environment alongside the example above:

```bash
export MARKETPLACE_CHANGE_TYPE=YOUR_CHANGE_TYPE
export MARKETPLACE_ENTITY_TYPE=YOUR_ENTITY_TYPE_WITH_VERSION
export MARKETPLACE_ENTITY_IDENTIFIER=YOUR_ENTITY_ID_OR_ENTITY_ID_AT_REVISION
```

Keep in mind:

- A single request can include 1-20 changes.
- Each change requires `ChangeType` and `Entity`.
- Use `DetailsDocument` for JSON input or `Details` for stringified JSON, but not both on the same change.
- `ClientRequestToken` is the idempotency token for safe retries.

## Poll a change set until it finishes

`DescribeChangeSet` is how you track the asynchronous workflow.

```javascript
import {
  DescribeChangeSetCommand,
  MarketplaceCatalogClient,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForChangeSet(changeSetId) {
  while (true) {
    const response = await marketplaceCatalog.send(
      new DescribeChangeSetCommand({
        Catalog: CATALOG,
        ChangeSetId: changeSetId,
      }),
    );

    console.log(response.Status, response.FailureCode, response.FailureDescription);

    if (
      response.Status === "SUCCEEDED" ||
      response.Status === "FAILED" ||
      response.Status === "CANCELLED"
    ) {
      for (const change of response.ChangeSet ?? []) {
        for (const error of change.ErrorDetailList ?? []) {
          console.error(change.ChangeName ?? change.ChangeType, error.ErrorCode, error.ErrorMessage);
        }
      }

      return response;
    }

    await sleep(10_000);
  }
}
```

Change set statuses are `PREPARING`, `APPLYING`, `SUCCEEDED`, `CANCELLED`, and `FAILED`.

## Cancel an in-flight change set

```javascript
import {
  CancelChangeSetCommand,
  MarketplaceCatalogClient,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function cancelChangeSet(changeSetId) {
  await marketplaceCatalog.send(
    new CancelChangeSetCommand({
      Catalog: CATALOG,
      ChangeSetId: changeSetId,
    }),
  );
}
```

## List recent change sets

Use `ListChangeSets` when you need audit-style visibility into recent work.

```javascript
import {
  ListChangeSetsCommand,
  MarketplaceCatalogClient,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

const CATALOG = "AWSMarketplace";

async function listRecentChangeSets() {
  let nextToken;

  do {
    const page = await marketplaceCatalog.send(
      new ListChangeSetsCommand({
        Catalog: CATALOG,
        MaxResults: 20,
        Sort: {
          SortBy: "StartTime",
          SortOrder: "DESCENDING",
        },
        NextToken: nextToken,
      }),
    );

    for (const item of page.ChangeSetSummaryList ?? []) {
      console.log(item.ChangeSetId, item.ChangeSetName, item.Status, item.StartTime);
    }

    nextToken = page.NextToken;
  } while (nextToken);
}
```

`ListChangeSets` supports filtering by `ChangeSetName`, `Status`, `EntityId`, `BeforeStartTime`, `AfterStartTime`, `BeforeEndTime`, and `AfterEndTime` through `FilterList`.

## Tags and resource policies

This client also supports tagging and per-resource policy management.

```javascript
import {
  GetResourcePolicyCommand,
  ListTagsForResourceCommand,
  MarketplaceCatalogClient,
  PutResourcePolicyCommand,
  TagResourceCommand,
  UntagResourceCommand,
} from "@aws-sdk/client-marketplace-catalog";

const marketplaceCatalog = new MarketplaceCatalogClient({
  region: process.env.AWS_REGION,
});

async function manageMetadata(resourceArn) {
  await marketplaceCatalog.send(
    new TagResourceCommand({
      ResourceArn: resourceArn,
      Tags: [
        { Key: "environment", Value: "prod" },
        { Key: "owner", Value: "marketplace-team" },
      ],
    }),
  );

  const tags = await marketplaceCatalog.send(
    new ListTagsForResourceCommand({ ResourceArn: resourceArn }),
  );

  console.log(tags.Tags);

  await marketplaceCatalog.send(
    new PutResourcePolicyCommand({
      ResourceArn: resourceArn,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [],
      }),
    }),
  );

  const policy = await marketplaceCatalog.send(
    new GetResourcePolicyCommand({ ResourceArn: resourceArn }),
  );

  console.log(policy.Policy);

  await marketplaceCatalog.send(
    new UntagResourceCommand({
      ResourceArn: resourceArn,
      TagKeys: ["owner"],
    }),
  );
}
```

`PutResourcePolicyCommand` expects `Policy` as a JSON string.

## Common gotchas

- Pass `Catalog: "AWSMarketplace"` on the catalog operations that require it.
- Prefer `DetailsDocument` over `Details` in new code so you can work with real JSON values.
- Treat `StartChangeSet` as asynchronous work. Submit, then poll with `DescribeChangeSet` until a terminal status.
- Use `Intent: "VALIDATE"` first when you are iterating on a new change payload.
- `DescribeEntity` and `BatchDescribeEntities` return entity identifiers with revision suffixes. Keep the exact returned value when you need revision-aware workflows.
- `OwnershipType: "SHARED"` only covers AWS RAM shared entities. The service model explicitly notes that entities shared via `PutResourcePolicy` are not discoverable through that flag.

## When you need the exact change payload schema

The service model exposes generic `DetailsDocument` fields, but the JSON schema inside those fields depends on the entity family and change type. For practical work, keep the SDK client docs open together with the AWS Marketplace Catalog API reference for the specific entity family you are editing.
