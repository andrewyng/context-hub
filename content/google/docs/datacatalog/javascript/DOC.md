---
name: datacatalog
description: "Google Cloud Data Catalog Node.js client for catalog search, entry lookup, entry metadata, tags, and policy-tag client selection"
metadata:
  languages: "javascript"
  versions: "5.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,datacatalog,metadata,governance,tags,bigquery,javascript,nodejs"
---

# `@google-cloud/datacatalog` JavaScript Package Guide

Use `@google-cloud/datacatalog` when your Node.js app needs to search Google Cloud Data Catalog, look up known assets, read entry metadata, or attach tags from an existing tag template.

## Golden Rule

Use the official Google-maintained package and import the generated clients from the `v1` namespace.

- Use `v1.DataCatalogClient` for entries, entry groups, tag templates, tags, search, and lookup.
- Use `v1.PolicyTagManagerClient` for taxonomies and policy tags.
- Authenticate with Application Default Credentials (ADC), not API keys.
- Pass full resource names such as `projects/PROJECT/locations/LOCATION/entryGroups/.../entries/...` when an API expects `name` or `parent`.

This guide covers `5.2.1`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/datacatalog@5.2.1
```

## Authentication And Setup

Enable the API in the project that will call Data Catalog:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable datacatalog.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Typical prerequisites:

1. The Data Catalog API is enabled for the caller project.
2. The caller has IAM permissions to search metadata, read entries, and manage tags or tag templates.
3. Your code uses the correct regional resource names for tag templates and custom entries.

## Initialize The Clients

CommonJS:

```javascript
const {v1} = require('@google-cloud/datacatalog');

const dataCatalogClient = new v1.DataCatalogClient();
const policyTagClient = new v1.PolicyTagManagerClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/datacatalog';

const dataCatalogClient = new v1.DataCatalogClient();
const policyTagClient = new v1.PolicyTagManagerClient();
```

With an explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/datacatalog');

const dataCatalogClient = new v1.DataCatalogClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If ADC is already configured, you usually do not need `keyFilename`.

## Core Workflows

### Search Catalog Assets

Use `searchCatalogAsync()` when you know search terms but do not already have the entry resource name.

```javascript
const {v1} = require('@google-cloud/datacatalog');

const client = new v1.DataCatalogClient();

async function searchCatalog(projectId) {
  const request = {
    scope: {
      includeProjectIds: [projectId],
    },
    query: 'type=entry name:orders',
    pageSize: 20,
  };

  for await (const result of client.searchCatalogAsync(request)) {
    console.log(result.relativeResourceName);
    console.log(result.linkedResource);
    console.log(result.searchResultSubtype);
  }
}

searchCatalog(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

Keep the query narrow when you can. `scope.includeProjectIds` is the usual starting point for project-level searches.

### Look Up A Known Asset

If you already know the underlying Google Cloud resource, use `lookupEntry()` instead of search.

```javascript
const {v1} = require('@google-cloud/datacatalog');

const client = new v1.DataCatalogClient();

async function lookupBigQueryTable(projectId, datasetId, tableId) {
  const linkedResource =
    `//bigquery.googleapis.com/projects/${projectId}` +
    `/datasets/${datasetId}/tables/${tableId}`;

  const [entry] = await client.lookupEntry({
    linkedResource,
  });

  console.log(entry.name);
  console.log(entry.type);
  console.log(entry.fullyQualifiedName);
}
```

Only set one lookup identifier per request: `linkedResource`, `sqlResource`, or `fullyQualifiedName`.

### Read An Entry And List Its Tags

Search results are intentionally lightweight. Fetch the full entry when you need schema or metadata, then list tags separately.

```javascript
const {v1} = require('@google-cloud/datacatalog');

const client = new v1.DataCatalogClient();

async function readEntryAndTags(entryName) {
  const [entry] = await client.getEntry({
    name: entryName,
  });

  console.log(entry.displayName);
  console.log(entry.schema?.columns ?? []);

  for await (const tag of client.listTagsAsync({
    parent: entry.name,
  })) {
    console.log(tag.name, tag.template);
  }
}

readEntryAndTags(
  'projects/my-project/locations/us/entryGroups/@bigquery/entries/orders'
).catch(console.error);
```

Use this pattern when a search hit is only a starting point and you need the actual entry contents.

### Attach A Tag From An Existing Tag Template

Create the tag template first, then attach a tag to the entry with `createTag()`.

```javascript
const {v1} = require('@google-cloud/datacatalog');

const client = new v1.DataCatalogClient();

async function attachGovernanceTag({
  projectId,
  location,
  tagTemplateId,
  entryName,
}) {
  const [createdTag] = await client.createTag({
    parent: entryName,
    tag: {
      template: client.tagTemplatePath(projectId, location, tagTemplateId),
      fields: {
        owner: {
          stringValue: 'data-platform',
        },
        contains_pii: {
          boolValue: true,
        },
      },
    },
  });

  console.log(createdTag.name);
}
```

The tag template and the target entry must belong to the same organization.

## Client Selection Notes

Use the right client for the job:

- `v1.DataCatalogClient`: search, lookup, entries, tags, tag templates, entry groups.
- `v1.PolicyTagManagerClient`: taxonomies and policy tags for column-level governance.

Do not try to manage policy tags through `DataCatalogClient`.

## Common Pitfalls

- Import from `@google-cloud/datacatalog` and then use `.v1`; do not invent package-local import paths.
- `searchCatalogAsync()` is for discovery. Follow it with `getEntry()` or `lookupEntry()` when you need the full record.
- `lookupEntry()` uses a oneof request shape; set only one of `linkedResource`, `sqlResource`, or `fullyQualifiedName`.
- Policy tags use `v1.PolicyTagManagerClient`, not `v1.DataCatalogClient`.
- Do not hard-code `us-central1` for templates or custom entries unless that is the real location for your metadata.
- `createTag()` uses a full tag-template resource name; build it with `client.tagTemplatePath(...)` instead of concatenating strings by hand.
- If ADC is pointed at the wrong project or service account, catalog search may succeed in one environment and fail in another because metadata visibility is IAM-scoped.

## Version-Sensitive Notes

- This guide targets `@google-cloud/datacatalog` `5.2.1`.
- The examples use the generated `v1` clients and async-iterator methods shown in the maintained Node.js reference.

## Official URLs

- Node.js reference root: `https://cloud.google.com/nodejs/docs/reference/datacatalog/latest`
- Package README in the Google Cloud Node.js monorepo: `https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-datacatalog`
- Auth setup for ADC: `https://cloud.google.com/docs/authentication/application-default-credentials`
- Data Catalog code samples: `https://cloud.google.com/data-catalog/docs/samples`
- Search sample: `https://cloud.google.com/data-catalog/docs/samples/data-catalog-search-assets`
- Quickstart sample: `https://cloud.google.com/data-catalog/docs/samples/data-catalog-quickstart`
- Data Catalog release notes: `https://cloud.google.com/data-catalog/docs/release-notes`
