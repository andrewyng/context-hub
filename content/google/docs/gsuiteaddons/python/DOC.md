---
name: gsuiteaddons
description: "Google Workspace Add-ons Python client for managing add-on deployments, authorization metadata, and developer-mode installs"
metadata:
  languages: "python"
  versions: "0.4.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,workspace,addons,gmail,calendar,docs,python"
---

# Google Workspace Add-ons Python Client

## Golden Rule

Use `google-cloud-gsuiteaddons` to manage Google Workspace add-on deployments from Python. This package is for deployment lifecycle operations such as `create_deployment`, `replace_deployment`, `install_deployment`, and `get_authorization`; it does not build your card UI or replace the Google Workspace manifest docs.

As of March 13, 2026, PyPI lists `google-cloud-gsuiteaddons 0.4.0`. The current Python reference pages still show `0.3.18` in page chrome, so use PyPI for the published package version and the reference pages for the client methods and message types.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-gsuiteaddons==0.4.0"
```

Common alternatives:

```bash
uv add "google-cloud-gsuiteaddons==0.4.0"
poetry add "google-cloud-gsuiteaddons==0.4.0"
```

## Prerequisites

Before calling the API, make sure you have:

- A Google Cloud project that owns the add-on deployment
- The Google Workspace Add-ons API enabled for that project
- A valid Workspace add-on manifest for your host app and runtime
- The Google Workspace Marketplace SDK enabled as well if you are deploying an HTTP add-on

The client library manages deployments against that existing project setup. It does not generate the manifest for you.

## Authentication And Environment

Google client libraries use Application Default Credentials (ADC) by default.

For local development:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
```

If you must use a service account key locally:

```bash
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Optional client-library debug logging:

```bash
export GOOGLE_SDK_PYTHON_LOGGING_SCOPE="google"
```

## Initialize The Client

Most code only needs the default client:

```python
import os

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]

client = gsuiteaddons_v1.GSuiteAddOnsClient()
project_name = f"projects/{project_id}"
```

If you need explicit credentials instead of ADC:

```python
from google.cloud import gsuiteaddons_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "service-account.json"
)
client = gsuiteaddons_v1.GSuiteAddOnsClient(credentials=credentials)
```

## Get Authorization Metadata

`get_authorization` returns the authorization metadata Google created for the project, including the service account email and OAuth client ID used by the add-on. This is especially useful for alternate runtimes that validate Google-signed tokens on your HTTP endpoint.

```python
import os

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
client = gsuiteaddons_v1.GSuiteAddOnsClient()

authorization = client.get_authorization(
    request={"name": f"projects/{project_id}/authorization"}
)

print(authorization.service_account_email)
print(authorization.oauth_client_id)
```

## List And Inspect Deployments

List the deployments that already exist under a project:

```python
import os

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
client = gsuiteaddons_v1.GSuiteAddOnsClient()

for deployment in client.list_deployments(
    request={"parent": f"projects/{project_id}"}
):
    print(deployment.name)
    print(deployment.oauth_scopes)
```

Fetch one deployment by resource name:

```python
import os

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
deployment_id = "my-add-on"

client = gsuiteaddons_v1.GSuiteAddOnsClient()
deployment = client.get_deployment(
    request={"name": f"projects/{project_id}/deployments/{deployment_id}"}
)

print(deployment.name)
print(deployment.etag)
```

## Create Or Replace A Deployment

The Python client accepts deployment data that matches the `Deployment` message. In practice, the easiest approach is to build a deployment dict from the Workspace add-on manifest you already maintain, then send it with `create_deployment` or `replace_deployment`.

```python
import json
import os
from pathlib import Path

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
deployment_id = "my-add-on"

client = gsuiteaddons_v1.GSuiteAddOnsClient()

# deployment.json should use the Deployment schema for this API.
deployment_manifest = json.loads(Path("deployment.json").read_text())

created = client.create_deployment(
    request={
        "parent": f"projects/{project_id}",
        "deployment_id": deployment_id,
        "deployment": deployment_manifest,
    }
)

updated = client.replace_deployment(
    request={
        "deployment": {
            **deployment_manifest,
            "name": f"projects/{project_id}/deployments/{deployment_id}",
        }
    }
)

print(created.name)
print(updated.name)
```

For HTTP add-ons, the manifest still needs the correct `http_options` and host-app sections from the Google Workspace add-ons manifest docs. Keep those definitions in sync with the runtime you actually deploy.

## Install In Developer Mode And Check Status

`install_deployment` installs an add-on deployment for the current user in developer mode so they can test it. `get_install_status` uses a different resource name: append `/installStatus` to the deployment resource.

```python
import os

from google.cloud import gsuiteaddons_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
deployment_id = "my-add-on"
deployment_name = f"projects/{project_id}/deployments/{deployment_id}"

client = gsuiteaddons_v1.GSuiteAddOnsClient()

client.install_deployment(request={"name": deployment_name})

install_status = client.get_install_status(
    request={"name": f"{deployment_name}/installStatus"}
)

print(install_status.installed)
```

To remove the developer-mode install:

```python
client.uninstall_deployment(request={"name": deployment_name})
```

## Delete A Deployment

Delete the deployment when you no longer need it:

```python
client.delete_deployment(request={"name": deployment_name})
```

## Common Pitfalls

- This package manages the deployment API. It does not replace the Google Workspace add-on manifest docs, card-service docs, or your HTTP endpoint implementation.
- `install_deployment` and `uninstall_deployment` use the deployment resource name, but `get_install_status` uses `projects/{project}/deployments/{deployment}/installStatus`.
- The generated Python reference includes a generic note about regional endpoints, but the product REST docs document the Google Workspace Add-ons API under the global `gsuiteaddons.googleapis.com` service.
- If you are using alternate runtimes, keep the `authorization_header` behavior in your manifest aligned with what your backend actually validates. The product docs describe `SYSTEM_ID_TOKEN`, `USER_ID_TOKEN`, and `NONE`.
- The reference changelog notes that the generated `credentials_file` constructor argument is deprecated. Prefer ADC or explicit `credentials=...`.

## Version-Sensitive Notes

- PyPI currently publishes `0.4.0` for `google-cloud-gsuiteaddons`.
- The maintainer reference root and changelog currently stop at `0.3.18`, so there is an upstream version-display lag between the package registry and the generated docs site.
- The public API surface in the current reference includes the main deployment-management methods: `create_deployment`, `delete_deployment`, `get_authorization`, `get_deployment`, `get_install_status`, `install_deployment`, `list_deployments`, `replace_deployment`, and `uninstall_deployment`.

## Official Sources Used For This Doc

- PyPI package page: `https://pypi.org/project/google-cloud-gsuiteaddons/`
- Python reference root: `https://cloud.google.com/python/docs/reference/gsuiteaddons/latest`
- `GSuiteAddOnsClient` reference: `https://cloud.google.com/python/docs/reference/gsuiteaddons/latest/google.cloud.gsuiteaddons_v1.services.g_suite_add_ons.GSuiteAddOnsClient`
- Changelog: `https://cloud.google.com/python/docs/reference/gsuiteaddons/latest/changelog`
- Google Workspace Add-ons API overview: `https://developers.google.com/workspace/add-ons/guides/workspace-addons-api`
- Alternate runtimes guide: `https://developers.google.com/workspace/add-ons/guides/alternate-runtimes`
- REST `projects.deployments` resource: `https://developers.google.com/workspace/add-ons/reference/rest/v1/projects.deployments`
- REST `projects.getAuthorization` reference: `https://developers.google.com/workspace/add-ons/reference/rest/v1/projects/getAuthorization`
