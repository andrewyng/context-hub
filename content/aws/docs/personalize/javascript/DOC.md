---
name: personalize
description: "Amazon Personalize control-plane SDK for JavaScript v3 guide for datasets, training jobs, and campaign management"
metadata:
  languages: "javascript"
  versions: "3.1007.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "aws,personalize,javascript,nodejs,recommendations,machine-learning,control-plane"
---

# Amazon Personalize SDK for JavaScript v3 Guide

## Golden Rule

Use `@aws-sdk/client-personalize` for Amazon Personalize **control-plane** work in JavaScript: schemas, dataset groups, datasets, import jobs, solutions, solution versions, and campaigns.

Do **not** use this package for live recommendation serving or event ingestion:

- Use `@aws-sdk/client-personalize-runtime` for `GetRecommendations` and `GetPersonalizedRanking`.
- Use `@aws-sdk/client-personalize-events` for `PutEvents`, `PutUsers`, `PutItems`, and related event APIs.

## Install

```bash
npm install @aws-sdk/client-personalize
```

Common companion packages:

```bash
npm install @aws-sdk/client-personalize-runtime @aws-sdk/client-personalize-events @aws-sdk/credential-providers
```

Examples in this guide use ESM imports and the AWS SDK v3 command pattern: `client.send(new Command(input))`.

## Credentials And Region

The client uses the normal AWS SDK for JavaScript v3 credential provider chain. For local development, set a region and either a profile or direct credentials.

Preferred local setup:

```bash
export AWS_REGION=us-west-2
export AWS_PROFILE=dev
```

Direct environment credentials also work:

```bash
export AWS_REGION=us-west-2
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
```

Amazon Personalize resources are regional. Use the same region for the client, the dataset group, and any related S3 import locations.

## Initialize The Client

```javascript
import { PersonalizeClient } from "@aws-sdk/client-personalize";

export const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});
```

For most server-side applications, one shared client instance per region is enough.

## Core Usage

### List Dataset Groups

`ListDatasetGroupsCommand` is the fastest way to confirm the account and region already contain the resources your application expects.

```javascript
import {
  ListDatasetGroupsCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

let nextToken;

do {
  const page = await personalize.send(
    new ListDatasetGroupsCommand({
      nextToken,
      maxResults: 20,
    }),
  );

  for (const group of page.datasetGroups ?? []) {
    console.log(group.name, group.datasetGroupArn, group.status);
  }

  nextToken = page.nextToken;
} while (nextToken);
```

The current service model publishes pagination for `ListDatasetGroups`, `ListDatasets`, `ListRecipes`, `ListSolutions`, `ListSolutionVersions`, and `ListCampaigns`.

### Inspect Available Recipes

For custom dataset groups, a solution needs a recipe. Start by listing service-provided recipes, then inspect the one you plan to use.

```javascript
import {
  DescribeRecipeCommand,
  ListRecipesCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const list = await personalize.send(
  new ListRecipesCommand({
    recipeProvider: "SERVICE",
    maxResults: 20,
  }),
);

for (const recipe of list.recipes ?? []) {
  console.log(recipe.name, recipe.recipeArn);
}

const recipeArn = process.env.PERSONALIZE_RECIPE_ARN;

const describe = await personalize.send(
  new DescribeRecipeCommand({ recipeArn }),
);

console.log(describe.recipe?.name);
console.log(describe.recipe?.recipeType);
console.log(describe.recipe?.status);
```

If you create a **Domain dataset group** by setting `domain` on the dataset group, your workflow changes. Domain dataset groups use domain-specific resources such as recommenders. The custom workflow below omits `domain` and uses solutions, solution versions, and campaigns.

### Create A Custom Dataset Group

```javascript
import {
  CreateDatasetGroupCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const createGroup = await personalize.send(
  new CreateDatasetGroupCommand({
    name: "movies-custom-group",
  }),
);

console.log(createGroup.datasetGroupArn);
```

If you do set `domain`, the current service model accepts `ECOMMERCE` and `VIDEO_ON_DEMAND`.

### Create A Schema And Dataset

Amazon Personalize requires schemas in **Avro JSON** format. For a custom interactions dataset, create the schema first and then create a dataset that points at it.

