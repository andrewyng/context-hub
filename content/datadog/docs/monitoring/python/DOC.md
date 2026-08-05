---
name: monitoring
description: "Official Datadog API client for Python to submit metrics, manage monitors, and interact with Datadog observability features."
metadata:
  languages: "python"
  versions: "2.55.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "datadog,monitoring,metrics,observability,apm"
---

# Datadog API Client for Python

## Golden Rule

**ALWAYS use `datadog-api-client` version 2.55.0 or later.**

This is the official Datadog API client for Python. Do NOT use:
- `datadog` (legacy library, limited functionality)
- `datadogpy` (old library, use datadog-api-client instead)
- Direct HTTP calls to Datadog API endpoints (use the official client instead)

The `datadog-api-client` package provides complete access to both v1 and v2 Datadog APIs with full type hints and async support.

## Installation

### Basic Installation

```bash
pip install datadog-api-client
```

### With Async Support

```bash
pip install datadog-api-client[async]
```

### Requirements

- Python 3.8 or higher

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

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)
    monitors = api_instance.list_monitors()
    print(monitors)
```

### Manual Authentication

Provide credentials explicitly in code:

```python
from datadog_api_client import ApiClient, Configuration

configuration = Configuration()
configuration.api_key["apiKeyAuth"] = "your-api-key-here"
configuration.api_key["appKeyAuth"] = "your-application-key-here"

with ApiClient(configuration) as api_client:
    # Use api_client for API calls
    pass
```

### Regional Configuration

Configure for EU or other regions:

```python
from datadog_api_client import ApiClient, Configuration

configuration = Configuration()
configuration.server_variables["site"] = "datadoghq.eu"

with ApiClient(configuration) as api_client:
    # Use api_client for API calls
    pass
```

Available sites:
- `datadoghq.com` (US1 - default)
- `datadoghq.eu` (EU1)
- `us3.datadoghq.com` (US3)
- `us5.datadoghq.com` (US5)
- `ap1.datadoghq.com` (AP1)
- `ddog-gov.com` (US1-FED)

### Advanced Configuration Options

```python
from datadog_api_client import ApiClient, Configuration

configuration = Configuration()
configuration.api_key["apiKeyAuth"] = "your-api-key"
configuration.api_key["appKeyAuth"] = "your-app-key"
configuration.server_variables["site"] = "datadoghq.com"

# Enable debugging
configuration.debug = True

# Set connection timeout
configuration.connection_timeout = 30

# Set read timeout
configuration.read_timeout = 30

with ApiClient(configuration) as api_client:
    # Use api_client for API calls
    pass
```

### Enable Unstable Operations

Some v2 endpoints are marked as unstable and require explicit enablement:

```python
from datadog_api_client import ApiClient, Configuration

configuration = Configuration()
configuration.unstable_operations["list_incidents"] = True
configuration.unstable_operations["create_incident"] = True

with ApiClient(configuration) as api_client:
    # Use unstable operations
    pass
```

### Async Initialization

For asynchronous operations:

```python
import asyncio
from datadog_api_client import AsyncApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

async def main():
    configuration = Configuration()

    async with AsyncApiClient(configuration) as api_client:
        api_instance = MonitorsApi(api_client)
        monitors = await api_instance.list_monitors()
        print(monitors)

asyncio.run(main())
```

### Threaded API Client

For concurrent operations:

```python
from datadog_api_client import Configuration, ThreadedApiClient
from datadog_api_client.v1.api.dashboards_api import DashboardsApi

configuration = Configuration()

with ThreadedApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)
    result = api_instance.list_dashboards()
    dashboards = result.get()
    print(dashboards)
```

## Core API Surfaces

### Metrics API

#### Submit Metrics (v1)

Basic metric submission:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
from datadog_api_client.v1.model.metrics_payload import MetricsPayload
from datadog_api_client.v1.model.series import Series
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    body = MetricsPayload(
        series=[
            Series(
                metric="system.load.1",
                type="gauge",
                points=[[int(time.time()), 0.7]],
                host="test.example.com",
                tags=["environment:test", "version:1.0"]
            )
        ]
    )

    response = api_instance.submit_metrics(body=body)
    print("Metrics submitted successfully")
```

Advanced metric submission with multiple series:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
from datadog_api_client.v1.model.metrics_payload import MetricsPayload
from datadog_api_client.v1.model.series import Series
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    now = int(time.time())

    body = MetricsPayload(
        series=[
            Series(
                metric="custom.app.requests",
                type="count",
                points=[[now, 100]],
                interval=60,
                host="app-server-1",
                tags=["service:api", "env:production"]
            ),
            Series(
                metric="custom.app.latency",
                type="gauge",
                points=[[now, 45.2]],
                host="app-server-1",
                tags=["service:api", "env:production"]
            ),
            Series(
                metric="custom.app.errors",
                type="count",
                points=[[now, 2]],
                host="app-server-1",
                tags=["service:api", "env:production", "error_type:timeout"]
            )
        ]
    )

    response = api_instance.submit_metrics(body=body)
    print("Multiple metrics submitted")
