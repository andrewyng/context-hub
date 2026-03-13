---
name: package
description: "dagster-openai package guide for calling OpenAI models from Dagster assets and ops with OpenAIResource"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-openai,python,openai,llm,ai,data-orchestration"
---

# dagster-openai Python Package Guide

## Golden Rule

Use `dagster-openai` as a thin Dagster integration around the OpenAI Python client: keep your API key in `OPENAI_API_KEY`, register `OpenAIResource` in `dg.Definitions(...)`, and make model calls through the injected resource from assets or ops.

Keep `dagster-openai` on the same Dagster release line as the rest of your Dagster packages. For this guide, `dagster-openai==0.28.18` pairs with Dagster `1.12.18`.

## Install

Install the OpenAI integration alongside matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-openai==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-openai
```

## Prerequisites

Before you wire this into Dagster, make sure you already have:

- an OpenAI API key that can call the model you plan to use
- a Dagster project with a loadable `defs = dg.Definitions(...)`
- the same package set installed anywhere your Dagster code location, webserver, or daemon imports the code

For local development, keep credentials and model defaults in environment variables:

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o-mini"
```

`dagster-openai` does not add a separate authentication flow on top of OpenAI. The important credential is the API key you pass into `OpenAIResource`.

## Register `OpenAIResource`

The main integration point is `OpenAIResource`.

```python
import dagster as dg
from dagster_openai import OpenAIResource


defs = dg.Definitions(
    resources={
        "openai": OpenAIResource(api_key=dg.EnvVar("OPENAI_API_KEY")),
    },
)
```

The resource key must match the function parameter name you use for injection.

## Call Chat Completions From An Asset

This is the simplest pattern to copy into a Dagster project:

```python
import os

import dagster as dg
from dagster_openai import OpenAIResource


@dg.asset
def summarize_feedback(
    context: dg.AssetExecutionContext,
    openai: OpenAIResource,
) -> str:
    with openai.get_client(context) as client:
        response = client.chat.completions.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": "You write concise operational summaries.",
                },
                {
                    "role": "user",
                    "content": "Summarize this customer feedback in 3 bullet points: Delivery was late, but support resolved the issue quickly and the customer wants proactive updates next time.",
                },
            ],
        )

    return response.choices[0].message.content or ""


defs = dg.Definitions(
    assets=[summarize_feedback],
    resources={
        "openai": OpenAIResource(api_key=dg.EnvVar("OPENAI_API_KEY")),
    },
)
```

Important details:

- `openai.get_client(context)` gives your asset an OpenAI client through the Dagster integration
- `client.chat.completions.create(...)` is the exact OpenAI API call used in this example
- the `openai` function parameter must match the `resources={"openai": ...}` key
- model names and request fields still follow the OpenAI Python SDK and OpenAI API docs

## Use Config To Choose The Prompt Or Model Per Run

If the prompt or model should change between runs, pass them through Dagster config instead of hard-coding them.

```python
import dagster as dg
from dagster_openai import OpenAIResource


class PromptConfig(dg.Config):
    prompt: str
    model: str = "gpt-4o-mini"


@dg.op
def generate_copy(
    context: dg.OpExecutionContext,
    config: PromptConfig,
    openai: OpenAIResource,
) -> str:
    with openai.get_client(context) as client:
        response = client.chat.completions.create(
            model=config.model,
            messages=[{"role": "user", "content": config.prompt}],
        )

    return response.choices[0].message.content or ""


@dg.job
def marketing_job() -> None:
    generate_copy()


defs = dg.Definitions(
    jobs=[marketing_job],
    resources={
        "openai": OpenAIResource(api_key=dg.EnvVar("OPENAI_API_KEY")),
    },
)
```

Example run config:

```yaml
ops:
  generate_copy:
    config:
      model: gpt-4o-mini
      prompt: "Write a release note summary for a bug-fix deployment in 2 sentences."
```

This keeps prompt text in run configuration and makes the OpenAI call itself easy to audit in code.

## Local Development Workflow

Point Dagster at the module that exposes your top-level `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

If your deployment uses schedules or sensors, run the daemon against the same Dagster instance configuration:

```bash
dagster-daemon run
```

## Common Pitfalls

- Version mismatch. Keep `dagster-openai` on the matching Dagster release line.
- Missing API key. `OpenAIResource` still needs a valid `OPENAI_API_KEY` at runtime.
- Resource name mismatch. The injected function parameter must match the resource dictionary key.
- Endpoint and model mismatch. This guide uses `client.chat.completions.create(...)`, so choose a model that supports chat completions.
- Partial installation. Install `dagster-openai` anywhere your Dagster code location, webserver, or daemon imports the definitions.
- Bypassing the integration. If you want Dagster-aware behavior from this package, call OpenAI through the injected `OpenAIResource` inside your asset or op instead of creating an unrelated client elsewhere.

## Version Notes For `0.28.18`

- `dagster-openai==0.28.18` is part of the Dagster `1.12.18` release line.
- The package source for this release line lives in the Dagster monorepo under `python_modules/libraries/dagster-openai`.
- When upgrading, pin the related Dagster packages together instead of upgrading `dagster-openai` in isolation.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-openai
- https://docs.dagster.io/api/python-api/libraries/dagster-openai
- https://docs.dagster.io/api/dagster/resources
- https://pypi.org/project/dagster-openai/
- https://platform.openai.com/docs/api-reference/chat/create
