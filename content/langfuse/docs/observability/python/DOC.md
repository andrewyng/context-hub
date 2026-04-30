---
name: observability
description: "Langfuse Python SDK v4 for LLM observability, tracing, prompt management, scoring, and experiment evaluation"
metadata:
  languages: "python"
  versions: "4.0.0"
  revision: 2
  updated-on: "2026-03-17"
  source: community
  tags: "langfuse,observability,tracing,llm,evaluation,prompts"
---


# Langfuse Python SDK v4 Guidelines

You are a Langfuse SDK coding expert. Help me with writing code using the Langfuse Python SDK for LLM observability, tracing, prompt management, scoring, and evaluation.

Official documentation: https://langfuse.com/docs

## Golden Rule: Use the Correct and Current SDK

Always use the Langfuse Python SDK v4 (observation-centric model, built on OpenTelemetry). v3 is the previous stable release. v2 is deprecated and receives security patches only.

- **Library Name:** Langfuse Python SDK
- **Python Package:** `langfuse`
- **Installation:** `pip install langfuse`
- **Python Requirement:** `>=3.10, <4.0`
- **Pydantic Requirement:** v2 (v1 support dropped in SDK v4; use the `pydantic.v1` compatibility shim if migrating gradually)

**Correct imports (v4):**

- **Correct:** `from langfuse import Langfuse, get_client, observe`
- **Correct:** `from langfuse import propagate_attributes`
- **Correct:** `from langfuse.openai import openai` (OpenAI drop-in wrapper)
- **Correct:** `from langfuse.langchain import CallbackHandler` (LangChain integration)
- **Correct:** `from langfuse.span_filter import is_default_export_span` (for custom span filters)

**Incorrect imports (v2/v3 — do not use):**

- **Wrong:** `from langfuse.decorators import observe` → use `from langfuse import observe`
- **Wrong:** `from langfuse.callback import CallbackHandler` → use `from langfuse.langchain import CallbackHandler`
- **Wrong:** `langfuse_context.update_current_trace()` → use `propagate_attributes()` (see below)
- **Wrong:** `langfuse.start_span(...)` / `langfuse.start_generation(...)` → use `langfuse.start_observation(...)` with `as_type`

## Environment Variables

```bash
LANGFUSE_SECRET_KEY="sk-lf-..."
LANGFUSE_PUBLIC_KEY="pk-lf-..."
LANGFUSE_BASE_URL="https://cloud.langfuse.com"        # EU (default)
# LANGFUSE_BASE_URL="https://us.cloud.langfuse.com"   # US region
```

**Important:** The env var was renamed from `LANGFUSE_HOST` (v2) to `LANGFUSE_BASE_URL` (v3+). The old name still works but is deprecated.

Optional:
- `LANGFUSE_DEBUG="True"` — enables debug logging (recommended during migration)
- `LANGFUSE_RELEASE` — set the release version (previously a code parameter, now env-var only in v4)
- `LANGFUSE_TRACING_ENVIRONMENT` — set the tracing environment (previously a code parameter, now env-var only in v4)

## Initialisation

The client is a **singleton**. Two ways to access it:

```python
# Option 1: get_client() — preferred, uses env vars automatically
from langfuse import get_client

langfuse = get_client()
```

```python
# Option 2: Constructor with explicit credentials
from langfuse import Langfuse

langfuse = Langfuse(
    public_key="pk-lf-...",
    secret_key="sk-lf-...",
    base_url="https://cloud.langfuse.com",
)
```

Verify connection (development only):

```python
if langfuse.auth_check():
    print("Connected to Langfuse")
```

## Core Concepts

- **Trace:** Top-level container for a request. Traces are implicitly created by the first root observation — no explicit `langfuse.trace()` call.
- **Span:** General-purpose observation for tracking any operation (retrieval, processing, etc.).
- **Generation:** Specialised observation for LLM calls, with fields for `model`, `usage_details`, input/output tokens.
- **Score:** Evaluation data attached to traces/observations. Types: `NUMERIC`, `CATEGORICAL`, `BOOLEAN`.
- **Dataset:** Collection of input/expected-output items for running experiments.
- **Prompt:** Version-controlled templates managed in Langfuse and fetched at runtime.

