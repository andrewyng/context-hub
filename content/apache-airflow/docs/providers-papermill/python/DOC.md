---
name: providers-papermill
description: "Apache Airflow Papermill provider for running parameterized Jupyter notebooks as DAG tasks"
metadata:
  languages: "python"
  versions: "3.12.1"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "apache-airflow,airflow,papermill,jupyter,notebook,dag"
---

# Apache Airflow Papermill Provider Python Guide

## Golden Rule

`apache-airflow-providers-papermill` is an Airflow provider package, not a standalone notebook runner. Install it into an existing Airflow environment, store notebooks somewhere Airflow can read and write, and execute them with `PapermillOperator`.

This guide targets provider version `3.12.1`. PyPI lists these minimum versions for this release:

- Python `>=3.10`
- `apache-airflow>=2.11.0`

## Install

Install the provider into the same Python environment or container image that runs your Airflow scheduler and workers.

If Airflow is already installed, pin the current core version in the same command so `pip` does not replace it unexpectedly:

```bash
AIRFLOW_VERSION="3.1.8"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-papermill==3.12.1"
```

The provider depends on `papermill[all]`, `scrapbook[all]`, `ipykernel`, and `jupyter-client`, so a normal provider install brings in the notebook execution pieces it needs.

## Prepare The Notebook

Papermill executes a notebook file and injects parameters into it. The provider docs show notebook paths on local storage, S3, GCS, and Azure Blob Storage. HDFS is explicitly not supported.

Use a tagged `parameters` cell in the input notebook when you want stable parameter injection:

```python
# parameters
message = "default message"
```

If the notebook does not already contain a `parameters` cell, Papermill injects an `injected-parameters` cell near the top of the notebook.

Save the input notebook somewhere Airflow can access, for example:

- `/opt/airflow/dags/notebooks/input.ipynb`
- `s3://your-bucket/notebooks/input.ipynb`
- `gs://your-bucket/notebooks/input.ipynb`
- `wasbs://container@account.blob.core.windows.net/notebooks/input.ipynb`

## Run A Notebook In A DAG

Use `PapermillOperator` for the actual notebook execution task.

```python
from __future__ import annotations

import pendulum

from airflow import DAG
from airflow.providers.papermill.operators.papermill import PapermillOperator

with DAG(
    dag_id="papermill_local_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
    tags=["papermill"],
) as dag:
    run_notebook = PapermillOperator(
        task_id="run_notebook",
        input_nb="/opt/airflow/dags/notebooks/input.ipynb",
        output_nb="/opt/airflow/dags/notebooks/output-{{ ds_nodash }}.ipynb",
        parameters={"message": "Hello from Airflow"},
    )
```

The operator API exposes the arguments you usually need:

- `input_nb`: source notebook path or notebook outlet
- `output_nb`: output notebook path or notebook outlet
- `parameters`: values injected into the notebook
- `kernel_conn_id`: optional Airflow connection for a remote Jupyter kernel
- `kernel_name` and `language_name`: optional kernel metadata overrides

`input_nb`, `output_nb`, `parameters`, `kernel_conn_id`, `kernel_name`, and `language_name` are templated fields, so you can use Airflow macros inside them.

## Read Output Values With `scrapbook`

The official example DAG reads the executed notebook back with `scrapbook` from a downstream task. Use that pattern when the notebook produces structured output you want later Airflow tasks to inspect.

```python
from __future__ import annotations

import pendulum
import scrapbook as sb

from airflow import DAG
from airflow.providers.papermill.operators.papermill import PapermillOperator

try:
    from airflow.sdk import task
except ImportError:
    from airflow.decorators import task


@task()
def inspect_notebook(output) -> None:
    notebook = sb.read_notebook(output.url)
    print(notebook.scraps["message"].data)


with DAG(
    dag_id="papermill_output_example",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule=None,
    catchup=False,
) as dag:
    run_notebook = PapermillOperator(
        task_id="run_notebook",
        input_nb="/opt/airflow/dags/notebooks/input.ipynb",
        output_nb="/opt/airflow/dags/notebooks/output.ipynb",
        parameters={"message": "Airflow wrote this"},
    )

    inspect_notebook(run_notebook.output)
```

The upstream example passes `run_notebook.output` to the next task and reads `output.url` inside the task body.

## Use A Remote Jupyter Kernel

If the notebook should run against a remote Jupyter kernel instead of the default local kernel, configure an Airflow connection of type `jupyter_kernel` and pass its connection id to `kernel_conn_id`.

Minimal environment-variable form:

```bash
export AIRFLOW_CONN_JUPYTER_KERNEL_DEFAULT='{
  "conn_type": "jupyter_kernel",
  "host": "remote-jupyter.example.com",
  "extra": {
    "kernel_shell_port": 57575,
    "kernel_iopub_port": 40885,
    "kernel_stdin_port": 52597,
    "kernel_control_port": 50160,
    "kernel_hb_port": 42540,
    "session_key": "session"
  }
}'
```

Then reference that connection from the operator:

```python
run_remote_notebook = PapermillOperator(
    task_id="run_remote_notebook",
    input_nb="/opt/airflow/dags/notebooks/input.ipynb",
    output_nb="/opt/airflow/dags/notebooks/output-remote.ipynb",
    parameters={"message": "Run on a remote kernel"},
    kernel_conn_id="jupyter_kernel_default",
)
```

The connection docs define these fields:

- `host`: hostname for the remote kernel
- `kernel_shell_port`
- `kernel_iopub_port`
- `kernel_stdin_port`
- `kernel_control_port`
- `kernel_hb_port`
- `session_key`

## Common Pitfalls

- Install the provider anywhere Airflow imports DAG code or executes tasks. A single missing scheduler or worker image is enough to cause import failures.
- Keep input and output notebook paths on storage Airflow can access. The provider docs only document local files, S3, GCS, and Azure Blob Storage.
- Use a `parameters` cell if the notebook depends on injected values landing in a predictable place.
- Remote-kernel execution is not automatic. You need a `jupyter_kernel` Airflow connection and must pass `kernel_conn_id`.
- The provider extends Airflow; it does not replace notebook-specific libraries in a normal Python application outside Airflow.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-papermill/stable/`
- Operator guide and examples: `https://airflow.apache.org/docs/apache-airflow-providers-papermill/stable/operators.html`
- `PapermillOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-papermill/stable/_api/airflow/providers/papermill/operators/papermill/index.html`
- Jupyter kernel connection reference: `https://airflow.apache.org/docs/apache-airflow-providers-papermill/stable/connections/jupyter_kernel.html`
- PyPI package metadata: `https://pypi.org/project/apache-airflow-providers-papermill/`
