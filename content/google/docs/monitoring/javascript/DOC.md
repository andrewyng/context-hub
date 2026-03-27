---
name: monitoring
description: "Google Cloud Monitoring Node.js client for reading metrics, writing custom metrics, and inspecting alerting resources"
metadata:
  languages: "javascript"
  versions: "5.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,gcp,monitoring,observability,metrics,alerting,javascript,nodejs"
---

# `@google-cloud/monitoring` JavaScript Package Guide

Use `@google-cloud/monitoring` when your Node.js code needs to read Cloud Monitoring time series, write custom metrics, inspect alert policies, or work with notification channel configuration.

## Golden Rule

- Import the generated `v3` service clients from `@google-cloud/monitoring`.
- Use Application Default Credentials (ADC) unless you have a specific reason to pass `projectId` or `keyFilename` explicitly.
- Most project-scoped requests use `projects/{projectId}` as the `name` or `parent` value.
- Start metric reads with a known metric type and a small time window; Monitoring filters are strict and often return no data instead of a helpful error.
- For custom metrics, keep the metric type, value type, metric kind, and monitored resource labels consistent across writes.

This guide covers `5.3.1`.

## Install

Pin the version if you want behavior to match this guide exactly:

```bash
npm install @google-cloud/monitoring@5.3.1
```

## Authentication And Setup

This package uses Google Cloud credentials, not API keys.

Enable Cloud Monitoring in the target project:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud services enable monitoring.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

For local development with ADC:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
gcloud auth application-default login
gcloud config set project "$GOOGLE_CLOUD_PROJECT"
```

For a service account JSON file:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Before you write code, make sure:

1. The Monitoring API is enabled in the project.
2. The credential resolves to the principal you expect.
3. That principal has permission for the specific Monitoring operations you want to perform.

## Initialize The Clients

CommonJS:

```javascript
const monitoring = require('@google-cloud/monitoring');

const metricClient = new monitoring.v3.MetricServiceClient();
const alertClient = new monitoring.v3.AlertPolicyServiceClient();
const channelClient = new monitoring.v3.NotificationChannelServiceClient();
```

ES modules:

```javascript
import {v3} from '@google-cloud/monitoring';

const metricClient = new v3.MetricServiceClient();
const alertClient = new v3.AlertPolicyServiceClient();
const channelClient = new v3.NotificationChannelServiceClient();
```

With explicit project ID and credential file:

```javascript
const monitoring = require('@google-cloud/monitoring');

const metricClient = new monitoring.v3.MetricServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

If you already authenticated with `gcloud auth application-default login`, you usually do not need `keyFilename`.

## Core Workflows

### Read Time Series Data

Use `MetricServiceClient` for metric reads.

```javascript
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.v3.MetricServiceClient();

async function listCpuUtilization(projectId) {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const [timeSeries] = await client.listTimeSeries({
    name: `projects/${projectId}`,
    filter:
      'metric.type = "compute.googleapis.com/instance/cpu/utilization"',
    interval: {
      startTime: {seconds: nowSeconds - 10 * 60},
      endTime: {seconds: nowSeconds},
    },
  });

  for (const series of timeSeries) {
    console.log(series.metric?.type);
    console.log(series.resource?.type);
    console.log(series.metric?.labels);
    console.log(series.resource?.labels);
  }
}

listCpuUtilization(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

Notes:

- `name` is usually `projects/{projectId}`.
- `filter` must use Cloud Monitoring filter syntax exactly.
- If you only need series metadata, use the headers-only view to reduce response size.

### Write A Custom Metric

Cloud Monitoring creates the custom metric descriptor automatically on first write if the metric type is new.

```javascript
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.v3.MetricServiceClient();

async function writeCustomMetric(projectId) {
  const nowSeconds = Math.floor(Date.now() / 1000);

  await client.createTimeSeries({
    name: `projects/${projectId}`,
    timeSeries: [
      {
        metric: {
          type: 'custom.googleapis.com/myapp/request_latency_ms',
          labels: {
            endpoint: '/healthz',
          },
        },
        resource: {
          type: 'global',
          labels: {
            project_id: projectId,
          },
        },
        points: [
          {
            interval: {
              endTime: {seconds: nowSeconds},
            },
            value: {
              doubleValue: 123.4,
            },
          },
        ],
      },
    ],
  });
}

writeCustomMetric(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

Keep the first successful write stable, because later writes must match the metric's established type and resource model.

### List Alert Policies

Use `AlertPolicyServiceClient` to inspect or manage alerting rules.

```javascript
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.v3.AlertPolicyServiceClient();

async function listAlertPolicies(projectId) {
  const [policies] = await client.listAlertPolicies({
    name: `projects/${projectId}`,
  });

  for (const policy of policies) {
    console.log(policy.name, policy.displayName, policy.enabled);
  }
}

listAlertPolicies(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

This is a good first step before attempting updates, because it shows the exact resource names and the current policy structure in your project.

### Inspect Notification Channel Types

Before creating a notification channel, inspect the descriptors for the channel type you want so you know which labels are required.

```javascript
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.v3.NotificationChannelServiceClient();

async function listChannelDescriptors(projectId) {
  const [descriptors] = await client.listNotificationChannelDescriptors({
    name: `projects/${projectId}`,
  });

  for (const descriptor of descriptors) {
    console.log(descriptor.type, descriptor.displayName);
  }
}

listChannelDescriptors(process.env.GOOGLE_CLOUD_PROJECT).catch(console.error);
```

## Configuration Notes

### Pass Credentials Explicitly Only When Needed

Generated clients can take `projectId` and `keyFilename`, but in most Google Cloud environments ADC is simpler and safer.

```javascript
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.v3.MetricServiceClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
```

### Resource Names Matter

Many Monitoring methods require fully qualified project or resource names. The common starting points are:

- project name: `projects/PROJECT_ID`
- alert policy name: `projects/PROJECT_ID/alertPolicies/POLICY_ID`
- notification channel name: `projects/PROJECT_ID/notificationChannels/CHANNEL_ID`

### Keep Filters Simple First

When `listTimeSeries()` returns no data, the most common causes are:

- the metric type is wrong
- the resource labels do not match the series you are querying
- the interval is too narrow or outside the retention window

Start with only `metric.type = "..."`, confirm that it returns data, then add additional clauses.

## Common Pitfalls

- Install `@google-cloud/monitoring`, then import the generated `v3` clients from that package.
- Do not assume a custom metric write can omit monitored resource labels. Even `global` metrics need `project_id`.
- Keep the value type stable. If the first writes establish a metric as `double`, later integer or string values fail.
- `listTimeSeries()` is strict about filters and time windows; an empty result often means the request matched nothing, not that the client is broken.
- The docs root uses `/latest`, which moves. Pin the package version in your app and in any internal runbooks that depend on exact behavior.
