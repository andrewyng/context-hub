---
name: package
description: "Datadog Python package for DogStatsD metrics, ThreadStats, and legacy Datadog HTTP API helpers"
metadata:
  languages: "python"
  versions: "0.52.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "datadog,monitoring,metrics,dogstatsd,observability"
---

# Datadog Python Package Guide

## Golden Rule

Use `datadog==0.52.1` when you specifically need the legacy `datadog` package: DogStatsD metrics, `ThreadStats`, or the older `datadog.api` wrappers. Do not confuse it with `datadog-api-client-python`, which is a different package for the full generated Datadog HTTP API surface.

## When To Use This Package

Use `datadog` for these cases:

- send custom metrics, service checks, and DogStatsD packets to a local or remote Datadog Agent
- emit application metrics over HTTP with `ThreadStats`
- use older `datadog.api.*` helpers that already exist in a codebase

Use `datadog-api-client` instead when you need broad, current Datadog API coverage. The upstream `datadogpy` README explicitly points to `datadog-api-client-python` for full HTTP API support.

## Install

Pin the package version your project expects:

```bash
python -m pip install "datadog==0.52.1"
```

Common alternatives:

```bash
uv add "datadog==0.52.1"
poetry add "datadog==0.52.1"
```

PyPI currently publishes `0.52.1` as a universal `py2.py3` wheel, but new code should still be written for your actual runtime and validated in that environment.

## Authentication And Setup

`initialize()` configures both the HTTP API helpers and the default DogStatsD client.

### HTTP API or ThreadStats setup

API key and app key are required for `datadog.api` and `ThreadStats` unless you are only using DogStatsD:

```python
from datadog import initialize

options = {
    "api_key": "your-api-key",
    "app_key": "your-app-key",
    "api_host": "https://api.datadoghq.com",
}

initialize(**options)
```

Environment-variable setup also works:

```bash
export DATADOG_API_KEY="your-api-key"
export DATADOG_APP_KEY="your-app-key"
```

If those are unset, the library falls back to `DD_API_KEY` and `DD_APP_KEY`.

### DogStatsD-only setup over UDP

DogStatsD does not need API or app keys, but it does need a Datadog Agent or compatible DogStatsD endpoint to be reachable:

```python
from datadog import initialize, statsd

initialize(
    statsd_host="127.0.0.1",
    statsd_port=8125,
    statsd_constant_tags=["env:dev", "service:checkout"],
)

statsd.increment("checkout.request")
```

### DogStatsD setup over UDS

If the Agent exposes a Unix domain socket, prefer that over UDP in local-container deployments:

```python
from datadog import initialize, statsd

initialize(
    statsd_socket_path="/var/run/datadog/dsd.socket",
    statsd_constant_tags=["env:prod", "service:checkout"],
)

statsd.gauge("workers.ready", 4)
```

`statsd_socket_path` overrides `statsd_host` and `statsd_port`.

## Core Usage

### Send custom metrics with the default DogStatsD client

```python
from datadog import initialize, statsd

initialize(
    statsd_host="127.0.0.1",
    statsd_port=8125,
    statsd_namespace="myapp",
    statsd_constant_tags=["env:dev", "service:payments"],
)

statsd.increment("orders.created", tags=["region:us-west-2"])
statsd.gauge("queue.depth", 17)
statsd.histogram("checkout.latency_ms", 42.5)
```

The upstream docs describe `DogStatsd` as thread-safe, so sharing the client is acceptable when your process model is otherwise safe.

### Use an explicit `DogStatsd` client

Create your own client when you do not want the module-level `statsd` singleton:

```python
from datadog.dogstatsd import DogStatsd

client = DogStatsd(
    host="127.0.0.1",
    port=8125,
    namespace="worker",
    constant_tags=["env:prod", "service:billing"],
)

client.increment("jobs.started")
client.gauge("jobs.inflight", 3)
```

Useful constructor options from the docs include `socket_path`, `use_default_route`, `disable_telemetry`, `max_buffer_len`, and `origin_detection_enabled`.

### Send an event through the legacy HTTP API wrapper

```python
from datadog import api, initialize

initialize(api_key="your-api-key", app_key="your-app-key")

api.Event.create(
    title="deploy finished",
    text="release 2026.03.12 completed successfully",
    tags=["env:prod", "service:web"],
)
```

This style is convenient for older codebases, but for broad modern API coverage use `datadog-api-client`.

### Collect application metrics with `ThreadStats`

`ThreadStats` records metrics in-process and flushes them through the Datadog HTTP API:

```python
from datadog import initialize
from datadog.threadstats import ThreadStats

initialize(api_key="your-api-key", app_key="your-app-key")

stats = ThreadStats(namespace="web", constant_tags=["env:prod", "service:frontend"])
stats.start(flush_interval=10)

stats.increment("requests.count")

with stats.timer("db.query.time"):
    load_user_profile()
```

If you need manual control, disable the background thread:

```python
stats.start(flush_in_thread=False)
stats.increment("jobs.processed")
stats.flush()
```

For gevent servers, the docs support `flush_in_greenlet=True` after monkey-patching gevent before startup.

## Configuration Notes

Important `initialize()` options called out by the upstream docs:

- `api_host`: Datadog API endpoint for your site or proxy setup
- `proxies`: requests-style proxy mapping for HTTP API calls
- `cacert`: certificate verification path, `True` for system certs, or `False` to skip verification
- `return_raw_response`: return both the raw response object and decoded content
- `statsd_use_default_route`: resolve DogStatsD host from the container default route
- `statsd_disable_buffering`: toggle DogStatsD buffering behavior
- `statsd_namespace`: prepend a metric namespace
- `statsd_constant_tags`: attach tags to every emitted metric

The library also documents `hostname_from_config`, but it is marked as deprecated.

## Common Pitfalls

- `datadog` is not `datadog-api-client-python`. The docs URL `https://datadoghq.dev/datadog-api-client-python/` belongs to a different package.
- DogStatsD metrics need a reachable Datadog Agent or DogStatsD endpoint. `pip install datadog` alone does not make metrics arrive anywhere.
- `ThreadStats` uses the HTTP API, so it needs an API key and usually an app key. DogStatsD-only flows do not.
- `stats.start(flush_in_thread=False)` does not auto-flush. You must call `flush()` yourself.
- `statsd_socket_path` overrides UDP host and port settings. If both are set, the socket path wins.
- In Kubernetes, `DD_ENTITY_ID` is used for origin detection. If you use `constant_tags`, append to that list rather than trying to replace Datadog’s internal entity tag behavior.
- In development, `DD_DOGSTATSD_DISABLE=True` disables `statsd` metric collection. That can make local tests look like metrics are silently ignored.
- The docs describe packet-size tuning with `max_buffer_len`. Only change it if you understand the network path; the library already picks defaults for UDP and UDS.

## Version-Sensitive Notes

- PyPI lists `0.52.1` as the current package version and published it on July 31, 2025.
- The package remains the maintained `datadogpy` library, but upstream positions it as a focused library for DogStatsD, `ThreadStats`, and legacy wrappers rather than the complete Datadog API client.
- If you are starting fresh on Datadog resource-management APIs, prefer the separate `datadog-api-client` package and use this package only when its DogStatsD or legacy wrapper model is the right fit.

## Official Sources

- Datadog Python client docs: https://datadogpy.readthedocs.io/en/latest/
- Datadog Python client docs index summary: https://datadogpy.readthedocs.io/en/stable/index.html
- Datadog PyPI package page: https://pypi.org/project/datadog/
- Datadog `datadogpy` repository: https://github.com/DataDog/datadogpy
