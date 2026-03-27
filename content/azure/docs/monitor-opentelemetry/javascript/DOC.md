---
name: monitor-opentelemetry
description: "Azure Monitor OpenTelemetry JavaScript distro guide for startup configuration, authentication, custom spans and metrics, and Node.js instrumentation"
metadata:
  languages: "javascript"
  versions: "1.16.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "azure,azure-monitor,application-insights,opentelemetry,observability,javascript,nodejs"
---

# @azure/monitor-opentelemetry JavaScript Package Guide

## Golden Rule

Call `useAzureMonitor(...)` exactly once during Node.js process startup, before you initialize HTTP servers, Azure SDK clients, database drivers, or loggers that you want auto-instrumented.

This guide is pinned to `@azure/monitor-opentelemetry@1.16.0`.

## What This Package Does

`@azure/monitor-opentelemetry` is Microsoft's Node.js OpenTelemetry distro for Azure Monitor / Application Insights. It wires Azure Monitor exporters into OpenTelemetry and can enable bundled instrumentations so your app can send traces, metrics, and supported dependency or logger telemetry with one startup call.

Use this package when you want Azure Monitor as the backend and you want the distro to own the OpenTelemetry bootstrap. If you see older examples centered on the separate `applicationinsights` package, that is a different SDK and setup model.

## Install

Pin the package version your app expects:

```bash
npm install @azure/monitor-opentelemetry@1.16.0
```

If you want Microsoft Entra ID authentication, install Azure Identity too:

```bash
npm install @azure/monitor-opentelemetry@1.16.0 @azure/identity
```

Set the Application Insights connection string before startup:

```bash
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=https://..."
export OTEL_SERVICE_NAME="billing-api"
export OTEL_RESOURCE_ATTRIBUTES="service.namespace=payments,service.instance.id=worker-1"
```

## Minimal Setup

Bootstrap telemetry in a dedicated startup module and import that module before the rest of your application:

```js
import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { metrics, trace } from "@opentelemetry/api";

if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  throw new Error("APPLICATIONINSIGHTS_CONNECTION_STRING is required");
}

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
});

const tracer = trace.getTracer("billing-api");
const meter = metrics.getMeter("billing-api");
const jobsProcessed = meter.createCounter("jobs_processed");

const span = tracer.startSpan("sync-job");

try {
  span.setAttribute("job.name", "sync");
  jobsProcessed.add(1, { job: "sync", status: "success" });
} finally {
  span.end();
}
```

What this gives you:

- Azure Monitor export configured from one startup call
- OpenTelemetry API access for custom spans and metrics
- bundled instrumentation for supported Node.js libraries enabled after startup

## Initialization Rules

- Call `useAzureMonitor()` only once per process.
- Call it before importing or constructing libraries you expect the distro to instrument.
- Keep telemetry bootstrap in your entrypoint or an imported startup module, not inside request handlers or repeated job code.
- Reuse the global OpenTelemetry providers that the distro installs instead of trying to create a second tracing or metrics pipeline next to it.

## Configuration And Authentication

### Connection string and service identity

The standard setup is an Application Insights connection string passed through `azureMonitorExporterOptions.connectionString`. If you prefer environment-based service identity, set `OTEL_SERVICE_NAME` and `OTEL_RESOURCE_ATTRIBUTES` before startup.

```js
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
  enableLiveMetrics: true,
  samplingRatio: 1,
});
```

Use `samplingRatio` when you want fixed-percentage trace sampling. Keep the service name explicit with `OTEL_SERVICE_NAME` so Azure Monitor does not group unrelated workloads under a generic process name.

### Microsoft Entra ID authentication

Azure Monitor's authentication guidance for OpenTelemetry uses an Azure Identity credential together with the connection string that identifies the target resource.

```js
import { DefaultAzureCredential } from "@azure/identity";
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    credential: new DefaultAzureCredential(),
  },
});
```

