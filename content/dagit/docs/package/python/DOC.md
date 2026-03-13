---
name: package
description: "dagit Python package guide for Dagster OSS local web UI setup and legacy package compatibility"
metadata:
  languages: "python"
  versions: "1.12.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagit,dagster,python,web-ui,orchestration,assets"
---

# dagit Python Package Guide

## Golden Rule

If you inherit `dagit` in an older Dagster environment, keep it on the exact same release line as the rest of your Dagster packages. For new local OSS setup on `1.12.18`, follow the current Dagster workflow built around `dagster`, `dagster-webserver`, and `dagster dev`, with a loadable module that exposes a top-level `defs = dg.Definitions(...)` object.

## Install

If an existing project already pins `dagit`, keep the package aligned with core Dagster:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagit==1.12.18"
```

For a fresh local setup on the same release line, prefer the packages used by the current Dagster OSS docs:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-dg-cli==1.12.18"
```

Common alternatives:

```bash
uv add dagster dagster-webserver dagster-dg-cli
poetry add "dagster==1.12.18" "dagster-webserver==1.12.18" "dagster-dg-cli==1.12.18"
```

## Minimal Project Shape

The important requirement is a loadable Python module with a top-level `Definitions` object.

```text
src/
  my_project/
    __init__.py
    definitions.py
```

```python
import dagster as dg

@dg.asset
def hello() -> str:
    return "hello"

defs = dg.Definitions(assets=[hello])
```

## Environment And Instance State

Use a shared `DAGSTER_HOME` directory for the local instance state that the web UI, daemon, and other Dagster processes should see:

```bash
export DAGSTER_HOME="$PWD/.dagster"
mkdir -p "$DAGSTER_HOME"
```

There is no separate package-level auth step for local OSS usage. If you expose the UI remotely, handle authentication and network access at the deployment edge and keep every cooperating Dagster process pointed at the same `DAGSTER_HOME`.

## Start The Local UI

For the current `1.12.18` release line, the lowest-friction local command is:

```bash
dagster dev -m my_project.definitions
```

That command loads `defs` from `my_project.definitions`, starts the local web UI, and uses your current `DAGSTER_HOME`.

If your project also uses schedules or sensors, run the daemon against the same instance directory:

```bash
dagster-daemon run
```

## Common Workflow

### Add assets and resources

```python
import dagster as dg

class ApiResource(dg.ConfigurableResource):
    token: str

    def fetch(self) -> list[str]:
        return ["a", "b", "c"]

@dg.asset
def raw_items(api: ApiResource) -> list[str]:
    return api.fetch()

@dg.asset
def item_count(raw_items: list[str]) -> int:
    return len(raw_items)

defs = dg.Definitions(
    assets=[raw_items, item_count],
    resources={"api": ApiResource(token=dg.EnvVar("API_TOKEN"))},
)
```

```bash
export API_TOKEN="dev-token"
dagster dev -m my_project.definitions
```

This is the practical pattern to keep in mind: define assets, register resources in `Definitions`, and let the web UI load that module.

### Validate definitions before opening the UI

```bash
dg check defs -m my_project.definitions
```

Use this when you want a faster failure mode than opening the UI first.

## Common Pitfalls

- Mixing Dagster package versions. Keep `dagster`, `dagit`, `dagster-webserver`, and related Dagster packages on the same release line.
- Exposing helper functions but not a top-level `defs = dg.Definitions(...)` object. The local tooling needs a loadable definitions target.
- Using different `DAGSTER_HOME` values for the web UI and daemon. That splits run history, schedules, and other instance state.
- Copying older Dagster examples without translating them to the current `Definitions` and asset-oriented workflow.
- Looking for `dagit`-specific setup in newer Dagster docs. For `1.12.18`, the maintained local workflow is documented around `dagster dev` and `dagster-webserver`.

## Version-Sensitive Notes For 1.12.18

- This guide targets the `dagit` PyPI release `1.12.18`.
- The surrounding Dagster `1.12.18` package guides and CLI docs center on `dagster-webserver` and `dagster dev` for local OSS development.
- If you are keeping `dagit` in an existing environment, pin it with the rest of the Dagster stack instead of upgrading it independently.

## Official Sources Used

- Dagster monorepo: https://github.com/dagster-io/dagster
- Dagster docs root: https://docs.dagster.io/
- Dagster API docs root: https://docs.dagster.io/api
- Definitions API: https://docs.dagster.io/api/dagster/definitions
- CLI reference: https://docs.dagster.io/api/clis
- Dagster releases: https://github.com/dagster-io/dagster/releases
- PyPI `dagit` page: https://pypi.org/project/dagit/
- PyPI `dagster-webserver` page: https://pypi.org/project/dagster-webserver/
