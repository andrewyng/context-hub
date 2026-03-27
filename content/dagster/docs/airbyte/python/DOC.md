---
name: airbyte
description: "dagster-airbyte package guide for modeling Airbyte connections as Dagster assets and triggering Airbyte syncs from Dagster"
metadata:
  languages: "python"
  versions: "0.28.14"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,airbyte,dagster-airbyte,python,data-orchestration,etl,assets"
---

# dagster-airbyte Python Package Guide

## Golden Rule

For new Dagster projects, start with `AirbyteWorkspaceComponent`. If you need direct Python control inside `Definitions`, use `AirbyteCloudWorkspace` for Airbyte Cloud or `AirbyteWorkspace` for Airbyte OSS / Self-Managed, then build assets with `build_airbyte_assets_definitions(...)` or `load_airbyte_asset_specs(...)`.

Do not start new work on the superseded `AirbyteResource`, `AirbyteCloudResource`, or `load_assets_from_airbyte_instance(...)` APIs.

## Install

Install `dagster-airbyte` with the Dagster packages used by your code location:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-airbyte==0.28.14"
```

Equivalent `uv` install:

```bash
uv add dagster dagster-webserver dagster-airbyte
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-airbyte
```

## Prerequisites

Before wiring Airbyte into Dagster, make sure you already have:

- a Dagster project with a loadable top-level `defs = dg.Definitions(...)`
- an Airbyte workspace with at least one configured connection
- the Airbyte workspace ID
- either Airbyte Cloud client credentials or the auth method for your self-managed Airbyte deployment

For self-managed Airbyte, you also need both API base URLs:

- REST API: `https://<airbyte-host>/api/public/v1`
- Configuration API: `https://<airbyte-host>/api/v1`

## Environment Variables

Airbyte Cloud:

```bash
export AIRBYTE_CLOUD_WORKSPACE_ID="your-workspace-id"
export AIRBYTE_CLOUD_CLIENT_ID="your-client-id"
export AIRBYTE_CLOUD_CLIENT_SECRET="your-client-secret"
```

Airbyte OSS or Self-Managed with OAuth client credentials:

```bash
export AIRBYTE_REST_API_BASE_URL="http://localhost:8000/api/public/v1"
export AIRBYTE_CONFIGURATION_API_BASE_URL="http://localhost:8000/api/v1"
export AIRBYTE_WORKSPACE_ID="your-workspace-id"
export AIRBYTE_CLIENT_ID="your-client-id"
export AIRBYTE_CLIENT_SECRET="your-client-secret"
```

Airbyte OSS or Self-Managed with basic auth:

```bash
export AIRBYTE_REST_API_BASE_URL="http://localhost:8000/api/public/v1"
export AIRBYTE_CONFIGURATION_API_BASE_URL="http://localhost:8000/api/v1"
export AIRBYTE_WORKSPACE_ID="your-workspace-id"
export AIRBYTE_USERNAME="airbyte"
export AIRBYTE_PASSWORD="your-password"
```

## Preferred Setup For New Projects: `AirbyteWorkspaceComponent`

Dagster recommends the component workflow for new projects.

Scaffold the component:

```bash
dg scaffold defs dagster_airbyte.AirbyteWorkspaceComponent airbyte_ingest \
  --workspace-id test_workspace \
  --client-id "{{ env.AIRBYTE_CLIENT_ID }}" \
  --client-secret "{{ env.AIRBYTE_CLIENT_SECRET }}"
```

That creates a `defs.yaml` file like this for Airbyte Cloud:

```yaml
type: dagster_airbyte.AirbyteWorkspaceComponent
attributes:
  workspace:
    workspace_id: test_workspace
    client_id: "{{ env.AIRBYTE_CLIENT_ID }}"
    client_secret: "{{ env.AIRBYTE_CLIENT_SECRET }}"
```

For Airbyte OSS or Self-Managed, include both API URLs:

```yaml
type: dagster_airbyte.AirbyteWorkspaceComponent
attributes:
  workspace:
    rest_api_base_url: http://localhost:8000/api/public/v1
    configuration_api_base_url: http://localhost:8000/api/v1
    workspace_id: test_workspace
    client_id: "{{ env.AIRBYTE_CLIENT_ID }}"
    client_secret: "{{ env.AIRBYTE_CLIENT_SECRET }}"
```

Inspect what Dagster loaded:

```bash
dg list defs
```

## Load All Airbyte Cloud Assets In Python

If you want direct Python definitions instead of the component YAML workflow, create an `AirbyteCloudWorkspace` resource and let Dagster build the assets for every connection in the workspace.

```python
import dagster as dg
from dagster_airbyte import AirbyteCloudWorkspace, build_airbyte_assets_definitions


airbyte_workspace = AirbyteCloudWorkspace(
    workspace_id=dg.EnvVar("AIRBYTE_CLOUD_WORKSPACE_ID"),
    client_id=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_ID"),
    client_secret=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_SECRET"),
)

airbyte_assets = build_airbyte_assets_definitions(workspace=airbyte_workspace)

defs = dg.Definitions(
    assets=airbyte_assets,
    resources={"airbyte": airbyte_workspace},
)
```

Important details:

- `AirbyteCloudWorkspace` uses the Airbyte Cloud API defaults; you do not pass custom base URLs.
- `resources={"airbyte": airbyte_workspace}` is the resource binding that `dagster-airbyte` expects for materialization.
- `build_airbyte_assets_definitions(...)` creates materializable assets for all connections returned from the workspace.

