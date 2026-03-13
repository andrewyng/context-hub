---
name: package
description: "Apache Airflow Spark provider for submitting Spark applications from DAGs with Airflow-managed Spark connections"
metadata:
  languages: "python"
  versions: "5.5.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "airflow,spark,apache-spark,dag,python"
---

# apache-airflow-providers-apache-spark

Use `apache-airflow-providers-apache-spark` when an Airflow DAG needs to launch a Spark application with `spark-submit` and track that submission as a normal Airflow task.

This guide targets provider version `5.5.1`.

## Install

Install the provider in the same Python environment or container image used by your Airflow deployment:

```bash
python -m pip install "apache-airflow-providers-apache-spark==5.5.1"
```

Install it anywhere Airflow imports or runs DAG code:

- scheduler
- webserver
- workers or task execution image

This package is an Airflow provider, not a standalone Spark client. You do not initialize a Python SDK object. Instead, you configure an Airflow connection and instantiate provider operators inside DAG code.

## Prerequisites

Before using the provider, make sure your runtime already has:

- an Apache Airflow deployment
- access to a Spark cluster or local Spark installation
- a working `spark-submit` binary on the machine or container that executes the task
- your Spark application code available at a path the task can read, or at a remote location your Spark runtime can fetch

The provider submits work to Spark. It does not bundle Spark itself.

## Configure The Airflow Connection

The provider uses an Airflow connection with connection type `spark`. The default connection id used by examples and the operator default is `spark_default`.

You can configure it in the Airflow UI, with the Airflow CLI, or with an environment variable.

Example environment variable for a standalone Spark master:

```bash
export AIRFLOW_CONN_SPARK_DEFAULT='spark://spark-master.example.com:7077?deploy-mode=client'
```

In the Airflow UI, the connection usually maps like this:

- **Connection Id:** `spark_default`
- **Connection Type:** `spark`
- **Host:** `local`, `yarn`, or a Spark master URL such as `spark://spark-master.example.com`
- **Port:** Spark master port when you use a standalone master
- **Extra:** optional JSON such as `{"deploy-mode": "client"}`

Useful extras depend on your Spark environment. Common ones documented for the Spark connection include deploy mode and other `spark-submit` settings. Keep cluster-specific details on the connection when you want DAG code to stay portable across environments.

Useful check:

```bash
airflow connections get spark_default
```

## Submit A PySpark Application

For most DAGs, start with `SparkSubmitOperator`.

Example Spark application:

```python
# dags/jobs/wordcount.py
from pyspark.sql import SparkSession


spark = SparkSession.builder.appName("airflow-wordcount").getOrCreate()

rows = spark.createDataFrame(
    [("apple",), ("apple",), ("banana",)],
    ["word"],
)

counts = rows.groupBy("word").count().collect()
for row in counts:
    print(f"{row['word']}: {row['count']}")

spark.stop()
```

Example DAG task that submits that application:

```python
from airflow import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from pendulum import datetime


with DAG(
    dag_id="spark_submit_python_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    submit_wordcount = SparkSubmitOperator(
        task_id="submit_wordcount",
        application="/opt/airflow/dags/jobs/wordcount.py",
        conn_id="spark_default",
        name="airflow-wordcount",
        conf={
            "spark.executor.memory": "2g",
            "spark.driver.memory": "1g",
        },
        application_args=[],
        verbose=False,
    )
```

The main arguments you normally set are:

- `application`: path to the Python file, JAR, or other Spark entrypoint
- `conn_id`: Airflow Spark connection id, usually `spark_default`
- `name`: job name shown by Spark
- `conf`: Spark configuration passed to `spark-submit`
- `application_args`: positional arguments passed to your application

Use this pattern when Airflow should orchestrate an existing Spark job instead of embedding Spark logic inside the Airflow task itself.

## Submit A JAR Application

If your Spark job is packaged as a JAR, keep the same operator and point `application` at the JAR.

```python
from airflow import DAG
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from pendulum import datetime


with DAG(
    dag_id="spark_submit_jar_example",
    start_date=datetime(2026, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    submit_jar = SparkSubmitOperator(
        task_id="submit_jar",
        application="/opt/airflow/dags/jars/example-job.jar",
        java_class="com.example.jobs.WordCountJob",
        conn_id="spark_default",
        application_args=["s3a://input-bucket/data", "s3a://output-bucket/results"],
        conf={
            "spark.executor.instances": "3",
            "spark.executor.memory": "4g",
        },
    )
```

Use `java_class` for JVM jobs with a main class. Leave it out when the application itself is the executable entrypoint.

## Common Setup Pattern

For most teams, a clean setup looks like this:

- keep cluster address and deploy mode on the Airflow `spark` connection
- keep the Spark application file or JAR in a location available to task runtime
- use `SparkSubmitOperator` as the Airflow task boundary
- pass Spark tuning through `conf` and app-specific inputs through `application_args`

That split keeps DAGs readable and avoids hard-coding environment-specific Spark endpoints into every task.

## Pitfalls

- Install the provider everywhere Airflow parses or runs DAGs. Import errors usually mean one Airflow image is missing the package.
- Make sure `spark-submit` exists on the worker or execution image. The provider wraps that command; it does not supply Spark binaries.
- Keep `application` paths valid for the task runtime. A path that exists on your laptop but not inside the Airflow container will fail.
- Keep connection ids explicit if you do not use `spark_default`.
- Use Airflow connections, a secrets backend, or environment variables for cluster credentials instead of embedding them in DAG code.
- When you rely on environment variables, remember that Airflow task runtime, Spark driver runtime, and Spark executor runtime may not share the same environment automatically.

## Version Notes

- This guide covers `apache-airflow-providers-apache-spark` version `5.5.1`.
- Airflow provider packages are versioned separately from Apache Airflow core.
- If you upgrade Airflow core or the Spark provider independently, re-check the provider docs and the operator API reference before changing DAG code.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-spark/stable/`
- Package index: `https://airflow.apache.org/docs/apache-airflow-providers-apache-spark/stable/index.html`
- Spark connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-spark/stable/connections/spark-submit.html`
- `SparkSubmitOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-spark/stable/_api/airflow/providers/apache/spark/operators/spark_submit/index.html`
- `SparkSubmitHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-apache-spark/stable/_api/airflow/providers/apache/spark/hooks/spark_submit/index.html`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-spark/`
