---
name: source-context
description: "google-cloud-source-context message types for describing Git, Gerrit, Cloud Repo, and Cloud Workspace source revisions in Python"
metadata:
  languages: "python"
  versions: "1.9.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google,google-cloud,source-context,gcp,protobuf,git,gerrit"
---

# google-cloud-source-context Python Package Guide

## What It Is

`google-cloud-source-context` provides the generated Python message types for Google Source Context v1.

The current official reference pages for this package are centered on `google.cloud.source_context_v1.types`, including:

- `SourceContext`
- `ExtendedSourceContext`
- `GitSourceContext`
- `GerritSourceContext`
- `CloudRepoSourceContext`
- `CloudWorkspaceSourceContext`
- `RepoId`
- `ProjectRepoId`

Use this package when another Google API or protobuf message expects a `SourceContext` or `ExtendedSourceContext`. For standalone usage, you usually just construct these message objects and pass them into another request.

## Install

```bash
python -m pip install "google-cloud-source-context==1.9.0"
```

Common alternatives:

```bash
uv add "google-cloud-source-context==1.9.0"
poetry add "google-cloud-source-context==1.9.0"
```

## Authentication And Environment

Constructing `SourceContext` messages does not require credentials and this package does not need its own client initialization.

If you pass these messages to another Google Cloud client, that client typically uses Application Default Credentials (ADC):

```bash
gcloud auth application-default login
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
```

Practical note:

- The message classes in this package do not read these environment variables directly.
- `GOOGLE_APPLICATION_CREDENTIALS` and `GOOGLE_CLOUD_PROJECT` matter for the downstream Google Cloud client you pair with these types.

## Imports And Initialization

Import the message types directly and instantiate them. There is no separate `SourceContextClient` shown in the current official package reference.

```python
from google.cloud.source_context_v1.types import (
    AliasContext,
    CloudRepoSourceContext,
    CloudWorkspaceId,
    CloudWorkspaceSourceContext,
    ExtendedSourceContext,
    GerritSourceContext,
    GitSourceContext,
    ProjectRepoId,
    RepoId,
    SourceContext,
)
```

## Core Usage

### Describe A Git Commit

`GitSourceContext` is the most direct option when you know the repository URL and the exact commit hash.

```python
from google.cloud.source_context_v1.types import GitSourceContext, SourceContext

source_context = SourceContext(
    git=GitSourceContext(
        url="https://github.com/example/service.git",
        revision_id="4f3a1c6b7d8e9f00112233445566778899aabbcc",
    )
)

print(source_context.git.url)
print(source_context.git.revision_id)
```

The official type docs describe `GitSourceContext.url` and `GitSourceContext.revision_id` as required fields.

### Describe A Cloud Source Repositories Revision

Use `CloudRepoSourceContext` when the source lives in a Google-hosted repository identified by project and repo name.

```python
from google.cloud.source_context_v1.types import (
    CloudRepoSourceContext,
    ProjectRepoId,
    RepoId,
    SourceContext,
)

source_context = SourceContext(
    cloud_repo=CloudRepoSourceContext(
        repo_id=RepoId(
            project_repo_id=ProjectRepoId(
                project_id="my-gcp-project",
                repo_name="backend",
            )
        ),
        revision_id="4f3a1c6b7d8e9f00112233445566778899aabbcc",
    )
)

print(source_context.cloud_repo.repo_id.project_repo_id.project_id)
print(source_context.cloud_repo.revision_id)
```

If you want to point at a branch or tag instead of a fixed commit, use `alias_name` or `alias_context` on `CloudRepoSourceContext`.

### Describe A Gerrit Revision

Use `GerritSourceContext` when the revision comes from a Gerrit host and project.

```python
from google.cloud.source_context_v1.types import GerritSourceContext, SourceContext

source_context = SourceContext(
    gerrit=GerritSourceContext(
        host_uri="https://gerrit-review.googlesource.com",
        gerrit_project="my-team/service",
        revision_id="4f3a1c6b7d8e9f00112233445566778899aabbcc",
    )
)

print(source_context.gerrit.host_uri)
print(source_context.gerrit.gerrit_project)
print(source_context.gerrit.revision_id)
```

### Describe A Cloud Workspace Snapshot

Use `CloudWorkspaceSourceContext` when the source reference is a Cloud Workspace snapshot instead of a repo revision.

