---
name: providers-tableau
description: "Apache Airflow Tableau provider guide for configuring Tableau connections and running workbook or datasource refresh jobs from Python DAGs"
metadata:
  languages: "python"
  versions: "5.3.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "apache-airflow,airflow,tableau,python,operators,hooks,sensors"
---

# Apache Airflow Tableau Provider Guide

Use `apache-airflow-providers-tableau` when an Airflow DAG needs to authenticate to Tableau through an Airflow connection, trigger extract refresh jobs for workbooks or datasources, and optionally poll Tableau job status from Airflow tasks.

This guide covers provider version `5.3.3`.

## Golden Rule

- Install this provider into the same Python environment as Airflow; it is not a standalone Tableau SDK.
- Put Tableau credentials on an Airflow connection such as `tableau_default`.
- Use `TableauOperator` for refresh and delete-style actions, and `TableauHook` or `TableauJobStatusSensor` when task code needs more control.
- Prefer username/password or JWT authentication. Do not build new DAGs around Tableau personal access tokens.

## What This Package Adds

The provider exposes three main Airflow integration points:

- `airflow.providers.tableau.operators.tableau.TableauOperator`
- `airflow.providers.tableau.hooks.tableau.TableauHook`
- `airflow.providers.tableau.sensors.tableau.TableauJobStatusSensor`

The provider docs list `tableau_default` as the default connection ID for hooks and operators.

## Install

The provider requires:

- Python `>=3.10`
- Apache Airflow `>=2.11.0`
- `tableauserverclient >=0.27,!=0.39`

Install it into the same environment as Airflow and keep both versions pinned:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.3.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-tableau==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

If Airflow is already installed and pinned, install the provider in a separate command while repeating the Airflow pin so `pip` does not silently move core:

```bash
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-tableau==5.3.3"
```

Useful checks after installation:

```bash
airflow providers list | grep -i tableau
airflow info
```

## Configure A Tableau Connection

The connection type is `tableau`. The important fields are:

- `host`: Tableau Server or Tableau Cloud base URL
- `login` and `password`: for username/password auth
- `extra.site_id`: Tableau site content URL; Tableau Online requires a value, while Tableau Server can use an empty string for the default site
- `extra.verify`: `true`, `false`, or a CA bundle path
- `extra.cert`: optional client certificate path or cert/key pair

### Username/password authentication

```bash
export AIRFLOW_CONN_TABLEAU_DEFAULT='{
  "conn_type": "tableau",
  "host": "https://MY-TABLEAU-SERVER",
  "login": "tableau-user@example.com",
  "password": "your-tableau-password",
  "extra": {
    "site_id": "MarketingTeam",
    "verify": true
  }
}'
```

### JWT authentication

Current provider code enables JWT auth when connection extra includes `auth: "jwt"` and exactly one of `jwt_file` or `jwt_token`.

```bash
export AIRFLOW_CONN_TABLEAU_DEFAULT='{
  "conn_type": "tableau",
  "host": "https://MY-TABLEAU-SERVER",
  "extra": {
    "auth": "jwt",
    "site_id": "MarketingTeam",
    "jwt_file": "/opt/airflow/secrets/tableau.jwt",
    "verify": true
  }
}'
```

If you want to store the token directly instead of a file path:

```bash
export AIRFLOW_CONN_TABLEAU_DEFAULT='{
  "conn_type": "tableau",
  "host": "https://MY-TABLEAU-SERVER",
  "extra": {
    "auth": "jwt",
    "site_id": "MarketingTeam",
    "jwt_token": "eyJhbGciOi...",
    "verify": true
  }
}'
```

Confirm the connection Airflow will use:

```bash
airflow connections get tableau_default
```

## Refresh A Workbook

`TableauOperator` is the simplest path when you want Airflow to trigger a workbook extract refresh.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.tableau.operators.tableau import TableauOperator


with DAG(
    dag_id="tableau_refresh_workbook",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["tableau"],
):
    refresh_workbook = TableauOperator(
        task_id="refresh_workbook",
        tableau_conn_id="tableau_default",
        resource="workbooks",
        method="refresh",
        find="Finance Workbook",
        match_with="name",
        blocking_refresh=True,
        check_interval=20,
    )
