---
name: github
description: "Prefect GitHub integration for GitHub credentials, private repository deployments, and GitHub GraphQL tasks"
metadata:
  languages: "python"
  versions: "0.4.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,github,python,workflow,orchestration,deployments,blocks,graphql"
---

# Prefect GitHub Python Package Guide

## Golden Rule

Use `prefect-github` as the Prefect integration for GitHub authentication and GitHub-specific blocks. Keep writing flows and deployments with core `prefect`; use this package when you need to:

- store a GitHub personal access token in a `GitHubCredentials` block
- pull flow code from a private GitHub repository at deployment runtime
- call the GitHub GraphQL API from a flow with the generated repository query and mutation helpers

If your deployment reads from a public GitHub repository, you can usually use the repository URL directly without installing `prefect-github`.

## Install

Install the package version this guide covers:

```bash
python -m pip install "prefect-github==0.4.2"
```

Common alternatives:

```bash
uv add prefect-github
poetry add prefect-github
```

If you want Prefect to choose a compatible integration version for your current Prefect install, use the documented extra instead:

```bash
python -m pip install "prefect[github]"
```

After installation, register the integration block types:

```bash
prefect block register -m prefect_github
```

Sanity-check the install:

```bash
python -m pip show prefect-github
python -c "import prefect_github; print(prefect_github.__file__)"
```

## Prerequisites And Environment

Before using the integration, make sure:

- the runtime has a GitHub account and a Personal Access Token
- for private repository cloning, the token has at least read access to repository contents and metadata
- `PREFECT_API_URL` is set if you want to save or load named Prefect blocks
- `PREFECT_API_KEY` is also set when you use Prefect Cloud

Example environment variables:

```bash
export GITHUB_TOKEN="github_pat_..."

export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

For an interactive Prefect Cloud setup:

```bash
prefect cloud login
```

For a local self-hosted Prefect server instead of Cloud:

```bash
prefect server start
prefect config set PREFECT_API_URL="http://127.0.0.1:4200/api"
```

## Create A GitHub Credentials Block

`GitHubCredentials` is the main entry point for this package. Instantiate it directly when your token already comes from environment variables or another secret manager.

```python
import os

from prefect_github import GitHubCredentials


github_credentials = GitHubCredentials(
    token=os.environ["GITHUB_TOKEN"],
)
```

Use this direct-instantiation pattern when you only need the token in the current process and do not need a saved block document yet.

## Save And Reuse A Named Block

When multiple deployments or flows should share the same GitHub token, save the block in Prefect and load it by name later.

```python
import os

from prefect_github import GitHubCredentials


github_credentials = GitHubCredentials(
    token=os.environ["GITHUB_TOKEN"],
)

github_credentials.save("github-creds", overwrite=True)
```

Load the block later:

```python
from prefect_github import GitHubCredentials


github_credentials = GitHubCredentials.load("github-creds")
```

What matters here:

- `save(...)` and `load(...)` depend on Prefect block storage, so they need a reachable Prefect API
- the block stores a GitHub PAT, not a GitHub App installation token
- if the block type does not appear in the UI or `load(...)` fails because the type is unknown, run `prefect block register -m prefect_github`

## Deploy A Flow From A Private GitHub Repository

For a private GitHub repository, Prefect’s current deployment docs use core `prefect.runner.storage.GitRepository` together with a `GitHubCredentials` block.

```python
from prefect import flow
from prefect.runner.storage import GitRepository
from prefect_github import GitHubCredentials


@flow
def my_flow() -> None:
    print("hello from a private GitHub deployment")


if __name__ == "__main__":
    source = GitRepository(
        url="https://github.com/org/private-repo.git",
        credentials=GitHubCredentials.load("github-creds"),
        branch="main",
    )

    my_flow.from_source(
        source=source,
        entrypoint="flows/my_flow.py:my_flow",
    ).deploy(
        name="private-github-deploy",
        work_pool_name="my-pool",
    )
```

Use this pattern when:

- the flow source of truth lives in GitHub
- your worker should clone the repository at runtime
- you want the GitHub token stored in Prefect instead of hard-coded in source

For a public repository, you can usually skip the credentials block and pass the repository URL directly.

## Use `prefect.yaml` Pull Steps With A Saved Block

If your deployments are defined in `prefect.yaml`, reference the saved block in the `git_clone` pull step:

```yaml
pull:
  - prefect.deployments.steps.git_clone:
      repository: https://github.com/org/private-repo.git
      credentials: "{{ prefect.blocks.github-credentials.github-creds }}"
