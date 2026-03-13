---
name: package
description: "Apache Airflow provider for Jira connections, hooks, and DAG tasks that create or update issues"
metadata:
  languages: "python"
  versions: "3.1.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,jira,atlassian,issues,hooks,operators"
---

# Apache Airflow Jira Provider Guide

Use `apache-airflow-providers-jira` when an Airflow DAG needs to create Jira issues, read issue details, add comments, or drive Jira workflow steps through an Airflow-managed connection.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Jira SDK.
- Put Jira credentials on an Airflow connection such as `jira_default` and keep DAG code focused on issue fields and workflow logic.
- Use `JiraHook` when task code needs direct Python access to the Jira client.
- Keep usernames, passwords, API tokens, and hostnames out of DAG source and in Airflow connections, variables, or a secrets backend.

## What This Package Adds

This provider supplies Airflow's Jira integration points. In practice, the most useful entry point for custom DAG logic is:

- `JiraHook`

The provider also includes Jira operator support for DAGs that prefer a declarative task over a Python task body.

## Install

Install the provider into the same environment as Airflow and keep both versions pinned. The Apache Airflow project recommends installing providers with the matching constraints file for your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.1.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-jira==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i jira
airflow info
```

## Authentication And Connection Setup

Start with a minimal Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

Set the Jira values you want to store in Airflow:

```bash
export JIRA_HOST="https://your-domain.atlassian.net"
export JIRA_USERNAME="<jira-username-or-email>"
export JIRA_API_TOKEN="<jira-password-or-api-token>"
```

Then create the Airflow connection:

```bash
airflow connections add 'jira_default' \
  --conn-type 'jira' \
  --conn-host "$JIRA_HOST" \
  --conn-login "$JIRA_USERNAME" \
  --conn-password "$JIRA_API_TOKEN"
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get jira_default
```

Use the credentials and host format that match your Jira deployment. For example, Jira Cloud commonly uses an account email plus an API token.

## Common Workflow: Create A Jira Issue In A Task

Use `JiraHook` when a task needs normal Python control flow and direct access to Jira client methods.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.jira.hooks.jira import JiraHook


with DAG(
    dag_id="jira_create_issue_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["jira"],
):
    @task()
    def create_issue() -> str:
        hook = JiraHook(jira_conn_id="jira_default")
        jira = hook.get_conn()

        issue = jira.create_issue(
            fields={
                "project": {"key": "ENG"},
                "summary": "Airflow created this Jira issue",
                "description": "Created from an Airflow task using JiraHook.",
                "issuetype": {"name": "Task"},
            }
        )

        return issue.key

    create_issue()
```

Practical points:

- `jira_conn_id` selects the Airflow Jira connection.
- `hook.get_conn()` returns the authenticated Jira client object for the connection.
- The `fields` payload must match the target Jira project's required fields and issue type configuration.
- Returning `issue.key` keeps downstream tasks simple.

## Common Workflow: Read An Issue, Add A Comment, And Transition It

Once you have the issue key, use the same hook to perform follow-up actions.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.jira.hooks.jira import JiraHook


with DAG(
    dag_id="jira_follow_up_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["jira"],
):
    @task()
    def create_issue() -> str:
        hook = JiraHook(jira_conn_id="jira_default")
        jira = hook.get_conn()
        issue = jira.create_issue(
            fields={
                "project": {"key": "ENG"},
                "summary": "Investigate nightly sync failure",
                "description": "Created automatically from Airflow.",
                "issuetype": {"name": "Task"},
            }
        )
        return issue.key

    @task()
    def update_issue(issue_key: str) -> None:
        hook = JiraHook(jira_conn_id="jira_default")
        jira = hook.get_conn()

        issue = jira.issue(issue_key)
        jira.add_comment(issue.key, "Investigation started from Airflow")
        jira.transition_issue(issue.key, "Done")

    update_issue(create_issue())
```

Use this pattern when you want Airflow to open a ticket at the start of a workflow and then annotate or move it later in the same DAG.

## Using `JiraOperator`

If a task only needs to call one Jira client method, the provider's Jira operator can be simpler than writing a Python task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.jira.operators.jira import JiraOperator


with DAG(
    dag_id="jira_operator_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["jira"],
):
    create_issue = JiraOperator(
        task_id="create_issue",
        jira_conn_id="jira_default",
        jira_method="create_issue",
        jira_method_args={
            "fields": {
                "project": {"key": "ENG"},
                "summary": "Create an issue with JiraOperator",
                "description": "This task calls the Jira client method directly.",
                "issuetype": {"name": "Task"},
            }
        },
    )
```

Use the hook form when task behavior depends on normal Python branching or multiple Jira calls. Use the operator form when a task is just one Jira method invocation.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i jira
airflow dags list | grep jira
```

Test a task in isolation while you wire up the connection and issue payload:

```bash
airflow tasks test jira_create_issue_demo create_issue 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream dependencies to participate.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Hard-coding Jira credentials in DAG code: keep them on the Airflow connection instead.
- Using the wrong Jira host format: keep `--conn-host` set to your Jira base URL.
- Omitting required issue fields: many Jira projects require more than `project`, `summary`, and `issuetype`.
- Using a transition name that does not exist for the issue's current workflow state.
- Assuming the Airflow service account can create, comment on, or transition issues without the required Jira permissions.

## Version Notes

- This guide covers `apache-airflow-providers-jira` version `3.1.0`.
- Keep `apache-airflow` pinned when installing or upgrading the provider so dependency resolution does not silently change your Airflow core version.