**v4 Observation-Centric Model:** Correlating attributes (`user_id`, `session_id`, `metadata`, `tags`) now propagate to every observation rather than living only on the trace. This enables single-table queries and improves performance at scale.

## Tracing with the @observe() Decorator

The simplest and recommended approach. The outermost `@observe()` call creates a trace. Nested decorated functions automatically become child spans/generations.

```python
from langfuse import observe, get_client

@observe()
def my_pipeline(query: str) -> str:
    context = retrieve_context(query)
    answer = generate_answer(query, context)
    return answer

@observe()
def retrieve_context(query: str) -> str:
    return "relevant context"

@observe(name="llm-call", as_type="generation")
def generate_answer(query: str, context: str) -> str:
    return "answer based on context"
```

**Decorator parameters:**

| Parameter | Type | Default | Purpose |
|---|---|---|---|
| `name` | `str` | function name | Custom observation name |
| `as_type` | `str` | `"span"` | `"span"` or `"generation"` |
| `capture_input` | `bool` | `True` | Capture function args |
| `capture_output` | `bool` | `True` | Capture return value |

Works with both sync and async functions. IO capture can also be disabled globally via `LANGFUSE_OBSERVE_DECORATOR_IO_CAPTURE_ENABLED` env var.

**Updating observations from within a decorated function:**

```python
@observe()
def my_function():
    langfuse = get_client()
    langfuse.update_current_span(metadata={"step": "complete"})
```

## Setting Trace-Level Attributes with propagate_attributes()

In v4, `propagate_attributes()` is the **primary mechanism** for setting correlating attributes. It replaces the former `update_current_trace()` approach. Attributes are propagated to the current and all child observations created within its scope.

```python
from langfuse import get_client, propagate_attributes

langfuse = get_client()

with langfuse.start_as_current_observation(as_type="span", name="workflow"):
    with propagate_attributes(
        trace_name="user-workflow",
        user_id="user_123",
        session_id="session_abc",
        metadata={"experiment": "variant_a"},
        tags=["production"],
        version="1.0",
    ):
        # All observations created inside inherit these attributes
        pass
```

**When using the @observe() decorator:**

```python
from langfuse import observe, propagate_attributes

@observe()
def my_llm_pipeline(user_id: str, session_id: str):
    with propagate_attributes(
        user_id=user_id,
        session_id=session_id,
        metadata={"pipeline": "main"},
    ):
        result = call_llm()
        return result

@observe()
def call_llm():
    # Automatically has user_id, session_id, metadata from parent
    pass
```

**Key v4 changes:**

| Attribute | v3 | v4 |
|---|---|---|
| Trace name | `update_current_trace(name=...)` | `propagate_attributes(trace_name=...)` |
| `user_id`, `session_id`, `tags`, `version` | `update_current_trace(...)` | `propagate_attributes(...)` |
| `metadata` | `update_current_trace(metadata=any)` | `propagate_attributes(metadata=dict[str,str])` — values ≤200 chars |
| `input`, `output` | `update_current_trace(...)` | `set_current_trace_io(...)` (deprecated) — prefer setting I/O on root observation |
| `public` | `update_current_trace(public=True)` | `set_current_trace_as_public()` |
| `release` | `update_current_trace(release=...)` | Removed — use `LANGFUSE_RELEASE` env var |
| `environment` | `update_current_trace(environment=...)` | Removed — use `LANGFUSE_TRACING_ENVIRONMENT` env var |

For cross-service distributed tracing, use `as_baggage=True` inside `propagate_attributes()`.

## Tracing with Context Managers

For more control over observation lifecycle:

```python
from langfuse import get_client, propagate_attributes

langfuse = get_client()

with langfuse.start_as_current_observation(
    as_type="span",
    name="user-request-pipeline",
    input={"user_query": "Tell me a joke"},
) as root_span:
    with propagate_attributes(user_id="user_123", session_id="session_abc"):
        with langfuse.start_as_current_observation(
            as_type="generation",
            name="joke-generation",
            model="gpt-4o",
        ) as generation:
            generation.update(output="Why did the chicken...")

    root_span.update(output={"final_joke": "..."})
```

The context manager handles `.end()` automatically.

## Manual Observation Creation

