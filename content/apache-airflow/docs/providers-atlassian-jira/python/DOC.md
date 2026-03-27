---
name: providers-atlassian-jira
description: "Apache Airflow provider for Jira connections, hooks, operators, sensors, and failure notifications backed by Atlassian's Jira Python API"
metadata:
  languages: "python"
  versions: "3.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,jira,atlassian,hooks,operators,sensors,notifications"
---

# Apache Airflow Atlassian Jira Provider Guide

Use `apache-airflow-providers-atlassian-jira` when an Airflow DAG needs an Airflow-managed Jira connection plus task code, operators, sensors, or failure callbacks that talk to Jira without embedding credentials in the DAG file.

This guide covers provider version `3.3.1`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Jira SDK.
- Keep the Jira base URL, login, password or API token, and SSL verification setting on an Airflow connection such as `jira_default`.
- Use `JiraHook` for most real task logic, and use `JiraOperator`, `JiraTicketSensor`, or `send_jira_notification` when the task shape is already a good fit for those abstractions.
- Pass method names and payloads that exist on the underlying `atlassian-python-api` Jira client.

## What This Package Adds

The provider exposes these main integration points:

- Airflow connection type `jira`
- `JiraHook`
- `JiraOperator`
- `JiraSensor`
- `JiraTicketSensor`
- `send_jira_notification` / `JiraNotifier`

Under the hood, `JiraHook` wraps the Atlassian Jira client from `atlassian-python-api`, so the methods you call from the hook or operator come from that client.

## Install

This provider requires Apache Airflow `>=2.11.0`. For a fresh Airflow environment, use the official constraints file for the Airflow version and Python version you are actually running, then add the provider in a separate pinned install command.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="3.3.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-atlassian-jira==${PROVIDER_VERSION}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i atlassian
python -m pip check
```

Important install notes:

- PyPI lists Python `3.10` through `3.13` for `apache-airflow-providers-atlassian-jira==3.3.1`.
- The provider depends on `atlassian-python-api > 3.41.10`.
- Install the provider in every Airflow environment that parses DAGs or executes tasks importing `airflow.providers.atlassian.jira`.

## Configure A Jira Connection

The Jira connection type uses:

- `host`: Jira base URL, including scheme
- `login`: username used for authentication
- `password`: password or API token
- `extra.verify`: optional boolean SSL verification flag, default `true`

Set the values you want Airflow to store:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

export JIRA_HOST="https://jira.example.com"
export JIRA_USERNAME="airflow@example.com"
export JIRA_API_TOKEN="<jira-password-or-api-token>"
```

Create the Airflow connection:

```bash
airflow connections add 'jira_default' \
  --conn-type 'jira' \
  --conn-host "$JIRA_HOST" \
  --conn-login "$JIRA_USERNAME" \
  --conn-password "$JIRA_API_TOKEN" \
  --conn-extra '{"verify": true}'
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get jira_default
```

Practical notes:

- The Jira host must include the scheme, such as `https://jira.example.com`.
- In provider `3.x`, the `verify` extra is a boolean. Do not pass `"true"` or `"false"` strings.
- The standard Jira connection form only maps `host`, `login`, `password`, and `verify` into `JiraHook`. If your Jira deployment needs more specialized auth settings, verify that the provider supports them before standardizing on this connection type.

## Common Workflow: Create And Update An Issue In Task Code

Use `JiraHook` when task code needs ordinary Python control flow and more than one Jira API call.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.atlassian.jira.hooks.jira import JiraHook


with DAG(
    dag_id="jira_hook_issue_flow",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["jira"],
):
    @task()
    def create_issue() -> str:
        jira = JiraHook(jira_conn_id="jira_default").get_conn()

        issue = jira.create_issue(
            fields={
                "project": {"key": "DATA"},
                "summary": "Airflow detected a pipeline failure",
                "description": "Created from an Airflow task using JiraHook.",
                "issuetype": {"name": "Task"},
                "labels": ["airflow", "incident"],
            }
        )

        return issue["key"]

    @task()
    def update_issue(issue_key: str) -> dict[str, str]:
        jira = JiraHook(jira_conn_id="jira_default").get_conn()

        jira.issue_add_comment(issue_key, "Retry has started from Airflow.")
        jira.set_issue_status(issue_key, "In Progress")

        return {
            "issue_key": issue_key,
            "status": jira.get_issue_status(issue_key),
        }

    update_issue(create_issue())