```python
from google.cloud.source_context_v1.types import (
    CloudWorkspaceId,
    CloudWorkspaceSourceContext,
    ProjectRepoId,
    RepoId,
    SourceContext,
)

source_context = SourceContext(
    cloud_workspace=CloudWorkspaceSourceContext(
        workspace_id=CloudWorkspaceId(
            repo_id=RepoId(
                project_repo_id=ProjectRepoId(
                    project_id="my-gcp-project",
                    repo_name="backend",
                )
            ),
            name="alice-feature-workspace",
        ),
        snapshot_id="snapshot-123",
    )
)

print(source_context.cloud_workspace.workspace_id.name)
print(source_context.cloud_workspace.snapshot_id)
```

The official docs note that an empty `snapshot_id` means "the most recent snapshot."

### Attach Labels With `ExtendedSourceContext`

Use `ExtendedSourceContext` when you need the base source reference plus extra labels.

```python
from google.cloud.source_context_v1.types import (
    ExtendedSourceContext,
    GitSourceContext,
    SourceContext,
)

extended = ExtendedSourceContext(
    context=SourceContext(
        git=GitSourceContext(
            url="https://github.com/example/service.git",
            revision_id="4f3a1c6b7d8e9f00112233445566778899aabbcc",
        )
    ),
    labels={
        "component": "api",
        "deploy_env": "prod",
    },
)

print(extended.context.git.url)
print(extended.labels["component"])
```

## Common Patterns

### Use A Branch Or Tag Alias

If the upstream API accepts a movable reference instead of a fixed revision, use `AliasContext`.

```python
from google.cloud.source_context_v1.types import (
    AliasContext,
    CloudRepoSourceContext,
    ProjectRepoId,
    RepoId,
    SourceContext,
)

source_context = SourceContext(
    cloud_repo=CloudRepoSourceContext(
        repo_id=RepoId(
            project_repo_id=ProjectRepoId(
                project_id="my-gcp-project",
                repo_name="backend",
            )
        ),
        alias_context=AliasContext(alias_name="main"),
    )
)

print(source_context.cloud_repo.alias_context.alias_name)
```

Use a fixed `revision_id` when reproducibility matters more than following the current branch head.

### Pass The Message Into Another Request

This package is usually consumed indirectly. When a downstream Google client library exposes a field typed as `SourceContext` or `ExtendedSourceContext`, build the message here first and pass that typed object into the request instead of assembling an ad hoc dict payload.

## Common Pitfalls

- `SourceContext` is a oneof wrapper. Set only one of `cloud_repo`, `cloud_workspace`, `gerrit`, or `git`.
- `CloudRepoSourceContext` and `GerritSourceContext` also use oneof fields for the revision selector. `revision_id`, `alias_name`, and `alias_context` are alternatives, not additive fields.
- `GitSourceContext` expects the exact repository URL and commit hash. It does not resolve branches for you.
- `ProjectRepoId.repo_name` may be empty for the default repo, so do not assume it is always populated.
- `CloudWorkspaceSourceContext.snapshot_id` is optional; the official docs say an empty value means the most recent snapshot.
- This package models source references. It does not clone repositories, fetch commits, or provide a standalone repository service client.

## Version-Sensitive Notes

- PyPI currently lists `1.9.0` as the package version for `google-cloud-source-context`.
- The official changelog entry for `1.9.0` notes mTLS auto-enablement support when a client certificate is available and generated GAPIC updates around Python and dependency version checks.
- The official changelog entry for `1.8.0` adds Python 3.14 support. If you are standardizing on Python 3.14, use `1.8.0` or newer.
- The current docs site serves the package reference under the `latest` tree, while PyPI is the authoritative source for the exact package version you install.

## Official Sources

- Package docs overview: `https://cloud.google.com/python/docs/reference/source/latest/summary_overview`
- Type reference index: `https://docs.cloud.google.com/python/docs/reference/source/latest/google.cloud.source_context_v1.types`
- Changelog: `https://cloud.google.com/python/docs/reference/source/latest/changelog`
- PyPI: `https://pypi.org/project/google-cloud-source-context/`
- Maintainer repository: `https://github.com/googleapis/google-cloud-python/tree/main/packages/google-cloud-source-context`
- ADC setup: `https://cloud.google.com/docs/authentication/application-default-credentials`