## Load All Airbyte OSS / Self-Managed Assets In Python

Use `AirbyteWorkspace` when Dagster needs to talk to a self-managed Airbyte deployment.

```python
import dagster as dg
from dagster_airbyte import AirbyteWorkspace, build_airbyte_assets_definitions


airbyte_workspace = AirbyteWorkspace(
    rest_api_base_url=dg.EnvVar("AIRBYTE_REST_API_BASE_URL"),
    configuration_api_base_url=dg.EnvVar("AIRBYTE_CONFIGURATION_API_BASE_URL"),
    workspace_id=dg.EnvVar("AIRBYTE_WORKSPACE_ID"),
    client_id=dg.EnvVar("AIRBYTE_CLIENT_ID"),
    client_secret=dg.EnvVar("AIRBYTE_CLIENT_SECRET"),
)

airbyte_assets = build_airbyte_assets_definitions(workspace=airbyte_workspace)

defs = dg.Definitions(
    assets=airbyte_assets,
    resources={"airbyte": airbyte_workspace},
)
```

If your Airbyte deployment uses basic auth instead of OAuth, replace `client_id` and `client_secret` with:

```python
username=dg.EnvVar("AIRBYTE_USERNAME"),
password=dg.EnvVar("AIRBYTE_PASSWORD"),
```

## Load Asset Specs Without Materialization Logic

Use `load_airbyte_asset_specs(...)` when you only want asset specs from the workspace and do not need Dagster to generate the sync materialization definitions for every connection.

```python
import dagster as dg
from dagster_airbyte import AirbyteCloudWorkspace, load_airbyte_asset_specs


airbyte_workspace = AirbyteCloudWorkspace(
    workspace_id=dg.EnvVar("AIRBYTE_CLOUD_WORKSPACE_ID"),
    client_id=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_ID"),
    client_secret=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_SECRET"),
)

airbyte_specs = load_airbyte_asset_specs(airbyte_workspace)

defs = dg.Definitions(assets=airbyte_specs)
```

This is also the API to use if you want to filter which connections become assets:

```python
airbyte_specs = load_airbyte_asset_specs(
    workspace=airbyte_workspace,
    connection_selector_fn=lambda connection: connection.name in ["salesforce", "stripe"],
)
```

## Sync One Connection With Custom Logic

Use the `@airbyte_assets` decorator when you want to wrap a single Airbyte connection with your own logic before or after the sync.

```python
import dagster as dg
from dagster_airbyte import AirbyteCloudWorkspace, airbyte_assets


airbyte_workspace = AirbyteCloudWorkspace(
    workspace_id=dg.EnvVar("AIRBYTE_CLOUD_WORKSPACE_ID"),
    client_id=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_ID"),
    client_secret=dg.EnvVar("AIRBYTE_CLOUD_CLIENT_SECRET"),
)


@airbyte_assets(
    connection_id="your-connection-id",
    workspace=airbyte_workspace,
    name="airbyte_connection_assets",
    group_name="airbyte",
)
def airbyte_connection_assets(
    context: dg.AssetExecutionContext, airbyte: AirbyteCloudWorkspace
):
    yield from airbyte.sync_and_poll(context=context)


defs = dg.Definitions(
    assets=[airbyte_connection_assets],
    resources={"airbyte": airbyte_workspace},
)
```

The exact runtime call that triggers and monitors the Airbyte sync is:

```python
yield from airbyte.sync_and_poll(context=context)
```

## Local Development Workflow

Validate the definitions and start Dagster against the module that exports your top-level `Definitions` object:

```bash
dg check defs
dg dev -m my_project.definitions
```

## Common Pitfalls

- For Airbyte OSS or Self-Managed, `AirbyteWorkspace` needs both `rest_api_base_url` and `configuration_api_base_url`. Passing only one endpoint is not enough.
- Pick one auth mode per self-managed workspace: `client_id` and `client_secret`, or `username` and `password`, or no auth. The resource validation rejects mixed auth configuration.
- `load_airbyte_cloud_asset_specs(...)` is superseded. Use `load_airbyte_asset_specs(...)` instead.
- `AirbyteResource`, `AirbyteCloudResource`, and `load_assets_from_airbyte_instance(...)` are superseded for newer Airbyte versions. Use the workspace APIs instead.
- The current Airbyte workspace APIs are marked beta in Dagster's docs, so minor-version upgrades can still introduce breaking changes.
- Keep the Dagster resource key aligned with the function parameter name you inject. If your asset function expects `airbyte`, register the resource as `resources={"airbyte": ...}`.

## Version Notes

- Dagster's current docs site exposes the maintained `dagster-airbyte` API surface described here.
- PyPI currently shows `dagster-airbyte 0.28.14` as the latest visible release, published on February 5, 2026. If you were handed a newer internal pin such as `0.28.18`, verify that it is actually published in the environment you deploy from before pinning it.

## Official Sources

- https://docs.dagster.io/integrations/libraries/airbyte
- https://docs.dagster.io/integrations/libraries/airbyte/airbyte-component
- https://docs.dagster.io/integrations/libraries/airbyte/airbyte-oss
- https://docs.dagster.io/integrations/libraries/airbyte/airbyte-cloud-legacy
- https://docs.dagster.io/integrations/libraries/airbyte/migration-guide
- https://docs.dagster.io/integrations/libraries/airbyte/dagster-airbyte
- https://raw.githubusercontent.com/dagster-io/dagster/master/python_modules/libraries/dagster-airbyte/dagster_airbyte/resources.py
- https://pypi.org/project/dagster-airbyte/