For cases where decorators or context managers don't fit. In v4, `start_span()` and `start_generation()` are replaced by the unified `start_observation()` with an `as_type` parameter:

```python
langfuse = get_client()

span = langfuse.start_observation(name="manual-span")
span.update(input="data")
child = span.start_observation(name="child-gen", as_type="generation")
child.end()   # YOU MUST call .end() manually
span.end()    # YOU MUST call .end() manually
```

**Critical:** With `start_observation()`, you are responsible for calling `.end()`. Failure to do so results in incomplete/missing observations.

## Span Filtering (New in v4)

v4 introduces smart default span filtering. Only LLM-relevant spans are exported by default:

- Spans from known LLM instrumentation scopes (`openinference`, `langsmith`, `haystack`, `litellm`)
- Spans with `gen_ai.*` attributes
- Spans created by Langfuse (`langfuse-sdk`)

Non-LLM spans (HTTP, DB, queues, framework internals) are no longer exported by default.

**Restore pre-v4 "export everything" behaviour:**

```python
from langfuse import Langfuse

langfuse = Langfuse(should_export_span=lambda span: True)
```

**Compose custom filters with defaults:**

```python
from langfuse import Langfuse
from langfuse.span_filter import is_default_export_span

langfuse = Langfuse(
    should_export_span=lambda span: (
        is_default_export_span(span)
        or (
            span.instrumentation_scope is not None
            and span.instrumentation_scope.name.startswith("my_framework")
        )
    )
)
```

**Note:** `blocked_instrumentation_scopes` is deprecated in v4 — migrate to `should_export_span`.

## OpenAI Integration (Drop-in Wrapper)

Change only the import — everything else stays the same:

```python
from langfuse.openai import openai
# Or individually: from langfuse.openai import OpenAI, AsyncOpenAI, AzureOpenAI

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
```

Automatically captures: prompts, completions, token counts, latencies, errors, streaming time-to-first-token.

**Combining with @observe() for grouped traces:**

```python
from langfuse import observe
from langfuse.openai import openai

@observe()
def my_pipeline(country: str) -> str:
    capital = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Capital of {country}?"}],
        name="get-capital",
    ).choices[0].message.content

    poem = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Write a poem about {capital}"}],
        name="generate-poem",
    ).choices[0].message.content
    return poem
```

**Setting trace attributes via metadata:**

```python
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    metadata={
        "langfuse_user_id": "user_123",
        "langfuse_session_id": "session_456",
        "langfuse_tags": ["chat"],
        "custom_key": "custom_value",  # Non-prefixed keys become custom metadata
    },
)
```

**Note:** In v4, passed-in trace attributes propagate to children only — they do not bubble up to the parent trace. Use `propagate_attributes` at your root observation instead.

## LangChain Integration

```python
from langfuse.langchain import CallbackHandler

langfuse_handler = CallbackHandler()

response = chain.invoke(
    {"topic": "cats"},
    config={
        "callbacks": [langfuse_handler],
        "metadata": {
            "langfuse_user_id": "user_123",
            "langfuse_session_id": "session_456",
            "langfuse_tags": ["langchain"],
        },
    },
)
```

**v4 change:** The `update_trace` parameter on `CallbackHandler` was removed. Passing it raises a `TypeError`. Use `propagate_attributes()` to set trace attributes instead:

```python
from langfuse import observe, propagate_attributes
from langfuse.langchain import CallbackHandler

@observe()
def process_user_query(user_input: str):
    with propagate_attributes(session_id="s-1234", user_id="u-5678"):
        handler = CallbackHandler()
        result = chain.invoke(
            {"input": user_input},
            config={"callbacks": [handler]},
        )
    return result
```

## Prompt Management

**Create a prompt:**

```python
langfuse = get_client()

langfuse.create_prompt(
    name="movie-critic",
    type="text",  # or "chat" — type cannot be changed after creation
    prompt="As a {{criticlevel}} movie critic, do you like {{movie}}?",
    labels=["production"],
)
```

**Fetch and compile:**

```python
prompt = langfuse.get_prompt("movie-critic")  # Fetches "production" label by default
compiled = prompt.compile(criticlevel="expert", movie="Dune 2")
# Returns: "As an expert movie critic, do you like Dune 2?"
```

