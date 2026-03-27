---
name: retail
description: "Google Cloud Retail Node.js client for catalog import, search, predictions, and user event logging"
metadata:
  languages: "javascript"
  versions: "4.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,retail,ecommerce,search,recommendations,javascript"
---

# Google Cloud Retail Node.js Client

## Golden Rule

Use `@google-cloud/retail` with Application Default Credentials (ADC), enable `retail.googleapis.com` in the Google Cloud project that owns your catalog, and build against the GA `v2` client surface for product import, search, predictions, and user events.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/retail@4.3.0
```

## Authentication And Project Setup

Before making API calls, make sure all of the following are true:

1. You have a Google Cloud project.
2. Billing is enabled for that project.
3. Cloud Retail is enabled for that project.
4. ADC is configured for the identity your app runs as.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
gcloud services enable retail.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development, the standard ADC flow is:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="global"
export GOOGLE_CLOUD_CATALOG="default_catalog"
export GOOGLE_CLOUD_BRANCH="default_branch"
export RETAIL_SEARCH_SERVING_CONFIG="default_serving_config"
export RETAIL_RECOMMENDATION_SERVING_CONFIG="default_recommendation_config"
```

If you must use a service account key outside Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account instead of shipping JSON keys.

## Initialize Clients

The package exports versioned namespaces. For the current GA surface:

```javascript
const retail = require('@google-cloud/retail').v2;

const clientOptions = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
};

const productClient = new retail.ProductServiceClient(clientOptions);
const searchClient = new retail.SearchServiceClient(clientOptions);
const predictionClient = new retail.PredictionServiceClient(clientOptions);
const userEventClient = new retail.UserEventServiceClient(clientOptions);
```

If you need to pass a key file explicitly, add `keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS` to `clientOptions`.

Create clients once and reuse them across requests.

## Resource Names You Reuse Constantly

Retail requests usually need fully qualified resource names, not your internal IDs.

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
const catalog = process.env.GOOGLE_CLOUD_CATALOG ?? 'default_catalog';
const branch = process.env.GOOGLE_CLOUD_BRANCH ?? 'default_branch';
const searchServingConfig =
  process.env.RETAIL_SEARCH_SERVING_CONFIG ?? 'default_serving_config';
const recommendationServingConfig =
  process.env.RETAIL_RECOMMENDATION_SERVING_CONFIG ??
  'default_recommendation_config';

const catalogName = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;
const branchName = `${catalogName}/branches/${branch}`;
const searchPlacement = `${catalogName}/servingConfigs/${searchServingConfig}`;
const recommendationPlacement =
  `${catalogName}/servingConfigs/${recommendationServingConfig}`;
```

The resource forms you use most often are:

- Catalog: `projects/PROJECT_ID/locations/global/catalogs/default_catalog`
- Branch: `projects/PROJECT_ID/locations/global/catalogs/default_catalog/branches/default_branch`
- Serving config: `projects/PROJECT_ID/locations/global/catalogs/default_catalog/servingConfigs/default_serving_config`

Persist the `name` values the API returns when you can instead of rebuilding them by hand.

## Search Products

`search()` is the main retrieval API. Pass a `placement`, and send a stable `visitorId` from your own app rather than a random placeholder.

```javascript
const retail = require('@google-cloud/retail').v2;

const searchClient = new retail.SearchServiceClient();

async function searchProducts() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
  const catalog = process.env.GOOGLE_CLOUD_CATALOG ?? 'default_catalog';
  const branch = process.env.GOOGLE_CLOUD_BRANCH ?? 'default_branch';
  const servingConfig =
    process.env.RETAIL_SEARCH_SERVING_CONFIG ?? 'default_serving_config';

  const catalogName = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;
  const branchName = `${catalogName}/branches/${branch}`;
  const placement = `${catalogName}/servingConfigs/${servingConfig}`;

  const [response] = await searchClient.search({
    placement,
    branch: branchName,
    query: 'running shoes',
    visitorId: 'anon-session-7d6b4d3c',
    pageSize: 10,
  });

  for (const result of response.results ?? []) {
    console.log(result.product?.id, result.product?.title);
  }
}

