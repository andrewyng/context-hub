---
name: providers-common-io
description: "Apache Airflow common.io provider for cross-filesystem transfers and object-store-backed XComs"
metadata:
  languages: "python"
  versions: "1.7.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,object-storage,file-transfer,xcom,s3"
---

# Apache Airflow Common IO Provider Guide

Use `apache-airflow-providers-common-io` when an Airflow deployment needs to copy files between the local filesystem and object storage, or when XCom payloads should spill to object storage instead of living entirely in the metadata database.

## Golden Rule

- Install this package into the same Airflow environment as your scheduler, workers, and any task runtime that imports DAG code.
- Use `FileTransferOperator` for file copies and `XComObjectStorageBackend` for large XCom payloads.
- Put credentials on Airflow connections and refer to storage locations with `ObjectStoragePath` or URL-style paths such as `s3://aws_default@bucket/key`.

## Install

This provider release is `1.7.1`. The maintainer docs and PyPI page list these requirements:

- Apache Airflow `>=2.11.0`
- Python `3.10` through `3.13`

If you are adding the provider to an existing Airflow environment, install it with the Airflow version you already run:

```bash
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-common-io==1.7.1"
```

For a reproducible fresh install from PyPI, Airflow recommends using its constraints file:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="3.1.8"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-common-io==1.7.1" \
  --constraint "${CONSTRAINT_URL}"
```

If your DAGs will access S3, GCS, Azure Blob, or another remote object store, install the matching provider too. For example, the Airflow object storage tutorial uses the Amazon provider plus `s3fs`:

```bash
python -m pip install "apache-airflow-providers-amazon[s3fs]"
```

## Connection And Path Setup

The common.io provider uses the connection id associated with the URL scheme or the connection id embedded in the object storage URL.

For S3-backed examples, a minimal environment looks like this:

```bash
export AIRFLOW_HOME="$PWD/.airflow"
export AIRFLOW__CORE__LOAD_EXAMPLES="False"

export AIRFLOW_CONN_AWS_DEFAULT='aws://'
export AWS_DEFAULT_REGION='us-east-1'
```

Important path rules from the maintainer docs:

- `ObjectStoragePath("s3://aws_default@my-bucket/path/to/file.csv")` embeds the Airflow connection id in the URL.
- `ObjectStoragePath("s3://my-bucket/path/to/file.csv", conn_id="aws_default")` is also supported, and the keyword argument takes precedence.
- If the connection id is omitted, Airflow falls back to the default connection for that backend.
- Local paths use `file://` or `local://`.

## Transfer A File

`FileTransferOperator` accepts `src` and `dst` as either strings or `ObjectStoragePath` objects. If both paths are on the same object store, the provider copies within that object store. Otherwise it streams from source to destination.

```python
from airflow import DAG
from airflow.providers.common.io.operators.file_transfer import FileTransferOperator
from pendulum import datetime

try:
    from airflow.sdk import ObjectStoragePath
except ImportError:
    from airflow.io.path import ObjectStoragePath

LOCAL_REPORT = ObjectStoragePath("file:///opt/airflow/data/report.csv")
S3_REPORT = ObjectStoragePath("s3://aws_default@my-example-bucket/reports/report.csv")

with DAG(
    dag_id="common_io_local_to_s3",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    transfer_report = FileTransferOperator(
        task_id="transfer_report",
        src=LOCAL_REPORT,
        dst=S3_REPORT,
        overwrite=True,
    )
```

Practical notes:

- `overwrite` defaults to `False`.
- `src` and `dst` are templated fields, so Jinja-templated paths are supported.
- The official system test uses the same pattern with a local `file:///tmp/...` source and an `s3://...` destination.

## Use Object Storage For Large XComs

Set Airflow's XCom backend to `airflow.providers.common.io.xcom.backend.XComObjectStorageBackend` when task return values are too large for the metadata database alone.

```bash
export AIRFLOW__CORE__XCOM_BACKEND='airflow.providers.common.io.xcom.backend.XComObjectStorageBackend'
export AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_PATH='s3://aws_default@my-example-bucket/airflow-xcom'
export AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_THRESHOLD='1048576'
export AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_COMPRESSION='gzip'
```

What these settings do:

- `AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_PATH`: object-store location for spilled XCom payloads
- `AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_THRESHOLD`: `-1` keeps everything in the database, `0` stores everything in object storage, positive numbers create a hybrid setup
- `AIRFLOW__COMMON_IO__XCOM_OBJECTSTORAGE_COMPRESSION`: optional compression such as `gzip`, `zip`, `bz2`, `lzma`, or `snappy`

With the backend configured, ordinary TaskFlow code does not need provider-specific XCom calls:

```python
try:
    from airflow.sdk import dag, task
except ImportError:
    from airflow.decorators import dag, task

from pendulum import datetime


@dag(
    dag_id="common_io_xcom_backend",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
)
def common_io_xcom_backend():
    @task
    def produce_manifest() -> dict[str, list[int]]:
        return {"partitions": list(range(10000))}

    @task
    def count_partitions(manifest: dict[str, list[int]]) -> int:
        return len(manifest["partitions"])

    count_partitions(produce_manifest())


common_io_xcom_backend()
```

Airflow stores only a reference in the metadata database when the serialized XCom value crosses the configured threshold.

## Common Pitfalls

- Do not install this provider only on the webserver image. The scheduler and every worker image that imports DAGs need it too.
- For remote paths, install the provider for that protocol as well. `apache-airflow-providers-common-io` does not replace the Amazon, Google, or Azure providers.
- `xcom_objectstorage_threshold` must be greater than `-1` before object storage is actually used.
- Compression support depends on what is installed in the Python environment. `zip`, `gzip`, and `bz2` work out of the box; `snappy` needs `python-snappy`.
- Airflow 3 examples import `ObjectStoragePath` and TaskFlow helpers from `airflow.sdk`. Airflow 2.11 still uses legacy import paths such as `airflow.io.path` and `airflow.decorators`.

## Version Notes

- This guide targets `apache-airflow-providers-common-io==1.7.1`.
- The stable provider docs for `1.7.1` require Apache Airflow `>=2.11.0`.
- PyPI lists optional extras for `common.compat` and `openlineage` if your deployment needs those integrations.

## Official Sources

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/`
- Installation and requirements: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/index.html`
- Transfer guide: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/transfer.html`
- Operators guide: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/operators.html`
- `FileTransferOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/_api/airflow/providers/common/io/operators/file_transfer/index.html`
- XCom backend guide: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/xcom_backend.html`
- Provider configuration reference: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/configurations-ref.html`
- Official system test example: `https://airflow.apache.org/docs/apache-airflow-providers-common-io/stable/_modules/tests/system/common/io/example_file_transfer_local_to_s3.html`
- Airflow object storage tutorial: `https://airflow.apache.org/docs/apache-airflow/stable/tutorial/objectstorage.html`
- Airflow PyPI installation guide: `https://airflow.apache.org/docs/apache-airflow/stable/installation/installing-from-pypi.html`
- Airflow Amazon connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-amazon/stable/connections/aws.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-common-io/`