```

#### Submit Metrics (v2)

v2 API with compression support:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.metrics_api import MetricsApi
from datadog_api_client.v2.model.metric_payload import MetricPayload
from datadog_api_client.v2.model.metric_series import MetricSeries
from datadog_api_client.v2.model.metric_point import MetricPoint
from datadog_api_client.v2.model.metric_resource import MetricResource
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    body = MetricPayload(
        series=[
            MetricSeries(
                metric="system.load.1",
                type=0,  # gauge
                points=[
                    MetricPoint(
                        timestamp=int(time.time()),
                        value=0.7
                    )
                ],
                resources=[
                    MetricResource(
                        name="host",
                        type="host"
                    )
                ],
                tags=["environment:production"]
            )
        ]
    )

    response = api_instance.submit_metrics(body=body)
    print("Metrics submitted with v2 API")
```

#### Query Metrics

Query timeseries data:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    from_time = int(time.time()) - 3600  # 1 hour ago
    to_time = int(time.time())

    response = api_instance.query_metrics(
        _from=from_time,
        to=to_time,
        query="avg:system.cpu.user{*}"
    )

    print("Query results:", response)
```

Advanced query with aggregation:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    from_time = int(time.time()) - 86400  # 24 hours ago
    to_time = int(time.time())

    response = api_instance.query_metrics(
        _from=from_time,
        to=to_time,
        query="sum:custom.app.requests{env:production}.rollup(sum, 3600)"
    )

    print("Aggregated results:", response)
```

#### List Active Metrics

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    from_time = int(time.time()) - 3600

    response = api_instance.list_active_metrics(
        _from=from_time
    )

    print("Active metrics:", response.metrics)
```

### Monitors API

#### Create Monitor

Basic monitor creation:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.model.monitor import Monitor
from datadog_api_client.v1.model.monitor_type import MonitorType
from datadog_api_client.v1.model.monitor_options import MonitorOptions
from datadog_api_client.v1.model.monitor_thresholds import MonitorThresholds

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    body = Monitor(
        type=MonitorType.METRIC_ALERT,
        query="avg(last_5m):avg:system.cpu.user{*} > 80",
        name="High CPU Usage",
        message="CPU usage is above 80% @slack-alerts",
        tags=["env:production", "team:platform"],
        options=MonitorOptions(
            thresholds=MonitorThresholds(
                critical=80.0,
                warning=60.0
            ),
            notify_no_data=True,
            no_data_timeframe=20,
            notify_audit=False,
            require_full_window=False,
            include_tags=True
        )
    )

    response = api_instance.create_monitor(body=body)
    print(f"Monitor created: {response.id}")
```

Advanced monitor with composite query:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.model.monitor import Monitor
from datadog_api_client.v1.model.monitor_type import MonitorType
from datadog_api_client.v1.model.monitor_options import MonitorOptions
from datadog_api_client.v1.model.monitor_thresholds import MonitorThresholds

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    body = Monitor(
        type=MonitorType.QUERY_ALERT,
        query="avg(last_15m):anomalies(avg:custom.app.latency{env:production}, 'basic', 2) >= 1",
        name="Anomalous Latency Detected",
        message="""Application latency is behaving abnormally.

Current value: {{value}}
Threshold: {{threshold}}

@pagerduty-critical @slack-alerts""",
        tags=["service:api", "priority:high"],
        priority=1,
        options=MonitorOptions(
            thresholds=MonitorThresholds(
                critical=1.0,
                critical_recovery=0.0
            ),
            notify_no_data=True,
            no_data_timeframe=30,
            evaluation_delay=60,
            new_group_delay=300,
            require_full_window=False,
            notify_audit=True,
            timeout_h=24,
            renotify_interval=60,
            escalation_message="Latency issue still ongoing @oncall"
        )
    )

    response = api_instance.create_monitor(body=body)
    print(f"Anomaly monitor created: {response.id}")
```

#### List Monitors

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    monitors = api_instance.list_monitors(
        tags="env:production",
        monitor_tags="team:platform"
    )

    for monitor in monitors:
        print(f"ID: {monitor.id}, Name: {monitor.name}")
```

#### Get Monitor

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    monitor = api_instance.get_monitor(monitor_id=123456)
    print("Monitor details:", monitor)