Use managed identity or another `TokenCredential`-based flow for Azure-hosted workloads when possible. Keep the connection string configured even when authentication comes from Microsoft Entra ID.

### Select bundled instrumentations

Use `instrumentationOptions` to enable or disable the distro's supported instrumentations at startup.

```js
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
  instrumentationOptions: {
    http: { enabled: true },
    azureSdk: { enabled: true },
  },
  samplingRatio: 0.25,
  enableLiveMetrics: true,
});
```

This is the safest place to turn individual built-in instrumentations on or off. Make these choices before the relevant modules are loaded.

## Core Usage Patterns

### Manual spans

Use the OpenTelemetry API directly after startup:

```js
import {
  SpanKind,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api";

const tracer = trace.getTracer("payments");

const span = tracer.startSpan("reconcile-invoice", {
  kind: SpanKind.INTERNAL,
});

try {
  span.setAttribute("invoice.id", invoiceId);
  await reconcileInvoice(invoiceId);
} catch (error) {
  span.recordException(error);
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error instanceof Error ? error.message : String(error),
  });
  throw error;
} finally {
  span.end();
}
```

Use manual spans for work that the bundled instrumentations do not cover or when you want business-specific attributes on important operations.

### Custom metrics

Create meters and instruments with the OpenTelemetry metrics API:

```js
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("payments");
const invoicesProcessed = meter.createCounter("invoices_processed");

invoicesProcessed.add(1, {
  status: "success",
  tenant: tenantId,
});
```

If you need metric namespaces in Application Insights Metrics Explorer, Azure Monitor documents opting in with:

```bash
export APPLICATIONINSIGHTS_METRIC_NAMESPACE_OPT_IN="true"
```

### Import startup first

Keep telemetry bootstrap in its own file and load it before the rest of the app:

```js
// telemetry.js
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
});
```

```js
// server.js
import "./telemetry.js";
import express from "express";

const app = express();

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```

This pattern keeps initialization order obvious and avoids accidentally importing instrumented libraries too early.

## Common Pitfalls

- Initializing telemetry after your server, SDK clients, database drivers, or loggers are already loaded
- Calling `useAzureMonitor()` more than once and ending up with duplicate or confusing telemetry
- Forgetting to set `APPLICATIONINSIGHTS_CONNECTION_STRING` even when you authenticate with `DefaultAzureCredential`
- Leaving `OTEL_SERVICE_NAME` unset and then wondering why service identity in Azure Monitor is generic
- Copying older `applicationinsights` package samples into a distro-based `@azure/monitor-opentelemetry` setup

## Version-Sensitive Notes For 1.16.0

- This guide is written for `@azure/monitor-opentelemetry@1.16.0`
- The documented bootstrap entrypoint is `useAzureMonitor(...)`
- The practical configuration surface used here is `azureMonitorExporterOptions`, `instrumentationOptions`, `samplingRatio`, and `enableLiveMetrics`
- Older tutorials for other Azure Monitor Node SDKs may use different package names, initialization order, and configuration objects

## Official Sources

- Azure SDK for JavaScript `@azure/monitor-opentelemetry` README: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/monitor/monitor-opentelemetry/README.md
- JavaScript package overview for `@azure/monitor-opentelemetry`: https://learn.microsoft.com/en-us/javascript/api/overview/azure/monitor-opentelemetry-readme?view=azure-node-latest
- JavaScript API reference root: https://learn.microsoft.com/en-us/javascript/api/@azure/monitor-opentelemetry/
- Azure Monitor OpenTelemetry configuration guide: https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-configuration
- Azure Monitor add/modify guidance: https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-add-modify
- Azure Monitor Microsoft Entra authentication guidance: https://learn.microsoft.com/en-us/azure/azure-monitor/app/azure-ad-authentication
- npm package page: https://www.npmjs.com/package/@azure/monitor-opentelemetry