For chat prompts, `.compile()` returns a list of message dicts with `role`/`content`.

- **Variable syntax:** `{{variableName}}` using double curly braces
- **Caching:** Prompts are cached client-side — recently updated prompts may not appear immediately
- **Prompt types:** `"text"` (returns string) and `"chat"` (returns list of messages)

## Scoring

Three types: `NUMERIC` (float), `CATEGORICAL` (string), `BOOLEAN` (0 or 1).

```python
langfuse = get_client()

# Low-level: create_score()
langfuse.create_score(
    name="correctness",
    value=0.9,
    trace_id="trace_id_here",
    observation_id="obs_id_here",  # optional
    data_type="NUMERIC",
    comment="Factually correct",
)

# From a span context
with langfuse.start_as_current_observation(as_type="span", name="op") as span:
    span.score(name="correctness", value=0.9, data_type="NUMERIC")
    span.score_trace(name="overall_quality", value=0.95, data_type="NUMERIC")

# Score current context
with langfuse.start_as_current_observation(as_type="span", name="op"):
    langfuse.score_current_span(name="quality", value=0.9, data_type="NUMERIC")
    langfuse.score_current_trace(name="overall", value=0.95, data_type="NUMERIC")
```

**Important:** Boolean scores must explicitly set `data_type="BOOLEAN"` — otherwise a value of `0` or `1` is inferred as numeric.

## Experiments and Evaluation

The experiment runner is the recommended way to run evaluations. In v4, `DatasetItemClient.run()` is removed — use `dataset.run_experiment()` instead:

```python
from langfuse import get_client, Evaluation
from langfuse.openai import OpenAI

langfuse = get_client()

def my_task(*, item, **kwargs):
    response = OpenAI().chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": item["input"]}],
    )
    return response.choices[0].message.content

def accuracy_evaluator(*, input, output, expected_output, metadata, **kwargs):
    if expected_output and expected_output.lower() in output.lower():
        return Evaluation(name="accuracy", value=1.0, comment="Correct")
    return Evaluation(name="accuracy", value=0.0, comment="Incorrect")

def average_accuracy(*, item_results, **kwargs):
    accuracies = [
        e.value for r in item_results for e in r.evaluations if e.name == "accuracy"
    ]
    avg = sum(accuracies) / len(accuracies) if accuracies else 0
    return Evaluation(name="avg_accuracy", value=avg)

local_data = [
    {"input": "Capital of France?", "expected_output": "Paris"},
    {"input": "Capital of Germany?", "expected_output": "Berlin"},
]

result = langfuse.run_experiment(
    name="Geography Quiz",
    description="Testing basic geography",
    data=local_data,
    task=my_task,
    evaluators=[accuracy_evaluator],
    run_evaluators=[average_accuracy],
    max_concurrency=5,
)
print(result.format())
```

**Using a Langfuse-hosted dataset:**

```python
dataset = langfuse.get_dataset("my-evaluation-dataset")
result = dataset.run_experiment(
    name="Production Model Test",
    task=my_task,
    evaluators=[accuracy_evaluator],
)
```

**Function signatures:**
- Task: `def my_task(*, item, **kwargs)` — `item` is a dict (local) or `DatasetItemClient` (access `.input`, `.expected_output`, `.metadata`)
- Item evaluator: `def eval(*, input, output, expected_output, metadata, **kwargs)` — returns `Evaluation`
- Run evaluator: `def eval(*, item_results, **kwargs)` — returns `Evaluation`

## Trace and Observation IDs

Langfuse follows the W3C Trace Context standard:
- Observation IDs: 16-character lowercase hex strings (8 bytes)
- Trace IDs: 32-character lowercase hex strings (16 bytes)

```python
from langfuse import get_client

langfuse = get_client()

# Generate a deterministic trace ID from a seed
external_request_id = "req_12345"
deterministic_trace_id = langfuse.create_trace_id(seed=external_request_id)

# Get current IDs from context
with langfuse.start_as_current_observation(as_type="span", name="my-op"):
    trace_id = langfuse.get_current_trace_id()
    observation_id = langfuse.get_current_observation_id()
```

## Public API Namespace Changes (v4)

High-performance v2 API resources are now the defaults. Legacy v1 APIs moved to `api.legacy.*`:

