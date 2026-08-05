---
name: monitoring
description: "Official Datadog API client for JavaScript/TypeScript to submit metrics, manage monitors, and interact with Datadog observability features."
metadata:
  languages: "javascript"
  versions: "1.58.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "datadog,monitoring,metrics,observability,apm"
---

# Datadog API Client for JavaScript/TypeScript

## Golden Rule

**ALWAYS use `@datadog/datadog-api-client` version 1.58.0 or later.**

This is the official Datadog API client for JavaScript and TypeScript. Do NOT use:
- `datadog-client` (unofficial/deprecated)
- `datadog-metrics` (limited functionality, community package)
- Direct HTTP calls to Datadog API endpoints (use the official client instead)

The `@datadog/datadog-api-client` package provides complete access to both v1 and v2 Datadog APIs with full TypeScript support.

## Installation

### NPM

```bash
npm install @datadog/datadog-api-client
```

### Yarn

```bash
yarn add @datadog/datadog-api-client
```

### Environment Variables

Set up your Datadog API credentials as environment variables:

```bash
export DD_API_KEY="your-api-key-here"
export DD_APP_KEY="your-application-key-here"
export DD_SITE="datadoghq.com"  # Optional: defaults to US site
```

For EU region:

```bash
export DD_SITE="datadoghq.eu"
```

## Initialization

### Basic Initialization with Environment Variables

The client automatically reads `DD_API_KEY` and `DD_APP_KEY` environment variables:

```typescript
import { client, v1, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
```

### Manual Authentication

Provide credentials explicitly in code:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configurationOpts = {
  authMethods: {
    apiKeyAuth: "your-api-key-here",
    appKeyAuth: "your-application-key-here"
  }
};

const configuration = client.createConfiguration(configurationOpts);
```

### Regional Configuration

Configure for EU or other regions:

```typescript
import { client } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
configuration.setServerVariables({
  site: "datadoghq.eu"  // EU region
});
```

Available sites:
- `datadoghq.com` (US1 - default)
- `datadoghq.eu` (EU1)
- `us3.datadoghq.com` (US3)
- `us5.datadoghq.com` (US5)
- `ap1.datadoghq.com` (AP1)
- `ddog-gov.com` (US1-FED)

### Advanced Configuration Options

```typescript
import { client } from '@datadog/datadog-api-client';

const configurationOpts = {
  authMethods: {
    apiKeyAuth: process.env.DD_API_KEY,
    appKeyAuth: process.env.DD_APP_KEY
  },
  enableRetry: true,        // Enable automatic retry on rate limiting
  debug: false,             // Enable request/response logging
  maxRetries: 3,            // Maximum number of retries
  backoffMultiplier: 2,     // Backoff multiplier for retries
  httpConfig: {
    timeout: 30000          // Request timeout in milliseconds
  }
};

const configuration = client.createConfiguration(configurationOpts);
configuration.setServerVariables({ site: "datadoghq.com" });
```

### Enable Unstable Operations

Some v2 endpoints are marked as unstable and require explicit enablement:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
configuration.unstableOperations["v2.listIncidents"] = true;
configuration.unstableOperations["v2.createIncident"] = true;
```

## Core API Surfaces

### Metrics API

#### Submit Metrics (v1)

Basic metric submission:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MetricsApi(configuration);

const params: v1.MetricsApiSubmitMetricsRequest = {
  body: {
    series: [
      {
        metric: "system.load.1",
        points: [
          [Math.floor(Date.now() / 1000), 0.7]
        ],
        type: "gauge",
        host: "test.example.com",
        tags: ["environment:test", "version:1.0"]
      }
    ]
  }
};

apiInstance.submitMetrics(params)
  .then((data: v1.IntakePayloadAccepted) => {
    console.log("Metrics submitted successfully");
  })
  .catch((error: any) => console.error(error));
