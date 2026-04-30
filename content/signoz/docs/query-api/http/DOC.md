---
name: package
description: "SigNoz HTTP Query APIs for searching and aggregating traces, logs, and metrics programmatically using the /api/v5/query_range endpoint"
metadata:
  languages: "http"
  versions: "v5"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "signoz,api,traces,logs,metrics,query,rest,http,search,aggregate"
---

# SigNoz Query API Guide

## Golden Rule

All three SigNoz query APIs—traces, logs, and metrics—share a single endpoint: `POST /api/v5/query_range`. The payload shape is the same across signal types; only the `dataSource`, filter expressions, and select fields differ. Authentication uses a `SIGNOZ-API-KEY` request header. API keys require the **Admin** role to create.

## When To Use

- Programmatically query traces, logs, or metrics from SigNoz (CI checks, scripts, custom dashboards)
- Search spans by attributes (service name, HTTP status, error flag, deployment name)
- Aggregate log counts, error rates, or metric percentiles over time windows
- Build custom tooling on top of SigNoz data

Do not use these APIs for data ingestion—use the OTLP endpoint for that.

## Authentication

All requests require an API key in the header:

```
SIGNOZ-API-KEY: <your-api-key>
```

Create keys in SigNoz under **Settings → API Keys** (Admin role only). Store keys in environment variables—never in source code.

## Endpoint

```
POST https://<your-signoz-url>/api/v5/query_range
Content-Type: application/json
SIGNOZ-API-KEY: <your-api-key>
```

For SigNoz Cloud, `<your-signoz-url>` is your cloud instance domain (e.g., `myteam.signoz.cloud`). Timestamps use Unix milliseconds.

## Trace API

### Search Spans

```bash
curl -s -X POST "https://<signoz-url>/api/v5/query_range" \
  -H "Content-Type: application/json" \
  -H "SIGNOZ-API-KEY: <your-api-key>" \
  -d '{
    "start": 1734623400000,
    "end": 1734623700000,
    "compositeQuery": {
      "queryType": "builder_query",
      "builderQueries": {
        "A": {
          "dataSource": "traces",
          "queryName": "A",
          "requestType": "raw",
          "filters": {
            "op": "AND",
            "items": [
              {"key": {"key": "deployment_name", "type": "resource"}, "op": "=", "value": "hotrod"},
              {"key": {"key": "httpMethod", "type": "tag"}, "op": "=", "value": "GET"},
              {"key": {"key": "hasError", "type": "tag"}, "op": "=", "value": true}
            ]
          },
          "selectColumns": [
            {"key": "serviceName", "type": "tag"},
            {"key": "responseStatusCode", "type": "tag"},
            {"key": "httpUrl", "type": "tag"}
          ],
          "orderBy": [{"columnName": "timestamp", "order": "desc"}],
          "limit": 10,
          "offset": 0
        }
      }
    }
  }'
```

### Search Root Spans Only

Add `parentSpanID = ''` to the filter items to isolate entry-point spans:

```json
{"key": {"key": "parentSpanID", "type": "tag"}, "op": "=", "value": ""}
```

## Logs API

### Search Logs

```bash
curl -s -X POST "https://<signoz-url>/api/v5/query_range" \
  -H "Content-Type: application/json" \
  -H "SIGNOZ-API-KEY: <your-api-key>" \
  -d '{
    "start": 1734623400000,
    "end": 1734623700000,
    "compositeQuery": {
      "queryType": "builder_query",
      "builderQueries": {
        "A": {
          "dataSource": "logs",
          "queryName": "A",
          "requestType": "raw",
          "filters": {
            "op": "AND",
            "items": [
              {"key": {"key": "deployment_name", "type": "resource"}, "op": "=", "value": "hotrod"},
              {"key": {"key": "severity_text", "type": "tag"}, "op": "=", "value": "error"}
            ]
          },
          "orderBy": [{"columnName": "timestamp", "order": "desc"}],
          "limit": 10,
          "offset": 0
        }
      }
    }
  }'
```

### Paginate Logs

- First page: `"limit": 10, "offset": 0`
- Second page: `"limit": 10, "offset": 10`

Sort descending by timestamp to get most-recent-first pages.

## Metrics API

### Query Metric Over Time

```bash
curl -s -X POST "https://<signoz-url>/api/v5/query_range" \
  -H "Content-Type: application/json" \
  -H "SIGNOZ-API-KEY: <your-api-key>" \
  -d '{
    "start": 1734623400000,
    "end": 1734623700000,
    "step": 60,
    "compositeQuery": {
      "queryType": "builder_query",
      "builderQueries": {
        "A": {
          "dataSource": "metrics",
          "queryName": "A",
          "aggregateOperator": "rate",
          "aggregateAttribute": {"key": "http.server.request.duration"},
          "groupBy": [{"key": "service.name"}],
          "legend": "{{service.name}}"
        }
      }
    }
  }'
```

### Error Rate (multi-query formula)

```json
{
  "compositeQuery": {
    "queryType": "builder_query",
    "builderQueries": {
      "A": {"aggregateOperator": "sum", "filters": {"items": [{"key": {"key": "hasError"}, "op": "=", "value": true}]}},
      "B": {"aggregateOperator": "sum"}
    },
    "formulaQueries": {
      "C": {"expression": "A / B * 100", "legend": "error_rate_pct"}
    }
  }
}
```

## Configuration Notes

- `start` / `end`: Unix timestamps in **milliseconds**
- `step`: aggregation bucket size in **seconds** (metrics only)
- `requestType`: `"raw"` for individual records; `"series"` or `"table"` for aggregations
- `dataSource`: `"traces"`, `"logs"`, or `"metrics"`
- Filter attribute `type`: `"resource"` for resource attributes; `"tag"` for span/log attributes
- `offset` + `limit`: increment offset by limit for each page

## Common Pitfalls

- **Admin role required**: non-admin users cannot create or view API keys.
- **Header name is `SIGNOZ-API-KEY`**: not `Authorization` and not `X-API-Key`. Wrong header returns 401.
- **Timestamps in milliseconds**: empty results if you pass epoch seconds. Multiply by 1000.
- **`parentSpanID = ''` for root spans**: empty string, not null or absent.
- **Metrics `step` in seconds**: not milliseconds. `step: 60` means 1-minute buckets.
- **Formula queries need matching time range**: all sub-queries must cover the same `start`/`end` window.

## Official Sources

- SigNoz Trace API overview: https://signoz.io/docs/traces-management/trace-api/overview/
- SigNoz Trace API search: https://signoz.io/docs/traces-management/trace-api/search-traces/
- SigNoz Trace API aggregate: https://signoz.io/docs/traces-management/trace-api/aggregate-traces/
- SigNoz Logs API overview: https://signoz.io/docs/logs-management/logs-api/overview/
- SigNoz Logs API search: https://signoz.io/docs/logs-management/logs-api/search-logs/
- SigNoz Logs API aggregate: https://signoz.io/docs/logs-management/logs-api/aggregate-logs/
- SigNoz Metrics Query API: https://signoz.io/docs/metrics-management/query-range-api/
