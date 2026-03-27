---
name: providers-samba
description: "Apache Airflow Samba provider for SMB connections, hook-based file access, and Google Cloud Storage to Samba transfers"
metadata:
  languages: "python"
  versions: "4.12.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "airflow,apache-airflow,samba,smb,file-share,gcs,python"
---

# Apache Airflow Samba Provider Guide

Use `apache-airflow-providers-samba` when an Airflow DAG needs to read or write files on an SMB/Samba share through an Airflow connection, or copy objects from Google Cloud Storage into that share with a built-in operator.

This guide targets provider version `4.12.2`.

## Golden Rule

- Install this package alongside a pinned `apache-airflow` version; it is not a standalone SMB client package.
- Put the Samba server details on an Airflow `samba` connection and reference that connection id from DAG code.
- Use `SambaHook` as a context manager. Upstream explicitly documents that pattern so sessions are registered and disconnected correctly.
- Set the connection's `Share` and `Share Type` correctly. Paths passed to the hook are joined under the configured share, and `share_type` changes path formatting between `posix` and `windows`.

## What This Package Adds

The provider's documented entry points are:

- `airflow.providers.samba.hooks.samba.SambaHook`
- `airflow.providers.samba.transfers.gcs_to_samba.GCSToSambaOperator`

There are no Samba-specific sensors documented in the `4.12.2` provider docs.

## Install

The provider docs for `4.12.2` require:

- `apache-airflow >= 2.11.0`
- `apache-airflow-providers-common-compat >= 1.10.1`
- `smbprotocol >= 1.5.0`

Install Airflow with the official constraints file, then add the provider while keeping your Airflow pin:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip

AIRFLOW_VERSION="<your-airflow-version>"
PROVIDER_VERSION="4.12.2"
PYTHON_VERSION="$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

python -m pip install "apache-airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
python -m pip install "apache-airflow==${AIRFLOW_VERSION}" "apache-airflow-providers-samba==${PROVIDER_VERSION}"
```

If you plan to use `GCSToSambaOperator`, install the Google extra or the Google provider too:

```bash
python -m pip install \
  "apache-airflow==${AIRFLOW_VERSION}" \
  "apache-airflow-providers-samba[google]==4.12.2"
```

Useful checks after installation:

```bash
airflow providers list | grep samba
python -m pip check
```

## Configure A Samba Connection

`SambaHook` uses `samba_conn_id`, and the provider's default connection id is `samba_default`.

The documented connection fields are:

- `Host`: Samba server hostname
- `Port`: Samba server port, default `445`
- `Share`: default share used when the hook does not receive `share=...`
- `Login`: SMB username
- `Password`: SMB password
- `Share Type`: `posix` or `windows`

An environment-variable connection is the fastest way to wire one in:

```bash
export AIRFLOW_CONN_SAMBA_DEFAULT='{
  "conn_type": "samba",
  "host": "fileserver.example.com",
  "port": 445,
  "login": "airflow",
  "password": "secret",
  "schema": "shared",
  "extra": {
    "share_type": "posix"
  }
}'
```

With that environment variable in place:

- the Airflow connection id is `samba_default`
- the default share is `shared`
- `SambaHook(..., share="other-share")` can override the connection's default share for a specific task

Use `share_type: "windows"` if the remote share expects Windows-style path formatting. Invalid values fall back to `posix`.

## Read And Write Files With `SambaHook`

Use `SambaHook` inside a task when you need Python logic around listing, opening, or uploading files.

```python
from airflow import DAG
from airflow.decorators import task
from airflow.providers.samba.hooks.samba import SambaHook
from pendulum import datetime


