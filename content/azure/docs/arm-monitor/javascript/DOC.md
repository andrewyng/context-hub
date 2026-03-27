---
name: arm-monitor
description: "Azure Monitor management client for JavaScript for activity logs, metric alerts, action groups, data collection rules, and diagnostic settings"
metadata:
  languages: "javascript"
  versions: "7.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-monitor,monitor,management,arm,alerts,diagnostic-settings,javascript"
---

# Azure Monitor Management Client For JavaScript

## Golden Rule

Use `@azure/arm-monitor` for Azure Monitor control-plane work: managing monitor resources such as activity log alerts, action groups, metric alerts, scheduled query rules, data collection rules, and diagnostic settings through Azure Resource Manager.

Do not use this package to query logs or metrics at runtime from application code. For that, use `@azure/monitor-query` instead.

## Install

Install the management client together with Azure Identity:

```bash
npm install @azure/arm-monitor@7.0.0 @azure/identity
```

This package ships with TypeScript types.

## Authentication And Setup

The normal setup is `DefaultAzureCredential` plus an explicit Azure subscription ID.

For local development, Azure CLI login is usually the quickest path:

```bash
az login

export AZURE_SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
export RESOURCE_GROUP_NAME="example-rg"
export DATA_COLLECTION_RULE_NAME="example-dcr"
export METRIC_ALERT_NAME="vm-cpu-high"
export MONITORED_RESOURCE_ID="/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/example-rg/providers/Microsoft.Compute/virtualMachines/example-vm"
```

For CI or deployed workloads, `DefaultAzureCredential` can also use service-principal environment variables:

```bash
export AZURE_TENANT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Management operations also require Azure RBAC permissions on the subscription, resource group, or target resource. Successful authentication alone is not enough.

## Client Initialization

Create one shared client and reuse it across related monitor-management operations.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { MonitorManagementClient } from "@azure/arm-monitor";

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroupName = process.env.RESOURCE_GROUP_NAME;
const dataCollectionRuleName =
  process.env.DATA_COLLECTION_RULE_NAME ?? "example-dcr";
const metricAlertName = process.env.METRIC_ALERT_NAME ?? "vm-cpu-high";
const monitoredResourceId = process.env.MONITORED_RESOURCE_ID;

if (!subscriptionId) {
  throw new Error("Set AZURE_SUBSCRIPTION_ID before running this script.");
}

if (!resourceGroupName) {
  throw new Error("Set RESOURCE_GROUP_NAME before running this script.");
}

const credential = new DefaultAzureCredential();

export const monitorClient = new MonitorManagementClient(
  credential,
  subscriptionId,
);

export {
  dataCollectionRuleName,
  metricAlertName,
  monitoredResourceId,
  resourceGroupName,
};
```

Common entry points on the client include `monitorClient.activityLogs`, `monitorClient.actionGroups`, `monitorClient.metricAlerts`, `monitorClient.scheduledQueryRules`, `monitorClient.diagnosticSettings`, and `monitorClient.dataCollectionRules`.

## Core Usage

### Read recent activity log events

`activityLogs.list(...)` requires an OData filter string. Build the filter explicitly instead of guessing parameter names.

```js
import { monitorClient, resourceGroupName } from "./client.js";

const endTime = new Date();
const startTime = new Date(endTime.getTime() - 60 * 60 * 1000);

const filter = [
  `eventTimestamp ge '${startTime.toISOString()}'`,
  `eventTimestamp le '${endTime.toISOString()}'`,
  `resourceGroupName eq '${resourceGroupName}'`,
].join(" and ");

for await (const event of monitorClient.activityLogs.list(filter)) {
  console.log(event.eventName?.localizedValue);
  console.log(event.resourceGroupName);
  console.log(event.status?.localizedValue);
}
```

Common filter terms include `resourceProvider eq 'Microsoft.Compute'` and `status eq 'Failed'`.

### List data collection rules in a resource group

Use data collection rules when you need to inspect or manage Azure Monitor Agent and ingestion configuration.

```js
import { monitorClient, resourceGroupName } from "./client.js";

for await (const rule of monitorClient.dataCollectionRules.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(rule.name, rule.location, rule.id);
}
```

To inspect one rule directly:

```js
import {
  dataCollectionRuleName,
  monitorClient,
  resourceGroupName,
} from "./client.js";

const rule = await monitorClient.dataCollectionRules.get(
  resourceGroupName,
  dataCollectionRuleName,
);

console.log(rule.id);
console.log(rule.location);
console.log(rule.immutableId);
```

### Get or list metric alerts

