---
name: shell
description: "Google Cloud Shell Python client for starting environments, managing SSH keys, and authorizing gcloud access"
metadata:
  languages: "python"
  versions: "1.14.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,cloud-shell,gcp,ssh,shell,remote-development"
---

# Google Cloud Shell Python Client

## What It Is

`google-cloud-shell` is the Python client for the Cloud Shell API. Use it to inspect a user's Cloud Shell environment, start it, add or remove SSH public keys, and send OAuth credentials into the running environment so `gcloud` is already authorized.

This package does not run shell commands for you. The API gives you environment metadata such as `web_host`, `ssh_username`, `ssh_host`, and `ssh_port`; you still connect with your own SSH or web client.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-shell==1.14.0"
```

Common alternatives:

```bash
uv add "google-cloud-shell==1.14.0"
poetry add "google-cloud-shell==1.14.0"
```

The current Google Cloud library docs and PyPI metadata list Python 3.7+ support, including Python 3.14.

## Authentication And Setup

Cloud Shell uses Application Default Credentials (ADC). For local development, sign in with `gcloud`:

```bash
gcloud auth application-default login
```

Optional environment variables:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/credentials.json"
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE=google
```

Notes:

- `GOOGLE_APPLICATION_CREDENTIALS` lets ADC load a credential file explicitly.
- Google recommends avoiding long-lived service account keys when possible.
- `GOOGLE_SDK_PYTHON_LOGGING_SCOPE` enables the default Google client-library log handler.

Cloud Shell environment names are user-scoped, not project-scoped. The default environment is typically:

```text
users/me/environments/default
```

## Initialize The Client

```python
from google.cloud import shell_v1

client = shell_v1.CloudShellServiceClient()
environment_name = client.environment_path("me", "default")
```

If you need explicit credentials:

```python
import google.auth
from google.cloud import shell_v1

credentials, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)

client = shell_v1.CloudShellServiceClient(credentials=credentials)
environment_name = client.environment_path("me", "default")
```

## Common Workflows

### Get the current environment

```python
from google.cloud import shell_v1

client = shell_v1.CloudShellServiceClient()
environment_name = client.environment_path("me", "default")

environment = client.get_environment(request={"name": environment_name})

print(environment.name)
print(environment.state)
print(environment.web_host)
print(environment.ssh_username)
print(environment.ssh_host)
print(environment.ssh_port)
```

The returned `Environment` includes the SSH and WSS connection targets for the running environment, plus the currently registered public keys.

### Start the environment and pre-authorize `gcloud`

`start_environment` is a long-running operation. Wait on `.result()` before using the connection fields.

```python
from pathlib import Path

import google.auth
from google.auth.transport.requests import Request
from google.cloud import shell_v1

credentials, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
credentials.refresh(Request())

client = shell_v1.CloudShellServiceClient(credentials=credentials)
environment_name = client.environment_path("me", "default")
public_key = Path.home().joinpath(".ssh/id_rsa.pub").read_text().strip()

operation = client.start_environment(
    request={
        "name": environment_name,
        "access_token": credentials.token,
        "public_keys": [public_key],
    }
)

response = operation.result(timeout=300)
environment = response.environment

print(environment.web_host)
print(environment.ssh_username)
print(environment.ssh_host)
print(environment.ssh_port)
```

`access_token` is optional, but if you pass a valid token the environment is pre-authenticated so the user can run `gcloud` commands without logging in again inside Cloud Shell.

### Connect over SSH after startup

After `start_environment` completes, connect with the private key that matches one of the environment's public keys:

```bash
ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}"
```

In Python, the values come from the `Environment` returned by `get_environment()` or `start_environment()`:

```python
ssh_user = environment.ssh_username
ssh_host = environment.ssh_host
ssh_port = environment.ssh_port
```

### Add a public key later

Use `add_public_key` when the environment already exists and you need to allow another SSH keypair.

```python
from pathlib import Path

from google.cloud import shell_v1

client = shell_v1.CloudShellServiceClient()
environment_name = client.environment_path("me", "default")
public_key = Path.home().joinpath(".ssh/id_rsa.pub").read_text().strip()

operation = client.add_public_key(
    request={
        "environment": environment_name,
        "key": public_key,
    }
)

response = operation.result(timeout=60)
print(response.key)
```

