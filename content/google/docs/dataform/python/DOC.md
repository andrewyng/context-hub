---
name: dataform
description: "Google Cloud Dataform Python client for repositories, workspaces, compilation results, and workflow invocations"
metadata:
  languages: "python"
  versions: "0.9.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,dataform,bigquery,gcp,sql,workflow,python"
---

# Google Cloud Dataform Python Client

## Golden Rule

Use the official `google-cloud-dataform` package with `from google.cloud import dataform_v1`, and authenticate with Google Cloud credentials through Application Default Credentials (ADC) unless you have a reason to pass explicit credentials.

For new code, prefer the stable `dataform_v1` namespace. The package also publishes `dataform_v1beta1`, but the stable `v1` surface is the better default when the reference docs cover the feature you need.

## Install

Pin the version your project expects:

```bash
python -m pip install "google-cloud-dataform==0.9.0"
```

Common alternatives:

```bash
uv add "google-cloud-dataform==0.9.0"
poetry add "google-cloud-dataform==0.9.0"
```

## Authentication And Setup

The Dataform client library uses normal Google Cloud credentials, not API keys.

Recommended local setup:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID

export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_LOCATION="us-central1"
export DATAFORM_REPOSITORY="analytics"
export DATAFORM_WORKSPACE="dev"
```

Service account fallback:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
export GOOGLE_CLOUD_LOCATION="us-central1"
export DATAFORM_REPOSITORY="analytics"
export DATAFORM_WORKSPACE="dev"
```

Basic client initialization with ADC:

```python
import os

from google.cloud import dataform_v1

PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
LOCATION = os.environ["GOOGLE_CLOUD_LOCATION"]
REPOSITORY = os.environ["DATAFORM_REPOSITORY"]
WORKSPACE = os.environ["DATAFORM_WORKSPACE"]

client = dataform_v1.DataformClient()

location_name = f"projects/{PROJECT_ID}/locations/{LOCATION}"
repository_name = f"{location_name}/repositories/{REPOSITORY}"
workspace_name = f"{repository_name}/workspaces/{WORKSPACE}"
```

Explicit service account credentials:

```python
from google.cloud import dataform_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "/absolute/path/service-account.json"
)

client = dataform_v1.DataformClient(credentials=credentials)
```

## Common Workflows

### List repositories in a location

Dataform resources are regional. Start from `projects/{project}/locations/{location}` when listing repositories:

```python
import os

from google.cloud import dataform_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]

client = dataform_v1.DataformClient()
parent = f"projects/{project_id}/locations/{location}"

for repository in client.list_repositories(request={"parent": parent}):
    print(repository.name)
```

### Get a workspace

Use the full resource name for workspace reads:

```python
import os

from google.cloud import dataform_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
repository_id = os.environ["DATAFORM_REPOSITORY"]
workspace_id = os.environ["DATAFORM_WORKSPACE"]

client = dataform_v1.DataformClient()
workspace_name = (
    f"projects/{project_id}/locations/{location}"
    f"/repositories/{repository_id}/workspaces/{workspace_id}"
)

workspace = client.get_workspace(request={"name": workspace_name})
print(workspace.name)
```

### Create a compilation result

`CompilationResult` can compile from a workspace, a Git commit-ish, or a release config. For an ad hoc run from your current workspace, set `workspace`:

```python
import os

from google.cloud import dataform_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ["GOOGLE_CLOUD_LOCATION"]
repository_id = os.environ["DATAFORM_REPOSITORY"]
workspace_id = os.environ["DATAFORM_WORKSPACE"]

client = dataform_v1.DataformClient()
repository_name = f"projects/{project_id}/locations/{location}/repositories/{repository_id}"
workspace_name = f"{repository_name}/workspaces/{workspace_id}"

compilation_result = client.create_compilation_result(
    request={
        "parent": repository_name,
        "compilation_result": {
            "workspace": workspace_name,
        },
    }
)

print(compilation_result.name)
```

Compile from a Git reference instead:

```python
compilation_result = client.create_compilation_result(
    request={
        "parent": repository_name,
        "compilation_result": {
            "git_commitish": "main",
        },
    }
)
```

### Inspect actions in a compilation result

