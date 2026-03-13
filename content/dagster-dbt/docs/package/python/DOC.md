---
name: package
description: "dagster-dbt package guide for loading dbt projects as Dagster assets and running dbt CLI workflows"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "dagster,dbt,dagster-dbt,python,data-orchestration,assets,etl"
---

# dagster-dbt Python Package Guide

## Golden Rule

Treat `dagster-dbt` as Dagster's bridge to an existing dbt project. Keep the dbt project authoritative, generate a fresh `manifest.json`, and execute dbt through `DbtCliResource` instead of trying to call dbt internals from long-lived Python application code.

## Install

Install `dagster-dbt` alongside the matching Dagster release, plus the dbt adapter your project actually uses:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-dbt==0.28.18" \
  "dbt-duckdb"
```

Replace `dbt-duckdb` with your adapter package such as `dbt-postgres`, `dbt-snowflake`, or `dbt-bigquery`.

Useful checks after install:

```bash
dagster --version
dbt --version
python -m pip show dagster-dbt
```

## Prerequisites

Before wiring Dagster to dbt, make sure you already have:

- a working dbt project with `dbt_project.yml`
- a valid dbt profile, usually in `~/.dbt/profiles.yml` or a custom directory
- a generated `target/manifest.json` artifact from `dbt parse`, `dbt build`, or `dbt docs generate`

Typical layout:

```text
my_orchestrator/
  src/
    my_orchestrator/
      definitions.py
  dbt/
    jaffle_shop/
      dbt_project.yml
      models/
      target/
        manifest.json
```

## Load A dbt Project As Dagster Assets

The main pattern is `@dbt_assets(...)` plus a configured `DbtCliResource`.

```python
import os
from pathlib import Path

import dagster as dg
from dagster_dbt import DbtCliResource, dbt_assets

DBT_PROJECT_DIR = Path(__file__).resolve().parents[2] / "dbt" / "jaffle_shop"
DBT_PROFILES_DIR = Path(os.environ.get("DBT_PROFILES_DIR", DBT_PROJECT_DIR))
DBT_MANIFEST_PATH = DBT_PROJECT_DIR / "target" / "manifest.json"


@dbt_assets(manifest=DBT_MANIFEST_PATH)
def jaffle_shop_dbt_assets(
    context: dg.AssetExecutionContext,
    dbt: DbtCliResource,
):
    yield from dbt.cli(["build"], context=context).stream()


defs = dg.Definitions(
    assets=[jaffle_shop_dbt_assets],
    resources={
        "dbt": DbtCliResource(
            project_dir=DBT_PROJECT_DIR,
            profiles_dir=DBT_PROFILES_DIR,
        )
    },
)
```

Why this shape matters:

- `@dbt_assets(...)` turns dbt nodes from the manifest into Dagster assets.
- `DbtCliResource` runs normal dbt CLI commands from Dagster.
- `context=context` lets Dagster associate emitted events with the asset execution.
- `manifest.json` is what Dagster reads to understand the dbt graph before execution starts.

## Local Development Workflow

If your dbt profiles are stored with the project, export `DBT_PROFILES_DIR` and regenerate the manifest before starting Dagster:

```bash
export DBT_PROFILES_DIR="$PWD/dbt/jaffle_shop"

dbt deps --project-dir dbt/jaffle_shop --profiles-dir "$DBT_PROFILES_DIR"
dbt parse --project-dir dbt/jaffle_shop --profiles-dir "$DBT_PROFILES_DIR"

dagster dev -m my_orchestrator.definitions
```

If your profile already lives in `~/.dbt/profiles.yml`, you can usually omit `profiles_dir` from the resource configuration.

## Common Workflows

### Run only part of the dbt graph

Use dbt selection both when loading assets and when invoking dbt so Dagster's asset graph and the dbt command stay aligned:

```python
@dbt_assets(
    manifest=DBT_MANIFEST_PATH,
    select="tag:daily",
)
def daily_dbt_assets(
    context: dg.AssetExecutionContext,
    dbt: DbtCliResource,
):
    yield from dbt.cli(["build", "--select", "tag:daily"], context=context).stream()
```

### Pass dbt CLI flags directly

`DbtCliResource` executes real dbt CLI commands, so you can pass ordinary dbt flags such as `--target`:

```python
import os

@dbt_assets(manifest=DBT_MANIFEST_PATH)
def prod_dbt_assets(
    context: dg.AssetExecutionContext,
    dbt: DbtCliResource,
):
    target = os.environ.get("DBT_TARGET", "dev")
    yield from dbt.cli(["build", "--target", target], context=context).stream()
```

### Read dbt artifacts after a run

Keep the invocation object if you need dbt artifacts such as `run_results.json`:

```python
@dbt_assets(manifest=DBT_MANIFEST_PATH)
def jaffle_shop_with_artifacts(
    context: dg.AssetExecutionContext,
    dbt: DbtCliResource,
):
    invocation = dbt.cli(["build"], context=context)
    yield from invocation.stream()

    run_results = invocation.get_artifact("run_results.json")
    context.log.info(f"dbt produced {len(run_results['results'])} result entries")
```

## Configuration And Environment

`dagster-dbt` does not introduce a separate authentication system. Authentication belongs to dbt and the warehouse adapter you installed.

In practice:

- keep warehouse credentials in `profiles.yml`
- use environment variables referenced from `profiles.yml` for secrets
- point Dagster at the profile directory with `DBT_PROFILES_DIR` or `profiles_dir=...`
- keep the dbt project path stable and explicit with `project_dir=...`

Minimal example using environment variables through your dbt profile:

```yaml
# profiles.yml
jaffle_shop:
  target: dev
  outputs:
    dev:
      type: duckdb
      path: "{{ env_var('DBT_DUCKDB_PATH', 'jaffle_shop.duckdb') }}"
      threads: 4
```

```bash
export DBT_DUCKDB_PATH="$PWD/dbt/jaffle_shop/jaffle_shop.duckdb"
export DBT_PROFILES_DIR="$PWD/dbt/jaffle_shop"
```

## Common Pitfalls

- Missing or stale `manifest.json`. Re-run `dbt parse` or `dbt build` after changing models, sources, or packages.
- Missing dbt adapter package. `DbtCliResource` shells out to `dbt`, so a usable adapter must already be installed.
- Wrong profile directory. If Dagster cannot find `profiles.yml`, set `DBT_PROFILES_DIR` explicitly or pass `profiles_dir` to `DbtCliResource`.
- Forgetting `context=context` in `dbt.cli(...)`. Pass the Dagster execution context when running dbt from asset functions.
- Mismatched selection logic. If `@dbt_assets(select=...)` and the dbt CLI `--select` flags do not match, Dagster's loaded asset set and executed dbt nodes can drift apart.
- Treating `dagster-dbt` as a replacement for dbt setup. You still need normal dbt project files, packages, profiles, and adapter configuration.

## Version Notes For `0.28.18`

- `dagster-dbt==0.28.18` belongs to the Dagster `1.12.18` release line; keep Dagster packages on the matching version line in the same environment.
- For new code, prefer the `@dbt_assets(...)` plus `DbtCliResource` workflow shown in the current Dagster docs.
- Runtime behavior still depends on the dbt CLI and adapter resolved in your environment, so keep your dbt adapter set consistent across local development and deployment.

## Official Sources

- https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-dbt
- https://docs.dagster.io/api/python-api/libraries/dagster-dbt
- https://docs.dagster.io/integrations/libraries/dbt
- https://pypi.org/project/dagster-dbt/
