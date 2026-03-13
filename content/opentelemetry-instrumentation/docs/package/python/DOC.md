---
name: package
description: "OpenTelemetry Python auto-instrumentation tools for bootstrapping, configuring, and running zero-code instrumentation"
metadata:
  languages: "python"
  versions: "0.61b0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "opentelemetry,observability,tracing,metrics,logging,otlp,auto-instrumentation"
---

# opentelemetry-instrumentation Python Package Guide

## Golden Rule

Use `opentelemetry-instrumentation` when you want OpenTelemetry Python auto-instrumentation tooling such as `opentelemetry-bootstrap`, `opentelemetry-instrument`, or programmatic `initialize()`.

For most applications, do not stop at this package alone: install `opentelemetry-distro` plus an exporter, then add the matching instrumentation packages for the libraries your app actually uses.

If you need manual spans, explicit providers, or custom sampling and export setup, use `opentelemetry-sdk` and the normal OpenTelemetry API/SDK instead of treating this package as the full SDK.

## What This Package Does

`opentelemetry-instrumentation` provides the Python-side tooling for automatic instrumentation:

- `opentelemetry-bootstrap` inspects installed packages and recommends or installs matching instrumentation packages
- `opentelemetry-instrument` launches your app with auto-instrumentation enabled
- `opentelemetry.instrumentation.auto_instrumentation.initialize()` lets you initialize auto-instrumentation programmatically when wrapping the process is not practical

What it does not do by itself:

- it is not the full SDK initialization story for manual instrumentation
- it does not replace installing a distro and exporter
- it cannot instrument libraries that do not have an OpenTelemetry integration package installed

## Install

If you specifically need this package pinned:

```bash
python -m pip install "opentelemetry-instrumentation==0.61b0"
```

For the usual zero-code setup, install the distro and an OTLP exporter. The distro is on the same `0.61b0` contrib line:

```bash
python -m pip install "opentelemetry-distro[otlp]==0.61b0"
```

If your application dependencies are already installed, add matching instrumentation packages:

```bash
opentelemetry-bootstrap -a install
```

If you want to inspect recommendations without installing them yet:

```bash
opentelemetry-bootstrap
```

With `uv`, use the documented requirements flow instead of `-a install`:

```bash
uv add "opentelemetry-distro==0.61b0" opentelemetry-exporter-otlp
uv run opentelemetry-bootstrap -a requirements | uv add --requirement -
```

## Zero-Code Setup

The standard workflow is:

1. Install your app dependencies.
2. Install `opentelemetry-distro` and an exporter.
3. Run `opentelemetry-bootstrap -a install` so matching `opentelemetry-instrumentation-*` packages are added.
4. Start the app through `opentelemetry-instrument`.

Minimal Flask example:

```bash
python -m pip install "opentelemetry-distro[otlp]==0.61b0" flask
opentelemetry-bootstrap -a install

export OTEL_SERVICE_NAME="my-flask-api"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_METRICS_EXPORTER="otlp"

opentelemetry-instrument flask run --port 8000
```

Generic Python entrypoint:

```bash
export OTEL_SERVICE_NAME="my-service"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"

opentelemetry-instrument python app.py
```

The zero-code docs describe `otlp` as the default exporter for `opentelemetry-instrument`, and the default OTLP transport for this command is gRPC.

## Programmatic Auto-Instrumentation

Use this when you cannot prepend `opentelemetry-instrument` to the process command, or when initialization must happen inside each worker after forking.

Call `initialize()` before importing the libraries you expect to be patched:

```python
from opentelemetry.instrumentation.auto_instrumentation import initialize

initialize()

from fastapi import FastAPI

app = FastAPI()
```

This ordering matters. Some integrations will not patch correctly if the target library was imported before auto-instrumentation initialization.

## Core Configuration

### Service identity and resource attributes

Set the service name explicitly. The OpenTelemetry docs note that the default `service.name` is `unknown_service`.

```bash
export OTEL_SERVICE_NAME="billing-api"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment.name=prod,service.version=2026.03.12"
```

`OTEL_SERVICE_NAME` overrides `service.name` if you also include `service.name` inside `OTEL_RESOURCE_ATTRIBUTES`.

### OTLP endpoint, protocol, and headers