```

#### Update Monitor

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.model.monitor import Monitor
from datadog_api_client.v1.model.monitor_options import MonitorOptions
from datadog_api_client.v1.model.monitor_thresholds import MonitorThresholds

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    body = Monitor(
        name="Updated Monitor Name",
        options=MonitorOptions(
            thresholds=MonitorThresholds(
                critical=90.0,
                warning=70.0
            )
        )
    )

    response = api_instance.update_monitor(
        monitor_id=123456,
        body=body
    )
    print("Monitor updated")
```

#### Delete Monitor

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    api_instance.delete_monitor(monitor_id=123456)
    print("Monitor deleted")
```

### Events API

#### Post Event

Basic event submission:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.events_api import EventsApi
from datadog_api_client.v1.model.event_create_request import EventCreateRequest

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = EventsApi(api_client)

    body = EventCreateRequest(
        title="Application Deployment",
        text="Version 2.0.0 deployed to production",
        tags=["env:production", "version:2.0.0", "deployment"]
    )

    response = api_instance.create_event(body=body)
    print(f"Event created: {response.event.id}")
```

Advanced event with priority and alert type:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.events_api import EventsApi
from datadog_api_client.v1.model.event_create_request import EventCreateRequest
from datadog_api_client.v1.model.event_priority import EventPriority
from datadog_api_client.v1.model.event_alert_type import EventAlertType
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = EventsApi(api_client)

    body = EventCreateRequest(
        title="Database Migration Completed",
        text="""Database migration to schema version 15 completed successfully.

Duration: 45 minutes
Tables affected: 12
Records migrated: 1.2M""",
        date_happened=int(time.time()),
        priority=EventPriority.NORMAL,
        tags=["service:database", "env:production", "migration"],
        alert_type=EventAlertType.INFO,
        aggregation_key="db_migration_v15",
        source_type_name="my-app",
        host="db-server-1"
    )

    response = api_instance.create_event(body=body)
    print("Migration event created")
```

#### List Events

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.events_api import EventsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = EventsApi(api_client)

    end = int(time.time())
    start = end - 3600  # Last hour

    response = api_instance.list_events(
        start=start,
        end=end,
        tags="env:production"
    )

    print(f"Found {len(response.events)} events")
    for event in response.events:
        print(f"{event.title}: {event.text}")
```

#### Get Event

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.events_api import EventsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = EventsApi(api_client)

    response = api_instance.get_event(event_id=1234567890)
    print("Event details:", response.event)
```

### Logs API

#### Send Logs (v2)

Basic log submission:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.logs_api import LogsApi
from datadog_api_client.v2.model.http_log import HTTPLog
from datadog_api_client.v2.model.http_log_item import HTTPLogItem

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = LogsApi(api_client)

    body = [
        HTTPLogItem(
            ddsource="nodejs",
            ddtags="env:production,service:api",
            hostname="app-server-1",
            message="User login successful",
            service="authentication"
        )
    ]

    response = api_instance.submit_log(body=body)
    print("Log submitted")
```

Advanced log submission with structured data:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.logs_api import LogsApi
from datadog_api_client.v2.model.http_log_item import HTTPLogItem
from datetime import datetime

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = LogsApi(api_client)

    body = [
        HTTPLogItem(
            ddsource="application",
            ddtags="env:production,version:2.0.0",
            hostname="api-server-2",
            message="Payment processed successfully",
            service="payment-gateway",
            status="info",
            _date=datetime.now().isoformat(),
            **{
                "transaction_id": "txn_abc123",
                "amount": 99.99,
                "currency": "USD",
                "user_id": "user_456",
                "payment_method": "credit_card"
            }
        )
    ]

    response = api_instance.submit_log(body=body)
    print("Structured log submitted")
```

#### List Logs

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.logs_api import LogsApi
from datadog_api_client.v2.model.logs_list_request import LogsListRequest
from datadog_api_client.v2.model.logs_query_filter import LogsQueryFilter
from datadog_api_client.v2.model.logs_list_request_page import LogsListRequestPage
from datadog_api_client.v2.model.logs_sort import LogsSort
from datetime import datetime, timedelta

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = LogsApi(api_client)

    body = LogsListRequest(
        filter=LogsQueryFilter(
            query="service:api status:error",
            _from=(datetime.now() - timedelta(hours=1)).isoformat(),
            to=datetime.now().isoformat()
        ),
        page=LogsListRequestPage(limit=50),
        sort=LogsSort.TIMESTAMP_DESCENDING
    )

    response = api_instance.list_logs(body=body)

    print(f"Found {len(response.data)} error logs")
    for log in response.data:
        print(log.attributes.message)
```

### Dashboards API

