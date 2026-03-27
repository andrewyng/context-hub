---
name: providers-asana
description: "Apache Airflow provider for Asana connections, task operators, and hook-based task or project automation"
metadata:
  languages: "python"
  versions: "2.11.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,asana,tasks,projects,hooks,operators"
---

# Apache Airflow Asana Provider Guide

Use `apache-airflow-providers-asana` when an Airflow DAG needs an Airflow-managed Asana personal access token and Python or operator-based tasks that create, search, update, or delete Asana tasks without embedding credentials in DAG files.

This guide covers provider version `2.11.1`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Asana SDK.
- Put the Asana personal access token on an Airflow connection such as `asana_default`.
- Use `AsanaHook` for most real DAG logic, especially if the task needs project operations or more than one Asana API call.
- Keep task ids, project ids, workspace ids, and secrets in Airflow connections, variables, or deployment config rather than hard-coding them in DAG source.

## What This Package Adds

This provider supplies Airflow's Asana integration points:

- Airflow connection type `asana`
- `AsanaHook`
- `AsanaCreateTaskOperator`
- `AsanaFindTaskOperator`
- `AsanaUpdateTaskOperator`
- `AsanaDeleteTaskOperator`

The operator surface is task-focused. If your DAG needs to create, find, update, or delete Asana projects, use `AsanaHook`.

## Install

Install the provider into the same environment as Airflow and keep both versions pinned. Airflow recommends installing providers with the constraints file that matches your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="2.11.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-asana==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i asana
airflow info
```

Version-sensitive notes from the official package metadata:

- `apache-airflow-providers-asana 2.11.1` requires `apache-airflow>=2.11.0`.
- PyPI classifiers for `2.11.1` list Python `3.10`, `3.11`, `3.12`, and `3.13`.

## Configure An Asana Connection

The provider connection uses the Airflow connection password field for the Asana personal access token. The hook also recognizes `workspace` and `project` in connection extras as defaults for later task and project calls.

Set the values you want Airflow to store:

```bash
export ASANA_PAT="<asana-personal-access-token>"
export ASANA_WORKSPACE_GID="<asana-workspace-gid>"
export ASANA_PROJECT_GID="<asana-project-gid>"
```

Then create the Airflow connection:

```bash
airflow connections add 'asana_default' \
  --conn-type 'asana' \
  --conn-password "$ASANA_PAT" \
  --conn-extra "{\"workspace\":\"${ASANA_WORKSPACE_GID}\",\"project\":\"${ASANA_PROJECT_GID}\"}"
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get asana_default
```

Important details:

- `password` is required. The hook raises an error if the token is missing.
- `host`, `login`, `port`, and `schema` are not used by this provider.
- `workspace` and `project` in extras act as defaults. Explicit task or search parameters in DAG code still win when both are present.

## Common Workflow: Create, Search, And Complete Tasks With `AsanaHook`

Use `AsanaHook` when a task needs normal Python control flow or more than one Asana API call.

```python
from __future__ import annotations

import os
import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.asana.hooks.asana import AsanaHook


PROJECT_GID = os.environ["ASANA_PROJECT_GID"]


with DAG(
    dag_id="asana_hook_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["asana"],
):
    @task()
    def create_asana_task() -> str:
        hook = AsanaHook(conn_id="asana_default")
        created = hook.create_task(
            "Review overnight pipeline failures",
            {
                "projects": [PROJECT_GID],
            },
        )
        return created["gid"]

    @task()
    def find_recent_project_tasks() -> list[dict[str, str | None]]:
        hook = AsanaHook(conn_id="asana_default")
        tasks = hook.find_task({"project": PROJECT_GID})
        return [{"gid": item["gid"], "name": item.get("name")} for item in tasks[:10]]

    @task()
    def mark_task_complete(task_gid: str) -> None:
        hook = AsanaHook(conn_id="asana_default")
        hook.update_task(
            task_gid,
            {
                "name": "Review overnight pipeline failures (updated by Airflow)",
            },
        )

    created_gid = create_asana_task()
    find_recent_project_tasks()
    mark_task_complete(created_gid)
