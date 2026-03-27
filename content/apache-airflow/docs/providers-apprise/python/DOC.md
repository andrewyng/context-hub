---
name: providers-apprise
description: "Apache Airflow provider for routing DAG and task notifications through Apprise-backed services such as Slack, email, and other Apprise URLs"
metadata:
  languages: "python"
  versions: "2.3.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,apprise,notifications,alerts,python"
---

# apache-airflow-providers-apprise

Use `apache-airflow-providers-apprise` when Airflow should send DAG or task notifications through Apprise instead of wiring each target service directly in DAG code.

This package extends Apache Airflow. It is not a standalone notification SDK for non-Airflow applications.

This guide targets provider version `2.3.1`.

## What This Package Adds

The Apprise provider gives Airflow an Apprise-backed connection type plus two practical entry points:

- `send_apprise_notification(...)` for DAG-level or task-level callbacks
- `AppriseHook` for sending notifications from Python task code

Apprise itself handles the target service URLs. Airflow stores those service definitions in an Airflow connection, usually `apprise_default`.

## Install

The provider docs say this release requires:

- `apache-airflow>=2.11.0`
- `apache-airflow-providers-common-compat>=1.9.0`
- `apprise>=1.8.0`

Install Airflow first with the official constraints file, then add the provider in a separate command while keeping your Airflow version pinned:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apprise==2.3.1"
```

If you want the cross-provider extra explicitly, upstream also publishes:

```bash
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apprise[common.compat]==2.3.1"
```

Useful checks after installation:

```bash
airflow providers list | grep apprise
python -c "from airflow.providers.apprise.hooks.apprise import AppriseHook"
```

## Configure The Apprise Connection

By default, the hook and notifier use the Airflow connection id `apprise_default`.

The provider expects the Airflow connection to carry a `config` value in `extra`. That `config` must be either:

- one object with `path` and optional `tag`
- a list of those objects

Single-service example from an environment variable:

```bash
export AIRFLOW_CONN_APPRISE_DEFAULT='{"extra": {"config": {"path": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX", "tag": "ops"}}}'
```

Multiple-service example:

```bash
export AIRFLOW_CONN_APPRISE_DEFAULT='{"extra": {"config": [{"path": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX", "tag": "ops"}, {"path": "mailto://user:password@example.com", "tag": "email"}]}}'
```

Important detail: use `tag`, not `tags`, inside each config object. The connection guide shows an environment-variable example with `tags`, but the provider hook reads the singular key `tag`.

If you prefer the Airflow UI, create a connection with:

- Connection Id: `apprise_default`
- Connection Type: `apprise`
- Config: JSON like `{"path": "service url", "tag": "ops"}` or a JSON list of those objects

Use tags when one Airflow connection should route different notifications to different targets.

## Send Callback Notifications With `send_apprise_notification`

Use `send_apprise_notification(...)` when notifications are a side effect of task or DAG state changes.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apprise.notifications.apprise import send_apprise_notification
from apprise import NotifyFormat, NotifyType
from pendulum import datetime


with DAG(
    dag_id="apprise_callback_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    on_success_callback=[
        send_apprise_notification(
            body="DAG {{ dag.dag_id }} succeeded for run {{ run_id }}",
            title="Airflow DAG success",
            notify_type=NotifyType.SUCCESS,
            body_format=NotifyFormat.MARKDOWN,
            tag="ops",
            apprise_conn_id="apprise_default",
        )
    ],
) as dag:
    @task(
        on_failure_callback=[
            send_apprise_notification(
                body=(
                    "Task {{ ti.task_id }} failed in DAG {{ dag.dag_id }}\n"
                    "Run id: {{ run_id }}\n"
                    "Log URL: {{ ti.log_url }}"
                ),
                title="Airflow task failure",
                notify_type=NotifyType.FAILURE,
                tag="ops",
            )
        ]
    )
    def run_job() -> None:
        print("work finished")

    run_job()
```

Parameters worth setting explicitly:

- `body`: required notification body; template fields are supported
- `title`: optional title
- `notify_type`: one of Apprise's `info`, `success`, `failure`, or `warning`
- `body_format`: `text`, `html`, or `markdown`
- `tag`: which tagged services inside the connection should receive the message
- `apprise_conn_id`: override the default connection when needed

Use callback notifications when you do not want a separate "notification task" in the DAG graph.

## Send Notifications From Python With `AppriseHook`

Use the hook when the message content depends on Python-side logic or task output.

```python
from airflow import DAG
from airflow.decorators import get_current_context, task
from airflow.providers.apprise.hooks.apprise import AppriseHook
from apprise import NotifyFormat, NotifyType
from pendulum import datetime


with DAG(
    dag_id="apprise_hook_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def notify_ops() -> None:
        context = get_current_context()

        hook = AppriseHook(apprise_conn_id="apprise_default")
        hook.notify(
            body=(
                f"DAG {context['dag'].dag_id} completed task "
                f"{context['ti'].task_id} for run {context['run_id']}"
            ),
            title="Airflow notification",
            notify_type=NotifyType.INFO,
            body_format=NotifyFormat.TEXT,
            tag="ops",
        )

    notify_ops()
```

`AppriseHook.notify(...)` accepts the same practical options as the notifier, including `body`, `title`, `notify_type`, `body_format`, `tag`, `attach`, `interpret_escapes`, and an optional `config` object if you want to bypass the Airflow connection entirely.

Use `attach` only for files that exist in the worker runtime where the task executes.

## Operational Checks

Check that Airflow can see the provider and parse the DAG:

```bash
airflow providers list | grep apprise
airflow dags list | grep apprise
```

Then run a task-level test:

```bash
airflow tasks test apprise_hook_example notify_ops 2026-03-13
```

Use `airflow tasks test` for import errors, connection lookup problems, and message-shape debugging before you rely on scheduler-driven callbacks.

## Common Pitfalls

- Installing only the provider package: you still need a compatible Airflow installation, and this provider now requires Airflow `2.11.0` or newer.
- Installing the provider only on the scheduler: workers and any other process that imports DAG files also need it.
- Putting the service definitions anywhere except the Apprise connection `config` field or an explicit `config=` object passed to the hook/notifier.
- Using `tags` instead of `tag` in the config payload.
- Expecting a tagged notification to reach every service: `tag="ops"` sends only to services configured with that tag.
- Passing attachment paths that do not exist in the worker container or host filesystem.

## Version Notes

- This guide covers `apache-airflow-providers-apprise` version `2.3.1`.
- Upstream's changelog says `2.3.0` raised the minimum supported Airflow version to `2.11.0`; that still applies to `2.3.1`.
- Upstream's changelog says `2.2.0` added async Apprise notifier support. The notifier class in `2.3.1` includes both `notify(...)` and `async_notify(...)`.

## Official Docs

- Provider index: `https://airflow.apache.org/docs/apache-airflow-providers-apprise/stable/index.html`
- Connection guide: `https://airflow.apache.org/docs/apache-airflow-providers-apprise/stable/connections.html`
- Notification how-to: `https://airflow.apache.org/docs/apache-airflow-providers-apprise/stable/notifications/apprise_notifier_howto_guide.html`
- Hook API: `https://airflow.apache.org/docs/apache-airflow-providers-apprise/stable/_api/airflow/providers/apprise/hooks/apprise/index.html`
- Airflow installation from PyPI: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- Provider changelog: `https://airflow.apache.org/docs/apache-airflow-providers-apprise/stable/changelog.html`
- PyPI package: `https://pypi.org/project/apache-airflow-providers-apprise/`
