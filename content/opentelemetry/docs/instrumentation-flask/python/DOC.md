---
name: instrumentation-flask
description: "OpenTelemetry Flask instrumentation for tracing incoming Flask requests in Python applications"
metadata:
  languages: "python"
  versions: "0.61b0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "opentelemetry,otel,flask,wsgi,tracing,observability"
---

# OpenTelemetry Flask Instrumentation Python Package Guide

## Golden Rule

`opentelemetry-instrumentation-flask` instruments inbound Flask request handling. It does not replace the OpenTelemetry SDK, exporter, or distro setup. Configure telemetry export first, then instrument the Flask app exactly once with `FlaskInstrumentor().instrument_app(app)`.

If you use zero-code startup with `opentelemetry-instrument`, do not also call `FlaskInstrumentor().instrument_app(app)` in the same process.

## Install

For explicit in-app instrumentation, install the Flask instrumentor plus an SDK and exporter:

```bash
python -m pip install \
  "Flask>=1.0" \
  "opentelemetry-instrumentation-flask==0.61b0" \
  "opentelemetry-sdk" \
  "opentelemetry-exporter-otlp-proto-http"
```

For zero-code startup, install the distro and OTLP exporter, then let bootstrap install matching instrumentations:

```bash
python -m pip install \
  "Flask>=1.0" \
  "opentelemetry-distro[otlp]==0.61b0" \
  "opentelemetry-instrumentation-flask==0.61b0"

opentelemetry-bootstrap -a install
```

Practical version notes:

- Keep contrib instrumentation packages on the same `0.61b0` release train in one environment when possible.
- This package lives on the contrib prerelease line, so pinning exact versions is safer than floating prereleases.

## Manual Setup

Create a tracer provider, attach an exporter, then instrument the Flask app before it starts handling requests:

```python
from flask import Flask

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

app = Flask(__name__)

resource = Resource.create({SERVICE_NAME: "orders-api"})
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_span_processor(
    BatchSpanProcessor(
        OTLPSpanExporter(endpoint="http://localhost:4318/v1/traces")
    )
)
trace.set_tracer_provider(tracer_provider)

FlaskInstrumentor().instrument_app(app, tracer_provider=tracer_provider)

@app.get("/orders/<order_id>")
def get_order(order_id: str):
    return {"order_id": order_id}


if __name__ == "__main__":
    app.run(port=8000, debug=True)
```

What the Flask instrumentor adds:

- server spans around incoming Flask requests
- span names based on the matched Flask route
- `http.route` on spans when Flask resolves a route
- request and response hooks for app-specific attributes
- optional SQLCommenter metadata when used with supported database instrumentation

## Zero-Code Setup

If you want process-level auto-instrumentation without editing application startup code, configure the exporter with environment variables and launch the app through `opentelemetry-instrument`:

```bash
export OTEL_SERVICE_NAME=orders-api
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=none
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

opentelemetry-instrument python app.py
```

Use this path when you want minimal code changes. Use manual setup when you need explicit control over the tracer provider, resource attributes, span processors, or exporter configuration.

## Core Usage

### Exclude noisy routes

Use URL exclusions for health checks, metrics endpoints, and static assets:

```python
FlaskInstrumentor().instrument_app(
    app,
    excluded_urls="healthz,metrics,/static/.*",
)
```

Equivalent environment variable:

```bash
export OTEL_PYTHON_FLASK_EXCLUDED_URLS="healthz,metrics,/static/.*"
```

To apply exclusions across multiple Python instrumentations, use:

```bash
export OTEL_PYTHON_EXCLUDED_URLS="healthz,metrics,/static/.*"
```

### Add request and response hooks

Hooks are the normal way to attach business attributes to the automatically created server span:

```python
from opentelemetry.trace import Span


def request_hook(span: Span, environ) -> None:
    if span and span.is_recording():
        tenant_id = environ.get("HTTP_X_TENANT_ID")
        if tenant_id:
            span.set_attribute("app.tenant_id", tenant_id)


def response_hook(span: Span, status: str, response_headers) -> None:
    if span and span.is_recording():
        span.set_attribute("app.http_status_line", status)


FlaskInstrumentor().instrument_app(
    app,
    request_hook=request_hook,
    response_hook=response_hook,
)
```

