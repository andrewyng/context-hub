---
name: package
description: "Jupyter Server package guide for Python with install, launch, authentication, configuration, and REST API usage"
metadata:
  languages: "python"
  versions: "2.17.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "jupyter,jupyter-server,python,server,notebook,rest-api"
---

# jupyter-server Python Package Guide

## Golden Rule

Treat `jupyter-server` as the backend web application and REST server behind Jupyter frontends, not as a notebook UI package and not as a small import-and-call helper library. Install it in the same environment as the kernels and server extensions you want to expose, start it with the `jupyter server` CLI, and configure it with `ServerApp` settings.

If you need a full browser UI for editing notebooks and files, install `jupyterlab` or `notebook` on top of Jupyter Server instead of expecting `jupyter-server` alone to replace those applications.

## Install

Use a virtual environment unless you intentionally manage Jupyter globally:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "jupyter-server==2.17.0"
```

Useful sanity checks:

```bash
jupyter server --help
jupyter --paths
python -m pip show jupyter-server
```

If you want to call the REST API from Python, install `requests` in the same environment:

```bash
python -m pip install requests
```

## Start And Reconnect To A Server

Start a server in the current directory:

```bash
jupyter server
```

Start without opening a browser and pin the root directory explicitly:

```bash
jupyter server --no-browser --ServerApp.root_dir="$PWD" --ServerApp.port=8888
```

List running servers and reconnect URLs:

```bash
jupyter server list
```

By default, Jupyter Server prints a URL containing an auth token. For local development, that tokenized URL is the normal way to connect from a browser or API client.

The server root is the current working directory unless you set `ServerApp.root_dir`, so launch from the directory you actually want exposed or set the root explicitly.

## Configuration And Authentication

Generate a config file:

```bash
export JUPYTER_CONFIG_DIR="$PWD/.jupyter"
jupyter server --generate-config
```

Important settings usually live in `jupyter_server_config.py` or `jupyter_server_config.json`.

Settings agents and deployment scripts usually need to review:

- `c.ServerApp.ip`
- `c.ServerApp.port`
- `c.ServerApp.open_browser`
- `c.ServerApp.root_dir`
- `c.ServerApp.base_url`
- `c.ServerApp.token`
- `c.ServerApp.password`
- `c.ServerApp.certfile`
- `c.ServerApp.keyfile`

Minimal local configuration:

```python
c.ServerApp.ip = "127.0.0.1"
c.ServerApp.port = 8888
c.ServerApp.open_browser = False
c.ServerApp.root_dir = "/path/to/project"
```

### Token and password behavior

Jupyter Server uses token authentication by default. The startup log shows a tokenized URL you can paste into a browser or use from an API client.

Set a password interactively:

```bash
jupyter server password
```

That command writes password configuration to `jupyter_server_config.json`. In practice, JSON config values take precedence over the Python config file, so check both files if a password, token, or other setting seems to be ignored.

To generate a hashed password in Python:

```python
from jupyter_server.auth import passwd

hashed = passwd("replace-me")
print(hashed)
```

Once you set a password, do not treat the server as safe for remote access unless TLS and network controls are also in place.

### Remote single-user servers

For a remote server, you usually need all of:

- `c.ServerApp.ip = "0.0.0.0"` or another deliberate bind address
- an explicit token or password strategy
- TLS via `certfile` and `keyfile` or a trusted reverse proxy in front of the server
- `c.ServerApp.base_url` if the server is mounted under a subpath

Jupyter Server's public-server guidance is for a single-user server. If multiple users need separate sessions and isolation, use JupyterHub instead of exposing one shared Jupyter Server instance directly.

## Call The REST API From Python

For scripts and agents, the cleanest way to automate Jupyter Server is usually the REST API.

Set connection details from the running server output:

```bash
export JUPYTER_SERVER_URL="http://127.0.0.1:8888"
export JUPYTER_TOKEN="paste-the-token-from-jupyter-server-output"
```

### List files at the server root

```python
import os

import requests

base_url = os.environ["JUPYTER_SERVER_URL"].rstrip("/")
token = os.environ["JUPYTER_TOKEN"]

session = requests.Session()
session.headers.update({"Authorization": f"token {token}"})

response = session.get(f"{base_url}/api/contents")
response.raise_for_status()

root = response.json()
for entry in root["content"]:
    print(entry["path"], entry["type"])
```

### Create or overwrite a text file

```python
import os

import requests

base_url = os.environ["JUPYTER_SERVER_URL"].rstrip("/")
token = os.environ["JUPYTER_TOKEN"]

session = requests.Session()
session.headers.update({"Authorization": f"token {token}"})

payload = {
    "type": "file",
    "format": "text",
    "content": "hello from jupyter-server\n",
}

response = session.put(f"{base_url}/api/contents/notes.txt", json=payload)
response.raise_for_status()

print(response.json()["path"])
```

Those two calls cover a large share of automation work: connect with a token, inspect the exposed workspace, and write files through the Contents API instead of trying to drive a browser session.

## Extensions And Server-Side Integrations

If you are writing custom handlers, auth helpers, or other server-side integrations, use `jupyter_server.*` imports and extension patterns rather than older `notebook.*` examples.

Common operational commands:

```bash
jupyter server extension list
jupyter server extension enable my_extension
```

If an extension package still documents old `NotebookApp` settings or old notebook-module imports, treat that guidance cautiously and check the current Jupyter Server developer docs before copying it into new code.

## Common Pitfalls

- Installing `jupyter-server` and expecting it to provide the full JupyterLab or Notebook user interface by itself.
- Launching from the wrong directory and accidentally exposing the wrong files because `root_dir` was never set.
- Copying old `NotebookApp` configuration or `notebook.*` imports into new Jupyter Server code.
- Setting a password with `jupyter server password`, then editing only `jupyter_server_config.py` and wondering why the change does not apply.
- Binding to a public interface without deliberate auth, TLS, and proxy configuration.
- Treating one Jupyter Server process as a general multi-user deployment. For isolated multi-user access, use JupyterHub.

## Version-Sensitive Notes For 2.17.0

- This guide targets `jupyter-server 2.17.0`.
- Prefer `ServerApp` configuration names in new automation and docs. Older `NotebookApp` examples are common in blogs and issue threads, but they are not the best source for current Jupyter Server setup.
- If you are building extensions or auth integrations, favor current Jupyter Server developer docs over pre-2.x notebook-era examples.

## Official Sources

- Jupyter Server docs root: `https://jupyter-server.readthedocs.io/en/latest/`
- Jupyter Server security docs: `https://jupyter-server.readthedocs.io/en/stable/operators/security.html`
- Jupyter Server public-server docs: `https://jupyter-server.readthedocs.io/en/stable/operators/public-server.html`
- Jupyter Server REST API docs: `https://jupyter-server.readthedocs.io/en/stable/developers/rest-api.html`
- Jupyter Server developer docs: `https://jupyter-server.readthedocs.io/en/stable/developers/extensions.html`
- Jupyter running docs: `https://docs.jupyter.org/en/latest/running.html`
- PyPI package page: `https://pypi.org/project/jupyter-server/2.17.0/`