#### Create Dashboard

Basic dashboard creation:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.model.dashboard import Dashboard
from datadog_api_client.v1.model.dashboard_layout_type import DashboardLayoutType
from datadog_api_client.v1.model.widget import Widget
from datadog_api_client.v1.model.timeseries_widget_definition import TimeseriesWidgetDefinition
from datadog_api_client.v1.model.timeseries_widget_request import TimeseriesWidgetRequest
from datadog_api_client.v1.model.widget_display_type import WidgetDisplayType

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    body = Dashboard(
        title="System Metrics Dashboard",
        description="Overview of system performance metrics",
        layout_type=DashboardLayoutType.ORDERED,
        widgets=[
            Widget(
                definition=TimeseriesWidgetDefinition(
                    type="timeseries",
                    requests=[
                        TimeseriesWidgetRequest(
                            q="avg:system.cpu.user{*}",
                            display_type=WidgetDisplayType.LINE
                        )
                    ],
                    title="CPU Usage"
                )
            )
        ]
    )

    response = api_instance.create_dashboard(body=body)
    print(f"Dashboard created: {response.id}")
```

Advanced dashboard with multiple widgets:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.model.dashboard import Dashboard
from datadog_api_client.v1.model.dashboard_layout_type import DashboardLayoutType
from datadog_api_client.v1.model.widget import Widget
from datadog_api_client.v1.model.timeseries_widget_definition import TimeseriesWidgetDefinition
from datadog_api_client.v1.model.timeseries_widget_request import TimeseriesWidgetRequest
from datadog_api_client.v1.model.query_value_widget_definition import QueryValueWidgetDefinition
from datadog_api_client.v1.model.query_value_widget_request import QueryValueWidgetRequest
from datadog_api_client.v1.model.toplist_widget_definition import ToplistWidgetDefinition
from datadog_api_client.v1.model.toplist_widget_request import ToplistWidgetRequest
from datadog_api_client.v1.model.widget_display_type import WidgetDisplayType
from datadog_api_client.v1.model.dashboard_template_variable import DashboardTemplateVariable

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    body = Dashboard(
        title="Application Performance Dashboard",
        description="Production application metrics and monitoring",
        layout_type=DashboardLayoutType.ORDERED,
        widgets=[
            Widget(
                definition=TimeseriesWidgetDefinition(
                    type="timeseries",
                    requests=[
                        TimeseriesWidgetRequest(
                            q="avg:custom.app.latency{env:production}",
                            display_type=WidgetDisplayType.LINE
                        )
                    ],
                    title="API Latency",
                    show_legend=True
                )
            ),
            Widget(
                definition=QueryValueWidgetDefinition(
                    type="query_value",
                    requests=[
                        QueryValueWidgetRequest(
                            q="sum:custom.app.requests{env:production}.as_count()",
                            aggregator="sum"
                        )
                    ],
                    title="Total Requests",
                    autoscale=True,
                    precision=0
                )
            ),
            Widget(
                definition=ToplistWidgetDefinition(
                    type="toplist",
                    requests=[
                        ToplistWidgetRequest(
                            q="top(avg:custom.app.errors{env:production} by {error_type}, 10, 'sum', 'desc')"
                        )
                    ],
                    title="Top Errors by Type"
                )
            )
        ],
        template_variables=[
            DashboardTemplateVariable(
                name="env",
                default="production",
                prefix="env"
            )
        ],
        notify_list=["user@example.com"]
    )

    response = api_instance.create_dashboard(body=body)
    print(f"Advanced dashboard created: {response.id}")
```

#### List Dashboards

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    response = api_instance.list_dashboards()

    for dashboard in response.dashboards:
        print(f"ID: {dashboard.id}, Title: {dashboard.title}")
```

#### Get Dashboard

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    dashboard = api_instance.get_dashboard(dashboard_id="abc-def-ghi")
    print("Dashboard:", dashboard)
```

#### Update Dashboard

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.model.dashboard import Dashboard
from datadog_api_client.v1.model.dashboard_layout_type import DashboardLayoutType

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    body = Dashboard(
        title="Updated Dashboard Title",
        description="Updated description",
        layout_type=DashboardLayoutType.ORDERED,
        widgets=[]  # Include all widgets
    )

    response = api_instance.update_dashboard(
        dashboard_id="abc-def-ghi",
        body=body
    )
    print("Dashboard updated")
```

#### Delete Dashboard

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.dashboards_api import DashboardsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DashboardsApi(api_client)

    api_instance.delete_dashboard(dashboard_id="abc-def-ghi")
    print("Dashboard deleted")
```

### Hosts API

#### List Hosts

