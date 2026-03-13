---
name: package
description: "Apache Airflow provider for GitHub connections, hooks, and DAG tasks that call the GitHub API through PyGithub"
metadata:
  languages: "python"
  versions: "2.11.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,github,pygithub,hooks,operators,dags"
---

# Apache Airflow GitHub Provider Guide

Use `apache-airflow-providers-github` when an Airflow DAG needs to read repository data, create issues, or call GitHub from Airflow-managed tasks without hard-coding credentials in DAG files.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone GitHub SDK.
- Put the GitHub API base URL and token on an Airflow connection such as `github_default`.
- Use `GithubHook` for most real DAG logic, then call normal PyGithub methods on the returned client.
- Keep personal access tokens and GitHub App installation tokens out of DAG source and in Airflow connections, variables, or a secrets backend.

## What This Package Adds

This provider supplies Airflow's GitHub integration points. The core entry points most DAGs use are:

- `GithubHook`
- `GithubOperator`

In practice, `GithubHook` is the more flexible choice because it gives your task Python code direct access to the underlying GitHub client.

## Install

Install the provider into the same environment as Airflow and keep both versions pinned. The Apache Airflow project recommends installing providers with the constraints file that matches your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="2.11.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-github==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i github
airflow info
```

## Authentication And Connection Setup

Start with a minimal Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

Set the GitHub values you want Airflow to use:

```bash
export GITHUB_API_URL="https://api.github.com"
export GITHUB_TOKEN="<github-token>"
```

Then create the Airflow connection:

```bash
airflow connections add 'github_default' \
  --conn-type 'github' \
  --conn-host "$GITHUB_API_URL" \
  --conn-password "$GITHUB_TOKEN"
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get github_default
```

Notes:

- For GitHub Enterprise Server, set `GITHUB_API_URL` to the API root such as `https://github.example.com/api/v3`, not the web UI root.
- Use a token with the repository permissions your DAG needs. For example, creating issues requires issue-write permission on the target repository.
- Keep the Airflow connection id in DAG code stable and move environment-specific token values into your secrets backend or deployment config.

## Common Workflow: Read Repository Data In A Task

Use `GithubHook` when a task needs normal Python control flow and direct access to repository objects.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.github.hooks.github import GithubHook


with DAG(
    dag_id="github_list_open_pull_requests",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["github"],
):
    @task()
    def list_open_pull_requests() -> list[str]:
        hook = GithubHook(github_conn_id="github_default")
        client = hook.get_conn()

        repo = client.get_repo("apache/airflow")
        pulls = repo.get_pulls(state="open")

        return [f"#{pr.number} {pr.title}" for pr in pulls[:10]]

    list_open_pull_requests()
```

The important pattern is:

1. create `GithubHook(github_conn_id="...")`
2. call `hook.get_conn()`
3. use the returned GitHub client for normal PyGithub calls such as `get_repo()`, `get_pulls()`, `get_issues()`, and other repository methods

Return small strings, numbers, or dictionaries to XCom rather than full PyGithub objects.

## Common Workflow: Create An Issue

Use the hook when a task needs to look up a repository and then perform one or more writes.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.github.hooks.github import GithubHook


with DAG(
    dag_id="github_create_issue_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["github"],
):
    @task()
    def create_issue() -> str:
        hook = GithubHook(github_conn_id="github_default")
        client = hook.get_conn()

        repo = client.get_repo("OWNER/REPO")
        issue = repo.create_issue(
            title="Airflow provider demo issue",
            body="Opened from an Airflow task using GithubHook.",
        )

        return issue.html_url

    create_issue()
```

Use this pattern when the task needs to open an issue, add comments, inspect pull requests, or combine multiple GitHub API calls in one task body.

## When To Use `GithubOperator`

`GithubOperator` is useful when a task is a single top-level GitHub client call and you do not need much Python control flow around it.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.github.operators.github import GithubOperator


with DAG(
    dag_id="github_operator_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["github"],
):
    lookup_repo = GithubOperator(
        task_id="lookup_repo",
        github_conn_id="github_default",
        github_method="get_repo",
        github_method_args={"full_name_or_id": "apache/airflow"},
    )
```

Prefer the hook form when downstream tasks need a small derived result rather than a live PyGithub object.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i github
airflow dags list | grep github
```

Test a task in isolation while you wire up the connection and repository permissions:

```bash
airflow tasks test github_create_issue_demo create_issue 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream dependencies to participate.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Hard-coding GitHub tokens in DAG code instead of keeping them on the Airflow connection.
- Pointing GitHub Enterprise Server traffic at the web UI host instead of the API root ending in `/api/v3`.
- Returning large PyGithub objects through XCom instead of small serializable values.
- Assuming a valid token automatically has the repository permissions your DAG needs.
- Forgetting that workers, not just the webserver, need network access to the GitHub API endpoint.

## Version Notes

- This guide covers `apache-airflow-providers-github` version `2.11.0`.
- The Airflow provider `stable/` docs root moves as new provider releases ship, so keep your pinned Airflow and provider versions as the final authority during upgrades.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-github/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-github/stable/index.html`
- GitHub connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-github/stable/connections/github.html`
- `GithubHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-github/stable/_api/airflow/providers/github/hooks/github/index.html`
- `GithubOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-github/stable/_api/airflow/providers/github/operators/github/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-github/`