searchProducts().catch(console.error);
```

Use a branch explicitly when you want search results scoped to `default_branch` or another non-default branch.

## Import Products

`importProducts()` is the normal bulk-ingestion path. The request parent is the branch resource.

```javascript
const retail = require('@google-cloud/retail').v2;

const productClient = new retail.ProductServiceClient();

async function importProducts() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
  const catalog = process.env.GOOGLE_CLOUD_CATALOG ?? 'default_catalog';
  const branch = process.env.GOOGLE_CLOUD_BRANCH ?? 'default_branch';

  const parent = `projects/${projectId}/locations/${location}/catalogs/${catalog}/branches/${branch}`;

  const [operation] = await productClient.importProducts({
    parent,
    inputConfig: {
      productInlineSource: {
        products: [
          {
            id: 'sku-123',
            title: 'Trail Runner 2',
            categories: ['Shoes', 'Running'],
          },
          {
            id: 'sku-456',
            title: 'Daily Trainer',
            categories: ['Shoes', 'Training'],
          },
        ],
      },
    },
  });

  const [response] = await operation.promise();
  console.log(response);
}

importProducts().catch(console.error);
```

Inline source is fine for small examples. For large feeds, move the import source to Cloud Storage instead of putting the whole catalog in the request body.

## Get Recommendations

Use `predict()` to request recommendation results for a visitor and page context.

```javascript
const retail = require('@google-cloud/retail').v2;

const predictionClient = new retail.PredictionServiceClient();

async function getRecommendations() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
  const catalog = process.env.GOOGLE_CLOUD_CATALOG ?? 'default_catalog';
  const servingConfig =
    process.env.RETAIL_RECOMMENDATION_SERVING_CONFIG ??
    'default_recommendation_config';

  const placement =
    `projects/${projectId}/locations/${location}/catalogs/${catalog}/` +
    `servingConfigs/${servingConfig}`;

  const [response] = await predictionClient.predict({
    placement,
    userEvent: {
      eventType: 'detail-page-view',
      visitorId: 'anon-session-7d6b4d3c',
    },
    pageSize: 10,
  });

  for (const result of response.results ?? []) {
    console.log(result.id);
  }
}

getRecommendations().catch(console.error);
```

Send a realistic `userEvent` that matches the page or flow where you request recommendations.

## Write User Events

Use `writeUserEvent()` for real-time search, click, and page-view signals.

```javascript
const retail = require('@google-cloud/retail').v2;

const userEventClient = new retail.UserEventServiceClient();

async function writeSearchEvent() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
  const catalog = process.env.GOOGLE_CLOUD_CATALOG ?? 'default_catalog';

  const parent = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;

  const [userEvent] = await userEventClient.writeUserEvent({
    parent,
    userEvent: {
      eventType: 'search',
      visitorId: 'anon-session-7d6b4d3c',
      searchQuery: 'running shoes',
    },
  });

  console.log(userEvent.eventType, userEvent.visitorId);
}

writeSearchEvent().catch(console.error);
```

Persist the same visitor identifier across search, recommendation, and conversion flows so Retail can connect those events.

## Common Pitfalls

- Do not pass internal IDs where the API expects full resource names like `projects/.../locations/.../catalogs/...`.
- Do not mix up request scopes: `importProducts()` uses a branch parent, while `writeUserEvent()` uses a catalog parent.
- Do not omit `visitorId` in search and recommendation flows if you want useful attribution and personalization.
- Do not assume the inline `userEvent` in `predict()` replaces explicit event logging; write the event separately when you need it stored.
- Do not create a new client per request. Reuse long-lived client instances.

## Version-Sensitive Notes

- This guide targets `@google-cloud/retail@4.3.0`.
- Older Retail examples may still show legacy placement-style resource names. Prefer `servingConfigs/*` when you build new request paths.
- If you need query-completion or autocomplete features, check the generated Node.js reference for the exact namespace exposed by your installed version before you commit that code path.

## Official Sources

- Maintainer package docs: https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-retail
- Node.js reference root: https://cloud.google.com/nodejs/docs/reference/retail/latest
- npm package page: https://www.npmjs.com/package/@google-cloud/retail
- ADC overview: https://cloud.google.com/docs/authentication/provide-credentials-adc
- Local ADC setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
