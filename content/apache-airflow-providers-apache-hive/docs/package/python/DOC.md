---
name: package
description: "Apache Airflow Hive provider for Hive CLI, HiveServer2, and metastore-driven DAG tasks"
metadata:
  languages: "python"
  versions: "9.3.0"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,apache-airflow,hive,hiveserver2,metastore,dag,python"
---

# apache-airflow-providers-apache-hive

Use `apache-airflow-providers-apache-hive` when an Airflow DAG needs to run Hive SQL, wait for Hive partitions to appear, or read Hive metadata from Python task code.

This package is an Airflow provider, not a standalone Hive client for ordinary Python applications.

This guide targets provider version `9.3.0`.

## Install

Install the provider into the same Python environment or container image as `apache-airflow`. In practice, that means the scheduler, webserver, and every worker that imports DAG code must have the provider available.

Pin Airflow and the provider together, and use the Airflow constraints file for your Airflow version:

```bash
AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="9.3.0"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-hive==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

## Choose The Right Interface

This provider exposes three common integration paths:

- `HiveOperator` and `HiveCliHook`: run HQL through the Hive CLI or Beeline from an Airflow task
- `HivePartitionSensor` and metastore hooks: wait for partitions and inspect table metadata through the Hive metastore
- `HiveServer2Hook`: query Hive from Python task code over HiveServer2

Most DAGs use one of these patterns:

- run HQL with `HiveOperator`
- wait for a partition with `HivePartitionSensor`
- inspect table state with `HiveMetastoreHook`

## Configure Airflow Connections

Keep hostnames, usernames, Kerberos details, and SSL settings in Airflow connections instead of hard-coding them in DAG files.

Typical connection ids used by this provider:

- `hive_cli_default` for `HiveOperator` and `HiveCliHook`
- `hiveserver2_default` for `HiveServer2Hook`
- `metastore_default` for metastore hooks and partition sensors

Example environment-variable connections:

```bash
export AIRFLOW_CONN_HIVE_CLI_DEFAULT='{"conn_type":"hive_cli","host":"hs2.example.com","port":10000,"login":"airflow","schema":"default","extra":{"use_beeline":true}}'

export AIRFLOW_CONN_HIVESERVER2_DEFAULT='{"conn_type":"hiveserver2","host":"hs2.example.com","port":10000,"login":"airflow","schema":"default"}'

export AIRFLOW_CONN_METASTORE_DEFAULT='{"conn_type":"hive_metastore","host":"metastore.example.com","port":9083}'
```

If your cluster uses Kerberos, SSL, LDAP, or custom Beeline options, put those values in the connection extras rather than embedding them in Python code.

## Run Hive SQL In A DAG

Use `HiveOperator` when the task should execute HQL as part of the DAG.

```python
from airflow import DAG
from airflow.providers.apache.hive.operators.hive import HiveOperator
from pendulum import datetime

with DAG(
    dag_id="hive_load_daily_partition",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False,
) as dag:
    create_table = HiveOperator(
        task_id="create_table",
        hive_cli_conn_id="hive_cli_default",
        hql="""
        CREATE TABLE IF NOT EXISTS analytics.events (
            user_id STRING,
            event_name STRING
        )
        PARTITIONED BY (ds STRING)
        STORED AS PARQUET
        """,
    )

    load_partition = HiveOperator(
        task_id="load_partition",
        hive_cli_conn_id="hive_cli_default",
        hql="""
        INSERT OVERWRITE TABLE analytics.events PARTITION (ds='${hiveconf:ds}')
        SELECT user_id, event_name
        FROM staging.events_raw
        WHERE ds='${hiveconf:ds}'
        """,
        hiveconfs={"ds": "{{ ds }}"},
    )

    create_table >> load_partition
```

Use `hiveconfs` when you want Airflow templating to feed values into HQL without string-concatenating SQL in Python.

## Wait For A Partition

Use `HivePartitionSensor` when downstream tasks should not run until the metastore reports a specific partition.

```python
from airflow import DAG
from airflow.providers.apache.hive.sensors.hive_partition import HivePartitionSensor
from pendulum import datetime

with DAG(
    dag_id="wait_for_hive_partition",
    start_date=datetime(2026, 1, 1),
    schedule="@daily",
    catchup=False,
) as dag:
    wait_for_partition = HivePartitionSensor(
        task_id="wait_for_partition",
        table="analytics.events",
        partition="ds='{{ ds }}'",
        metastore_conn_id="metastore_default",
        poke_interval=60,
        timeout=60 * 60,
    )
```

Use this pattern when another system publishes Hive partitions and your DAG should continue only after the partition is visible in the metastore.

## Read Metadata From Python Tasks

Use `HiveMetastoreHook` when task code needs to inspect tables or partitions instead of only waiting for them.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.hive.hooks.hive import HiveMetastoreHook
from pendulum import datetime

with DAG(
    dag_id="inspect_hive_partitions",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def print_latest_partition() -> str | None:
        hook = HiveMetastoreHook(metastore_conn_id="metastore_default")
        latest = hook.max_partition("analytics", "events", field="ds")
        print(f"latest partition: {latest}")
        return latest

    print_latest_partition()
```

This is a good fit for branch logic, audits, or sanity checks before you launch heavier downstream work.

## Query Through HiveServer2 From Python

Use `HiveServer2Hook` when a Python task needs to fetch rows from Hive instead of submitting HQL through the CLI.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.hive.hooks.hive import HiveServer2Hook
from pendulum import datetime

with DAG(
    dag_id="query_hiveserver2",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def read_counts() -> None:
        hook = HiveServer2Hook(
            hiveserver2_conn_id="hiveserver2_default",
            schema="analytics",
        )

        rows = hook.get_records(
            """
            SELECT ds, COUNT(*) AS row_count
            FROM events
            GROUP BY ds
            ORDER BY ds DESC
            LIMIT 7
            """
        )

        for ds, row_count in rows:
            print(ds, row_count)

    read_counts()
```

Use this for small result sets and control-flow decisions. For large data movement, keep the work in Hive SQL tasks instead of pulling big result sets through Python workers.

## Important Notes

- `HiveOperator` and `HiveCliHook` run the local Hive CLI or Beeline from the worker, so the binary must exist in the worker image and be on `PATH`.
- If you use Beeline, set the connection to use Beeline and make sure the worker also has the JDBC driver and any required cluster client configuration.
- `HivePartitionSensor` and `HiveMetastoreHook` talk to the Hive metastore, not HiveServer2. A working query connection does not guarantee the metastore connection is correct.
- Install the provider everywhere DAG code is imported. One missing worker image is enough to cause `ModuleNotFoundError` during task execution.
- Put auth and cluster-specific options in Airflow connections or your secrets backend, not in DAG source files.

## When To Reach For This Provider

Use `apache-airflow-providers-apache-hive` when Airflow should orchestrate Hive work as DAG tasks. If you are writing a regular Python application outside Airflow, use a dedicated Hive client directly instead of importing Airflow hooks and operators.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hive/stable/`
- Hive CLI connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hive/stable/connections/hive_cli.html`
- HiveServer2 connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hive/stable/connections/hiveserver2.html`
- Hive metastore connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hive/stable/connections/hive_metastore.html`
- Operator and hook API docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-hive/stable/_api/airflow/providers/apache/hive/`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-hive/`