Metric alerts are a common Azure Monitor management task. Start with `get(...)` or `listByResourceGroup(...)` when you need to inspect an existing rule before changing it.

```js
import {
  metricAlertName,
  monitorClient,
  resourceGroupName,
} from "./client.js";

const alert = await monitorClient.metricAlerts.get(
  resourceGroupName,
  metricAlertName,
);

console.log(alert.name);
console.log(alert.enabled);
console.log(alert.scopes);
```

List metric alerts in the same resource group:

```js
import { monitorClient, resourceGroupName } from "./client.js";

for await (const alert of monitorClient.metricAlerts.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(alert.name, alert.severity, alert.enabled);
}
```

When you create or update a metric alert, the request body uses full ARM resource IDs in fields such as `scopes` and action-group references.

### List scheduled query rules in a resource group

Scheduled query rules back many log-search alerting workflows. If the task is instead “run a KQL query and return rows now,” use `@azure/monitor-query`, not this package.

```js
import { monitorClient, resourceGroupName } from "./client.js";

for await (const rule of monitorClient.scheduledQueryRules.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(rule.name, rule.enabled, rule.scopes);
}
```

### List diagnostic settings for a resource

Diagnostic settings attach log and metric export configuration to an existing resource ID.

```js
import { monitorClient, monitoredResourceId } from "./client.js";

if (!monitoredResourceId) {
  throw new Error("Set MONITORED_RESOURCE_ID to a full ARM resource ID.");
}

const settings = await monitorClient.diagnosticSettings.list(monitoredResourceId);

for (const item of settings.value ?? []) {
  console.log(item.name);
}
```

This surface is typically used to route platform logs and metrics to destinations such as Log Analytics workspaces, storage accounts, or Event Hubs.

### List action groups in a resource group

Action groups are reusable notification and automation targets for alert rules.

```js
import { monitorClient, resourceGroupName } from "./client.js";

for await (const group of monitorClient.actionGroups.listByResourceGroup(
  resourceGroupName,
)) {
  console.log(group.name, group.groupShortName);
}
```

## Configuration Notes

- Reuse one `MonitorManagementClient` instead of creating a new client per call.
- `AZURE_SUBSCRIPTION_ID` is required separately from your credential configuration.
- Treat list results as async iterables, not plain arrays.
- `activityLogs.list(...)` requires an explicit OData filter string.
- Most monitor-resource relationships use full ARM resource IDs rather than short names.
- Use `@azure/arm-monitor` for control-plane configuration and `@azure/monitor-query` for runtime log or metric queries.
- When the generated client exposes `begin...` helpers for a write operation, prefer `begin...AndWait(...)` if the next step depends on completion.

## Common Pitfalls

- Installing `@azure/arm-monitor` without `@azure/identity` and then trying to use `DefaultAzureCredential`.
- Authenticating successfully but forgetting to pass `AZURE_SUBSCRIPTION_ID` into `MonitorManagementClient`.
- Treating `activityLogs.list(...)` like a simple unfiltered list call.
- Passing a resource name where the API expects a full ARM resource ID.
- Using this management package when the task is actually querying telemetry data at runtime.
- Treating paged `list...()` results as materialized arrays.
- Copying older Azure Monitor examples without re-checking operation names and model shapes for `7.0.0`.

## Version Notes For `7.0.0`

- This guide targets `@azure/arm-monitor` `7.0.0`.
- The examples use `MonitorManagementClient` from `@azure/arm-monitor` and `DefaultAzureCredential` from `@azure/identity`.
- Re-check the current Learn reference before copying older samples for model-heavy write operations such as alert creation.

## Official Sources

- API reference root: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/`
- Overview README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/arm-monitor-readme?view=azure-node-latest`
- `MonitorManagementClient` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/monitormanagementclient?view=azure-node-latest`
- `ActivityLogs` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/activitylogs?view=azure-node-latest`
- `DataCollectionRules` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/datacollectionrules?view=azure-node-latest`
- `MetricAlerts` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/metricalerts?view=azure-node-latest`
- `ScheduledQueryRules` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/scheduledqueryrules?view=azure-node-latest`
- `DiagnosticSettings` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/diagnosticsettings?view=azure-node-latest`
- `ActionGroups` operations: `https://learn.microsoft.com/en-us/javascript/api/@azure/arm-monitor/actiongroups?view=azure-node-latest`
- Azure Identity README: `https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme?view=azure-node-latest`
- `DefaultAzureCredential` reference: `https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest`
- npm package page: `https://www.npmjs.com/package/@azure/arm-monitor`