Basic host listing:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.hosts_api import HostsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = HostsApi(api_client)

    response = api_instance.list_hosts()

    print(f"Total hosts: {response.total_matching}")
    for host in response.host_list:
        print(f"Host: {host.name}, Up: {host.up}")
```

Advanced host filtering:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.hosts_api import HostsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = HostsApi(api_client)

    response = api_instance.list_hosts(
        filter="env:production",
        sort_field="cpu",
        sort_dir="desc",
        start=0,
        count=100,
        _from=int(time.time()) - 3600
    )

    print("Production hosts sorted by CPU:")
    for host in response.host_list:
        print(f"{host.name}: CPU {host.metrics.cpu}%")
```

#### Get Host Totals

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.hosts_api import HostsApi
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = HostsApi(api_client)

    response = api_instance.get_host_totals(
        _from=int(time.time()) - 3600
    )

    print(f"Total up hosts: {response.total_up}")
    print(f"Total active hosts: {response.total_active}")
```

### Tags API

#### Get Host Tags

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.tags_api import TagsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = TagsApi(api_client)

    response = api_instance.get_host_tags(host_name="app-server-1")
    print("Tags for host:", response.tags)
```

#### Update Host Tags

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.tags_api import TagsApi
from datadog_api_client.v1.model.host_tags import HostTags

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = TagsApi(api_client)

    body = HostTags(
        tags=[
            "env:production",
            "service:api",
            "version:2.0.0",
            "team:platform"
        ]
    )

    response = api_instance.update_host_tags(
        host_name="app-server-1",
        body=body
    )
    print("Host tags updated")
```

#### Create Host Tags

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.tags_api import TagsApi
from datadog_api_client.v1.model.host_tags import HostTags

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = TagsApi(api_client)

    body = HostTags(
        tags=["env:staging", "service:api"]
    )

    response = api_instance.create_host_tags(
        host_name="app-server-2",
        body=body
    )
    print("Tags created for new host")
```

#### Delete Host Tags

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.tags_api import TagsApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = TagsApi(api_client)

    api_instance.delete_host_tags(host_name="app-server-1")
    print("All tags removed from host")
```

### Service Checks API

#### Submit Service Check

Basic service check:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.service_checks_api import ServiceChecksApi
from datadog_api_client.v1.model.service_check import ServiceCheck
from datadog_api_client.v1.model.service_check_status import ServiceCheckStatus

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = ServiceChecksApi(api_client)

    body = [
        ServiceCheck(
            check="app.health",
            host_name="app-server-1",
            status=ServiceCheckStatus.OK,  # OK, WARNING, CRITICAL, UNKNOWN
            tags=["env:production"]
        )
    ]

    response = api_instance.submit_service_check(body=body)
    print("Service check submitted")
```

Advanced service check with message:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.service_checks_api import ServiceChecksApi
from datadog_api_client.v1.model.service_check import ServiceCheck
from datadog_api_client.v1.model.service_check_status import ServiceCheckStatus
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = ServiceChecksApi(api_client)

    body = [
        ServiceCheck(
            check="database.connection",
            host_name="db-server-1",
            status=ServiceCheckStatus.CRITICAL,
            timestamp=int(time.time()),
            message="Database connection failed: timeout after 30s",
            tags=["env:production", "service:postgres"]
        )
    ]

    response = api_instance.submit_service_check(body=body)
    print("Critical service check submitted")
```

### Downtimes API (v2)

#### Create Downtime

Basic downtime creation:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.downtimes_api import DowntimesApi
from datadog_api_client.v2.model.downtime_create_request import DowntimeCreateRequest
from datadog_api_client.v2.model.downtime_create_request_data import DowntimeCreateRequestData
from datadog_api_client.v2.model.downtime_create_request_attributes import DowntimeCreateRequestAttributes
from datadog_api_client.v2.model.downtime_schedule_create_request import DowntimeScheduleCreateRequest
from datetime import datetime, timedelta

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DowntimesApi(api_client)

    body = DowntimeCreateRequest(
        data=DowntimeCreateRequestData(
            type="downtime",
            attributes=DowntimeCreateRequestAttributes(
                scope="env:staging",
                message="Planned maintenance window",
                schedule=DowntimeScheduleCreateRequest(
                    start=(datetime.now() + timedelta(hours=1)).isoformat(),
                    end=(datetime.now() + timedelta(hours=2)).isoformat()
                )
            )
        )
    )

    response = api_instance.create_downtime(body=body)
    print(f"Downtime created: {response.data.id}")
```

