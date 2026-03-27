---
name: talent
description: "Google Cloud Talent Solution Node.js client for companies, jobs, search, and query completion"
metadata:
  languages: "javascript"
  versions: "7.1.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,talent,jobs,recruiting,search,javascript"
---

# Google Cloud Talent Solution Node.js Client

## Golden Rule

Use `@google-cloud/talent` with Application Default Credentials (ADC), enable `jobs.googleapis.com` in the Google Cloud project that owns your Talent Solution resources, and use the GA `v4` client surface unless you have a documented reason to target a different namespace.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/talent@7.1.1
```

## Authentication And Project Setup

Before making API calls, make sure all of the following are true:

1. You have a Google Cloud project.
2. Billing is enabled for that project.
3. Cloud Talent Solution is enabled for that project.
4. ADC is configured for the identity your app runs as.

Enable the API:

```bash
gcloud services enable jobs.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development, the normal ADC flow is:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
export TALENT_TENANT_ID="your-tenant-id"
```

If you must use a service account key outside Google Cloud:

```bash
export GOOGLE_CLOUD_PROJECT="your-gcp-project"
export TALENT_TENANT_ID="your-tenant-id"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

On Cloud Run, GKE, Cloud Functions, and other Google Cloud runtimes, prefer the attached service account instead of distributing key files.

## Initialize Clients

The package exposes versioned namespaces. For the current GA surface:

```javascript
const {v4} = require('@google-cloud/talent');

const companyClient = new v4.CompanyServiceClient();
const jobClient = new v4.JobServiceClient();
const completionClient = new v4.CompletionClient();
```

If you need to pass project or key settings explicitly:

```javascript
const {v4} = require('@google-cloud/talent');

const clientOptions = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

const companyClient = new v4.CompanyServiceClient(clientOptions);
const jobClient = new v4.JobServiceClient(clientOptions);
```

Create clients once and reuse them across requests.

## Resource Names You Reuse Constantly

Cloud Talent Solution request bodies often need fully qualified resource names, not just your own IDs.

The most common parent forms are:

- Project-scoped parent: `projects/PROJECT_ID`
- Tenant-scoped parent: `projects/PROJECT_ID/tenants/TENANT_ID`

The examples below use a tenant-scoped parent because it is the safer default for multi-tenant integrations:

```javascript
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const tenantId = process.env.TALENT_TENANT_ID;

const parent = `projects/${projectId}/tenants/${tenantId}`;
```

When the API returns a resource `name`, persist and reuse that value instead of rebuilding it by hand.

## Create A Company

Create the employer record first, then reference that returned company name when you create jobs:

```javascript
const {v4} = require('@google-cloud/talent');

const companyClient = new v4.CompanyServiceClient();

async function createCompany() {
  const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/tenants/${process.env.TALENT_TENANT_ID}`;

  const [company] = await companyClient.createCompany({
    parent,
    company: {
      displayName: 'Example, Inc.',
      externalId: 'example-inc',
      headquartersAddress: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      careerSiteUri: 'https://example.com/careers',
    },
  });

  console.log(company.name);
  return company.name;
}

createCompany().catch(console.error);
```

Use your own stable `externalId` so you can map the Talent Solution company back to your internal system.

## Create A Job

Jobs reference the full company resource name returned by `createCompany`:

```javascript
const {v4} = require('@google-cloud/talent');

const jobClient = new v4.JobServiceClient();

async function createJob(companyName) {
  const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/tenants/${process.env.TALENT_TENANT_ID}`;

  const [job] = await jobClient.createJob({
    parent,
    job: {
      company: companyName,
      requisitionId: 'req-1001',
      title: 'Senior Software Engineer',
      description: 'Build search and matching features for recruiting workflows.',
      addresses: ['New York, NY'],
      languageCode: 'en-US',
      applicationInfo: {
        uris: ['https://example.com/jobs/req-1001'],
      },
    },
  });

  console.log(job.name);
  return job;
}
```

Keep `requisitionId` stable on your side. That is usually the simplest way to reconcile jobs between Talent Solution and your own database.

## Search Jobs

`searchJobs()` is the main retrieval API. Include `requestMetadata` on every search request so Talent Solution can attribute the request correctly.

```javascript
const {v4} = require('@google-cloud/talent');

const jobClient = new v4.JobServiceClient();

async function searchJobs() {
  const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/tenants/${process.env.TALENT_TENANT_ID}`;

  const [response] = await jobClient.searchJobs({
    parent,
    requestMetadata: {
      domain: 'jobs.example.com',
      sessionId: 'session-123',
      userId: 'user-42',
    },
    searchMode: 'JOB_SEARCH',
    enableBroadening: true,
    jobQuery: {
      query: 'software engineer',
      locationFilters: [
        {
          address: 'New York, NY',
        },
      ],
    },
    pageSize: 10,
  });

  for (const match of response.matchingJobs ?? []) {
    console.log(match.job?.name, match.job?.title);
  }
}

searchJobs().catch(console.error);
```

Use stable identifiers in `requestMetadata` from your own app instead of random placeholders in production traffic.

## Query Completion

Use `completeQuery()` for typeahead suggestions in your job search UI:

```javascript
const {v4} = require('@google-cloud/talent');

const completionClient = new v4.CompletionClient();

async function completeQuery() {
  const parent = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/tenants/${process.env.TALENT_TENANT_ID}`;

  const [response] = await completionClient.completeQuery({
    parent,
    query: 'softw',
    languageCodes: ['en-US'],
    pageSize: 5,
  });

  for (const result of response.completionResults ?? []) {
    console.log(result.suggestion);
  }
}

completeQuery().catch(console.error);
```

## Common Pitfalls

- Do not use API keys for this library. Use ADC, user credentials, or a service account.
- Pass full resource names such as `projects/.../tenants/.../companies/...`, not just your internal IDs.
- Reuse returned `name` fields from API responses instead of reconstructing them.
- Always send `requestMetadata` with `searchJobs()`; it is part of the normal search request shape.
- Reuse client instances instead of creating a new gRPC client for every request.

## Useful Links

- Node.js reference: `https://cloud.google.com/nodejs/docs/reference/talent/latest`
- Package page: `https://www.npmjs.com/package/@google-cloud/talent`
- ADC overview: `https://cloud.google.com/docs/authentication/provide-credentials-adc`
- Local ADC setup: `https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment`