| v3 / transitional name | v4 name |
|---|---|
| `langfuse.api.observations_v_2` | `langfuse.api.observations` |
| `langfuse.api.score_v_2` | `langfuse.api.scores` |
| `langfuse.api.metrics_v_2` | `langfuse.api.metrics` |
| `langfuse.api.observations` (legacy v1) | `langfuse.api.legacy.observations_v1` |
| `langfuse.api.score` (legacy v1) | `langfuse.api.legacy.score_v1` |
| `langfuse.api.metrics` (legacy v1) | `langfuse.api.legacy.metrics_v1` |

**Self-hosted users:** The new default `api.observations` and `api.metrics` point to v2 endpoints which may not be available on self-hosted deployments yet. Use `api.legacy.observations_v1` and `api.legacy.metrics_v1` instead.

## Querying Data with the SDK

The `api` namespace on the Langfuse client is auto-generated from the Public API (OpenAPI). Method names mirror REST resources and support filters and pagination. Data is typically available for querying within 15-30 seconds of ingestion.

Docs: https://langfuse.com/docs/api-and-data-platform/features/query-via-sdk

**Observations:**

```python
# High-performance endpoint (default in v4, formerly observations_v_2)
observations = langfuse.api.observations.get_many(
    trace_id="abcdef1234",
    type="GENERATION",
    limit=100,
    fields="core,basic,usage",
)

# Legacy v1 endpoint (for self-hosted without v2 support)
legacy_obs = langfuse.api.legacy.observations_v1.get_many(
    trace_id="abcdef1234",
    type="GENERATION",
    limit=100,
)
legacy_single = langfuse.api.legacy.observations_v1.get("observation-id")
```

**Scores:**

```python
# High-performance endpoint (default in v4, formerly score_v_2)
langfuse.api.scores.get_many(score_ids="score-id")

# Legacy v1 endpoint
langfuse.api.legacy.score_v1.get(score_ids="score-id")
```

**Datasets:**

```python
# Available namespaces:
# langfuse.api.datasets.*
# langfuse.api.dataset_items.*
# langfuse.api.dataset_run_items.*
```

**Metrics:**

```python
import json

query = json.dumps({
    "view": "observations",
    "metrics": [{"measure": "totalCost", "aggregation": "sum"}],
    "dimensions": [{"field": "providedModelName"}],
    "filters": [],
    "fromTimestamp": "2026-01-01T00:00:00Z",
    "toTimestamp": "2026-03-17T00:00:00Z",
})

langfuse.api.metrics.get(query=query)
```

**Pagination:**

```python
all_traces = []
limit = 50
page = 1
while True:
    traces = langfuse.api.trace.list(limit=limit, page=page)
    all_traces.extend(traces.data)
    if len(traces.data) < limit or len(all_traces) >= 1000:
        break
    page += 1
```

## Langfuse CLI

The `langfuse-cli` provides command-line access to the full Langfuse REST API. Run via npx (no install required):

```bash
# Run directly (recommended)
npx langfuse-cli api <resource> <action>

# Or install globally
npm i -g langfuse-cli
langfuse api <resource> <action>
```

**Discovery — explore available resources and actions:**

```bash
# List all resources and auth info
npx langfuse-cli api __schema

# List actions for a resource
npx langfuse-cli api <resource> --help

# Show args/options for a specific action
npx langfuse-cli api <resource> <action> --help

# Preview the curl command without executing
npx langfuse-cli api <resource> <action> --curl
```

**Credentials — set environment variables:**

```bash
export LANGFUSE_PUBLIC_KEY=pk-lf-...
export LANGFUSE_SECRET_KEY=sk-lf-...
export LANGFUSE_HOST=https://cloud.langfuse.com  # EU cloud
# export LANGFUSE_HOST=https://us.cloud.langfuse.com  # US cloud
```

**Tips:**
- Use `--json` for machine-readable JSON output
- Use `--curl` to preview the HTTP request without executing
- Pagination: use `--limit` and `--page` on list endpoints
- All list commands support filtering — check `<resource> <action> --help` for available options

Docs: https://langfuse.com/docs/api-and-data-platform/features/cli

## Flush, Shutdown, and Lifecycle

The SDK batches events in the background. You must handle shutdown explicitly:

```python
langfuse = get_client()

# For short-lived scripts / serverless / notebooks:
langfuse.flush()     # Blocks until all buffered events are sent

# For application shutdown:
langfuse.shutdown()  # Flushes + waits for background threads to terminate
```

**When you MUST flush/shutdown:**
- Serverless functions (Lambda, Cloud Functions)
- Scripts and notebooks
- Before process exit in any application

## Common Gotchas

1. **Forgetting `.end()`:** When using `start_observation()` (manual spans), you MUST call `.end()`. The context manager and decorator handle this automatically.
2. **Forgetting `flush()`/`shutdown()`:** In short-lived processes, events will be lost if you don't flush before exit.
3. **Threading:** The `@observe()` decorator uses `contextvars`. It does NOT work with `ThreadPoolExecutor`, `ProcessPoolExecutor`, or manually spawned threads — the context is not copied.
4. **Metadata format (v4):** Metadata values must be `dict[str, str]` with values ≤200 characters. Non-string values are coerced to strings. Values exceeding the limit are dropped with a warning.
5. **Span filtering (v4):** Non-LLM OpenTelemetry spans (HTTP, DB, queues) are no longer exported by default. If traces appear disconnected, intermediate spans may be filtered. Use `is_default_export_span` as a base and compose custom filters.
6. **Async context:** In async code, use context managers or `@observe()` rather than manual span management to avoid losing context across `await` boundaries.
7. **Boolean scores:** Must explicitly set `data_type="BOOLEAN"` — otherwise `0`/`1` is inferred as numeric.
8. **Prompt caching:** `get_prompt()` returns a cached version. Recently updated prompts may not appear immediately.
9. **`as_type="generation"` on `@observe()`:** Cannot be the outermost call — it must be nested inside another `@observe()` or context-managed span.
10. **Pydantic v2 required (v4):** The SDK now requires Pydantic v2. Use the `pydantic.v1` compatibility shim if migrating gradually.
11. **`release`/`environment` as code params (v4):** These are silently ignored if passed as parameters. Use `LANGFUSE_RELEASE` and `LANGFUSE_TRACING_ENVIRONMENT` env vars.
12. **Attribute propagation direction (v4):** In LangChain/OpenAI integrations, attributes propagate downward only, not upward to parent traces. Wrap outer calls in `propagate_attributes()`.
13. **`user_id`/`session_id` validation (v4):** Validated as strings with max 200 characters. Values exceeding the limit are dropped with a warning.

## Key v3 to v4 Migration Changes

| Area | v3 | v4 (current) |
|---|---|---|
| Trace attributes | `update_current_trace(name=..., user_id=...)` | `propagate_attributes(trace_name=..., user_id=...)` |
| Trace I/O | `update_current_trace(input=..., output=...)` | `set_current_trace_io(...)` (deprecated) or set on root observation |
| Trace public flag | `update_current_trace(public=True)` | `set_current_trace_as_public()` |
| Span/generation creation | `start_span()`, `start_generation()` | `start_observation(as_type=...)` |
| Context span/generation | `start_as_current_span()`, `start_as_current_generation()` | `start_as_current_observation(as_type=...)` |
| Dataset experiments | `item.run(run_name=...)` | `dataset.run_experiment(name=..., task=...)` |
| Span filtering | Export all OTel spans | Smart defaults, customisable via `should_export_span` |
| LangChain handler | `CallbackHandler(update_trace=True)` | `CallbackHandler()` — wrap in `propagate_attributes()` instead |
| Metadata format | `Any` | `dict[str, str]`, values ≤200 chars |
| `release`/`environment` | Code parameters | Env vars only (`LANGFUSE_RELEASE`, `LANGFUSE_TRACING_ENVIRONMENT`) |
| API namespaces | `api.observations_v_2`, `api.score_v_2` | `api.observations`, `api.scores` (v1 moved to `api.legacy.*`) |
| Pydantic | v1 and v2 | v2 only |
| Removed types | Available in `langfuse.types` | `TraceMetadata`, `ObservationParams` removed; import `MapValue`, `ModelUsage`, `PromptClient` from `langfuse.model` |

Full migration guide: https://langfuse.com/docs/observability/sdk/upgrade-path/python-v3-to-v4