```

What the hook methods expect:

- `create_task(name, task_parameters)` requires a task name and at least one placement target through `workspace`, `projects`, `parent`, or connection defaults.
- `find_task(search_parameters)` requires one of `project`, `section`, `tag`, `user_task_list`, or the pair `assignee` plus `workspace`.
- `update_task(asana_task_gid, task_parameters)` updates an existing task by gid.
- `delete_task(asana_task_gid)` deletes an existing task by gid.

## Common Workflow: Task Operators In A DAG

Use the operators when a task is one direct Asana action and you do not need much Python control flow around it.

```python
from __future__ import annotations

import os
import pendulum

from airflow import DAG
from airflow.providers.asana.operators.asana_tasks import (
    AsanaCreateTaskOperator,
    AsanaDeleteTaskOperator,
    AsanaFindTaskOperator,
    AsanaUpdateTaskOperator,
)


PROJECT_GID = os.environ["ASANA_PROJECT_GID"]


with DAG(
    dag_id="asana_operator_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["asana"],
):
    create_task = AsanaCreateTaskOperator(
        task_id="create_task",
        conn_id="asana_default",
        name="Follow up with integration owner",
        task_parameters={
            "projects": [PROJECT_GID],
        },
    )

    find_tasks = AsanaFindTaskOperator(
        task_id="find_tasks",
        conn_id="asana_default",
        search_parameters={"project": PROJECT_GID},
    )

    update_task = AsanaUpdateTaskOperator(
        task_id="update_task",
        conn_id="asana_default",
        asana_task_gid="<existing-task-gid>",
        task_parameters={"name": "Follow up with integration owner (updated)"},
    )

    delete_task = AsanaDeleteTaskOperator(
        task_id="delete_task",
        conn_id="asana_default",
        asana_task_gid="<task-gid-to-delete>",
    )

    create_task >> find_tasks >> update_task >> delete_task
```

The operator classes are thin wrappers around the same Asana task APIs. Prefer the hook when later steps depend on Python-side branching, multiple Asana calls, or project operations.

## Project Operations With `AsanaHook`

Project methods are available on the hook even though the packaged operators focus on tasks.

```python
from __future__ import annotations

import os

from airflow.providers.asana.hooks.asana import AsanaHook


WORKSPACE_GID = os.environ["ASANA_WORKSPACE_GID"]


hook = AsanaHook(conn_id="asana_default")

project = hook.create_project(
    {
        "workspace": WORKSPACE_GID,
        "name": "Airflow Provider Demo Project",
    }
)

project_gid = project["gid"]

hook.update_project(project_gid, {"name": "Airflow Provider Demo Project (renamed)"})
projects = hook.find_project({"workspace": WORKSPACE_GID})
hook.delete_project(project_gid)
```

Use this pattern when the DAG needs to manage project objects directly instead of only task objects.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i asana
airflow dags list | grep asana
```

Test one task in isolation while you wire up the token and ids:

```bash
airflow tasks test asana_hook_demo create_asana_task 2026-03-13
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream dependencies.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Creating the Airflow connection without a password: the provider treats the password as the Asana token and errors if it is missing.
- Calling `create_task()` without a placement target such as `projects`, `workspace`, or `parent`.
- Calling `find_task()` without enough search scope. The provider enforces a project, section, tag, user task list, or `assignee` plus `workspace`.
- Assuming connection extras always override DAG code. The hook uses extras as defaults, then lets explicit parameters in the task payload or search payload take precedence.
- Expecting project operators to exist. Project CRUD is exposed through `AsanaHook`, not through separate project operator classes in this provider version.
- Relying on `delete_task()` to fail for a nonexistent gid. The provider logs the condition and still completes successfully.

## Version Notes

- This guide covers `apache-airflow-providers-asana` version `2.11.1`.
- The Airflow provider `stable/` docs root moves when new provider releases ship, so keep your pinned Airflow and provider versions as the final authority during upgrades.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-asana/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-asana/stable/index.html`
- Asana connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-asana/stable/connections/asana.html`
- `AsanaHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-asana/stable/_api/airflow/providers/asana/hooks/asana/index.html`
- Task operators API reference: `https://airflow.apache.org/docs/apache-airflow-providers-asana/stable/_api/airflow/providers/asana/operators/asana_tasks/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-asana/`