Advanced recurring downtime:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.downtimes_api import DowntimesApi
from datadog_api_client.v2.model.downtime_create_request import DowntimeCreateRequest
from datadog_api_client.v2.model.downtime_create_request_data import DowntimeCreateRequestData
from datadog_api_client.v2.model.downtime_create_request_attributes import DowntimeCreateRequestAttributes
from datadog_api_client.v2.model.downtime_schedule_create_request import DowntimeScheduleCreateRequest
from datadog_api_client.v2.model.downtime_schedule_recurrence_create_update_request import DowntimeScheduleRecurrenceCreateUpdateRequest
from datadog_api_client.v2.model.downtime_monitor_identifier import DowntimeMonitorIdentifier
from datetime import datetime

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DowntimesApi(api_client)

    body = DowntimeCreateRequest(
        data=DowntimeCreateRequestData(
            type="downtime",
            attributes=DowntimeCreateRequestAttributes(
                scope="host:app-server-*",
                message="Weekly maintenance window every Sunday",
                monitor_identifier=DowntimeMonitorIdentifier(
                    monitor_tags=["maintenance:auto"]
                ),
                schedule=DowntimeScheduleCreateRequest(
                    start=datetime.now().isoformat(),
                    recurrence=DowntimeScheduleRecurrenceCreateUpdateRequest(
                        type="weeks",
                        period=1,
                        week_days=["Sun"]
                    ),
                    timezone="America/New_York"
                ),
                notify_end_states=["alert", "warn"],
                notify_end_types=["expired", "canceled"]
            )
        )
    )

    response = api_instance.create_downtime(body=body)
    print("Recurring downtime created")
```

#### List Downtimes

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.downtimes_api import DowntimesApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DowntimesApi(api_client)

    response = api_instance.list_downtimes()

    for downtime in response.data:
        print(f"ID: {downtime.id}, Scope: {downtime.attributes.scope}")
```

#### Cancel Downtime

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.downtimes_api import DowntimesApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = DowntimesApi(api_client)

    api_instance.cancel_downtime(downtime_id="downtime-id-here")
    print("Downtime cancelled")
```

### Incidents API (v2)

#### Create Incident

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.incidents_api import IncidentsApi
from datadog_api_client.v2.model.incident_create_request import IncidentCreateRequest
from datadog_api_client.v2.model.incident_create_data import IncidentCreateData
from datadog_api_client.v2.model.incident_create_attributes import IncidentCreateAttributes
from datadog_api_client.v2.model.incident_field_attributes import IncidentFieldAttributes

configuration = Configuration()
configuration.unstable_operations["create_incident"] = True

with ApiClient(configuration) as api_client:
    api_instance = IncidentsApi(api_client)

    body = IncidentCreateRequest(
        data=IncidentCreateData(
            type="incidents",
            attributes=IncidentCreateAttributes(
                title="Production API Outage",
                customer_impacted=True,
                fields={
                    "severity": IncidentFieldAttributes(
                        type="dropdown",
                        value="SEV-1"
                    ),
                    "state": IncidentFieldAttributes(
                        type="dropdown",
                        value="active"
                    )
                }
            )
        )
    )

    response = api_instance.create_incident(body=body)
    print(f"Incident created: {response.data.id}")
```

#### List Incidents

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.incidents_api import IncidentsApi

configuration = Configuration()
configuration.unstable_operations["list_incidents"] = True

with ApiClient(configuration) as api_client:
    api_instance = IncidentsApi(api_client)

    response = api_instance.list_incidents()

    for incident in response.data:
        print(f"{incident.id}: {incident.attributes.title}")
```

### SLOs API (Service Level Objectives)

#### Create SLO

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.service_level_objectives_api import ServiceLevelObjectivesApi
from datadog_api_client.v1.model.service_level_objective_request import ServiceLevelObjectiveRequest
from datadog_api_client.v1.model.slo_type import SLOType
from datadog_api_client.v1.model.slo_threshold import SLOThreshold
from datadog_api_client.v1.model.slo_timeframe import SLOTimeframe

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = ServiceLevelObjectivesApi(api_client)

    body = ServiceLevelObjectiveRequest(
        type=SLOType.METRIC,
        name="API Availability SLO",
        description="99.9% availability for production API",
        thresholds=[
            SLOThreshold(
                target=99.9,
                target_display="99.9",
                timeframe=SLOTimeframe.THIRTY_DAYS,
                warning=99.95
            )
        ],
        query={
            "numerator": "sum:api.requests{status:ok}.as_count()",
            "denominator": "sum:api.requests{*}.as_count()"
        },
        tags=["service:api", "env:production"]
    )

    response = api_instance.create_slo(body=body)
    print(f"SLO created: {response.data[0].id}")
```

