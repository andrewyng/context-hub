---
name: providers-apache-pig
description: "Apache Airflow Pig provider for running Pig Latin through the local pig CLI from DAG tasks"
metadata:
  languages: "python"
  versions: "4.8.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,pig,pig-latin,hadoop,dag,python"
---

# apache-airflow-providers-apache-pig

Use `apache-airflow-providers-apache-pig` when an Airflow DAG needs to run Pig Latin through the local `pig` command and track that execution as a normal Airflow task.

This package is an Airflow provider, not a standalone Pig client for ordinary Python applications.

This guide targets provider version `4.8.2`.

## Install

Install the provider into the same Python environment or container image as your Airflow deployment. Pin Airflow in the same command and use the matching constraints file.

`apache-airflow-providers-apache-pig==4.8.2` requires `apache-airflow>=2.11.0`.

```bash
AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.8.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-pig==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

Install it anywhere Airflow imports or runs DAG code:

- scheduler
- webserver
- workers or task-execution image

## Prerequisites

This provider wraps the `pig` CLI. It does not install Apache Pig for you.

Before using it, make sure the runtime that executes the task already has:

- Apache Pig installed
- a working Java runtime
- the `pig` executable on `PATH`
- any local files, Hadoop config, or cluster client configuration that your Pig job needs

The Apache Pig getting-started docs use this basic shell setup:

```bash
export JAVA_HOME=/path/to/jdk
export PIG_HOME=/path/to/pig
export PATH="${PIG_HOME}/bin:${PATH}"
```

For local development, Pig supports local mode:

```bash
pig -x local
```

In Airflow, you pass the same mode switch through `pig_opts`.

## Configure The Airflow Connection

The operator and hook default to the Airflow connection id `pig_cli_default`.

The current hook only uses the connection id as an Airflow lookup anchor, so the simplest working setup is an environment-defined connection:

```bash
export AIRFLOW_CONN_PIG_CLI_DEFAULT='{"conn_type":"pig_cli"}'
```

If you prefer a different id, set it explicitly in DAG code:

```python
PigOperator(..., pig_cli_conn_id="my_pig")
```

Important version note:

- Do not store `pig_properties` in the connection extras. Provider 4.x rejects that deprecated pattern. Pass `pig_properties` directly to `PigOperator` or `PigCliHook` instead.

## Run An Inline Pig Script

For most DAGs, start with `PigOperator`.

```python
from airflow import DAG
from airflow.providers.apache.pig.operators.pig import PigOperator
from pendulum import datetime


with DAG(
    dag_id="pig_wordcount_inline",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    run_pig = PigOperator(
        task_id="run_pig",
        pig="""
        records = LOAD '/opt/airflow/dags/data/words.tsv'
            USING PigStorage('\\t')
            AS (word: chararray);

        grouped = GROUP records BY word;

        counts = FOREACH grouped GENERATE
            group AS word,
            COUNT(records) AS total;

        STORE counts
            INTO '/tmp/airflow-pig-output/{{ ds_nodash }}'
            USING PigStorage('\\t');
        """,
        pig_cli_conn_id="pig_cli_default",
        pig_opts="-x local",
        pig_properties=[
            "-Dpig.tmpfilecompression=true",
        ],
    )
```

The main arguments you usually set are:

- `pig`: the Pig Latin script to run
- `pig_cli_conn_id`: Airflow connection id, usually `pig_cli_default`
- `pig_opts`: extra CLI flags as a single space-separated string such as `-x local` or `-x tez`
- `pig_properties`: extra `-D...` style properties as a list of strings

## Run A File-Backed `.pig` Script

`PigOperator` templates `.pig` and `.piglatin` files. Use that when you want the script stored as a separate file under your DAG directory.

Example script file:

```pig
-- /opt/airflow/dags/pig/wordcount.pig
records = LOAD '/opt/airflow/dags/data/words_${ds_nodash}.tsv'
    USING PigStorage('\t')
    AS (word: chararray);

grouped = GROUP records BY word;

counts = FOREACH grouped GENERATE
    group AS word,
    COUNT(records) AS total;

STORE counts
    INTO '/tmp/airflow-pig-output/${ds_nodash}'
    USING PigStorage('\t');
```

Example DAG task:

```python
from airflow import DAG
from airflow.providers.apache.pig.operators.pig import PigOperator
from pendulum import datetime


with DAG(
    dag_id="pig_wordcount_file",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    run_script = PigOperator(
        task_id="run_script",
        pig="/opt/airflow/dags/pig/wordcount.pig",
        pig_cli_conn_id="pig_cli_default",
        pigparams_jinja_translate=True,
        pig_opts="-x local",
    )
```

Set `pigparams_jinja_translate=True` when your script already uses Pig-style `${name}` placeholders and you want Airflow to translate them to Jinja before execution.

## Use `PigCliHook` In Python Task Code

If you need lower-level control from task code, instantiate `PigCliHook` directly and call `run_cli()`.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.apache.pig.hooks.pig import PigCliHook
from pendulum import datetime


with DAG(
    dag_id="pig_hook_preview",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def preview_rows() -> None:
        hook = PigCliHook(
            pig_cli_conn_id="pig_cli_default",
            pig_properties=["-Dpig.tmpfilecompression=true"],
        )

        output = hook.run_cli(
            """
            rows = LOAD '/opt/airflow/dags/data/words.tsv'
                USING PigStorage('\\t')
                AS (word: chararray);
            sample = LIMIT rows 5;
            DUMP sample;
            """,
            pig_opts="-x local",
        )

        print(output)

    preview_rows()
```

Use the hook when task logic needs the CLI output as a Python string instead of letting `PigOperator` manage the whole task boundary.

## Pitfalls

- Install both the provider package and Apache Pig everywhere Airflow imports or runs DAGs. A single worker image missing either dependency is enough to fail a task.
- Keep Pig script input and output paths absolute when possible. The hook runs `pig` from a temporary working directory, so relative paths can point somewhere unexpected.
- `pig_opts` is one string passed to the CLI. `pig_properties` is a list of individual property strings. Do not swap those shapes.
- The Airflow connection does not launch or proxy a remote Pig service. The worker runs the local `pig` command.
- If you run against Hadoop or Tez instead of local mode, make sure the worker image already has the right cluster client configuration before the Airflow task starts.
- Do not use connection extras for `pig_properties` on provider 4.x. That behavior was removed; set properties on the operator or hook call itself.

## Version Notes

- This guide covers `apache-airflow-providers-apache-pig` version `4.8.2`.
- Provider packages are versioned independently from Apache Airflow core.
- Upstream documents `apache-airflow>=2.11.0` for provider `4.8.2`.
- The default connection id for both `PigOperator` and `PigCliHook` is `pig_cli_default`.

## Official References

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/index.html`
- `PigOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/_api/airflow/providers/apache/pig/operators/pig/index.html`
- `PigCliHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/_api/airflow/providers/apache/pig/hooks/pig/index.html`
- Changelog: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/changelog.html`
- Provider source API page: `https://airflow.apache.org/docs/apache-airflow-providers-apache-pig/stable/_modules/airflow/providers/apache/pig/hooks/pig.html`
- Airflow connection environment variables: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- Apache Pig getting started: `https://pig.apache.org/docs/latest/start.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-pig/`