```javascript
import {
  CreateDatasetCommand,
  CreateSchemaCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const datasetGroupArn = process.env.PERSONALIZE_DATASET_GROUP_ARN;

const interactionsSchema = JSON.stringify({
  type: "record",
  name: "Interactions",
  namespace: "com.amazonaws.personalize.schema",
  fields: [
    { name: "USER_ID", type: "string" },
    { name: "ITEM_ID", type: "string" },
    { name: "TIMESTAMP", type: "long" },
  ],
  version: "1.0",
});

const schemaResponse = await personalize.send(
  new CreateSchemaCommand({
    name: "movies-interactions-schema",
    schema: interactionsSchema,
  }),
);

const datasetResponse = await personalize.send(
  new CreateDatasetCommand({
    name: "movies-interactions",
    datasetGroupArn,
    datasetType: "Interactions",
    schemaArn: schemaResponse.schemaArn,
  }),
);

console.log(schemaResponse.schemaArn);
console.log(datasetResponse.datasetArn);
```

For `CreateDatasetCommand`, the documented dataset types are `Interactions`, `Items`, `Users`, `Actions`, and `Action_Interactions`.

### Start A Dataset Import Job

After creating an empty dataset, import training data from Amazon S3 with `CreateDatasetImportJobCommand`. The IAM role must be able to read the S3 location.

```javascript
import {
  CreateDatasetImportJobCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const datasetArn = process.env.PERSONALIZE_DATASET_ARN;

const response = await personalize.send(
  new CreateDatasetImportJobCommand({
    jobName: "movies-interactions-import",
    datasetArn,
    dataSource: {
      dataLocation: "s3://my-personalize-data/interactions.csv",
    },
    roleArn: "arn:aws:iam::123456789012:role/PersonalizeS3ImportRole",
    importMode: "FULL",
  }),
);

console.log(response.datasetImportJobArn);
```

If you already imported bulk records before, `importMode: "INCREMENTAL"` is also available.

### Poll Long-Running Resources Until They Become Active

The current service model does not publish Personalize waiters. Poll the matching `Describe*` API until the resource becomes `ACTIVE` or fails.

```javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForActive(label, load) {
  for (;;) {
    const resource = await load();
    const status = resource?.status;

    if (status === "ACTIVE") {
      return resource;
    }

    if (status?.endsWith("FAILED")) {
      throw new Error(`${label} failed: ${resource.failureReason ?? status}`);
    }

    console.log(`${label} status: ${status ?? "UNKNOWN"}`);
    await sleep(30_000);
  }
}
```

Example for a dataset import job:

```javascript
import {
  DescribeDatasetImportJobCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const datasetImportJobArn = process.env.PERSONALIZE_DATASET_IMPORT_JOB_ARN;

const datasetImportJob = await waitForActive("dataset import job", async () => {
  const response = await personalize.send(
    new DescribeDatasetImportJobCommand({ datasetImportJobArn }),
  );

  return response.datasetImportJob;
});

console.log(datasetImportJob.status);
```

### Create A Solution, Train A Solution Version, And Deploy A Campaign

For a custom dataset group, the standard progression is:

1. Create a solution.
2. Wait for the solution to become active.
3. Create a solution version.
4. Wait for the solution version to become active.
5. Create a campaign that deploys that solution version.

```javascript
import {
  CreateCampaignCommand,
  CreateSolutionCommand,
  CreateSolutionVersionCommand,
  DescribeCampaignCommand,
  DescribeSolutionCommand,
  DescribeSolutionVersionCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const datasetGroupArn = process.env.PERSONALIZE_DATASET_GROUP_ARN;
const recipeArn = process.env.PERSONALIZE_RECIPE_ARN;

const createSolution = await personalize.send(
  new CreateSolutionCommand({
    name: "movies-user-personalization",
    datasetGroupArn,
    recipeArn,
    performAutoTraining: false,
  }),
);

const solutionArn = createSolution.solutionArn;

await waitForActive("solution", async () => {
  const response = await personalize.send(
    new DescribeSolutionCommand({ solutionArn }),
  );

  return response.solution;
});

const createSolutionVersion = await personalize.send(
  new CreateSolutionVersionCommand({
    solutionArn,
    trainingMode: "FULL",
  }),
);

const solutionVersionArn = createSolutionVersion.solutionVersionArn;

await waitForActive("solution version", async () => {
  const response = await personalize.send(
    new DescribeSolutionVersionCommand({ solutionVersionArn }),
  );

  return response.solutionVersion;
});

const createCampaign = await personalize.send(
  new CreateCampaignCommand({
    name: "movies-user-personalization-campaign",
    solutionVersionArn,
  }),
);

const campaignArn = createCampaign.campaignArn;

const campaign = await waitForActive("campaign", async () => {
  const response = await personalize.send(
    new DescribeCampaignCommand({ campaignArn }),
  );

  return response.campaign;
});

console.log(campaign.campaignArn, campaign.status);
```

