---
name: package
description: "Apache Airflow provider for launching Apache Beam pipelines from DAGs"
metadata:
  languages: "python"
  versions: "6.2.3"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "apache-airflow,airflow,apache-beam,beam,dataflow,dag,pipelines"
---

# Apache Airflow Apache Beam Provider Guide

Use `apache-airflow-providers-apache-beam` when an Airflow DAG should submit an existing Apache Beam pipeline instead of shelling out manually. This package extends Airflow with Beam operators; you still author the pipeline itself with `apache-beam`.

## Golden Rule

- Install this provider into an existing Airflow environment and keep `apache-airflow` pinned in the same install command.
- Treat the provider as orchestration glue for Beam jobs, not as a replacement for the `apache-beam` SDK.
- Keep runner-specific options and credentials outside DAG source when possible, and pass Beam job flags through `pipeline_options`.
- Point the operator at a real pipeline file that can also run directly with the Beam SDK from the command line.

## What This Package Adds

For most Python DAGs, the main entry point is:

- `airflow.providers.apache.beam.operators.beam.BeamRunPythonPipelineOperator`

Use it to run a Python Beam pipeline file from a DAG and pass Beam runner flags such as `runner`, `project`, `region`, `temp_location`, or job-specific custom options.

## Install

Install the provider into the same environment or container image as Airflow. Keep Airflow pinned in the same command so `pip` does not silently upgrade or downgrade core.

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="6.2.3"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-apache-beam==${PROVIDER_VERSION}" \
  --constraint "${CONSTRAINT_URL}"
```

For Python Beam pipelines, install the Beam SDK in the same runtime that executes the Airflow task:

```bash
python -m pip install apache-beam
```

If the DAG runs Beam jobs on Dataflow, install the Google Cloud extra instead:

```bash
python -m pip install "apache-beam[gcp]"
```

Every Airflow service that imports or executes DAG code needs the provider installed, including the scheduler and all workers.

## Local Airflow Setup

For local development, initialize Airflow once and point it at a writable home directory:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
airflow standalone
```

That gives you a working local scheduler, API server, and web UI so you can iterate on the DAG and Beam pipeline together.

## Write A Beam Pipeline File

Keep the Beam pipeline in a normal Python file that uses `PipelineOptions()` so the operator can pass runtime flags.

```python
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions


def run() -> None:
    pipeline_options = PipelineOptions()

    with beam.Pipeline(options=pipeline_options) as pipeline:
        (
            pipeline
            | "ReadLines" >> beam.io.ReadFromText("input.txt")
            | "SplitWords" >> beam.FlatMap(str.split)
            | "PairWithOne" >> beam.Map(lambda word: (word, 1))
            | "CountWords" >> beam.CombinePerKey(sum)
            | "Format" >> beam.Map(lambda pair: f"{pair[0]}:{pair[1]}")
            | "WriteLines" >> beam.io.WriteToText("output/wordcount")
        )


if __name__ == "__main__":
    run()
```

Save it somewhere the Airflow worker can read, for example `/opt/airflow/dags/beam/wordcount_pipeline.py`.

## Run A Python Beam Job From A DAG

Minimal local example with `DirectRunner`:

```python
from __future__ import annotations

import pendulum

from airflow.sdk import DAG
from airflow.providers.apache.beam.operators.beam import BeamRunPythonPipelineOperator

with DAG(
    dag_id="beam_wordcount_local",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["beam"],
):
    run_wordcount = BeamRunPythonPipelineOperator(
        task_id="run_wordcount",
        py_file="/opt/airflow/dags/beam/wordcount_pipeline.py",
        runner="DirectRunner",
        pipeline_options={
            "input": "/opt/airflow/dags/data/input.txt",
            "output": "/opt/airflow/dags/data/output/wordcount",
        },
    )
```

Key details:

- `py_file` is the Beam pipeline script the worker will execute.
- `runner` selects the Beam runner.
- `pipeline_options` becomes the Beam job arguments, so the keys should match the option names your pipeline and runner expect.

## Run On Dataflow

When you switch from local development to Google Cloud Dataflow, keep the same operator and change the Beam runner options.

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GOOGLE_CLOUD_PROJECT="my-gcp-project"
```

```python
from airflow.providers.apache.beam.operators.beam import BeamRunPythonPipelineOperator

run_wordcount_dataflow = BeamRunPythonPipelineOperator(
    task_id="run_wordcount_dataflow",
    py_file="/opt/airflow/dags/beam/wordcount_pipeline.py",
    runner="DataflowRunner",
    pipeline_options={
        "project": "my-gcp-project",
        "region": "us-central1",
        "temp_location": "gs://my-bucket/tmp",
        "staging_location": "gs://my-bucket/staging",
        "input": "gs://my-bucket/input.txt",
        "output": "gs://my-bucket/output/wordcount",
    },
)
```

Practical requirements for Dataflow jobs:

- install `apache-beam[gcp]` in the task runtime
- use a valid `gs://` bucket for `temp_location`
- set `staging_location` explicitly when you want predictable staging behavior
- make the Google credentials available to the worker process that launches the job

## Common Workflow Pattern

The cleanest pattern is:

1. keep the Beam pipeline in its own Python module
2. run it locally with `DirectRunner` until the logic is correct
3. call that same file from `BeamRunPythonPipelineOperator`
4. switch only the runner-specific `pipeline_options` when you move to a remote runner

This keeps the Beam job runnable both inside and outside Airflow, which makes debugging much easier.

## Pitfalls

- This provider does not install or replace the Beam SDK by itself; Python Beam jobs still need `apache-beam` in the execution environment.
- `py_file` must exist on the Airflow worker that executes the task, not just on your laptop.
- `DirectRunner` is good for local development, but remote runners still need their own dependencies, credentials, and staging configuration.
- If a pipeline works from the command line and fails in Airflow, compare the worker environment, installed packages, and effective `pipeline_options` first.
- If a pipeline fails only on Dataflow, check `project`, `region`, `temp_location`, and `staging_location` before changing pipeline code.
- Install the provider everywhere DAGs are parsed or run. Import errors usually mean one Airflow image or service is missing the package.

## When To Reach For This Provider

Use `apache-airflow-providers-apache-beam` when Airflow should orchestrate Beam jobs as DAG tasks. If you are only writing a standalone Beam application and do not need Airflow scheduling, author and run the pipeline directly with `apache-beam` instead.

## Official References

- Airflow provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-apache-beam/stable/`
- PyPI: `https://pypi.org/project/apache-airflow-providers-apache-beam/`
- Apache Beam Python SDK overview: `https://beam.apache.org/documentation/sdks/python/`
- Apache Beam Python quickstart: `https://beam.apache.org/get-started/quickstart-py/`
