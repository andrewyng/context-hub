---
name: monitor-query
description: "@azure/monitor-query JavaScript guide for Azure Monitor logs and metrics with Entra auth, workspace queries, and resource queries"
metadata:
  languages: "javascript"
  versions: "1.3.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-monitor,log-analytics,metrics,javascript,observability,entra-id"
---

# Azure Monitor Query JavaScript Package Guide

## Golden Rule

Use `@azure/monitor-query` to read Azure Monitor data that already exists:

- `LogsQueryClient` for Kusto queries against a Log Analytics workspace or resource-scoped logs
- `MetricsQueryClient` for Azure Monitor metrics on a resource
- `@azure/identity` with `DefaultAzureCredential` for Microsoft Entra ID authentication

This package is for querying logs and metrics. It does not ingest telemetry, configure diagnostic settings, or manage Azure Monitor resources.

## Install

Pin the package version your application expects and install Azure Identity alongside it:

```bash
npm install @azure/monitor-query@1.3.3 @azure/identity
```

## Prerequisites

- a Log Analytics workspace ID for `queryWorkspace()`
- a full Azure resource ID for `queryResource()` and `MetricsQueryClient`
- a signed-in developer session from `az login`, or service principal / managed identity credentials
- permission to read monitor data on the target workspace or resource

Useful environment variables:

```bash
export AZURE_MONITOR_WORKSPACE_ID="<log-analytics-workspace-id>"
export AZURE_RESOURCE_ID="/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/<resource-provider>/<resource-type>/<resource-name>"
```

If you are not using Azure CLI or managed identity, set service principal credentials too:

```bash
export AZURE_TENANT_ID="<tenant-id>"
export AZURE_CLIENT_ID="<client-id>"
export AZURE_CLIENT_SECRET="<client-secret>"
```

## Authentication And Setup

For local development, the normal path is:

```bash
az login
export AZURE_MONITOR_WORKSPACE_ID="<log-analytics-workspace-id>"
export AZURE_RESOURCE_ID="/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/<resource-provider>/<resource-type>/<resource-name>"
```

Then initialize the clients once and reuse them:

```js
import { DefaultAzureCredential } from "@azure/identity";
import {
  LogsQueryClient,
  MetricsQueryClient,
} from "@azure/monitor-query";

const workspaceId = process.env.AZURE_MONITOR_WORKSPACE_ID;
const resourceId = process.env.AZURE_RESOURCE_ID;

if (!workspaceId) {
  throw new Error("AZURE_MONITOR_WORKSPACE_ID is required");
}

if (!resourceId) {
  throw new Error("AZURE_RESOURCE_ID is required");
}

const credential = new DefaultAzureCredential();
const logsClient = new LogsQueryClient(credential);
const metricsClient = new MetricsQueryClient(credential);
```

`DefaultAzureCredential` can use Azure CLI credentials locally, service principal environment variables, workload identity, or managed identity depending on where the code runs.

## Client Initialization

Keep monitor client creation in one helper so the rest of the app only depends on validated configuration:

```js
import { DefaultAzureCredential } from "@azure/identity";
import {
  LogsQueryClient,
  MetricsQueryClient,
} from "@azure/monitor-query";

export function createMonitorClients() {
  const workspaceId = process.env.AZURE_MONITOR_WORKSPACE_ID;
  const resourceId = process.env.AZURE_RESOURCE_ID;

  if (!workspaceId) {
    throw new Error("AZURE_MONITOR_WORKSPACE_ID is required");
  }

  if (!resourceId) {
    throw new Error("AZURE_RESOURCE_ID is required");
  }

  const credential = new DefaultAzureCredential();

  return {
    workspaceId,
    resourceId,
    logsClient: new LogsQueryClient(credential),
    metricsClient: new MetricsQueryClient(credential),
  };
}
```

## Core Usage

### Query A Log Analytics Workspace

Use `queryWorkspace()` when you already know which Log Analytics workspace contains the data.