```

Why this pattern works well:

- `JiraHook(jira_conn_id="jira_default").get_conn()` returns the authenticated Atlassian Jira client.
- The method names such as `create_issue`, `issue_add_comment`, `set_issue_status`, and `get_issue_status` come from `atlassian-python-api`.
- Returning small strings or dicts keeps XCom payloads manageable.

## Common Workflow: Run One Jira Method With `JiraOperator`

Use `JiraOperator` when a task is a single Jira client call and you do not need much Python around it.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.atlassian.jira.operators.jira import JiraOperator


with DAG(
    dag_id="jira_operator_create_issue",
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
                "project": {"key": "DATA"},
                "summary": "Open a Jira issue from JiraOperator",
                "description": "This task calls one Atlassian Jira client method.",
                "issuetype": {"name": "Task"},
            }
        },
    )
```

`jira_method` must be a method that exists on the underlying Jira client, and `jira_method_args` is the dict of keyword arguments passed to that method.

## Common Workflow: Wait For A Ticket To Reach A Status

Use `JiraTicketSensor` when the DAG should pause until one field on a ticket reaches an expected value.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.atlassian.jira.sensors.jira import JiraTicketSensor


with DAG(
    dag_id="jira_wait_for_done",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["jira"],
):
    wait_for_done = JiraTicketSensor(
        task_id="wait_for_done",
        jira_conn_id="jira_default",
        ticket_id="DATA-123",
        field="status",
        expected_value="Done",
        poke_interval=60,
        timeout=60 * 60,
    )
```

`JiraTicketSensor` calls the Jira client's `issue()` method internally and checks `issue["fields"][field]`. For object-like fields such as `status`, it compares the nested `name` value.

If you need a custom wait condition, use `JiraSensor` instead and provide a Jira client method name plus a `result_processor` callback.

## Common Workflow: Create Jira Issues On DAG Or Task Failure

The notifier helper is the cleanest way to open Jira tickets from `on_failure_callback` hooks.

```python
from __future__ import annotations

from datetime import datetime

from airflow import DAG
from airflow.providers.atlassian.jira.notifications.jira import send_jira_notification
from airflow.providers.standard.operators.bash import BashOperator


with DAG(
    dag_id="jira_failure_notifier_demo",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    on_failure_callback=[
        send_jira_notification(
            jira_conn_id="jira_default",
            description="Failure in DAG {{ dag.dag_id }}",
            summary="Airflow DAG failure",
            project_id=10000,
            issue_type_id=10003,
            labels=["airflow-dag-failure"],
        )
    ],
):
    BashOperator(
        task_id="fail_on_purpose",
        bash_command="exit 1",
        retries=0,
        on_failure_callback=[
            send_jira_notification(
                jira_conn_id="jira_default",
                description="Task {{ ti.task_id }} failed in DAG {{ dag.dag_id }}",
                summary="Airflow task failure",
                project_id=10000,
                issue_type_id=10003,
                labels=["airflow-task-failure"],
            )
        ],
    )
```

Use this when the workflow should open a Jira issue automatically instead of adding Jira logic to the task body itself.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i jira
airflow dags list | grep jira
```

Test a task in isolation while you wire up the connection and payload:

```bash
airflow tasks test jira_hook_issue_flow create_issue 2026-03-13
```

Use `airflow tasks test` while you are proving out connection settings, required Jira fields, and task-side logic. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, or downstream dependencies.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Reusing the discontinued `apache-airflow-providers-jira` package name. The maintained package is `apache-airflow-providers-atlassian-jira`.
- Passing a Jira host without `http://` or `https://`.
- Treating `verify` as a string in connection extras. In current provider releases it should be a boolean.
- Assuming every Jira project accepts the same `fields` payload. Required fields and issue types vary by project configuration.
- Passing a method name to `JiraOperator` that exists in some old Jira client examples but not in `atlassian-python-api`.
- Returning full issue payloads or large search results through XCom instead of reducing them to keys, ids, counts, or summaries.

## Version Notes

- This guide covers `apache-airflow-providers-atlassian-jira` version `3.3.1`.
- `3.3.1` requires Apache Airflow `>=2.11.0`.
- The `3.2.0` line added the async Jira notifier; `3.3.1` includes that notifier support.
- The old `apache-airflow-providers-jira` package was discontinued. Its last release points users to `apache-airflow-providers-atlassian-jira`.

## Official Sources

- Provider docs root: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/`
- Package index and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/index.html`
- Jira connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/connections.html`
- Jira notifications how-to: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/notifications/jira-notifier-howto-guide.html`
- `JiraHook` API docs: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/_api/airflow/providers/atlassian/jira/hooks/jira/index.html`
- `JiraOperator` API docs: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/_api/airflow/providers/atlassian/jira/operators/jira/index.html`
- `JiraSensor` and `JiraTicketSensor` API docs: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/_api/airflow/providers/atlassian/jira/sensors/jira/index.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-atlassian-jira/stable/changelog.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-atlassian-jira/`
- Legacy provider package page: `https://pypi.org/project/apache-airflow-providers-jira/`
- Atlassian Jira client methods used by the hook and operator: `https://atlassian-python-api.readthedocs.io/jira.html`