```

Advanced metric submission with multiple series:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MetricsApi(configuration);

const now = Math.floor(Date.now() / 1000);

const params: v1.MetricsApiSubmitMetricsRequest = {
  body: {
    series: [
      {
        metric: "custom.app.requests",
        points: [[now, 100]],
        type: "count",
        interval: 60,
        host: "app-server-1",
        tags: ["service:api", "env:production"]
      },
      {
        metric: "custom.app.latency",
        points: [[now, 45.2]],
        type: "gauge",
        host: "app-server-1",
        tags: ["service:api", "env:production"]
      },
      {
        metric: "custom.app.errors",
        points: [[now, 2]],
        type: "count",
        host: "app-server-1",
        tags: ["service:api", "env:production", "error_type:timeout"]
      }
    ]
  }
};

apiInstance.submitMetrics(params)
  .then((data: v1.IntakePayloadAccepted) => {
    console.log("Multiple metrics submitted");
  })
  .catch((error: any) => console.error(error));
```

#### Submit Metrics (v2)

v2 API with compression support:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';
import { compressSync } from 'zstd.ts';

const configurationOpts = {
  zstdCompressorCallback: (body: string) =>
    compressSync({ input: Buffer.from(body, "utf8") })
};

const configuration = client.createConfiguration(configurationOpts);
const apiInstance = new v2.MetricsApi(configuration);

const params: v2.MetricsApiSubmitMetricsRequest = {
  body: {
    series: [
      {
        metric: "system.load.1",
        type: 0,  // gauge
        points: [
          {
            timestamp: Math.floor(Date.now() / 1000),
            value: 0.7
          }
        ],
        resources: [
          {
            name: "host",
            type: "host"
          }
        ],
        tags: ["environment:production"]
      }
    ]
  },
  contentEncoding: "zstd1"
};

apiInstance.submitMetrics(params)
  .then((data: v2.IntakePayloadAccepted) => {
    console.log("Metrics submitted with compression");
  })
  .catch((error: any) => console.error(error));
```

#### Query Metrics

Query timeseries data:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MetricsApi(configuration);

const from = Math.floor(Date.now() / 1000) - 3600;  // 1 hour ago
const to = Math.floor(Date.now() / 1000);

const params: v1.MetricsApiQueryMetricsRequest = {
  from: from,
  to: to,
  query: "avg:system.cpu.user{*}"
};

apiInstance.queryMetrics(params)
  .then((data: v1.MetricsQueryResponse) => {
    console.log("Query results:", JSON.stringify(data, null, 2));
  })
  .catch((error: any) => console.error(error));
```

Advanced query with aggregation:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MetricsApi(configuration);

const from = Math.floor(Date.now() / 1000) - 86400;  // 24 hours ago
const to = Math.floor(Date.now() / 1000);

const params: v1.MetricsApiQueryMetricsRequest = {
  from: from,
  to: to,
  query: "sum:custom.app.requests{env:production}.rollup(sum, 3600)"
};

apiInstance.queryMetrics(params)
  .then((data: v1.MetricsQueryResponse) => {
    console.log("Aggregated results:", data);
  })
  .catch((error: any) => console.error(error));
```

#### List Active Metrics

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MetricsApi(configuration);

const from = Math.floor(Date.now() / 1000) - 3600;

const params: v1.MetricsApiListActiveMetricsRequest = {
  from: from
};

apiInstance.listActiveMetrics(params)
  .then((data: v1.MetricsListResponse) => {
    console.log("Active metrics:", data.metrics);
  })
  .catch((error: any) => console.error(error));
```

### Monitors API

#### Create Monitor

Basic monitor creation:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiCreateMonitorRequest = {
  body: {
    type: "metric alert",
    query: "avg(last_5m):avg:system.cpu.user{*} > 80",
    name: "High CPU Usage",
    message: "CPU usage is above 80% @slack-alerts",
    tags: ["env:production", "team:platform"],
    options: {
      thresholds: {
        critical: 80,
        warning: 60
      },
      notifyNoData: true,
      noDataTimeframe: 20,
      notifyAudit: false,
      requireFullWindow: false,
      includeTag: true
    }
  }
};

apiInstance.createMonitor(params)
  .then((data: v1.Monitor) => {
    console.log("Monitor created:", data.id);
  })
  .catch((error: any) => console.error(error));
```

Advanced monitor with composite query:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiCreateMonitorRequest = {
  body: {
    type: "query alert",
    query: "avg(last_15m):anomalies(avg:custom.app.latency{env:production}, 'basic', 2) >= 1",
    name: "Anomalous Latency Detected",
    message: `Application latency is behaving abnormally.

Current value: {{value}}
Threshold: {{threshold}}

