---
name: workflows
description: "Google Cloud Workflows Python client for creating workflows, managing revisions, and starting executions"
metadata:
  languages: "python"
  versions: "1.20.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,workflows,orchestration,serverless,python"
---

# Google Cloud Workflows Python Client

## Golden Rule

Use `google-cloud-workflows` for the Workflows control plane in Python:

- `from google.cloud import workflows_v1` to create, list, update, and delete workflows
- `from google.cloud.workflows import executions_v1` to start executions and inspect their status

This package manages deployed workflow resources and execution records. It does not replace the workflow definition language itself; you still provide workflow source as YAML or JSON text in `Workflow.source_contents`.

## Install

Pin the version your project expects:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "google-cloud-workflows==1.20.0"
```

Common alternatives:

```bash
uv add "google-cloud-workflows==1.20.0"
poetry add "google-cloud-workflows==1.20.0"
```

## Authentication And Setup

Before using the client:

- select a Google Cloud project
- enable billing
- enable the Cloud Workflows API
- authenticate with Application Default Credentials (ADC)

Local development with ADC:

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

Service account file when you explicitly need one:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
export GOOGLE_CLOUD_PROJECT="my-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

Basic client setup:

```python
import os

from google.cloud import workflows_v1
from google.cloud.workflows import executions_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

workflows_client = workflows_v1.WorkflowsClient()
executions_client = executions_v1.ExecutionsClient()

parent = workflows_client.common_location_path(project_id, location)
```

If you need explicit credentials:

```python
from google.cloud import workflows_v1
from google.cloud.workflows import executions_v1
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    "service-account.json"
)

workflows_client = workflows_v1.WorkflowsClient(credentials=credentials)
executions_client = executions_v1.ExecutionsClient(credentials=credentials)
```

## Client Surface

The package is split across two service families:

- `workflows_v1.WorkflowsClient`: create, get, list, update, delete workflows, and list revisions
- `executions_v1.ExecutionsClient`: create, get, list, and cancel executions for a workflow

Important behavior from the generated API:

- workflow create, update, and delete calls return long-running operations; wait on `.result()`
- execution creation is not a long-running operation; it returns an `Execution` resource immediately
- `Execution.argument` is a JSON string with a 32 KB limit
- `Workflow.source_contents` has a 128 KB limit
- updating `service_account` or `source_contents` creates a new workflow revision

## Core Workflow

### Create a workflow from inline source

`source_contents` is the workflow definition you want Cloud Workflows to run. Keep it as a raw YAML string.

```python
import os

from google.cloud import workflows_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = workflows_v1.WorkflowsClient()
parent = client.common_location_path(project_id, location)

workflow = workflows_v1.Workflow(
    description="Echo input back to the caller",
    source_contents="""main:
  params: [args]
  steps:
    - return_output:
        return: ${args}
""",
    service_account=f"workflow-sa@{project_id}.iam.gserviceaccount.com",
    user_env_vars={"APP_ENV": "dev"},
)

operation = client.create_workflow(
    parent=parent,
    workflow=workflow,
    workflow_id="echo-workflow",
)

created = operation.result(timeout=600)
print(created.name)
print(created.revision_id)
```

### List and fetch workflows

```python
import os

from google.cloud import workflows_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = workflows_v1.WorkflowsClient()
parent = client.common_location_path(project_id, location)

for workflow in client.list_workflows(parent=parent):
    print(workflow.name, workflow.state.name, workflow.revision_id)

workflow_name = client.workflow_path(project_id, location, "echo-workflow")
workflow = client.get_workflow(name=workflow_name)

print(workflow.description)
print(workflow.service_account)
print(workflow.user_env_vars)
```

### Update only specific fields

Use `FieldMask` instead of sending a whole replacement update.

```python
import os

from google.cloud import workflows_v1
from google.protobuf.field_mask_pb2 import FieldMask

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = workflows_v1.WorkflowsClient()
workflow_name = client.workflow_path(project_id, location, "echo-workflow")
workflow = client.get_workflow(name=workflow_name)

workflow.description = "Echo input and keep production env vars"
workflow.user_env_vars["APP_ENV"] = "prod"

operation = client.update_workflow(
    request=workflows_v1.UpdateWorkflowRequest(
        workflow=workflow,
        update_mask=FieldMask(paths=["description", "user_env_vars"]),
    )
)

updated = operation.result(timeout=600)
print(updated.revision_id)
print(updated.user_env_vars)
```

### List workflow revisions

If you are debugging deployment drift, inspect the revision history instead of guessing which definition executed.

```python
import os

from google.cloud import workflows_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = workflows_v1.WorkflowsClient()
workflow_name = client.workflow_path(project_id, location, "echo-workflow")

