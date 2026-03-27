---
name: providers-apache-sqoop
description: "Apache Airflow Sqoop provider for running Sqoop 1 imports and exports from DAG tasks"
metadata:
  languages: "python"
  versions: "4.2.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,sqoop,hadoop,etl,dag,python"
---

# apache-airflow-providers-apache-sqoop

Use `apache-airflow-providers-apache-sqoop` when an Airflow DAG needs to run Sqoop 1 imports or exports between a relational database and Hadoop storage by shelling out to the `sqoop` command.

This is a legacy Airflow provider. The provider changelog marks it as removed and unmaintained, and current Airflow docs list Apache Sqoop under removed providers. Treat it as a maintenance-only integration for existing Airflow 2.x and Sqoop 1 pipelines.

## Golden Rule

- Install the provider into the same Airflow environment as the scheduler and every worker that can execute the DAG.
- Keep the database JDBC URL, Hadoop settings, and secrets in an Airflow connection such as `sqoop_default`.
- Make sure the task runtime already has the `sqoop` binary, the JDBC driver jar, and any Hadoop config files it needs. The provider does not bundle them.
- Use `SqoopOperator` for normal DAG tasks and `SqoopHook` only when task code needs lower-level control.

## Install

The official provider docs describe installing this package on top of an existing Airflow 2 installation and require Airflow `2.6.0+`.

Pin Airflow and the provider together and use the matching Airflow constraints file:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-2.x-version>"
PROVIDER_VERSION="4.2.1"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-sqoop==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Install the provider anywhere Airflow imports or runs DAG code:

- scheduler
- webserver if it imports DAG modules
- workers or task execution image

## Prerequisites

Before writing DAG code, make sure the task runtime already has:

- the `sqoop` executable on `PATH`
- a JDBC driver jar for the source or destination database
- access to Hadoop and HDFS config files when your Sqoop job needs them
- network reachability from the worker to the database and Hadoop services the Sqoop command will call

If the worker image is missing `sqoop` or the JDBC driver, the provider import will succeed but the task will fail when it tries to launch the command.

## Configure The Airflow Connection

The provider uses an Airflow connection id such as `sqoop_default`. The hook builds the Sqoop `--connect` JDBC string from the connection's `host`, `port`, and optional `schema`, and it also reads extras such as `job_tracker`, `namenode`, `files`, `archives`, and `password_file`.

Airflow supports defining connections with an `AIRFLOW_CONN_*` environment variable in JSON form. Example:

```bash
export AIRFLOW_CONN_SQOOP_DEFAULT='{
  "conn_type": "sqoop",
  "login": "etl_user",
  "host": "jdbc:mysql://mysql.example.com",
  "port": 3306,
  "schema": "warehouse",
  "extra": {
    "job_tracker": "local",
    "namenode": "hdfs://namenode.example.com:8020",
    "files": "/etc/hadoop/conf/core-site.xml,/etc/hadoop/conf/hdfs-site.xml",
    "password_file": "/opt/airflow/secrets/mysql-password.txt"
  }
}'
```

Practical mapping for the connection fields:

- `host`: JDBC base URL such as `jdbc:mysql://mysql.example.com`
- `port`: database port
- `schema`: database name appended to the JDBC URL
- `login`: database username passed as `--username`
- `extra.job_tracker`: MapReduce job tracker, often `local` for simple setups
- `extra.namenode`: HDFS namenode such as `hdfs://namenode.example.com:8020`
- `extra.files` / `extra.archives`: extra files the Sqoop command should ship
- `extra.password_file`: file passed to `--password-file` instead of embedding a password in the DAG

Keep secrets in a secrets backend or password file instead of hard-coding them in DAG source.

## Import A Table With `SqoopOperator`

Use `SqoopOperator` with `cmd_type="import"` when Airflow should pull a table into HDFS.

```python
from airflow import DAG
from airflow.providers.apache.sqoop.operators.sqoop import SqoopOperator
from pendulum import datetime

with DAG(
    dag_id="sqoop_import_customers",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule="@daily",
    catchup=False,
) as dag:
    import_customers = SqoopOperator(
        task_id="import_customers",
        conn_id="sqoop_default",
        cmd_type="import",
        table="customers",
        target_dir="/data/raw/customers/{{ ds }}",
        split_by="customer_id",
        num_mappers=4,
        columns="customer_id,email,updated_at",
        where="updated_at >= '{{ data_interval_start.to_date_string() }}'",
        append=False,
        verbose=True,
        extra_options={"delete-target-dir": ""},
        libjars="/opt/jdbc/mysql-connector-j-8.4.0.jar",
    )
```

The main arguments you will usually set are:

- `table` or `query`
- `target_dir` for imports
- `split_by` and `num_mappers` for parallel jobs
- `columns` and `where` to reduce imported data
- `libjars` when the worker needs a JDBC driver jar for the database
- `extra_options` for raw Sqoop flags not exposed as first-class operator arguments

## Import From A Free-Form Query

Use `query=` instead of `table=` when the source SQL is more complex than a table import.

Sqoop's user guide requires free-form imports to include `$CONDITIONS` in the `WHERE` clause. If you run with more than one mapper, also set `split_by` so Sqoop can partition the query.

```python
from airflow import DAG
from airflow.providers.apache.sqoop.operators.sqoop import SqoopOperator
from pendulum import datetime

with DAG(
    dag_id="sqoop_import_orders_query",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    import_orders = SqoopOperator(
        task_id="import_orders",
        conn_id="sqoop_default",
        cmd_type="import",
        query="""
        SELECT order_id, customer_id, total_amount, updated_at
        FROM orders
        WHERE $CONDITIONS
          AND updated_at >= '{{ data_interval_start.to_date_string() }}'
        """,
        target_dir="/data/raw/orders/{{ ds }}",
        split_by="order_id",
        num_mappers=4,
    )
```

Important query-import rules:

- `target_dir` is required for query imports
- parallel query imports need both `$CONDITIONS` and `split_by`
- if the query cannot be split safely, set `num_mappers=1`

## Export Files Back To A Database

Use `cmd_type="export"` when the data already exists in HDFS and the task should write it into a relational table.

```python
from airflow import DAG
from airflow.providers.apache.sqoop.operators.sqoop import SqoopOperator
from pendulum import datetime

with DAG(
    dag_id="sqoop_export_daily_scores",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    export_scores = SqoopOperator(
        task_id="export_scores",
        conn_id="sqoop_default",
        cmd_type="export",
        table="daily_scores",
        export_dir="/data/curated/daily_scores/{{ ds }}",
        input_fields_terminated_by=",",
        input_lines_terminated_by="\n",
        input_optionally_enclosed_by='"',
        num_mappers=2,
        staging_table="daily_scores_staging",
        clear_staging_table=True,
        batch=True,
        verbose=True,
    )
```

Use the staging-table options when you want Sqoop to load into a temporary table before merging into the final table.

## Use `SqoopHook` In Task Code

When a DAG task needs direct access to the provider's Python wrapper instead of a declarative operator task, instantiate `SqoopHook` and call `import_table`, `import_query`, or `export_table`.

```python
from airflow.decorators import task
from airflow.providers.apache.sqoop.hooks.sqoop import SqoopHook

@task
def backfill_reference_data() -> None:
    hook = SqoopHook(
        conn_id="sqoop_default",
        verbose=True,
        num_mappers=1,
        properties={"mapreduce.job.queuename": "etl"},
    )

    hook.import_table(
        table="reference_data",
        target_dir="/data/reference/reference_data",
        append=False,
        file_type="text",
    )
```

Use hook methods when the exact Sqoop action depends on earlier task output or branching logic. For ordinary imports and exports, `SqoopOperator` is easier to read in the DAG graph.

## Important Pitfalls

- This provider wraps the external `sqoop` command. It does not provide a standalone Python database client.
- Install it everywhere Airflow runs tasks. One missing worker image is enough to cause failures.
- A valid Airflow connection is not enough by itself. The worker also needs the `sqoop` binary, the JDBC driver jar, and any Hadoop config files referenced by `files` or `archives`.
- Query imports fail if you forget `$CONDITIONS`. Parallel query imports also need `split_by`.
- Keep credentials out of DAG code. Use an Airflow connection, a password file, or a secrets backend.
- This provider is removed and no longer maintained. Re-check the provider changelog before upgrading Airflow or rebuilding old pipelines around it.

## Version Notes

- This guide covers `apache-airflow-providers-apache-sqoop` version `4.2.1`.
- The provider docs describe it as installable on top of an existing Airflow 2 installation and require Airflow `2.6.0+`.
- The `4.2.1` changelog entry says the provider was removed and is no longer maintained.
- Current Airflow docs also list Apache Sqoop among removed providers.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-sqoop/stable/`
- Provider package index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-sqoop/stable/index.html`
- `SqoopOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-sqoop/stable/_api/airflow/providers/apache/sqoop/operators/sqoop/index.html`
- `SqoopHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-sqoop/stable/_api/airflow/providers/apache/sqoop/hooks/sqoop/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-apache-sqoop/stable/changelog.html`
- Removed providers list: `https://airflow.apache.org/docs/apache-airflow/stable/extra-packages-ref.html`
- Managing connections with environment variables: `https://airflow.apache.org/docs/apache-airflow/2.6.0/howto/connection.html`
- Sqoop user guide: `https://sqoop.apache.org/docs/1.4.2/SqoopUserGuide.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-sqoop/`
