---
name: package
description: "Apache Airflow Segment provider for sending Identify and Track calls from DAG tasks through Airflow connections"
metadata:
  languages: "python"
  versions: "3.9.2"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,segment,analytics,customer-data,dag"
---

# apache-airflow-providers-segment

Use `apache-airflow-providers-segment` when an Airflow DAG needs to send Segment user identification and tracking events through an Airflow connection instead of calling Segment directly from ad hoc HTTP code.

This package extends Apache Airflow. It is not the standalone Segment Python SDK for general applications.

This guide targets provider version `3.9.2`.

## Install

Install the provider into the same Python environment or container image used by every Airflow component that imports DAGs or executes tasks.

If you already have Airflow installed, keep `apache-airflow` pinned when adding the provider:

```bash
python -m pip install \
  "apache-airflow==<your-airflow-version>" \
  "apache-airflow-providers-segment==3.9.2"
```

If you are creating a fresh Airflow environment, start with Airflow's official constraints workflow and add the provider in the same environment.

Useful checks after installation:

```bash
airflow providers list | grep segment
airflow info
```

## Configure A Segment Connection

The provider uses an Airflow connection for Segment credentials. In practice, the secret you need is the Segment write key.

Set the write key in an environment variable first:

```bash
export SEGMENT_WRITE_KEY="<your-segment-write-key>"
```

Then create the Airflow connection:

```bash
airflow connections add 'segment_default' \
  --conn-type 'segment' \
  --conn-password "$SEGMENT_WRITE_KEY"
```

Confirm the connection exists:

```bash
airflow connections get segment_default
```

Most examples use `segment_default`, but DAG code can point to any connection id with `segment_conn_id`.

## Common Workflow: Identify A User

Use `SegmentIdentifyUserOperator` when a DAG needs to set or update traits for a known user.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.segment.operators.segment import SegmentIdentifyUserOperator


with DAG(
    dag_id="segment_identify_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["segment"],
):
    identify_user = SegmentIdentifyUserOperator(
        task_id="identify_user",
        segment_conn_id="segment_default",
        user_id="user-123",
        traits={
            "email": "user@example.com",
            "plan": "pro",
            "company": "Example Co",
        },
    )
```

Use this operator when the task is declarative and the payload is known when the DAG is parsed.

## Common Workflow: Track An Event

Use `SegmentTrackEventOperator` to emit an event with an event name and properties.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.segment.operators.segment import (
    SegmentIdentifyUserOperator,
    SegmentTrackEventOperator,
)


with DAG(
    dag_id="segment_track_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["segment"],
):
    identify_user = SegmentIdentifyUserOperator(
        task_id="identify_user",
        segment_conn_id="segment_default",
        user_id="user-123",
        traits={"email": "user@example.com", "plan": "pro"},
    )

    track_signup = SegmentTrackEventOperator(
        task_id="track_signup",
        segment_conn_id="segment_default",
        user_id="user-123",
        event="Signed Up",
        properties={
            "plan": "pro",
            "source": "airflow",
        },
    )

    identify_user >> track_signup
```

This is the usual pattern when Airflow should mark a business event such as signup completion, invoice payment, or subscription upgrade.

## Use `SegmentHook` Inside A Python Task

Use the hook when the Segment payload depends on normal Python logic inside the task body.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.decorators import task
from airflow.providers.segment.hooks.segment import SegmentHook


with DAG(
    dag_id="segment_hook_demo",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["segment"],
):
    @task()
    def send_invoice_paid_event() -> None:
        hook = SegmentHook(segment_conn_id="segment_default")

        hook.identify(
            user_id="user-123",
            traits={
                "email": "user@example.com",
                "plan": "pro",
            },
        )

        hook.track(
            user_id="user-123",
            event="Invoice Paid",
            properties={
                "invoice_id": "inv_123",
                "amount": 4999,
                "currency": "usd",
            },
        )

    send_invoice_paid_event()
```

Use the operator form when you want a clear DAG node with a fixed payload. Use the hook form when the event body depends on Python logic, branching, or data loaded earlier in the task.

## Operational Checks

Check that Airflow can see the provider, the connection, and the DAG:

```bash
airflow providers list | grep segment
airflow connections get segment_default
airflow dags list | grep segment
```

Run an isolated task test while you wire up the connection and payload:

```bash
airflow tasks test segment_track_demo track_signup 2026-03-12
```

Use `airflow tasks test` for task-level debugging. Trigger the DAG normally when you need scheduler behavior, retries, callbacks, and downstream tasks.

## Common Pitfalls

- Install the provider everywhere DAG code runs. A working local import does not help if the scheduler or workers are missing the package.
- Keep the Segment write key in the Airflow connection or a secrets backend instead of embedding it in DAG code.
- Pass the connection id explicitly with `segment_conn_id` when a DAG does not use `segment_default`.
- Keep `traits` and `properties` to normal JSON-serializable values so task payloads stay predictable.
- If downstream systems expect user traits before an event arrives, send identify data before the related track event.
- Keep `apache-airflow` pinned when installing or upgrading the provider so dependency resolution does not silently change Airflow core.

## Version Notes

- This guide covers `apache-airflow-providers-segment` version `3.9.2`.
- Provider packages track Airflow compatibility separately from your DAG code. Check the provider's own docs and release notes before upgrading it independently of Airflow.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-segment/stable/`
- Segment connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-segment/stable/connections/segment.html`
- Operators API reference: `https://airflow.apache.org/docs/apache-airflow-providers-segment/stable/_api/airflow/providers/segment/operators/segment/index.html`
- Hook API reference: `https://airflow.apache.org/docs/apache-airflow-providers-segment/stable/_api/airflow/providers/segment/hooks/segment/index.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-segment/`
