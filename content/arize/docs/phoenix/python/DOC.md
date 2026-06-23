---
name: phoenix
description: Arize Phoenix Python SDK for LLM observability, tracing, and evaluation
metadata:
  languages: python
  versions: "6.0.0"
  revision: 1
  updated-on: 2026-03-20
  source: community
  tags: phoenix,arize,observability,tracing,llm,evaluation,opentelemetry,openinference
---

# Arize Phoenix Python SDK Guidelines

You are an Arize Phoenix coding expert. Help me write code using the Arize Phoenix Python SDK for LLM observability, tracing, and evaluation.

Official documentation: https://arize.com/docs/phoenix

## CRITICAL: Phoenix vs Arize AX — Verify Before Writing Any Code

Arize offers two **completely different** observability products with incompatible APIs,
different authentication, and different endpoints.

**Before implementing anything, check which product the user needs:**

| | Phoenix (open-source) | Arize AX (cloud) |
|---|---|---|
| OTel import | `phoenix.otel` | `arize.otel` |
| API key env var | `PHOENIX_API_KEY` | `ARIZE_API_KEY` + `ARIZE_SPACE_ID` |
| Endpoint env var | `PHOENIX_COLLECTOR_ENDPOINT` | different endpoint |

**If the user says "Arize" without specifying Phoenix or AX, you MUST ask:**
> "Arize offers two products — Phoenix (open-source, `phoenix.otel`) or Arize AX (cloud, `arize.otel`). Which are you using?"

**This document covers Phoenix only.** For Arize AX, direct to https://docs.arize.com/arize.

---

## Common Mistakes Agents Make

| Wrong | Correct |
|---|---|
| `from arize.otel import register` | `from phoenix.otel import register` |
| `ARIZE_API_KEY` for Phoenix | `PHOENIX_API_KEY` |
| `ARIZE_SPACE_ID` | Not used in Phoenix |
| Calling instrumentors before `register()` | Always call `register()` first |
| Using `px.launch_app()` in production | Use `register()` with Phoenix Cloud/self-hosted |
| Tracing eval LLM calls in your project | Wrap eval runs with `suppress_tracing()` |
| `PHOENIX_COLLECTOR_ENDPOINT = "app.phoenix.arize.com"` | Must be full URL: `"https://app.phoenix.arize.com"` |
| Filtering all projects to `span_kind == "CHAIN"` | Choose span_kind based on your framework: `CHAIN` for LangChain/CrewAI, `AGENT` for agent spans, `LLM` for raw model calls |

---

## Installation

```bash
# Full platform (run Phoenix locally)
pip install arize-phoenix

# Instrumentation only (Phoenix already deployed)
pip install arize-phoenix-otel

# Evaluations
pip install arize-phoenix-evals

# Framework instrumentation (install what you need)
pip install openinference-instrumentation-openai
pip install openinference-instrumentation-anthropic
pip install openinference-instrumentation-langchain
pip install openinference-instrumentation-crewai
pip install openinference-instrumentation-llamaindex
```

---

## Environment Variables

```python
import os

# Phoenix Cloud
os.environ["PHOENIX_API_KEY"] = "<your-phoenix-api-key>"

# PHOENIX_COLLECTOR_ENDPOINT must be the full URL including https://
# Get the Hostname from Phoenix Cloud dashboard → your Space → API Keys
# Example: "https://app.phoenix.arize.com" — do NOT omit the scheme
os.environ["PHOENIX_COLLECTOR_ENDPOINT"] = "https://<your-phoenix-hostname>"

# LLM provider (example)
os.environ["OPENAI_API_KEY"] = "<your-openai-api-key>"
```

Get your `PHOENIX_API_KEY` and Hostname from the Phoenix Cloud dashboard after
creating a Space. The Hostname field is what maps to `PHOENIX_COLLECTOR_ENDPOINT`.

---

## Step 1: Register Your Project

Always call `register()` once at app startup. This creates a TracerProvider
linked to a named project in Phoenix.

```python
from phoenix.otel import register

tracer_provider = register(
    project_name="my-llm-app",  # appears as project name in Phoenix UI
    auto_instrument=True,        # auto-instruments supported frameworks
)
```

`auto_instrument=True` handles instrumentation for all installed
`openinference-instrumentation-*` packages automatically.

---

## Step 2: Instrument Your Framework

### Auto-instrumentation (recommended)

For supported frameworks, `auto_instrument=True` in `register()` is sufficient.
No additional instrumentor calls needed.

### CrewAI
```bash
pip install arize-phoenix crewai crewai-tools openinference-instrumentation-crewai openinference-instrumentation-openai
```
```python
from phoenix.otel import register
tracer_provider = register(project_name="crewai-app", auto_instrument=True)

# All CrewAI and OpenAI calls are now traced automatically
```

