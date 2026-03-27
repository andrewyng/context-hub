---
name: discoveryengine
description: "Google Cloud Discovery Engine Node.js client for search, answer generation, and document inspection"
metadata:
  languages: "javascript"
  versions: "2.5.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,discoveryengine,vertex-ai-search,agent-builder,search,rag,javascript,nodejs"
---

# `@google-cloud/discoveryengine` JavaScript Package Guide

Use `@google-cloud/discoveryengine` when your Node.js code needs to query a Discovery Engine data store, generate grounded answers over indexed content, or inspect indexed documents.

## Golden Rule

- Use the GA `v1` clients from `@google-cloud/discoveryengine`.
- Enable `discoveryengine.googleapis.com` in the Google Cloud project that owns the data store.
- Authenticate with Application Default Credentials (ADC) unless you have a specific reason to pass a credential file directly.
- Set a regional `apiEndpoint` when your Discovery Engine resources are not in `global`.
- Reuse full resource names for `servingConfig`, `branch`, and `session` instead of rebuilding them differently in each call.

This guide covers `2.5.3`.

## Install

Pin the package version your app should target:

```bash
npm install @google-cloud/discoveryengine@2.5.3
```

## Authentication And Setup

Before making API calls, make sure all of the following are true:

1. You have a Google Cloud project.
2. Billing is enabled for that project.
3. The Discovery Engine API is enabled.
4. ADC is configured for the identity your app runs as.

Enable the API:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable discoveryengine.googleapis.com \
  --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="global"
export DISCOVERY_ENGINE_DATA_STORE_ID="my-data-store"
export DISCOVERY_ENGINE_SERVING_CONFIG="default_serving_config"
export DISCOVERY_ENGINE_BRANCH="default_branch"
```

If you must use a service account key outside Google Cloud:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account instead of shipping JSON keys.

## Initialize The Clients

CommonJS:

```javascript
const {v1} = require('@google-cloud/discoveryengine');

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION ?? 'global';
const dataStoreId = process.env.DISCOVERY_ENGINE_DATA_STORE_ID;
const servingConfigId =
  process.env.DISCOVERY_ENGINE_SERVING_CONFIG ?? 'default_serving_config';
const branchId = process.env.DISCOVERY_ENGINE_BRANCH ?? 'default_branch';

const clientOptions = {
  projectId,
  ...(location === 'global'
    ? {}
    : {apiEndpoint: `${location}-discoveryengine.googleapis.com`}),
};

const searchClient = new v1.SearchServiceClient(clientOptions);
const answerClient = new v1.ConversationalSearchServiceClient(clientOptions);
const documentClient = new v1.DocumentServiceClient(clientOptions);

const servingConfig = searchClient.servingConfigPath(
  projectId,
  location,
  dataStoreId,
  servingConfigId
);

const branch = documentClient.branchPath(
  projectId,
  location,
  dataStoreId,
  branchId
);

const session = answerClient.sessionPath(projectId, location, dataStoreId, '-');
```

If you want to pass a credential file explicitly, add `keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS` to `clientOptions`.

For non-global locations, keep the resource names and `apiEndpoint` aligned with the same region.

## Core Workflows

### Search Indexed Content

Use `search()` when you want ranked matching documents.

```javascript
const {v1} = require('@google-cloud/discoveryengine');

const searchClient = new v1.SearchServiceClient();

async function searchDocuments(servingConfig, branch, query) {
  const [response] = await searchClient.search({
    servingConfig,
    branch,
    query,
    pageSize: 5,
  });

  for (const result of response.results ?? []) {
    const document = result.document;
    const title = document?.derivedStructData?.title ?? document?.name;
    console.log(document?.id, title);
  }
}
```

Keep `servingConfig` as the fully qualified resource name returned by the client helper or the console. The reference docs allow both data-store-based and engine-based serving config resource names; use one form consistently.

### Generate An Answer

Use `answerQuery()` when you want a synthesized answer grounded in retrieved content instead of raw ranked results.

```javascript
const {v1} = require('@google-cloud/discoveryengine');

const answerClient = new v1.ConversationalSearchServiceClient();

async function answerQuestion(servingConfig, session, question, userPseudoId) {
  const [response] = await answerClient.answerQuery({
    servingConfig,
    query: {
      text: question,
    },
    session,
    userPseudoId,
    answerGenerationSpec: {
      includeCitations: true,
      ignoreAdversarialQuery: true,
      ignoreNonAnswerSeekingQuery: true,
      modelSpec: {
        modelVersion: 'stable',
      },
    },
  });

  console.log(response.answer?.answerText ?? '');
}
```

Use a stable `userPseudoId` per visitor or device. If you want the service to create a session automatically, pass the wildcard session resource with `-` as the session ID.

### Inspect Indexed Documents

Use `listDocumentsAsync()` when search results look wrong and you want to confirm what is actually indexed in the branch.

```javascript
const {v1} = require('@google-cloud/discoveryengine');

const documentClient = new v1.DocumentServiceClient();

async function listIndexedDocuments(branch, limit = 20) {
  let count = 0;

  for await (const document of documentClient.listDocumentsAsync({
    parent: branch,
  })) {
    console.log(document.name);

    count += 1;
    if (count >= limit) {
      break;
    }
  }
}
```

The generated client also exposes document-path helpers, which are safer than hand-assembling resource names when you later add `getDocument()`, imports, or cleanup code.

## Common Pitfalls

- `search()` and `answerQuery()` are different APIs. Use `search()` for ranked retrieval and `answerQuery()` for generated answers.
- Set `apiEndpoint` for non-`global` locations. Mismatched endpoints and resource locations are a common source of `NOT_FOUND` and routing errors.
- Keep `userPseudoId` stable. Do not send a fixed placeholder for every visitor.
- `searchLite()` is a separate path intended for public website search with API keys. It is not the default path for normal IAM- or OAuth-backed application access.
- The request docs accept both engine-based and data-store-based serving config resource names. Do not mix those forms accidentally in the same integration.
- Reuse long-lived client instances instead of creating a new client on every request.

## Version-Sensitive Notes

- This guide targets `@google-cloud/discoveryengine@2.5.3`.
- The examples here use the GA `v1` namespace.
- If you are following older Discovery Engine material, check whether it uses earlier product branding or preview namespaces before copying code into a current project.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/discoveryengine/latest`
- Search client reference: `https://cloud.google.com/nodejs/docs/reference/discoveryengine/latest/discoveryengine/v1.searchserviceclient`
- Conversational search client reference: `https://cloud.google.com/nodejs/docs/reference/discoveryengine/latest/discoveryengine/v1.conversationalsearchserviceclient`
- Document client reference: `https://cloud.google.com/nodejs/docs/reference/discoveryengine/latest/discoveryengine/v1.documentserviceclient`
- Authentication for client libraries: `https://cloud.google.com/docs/authentication/client-libraries`
- Set up ADC for local development: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
- Maintainer package source: `https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-discoveryengine`
- npm package page: `https://www.npmjs.com/package/@google-cloud/discoveryengine`
