---
name: package
description: "Dagster Webserver package guide for hosting the Dagster OSS UI, loading code locations, and configuring instance-backed deployments"
metadata:
  languages: "python"
  versions: "1.12.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,python,webserver,ui,graphql,orchestration"
---

# Dagster Webserver Package Guide

## Golden Rule

Use `dagster-webserver` as the process that hosts the Dagster OSS UI for an already loadable Dagster code location. Your application logic still lives in `dagster` code such as a top-level `defs = dg.Definitions(...)` object; `dagster-webserver` is the server around that code and your Dagster instance.

If you only need the standard local developer workflow, `dagster dev` or `dg dev` is usually the simpler entrypoint. Reach for `dagster-webserver` when you need explicit control over host, port, path prefix, read-only mode, or workspace loading.

## Install

`dagster-webserver 1.12.18` requires Python `>=3.10,<3.15` and depends on the matching `dagster` and `dagster-graphql` release line.

Install the webserver with the same Dagster core version:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18"
```

If you want notebook rendering in the UI's notebook download endpoint, install the optional extra:

```bash
python -m pip install "dagster-webserver[notebook]==1.12.18"
```

## Minimal Code Location

The webserver needs a loadable Dagster module. For new code, use a top-level `Definitions` object:

```python
# src/my_project/definitions.py
import dagster as dg

@dg.asset
def hello() -> str:
    return "hello"

defs = dg.Definitions(assets=[hello])
```

The important part is that the module exposes a top-level symbol that Dagster can load.

## Start The Webserver

### Load a Python module directly

For a persistent Dagster instance, point `DAGSTER_HOME` at a real directory before starting the server:

```bash
export DAGSTER_HOME="$PWD/.dagster"
mkdir -p "$DAGSTER_HOME"

dagster-webserver -m my_project.definitions
```

What this does:

- loads the code location from `my_project.definitions`
- binds to `127.0.0.1` by default
- uses port `3000` by default
- falls back to another free port if `3000` is already in use

If `DAGSTER_HOME` is not set, the CLI creates a temporary instance directory under the current working directory and removes it when the process exits. That is fine for short local sessions, but run history and other instance state will not persist.

### Load from `workspace.yaml`

Use a workspace file when you want explicit code-location wiring or multiple code locations:

```yaml
# workspace.yaml
load_from:
  - python_module:
      module_name: my_project.definitions
      working_directory: .
      location_name: my-project
```

Then start the server with:

```bash
export DAGSTER_HOME="$PWD/.dagster"
mkdir -p "$DAGSTER_HOME"

dagster-webserver -w workspace.yaml
```

The workspace schema also supports `python_file`, `python_package`, and `grpc_server` targets.

### Legacy attribute loading

If you still load a legacy repository or job symbol instead of a top-level `Definitions` object, pass `-a`:

```bash
dagster-webserver -f path/to/repo.py -a define_repo
```

For new projects, prefer module loading with a top-level `defs` object.

## Environment Variables And Startup Options

The CLI supports environment variables prefixed with `DAGSTER_WEBSERVER_`.

Common setup:

```bash
export DAGSTER_HOME="$PWD/.dagster"
export DAGSTER_WEBSERVER_HOST="0.0.0.0"
export DAGSTER_WEBSERVER_PORT="3333"
export DAGSTER_WEBSERVER_LOG_LEVEL="info"

dagster-webserver -m my_project.definitions
```

Useful options:

- `--host` / `-h` changes the bind address; default is `127.0.0.1`
- `--port` / `-p` changes the port; default is `3000`
- `--path-prefix` / `-l` hosts the UI under a subpath such as `/dagster`
- `--read-only` disables mutations such as launching runs and toggling schedules
- `--uvicorn-log-level` controls the ASGI server logs
- `--dagster-log-level` controls Dagster log events
- `--live-data-poll-rate` changes UI polling frequency in milliseconds

The CLI also maps legacy `DAGIT_*` environment variables to `DAGSTER_WEBSERVER_*` for backward compatibility, but the `dagit` command and that environment-variable prefix are deprecated for Dagster `2.0`.

## Verify The Server From Python

`dagster-webserver` exposes a simple JSON endpoint at `/server_info`. This is a safe way to confirm that the process is up and that the package versions match what you expect:

```python
import json
from urllib.request import urlopen

with urlopen("http://127.0.0.1:3000/server_info") as response:
    info = json.load(response)

print(info["dagster_webserver_version"])
print(info["dagster_version"])
print(info["dagster_graphql_version"])
```

The server also exposes `/graphql` over HTTP and WebSocket for the UI and GraphQL-based automation.

## Common Workflows

### Run behind a reverse proxy

When the UI is hosted under a subpath, set `--path-prefix` to the external mount point:

```bash
dagster-webserver \
  -m my_project.definitions \
  --host 0.0.0.0 \
  --port 3000 \
  --path-prefix /dagster
```

The prefix must start with `/` and must not end with `/`.

### Expose a read-only UI

For environments where users should inspect runs but not launch new ones or modify schedules, start the server in read-only mode:

```bash
dagster-webserver -w workspace.yaml --read-only
```

### Rely on a local `.env` file

Dagster CLI startup loads environment variables from a `.env` file in the current working directory. That is useful for local credentials and instance settings without hard-coding secrets into your Dagster definitions.

Example:

```dotenv
# .env
DAGSTER_HOME=/absolute/path/to/.dagster
DAGSTER_WEBSERVER_PORT=3333
MY_API_TOKEN=replace-me
```

Then start the server from that directory:

```bash
dagster-webserver -m my_project.definitions
```

## Common Pitfalls

- Forgetting that the server only hosts a code location. Your module still needs a loadable top-level Dagster definition, usually `defs = dg.Definitions(...)`.
- Starting without `DAGSTER_HOME` and assuming instance state will persist. Without it, the CLI uses a temporary instance directory that is deleted on exit.
- Using different `DAGSTER_HOME` directories for cooperating processes. If your webserver and daemon should share run history or scheduler state, point them at the same instance.
- Passing an invalid path prefix. The prefix must begin with `/` and cannot end with `/`.
- Mixing Dagster package versions. `dagster-webserver 1.12.18` is built for `dagster 1.12.18` and `dagster-graphql 1.12.18`.
- Expecting notebook downloads to work without extras. The notebook endpoint requires `nbconvert`, which the package exposes through `dagster-webserver[notebook]`.

## Version Notes For `1.12.18`

- PyPI metadata for `dagster-webserver 1.12.18` declares Python support for `3.10` through `3.14`.
- The package depends on `dagster==1.12.18` and `dagster-graphql==1.12.18`, so keep the Dagster release line aligned in one environment.
- The `dagit` CLI name is still supported for backward compatibility, but the code warns that it will be removed in Dagster `2.0`. Use `dagster-webserver` for new scripts and docs.

## Official Sources Used

- https://pypi.org/project/dagster-webserver/
- https://github.com/dagster-io/dagster
- https://github.com/dagster-io/dagster/tree/master/python_modules/dagster-webserver
- https://docs.dagster.io/api/clis
- https://docs.dagster.io/api
- https://github.com/dagster-io/dagster/releases