Use `query_compilation_result_actions` before you trigger execution so you can see what the compilation produced:

```python
response = client.query_compilation_result_actions(
    request={"name": compilation_result.name}
)

for action in response.compilation_result_actions:
    target = action.target
    if target:
        print(target.database, target.schema, target.name)
```

### Start a workflow invocation from a compilation result

Use a `WorkflowInvocation` when you want Dataform to run the compiled actions. `invocation_config` lets you scope execution by tags or targets.

```python
workflow_invocation = client.create_workflow_invocation(
    request={
        "parent": repository_name,
        "workflow_invocation": {
            "compilation_result": compilation_result.name,
            "invocation_config": {
                "included_tags": ["daily"],
                "transitive_dependencies_included": True,
            },
        },
    }
)

print(workflow_invocation.name)
```

To target a specific action instead of tags, pass `included_targets`:

```python
workflow_invocation = client.create_workflow_invocation(
    request={
        "parent": repository_name,
        "workflow_invocation": {
            "compilation_result": compilation_result.name,
            "invocation_config": {
                "included_targets": [
                    {
                        "database": "YOUR_PROJECT_ID",
                        "schema": "analytics",
                        "name": "daily_revenue",
                    }
                ],
                "transitive_dependencies_included": True,
            },
        },
    }
)
```

### Poll a workflow invocation

Use `get_workflow_invocation` for the current state:

```python
from google.cloud import dataform_v1

client = dataform_v1.DataformClient()

current = client.get_workflow_invocation(
    request={"name": workflow_invocation.name}
)

print(current.name)
print(current.state.name)
```

Poll that same call in your own retry loop until the state reaches the terminal value your application expects.

### Inspect per-action execution status

After a workflow starts, query the invocation actions instead of the compilation actions:

```python
response = client.query_workflow_invocation_actions(
    request={"name": workflow_invocation.name}
)

for action in response.workflow_invocation_actions:
    target = action.target
    name = target.name if target else "<unknown>"
    print(name, action.state.name)
```

### Cancel a running workflow invocation

```python
client.cancel_workflow_invocation(
    request={"name": workflow_invocation.name}
)
```

## Common Pitfalls

- Install `google-cloud-dataform`, but import from `google.cloud import dataform_v1`.
- Keep `project`, `location`, repository, workspace, compilation result, and workflow invocation names aligned. Dataform resource names are region-scoped under `projects/{project}/locations/{location}`.
- `query_compilation_result_actions` shows what a compilation produced. `query_workflow_invocation_actions` shows execution state after you start a workflow.
- If you want an ad hoc run from current workspace contents, create a fresh `CompilationResult` first and invoke that result. Do not expect a workflow invocation to compile your workspace implicitly.
- Use `included_tags` or `included_targets` in `InvocationConfig` when you do not want to run everything in the compilation result.

## Version Notes

As of March 13, 2026, PyPI lists `google-cloud-dataform 0.9.0`, but the generated Google Cloud Python reference pages still show older page-level version labels and the published changelog lags further behind. Use PyPI as the package-version source of truth, and use the `dataform_v1` reference pages for method names and request shapes.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-dataform/
- Python client library overview: https://cloud.google.com/python/docs/reference/dataform/latest
- `DataformClient` reference: https://cloud.google.com/python/docs/reference/dataform/latest/google.cloud.dataform_v1.services.dataform.DataformClient
- `CompilationResult` type: https://cloud.google.com/python/docs/reference/dataform/latest/google.cloud.dataform_v1.types.CompilationResult
- `WorkflowInvocation` type: https://cloud.google.com/python/docs/reference/dataform/latest/google.cloud.dataform_v1.types.WorkflowInvocation
- `QueryCompilationResultActionsResponse` type: https://cloud.google.com/python/docs/reference/dataform/latest/google.cloud.dataform_v1.types.QueryCompilationResultActionsResponse
- `QueryWorkflowInvocationActionsResponse` type: https://cloud.google.com/python/docs/reference/dataform/latest/google.cloud.dataform_v1.types.QueryWorkflowInvocationActionsResponse
- ADC setup: https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment
- Changelog: https://cloud.google.com/python/docs/reference/dataform/latest/changelog
