---
name: build
description: "Google Cloud Build Python client for submitting builds, inspecting status, approving gated builds, and managing build triggers"
metadata:
  languages: "python"
  versions: "3.35.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud,cloud-build,cicd,builds,triggers,gcp,python"
---

# google-cloud-build Python Package Guide

Use `google-cloud-build` for Cloud Build control-plane automation in Python: submit builds, inspect build state, approve gated builds, and manage triggers.

Import surface:

```python
from google.cloud.devtools import cloudbuild_v1
```

## Golden Rule

- Install the official client and import `cloudbuild_v1` from `google.cloud.devtools`.
- Authenticate with Application Default Credentials (ADC), not hard-coded OAuth tokens.
- Pick `global` or a regional location deliberately and keep your `parent` resource name consistent with that choice.
- Treat `create_build` as a long-running operation and wait for `operation.result()` before assuming the build finished.
- If you set a user-specified service account on a build or trigger, also send logs to Cloud Logging or a user-owned bucket. Cloud Build does not let that service-account mode use the default logs bucket.

## Install

Pin the package version your project expects:

```bash
python -m pip install "google-cloud-build==3.35.0"
```

Common alternatives:

```bash
uv add "google-cloud-build==3.35.0"
poetry add "google-cloud-build==3.35.0"
```

## Authentication And Setup

Enable the API and authenticate with ADC:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud auth application-default login

export GOOGLE_CLOUD_PROJECT="my-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"   # or "global"
```

If you need file-based service account credentials instead of the local ADC login flow:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/service-account.json"
```

Minimal client setup:

```python
import os

from google.cloud.devtools import cloudbuild_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
parent = f"projects/{project_id}/locations/{location}"

client = cloudbuild_v1.CloudBuildClient()
```

Cloud Build supports both `global` and regional resources. If your build config uses regional private pools, regional repositories, or regional triggers, keep the build location aligned with those resources and use the matching regional Cloud Build endpoint in environments where endpoint selection matters.

## Submit A Build

This example submits a Docker build from a source archive already stored in Cloud Storage. `StorageSource.object_` is the archive object key inside the bucket.

```python
import os

from google.cloud.devtools import cloudbuild_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
parent = f"projects/{project_id}/locations/{location}"

client = cloudbuild_v1.CloudBuildClient()
image_uri = f"{location}-docker.pkg.dev/{project_id}/apps/web:latest"

build = cloudbuild_v1.Build(
    steps=[
        cloudbuild_v1.BuildStep(
            name="gcr.io/cloud-builders/docker",
            args=["build", "-t", image_uri, "."],
        ),
    ],
    images=[image_uri],
    source=cloudbuild_v1.Source(
        storage_source=cloudbuild_v1.StorageSource(
            bucket="my-source-bucket",
            object_="source/app.tar.gz",
        )
    ),
    options=cloudbuild_v1.BuildOptions(
        logging=cloudbuild_v1.BuildOptions.LoggingMode.CLOUD_LOGGING_ONLY,
    ),
)

operation = client.create_build(parent=parent, build=build)
result = operation.result()

print(result.id)
print(result.status)
print(result.log_url)
```

Use inline `Build.steps` when your automation already knows the build steps. If you need Cloud Build to read `cloudbuild.yaml`, create or run a trigger instead of assuming `create_build` will discover that file automatically.

## Inspect Build Status

List recent builds for a project:

```python
import os

from google.cloud.devtools import cloudbuild_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
client = cloudbuild_v1.CloudBuildClient()

for build in client.list_builds(project_id=project_id):
    print(build.id, build.status, build.create_time)
```

Fetch one build by ID:

```python
import os

from google.cloud.devtools import cloudbuild_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
build_id = "your-build-id"

client = cloudbuild_v1.CloudBuildClient()
build = client.get_build(project_id=project_id, id=build_id)

print(build.status)
print(build.log_url)
print(build.images)
```

