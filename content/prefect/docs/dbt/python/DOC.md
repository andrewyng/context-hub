---
name: dbt
description: "Prefect dbt integration for running dbt Core commands with Prefect observability and triggering dbt Cloud jobs from Python flows"
metadata:
  languages: "python"
  versions: "0.7.20"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,dbt,python,workflow,orchestration,analytics,blocks"
---

# Prefect dbt Python Package Guide

## Golden Rule

Use `prefect-dbt` as the Prefect integration layer for dbt. Keep writing orchestration with core `prefect`, then use:

- `PrefectDbtRunner` for dbt Core commands in `prefect-dbt` 0.7.0 and later
- `DbtCloudCredentials`, `DbtCloudJob`, and `run_dbt_cloud_job` for dbt Cloud jobs

If you only need plain dbt CLI execution with no Prefect flows, blocks, logs, or deployments, run dbt directly instead of adding Prefect.

## Install

If your project already pins Prefect separately, install the integration directly:

```bash
python -m pip install "prefect-dbt==0.7.20"
```

The official Prefect docs also support installing the matching extra, which installs a compatible `prefect` and `prefect-dbt` pair:

```bash
python -m pip install "prefect[dbt]"
```

For dbt Core profiles that need one of the published extras:

```bash
python -m pip install "prefect-dbt[snowflake]"
python -m pip install "prefect-dbt[bigquery]"
python -m pip install "prefect-dbt[postgres]"
```

Or install all published extras:

```bash
python -m pip install -U "prefect-dbt[all_extras]"
```

Sanity-check the install:

```bash
python -m pip show prefect-dbt
python -c "import prefect_dbt; print(prefect_dbt.__file__)"
```

## Prerequisites And Environment

`prefect-dbt` requires Python 3.10 or newer.

For dbt Core runs, make sure the runtime already has:

- a real dbt project directory containing `dbt_project.yml`
- a valid `profiles.yml` or equivalent dbt profile configuration
- the warehouse adapter your dbt project uses

For dbt Cloud runs, collect:

- a dbt Cloud service token
- the dbt Cloud account ID
- the dbt Cloud job ID you want to trigger

If you want to save and later load Prefect blocks by name, configure Prefect too:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

Register the integration's block types so they appear in the Prefect UI:

```bash
prefect block register -m prefect_dbt
```

## Run dbt Core Commands With `PrefectDbtRunner`

For `prefect-dbt` 0.7.0 and later, `PrefectDbtRunner` is the current interface for dbt Core execution.

```python
from prefect import flow
from prefect_dbt import PrefectDbtRunner, PrefectDbtSettings


@flow(log_prints=True)
def run_dbt_build() -> None:
    runner = PrefectDbtRunner(
        settings=PrefectDbtSettings(
            project_dir="analytics",
            profiles_dir=".dbt",
        )
    )
    runner.invoke(["build"])


if __name__ == "__main__":
    run_dbt_build()
```

What this gives you:

- `invoke(...)` accepts the same argument style as dbt Core's `DbtRunner.invoke(...)`
- each dbt node is reflected as a Prefect task when you call `.invoke()` inside a flow or task
- dbt node logs show up in Prefect with normal log-level filtering

If your runtime already sets dbt environment variables, `PrefectDbtSettings` can be omitted and dbt defaults apply.

## Control dbt Settings And Logging

`PrefectDbtSettings` automatically reads `DBT_`-prefixed environment variables that affect `PrefectDbtRunner`.

Typical environment variables:

```bash
export DBT_PROFILES_DIR="$PWD/.dbt"
export DBT_LOG_LEVEL="warn"
```

You can also override settings in code:

```python
from dbt_common.events.base_types import EventLevel
from prefect import flow
from prefect_dbt import PrefectDbtRunner, PrefectDbtSettings


@flow
def run_dbt_models() -> None:
    PrefectDbtRunner(
        settings=PrefectDbtSettings(
            project_dir="analytics",
            profiles_dir=".dbt",
            log_level=EventLevel.ERROR,
        )
    ).invoke(["run", "--select", "marts.finance"])


if __name__ == "__main__":
    run_dbt_models()
```

By default, dbt uses Prefect's logging level. Use `DBT_LOG_LEVEL`, `PrefectDbtSettings.log_level`, or dbt CLI flags when you need stricter filtering.

## Handle Failures Deliberately

By default, dbt node failures raise an exception and fail the surrounding flow or task. If you want the run result without failing the flow immediately, set `raise_on_failure=False`.

```python
from prefect import flow
from prefect_dbt import PrefectDbtRunner


@flow
def run_dbt_without_failing_flow():
    result = PrefectDbtRunner(
        raise_on_failure=False,
    ).invoke(["build"])
    return result
```

Use this sparingly. It is useful when your flow needs to inspect the dbt result and decide what to do next instead of failing fast.

## Use Prefect Templating In `profiles.yml`

