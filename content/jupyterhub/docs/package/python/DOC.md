---
name: package
description: "JupyterHub package guide for Python with install, proxy setup, jupyterhub_config.py, authentication, spawners, and Hub API usage"
metadata:
  languages: "python"
  versions: "5.4.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "jupyterhub,jupyter,python,multi-user,auth,spawner,proxy,notebooks"
---

# jupyterhub Python Package Guide

## Golden Rule

Treat `jupyterhub` as a multi-user Jupyter application and service, not as a normal import-and-call Python library. Most real work happens through the `jupyterhub` CLI, a `jupyterhub_config.py` file, the proxy, the authenticator, the spawner, and the Hub REST API.

## Install

For a basic local setup, install JupyterHub itself, a single-user UI such as JupyterLab, and the default proxy implementation:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "jupyterhub==5.4.3" jupyterlab requests
npm install -g configurable-http-proxy
```

Why these pieces matter:

- `jupyterhub` runs the Hub service
- `jupyterlab` gives spawned users a browser UI at `/lab`
- `configurable-http-proxy` is the default proxy JupyterHub expects on `PATH`
- `requests` is only needed if you want to call the Hub REST API from Python

Useful sanity checks:

```bash
jupyterhub --version
configurable-http-proxy --version
python -m pip show jupyterhub
python -m pip show jupyterlab
```

If `configurable-http-proxy` is missing, JupyterHub will not finish starting even if the Python package installed correctly.

## Minimal Local Setup

Generate a starter config:

```bash
mkdir jupyterhub-demo
cd jupyterhub-demo
jupyterhub --generate-config
```

For a simple local test that does not require pre-created system users, use the built-in dummy authenticator plus the simple spawner:

```python
# jupyterhub_config.py
import os

from jupyterhub.auth import DummyAuthenticator
from jupyterhub.spawner import SimpleLocalProcessSpawner


c.JupyterHub.bind_url = os.environ.get("JUPYTERHUB_BIND_URL", "http://127.0.0.1:8000")
c.JupyterHub.authenticator_class = DummyAuthenticator
c.JupyterHub.spawner_class = SimpleLocalProcessSpawner
c.Authenticator.allow_all = True
c.DummyAuthenticator.password = os.environ.get("JUPYTERHUB_DUMMY_PASSWORD", "change-me")
c.Spawner.default_url = "/lab"
```

Start the Hub:

```bash
export JUPYTERHUB_DUMMY_PASSWORD='dev-password'
jupyterhub -f jupyterhub_config.py
```

Then open `http://127.0.0.1:8000`, enter any username, and use the shared password from `JUPYTERHUB_DUMMY_PASSWORD`.

This setup is for local development only. `DummyAuthenticator` is intentionally weak and should not be used for a public or shared deployment.

## Authentication, Users, And Admins

JupyterHub 5 requires explicit access policy. For a real deployment, do not rely on a dummy login flow. Configure a real authenticator and decide who is allowed to sign in.

Minimal allowlist example:

```python
# jupyterhub_config.py
c.Authenticator.allowed_users = {"alice", "bob"}
c.JupyterHub.admin_users = {"alice"}
```

Important behavior:

- `allowed_users` limits who can log in
- `admin_users` grants admin privileges, but you should still define login policy explicitly
- `allow_all = True` is convenient for local testing, not for production

If you need external identity providers or non-local user environments, install the relevant authenticator or spawner package separately and point JupyterHub at that class. JupyterHub core does not bundle every production integration.

## Choose The User Interface

JupyterHub launches single-user servers; the notebook UI comes from packages installed in the single-user environment.

Send users to JupyterLab by default:

```python
c.Spawner.default_url = "/lab"
```

Or send them to the classic tree view:

```python
c.Spawner.default_url = "/tree"
```

If you set `"/lab"` but the spawned environment does not have `jupyterlab` installed, users will authenticate successfully and still land on a broken or missing interface.

## Hub API From Python

JupyterHub exposes a REST API under `/hub/api`. For external scripts or services, authenticate with an API token and send the token in the `Authorization` header.

Environment:

```bash
export JUPYTERHUB_URL='http://127.0.0.1:8000'
export JUPYTERHUB_API_TOKEN='replace-with-a-real-token'
```