`CreateSolutionCommand` defaults new solutions to automatic training. Set `performAutoTraining: false` if you do not want the solution to keep training automatically while it remains active.

### Update Or Delete A Campaign

Use `UpdateCampaignCommand` to point an existing campaign at a new solution version or to start following the latest version of a solution.

```javascript
import {
  PersonalizeClient,
  UpdateCampaignCommand,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

const campaignArn = process.env.PERSONALIZE_CAMPAIGN_ARN;
const solutionArn = process.env.PERSONALIZE_SOLUTION_ARN;

await personalize.send(
  new UpdateCampaignCommand({
    campaignArn,
    solutionVersionArn: `${solutionArn}/$LATEST`,
    campaignConfig: {
      syncWithLatestSolutionVersion: true,
    },
  }),
);
```

Delete campaigns when you no longer need them so you do not keep paying for an active deployment.

```javascript
import {
  DeleteCampaignCommand,
  PersonalizeClient,
} from "@aws-sdk/client-personalize";

const personalize = new PersonalizeClient({
  region: process.env.AWS_REGION ?? "us-west-2",
});

await personalize.send(
  new DeleteCampaignCommand({
    campaignArn: process.env.PERSONALIZE_CAMPAIGN_ARN,
  }),
);
```

## Config And Auth Notes

- `PersonalizeClient` uses the standard AWS SDK v3 credential resolution chain.
- Keep the region consistent across the client, the dataset group, and the S3 data you import.
- `CreateDatasetImportJobCommand` needs an S3 path in `dataSource.dataLocation` and an IAM role in `roleArn` that can read it.
- Reuse a single client instance instead of constructing a new one for each request.
- For custom dataset groups, omit `domain` and use solutions, solution versions, and campaigns. Setting `domain` moves you into the domain dataset group flow.

## Common Pitfalls

- Do not expect this package to return live recommendations. That is `@aws-sdk/client-personalize-runtime`.
- Do not expect imports, solution training, or campaign deployment to finish in one request. These are asynchronous operations.
- Do not skip the schema step. `CreateSchemaCommand` expects an Avro JSON schema string, and `CreateDatasetCommand` requires the schema ARN.
- Do not leave `performAutoTraining` enabled by default unless you actually want automatic retraining.
- Do not leave campaigns running after tests or one-off migrations. Active campaigns incur cost until you delete them.
- Do not hardcode AWS credentials in source files. Use environment variables, shared config, or IAM roles.

## Version Scope

- This guide targets `@aws-sdk/client-personalize@3.1007.0`.
- The current service model publishes paginators for `ListCampaigns`, `ListDatasetGroups`, `ListDatasetImportJobs`, `ListDatasets`, `ListRecipes`, `ListSchemas`, `ListSolutions`, and `ListSolutionVersions`.
- The current service model does not publish Personalize waiters, so polling `Describe*` operations is the practical status-check pattern.
- The current service model accepts dataset group domain values `ECOMMERCE` and `VIDEO_ON_DEMAND`.

## Official Sources

- AWS SDK for JavaScript v3 Personalize client docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/personalize/
- Amazon Personalize developer guide: https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html
- Amazon Personalize API reference: https://docs.aws.amazon.com/personalize/latest/dg/API_Operations.html
- `CreateDatasetGroup` API: https://docs.aws.amazon.com/personalize/latest/dg/API_CreateDatasetGroup.html
- `CreateDatasetImportJob` API: https://docs.aws.amazon.com/personalize/latest/dg/API_CreateDatasetImportJob.html
- `CreateSolution` API: https://docs.aws.amazon.com/personalize/latest/dg/API_CreateSolution.html
- `CreateCampaign` API: https://docs.aws.amazon.com/personalize/latest/dg/API_CreateCampaign.html
- npm package: https://www.npmjs.com/package/@aws-sdk/client-personalize
