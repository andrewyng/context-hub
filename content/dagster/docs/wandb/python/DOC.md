---
name: wandb
description: "dagster-wandb package guide for using Weights & Biases artifacts and W&B runs from Dagster assets and jobs"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-wandb,python,wandb,weights-and-biases,artifacts,mlops"
---

# dagster-wandb Python Package Guide

## Golden Rule

Use `dagster-wandb` for the Dagster-specific integration points and keep normal W&B authentication in W&B's own settings. In practice, that means:

- set `WANDB_API_KEY`
- provide your W&B `entity` and `project` through `wandb_config`
- use `wandb_artifacts_io_manager` for artifact reads and writes
- if you call `wandb.init(...)` yourself inside an op or asset, keep the W&B run id aligned with the Dagster run id

## Install

Install the integration alongside Dagster. If your code imports W&B types such as `wandb.Artifact` or `wandb.Table`, install `wandb` explicitly too:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-wandb==0.28.18" \
  "wandb"
```

Dagster `1.12.18` on PyPI requires Python `>=3.10,<3.15`.

## Prerequisites And Auth

Create a W&B API key, then keep credentials and project defaults in environment variables:

```bash
export WANDB_API_KEY="..."
export WANDB_ENTITY="my-team"
export WANDB_PROJECT="feature-store"
```

If you use a dedicated or self-managed W&B deployment, W&B documents `WANDB_BASE_URL` for the API host:

```bash
export WANDB_BASE_URL="https://wandb.example.com"
```

`dagster-wandb` also exposes a `host` config field on `wandb_resource` for the same purpose.

## Write And Read W&B Artifacts From Assets

This is the main workflow the package is built for: materialize an asset into a W&B artifact, then load a named object back out of that artifact in a downstream asset.

```python
import os

import dagster as dg
import wandb
from dagster_wandb import wandb_artifacts_io_manager, wandb_resource
from wandb import Artifact


@dg.asset(
    name="training_metrics",
    compute_kind="wandb",
    metadata={
        "wandb_artifact_configuration": {
            "description": "Validation accuracy by epoch",
            "aliases": ["latest"],
        }
    },
    io_manager_key="wandb_artifacts_manager",
)
def training_metrics() -> Artifact:
    artifact = wandb.Artifact("training_metrics", "dataset")
    artifact.add(
        wandb.Table(
            columns=["epoch", "accuracy"],
            data=[[1, 0.91], [2, 0.94], [3, 0.95]],
        ),
        "metrics_table",
    )
    return artifact


@dg.asset(
    compute_kind="wandb",
    ins={
        "table": dg.AssetIn(
            key="training_metrics",
            input_manager_key="wandb_artifacts_manager",
            metadata={
                "wandb_artifact_configuration": {
                    "get": "metrics_table",
                }
            },
        )
    },
    output_required=False,
)
def inspect_metrics(
    context: dg.AssetExecutionContext,
    table: wandb.Table,
) -> None:
    context.log.info(f"accuracies={table.get_column('accuracy')}")


assets = dg.with_resources(
    [training_metrics, inspect_metrics],
    resource_defs={
        "wandb_config": dg.make_values_resource(entity=str, project=str),
        "wandb_resource": wandb_resource.configured(
            {"api_key": {"env": "WANDB_API_KEY"}}
        ),
        "wandb_artifacts_manager": wandb_artifacts_io_manager.configured(
            {"cache_duration_in_minutes": 60}
        ),
    },
    resource_config_by_key={
        "wandb_config": {
            "config": {
                "entity": os.environ["WANDB_ENTITY"],
                "project": os.environ["WANDB_PROJECT"],
            }
        }
    },
)

defs = dg.Definitions(assets=assets)
```

Important details:

- `wandb_resource` handles W&B auth for the integration and reads `WANDB_API_KEY` in this example
- `wandb_config` is where the integration expects `entity` and `project`
- `io_manager_key="wandb_artifacts_manager"` is what tells Dagster to store the asset in W&B
- `metadata["wandb_artifact_configuration"]["get"]` loads a named object from the upstream artifact instead of downloading the whole artifact yourself

## Direct W&B Run Tracking Inside An Op Or Asset

If you also log metrics directly with the W&B SDK, use Dagster's run id as the W&B run id. The W&B integration docs call this out as the safest way to keep one W&B run attached to one Dagster execution.

```python
import dagster as dg
import wandb


@dg.op
def track_training_run(context: dg.OpExecutionContext) -> None:
    run = wandb.init(
        id=context.run_id,
        resume="allow",
        project="feature-store",
        entity="my-team",
    )
    run.log({"accuracy": 0.95})
    run.finish()
```

## Common Pitfalls

- Missing `entity` or `project`. `WANDB_API_KEY` is not enough by itself for the Dagster integration examples; the package also expects `wandb_config`.
- Wrong host for dedicated deployments. Set `host` on `wandb_resource` or `WANDB_BASE_URL` for self-managed W&B.
- Downloading too much data. Use artifact config keys such as `get` or `get_path` when you only need one named object or file from an artifact.
- Partition limits. The integration docs note that the artifact IO manager does not support materializing multiple partitions in a single run.
- Mixed run identity. If you call `wandb.init(...)` manually, reuse `context.run_id` and `resume="allow"` so repeated retries do not create unrelated W&B runs.

## Version Notes For `0.28.18`

- This guide targets `dagster-wandb==0.28.18`.
- Keep your Dagster packages on the same release line instead of upgrading `dagster-wandb` in isolation.
- W&B Launch support exists in the package through `run_launch_agent` and `run_launch_job`, but the W&B docs label Launch as a beta product and describe it as a pilot program. Treat artifact workflows as the default path unless you already run Launch agents.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-wandb
- https://docs.dagster.io/api/python-api/libraries/dagster-wandb
- https://docs.wandb.ai/models/integrations/dagster
- https://docs.wandb.ai/models/ref/cli/wandb-login
- https://docs.wandb.ai/models/app/settings-page/api-keys
- https://pypi.org/project/dagster/
- https://pypi.org/project/dagster-wandb/