with DAG(
    dag_id="samba_hook_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    @task
    def inspect_and_upload() -> list[str]:
        with SambaHook(samba_conn_id="samba_default") as hook:
            hook.makedirs("/incoming/archive", exist_ok=True)

            existing_files = hook.listdir("/incoming")

            with hook.open_file("/incoming/manifest.txt", mode="r", encoding="utf-8") as stream:
                manifest = stream.read()
                if "ready" not in manifest:
                    raise ValueError("Manifest does not contain the expected marker")

            hook.push_from_local(
                destination_filepath="/incoming/archive/report.csv",
                local_filepath="/opt/airflow/data/report.csv",
                buffer_size=1024 * 1024,
            )

            return existing_files

    inspect_and_upload()
```

Important behavior from the provider API:

- `listdir(path)` lists entries inside the configured share.
- `open_file(path, ...)` opens a file on the share and supports normal text or binary modes.
- `makedirs(path, exist_ok=True)` is the simplest way to create nested directories before upload.
- `push_from_local(destination_filepath, local_filepath, buffer_size=None)` streams a local file to Samba.
- Paths such as `/incoming/report.csv` are paths inside the SMB share, not full UNC paths.

If you need to walk a directory tree or inspect file metadata, the hook also exposes methods such as `walk`, `scandir`, `stat`, `rename`, `remove`, and `rmdir`.

## Copy Objects From GCS With `GCSToSambaOperator`

Use `GCSToSambaOperator` when the task is specifically "take an object from Google Cloud Storage and place it on the Samba share".

```python
from airflow import DAG
from airflow.providers.samba.transfers.gcs_to_samba import GCSToSambaOperator
from pendulum import datetime


with DAG(
    dag_id="gcs_to_samba_example",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
) as dag:
    copy_invoice = GCSToSambaOperator(
        task_id="copy_invoice",
        gcp_conn_id="google_cloud_default",
        samba_conn_id="samba_default",
        source_bucket="analytics-exports",
        source_object="invoices/2026-01-01/invoice.pdf",
        destination_path="/dropbox/invoice.pdf",
        move_object=False,
        buffer_size=1024 * 1024,
    )
```

The operator also supports these common variants:

- set `move_object=True` to delete the GCS object after the copy
- use one wildcard in `source_object` to copy a group of objects
- set `keep_directory_structure=False` when copying multiple objects and you want `destination_path` used as the destination prefix instead of recreating the full source path
- set `impersonation_chain` if your Airflow Google connection relies on short-lived service-account impersonation

For a single file move, the provider guide says `destination_path` is the full target file path on the Samba server.

## Common Setup Pattern

For most DAGs, a clean split is:

- keep host, share, credentials, and `share_type` on one reusable Airflow Samba connection
- create `SambaHook` inside the task body, not at module import time
- use hook methods for ordinary SMB file operations driven by Python logic
- use `GCSToSambaOperator` only when the source of truth is a GCS bucket and the task is primarily a transfer step

## Pitfalls

- Installing the provider only on the scheduler or webserver. Workers also need it anywhere task code imports `airflow.providers.samba`.
- Forgetting that the connection `schema` is the default share. If it is missing and you also omit `share=...`, your paths will not resolve to the share you expect.
- Passing full UNC paths such as `\\\\server\\share\\file.txt` to hook methods. The hook already builds the host/share prefix from the Airflow connection.
- Using the wrong `share_type`. The provider uses `posix` path joining by default; use `windows` when the share expects Windows-style paths.
- Leaving file and session cleanup to chance. Use the hook as a context manager and use `with hook.open_file(...)` for remote files.
- Assuming `GCSToSambaOperator` is available with only the Samba provider installed. The operator depends on the Google provider for `GCSHook`.
- Forgetting that local paths passed to `push_from_local` must exist on the worker that executes the task.

## Version Notes

- This guide covers `apache-airflow-providers-samba` `4.12.2`.
- The provider docs for `4.12.2` require `apache-airflow >= 2.11.0`.
- The stable provider docs list `apache-airflow-providers-google` as an optional cross-provider dependency exposed through the `google` extra.

## Official Docs

- Provider docs: `https://airflow.apache.org/docs/apache-airflow-providers-samba/stable/`
- Samba connection docs: `https://airflow.apache.org/docs/apache-airflow-providers-samba/stable/connections.html`
- `SambaHook` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-samba/stable/_api/airflow/providers/samba/hooks/samba/index.html`
- `GCSToSambaOperator` guide: `https://airflow.apache.org/docs/apache-airflow-providers-samba/stable/transfer/gcs_to_samba.html`
- `GCSToSambaOperator` API reference: `https://airflow.apache.org/docs/apache-airflow-providers-samba/stable/_api/airflow/providers/samba/transfers/gcs_to_samba/index.html`
- Airflow installation overview: `https://airflow.apache.org/docs/apache-airflow/3.1.0/installation/index.html`
- Airflow managing connections: `https://airflow.apache.org/docs/apache-airflow/stable/howto/connection.html`
- PyPI package page: `https://pypi.org/project/apache-airflow-providers-samba/4.12.2/`