### OpenAI (manual instrumentation)
```python
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor

tracer_provider = register(project_name="openai-app")
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}]
)
```

### LangChain / LangGraph
```python
from openinference.instrumentation.langchain import LangChainInstrumentor
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
```

### Anthropic
```python
from openinference.instrumentation.anthropic import AnthropicInstrumentor
AnthropicInstrumentor().instrument(tracer_provider=tracer_provider)
```

### Manual span instrumentation (for custom code)

Use this when you need to trace logic that isn't covered by auto-instrumentation —
custom pipelines, business logic, non-supported libraries.

```python
from phoenix.otel import register

tracer_provider = register(project_name="my-llm-app", auto_instrument=True)
tracer = tracer_provider.get_tracer(__name__)

# Context manager style (recommended)
with tracer.start_as_current_span("my-custom-step") as span:
    span.set_attribute("input.value", user_query)
    result = my_custom_logic(user_query)
    span.set_attribute("output.value", result)

# Decorator style
@tracer.start_as_current_span("retrieve-documents")
def retrieve(query: str):
    docs = vector_db.search(query)
    return docs
```

Spans created this way appear in the Phoenix trace view nested under their
parent span, giving you full visibility into custom steps alongside
auto-instrumented framework calls.

Supported frameworks: OpenAI, Anthropic, LangChain, LangGraph, LlamaIndex,
CrewAI, DSPy, Mastra, Vercel AI SDK, Bedrock, and more.
Full list: https://arize.com/docs/phoenix/integrations

---

## Step 3: Run Evaluations

### Install
```bash
pip install arize-phoenix-evals
```

### Fetch Spans to Evaluate

```python
from phoenix.client import Client

px_client = Client()
df = px_client.spans.get_spans_dataframe(project_name="my-llm-app")
```

**Choose your span_kind filter based on your framework and what you want to evaluate:**

| span_kind | When to use |
|---|---|
| `CHAIN` | LangChain chains, CrewAI tasks, top-level pipeline steps |
| `AGENT` | Agent-level spans (reasoning + tool selection) |
| `LLM` | Raw model calls — use when evaluating model output directly |
| `TOOL` | Tool/function call spans |
| `RETRIEVER` | RAG retrieval spans |

```python
# Example: evaluate the top-level chain spans
parent_spans = df[df["span_kind"] == "CHAIN"]

# Example: evaluate raw LLM output
llm_spans = df[df["span_kind"] == "LLM"]
```

### Define an LLM-as-a-Judge Evaluator

```python
from phoenix.evals import LLM, create_classifier

# Use {attributes.input.value} and {attributes.output.value} to reference span data
my_eval_template = """
You are evaluating whether a response correctly answers the user's question.

User input: {attributes.input.value}
Response: {attributes.output.value}

Respond with ONLY one word: "correct" or "incorrect"
Then explain why.
"""

llm = LLM(model="gpt-4o", provider="openai")

evaluator = create_classifier(
    name="correctness",
    prompt_template=my_eval_template,
    llm=llm,
    choices={"correct": 1.0, "incorrect": 0.0},
)
```

### Run the Evaluation

```python
from phoenix.evals import evaluate_dataframe
from phoenix.trace import suppress_tracing

# suppress_tracing prevents eval LLM calls from polluting your project traces
with suppress_tracing():
    results_df = evaluate_dataframe(
        dataframe=parent_spans,
        evaluators=[evaluator]
    )
```

### Log Results Back to Phoenix

```python
from phoenix.evals.utils import to_annotation_dataframe
from phoenix.client import Client

evaluations = to_annotation_dataframe(dataframe=results_df)

Client().spans.log_span_annotations_dataframe(dataframe=evaluations)
```

Results now appear in the Phoenix UI alongside your traces in the annotations column.

---

## Running Phoenix Locally (Dev / Notebooks Only)

```python
import phoenix as px

session = px.launch_app()   # starts Phoenix at http://localhost:6006
print(session.url)

# When done
px.close_app()
```

**Do not use `px.launch_app()` in production.** Use Phoenix Cloud or
self-hosted deployment with `register()` instead.

---

## Resources

- Docs: https://arize.com/docs/phoenix
- Quickstart notebook: https://github.com/Arize-ai/phoenix/blob/main/tutorials/quickstarts/python_quickstart.ipynb
- Integrations: https://arize.com/docs/phoenix/integrations
- GitHub: https://github.com/Arize-ai/phoenix
- OpenInference (OTel instrumentation specs): https://github.com/Arize-ai/openinference
- Self-hosting: https://arize.com/docs/phoenix/self-hosting
- Cookbooks: https://arize.com/docs/phoenix/cookbook