#### List SLOs

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.service_level_objectives_api import ServiceLevelObjectivesApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = ServiceLevelObjectivesApi(api_client)

    response = api_instance.list_slos(tags="service:api")

    for slo in response.data:
        print(f"{slo.name}: {slo.thresholds[0].target}%")
```

### Users API

#### List Users

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.users_api import UsersApi

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = UsersApi(api_client)

    response = api_instance.list_users()

    for user in response.data:
        print(f"{user.attributes.name}: {user.attributes.email}")
```

#### Create User

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.users_api import UsersApi
from datadog_api_client.v2.model.user_create_request import UserCreateRequest
from datadog_api_client.v2.model.user_create_data import UserCreateData
from datadog_api_client.v2.model.user_create_attributes import UserCreateAttributes

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = UsersApi(api_client)

    body = UserCreateRequest(
        data=UserCreateData(
            type="users",
            attributes=UserCreateAttributes(
                name="John Doe",
                email="john.doe@example.com"
            )
        )
    )

    response = api_instance.create_user(body=body)
    print(f"User created: {response.data.id}")
```

## Error Handling

### Basic Error Handling

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.exceptions import ApiException

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)

    try:
        monitors = api_instance.list_monitors()
        print("Success:", monitors)
    except ApiException as e:
        print(f"API Exception: {e.status} - {e.reason}")
        print(f"Body: {e.body}")
    except Exception as e:
        print(f"Error: {str(e)}")
```

### Advanced Error Handling with Retry

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
from datadog_api_client.v1.model.metrics_payload import MetricsPayload
from datadog_api_client.v1.model.series import Series
from datadog_api_client.exceptions import ApiException
import time

configuration = Configuration()

def submit_metrics_with_retry(max_retries=3):
    with ApiClient(configuration) as api_client:
        api_instance = MetricsApi(api_client)

        body = MetricsPayload(
            series=[
                Series(
                    metric="custom.metric",
                    points=[[int(time.time()), 100]]
                )
            ]
        )

        for attempt in range(max_retries):
            try:
                result = api_instance.submit_metrics(body=body)
                print("Metrics submitted successfully")
                return result
            except ApiException as e:
                if e.status == 429:
                    print(f"Rate limited - retry {attempt + 1}/{max_retries}")
                    time.sleep(2 ** attempt)
                elif e.status == 403:
                    print("Authentication failed - check API keys")
                    raise
                elif e.status == 400:
                    print(f"Bad request: {e.body}")
                    raise
                else:
                    print(f"Unexpected error: {e}")
                    raise

submit_metrics_with_retry()
```

## Pagination

### Manual Pagination

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.hosts_api import HostsApi

configuration = Configuration()

def get_all_hosts():
    with ApiClient(configuration) as api_client:
        api_instance = HostsApi(api_client)

        all_hosts = []
        start = 0
        count = 100
        has_more = True

        while has_more:
            response = api_instance.list_hosts(start=start, count=count)

            if response.host_list:
                all_hosts.extend(response.host_list)

            start += count
            has_more = len(response.host_list) == count

        return all_hosts

hosts = get_all_hosts()
print(f"Retrieved {len(hosts)} total hosts")
```

### Automatic Pagination with Iterator

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v2.api.incidents_api import IncidentsApi

configuration = Configuration()
configuration.unstable_operations["list_incidents"] = True

with ApiClient(configuration) as api_client:
    api_instance = IncidentsApi(api_client)

    # Some endpoints support pagination
    for incident in api_instance.list_incidents_with_pagination():
        print(f"Incident: {incident.id} - {incident.attributes.title}")
```

## Async/Await Pattern

```python
import asyncio
from datadog_api_client import AsyncApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.api.events_api import EventsApi
from datadog_api_client.v1.model.monitor import Monitor
from datadog_api_client.v1.model.monitor_type import MonitorType
from datadog_api_client.v1.model.event_create_request import EventCreateRequest

async def monitor_workflow():
    configuration = Configuration()

    async with AsyncApiClient(configuration) as api_client:
        monitors_api = MonitorsApi(api_client)
        events_api = EventsApi(api_client)

        try:
            # Create monitor
            monitor_body = Monitor(
                type=MonitorType.METRIC_ALERT,
                query="avg(last_5m):avg:system.cpu.user{*} > 80",
                name="High CPU Alert",
                message="CPU is high @slack-alerts"
            )

            monitor = await monitors_api.create_monitor(body=monitor_body)
            print(f"Monitor created: {monitor.id}")

            # Post event about monitor creation
            event_body = EventCreateRequest(
                title="Monitor Created",
                text=f"Created new monitor: {monitor.name}",
                tags=["automation", "monitoring"]
            )

            await events_api.create_event(body=event_body)
            print("Event posted")

            # List all monitors
            monitors = await monitors_api.list_monitors()
            print(f"Total monitors: {len(monitors)}")

        except Exception as e:
            print(f"Workflow failed: {e}")

