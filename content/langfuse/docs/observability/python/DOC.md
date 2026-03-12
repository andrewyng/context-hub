---
name: observability
description: "Langfuse Python SDK v3 for LLM observability, tracing, prompt management, scoring, and experiment evaluation"
metadata:
  languages: "python"
  versions: "3.14.5"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "langfuse,observability,tracing,llm,evaluation,prompts"
---


# Langfuse Python SDK v3 Guidelines

You are a Langfuse SDK coding expert. Help me with writing code using the Langfuse Python SDK for LLM observability, tracing, prompt management, scoring, and evaluation.

Official documentation: https://langfuse.com/docs

## Golden Rule: Use the Correct and Current SDK

Always use the Langfuse Python SDK v3 (built on OpenTelemetry). v2 is deprecated and receives security patches only.

- **Library Name:** Langfuse Python SDK
- **Python Package:** `langfuse`
- **Installation:** `pip install langfuse`
- **Python Requirement:** `>=3.10, <4.0`

**Correct imports (v3):**

- **Correct:** `from langfuse import Langfuse, get_client, observe`
- **Correct:** `from langfuse import propagate_attributes`
- **Correct:** `from langfuse.openai import openai` (OpenAI drop-in wrapper)
- **Correct:** `from langfuse.langchain import CallbackHandler` (LangChain integration)

**Incorrect imports (v2 — do not use):**

- **Wrong:** `from langfuse.decorators import observe` → use `from langfuse import observe`
- **Wrong:** `from langfuse.callback import CallbackHandler` → use `from langfuse.langchain import CallbackHandler`
- **Wrong:** `langfuse_context.update_current_trace()` → use `langfuse.update_current_trace()`

## Environment Variables

```bash
LANGFUSE_SECRET_KEY="sk-lf-..."
LANGFUSE_PUBLIC_KEY="pk-lf-..."
LANGFUSE_BASE_URL="https://cloud.langfuse.com"        # EU (default)
# LANGFUSE_BASE_URL="https://us.cloud.langfuse.com"   # US region
```

**Important:** The env var was renamed from `LANGFUSE_HOST` (v2) to `LANGFUSE_BASE_URL` (v3). The old name still works but is deprecated.

Optional:
- `LANGFUSE_DEBUG="True"` — enables debug logging

## Initialisation

The v3 client is a **singleton**. Two ways to access it:

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

- **Trace:** Top-level container for a request. In v3, traces are implicitly created by the first root observation — no explicit `langfuse.trace()` call.
- **Span:** General-purpose observation for tracking any operation (retrieval, processing, etc.).
- **Generation:** Specialised observation for LLM calls, with fields for `model`, `usage_details`, input/output tokens.
- **Score:** Evaluation data attached to traces/observations. Types: `NUMERIC`, `CATEGORICAL`, `BOOLEAN`.
- **Dataset:** Collection of input/expected-output items for running experiments.
- **Prompt:** Version-controlled templates managed in Langfuse and fetched at runtime.

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
    # Automatically becomes a child span of my_pipeline
    return "relevant context"

@observe(name="llm-call", as_type="generation")
def generate_answer(query: str, context: str) -> str:
    # Becomes a child generation observation
    return "answer based on context"
```

**Decorator parameters:**

| Parameter | Type | Default | Purpose |
|---|---|---|---|
| `name` | `str` | function name | Custom observation name |
| `as_type` | `str` | `"span"` | `"span"` or `"generation"` |
| `capture_input` | `bool` | `True` | Capture function args |
| `capture_output` | `bool` | `True` | Capture return value |

Works with both sync and async functions.

**Updating observations from within a decorated function:**

```python
@observe()
def my_function():
    langfuse = get_client()
    langfuse.update_current_span(metadata={"step": "complete"})
    langfuse.update_current_trace(
        input={"query": "..."},
        output={"answer": "..."},
    )
```

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

For cases where decorators or context managers don't fit:

```python
langfuse = get_client()