```js
import { LogsQueryResultStatus } from "@azure/monitor-query";
import { createMonitorClients } from "./monitorClients.js";

function tableToObjects(table) {
  const columnNames = table.columnDescriptors.map((column) => column.name);

  return table.rows.map((row) =>
    Object.fromEntries(
      row.map((value, index) => [columnNames[index], value]),
    ),
  );
}

const { logsClient, workspaceId } = createMonitorClients();

const result = await logsClient.queryWorkspace(
  workspaceId,
  `
  AppRequests
  | project TimeGenerated, Name, ResultCode, DurationMs
  | take 5
  `,
  {
    duration: "PT1H",
  },
);

if (result.status === LogsQueryResultStatus.Success) {
  for (const table of result.tables) {
    console.log(tableToObjects(table));
  }
} else {
  console.error(result.partialError);

  for (const table of result.partialTables ?? []) {
    console.log(tableToObjects(table));
  }
}
```

The logs query text is Kusto Query Language (KQL). The time range above uses an ISO 8601 duration string.

### Query Logs For A Resource

Use `queryResource()` when your application starts from a specific Azure resource ID instead of a workspace ID.

```js
import { LogsQueryResultStatus } from "@azure/monitor-query";
import { createMonitorClients } from "./monitorClients.js";

const { logsClient, resourceId } = createMonitorClients();

const result = await logsClient.queryResource(
  resourceId,
  `
  AppRequests
  | take 5
  `,
  {
    duration: "PT30M",
  },
);

if (result.status === LogsQueryResultStatus.Success) {
  console.log(result.tables);
} else {
  console.error(result.partialError);
  console.log(result.partialTables ?? []);
}
```

The available tables depend on the resource type and how monitoring data is configured for that resource. Replace `AppRequests` with a table that exists for your target resource.

### Query Metrics For A Resource

Use `MetricsQueryClient` for Azure Monitor metrics. Metrics are resource-scoped, so you query with a full Azure resource ID.

```js
import { createMonitorClients } from "./monitorClients.js";

const { metricsClient, resourceId } = createMonitorClients();

const metricsResult = await metricsClient.queryResource(
  resourceId,
  ["Percentage CPU"],
  {
    timespan: {
      duration: "PT1H",
    },
    aggregations: ["Average", "Maximum"],
  },
);

for (const metric of metricsResult.metrics) {
  for (const series of metric.timeseries ?? []) {
    for (const point of series.data ?? []) {
      console.log({
        timeStamp: point.timeStamp,
        average: point.average,
        maximum: point.maximum,
      });
    }
  }
}
```

If the resource exposes multiple metric namespaces, pass `metricNamespace` in the options object and use the metric names defined for that namespace.

## Practical Notes

- `queryWorkspace()` expects a Log Analytics workspace ID.
- `queryResource()` and `MetricsQueryClient` expect a full Azure resource ID.
- Reuse one credential and one client per process instead of constructing a new client for every query.
- Logs queries use KQL and return tabular results. Metrics queries return metric series and points.
- Use ISO 8601 durations such as `"PT30M"` and `"PT1H"` for query windows when you do not need explicit start and end timestamps.

## Common Pitfalls

- Swapping a workspace ID and a resource ID. They are not interchangeable.
- Forgetting to install `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Treating any non-success logs result as a hard failure instead of checking the documented partial-result fields.
- Copying a metric name from a different resource provider. Metric names and namespaces are resource-specific.
- Using this package for telemetry ingestion or Application Insights SDK setup. This package is query-only.

## Version Notes For 1.3.3

- This guide targets `@azure/monitor-query` `1.3.3`.
- The `1.3.3` package surface documented on Microsoft Learn includes both `LogsQueryClient` and `MetricsQueryClient`.
- `@azure/identity` is versioned separately and should be pinned according to your application's Azure SDK policy.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/monitor-query/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/monitor-query-readme?view=azure-node-latest`
- `LogsQueryClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/monitor-query/logsqueryclient?view=azure-node-latest`
- `MetricsQueryClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/monitor-query/metricsqueryclient?view=azure-node-latest`
- `LogsQueryResultStatus` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/monitor-query/logsqueryresultstatus?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- Azure SDK changelog: `https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/monitor/monitor-query/CHANGELOG.md`
- npm package page: `https://www.npmjs.com/package/@azure/monitor-query`
