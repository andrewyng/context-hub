---
name: package
description: "dagster-mlflow package guide for using MLflow tracking from Dagster jobs with environment-based tracking server configuration"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-mlflow,python,mlflow,experiment-tracking,mlops,data-orchestration"
---

# dagster-mlflow Python Package Guide

## Golden Rule

Use `dagster-mlflow` to expose MLflow's normal tracking API inside a Dagster job through the `mlflow_tracking` resource. Keep tracking server configuration and authentication in standard MLflow environment variables, and close runs explicitly with `mlflow.end_run()` or the package's `end_mlflow_on_run_finished` hook.

Keep `dagster-mlflow` on the same Dagster release line as the rest of your Dagster packages. For this guide, `dagster-mlflow==0.28.18` pairs with Dagster `1.12.18`.

## Install

Install the integration alongside the matching Dagster packages and the MLflow client you will call from job code:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-mlflow==0.28.18" \
  "mlflow"
```

If you do not run the local Dagster UI in this environment, `dagster-webserver` is optional.

## Prerequisites

Before using `dagster-mlflow`, make sure you already have:

- a Dagster project with a loadable `defs = dg.Definitions(...)`
- an MLflow tracking backend, either local or remote
- the same package set installed anywhere your Dagster code location, webserver, or daemon imports the code

For local development, the common environment-variable setup is:

```bash
export MLFLOW_TRACKING_URI="http://127.0.0.1:5000"
export MLFLOW_EXPERIMENT_NAME="dagster-training"
```

If your tracking server requires authentication, MLflow also documents these environment variables:

```bash
export MLFLOW_TRACKING_USERNAME="alice"
export MLFLOW_TRACKING_PASSWORD="secret"
```

Or token-based auth:

```bash
export MLFLOW_TRACKING_TOKEN="token-value"
```

If you omit `MLFLOW_TRACKING_URI`, MLflow usually logs to the local `./mlruns` directory instead of a shared tracking server.

## Minimal Job With `mlflow_tracking`

This is the core `dagster-mlflow` pattern to copy into an op-based Dagster job:

```python
import os
from pathlib import Path

import dagster as dg
from dagster_mlflow import end_mlflow_on_run_finished, mlflow_tracking


@dg.op(required_resource_keys={"mlflow"})
def train_model(context: dg.OpExecutionContext) -> str:
    mlflow = context.resources.mlflow

    mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
    mlflow.set_experiment(os.environ["MLFLOW_EXPERIMENT_NAME"])

    artifact_dir = Path("artifacts")
    artifact_dir.mkdir(parents=True, exist_ok=True)
    summary_path = artifact_dir / "summary.txt"
    summary_path.write_text("accuracy=0.91\n")

    with mlflow.start_run(run_name="train_model"):
        mlflow.log_param("model_type", "baseline")
        mlflow.log_metric("accuracy", 0.91)
        mlflow.set_tag("dagster_job", context.job_name)
        mlflow.log_artifact(str(summary_path), artifact_path="reports")

    return "logged"


@dg.job(
    resource_defs={"mlflow": mlflow_tracking},
    hooks={end_mlflow_on_run_finished},
)
def training_job():
    train_model()


defs = dg.Definitions(jobs=[training_job])
```

What matters in the snippet:

- `mlflow_tracking` is the Dagster resource exported by `dagster-mlflow`
- the resource is registered under the `mlflow` key, so the op reads it as `context.resources.mlflow`
- the logging calls are the standard MLflow tracking API: `set_experiment(...)`, `start_run(...)`, `log_param(...)`, `log_metric(...)`, `set_tag(...)`, and `log_artifact(...)`
- `end_mlflow_on_run_finished` is the package helper to clean up an active MLflow run when the Dagster job finishes

## Use MLflow APIs Directly Inside The Op

`dagster-mlflow` does not replace the MLflow client API. The common workflow is still:

1. point the process at the correct tracking server
2. select an experiment
3. start a run
4. log params, metrics, tags, and artifacts
5. end the run

That means the MLflow calls you write inside Dagster should look like normal MLflow code:

```python
mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
mlflow.set_experiment(os.environ["MLFLOW_EXPERIMENT_NAME"])

with mlflow.start_run(run_name="baseline"):
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_metric("loss", 0.42)
    mlflow.set_tag("stage", "dev")
```

If you already have working standalone MLflow tracking code, the usual migration into Dagster is to move that logic into an op and access MLflow through `context.resources.mlflow`.

## Local Development Workflow

Start Dagster against the module that exposes your top-level `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

To execute the job directly from the CLI:

```bash
dagster job execute -m my_project.definitions -j training_job
```

If your deployment uses schedules or sensors, run the daemon with the same environment variables so MLflow logging still reaches the intended tracking backend.

## Common Pitfalls

- Version mismatch. Keep `dagster-mlflow` on the same release line as the rest of your Dagster packages.
- Wrong tracking backend. A missing or incorrect `MLFLOW_TRACKING_URI` often sends logs to local `./mlruns` instead of your shared tracking server.
- Resource key mismatch. The op expects `context.resources.mlflow`, so the job must register the resource under the `mlflow` key.
- Missing cleanup. If your code starts MLflow runs manually, make sure they are closed with a context manager, `mlflow.end_run()`, or `end_mlflow_on_run_finished`.
- Partial installation. Install `dagster-mlflow` and `mlflow` anywhere the Dagster code location, webserver, or daemon needs to import or execute the job.
- Assuming Dagster manages MLflow auth for you. Tracking server credentials still follow normal MLflow configuration.

## Version Notes For `0.28.18`

- `dagster-mlflow==0.28.18` is part of the Dagster `1.12.18` release line.
- The package source for this release line lives in the Dagster monorepo under `python_modules/libraries/dagster-mlflow`.
- For tracking server URLs, auth variables, and artifact logging behavior, rely on the matching MLflow client documentation as well as the Dagster integration docs.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-mlflow
- https://github.com/dagster-io/dagster/blob/master/python_modules/libraries/dagster-mlflow/README.md
- https://docs.dagster.io/api/python-api/libraries/dagster-mlflow
- https://pypi.org/project/dagster-mlflow/
- https://mlflow.org/docs/latest/
- https://mlflow.org/docs/latest/api_reference/python_api/
- https://mlflow.org/docs/latest/self-hosting/architecture/tracking-server/