`PrefectDbtRunner` supports templating Prefect blocks and variables inside `profiles.yml`. This is useful when you want the same dbt project to resolve different credentials or targets at runtime.

Example:

```yaml
example:
  outputs:
    dev:
      type: duckdb
      path: dev.duckdb
      threads: 1

    prod:
      type: snowflake
      account: "{{ prefect.blocks.snowflake-credentials.warehouse-access.account }}"
      user: "{{ prefect.blocks.snowflake-credentials.warehouse-access.user }}"
      password: "{{ prefect.blocks.snowflake-credentials.warehouse-access.password }}"
      database: "{{ prefect.blocks.snowflake-connector.prod-connector.database }}"
      schema: "{{ prefect.blocks.snowflake-connector.prod-connector.schema }}"
      warehouse: "{{ prefect.blocks.snowflake-connector.prod-connector.warehouse }}"
      threads: 4

  target: "{{ prefect.variables.target }}"
```

This pattern only works when the runtime can resolve the referenced Prefect blocks and variables.

## Save dbt Cloud Credentials And Job Blocks

For dbt Cloud, the practical setup is:

1. Save a `DbtCloudCredentials` block with your service token and account ID.
2. Save a `DbtCloudJob` block for the job you want Prefect to run.
3. Load that job block inside a flow and call `run_dbt_cloud_job(...)`.

Example environment variables:

```bash
export DBT_CLOUD_API_KEY="replace-me"
export DBT_CLOUD_ACCOUNT_ID="123456"
export DBT_CLOUD_JOB_ID="7891011"
```

Save the credentials block:

```python
import os

from prefect_dbt.cloud import DbtCloudCredentials


DbtCloudCredentials(
    api_key=os.environ["DBT_CLOUD_API_KEY"],
    account_id=os.environ["DBT_CLOUD_ACCOUNT_ID"],
).save("dbt-cloud-creds")
```

Save the job block:

```python
import os

from prefect_dbt.cloud import DbtCloudCredentials, DbtCloudJob


dbt_cloud_credentials = DbtCloudCredentials.load("dbt-cloud-creds")

DbtCloudJob(
    dbt_cloud_credentials=dbt_cloud_credentials,
    job_id=os.environ["DBT_CLOUD_JOB_ID"],
).save("daily-models-job")
```

## Run A dbt Cloud Job From A Flow

The official integration docs show `run_dbt_cloud_job(...)` in an async flow:

```python
import asyncio

from prefect import flow
from prefect_dbt.cloud import DbtCloudJob
from prefect_dbt.cloud.jobs import run_dbt_cloud_job


@flow
async def run_dbt_job_flow():
    result = await run_dbt_cloud_job(
        dbt_cloud_job=await DbtCloudJob.load("daily-models-job"),
        targeted_retries=0,
    )
    return await result


if __name__ == "__main__":
    asyncio.run(run_dbt_job_flow())
```

Use `targeted_retries` when you want Prefect to retry unsuccessful nodes from the dbt Cloud job.

## Common Pitfalls

- `prefect-dbt` does not replace core `prefect`; you still use Prefect for `@flow`, deployments, work pools, workers, and block storage.
- `PrefectDbtRunner` is the current dbt Core interface for `prefect-dbt` 0.7.x. Older examples built around `DbtCoreOperation` apply to `0.6.6` and earlier.
- Saving or loading blocks by name requires a reachable Prefect API. Local inline construction does not.
- For dbt Core, the worker or runtime needs the dbt project, the right adapter, and a valid profile. Installing only `prefect-dbt` is not enough.
- `prefect block register -m prefect_dbt` registers block types for UI use; it does not create saved blocks by itself.
- If you depend on `profiles.yml` templating, the referenced Prefect blocks and variables must already exist in the active workspace.
- dbt failures raise by default. Set `raise_on_failure=False` only when the surrounding flow intentionally handles partial failure.

## Version Notes For `prefect-dbt` 0.7.20

- This guide covers PyPI package version `0.7.20`, released on March 5, 2026.
- PyPI lists `prefect-dbt 0.7.20` as requiring Python 3.10 or newer.
- PyPI publishes these extras for this package: `snowflake`, `bigquery`, `postgres`, and `all-extras`.
- The current official integration docs distinguish `prefect-dbt 0.7.0 and later` from `0.6.6 and earlier`; for `0.7.20`, prefer `PrefectDbtRunner` and the current dbt Cloud flow APIs.

## Official Sources Used

- Prefect integrations overview: `https://docs.prefect.io/integrations/use-integrations`
- Prefect dbt integration docs: `https://docs.prefect.io/integrations/prefect-dbt/`
- Prefect dbt runner API reference: `https://docs.prefect.io/integrations/prefect-dbt/api-ref/prefect_dbt-core-runner`
- Prefect settings reference: `https://docs.prefect.io/v3/api-ref/settings-ref`
- PyPI package page: `https://pypi.org/project/prefect-dbt/`
