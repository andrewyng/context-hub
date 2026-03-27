---
name: providers-qubole
description: "Apache Airflow Qubole provider for running Qubole commands, checks, and sensors from Airflow DAGs"
metadata:
  languages: "python"
  versions: "3.4.3"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,qubole,dag,operators,sensors,checks"
---

# Apache Airflow Qubole Provider Guide

Use `apache-airflow-providers-qubole` when an existing Airflow deployment needs to submit commands to Qubole, run simple result checks, or wait for Qubole-managed files and partitions.

## Golden Rule

- Treat this provider as a maintenance-time integration for Airflow 2 environments, not a new Airflow 3 authoring target.
- Install it alongside `apache-airflow`; it is not a standalone Qubole SDK.
- Put the Qubole API endpoint and auth token on an Airflow `qubole` connection, then keep DAG code focused on `command_type`, query or script arguments, and task flow.
- Pin the provider version. Upstream marks `3.4.3` as the last release and says the provider is no longer being updated.

## What This Package Adds

The provider documents these main entry points:

- `QuboleOperator` for running Qubole commands
- `QuboleCheckOperator` and `QuboleValueCheckOperator` for data-quality style checks
- `QuboleFileSensor` and `QubolePartitionSensor` for waiting on files and Hive-style partitions
- `QuboleHook` for lower-level access to Qubole commands from Python code

## Install

Install the provider into the same Airflow environment used by your scheduler, webserver, and workers. The provider docs state that it requires Airflow `2.5.0` or newer.

Use the Airflow constraints file that matches your Airflow version:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-2.x-version>"
PROVIDER_VERSION="3.4.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-qubole==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Useful check after installation:

```bash
airflow providers list | grep -i qubole
```

## Configure The Airflow Connection

The provider's connection type is `qubole`. In the connection form, upstream maps:

- `Host` to the Qubole API endpoint
- `Password` to the Qubole auth token

A practical environment-variable setup is:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
export AIRFLOW_CONN_QUBOLE_DEFAULT='{
  "conn_type": "qubole",
  "host": "https://api.qubole.com/api",
  "password": "your-qubole-api-token"
}'
```

With that environment variable:

- the Airflow connection id is `qubole_default`
- `QuboleOperator` uses `qubole_conn_id="qubole_default"` by default
- DAG code does not need to embed the endpoint or token directly

If you create the connection in the Airflow UI instead, use connection type `qubole` and put the same values in `Host` and `Password`.

## Run A Qubole Command With `QuboleOperator`

Use `QuboleOperator` when the task should submit a Qubole command and wait for it to finish.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.qubole.operators.qubole import QuboleOperator

with DAG(
    dag_id="qubole_hive_query",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    run_daily_summary = QuboleOperator(
        task_id="run_daily_summary",
        qubole_conn_id="qubole_default",
        command_type="hivecmd",
        query="""
        SELECT dt, COUNT(*) AS row_count
        FROM analytics.events
        WHERE dt = '{{ ds }}'
        GROUP BY dt
        """,
        cluster_label="{{ var.value.qubole_cluster_label }}",
        fetch_logs=True,
    )
```

Common command arguments from the provider docs:

- `command_type` selects the Qubole command family such as `hivecmd`, `presto`, or `sparkcmd`
- `query` sends inline SQL
- `script_location` points to a script stored in Qubole-accessible storage
- `cluster_label` selects the Qubole cluster label
- `fetch_logs=True` streams Qubole logs back into the Airflow task logs

If the query body is large, the operator supports templated `.txt` files as well as inline strings.

## Run Checks With `QuboleCheckOperator` And `QuboleValueCheckOperator`

Use the check operators when a DAG should fail fast on an unexpected query result.

`QuboleCheckOperator` expects a truthy first row:

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.qubole.operators.qubole_check import QuboleCheckOperator

with DAG(
    dag_id="qubole_check_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    row_count_present = QuboleCheckOperator(
        task_id="row_count_present",
        qubole_conn_id="qubole_default",
        command_type="hivecmd",
        query="SELECT COUNT(*) > 0 FROM analytics.events WHERE dt = '{{ ds }}'",
    )
```

`QuboleValueCheckOperator` compares a scalar result with an expected value:

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.qubole.operators.qubole_check import QuboleValueCheckOperator

with DAG(
    dag_id="qubole_value_check_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    expected_partition_count = QuboleValueCheckOperator(
        task_id="expected_partition_count",
        qubole_conn_id="qubole_default",
        command_type="hivecmd",
        query="SELECT COUNT(*) FROM analytics.events WHERE dt = '{{ ds }}'",
        pass_value=1,
        tolerance=0,
    )
```

## Wait For Files Or Partitions

Use the provider sensors when downstream tasks should not run until a Qubole-managed artifact exists.

```python
from datetime import datetime

from airflow import DAG
from airflow.providers.qubole.sensors.qubole import (
    QuboleFileSensor,
    QubolePartitionSensor,
)

with DAG(
    dag_id="qubole_sensor_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    wait_for_export = QuboleFileSensor(
        task_id="wait_for_export",
        qubole_conn_id="qubole_default",
        location="s3://analytics-exports/events/dt={{ ds }}/",
    )

    wait_for_partition = QubolePartitionSensor(
        task_id="wait_for_partition",
        qubole_conn_id="qubole_default",
        table="analytics.events",
        ds="dt='{{ ds }}'",
    )

    wait_for_export >> wait_for_partition
```

## Use `QuboleHook` In Python Code

Reach for `QuboleHook` only when a task needs lower-level access than the operators provide.

```python
from airflow.decorators import task
from airflow.providers.qubole.hooks.qubole import QuboleHook

@task
def submit_with_hook() -> None:
    hook = QuboleHook(
        command_type="hivecmd",
        qubole_conn_id="qubole_default",
        query="SELECT 1",
    )
    hook.execute(context={})
```

For most DAGs, start with `QuboleOperator` instead. It is the simpler and better-documented path.

## Pitfalls

- `3.4.3` is the provider's final release. Upstream says the package has been removed and will not be updated anymore, so pin the version instead of expecting forward fixes.
- This provider is documented against Airflow 2. Its examples and imports use `from airflow import DAG`, not the Airflow 3 public authoring API in `airflow.sdk`.
- Install the provider everywhere DAG code is imported or executed. Scheduler-only installation is not enough.
- The documented connection fields are unusual: `Host` is the Qubole API endpoint and `Password` is the auth token.
- The operator's default failure and retry handlers cancel the running Qubole command. Override that behavior only if you intentionally want Qubole work to keep running after Airflow marks the task failed or retrying.
- Keep tokens out of DAG files. Use Airflow connections, variables, or a secrets backend instead of literal credentials in Python source.

## Version Notes

- This guide targets `apache-airflow-providers-qubole` version `3.4.3`.
- The provider changelog marks `3.4.3` as the last release.
- The `3.4.1` release dropped Python 3.7 support, so older Airflow images pinned to Python 3.7 need both a Python upgrade and an older provider version.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/`
- Installation and package metadata: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/index.html`
- Qubole connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/connections/qubole.html`
- Operators and sensors overview: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/operators.html`
- `QuboleHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/_api/airflow/providers/qubole/hooks/qubole/index.html`
- Sensor API reference: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/_api/airflow/providers/qubole/sensors/qubole/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-qubole/stable/changelog.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-qubole/3.4.3/`
