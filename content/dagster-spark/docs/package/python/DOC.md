---
name: package
description: "dagster-spark package guide for launching Spark applications from Dagster jobs with spark-submit style configuration"
metadata:
  languages: "python"
  versions: "0.28.18"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "dagster,dagster-spark,python,spark,apache-spark,spark-submit,data-orchestration"
---

# dagster-spark Python Package Guide

## Golden Rule

Use `dagster-spark` when a Dagster job needs to launch an existing Spark application through Dagster's job and op model. Keep the Spark installation, Java runtime, cluster access, and storage credentials in normal Spark and Hadoop configuration; `dagster-spark` wires those pieces into Dagster, but it does not replace them.

Keep `dagster-spark` on the same Dagster release line as the rest of your Dagster packages. For this guide, `dagster-spark==0.28.18` pairs with Dagster `1.12.18`.

## Install

Install the Spark integration alongside the matching Dagster packages:

```bash
python -m pip install \
  "dagster==1.12.18" \
  "dagster-webserver==1.12.18" \
  "dagster-spark==0.28.18"
```

Useful checks after install:

```bash
dagster --version
python -m pip show dagster-spark
```

## Prerequisites

Before using `dagster-spark`, make sure your runtime already has:

- a Dagster project with a loadable `defs = dg.Definitions(...)`
- a working Spark distribution with `spark-submit`
- a supported Java runtime for that Spark distribution
- the Spark application artifact you want to launch, such as a JAR file
- cluster-specific configuration and credentials already handled by Spark, Hadoop, Kubernetes, YARN, or the storage connector you use

`dagster-spark` does not bundle Spark itself. The machine or container that executes the Dagster job still needs access to the Spark installation and to any files or object storage paths passed to the Spark application.

## Configure The Spark Runtime

The simplest local setup is environment variables that point Dagster at the same Spark runtime you would use from the command line:

```bash
export SPARK_HOME="/opt/spark"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
```

If your cluster manager or storage connector depends on Hadoop client configuration, also set the environment variables your Spark installation expects, for example:

```bash
export HADOOP_CONF_DIR="/etc/hadoop/conf"
export YARN_CONF_DIR="/etc/hadoop/conf"
```

Practical rule: anything you would normally need for `spark-submit` must already be present where Dagster runs the op.

## Create A Spark Op

The package centers on `create_spark_op(...)` together with the `spark_resource` resource definition.

This example launches the Spark word-count example JAR from a Dagster job:

```python
import os

import dagster as dg
from dagster_spark import create_spark_op, spark_resource


wordcount = create_spark_op(
    name="wordcount",
    main_class="org.apache.spark.examples.JavaWordCount",
    application_jar="/opt/spark/examples/jars/spark-examples_2.12-3.5.1.jar",
    description="Run the Spark JavaWordCount example from Dagster",
)


@dg.job(
    resource_defs={
        "spark": spark_resource.configured(
            {
                "spark_home": os.environ["SPARK_HOME"],
            }
        )
    }
)
def spark_wordcount_job():
    wordcount()


defs = dg.Definitions(jobs=[spark_wordcount_job])
```

Important details:

- the resource key must be `spark` for the op created by `create_spark_op(...)`
- `spark_home` should point at the Spark installation root that contains `bin/spark-submit`
- `application_jar` and `main_class` identify the Spark application Dagster should submit

## Pass Run Config To The Spark Op

Use Dagster run config to supply application arguments and Spark configuration values that normally belong on `spark-submit`.

```python
run_config = {
    "ops": {
        "wordcount": {
            "config": {
                "application_arguments": [
                    "/data/input.txt",
                ],
                "spark_conf": {
                    "spark.master": "local[*]",
                    "spark.app.name": "dagster-wordcount",
                    "spark.driver.memory": "1g",
                },
            }
        }
    }
}

result = spark_wordcount_job.execute_in_process(run_config=run_config)
```

The important keys to remember are:

- `application_arguments` for the arguments passed into the Spark application
- `spark_conf` for standard Spark properties such as `spark.master` or memory settings

If you already launch the same application from a shell script, move those settings into Dagster run config instead of duplicating them in several places.

## Typical Development Workflow

Expose your Dagster definitions from an importable module:

```python
# src/my_project/definitions.py
import dagster as dg

from .spark_jobs import spark_wordcount_job


defs = dg.Definitions(jobs=[spark_wordcount_job])
```

Run the code location locally:

```bash
dagster dev -m my_project.definitions
```

Then launch the job from the UI or a schedule with the same run config shape shown above.

## Common Pitfalls

- Version mismatch. Keep `dagster-spark` on the matching Dagster release line instead of upgrading one Dagster library in isolation.
- Missing Spark runtime. Installing `dagster-spark` with pip does not install `spark-submit`, Spark JARs, or Java.
- Wrong execution path. The application JAR and any input paths must be reachable from the environment where Dagster launches Spark, not only from your laptop.
- Missing cluster credentials. Access to S3, HDFS, Hive, or YARN is still handled by Spark and Hadoop configuration, not by a Dagster-specific auth client.
- Assuming local files exist on executors. For cluster execution, prefer storage locations and connector settings that the whole Spark runtime can reach.
- Treating this package like an asset-native API. `dagster-spark` fits best when you already have a Spark application to submit and want Dagster to orchestrate that submission.

## Version Notes For `0.28.18`

- This guide targets `dagster-spark==0.28.18`.
- Keep the package aligned with the Dagster `1.12.18` release line.
- For new Dagster projects, use `dagster-spark` when you need Spark submission from Dagster jobs; keep the rest of the project on modern `Definitions`-based loading even if the Spark integration itself is op-oriented.

## Official Sources

- `https://github.com/dagster-io/dagster/tree/master/python_modules/libraries/dagster-spark`
- `https://docs.dagster.io/api/python-api/libraries/dagster-spark`
- `https://docs.dagster.io/api/dagster/ops-jobs-graphs`
- `https://spark.apache.org/docs/latest/submitting-applications.html`
- `https://spark.apache.org/docs/latest/configuration.html`
- `https://pypi.org/project/dagster-spark/`
