---
name: package
description: "New Relic Python agent for APM instrumentation, transaction tracing, error reporting, and logs in context"
metadata:
  languages: "python"
  versions: "13.0.1"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "newrelic,apm,observability,monitoring,tracing,logging"
---

# New Relic Python Agent

## Golden Rule

Use `newrelic` as an early-process instrumentation agent, not as a library you initialize after your app is already imported. Install the agent, configure `license_key` and `app_name`, and start your server or worker through `newrelic-admin run-program` whenever possible. If you must initialize manually, call `newrelic.agent.initialize(...)` before importing framework code so auto-instrumentation can attach correctly.

## Install

Pin the version your project expects:

```bash
python -m pip install "newrelic==13.0.1"
```

Common alternatives:

```bash
uv add "newrelic==13.0.1"
poetry add "newrelic==13.0.1"
```

## Initial Setup

The agent needs a New Relic license key and an application name. The standard bootstrap flow is:

1. Generate a starter config file
2. Review the file and set `app_name`
3. Start the target process through `newrelic-admin`

Generate a config file:

```bash
newrelic-admin generate-config YOUR_LICENSE_KEY newrelic.ini
```

Minimal config values to verify:

```ini
[newrelic]
license_key = YOUR_LICENSE_KEY
app_name = My Service
monitor_mode = true
log_level = info
```

Point the agent at the config file and wrap the final process command:

```bash
NEW_RELIC_CONFIG_FILE=newrelic.ini \
newrelic-admin run-program gunicorn myproject.wsgi
```

The wrapper approach is the safest default because it initializes the agent before your application imports.

## Manual Initialization

Use manual initialization only when the process manager cannot be wrapped directly.

```python
import newrelic.agent

newrelic.agent.initialize("newrelic.ini")

from myapp import create_app

app = create_app()
```

Important constraints:

- Initialize before importing Django, Flask, FastAPI, Celery task modules, database clients, or any code you expect the agent to instrument.
- If you delay initialization until after app creation, middleware, database, and external-call instrumentation can be incomplete.

## Core Usage

### Web apps

For WSGI or ASGI apps, the common path is to let the agent auto-instrument the framework and libraries, then run the server through the wrapper:

```bash
NEW_RELIC_CONFIG_FILE=newrelic.ini \
newrelic-admin run-program uvicorn myapp.asgi:app
```

For Django:

```bash
NEW_RELIC_CONFIG_FILE=newrelic.ini \
newrelic-admin run-program gunicorn mysite.wsgi
```

### Background jobs and standalone work

Mark non-web work as a background task so it shows up as its own transaction type:

```python
import newrelic.agent

newrelic.agent.initialize("newrelic.ini")

@newrelic.agent.background_task(name="sync_customers")
def sync_customers() -> None:
    # job logic
    pass
```

Use this for scheduled jobs, queue workers, and management commands. The Python agent docs note that background tasks running longer than 20 minutes are not reported, so long-running daemons should split work into shorter units or separate transactions.

### Add custom attributes

Attach business identifiers that help with filtering and debugging:

```python
import newrelic.agent

def handle_order(order_id: str, tenant_id: str) -> None:
    newrelic.agent.add_custom_attribute("order.id", order_id)
    newrelic.agent.add_custom_attribute("tenant.id", tenant_id)
```

### Report handled exceptions

If your code catches an exception but you still want it recorded in APM, use `notice_error()`:

```python
import newrelic.agent

def process_message(message: dict) -> None:
    try:
        run_business_logic(message)
    except Exception:
        newrelic.agent.notice_error()
        raise
```

## Configuration And Authentication

The agent authenticates with your New Relic account using the license key in the config file or the environment. Keep the key outside source control.

Useful configuration entry points:

- `newrelic.ini` or `newrelic.toml` as the main agent config
- `NEW_RELIC_CONFIG_FILE` to choose the config file at process start
- `app_name` to control the APM entity name
- `license_key` for ingest authentication
- `monitor_mode` to enable or disable reporting
- `log_level` to adjust agent logging during setup and troubleshooting

Version-sensitive config note:

- `newrelic.toml` is supported only on Python `3.11+` and requires agent `10.3.0+`. If you need older Python runtimes, keep using `.ini`.

Server-side configuration can override local config for settings exposed in the New Relic UI, so verify the effective value in the APM application settings when local changes appear to do nothing.

## Logs In Context

The Python agent can decorate logs with linking metadata and can forward application logs to New Relic. This is useful when you want logs correlated with traces and transactions.

Operational guidance:

- If your platform already forwards logs through Fluent Bit, Vector, CloudWatch, or another collector, avoid enabling a second forwarding path unless you want duplicates.
- Use the logs-in-context features for correlation, not as a substitute for normal application logging configuration.

## Common Pitfalls

- Initializing too late is the most common mistake. If the framework or client libraries are imported first, auto-instrumentation may not attach.
- Wrap the real process entrypoint. Starting a shell script under `newrelic-admin` is only useful if the script eventually `exec`s the target server or worker.
- Use `background_task()` only for non-web work. Web requests are normally instrumented automatically by the framework integration.
- Keep the license key out of the repo and deployment manifests when possible; inject it through secrets management or environment configuration.
- If the app name in APM does not match expectations, check both the local config file and any server-side config overrides in New Relic.
- If transaction data appears but logs are duplicated, review whether both agent log forwarding and an external log pipeline are enabled.

## Version-Sensitive Notes For 13.0.1

- `13.0.1` is the current published release on PyPI. Treat the release notes page as authoritative for changelog details when wiring up a specific feature.
- The `13.x` line requires Python `3.9+`. Older Python runtimes need to stay on a previous agent line.
- `11.5.0` introduced Hybrid Agent tracing support with OpenTelemetry API compatibility and `TraceIdRatioBased` sampler support. This capability is disabled by default and can be enabled with `otel_enabled = true` or `NEW_RELIC_OTEL_ENABLED=true`.
- `11.0.0` removed several long-deprecated APIs. Older snippets from blogs or internal wikis may still reference removed calls, so prefer the current Python agent API guide.
- `11.0.0` also renamed the application logging forwarding setting from `application_logging.forwarding.max_samples_stored` to `application_logging.forwarding.max_samples`.
- If you need `.toml` config support, that requires `10.3.0+` and Python `3.11+`.

## Official Sources

- Python agent docs root: `https://docs.newrelic.com/docs/apm/agents/python-agent/`
- Installation and config: `https://docs.newrelic.com/docs/apm/agents/python-agent/installation/python-agent-admin-script-advanced-usage/`
- API guide: `https://docs.newrelic.com/docs/apm/agents/python-agent/python-agent-api/guide-using-python-agent-api/`
- Background task API: `https://docs.newrelic.com/docs/apm/agents/python-agent/python-agent-api/backgroundtask-python-agent-api/`
- Custom attribute API: `https://docs.newrelic.com/docs/apm/agents/python-agent/python-agent-api/addcustomattribute-python-agent-api/`
- Configuration reference: `https://docs.newrelic.com/docs/apm/agents/python-agent/configuration/python-agent-configuration/`
- Python agent release notes: `https://docs.newrelic.com/docs/release-notes/agent-release-notes/python-release-notes/4/`
- PyPI package page: `https://pypi.org/project/newrelic/`