If a build fails and you want Cloud Build to rerun it with the same configuration, the same client exposes `retry_build(project_id=..., id=...)`.

## Approve A Pending Build

When a trigger or build config requires approval, use `approve_build` with an `ApprovalResult`.

```python
import os

from google.cloud.devtools import cloudbuild_v1

project_id = os.environ["GOOGLE_CLOUD_PROJECT"]
build_id = "your-build-id"

client = cloudbuild_v1.CloudBuildClient()

approved = client.approve_build(
    project_id=project_id,
    id=build_id,
    approval_result=cloudbuild_v1.ApprovalResult(
        decision=cloudbuild_v1.ApprovalResult.Decision.APPROVED,
        comment="Approved by release automation",
    ),
)

print(approved.status)
```

Rejecting a build uses the same call with `Decision.REJECTED`.

## Build Triggers

The same client manages trigger resources:

- `create_build_trigger(...)`
- `list_build_triggers(...)`
- `get_build_trigger(...)`
- `update_build_trigger(...)`
- `delete_build_trigger(...)`
- `run_build_trigger(...)`

Use triggers when you want Cloud Build to watch a repository event or reuse a stored build definition such as `cloudbuild.yaml`. Keep trigger location aligned with the repository or private pool location when the product docs call that out.

## Secrets And Service Accounts

Cloud Build supports Secret Manager-backed environment variables in build steps, but there are two easy ways to get this wrong:

- Secret values must be wired through the build config using `availableSecrets` plus `secretEnv`; they are not injected automatically just because the build service account can access Secret Manager.
- When you reference a secret from a `bash` command in the build config, use `$$VAR_NAME` so Cloud Build substitutes the secret at execution time instead of your shell expanding it early.

Service account rules that matter in practice:

- If you set `service_account` on a build or trigger, also set a supported log destination. The default logs bucket is not allowed with user-specified service accounts.
- Be careful granting Secret Manager access to legacy Cloud Build service accounts on trigger-based builds. Google’s Secret Manager guide calls out that anyone who can run that trigger would inherit the secret access available to the trigger’s service account.

## Common Pitfalls

- `global` and regional resources are not interchangeable. A mismatched `parent` like `projects/x/locations/global` versus `projects/x/locations/us-central1` is a common cause of confusing `NotFound` and permission failures.
- `create_build` returns a long-running operation. If later code depends on the image or artifact existing, wait for `operation.result()`.
- `StorageSource.object_` is the object key in Cloud Storage, not a local filesystem path.
- Build steps run inside builder containers such as `gcr.io/cloud-builders/docker`. Installing `google-cloud-build` locally does not give your build step images extra tools.
- `approve_build` only works for builds that are actually waiting on approval. Read the build first if your automation is unsure about current state.

## Version Notes

- PyPI currently lists `google-cloud-build 3.35.0`.
- The generated Python reference pages for `CloudBuildClient`, `Build`, `BuildStep`, `Source`, and `StorageSource` also render under the `3.35.0` docs tree.
- The generated changelog page still stops at `3.34.0`, so use the class reference pages and PyPI as the source of truth for the current 3.35.0 client surface.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-build/
- Maintainer package directory: https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-build
- Python reference root: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest
- `CloudBuildClient` reference: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest/google.cloud.devtools.cloudbuild_v1.services.cloud_build.CloudBuildClient
- `Build` reference: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest/google.cloud.devtools.cloudbuild_v1.types.Build
- `BuildStep` reference: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest/google.cloud.devtools.cloudbuild_v1.types.BuildStep
- `Source` reference: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest/google.cloud.devtools.cloudbuild_v1.types.Source
- `StorageSource` reference: https://docs.cloud.google.com/python/docs/reference/cloudbuild/latest/google.cloud.devtools.cloudbuild_v1.types.StorageSource
- Configure regional endpoints and locations: https://cloud.google.com/build/docs/locations
- Use secrets from Secret Manager: https://cloud.google.com/build/docs/securing-builds/use-secrets
