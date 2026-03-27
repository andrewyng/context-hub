---
name: auth-httplib2
description: "google-auth-httplib2 package guide for Python projects that still need httplib2-backed authenticated Google API requests"
metadata:
  languages: "python"
  versions: "0.3.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-auth,httplib2,google-api-python-client,authentication,http"
---

# google-auth-httplib2 Python Package Guide

## Golden Rule

Use `google-auth-httplib2` only when you must attach modern `google-auth` credentials to code that already depends on `httplib2`, especially legacy `google-api-python-client` integrations. The maintainer docs explicitly say this library is no longer maintained and that new usage should prefer the transport layers provided by `google-auth`.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-auth-httplib2==0.3.0"
```

If you are also using the discovery-based Google API client:

```bash
python -m pip install "google-api-python-client>=2"
```

Import names do not match the package slug:

- Install `google-auth-httplib2`
- Import `google_auth_httplib2`

## Authentication And Setup

For the common case, use Application Default Credentials (ADC). Locally, that usually means one of these:

```bash
gcloud auth application-default login
```

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

If your code needs a project id for raw REST calls, keep it explicit:

```bash
export GOOGLE_CLOUD_PROJECT="my-project-id"
```

Choose scopes for the API you are calling. For example:

```python
SCOPES = ["https://www.googleapis.com/auth/devstorage.read_only"]
```

## Core Usage

### Wrap an `httplib2.Http` instance with ADC credentials

Use `AuthorizedHttp` when you already have `httplib2`-based code and need bearer-token handling plus automatic refresh on auth failures.

```python
import json
import os
from urllib.parse import urlencode

import google.auth
import google_auth_httplib2
import httplib2

SCOPES = ["https://www.googleapis.com/auth/devstorage.read_only"]
PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]

credentials, _ = google.auth.default(scopes=SCOPES)

http = httplib2.Http(timeout=30)
authed_http = google_auth_httplib2.AuthorizedHttp(credentials, http=http)

try:
    uri = "https://storage.googleapis.com/storage/v1/b?" + urlencode(
        {"project": PROJECT_ID}
    )
    response, content = authed_http.request(uri, method="GET")

    if response.status != 200:
        raise RuntimeError(f"Request failed: {response.status} {content!r}")

    for bucket in json.loads(content).get("items", []):
        print(bucket["name"])
finally:
    authed_http.close()
```

Practical notes:

- `AuthorizedHttp` behaves like `httplib2.Http`, so existing `request(...)` call patterns usually carry over.
- The wrapper refreshes credentials and retries when it sees auth refresh status codes; the default retry limit is `2`.
- Set network timeouts on the underlying `httplib2.Http(...)` or via `authed_http.timeout`.

### Initialize with an explicit service account file

Use this when ADC is not the right fit for the process:

```python
import os

import google_auth_httplib2
import httplib2
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"]

credentials = service_account.Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
    scopes=SCOPES,
)

authed_http = google_auth_httplib2.AuthorizedHttp(
    credentials,
    http=httplib2.Http(timeout=30),
)
```

### Use it with `google-api-python-client`

This is the main reason to keep `google-auth-httplib2` around in modern codebases.

```python
import google.auth
import google_auth_httplib2
import httplib2
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly"]

credentials, _ = google.auth.default(scopes=SCOPES)
authed_http = google_auth_httplib2.AuthorizedHttp(
    credentials,
    http=httplib2.Http(timeout=30),
)

service = build("drive", "v3", http=authed_http)

try:
    response = service.files().list(
        pageSize=10,
        fields="files(id,name,mimeType)",
    ).execute()
    for file in response.get("files", []):
        print(file["id"], file["name"], file["mimeType"])
finally:
    service.close()
```

### Refresh credentials manually

Use `Request` only when you need to refresh a credential object directly. If you already use `AuthorizedHttp`, you normally do not need this.

```python
import google.auth
import google_auth_httplib2
import httplib2

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

credentials, _ = google.auth.default(scopes=SCOPES)
request = google_auth_httplib2.Request(httplib2.Http(timeout=30))
credentials.refresh(request)

print(credentials.token)
```

## Configuration Notes

- `google.auth.default(scopes=...)` is the standard way to get credentials for `AuthorizedHttp`.
- ADC checks `GOOGLE_APPLICATION_CREDENTIALS`, local ADC created by `gcloud auth application-default login`, then attached runtime credentials on Google Cloud.
- `AuthorizedHttp` can wrap your own preconfigured `httplib2.Http` object if you already rely on custom proxy, certificate, cache, or redirect settings.
- `google-api-python-client` keeps HTTP connections open by default. Close the service object when done.

## Common Pitfalls

- Do not start new code with `google-auth-httplib2` unless you are forced to stay on `httplib2`. For new transports, use `google-auth` integrations such as `google.auth.transport.requests`.
- `httplib2.Http()` objects are not thread-safe. If you use `google-api-python-client` from multiple threads, create a separate `httplib2.Http()` or `AuthorizedHttp` per thread or per request.
- `google_auth_httplib2.Request(...).__call__(..., timeout=...)` ignores the per-call `timeout` argument because `httplib2` ignores it. Set the timeout when you construct `httplib2.Http(timeout=30)` instead.
- `google.auth.default()` can return credentials with no discovered project id. Pass the project explicitly when the API call needs one.
- The package name and import name differ: install `google-auth-httplib2`, import `google_auth_httplib2`.

## Version-Sensitive Notes For 0.3.0

- PyPI lists `0.3.0` as the current release, uploaded on December 15, 2025.
- The `0.3.0` changelog entry adds Python 3.14 support. It does not introduce a new transport model or a broader maintenance commitment.
- The `0.2.1` changelog tightened compatibility to `google-auth >=1.32.0,<3.0.0`, `httplib2 >=0.19.0,<1.0.0`, and Python `>=3.7`.
- The original GitHub repository is archived and still points users to the generated docs, which matches the package's "migration helper for existing httplib2 users" status rather than an actively evolving library.

## Official Sources

- Maintainer repository: `https://github.com/googleapis/google-auth-library-python-httplib2`
- Package docs root: `https://googleapis.dev/python/google-auth-httplib2/latest/`
- API reference: `https://googleapis.dev/python/google-auth-httplib2/latest/google_auth_httplib2.html`
- Changelog: `https://googleapis.dev/python/google-auth-httplib2/latest/CHANGELOG.html`
- PyPI: `https://pypi.org/project/google-auth-httplib2/`
- Google API client getting started: `https://googleapis.github.io/google-api-python-client/docs/start.html`
- Google API client thread safety: `https://googleapis.github.io/google-api-python-client/docs/thread_safety.html`
- ADC overview: `https://cloud.google.com/docs/authentication/application-default-credentials`