@pagerduty-critical @slack-alerts`,
    tags: ["service:api", "priority:high"],
    priority: 1,
    options: {
      thresholds: {
        critical: 1,
        criticalRecovery: 0
      },
      notifyNoData: true,
      noDataTimeframe: 30,
      evaluationDelay: 60,
      newGroupDelay: 300,
      requireFullWindow: false,
      notifyAudit: true,
      timeoutH: 24,
      renotifyInterval: 60,
      escalationMessage: "Latency issue still ongoing @oncall"
    }
  }
};

apiInstance.createMonitor(params)
  .then((data: v1.Monitor) => {
    console.log("Anomaly monitor created:", data.id);
  })
  .catch((error: any) => console.error(error));
```

#### List Monitors

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiListMonitorsRequest = {
  tags: "env:production",
  monitorTags: "team:platform"
};

apiInstance.listMonitors(params)
  .then((data: v1.Monitor[]) => {
    data.forEach(monitor => {
      console.log(`ID: ${monitor.id}, Name: ${monitor.name}`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Get Monitor

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiGetMonitorRequest = {
  monitorId: 123456
};

apiInstance.getMonitor(params)
  .then((data: v1.Monitor) => {
    console.log("Monitor details:", JSON.stringify(data, null, 2));
  })
  .catch((error: any) => console.error(error));
```

#### Update Monitor

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiUpdateMonitorRequest = {
  monitorId: 123456,
  body: {
    name: "Updated Monitor Name",
    options: {
      thresholds: {
        critical: 90,
        warning: 70
      }
    }
  }
};

apiInstance.updateMonitor(params)
  .then((data: v1.Monitor) => {
    console.log("Monitor updated");
  })
  .catch((error: any) => console.error(error));
```

#### Delete Monitor

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

const params: v1.MonitorsApiDeleteMonitorRequest = {
  monitorId: 123456
};

apiInstance.deleteMonitor(params)
  .then((data: v1.DeletedMonitor) => {
    console.log("Monitor deleted");
  })
  .catch((error: any) => console.error(error));
```

### Events API

#### Post Event

Basic event submission:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.EventsApi(configuration);

const params: v1.EventsApiCreateEventRequest = {
  body: {
    title: "Application Deployment",
    text: "Version 2.0.0 deployed to production",
    tags: ["env:production", "version:2.0.0", "deployment"]
  }
};

apiInstance.createEvent(params)
  .then((data: v1.EventCreateResponse) => {
    console.log("Event created:", data.event?.id);
  })
  .catch((error: any) => console.error(error));
```

Advanced event with priority and alert type:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.EventsApi(configuration);

const params: v1.EventsApiCreateEventRequest = {
  body: {
    title: "Database Migration Completed",
    text: `Database migration to schema version 15 completed successfully.

Duration: 45 minutes
Tables affected: 12
Records migrated: 1.2M`,
    dateHappened: Math.floor(Date.now() / 1000),
    priority: "normal",
    tags: ["service:database", "env:production", "migration"],
    alertType: "info",
    aggregationKey: "db_migration_v15",
    sourceTypeName: "my-app",
    host: "db-server-1"
  }
};

apiInstance.createEvent(params)
  .then((data: v1.EventCreateResponse) => {
    console.log("Migration event created");
  })
  .catch((error: any) => console.error(error));
```

#### List Events

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.EventsApi(configuration);

const end = Math.floor(Date.now() / 1000);
const start = end - 3600;  // Last hour

const params: v1.EventsApiListEventsRequest = {
  start: start,
  end: end,
  tags: "env:production"
};

apiInstance.listEvents(params)
  .then((data: v1.EventListResponse) => {
    console.log(`Found ${data.events?.length} events`);
    data.events?.forEach(event => {
      console.log(`${event.title}: ${event.text}`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Get Event

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.EventsApi(configuration);

const params: v1.EventsApiGetEventRequest = {
  eventId: 1234567890
};

apiInstance.getEvent(params)
  .then((data: v1.EventResponse) => {
    console.log("Event details:", JSON.stringify(data.event, null, 2));
  })
  .catch((error: any) => console.error(error));
```

### Logs API

#### Send Logs (v2)

Basic log submission:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.LogsApi(configuration);

const params: v2.LogsApiSubmitLogRequest = {
  body: [
    {
      ddsource: "nodejs",
      ddtags: "env:production,service:api",
      hostname: "app-server-1",
      message: "User login successful",
      service: "authentication"
    }
  ]
};

apiInstance.submitLog(params)
  .then((data: any) => {
    console.log("Log submitted");
  })
  .catch((error: any) => console.error(error));
```

Advanced log submission with structured data:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.LogsApi(configuration);

const params: v2.LogsApiSubmitLogRequest = {
  body: [
    {
      ddsource: "application",
      ddtags: "env:production,version:2.0.0",
      hostname: "api-server-2",
      message: "Payment processed successfully",
      service: "payment-gateway",
      status: "info",
      timestamp: new Date().toISOString(),
      attributes: {
        transaction_id: "txn_abc123",
        amount: 99.99,
        currency: "USD",
        user_id: "user_456",
        payment_method: "credit_card"
      }
    }
  ],
  contentEncoding: "gzip"
};

apiInstance.submitLog(params)
  .then((data: any) => {
    console.log("Structured log submitted");
  })
  .catch((error: any) => console.error(error));
```

#### List Logs

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.LogsApi(configuration);

const params: v2.LogsApiListLogsRequest = {
  body: {
    filter: {
      query: "service:api status:error",
      from: new Date(Date.now() - 3600000).toISOString(),
      to: new Date().toISOString()
    },
    page: {
      limit: 50
    },
    sort: "-timestamp"
  }
};

apiInstance.listLogs(params)
  .then((data: v2.LogsListResponse) => {
    console.log(`Found ${data.data?.length} error logs`);
    data.data?.forEach(log => {
      console.log(log.attributes?.message);
    });
  })
  .catch((error: any) => console.error(error));
```

### Dashboards API

#### Create Dashboard

Basic dashboard creation:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

const params: v1.DashboardsApiCreateDashboardRequest = {
  body: {
    title: "System Metrics Dashboard",
    description: "Overview of system performance metrics",
    layoutType: "ordered",
    widgets: [
      {
        definition: {
          type: "timeseries",
          requests: [
            {
              q: "avg:system.cpu.user{*}",
              displayType: "line"
            }
          ],
          title: "CPU Usage"
        }
      }
    ]
  }
};

apiInstance.createDashboard(params)
  .then((data: v1.Dashboard) => {
    console.log("Dashboard created:", data.id);
  })
  .catch((error: any) => console.error(error));
```

Advanced dashboard with multiple widgets:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

const params: v1.DashboardsApiCreateDashboardRequest = {
  body: {
    title: "Application Performance Dashboard",
    description: "Production application metrics and monitoring",
    layoutType: "ordered",
    widgets: [
      {
        definition: {
          type: "timeseries",
          requests: [
            {
              q: "avg:custom.app.latency{env:production}",
              displayType: "line",
              style: {
                palette: "dog_classic",
                lineType: "solid",
                lineWidth: "normal"
              }
            }
          ],
          title: "API Latency",
          showLegend: true,
          legendLayout: "auto",
          legendColumns: ["avg", "min", "max", "value", "sum"]
        }
      },
      {
        definition: {
          type: "query_value",
          requests: [
            {
              q: "sum:custom.app.requests{env:production}.as_count()",
              aggregator: "sum"
            }
          ],
          title: "Total Requests",
          autoscale: true,
          precision: 0
        }
      },
      {
        definition: {
          type: "toplist",
          requests: [
            {
              q: "top(avg:custom.app.errors{env:production} by {error_type}, 10, 'sum', 'desc')"
            }
          ],
          title: "Top Errors by Type"
        }
      }
    ],
    templateVariables: [
      {
        name: "env",
        defaultValue: "production",
        prefix: "env"
      }
    ],
    notifyList: ["user@example.com"]
  }
};

apiInstance.createDashboard(params)
  .then((data: v1.Dashboard) => {
    console.log("Advanced dashboard created:", data.id);
  })
  .catch((error: any) => console.error(error));
```

#### List Dashboards

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

apiInstance.listDashboards()
  .then((data: v1.DashboardSummary) => {
    data.dashboards?.forEach(dashboard => {
      console.log(`ID: ${dashboard.id}, Title: ${dashboard.title}`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Get Dashboard

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

const params: v1.DashboardsApiGetDashboardRequest = {
  dashboardId: "abc-def-ghi"
};

apiInstance.getDashboard(params)
  .then((data: v1.Dashboard) => {
    console.log("Dashboard:", JSON.stringify(data, null, 2));
  })
  .catch((error: any) => console.error(error));
```

#### Update Dashboard

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

const params: v1.DashboardsApiUpdateDashboardRequest = {
  dashboardId: "abc-def-ghi",
  body: {
    title: "Updated Dashboard Title",
    description: "Updated description",
    layoutType: "ordered",
    widgets: []  // Include all widgets
  }
};

apiInstance.updateDashboard(params)
  .then((data: v1.Dashboard) => {
    console.log("Dashboard updated");
  })
  .catch((error: any) => console.error(error));
```

#### Delete Dashboard

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.DashboardsApi(configuration);

const params: v1.DashboardsApiDeleteDashboardRequest = {
  dashboardId: "abc-def-ghi"
};

apiInstance.deleteDashboard(params)
  .then((data: v1.DashboardDeleteResponse) => {
    console.log("Dashboard deleted");
  })
  .catch((error: any) => console.error(error));
```

### Hosts API

#### List Hosts

Basic host listing:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.HostsApi(configuration);

apiInstance.listHosts()
  .then((data: v1.HostListResponse) => {
    console.log(`Total hosts: ${data.totalMatching}`);
    data.hostList?.forEach(host => {
      console.log(`Host: ${host.name}, Up: ${host.up}`);
    });
  })
  .catch((error: any) => console.error(error));
```

Advanced host filtering:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.HostsApi(configuration);

const params: v1.HostsApiListHostsRequest = {
  filter: "env:production",
  sortField: "cpu",
  sortDir: "desc",
  start: 0,
  count: 100,
  from: Math.floor(Date.now() / 1000) - 3600
};

apiInstance.listHosts(params)
  .then((data: v1.HostListResponse) => {
    console.log("Production hosts sorted by CPU:");
    data.hostList?.forEach(host => {
      console.log(`${host.name}: CPU ${host.metrics?.cpu}%`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Get Host Totals

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.HostsApi(configuration);

const params: v1.HostsApiGetHostTotalsRequest = {
  from: Math.floor(Date.now() / 1000) - 3600
};

apiInstance.getHostTotals(params)
  .then((data: v1.HostTotals) => {
    console.log("Total up hosts:", data.totalUp);
    console.log("Total active hosts:", data.totalActive);
  })
  .catch((error: any) => console.error(error));
```

### Tags API

#### Get Host Tags

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.TagsApi(configuration);

const params: v1.TagsApiGetHostTagsRequest = {
  hostName: "app-server-1"
};

apiInstance.getHostTags(params)
  .then((data: v1.HostTags) => {
    console.log("Tags for host:", data.tags);
  })
  .catch((error: any) => console.error(error));
```

#### Update Host Tags

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.TagsApi(configuration);

const params: v1.TagsApiUpdateHostTagsRequest = {
  hostName: "app-server-1",
  body: {
    tags: [
      "env:production",
      "service:api",
      "version:2.0.0",
      "team:platform"
    ]
  }
};

apiInstance.updateHostTags(params)
  .then((data: v1.HostTags) => {
    console.log("Host tags updated");
  })
  .catch((error: any) => console.error(error));
```

#### Create Host Tags

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.TagsApi(configuration);

const params: v1.TagsApiCreateHostTagsRequest = {
  hostName: "app-server-2",
  body: {
    tags: ["env:staging", "service:api"]
  }
};

apiInstance.createHostTags(params)
  .then((data: v1.HostTags) => {
    console.log("Tags created for new host");
  })
  .catch((error: any) => console.error(error));
```

#### Delete Host Tags

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.TagsApi(configuration);

const params: v1.TagsApiDeleteHostTagsRequest = {
  hostName: "app-server-1"
};

apiInstance.deleteHostTags(params)
  .then(() => {
    console.log("All tags removed from host");
  })
  .catch((error: any) => console.error(error));
```

### Service Checks API

#### Submit Service Check

Basic service check:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.ServiceChecksApi(configuration);

const params: v1.ServiceChecksApiSubmitServiceCheckRequest = {
  body: [
    {
      check: "app.health",
      hostName: "app-server-1",
      status: 0,  // 0=OK, 1=WARNING, 2=CRITICAL, 3=UNKNOWN
      tags: ["env:production"]
    }
  ]
};

apiInstance.submitServiceCheck(params)
  .then((data: v1.IntakePayloadAccepted) => {
    console.log("Service check submitted");
  })
  .catch((error: any) => console.error(error));
```

Advanced service check with message:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.ServiceChecksApi(configuration);

const params: v1.ServiceChecksApiSubmitServiceCheckRequest = {
  body: [
    {
      check: "database.connection",
      hostName: "db-server-1",
      status: 2,  // CRITICAL
      timestamp: Math.floor(Date.now() / 1000),
      message: "Database connection failed: timeout after 30s",
      tags: ["env:production", "service:postgres"]
    }
  ]
};

apiInstance.submitServiceCheck(params)
  .then((data: v1.IntakePayloadAccepted) => {
    console.log("Critical service check submitted");
  })
  .catch((error: any) => console.error(error));
```

### Downtimes API (v2)

#### Create Downtime

Basic downtime creation:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.DowntimesApi(configuration);

const params: v2.DowntimesApiCreateDowntimeRequest = {
  body: {
    data: {
      type: "downtime",
      attributes: {
        scope: "env:staging",
        message: "Planned maintenance window",
        schedule: {
          start: new Date(Date.now() + 3600000).toISOString(),
          end: new Date(Date.now() + 7200000).toISOString()
        }
      }
    }
  }
};

apiInstance.createDowntime(params)
  .then((data: v2.DowntimeResponse) => {
    console.log("Downtime created:", data.data?.id);
  })
  .catch((error: any) => console.error(error));
```

Advanced recurring downtime:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.DowntimesApi(configuration);

const params: v2.DowntimesApiCreateDowntimeRequest = {
  body: {
    data: {
      type: "downtime",
      attributes: {
        scope: "host:app-server-*",
        message: "Weekly maintenance window every Sunday",
        monitorIdentifier: {
          monitorTags: ["maintenance:auto"]
        },
        schedule: {
          start: new Date().toISOString(),
          recurrence: {
            type: "weeks",
            period: 1,
            weekDays: ["Sun"]
          },
          timezone: "America/New_York"
        },
        notifyEndStates: ["alert", "warn"],
        notifyEndTypes: ["expired", "canceled"]
      }
    }
  }
};

apiInstance.createDowntime(params)
  .then((data: v2.DowntimeResponse) => {
    console.log("Recurring downtime created");
  })
  .catch((error: any) => console.error(error));
```

#### List Downtimes

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.DowntimesApi(configuration);

apiInstance.listDowntimes()
  .then((data: v2.ListDowntimesResponse) => {
    data.data?.forEach(downtime => {
      console.log(`ID: ${downtime.id}, Scope: ${downtime.attributes?.scope}`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Cancel Downtime

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.DowntimesApi(configuration);

const params: v2.DowntimesApiCancelDowntimeRequest = {
  downtimeId: "downtime-id-here"
};

apiInstance.cancelDowntime(params)
  .then(() => {
    console.log("Downtime cancelled");
  })
  .catch((error: any) => console.error(error));
```

### Incidents API (v2)

#### Create Incident

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
configuration.unstableOperations["v2.createIncident"] = true;

const apiInstance = new v2.IncidentsApi(configuration);

const params: v2.IncidentsApiCreateIncidentRequest = {
  body: {
    data: {
      type: "incidents",
      attributes: {
        title: "Production API Outage",
        customerImpacted: true,
        fields: {
          severity: {
            type: "dropdown",
            value: "SEV-1"
          },
          state: {
            type: "dropdown",
            value: "active"
          }
        }
      }
    }
  }
};

apiInstance.createIncident(params)
  .then((data: v2.IncidentResponse) => {
    console.log("Incident created:", data.data?.id);
  })
  .catch((error: any) => console.error(error));
```

#### List Incidents

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
configuration.unstableOperations["v2.listIncidents"] = true;

const apiInstance = new v2.IncidentsApi(configuration);

apiInstance.listIncidents()
  .then((data: v2.IncidentsResponse) => {
    data.data?.forEach(incident => {
      console.log(`${incident.id}: ${incident.attributes?.title}`);
    });
  })
  .catch((error: any) => console.error(error));
```

### SLOs API (Service Level Objectives)

#### Create SLO

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.ServiceLevelObjectivesApi(configuration);

const params: v1.ServiceLevelObjectivesApiCreateSLORequest = {
  body: {
    type: "metric",
    name: "API Availability SLO",
    description: "99.9% availability for production API",
    thresholds: [
      {
        target: 99.9,
        targetDisplay: "99.9",
        timeframe: "30d",
        warning: 99.95
      }
    ],
    query: {
      numerator: "sum:api.requests{status:ok}.as_count()",
      denominator: "sum:api.requests{*}.as_count()"
    },
    tags: ["service:api", "env:production"]
  }
};

apiInstance.createSLO(params)
  .then((data: v1.SLOListResponse) => {
    console.log("SLO created:", data.data?.[0].id);
  })
  .catch((error: any) => console.error(error));
```

#### List SLOs

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.ServiceLevelObjectivesApi(configuration);

const params: v1.ServiceLevelObjectivesApiListSLOsRequest = {
  tags: "service:api"
};

apiInstance.listSLOs(params)
  .then((data: v1.SLOListResponse) => {
    data.data?.forEach(slo => {
      console.log(`${slo.name}: ${slo.thresholds?.[0].target}%`);
    });
  })
  .catch((error: any) => console.error(error));
```

### Users API

#### List Users

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.UsersApi(configuration);

apiInstance.listUsers()
  .then((data: v2.UsersResponse) => {
    data.data?.forEach(user => {
      console.log(`${user.attributes?.name}: ${user.attributes?.email}`);
    });
  })
  .catch((error: any) => console.error(error));
```

#### Create User

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.UsersApi(configuration);

const params: v2.UsersApiCreateUserRequest = {
  body: {
    data: {
      type: "users",
      attributes: {
        name: "John Doe",
        email: "john.doe@example.com"
      }
    }
  }
};

apiInstance.createUser(params)
  .then((data: v2.UserResponse) => {
    console.log("User created:", data.data?.id);
  })
  .catch((error: any) => console.error(error));
```

## Error Handling

### Basic Error Handling

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.MonitorsApi(configuration);

apiInstance.listMonitors()
  .then((data: v1.Monitor[]) => {
    console.log("Success:", data);
  })
  .catch((error: any) => {
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", error.response.body);
    } else {
      console.error("Error:", error.message);
    }
  });
```

### Advanced Error Handling with Retry

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configurationOpts = {
  enableRetry: true,
  maxRetries: 3,
  backoffMultiplier: 2
};

const configuration = client.createConfiguration(configurationOpts);
const apiInstance = new v1.MetricsApi(configuration);

async function submitMetricsWithRetry() {
  try {
    const params: v1.MetricsApiSubmitMetricsRequest = {
      body: {
        series: [{
          metric: "custom.metric",
          points: [[Math.floor(Date.now() / 1000), 100]]
        }]
      }
    };

    const result = await apiInstance.submitMetrics(params);
    console.log("Metrics submitted successfully");
    return result;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error("Rate limited - automatic retry will handle this");
    } else if (error.response?.status === 403) {
      console.error("Authentication failed - check API keys");
    } else if (error.response?.status === 400) {
      console.error("Bad request:", error.response.body);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

submitMetricsWithRetry();
```

## Pagination

### Manual Pagination

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v1.HostsApi(configuration);

async function getAllHosts() {
  const allHosts: any[] = [];
  let start = 0;
  const count = 100;
  let hasMore = true;

  while (hasMore) {
    const params: v1.HostsApiListHostsRequest = {
      start: start,
      count: count
    };

    const data = await apiInstance.listHosts(params);

    if (data.hostList) {
      allHosts.push(...data.hostList);
    }

    start += count;
    hasMore = (data.hostList?.length || 0) === count;
  }

  return allHosts;
}

getAllHosts().then(hosts => {
  console.log(`Retrieved ${hosts.length} total hosts`);
});
```

### Automatic Pagination with Async Iterator

```typescript
import { client, v2 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();
const apiInstance = new v2.LogsApi(configuration);

async function processAllLogs() {
  const params: v2.LogsApiListLogsRequest = {
    body: {
      filter: {
        query: "service:api",
        from: new Date(Date.now() - 3600000).toISOString(),
        to: new Date().toISOString()
      },
      page: {
        limit: 100
      }
    }
  };

  // Some endpoints support pagination
  for await (const log of apiInstance.listLogsWithPagination(params)) {
    console.log(log.attributes?.message);
  }
}

processAllLogs();
```

## Async/Await Pattern

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configuration = client.createConfiguration();

async function monitorWorkflow() {
  const monitorsApi = new v1.MonitorsApi(configuration);
  const eventsApi = new v1.EventsApi(configuration);

  try {
    // Create monitor
    const monitor = await monitorsApi.createMonitor({
      body: {
        type: "metric alert",
        query: "avg(last_5m):avg:system.cpu.user{*} > 80",
        name: "High CPU Alert",
        message: "CPU is high @slack-alerts"
      }
    });

    console.log("Monitor created:", monitor.id);

    // Post event about monitor creation
    await eventsApi.createEvent({
      body: {
        title: "Monitor Created",
        text: `Created new monitor: ${monitor.name}`,
        tags: ["automation", "monitoring"]
      }
    });

    console.log("Event posted");

    // List all monitors
    const monitors = await monitorsApi.listMonitors();
    console.log(`Total monitors: ${monitors.length}`);

  } catch (error) {
    console.error("Workflow failed:", error);
  }
}

monitorWorkflow();
```

## TypeScript Types

The package includes full TypeScript definitions:

```typescript
import { client, v1, v2 } from '@datadog/datadog-api-client';

// Configuration type
const config: client.Configuration = client.createConfiguration();

// Monitor type
const monitor: v1.Monitor = {
  type: "metric alert",
  query: "avg(last_5m):avg:system.cpu.user{*} > 80",
  name: "CPU Alert",
  message: "High CPU usage detected"
};

// Metric series type
const series: v1.Series = {
  metric: "custom.metric",
  points: [[Math.floor(Date.now() / 1000), 100]],
  type: "gauge",
  host: "server-1",
  tags: ["env:prod"]
};

// Event type
const event: v1.Event = {
  title: "Deployment",
  text: "Version deployed",
  dateHappened: Math.floor(Date.now() / 1000),
  priority: "normal",
  tags: ["deployment"],
  alertType: "info"
};
```

## Rate Limiting

Datadog API enforces rate limits. Enable automatic retry on rate limiting:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';

const configurationOpts = {
  enableRetry: true,
  maxRetries: 5,
  backoffMultiplier: 2,
  backoffBase: 2
};

const configuration = client.createConfiguration(configurationOpts);

// The client will automatically retry on 429 responses
const apiInstance = new v1.MetricsApi(configuration);
```

## Request Timeouts

Configure custom request timeouts:

```typescript
import { client } from '@datadog/datadog-api-client';

const configurationOpts = {
  httpConfig: {
    timeout: 60000  // 60 seconds
  }
};

const configuration = client.createConfiguration(configurationOpts);
```

## Compression

Enable compression for large payloads:

```typescript
import { client, v2 } from '@datadog/datadog-api-client';
import { compressSync } from 'zstd.ts';

const configurationOpts = {
  zstdCompressorCallback: (body: string) =>
    compressSync({ input: Buffer.from(body, "utf8") })
};

const configuration = client.createConfiguration(configurationOpts);
const apiInstance = new v2.MetricsApi(configuration);

// Submit with compression
const params: v2.MetricsApiSubmitMetricsRequest = {
  body: { series: [/* large payload */] },
  contentEncoding: "zstd1"
};

apiInstance.submitMetrics(params);
```

## Debug Logging

Enable debug logging to see request/response details:

```typescript
import { client } from '@datadog/datadog-api-client';

const configurationOpts = {
  debug: true
};

const configuration = client.createConfiguration(configurationOpts);

// All API calls will log request and response details
```

## Canceling Requests

Use AbortController to cancel in-flight requests:

```typescript
import { client, v1 } from '@datadog/datadog-api-client';
import AbortController from 'abort-controller';

const controller = new AbortController();

const configurationOpts = {
  httpConfig: { signal: controller.signal }
};

const configuration = client.createConfiguration(configurationOpts);
const apiInstance = new v1.MonitorsApi(configuration);

// Start request
apiInstance.listMonitors()
  .then((data) => console.log(data))
  .catch((error) => console.error("Request cancelled or failed"));

// Cancel after 1 second
setTimeout(() => controller.abort(), 1000);
```
