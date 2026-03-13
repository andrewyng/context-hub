---
name: package
description: "Apache Airflow Zendesk provider for configuring a Zendesk connection and using ZendeskHook in DAG tasks"
metadata:
  languages: "python"
  versions: "4.11.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,zendesk,tickets,support,hooks,dag"
---

# Apache Airflow Zendesk Provider Guide

Use `apache-airflow-providers-zendesk` when an Airflow DAG needs an Airflow-managed Zendesk connection and Python task code that reads tickets or runs Zendesk client calls without hard-coding credentials in the DAG file.

This guide covers provider version `4.11.1`.

## Golden Rule

- Install this provider alongside a pinned `apache-airflow` version; it is not a standalone Zendesk SDK.
- Put your Zendesk base URL and credentials on an Airflow connection such as `zendesk_default`.
- Use `ZendeskHook` inside tasks, then call Zendesk client methods on the object returned by `get_conn()`.
- Return small dicts, ids, or summaries from tasks instead of raw Zendesk resource objects.

## What This Package Adds

This provider centers on Airflow's Zendesk hook integration:

- Airflow connection type `zendesk`
- `ZendeskHook`

For most DAGs, the pattern is simple: configure one Zendesk connection, create `ZendeskHook(zendesk_conn_id="...")` inside a task, call `get_conn()`, and use the authenticated client for ticket or search operations.

## Install

Install the provider into the same environment as Airflow and keep both versions pinned. Apache Airflow recommends installing providers with the matching constraints file for your Airflow and Python versions.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.11.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-zendesk==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful checks after installation:

```bash
airflow providers list | grep -i zendesk
airflow info
```

Every Airflow environment that parses DAGs or executes tasks that import `airflow.providers.zendesk` needs this provider installed.

## Configure A Zendesk Connection

Start with a minimal Airflow environment:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

Set the Zendesk values you want Airflow to store:

```bash
export ZENDESK_HOST="https://example.zendesk.com"
export ZENDESK_EMAIL="agent@example.com"
export ZENDESK_API_TOKEN="<zendesk-api-token>"
```

Then create the Airflow connection:

```bash
airflow connections add 'zendesk_default' \
  --conn-type 'zendesk' \
  --conn-host "$ZENDESK_HOST" \
  --conn-login "$ZENDESK_EMAIL" \
  --conn-password "$ZENDESK_API_TOKEN"
```

Confirm the connection before wiring it into a DAG:

```bash
airflow connections get zendesk_default
```

Keep secrets in Airflow connections, environment-backed secrets, or a secrets backend instead of embedding them in DAG code. Many Zendesk setups use an account email plus an API token; use the credential format your Zendesk account expects.

## Read A Ticket In A Task

Use `ZendeskHook` when task code needs direct Python access to the authenticated Zendesk client.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.zendesk.hooks.zendesk import ZendeskHook


with DAG(
    dag_id="zendesk_read_ticket_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["zendesk"],
):
    @task()
    def read_ticket(ticket_id: int = 12345) -> dict[str, object]:
        hook = ZendeskHook(zendesk_conn_id="zendesk_default")
        client = hook.get_conn()

        ticket = client.tickets(id=ticket_id)

        return {
            "id": ticket.id,
            "subject": ticket.subject,
            "status": ticket.status,
            "priority": ticket.priority,
            "requester_id": ticket.requester_id,
        }

    read_ticket()
```

Practical points:

- `zendesk_conn_id` selects the Airflow connection.
- `hook.get_conn()` returns the authenticated Zendesk client for that connection.
- Convert the returned ticket object into a small serializable dict before sending it through XCom.

## Search Open Tickets From A DAG

For reporting or alerting flows, use the same hook and call the client's search method inside the task body.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.zendesk.hooks.zendesk import ZendeskHook


with DAG(
    dag_id="zendesk_search_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["zendesk"],
):
    @task()
    def find_open_ticket_ids() -> list[int]:
        hook = ZendeskHook(zendesk_conn_id="zendesk_default")
        client = hook.get_conn()

        results = list(
            client.search("type:ticket status<solved", type="ticket")
        )

        return [ticket.id for ticket in results]

    find_open_ticket_ids()
```

Use this pattern when you want Airflow to query Zendesk, filter to a small set of ids or fields, and hand those reduced results to downstream tasks.

## Common Setup Pattern

For most DAGs, the clean split is:

- keep the Zendesk host, email, and token in an Airflow connection
- create `ZendeskHook` inside the task that needs Zendesk access
- call `get_conn()` once per task and use the returned client for normal Zendesk operations
- convert results to small Python values before returning them from the task

If task logic needs more than one Zendesk call, keep those calls in the same task body so the Airflow connection setup and Zendesk client lifecycle stay in one place.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep -i zendesk
airflow dags list | grep zendesk
```

Run an isolated task test while you wire up the connection and ticket lookup:

```bash
airflow tasks test zendesk_read_ticket_demo read_ticket 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream dependencies.

## Common Pitfalls

- Installing only the provider package: you still need a compatible `apache-airflow` installation.
- Hard-coding Zendesk credentials in DAG code instead of using an Airflow connection or secrets backend.
- Using the wrong host value: keep `--conn-host` set to your Zendesk base URL, not a ticket-specific path.
- Returning raw Zendesk client objects from a task. Convert them to ids, lists, or dicts first.
- Pulling large search results into XCom. Reduce the result set inside the task and persist larger payloads outside XCom.
- Assuming every Zendesk account uses the same credential shape. Verify the account's expected auth format before creating the Airflow connection.

## Version Notes

- This guide covers `apache-airflow-providers-zendesk` version `4.11.1`.
- Keep `apache-airflow` pinned when installing or upgrading the provider so dependency resolution does not silently change your Airflow core version.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-zendesk/stable/`
- Airflow installation docs: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-zendesk/`