span = langfuse.start_observation(name="manual-span")
span.update(input="data")
child = span.start_observation(name="child-gen", as_type="generation")
child.end()   # YOU MUST call .end() manually
span.end()    # YOU MUST call .end() manually
```

**Critical:** With `start_observation()`, you are responsible for calling `.end()`. Failure to do so results in incomplete/missing observations.

## Setting Trace-Level Attributes

Use `propagate_attributes()` to set user, session, and metadata on all observations:

```python
from langfuse import get_client, propagate_attributes

langfuse = get_client()

with langfuse.start_as_current_observation(as_type="span", name="workflow"):
    with propagate_attributes(
        user_id="user_123",
        session_id="session_abc",
        metadata={"experiment": "variant_a"},
        tags=["production"],
        version="1.0",
    ):
        # All observations created inside inherit these attributes
        pass
```

For cross-service distributed tracing, use `as_baggage=True` inside `propagate_attributes()`.

## OpenAI Integration (Drop-in Wrapper)

Change only the import — everything else stays the same:

```python
from langfuse.openai import openai
# Or individually: from langfuse.openai import OpenAI, AsyncOpenAI, AzureOpenAI

# Use exactly like the standard OpenAI client
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

**Combining with @observe():**

```python
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

The experiment runner is the recommended way to run evaluations:

```python
from langfuse import get_client, Evaluation
from langfuse.openai import OpenAI

langfuse = get_client()

# Define a task
def my_task(*, item, **kwargs):
    response = OpenAI().chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": item["input"]}],
    )
    return response.choices[0].message.content

# Define item-level evaluators
def accuracy_evaluator(*, input, output, expected_output, metadata, **kwargs):
    if expected_output and expected_output.lower() in output.lower():
        return Evaluation(name="accuracy", value=1.0, comment="Correct")
    return Evaluation(name="accuracy", value=0.0, comment="Incorrect")

# Define run-level evaluators
def average_accuracy(*, item_results, **kwargs):
    accuracies = [
        e.value for r in item_results for e in r.evaluations if e.name == "accuracy"
    ]
    avg = sum(accuracies) / len(accuracies) if accuracies else 0
    return Evaluation(name="avg_accuracy", value=avg)

# Run with local data
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
4. **OTEL noise:** v3 captures ALL OpenTelemetry spans in your application (database queries, HTTP clients, etc.). Filter or disable unwanted instrumentation to avoid excessive data.
5. **Async context:** In async code, use context managers or `@observe()` rather than manual span management to avoid losing context across `await` boundaries.
6. **Boolean scores:** Must explicitly set `data_type="BOOLEAN"` — otherwise `0`/`1` is inferred as numeric.
7. **Prompt caching:** `get_prompt()` returns a cached version. Recently updated prompts may not appear immediately.
8. **Self-hosted:** Python SDK v3 requires Langfuse platform >= 3.125.0.
9. **`as_type="generation"` on `@observe()`:** Cannot be the outermost call — it must be nested inside another `@observe()` or context-managed span.

## Key v2 to v3 Migration Changes

| Area | v2 (deprecated) | v3 (current) |
|---|---|---|
| Client access | `Langfuse()` direct | `get_client()` singleton |
| Trace creation | `langfuse.trace()` | Implicit via first root observation |
| Span/generation | `trace.generation()`, `trace.span()` | `start_as_current_observation(as_type=...)` |
| Decorator import | `from langfuse.decorators import observe` | `from langfuse import observe` |
| Context updates | `langfuse_context.update_current_trace()` | `langfuse.update_current_trace()` |
| LangChain import | `from langfuse.callback import CallbackHandler` | `from langfuse.langchain import CallbackHandler` |
| Host env var | `LANGFUSE_HOST` | `LANGFUSE_BASE_URL` |
| Trace attributes | Direct params (`user_id=...`) | Via `metadata={"langfuse_user_id": ...}` or `propagate_attributes()` |
