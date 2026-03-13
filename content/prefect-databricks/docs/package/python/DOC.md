---
name: package
description: "Prefect Databricks integration for storing Databricks credentials and submitting Databricks Jobs runs from Python flows"
metadata:
  languages: "python"
  versions: "0.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,databricks,python,workflow,orchestration,jobs,blocks"
---

# Prefect Databricks Python Package Guide

## Golden Rule

Use `prefect-databricks` as a Prefect integration package for Databricks Jobs workflows. Keep writing flows and tasks with core `prefect`; use this package to hold Databricks credentials in a Prefect block and to submit Databricks job runs from a flow.

If you only need a general Databricks SDK client outside Prefect orchestration, this package is usually not the right starting point.

## Install

Install the integration version this guide covers:

```bash
python -m pip install "prefect-databricks==0.4.0"
```

Common alternatives:

```bash
uv add prefect-databricks
poetry add prefect-databricks
```

If your project does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-databricks
```

Sanity-check the install:

```bash
python -m pip show prefect-databricks
python -c "import prefect_databricks; print(prefect_databricks.__file__)"
```

## Prerequisites And Environment

Before you call Databricks from a Prefect flow, make sure:

- your Databricks workspace is reachable from the environment running the flow or worker
- you have a Databricks personal access token or equivalent workspace credential
- the notebook path, cluster, or Databricks job you reference already exists
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Example environment variables:

```bash
export DATABRICKS_INSTANCE="dbc-1234567890123456.cloud.databricks.com"
export DATABRICKS_TOKEN="dapi_..."

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

There is no separate long-lived `prefect-databricks` client you need to initialize first. The common entry point is a credentials block.

## Initialize A Databricks Credentials Block

Create a `DatabricksCredentials` block from environment variables when you want flow code to authenticate to your Databricks workspace.

```python
import os

from prefect_databricks import DatabricksCredentials


databricks_credentials = DatabricksCredentials(
    databricks_instance=os.environ["DATABRICKS_INSTANCE"],
    token=os.environ["DATABRICKS_TOKEN"],
)
```

Use this direct-instantiation pattern when your credentials already come from environment variables or another secret manager and you do not need to persist a named Prefect block yet.

## Save And Reuse A Named Block

When several flows or deployments should share the same Databricks connection definition, save the block in Prefect and load it by name later.

```python
import os

from prefect_databricks import DatabricksCredentials


databricks_credentials = DatabricksCredentials(
    databricks_instance=os.environ["DATABRICKS_INSTANCE"],
    token=os.environ["DATABRICKS_TOKEN"],
)

databricks_credentials.save("databricks-dev", overwrite=True)
```

Load the block inside flow code:

```python
from prefect_databricks import DatabricksCredentials


databricks_credentials = DatabricksCredentials.load("databricks-dev")
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they require a working Prefect API configuration
- direct instantiation of `DatabricksCredentials(...)` does not require Prefect Cloud or a self-hosted server

## Submit A One-Time Databricks Job Run

The most practical workflow is to load a credentials block, then submit a Databricks Jobs run from a Prefect flow and wait for completion.

```python
from prefect import flow
from prefect_databricks import DatabricksCredentials
from prefect_databricks.flows import jobs_runs_submit_and_wait_for_completion


@flow(log_prints=True)
def run_databricks_notebook() -> None:
    databricks_credentials = DatabricksCredentials.load("databricks-dev")

    jobs_runs_submit_and_wait_for_completion(
        databricks_credentials=databricks_credentials,
        run_name="prefect-databricks-demo",
        tasks=[
            {
                "task_key": "run-demo-notebook",
                "existing_cluster_id": "1234-567890-abcd123",
                "notebook_task": {
                    "notebook_path": "/Shared/prefect-demo",
                    "base_parameters": {
                        "run_date": "2026-03-13",
                    },
                },
            }
        ],
    )


if __name__ == "__main__":
    run_databricks_notebook()
```

Why this pattern is useful:

- it keeps Databricks credentials out of the flow source
- it uses a normal Prefect flow entry point, so you can run it locally or turn it into a deployment later
- it maps closely to the Databricks Jobs `runs/submit` workflow when you want a one-off run instead of a permanently scheduled Databricks job

If you already manage compute in Databricks, use an existing cluster ID as shown above. If your team submits ephemeral runs instead, build the task payload with the cluster settings required by the Databricks Jobs API for your workspace.

## Use The Flow In A Deployment

`prefect-databricks` does not change the standard Prefect deployment model. After the flow works locally, deploy it the same way as any other Prefect flow.

```python
if __name__ == "__main__":
    run_databricks_notebook.deploy(
        name="daily-databricks-run",
        work_pool_name="docker-pool",
        image="ghcr.io/acme/prefect-databricks:latest",
        push=False,
        cron="0 6 * * *",
    )
```

Make sure the worker image or runtime environment includes both your flow code and `prefect-databricks`.

## Common Pitfalls

- Installing `prefect-databricks` does not replace `prefect`; you still use core Prefect for `@flow`, `@task`, deployments, workers, and configuration.
- Saving a block with `save(...)` and loading it by name with `load(...)` requires a reachable Prefect API.
- Databricks credentials belong in environment variables, secret management, or Prefect blocks, not hard-coded in source.
- The Databricks notebook path, existing cluster ID, and job payload fields must match real resources in your Databricks workspace.
- The Python package version is separate from Databricks Runtime versions and from any workspace-side Jobs API changes.
- Older Prefect examples may refer to Prefect 2 agent workflows. For current orchestration patterns, prefer Prefect 3 deployments, work pools, workers, and blocks.

## Version Notes For `prefect-databricks` 0.4.0

- This guide covers the PyPI package version `0.4.0`.
- Treat `prefect-databricks` as an integration layered on top of Prefect, not as a standalone workflow framework.
- Pin the integration version your project expects, then manage Databricks workspace compatibility separately through your own workspace configuration and Jobs payloads.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Package integration docs: `https://docs.prefect.io/integrations/prefect-databricks/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Python reference root: `https://reference.prefect.io/prefect_databricks/`
- PyPI package page: `https://pypi.org/project/prefect-databricks/`