Common OTLP settings:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otel.example.com:443"
export OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
export OTEL_EXPORTER_OTLP_HEADERS="api-key=secret-token"
```

Useful defaults from the SDK configuration docs:

- `OTEL_EXPORTER_OTLP_ENDPOINT` defaults to `http://localhost:4317` for gRPC and `http://localhost:4318` for HTTP
- `OTEL_EXPORTER_OTLP_PROTOCOL` is typically `grpc` or `http/protobuf`
- signal-specific endpoints such as `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` and `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` override the shared endpoint

If your backend requires separate headers or endpoints for traces, metrics, or logs, use the signal-specific variables instead of the shared ones.

### Exporter selection

`opentelemetry-instrument` supports configuration through CLI flags or environment variables:

```bash
export OTEL_TRACES_EXPORTER="console,otlp"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
```

You can disable automatic trace exporter initialization with:

```bash
export OTEL_TRACES_EXPORTER="none"
```

### Disabling or filtering instrumentation

Disable specific integrations by entry point name:

```bash
export OTEL_PYTHON_DISABLED_INSTRUMENTATIONS="redis,kafka,grpc_client"
```

Filter noisy URLs globally or per library:

```bash
export OTEL_PYTHON_EXCLUDED_URLS="healthcheck,metrics"
export OTEL_PYTHON_REQUESTS_EXCLUDED_URLS="healthcheck"
export OTEL_PYTHON_URLLIB3_EXCLUDED_URLS="client/.*/info"
```

### Log correlation

For log enrichment and automatic logging handler setup:

```bash
export OTEL_PYTHON_LOG_CORRELATION="true"
export OTEL_PYTHON_LOG_AUTO_INSTRUMENTATION="true"
export OTEL_PYTHON_LOG_LEVEL="info"
```

## Common Pitfalls

- Installing only `opentelemetry-instrumentation` is not enough for most apps. The maintainer docs explicitly direct users to install a distro package for auto-instrumentation.
- `opentelemetry-bootstrap -a install` only adds integrations for packages already present in the active environment, so run it after installing your app dependencies.
- `uv sync` or dependency updates can invalidate the generated instrumentation set. The troubleshooting docs say to rerun the bootstrap requirements flow after updates when using `uv`.
- Flask debug mode with the reloader can prevent instrumentation from working. If you must use debug mode, set `use_reloader=False`.
- Pre-fork servers with multiple workers can break metrics auto-instrumentation because of forking and background metric reader threads. For ASGI apps, the docs recommend Gunicorn with `uvicorn.workers.UvicornWorker`, programmatic initialization inside each worker, or falling back to a single worker.
- Programmatic initialization must happen before importing instrumented libraries such as `FastAPI`.
- On slim Linux images, package installation can fail until build prerequisites such as a compiler and Python development headers are present.

## Version-Sensitive Notes

- `0.61b0` is a beta pre-release.
- `opentelemetry-distro` is also available on the `0.61b0` contrib line, which is the safest pairing for zero-code setup.
- This package depends on `opentelemetry-semantic-conventions==0.61b0`, so mixing contrib packages from different prerelease lines is a common source of dependency drift.
- The Python auto-instrumentation docs note that log auto-instrumentation environment-variable behavior changed before the newer `OTEL_PYTHON_LOG_AUTO_INSTRUMENTATION` naming; older examples may still use `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED`.
- If your backend expects `/v1/traces`, `/v1/metrics`, or `/v1/logs` paths, prefer the HTTP-specific endpoint variables or set `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` explicitly.

## When To Use Something Else

- Use `opentelemetry-sdk` when you need manual spans, explicit provider setup, or custom export pipeline code.
- Use individual `opentelemetry-instrumentation-<library>` packages directly when you want manual control over a specific integration instead of process-wide auto-instrumentation.
- Use OpenTelemetry Collector or vendor-specific collector guidance when transport, auth, batching, retries, or routing rules matter more than Python-side patching.

## Official Sources Used

- `https://pypi.org/project/opentelemetry-instrumentation/`
- `https://pypi.org/pypi/opentelemetry-instrumentation/0.61b0/json`
- `https://pypi.org/project/opentelemetry-distro/`
- `https://opentelemetry.io/docs/zero-code/python/`
- `https://opentelemetry.io/docs/zero-code/python/configuration/`
- `https://opentelemetry.io/docs/zero-code/python/troubleshooting/`
- `https://opentelemetry.io/docs/languages/python/instrumentation/`
- `https://opentelemetry.io/docs/languages/sdk-configuration/general/`
- `https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/`
