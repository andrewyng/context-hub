---
name: package
description: "Prefect GitLab integration for storing GitLab credentials and using GitLab-hosted source in Prefect deployments"
metadata:
  languages: "python"
  versions: "0.3.4"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "prefect,gitlab,python,workflow,orchestration,deployments,blocks"
---

# Prefect GitLab Python Package Guide

## Golden Rule

Use `prefect-gitlab` as a Prefect integration package for GitLab-backed source and credentials. Keep writing flows and tasks with core `prefect`; use this package when your flow code lives in GitLab and you want Prefect blocks to hold GitLab authentication details for reusable deployments.

If your flow code is local or in a public repository that does not need GitLab-specific authentication, core Prefect may be enough without this integration.

## Install

Install the integration version this guide covers:

```bash
python -m pip install "prefect-gitlab==0.3.4"
```

If your project does not already include Prefect, install it too:

```bash
python -m pip install prefect prefect-gitlab
```

Common alternatives:

```bash
uv add prefect-gitlab
poetry add prefect-gitlab
```

Sanity-check the install:

```bash
python -m pip show prefect-gitlab
python -c "import prefect_gitlab; print(prefect_gitlab.__file__)"
```

## Prerequisites And Environment

Before you use GitLab-backed source with Prefect, make sure:

- your flow code already exists in a GitLab project
- you have a GitLab token with the repository access your deployment needs
- the branch, tag, or commit you reference already exists
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Example environment variables:

```bash
export GITLAB_ACCESS_TOKEN="glpat-..."
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

There is no separate long-lived `prefect-gitlab` runtime you need to start. The common entry points are Prefect blocks that you save once and load inside deployment code.

## Create A GitLab Credentials Block

Create a `GitLabCredentials` block from environment variables when you want Prefect to reuse GitLab authentication without hard-coding a token into deployment source.

```python
import os

from prefect_gitlab import GitLabCredentials


gitlab_credentials = GitLabCredentials(
    token=os.environ["GITLAB_ACCESS_TOKEN"],
)
```

Use this direct-instantiation pattern when your token already comes from environment variables or another secret manager and you do not need to persist a named block yet.

## Save And Reuse A Named Credentials Block

When multiple deployments should share the same GitLab authentication settings, save the block in Prefect and load it by name later.

```python
import os

from prefect_gitlab import GitLabCredentials


gitlab_credentials = GitLabCredentials(
    token=os.environ["GITLAB_ACCESS_TOKEN"],
)

gitlab_credentials.save("gitlab-creds", overwrite=True)
```

Load the block later:

```python
from prefect_gitlab import GitLabCredentials


gitlab_credentials = GitLabCredentials.load("gitlab-creds")
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they require a working Prefect API configuration
- direct instantiation of `GitLabCredentials(...)` does not require Prefect Cloud or a self-hosted server

## Deploy A Flow From GitLab Source

The most practical workflow is to store GitLab configuration in Prefect blocks, then deploy a flow from a GitLab-backed source.

```python
from prefect import flow
from prefect_gitlab import GitLabRepository


if __name__ == "__main__":
    flow.from_source(
        source=GitLabRepository.load("gitlab-source"),
        entrypoint="flows/reporting.py:daily_report",
    ).deploy(
        name="gitlab-reporting",
        work_pool_name="docker-pool",
    )
```

What this assumes:

- you already saved a `GitLabRepository` block named `gitlab-source`
- the block points at the correct GitLab project and branch, tag, or commit
- `entrypoint` matches the Python file and flow function inside that repository
- the worker environment can still install your project dependencies when the deployment runs

This pattern is the right fit when source-of-truth flow code lives in GitLab and you want deployments to keep pulling from that repository instead of packaging local files manually.

## Typical Setup Pattern

For most teams, a clean split is:

- keep the GitLab token in a `GitLabCredentials` block
- keep the repository definition in a `GitLabRepository` block
- load the repository block inside `flow.from_source(...)`
- use normal Prefect work pools and workers for execution

That keeps GitLab access details reusable and separate from flow logic.

## Common Pitfalls

- Installing `prefect-gitlab` does not replace `prefect`; you still use core Prefect for `@flow`, `@task`, deployments, workers, and configuration.
- Saving a block with `save(...)` and loading it by name with `load(...)` requires a reachable Prefect API.
- GitLab tokens belong in environment variables, secret management, or Prefect blocks, not hard-coded in source.
- The repository block must point at a real GitLab project and a real branch, tag, or commit that contains the `entrypoint` file.
- The deployment worker still needs the Python dependencies required by the pulled flow code.
- Older Prefect examples may refer to agent-based deployment patterns. For current orchestration patterns, prefer deployments, work pools, workers, and blocks.

## Version Notes For `prefect-gitlab` 0.3.4

- This guide covers the PyPI package version `0.3.4`.
- Treat `prefect-gitlab` as an integration layered on top of Prefect, not as a standalone GitLab client or workflow framework.
- The Python package version is separate from your GitLab server version and from the Prefect core version in the rest of your stack.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Package integration docs: `https://docs.prefect.io/integrations/prefect-gitlab/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Python reference root: `https://reference.prefect.io/prefect_gitlab/`
- PyPI package page: `https://pypi.org/project/prefect-gitlab/`