Keep hook data low-cardinality and avoid copying raw user input, secrets, or large payloads into span attributes.

### Capture selected HTTP headers

Header capture is configured through environment variables:

```bash
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST="x-request-id,user-agent"
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE="content-type"
export OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS=".*session.*,set-cookie,authorization"
```

Important details:

- header matching is case-insensitive
- captured header attribute names are normalized to lowercase with `-` replaced by `_`
- sanitize sensitive headers aggressively before enabling capture in production
- the header-capture environment variables are still marked experimental upstream

### Enable SQLCommenter support

If your database stack also supports SQLCommenter, Flask instrumentation can add route and framework context to downstream SQL comments:

```python
FlaskInstrumentor().instrument_app(
    app,
    enable_commenter=True,
    commenter_options={
        "controller": False,
    },
)
```

This only helps when the database driver or ORM instrumentation in the same process also understands SQLCommenter.

### Uninstrument in tests or app reload flows

If your tests rebuild or reuse the same Flask app object, remove instrumentation before reapplying it:

```python
FlaskInstrumentor().uninstrument_app(app)
```

## Configuration And OTLP Auth

This package does not have its own authentication flow. Authentication is configured on the exporter or collector side.

Common environment variables for OTLP export:

```bash
export OTEL_SERVICE_NAME=orders-api
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment.name=prod,service.namespace=payments"
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.example.com
export OTEL_EXPORTER_OTLP_HEADERS="authorization=Bearer <token>,x-tenant-id=acme"
```

Practical notes:

- set `OTEL_SERVICE_NAME` explicitly or your service can appear as `unknown_service`
- use `OTEL_RESOURCE_ATTRIBUTES` for deployment environment, namespace, and version metadata
- many hosted backends expect auth tokens in `OTEL_EXPORTER_OTLP_HEADERS`
- choose `http://localhost:4318` with `http/protobuf` or `http://localhost:4317` for default gRPC-style OTLP setups

## Common Pitfalls

- Installing only `opentelemetry-instrumentation-flask` is not enough. Without an SDK/exporter or distro, spans are not exported anywhere useful.
- Do not instrument the same app twice. Pick either manual `instrument_app(app)` or process-level `opentelemetry-instrument` for a given process.
- Prefer `instrument_app(app)` in normal Flask app code. `FlaskInstrumentor().instrument()` patches `flask.Flask` globally.
- Instrument before the app starts serving requests so routing and request handling are wrapped consistently.
- Excluded URL lists are regex patterns, not Flask route names. Test them before deploying broad filters.
- Capturing headers without sanitization can leak credentials, cookies, session IDs, or tenant identifiers.
- If you want auto-instrumentation everywhere except Flask, use `OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=flask`.

## Version-Sensitive Notes For `0.61b0`

- This guide targets `opentelemetry-instrumentation-flask 0.61b0`.
- The package is on the OpenTelemetry Python contrib `0.x` prerelease line, so behavior and experimental configuration can change between releases.
- The Flask instrumentation docs are published under the contrib `latest` docs site, which can move ahead of a pinned package version. Use the exact PyPI release page for version identity and the maintainer docs page for API behavior.
- PyPI metadata for this release indicates Python `>=3.9`.

## Official Sources Used

- PyPI release page: `https://pypi.org/project/opentelemetry-instrumentation-flask/0.61b0/`
- Flask instrumentation docs: `https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/flask/flask.html`
- OpenTelemetry Python exporters docs: `https://opentelemetry.io/docs/languages/python/exporters/`
- OpenTelemetry Python zero-code example docs: `https://opentelemetry.io/docs/zero-code/python/example/`
- OpenTelemetry Python zero-code configuration docs: `https://opentelemetry.io/docs/zero-code/python/configuration/`