asyncio.run(monitor_workflow())
```

## Concurrent Async Operations

```python
import asyncio
from datadog_api_client import AsyncApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.api.hosts_api import HostsApi

async def fetch_all_data():
    configuration = Configuration()

    async with AsyncApiClient(configuration) as api_client:
        monitors_api = MonitorsApi(api_client)
        dashboards_api = DashboardsApi(api_client)
        hosts_api = HostsApi(api_client)

        # Run multiple API calls concurrently
        monitors, dashboards, hosts = await asyncio.gather(
            monitors_api.list_monitors(),
            dashboards_api.list_dashboards(),
            hosts_api.list_hosts()
        )

        print(f"Monitors: {len(monitors)}")
        print(f"Dashboards: {len(dashboards.dashboards)}")
        print(f"Hosts: {len(hosts.host_list)}")

asyncio.run(fetch_all_data())
```

## Threaded API Client

```python
from datadog_api_client import Configuration, ThreadedApiClient
from datadog_api_client.v1.api.dashboards_api import DashboardsApi
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

with ThreadedApiClient(configuration) as api_client:
    dashboards_api = DashboardsApi(api_client)
    monitors_api = MonitorsApi(api_client)

    # Start both requests concurrently
    dashboards_future = dashboards_api.list_dashboards()
    monitors_future = monitors_api.list_monitors()

    # Wait for results
    dashboards = dashboards_future.get()
    monitors = monitors_future.get()

    print(f"Dashboards: {len(dashboards.dashboards)}")
    print(f"Monitors: {len(monitors)}")
```

## Type Hints

The package includes full type hints for better IDE support:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi
from datadog_api_client.v1.model.monitor import Monitor
from datadog_api_client.v1.model.monitor_type import MonitorType
from datadog_api_client.v1.model.series import Series
from datadog_api_client.v1.model.event_create_request import EventCreateRequest
from datadog_api_client.v1.model.event_priority import EventPriority
from datadog_api_client.v1.model.event_alert_type import EventAlertType
from typing import List

configuration: Configuration = Configuration()

# Monitor type
monitor: Monitor = Monitor(
    type=MonitorType.METRIC_ALERT,
    query="avg(last_5m):avg:system.cpu.user{*} > 80",
    name="CPU Alert",
    message="High CPU usage detected"
)

# Metric series type
series: Series = Series(
    metric="custom.metric",
    points=[[1234567890, 100]],
    type="gauge",
    host="server-1",
    tags=["env:prod"]
)

# Event type
event: EventCreateRequest = EventCreateRequest(
    title="Deployment",
    text="Version deployed",
    date_happened=1234567890,
    priority=EventPriority.NORMAL,
    tags=["deployment"],
    alert_type=EventAlertType.INFO
)
```

## Debug Logging

Enable debug logging to see request/response details:

```python
from datadog_api_client import ApiClient, Configuration
import logging

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

configuration = Configuration()
configuration.debug = True

with ApiClient(configuration) as api_client:
    # All API calls will log request and response details
    pass
```

## Custom Server Configuration

```python
from datadog_api_client import ApiClient, Configuration

configuration = Configuration()

# Custom server URL
configuration.host = "https://api.datadoghq.com"

# Or use server variables
configuration.server_variables["site"] = "datadoghq.eu"
configuration.server_variables["subdomain"] = "app"

with ApiClient(configuration) as api_client:
    # Use api_client for API calls
    pass
```

## Context Manager Best Practices

Always use context managers to ensure proper resource cleanup:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.monitors_api import MonitorsApi

configuration = Configuration()

# Good: Using context manager
with ApiClient(configuration) as api_client:
    api_instance = MonitorsApi(api_client)
    monitors = api_instance.list_monitors()

# The client is automatically closed when exiting the context
```

## Batch Operations

Submit multiple operations efficiently:

```python
from datadog_api_client import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
from datadog_api_client.v1.model.metrics_payload import MetricsPayload
from datadog_api_client.v1.model.series import Series
import time

configuration = Configuration()

with ApiClient(configuration) as api_client:
    api_instance = MetricsApi(api_client)

    # Batch multiple metrics in one request
    now = int(time.time())
    series_list = []

    for i in range(100):
        series_list.append(
            Series(
                metric=f"custom.metric.{i}",
                points=[[now, i]],
                type="gauge",
                tags=["batch:true"]
            )
        )

    body = MetricsPayload(series=series_list)
    response = api_instance.submit_metrics(body=body)
    print("Batch of 100 metrics submitted")
```
