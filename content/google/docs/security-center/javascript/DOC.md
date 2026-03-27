---
name: security-center
description: "Google Cloud Security Command Center Node.js client for listing findings, managing sources, and handling SCC resource names correctly"
metadata:
  languages: "javascript"
  versions: "9.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,security-command-center,security-center,findings,@google-cloud/security-center,javascript,nodejs"
---

# `@google-cloud/security-center` JavaScript Package Guide

## Golden Rule

Use `@google-cloud/security-center` with Application Default Credentials (ADC), build requests with full Security Command Center resource names, and keep the client namespace aligned with the resource format your code already uses.

For most established integrations, that means `v1.SecurityCenterClient` with names like `organizations/ORG_ID/sources/SOURCE_ID`. If your existing SCC resources are location-scoped and include `/locations/LOCATION`, keep that path shape and use the matching versioned client surface instead of rewriting names by hand.

This guide covers `9.2.1`.

## Install

```bash
npm install @google-cloud/security-center@9.2.1
```

## Authentication And Setup

Before you create the client:

1. Make sure the calling identity can access Security Command Center in the organization, folder, or project scope you plan to query.
2. Configure ADC for local development or attach a service account in Google Cloud.
3. Keep the resource scope you query separate from the project you use for credentials and API enablement.

If you are setting up a new environment, enable the API in the project that owns the client credentials:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable securitycenter.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ORGANIZATION="123456789"
```

If you must use a service account key outside Google Cloud:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_ORGANIZATION="123456789"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

`GOOGLE_CLOUD_PROJECT` is not a substitute for your SCC organization ID. Most SCC request paths use the organization, folder, or project resource you are inspecting.

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/security-center');

const client = new v1.SecurityCenterClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/security-center';

const client = new v1.SecurityCenterClient();
```

If you need to pass credentials explicitly:

```javascript
const {v1} = require('@google-cloud/security-center');

const client = new v1.SecurityCenterClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Resource Names You Reuse Constantly

The package expects canonical SCC resource names, not bare numeric IDs.

- Organization parent: `organizations/ORG_ID`
- Aggregate findings parent: `organizations/ORG_ID/sources/-`
- One source: `organizations/ORG_ID/sources/SOURCE_ID`
- One finding: `organizations/ORG_ID/sources/SOURCE_ID/findings/FINDING_ID`

Some SCC methods also accept folder-scoped or project-scoped parents, but the same rule applies: pass the full resource name that matches the API method you are calling.

## Core Workflows

### List Findings Across All Sources In An Organization

Use the aggregate source form `sources/-` when you want findings from every source in one organization.

```javascript
const {v1} = require('@google-cloud/security-center');

const client = new v1.SecurityCenterClient();

async function listFindings(organizationId) {
  const [results] = await client.listFindings({
    parent: `organizations/${organizationId}/sources/-`,
    pageSize: 20,
  });

  for (const result of results) {
    const finding = result.finding;
    if (!finding) continue;

    console.log({
      name: finding.name,
      category: finding.category,
      state: finding.state,
      eventTime: finding.eventTime,
    });
  }
}

listFindings(process.env.GOOGLE_CLOUD_ORGANIZATION).catch(console.error);
```

Start with an unfiltered read like this to confirm that authentication, IAM, and resource naming are correct before adding SCC filter expressions.

### Create A Custom Source

Create a source when you need a stable SCC source for findings that come from your own scanners or internal controls.

```javascript
const {v1} = require('@google-cloud/security-center');

const client = new v1.SecurityCenterClient();

async function createSource(organizationId) {
  const [source] = await client.createSource({
    parent: `organizations/${organizationId}`,
    source: {
      displayName: 'internal-security-controls',
      description: 'Findings imported from internal security checks.',
    },
  });

  console.log(source.name);
  return source.name;
}

createSource(process.env.GOOGLE_CLOUD_ORGANIZATION).catch(console.error);
```

Persist the returned `source.name`. Later SCC calls are easier and safer when you reuse the canonical name instead of rebuilding it from IDs.

### List Sources

List sources first when you are inheriting an existing SCC setup and need the exact source names already present in the organization.

```javascript
const {v1} = require('@google-cloud/security-center');

const client = new v1.SecurityCenterClient();

async function listSources(organizationId) {
  const [sources] = await client.listSources({
    parent: `organizations/${organizationId}`,
  });

  for (const source of sources) {
    console.log({
      name: source.name,
      displayName: source.displayName,
      description: source.description,
    });
  }
}

listSources(process.env.GOOGLE_CLOUD_ORGANIZATION).catch(console.error);
```

## Version And Namespace Notes

This package uses versioned namespaces. For practical integration work:

- Prefer `v1` when your existing SCC names look like `organizations/.../sources/...`.
- Keep location-aware names such as `.../locations/LOCATION` on the matching versioned client surface instead of trying to reuse `v1` request objects.
- Avoid beta namespaces unless the codebase you are maintaining already depends on them.

## Important Pitfalls

- Using a bare organization ID or source ID where the API expects a full `name` or `parent` resource string.
- Treating `GOOGLE_CLOUD_PROJECT` as the SCC resource scope. Many SCC requests are organization-scoped instead.
- Debugging request payloads before verifying ADC and IAM. Authentication and permissions usually fail earlier than request shape.
- Rebuilding source names by hand after creation instead of storing the returned `source.name`.
- Mixing resource formats across namespaces, especially when location-scoped names appear in an existing codebase.

## Official Sources

- Node.js client reference: `https://cloud.google.com/nodejs/docs/reference/security-center/latest`
- Security Command Center product docs: `https://cloud.google.com/security-command-center/docs`
- Application Default Credentials: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- npm package page: `https://www.npmjs.com/package/@google-cloud/security-center`
- Source repository package directory: `https://github.com/googleapis/google-cloud-node/tree/main/packages/google-cloud-security-center`