Example: list users and inspect one user record:

```python
import os

import requests


hub_url = os.environ["JUPYTERHUB_URL"].rstrip("/")
api_token = os.environ["JUPYTERHUB_API_TOKEN"]

headers = {
    "Authorization": f"token {api_token}",
}

users_response = requests.get(
    f"{hub_url}/hub/api/users",
    headers=headers,
    timeout=30,
)
users_response.raise_for_status()
print(users_response.json())

user_response = requests.get(
    f"{hub_url}/hub/api/users/alice",
    headers=headers,
    timeout=30,
)
user_response.raise_for_status()
print(user_response.json())
```

If your Python code runs as a managed JupyterHub service, prefer the service-specific environment variables JupyterHub provides:

```python
import os

import requests


api_url = os.environ["JUPYTERHUB_API_URL"].rstrip("/")
api_token = os.environ["JUPYTERHUB_API_TOKEN"]

response = requests.get(
    f"{api_url}/users",
    headers={"Authorization": f"token {api_token}"},
    timeout=30,
)
response.raise_for_status()
print(response.json())
```

That pattern is the cleanest way to talk back to the Hub from an app or service that JupyterHub already manages.

## Production-Leaning Configuration

For a more realistic starting point, move sensitive values into environment variables and persist the Hub database and cookie secret across restarts:

```python
# jupyterhub_config.py
import os


c.JupyterHub.bind_url = os.environ.get("JUPYTERHUB_BIND_URL", "http://127.0.0.1:8000")
c.JupyterHub.cookie_secret_file = os.environ.get(
    "JUPYTERHUB_COOKIE_SECRET_FILE",
    "jupyterhub_cookie_secret",
)
c.JupyterHub.db_url = os.environ.get(
    "JUPYTERHUB_DB_URL",
    "sqlite:///jupyterhub.sqlite",
)
c.Authenticator.allowed_users = {"alice", "bob"}
c.JupyterHub.admin_users = {"alice"}
c.Spawner.default_url = "/lab"
```

Example environment:

```bash
export JUPYTERHUB_BIND_URL='http://127.0.0.1:8000'
export JUPYTERHUB_COOKIE_SECRET_FILE='/srv/jupyterhub/jupyterhub_cookie_secret'
export JUPYTERHUB_DB_URL='sqlite:////srv/jupyterhub/jupyterhub.sqlite'
```

SQLite is fine for local development and small single-node installs. For production, confirm the database backend, reverse proxy, TLS, and authenticator choices against the deployment model you actually run.

## Common Pitfalls

- Installing `jupyterhub` without `configurable-http-proxy`. The Hub needs a working proxy command on `PATH` unless you deliberately replace the default proxy.
- Using `DummyAuthenticator` outside local development. It is useful for testing, not for real authentication.
- Forgetting JupyterHub 5 access policy changes. If you do not set `allow_all`, `allowed_users`, or another explicit allow rule, logins can fail even when the authenticator itself is working.
- Assuming the Hub environment and the single-user environment are the same. If users should land in JupyterLab, the spawned environment needs `jupyterlab` installed.
- Copying very old blog posts that configure only `ip` and `port`. Prefer `bind_url` in new setups.
- Treating default local process spawning as a container or Kubernetes solution. For isolated user environments, install the correct spawner integration instead of forcing the local-process defaults.
- Exposing JupyterHub on a public interface without deliberate auth and TLS configuration.

## Version-Sensitive Notes For 5.4.3

- JupyterHub 5 has stricter access defaults than older examples many agents still copy. Review `allow_all`, `allowed_users`, and related access-control settings before assuming a login flow is correct.
- `5.4.3` is a patch release in the JupyterHub 5 line, so prioritize JupyterHub 5 documentation and examples over older 1.x or 2.x tutorials.
- For new configuration, prefer `bind_url`-based examples and current authenticator/spawner guidance instead of outdated snippets that assume a simpler single-binary setup.

## Official Sources

- JupyterHub docs root: `https://jupyterhub.readthedocs.io/en/latest/`
- PyPI package page: `https://pypi.org/project/jupyterhub/`
