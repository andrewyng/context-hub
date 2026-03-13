---
name: package
description: "Apache Airflow provider for configuring Salesforce connections and using SalesforceHook in DAG tasks"
metadata:
  languages: "python"
  versions: "5.12.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,salesforce,soql,crm,hooks,dag"
---

# Apache Airflow Salesforce Provider Guide

Use `apache-airflow-providers-salesforce` when an Airflow DAG needs an Airflow-managed Salesforce connection and Python task code that runs SOQL or creates and updates Salesforce records without embedding credentials in the DAG file.

This guide covers provider version `5.12.2`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Salesforce SDK.
- Put Salesforce credentials on an Airflow connection such as `salesforce_default`.
- Use `SalesforceHook` inside tasks, then call `get_conn()` to get the authenticated Salesforce client.
- Return small dicts, ids, or summaries from tasks instead of raw client objects or large query payloads.

## What This Package Adds

This provider centers on Airflow's Salesforce integration:

- Airflow connection type `salesforce`
- `SalesforceHook`

For most DAGs, the pattern is simple: configure one Airflow Salesforce connection, create `SalesforceHook(salesforce_conn_id="...")` inside the task body, call `get_conn()`, and use the returned Salesforce client for normal SOQL and sObject operations.

## Install

Install the provider into the same environment as Airflow and keep both versions pinned. Airflow recommends installing providers with the constraints file for your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="5.12.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-salesforce==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i salesforce
airflow info
```

Every Airflow environment that parses DAGs or executes tasks that import `airflow.providers.salesforce` needs this provider installed.

## Configure A Salesforce Connection

The practical setup is to keep the Salesforce username in the connection login, the password in the connection password, and the Salesforce security token plus login domain in connection extras.

Set the values you want Airflow to store:

```bash
export SALESFORCE_USERNAME="user@example.com"
export SALESFORCE_PASSWORD="<salesforce-password>"
export SALESFORCE_SECURITY_TOKEN="<salesforce-security-token>"
export SALESFORCE_DOMAIN="login"   # use test for a sandbox org
```

Then create the Airflow connection:

```bash
airflow connections add 'salesforce_default' \
  --conn-type 'salesforce' \
  --conn-login "$SALESFORCE_USERNAME" \
  --conn-password "$SALESFORCE_PASSWORD" \
  --conn-extra "{\"security_token\":\"${SALESFORCE_SECURITY_TOKEN}\",\"domain\":\"${SALESFORCE_DOMAIN}\"}"
```

You can also provide the same connection through an environment variable:

```bash
export AIRFLOW_CONN_SALESFORCE_DEFAULT='{
  "conn_type": "salesforce",
  "login": "user@example.com",
  "password": "<salesforce-password>",
  "extra": {
    "security_token": "<salesforce-security-token>",
    "domain": "login"
  }
}'
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get salesforce_default
```

Keep Salesforce secrets in Airflow connections, environment-backed secrets, or a secrets backend instead of putting them in DAG code.

## Run A SOQL Query In A Task

Use `SalesforceHook` when task code needs direct Python access to the authenticated Salesforce client.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.salesforce.hooks.salesforce import SalesforceHook


with DAG(
    dag_id="salesforce_query_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["salesforce"],
):
    @task()
    def fetch_accounts() -> list[dict[str, str | None]]:
        hook = SalesforceHook(salesforce_conn_id="salesforce_default")
        client = hook.get_conn()

        result = client.query(
            "SELECT Id, Name, Type FROM Account ORDER BY LastModifiedDate DESC LIMIT 10"
        )

        return [
            {
                "id": record["Id"],
                "name": record["Name"],
                "type": record.get("Type"),
            }
            for record in result["records"]
        ]

    fetch_accounts()
```

Practical points:

- `salesforce_conn_id` selects the Airflow connection.
- `hook.get_conn()` returns the authenticated Salesforce client for that connection.
- `query()` returns a response payload that includes a `records` list.
- Reduce the payload before returning it so XCom stays small and serializable.

## Create And Update A Record

The same client can perform normal sObject operations inside a task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.salesforce.hooks.salesforce import SalesforceHook


with DAG(
    dag_id="salesforce_write_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["salesforce"],
):
    @task()
    def create_and_update_lead() -> str:
        hook = SalesforceHook(salesforce_conn_id="salesforce_default")
        client = hook.get_conn()

        created = client.Lead.create(
            {
                "LastName": "Airflow Example",
                "Company": "Context Hub",
                "Email": "airflow@example.com",
            }
        )
        lead_id = created["id"]

        client.Lead.update(
            lead_id,
            {
                "Title": "Data Engineer",
            },
        )

        return lead_id

    create_and_update_lead()
```

Use this pattern when you want Airflow to create a CRM object as part of a workflow and then hand the created record id to downstream tasks.

## Common Setup Pattern

For most DAGs, the clean split is:

- keep the Salesforce username, password, security token, and domain on an Airflow connection
- create `SalesforceHook` inside the task that needs Salesforce access
- call `get_conn()` once per task and use the returned client for normal SOQL or sObject operations
- convert results to small Python values before returning them from the task

If task logic needs more than one Salesforce API call, keep those calls in the same task body so the connection setup and client lifecycle stay in one place.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i salesforce
airflow dags list | grep salesforce
```

Run an isolated task test while you wire up the connection and query:

```bash
airflow tasks test salesforce_query_demo fetch_accounts 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream dependencies.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Hard-coding Salesforce credentials in DAG code instead of using an Airflow connection or secrets backend.
- Using `login` for a sandbox org instead of `test` in the connection extras.
- Omitting the Salesforce security token when the org requires it for username-password authentication.
- Returning raw Salesforce client objects or very large query results from a task.
- Writing SOQL against UI labels instead of Salesforce API object and field names.

## Version Notes

- This guide covers `apache-airflow-providers-salesforce` version `5.12.2`.
- Keep `apache-airflow` pinned when installing or upgrading the provider so dependency resolution does not silently change your Airflow core version.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-salesforce/stable/`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-salesforce/`
