---
name: package
description: "Monitor LLM API calls (OpenAI, Anthropic, LangChain, LiteLLM) with SigNoz using OpenTelemetry and OpenInference instrumentation"
metadata:
  languages: "python"
  versions: "1.27.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "signoz,llm,openai,anthropic,langchain,litellm,observability,opentelemetry,openinference,ai"
---

# SigNoz LLM Observability (Python)

## Golden Rule

SigNoz monitors LLM API calls through OpenTelemetry instrumentation. For OpenAI use `opentelemetry-instrumentation-openai-v2`. For Anthropic use `openinference-instrumentation-anthropic`. For LangChain and LiteLLM use OpenInference instrumentors. All integrations export spans, logs, and metrics to SigNoz over OTLP. Use auto-instrumentation (no code changes) as the default.

Enabling `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true` captures prompts and completions—exercise caution in production due to sensitive data exposure.

## When To Use

- Tracing token usage, latency, and error rates for OpenAI, Anthropic, LangChain, or LiteLLM calls
- Correlating LLM spans with application traces in the same SigNoz service
- Monitoring agent reasoning steps, tool invocations, and chain executions in LangChain/LangGraph
- Tracking LiteLLM proxy or SDK traffic across multiple LLM providers

## Install

### OpenAI

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp opentelemetry-instrumentation-openai-v2
opentelemetry-bootstrap --action=install
```

### Anthropic

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp openinference-instrumentation-anthropic
opentelemetry-bootstrap --action=install
```

### LangChain / LangGraph

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp \
  opentelemetry-instrumentation-httpx opentelemetry-instrumentation-system-metrics \
  langgraph langchain openinference-instrumentation-langchain
opentelemetry-bootstrap --action=install
```

### LiteLLM SDK

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp litellm
opentelemetry-bootstrap --action=install
```

## Authentication And Setup

### SigNoz Cloud

```bash
export OTEL_SERVICE_NAME="my-llm-app"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.us.signoz.cloud:443"
export OTEL_EXPORTER_OTLP_HEADERS="signoz-ingestion-key=<your-ingestion-key>"
export OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_PYTHON_LOG_CORRELATION=true
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
```

### Self-Hosted SigNoz

Same vars but `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317` and no `OTEL_EXPORTER_OTLP_HEADERS`.

## Core Usage

### OpenAI (auto-instrumentation)

```bash
OTEL_SERVICE_NAME=openai-app \
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.us.signoz.cloud:443 \
OTEL_EXPORTER_OTLP_HEADERS="signoz-ingestion-key=<key>" \
OTEL_EXPORTER_OTLP_PROTOCOL=grpc \
OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true \
opentelemetry-instrument python app.py
```

No code changes needed. Each `openai.chat.completions.create()` call gets a span with model, token counts, finish reason, and optionally message content.

### Anthropic (auto-instrumentation)

Same pattern with `openinference-instrumentation-anthropic` installed:

```bash
opentelemetry-instrument python app.py
```

### LangChain (auto-instrumentation)

Set root logger level before running:

```python
import logging
logging.getLogger().setLevel(logging.INFO)
```

Then:

```bash
OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true \
opentelemetry-instrument python app.py
```

### LangChain (code-based setup)

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from openinference.instrumentation.langchain import LangChainInstrumentor

resource = Resource.create({"service.name": "langchain-app"})
provider = TracerProvider(resource=resource)
provider.add_span_processor(
    BatchSpanProcessor(
        OTLPSpanExporter(
            endpoint="https://ingest.us.signoz.cloud:443/v1/traces",
            headers={"signoz-ingestion-key": "<your-ingestion-key>"},
        )
    )
)

# Must call before any LangChain/LangGraph imports or function calls
LangChainInstrumentor().instrument()
```

### LiteLLM SDK (one-line activation)

```python
import litellm
litellm.callbacks = ["otel"]
```

Then run with `opentelemetry-instrument` and the standard env vars.

### LiteLLM Proxy Server (config.yaml)

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o

general_settings:
  callbacks: ["otel"]
```

Set `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_HEADERS`, and `OTEL_EXPORTER_OTLP_PROTOCOL` before starting the proxy.

## What Gets Captured

| Signal | Data |
|---|---|
| Traces | Span per LLM call: model, token usage (input/output/total), finish reason, latency, errors |
| Logs (when enabled) | Structured log per call with message content, log level INFO/ERROR |
| Metrics | Duration, token count, request rate, error rate — OTel GenAI semantic conventions |

## Common Pitfalls

- **`LangChainInstrumentor().instrument()` must run first**: call before importing or using any LangChain/LangGraph code. Late instrumentation misses spans.
- **Message content is opt-in**: `OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true` is off by default. Review PII implications before enabling in production.
- **LiteLLM `callbacks = ["otel"]` requires env vars**: the callback alone does nothing without the OTLP endpoint configured.
- **OpenAI and Anthropic use different packages**: `opentelemetry-instrumentation-openai-v2` (official) vs `openinference-instrumentation-anthropic` (OpenInference). Do not mix them up.
- **Run `opentelemetry-bootstrap` after all deps are installed**.
- **Validate locally first**: `OTEL_TRACES_EXPORTER=console opentelemetry-instrument python app.py` prints spans to stderr.
- **Pre-built dashboards** are available in SigNoz for OpenAI, Anthropic, LiteLLM, and LangChain.

## Official Sources

- SigNoz OpenAI monitoring: https://signoz.io/docs/openai-monitoring/
- SigNoz Anthropic monitoring: https://signoz.io/docs/anthropic-monitoring/
- SigNoz LangChain observability: https://signoz.io/docs/langchain-observability/
- SigNoz LiteLLM observability: https://signoz.io/docs/litellm-observability/
- OpenInference GitHub: https://github.com/Arize-ai/openinference
- OTel GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