```

This keeps the token out of the deployment file while still letting workers resolve it at runtime.

## Clone Repository Contents In Python

If you want to pull repository files into a local directory from Python code, use `GitHubRepository`. The reference docs show `get_directory(from_path=None, local_path=None)` and note that it defaults to the configured repository reference and the current working directory.

```python
from prefect_github import GitHubCredentials
from prefect_github.repository import GitHubRepository


repo = GitHubRepository(
    repository_url="https://github.com/org/private-repo.git",
    reference="main",
    credentials=GitHubCredentials.load("github-creds"),
)

repo.get_directory(
    from_path="flows",
    local_path="cloned-flow-code",
)
```

Use this when a task or bootstrap script needs files from a GitHub repository, not when you are defining deployment source for `flow.from_source(...)`.

## Call GitHub GraphQL Tasks From A Flow

`GitHubCredentials.get_client()` creates an authenticated GitHub GraphQL client pointed at `https://api.github.com/graphql`, but the most practical pattern is to use the generated query and mutation helpers directly in flows.

This example follows the official integration docs by querying a repository ID and starring it:

```python
from prefect import flow
from prefect_github import GitHubCredentials
from prefect_github.mutations import add_star_starrable
from prefect_github.repository import query_repository


@flow
def github_add_star_flow():
    github_credentials = GitHubCredentials.load("github-creds")

    repository = query_repository(
        "PrefectHQ",
        "prefect",
        github_credentials=github_credentials,
        return_fields="id",
    )

    return add_star_starrable(
        repository["id"],
        github_credentials,
    )


if __name__ == "__main__":
    github_add_star_flow()
```

If you need the lower-level client directly:

```python
from prefect_github import GitHubCredentials


github_credentials = GitHubCredentials.load("github-creds")
client = github_credentials.get_client()
```

## Common Pitfalls

- Installing `prefect-github` does not replace core `prefect`; you still use `prefect` for `@flow`, deployments, work pools, workers, and profiles.
- Register the integration block types after installation or the GitHub blocks may not be available in the UI.
- Saving and loading named blocks requires a reachable Prefect API. Direct instantiation of `GitHubCredentials(...)` does not.
- For private repositories, prefer HTTPS with a fine-grained GitHub PAT. Prefect’s deployment docs recommend read access to repository Contents and Metadata.
- `GitRepository` defaults the branch to `main` when you do not specify one. Set `branch=` explicitly if your repository uses a different default branch.
- `GitHubRepository` injects the token into an HTTPS clone URL for private repositories. Do not switch that workflow to SSH unless you are intentionally managing Git authentication outside this block.
- Prefect does not push your local changes back to GitHub when you create a deployment from Git-based storage. Commit and push your code separately.

## Version Notes For `prefect-github` 0.4.2

- This guide covers the PyPI package version `0.4.2`, which PyPI lists as released on February 12, 2026.
- PyPI lists `Requires: Python >=3.10` for this release.
- Prefect’s integration docs currently document `pip install "prefect[github]"` as the compatibility-oriented install path, while the code-storage guide also shows direct installation of `prefect-github`.
- If you use Prefect Cloud, the current code-storage docs also describe a Prefect Cloud GitHub App flow that avoids storing a long-lived GitHub token block for private repository access.

## Official Sources Used

- Prefect integrations overview: `https://docs.prefect.io/integrations/use-integrations`
- Prefect GitHub integration docs: `https://docs.prefect.io/integrations/prefect-github`
- Prefect blocks docs: `https://docs.prefect.io/v3/concepts/blocks`
- Prefect Cloud connection docs: `https://docs.prefect.io/v3/manage/cloud/connect-to-cloud`
- Prefect settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Prefect code storage guide: `https://docs.prefect.io/v3/deploy/infrastructure-concepts/store-flow-code`
- Prefect `prefect.yaml` guide: `https://docs.prefect.io/v3/deploy/infrastructure-concepts/prefect-yaml`
- Prefect Python reference for credentials: `https://reference.prefect.io/prefect_github/credentials/`
- Prefect Python reference for repository helpers: `https://reference.prefect.io/prefect_github/repository/`
- PyPI package page: `https://pypi.org/project/prefect-github/`