```

Key arguments:

- `resource="workbooks"` or `resource="datasources"` for refresh jobs
- `method="refresh"`
- `find`: the workbook or datasource identifier to act on
- `match_with="id"` if `find` is already a Tableau object id, or `match_with="name"` when resolving by name
- `blocking_refresh=True` to wait for Tableau job completion in the operator itself

## Refresh A Datasource Asynchronously

Set `blocking_refresh=False` when you want the operator to return the Tableau job id immediately and let a sensor watch the job separately.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.tableau.operators.tableau import TableauOperator
from airflow.providers.tableau.sensors.tableau import TableauJobStatusSensor


with DAG(
    dag_id="tableau_refresh_datasource_async",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["tableau"],
):
    start_refresh = TableauOperator(
        task_id="start_refresh",
        tableau_conn_id="tableau_default",
        resource="datasources",
        method="refresh",
        find="sales_extract_ds",
        match_with="id",
        blocking_refresh=False,
    )

    wait_for_refresh = TableauJobStatusSensor(
        task_id="wait_for_refresh",
        tableau_conn_id="tableau_default",
        job_id=start_refresh.output,
    )

    start_refresh >> wait_for_refresh
```

This is the cleanest pattern when the refresh can take a while and you want the Airflow graph to show a separate polling step.

## Use `TableauHook` Inside A Python Task

Use the hook when you need direct Python access to the authenticated Tableau server client or when you need to inspect jobs yourself.

The hook is designed to be used as a context manager. On entry it signs in, and on exit it signs out.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.tableau.hooks.tableau import TableauHook


with DAG(
    dag_id="tableau_list_workbooks",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["tableau"],
):
    @task()
    def fetch_workbooks() -> list[dict[str, str | None]]:
        with TableauHook(tableau_conn_id="tableau_default") as hook:
            workbooks = hook.get_all("workbooks")

            return [
                {
                    "id": workbook.id,
                    "name": workbook.name,
                    "project": workbook.project_name,
                    "url": workbook.webpage_url,
                }
                for workbook in workbooks
            ]

    fetch_workbooks()
```

Polling a job manually from task code looks like this:

```python
from airflow.providers.tableau.hooks.tableau import TableauHook


def get_refresh_status(job_id: str) -> str:
    with TableauHook(tableau_conn_id="tableau_default") as hook:
        return hook.get_job_status(job_id).name
```

## Common Patterns

### Put site selection on the connection unless a DAG truly needs overrides

`TableauHook(site_id=...)` and `TableauOperator(site_id=...)` can override the site at runtime, but most teams should keep `site_id` in the Airflow connection so the DAG code stays portable across environments.

### Use Tableau IDs when you already know them

When `match_with="id"`, the operator uses `find` directly. When you switch to a field like `name`, the operator pages through the resource collection to find a match. Use ids for stable automation when possible.

### Keep returned values small

A Tableau refresh can produce a job id, and hook calls can expose rich Tableau objects. Return ids, names, and summaries from tasks instead of raw client objects.

## Common Pitfalls

- Do not install this provider by itself and assume Airflow will appear; it extends an existing Airflow installation.
- Do not rely on Tableau personal access token extras for new work. The connection page still documents them as deprecated, but provider `5.0.0` removed personal access token authentication and current `5.3.3` hook code only authenticates with username/password or JWT.
- For JWT auth, set `extra.auth` to `"jwt"` and provide exactly one of `jwt_file` or `jwt_token`. Supplying both or neither fails.
- Tableau Online requires a non-empty `site_id`. An empty string is only for the default Tableau Server site.
- If you use `match_with="name"`, duplicate workbook or datasource names can resolve unpredictably. Prefer ids for repeatable DAG behavior.
- The provider excludes `tableauserverclient==0.39`; do not force that version back into your environment.
- Use `with TableauHook(...) as hook:` for direct hook usage so Airflow signs out cleanly after the task finishes.

## Version Notes For `5.3.3`

- PyPI lists `apache-airflow-providers-tableau==5.3.3` as the current stable release, published on February 14, 2026.
- Provider `5.3.3` supports Python `3.10` through `3.13`.
- The provider minimum Airflow version is `2.11.0`.
- Provider `5.2.0` added JWT authentication support.
- Provider `5.3.3` specifically excludes `tableauserverclient==0.39`.

## Official Sources

- Provider docs root: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/
- Provider index and requirements: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/index.html
- Tableau connection docs: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/connections/tableau.html
- Tableau operator guide: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/operators.html
- `TableauHook` API reference: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/_api/airflow/providers/tableau/hooks/tableau/index.html
- `TableauHook` source: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/_modules/airflow/providers/tableau/hooks/tableau.html
- `TableauOperator` source: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/_modules/airflow/providers/tableau/operators/tableau.html
- `TableauJobStatusSensor` source: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/_modules/airflow/providers/tableau/sensors/tableau.html
- Provider changelog: https://airflow.apache.org/docs/apache-airflow-providers-tableau/stable/changelog.html
- Airflow installation from PyPI: https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html
- PyPI package page: https://pypi.org/project/apache-airflow-providers-tableau/
