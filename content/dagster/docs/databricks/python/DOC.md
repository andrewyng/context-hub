---
name: databricks
description: "dagster-databricks package guide for launching Databricks jobs from Dagster assets and ops with PipesDatabricksClient"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-databricks,python,databricks,pipes,orchestration,jobs"
---

# dagster-databricks Python Package Guide

## Golden Rule

Use `dagster-databricks` for the Dagster side of the integration and `dagster-pipes` inside the Databricks task you launch. The current Dagster integration docs center on `PipesDatabricksClient`, which is the main workflow to copy for new code.

On the Databricks side, authenticate through the Databricks SDK for Python. For simple workspace automation that usually means `DATABRICKS_HOST` plus `DATABRICKS_TOKEN`, but Databricks recommends its default unified auth flow and recommends OAuth over personal access tokens for new automation.

## Install

Install the Dagster integration package in the environment that runs your Dagster code:

```bash
python -m pip install "dagster-databricks==0.28.18"
```

If you also write standalone Databricks SDK code outside the Dagster integration, install the SDK explicitly in that local environment:

```bash
python -m pip install "databricks-sdk"
```

The Databricks job or cluster that runs your remote code also needs `dagster-pipes` available:

```bash
python -m pip install "dagster-pipes"
```

## Prerequisites

Before wiring this into Dagster, make sure you already have:

- a Databricks workspace and a cluster or job compute target
- a Dagster project with a loadable top-level `defs = dg.Definitions(...)`
- a Python file, workspace file, volume path, or cloud URI that Databricks can execute as the job task

For local configuration, the simplest explicit environment-variable setup is:

```bash
export DATABRICKS_HOST="https://dbc-1234567890123456.cloud.databricks.com"
export DATABRICKS_TOKEN="dapi..."
```

Databricks documents `DATABRICKS_HOST` and `DATABRICKS_TOKEN` for token auth. Databricks also marks personal access token authentication as legacy and recommends OAuth for stronger security when you are setting up new automation.

## Register `PipesDatabricksClient`

This is the core Dagster-side setup:

```python
import dagster as dg
import os
from databricks.sdk import WorkspaceClient
from dagster_databricks import PipesDatabricksClient


pipes_databricks = PipesDatabricksClient(
    client=WorkspaceClient(
        host=os.environ["DATABRICKS_HOST"],
        token=os.environ["DATABRICKS_TOKEN"],
    )
)

defs = dg.Definitions(
    resources={"pipes_databricks": pipes_databricks},
)
```

If you already rely on Databricks unified authentication through environment variables or a `.databrickscfg` profile, `WorkspaceClient()` with no arguments also works:

```python
from databricks.sdk import WorkspaceClient

client = WorkspaceClient()
```

## Launch A Databricks Python Job From An Asset

The main Dagster pattern is: build a Databricks task, call `pipes_databricks.run(...)`, and return `.get_materialize_result()`.

```python
import dagster as dg
import os
from databricks.sdk import WorkspaceClient
from databricks.sdk.service import jobs
from dagster_databricks import PipesDatabricksClient


@dg.asset
def databricks_asset(
    context: dg.AssetExecutionContext,
    pipes_databricks: PipesDatabricksClient,
):
    task = jobs.SubmitTask.from_dict(
        {
            "task_key": "daily-ingest",
            "new_cluster": {
                "spark_version": "12.2.x-scala2.12",
                "node_type_id": "i3.xlarge",
                "num_workers": 0,
                "cluster_log_conf": {
                    "dbfs": {"destination": "dbfs:/cluster-logs/dagster-databricks"}
                },
            },
            "libraries": [
                {"pypi": {"package": "dagster-pipes"}},
            ],
            "spark_python_task": {
                "python_file": "/Workspace/Shared/dagster/pipes_job.py",
                "source": jobs.Source.WORKSPACE,
            },
        }
    )

    return pipes_databricks.run(
        task=task,
        context=context,
        extras={"storage_root": "/tmp/dagster-pipes", "full_refresh": False},
    ).get_materialize_result()


defs = dg.Definitions(
    assets=[databricks_asset],
    resources={
        "pipes_databricks": PipesDatabricksClient(
            client=WorkspaceClient(
                host=os.environ["DATABRICKS_HOST"],
                token=os.environ["DATABRICKS_TOKEN"],
            )
        )
    },
)
```