for revision in client.list_workflow_revisions(name=workflow_name):
    print(revision.revision_id, revision.revision_create_time)
```

### Start an execution with a JSON argument

Pass execution input as a JSON string, not a Python dict.

```python
import json
import os

from google.cloud import workflows_v1
from google.cloud.workflows import executions_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

workflow_name = workflows_v1.WorkflowsClient.workflow_path(
    project_id,
    location,
    "echo-workflow",
)

client = executions_v1.ExecutionsClient()

execution = executions_v1.Execution(
    argument=json.dumps({"message": "hello from python"}),
)

created = client.create_execution(
    parent=workflow_name,
    execution=execution,
)

print(created.name)
print(created.state.name)
print(created.workflow_revision_id)
```

### Poll until the execution finishes

```python
import json
import time

from google.cloud.workflows import executions_v1
from google.cloud.workflows.executions_v1.types import executions

client = executions_v1.ExecutionsClient()
execution_name = "projects/my-project/locations/us-central1/workflows/echo-workflow/executions/my-execution"

while True:
    current = client.get_execution(name=execution_name)
    print(current.state.name)

    if current.state != executions.Execution.State.ACTIVE:
        break

    time.sleep(2)

if current.state == executions.Execution.State.SUCCEEDED:
    print(json.loads(current.result))
else:
    print(current.error)
```

### List executions for one workflow

`list_executions` defaults to the BASIC view, which is enough for names, timestamps, state, and revision IDs.

```python
from google.cloud.workflows import executions_v1

client = executions_v1.ExecutionsClient()
workflow_name = "projects/my-project/locations/us-central1/workflows/echo-workflow"

for execution in client.list_executions(parent=workflow_name):
    print(
        execution.name,
        execution.state.name,
        execution.workflow_revision_id,
        execution.start_time,
    )
```

### Cancel an in-flight execution

```python
from google.cloud.workflows import executions_v1

client = executions_v1.ExecutionsClient()
execution_name = "projects/my-project/locations/us-central1/workflows/echo-workflow/executions/my-execution"

cancelled = client.cancel_execution(name=execution_name)
print(cancelled.state.name)
```

### Delete a workflow

```python
import os

from google.cloud import workflows_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

client = workflows_v1.WorkflowsClient()
workflow_name = client.workflow_path(project_id, location, "echo-workflow")

operation = client.delete_workflow(name=workflow_name)
operation.result(timeout=600)
```

## Common Pitfalls

- Do not pass a Python dict directly to `Execution.argument`; serialize it with `json.dumps(...)`.
- Do not treat workflow mutations as synchronous. `create_workflow`, `update_workflow`, and `delete_workflow` all return long-running operations.
- Use `FieldMask` for updates. If `update_mask` is omitted, the API treats the request as a full workflow update.
- `list_executions` defaults to the BASIC view. If you need payload fields such as `result` or `error` in list output, request the FULL view explicitly.
- Keep `source_contents` small enough to fit the documented 128 KB limit.
- Changing `source_contents` or `service_account` creates a new workflow revision. If behavior changed after a deploy, inspect `revision_id` and `workflow_revision_id`.
- `user_env_vars` keys cannot start with `GOOGLE` or `WORKFLOWS`.

## Version-Sensitive Notes

- PyPI lists `google-cloud-workflows 1.20.0` as the current package release for this guide.
- The generated `latest` Python reference pages still render as `1.19.0` in the page title, even though PyPI shows `1.20.0`. Use the package version from PyPI for pinning, and use the latest reference pages for current API surface details.
- The package exposes both `v1` and `v1beta` modules. Prefer the `v1` clients shown above unless you specifically need beta-only behavior documented upstream.

## Official Sources

- PyPI package page: https://pypi.org/project/google-cloud-workflows/
- Python client overview: https://docs.cloud.google.com/python/docs/reference/workflows/latest
- `WorkflowsClient` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows_v1.services.workflows.WorkflowsClient
- `Workflow` type reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows_v1.types.Workflow
- `UpdateWorkflowRequest` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows_v1.types.UpdateWorkflowRequest
- `ListWorkflowRevisionsRequest` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows_v1.types.ListWorkflowRevisionsRequest
- `ExecutionsClient` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows.executions_v1.services.executions.ExecutionsClient
- `Execution` type reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows.executions_v1.types.Execution
- `CreateExecutionRequest` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows.executions_v1.types.CreateExecutionRequest
- `ListExecutionsRequest` reference: https://docs.cloud.google.com/python/docs/reference/workflows/latest/google.cloud.workflows.executions_v1.types.ListExecutionsRequest