Supported key formats in the request docs are `ssh-dss`, `ssh-rsa`, and the `ecdsa-sha2-*` variants.

### Remove a public key

```python
from pathlib import Path

from google.cloud import shell_v1

client = shell_v1.CloudShellServiceClient()
environment_name = client.environment_path("me", "default")
public_key = Path.home().joinpath(".ssh/id_rsa.pub").read_text().strip()

operation = client.remove_public_key(
    request={
        "environment": environment_name,
        "key": public_key,
    }
)

operation.result(timeout=60)
```

### Refresh Cloud Shell authorization without restarting it

If the environment is already running, use `authorize_environment` to push a fresh OAuth token instead of starting it again.

```python
from datetime import datetime, timedelta, timezone

import google.auth
from google.auth.transport.requests import Request
from google.cloud import shell_v1
from google.protobuf import timestamp_pb2

credentials, _ = google.auth.default(
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
credentials.refresh(Request())

expire_time = timestamp_pb2.Timestamp()
expire_time.FromDatetime(
    datetime.now(timezone.utc) + timedelta(minutes=55)
)

client = shell_v1.CloudShellServiceClient(credentials=credentials)
environment_name = client.environment_path("me", "default")

operation = client.authorize_environment(
    request={
        "name": environment_name,
        "access_token": credentials.token,
        "expire_time": expire_time,
    }
)

operation.result(timeout=60)
```

The REST reference documents `id_token` as an additional optional field if your workflow also needs to send an ID token into the environment.

## Important Pitfalls

- Cloud Shell resource names are user-based, such as `users/me/environments/default`. Do not expect a `project=` argument on the client methods.
- `start_environment`, `add_public_key`, `remove_public_key`, and `authorize_environment` all return long-running operations. Wait for `.result()` before assuming the change is ready.
- SSH access only works if the private key on your machine matches one of the environment's registered public keys.
- The API surface is intentionally small: get, start, authorize, add key, remove key. Use the returned SSH or WSS coordinates to connect; do not expect a "run command" RPC in this client.
- Google Cloud ADC docs say service account keys are a security risk and are not recommended. Prefer user ADC locally or other non-key ADC flows when possible.

## Version-Sensitive Notes

- PyPI currently publishes `google-cloud-shell 1.14.0`, released on January 15, 2026.
- The current Google Cloud reference and changelog pages still label the latest reference content as `1.13.0`. Treat the public API surface above as current, but verify changelog-level details carefully if you depend on behavior introduced after `1.13.0`.
- The upstream changelog for `1.13.0` adds Python 3.14 support and deprecates the `credentials_file` argument. Prefer ADC or an explicit `credentials=` object.
- The upstream changelog for `1.12.0` adds REST interceptors that can read metadata.
- The upstream changelog for `1.7.0` enables the `"rest"` transport. If you need the HTTP/JSON transport explicitly, pass `transport="rest"` when creating the client.

## Official Sources

- Docs root: `https://docs.cloud.google.com/python/docs/reference/cloudshell/latest`
- Client reference: `https://docs.cloud.google.com/python/docs/reference/cloudshell/latest/google.cloud.shell_v1.services.cloud_shell_service.CloudShellServiceClient`
- `StartEnvironmentRequest`: `https://docs.cloud.google.com/python/docs/reference/cloudshell/latest/google.cloud.shell_v1.types.StartEnvironmentRequest`
- `Environment` type: `https://docs.cloud.google.com/python/docs/reference/cloudshell/latest/google.cloud.shell_v1.types.Environment`
- Changelog: `https://docs.cloud.google.com/python/docs/reference/cloudshell/latest/changelog`
- Cloud Shell REST API: `https://cloud.google.com/shell/docs/reference/rest`
- `users.environments.start`: `https://cloud.google.com/shell/docs/reference/rest/v1/users.environments/start`
- `users.environments.authorize`: `https://docs.cloud.google.com/shell/docs/reference/rest/v1/users.environments/authorize`
- ADC overview: `https://docs.cloud.google.com/docs/authentication/application-default-credentials`
- PyPI: `https://pypi.org/project/google-cloud-shell/`