Important details:

- the resource key in `resources={"pipes_databricks": ...}` must match the asset parameter name
- the exact Dagster-side API call is `pipes_databricks.run(task=..., context=..., extras=...)`
- `extras` is how you pass small runtime values into the Databricks process
- the returned `PipesClientCompletedInvocation` object exposes `.get_materialize_result()`

## Write The Databricks-Side Code

Inside the Databricks task, open a Dagster Pipes session, read any extras you passed from Dagster, and report events back:

```python
from dagster_pipes import (
    PipesDbfsContextLoader,
    PipesDbfsMessageWriter,
    open_dagster_pipes,
)


with open_dagster_pipes(
    context_loader=PipesDbfsContextLoader(),
    message_writer=PipesDbfsMessageWriter(),
) as pipes:
    full_refresh = pipes.get_extra("full_refresh")

    pipes.log.info(f"Starting Databricks task with full_refresh={full_refresh}")

    # Run your Databricks-side logic here.
    row_count = 123

    pipes.report_asset_materialization(
        metadata={"row_count": row_count},
        data_version="2026-03-13",
    )
```

Dagster's integration docs specifically recommend `PipesDbfsContextLoader` and `PipesDbfsMessageWriter` for Databricks.

## Script Location And Job Packaging

The Dagster integration example shows `spark_python_task["python_file"]` pointing at a DBFS path. Databricks' current jobs docs say Python script tasks can use workspace files, DBFS or cloud URIs, or a Git provider, and Databricks recommends workspace files, Unity Catalog volumes, or cloud object storage over DBFS root for new jobs.

In practice:

- keep your executable script in a location Databricks can read
- install `dagster-pipes` in the task environment with the job `libraries` field
- use a `spark_python_task` when your remote code is a Python file

## Local Development Workflow

Run the Dagster code location that contains your `Definitions` object:

```bash
dagster dev -m my_project.definitions
```

If you want to sanity-check Databricks SDK auth separately from Dagster, this is the smallest direct test:

```python
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()

for cluster in w.clusters.list():
    print(cluster.cluster_name)
```

## Common Pitfalls

- Resource name mismatch. The asset parameter name must match the key in `Definitions(resources=...)`.
- Missing `dagster-pipes` on the Databricks cluster or job. The Dagster side can submit the task, but the remote code will not be able to open the Pipes session.
- Assuming PATs are the preferred long-term auth method. Databricks documents PAT auth as legacy and recommends OAuth for new automation.
- Treating `dbfs:/...` as the preferred place for new Python scripts. Databricks now recommends workspace files, volumes, or cloud object storage instead of DBFS root.
- Using `WorkspaceClient()` default notebook auth assumptions outside notebooks. Databricks notes that notebook auth has runtime and environment limitations; explicit workspace auth is more predictable for local Dagster processes.

## Version Notes For `0.28.18`

- This guide targets `dagster-databricks==0.28.18`.
- Inference from Dagster's current integration page: `PipesDatabricksClient` is the primary workflow Dagster is promoting for this package right now.
- Databricks currently documents the Databricks SDK for Python as beta and recommends pinning the minor version you depend on if you use the SDK directly in your own code.

## Official Sources Used

- https://dagster.io/integrations/dagster-databricks
- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-databricks
- https://pypi.org/project/dagster-databricks/
- https://docs.databricks.com/aws/en/dev-tools/sdk-python
- https://docs.databricks.com/aws/en/dev-tools/auth/pat
- https://docs.databricks.com/aws/en/jobs/python-script
