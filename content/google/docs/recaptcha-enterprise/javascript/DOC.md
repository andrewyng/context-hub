---
name: recaptcha-enterprise
description: "Google Cloud reCAPTCHA Enterprise Node.js client for backend assessments, annotations, keys, and key metrics"
metadata:
  languages: "javascript"
  versions: "6.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,recaptcha-enterprise,security,fraud-detection,javascript,nodejs"
---

# `@google-cloud/recaptcha-enterprise` JavaScript Package Guide

Use `@google-cloud/recaptcha-enterprise` in backend Node.js code to create reCAPTCHA Enterprise assessments, send fraud annotations, manage keys, and read key metrics.

## Golden Rule

Use this package only on trusted server-side code. Your frontend should obtain a reCAPTCHA token and send it to your backend, and your backend should call `createAssessment()`.

- Import the client from the `v1` namespace.
- Authenticate with Application Default Credentials (ADC) or a service account.
- Enable billing and `recaptchaenterprise.googleapis.com` before debugging library code.
- Pass full resource names such as `projects/PROJECT_ID` and `projects/PROJECT_ID/keys/KEY_ID`.
- Prefer `v1` over older `v1beta1` examples.

This guide covers `6.4.0`.

## Install

Pin the package version your app expects:

```bash
npm install @google-cloud/recaptcha-enterprise@6.4.0
```

## Authentication And Setup

Before calling the API, the product docs say you need to:

1. Create or choose a Google Cloud project.
2. Enable billing.
3. Enable the reCAPTCHA Enterprise API.
4. Create a reCAPTCHA Enterprise key for your site or app.
5. Set up credentials for the backend that will call the API.

For website assessments, the product docs also call out the `reCAPTCHA Enterprise Agent` role, `roles/recaptchaenterprise.agent`, and recommend creating assessments only on your backend.

Enable the API in the caller project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable recaptchaenterprise.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project-id"
export RECAPTCHA_SITE_KEY="your-site-key"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export RECAPTCHA_SITE_KEY="your-site-key"
```

## Initialize The Client

CommonJS:

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();
```

ES modules:

```javascript
import {v1} from '@google-cloud/recaptcha-enterprise';

const client = new v1.RecaptchaEnterpriseServiceClient();
```

With explicit project ID and key file:

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Create An Assessment

This is the main backend flow for website score-based or checkbox integrations. Your frontend obtains a token and sends it to your server, and your server creates the assessment.

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();

async function createAssessment({
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  siteKey = process.env.RECAPTCHA_SITE_KEY,
  token,
  expectedAction,
  userIpAddress,
  userAgent,
}) {
  const [response] = await client.createAssessment({
    parent: `projects/${projectId}`,
    assessment: {
      event: {
        siteKey,
        token,
        expectedAction,
        userIpAddress,
        userAgent,
      },
    },
  });

  if (!response.tokenProperties?.valid) {
    throw new Error('reCAPTCHA token was rejected');
  }

  if (response.tokenProperties.action !== expectedAction) {
    throw new Error(
      `Action mismatch: expected ${expectedAction}, got ${response.tokenProperties.action}`
    );
  }

  return {
    assessmentName: response.name,
    score: response.riskAnalysis?.score ?? null,
    reasons: response.riskAnalysis?.reasons ?? [],
  };
}
```

Important fields from the response:

- `response.tokenProperties.valid` tells you whether the token was accepted.
- `response.tokenProperties.action` must match your expected action in action-based flows.
- `response.riskAnalysis.score` is the risk score you use for allow, challenge, or block decisions.
- `response.riskAnalysis.reasons` contains classifier reasons for higher-risk outcomes.
- `response.name` is the assessment resource name you reuse later for annotation.

### Annotate An Assessment

If you later learn whether the interaction was legitimate or fraudulent, send that result back with `annotateAssessment()`. The product docs say this improves site-specific model performance over time.

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();

async function annotateFraudulentAssessment(assessmentName) {
  await client.annotateAssessment({
    name: assessmentName,
    annotation: 'FRAUDULENT',
    reasons: ['FAILED_TWO_FACTOR'],
  });
}
```

Store and reuse the full `response.name` returned by `createAssessment()` so you can pass it directly as `assessmentName`.

### Create A Score-Based Website Key

If you manage reCAPTCHA Enterprise keys programmatically, create a web key with `createKey()`:

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();

async function createScoreKey(domainName) {
  const [key] = await client.createKey({
    parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}`,
    key: {
      displayName: 'primary-web-key',
      webSettings: {
        allowedDomains: [domainName],
        allowAmpTraffic: false,
        integrationType: 'SCORE',
      },
    },
  });

  return key.name;
}
```

The returned `key.name` looks like `projects/PROJECT_ID/keys/KEY_ID`. Persist that full resource name instead of rebuilding it later.

### Get An Existing Key

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();

async function getKey() {
  const [key] = await client.getKey({
    name: 'projects/PROJECT_ID/keys/KEY_ID',
  });

  return key;
}
```

### Get Metrics For A Key

Use `getMetrics()` to inspect key performance. The metrics resource name is the key resource name with `/metrics` appended.

```javascript
const {v1} = require('@google-cloud/recaptcha-enterprise');

const client = new v1.RecaptchaEnterpriseServiceClient();

async function getKeyMetrics(keyName) {
  const [metrics] = await client.getMetrics({
    name: `${keyName}/metrics`,
  });

  return {
    scoreMetrics: metrics.scoreMetrics ?? [],
    challengeMetrics: metrics.challengeMetrics ?? [],
  };
}
```

Use `scoreMetrics` for score-based keys and `challengeMetrics` for challenge-style keys.

## Common Pitfalls

- Create assessments only on your backend. The product docs explicitly warn against creating them in the browser because attackers can forge those requests.
- Tokens are single-use and expire after two minutes. If the user retries later, obtain a fresh token on the client.
- Always verify `response.tokenProperties.action === expectedAction` for action-based flows.
- Keep the assessment resource name returned by `createAssessment()`. You need it for `annotateAssessment()`.
- Enable billing before debugging library code. Assessment calls stop once you exhaust the free monthly quota and do not have billing enabled.
- Reuse a client instance instead of constructing a new one for every request path.
- This package is for server-side API calls. It does not render widgets or mint browser tokens for you.

## Version-Sensitive Notes

- This guide covers `@google-cloud/recaptcha-enterprise` version `6.4.0`.
- Older examples may still show `v1beta1`; prefer the `v1` surface for new work.
- Keep your installed package version pinned when you copy request shapes into long-lived services.

## Official Sources

- npm package: `https://www.npmjs.com/package/@google-cloud/recaptcha-enterprise`
- Node.js client library reference root: `https://cloud.google.com/nodejs/docs/reference/recaptcha-enterprise/latest`
- Product docs: `https://cloud.google.com/recaptcha/docs/create-assessment-website`
- Product samples:
  - `https://cloud.google.com/recaptcha/docs/samples/recaptcha-enterprise-create-assessment`
  - `https://cloud.google.com/recaptcha/docs/samples/recaptcha-enterprise-annotate-assessment`
  - `https://cloud.google.com/recaptcha/docs/samples/recaptcha-enterprise-create-site-key`
  - `https://cloud.google.com/recaptcha/docs/samples/recaptcha-enterprise-get-metrics-site-key`
- Auth docs:
  - `https://cloud.google.com/docs/authentication/application-default-credentials`
  - `https://docs.cloud.google.com/docs/authentication/provide-credentials-adc`
